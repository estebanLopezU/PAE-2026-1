"""Verificacion del nucleo teorico contra el doctorado.

Las pruebas comparan el calculo de GOVStake 360 con la transcripcion literal
de las Tablas 4.4 y 4.5 de "Liderazgo y grupos de interes" (Pantoja Ospina,
2015). Si estas pruebas pasan, la clasificacion que muestra la aplicacion es
la del documento original, caso por caso.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.modelo.datos_tesis import (  # noqa: E402
    PESOS_TESIS,
    PESOS_TESIS_NUMERADOR,
    TABLA_4_5_REFERENCIA,
)
from app.modelo.escala import nivel_a_etiqueta, valor_100_a_nivel  # noqa: E402
from app.modelo.plu import (  # noqa: E402
    TABLA_CASOS,
    buscar_caso_plu,
    generar_tabla_casos,
    identificacion_estado,
    rango_relevancia,
    relevancia_calculada,
)
from app.modelo.ponderacion import pesos_desde_puntos, ponderar  # noqa: E402


class TestTablaDeCasos:
    """La tabla generada debe coincidir con la tabla impresa del doctorado."""

    def test_la_tabla_tiene_64_casos(self):
        assert len(TABLA_CASOS) == 64

    def test_coincide_con_las_tablas_4_4_y_4_5(self):
        """64 de 64 casos: caso, PLU, identificacion, estado, relevancia y rango."""
        referencia = {fila[0]: fila for fila in TABLA_4_5_REFERENCIA}
        assert len(referencia) == 64

        for caso in TABLA_CASOS:
            esperado = referencia[caso["caso"]]
            numero, plu, identificacion, estado, relevancia, rango = esperado
            assert caso["plu"] == plu, f"PLU del caso {numero}"
            assert caso["identificacion"] == identificacion, f"identificacion del caso {numero}"
            assert caso["estado"] == estado, f"estado del caso {numero}"
            assert caso["relevancia_calculada"] == pytest.approx(
                relevancia, abs=0.005
            ), f"relevancia del caso {numero} ({plu})"
            assert caso["rango"] == rango, f"rango del caso {numero} ({plu})"

    def test_el_orden_es_jerarquico_por_relevancia(self):
        relevancia = [caso["relevancia_calculada"] for caso in TABLA_CASOS]
        assert relevancia == sorted(relevancia)

    def test_el_numero_de_caso_sigue_la_enumeracion_de_la_tesis(self):
        """caso = 1 + 16*P + 4*L + U (Tablas 4.3 y 4.4)."""
        for caso in TABLA_CASOS:
            esperado = (
                1
                + 16 * caso["poder"]
                + 4 * caso["legitimidad"]
                + caso["urgencia"]
            )
            assert caso["caso"] == esperado

    def test_caso_de_control_del_ejemplo_del_doctorado(self):
        """Ejemplo de la nota 39: PLU 123 -> relevancia 1,80."""
        caso = buscar_caso_plu("123")
        assert caso["caso"] == 28
        assert caso["relevancia_calculada"] == 1.80
        assert caso["rango"] == "media_alta"

    def test_casos_extremos(self):
        nulo = buscar_caso_plu("000")
        assert nulo["caso"] == 1
        assert nulo["identificacion"] == "Nulo"
        assert nulo["estado"] == "Nulo"
        assert nulo["relevancia_calculada"] == 0.00
        assert nulo["rango"] == "nula"

        maximo = buscar_caso_plu("333")
        assert maximo["caso"] == 64
        assert maximo["identificacion"] == "Definitivo"
        assert maximo["estado"] == "Definitivo"
        assert maximo["relevancia_calculada"] == 3.00
        assert maximo["rango"] == "alta"


class TestPonderacion:
    def test_los_pesos_publicados_suman_uno(self):
        assert sum(PESOS_TESIS.values()) == pytest.approx(1.0)
        assert PESOS_TESIS["poder"] == pytest.approx(13 / 30)
        assert PESOS_TESIS["legitimidad"] == pytest.approx(10 / 30)
        assert PESOS_TESIS["urgencia"] == pytest.approx(7 / 30)

    def test_ponderacion_por_apareamiento(self):
        """Reparto 10-0, 7-3, 5-5 sobre las tres parejas de la Tabla 4.1."""
        resultado = ponderar(
            [
                {"a": "poder", "b": "legitimidad", "puntos_a": 10, "puntos_b": 0},
                {"a": "poder", "b": "urgencia", "puntos_a": 7, "puntos_b": 3},
                {"a": "legitimidad", "b": "urgencia", "puntos_a": 5, "puntos_b": 5},
            ]
        )
        # poder = 10 + 7 = 17; legitimidad = 0 + 5 = 5; urgencia = 3 + 5 = 8
        assert resultado["subtotales"] == {
            "poder": 17,
            "legitimidad": 5,
            "urgencia": 8,
        }
        assert sum(resultado["pesos"].values()) == pytest.approx(1.0)

    def test_un_reparto_invalido_se_rechaza(self):
        with pytest.raises(ValueError):
            ponderar(
                [
                    {"a": "poder", "b": "legitimidad", "puntos_a": 8, "puntos_b": 8},
                ]
            )

    def test_subtotales_invalidos_se_rechazan(self):
        with pytest.raises(ValueError):
            pesos_desde_puntos({"poder": 10, "legitimidad": 10, "urgencia": 5})


class TestEscala:
    @pytest.mark.parametrize(
        "valor,nivel",
        [
            (0, "nula"),
            (24, "nula"),
            (25, "baja"),
            (49, "baja"),
            (50, "media"),
            (74, "media"),
            (75, "alta"),
            (100, "alta"),
            (None, "nula"),
        ],
    )
    def test_traduccion_de_la_escala(self, valor, nivel):
        assert valor_100_a_nivel(valor) == nivel

    def test_etiquetas_legibles(self):
        assert nivel_a_etiqueta("nula") == "Nula"
        assert nivel_a_etiqueta("alta") == "Alta"


class TestIdentificacionYEstado:
    @pytest.mark.parametrize(
        "poder,legitimidad,urgencia,identificacion,estado",
        [
            (0, 0, 0, "Nulo", "Nulo"),
            (2, 0, 0, "Inactivo", "Latente"),
            (0, 2, 0, "Discrecional", "Latente"),
            (0, 0, 2, "Demandante", "Latente"),
            (2, 2, 0, "Dominante", "Expectante"),
            (2, 0, 2, "Peligroso", "Expectante"),
            (0, 2, 2, "Dependiente", "Expectante"),
            (2, 2, 2, "Definitivo", "Definitivo"),
        ],
    )
    def test_reglas_de_mitchell(self, poder, legitimidad, urgencia, identificacion, estado):
        meta = identificacion_estado(poder, legitimidad, urgencia)
        assert meta["identificacion"] == identificacion
        assert meta["estado"] == estado

    def test_un_nivel_fuera_de_escala_se_rechaza(self):
        with pytest.raises(ValueError):
            identificacion_estado(4, 1, 1)


class TestRelevancia:
    def test_rangos(self):
        assert rango_relevancia(0.00) == "nula"
        assert rango_relevancia(0.23) == "baja"
        assert rango_relevancia(1.00) == "baja"
        assert rango_relevancia(1.03) == "media_baja"
        assert rango_relevancia(1.47) == "media_baja"
        assert rango_relevancia(1.53) == "media_alta"
        assert rango_relevancia(1.97) == "media_alta"
        assert rango_relevancia(2.00) == "alta"
        assert rango_relevancia(3.00) == "alta"

    def test_la_relevancia_usa_el_numerador_exacto_de_la_tesis(self):
        """(13*P + 10*L + 7*U) / 30 es la forma exacta de la tabla impresa."""
        for poder in range(4):
            for legitimidad in range(4):
                for urgencia in range(4):
                    esperado = (
                        PESOS_TESIS_NUMERADOR["poder"] * poder
                        + PESOS_TESIS_NUMERADOR["legitimidad"] * legitimidad
                        + PESOS_TESIS_NUMERADOR["urgencia"] * urgencia
                    ) / 30
                    assert relevancia_calculada(poder, legitimidad, urgencia) == pytest.approx(
                        esperado, abs=0.005
                    )

    def test_una_ponderacion_propia_cambia_el_resultado(self):
        """La relevancia es la percepcion del entrevistado, no una constante."""
        propios = {"poder": 1.0, "legitimidad": 0.0, "urgencia": 0.0}
        assert relevancia_calculada(3, 0, 0, pesos=propios) == 3.0
        assert relevancia_calculada(3, 0, 0) == pytest.approx(13 * 3 / 30)
