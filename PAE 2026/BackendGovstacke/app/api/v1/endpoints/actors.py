from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Actor, ActorVariables
from ....models import evaluar_alertas, Alerta
from ....schemas import ActorCreate, ActorUpdate, ActorList
from ....security import get_current_user, require_admin
from ._helpers import actor_to_dict


router = APIRouter()


@router.get("", response_model=ActorList)
def list_actors(
    tipo: Optional[str] = None,
    buscar: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Actor)
    if tipo:
        query = query.filter(Actor.tipo == tipo)
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


@router.get("/{actor_id}")
def get_actor(actor_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
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
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
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
    _=Depends(get_current_user),
):
    """Actualiza las variables de análisis (poder, legitimidad, influencia, etc.) del actor."""
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    variables = actor.variables
    if not variables:
        variables = ActorVariables(actor_id=actor_id)
        db.add(variables)

    campos_validos = [
        "poder", "legitimidad", "influencia", "interes", "dependencia",
        "capacidad_movilizacion", "posicion", "historial_participacion",
        "riesgo_conflicto", "canales_relacionamiento",
    ]
    for key in campos_validos:
        if key in payload:
            setattr(variables, key, float(payload[key]))

    db.commit()
    db.refresh(actor)
    return actor_to_dict(actor)


@router.delete("/{actor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_actor(actor_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    db.delete(actor)
    db.commit()
    return None


@router.post("/{actor_id}/evaluar-alertas")
def evaluar_alertas_actor(
    actor_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Evalúa automáticamente las reglas de alertas para un actor y las persiste."""
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
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