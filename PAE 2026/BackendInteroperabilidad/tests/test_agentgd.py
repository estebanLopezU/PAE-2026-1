"""Pruebas de AgentGD (interoperabilidad) sin llamar a OpenRouter."""

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
from app.models import Entity, MaturityAssessment, Relationship, Sector, Service
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
        sector = Sector(name="Salud", code="SALUD")
        db.add(sector)
        db.flush()

        entidad = Entity(
            name="Ministerio de Salud de Prueba",
            acronym="MSP",
            nit="900000001",
            sector_id=sector.id,
            xroad_status="connected",
            department="Bogota",
            cio_name="Contacto Publico",
            cio_email="privado@ejemplo.co",
            cio_phone="3000000000",
        )
        otra = Entity(
            name="Entidad Pendiente",
            acronym="EP",
            nit="900000002",
            sector_id=sector.id,
            xroad_status="pending",
        )
        db.add_all([entidad, otra])
        db.flush()

        db.add(
            Service(
                entity_id=entidad.id,
                name="Consulta de afiliados",
                code="SALUD-AFILIADOS",
                category="Consulta",
                protocol="X-Road",
                status="active",
            )
        )
        db.add(
            MaturityAssessment(
                entity_id=entidad.id,
                overall_level=3,
                overall_score=72.0,
                legal_domain_score=80,
                organizational_domain_score=70,
                semantic_domain_score=55,
                technical_domain_score=85,
            )
        )
        db.add(
            Relationship(
                source_id=entidad.id,
                target_id=otra.id,
                protocol="X-Road",
                status="active",
            )
        )
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
        "email": "prueba@xroad.gov.co",
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
        "usage": {"prompt_tokens": 8, "completion_tokens": 4},
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
                                "name": "madurez_entidad",
                                "arguments": json.dumps({"nombre": "Ministerio de Salud"}),
                            },
                        }
                    ],
                )
            return _mensaje("El Ministerio esta en nivel Intermedio.")

        monkeypatch.setattr("app.agentgd.bucle.chat_completion", falso)

        datos = cliente.post(
            "/api/v1/agentgd/chat",
            json={"message": "Cual es la madurez del Ministerio", "page": "/evaluacion"},
        ).json()

        assert datos["ok"] is True
        assert datos["trazabilidad"] == ["madurez_entidad"]
        assert {"etiqueta": "Ver evaluacion de madurez", "ruta": "/evaluacion"} in datos["acciones"]
        assert datos["uso"]["llamadas"] == 2
        assert llamadas[1]["tools"] is None

    def test_responde_sin_herramientas(self, cliente, monkeypatch):
        monkeypatch.setattr(
            "app.agentgd.bucle.chat_completion",
            lambda *a, **k: _mensaje("Hay dos entidades."),
        )
        datos = cliente.post(
            "/api/v1/agentgd/chat", json={"message": "Cuantas entidades hay"}
        ).json()
        assert datos["response"] == "Hay dos entidades."
        assert datos["uso"]["llamadas"] == 1


class TestHerramientas:
    def test_ficha_no_expone_datos_de_contacto(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar(
            "ficha_entidad", json.dumps({"nombre": "Ministerio de Salud"}), sesion
        )
        texto = json.dumps(salida.datos)
        assert "privado@ejemplo.co" not in texto
        assert "3000000000" not in texto
        assert salida.datos["estado_xroad"] == "Conectada"

    def test_madurez_identifica_brechas(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar(
            "madurez_entidad", json.dumps({"nombre": "Ministerio de Salud"}), sesion
        )
        assert salida.datos["nivel"] == "Intermedio"
        assert "Dominio Semantico" in salida.datos["brechas_prioritarias"]

    def test_brechas_agrega_por_dominio(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar("brechas_dominio", json.dumps({"dominio": "todos"}), sesion)
        assert "Dominio Semantico" in salida.datos["dominios"]
        assert salida.datos["dominios"]["Dominio Semantico"]["promedio"] == 55.0

    def test_relaciones_describe_direccion(self, sesion):
        from app.agentgd import herramientas

        salida = herramientas.ejecutar(
            "relaciones_entidad", json.dumps({"nombre": "Ministerio de Salud"}), sesion
        )
        assert salida.datos["total"] == 1
        assert salida.datos["relaciones"][0]["direccion"] == "consume"

    def test_navegar_solo_acepta_rutas_conocidas(self, sesion):
        from app.agentgd import herramientas

        valido = herramientas.ejecutar("navegar", json.dumps({"destino": "madurez"}), sesion)
        invalido = herramientas.ejecutar("navegar", json.dumps({"destino": "externo"}), sesion)
        assert valido.datos["ruta"] == "/evaluacion"
        assert invalido.datos["navegacion"] is False
