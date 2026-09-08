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
    return alertas