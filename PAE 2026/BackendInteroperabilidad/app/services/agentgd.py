"""Cliente OpenRouter para el asistente AgentGD (Interoperabilidad)."""
from typing import Dict, List, Optional

import httpx

from ..config import get_settings


def call_agent(platform: str, system_prompt: str, history: Optional[List[Dict]] = None, user_message: str = "") -> str:
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