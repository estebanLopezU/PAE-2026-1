"""Herramientas (skills) de consulta de AgentGD para Interoperabilidad.

Solo lectura, argumentos validados y salida acotada. El modelo pide; el
backend consulta. No se envian correos ni telefonos al proveedor de IA.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

__all__ = ["ESQUEMAS", "NOMBRES", "Resultado", "ejecutar"]

from .contexto import NIVELES_MADUREZ, ultimas_evaluaciones


@dataclass
class Resultado:
    datos: Any
    acciones: List[Dict[str, str]] = field(default_factory=list)


DOMINIOS = {
    "legal": ("legal_domain_score", "Dominio Legal"),
    "organizacional": ("organizational_domain_score", "Dominio Organizacional"),
    "semantico": ("semantic_domain_score", "Dominio Semantico"),
    "tecnico": ("technical_domain_score", "Dominio Tecnico"),
}

CRITERIOS = {
    "has_api_documentation": "Documentacion de API",
    "uses_standard_protocols": "Protocolos estandar",
    "has_data_quality": "Calidad de datos",
    "has_security_standards": "Estandares de seguridad",
    "has_interoperability_policy": "Politica de interoperabilidad",
    "has_trained_personnel": "Personal capacitado",
}

ESTADOS_XROAD = {
    "connected": "Conectada",
    "pending": "Pendiente",
    "not_connected": "No conectada",
}

UMBRAL_BRECHA = 60.0


def _num(valor) -> float:
    try:
        return float(valor or 0)
    except (TypeError, ValueError):
        return 0.0


def _iso(valor) -> Optional[str]:
    if not valor:
        return None
    try:
        return valor.isoformat()[:10]
    except AttributeError:
        return str(valor)[:10]


def _nivel(valor: Optional[int]) -> str:
    return NIVELES_MADUREZ.get(int(valor or 0), "Sin evaluacion")


def _entidades(db) -> List:
    from sqlalchemy.orm import selectinload

    from ..models import Entity

    return (
        db.query(Entity)
        .options(selectinload(Entity.sector), selectinload(Entity.services))
        .filter(Entity.is_active == True)  # noqa: E712
        .all()
    )


def _evaluaciones(db) -> Dict[int, Any]:
    return {e.entity_id: e for e in ultimas_evaluaciones(db)}


def _publica(entidad, evaluacion=None) -> Dict[str, Any]:
    return {
        "id": entidad.id,
        "nombre": entidad.name,
        "sigla": entidad.acronym,
        "nit": entidad.nit,
        "sector": entidad.sector.name if entidad.sector else None,
        "departamento": entidad.department,
        "municipio": entidad.municipality,
        "estado_xroad": ESTADOS_XROAD.get(entidad.xroad_status, entidad.xroad_status),
        "servicios": len(entidad.services or []),
        "madurez": {
            "nivel": _nivel(evaluacion.overall_level) if evaluacion else None,
            "puntaje": evaluacion.overall_score if evaluacion else None,
        },
    }


def _buscar_entidad(db, args) -> Optional[Any]:
    from ..models import Entity

    entidad_id = args.get("entidad_id")
    nombre = (args.get("nombre") or "").strip()
    consulta = db.query(Entity).filter(Entity.is_active == True)  # noqa: E712

    entidad = None
    if entidad_id:
        entidad = consulta.filter(Entity.id == int(entidad_id)).first()
    if entidad is None and nombre:
        entidad = consulta.filter(Entity.name.ilike(f"%{nombre}%")).first()
    if entidad is None and nombre:
        entidad = consulta.filter(Entity.acronym.ilike(f"%{nombre}%")).first()
    if entidad is None and nombre:
        entidad = consulta.filter(Entity.nit == nombre).first()
    return entidad


def _evaluacion_de(db, entidad_id: int):
    from ..models import MaturityAssessment

    return (
        db.query(MaturityAssessment)
        .filter(MaturityAssessment.entity_id == entidad_id)
        .order_by(MaturityAssessment.id.desc())
        .first()
    )


def _recortar(texto, limite: int = 220) -> str:
    cadena = (texto or "").strip().replace("\n", " ")
    return cadena if len(cadena) <= limite else cadena[: limite - 1] + "…"


# ---------------------------------------------------------------------------
# Herramientas
# ---------------------------------------------------------------------------

def _resumen_interop(db, args):
    from .contexto import snapshot

    return Resultado(snapshot(db), [])


def _buscar_entidades(db, args):
    texto = (args.get("texto") or "").strip().lower()
    sector = (args.get("sector") or "").strip().lower()
    estado = (args.get("estado_xroad") or "").strip()
    nivel = args.get("nivel_madurez")
    limite = min(max(int(args.get("limite") or 10), 1), 25)

    evaluaciones = _evaluaciones(db)

    def coincide(e):
        if estado and e.xroad_status != estado:
            return False
        if sector and sector not in ((e.sector.name if e.sector else "") or "").lower():
            return False
        if nivel and (evaluaciones.get(e.id) is None or evaluaciones[e.id].overall_level != int(nivel)):
            return False
        if texto:
            campos = " ".join(
                str(v or "") for v in (e.name, e.acronym, e.nit, e.department, e.municipality)
            ).lower()
            return all(palabra in campos for palabra in texto.split())
        return True

    encontradas = [e for e in _entidades(db) if coincide(e)]
    encontradas.sort(
        key=lambda e: (evaluaciones.get(e.id).overall_score if evaluaciones.get(e.id) else -1),
        reverse=True,
    )
    encontradas = encontradas[:limite]

    return Resultado(
        {
            "total": len(encontradas),
            "criterios": {
                "texto": texto or None,
                "sector": sector or None,
                "estado_xroad": estado or None,
                "nivel_madurez": nivel,
            },
            "entidades": [_publica(e, evaluaciones.get(e.id)) for e in encontradas],
        },
        [{"etiqueta": "Ver entidades", "ruta": "/entidades"}],
    )


def _ficha_entidad(db, args):
    entidad = _buscar_entidad(db, args)
    if not entidad:
        return Resultado({"encontrado": False, "mensaje": "No existe una entidad activa con ese id, nombre, sigla o NIT."})

    evaluacion = _evaluacion_de(db, entidad.id)
    datos = _publica(entidad, evaluacion)
    datos.update(
        {
            "sitio_web": entidad.website,
            "direccion": entidad.address,
            "codigo_xroad": entidad.xroad_member_code,
            "fecha_conexion_xroad": _iso(entidad.xroad_connection_date),
            "responsable_cio": entidad.cio_name,
            "notas": _recortar(entidad.notes),
            "servicios_activos": len([s for s in (entidad.services or []) if s.status == "active"]),
            "dominios_madurez": {
                DOMINIOS[clave][1]: round(_num(getattr(evaluacion, DOMINIOS[clave][0])), 2)
                for clave in DOMINIOS
            } if evaluacion else None,
        }
    )
    return Resultado(
        datos,
        [{"etiqueta": "Ver ficha en Entidades", "ruta": "/entidades"}],
    )


def _servicios_entidad(db, args):
    entidad = _buscar_entidad(db, args)
    if not entidad:
        return Resultado({"encontrado": False, "mensaje": "No existe una entidad activa con ese id, nombre o sigla."})

    solo_activos = args.get("solo_activos", True)
    servicios = list(entidad.services or [])
    if solo_activos:
        servicios = [s for s in servicios if s.status == "active"]

    return Resultado(
        {
            "entidad": entidad.name,
            "total": len(servicios),
            "servicios": [
                {
                    "id": s.id,
                    "nombre": s.name,
                    "codigo": s.code,
                    "categoria": s.category,
                    "protocolo": s.protocol,
                    "estado": s.status,
                    "publico": s.is_public,
                    "estandar_datos": s.data_standard,
                    "estandar_semantico": s.semantic_standard,
                }
                for s in servicios[:40]
            ],
        },
        [{"etiqueta": "Ver matriz de servicios", "ruta": "/matriz"}],
    )


def _madurez_entidad(db, args):
    entidad = _buscar_entidad(db, args)
    if not entidad:
        return Resultado({"encontrado": False, "mensaje": "No existe una entidad activa con ese id, nombre o sigla."})

    evaluacion = _evaluacion_de(db, entidad.id)
    if not evaluacion:
        return Resultado(
            {
                "entidad": entidad.name,
                "evaluada": False,
                "mensaje": "La entidad no tiene evaluacion de madurez registrada.",
            },
            [{"etiqueta": "Ver evaluacion de madurez", "ruta": "/evaluacion"}],
        )

    dominios = {
        DOMINIOS[clave][1]: {
            "puntaje": round(_num(getattr(evaluacion, DOMINIOS[clave][0])), 2),
            "brecha": _num(getattr(evaluacion, DOMINIOS[clave][0])) < UMBRAL_BRECHA,
        }
        for clave in DOMINIOS
    }

    return Resultado(
        {
            "entidad": entidad.name,
            "evaluada": True,
            "nivel": _nivel(evaluacion.overall_level),
            "nivel_numero": evaluacion.overall_level,
            "puntaje_global": evaluacion.overall_score,
            "dominios": dominios,
            "criterios": {
                CRITERIOS[campo]: getattr(evaluacion, campo)
                for campo in CRITERIOS
            },
            "recomendaciones": _recortar(evaluacion.recommendations, 700),
            "fecha_evaluacion": _iso(evaluacion.assessment_date),
            "brechas_prioritarias": [
                nombre for nombre, datos in dominios.items() if datos["brecha"]
            ],
        },
        [{"etiqueta": "Ver evaluacion de madurez", "ruta": "/evaluacion"}],
    )


def _brechas_dominio(db, args):
    dominio = (args.get("dominio") or "todos").strip()
    evaluaciones = ultimas_evaluaciones(db)
    if not evaluaciones:
        return Resultado({"evaluaciones": 0, "mensaje": "No hay evaluaciones de madurez registradas."})

    entidades = {e.id: e for e in _entidades(db)}
    claves = list(DOMINIOS) if dominio == "todos" else [dominio]
    claves = [c for c in claves if c in DOMINIOS]
    if not claves:
        return Resultado({"error": "Dominio no valido. Usa legal, organizacional, semantico, tecnico o todos."})

    resumen = {}
    for clave in claves:
        campo, etiqueta = DOMINIOS[clave]
        puntajes = [(e, _num(getattr(e, campo))) for e in evaluaciones]
        con_datos = [(e, p) for e, p in puntajes if p > 0]
        promedio = round(sum(p for _, p in con_datos) / len(con_datos), 2) if con_datos else 0.0
        en_brecha = sorted(
            ((entidades[e.entity_id].name, p) for e, p in con_datos if p < UMBRAL_BRECHA and entidades.get(e.entity_id)),
            key=lambda x: x[1],
        )[:10]
        resumen[etiqueta] = {
            "promedio": promedio,
            "entidades_evaluadas": len(con_datos),
            "entidades_en_brecha": len([1 for _, p in con_datos if p < UMBRAL_BRECHA]),
            "umbral": UMBRAL_BRECHA,
            "casos_criticos": [{"entidad": n, "puntaje": p} for n, p in en_brecha],
        }

    return Resultado(
        {"dominios": resumen},
        [{"etiqueta": "Ver analisis de brechas", "ruta": "/analisis-ia"}],
    )


def _relaciones_entidad(db, args):
    from ..models import Relationship

    entidad = _buscar_entidad(db, args)
    if not entidad:
        return Resultado({"encontrado": False, "mensaje": "No existe una entidad activa con ese id, nombre o sigla."})

    relaciones = (
        db.query(Relationship)
        .filter((Relationship.source_id == entidad.id) | (Relationship.target_id == entidad.id))
        .limit(60)
        .all()
    )
    filas = []
    for r in relaciones:
        saliente = r.source_id == entidad.id
        contraparte = r.target if saliente else r.source
        filas.append(
            {
                "direccion": "consume" if saliente else "provee",
                "contraparte": contraparte.name if contraparte else None,
                "servicio": r.service.name if r.service else None,
                "protocolo": r.protocol,
                "estado": r.status,
                "descripcion": _recortar(r.description),
            }
        )

    return Resultado(
        {
            "entidad": entidad.name,
            "total": len(filas),
            "relaciones": filas,
            "lectura": (
                "'consume' significa que la entidad usa un servicio de la contraparte; "
                "'provee' significa que la contraparte consume un servicio de esta entidad."
            ),
        },
        [{"etiqueta": "Ver mapa de relaciones", "ruta": "/mapa"}],
    )


def _comparar_entidades(db, args):
    nombres = args.get("nombres") or []
    if isinstance(nombres, str):
        nombres = [nombres]

    encontradas, faltantes = [], []
    for nombre in nombres[:4]:
        entidad = _buscar_entidad(db, {"nombre": nombre})
        if not entidad:
            faltantes.append(nombre)
            continue
        evaluacion = _evaluacion_de(db, entidad.id)
        datos = _publica(entidad, evaluacion)
        datos["dominios"] = {
            DOMINIOS[clave][1]: round(_num(getattr(evaluacion, DOMINIOS[clave][0])), 2)
            for clave in DOMINIOS
        } if evaluacion else None
        encontradas.append(datos)

    if not encontradas:
        return Resultado({"encontradas": 0, "mensaje": "No encontre entidades con esos nombres."})

    return Resultado(
        {
            "encontradas": len(encontradas),
            "no_encontradas": faltantes,
            "entidades": encontradas,
            "recordatorio": (
                "Compara por dominio y por nivel. El nivel 4 (Avanzado) exige X-Road "
                "completo y estandares semanticos."
            ),
        },
        [{"etiqueta": "Ver entidades", "ruta": "/entidades"}],
    )


def _marco_mintic(db, args):
    tema = (args.get("tema") or "").strip().lower()
    contenido = {
        "dominios": {
            "Legal": "Normativa, acuerdos y politica de interoperabilidad que habilitan el intercambio.",
            "Organizacional": "Procesos, roles, governance y capacidad institucional para sostener el intercambio.",
            "Semantico": "Significado comun de los datos: vocabularios, estandares y calidad.",
            "Tecnico": "Infraestructura, APIs, protocolos y seguridad para conectar sistemas.",
        },
        "niveles": {
            "1 Inicial": "Sin estandares definidos.",
            "2 Basico": "APIs basicas, datos no estandarizados.",
            "3 Intermedio": "APIs REST, datos semiestructurados.",
            "4 Avanzado": "X-Road completo, estandares semanticos.",
        },
        "xroad": {
            "que_es": "Bus de interoperabilidad que conecta sistemas de entidades mediante servicios registrados y trazables.",
            "estados": "connected, pending y not_connected.",
            "servicios": "Cada servicio tiene codigo, protocolo, categoria y estandares de datos, semanticos y de seguridad.",
        },
        "carpeta_ciudadana": (
            "Servicio de los Servicios Ciudadanos Digitales que permite al ciudadano "
            "consultar y autorizar el uso de sus datos entre entidades."
        ),
        "portal_datos": "Portal de Datos Abiertos de Colombia: datasets publicos reutilizables.",
    }

    secciones = {k: v for k, v in contenido.items() if k in tema}
    if not secciones:
        sinonimos = {
            "legal": ["dominios"],
            "organizacional": ["dominios"],
            "semantico": ["dominios"],
            "tecnico": ["dominios"],
            "madurez": ["niveles"],
            "nivel": ["niveles"],
            "xroad": ["xroad"],
            "ciudadano": ["carpeta_ciudadana"],
            "datos": ["portal_datos"],
        }
        for palabra, destinos in sinonimos.items():
            if palabra in tema:
                secciones.update({d: contenido[d] for d in destinos})

    return Resultado(
        {"tema": tema or "general", "marco": secciones or contenido},
        [{"etiqueta": "Ver evaluacion de madurez", "ruta": "/evaluacion"}],
    )


def _navegar(db, args):
    from .navegacion import RUTAS, acciones_de, normalizar_ruta

    destino = (args.get("destino") or "").strip()
    acciones = acciones_de(destino)
    if not acciones:
        return Resultado({"navegacion": False, "mensaje": "Esa pantalla no existe en la plataforma."})
    ruta = acciones[0]["ruta"]
    return Resultado(
        {"navegacion": True, "ruta": ruta, "pantalla": RUTAS.get(ruta), "destino": normalizar_ruta(ruta)},
        acciones,
    )


# ---------------------------------------------------------------------------
# Registro
# ---------------------------------------------------------------------------

def _herramienta(nombre: str, descripcion: str, propiedades: Dict[str, Any], requeridos=None):
    return {
        "type": "function",
        "function": {
            "name": nombre,
            "description": descripcion,
            "parameters": {
                "type": "object",
                "properties": propiedades,
                "required": requeridos or [],
                "additionalProperties": False,
            },
        },
    }


_ID_ENTIDAD = {
    "entidad_id": {"type": "integer"},
    "nombre": {"type": "string", "description": "Nombre, sigla o NIT; admite coincidencia parcial."},
}

# Los destinos validos salen del mapa de navegacion: una sola fuente de verdad.
from .navegacion import DESTINOS as _DESTINOS_RUTAS  # noqa: E402

_DESTINOS_VALIDOS = sorted(_DESTINOS_RUTAS)

ESQUEMAS: List[Dict[str, Any]] = [
    _herramienta(
        "resumen_interop",
        "Panorama nacional: entidades, conexion a X-Road, servicios, madurez promedio, sectores y relaciones.",
        {},
    ),
    _herramienta(
        "buscar_entidades",
        "Busca entidades por texto, sector, estado X-Road o nivel de madurez.",
        {
            "texto": {"type": "string"},
            "sector": {"type": "string"},
            "estado_xroad": {"type": "string", "enum": ["connected", "pending", "not_connected"]},
            "nivel_madurez": {"type": "integer", "minimum": 1, "maximum": 4},
            "limite": {"type": "integer", "minimum": 1, "maximum": 25},
        },
    ),
    _herramienta(
        "ficha_entidad",
        "Ficha de una entidad: sector, territorio, X-Road, servicios y madurez.",
        _ID_ENTIDAD,
    ),
    _herramienta(
        "servicios_entidad",
        "Servicios publicados por una entidad, con categoria, protocolo y estandares.",
        {**_ID_ENTIDAD, "solo_activos": {"type": "boolean"}},
    ),
    _herramienta(
        "madurez_entidad",
        "Evaluacion de madurez de una entidad: nivel, cuatro dominios MinTIC, criterios, recomendaciones y brechas.",
        _ID_ENTIDAD,
    ),
    _herramienta(
        "brechas_dominio",
        "Agregado de brechas por dominio: promedio, entidades en brecha y casos criticos.",
        {
            "dominio": {
                "type": "string",
                "enum": ["todos", "legal", "organizacional", "semantico", "tecnico"],
            }
        },
    ),
    _herramienta(
        "relaciones_entidad",
        "Relaciones de interoperabilidad de una entidad: que consume y que provee, con protocolo y estado.",
        _ID_ENTIDAD,
    ),
    _herramienta(
        "comparar_entidades",
        "Compara de 2 a 4 entidades por nivel y por los cuatro dominios de madurez.",
        {
            "nombres": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 2,
                "maxItems": 4,
            }
        },
        ["nombres"],
    ),
    _herramienta(
        "marco_mintic",
        "Marco de interoperabilidad del MinTIC: dominios, niveles de madurez, X-Road, Carpeta Ciudadana y Datos Abiertos.",
        {"tema": {"type": "string"}},
    ),
    _herramienta(
        "navegar",
        "Devuelve la pantalla de la plataforma donde el usuario puede continuar. Usala cuando la respuesta termine en una accion concreta.",
        {
            "destino": {
                "type": "string",
                "enum": _DESTINOS_VALIDOS,
            }
        },
        ["destino"],
    ),
]

NOMBRES = {esquema["function"]["name"] for esquema in ESQUEMAS}

_EJECUTORES = {
    "resumen_interop": _resumen_interop,
    "buscar_entidades": _buscar_entidades,
    "ficha_entidad": _ficha_entidad,
    "servicios_entidad": _servicios_entidad,
    "madurez_entidad": _madurez_entidad,
    "brechas_dominio": _brechas_dominio,
    "relaciones_entidad": _relaciones_entidad,
    "comparar_entidades": _comparar_entidades,
    "marco_mintic": _marco_mintic,
    "navegar": _navegar,
}


def ejecutar(nombre: str, argumentos: Optional[str], db) -> Resultado:
    funcion = _EJECUTORES.get(nombre)
    if not funcion:
        return Resultado({"error": f"La herramienta '{nombre}' no existe."})

    if isinstance(argumentos, str):
        try:
            args = json.loads(argumentos) if argumentos.strip() else {}
        except json.JSONDecodeError:
            return Resultado({"error": "Los argumentos de la herramienta no son JSON valido."})
    elif isinstance(argumentos, dict):
        args = argumentos
    else:
        args = {}

    if not isinstance(args, dict):
        return Resultado({"error": "Los argumentos de la herramienta deben ser un objeto."})

    try:
        return funcion(db, args)
    except Exception as exc:  # noqa: BLE001
        return Resultado({"error": f"No se pudo completar la consulta: {exc}"})
