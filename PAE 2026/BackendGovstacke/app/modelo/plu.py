"""Clasificacion PLU: los 64 casos de la metodologia del doctorado.

El capitulo 4 del doctorado "Liderazgo y grupos de interes" (Pantoja Ospina,
2015) propone una metodologia de cinco etapas para clasificar a los
stakeholders de una organizacion:

1. Ponderar los atributos (apareamiento de tres parejas, diez puntos cada una).
2. Identificar las posibles combinaciones de atributos segun la escala
   adoptada: 64 casos posibles (Tabla 4.3).
3. Identificar los stakeholders y clasificar su estado segun la cantidad de
   atributos que posean (Tabla 4.4).
4. Ordenar ascendentemente los casos segun el valor de la relevancia
   calculada (Tabla 4.5).
5. Clasificar la relevancia de acuerdo con el rango que se adopte.

Este modulo implementa los pasos 2 a 5 de forma deterministica y verificable.
La tabla que produce coincide en los 64 casos con las Tablas 4.4 y 4.5
impresas (ver `app.modelo.datos_tesis`).
"""

from typing import Dict, List, Optional

from .datos_tesis import (
    ESTADO,
    IDENTIFICACION,
    NIVELES,
    ORDEN_PLUR,
    PESOS_TESIS,
    PESOS_TESIS_NUMERADOR,
    RANGOS,
)

__all__ = [
    "PESOS_TESIS",
    "relevancia_calculada",
    "identificacion_estado",
    "rango_relevancia",
    "generar_tabla_casos",
    "buscar_caso_plu",
    "TABLA_CASOS",
]


def _validar_nivel(valor, nombre: str) -> int:
    """Convierte un nivel de atributo a entero y valida el rango 0-3."""
    try:
        nivel = int(valor)
    except (TypeError, ValueError):
        raise ValueError(f"El nivel de '{nombre}' no es un numero: {valor!r}")
    if not 0 <= nivel <= 3:
        raise ValueError(
            f"El nivel de '{nombre}' debe estar entre 0 y 3 (escala del doctorado); "
            f"se recibio {nivel}."
        )
    return nivel


def identificacion_estado(poder: int, legitimidad: int, urgencia: int) -> Dict[str, object]:
    """Devuelve la identificacion de Mitchell y el estado del stakeholder.

    La identificacion depende de *que* atributos posee (paso 3 de la
    metodologia) y el estado de *cuantos* posee:

    ==========  =================  ==========
    Atributos   Identificacion     Estado
    ==========  =================  ==========
    ninguno     Nulo               Nulo
    poder       Inactivo           Latente
    legitimidad Discrecional       Latente
    urgencia    Demandante         Latente
    P + L       Dominante          Expectante
    P + U       Peligroso          Expectante
    L + U       Dependiente        Expectante
    P + L + U   Definitivo         Definitivo
    ==========  =================  ==========
    """
    poder = _validar_nivel(poder, "poder")
    legitimidad = _validar_nivel(legitimidad, "legitimidad")
    urgencia = _validar_nivel(urgencia, "urgencia")

    presentes = [poder > 0, legitimidad > 0, urgencia > 0]
    cantidad = sum(presentes)

    if cantidad == 0:
        clave = "ninguno"
    elif cantidad == 3:
        clave = "los_tres"
    elif cantidad == 1:
        if presentes[0]:
            clave = "solo_poder"
        elif presentes[1]:
            clave = "solo_legitimidad"
        else:
            clave = "solo_urgencia"
    elif presentes[0] and presentes[1]:
        clave = "poder_legitimidad"
    elif presentes[0]:
        clave = "poder_urgencia"
    else:
        clave = "legitimidad_urgencia"

    return {
        "identificacion": IDENTIFICACION[clave],
        "estado": ESTADO[cantidad],
        "atributos_presentes": cantidad,
        "clave": clave,
    }


def relevancia_calculada(
    poder: int,
    legitimidad: int,
    urgencia: int,
    pesos: Optional[Dict[str, float]] = None,
) -> float:
    """Relevancia calculada del stakeholder (capitulo 4, seccion 4.4).

    Es la sumatoria de los puntos de cada atributo multiplicados por su factor
    de ponderacion:

        relevancia = P * peso_poder + L * peso_legitimidad + U * peso_urgencia

    El rango es de 0 a 3 puntos. Por defecto se usan los pesos con los que
    fueron publicadas las Tablas 4.4 y 4.5 del doctorado (43,33% poder,
    33,33% legitimidad, 23,33% urgencia). La tesis permite que cada
    entrevistado haga su propia ponderacion, por lo que `pesos` es
    parametrizable; en ese caso el resultado es la *relevancia percibida* por
    ese entrevistado y no la tabla canonica.
    """
    poder = _validar_nivel(poder, "poder")
    legitimidad = _validar_nivel(legitimidad, "legitimidad")
    urgencia = _validar_nivel(urgencia, "urgencia")

    factores = pesos or PESOS_TESIS
    total = (
        poder * float(factores.get("poder", 0))
        + legitimidad * float(factores.get("legitimidad", 0))
        + urgencia * float(factores.get("urgencia", 0))
    )
    return round(total, 2)


def rango_relevancia(relevancia: float) -> str:
    """Clasifica la relevancia en los rangos de la Tabla 4.5.

    Rangos (capitulo 4, paso 5):

    * Nula: 0,00 (caso unico, PLU 000)
    * Baja: 0,23 - 1,00
    * Media-Baja: 1,03 - 1,47
    * Media-Alta: 1,53 - 1,97
    * Alta: 2,00 - 3,00

    Los saltos entre bandas (por ejemplo 1,00 a 1,03) no existen en la tabla
    publicada; aqui se resuelven asignando al rango inferior el valor
    intermedio del salto.
    """
    valor = round(float(relevancia), 2)
    if valor <= 0.22:
        return "nula"
    if valor <= 1.015:
        return "baja"
    if valor <= 1.50:
        return "media_baja"
    if valor <= 1.985:
        return "media_alta"
    return "alta"


def _caso_por_numeros(poder: int, legitimidad: int, urgencia: int) -> Dict[str, object]:
    """Construye la ficha de un caso PLU con los pesos canonicos del doctorado."""
    # El numero de caso sigue la enumeracion de las Tablas 4.3/4.4:
    # caso = 1 + 16*P + 4*L + U (el digito de urgencia es el de menor peso).
    numero = 1 + 16 * poder + 4 * legitimidad + urgencia
    codigo = f"{poder}{legitimidad}{urgencia}"

    meta = identificacion_estado(poder, legitimidad, urgencia)
    relevancia = relevancia_calculada(poder, legitimidad, urgencia)
    rango = rango_relevancia(relevancia)

    return {
        "caso": numero,
        "plu": codigo,
        "poder": poder,
        "legitimidad": legitimidad,
        "urgencia": urgencia,
        "niveles": {
            "poder": poder,
            "legitimidad": legitimidad,
            "urgencia": urgencia,
        },
        "identificacion": meta["identificacion"],
        "estado": meta["estado"],
        "atributos_presentes": meta["atributos_presentes"],
        "relevancia_calculada": relevancia,
        "rango": rango,
        "rango_etiqueta": RANGOS[rango]["etiqueta"],
        "jerarquia": _jerarquia(rango),
    }


def _jerarquia(rango: str) -> int:
    """Posicion jerarquica (1 = mayor) dentro de la jerarquia de la Tabla 4.5."""
    orden = ["alta", "media_alta", "media_baja", "baja", "nula"]
    return orden.index(rango) + 1


def generar_tabla_casos() -> List[Dict[str, object]]:
    """Genera los 64 casos PLU ordenados por relevancia ascendente.

    El orden es el de la Tabla 4.5 (jerarquia y rango para la relevancia
    calculada). En caso de empate se conserva el orden natural por numero de
    caso, que es como aparece impreso.
    """
    casos = []
    for poder in range(4):
        for legitimidad in range(4):
            for urgencia in range(4):
                casos.append(_caso_por_numeros(poder, legitimidad, urgencia))
    casos.sort(key=lambda c: (c["relevancia_calculada"], c["caso"]))
    return casos


def buscar_caso_plu(codigo: str) -> Optional[Dict[str, object]]:
    """Devuelve la ficha del caso PLU indicado (por ejemplo ``"123"``)."""
    texto = str(codigo or "").strip()
    if len(texto) != 3 or not texto.isdigit():
        return None
    poder, legitimidad, urgencia = (int(d) for d in texto)
    if any(n > 3 for n in (poder, legitimidad, urgencia)):
        return None
    return _caso_por_numeros(poder, legitimidad, urgencia)


# Tabla en memoria, construida una sola vez al importar el modulo.
TABLA_CASOS = generar_tabla_casos()

# Exposicion de las escalas para la API y la interfaz.
ESCALA_NIVELES = [
    {"clave": clave, "etiqueta": clave.capitalize(), "puntos": puntos}
    for clave, puntos in NIVELES.items()
]

RANGOS_RELEVANCIA = [
    {
        "clave": clave,
        "etiqueta": datos["etiqueta"],
        "min": datos["min"],
        "max": datos["max"],
    }
    for clave, datos in RANGOS.items()
]

# Numeros usados para reconstruir la tabla desde el codigo (util para depurar).
NUMERADORES = PESOS_TESIS_NUMERADOR
ORDEN_ATRIBUTOS = ORDEN_PLUR
