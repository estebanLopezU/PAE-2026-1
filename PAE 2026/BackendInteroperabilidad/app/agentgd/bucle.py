"""Orquestador de AgentGD para interoperabilidad: maximo dos llamadas.

El modelo decide entre responder o pedir herramientas; el backend ejecuta y
devuelve los resultados. En la segunda llamada ya no puede pedir herramientas:
debe redactar con lo obtenido.
"""

import json
import re
from typing import Any, Dict, List, Optional

from ..config import get_settings
from ..services.agentgd import chat_completion

__all__ = ["LimiteExcedido", "responder"]


class LimiteExcedido(RuntimeError):
    """El usuario supero el numero de preguntas por minuto."""


def _historial_limpio(historial: Optional[List[Dict[str, Any]]], maximo: int) -> List[Dict[str, str]]:
    if not historial:
        return []

    limpio: List[Dict[str, str]] = []
    for turno in historial:
        if not isinstance(turno, dict):
            continue
        rol = turno.get("role")
        contenido = turno.get("content")
        if rol not in ("user", "assistant") or not isinstance(contenido, str):
            continue
        texto = contenido.strip()
        if not texto:
            continue
        limpio.append({"role": rol, "content": texto[:2000]})

    limpio = limpio[-maximo:]

    total = 0
    recortado: List[Dict[str, str]] = []
    for turno in reversed(limpio):
        total += len(turno["content"])
        if total > 6000:
            break
        recortado.append(turno)
    return list(reversed(recortado))


def _mensaje_usuario(texto: str, imagen: Optional[str]) -> Dict[str, Any]:
    if not imagen:
        return {"role": "user", "content": texto}
    return {
        "role": "user",
        "content": [
            {"type": "text", "text": texto},
            {"type": "image_url", "image_url": {"url": imagen}},
        ],
    }


def _texto_final(mensaje: Dict[str, Any]) -> str:
    contenido = mensaje.get("content")
    return contenido.strip() if isinstance(contenido, str) else ""


# Caracteres de control invisibles que algunos modelos devuelven con las tildes.
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def _limpiar(texto: str) -> str:
    """Quita caracteres de control de la respuesta final."""
    return _CONTROL.sub("", texto or "")


def _resumen_de_respaldo(usadas: List[str], resultados: List[Dict[str, Any]]) -> str:
    if not usadas:
        return (
            "No pude generar una respuesta en este momento. Intenta reformular la "
            "pregunta o revisa la pantalla directamente."
        )
    partes = ["No pude redactar la respuesta, pero estas son las consultas que si se completaron:"]
    partes.append("Consultas: " + ", ".join(usadas))
    for resultado in resultados[-2:]:
        try:
            texto = json.dumps(resultado, ensure_ascii=False, default=str)
        except Exception:
            texto = str(resultado)
        partes.append(texto[:1200])
    return "\n\n".join(partes)


def responder(
    db,
    usuario: Dict[str, Any],
    mensaje: str,
    historial: Optional[List[Dict[str, Any]]] = None,
    pagina: Optional[str] = None,
    imagen: Optional[str] = None,
) -> Dict[str, Any]:
    from . import contexto, herramientas, limites, prompts, vision

    settings = get_settings()
    texto = (mensaje or "").strip()
    if not texto and not imagen:
        raise ValueError("Escribe una pregunta o adjunta una imagen.")

    if imagen and not getattr(settings, "AGENTGD_IMAGES", True):
        raise ValueError("La lectura de imagenes esta desactivada en esta instalacion.")
    if imagen:
        imagen = vision.validar_imagen(imagen)

    max_calls = max(1, min(int(getattr(settings, "AGENTGD_MAX_CALLS", 2)), 3))

    clave = (usuario or {}).get("email") or "anonimo"
    maximo = int(getattr(settings, "AGENTGD_REQUESTS_PER_MINUTE", 6))
    if not limites.permitir(clave, maximo):
        raise LimiteExcedido(
            f"Has hecho varias preguntas seguidas. Espera un minuto y vuelve a intentarlo "
            f"(limite: {maximo} por minuto)."
        )

    estado = contexto.texto_snapshot(db)
    system_prompt = prompts.sistema(pagina, estado)

    messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]
    messages.extend(
        _historial_limpio(historial, int(getattr(settings, "AGENTGD_MAX_HISTORY", 8)))
    )
    messages.append(_mensaje_usuario(texto or "Describe la imagen y relacionala con los datos.", imagen))

    usar_tools = bool(getattr(settings, "AGENTGD_TOOLS", True))
    esquemas = herramientas.ESQUEMAS if usar_tools else None
    max_tokens = int(getattr(settings, "AGENTGD_MAX_TOKENS", 900))
    vision_model = getattr(settings, "OPENROUTER_VISION_MODEL", None) if imagen else None

    usadas: List[str] = []
    acciones: List[Dict[str, str]] = []
    resultados: List[Dict[str, Any]] = []
    uso = {"tokens_entrada": 0, "tokens_salida": 0, "llamadas": 0, "modelo": ""}
    respuesta = ""

    for turno in range(max_calls):
        ultima = turno == max_calls - 1
        tools_turno = None if (ultima or not esquemas) else esquemas
        choice = None if not tools_turno else "auto"

        resultado = chat_completion(
            "interop",
            messages,
            model=vision_model,
            tools=tools_turno,
            tool_choice=choice,
            max_tokens=max_tokens,
            vision=bool(imagen),
        )
        uso["llamadas"] += 1
        uso["modelo"] = resultado.get("model") or uso["modelo"]
        tokens = resultado.get("usage") or {}
        uso["tokens_entrada"] += int(tokens.get("prompt_tokens") or 0)
        uso["tokens_salida"] += int(tokens.get("completion_tokens") or 0)

        mensaje_modelo = resultado.get("message") or {}
        llamadas = mensaje_modelo.get("tool_calls") or []

        if llamadas and tools_turno:
            messages.append(
                {
                    "role": "assistant",
                    "content": mensaje_modelo.get("content") or "",
                    "tool_calls": llamadas,
                }
            )
            for llamada in llamadas[:4]:
                funcion = llamada.get("function") or {}
                nombre = funcion.get("name") or ""
                salida = herramientas.ejecutar(nombre, funcion.get("arguments"), db)
                usadas.append(nombre)
                resultados.append(salida.datos)
                for accion in salida.acciones:
                    if accion not in acciones:
                        acciones.append(accion)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": llamada.get("id") or f"call_{len(messages)}",
                        "content": json.dumps(salida.datos, ensure_ascii=False, default=str)[:8000],
                    }
                )
            continue

        respuesta = _texto_final(mensaje_modelo)
        break

    if not respuesta:
        respuesta = _resumen_de_respaldo(usadas, resultados)

    usadas = list(dict.fromkeys(usadas))

    return {
        "response": _limpiar(respuesta),
        "ok": True,
        "acciones": acciones,
        "trazabilidad": usadas,
        "uso": uso,
        "vision": bool(imagen),
    }
