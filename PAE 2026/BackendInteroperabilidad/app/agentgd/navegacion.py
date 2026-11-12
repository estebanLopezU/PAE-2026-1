"""Mapa de navegacion y guia de paginas para AgentGD (Interoperabilidad).

El backend es la fuente unica de rutas: el frontend solo dibuja las acciones
que llegan en la respuesta.
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


RUTAS = {
    "/dashboard": "Dashboard de interoperabilidad",
    "/entidades": "Entidades",
    "/matriz": "Matriz de servicios",
    "/mapa": "Mapa interactivo",
    "/evaluacion": "Evaluacion de madurez",
    "/reportes": "Reportes",
    "/analisis-ia": "Analisis con IA",
    "/auditoria-seguridad": "Auditoria de seguridad",
}


DESTINOS = {
    "dashboard": "/dashboard",
    "inicio": "/dashboard",
    "entidades": "/entidades",
    "entidad": "/entidades",
    "matriz": "/matriz",
    "servicios": "/matriz",
    "mapa": "/mapa",
    "geografia": "/mapa",
    "evaluacion": "/evaluacion",
    "madurez": "/evaluacion",
    "reportes": "/reportes",
    "analisis": "/analisis-ia",
    "analisis_ia": "/analisis-ia",
    "brechas": "/analisis-ia",
    "auditoria": "/auditoria-seguridad",
    "seguridad": "/auditoria-seguridad",
}


PAGINAS: Dict[str, Dict[str, object]] = {
    "/dashboard": {
        "titulo": "Dashboard de interoperabilidad",
        "que_muestra": (
            "Indicadores nacionales: entidades activas, conectadas a X-Road, "
            "servicios publicados, madurez promedio y distribucion por sector."
        ),
        "como_leerlo": (
            "La tasa de conexion es entidades conectadas sobre entidades activas. "
            "La madurez promedio va de 1 (Inicial) a 4 (Avanzado). Una entidad "
            "sin evaluacion no entra en el promedio."
        ),
        "preguntas": [
            "Dame el panorama nacional de interoperabilidad",
            "Cuales son las entidades con mayor madurez",
            "Que sectores estan mas atrasados",
        ],
        "guia": [
            "Mira primero la tasa de conexion: indica cuantas entidades ya estan en X-Road.",
            "Revisa la madurez promedio: mide que tan preparadas estan las entidades.",
            "Baja al mapa y a la matriz para pasar del panorama al detalle.",
        ],
    },
    "/entidades": {
        "titulo": "Entidades",
        "que_muestra": (
            "Catalogo de entidades publicas con NIT, sector, territorio, estado de "
            "conexion a X-Road, servicios publicados y nivel de madurez."
        ),
        "como_leerlo": (
            "Estados de X-Road: connected (conectada), pending (en tramite) y "
            "not_connected (sin conexion). El nivel de madurez va de 1 a 4."
        ),
        "preguntas": [
            "Busca la entidad con NIT o nombre",
            "Que entidades estan pendientes de conexion",
            "Muestrame la ficha de una entidad",
        ],
        "guia": [
            "Usa el buscador por nombre, sigla o NIT.",
            "Filtra por estado X-Road para ver la brecha de conexion.",
            "Abre la ficha para revisar servicios y evaluacion de madurez.",
        ],
    },
    "/matriz": {
        "titulo": "Matriz de servicios",
        "que_muestra": "Servicios publicados por entidad, protocolo, categoria y estado.",
        "como_leerlo": (
            "Un servicio activo esta disponible para consumo; desarrollo e inactivo "
            "no cuentan para la oferta vigente. El protocolo X-Road indica publicacion "
            "en el bus nacional."
        ),
        "preguntas": [
            "Cuantos servicios activos hay por protocolo",
            "Que servicios ofrece una entidad",
        ],
        "guia": [
            "Filtra por protocolo para ver la adopcion de X-Road frente a REST y SOAP.",
            "Revisa las categorias: consulta, validacion y tramite son las mas comunes.",
        ],
    },
    "/mapa": {
        "titulo": "Mapa interactivo",
        "que_muestra": "Ubicacion de entidades y servicios, y relaciones de interoperabilidad.",
        "como_leerlo": "Cada punto es una entidad; el color refleja su estado o su madurez.",
        "preguntas": ["Que entidades hay en un departamento", "Como se conectan dos entidades"],
        "guia": [
            "Usa el mapa para detectar concentracion territorial.",
            "Activa las relaciones para ver quien consume servicios de quien.",
        ],
    },
    "/evaluacion": {
        "titulo": "Evaluacion de madurez",
        "que_muestra": (
            "Evaluaciones por entidad con los cuatro dominios del Marco MinTIC "
            "(legal, organizacional, semantico y tecnico), nivel global y criterios."
        ),
        "como_leerlo": (
            "Cada dominio se puntua de 0 a 100. El nivel global va de 1 Inicial a "
            "4 Avanzado. Un dominio bajo 60 es una brecha prioritaria."
        ),
        "preguntas": [
            "Cual es la madurez de una entidad",
            "Que brechas tiene una entidad en el dominio tecnico",
            "En que nivel esta el promedio nacional",
        ],
        "guia": [
            "Revisa el radar de los cuatro dominios: muestra el balance de la entidad.",
            "Los dominios mas bajos son las brechas que conviene priorizar.",
            "Compara entidades del mismo sector para tener una referencia justa.",
        ],
    },
    "/reportes": {
        "titulo": "Reportes",
        "que_muestra": "Exportables de entidades, servicios, madurez y brechas.",
        "como_leerlo": "Los reportes usan las mismas fuentes que el dashboard.",
        "preguntas": ["Que reportes puedo descargar"],
        "guia": ["Descarga el reporte de madurez para una mesa tecnica."],
    },
    "/analisis-ia": {
        "titulo": "Analisis con IA",
        "que_muestra": "Analisis de APIs, validacion semantica y analisis de brechas asistidos por IA.",
        "como_leerlo": "Los resultados son sugerencias: requieren revision tecnica antes de decidir.",
        "preguntas": ["Como funciona el analisis de brechas", "Que mide la validacion semantica"],
        "guia": [
            "Ejecuta el analisis de brechas para ver el agregado por dominio.",
            "La validacion semantica revisa consistencia de nombres y estandares.",
        ],
    },
    "/auditoria-seguridad": {
        "titulo": "Auditoria de seguridad",
        "que_muestra": (
            "Registro de accesos, inicios de sesion y eventos de seguridad de la plataforma."
        ),
        "como_leerlo": (
            "Cada fila es un evento: usuario, fecha, accion y resultado. Sirve para "
            "evidenciar trazabilidad, no para analisis funcional."
        ),
        "preguntas": ["Como reviso quien ingreso a la plataforma"],
        "guia": ["Filtra por resultado fallido para detectar intentos repetidos."],
    },
}

_PAGINA_DEFECTO = "/dashboard"


def normalizar_ruta(ruta: Optional[str]) -> str:
    texto = (ruta or "").strip().lower()
    if not texto:
        return _PAGINA_DEFECTO
    if not texto.startswith("/"):
        texto = "/" + texto
    if texto != "/" and texto.endswith("/"):
        texto = texto.rstrip("/")
    if texto in PAGINAS:
        return texto
    for clave in PAGINAS:
        if texto.startswith(clave + "/"):
            return clave
    return _PAGINA_DEFECTO


def ficha_pagina(ruta: Optional[str]) -> Dict[str, object]:
    return PAGINAS[normalizar_ruta(ruta)]


def acciones_de(destino: Optional[str]) -> List[Dict[str, str]]:
    clave = (destino or "").strip().lower()
    ruta = DESTINOS.get(clave)
    if not ruta and clave.startswith("/"):
        ruta = clave if clave in RUTAS else None
    if not ruta:
        return []
    etiqueta = "Ver dashboard" if ruta == "/dashboard" else f"Ver {RUTAS[ruta].lower()}"
    return [{"etiqueta": etiqueta, "ruta": ruta}]
