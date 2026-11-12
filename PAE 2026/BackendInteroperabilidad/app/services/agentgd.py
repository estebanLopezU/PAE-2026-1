"""Cliente OpenRouter para el asistente AgentGD (Interoperabilidad).

Soporta texto, imagenes y function calling. Mantiene ``call_agent`` para no
romper integraciones anteriores.
"""

from typing import Any, Dict, List, Optional

import httpx

from ..config import get_settings

__all__ = ["call_agent", "chat_completion", "modelos_disponibles"]


def _candidatos(settings, vision: bool, preferido: Optional[str] = None) -> List[str]:
    if vision:
        base = preferido or getattr(settings, "OPENROUTER_VISION_MODEL", "") or settings.OPENROUTER_MODEL
        respaldos = ("nvidia/nemotron-3.5-super-vl:free", "google/gemma-4-31b-it:free")
    else:
        base = preferido or settings.OPENROUTER_MODEL
        respaldos = ("nvidia/nemotron-3.5-lightning:free", "google/gemma-4-31b-it:free")

    extra = getattr(settings, "OPENROUTER_FALLBACK_MODELS", "") or ""
    respaldos = tuple(m.strip() for m in extra.split(",") if m.strip()) + respaldos

    cadena = [base]
    for modelo in respaldos:
        if modelo and modelo not in cadena:
            cadena.append(modelo)
    return cadena[:3]


def _texto_contenido(contenido: Any) -> str:
    if isinstance(contenido, str):
        return contenido.strip()
    if isinstance(contenido, list):
        partes = []
        for parte in contenido:
            if isinstance(parte, dict) and parte.get("type") == "text":
                partes.append(str(parte.get("text") or ""))
            elif isinstance(parte, str):
                partes.append(parte)
        return "".join(partes).strip()
    return ""


def _payload(modelo: str, messages: List[Dict], tools, tool_choice, max_tokens):
    payload: Dict[str, Any] = {
        "model": modelo,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }
    if "nemotron" in modelo:
        payload["reasoning"] = {"enabled": False}
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = tool_choice or "auto"
    return payload


def chat_completion(
    platform: str,
    messages: List[Dict],
    *,
    model: Optional[str] = None,
    tools: Optional[List[Dict]] = None,
    tool_choice: Optional[str] = None,
    max_tokens: int = 900,
    vision: bool = False,
) -> Dict[str, Any]:
    """Una llamada a OpenRouter con cadena corta de respaldo."""
    settings = get_settings()

    if not settings.OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY no esta configurada en el backend.")

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": settings.OSR_REFERER,
        "X-Title": f"AgentGD-{platform}",
    }

    url = f"{settings.OPENROUTER_BASE_URL}/chat/completions"
    fallback_status = (400, 404, 429, 502, 503, 504)
    ultimo_error: Optional[RuntimeError] = None

    try:
        with httpx.Client(timeout=50.0) as client:
            for modelo in _candidatos(settings, vision, model):
                payload = _payload(modelo, messages, tools, tool_choice, max_tokens)
                try:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code in fallback_status:
                        ultimo_error = RuntimeError(
                            f"OpenRouter HTTP {resp.status_code} ({modelo}): {resp.text[:300]}"
                        )
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    eleccion = (data.get("choices") or [{}])[0]
                    mensaje = eleccion.get("message") or {}
                    mensaje["content"] = _texto_contenido(mensaje.get("content"))
                    return {
                        "message": mensaje,
                        "usage": data.get("usage") or {},
                        "model": data.get("model") or modelo,
                    }
                except httpx.HTTPStatusError as exc:
                    detalle = ""
                    try:
                        detalle = exc.response.text[:400]
                    except Exception:
                        detalle = ""
                    error = RuntimeError(
                        f"OpenRouter HTTP {exc.response.status_code}: {detalle}"
                    )
                    if exc.response.status_code in fallback_status:
                        ultimo_error = error
                        continue
                    raise error
        raise ultimo_error or RuntimeError("OpenRouter no devolvio respuesta.")
    except RuntimeError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Error al contactar OpenRouter: {exc}")


def call_agent(
    platform: str,
    system_prompt: str,
    history: Optional[List[Dict]] = None,
    user_message: str = "",
) -> str:
    messages: List[Dict] = [{"role": "system", "content": system_prompt}]
    if history:
        messages.extend(history[-10:])
    messages.append({"role": "user", "content": user_message})

    resultado = chat_completion(platform, messages)
    return resultado["message"].get("content") or ""


def modelos_disponibles() -> Dict[str, str]:
    settings = get_settings()
    return {
        "texto": settings.OPENROUTER_MODEL,
        "vision": getattr(settings, "OPENROUTER_VISION_MODEL", ""),
        "respaldo": getattr(settings, "OPENROUTER_FALLBACK_MODELS", ""),
    }
