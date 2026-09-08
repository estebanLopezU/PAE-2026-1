"""Endpoint del asistente AgentGD para GOVStake 360.

Construye el contexto a partir de la base de datos (actores, matriz,
compromisos, alertas, relacionamientos) y lo envía a OpenRouter.
"""
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ....database import get_db
from ....security import get_current_user
from ....services.agentgd import call_agent


router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    entity: Optional[str] = None  # ignore


def _build_context(db: Session) -> str:
    """Genera un resumen del estado actual de la plataforma GOVStake."""
    from ....models import Actor, Alerta, Compromiso, Relacionamiento
    from ._helpers import actor_to_dict

    actores = db.query(Actor).filter(Actor.is_active == True).all()
    alertas = db.query(Alerta).all()
    compromisos = db.query(Compromiso).all()
    rel = db.query(Relacionamiento).all()

    actores_c = len(actores)
    alertas_nl = sum(1 for a in alertas if not a.leida)
    alertas_crit = sum(1 for a in alertas if not a.leida and a.nivel == "critical")
    comp_pend = sum(1 for c in compromisos if c.estado in ("pendiente", "en_progreso"))
    rel_total = len(rel)

    top = sorted((actor_to_dict(a) for a in actores),
                 key=lambda x: x["indice_priorizacion"], reverse=True)[:5]

    lineas = [
        "DATOS ACTUALES DE GOVStake 360:",
        f"- Actores activos: {actores_c}",
        f"- Alertas sin leer: {alertas_nl} (críticas: {alertas_crit})",
        f"- Compromisos pendientes/en curso: {comp_pend} de {len(compromisos)}",
        f"- Registros de relacionamiento: {rel_total}",
        "- Top 5 actores por índice de priorización:"
    ]
    for a in top:
        lineas.append(
            f"   · {a['nombre']} ({a['tipo']}): prioridad={a['nivel_prioridad']}, "
            f"índice={a['indice_priorizacion']}, riesgo={ (a['variables'] or {}).get('riesgo_conflicto',0) }"
        )
    return "\n".join(lineas)


SYSTEM_TEMPLATE = """Eres AgentGD, asistente experto en gestión de grupos de interés públicos y gobernanza del proyecto GOVStake 360.

Usa ÚNICAMENTE los datos proporcionados bajo el encabezado 'DATOS ACTUALES' para responder. Esto es la 'base de datos' de la plataforma con la que estás entrenado.

Contexto del sistema:
{context}

Responde de forma concisa, profesional y en español. Si te preguntan algo que no se puede deducir de los datos, dilo con honestidad y sugiere dónde revisar en el dashboard. No inventes cifras."""


@router.post("/chat")
def agent_chat(payload: ChatMessage, db: Session = Depends(get_db), _=Depends(get_current_user)):
    context = _build_context(db)
    system_prompt = SYSTEM_TEMPLATE.format(context=context)
    try:
        reply = call_agent("govstake", system_prompt, payload.history, payload.message)
    except RuntimeError as e:
        return {"response": f"⚠️ No pude conectarme con el modelo: {e}", "ok": False}
    return {"response": reply, "ok": True}