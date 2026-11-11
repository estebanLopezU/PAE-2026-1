"""Modelo SLX: el rol como unidad de analisis del liderazgo.

El doctorado adopta el modelo de Katz y Kahn (1978) para explicar como las
expectativas sobre un grupo de interes se convierten en conducta. El ciclo
tiene cuatro momentos:

1. Expectativas del papel: lo que la organizacion espera del actor.
2. Papel transmitido: lo que efectivamente se le comunica.
3. Papel recibido: lo que el actor entiende que se espera de el.
4. Conducta en el papel: lo que el actor finalmente hace.

La utilidad para GOVStake 360 es diagnostica: la mayoria de las fallas de
relacionamiento no estan en el actor, sino en la brecha entre lo que se espera
(1), lo que se comunica (2) y lo que el actor entiende (3). Cada concepto se
mapea a un dato que la aplicacion ya registra.
"""

from typing import Dict, List, Optional

__all__ = [
    "ETAPAS_SLX",
    "CLAVES_SLX",
    "resumen_slx",
    "etapa_por_clave",
    "siguiente_paso",
]

CLAVES_SLX = ("expectativas", "transmitido", "recibido", "conducta")

ETAPAS_SLX = {
    "expectativas": {
        "clave": "expectativas",
        "orden": 1,
        "nombre": "Expectativas del papel",
        "descripcion": (
            "Lo que la entidad espera del grupo de interes: que aporte, que "
            "represente, que controle o que reciba."
        ),
        "pregunta_clave": "Que espera la entidad de este actor?",
        "senal_en_govstake": "Descripcion del actor, tipo y protocolo de participacion.",
    },
    "transmitido": {
        "clave": "transmitido",
        "orden": 2,
        "nombre": "Papel transmitido",
        "descripcion": (
            "Lo que la entidad efectivamente comunica al actor: invitaciones, "
            "solicitudes, compromisos y canales habilitados."
        ),
        "pregunta_clave": "Que se le comunico y por que canal?",
        "senal_en_govstake": "Relacionamientos registrados y compromisos adquiridos.",
    },
    "recibido": {
        "clave": "recibido",
        "orden": 3,
        "nombre": "Papel recibido",
        "descripcion": (
            "Lo que el actor entendio que se esperaba de el. Una brecha aqui "
            "explica la mayoria de los conflictos que parecen de voluntad."
        ),
        "pregunta_clave": "Que entendio el actor que debia hacer?",
        "senal_en_govstake": "Alertas de tension y notas de seguimiento del actor.",
    },
    "conducta": {
        "clave": "conducta",
        "orden": 4,
        "nombre": "Conducta en el papel",
        "descripcion": (
            "Lo que el actor hace: participa, presiona, cumple o se retira. Es "
            "la evidencia observable del ciclo completo."
        ),
        "pregunta_clave": "Que hace el actor con el papel que recibio?",
        "senal_en_govstake": "Compromisos cumplidos, alertas y frecuencia de intentos.",
    },
}


def resumen_slx() -> Dict[str, object]:
    """Contenido del modelo SLX listo para la API y la interfaz."""
    return {
        "nombre": "Modelo SLX (Katz y Kahn, 1978)",
        "descripcion": (
            "El liderazgo se explica por la secuencia expectativas -> papel "
            "transmitido -> papel recibido -> conducta en el papel. GOVStake "
            "360 registra cada momento para ubicar donde se rompe el ciclo."
        ),
        "etapas": [dict(ETAPAS_SLX[clave]) for clave in CLAVES_SLX],
        "cita": "Katz, D. y Kahn, R. L. (1978). The Social Psychology of Organizations.",
    }


def etapa_por_clave(clave: str) -> Optional[Dict[str, object]]:
    etapa = ETAPAS_SLX.get(str(clave or "").strip())
    return dict(etapa) if etapa else None


def siguiente_paso(orden_actual: int) -> List[str]:
    """Recomendaciones para avanzar de una etapa a la siguiente."""
    recomendaciones = {
        1: [
            "Explicitar por escrito que se espera del actor.",
            "Verificar que la expectativa sea realista y este dentro de su mandato.",
        ],
        2: [
            "Registrar el relacionamiento en GOVStake con canal, fecha y mensaje.",
            "Formalizar los compromisos con responsable y plazo.",
        ],
        3: [
            "Confirmar con el actor que entendio lo mismo que se le comunico.",
            "Documentar la confirmacion en notas o en el acta del relacionamiento.",
        ],
        4: [
            "Medir cumplimiento y ajustar la expresion de liderazgo recomendada.",
            "Cerrar el ciclo con rendicion de cuentas ante el actor.",
        ],
    }
    return recomendaciones.get(int(orden_actual or 1), [])
