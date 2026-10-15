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

    # Modelos gratuitos de respaldo: si el principal se vence (404),
    # se cuota (429) o falla intermitentemente (5xx), se intenta el siguiente.
    candidate_models = [settings.OPENROUTER_MODEL]
    for alt in ("nvidia/nemotron-3.5-lightning:free", "google/gemma-4-31b-it:free"):
        if alt not in candidate_models:
            candidate_models.append(alt)

    url = f"{settings.OPENROUTER_BASE_URL}/chat/completions"
    fallback_status = (404, 429, 502, 503)
    last_error: Optional[RuntimeError] = None

    try:
        with httpx.Client(timeout=60.0) as client:
            for model in candidate_models:
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 900,
                    # Nemotron (free) es razonador: sin esto, gasta los tokens
                    # en razonamiento y devuelve contenido vacío.
                    "reasoning": {"enabled": False},
                }
                try:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code in fallback_status:
                        last_error = RuntimeError(
                            f"OpenRouter HTTP {resp.status_code}: {resp.text[:300]}"
                        )
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    return (data["choices"][0]["message"]["content"] or "").strip()
                except httpx.HTTPStatusError as e:
                    detail = ""
                    try:
                        detail = e.response.text[:500]
                    except Exception:
                        detail = ""
                    err = RuntimeError(f"OpenRouter HTTP {e.response.status_code}: {detail}")
                    if e.response.status_code in fallback_status:
                        last_error = err
                        continue
                    raise err
        raise last_error if last_error else RuntimeError("OpenRouter no devolvió respuesta.")
    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Error al contactar OpenRouter: {e}")