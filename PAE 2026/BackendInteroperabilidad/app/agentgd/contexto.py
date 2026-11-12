"""Estado actual de la plataforma de interoperabilidad en un snapshot.

Acota la informacion a totales y rankings. El detalle por entidad se obtiene
con herramientas (``herramientas.py``).
"""

import json
import time
from collections import Counter
from datetime import datetime, timezone
from typing import Dict, List, Optional

__all__ = ["snapshot", "invalidar", "texto_snapshot", "ultimas_evaluaciones"]

_TTL_SEGUNDOS = 45.0
_CACHE: Dict[str, object] = {"momento": 0.0, "datos": None}


def invalidar() -> None:
    _CACHE["momento"] = 0.0
    _CACHE["datos"] = None


NIVELES_MADUREZ = {
    1: "Inicial",
    2: "Basico",
    3: "Intermedio",
    4: "Avanzado",
}


def ultimas_evaluaciones(db) -> List:
    """Ultima evaluacion de madurez por entidad (la de id mas alto)."""
    from sqlalchemy import func

    from ..models import MaturityAssessment

    ids = (
        db.query(func.max(MaturityAssessment.id))
        .group_by(MaturityAssessment.entity_id)
        .subquery()
    )
    return (
        db.query(MaturityAssessment)
        .filter(MaturityAssessment.id.in_(ids))
        .all()
    )


def _contar(elementos) -> Dict[str, int]:
    return dict(Counter(e for e in elementos if e is not None).most_common())


def _snapshot(db) -> Dict[str, object]:
    from sqlalchemy import func

    from ..models import Entity, Relationship, Sector, Service

    entidades = db.query(Entity).filter(Entity.is_active == True).all()  # noqa: E712
    total = len(entidades)
    por_estado = _contar([e.xroad_status for e in entidades])
    conectadas = por_estado.get("connected", 0)
    pendientes = por_estado.get("pending", 0)

    sectores = (
        db.query(Sector.name, func.count(Entity.id))
        .join(Entity, Sector.id == Entity.sector_id, isouter=True)
        .filter(Entity.is_active == True)  # noqa: E712
        .group_by(Sector.name)
        .order_by(func.count(Entity.id).desc())
        .limit(8)
        .all()
    )

    servicios = db.query(Service).filter(Service.status == "active").all()
    relaciones = db.query(Relationship).all()

    evaluaciones = ultimas_evaluaciones(db)
    promedio = round(
        sum(e.overall_score or 0 for e in evaluaciones) / len(evaluaciones), 2
    ) if evaluaciones else 0.0
    por_nivel = _contar([NIVELES_MADUREZ.get(e.overall_level) for e in evaluaciones])

    # Entidades mejor evaluadas.
    mejores = sorted(evaluaciones, key=lambda e: e.overall_score or 0, reverse=True)[:8]
    mapa_entidades = {e.id: e for e in entidades}
    top = [
        {
            "id": e.entity_id,
            "nombre": (mapa_entidades.get(e.entity_id).name if mapa_entidades.get(e.entity_id) else None),
            "nivel": NIVELES_MADUREZ.get(e.overall_level),
            "puntaje": e.overall_score,
        }
        for e in mejores
        if mapa_entidades.get(e.entity_id)
    ]

    return {
        "fecha": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "entidades": {
            "total": total,
            "por_estado_xroad": por_estado,
            "conectadas": conectadas,
            "pendientes": pendientes,
            "no_conectadas": total - conectadas - pendientes,
            "tasa_conexion_pct": round(conectadas / total * 100, 1) if total else 0.0,
        },
        "sectores": {nombre: cantidad for nombre, cantidad in sectores if nombre},
        "servicios": {
            "activos": len(servicios),
            "por_protocolo": _contar([s.protocol for s in servicios]),
            "por_categoria": _contar([s.category for s in servicios]),
        },
        "madurez": {
            "evaluaciones": len(evaluaciones),
            "promedio_0_a_100": promedio,
            "por_nivel": por_nivel,
        },
        "relaciones": {
            "total": len(relaciones),
            "por_estado": _contar([r.status for r in relaciones]),
            "por_protocolo": _contar([r.protocol for r in relaciones]),
        },
        "top_madurez": top,
    }


def snapshot(db, forzar: bool = False) -> Dict[str, object]:
    ahora = time.monotonic()
    cacheado = _CACHE.get("datos")
    if not forzar and cacheado and ahora - float(_CACHE.get("momento") or 0) < _TTL_SEGUNDOS:
        return cacheado  # type: ignore[return-value]

    datos = _snapshot(db)
    _CACHE["datos"] = datos
    _CACHE["momento"] = ahora
    return datos


def texto_snapshot(db) -> str:
    return json.dumps(snapshot(db), ensure_ascii=False, separators=(",", ":"))
