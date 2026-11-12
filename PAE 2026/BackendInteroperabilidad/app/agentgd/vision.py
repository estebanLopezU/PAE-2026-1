"""Validacion de imagenes para AgentGD.

El frontend comprime la captura antes de enviarla. El backend verifica tipo,
tamano y forma del data URL. La imagen no se escribe en disco ni se registra.
"""

import base64
import re
from typing import Optional

__all__ = ["ErrorImagen", "TAMANO_MAXIMO_BYTES", "validar_imagen"]

TAMANO_MAXIMO_BYTES = 2_500_000

_PATRON = re.compile(
    r"^data:image/(png|jpe?g|webp);base64,([A-Za-z0-9+/=\s]+)$",
    re.IGNORECASE,
)


class ErrorImagen(ValueError):
    """La imagen no cumple el formato o el tamano permitido."""


def validar_imagen(data_url: Optional[str]) -> Optional[str]:
    if not data_url:
        return None

    texto = data_url.strip()
    if not texto:
        return None

    coincidencia = _PATRON.match(texto)
    if not coincidencia:
        raise ErrorImagen(
            "Solo puedo leer imagenes PNG, JPG o WEBP. Vuelve a adjuntar la captura."
        )

    carga = re.sub(r"\s+", "", coincidencia.group(2))
    if not carga:
        raise ErrorImagen("La imagen llego vacia. Intenta adjuntarla de nuevo.")

    estimado = len(carga) * 3 // 4
    if estimado > TAMANO_MAXIMO_BYTES:
        raise ErrorImagen(
            "La imagen supera los 2,5 MB. Recorta la captura o reduce su resolucion."
        )

    try:
        base64.b64decode(carga[:4096], validate=True)
    except Exception:
        raise ErrorImagen("La imagen no se pudo decodificar. Intenta adjuntarla de nuevo.")

    tipo = "jpeg" if coincidencia.group(1).lower() in ("jpg", "jpeg") else coincidencia.group(1).lower()
    return f"data:image/{tipo};base64,{carga}"
