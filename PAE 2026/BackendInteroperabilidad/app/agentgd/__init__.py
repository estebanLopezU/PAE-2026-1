"""Nucleo del asistente AgentGD para la plataforma de interoperabilidad.

Modulos: ``contexto`` (snapshot), ``herramientas`` (skills de consulta),
``navegacion`` (rutas y guia), ``prompts`` (reglas y conocimiento),
``vision`` (imagenes), ``limites`` (peticiones por usuario) y ``bucle``
(orquestador).
"""

from .bucle import LimiteExcedido, responder

__all__ = ["responder", "LimiteExcedido"]
