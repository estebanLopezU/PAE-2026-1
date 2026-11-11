from .actor import Actor
from .actor_variables import ActorVariables
from .compromiso import Compromiso
from .alerta import Alerta
from .relacionamiento import Relacionamiento
from .usuario import Usuario
from .auditoria import Auditoria

import json

from ..modelo import (
    NIVELES,
    PESOS_TESIS,
    RANGOS,
    buscar_caso_plu,
    identificacion_estado,
    rango_relevancia,
    recomendar_expresion,
    relevancia_calculada,
    valor_100_a_nivel,
)

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
# Clasificación de stakeholders (Mitchell et al., 1997) con el modelo del
# doctorado: escala ordinal de cuatro niveles y relevancia ponderada.
# ---------------------------------------------------------------------------

# Un atributo se considera "presente" cuando su nivel ordinal es al menos 1
# (baja) en la escala de cuatro niveles del instrumento. Expresado en la escala
# continua 0-100 que usa la base de datos, el umbral es 25.
MITCHELL_UMBRAL_PRESENCIA = 25.0
MITCHELL_UMBRAL_NIVEL = 1


def _num_mitchell(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def niveles_mitchell(v):
    """Traduce poder, legitimidad y urgencia (0-100) a los niveles 0-3."""
    if v is None:
        return {"poder": 0, "legitimidad": 0, "urgencia": 0}
    return {
        "poder": NIVELES[valor_100_a_nivel(v.poder)],
        "legitimidad": NIVELES[valor_100_a_nivel(v.legitimidad)],
        "urgencia": NIVELES[valor_100_a_nivel(v.urgencia)],
    }


def calcular_relevancia_mitchell(v):
    """Relevancia ponderada del actor, expresada en la escala 0-100.

    El calculo real es el del doctorado (0 a 3). Se expone en 0-100 para no
    romper los reportes y las graficas existentes, que asumen esa escala.
    Delega en ``clasificar_mitchell`` para que exista una sola formula y la
    ponderacion guardada con la valoracion se respete tambien aqui.
    """
    if v is None:
        return 0.0
    return clasificar_mitchell(v)["relevancia_mitchell"]


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


# Correspondencia entre la identificacion del doctorado (Tabla 4.4) y las
# claves que ya usan la API y el frontend.
_IDENTIFICACION_A_TIPO = {
    "Nulo": "no_relevante",
    "Inactivo": "latente_inactivo",
    "Discrecional": "latente_discrecional",
    "Demandante": "latente_demandante",
    "Dominante": "expectante_dominante",
    "Peligroso": "expectante_peligroso",
    "Dependiente": "expectante_dependiente",
    "Definitivo": "definitivo",
}

# El estado depende de cuantos atributos posee el actor, no de cuales.
_ESTADO_A_GRUPO = {
    "Nulo": "no_relevante",
    "Latente": "latente",
    "Expectante": "expectante",
    "Definitivo": "definitivo",
}


def _pesos_de_variables(v):
    """Pesos de la ponderacion guardada con la valoracion, si es valida.

    La ponderacion se guarda como JSON en ``actor_variables.ponderacion`` para
    que la relevancia de una valoracion se pueda reproducir meses despues,
    aunque la ponderacion institucional haya cambiado.
    """
    crudo = getattr(v, "ponderacion", None)
    if not crudo:
        return None
    try:
        datos = json.loads(crudo) if isinstance(crudo, str) else dict(crudo)
        pesos = datos.get("pesos") if isinstance(datos, dict) else None
        valores = {clave: float(pesos[clave]) for clave in ("poder", "legitimidad", "urgencia")}
    except (ValueError, TypeError, KeyError, AttributeError):
        return None
    if abs(sum(valores.values()) - 1.0) > 0.02:
        return None
    return valores


def clasificar_mitchell(v):
    """Clasifica un actor con el modelo del doctorado (capitulos 2 y 4).

    Poder, legitimidad y urgencia se leen como niveles ordinales de cuatro
    posiciones (nula, baja, media, alta). Con esos niveles se obtiene el codigo
    PLU, la identificacion de Mitchell, el estado, la relevancia calculada con
    sus pesos y el rango de la Tabla 4.5. La frecuencia de intentos de
    influencia determina la expresion de liderazgo recomendada.

    Retorna un diccionario serializable para endpoints y frontend.
    """
    niveles = niveles_mitchell(v)
    poder = niveles["poder"]
    legitimidad = niveles["legitimidad"]
    urgencia = niveles["urgencia"]

    meta = identificacion_estado(poder, legitimidad, urgencia)
    tipo = _IDENTIFICACION_A_TIPO[meta["identificacion"]]
    grupo = _ESTADO_A_GRUPO[meta["estado"]]

    caso = buscar_caso_plu(f"{poder}{legitimidad}{urgencia}")
    pesos = _pesos_de_variables(v)
    if pesos:
        relevancia = relevancia_calculada(poder, legitimidad, urgencia, pesos)
        rango = rango_relevancia(relevancia)
    else:
        relevancia = caso["relevancia_calculada"]
        rango = caso["rango"]
        pesos = dict(PESOS_TESIS)

    frecuencia_nivel = NIVELES[
        valor_100_a_nivel(getattr(v, "frecuencia_intentos", 0))
    ]

    atributos_presentes = [
        nombre for nombre in ("poder", "legitimidad", "urgencia") if niveles[nombre] > 0
    ]
    sin_percepcion = not atributos_presentes

    if sin_percepcion:
        # Sin valoracion del lider no hay recomendacion: sugerir una expresion
        # seria inventar una percepcion que nadie registro.
        expresion = {
            "clave": None,
            "nombre": "Sin recomendacion",
            "descripcion": "El actor no tiene percepcion del lider registrada.",
            "regla": "Se requiere valorar poder, legitimidad o urgencia.",
            "confianza": 0,
            "origen": "sin_percepcion",
            "correlaciones": [],
        }
    else:
        expresion = recomendar_expresion(relevancia, frecuencia_nivel, niveles)

    return {
        "tipo_mitchell": tipo,
        "grupo": grupo,
        "etiqueta": meta["identificacion"],
        "descripcion": MITCHELL_TIPOS[tipo]["descripcion"],
        "accion_sugerida": MITCHELL_TIPOS[tipo]["accion"],
        "poder_presente": poder > 0,
        "legitimidad_presente": legitimidad > 0,
        "urgencia_presente": urgencia > 0,
        "atributos_presentes": atributos_presentes,
        "mitchell_count": len(atributos_presentes),
        "umbral": MITCHELL_UMBRAL_PRESENCIA,
        "umbral_nivel": MITCHELL_UMBRAL_NIVEL,
        "relevancia_mitchell": round(relevancia / 3 * 100, 2),
        # Modelo del doctorado, en su escala original 0-3.
        "plu": caso["plu"],
        "niveles": dict(niveles),
        "frecuencia_nivel": frecuencia_nivel,
        "relevancia_calculada": relevancia,
        "rango": rango,
        "rango_etiqueta": RANGOS[rango]["etiqueta"],
        "jerarquia": caso["jerarquia"],
        "estado": meta["estado"],
        "sin_percepcion": sin_percepcion,
        "pesos_aplicados": {k: round(float(v), 6) for k, v in pesos.items()},
        "ponderacion_propia": bool(_pesos_de_variables(v)),
        "expresion_sugerida": expresion,
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
