"""Endpoint del asistente AgentGD para GOVStake 360.

El agente consulta la base a traves de herramientas de solo lectura y cita la
teoria de ``app.modelo``. El contexto se arma en ``app.agentgd``.

Contrato extendido (compatible con el anterior):

    POST /api/v1/agentgd/chat
    {
      "message": "...",
      "history": [{"role": "user", "content": "..."}],
      "page": "/matriz",
      "image": "data:image/jpeg;base64,..."
    }

    {
      "response": "...",
      "ok": true,
      "acciones": [{"etiqueta": "Ver matriz", "ruta": "/matriz"}],
      "trazabilidad": ["buscar_actores"],
      "uso": {"tokens_entrada": 0, "tokens_salida": 0, "llamadas": 1, "modelo": "..."},
      "vision": false
    }
"""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ....agentgd import LimiteExcedido, responder
from ....agentgd import herramientas as catalogo
from ....agentgd.vision import ErrorImagen
from ....config import get_settings
from ....database import get_db
from ....security import get_current_user, require_admin
from ....services.agentgd import modelos_disponibles

router = APIRouter()


class ChatMessage(BaseModel):
    message: str = Field(default="", max_length=4000)
    history: Optional[List[Dict[str, Any]]] = None
    page: Optional[str] = Field(default=None, max_length=120)
    image: Optional[str] = None
    entity: Optional[str] = None  # compatibilidad con versiones anteriores


@router.post("/chat")
def agent_chat(
    payload: ChatMessage,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    try:
        return responder(
            db,
            current_user,
            payload.message,
            historial=payload.history,
            pagina=payload.page,
            imagen=payload.image,
        )
    except LimiteExcedido as exc:
        raise HTTPException(status_code=429, detail=str(exc)) from exc
    except (ValueError, ErrorImagen) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        return {
            "response": f"⚠️ No pude conectarme con el modelo: {exc}",
            "ok": False,
            "acciones": [],
            "trazabilidad": [],
        }


@router.get("/capacidades")
def agent_capacidades(_=Depends(get_current_user)):
    """Que puede hacer AgentGD en esta instalacion y guia de cada pantalla."""
    from ....agentgd.navegacion import PAGINAS

    settings = get_settings()
    return {
        "herramientas": sorted(catalogo.NOMBRES),
        "total_herramientas": len(catalogo.NOMBRES),
        "vision": bool(getattr(settings, "AGENTGD_IMAGES", True)),
        "trazabilidad": True,
        "navegacion": True,
        "max_llamadas_por_pregunta": int(getattr(settings, "AGENTGD_MAX_CALLS", 2)),
        "preguntas_por_minuto": int(getattr(settings, "AGENTGD_REQUESTS_PER_MINUTE", 6)),
        "paginas": {
            clave: {
                "titulo": ficha.get("titulo"),
                "preguntas": ficha.get("preguntas") or [],
                "guia": ficha.get("guia") or [],
            }
            for clave, ficha in PAGINAS.items()
        },
    }


@router.get("/diagnostico")
def agent_diagnostico(_=Depends(require_admin)):
    """Estado de configuracion del agente. Solo administradores."""
    settings = get_settings()
    return {
        "clave_configurada": bool(settings.OPENROUTER_API_KEY),
        "modelos": modelos_disponibles(),
        "tools": bool(getattr(settings, "AGENTGD_TOOLS", True)),
        "vision": bool(getattr(settings, "AGENTGD_IMAGES", True)),
        "max_llamadas": int(getattr(settings, "AGENTGD_MAX_CALLS", 2)),
        "herramientas": len(catalogo.NOMBRES),
    }
