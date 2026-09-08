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
            "poder": v.poder if v else 0,
            "legitimidad": v.legitimidad if v else 0,
            "influencia": v.influencia if v else 0,
            "interes": v.interes if v else 0,
            "riesgo_conflicto": v.riesgo_conflicto if v else 0,
            "posicion": v.posicion if v else 0,
        })
    return {"items": puntos, "total": len(puntos)}


@router.get("/resumen")
def resumen_clasificacion(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Resumen por tipo de actor y distribución por nivel de prioridad."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    datos = [actor_to_dict(a) for a in actores]

    por_tipo = {}
    por_prioridad = {}
    for d in datos:
        t = d["tipo"]
        por_tipo[t] = por_tipo.get(t, 0) + 1
        p = d["nivel_prioridad"]
        por_prioridad[p] = por_prioridad.get(p, 0) + 1

    return {
        "total_actores": len(datos),
        "por_tipo": por_tipo,
        "por_prioridad": por_prioridad,
    }