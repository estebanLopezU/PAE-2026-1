"""Limite de peticiones por usuario para AgentGD.

Los modelos gratuitos de OpenRouter tienen un cupo diario y por minuto. Una
pregunta con herramientas consume hasta dos llamadas, asi que el agente se
protege tambien del lado del backend: una ventana deslizante por usuario
evita que una sola sesion agote el cupo de la demo.
"""

import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict, Tuple

__all__ = ["permitir", "restante", "reiniciar"]

_VENTANA_SEGUNDOS = 60.0
_REGISTRO: Dict[str, Deque[float]] = defaultdict(deque)
_LOCK = threading.Lock()


def _limpiar(cola: Deque[float], ahora: float) -> None:
    while cola and ahora - cola[0] > _VENTANA_SEGUNDOS:
        cola.popleft()


def permitir(clave: str, maximo: int) -> bool:
    """Registra una peticion si el usuario esta dentro del limite."""
    if maximo <= 0:
        return True
    ahora = time.monotonic()
    with _LOCK:
        cola = _REGISTRO[clave]
        _limpiar(cola, ahora)
        if len(cola) >= maximo:
            return False
        cola.append(ahora)
        return True


def restante(clave: str, maximo: int) -> Tuple[int, int]:
    """Devuelve (usadas, disponibles) en la ventana actual."""
    ahora = time.monotonic()
    with _LOCK:
        cola = _REGISTRO[clave]
        _limpiar(cola, ahora)
        usadas = len(cola)
    return usadas, max(0, maximo - usadas)


def reiniciar() -> None:
    """Vacía la ventana. Util en pruebas."""
    with _LOCK:
        _REGISTRO.clear()
