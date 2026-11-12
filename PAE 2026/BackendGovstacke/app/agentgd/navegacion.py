"""Mapa de navegacion y guia de paginas para AgentGD (GOVStake 360).

Fuente unica en el backend de las rutas que el asistente puede recomendar.
El frontend solo dibuja las acciones que llegan en la respuesta; no decide
rutas por su cuenta. Asi una ruta inventada por el modelo nunca llega al
navegador.
"""

from typing import Dict, List, Optional

__all__ = [
    "RUTAS",
    "PAGINAS",
    "DESTINOS",
    "normalizar_ruta",
    "ficha_pagina",
    "acciones_de",
]


# ---------------------------------------------------------------------------
# Rutas permitidas. Cualquier destino fuera de esta lista se rechaza.
# ---------------------------------------------------------------------------
RUTAS = {
    "/dashboard": "Dashboard",
    "/modelo": "Fundamentos teoricos",
    "/que-es-govstake": "Que es GOVStake 360 (publica)",
    "/actores": "Actores",
    "/matriz": "Matriz y mapa de priorizacion",
    "/mitchell": "Clasificacion Mitchell",
    "/compromisos": "Compromisos",
    "/relacionamientos": "Relacionamiento",
    "/alertas": "Alertas",
    "/protocolo": "Protocolo de relacionamiento",
    "/reportes": "Reportes",
}


# Sinonimos que el modelo puede usar al llamar la herramienta ``navegar``.
DESTINOS = {
    "dashboard": "/dashboard",
    "inicio": "/dashboard",
    "modelo": "/modelo",
    "fundamentos": "/modelo",
    "teoria": "/modelo",
    "que_es": "/que-es-govstake",
    "actores": "/actores",
    "stakeholders": "/actores",
    "matriz": "/matriz",
    "mapa": "/matriz",
    "priorizacion": "/matriz",
    "mitchell": "/mitchell",
    "compromisos": "/compromisos",
    "relacionamientos": "/relacionamientos",
    "relacionamiento": "/relacionamientos",
    "alertas": "/alertas",
    "protocolo": "/protocolo",
    "reportes": "/reportes",
}


PAGINAS: Dict[str, Dict[str, object]] = {
    "/dashboard": {
        "titulo": "Dashboard",
        "que_muestra": (
            "Panorama general: total de actores, actores con percepcion del lider, "
            "nivel de prioridad, alertas abiertas y compromisos pendientes."
        ),
        "como_leerlo": (
            "Los contadores superiores resumen el estado; la distribucion por prioridad "
            "muestra cuantos actores exigen atencion inmediata. Un actor sin percepcion "
            "del lider no se clasifica: aparece como pendiente de valoracion."
        ),
        "preguntas": [
            "Dame el resumen ejecutivo de la plataforma",
            "Que actores son prioridad alta y por que",
            "Que alertas criticas tengo sin atender",
        ],
        "guia": [
            "Empieza por los indicadores de la franja superior: ahi esta el pulso general.",
            "Revisa la distribucion por prioridad para saber donde concentrar el relacionamiento.",
            "Baja a la lista de actores: los de indice mas alto son los que primero debes atender.",
        ],
    },
    "/modelo": {
        "titulo": "Fundamentos teoricos",
        "que_muestra": (
            "El modelo del doctorado aplicado en la plataforma: atributos de Mitchell, "
            "escala de cuatro niveles, los 64 casos PLU, ponderacion, expresiones del "
            "liderazgo participativo, modelo SLX y procedimiento de cinco etapas."
        ),
        "como_leerlo": (
            "Cada seccion explica de donde sale una decision automatica de GOVStake. "
            "La escala ordinal 0-3 es la que usa el doctorado; la escala 0-100 de la "
            "base de datos se conserva como dato original."
        ),
        "preguntas": [
            "Explicame el modelo PLU con un ejemplo",
            "Como se calcula la relevancia de un actor",
            "Que diferencia hay entre el indice de priorizacion y la relevancia Mitchell",
        ],
        "guia": [
            "Lee primero la escala: nula, baja, media y alta son los cuatro niveles del instrumento.",
            "Despues revisa los 64 casos PLU: cada combinacion tiene una identificacion y un rango.",
            "Al final estan las expresiones del liderazgo: autocracia, consulta, decision conjunta y delegacion.",
        ],
    },
    "/que-es-govstake": {
        "titulo": "Que es GOVStake 360",
        "que_muestra": "Explicacion publica del proposito, la etica y las fuentes del modelo.",
        "como_leerlo": "Es la pagina de entrada para quien no conoce la plataforma.",
        "preguntas": ["Que es GOVStake 360 y para que sirve"],
        "guia": ["Esta pagina explica el proyecto sin exigir sesion."],
    },
    "/actores": {
        "titulo": "Actores",
        "que_muestra": (
            "Catalogo de grupos de interes con su ficha: tipo, institucion, territorio, "
            "variables valoradas, indice de priorizacion, clasificacion Mitchell y "
            "expresion de liderazgo sugerida."
        ),
        "como_leerlo": (
            "El indice de priorizacion (0-100) pondera poder, legitimidad, influencia e "
            "interes. La clasificacion Mitchell usa solo poder, legitimidad y urgencia en "
            "escala 0-3. Son dos lecturas distintas y complementarias."
        ),
        "preguntas": [
            "Muestrame la ficha de la Contraloria",
            "Que actores de tipo veeduria hay",
            "Compara los dos actores con mayor indice",
        ],
        "guia": [
            "Usa el buscador para llegar a un actor por nombre o institucion.",
            "Abre la ficha para ver las variables y la recomendacion de liderazgo.",
            "Si un actor no tiene valoracion, no aparece con prioridad: primero hay que valorarlo.",
        ],
    },
    "/matriz": {
        "titulo": "Matriz y mapa de priorizacion",
        "que_muestra": (
            "Cuatro indicadores de la matriz, composicion por prioridad y por tipo, un mapa "
            "de cuadrantes (poder contra interes, ejes intercambiables) y la tabla ordenable "
            "de actores con su indice."
        ),
        "como_leerlo": (
            "En el mapa, el tamano del punto representa la influencia y el color la prioridad. "
            "Los actores sin percepcion del lider se ocultan por defecto; al mostrarlos se "
            "agrupan en un globo para no distorsionar los cuadrantes."
        ),
        "preguntas": [
            "Que hay en cada cuadrante de la matriz",
            "Quienes estan en el cuadrante de alta prioridad",
            "Por que hay 124 actores agrupados en un globo",
        ],
        "guia": [
            "Los cuatro indicadores superiores resumen la matriz.",
            "Cambia los ejes del mapa para ver poder, legitimidad, influencia o interes.",
            "Pasa el cursor sobre un punto para ver sus variables; usa la tabla para ordenar por indice.",
        ],
    },
    "/mitchell": {
        "titulo": "Clasificacion Mitchell",
        "que_muestra": (
            "Los ocho tipos de stakeholder (latente, expectante y definitivo), su estado, "
            "la accion sugerida y los casos sin percepcion del lider."
        ),
        "como_leerlo": (
            "Tener el atributo significa nivel ordinal mayor que cero; el estado depende de "
            "cuantos atributos posee el actor, no de cuales."
        ),
        "preguntas": [
            "Cuantos actores definitivos hay",
            "Que diferencia hay entre latente, expectante y definitivo",
            "Que hago con un actor expectante peligroso",
        ],
        "guia": [
            "Revisa el grupo definitivo primero: combina poder, legitimidad y urgencia.",
            "Los latentes tienen un solo atributo; requieren observacion, no atencion inmediata.",
            "Cada tarjeta trae una accion sugerida de relacionamiento.",
        ],
    },
    "/compromisos": {
        "titulo": "Compromisos",
        "que_muestra": "Compromisos adquiridos con actores, su estado, prioridad y fecha de vencimiento.",
        "como_leerlo": "Pendiente y en progreso cuentan como abiertos; vencido indica fecha superada.",
        "preguntas": ["Que compromisos estan vencidos", "Compromisos pendientes por actor"],
        "guia": [
            "Filtra por estado para separar lo abierto de lo cumplido.",
            "Ordena por fecha de vencimiento para priorizar la gestion.",
        ],
    },
    "/relacionamientos": {
        "titulo": "Relacionamiento",
        "que_muestra": "Interacciones registradas con actores: reunion, consulta, delegacion, acuerdo o participacion.",
        "como_leerlo": "El historial de interacciones alimenta el indice de calidad del relacionamiento.",
        "preguntas": ["Cuantos relacionamientos hay registrados", "Ultimas interacciones con un actor"],
        "guia": [
            "Registra cada interaccion para que el historial del actor quede completo.",
            "El tipo de interaccion importa: no es lo mismo informar que acordar.",
        ],
    },
    "/alertas": {
        "titulo": "Alertas",
        "que_muestra": "Alertas por riesgo de conflicto, cambio de posicion, tension, urgencia o vencimiento.",
        "como_leerlo": "El nivel critico exige atencion inmediata; informativo se puede planificar.",
        "preguntas": ["Que alertas criticas hay sin leer", "Por que se genero una alerta"],
        "guia": [
            "Atiende primero las criticas y marcalas como leidas cuando las gestiones.",
            "Cada alerta nace de una variable del actor; revisa su ficha para entenderla.",
        ],
    },
    "/protocolo": {
        "titulo": "Protocolo de relacionamiento",
        "que_muestra": "Pasos y criterios para interactuar con cada tipo de actor.",
        "como_leerlo": "Es una guia operativa, no una regla automatica.",
        "preguntas": ["Que dice el protocolo para un actor de alta relevancia"],
        "guia": ["Usa el protocolo como checklist antes de una reunion o una decision."],
    },
    "/reportes": {
        "titulo": "Reportes",
        "que_muestra": "Exportables de actores, matriz, compromisos y alertas.",
        "como_leerlo": "Los reportes usan los mismos indices que el dashboard.",
        "preguntas": ["Que reportes puedo descargar"],
        "guia": ["Descarga el reporte de la matriz para llevarlo a una mesa de trabajo."],
    },
}

_PAGINA_DEFECTO = "/dashboard"


def normalizar_ruta(ruta: Optional[str]) -> str:
    """Normaliza la ruta que envia el frontend a una clave conocida."""
    texto = (ruta or "").strip().lower()
    if not texto:
        return _PAGINA_DEFECTO
    if texto.startswith("/que-es-govstake"):
        return "/que-es-govstake"
    if not texto.startswith("/"):
        texto = "/" + texto
    if texto.endswith("/") and len(texto) > 1:
        texto = texto.rstrip("/")
    if texto in PAGINAS:
        return texto
    # Subrutas conocidas (por ejemplo /actores/12) se resuelven a su seccion.
    for clave in PAGINAS:
        if clave != "/" and texto.startswith(clave + "/"):
            return clave
    return _PAGINA_DEFECTO


def ficha_pagina(ruta: Optional[str]) -> Dict[str, object]:
    """Devuelve la descripcion de la pagina actual para el prompt."""
    return PAGINAS[normalizar_ruta(ruta)]


def acciones_de(destino: Optional[str]) -> List[Dict[str, str]]:
    """Acciones de navegacion seguras para un destino semantico."""
    clave = (destino or "").strip().lower()
    ruta = DESTINOS.get(clave)
    if not ruta and clave.startswith("/"):
        ruta = clave if clave in RUTAS else None
    if not ruta:
        return []
    return [{"etiqueta": f"Ver {RUTAS[ruta].lower()}", "ruta": ruta}]
