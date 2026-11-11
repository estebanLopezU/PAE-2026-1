"""Expresiones del liderazgo participativo (doctorado, capitulos 1 y 2).

El doctorado estudia cuatro expresiones del liderazgo participativo ordenadas
en un continuo de influencia (Figura 1.1): desde ninguna influencia del grupo
de interes hasta la delegacion plena de la decision.

    autocracia  ->  consulta  ->  decision conjunta  ->  delegacion

La tesis NO deduce la expresion a partir de los atributos: encuentra
correlaciones entre los atributos de los grupos de interes y las expresiones
que los directivos declaran usar (Hipotesis F). Por eso este modulo entrega
una *recomendacion fundamentada* con su regla explicita, su nivel de confianza
y las correlaciones que la respaldan. El lider puede sobrescribirla; en ese
caso la valoracion queda registrada con ``origen = "lider"``.

Regla de recomendacion (calibrada con la Hipotesis F, no deducida):

===========  =====================  ======================
Relevancia   Frecuencia nula/baja   Frecuencia media/alta
===========  =====================  ======================
Alta         Delegacion             Decision conjunta
Media-Alta   Consulta               Decision conjunta
Media-Baja   Consulta               Consulta
Baja / Nula  Autocracia             Consulta
===========  =====================  ======================

La lectura es monotona y defendible: a mayor relevancia calculada, mayor
autonomia se puede conceder; a mayor frecuencia de intentos de influencia,
mayor necesidad de compartir la decision en lugar de delegarla en silencio.
"""

from typing import Dict, List, Optional

__all__ = [
    "EXPRESIONES",
    "ORDEN_EXPRESIONES",
    "CORRELACIONES_HIPOTESIS_F",
    "recomendar_expresion",
    "expresion_por_clave",
    "correlaciones_de",
]

# Orden del continuo de influencia (Figura 1.1 del doctorado).
ORDEN_EXPRESIONES = ("autocracia", "consulta", "decision_conjunta", "delegacion")

EXPRESIONES = {
    "autocracia": {
        "clave": "autocracia",
        "nombre": "Autocracia",
        "grado_influencia": 1,
        "descripcion": (
            "El lider decide sin incorporar la opinion del grupo de interes. "
            "La relacion es informativa y unidireccional."
        ),
        "practicas": [
            "Comunicar la decision ya tomada",
            "Informar por canales oficiales",
            "No abrir espacio de incidencia",
        ],
        "cuando_recomendar": (
            "Grupos de interes con relevancia baja o nula: no poseen atributos "
            "suficientes para incidir y su atencion no altera la decision."
        ),
        "riesgo": (
            "Aplicarla a un actor con relevancia alta incrementa el riesgo de "
            "conflicto y erosiona la legitimidad de la entidad."
        ),
    },
    "consulta": {
        "clave": "consulta",
        "nombre": "Consulta",
        "grado_influencia": 2,
        "descripcion": (
            "El lider pide opinion y escucha, pero conserva la decision. La "
            "influencia del grupo de interes es parcial."
        ),
        "practicas": [
            "Mesas de escucha y audiencias",
            "Comentarios a borradores de decision",
            "Respuesta trazable a cada solicitud",
        ],
        "cuando_recomendar": (
            "Grupos de interes con relevancia media: tienen atributos para "
            "opinar y deben ser escuchados, pero no para decidir."
        ),
        "riesgo": (
            "Consultar sin retroalimentar produce la sensacion de participacion "
            "simulada y desgasta la confianza."
        ),
    },
    "decision_conjunta": {
        "clave": "decision_conjunta",
        "nombre": "Decision conjunta",
        "grado_influencia": 3,
        "descripcion": (
            "Lider y grupo de interes deciden juntos. La influencia es "
            "bidireccional y la responsabilidad se comparte."
        ),
        "practicas": [
            "Comites mixtos con capacidad de decision",
            "Actas y compromisos con responsables y fechas",
            "Cogestion de proyectos o programas",
        ],
        "cuando_recomendar": (
            "Grupos de interes de relevancia alta que ademas presionan de forma "
            "recurrente: excluirlos de la decision genera conflicto abierto."
        ),
        "riesgo": (
            "Compartir decision con actores de baja legitimidad puede trasladar "
            "la responsabilidad publica a quien no responde por ella."
        ),
    },
    "delegacion": {
        "clave": "delegacion",
        "nombre": "Delegacion",
        "grado_influencia": 4,
        "descripcion": (
            "El lider transfiere la decision al grupo de interes, que actua con "
            "autonomia dentro de un marco acordado."
        ),
        "practicas": [
            "Transferencia de recursos y competencias",
            "Acuerdos de autonomia con rendicion de cuentas",
            "Acompanamiento sin sustitucion",
        ],
        "cuando_recomendar": (
            "Grupos de interes de relevancia alta y baja presion directa: "
            "tienen capacidad y legitimidad, y no necesitan presionar para ser "
            "atendidos. La delegacion reconoce esa madurez."
        ),
        "riesgo": (
            "Delegar en un actor sin capacidad tecnica o sin control ciudadano "
            "puede producir perdida de rectoria publica."
        ),
    },
}


# Correlaciones significativas de la Hipotesis F del doctorado (Spearman).
# Solo se incluyen las que el documento reporta como significativas.
CORRELACIONES_HIPOTESIS_F = [
    {
        "factor": "poder",
        "expresion": "consulta",
        "rho": 0.271,
        "significancia": "**",
        "lectura": "A mayor poder percibido, mayor uso de la consulta.",
    },
    {
        "factor": "poder_financiadores",
        "expresion": "consulta",
        "rho": 0.250,
        "significancia": "**",
        "lectura": "El poder de los financiadores se asocia con la consulta.",
    },
    {
        "factor": "poder_directivas",
        "expresion": "consulta",
        "rho": 0.240,
        "significancia": "**",
        "lectura": "El poder de las directivas se asocia con la consulta.",
    },
    {
        "factor": "legitimidad_investigacion",
        "expresion": "decision_conjunta",
        "rho": 0.216,
        "significancia": "**",
        "lectura": (
            "La legitimidad de los grupos de investigacion se asocia con la "
            "decision conjunta."
        ),
    },
    {
        "factor": "frecuencia_estudiantes",
        "expresion": "delegacion",
        "rho": 0.193,
        "significancia": "*",
        "lectura": (
            "La frecuencia de intentos de los estudiantes se asocia con la "
            "delegacion."
        ),
    },
    {
        "factor": "legitimidad_gobierno",
        "expresion": "delegacion",
        "rho": -0.355,
        "significancia": "**",
        "lectura": (
            "A mayor legitimidad del gobierno, menor delegacion: el lider "
            "conserva la decision de lo publico."
        ),
    },
    {
        "factor": "legitimidad_investigacion",
        "expresion": "autocracia",
        "rho": -0.258,
        "significancia": "**",
        "lectura": (
            "A mayor legitimidad de los grupos de investigacion, menor "
            "autocracia."
        ),
    },
]


def _confianza(relevancia: float, frecuencia_nivel: int) -> int:
    """Confianza de la recomendacion (0-100) segun la distancia a los umbrales.

    Cuando la relevancia cae justo sobre un umbral la recomendacion es mas
    fragil; cuando esta lejos, es mas estable.
    """
    margen = min(
        abs(relevancia - 1.03),
        abs(relevancia - 1.53),
        abs(relevancia - 1.985),
    )
    base = 58 + int(round(min(margen, 0.49) / 0.49 * 27))
    if frecuencia_nivel >= 2:
        base += 5
    return max(50, min(base, 90))


def _clave_expresion(relevancia: float, frecuencia_nivel: int) -> str:
    alta = relevancia >= 1.985
    media_alta = relevancia >= 1.53
    media_baja = relevancia >= 1.03
    frecuencia_alta = frecuencia_nivel >= 2

    if alta:
        return "decision_conjunta" if frecuencia_alta else "delegacion"
    if media_alta:
        return "decision_conjunta" if frecuencia_alta else "consulta"
    if media_baja:
        return "consulta"
    return "consulta" if frecuencia_alta else "autocracia"


def correlaciones_de(clave_expresion: str) -> List[Dict[str, object]]:
    """Correlaciones de la Hipotesis F que respaldan una expresion."""
    return [
        c for c in CORRELACIONES_HIPOTESIS_F if c["expresion"] == clave_expresion
    ]


def recomendar_expresion(
    relevancia: float,
    frecuencia_nivel: int,
    niveles: Optional[Dict[str, int]] = None,
) -> Dict[str, object]:
    """Recomienda una expresion del liderazgo participativo.

    Devuelve la expresion recomendada con su regla, su confianza y las
    correlaciones que la respaldan. Es una recomendacion, no una imposicion:
    el lider puede sobrescribirla y la valoracion queda registrada.
    """
    try:
        frecuencia = int(frecuencia_nivel)
    except (TypeError, ValueError):
        frecuencia = 0
    frecuencia = max(0, min(frecuencia, 3))

    valor = round(float(relevancia), 2)
    clave = _clave_expresion(valor, frecuencia)
    meta = EXPRESIONES[clave]

    return {
        "clave": clave,
        "nombre": meta["nombre"],
        "descripcion": meta["descripcion"],
        "grado_influencia": meta["grado_influencia"],
        "practicas": list(meta["practicas"]),
        "riesgo": meta["riesgo"],
        "justificacion": meta["cuando_recomendar"],
        "confianza": _confianza(valor, frecuencia),
        "origen": "recomendacion_del_modelo",
        "regla": (
            f"relevancia={valor:.2f} (0-3) y frecuencia_intentos nivel "
            f"{frecuencia} (0-3) -> {clave}"
        ),
        "correlaciones": correlaciones_de(clave),
        "niveles": dict(niveles or {}),
    }


def expresion_por_clave(clave: str) -> Optional[Dict[str, object]]:
    """Ficha teorica de una expresion, para exponerla en la API y la interfaz."""
    meta = EXPRESIONES.get(str(clave or "").strip())
    if not meta:
        return None
    return dict(meta)
