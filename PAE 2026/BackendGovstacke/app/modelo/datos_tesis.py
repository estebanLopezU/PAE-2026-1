"""Datos de referencia tomados del doctorado "Liderazgo y grupos de interés".

Este módulo contiene la **transcripción literal** de las Tablas 4.4 y 4.5 del
doctorado de Martín Alonso Pantoja Ospina (2015), capítulo 4
("Propuesta metodológica para la clasificación de los stakeholders"), páginas
115-118 del PDF `10281867.2016.pdf`.

No es código de negocio: es la *fuente de verdad externa* contra la que se
verifica el cálculo que GOVStake 360 implementa. Si el generador de
`app.modelo.plu` y esta tabla coinciden en los 64 casos, la implementación es
fiel al documento original.

Advertencia sobre los pesos
---------------------------
El pie de página 39 de la tesis (nota al pie 39) indica los pesos
"Poder: 43,3%; Legitimidad: 30,0% y Urgencia: 26,7%" y escribe el ejemplo
``1x0,433 + 2x0,30 + 3x0,267 = 1,80``. Esa cuenta da 1,834, no 1,80.

Las Tablas 4.4 y 4.5 impresas, en cambio, son reproducibles **exactamente**
(64 de 64 casos) con los pesos 13/30, 10/30 y 7/30, es decir
43,33% poder, 33,33% legitimidad y 23,33% urgencia:

    caso 28 -> PLU 123 -> (13*1 + 10*2 + 7*3) / 30 = 54/30 = 1,80

Por eso GOVStake usa los pesos de las tablas impresas (que son las que
sostienen la jerarquia y los rangos publicados) y deja documentada la
discrepancia con el pie de pagina, en lugar de propagar un redondeo que
haria fallar 27 de los 64 casos.
"""

# Pesos con los que fueron construidas las Tablas 4.4 y 4.5 impresas.
# Se expresan como fracciones enteras para evitar errores de punto flotante.
PESOS_TESIS_NUMERADOR = {
    "poder": 13,
    "legitimidad": 10,
    "urgencia": 7,
}
PESOS_TESIS = {k: v / 30 for k, v in PESOS_TESIS_NUMERADOR.items()}

# Orden de los digitos del codigo PLU.
ORDEN_PLUR = ("poder", "legitimidad", "urgencia")

# Escala verbal cerrada del instrumento (capitulo 3, seccion 3.6.2.1).
NIVELES = {
    "nula": 0,
    "baja": 1,
    "media": 2,
    "alta": 3,
}

# Identificacion (Mitchell et al., 1997) segun la combinacion de atributos.
IDENTIFICACION = {
    "ninguno": "Nulo",
    "solo_poder": "Inactivo",
    "solo_legitimidad": "Discrecional",
    "solo_urgencia": "Demandante",
    "poder_legitimidad": "Dominante",
    "poder_urgencia": "Peligroso",
    "legitimidad_urgencia": "Dependiente",
    "los_tres": "Definitivo",
}

# Estado segun la cantidad de atributos poseidos (capitulo 4, paso 3).
ESTADO = {
    0: "Nulo",
    1: "Latente",
    2: "Expectante",
    3: "Definitivo",
}

# Rangos de la relevancia calculada (capitulo 4, paso 5 y Tabla 4.5).
# El doctorado define cuatro rangos; el caso 1 (PLU 000, relevancia 0,00)
# queda aparte como "Nula" en la Tabla 4.5 impresa.
RANGOS = {
    "nula": {"etiqueta": "Nula", "min": 0.00, "max": 0.22},
    "baja": {"etiqueta": "Baja", "min": 0.23, "max": 1.00},
    "media_baja": {"etiqueta": "Media-Baja", "min": 1.03, "max": 1.47},
    "media_alta": {"etiqueta": "Media-Alta", "min": 1.53, "max": 1.97},
    "alta": {"etiqueta": "Alta", "min": 2.00, "max": 3.00},
}


# ---------------------------------------------------------------------------
# Transcripcion literal de las Tablas 4.4 y 4.5 (64 casos, ordenados por
# relevancia ascendente tal como aparece en la Tabla 4.5).
# ---------------------------------------------------------------------------
# (caso, PLU, identificacion, estado, relevancia calculada, rango)
TABLA_4_5_REFERENCIA = [
    (1, "000", "Nulo", "Nulo", 0.00, "nula"),
    (2, "001", "Demandante", "Latente", 0.23, "baja"),
    (5, "010", "Discrecional", "Latente", 0.33, "baja"),
    (17, "100", "Inactivo", "Latente", 0.43, "baja"),
    (3, "002", "Demandante", "Latente", 0.47, "baja"),
    (6, "011", "Dependiente", "Expectante", 0.57, "baja"),
    (9, "020", "Discrecional", "Latente", 0.67, "baja"),
    (18, "101", "Peligroso", "Expectante", 0.67, "baja"),
    (4, "003", "Demandante", "Latente", 0.70, "baja"),
    (21, "110", "Dominante", "Expectante", 0.77, "baja"),
    (7, "012", "Dependiente", "Expectante", 0.80, "baja"),
    (33, "200", "Inactivo", "Latente", 0.87, "baja"),
    (10, "021", "Dependiente", "Expectante", 0.90, "baja"),
    (19, "102", "Peligroso", "Expectante", 0.90, "baja"),
    (22, "111", "Definitivo", "Definitivo", 1.00, "baja"),
    (13, "030", "Discrecional", "Latente", 1.00, "baja"),
    (8, "013", "Dependiente", "Expectante", 1.03, "media_baja"),
    (25, "120", "Dominante", "Expectante", 1.10, "media_baja"),
    (34, "201", "Peligroso", "Expectante", 1.10, "media_baja"),
    (11, "022", "Dependiente", "Expectante", 1.13, "media_baja"),
    (20, "103", "Peligroso", "Expectante", 1.13, "media_baja"),
    (37, "210", "Dominante", "Expectante", 1.20, "media_baja"),
    (23, "112", "Definitivo", "Definitivo", 1.23, "media_baja"),
    (14, "031", "Dependiente", "Expectante", 1.23, "media_baja"),
    (49, "300", "Inactivo", "Latente", 1.30, "media_baja"),
    (26, "121", "Definitivo", "Definitivo", 1.33, "media_baja"),
    (35, "202", "Peligroso", "Expectante", 1.33, "media_baja"),
    (12, "023", "Dependiente", "Expectante", 1.37, "media_baja"),
    (38, "211", "Definitivo", "Definitivo", 1.43, "media_baja"),
    (29, "130", "Dominante", "Expectante", 1.43, "media_baja"),
    (24, "113", "Definitivo", "Definitivo", 1.47, "media_baja"),
    (15, "032", "Dependiente", "Expectante", 1.47, "media_baja"),
    (41, "220", "Dominante", "Expectante", 1.53, "media_alta"),
    (50, "301", "Peligroso", "Expectante", 1.53, "media_alta"),
    (36, "203", "Peligroso", "Expectante", 1.57, "media_alta"),
    (27, "122", "Definitivo", "Definitivo", 1.57, "media_alta"),
    (53, "310", "Dominante", "Expectante", 1.63, "media_alta"),
    (39, "212", "Definitivo", "Definitivo", 1.67, "media_alta"),
    (30, "131", "Definitivo", "Definitivo", 1.67, "media_alta"),
    (16, "033", "Dependiente", "Expectante", 1.70, "media_alta"),
    (42, "221", "Definitivo", "Definitivo", 1.77, "media_alta"),
    (51, "302", "Peligroso", "Expectante", 1.77, "media_alta"),
    (28, "123", "Definitivo", "Definitivo", 1.80, "media_alta"),
    (54, "311", "Definitivo", "Definitivo", 1.87, "media_alta"),
    (45, "230", "Dominante", "Expectante", 1.87, "media_alta"),
    (31, "132", "Definitivo", "Definitivo", 1.90, "media_alta"),
    (40, "213", "Definitivo", "Definitivo", 1.90, "media_alta"),
    (57, "320", "Dominante", "Expectante", 1.97, "media_alta"),
    (43, "222", "Definitivo", "Definitivo", 2.00, "alta"),
    (52, "303", "Peligroso", "Expectante", 2.00, "alta"),
    (46, "231", "Definitivo", "Definitivo", 2.10, "alta"),
    (55, "312", "Definitivo", "Definitivo", 2.10, "alta"),
    (32, "133", "Definitivo", "Definitivo", 2.13, "alta"),
    (58, "321", "Definitivo", "Definitivo", 2.20, "alta"),
    (44, "223", "Definitivo", "Definitivo", 2.23, "alta"),
    (61, "330", "Dominante", "Expectante", 2.30, "alta"),
    (56, "313", "Definitivo", "Definitivo", 2.33, "alta"),
    (47, "232", "Definitivo", "Definitivo", 2.33, "alta"),
    (59, "322", "Definitivo", "Definitivo", 2.43, "alta"),
    (62, "331", "Definitivo", "Definitivo", 2.53, "alta"),
    (48, "233", "Definitivo", "Definitivo", 2.57, "alta"),
    (60, "323", "Definitivo", "Definitivo", 2.67, "alta"),
    (63, "332", "Definitivo", "Definitivo", 2.77, "alta"),
    (64, "333", "Definitivo", "Definitivo", 3.00, "alta"),
]
