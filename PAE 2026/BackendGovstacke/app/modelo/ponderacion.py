"""Ponderacion de los atributos por apareamiento (capitulo 4, seccion 4.3).

La tesis no fija una constante de ponderacion: cada entrevistado hace su
propio apareamiento de los tres atributos en una matriz de doble entrada
(Tabla 4.1). Para cada pareja de atributos se reparten diez puntos, de modo
que el total acumulado es de treinta puntos:

    poder      vs legitimidad   -> 10 puntos
    poder      vs urgencia      -> 10 puntos
    legitimidad vs urgencia     -> 10 puntos

Los subtotales de cada atributo (sobre 30) se convierten en porcentajes y
esos porcentajes son los factores de ponderacion de la relevancia calculada.

Los pesos publicados en las Tablas 4.4 y 4.5 del doctorado son
13/30, 10/30 y 7/30 (43,33% poder, 33,33% legitimidad, 23,33% urgencia), que
es el valor por defecto de este modulo.
"""

from typing import Dict, List, Optional

from .datos_tesis import PESOS_TESIS

__all__ = [
    "PAREJAS",
    "PUNTOS_POR_PAREA",
    "TOTAL_PUNTOS",
    "ponderar",
    "pesos_desde_puntos",
    "pesos_publicados",
]

PAREJAS = (
    ("poder", "legitimidad"),
    ("poder", "urgencia"),
    ("legitimidad", "urgencia"),
)

PUNTOS_POR_PAREA = 10
TOTAL_PUNTOS = PUNTOS_POR_PAREA * len(PAREJAS)


def ponderar(parejas: Optional[List[Dict[str, int]]] = None) -> Dict[str, object]:
    """Ejecuta el procedimiento de ponderacion por apareamiento.

    `parejas` es una lista de diccionarios ``{"a": <atributo>, "b": <atributo>,
    "puntos_a": <int>}``. Si se omite, se usan los pesos publicados en las
    tablas del doctorado.
    """
    if parejas is None:
        return {
            "origen": "tesis",
            "pesos": dict(PESOS_TESIS),
            "parejas": [
                {"a": a, "b": b, "puntos_a": None, "puntos_b": None}
                for a, b in PAREJAS
            ],
            "nota": (
                "Pesos publicados en las Tablas 4.4 y 4.5 del doctorado: "
                "13/30 poder, 10/30 legitimidad, 7/30 urgencia."
            ),
        }

    subtotales = {"poder": 0, "legitimidad": 0, "urgencia": 0}
    detalle = []
    for pareja in parejas:
        atributo_a = pareja["a"]
        atributo_b = pareja["b"]
        puntos_a = int(pareja.get("puntos_a", 0))
        puntos_b = int(pareja.get("puntos_b", PUNTOS_POR_PAREA - puntos_a))

        if puntos_a + puntos_b != PUNTOS_POR_PAREA:
            raise ValueError(
                f"Cada pareja debe repartir {PUNTOS_POR_PAREA} puntos; "
                f"la pareja {atributo_a}/{atributo_b} reparte "
                f"{puntos_a + puntos_b}."
            )
        if not 0 <= puntos_a <= PUNTOS_POR_PAREA:
            raise ValueError(
                f"El reparto de la pareja {atributo_a}/{atributo_b} esta fuera de rango."
            )

        subtotales[atributo_a] += puntos_a
        subtotales[atributo_b] += puntos_b
        detalle.append(
            {
                "a": atributo_a,
                "b": atributo_b,
                "puntos_a": puntos_a,
                "puntos_b": puntos_b,
            }
        )

    pesos = {
        atributo: round(puntos / TOTAL_PUNTOS, 6)
        for atributo, puntos in subtotales.items()
    }
    # La suma debe cerrarse en 1 para no alterar la escala 0-3 de la relevancia.
    diferencia = round(1 - sum(pesos.values()), 6)
    if diferencia:
        pesos["urgencia"] = round(pesos["urgencia"] + diferencia, 6)

    return {
        "origen": "usuario",
        "pesos": pesos,
        "subtotales": subtotales,
        "parejas": detalle,
        "nota": (
            "La ponderacion se realizo por apareamiento segun la Tabla 4.1 del "
            "doctorado; estos pesos sustituyen a los publicados para el calculo "
            "de la relevancia de los actores valorados por este usuario."
        ),
    }


def pesos_desde_puntos(subtotales: Dict[str, int]) -> Dict[str, float]:
    """Convierte subtotales sobre 30 puntos en factores de ponderacion."""
    total = sum(subtotales.values())
    if total != TOTAL_PUNTOS:
        raise ValueError(
            f"Los subtotales deben sumar {TOTAL_PUNTOS} puntos; suman {total}."
        )
    return {
        atributo: round(puntos / TOTAL_PUNTOS, 6)
        for atributo, puntos in subtotales.items()
    }


def pesos_publicados() -> Dict[str, float]:
    """Pesos publicados en las Tablas 4.4 y 4.5 del doctorado."""
    return dict(PESOS_TESIS)
