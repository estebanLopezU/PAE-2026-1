from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Actor, Alerta, Compromiso, Relacionamiento
from ....security import get_current_user
from ._helpers import actor_query, actor_to_dict


router = APIRouter()


@router.get("")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Tablero estratégico de apoyo a la toma de decisiones."""
    actores = actor_query(db).filter(Actor.is_active == True).all()
    actor_dicts = [actor_to_dict(a) for a in actores]

    alertas = db.query(Alerta).all()
    alertas_no_leidas = [a for a in alertas if not a.leida]
    criticas = [a for a in alertas_no_leidas if a.nivel == "critical"]

    compromisos = db.query(Compromiso).all()
    compromisos_pendientes = [
        c for c in compromisos
        if c.estado in ("pendiente", "en_progreso")
    ]

    relacionamientos = db.query(Relacionamiento).all()

    # Clasificación Mitchell y pendientes de evaluación
    mitchell_resumen = {"definitivo": 0, "expectante": 0, "latente": 0, "no_relevante": 0}
    pendientes_evaluacion = 0
    for a in actor_dicts:
        grupo = a.get("mitchell", {}).get("grupo", "no_relevante")
        mitchell_resumen[grupo] = mitchell_resumen.get(grupo, 0) + 1
        v = a.get("variables") or {}
        if (v.get("poder") or 0) <= 0 and (v.get("legitimidad") or 0) <= 0 and (v.get("urgencia") or 0) <= 0:
            pendientes_evaluacion += 1

    # Top 5 actores priorizados
    top_prioridad = sorted(actor_dicts, key=lambda x: x["indice_priorizacion"], reverse=True)[:5]
    # Actores de mayor riesgo de conflicto
    con_riesgo = [a for a in actor_dicts if a["variables"] and a["variables"]["riesgo_conflicto"] >= 70]

    # Índice de calidad del relacionamiento general (promedio)
    indices = [a["indice_relacionamiento"] for a in actor_dicts if a["indice_relacionamiento"]]
    indice_general = round(sum(indices) / len(indices), 2) if indices else 0

    por_estado = {}
    for c in compromisos:
        por_estado[c.estado] = por_estado.get(c.estado, 0) + 1

    return {
        "total_actores": len(actor_dicts),
        "total_alertas": len(alertas),
        "alertas_no_leidas": len(alertas_no_leidas),
        "alertas_criticas": len(criticas),
        "compromisos_total": len(compromisos),
        "compromisos_pendientes": len(compromisos_pendientes),
        "compromisos_por_estado": por_estado,
        "total_relacionamientos": len(relacionamientos),
        "indice_calidad_relacionamiento": indice_general,
        "top_prioridad": top_prioridad,
        "mayor_riesgo_conflicto": sorted(con_riesgo, key=lambda x: x["variables"]["riesgo_conflicto"], reverse=True)[:5],
        "mitchell_resumen": mitchell_resumen,
        "pendientes_evaluacion": pendientes_evaluacion,
    }