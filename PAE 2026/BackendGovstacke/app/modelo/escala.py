"""Escala de valoracion de atributos: verbal de 4 niveles (0-3) y su equivalencia.

El instrumento del doctorado (capitulo 3, seccion 3.6.2.1) usa una escala
verbal cerrada de cuatro niveles para cada atributo:

    nula (0 puntos), baja (1 punto), media (2 puntos), alta (3 puntos)

Se eligio una escala de cuatro niveles, y no una de nivel impar, para evitar
la tendencia central (la indecision del entrevistado) y para que la decision
fuera rapida y comprensible.

GOVStake 360 guarda las variables en una escala continua de 0 a 100 porque
esas mismas variables alimentan el indice de priorizacion y el indice de
calidad del relacionamiento, definidos en el PAE. Este modulo hace la
traduccion entre ambas escalas de forma explicita y auditable: el dato
original (0-100) nunca se pierde y el modelo del doctorado corre siempre
sobre el nivel ordinal.
"""

from typing import Dict, Optional

from .datos_tesis import NIVELES

__all__ = [
    "BANDAS_100_A_3",
    "NIVEL_A_PUNTOS",
    "PUNTOS_A_NIVEL",
    "valor_100_a_nivel",
    "nivel_a_etiqueta",
    "descripcion_escala",
]

# Bandas por defecto para traducir la escala continua 0-100 a los cuatro
# niveles del instrumento. Son equidistantes, de modo que el valor original
# mantiene su sentido al clasificarlo.
BANDAS_100_A_3 = (
    (0, 24, "nula"),
    (25, 49, "baja"),
    (50, 74, "media"),
    (75, 100, "alta"),
)

NIVEL_A_PUNTOS = {clave: puntos for clave, puntos in NIVELES.items()}
PUNTOS_A_NIVEL = {puntos: clave for clave, puntos in NIVELES.items()}

_ETIQUETAS = {
    "nula": "Nula",
    "baja": "Baja",
    "media": "Media",
    "alta": "Alta",
}


def valor_100_a_nivel(valor: Optional[float]) -> str:
    """Traduce un valor 0-100 al nivel verbal del instrumento.

    Los valores fuera de rango se recortan al intervalo valido y los nulos
    se interpretan como nivel *nula*.
    """
    try:
        numero = float(valor or 0)
    except (TypeError, ValueError):
        return "nula"

    if numero < 0:
        numero = 0.0
    elif numero > 100:
        numero = 100.0

    for minimo, maximo, clave in BANDAS_100_A_3:
        if minimo <= numero <= maximo:
            return clave
    return "alta"


def nivel_a_etiqueta(nivel: str) -> str:
    """Devuelve la etiqueta legible del nivel verbal."""
    return _ETIQUETAS.get(nivel, nivel)


def descripcion_escala() -> Dict[str, object]:
    """Descripcion de la escala, lista para exponer en la API y la interfaz."""
    return {
        "instrumento": "Escala verbal cerrada de cuatro niveles (doctorado, cap. 3.6.2.1)",
        "niveles": [
            {
                "clave": clave,
                "etiqueta": _ETIQUETAS[clave],
                "puntos": puntos,
                "banda_100": [
                    minimo for minimo, maximo, c in BANDAS_100_A_3 if c == clave
                ][0],
                "banda_100_max": [
                    maximo for minimo, maximo, c in BANDAS_100_A_3 if c == clave
                ][0],
            }
            for clave, puntos in NIVELES.items()
        ],
        "nota": (
            "La escala continua 0-100 se conserva como dato original; el nivel "
            "ordinal es la lectura que usa el modelo de clasificacion."
        ),
    }
