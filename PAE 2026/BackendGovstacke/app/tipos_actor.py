"""Vocabulario canonico de tipos de actor para GOVStake 360.

El PAE define doce tipos de actor y la sincronizacion de entidades publicas
agrega un decimotercero. La base de datos y el frontend habian crecido con
nombres distintos para el mismo tipo (``organizacion`` vs ``organizaciones``,
``concejo`` vs ``concejo_municipal``, ``medio_comunicacion`` vs ``medios``),
lo que dejaba tres filtros de la interfaz sin resultados.

Este modulo es la fuente unica: define el nombre canonico que se guarda en la
base, la etiqueta legible, el protocolo de participacion asociado y los alias
que se aceptan al filtrar. Asi el contrato no se rompe (se siguen aceptando los
nombres viejos) y la interfaz deja de ofrecer tipos que no existen.
"""

from typing import Dict, List, Optional

__all__ = [
    "TIPOS_ACTOR",
    "ALIAS_A_CANONICO",
    "normalizar_tipo",
    "etiqueta_tipo",
    "listar_tipos",
    "claves_canonicas",
]

# clave: nombre canonico almacenado en la base de datos.
# protocolo: clave del protocolo de participacion (app/api/v1/endpoints/protocolo.py).
TIPOS_ACTOR: List[Dict[str, object]] = [
    {
        "clave": "ciudadania",
        "nombre": "Ciudadania",
        "protocolo": "ciudadania",
        "alias": ["ciudadanos", "comunidad", "comunidad_local"],
    },
    {
        "clave": "organizaciones",
        "nombre": "Organizaciones sociales",
        "protocolo": "organizacion",
        "alias": ["organizacion", "jac", "asociaciones"],
    },
    {
        "clave": "veeduria",
        "nombre": "Veedurias ciudadanas",
        "protocolo": "veeduria",
        "alias": ["veedurias", "veeduria_ciudadana"],
    },
    {
        "clave": "concejo_municipal",
        "nombre": "Concejo municipal",
        "protocolo": "concejo",
        "alias": ["concejo", "concejos", "corporacion_publica"],
    },
    {
        "clave": "servidor_publico",
        "nombre": "Servidores publicos",
        "protocolo": "servidor_publico",
        "alias": ["servidores_publicos", "funcionario"],
    },
    {
        "clave": "empresa",
        "nombre": "Empresas y sector privado",
        "protocolo": "empresa",
        "alias": ["empresas", "sector_privado", "empresa_servicios_publicos"],
    },
    {
        "clave": "medios",
        "nombre": "Medios de comunicacion",
        "protocolo": "medio_comunicacion",
        "alias": ["medio_comunicacion", "medios_comunicacion", "prensa"],
    },
    {
        "clave": "universidad",
        "nombre": "Universidades y centros de investigacion",
        "protocolo": "universidad",
        "alias": ["universidades", "academia", "centro_investigacion"],
    },
    {
        "clave": "entidad_control",
        "nombre": "Entidades de control",
        "protocolo": "entidad_control",
        "alias": ["entidades_control", "contraloria", "procuraduria"],
    },
    {
        "clave": "cooperacion",
        "nombre": "Cooperacion internacional",
        "protocolo": "cooperacion",
        "alias": ["cooperacion_internacional", "cooperantes"],
    },
    {
        "clave": "gobierno_local",
        "nombre": "Gobierno local",
        "protocolo": "gobierno_local",
        "alias": ["alcaldia", "municipio", "entidad_territorial"],
    },
    {
        "clave": "gobierno_departamental",
        "nombre": "Gobierno departamental",
        "protocolo": "gobierno_departamental",
        "alias": ["gobernacion", "departamento"],
    },
    {
        "clave": "entidad_publica",
        "nombre": "Entidad publica (sincronizada)",
        "protocolo": "entidad_publica",
        "alias": ["entidades_publicas", "sincronizada"],
    },
]

ALIAS_A_CANONICO: Dict[str, str] = {}
for _tipo in TIPOS_ACTOR:
    ALIAS_A_CANONICO[str(_tipo["clave"])] = str(_tipo["clave"])
    for _alias in _tipo["alias"]:
        ALIAS_A_CANONICO[str(_alias)] = str(_tipo["clave"])
del _tipo, _alias


def normalizar_tipo(tipo: Optional[str]) -> Optional[str]:
    """Devuelve el nombre canonico del tipo (o el valor original si no existe)."""
    if not tipo:
        return None
    clave = str(tipo).strip().lower()
    return ALIAS_A_CANONICO.get(clave, clave)


def etiqueta_tipo(tipo: Optional[str]) -> str:
    """Etiqueta legible del tipo canonico."""
    clave = normalizar_tipo(tipo)
    for item in TIPOS_ACTOR:
        if item["clave"] == clave:
            return str(item["nombre"])
    return str(tipo or "")


def claves_canonicas() -> List[str]:
    """Lista de tipos que realmente se almacenan en la base de datos."""
    return [str(item["clave"]) for item in TIPOS_ACTOR]


def listar_tipos() -> List[Dict[str, object]]:
    """Lista de tipos con su etiqueta y su protocolo (para la API y la interfaz)."""
    return [
        {
            "clave": item["clave"],
            "nombre": item["nombre"],
            "protocolo": item["protocolo"],
            "alias": list(item["alias"]),
        }
        for item in TIPOS_ACTOR
    ]
