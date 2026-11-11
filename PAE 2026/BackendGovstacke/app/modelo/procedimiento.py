"""Las cinco etapas de la metodologia procesal del doctorado (capitulo 4).

El doctorado propone un procedimiento replicable para clasificar a los grupos
de interes. GOVStake 360 lo implementa de punta a punta y registra en que
etapa esta cada entidad, de modo que el resultado no sea una caja negra.

1. Ponderar los atributos (apareamiento de tres parejas, diez puntos cada una).
2. Identificar las combinaciones posibles (64 casos PLU).
3. Identificar los actores y clasificar su estado (nulo, latente, expectante,
   definitivo) segun cuantos atributos posean.
4. Ordenar ascendentemente por la relevancia calculada.
5. Clasificar la relevancia en los rangos definidos.
"""

from typing import Dict, List

__all__ = ["ETAPAS", "resumen_procedimiento"]

ETAPAS = [
    {
        "numero": 1,
        "clave": "ponderacion",
        "nombre": "Ponderar los atributos",
        "descripcion": (
            "Se comparan los tres atributos por parejas y se reparten diez "
            "puntos en cada pareja: poder-legitimidad, poder-urgencia y "
            "legitimidad-urgencia. El total es de treinta puntos."
        ),
        "entrada": "Juicio del entrevistado o del lider.",
        "salida": "Factores de ponderacion que suman 1.",
        "evidencia_en_govstake": "app/modelo/ponderacion.py y la pantalla de ponderacion.",
        "cita": "Doctorado, capitulo 4, Tabla 4.1 (adaptado de Grech, 2001).",
    },
    {
        "numero": 2,
        "clave": "combinaciones",
        "nombre": "Identificar las combinaciones posibles",
        "descripcion": (
            "Con una escala de cuatro niveles por atributo existen 4 x 4 x 4 "
            "= 64 combinaciones posibles. Cada combinacion se identifica con "
            "un codigo PLU de tres digitos."
        ),
        "entrada": "Escala verbal cerrada de cuatro niveles.",
        "salida": "Tabla de 64 casos con su identificacion de Mitchell.",
        "evidencia_en_govstake": "app/modelo/plu.py (TABLA_CASOS).",
        "cita": "Doctorado, capitulo 4, Tabla 4.3.",
    },
    {
        "numero": 3,
        "clave": "actores_estado",
        "nombre": "Identificar los actores y clasificar su estado",
        "descripcion": (
            "Cada actor recibe un nivel en poder, legitimidad y urgencia. "
            "Segun cuantos atributos tenga presentes se clasifica como nulo, "
            "latente, expectante o definitivo."
        ),
        "entrada": "Percepcion del lider sobre cada actor.",
        "salida": "Codigo PLU, identificacion de Mitchell y estado.",
        "evidencia_en_govstake": "clasificar_mitchell() en app/models y la ficha del actor.",
        "cita": "Doctorado, capitulo 4, Tabla 4.4.",
    },
    {
        "numero": 4,
        "clave": "orden",
        "nombre": "Ordenar por relevancia calculada",
        "descripcion": (
            "La relevancia es la suma de los puntos de cada atributo "
            "multiplicados por su factor de ponderacion. Los actores se "
            "ordenan de menor a mayor relevancia."
        ),
        "entrada": "Niveles de los atributos y pesos vigentes.",
        "salida": "Lista ordenada con la relevancia de cada actor (0 a 3).",
        "evidencia_en_govstake": "relevancia_calculada() en app/modelo/plu.py.",
        "cita": "Doctorado, capitulo 4, seccion 4.4 y nota al pie 39.",
    },
    {
        "numero": 5,
        "clave": "rango",
        "nombre": "Clasificar la relevancia por rango",
        "descripcion": (
            "La relevancia calculada se clasifica en los rangos de la tabla: "
            "nula, baja, media-baja, media-alta y alta. El rango orienta la "
            "intensidad de la atencion y la expresion de liderazgo sugerida."
        ),
        "entrada": "Relevancia calculada en el paso anterior.",
        "salida": "Rango de relevancia y jerarquia del actor.",
        "evidencia_en_govstake": "rango_relevancia() en app/modelo/plu.py.",
        "cita": "Doctorado, capitulo 4, Tabla 4.5.",
    },
]


def resumen_procedimiento() -> Dict[str, object]:
    """Procedimiento completo listo para la API y la interfaz."""
    return {
        "nombre": "Metodologia procesal en cinco etapas",
        "descripcion": (
            "Procedimiento replicable del doctorado para clasificar grupos de "
            "interes. Cada etapa queda registrada y es auditable en GOVStake."
        ),
        "etapas": [dict(etapa) for etapa in ETAPAS],
        "total": len(ETAPAS),
    }
