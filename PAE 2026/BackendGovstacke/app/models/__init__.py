from .actor import Actor
from .actor_variables import ActorVariables
from .compromiso import Compromiso
from .alerta import Alerta
from .relacionamiento import Relacionamiento
from .usuario import Usuario
from .auditoria import Auditoria

__all__ = [
    "Actor",
    "ActorVariables",
    "Compromiso",
    "Alerta",
    "Relacionamiento",
    "Usuario",
    "Auditoria",
]


# ---------------------------------------------------------------------------
# Lógica de negocio GOVStake 360: matriz de priorización e índice de relacionamiento
# ---------------------------------------------------------------------------

# Pesos por defecto (configurables en el futuro)
PESOS_PRIORIZACION = {
    "poder": 0.25,
    "legitimidad": 0.25,
    "influencia": 0.25,
    "interes": 0.25,
}


def calcular_indice_priorizacion(v):
    """Índice de priorización (0-100) a partir de las variables del actor."""
    if v is None:
        return 0.0
    weighted = (
        PESOS_PRIORIZACION["poder"] * (v.poder or 0)
        + PESOS_PRIORIZACION["legitimidad"] * (v.legitimidad or 0)
        + PESOS_PRIORIZACION["influencia"] * (v.influencia or 0)
        + PESOS_PRIORIZACION["interes"] * (v.interes or 0)
    )
    return round(weighted, 2)


def calcular_indice_relacionamiento(v):
    """Índice de calidad del relacionamiento institucional (0-100)."""
    if v is None:
        return 0.0
    # componentes positivos
    base = (
        0.30 * (v.poder or 0)
        + 0.20 * (v.legitimidad or 0)
        + 0.25 * (v.interes or 0)
        + 0.25 * (v.historial_participacion or 0)
    )
    # penalizaciones
    penalizacion = (
        0.20 * (v.riesgo_conflicto or 0)
        + 0.15 * max(0, 100 - (v.posicion or 0))
    )
    idx = max(0.0, base - penalizacion)
    return round(min(idx, 100.0), 2)


def nivel_prioridad(indice):
    """Clasifica el índice de priorización en un cuartil estratégico."""
    if indice >= 75:
        return "prioridad_alta"
    if indice >= 50:
        return "prioridad_media"
    if indice >= 25:
        return "prioridad_baja"
    return "monitoreo"


# ---------------------------------------------------------------------------
# Clasificación de stakeholders (Mitchell et al., 1997) con intensidad 0-100
# ---------------------------------------------------------------------------

# Umbral para convertir la intensidad medida en GOVStake en "presencia" del
# atributo. El modelo original de Mitchell es binario; esta adaptación conserva
# la clasificación pero permite valorar la fuerza de cada atributo.
MITCHELL_UMBRAL_PRESENCIA = 60.0


def _num_mitchell(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def calcular_relevancia_mitchell(v):
    """Relevancia numérica (0-100) ponderando poder, legitimidad y urgencia."""
    if v is None:
        return 0.0
    return round(
        (
            _num_mitchell(v.poder)
            + _num_mitchell(v.legitimidad)
            + _num_mitchell(v.urgencia)
        ) / 3,
        2,
    )


MITCHELL_TIPOS = {
    "no_relevante": {
        "grupo": "no_relevante",
        "etiqueta": "No relevante",
        "descripcion": "Ninguno de los tres atributos de Mitchell supera el umbral mínimo.",
        "accion": "Mantener observación periódica y variables actualizadas.",
    },
    "latente_inactivo": {
        "grupo": "latente",
        "etiqueta": "Latente inactivo",
        "descripcion": "Tiene poder, pero sin legitimidad ni urgencia percibidas.",
        "accion": "Observar su capacidad de presión antes de activar relacionamiento formal.",
    },
    "latente_discrecional": {
        "grupo": "latente",
        "etiqueta": "Latente discrecional",
        "descripcion": "Tiene legitimidad, pero sin poder ni urgencia percibidas.",
        "accion": "Informar y mantener puertas abiertas sin contabilizarlo como decisor inmediato.",
    },
    "latente_demandante": {
        "grupo": "latente",
        "etiqueta": "Latente demandante",
        "descripcion": "Tiene urgencia, pero sin poder ni legitimidad suficientes.",
        "accion": "Escuchar, validar su petición y canalizarla por medios institucionales.",
    },
    "expectante_dominante": {
        "grupo": "expectante",
        "etiqueta": "Expectante dominante",
        "descripcion": "Combina poder y legitimidad; exige atención formal.",
        "accion": "Relacionamiento formal, consulta estructurada y acompañamiento permanente.",
    },
    "expectante_peligroso": {
        "grupo": "expectante",
        "etiqueta": "Expectante peligroso",
        "descripcion": "Combina poder y urgencia; puede ejercer presión fuerte.",
        "accion": "Protocolo de contención, comunicación directa y gestión de riesgo.",
    },
    "expectante_dependiente": {
        "grupo": "expectante",
        "etiqueta": "Expectante dependiente",
        "descripcion": "Combina legitimidad y urgencia, pero depende de aliados.",
        "accion": "Articular con entidades de mayor legitimidad o habilitar canales participativos.",
    },
    "definitivo": {
        "grupo": "definitivo",
        "etiqueta": "Definitivo",
        "descripcion": "Combina poder, legitimidad y urgencia; máxima relevancia.",
        "accion": "Atención prioritaria: decisión conjunta, mesa de trabajo y compromisos explícitos.",
    },
}


def clasificar_mitchell(v):
    """Clasifica un actor según poder, legitimidad y urgencia percibidos.

    Retorna un diccionario serializable para endpoints y frontend.
    """
    poder = _num_mitchell(v.poder)
    legitimidad = _num_mitchell(v.legitimidad)
    urgencia = _num_mitchell(v.urgencia)

    poder_presente = poder >= MITCHELL_UMBRAL_PRESENCIA
    legitimidad_presente = legitimidad >= MITCHELL_UMBRAL_PRESENCIA
    urgencia_presente = urgencia >= MITCHELL_UMBRAL_PRESENCIA

    atributos_presentes = [
        nombre for nombre, presente in (
            ("poder", poder_presente),
            ("legitimidad", legitimidad_presente),
            ("urgencia", urgencia_presente),
        ) if presente
    ]

    if not atributos_presentes:
        tipo = "no_relevante"
    elif not poder_presente and not legitimidad_presente and urgencia_presente:
        tipo = "latente_demandante"
    elif not poder_presente and legitimidad_presente and not urgencia_presente:
        tipo = "latente_discrecional"
    elif poder_presente and not legitimidad_presente and not urgencia_presente:
        tipo = "latente_inactivo"
    elif poder_presente and legitimidad_presente and not urgencia_presente:
        tipo = "expectante_dominante"
    elif poder_presente and not legitimidad_presente and urgencia_presente:
        tipo = "expectante_peligroso"
    elif not poder_presente and legitimidad_presente and urgencia_presente:
        tipo = "expectante_dependiente"
    else:
        tipo = "definitivo"

    meta = MITCHELL_TIPOS[tipo]

    return {
        "tipo_mitchell": tipo,
        "grupo": meta["grupo"],
        "etiqueta": meta["etiqueta"],
        "descripcion": meta["descripcion"],
        "accion_sugerida": meta["accion"],
        "poder_presente": poder_presente,
        "legitimidad_presente": legitimidad_presente,
        "urgencia_presente": urgencia_presente,
        "atributos_presentes": atributos_presentes,
        "mitchell_count": len(atributos_presentes),
        "umbral": MITCHELL_UMBRAL_PRESENCIA,
        "relevancia_mitchell": calcular_relevancia_mitchell(v),
    }


def evaluar_alertas(v):
    """Genera alertas automáticas a partir de las variables del actor."""
    alertas = []
    if v is None:
        return alertas
    if (v.riesgo_conflicto or 0) >= 70:
        alertas.append({
            "tipo": "riesgo_conflicto",
            "nivel": "critical",
            "titulo": "Alto riesgo de conflicto",
            "descripcion": "Este actor presenta un riesgo de conflicto elevado (>=70). Requiere atención prioritaria.",
        })
    elif (v.riesgo_conflicto or 0) >= 50:
        alertas.append({
            "tipo": "riesgo_conflicto",
            "nivel": "warning",
            "titulo": "Riesgo de conflicto moderado",
            "descripcion": "El actor presenta un riesgo de conflicto moderado que debe vigilarse.",
        })
    if (v.posicion or 0) <= 30:
        alertas.append({
            "tipo": "cambio_posicion",
            "nivel": "warning",
            "titulo": "Posición contraria o desfavorable",
            "descripcion": "El actor muestra una posición desfavorable frente a los proyectos actuales.",
        })
    if (v.historial_participacion or 0) <= 20:
        alertas.append({
            "tipo": "tension",
            "nivel": "info",
            "titulo": "Baja participación",
            "descripcion": "El actor tiene bajo historial de participación y podría requerir estrategia de vinculación.",
        })
    if (v.poder or 0) >= 70 and (v.influencia or 0) >= 70:
        alertas.append({
            "tipo": "tension",
            "nivel": "info",
            "titulo": "Actor de alto poder e influencia",
            "descripcion": "Actor clave con alto poder e influencia; se recomienda relación cercana y proactiva.",
        })
    if _num_mitchell(v.urgencia) >= 70:
        alertas.append({
            "tipo": "urgencia",
            "nivel": "warning",
            "titulo": "Alta urgencia",
            "descripcion": "El actor presenta una exigencia sensible al tiempo o de alta criticidad (urgencia >=70).",
        })
    if _num_mitchell(v.frecuencia_intentos) >= 80:
        alertas.append({
            "tipo": "frecuencia_influencia",
            "nivel": "info",
            "titulo": "Alta frecuencia de intentos de influencia",
            "descripcion": "El actor presiona de forma recurrente; se recomienda responder con protocolo y trazabilidad.",
        })
    return alertas
