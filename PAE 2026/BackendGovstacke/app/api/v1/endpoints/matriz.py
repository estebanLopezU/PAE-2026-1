from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Actor
from ....security import get_current_user
from ._helpers import actor_to_dict


router = APIRouter()


@router.get("/priorizacion")
def matriz_priorizacion(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Matriz de priorización ordenada por índice de priorización (poder-legitimidad-influencia-interés)."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    filas = [actor_to_dict(a) for a in actores]
    # Ordenar por índice de priorización descendente
    filas.sort(key=lambda x: x["indice_priorizacion"], reverse=True)
    return {"items": filas, "total": len(filas)}


@router.get("/mapa")
def mapa_poder_legitimidad_influencia(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Datos para el mapa dinámico poder-legitimidad-influencia."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    puntos = []
    for a in actores:
        v = a.variables
        puntos.append({
            "id": a.id,
            "nombre": a.nombre,
            "tipo": a.tipo,
            "fuente": a.fuente,
            "poder": v.poder if v else 0,
            "legitimidad": v.legitimidad if v else 0,
            "influencia": v.influencia if v else 0,
            "interes": v.interes if v else 0,
            "urgencia": v.urgencia if v else 0,
            "frecuencia_intentos": v.frecuencia_intentos if v else 0,
            "riesgo_conflicto": v.riesgo_conflicto if v else 0,
            "posicion": v.posicion if v else 0,
            "tipo_mitchell": actor_to_dict(a)["mitchell"]["tipo_mitchell"],
        })
    return {"items": puntos, "total": len(puntos)}


@router.get("/resumen")
def resumen_clasificacion(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Resumen por tipo de actor, prioridad y clasificación Mitchell."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    datos = [actor_to_dict(a) for a in actores]

    por_tipo = {}
    por_prioridad = {}
    por_mitchell = {}
    for d in datos:
        t = d["tipo"]
        por_tipo[t] = por_tipo.get(t, 0) + 1
        p = d["nivel_prioridad"]
        por_prioridad[p] = por_prioridad.get(p, 0) + 1
        m = d.get("mitchell", {}).get("tipo_mitchell", "no_relevante")
        por_mitchell[m] = por_mitchell.get(m, 0) + 1

    return {
        "total_actores": len(datos),
        "por_tipo": por_tipo,
        "por_prioridad": por_prioridad,
        "por_mitchell": por_mitchell,
    }


@router.get("/mitchell")
def matriz_mitchell(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Matriz Mitchell ordenada por número de atributos y relevancia."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    filas = [actor_to_dict(a) for a in actores]
    filas.sort(
        key=lambda x: (
            x.get("mitchell", {}).get("mitchell_count", 0),
            x.get("mitchell", {}).get("relevancia_mitchell", 0),
            x["indice_priorizacion"],
        ),
        reverse=True,
    )
    return {"items": filas, "total": len(filas)}


@router.get("/mitchell/resumen")
def resumen_mitchell(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Resumen ejecutivo de la clasificación de Mitchell."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    datos = [actor_to_dict(a) for a in actores]

    grupos = {"latente": 0, "expectante": 0, "definitivo": 0, "no_relevante": 0}
    tipos = {
        "definitivo": 0,
        "expectante_dominante": 0,
        "expectante_peligroso": 0,
        "expectante_dependiente": 0,
        "latente_inactivo": 0,
        "latente_discrecional": 0,
        "latente_demandante": 0,
        "no_relevante": 0,
    }
    pendientes = 0

    for d in datos:
        m = d.get("mitchell", {})
        grupo = m.get("grupo", "no_relevante")
        tipo = m.get("tipo_mitchell", "no_relevante")
        grupos[grupo] = grupos.get(grupo, 0) + 1
        tipos[tipo] = tipos.get(tipo, 0) + 1
        v = d.get("variables") or {}
        if (
            (v.get("poder") or 0) <= 0
            and (v.get("legitimidad") or 0) <= 0
            and (v.get("urgencia") or 0) <= 0
        ):
            pendientes += 1

    return {
        "total_actores": len(datos),
        "grupos": grupos,
        "tipos": tipos,
        "pendientes_evaluacion": pendientes,
        "umbral": 60,
    }