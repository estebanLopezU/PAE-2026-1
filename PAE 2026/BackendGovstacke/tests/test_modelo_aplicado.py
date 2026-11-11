"""Pruebas del modelo aplicado a los actores y de la reparacion del seed.

La primera parte verifica que la clasificacion que ve el usuario en la
aplicacion sea exactamente la del doctorado. La segunda verifica que el caso
piloto deje de estar sesgado por el seed no idempotente.
"""

import sys
from pathlib import Path
from types import SimpleNamespace

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.modelo import (
    CORRELACIONES_HIPOTESIS_F,
    EXPRESIONES,
    ORDEN_EXPRESIONES,
    buscar_caso_plu,
    recomendar_expresion,
    resumen_procedimiento,
    resumen_slx,
    resumen_teoria,
)
from app.modelo.contenido import ETICA, FUENTES, PROPOSITO, QUE_ES
from app.modelo.slx import ETAPAS_SLX
from app.models import clasificar_mitchell, niveles_mitchell
from app.seeds.seed_data import ACTORES_DE_EJEMPLO, seed_if_empty
from app.tipos_actor import claves_canonicas, normalizar_tipo


class TestClasificacionAplicada:
    def _actor(self, **kwargs):
        base = {
            "poder": 0,
            "legitimidad": 0,
            "urgencia": 0,
            "frecuencia_intentos": 0,
        }
        base.update(kwargs)
        return SimpleNamespace(**base)

    def test_actor_sin_atributos_no_tiene_percepcion(self):
        m = clasificar_mitchell(self._actor())
        assert m["plu"] == "000"
        assert m["tipo_mitchell"] == "no_relevante"
        assert m["sin_percepcion"] is True
        assert m["relevancia_calculada"] == 0.0
        assert m["expresion_sugerida"]["clave"] is None
        assert m["expresion_sugerida"]["origen"] == "sin_percepcion"

    def test_actor_con_los_tres_atributos_es_definitivo(self):
        m = clasificar_mitchell(
            self._actor(poder=85, legitimidad=75, urgencia=70, frecuencia_intentos=80)
        )
        assert m["niveles"] == {"poder": 3, "legitimidad": 3, "urgencia": 2}
        assert m["plu"] == "332"
        assert m["tipo_mitchell"] == "definitivo"
        assert m["grupo"] == "definitivo"
        assert m["relevancia_calculada"] == pytest.approx(2.77)
        assert m["rango"] == "alta"
        assert m["sin_percepcion"] is False
        assert m["expresion_sugerida"]["clave"] == "decision_conjunta"

    def test_dos_atributos_es_expectante(self):
        m = clasificar_mitchell(self._actor(poder=80, legitimidad=70))
        assert m["plu"] == "320"
        assert m["niveles"] == {"poder": 3, "legitimidad": 2, "urgencia": 0}
        assert m["tipo_mitchell"] == "expectante_dominante"
        assert m["grupo"] == "expectante"
        assert m["mitchell_count"] == 2

    def test_la_relevancia_mitchell_sigue_en_escala_0_100(self):
        m = clasificar_mitchell(
            self._actor(poder=100, legitimidad=100, urgencia=100)
        )
        assert m["relevancia_calculada"] == 3.0
        assert m["relevancia_mitchell"] == 100.0

    def test_umbral_en_nivel_baja(self):
        m = clasificar_mitchell(self._actor(poder=25))
        assert m["poder_presente"] is True
        assert m["niveles"]["poder"] == 1
        m = clasificar_mitchell(self._actor(poder=24))
        assert m["poder_presente"] is False
        assert m["niveles"]["poder"] == 0

    def test_niveles_desde_la_escala_continua(self):
        niveles = niveles_mitchell(self._actor(poder=10, legitimidad=40, urgencia=90))
        assert niveles == {"poder": 0, "legitimidad": 1, "urgencia": 3}


class TestExpresiones:
    def test_el_continuo_tiene_cuatro_expresiones_ordenadas(self):
        assert ORDEN_EXPRESIONES == (
            "autocracia",
            "consulta",
            "decision_conjunta",
            "delegacion",
        )
        grados = [EXPRESIONES[clave]["grado_influencia"] for clave in ORDEN_EXPRESIONES]
        assert grados == [1, 2, 3, 4]

    @pytest.mark.parametrize(
        "relevancia,frecuencia,esperada",
        [
            (0.50, 0, "autocracia"),
            (0.50, 3, "consulta"),
            (1.20, 0, "consulta"),
            (1.70, 0, "consulta"),
            (1.70, 2, "decision_conjunta"),
            (2.30, 2, "decision_conjunta"),
            (2.30, 0, "delegacion"),
        ],
    )
    def test_regla_de_recomendacion(self, relevancia, frecuencia, esperada):
        resultado = recomendar_expresion(relevancia, frecuencia)
        assert resultado["clave"] == esperada
        assert 50 <= resultado["confianza"] <= 90
        assert resultado["origen"] == "recomendacion_del_modelo"

    def test_la_recomendacion_cita_correlaciones(self):
        resultado = recomendar_expresion(1.20, 1)
        assert resultado["clave"] == "consulta"
        assert isinstance(resultado["correlaciones"], list)

    def test_toda_expresion_tiene_ficha_completa(self):
        for clave in ORDEN_EXPRESIONES:
            ficha = EXPRESIONES[clave]
            assert ficha["nombre"]
            assert ficha["descripcion"]
            assert ficha["practicas"]
            assert ficha["riesgo"]
            assert ficha["cuando_recomendar"]


class TestContenidoTeorico:
    def test_el_resumen_tiene_todas_las_secciones(self):
        teoria = resumen_teoria()
        for clave in ("que_es", "proposito", "etica", "fuentes", "slx", "procedimiento"):
            assert clave in teoria
        assert teoria["total_casos"] == 64
        assert len(teoria["expresiones"]) == 4
        assert len(teoria["niveles"]) == 4
        assert len(teoria["rangos"]) == 5

    def test_que_es_responde_la_pregunta_en_una_frase(self):
        assert QUE_ES["frase"]
        assert "GOVStake 360" in QUE_ES["frase"]
        assert len(QUE_ES["pilares"]) == 4

    def test_el_bloque_etico_cubre_los_principios(self):
        claves = {p["clave"] for p in ETICA["principios"]}
        assert {"percepcion", "finalidad", "transparencia", "supervision", "anonimizacion"} <= claves
        assert len(PROPOSITO["usos"]) >= 4
        assert FUENTES["principal"]

    def test_el_modelo_slx_tiene_cuatro_etapas(self):
        assert len(ETAPAS_SLX) == 4
        assert [e["orden"] for e in resumen_slx()["etapas"]] == [1, 2, 3, 4]

    def test_el_procedimiento_tiene_cinco_etapas(self):
        resumen = resumen_procedimiento()
        assert resumen["total"] == 5
        assert [e["numero"] for e in resumen["etapas"]] == [1, 2, 3, 4, 5]
        for etapa in resumen["etapas"]:
            assert etapa["evidencia_en_govstake"]
            assert etapa["cita"]

    def test_las_correlaciones_estan_documentadas(self):
        assert len(CORRELACIONES_HIPOTESIS_F) >= 7
        for c in CORRELACIONES_HIPOTESIS_F:
            assert c["expresion"] in ORDEN_EXPRESIONES
            assert isinstance(c["rho"], float)


class TestVocabularioDeTipos:
    def test_los_alias_de_los_filtros_muertos_se_normalizan(self):
        assert normalizar_tipo("organizacion") == "organizaciones"
        assert normalizar_tipo("concejo") == "concejo_municipal"
        assert normalizar_tipo("medio_comunicacion") == "medios"
        assert normalizar_tipo("veedurias") == "veeduria"

    def test_todos_los_tipos_tienen_protocolo(self):
        from app.api.v1.endpoints.protocolo import PROTOCOLOS
        from app.tipos_actor import TIPOS_ACTOR

        for item in TIPOS_ACTOR:
            assert item["protocolo"] in PROTOCOLOS, (
                f"{item['clave']} sin protocolo {item['protocolo']}"
            )

    def test_no_hay_tipos_canonicos_duplicados(self):
        claves = claves_canonicas()
        assert len(claves) == len(set(claves))
        assert "entidad_publica" in claves

    def test_el_tipo_desconocido_se_conserva(self):
        assert normalizar_tipo("tipo_inventado") == "tipo_inventado"


class TestSeedIdempotente:
    @pytest.fixture()
    def db(self):
        from app.database import Base

        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        sesion = Session()
        try:
            yield sesion
        finally:
            sesion.close()

    def test_repara_los_ceros_de_los_actores_demo(self, db):
        from app.models import Actor, ActorVariables

        actor = Actor(
            nombre="Alcaldía de [Municipio]",
            tipo="gobierno_local",
            descripcion="Actor creado antes de existir urgencia",
        )
        db.add(actor)
        db.flush()
        db.add(ActorVariables(actor_id=actor.id, poder=85, legitimidad=75))
        db.commit()

        seed_if_empty(db)

        variables = db.query(ActorVariables).filter_by(actor_id=actor.id).first()
        assert variables.urgencia == 70
        assert variables.frecuencia_intentos == 40
        # No sobrescribe lo que ya estaba registrado
        assert variables.poder == 85

    def test_no_duplica_actores_ni_pisa_valores_del_lider(self, db):
        from app.models import Actor, ActorVariables

        actor = Actor(nombre="Concejo Municipal", tipo="concejo_municipal")
        db.add(actor)
        db.flush()
        db.add(ActorVariables(actor_id=actor.id, poder=10, legitimidad=10, urgencia=99))
        db.commit()

        seed_if_empty(db)
        seed_if_empty(db)

        assert db.query(Actor).filter_by(nombre="Concejo Municipal").count() == 1
        variables = db.query(ActorVariables).filter_by(actor_id=actor.id).first()
        assert variables.urgencia == 99
        assert variables.frecuencia_intentos == 35

    def test_crea_los_actores_que_falten(self, db):
        from app.models import Actor

        creados = seed_if_empty(db)
        assert creados == len(ACTORES_DE_EJEMPLO)
        assert db.query(Actor).count() == len(ACTORES_DE_EJEMPLO)
        assert seed_if_empty(db) == 0
        assert db.query(Actor).count() == len(ACTORES_DE_EJEMPLO)


class TestCasoDeControl:
    def test_el_caso_123_con_frecuencia_alta_es_decision_conjunta(self):
        caso = buscar_caso_plu("123")
        expresion = recomendar_expresion(caso["relevancia_calculada"], 2, caso["niveles"])
        assert expresion["clave"] == "decision_conjunta"

    def test_el_caso_123_con_frecuencia_nula_es_consulta(self):
        caso = buscar_caso_plu("123")
        expresion = recomendar_expresion(caso["relevancia_calculada"], 0, caso["niveles"])
        assert expresion["clave"] == "consulta"
