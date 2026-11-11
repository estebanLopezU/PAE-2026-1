"""API del modelo teorico de GOVStake 360.

Expone la teoria del doctorado como dato: los 64 casos PLU, las expresiones del
liderazgo participativo, las cinco etapas de la metodologia procesal, el modelo
SLX y el contenido que explica la aplicacion dentro de la aplicacion.

Los endpoints de teoria son publicos: la pagina ``/que-es-govstake`` debe poder
explicar el modelo sin exigir sesion. Los endpoints que leen datos de actores
exigen autenticacion, igual que el resto de la API.
"""

from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ....database import get_db
from ....modelo import (
    EXPRESIONES,
    ORDEN_EXPRESIONES,
    PESOS_TESIS,
    RANGOS,
    RANGOS_RELEVANCIA,
    TABLA_CASOS,
    buscar_caso_plu,
    ficha_plu,
    identificacion_estado,
    ponderar,
    rango_relevancia,
    recomendar_expresion,
    relevancia_calculada,
    resumen_procedimiento,
    resumen_slx,
    resumen_teoria,
)
from ....modelo.contenido import ETICA, FUENTES, PROPOSITO, QUE_ES
from ....modelo.escala import descripcion_escala
from ....modelo.expresiones import CORRELACIONES_HIPOTESIS_F, expresion_por_clave
from ....models import Actor, Compromiso, Relacionamiento, clasificar_mitchell
from ....security import get_current_user
from ._helpers import actor_query, actor_to_dict

router = APIRouter()


# ---------------------------------------------------------------------------
# Esquemas de entrada
# ---------------------------------------------------------------------------


class CalculoPLU(BaseModel):
    """Valoracion de un actor en la escala del doctorado."""

    poder: int = Field(ge=0, le=3, description="Nivel 0-3 (nula, baja, media, alta)")
    legitimidad: int = Field(ge=0, le=3)
    urgencia: int = Field(ge=0, le=3)
    frecuencia_intentos: int = Field(
        default=0, ge=0, le=3, description="Frecuencia de intentos de influencia"
    )
    pesos: Optional[Dict[str, float]] = Field(
        default=None,
        description="Pesos propios del lider (deben sumar 1). Si se omite se usan los de la tesis.",
    )


class ParejaPonderacion(BaseModel):
    a: str
    b: str
    puntos_a: int = Field(ge=0, le=10)


class PonderacionIn(BaseModel):
    parejas: List[ParejaPonderacion] = Field(min_length=3)


# ---------------------------------------------------------------------------
# Teoria (publica)
# ---------------------------------------------------------------------------


@router.get("/teoria")
def teoria():
    """Contenido completo de la parte teorica que se muestra en la aplicacion."""
    return resumen_teoria()


@router.get("/que-es")
def que_es():
    """Respuesta corta a "que es GOVStake 360" (para la pagina publica)."""
    return {
        "que_es": QUE_ES,
        "proposito": PROPOSITO,
        "etica": ETICA,
        "fuentes": FUENTES,
    }


@router.get("/plu")
def listar_casos(
    rango: Optional[str] = None,
    estado: Optional[str] = None,
    identificacion: Optional[str] = None,
):
    """Los 64 casos PLU de la Tabla 4.3, con relevancia y rango (Tabla 4.5)."""
    casos = TABLA_CASOS

    if rango:
        clave = rango.strip().lower()
        if clave not in RANGOS:
            raise HTTPException(
                status_code=400,
                detail="Rango invalido. Valores: " + ", ".join(RANGOS.keys()),
            )
        casos = [c for c in casos if c["rango"] == clave]
    if estado:
        objetivo = estado.strip().lower()
        casos = [c for c in casos if c["estado"].lower() == objetivo]
    if identificacion:
        objetivo = identificacion.strip().lower()
        casos = [c for c in casos if c["identificacion"].lower() == objetivo]

    return {
        "items": casos,
        "total": len(casos),
        "total_casos": len(TABLA_CASOS),
        "rangos": RANGOS_RELEVANCIA,
    }


@router.get("/plu/{codigo}")
def obtener_caso(codigo: str):
    """Ficha de un caso PLU con la aritmetica de la relevancia paso a paso."""
    caso = buscar_caso_plu(codigo)
    if not caso:
        raise HTTPException(
            status_code=404,
            detail="Caso PLU invalido. Debe tener tres digitos entre 0 y 3.",
        )
    ficha = ficha_plu(caso)
    ficha["expresion_sugerida"] = recomendar_expresion(
        caso["relevancia_calculada"], 0, caso["niveles"]
    )
    return ficha


@router.get("/expresiones")
def listar_expresiones():
    """Las cuatro expresiones del liderazgo participativo (Figura 1.1)."""
    return {
        "items": [dict(EXPRESIONES[clave]) for clave in ORDEN_EXPRESIONES],
        "total": len(EXPRESIONES),
        "correlaciones": [dict(c) for c in CORRELACIONES_HIPOTESIS_F],
        "nota": (
            "La tesis no deduce la expresion a partir de los atributos: "
            "encuentra correlaciones (Hipotesis F). GOVStake recomienda y el "
            "lider decide."
        ),
    }


@router.get("/expresiones/{clave}")
def obtener_expresion(clave: str):
    expresion = expresion_por_clave(clave)
    if not expresion:
        raise HTTPException(
            status_code=404,
            detail="Expresion invalida. Valores: " + ", ".join(ORDEN_EXPRESIONES),
        )
    expresion["correlaciones"] = [
        dict(c) for c in CORRELACIONES_HIPOTESIS_F if c["expresion"] == clave
    ]
    return expresion


@router.get("/procedimiento")
def procedimiento():
    """Las cinco etapas de la metodologia procesal (capitulo 4)."""
    return resumen_procedimiento()


@router.get("/slx")
def modelo_slx():
    """El ciclo del rol: expectativas, transmitido, recibido y conducta."""
    return resumen_slx()


@router.get("/escala")
def escala():
    """Escala verbal de cuatro niveles y los rangos de relevancia."""
    return {
        "escala": descripcion_escala(),
        "rangos": RANGOS_RELEVANCIA,
        "rangos_detalle": RANGOS,
    }


# ---------------------------------------------------------------------------
# Calculo (publico, sin datos de actores)
# ---------------------------------------------------------------------------


@router.post("/calcular")
def calcular(payload: CalculoPLU):
    """Calcula el caso PLU, la relevancia, el rango y la expresion sugerida.

    Es el mismo calculo que hace la aplicacion al valorar un actor, expuesto
    para que cualquiera pueda reproducirlo con los mismos datos.
    """
    codigo = f"{payload.poder}{payload.legitimidad}{payload.urgencia}"
    caso = buscar_caso_plu(codigo)
    if not caso:
        raise HTTPException(status_code=400, detail="Combinacion PLU invalida.")

    if payload.pesos:
        suma = round(sum(payload.pesos.values()), 6)
        if abs(suma - 1.0) > 0.001:
            raise HTTPException(
                status_code=400,
                detail=f"Los pesos deben sumar 1; suman {suma}.",
            )
        relevancia = relevancia_calculada(
            payload.poder, payload.legitimidad, payload.urgencia, payload.pesos
        )
        rango = rango_relevancia(relevancia)
        pesos = payload.pesos
    else:
        relevancia = caso["relevancia_calculada"]
        rango = caso["rango"]
        pesos = None

    meta = identificacion_estado(payload.poder, payload.legitimidad, payload.urgencia)

    factores = dict(pesos) if pesos else dict(PESOS_TESIS)
    pasos = []
    total = 0.0
    for atributo in ("poder", "legitimidad", "urgencia"):
        nivel = int(getattr(payload, atributo))
        peso = float(factores[atributo])
        aporte = round(nivel * peso, 4)
        total += aporte
        pasos.append(
            {
                "atributo": atributo,
                "nivel": nivel,
                "peso": round(peso, 6),
                "peso_porcentaje": round(peso * 100, 2),
                "aporte": round(aporte, 4),
            }
        )

    sin_percepcion = not any(
        (payload.poder, payload.legitimidad, payload.urgencia)
    )
    if sin_percepcion:
        expresion = {
            "clave": None,
            "nombre": "Sin recomendacion",
            "descripcion": "No hay atributos valorados; no se puede recomendar una expresion.",
            "regla": "Valora al menos un atributo.",
            "confianza": 0,
            "origen": "sin_percepcion",
            "correlaciones": [],
        }
    else:
        expresion = recomendar_expresion(
            relevancia,
            payload.frecuencia_intentos,
            {"poder": payload.poder, "legitimidad": payload.legitimidad, "urgencia": payload.urgencia},
        )

    return {
        "plu": codigo,
        "caso": caso["caso"],
        "niveles": {
            "poder": payload.poder,
            "legitimidad": payload.legitimidad,
            "urgencia": payload.urgencia,
            "frecuencia_intentos": payload.frecuencia_intentos,
        },
        "identificacion": meta["identificacion"],
        "estado": meta["estado"],
        "atributos_presentes": meta["atributos_presentes"],
        "relevancia_calculada": round(relevancia, 2),
        "rango": rango,
        "rango_etiqueta": RANGOS[rango]["etiqueta"],
        "pasos": pasos,
        "suma": round(total, 4),
        "sin_percepcion": sin_percepcion,
        "expresion_sugerida": expresion,
    }


@router.post("/ponderacion")
def calcular_ponderacion(payload: PonderacionIn):
    """Ponderacion por apareamiento de la Tabla 4.1 (tres parejas, 30 puntos)."""
    if len(payload.parejas) != 3:
        raise HTTPException(
            status_code=400,
            detail="La ponderacion requiere exactamente tres parejas.",
        )
    try:
        resultado = ponderar([p.model_dump() for p in payload.parejas])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return resultado


# ---------------------------------------------------------------------------
# Aplicacion del modelo a los actores registrados (requiere sesion)
# ---------------------------------------------------------------------------


@router.get("/panorama")
def panorama(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Distribucion de los actores por rango de relevancia y expresion sugerida."""
    actores = actor_query(db).filter(Actor.is_active == True).all()  # noqa: E712

    rangos: Dict[str, int] = {clave: 0 for clave in RANGOS}
    expresiones: Dict[str, int] = {clave: 0 for clave in ORDEN_EXPRESIONES}
    sin_percepcion = 0

    for actor in actores:
        m = clasificar_mitchell(actor.variables)
        rangos[m["rango"]] = rangos.get(m["rango"], 0) + 1
        clave = (m.get("expresion_sugerida") or {}).get("clave")
        if clave in expresiones:
            expresiones[clave] += 1
        if m.get("sin_percepcion"):
            sin_percepcion += 1

    return {
        "total_actores": len(actores),
        "sin_percepcion_del_lider": sin_percepcion,
        "por_rango": rangos,
        "por_expresion": expresiones,
        "rangos": RANGOS_RELEVANCIA,
    }


@router.get("/actor/{actor_id}")
def modelo_de_actor(
    actor_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """Ficha teorica de un actor: PLU, relevancia, rango, expresion y etapa SLX."""
    actor = actor_query(db).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    datos = actor_to_dict(actor)
    m = datos["mitchell"]

    interacciones = (
        db.query(func.count(Relacionamiento.id))
        .filter(Relacionamiento.actor_id == actor_id)
        .scalar()
        or 0
    )
    compromisos = list(actor.compromisos or [])
    cumplidos = [c for c in compromisos if (c.estado or "").lower() == "cumplido"]

    if interacciones == 0:
        etapa = 1
    elif not compromisos:
        etapa = 2
    elif not cumplidos:
        etapa = 3
    else:
        etapa = 4

    etapas_slx = resumen_slx()["etapas"]
    etapa_actual = next((e for e in etapas_slx if e["orden"] == etapa), etapas_slx[0])
    siguiente = etapas_slx[etapa] if etapa < len(etapas_slx) else None

    recomendada = (m.get("expresion_sugerida") or {}).get("clave")
    alternativas = []
    for clave in ORDEN_EXPRESIONES:
        alternativas.append(
            {
                "clave": clave,
                "nombre": EXPRESIONES[clave]["nombre"],
                "descripcion": EXPRESIONES[clave]["descripcion"],
                "grado_influencia": EXPRESIONES[clave]["grado_influencia"],
                "recomendada": clave == recomendada,
            }
        )

    variable = actor.variables
    return {
        "actor": {
            "id": datos["id"],
            "nombre": datos["nombre"],
            "tipo": datos["tipo"],
            "fuente": datos.get("fuente"),
            "es_interno": datos.get("es_interno"),
        },
        "modelo": m,
        "slx": {
            "etapa_actual": etapa_actual,
            "siguiente_etapa": siguiente,
            "evidencia": {
                "relacionamientos": interacciones,
                "compromisos": len(compromisos),
                "compromisos_cumplidos": len(cumplidos),
            },
        },
        "expresiones": alternativas,
        "trazabilidad": {
            "evaluado_por": getattr(variable, "evaluado_por", None),
            "evaluado_en": getattr(variable, "evaluado_en", None),
            "ponderacion": "pesos publicados en las Tablas 4.4 y 4.5 del doctorado",
            "pesos": dict(PESOS_TESIS),
        },
    }
