"""Limite de peticiones por usuario para AgentGD.

Una ventana deslizante por usuario protege el cupo diario de los modelos
gratuitos y evita que una sola sesion agote la demo.
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
    ahora = time.monotonic()
    with _LOCK:
        cola = _REGISTRO[clave]
        _limpiar(cola, ahora)
        usadas = len(cola)
    return usadas, max(0, maximo - usadas)


def reiniciar() -> None:
    with _LOCK:
        _REGISTRO.clear()
