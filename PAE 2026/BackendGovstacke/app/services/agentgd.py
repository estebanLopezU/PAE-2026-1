"""Cliente OpenRouter para el asistente AgentGD.

Encapsula la llamada a OpenRouter usando httpx y gestiona el
contexto del sistema según la plataforma.
"""
from typing import Dict, List, Optional, Any

import httpx

from ..config import get_settings


def call_agent(platform: str, system_prompt: str, history: Optional[List[Dict]] = None, user_message: str = "") -> str:
    """
    Llama al modelo de OpenRouter elegido (gratuito por defecto) con
    un contexto de sistema y el historial de la conversación.

    Args:
        platform:  'govstake' | 'interop' (solo para logging/referer)
        system_prompt: instrucciones de rol con datos del dashboard.
        history:    lista de {role, content} previa (hasta 12 turnos).
        user_message: la pregunta actual del usuario.

    Returns:
        texto de respuesta del asistente.
    """
    settings = get_settings()

    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY no está configurada en el backend.")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OSR_REFERER,
        "X-Title": f"AgentGD-{platform}",
    }

    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]

    # El frontend ya envía historial limpio; lo acotamos a los últimos 10.
    if history:
        messages.extend(history[-10:])

    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 900,
    }

    url = f"{settings.OPENROUTER_BASE_URL}/chat/completions"

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return (data["choices"][0]["message"]["content"] or "").strip()
    except httpx.HTTPStatusError as e:
        detail = ""
        try:
            detail = e.response.text[:500]
        except Exception:
            detail = ""
        raise RuntimeError(f"OpenRouter HTTP {e.response.status_code}: {detail}")
    except Exception as e:
        raise RuntimeError(f"Error al contactar OpenRouter: {e}")