"""Pruebas de AgentGD sin llamar a OpenRouter.

Verifican el contrato del endpoint, el bucle de herramientas, los limites y
que las herramientas no expongan datos personales. La llamada al modelo se
reemplaza por un doble para que las pruebas sean deterministas y no consuman
cupo.
"""

import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base, get_db
from app.main import app
from app.models import Actor, ActorVariables
from app.security import get_current_user


@pytest.fixture()
def sesion():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Sesion = sessionmaker(bind=engine)

    with Sesion() as db:
        actor = Actor(
            nombre="Alcaldia de Prueba",
            tipo="gobierno_local",
            institucion="Alcaldia",
            email="privado@ejemplo.co",
            telefono="3000000000",
        )
        db.add(actor)
        db.flush()
        db.add(
            ActorVariables(
                actor_id=actor.id,
                poder=85,
                legitimidad=75,
                urgencia=70,
                influencia=80,
                interes=60,
                frecuencia_intentos=80,
                evaluado_por="lider",
            )
        )
        db.add(Actor(nombre="Entidad sincronizada", tipo="entidad_publica"))
        db.commit()

        from app.agentgd import contexto, limites

        contexto.invalidar()
        limites.reiniciar()
        yield db
        contexto.invalidar()
        limites.reiniciar()


@pytest.fixture()
def cliente(sesion):
    def db_de_prueba():
        yield sesion

    app.dependency_overrides[get_db] = db_de_prueba
    app.dependency_overrides[get_current_user] = lambda: {
        "email": "prueba@unal.edu.co",
        "role": "admin",
    }
    cliente = TestClient(app)
    try:
        yield cliente
    finally:
        app.dependency_overrides.clear()


def _mensaje(texto, herramientas=None):
    mensaje = {"role": "assistant", "content": texto}
    if herramientas:
        mensaje["tool_calls"] = herramientas
    return {
        "message": mensaje,
        "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        "model": "modelo-de-prueba",
    }


class TestBucle:
    def test_ejecuta_herramienta_y_devuelve_acciones(self, cliente, monkeypatch):
        llamadas = []

        def falso(platform, messages, **kwargs):
            llamadas.append(kwargs)
            if len(llamadas) == 1:
                return _mensaje(
                    "",
                    [
                        {
                            "id": "t1",
                            "type": "function",
                            "function": {
                                "name": "top_actores",
                                "arguments": json.dumps({"criterio": "indice", "limite": 5}),
                            },
                        }
                    ],
                )
            return _mensaje("La Alcaldia de Prueba lidera el ranking.")

        monkeypatch.setattr("app.agentgd.bucle.chat_completion", falso)

        respuesta = cliente.post(
            "/api/v1/agentgd/chat",
            json={"message": "Quien tiene el indice mas alto", "page": "/matriz"},
        )

        assert respuesta.status_code == 200
        datos = respuesta.json()
        assert datos["ok"] is True
        assert "Alcaldia" in datos["response"]
        assert datos["trazabilidad"] == ["top_actores"]
        assert {"etiqueta": "Ver matriz", "ruta": "/matriz"} in datos["acciones"]
        assert datos["uso"]["llamadas"] == 2
        # La segunda llamada ya no permite herramientas: debe redactar.
        assert llamadas[1]["tools"] is None

    def test_responde_sin_herramientas_en_una_llamada(self, cliente, monkeypatch):
        llamadas = []

        def falso(platform, messages, **kwargs):
            llamadas.append(kwargs)
            return _mensaje("Hay dos actores activos.")

        monkeypatch.setattr("app.agentgd.bucle.chat_completion", falso)

        datos = cliente.post(
            "/api/v1/agentgd/chat", json={"message": "Cuantos actores hay"}
        ).json()

        assert datos["response"] == "Hay dos actores activos."
        assert datos["trazabilidad"] == []
        assert len(llamadas) == 1
        assert llamadas[0]["tools"] is not None

    def test_rechaza_una_imagen_que_no_es_soportada(self, cliente):
        respuesta = cliente.post(
            "/api/v1/agentgd/chat",
            json={"message": "Mira esto", "image": "data:image/gif;base64,AAAA"},
        )
        assert respuesta.status_code == 400

    def test_el_historial_no_arrastra_mensajes_de_herramientas(self, cliente, monkeypatch):
        capturado = {}

        def falso(platform, messages, **kwargs):
            capturado["messages"] = messages
            return _mensaje("Listo.")

        monkeypatch.setattr("app.agentgd.bucle.chat_completion", falso)

        cliente.post(
            "/api/v1/agentgd/chat",
            json={
                "message": "Hola",
                "history": [
                    {"role": "tool", "content": "no debe viajar"},
                    {"role": "user", "content": "Hola"},
                    {"role": "assistant", "content": "Hola, soy AgentGD"},
                ],
            },
        )

        roles = [m["role"] for m in capturado["messages"]]
        assert roles.count("tool") == 0
        assert roles[0] == "system"


class TestHerramientas:
    def test_buscar_actores_no_expone_datos_de_contacto(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar(
            "buscar_actores", json.dumps({"texto": "Alcaldia"}), sesion
        )
        assert salida.datos["total"] == 1
        actor = salida.datos["actores"][0]
        assert "email" not in actor and "telefono" not in actor
        assert actor["indice_priorizacion"] > 0

    def test_explicar_priorizacion_distingue_las_dos_medidas(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar(
            "explicar_priorizacion", json.dumps({"nombre": "Alcaldia"}), sesion
        )
        datos = salida.datos
        assert datos["relevancia_mitchell"]["plu"] == "332"
        assert datos["relevancia_mitchell"]["niveles_0_a_3"] == {
            "poder": 3,
            "legitimidad": 3,
            "urgencia": 2,
        }
        assert "indice_priorizacion_pae" in datos
        assert "advertencia" in datos

    def test_navegar_solo_acepta_rutas_conocidas(self, sesion):
        from app.agentgd import herramientas

        valido = herramientas.ejecutar("navegar", json.dumps({"destino": "matriz"}), sesion)
        invalido = herramientas.ejecutar(
            "navegar", json.dumps({"destino": "https://ejemplo.com"}), sesion
        )
        assert valido.datos["navegacion"] is True
        assert valido.datos["ruta"] == "/matriz"
        assert invalido.datos["navegacion"] is False

    def test_una_herramienta_desconocida_no_rompe_la_respuesta(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar("borrar_todo", "{}", sesion)
        assert "error" in salida.datos

    def test_las_herramientas_son_de_solo_lectura(self):
        from app.agentgd import herramientas

        nombres = " ".join(herramientas.NOMBRES).lower()
        for verbo in ("crear", "eliminar", "actualizar", "borrar"):
            assert verbo not in nombres


class TestLimites:
    def test_la_ventana_por_usuario_se_respeta(self):
        from app.agentgd import limites

        limites.reiniciar()
        assert limites.permitir("a@b.co", 2) is True
        assert limites.permitir("a@b.co", 2) is True
        assert limites.permitir("a@b.co", 2) is False
        assert limites.permitir("otro@b.co", 2) is True

    def test_capacidades_publica_las_paginas(self, cliente):
        datos = cliente.get("/api/v1/agentgd/capacidades").json()
        assert datos["total_herramientas"] >= 10
        assert "/matriz" in datos["paginas"]
        assert datos["paginas"]["/matriz"]["preguntas"]
