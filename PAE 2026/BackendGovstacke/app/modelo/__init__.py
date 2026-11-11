"""Nucleo teorico de GOVStake 360.

Este paquete concentra la teoria del modelo que GOVStake 360 aplica de forma
automatizada, tomado del doctorado "Liderazgo y grupos de interes: Influencia
de los atributos de los grupos de interes en las expresiones del liderazgo
participativo en la organizacion" (Pantoja Ospina, 2015).

Modulos:

* `datos_tesis`  - transcripcion literal de las Tablas 4.4 y 4.5 (64 casos).
* `plu`          - los 64 casos PLU, la identificacion, el estado y el rango.
* `escala`       - escala verbal de cuatro niveles y su equivalencia con 0-100.
* `ponderacion`  - ponderacion de atributos por apareamiento (Tabla 4.1).

Regla de arquitectura: el contenido teorico vive aqui, no en el frontend. La
API lo expone, la interfaz lo muestra, el agente conversacional lo cita y los
reportes lo exportan, de modo que la teoria nunca diverge del calculo.
"""

from .datos_tesis import (
    ESTADO,
    IDENTIFICACION,
    NIVELES,
    PESOS_TESIS,
    PESOS_TESIS_NUMERADOR,
    RANGOS,
    TABLA_4_5_REFERENCIA,
)
from .escala import (
    BANDAS_100_A_3,
    descripcion_escala,
    nivel_a_etiqueta,
    valor_100_a_nivel,
)
from .plu import (
    ESCALA_NIVELES,
    RANGOS_RELEVANCIA,
    TABLA_CASOS,
    buscar_caso_plu,
    generar_tabla_casos,
    identificacion_estado,
    rango_relevancia,
    relevancia_calculada,
)
from .ponderacion import pesos_publicados, ponderar

__all__ = [
    "ESTADO",
    "IDENTIFICACION",
    "NIVELES",
    "PESOS_TESIS",
    "PESOS_TESIS_NUMERADOR",
    "RANGOS",
    "TABLA_4_5_REFERENCIA",
    "BANDAS_100_A_3",
    "descripcion_escala",
    "nivel_a_etiqueta",
    "valor_100_a_nivel",
    "ESCALA_NIVELES",
    "RANGOS_RELEVANCIA",
    "TABLA_CASOS",
    "buscar_caso_plu",
    "generar_tabla_casos",
    "identificacion_estado",
    "rango_relevancia",
    "relevancia_calculada",
    "pesos_publicados",
    "ponderar",
]
