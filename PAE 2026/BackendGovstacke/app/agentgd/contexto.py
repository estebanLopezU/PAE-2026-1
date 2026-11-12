"""Estado actual de GOVStake 360 en un snapshot compacto para AgentGD.

El agente no recibe la base de datos completa: recibe un resumen acotado
(~800 tokens) con los totales y los actores mas relevantes. Cuando necesita
un detalle concreto, pide una herramienta (ver ``herramientas.py``).

El snapshot se cachea 45 segundos en memoria para no recalcular los indices
de todos los actores en cada pregunta. Los datos siguen siendo los de la
base: la cache solo evita trabajo repetido dentro de la misma ventana.
"""

import json
import time
from collections import Counter
from datetime import datetime, timezone
from typing import Dict, List, Optional

__all__ = ["snapshot", "invalidar", "texto_snapshot"]

_TTL_SEGUNDOS = 45.0
_CACHE: Dict[str, object] = {"momento": 0.0, "datos": None}


def invalidar() -> None:
    """Descarta la cache. Se llama al escribir actores, compromisos o alertas."""
    _CACHE["momento"] = 0.0
    _CACHE["datos"] = None


def _fecha(valor) -> Optional[str]:
    if not valor:
        return None
    try:
        return valor.isoformat()[:10]
    except AttributeError:
        return None


def _contar(etiquetas: List[str]) -> Dict[str, int]:
    return dict(Counter(e for e in etiquetas if e).most_common())


def _num_indice(valor) -> float:
    try:
        return float(valor or 0)
    except (TypeError, ValueError):
        return 0.0


def _snapshot(db) -> Dict[str, object]:
    from sqlalchemy import func

    from ..models import (
        Actor,
        Alerta,
        Compromiso,
        Relacionamiento,
    )
    from ..api.v1.endpoints._helpers import actor_query, actor_to_dict

    actores = actor_query(db).filter(Actor.is_active == True).all()  # noqa: E712
    datos = [actor_to_dict(a) for a in actores]

    con_variables = [a for a in datos if a["variables"]]
    sin_percepcion = [a for a in datos if (a["mitchell"] or {}).get("sin_percepcion", True)]

    por_prioridad = _contar([a["nivel_prioridad"] for a in con_variables])
    por_tipo = _contar([a["tipo"] for a in datos])
    por_grupo = _contar([(a["mitchell"] or {}).get("grupo") for a in con_variables])
    por_etiqueta = _contar([(a["mitchell"] or {}).get("etiqueta") for a in con_variables])

    ranking = sorted(
        con_variables,
        key=lambda a: (
            a["indice_priorizacion"] or 0,
            (a["mitchell"] or {}).get("relevancia_calculada") or 0,
        ),
        reverse=True,
    )
    top = [
        {
            "id": a["id"],
            "nombre": a["nombre"],
            "tipo": a["tipo"],
            "indice": a["indice_priorizacion"],
            "prioridad": a["nivel_prioridad"],
            "plu": (a["mitchell"] or {}).get("plu"),
            "rango": (a["mitchell"] or {}).get("rango_etiqueta"),
            "etiqueta_mitchell": (a["mitchell"] or {}).get("etiqueta"),
        }
        for a in ranking[:10]
    ]

    estados_compromiso = dict(
        db.query(Compromiso.estado, func.count(Compromiso.id))
        .group_by(Compromiso.estado)
        .all()
    )
    compromisos_total = sum(estados_compromiso.values())
    compromisos_vencidos = (
        db.query(func.count(Compromiso.id))
        .filter(
            Compromiso.fecha_vencimiento.isnot(None),
            Compromiso.fecha_vencimiento < func.now(),
            Compromiso.estado.notin_(("cumplido", "vencido")),
        )
        .scalar()
        or 0
    )

    alertas_no_leidas = (
        db.query(Alerta).filter(Alerta.leida == False).all()  # noqa: E712
    )
    alertas_por_nivel = _contar([a.nivel for a in alertas_no_leidas])

    relacionamientos = db.query(Relacionamiento).all()
    rel_por_tipo = _contar([r.tipo for r in relacionamientos])

    # Indice de relacionamiento promedio solo sobre actores valorados.
    indices_rel = [
        _num_indice(a.get("indice_relacionamiento")) for a in con_variables
    ]
    promedio_rel = round(sum(indices_rel) / len(indices_rel), 2) if indices_rel else 0.0

    return {
        "fecha": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "actores": {
            "total": len(datos),
            "con_valoracion": len(con_variables),
            "sin_percepcion_del_lider": len(sin_percepcion),
            "por_prioridad": por_prioridad,
            "por_tipo": por_tipo,
        },
        "mitchell": {
            "por_grupo": por_grupo,
            "por_identificacion": por_etiqueta,
        },
        "top_actores": top,
        "compromisos": {
            "total": compromisos_total,
            "por_estado": estados_compromiso,
            "vencidos_abiertos": compromisos_vencidos,
        },
        "alertas": {
            "total": len(alertas_no_leidas),
            "no_leidas_por_nivel": alertas_por_nivel,
        },
        "relacionamientos": {
            "total": len(relacionamientos),
            "por_tipo": rel_por_tipo,
            "indice_calidad_promedio": promedio_rel,
        },
    }


def snapshot(db, forzar: bool = False) -> Dict[str, object]:
    """Devuelve el snapshot vigente (cacheado 45 segundos)."""
    ahora = time.monotonic()
    cacheado = _CACHE.get("datos")
    if not forzar and cacheado and ahora - float(_CACHE.get("momento") or 0) < _TTL_SEGUNDOS:
        return cacheado  # type: ignore[return-value]

    datos = _snapshot(db)
    _CACHE["datos"] = datos
    _CACHE["momento"] = ahora
    return datos


def texto_snapshot(db) -> str:
    """Snapshot serializado en JSON compacto para el prompt del sistema."""
    return json.dumps(snapshot(db), ensure_ascii=False, separators=(",", ":"))
