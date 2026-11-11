from sqlalchemy.orm import selectinload

import json

from ....models import (
    Actor,
    calcular_indice_priorizacion,
    calcular_indice_relacionamiento,
    nivel_prioridad,
    clasificar_mitchell,
)


def actor_query(db):
    """Query de actores con las relaciones que usa ``actor_to_dict`` precargadas.

    Sin eager loading, serializar N actores dispara N+1 queries: ``variables``,
    ``compromisos`` y ``alertas`` se resuelven una a una por lazy loading.
    Con la base de datos remota eso son cientos de viajes de ida y vuelta y
    el dashboard tarda decenas de segundos. Con ``selectinload`` el coste es
    de 3 consultas adicionales, independientemente del numero de actores.
    """
    return db.query(Actor).options(
        selectinload(Actor.variables),
        selectinload(Actor.compromisos),
        selectinload(Actor.alertas),
    )


def _ponderacion_serializable(crudo):
    """Convierte la ponderacion guardada (JSON) en objeto para la API."""
    if not crudo:
        return None
    try:
        return json.loads(crudo) if isinstance(crudo, str) else dict(crudo)
    except (ValueError, TypeError):
        return None


def actor_to_dict(actor):
    """Serializa un actor incluyendo índices calculados y conteos."""
    v = actor.variables
    indice = calcular_indice_priorizacion(v)
    return {
        "id": actor.id,
        "nombre": actor.nombre,
        "tipo": actor.tipo,
        "descripcion": actor.descripcion,
        "institucion": actor.institucion,
        "cargo": actor.cargo,
        "departamento": actor.departamento,
        "municipio": actor.municipio,
        "email": actor.email,
        "telefono": actor.telefono,
        "canales": actor.canales,
        "notas": actor.notas,
        "es_interno": actor.es_interno,
        "is_active": actor.is_active,
        "fuente": actor.fuente,
        "entidad_origen_id": actor.entidad_origen_id,
        "nit": actor.nit,
        "acronimo": actor.acronimo,
        "ultima_sync": actor.ultima_sync,
        "created_at": actor.created_at,
        "updated_at": actor.updated_at,
        "variables": {
            "id": v.id,
            "actor_id": v.actor_id,
            "poder": v.poder,
            "legitimidad": v.legitimidad,
            "influencia": v.influencia,
            "interes": v.interes,
            "dependencia": v.dependencia,
            "capacidad_movilizacion": v.capacidad_movilizacion,
            "posicion": v.posicion,
            "historial_participacion": v.historial_participacion,
            "riesgo_conflicto": v.riesgo_conflicto,
            "canales_relacionamiento": v.canales_relacionamiento,
            "urgencia": v.urgencia,
            "frecuencia_intentos": v.frecuencia_intentos,
            "evaluado_por": v.evaluado_por,
            "evaluado_en": v.evaluado_en,
            "ponderacion": _ponderacion_serializable(v.ponderacion),
        } if v else None,
        "mitchell": clasificar_mitchell(v),
        "indice_priorizacion": indice,
        "indice_relacionamiento": calcular_indice_relacionamiento(v),
        "nivel_prioridad": nivel_prioridad(indice),
        "compromisos_count": len(actor.compromisos) if actor.compromisos else 0,
        "alertas_count": len(actor.alertas) if actor.alertas else 0,
    }