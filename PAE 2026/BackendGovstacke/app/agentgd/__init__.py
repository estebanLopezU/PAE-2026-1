"""Nucleo del asistente AgentGD para GOVStake 360.

Modulos:

* ``contexto``     - snapshot acotado del estado de la plataforma.
* ``herramientas`` - skills de consulta de solo lectura (function calling).
* ``navegacion``   - rutas permitidas y guia de cada pantalla.
* ``prompts``      - reglas, conocimiento del modelo y armado del prompt.
* ``vision``       - validacion de imagenes.
* ``limites``      - ventana de peticiones por usuario.
* ``bucle``        - orquestador de la conversacion.

Regla de arquitectura: el agente consulta la base a traves de herramientas y
cita la teoria de ``app.modelo``. No duplica datos ni formulas.
"""

from .bucle import LimiteExcedido, responder

__all__ = ["responder", "LimiteExcedido"]
