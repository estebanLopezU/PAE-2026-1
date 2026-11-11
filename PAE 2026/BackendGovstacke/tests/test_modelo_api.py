"""Pruebas de la API del modelo teorico.

Verifican que la teoria sea publica, que el calculo sea el del doctorado y que la
ficha por actor no exponga datos de actores sin valoracion del lider.
"""

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
def cliente():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    Sesion = sessionmaker(bind=engine)

    with Sesion() as db:
        actor = Actor(nombre="Alcaldía de [Municipio]", tipo="gobierno_local")
        db.add(actor)
        db.flush()
        db.add(
            ActorVariables(
                actor_id=actor.id,
                poder=85,
                legitimidad=75,
                urgencia=70,
                frecuencia_intentos=80,
            )
        )
        pendiente = Actor(nombre="Entidad sincronizada", tipo="entidad_publica")
        db.add(pendiente)
        db.commit()

    def db_de_prueba():
        db = Sesion()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = db_de_prueba
    app.dependency_overrides[get_current_user] = lambda: {"email": "prueba@unal.edu.co"}

    # Sin context manager: no se dispara el startup, que conectaria a la base
    # configurada en el entorno en lugar de la base de prueba.
    cliente = TestClient(app)
    try:
        yield cliente
    finally:
        app.dependency_overrides.clear()


class TestTeoriaPublica:
    @pytest.mark.parametrize(
        "ruta",
        [
            "/api/v1/modelo/teoria",
            "/api/v1/modelo/que-es",
            "/api/v1/modelo/plu",
            "/api/v1/modelo/plu/123",
            "/api/v1/modelo/expresiones",
            "/api/v1/modelo/procedimiento",
            "/api/v1/modelo/slx",
            "/api/v1/modelo/escala",
        ],
    )
    def test_las_rutas_de_teoria_no_exigen_sesion(self, cliente, ruta):
        app.dependency_overrides.pop(get_current_user, None)
        respuesta = cliente.get(ruta)
        assert respuesta.status_code == 200

    def test_el_caso_123_reproduce_la_tabla(self, cliente):
        d = cliente.get("/api/v1/modelo/plu/123").json()
        assert d["relevancia_calculada"] == 1.8
        assert d["rango"] == "media_alta"
        assert [p["aporte"] for p in d["pasos"]] == [0.4333, 0.6667, 0.7]
        assert d["expresion_sugerida"]["clave"] == "consulta"

    def test_el_calculo_ordinal_usa_la_regla_del_liderazgo(self, cliente):
        d = cliente.post(
            "/api/v1/modelo/calcular",
            json={"poder": 1, "legitimidad": 2, "urgencia": 3, "frecuencia_intentos": 2},
        ).json()
        assert d["plu"] == "123"
        assert d["relevancia_calculada"] == 1.8
        assert d["expresion_sugerida"]["clave"] == "decision_conjunta"

    def test_los_niveles_fuera_de_rango_se_rechazan(self, cliente):
        respuesta = cliente.post(
            "/api/v1/modelo/calcular",
            json={"poder": 4, "legitimidad": 2, "urgencia": 3},
        )
        assert respuesta.status_code == 422


class TestAplicacionPorActor:
    def test_la_ficha_del_actor_trae_plu_rango_y_expresion(self, cliente):
        d = cliente.get("/api/v1/modelo/actor/1").json()
        assert d["actor"]["nombre"] == "Alcaldía de [Municipio]"
        assert d["modelo"]["plu"] == "332"
        assert d["modelo"]["expresion_sugerida"]["clave"] == "decision_conjunta"
        assert d["slx"]["etapa_actual"]["orden"] == 1
        assert len(d["expresiones"]) == 4

    def test_un_actor_sin_valoracion_no_finge_percepcion(self, cliente):
        d = cliente.get("/api/v1/modelo/actor/2").json()
        assert d["modelo"]["sin_percepcion"] is True
        assert d["modelo"]["plu"] == "000"

    def test_el_panorama_cuenta_sin_percepcion(self, cliente):
        d = cliente.get("/api/v1/modelo/panorama").json()
        assert d["total_actores"] == 2
        assert d["sin_percepcion_del_lider"] == 1
        assert d["por_rango"]["alta"] == 1
