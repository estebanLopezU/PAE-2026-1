"""Reportes para la toma de decisiones.

Consolida el estado del ecosistema de actores y genera recomendaciones
accionables a partir de índices, riesgos, compromisos y relacionamiento.
"""

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Actor
from ....security import get_current_user
from ._helpers import actor_to_dict

router = APIRouter()


def _generar_recomendaciones(filas):
    rec = []
    criticos = [f for f in filas if f["nivel_prioridad"] == "alta"]
    if criticos:
        rec.append({
            "titulo": f"Gestionar {len(criticos)} actor(es) de prioridad ALTA",
            "detalle": "Asignar responsable de relacionamiento dedicado y plan de interacción mensual.",
            "actores": [f["nombre"] for f in criticos[:5]],
            "severidad": "alta",
        })
    en_riesgo = [f for f in filas if (f["variables"] or {}).get("riesgo_conflicto", 0) >= 70]
    if en_riesgo:
        rec.append({
            "titulo": f"Desescalar {len(en_riesgo)} actor(es) con riesgo de conflicto alto",
            "detalle": "Activar canales de mediación y espacios de diálogo; registrar acuerdos de desescalamiento.",
            "actores": [f["nombre"] for f in en_riesgo[:5]],
            "severidad": "alta",
        })
    opuestos = [f for f in filas if (f["variables"] or {}).get("posicion", 50) <= 30
                and (f["variables"] or {}).get("poder", 0) >= 60]
    if opuestos:
        rec.append({
            "titulo": f"Construir confianza con {len(opuestos)} actor(es) poderosos en posición contraria",
            "detalle": "Priorizar reuniones bilaterales y evidencia técnica; evitar decisiones unilaterales.",
            "actores": [f["nombre"] for f in opuestos[:5]],
            "severidad": "media",
        })
    baja_relacion = [f for f in filas if f["indice_relacionamiento"] < 40]
    if baja_relacion:
        rec.append({
            "titulo": f"Reactivar relacionamiento con {len(baja_relacion)} actor(es) de índice bajo (<40)",
            "detalle": "Programar interacciones vía los canales preferidos y registrar resultados.",
            "actores": [f["nombre"] for f in baja_relacion[:5]],
            "severidad": "media",
        })
    alta_influencia_baja_part = [f for f in filas if (f["variables"] or {}).get("influencia", 0) >= 70
                                 and (f["variables"] or {}).get("historial_participacion", 0) < 40]
    if alta_influencia_baja_part:
        rec.append({
            "titulo": "Incorporar actores influyentes con baja participación histórica",
            "detalle": "Invitar a mesas técnicas y asignar roles concretos para capitalizar su influencia.",
            "actores": [f["nombre"] for f in alta_influencia_baja_part[:5]],
            "severidad": "baja",
        })
    if not rec:
        rec.append({
            "titulo": "Ecosistema saludable",
            "detalle": "No se detectaron riesgos críticos. Mantener cadencia de relacionamiento y monitoreo.",
            "actores": [],
            "severidad": "baja",
        })
    return rec
@router.get("/ejecutivo")
def reporte_ejecutivo(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Reporte ejecutivo consolidado para la toma de decisiones."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    filas = [actor_to_dict(a) for a in actores]
    filas.sort(key=lambda x: x["indice_priorizacion"], reverse=True)

    por_tipo = Counter(f["tipo"] for f in filas)
    por_prioridad = Counter(f["nivel_prioridad"] for f in filas)
    indices_rel = [f["indice_relacionamiento"] for f in filas] or [0]
    indices_pri = [f["indice_priorizacion"] for f in filas] or [0]

    return {
        "resumen": {
            "total_actores": len(filas),
            "por_tipo": dict(por_tipo),
            "por_prioridad": dict(por_prioridad),
            "indice_relacionamiento_promedio": round(sum(indices_rel) / len(indices_rel), 1),
            "indice_priorizacion_promedio": round(sum(indices_pri) / len(indices_pri), 1),
            "actores_riesgo_alto": sum(1 for f in filas if (f["variables"] or {}).get("riesgo_conflicto", 0) >= 70),
            "compromisos_pendientes": sum(f["compromisos_count"] for f in filas),
            "alertas_activas": sum(f["alertas_count"] for f in filas),
        },
        "top_prioridad": filas[:10],
        "recomendaciones": _generar_recomendaciones(filas),
    }


@router.get("/actores")
def reporte_por_actor(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Ficha-resumen por actor: variables clave, índices y alertas."""
    actores = db.query(Actor).filter(Actor.is_active == True).all()
    items = []
    for a in actores:
        d = actor_to_dict(a)
        v = d["variables"] or {}
        items.append({
            "id": d["id"],
            "nombre": d["nombre"],
            "tipo": d["tipo"],
            "nivel_prioridad": d["nivel_prioridad"],
            "indice_priorizacion": d["indice_priorizacion"],
            "indice_relacionamiento": d["indice_relacionamiento"],
            "riesgo_conflicto": v.get("riesgo_conflicto", 0),
            "posicion": v.get("posicion", 0),
            "compromisos": d["compromisos_count"],
            "alertas": d["alertas_count"],
        })
    return {"items": items, "total": len(items)}
