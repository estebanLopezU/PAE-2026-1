"""Herramientas (skills) de consulta de AgentGD para GOVStake 360.

Cada herramienta es de solo lectura, valida sus argumentos y devuelve datos
acotados. El modelo pide; el backend consulta. Nunca se envia la base de
datos completa al proveedor de IA y nunca se exponen correos ni telefonos.

El registro tiene dos partes:

* ``ESQUEMAS``: descripcion JSON Schema que se envia al modelo.
* ``ejecutar``: funcion que resuelve la peticion contra la base de datos.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

__all__ = ["ESQUEMAS", "NOMBRES", "Resultado", "ejecutar", "error_como_texto"]


@dataclass
class Resultado:
    """Salida de una herramienta: datos para el modelo y acciones para la UI."""

    datos: Any
    acciones: List[Dict[str, str]] = field(default_factory=list)


TIPO_LABELS = {
    "ciudadania": "Ciudadania",
    "organizaciones": "Organizaciones sociales",
    "veeduria": "Veedurias",
    "concejo_municipal": "Concejo municipal",
    "servidor_publico": "Servidores publicos",
    "empresa": "Empresas / sector privado",
    "medios": "Medios de comunicacion",
    "universidad": "Universidades",
    "entidad_control": "Entidades de control",
    "cooperacion": "Cooperacion internacional",
    "gobierno_local": "Gobierno local",
    "gobierno_departamental": "Gobierno departamental",
    "entidad_publica": "Entidad publica sincronizada",
}

PRIORIDAD_LABELS = {
    "prioridad_alta": "Prioridad alta",
    "prioridad_media": "Prioridad media",
    "prioridad_baja": "Prioridad baja",
    "monitoreo": "Monitoreo",
}

GRUPO_LABELS = {
    "definitivo": "Definitivo",
    "expectante": "Expectante",
    "latente": "Latente",
    "no_relevante": "No relevante",
}


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def _iso(valor) -> Optional[str]:
    if not valor:
        return None
    try:
        return valor.isoformat()[:10]
    except AttributeError:
        return str(valor)[:10]


def _num(valor) -> float:
    try:
        return float(valor or 0)
    except (TypeError, ValueError):
        return 0.0


def _etiqueta_tipo(clave: Optional[str]) -> str:
    return TIPO_LABELS.get(clave or "", (clave or "sin clasificar").replace("_", " "))


def _cargar(db) -> List[Dict[str, Any]]:
    from ..models import Actor
    from ..api.v1.endpoints._helpers import actor_query, actor_to_dict

    return [
        actor_to_dict(a)
        for a in actor_query(db).filter(Actor.is_active == True).all()  # noqa: E712
    ]


def _mitchell(d: Dict[str, Any]) -> Dict[str, Any]:
    return d.get("mitchell") or {}


def _publico(d: Dict[str, Any]) -> Dict[str, Any]:
    """Resumen de un actor sin datos personales de contacto."""
    m = _mitchell(d)
    expresion = m.get("expresion_sugerida") or {}
    return {
        "id": d["id"],
        "nombre": d["nombre"],
        "tipo": _etiqueta_tipo(d.get("tipo")),
        "institucion": d.get("institucion"),
        "departamento": d.get("departamento"),
        "municipio": d.get("municipio"),
        "es_interno": d.get("es_interno"),
        "indice_priorizacion": d.get("indice_priorizacion"),
        "nivel_prioridad": PRIORIDAD_LABELS.get(d.get("nivel_prioridad"), d.get("nivel_prioridad")),
        "indice_relacionamiento": d.get("indice_relacionamiento"),
        "mitchell": {
            "identificacion": m.get("etiqueta"),
            "grupo": GRUPO_LABELS.get(m.get("grupo"), m.get("grupo")),
            "plu": m.get("plu"),
            "niveles": m.get("niveles"),
            "relevancia_calculada": m.get("relevancia_calculada"),
            "rango": m.get("rango_etiqueta"),
            "frecuencia_nivel": m.get("frecuencia_nivel"),
            "sin_percepcion": m.get("sin_percepcion"),
            "accion_sugerida": m.get("accion_sugerida"),
            "expresion_sugerida": {
                "nombre": expresion.get("nombre"),
                "regla": expresion.get("regla"),
                "confianza": expresion.get("confianza"),
            },
        },
    }


def _buscar_uno(db, args: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Busca un actor por id o por nombre (coincidencia parcial)."""
    from ..models import Actor
    from ..api.v1.endpoints._helpers import actor_query, actor_to_dict

    actor_id = args.get("actor_id")
    nombre = (args.get("nombre") or "").strip()

    consulta = actor_query(db).filter(Actor.is_active == True)  # noqa: E712
    actor = None
    if actor_id:
        actor = consulta.filter(Actor.id == int(actor_id)).first()
    if actor is None and nombre:
        actor = consulta.filter(Actor.nombre.ilike(f"%{nombre}%")).first()
    if actor is None and nombre:
        actor = consulta.filter(Actor.institucion.ilike(f"%{nombre}%")).first()
    return actor_to_dict(actor) if actor else None


def _ficha(db, d: Dict[str, Any]) -> Dict[str, Any]:
    from ..models import Alerta, Compromiso, Relacionamiento

    base = _publico(d)
    v = d.get("variables") or {}
    base["variables"] = {
        clave: round(_num(v.get(clave)), 2)
        for clave in (
            "poder",
            "legitimidad",
            "influencia",
            "interes",
            "dependencia",
            "capacidad_movilizacion",
            "posicion",
            "historial_participacion",
            "riesgo_conflicto",
            "canales_relacionamiento",
            "urgencia",
            "frecuencia_intentos",
        )
    } if v else None
    base["evaluado_por"] = v.get("evaluado_por") if v else None
    base["evaluado_en"] = _iso(v.get("evaluado_en")) if v else None
    base["ponderacion_propia"] = bool((_mitchell(d) or {}).get("ponderacion_propia"))

    compromisos = (
        db.query(Compromiso)
        .filter(Compromiso.actor_id == d["id"])
        .order_by(Compromiso.fecha_vencimiento.asc().nullslast())
        .limit(8)
        .all()
    )
    base["compromisos"] = [
        {
            "id": c.id,
            "titulo": c.titulo,
            "estado": c.estado,
            "prioridad": c.prioridad,
            "vence": _iso(c.fecha_vencimiento),
        }
        for c in compromisos
    ]

    alertas = (
        db.query(Alerta)
        .filter(Alerta.actor_id == d["id"])
        .order_by(Alerta.created_at.desc())
        .limit(8)
        .all()
    )
    base["alertas"] = [
        {
            "id": a.id,
            "tipo": a.tipo,
            "titulo": a.titulo,
            "nivel": a.nivel,
            "leida": a.leida,
        }
        for a in alertas
    ]

    base["relacionamientos"] = (
        db.query(Relacionamiento).filter(Relacionamiento.actor_id == d["id"]).count()
    )
    return base


def _recortar(texto, limite: int = 180) -> str:
    cadena = (texto or "").strip().replace("\n", " ")
    return cadena if len(cadena) <= limite else cadena[: limite - 1] + "…"


# ---------------------------------------------------------------------------
# Herramientas
# ---------------------------------------------------------------------------

def _resumen_ejecutivo(db, args):
    from .contexto import snapshot

    return Resultado(snapshot(db), [])


def _buscar_actores(db, args):
    datos = _cargar(db)
    texto = (args.get("texto") or "").strip().lower()
    tipo = (args.get("tipo") or "").strip()
    prioridad = (args.get("prioridad") or "").strip()
    solo_valorados = args.get("solo_valorados", True)
    limite = min(max(int(args.get("limite") or 10), 1), 20)

    def coincide(d):
        if solo_valorados and not d.get("variables"):
            return False
        if tipo and d.get("tipo") != tipo:
            return False
        if prioridad and d.get("nivel_prioridad") != prioridad:
            return False
        if texto:
            campos = " ".join(
                str(d.get(c) or "")
                for c in ("nombre", "institucion", "tipo", "departamento", "municipio", "acronimo")
            ).lower()
            return all(palabra in campos for palabra in texto.split())
        return True

    encontrados = sorted(
        (d for d in datos if coincide(d)),
        key=lambda d: d.get("indice_priorizacion") or 0,
        reverse=True,
    )[:limite]

    return Resultado(
        {
            "total": len(encontrados),
            "criterios": {
                "texto": texto or None,
                "tipo": tipo or None,
                "prioridad": prioridad or None,
                "solo_valorados": solo_valorados,
            },
            "actores": [_publico(d) for d in encontrados],
        },
        [{"etiqueta": "Ver actores", "ruta": "/actores"}],
    )


def _ficha_actor(db, args):
    d = _buscar_uno(db, args)
    if not d:
        return Resultado({"encontrado": False, "mensaje": "No existe un actor activo con ese id o nombre."})
    return Resultado(
        _ficha(db, d),
        [{"etiqueta": "Ver ficha en Actores", "ruta": "/actores"}],
    )


def _explicar_priorizacion(db, args):
    d = _buscar_uno(db, args)
    if not d:
        return Resultado({"encontrado": False, "mensaje": "No existe un actor activo con ese id o nombre."})

    m = _mitchell(d)
    niveles = m.get("niveles") or {}
    pesos = m.get("pesos_aplicados") or {}
    puntos = {
        clave: round(_num(niveles.get(clave)) * _num(pesos.get(clave)), 3)
        for clave in ("poder", "legitimidad", "urgencia")
    }
    v = d.get("variables") or {}

    datos = {
        "actor": {"id": d["id"], "nombre": d["nombre"], "tipo": _etiqueta_tipo(d.get("tipo"))},
        "relevancia_mitchell": {
            "atributos_del_doctorado": ["poder", "legitimidad", "urgencia"],
            "niveles_0_a_3": niveles,
            "pesos": pesos,
            "puntos_por_atributo": puntos,
            "relevancia_0_a_3": m.get("relevancia_calculada"),
            "rango": m.get("rango_etiqueta"),
            "identificacion": m.get("etiqueta"),
            "estado": m.get("estado"),
            "plu": m.get("plu"),
            "frecuencia_nivel": m.get("frecuencia_nivel"),
            "expresion_sugerida": (m.get("expresion_sugerida") or {}).get("nombre"),
        },
        "indice_priorizacion_pae": {
            "variables_0_a_100": {
                "poder": round(_num(v.get("poder")), 2),
                "legitimidad": round(_num(v.get("legitimidad")), 2),
                "influencia": round(_num(v.get("influencia")), 2),
                "interes": round(_num(v.get("interes")), 2),
            },
            "formula": "0,25 * poder + 0,25 * legitimidad + 0,25 * influencia + 0,25 * interes",
            "resultado": d.get("indice_priorizacion"),
            "nivel": PRIORIDAD_LABELS.get(d.get("nivel_prioridad")),
        },
        "advertencia": (
            "El indice de priorizacion del PAE y la relevancia de Mitchell son medidas "
            "distintas: el primero pondera cuatro variables en escala 0-100; la segunda "
            "usa tres atributos en escala ordinal 0-3 y es la del doctorado."
        ),
    }
    if m.get("sin_percepcion"):
        datos["sin_percepcion_del_lider"] = (
            "El actor tiene variables registradas pero poder, legitimidad y urgencia estan "
            "en nivel nula. No se le asigna expresion de liderazgo."
        )

    return Resultado(
        datos,
        [
            {"etiqueta": "Ver matriz", "ruta": "/matriz"},
            {"etiqueta": "Ver modelo teorico", "ruta": "/modelo"},
        ],
    )


def _listar_compromisos(db, args):
    from ..models import Actor, Compromiso

    consulta = db.query(Compromiso).join(Actor, Actor.id == Compromiso.actor_id)
    estado = (args.get("estado") or "").strip()
    actor = (args.get("actor") or "").strip()
    solo_vencidos = bool(args.get("solo_vencidos"))
    limite = min(max(int(args.get("limite") or 20), 1), 40)

    if estado:
        consulta = consulta.filter(Compromiso.estado == estado)
    if actor:
        consulta = consulta.filter(Actor.nombre.ilike(f"%{actor}%"))
    if solo_vencidos:
        from sqlalchemy import func

        consulta = consulta.filter(
            Compromiso.fecha_vencimiento.isnot(None),
            Compromiso.fecha_vencimiento < func.now(),
            Compromiso.estado.notin_(("cumplido", "vencido")),
        )

    filas = consulta.order_by(Compromiso.fecha_vencimiento.asc().nullslast()).limit(limite).all()
    return Resultado(
        {
            "total": len(filas),
            "filtros": {"estado": estado or None, "actor": actor or None, "solo_vencidos": solo_vencidos},
            "compromisos": [
                {
                    "id": c.id,
                    "titulo": c.titulo,
                    "estado": c.estado,
                    "prioridad": c.prioridad,
                    "actor": c.actor.nombre if c.actor else None,
                    "vence": _iso(c.fecha_vencimiento),
                }
                for c in filas
            ],
        },
        [{"etiqueta": "Ver compromisos", "ruta": "/compromisos"}],
    )


def _listar_alertas(db, args):
    from sqlalchemy.orm import joinedload

    from ..models import Alerta

    consulta = db.query(Alerta).options(joinedload(Alerta.actor))
    nivel = (args.get("nivel") or "").strip()
    actor = (args.get("actor") or "").strip()
    solo_no_leidas = args.get("solo_no_leidas", True)
    limite = min(max(int(args.get("limite") or 20), 1), 40)

    if nivel:
        consulta = consulta.filter(Alerta.nivel == nivel)
    if solo_no_leidas:
        consulta = consulta.filter(Alerta.leida == False)  # noqa: E712
    filas = consulta.order_by(Alerta.created_at.desc()).limit(limite * 3).all()
    if actor:
        filas = [a for a in filas if a.actor and actor.lower() in a.actor.nombre.lower()][:limite]
    else:
        filas = filas[:limite]

    return Resultado(
        {
            "total": len(filas),
            "filtros": {"nivel": nivel or None, "actor": actor or None, "solo_no_leidas": solo_no_leidas},
            "alertas": [
                {
                    "id": a.id,
                    "tipo": a.tipo,
                    "titulo": a.titulo,
                    "nivel": a.nivel,
                    "leida": a.leida,
                    "actor": a.actor.nombre if a.actor else None,
                    "fecha": _iso(a.created_at),
                }
                for a in filas
            ],
        },
        [{"etiqueta": "Ver alertas", "ruta": "/alertas"}],
    )


def _listar_relacionamientos(db, args):
    from sqlalchemy.orm import joinedload

    from ..models import Relacionamiento

    consulta = db.query(Relacionamiento).options(joinedload(Relacionamiento.actor))
    tipo = (args.get("tipo") or "").strip()
    actor = (args.get("actor") or "").strip()
    limite = min(max(int(args.get("limite") or 15), 1), 40)

    if tipo:
        consulta = consulta.filter(Relacionamiento.tipo == tipo)
    filas = consulta.order_by(Relacionamiento.created_at.desc()).limit(limite * 3).all()
    if actor:
        filas = [r for r in filas if r.actor and actor.lower() in r.actor.nombre.lower()][:limite]
    else:
        filas = filas[:limite]

    return Resultado(
        {
            "total": len(filas),
            "filtros": {"tipo": tipo or None, "actor": actor or None},
            "relacionamientos": [
                {
                    "id": r.id,
                    "tipo": r.tipo,
                    "actor": r.actor.nombre if r.actor else None,
                    "descripcion": _recortar(r.descripcion),
                    "resultado": _recortar(r.resultado),
                    "fecha": _iso(r.fecha),
                }
                for r in filas
            ],
        },
        [{"etiqueta": "Ver relacionamiento", "ruta": "/relacionamientos"}],
    )


def _estado_mitchell(db, args):
    datos = [d for d in _cargar(db) if d.get("variables")]
    grupos: Dict[str, int] = {}
    identificaciones: Dict[str, int] = {}
    for d in datos:
        m = _mitchell(d)
        grupos[m.get("grupo") or "sin_dato"] = grupos.get(m.get("grupo") or "sin_dato", 0) + 1
        identificaciones[m.get("etiqueta") or "sin_dato"] = (
            identificaciones.get(m.get("etiqueta") or "sin_dato", 0) + 1
        )

    definitivos = sorted(
        (d for d in datos if _mitchell(d).get("grupo") == "definitivo"),
        key=lambda d: _mitchell(d).get("relevancia_calculada") or 0,
        reverse=True,
    )
    sin_percepcion = sum(1 for d in datos if _mitchell(d).get("sin_percepcion"))

    return Resultado(
        {
            "actores_valorados": len(datos),
            "por_grupo": {GRUPO_LABELS.get(k, k): v for k, v in grupos.items()},
            "por_identificacion": identificaciones,
            "definitivos": [
                {
                    "id": d["id"],
                    "nombre": d["nombre"],
                    "plu": _mitchell(d).get("plu"),
                    "relevancia": _mitchell(d).get("relevancia_calculada"),
                    "rango": _mitchell(d).get("rango_etiqueta"),
                }
                for d in definitivos[:20]
            ],
            "sin_percepcion_del_lider": sin_percepcion,
            "recordatorio": (
                "El estado depende de cuantos atributos posee el actor (latente 1, "
                "expectante 2, definitivo 3); la identificacion depende de cuales posee."
            ),
        },
        [{"etiqueta": "Ver clasificacion Mitchell", "ruta": "/mitchell"}],
    )


def _comparar_actores(db, args):
    nombres = args.get("nombres") or []
    if isinstance(nombres, str):
        nombres = [nombres]
    encontrados = []
    faltantes = []
    for nombre in nombres[:4]:
        d = _buscar_uno(db, {"nombre": nombre})
        if d:
            encontrados.append(_publico(d))
        else:
            faltantes.append(nombre)

    if not encontrados:
        return Resultado({"encontrados": 0, "mensaje": "No encontre actores con esos nombres."})

    return Resultado(
        {
            "encontrados": len(encontrados),
            "no_encontrados": faltantes,
            "actores": encontrados,
            "sugerencia": (
                "Compara por indice de priorizacion (escala 0-100), relevancia de Mitchell "
                "(0-3) y nivel de cada atributo; no son la misma medida."
            ),
        },
        [{"etiqueta": "Ver matriz", "ruta": "/matriz"}],
    )


def _top_actores(db, args):
    criterio = (args.get("criterio") or "indice").strip()
    limite = min(max(int(args.get("limite") or 10), 1), 20)
    datos = [d for d in _cargar(db) if d.get("variables")]

    llaves = {
        "indice": lambda d: d.get("indice_priorizacion") or 0,
        "relevancia": lambda d: _mitchell(d).get("relevancia_calculada") or 0,
        "influencia": lambda d: _num((d.get("variables") or {}).get("influencia")),
        "urgencia": lambda d: _num((d.get("variables") or {}).get("urgencia")),
        "riesgo": lambda d: _num((d.get("variables") or {}).get("riesgo_conflicto")),
        "relacionamiento": lambda d: d.get("indice_relacionamiento") or 0,
    }
    if criterio not in llaves:
        criterio = "indice"

    ranking = sorted(datos, key=llaves[criterio], reverse=True)[:limite]
    return Resultado(
        {
            "criterio": criterio,
            "actores": [
                {
                    "id": d["id"],
                    "nombre": d["nombre"],
                    "tipo": _etiqueta_tipo(d.get("tipo")),
                    "valor": round(llaves[criterio](d), 2),
                    "indice_priorizacion": d.get("indice_priorizacion"),
                    "relevancia_mitchell": _mitchell(d).get("relevancia_calculada"),
                }
                for d in ranking
            ],
        },
        [{"etiqueta": "Ver matriz", "ruta": "/matriz"}],
    )


def _buscar_en_fundamentos(db, args):
    from ..modelo import (
        EXPRESIONES,
        ORDEN_EXPRESIONES,
        RANGOS,
        resumen_procedimiento,
        resumen_slx,
        resumen_teoria,
    )
    from ..modelo.escala import descripcion_escala

    tema = (args.get("tema") or "").strip().lower()
    completo = resumen_teoria()

    secciones = {
        "plu": {
            "que_es": "Codigo de tres digitos (poder, legitimidad, urgencia) en escala 0-3. Hay 64 combinaciones.",
            "identificacion": {
                "000": "Nulo", "100": "Inactivo", "010": "Discrecional", "001": "Demandante",
                "110": "Dominante", "101": "Peligroso", "011": "Dependiente", "111": "Definitivo",
            },
            "estados": {"1 atributo": "Latente", "2 atributos": "Expectante", "3 atributos": "Definitivo"},
        },
        "escala": descripcion_escala(),
        "ponderacion": {
            "pesos_tesis": completo["pesos"],
            "puntos": completo["puntos_ponderacion"],
            "nota": (
                "Los pesos impresos (13/30, 10/30, 7/30) reproducen los 64 casos de las "
                "Tablas 4.4 y 4.5. La nota al pie 39 del documento declara otra cifra; "
                "la discrepancia esta documentada."
            ),
        },
        "relevancia": {
            "formula": "P*13/30 + L*10/30 + U*7/30 (escala 0-3)",
            "rangos": RANGOS,
        },
        "expresiones": {
            clave: {
                "nombre": EXPRESIONES[clave]["nombre"],
                "descripcion": EXPRESIONES[clave]["descripcion"],
                "cuando_recomendar": EXPRESIONES[clave]["cuando_recomendar"],
                "riesgo": EXPRESIONES[clave]["riesgo"],
            }
            for clave in ORDEN_EXPRESIONES
        },
        "procedimiento": resumen_procedimiento(),
        "slx": resumen_slx(),
        "etica": completo["etica"],
        "fuentes": completo["fuentes"],
    }

    claves = [c for c in secciones if c in tema]
    if not claves:
        sinonimos = {
            "mitchell": ["plu", "relevancia"],
            "atributo": ["plu", "escala"],
            "poder": ["plu", "ponderacion"],
            "legitimidad": ["plu", "ponderacion"],
            "urgencia": ["plu", "ponderacion"],
            "liderazgo": ["expresiones"],
            "delegacion": ["expresiones"],
            "consulta": ["expresiones"],
            "autocracia": ["expresiones"],
            "rol": ["slx"],
            "pasos": ["procedimiento"],
            "metodologia": ["procedimiento"],
            "peso": ["ponderacion"],
        }
        for palabra, destinos in sinonimos.items():
            if palabra in tema:
                claves.extend(destinos)

    if not claves:
        return Resultado({"tema": tema or "general", "resumen": completo})
    return Resultado({"tema": tema, "secciones": {c: secciones[c] for c in dict.fromkeys(claves)}})


def _navegar(db, args):
    from .navegacion import RUTAS, acciones_de, normalizar_ruta

    destino = (args.get("destino") or "").strip()
    acciones = acciones_de(destino)
    if not acciones:
        return Resultado({"navegacion": False, "mensaje": "Esa pantalla no existe en GOVStake 360."})
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


_PRIORIDADES = ["prioridad_alta", "prioridad_media", "prioridad_baja", "monitoreo"]

# Los destinos validos salen del mapa de navegacion: una sola fuente de verdad.
from .navegacion import DESTINOS as _DESTINOS_RUTAS  # noqa: E402

_DESTINOS_VALIDOS = sorted(_DESTINOS_RUTAS)

ESQUEMAS: List[Dict[str, Any]] = [
    _herramienta(
        "resumen_ejecutivo",
        "Totales actuales de GOVStake 360: actores, prioridades, Mitchell, compromisos, alertas y relacionamiento. Usala para preguntas de panorama general.",
        {},
    ),
    _herramienta(
        "buscar_actores",
        "Busca actores por texto, tipo o nivel de prioridad. Devuelve indice, prioridad y clasificacion Mitchell. Usala cuando la pregunta no identifica un actor exacto.",
        {
            "texto": {"type": "string", "description": "Texto libre: nombre, institucion, departamento o municipio."},
            "tipo": {"type": "string", "description": "Tipo de actor (por ejemplo ciudadania, veeduria, entidad_control)."},
            "prioridad": {"type": "string", "enum": _PRIORIDADES},
            "solo_valorados": {"type": "boolean", "description": "Si es true, excluye actores sin percepcion del lider. Por defecto true."},
            "limite": {"type": "integer", "minimum": 1, "maximum": 20},
        },
    ),
    _herramienta(
        "ficha_actor",
        "Ficha completa de un actor: variables, Mitchell, expresion sugerida, compromisos y alertas. Usa id o nombre.",
        {
            "actor_id": {"type": "integer"},
            "nombre": {"type": "string", "description": "Nombre o institucion del actor; admite coincidencia parcial."},
        },
    ),
    _herramienta(
        "explicar_priorizacion",
        "Explica por que un actor tiene su indice y su clasificacion: desglose de pesos, niveles 0-3, relevancia y diferencia entre indice PAE y Mitchell.",
        {
            "actor_id": {"type": "integer"},
            "nombre": {"type": "string"},
        },
    ),
    _herramienta(
        "listar_compromisos",
        "Lista compromisos con su estado, prioridad, actor y fecha de vencimiento. Permite filtrar por estado, actor o solo vencidos.",
        {
            "estado": {"type": "string", "enum": ["pendiente", "en_progreso", "cumplido", "vencido"]},
            "actor": {"type": "string"},
            "solo_vencidos": {"type": "boolean"},
            "limite": {"type": "integer", "minimum": 1, "maximum": 40},
        },
    ),
    _herramienta(
        "listar_alertas",
        "Lista alertas por nivel (info, warning, critical) y actor. Por defecto solo las no leidas.",
        {
            "nivel": {"type": "string", "enum": ["info", "warning", "critical"]},
            "actor": {"type": "string"},
            "solo_no_leidas": {"type": "boolean"},
            "limite": {"type": "integer", "minimum": 1, "maximum": 40},
        },
    ),
    _herramienta(
        "listar_relacionamientos",
        "Lista interacciones registradas con actores, filtrables por tipo o actor.",
        {
            "tipo": {"type": "string", "enum": ["reunion", "consulta", "delegacion", "acuerdo", "participacion"]},
            "actor": {"type": "string"},
            "limite": {"type": "integer", "minimum": 1, "maximum": 40},
        },
    ),
    _herramienta(
        "estado_mitchell",
        "Agregado de la clasificacion Mitchell: cuantos actores hay por grupo e identificacion, quienes son definitivos y cuantos no tienen percepcion.",
        {},
    ),
    _herramienta(
        "comparar_actores",
        "Compara de 2 a 4 actores lado a lado con el mismo conjunto de indicadores.",
        {
            "nombres": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": 2,
                "maxItems": 4,
                "description": "Nombres o instituciones de los actores a comparar.",
            }
        },
        ["nombres"],
    ),
    _herramienta(
        "top_actores",
        "Ranking de actores por un criterio: indice, relevancia, influencia, urgencia, riesgo o calidad del relacionamiento.",
        {
            "criterio": {
                "type": "string",
                "enum": ["indice", "relevancia", "influencia", "urgencia", "riesgo", "relacionamiento"],
            },
            "limite": {"type": "integer", "minimum": 1, "maximum": 20},
        },
    ),
    _herramienta(
        "buscar_en_fundamentos",
        "Consulta la teoria del doctorado aplicada en la plataforma: PLU, escala, ponderacion, relevancia, expresiones del liderazgo, procedimiento, modelo SLX y etica. Usala para preguntas conceptuales.",
        {
            "tema": {
                "type": "string",
                "description": "Tema o palabra clave: plu, escala, ponderacion, relevancia, expresiones, procedimiento, slx, etica.",
            }
        },
    ),
    _herramienta(
        "navegar",
        "Devuelve la pantalla de GOVStake 360 donde el usuario puede continuar. Usala cuando la respuesta termine en una accion concreta.",
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
    "resumen_ejecutivo": _resumen_ejecutivo,
    "buscar_actores": _buscar_actores,
    "ficha_actor": _ficha_actor,
    "explicar_priorizacion": _explicar_priorizacion,
    "listar_compromisos": _listar_compromisos,
    "listar_alertas": _listar_alertas,
    "listar_relacionamientos": _listar_relacionamientos,
    "estado_mitchell": _estado_mitchell,
    "comparar_actores": _comparar_actores,
    "top_actores": _top_actores,
    "buscar_en_fundamentos": _buscar_en_fundamentos,
    "navegar": _navegar,
}


def ejecutar(nombre: str, argumentos: Optional[str], db) -> Resultado:
    """Ejecuta una herramienta y devuelve su resultado.

    Los errores se devuelven como dato para que el modelo pueda explicarlos,
    nunca rompen la conversacion.
    """
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
    except Exception as exc:  # noqa: BLE001 - se informa al modelo, no se propaga
        return Resultado({"error": f"No se pudo completar la consulta: {exc}"})


def error_como_texto(resultado: Resultado) -> str:
    return json.dumps(resultado.datos, ensure_ascii=False, default=str)
