from ....models import (
    calcular_indice_priorizacion,
    calcular_indice_relacionamiento,
    nivel_prioridad,
    clasificar_mitchell,
)


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
        } if v else None,
        "mitchell": clasificar_mitchell(v),
        "indice_priorizacion": indice,
        "indice_relacionamiento": calcular_indice_relacionamiento(v),
        "nivel_prioridad": nivel_prioridad(indice),
        "compromisos_count": len(actor.compromisos) if actor.compromisos else 0,
        "alertas_count": len(actor.alertas) if actor.alertas else 0,
    }