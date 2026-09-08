"""Endpoint del asistente AgentGD para Interoperabilidad X-Road.

Construye el contexto desde la base de datos (entidades, sectores,
servicios, madurez, relaciones) y lo envía a OpenRouter.
"""
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from ....database import get_db
from ....security import get_current_user
from ....services.agentgd import call_agent


router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None
    entity: Optional[str] = None


def _build_context(db: Session) -> str:
    from ....models import Entity, Sector, Service, MaturityAssessment

    total = db.query(Entity).filter(Entity.is_active == True).count()
    connected = db.query(Entity).filter(Entity.xroad_status == "connected").count()
    pending = db.query(Entity).filter(Entity.xroad_status == "pending").count()
    notconn = total - connected - pending

    services = db.query(Service).filter(Service.status == "active").count()

    sectors = db.query(
        Sector.name, func.count(Entity.id)
    ).join(Entity, Sector.id == Entity.sector_id, isouter=True).filter(
        Entity.is_active == True
    ).group_by(Sector.name).order_by(func.count(Entity.id).desc()).limit(6).all()

    avg_maturity = db.query(func.avg(MaturityAssessment.overall_score)).scalar() or 0

    lineas = [
        "DATOS ACTUALES DE INTEROPERABILIDAD X-ROAD COLOMBIA:",
        f"- Entidades activas: {total}",
        f"- Conectadas a X-Road: {connected}",
        f"- Pendientes: {pending}",
        f"- No conectadas: {notconn}",
        f"- Tasa de conexión: {round((connected / total * 100) if total else 0, 1)}%",
        f"- Servicios activos: {services}",
        f"- Madurez promedio (1-4): {round(avg_maturity, 1)}",
        "- Entidades por sector (top):"
    ]
    for name, cnt in sectors:
        lineas.append(f"   · {name}: {cnt}")
    return "\n".join(lineas)


SYSTEM_TEMPLATE = """Eres AgentGD, asistente experto en interoperabilidad gubernamental y el ecosistema X-Road de Colombia.

Usa ÚNICAMENTE los datos proporcionados bajo el encabezado 'DATOS ACTUALES' (caso 'entrenado' con la base de datos de interoperabilidad) para responder.

Contexto del sistema:
{context}

Responde de forma concisa, profesional y en español. Si te preguntan por detalles que no están en los datos, indícalo con honestidad y sugiere revisar las secciones del dashboard. No inventes cifras."""


@router.post("/chat")
def agent_chat(payload: ChatMessage, db: Session = Depends(get_db), _=Depends(get_current_user)):
    context = _build_context(db)
    system_prompt = SYSTEM_TEMPLATE.format(context=context)
    try:
        reply = call_agent("interop", system_prompt, payload.history, payload.message)
    except RuntimeError as e:
        return {"response": f"⚠️ No pude conectarme con el modelo: {e}", "ok": False}
    return {"response": reply, "ok": True}