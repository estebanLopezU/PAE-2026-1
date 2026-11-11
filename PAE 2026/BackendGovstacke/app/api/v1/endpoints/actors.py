from typing import List, Optional
from datetime import datetime, timezone
import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....modelo import ponderar
from ....models import Actor, ActorVariables
from ....models import evaluar_alertas, Alerta
from ....schemas import ActorCreate, ActorUpdate, ActorList
from ....security import get_current_user, require_admin
from ....tipos_actor import listar_tipos, normalizar_tipo
from ._helpers import actor_query, actor_to_dict


router = APIRouter()


def _serializar_ponderacion(valor):
    """Valida y serializa la ponderacion por apareamiento de una valoracion.

    Acepta las tres parejas (10 puntos cada una) o unos pesos ya calculados.
    Devuelve el JSON que se guarda junto a las variables del actor.
    """
    if valor is None:
        return None
    if not isinstance(valor, dict):
        raise HTTPException(
            status_code=400, detail="La ponderacion debe ser un objeto JSON."
        )
    try:
        if valor.get("parejas"):
            resultado = ponderar([dict(p) for p in valor["parejas"]])
        else:
            pesos = {
                clave: float(valor["pesos"][clave])
                for clave in ("poder", "legitimidad", "urgencia")
            }
            if abs(sum(pesos.values()) - 1.0) > 0.02:
                raise ValueError("los pesos deben sumar 1")
            resultado = {"origen": "usuario", "pesos": pesos}
    except (TypeError, ValueError, KeyError, AttributeError) as exc:
        raise HTTPException(status_code=400, detail=f"Ponderacion invalida: {exc}")
    return json.dumps(resultado, ensure_ascii=False)


@router.get("", response_model=ActorList)
def list_actors(
    tipo: Optional[str] = None,
    buscar: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = actor_query(db)
    if tipo:
        query = query.filter(Actor.tipo == normalizar_tipo(tipo))
    if buscar:
        like = f"%{buscar}%"
        query = query.filter(Actor.nombre.ilike(like))
    total = query.count()
    actores = query.order_by(Actor.nombre).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "items": [actor_to_dict(a) for a in actores],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/tipos")
def tipos_de_actor(_=Depends(get_current_user)):
    """Vocabulario canonico de tipos de actor con su protocolo asociado."""
    items = listar_tipos()
    return {"items": items, "total": len(items)}


@router.get("/{actor_id}")
def get_actor(actor_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    return actor_to_dict(actor)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_actor(
    payload: ActorCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    data = payload.model_dump(exclude_unset=True)
    variables = data.pop("variables", None)
    if data.get("tipo"):
        data["tipo"] = normalizar_tipo(data["tipo"])

    actor = Actor(**data)
    db.add(actor)
    db.flush()

    if variables:
        actor.variables = ActorVariables(actor_id=actor.id, **variables)
    else:
        # Variables por defecto en 0
        actor.variables = ActorVariables(actor_id=actor.id)

    db.add(actor)
    db.commit()
    db.refresh(actor)
    return actor_to_dict(actor)


@router.put("/{actor_id}")
def update_actor(
    actor_id: int,
    payload: ActorUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(actor, key, value)

    db.commit()
    db.refresh(actor)
    return actor_to_dict(actor)


@router.put("/{actor_id}/variables")
def update_actor_variables(
    actor_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    """Actualiza las variables de análisis del actor y registra quién evaluó."""
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    variables = actor.variables
    if not variables:
        variables = ActorVariables(actor_id=actor_id)
        db.add(variables)

    campos_validos = [
        "poder", "legitimidad", "influencia", "interes", "dependencia",
        "capacidad_movilizacion", "posicion", "historial_participacion",
        "riesgo_conflicto", "canales_relacionamiento", "urgencia",
        "frecuencia_intentos",
    ]
    for key in campos_validos:
        if key in payload:
            setattr(variables, key, float(payload[key]))

    # Ponderacion por apareamiento con la que se valora este actor. Se guarda
    # con la valoracion para que la relevancia sea reproducible en el futuro.
    if "ponderacion" in payload:
        variables.ponderacion = _serializar_ponderacion(payload["ponderacion"])

    variables.evaluado_por = current_user.get("email", "desconocido")
    variables.evaluado_en = datetime.now(timezone.utc)

    db.commit()
    db.refresh(actor)
    return actor_to_dict(actor)


@router.delete("/{actor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_actor(actor_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    db.delete(actor)
    db.commit()
    return None


@router.post("/{actor_id}/evaluar-alertas")
def evaluar_alertas_actor(
    actor_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """Evalúa automáticamente las reglas de alertas para un actor y las persiste."""
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    generadas = evaluar_alertas(actor.variables)
    creadas = []
    for g in generadas:
        alerta = Alerta(
            actor_id=actor_id,
            tipo=g["tipo"],
            nivel=g["nivel"],
            titulo=g["titulo"],
            descripcion=g["descripcion"],
        )
        db.add(alerta)
        creadas.append(g)
    db.commit()
    return {"generadas": creadas, "total": len(creadas)}