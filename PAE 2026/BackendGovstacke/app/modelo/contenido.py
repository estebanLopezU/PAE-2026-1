"""Contenido teorico que explica GOVStake 360 dentro de la aplicacion.

Esta es la fuente unica de la parte teorica. La API la expone, la interfaz la
muestra y el agente conversacional la cita. La regla de arquitectura es que la
teoria no se escribe en el frontend: si cambia una definicion, cambia aqui y
cambia en todos los canales a la vez.

El contenido responde a tres preguntas:

* Que es GOVStake 360 y para que sirve.
* De donde viene el modelo que aplica.
* Cuales son sus limites y compromisos eticos.
"""

from typing import Dict, List

from .datos_tesis import PESOS_TESIS, PESOS_TESIS_NUMERADOR, RANGOS
from .escala import descripcion_escala
from .expresiones import CORRELACIONES_HIPOTESIS_F, EXPRESIONES, ORDEN_EXPRESIONES
from .plu import ESCALA_NIVELES, RANGOS_RELEVANCIA, TABLA_CASOS
from .ponderacion import TOTAL_PUNTOS
from .procedimiento import resumen_procedimiento
from .slx import resumen_slx

__all__ = ["QUE_ES", "PROPOSITO", "ETICA", "FUENTES", "resumen_teoria", "ficha_plu"]

QUE_ES = {
    "titulo": "Que es GOVStake 360",
    "frase": (
        "GOVStake 360 convierte la percepcion del lider sobre sus grupos de "
        "interes en una jerarquia de atencion, una recomendacion de estilo de "
        "relacionamiento y un registro auditable de compromisos."
    ),
    "parrafos": [
        (
            "Una entidad publica no se relaciona con un publico indiferenciado: "
            "se relaciona con grupos de interes que tienen poder, legitimidad y "
            "urgencia distintos. Tratarlos a todos igual desgasta recursos "
            "escasos y deja sin atencion a quien realmente puede afectar o ser "
            "afectado por la decision publica."
        ),
        (
            "GOVStake 360 ordena ese relacionamiento. Registra a los actores, "
            "recoge la valoracion del lider sobre sus atributos, calcula la "
            "relevancia con el modelo del doctorado, clasifica a cada actor y "
            "sugiere una expresion de liderazgo participativo. Todo queda con "
            "trazabilidad: quien valoro, cuando y con que ponderacion."
        ),
        (
            "La aplicacion no reemplaza el juicio del lider. Lo hace explicito, "
            "comparable y auditable. El lider decide; el sistema documenta por "
            "que esa decision es defendible."
        ),
    ],
    "pilares": [
        {
            "titulo": "Caracterizar",
            "descripcion": "Registrar actores con sus atributos y su contexto territorial.",
        },
        {
            "titulo": "Priorizar",
            "descripcion": "Calcular la relevancia y clasificar a cada actor con el modelo del doctorado.",
        },
        {
            "titulo": "Relacionar",
            "descripcion": "Sugerir la expresion de liderazgo y el protocolo de participacion.",
        },
        {
            "titulo": "Auditar",
            "descripcion": "Registrar valoraciones, compromisos, alertas y decisiones de forma trazable.",
        },
    ],
}

PROPOSITO = {
    "titulo": "Para que sirve en la gestion publica",
    "usos": [
        "Decidir a quien atender primero cuando los recursos y el tiempo son limitados.",
        "Justificar ante control interno y ciudadania por que un actor recibio atencion preferente.",
        "Detectar actores con alta relevancia y baja frecuencia de contacto: relevancia no capturada.",
        "Detectar presion recurrente sobre actores poco formalizados: riesgo de conflicto.",
        "Cerrar el ciclo con compromisos, seguimiento y rendicion de cuentas.",
    ],
}

ETICA = {
    "titulo": "Limites y compromisos eticos del modelo",
    "principios": [
        {
            "clave": "percepcion",
            "titulo": "El modelo mide percepcion, no verdad objetiva",
            "detalle": (
                "Poder, legitimidad y urgencia se registran como los percibe el "
                "lider. Por eso cada valoracion guarda quien la hizo y cuando. "
                "Un actor sin valoracion del lider se muestra como tal y no se "
                "auto-valora: inventar esa percepcion falsearia el resultado."
            ),
        },
        {
            "clave": "finalidad",
            "titulo": "Finalidad legitima y minimizacion",
            "detalle": (
                "Los datos se usan para gestionar el relacionamiento con fines "
                "de interes publico. Solo se registran los datos necesarios para "
                "esa finalidad; no se recogen categorias sensibles."
            ),
        },
        {
            "clave": "transparencia",
            "titulo": "Transparencia del calculo",
            "detalle": (
                "La formula, los pesos, la escala y los rangos son publicos y "
                "estan en la aplicacion. Cualquier persona puede reproducir el "
                "resultado de un actor con los mismos datos."
            ),
        },
        {
            "clave": "supervision",
            "titulo": "Supervision humana",
            "detalle": (
                "La expresion de liderazgo es una recomendacion fundamentada, no "
                "una orden. El lider puede sobrescribirla y la valoracion queda "
                "registrada con el origen del cambio."
            ),
        },
        {
            "clave": "anonimizacion",
            "titulo": "Anonimizacion en reportes",
            "detalle": (
                "Los reportes agregados no identifican personas naturales. Los "
                "datos de contacto solo se muestran a quien tiene rol de gestion "
                "sobre el actor."
            ),
        },
    ],
    "advertencia": (
        "El modelo del doctorado fue construido y validado en un contexto "
        "organizacional especifico. Aplicarlo a otra entidad exige revalorar los "
        "actores con la percepcion de sus propios lideres; no se trasladan "
        "valoraciones de una entidad a otra."
    ),
}

FUENTES = {
    "principal": (
        "Pantoja Ospina, M. A. (2015). Liderazgo y grupos de interes: influencia "
        "de los atributos de los grupos de interes en las expresiones del "
        "liderazgo participativo en la organizacion (tesis doctoral). Universidad "
        "Nacional de Colombia."
    ),
    "complementarias": [
        "Mitchell, R. K., Agle, B. R. y Wood, D. J. (1997). Toward a theory of stakeholder identification and salience.",
        "Katz, D. y Kahn, R. L. (1978). The Social Psychology of Organizations.",
        "Grech, P. (2001). Metodologia para la identificacion y jerarquizacion de stakeholders.",
        "Yukl, G. (2010). Leadership in Organizations.",
    ],
    "nota_pesos": (
        "Los pesos usados por GOVStake son 13/30 poder, 10/30 legitimidad y "
        "7/30 urgencia, que son los unicos que reproducen los 64 valores de las "
        "Tablas 4.4 y 4.5 impresas. La nota al pie 39 del documento declara "
        "43,3/30,0/26,7; la discrepancia esta documentada en el codigo."
    ),
}


def resumen_teoria() -> Dict[str, object]:
    """Todo el contenido teorico en un solo objeto para la interfaz."""
    return {
        "que_es": QUE_ES,
        "proposito": PROPOSITO,
        "etica": ETICA,
        "fuentes": FUENTES,
        "slx": resumen_slx(),
        "procedimiento": resumen_procedimiento(),
        "escala": descripcion_escala(),
        "niveles": ESCALA_NIVELES,
        "rangos": RANGOS_RELEVANCIA,
        "rangos_detalle": RANGOS,
        "pesos": dict(PESOS_TESIS),
        "pesos_numerador": dict(PESOS_TESIS_NUMERADOR),
        "puntos_ponderacion": TOTAL_PUNTOS,
        "expresiones": [dict(EXPRESIONES[clave]) for clave in ORDEN_EXPRESIONES],
        "correlaciones": [dict(c) for c in CORRELACIONES_HIPOTESIS_F],
        "total_casos": len(TABLA_CASOS),
    }


def ficha_plu(caso: Dict[str, object]) -> Dict[str, object]:
    """Ficha de un caso PLU con la aritmetica paso a paso para la interfaz."""
    pasos: List[Dict[str, object]] = []
    total = 0.0
    for atributo in ("poder", "legitimidad", "urgencia"):
        nivel = int(caso[atributo])
        peso = float(PESOS_TESIS[atributo])
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
    return {
        **caso,
        "pasos": pasos,
        "suma": round(total, 4),
    }
