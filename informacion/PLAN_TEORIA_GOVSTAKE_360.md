# Plan de cierre al 100 % del modelo teórico — GOVStake 360

**Base teórica:** Pantoja Ospina, M. A. (2015/2016). *Liderazgo y grupos de interés:
Influencia de los atributos de los grupos de interés en las expresiones del liderazgo
participativo en la organización*. Tesis doctoral, Universidad Nacional de Colombia,
Facultad de Ingeniería y Arquitectura, Departamento de Ingeniería Industrial, Manizales.
Archivo de referencia: `10281867.2016.pdf` (249 páginas, 6 capítulos).

**Propósito de este documento:** convertir GOVStake 360 en la aplicación digital del
modelo líder–stakeholder (SLX) y de la metodología de clasificación propuesta en el
Capítulo 4 del doctorado, y añadir a la aplicación una **parte teórica visible** para que
cualquier usuario o administrador entienda qué es GOVStake 360, cómo clasifica a los
actores y por qué recomienda una acción de relacionamiento.

**Estado actual del código:** `main` @ `7b07c0b`, desplegado en producción.

---

## 1. Qué aporta el doctorado que GOVStake 360 todavía no implementa

El PAE (`.docx`, sección *Justificación*) ya declara la conexión explícita:

> "El proyecto se conecta con la línea de trabajo del LABGT/LAGI@T y con la aplicación
> digital del modelo de relaciones líder-stakeholder, al permitir estudiar cómo los
> atributos de cada actor influyen en decisiones, consultas, delegaciones, acuerdos y
> mecanismos de participación en entidades públicas."

Ese "modelo de relaciones líder-stakeholder" es el **Modelo SLX** del Capítulo 2 de la
tesis. GOVStake 360 implementa hoy la clasificación de Mitchell (Capítulo 1 y 4), pero
**no** el modelo SLX, **no** la relevancia calculada, **no** las expresiones del liderazgo
participativo ni la metodología de las 5 etapas.

### 1.1 Matriz de brechas (verificada contra el código)

| # | Elemento del doctorado | Ubicación en la tesis | Estado en GOVStake 360 | Gap |
|---|---|---|---|---|
| B1 | Atributos poder / legitimidad / urgencia (Mitchell et al., 1997) | Cap. 1, Cap. 4 | `app/models/actor_variables.py` | — |
| B2 | Escala ordinal de 4 niveles: nula (0), baja (1), media (2), alta (3) | Cap. 3 §3.6.2.1, Cap. 4 paso 2 | Escala continua 0–100 | **Escala distinta** |
| B3 | 64 combinaciones PLU (Poder–Legitimidad–Urgencia) | Tabla 4.3 | No existe | **Falta tabla de 64 casos** |
| B4 | Identificación: inactivo, discrecional, demandante, dominante, peligroso, dependiente, definitivo | Cap. 1 §1.1, Cap. 4 paso 3 | 8 tipos Mitchell | — |
| B5 | Estado: nulo, latente, expectante, definitivo | Cap. 4 paso 3 | `grupo` en `MITCHELL_TIPOS` | — |
| B6 | **Ponderación por apareamiento** de atributos (3 parejas, 10 puntos cada una, total 30 → %) | Cap. 4 §4.3, Tabla 4.1 | No existe (pesos fijos hardcodeados) | **Falta procedimiento** |
| B7 | **Relevancia calculada** = `P·0,433 + L·0,30 + U·0,267` | Cap. 4 §4.4, fn. 39 | `(p+l+u)/3` — media simple | **Fórmula incorrecta** |
| B8 | 4 rangos de relevancia: Baja 0,23–1,0 · Media-Baja 1,03–1,47 · Media-Alta 1,53–1,97 · Alta >2,0 (16 casos cada uno) | Cap. 4 §4.4 paso 5, Tabla 4.5 | No existe | **Falta** |
| B9 | **Frecuencia de los intentos de influencia** (intencional, Homans 1961, escala 0–3) | Cap. 3 §3.6.1, Cap. 5 | Campo existe pero no participa en clasificación ni rango | **Falta integrar** |
| B10 | Metodología de **5 etapas** (ponderar → 64 combinaciones → identificar/estado → ordenar → rangos) | Cap. 4 §4.3–4.4 | No existe como procedimiento auditable | **Falta** |
| B11 | **4 expresiones del liderazgo participativo**: autocracia, consulta, decisión conjunta, delegación (Yukl 2010, p. 88) | Cap. 1 Fig. 1.1, Cap. 5 | No existe | **Gap central** |
| B12 | **Modelo SLX**: expectativas del papel → papel transmitido → papel recibido → conducta en el papel (Katz & Kahn, 1978) | Cap. 2 §2.2.5, Fig. 2.5 | No existe | **Gap central** |
| B13 | Correlaciones empíricas atributos → expresión (Hipótesis F) | Cap. 5 §5.3.2 | No existe | **Falta** |
| B14 | Hipótesis L: la relevancia se asocia a la frecuencia de intentos de influencia | Cap. 5 §5.2 | Parcial (campo sin uso) | **Falta** |
| B15 | Hipótesis J/K: los stakeholders externos influyen más que los internos (0,292 vs 0,25) | Cap. 5 §5.3.3, §5.4.3 | No existe (el modelo no distingue interno/externo) | **Falta** |
| B16 | Preguntas de investigación 1–4 e hipótesis A–O | Cap. 5 (síntesis) | No trazadas | **Falta** |
| B17 | Página de fundamentos para usuario y administrador | — (aplicación) | No existe | **Falta** |
| B18 | Vocabulario canónico de tipos de actor | Cap. 4 (actor como stakeholder tipificado) | Partido en 3 capas: 3 filtros devuelven 0 resultados | **Bug** |
| B19 | Consentimiento, anonimización, permisos, supervisión docente | — (PAE, bloque ético) | No existe | **Falta** |
| B20 | Socialización de resultados (póster/presentación) | — (PAE, producto P6) | No existe | **Falta** |

---

## 2. Arquitectura objetivo

### 2.1 Módulo teórico en el backend — fuente única de verdad

Nuevo paquete `PAE 2026/BackendGovstacke/app/modelo/`:

```text
app/modelo/
  __init__.py        # API pública: calcular_relevancia, clasificar_plu, expresiones...
  escala.py          # B2  ordinal 0-3 + conversión desde 0-100 +levels_umbral
  plu.py             # B3  tabla de 64 casos (codigo PLU -> identificacion, estado, rango)
  ponderacion.py     # B6  apareamiento de 3 parejas -> pesos (43,3 / 30,0 / 26,7 por defecto)
  relevancia.py      # B7+B8 relevancia calculada + 4 rangos
  expresiones.py     # B11+B13 4 expresiones + correlaciones empiricas (Hip. F/G)
  slx.py             # B12 los 4 conceptos del episodio del papel + ciclo de retroalimentacion
  procedimiento.py   # B10 las 5 etapas como pipeline auditable
  contenido.py       # B17 contenido teorico serializable (texto que consume la UI)
```

Regla de arquitectura: **el contenido teórico vive en Python, no en el JSX**. La API lo
sirve, la UI lo pinta, el chatbot (AgentGD) lo cita y el generador de reportes lo exporta.
Así latheory nunca diverge de lo que la aplicación calcula.

### 2.2 Capa de persistencia

Tres tablas nuevas (migración Alembic o `create_all` + script de migración explícito):

```text
ponderaciones        # id, usuario_id, poder, legitimidad, urgencia (puntos 0-30), fecha
                     # -> pesos derivados (p/30, l/30, u/30)
valoraciones         # actor_id, evaluador_id, plu (3 digitos), nivel_poder, nivel_legitimidad,
                     # nivel_urgencia, nivel_frecuencia, procedencia, fecha
                     # -> relevancia calculada, rango, caso PLU, identificacion, estado
expresiones_liderazgo # actor_id, expresion (autocracia|consulta|decision_conjunta|delegacion),
                     # confianza (0-100), origen (regla SLX|usuario), actor_relacionado,
                     # fecha, nota
```

Los cálculos **derivados** (relevancia, rango, caso PLU) se guardan en `valoraciones`
para poder auditar qué cambió y cuándo, tal como exige el rigor metodológico de la tesis.

### 2.3 Rutas de API nuevas

```text
GET  /api/v1/modelo/teorico              # contenido teorico completo (B17)
GET  /api/v1/modelo/procedimiento        # las 5 etapas con su descripcion (B10)
GET  /api/v1/modelo/plu/{codigo}         # ficha de un caso de los 64 (B3)
GET  /api/v1/modelo/plu                  # tabla completa de 64 casos
GET  /api/v1/modelo/ponderacion          # ponderacion vigente del usuario (B6)
PUT  /api/v1/modelo/ponderacion          # guardar ponderacion (admin)
GET  /api/v1/modelo/actores/{id}/relevancia   # caso PLU + relevancia + rango + SLX (B7+B8+B12)
POST /api/v1/modelo/actores/{id}/expresiones  # registrar conducta en el papel (B11)
```

### 2.4 Frontend — la parte teórica que verá el usuario

Nueva ruta `/modelo` (protegida) y nueva ruta pública `/que-es-govstake`:

```text
Sidebar:
  Dashboard | Actores | Matriz y Mapa | Mitchell | Fundamentos | Compromisos |
  Relacionamiento | Alertas | Protocolo | Reportes
```

`/modelo` (Fundamentos del modelo) con 7 secciones navegables:

1. **¿Qué es GOVStake 360?** — problema público, qué resuelve, de dónde viene el marco.
2. **Modelo SLX** — diagrama de los 4 conceptos con el actor real de la BD y su estado
   actual: expectativas del papel → papel transmitido → papel recibido → conducta en el papel.
3. **Atributos y escala** — poder, legitimidad, urgencia, frecuencia; escala verbal de
   4 niveles con su equivalencia en la escala 0–100 que usa la interfaz.
4. **Los 64 casos PLU** — buscador interactivo por código (p. ej. `123`) que devuelve
   identificación, estado, relevancia calculada y rango. Es la tabla 4.3/4.4 del doctorado.
5. **Relevancia calculada y rangos** — el cálculo paso a paso con las 4 bandas.
6. **Expresiones del liderazgo participativo** — autocracia / consulta / decisión conjunta /
   delegación, con las correlaciones empíricas de la Hipótesis F y el protocolo de
   acción recomendado por tipo de actor.
7. **Metodología de 5 etapas** — el procedimiento paso a paso con el estado en que está
   cada etapa para la entidad.

`/que-es-govstake` (pública, sin login): resumen ejecutivo del modelo, el mapa PLI, los
tipos de actor y un botón "Iniciar sesión". Sirve para que un evaluador externo que llega
por el enlace entienda la herramienta antes de autenticar.

### 2.5 Integración funcional (para que el modelo no sea decorativo)

- **Protocolo por actor**: hoy devuelve canales y requisitos por tipo. Se amplía con la
  *expresión de liderazgo participativo* sugerida por el modelo (consulta / decisión
  conjunta / delegación según la relevancia y la frecuencia), es decir, el protocolo
  pasa de "cómo relacionarme" a "cómo relacionarme y con qué grado de autonomía".
- **Alertas**: una alerta SLX se dispara cuando el actor tiene un caso PLU de alta
  relevancia y baja frecuencia de intentos (relevancia no capturada) o alta frecuencia con
  relevancia media (presión recurrente sobre un actor poco formalizado).
- **Reportes**: el reporte ejecutivo incluye el histograma de los 64 casos, los 4 rangos
  y la distribución de expresiones de liderazgo sugeridas.
- **AgentGD**: responde citing el modelo (ej. "¿por qué este actor es prioritario?"
  → caso PLU, rango, correlación que sustenta la expresión sugerida).

---

## 3. Fases de trabajo (una por commit, estilo `conventional commits`)

| Fase | Alcance | Archivos principales | Entregable verificable |
|---|---|---|---|
| **F0** | Vocabulario canónico de tipos + corrección de los 3 filtros muertos + bloque ético (consentimiento, anonimización, permiso institucional, supervisor) | `app/tipos_actor.py`, `app/schemas/actor.py`, `app/models/actor.py`, `Frontend.../Actores.jsx` | `/actors?tipo=organizacion` devuelve el actor correcto; 12 tipos del PAE disponibles; campos éticos presentes en esquema y formulario |
| **F0.5** | **Reparar el seed no idempotente** (los 10 actores demo se crearon antes de existir `urgencia` y `frecuencia_intentos`, hoy en 0 → Mitchell falseado, 0 definitivos) + re-valoración del caso piloto | `app/seeds/seed_data.py`, `scripts/` | `seed --force` idempotente; los 10 actores demo con `urgencia` y `frecuencia_intentos` reales |
| **F1** | Módulo teórico `app/modelo/` completo con sus pruebas unitarias | nuevo `app/modelo/*`, `tests/test_modelo.py` | `pytest` verde; los 64 casos PLU se generan y verifican contra las Tablas 4.4/4.5; la relevancia del caso `123` = **1,80**; el caso `233` = **2,57** y el `333` = **3,00** |
| **F1.1** | *Pendiente dentro de F1*: `expresiones.py` (4 expresiones + correlaciones Hip. F/G), `slx.py` (4 conceptos), `procedimiento.py` (5 etapas), `contenido.py` (texto para la UI) | `app/modelo/*` | Cada concepto del doctorado con su cita de página y su equivalente en el modelo de datos |
| **F2** | Migración de datos + endpoints del modelo | `alembic/versions/...`, `app/api/v1/endpoints/modelo.py`, `app/api/v1/router.py` | `/api/v1/modelo/plu` devuelve 64 filas; `/modelo/actores/{id}/relevancia` devuelve rango |
| **F3** | Página `/modelo` (7 secciones) + `/que-es-govstake` pública | `FrontendGovstacke/src/pages/Modelo.jsx`, `QueEsGovStake.jsx`, `Layout.jsx`, `App.jsx` | Ambas rutas responden 200 y el contenido teórico se lee completo en la UI |
| **F4** | Conector de escala 0–100 ↔ ordinal 0–3 + valoración con ponderación por apareamiento | `app/modelo/escala.py`, `app/api/v1/endpoints/actores.py`, `Actores.jsx` | El gestor valora con escala verbal (nula/baja/media/alta) y el sistema guarda PLU, relevancia y rango |
| **F5** | Expresiones del liderazgo participativo + SLX por actor + alertas SLX | `app/modelo/expresiones.py`, `app/modelo/slx.py`, `app/models/alerta.py`, `Protocolo.jsx`, `Alertas.jsx` | Cada actor del caso piloto tiene expresión sugerida con confianza y justificación; las alertas SLX se listan en la UI |
| **F6** | Integración con Compromisos, Relacionamientos, Reportes y AgentGD | `compromisos.py`, `relacionamientos.py`, `reportes.py`, `agentgd.py` | El reporte ejecutivo incluye el histograma PLU y los rangos; AgentGD explica el por qué citing el modelo |
| **F7** | Caso piloto real: valoración de los 10 actores demo con ponderación, expresiones y compromisos | seed + `informacion/CASO_PILOTO_GOVSTAKE.md` | 10 actores con PLU, relevancia, rango, expresión y expresión SLX documentada |
| **F8** | Documentación y socialización | `INFORME_PRACTICA_ACADEMICA.md` (capítulo teórico), `MATRIZ_TRAZABILIDAD_GOVSTAKE.md` (columna doctorado), `MANUAL-USUARIO.md`, `GOVSTAKE_TEORIA.md`, póster | Matriz de trazabilidad con las 20 brechas B1–B20 y su estado real; póster generado |

Orden recomendado: **F0 → F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8**. F3 (la parte teórica
visible) puede ejecutarse en paralelo con F4–F6 una vez que F1 y F2 estén cerrados,
porque el contenido de `/modelo` sale de la API.

---

## 4. Decisiones de diseño que cierran las brechas sin romper lo existente

### 4.1 Escala (B2): las 4 variables del modelo pasan a ordinal 0–3

**Decisión revisada** (ver §9): el instrumento del doctorado usa una escala verbal
cerrada de 4 niveles, y con el esquema actual 0–100 + umbral 60 el modelo **descarta la
intensidad** (90 y 61 son idénticos para él), que es exactamente la debilidad que la
tesis le critica a Mitchell en el Cap. 4 (p. 117-118).

| Variables | Escala | Motivo |
|---|---|---|
| **poder, legitimidad, urgencia, frecuencia_intentos** | **ordinal 0–3** (nula/baja/media/alta) | son las 4 del modelo del doctorado |
| influencia, interés, dependencia, capacidad de movilización, posición, historial de participación, riesgo de conflicto, canales de relacionamiento | 0–100 | no existen en el doctorado: son extensión propia del PAE |

El 0–100 original **se conserva** (para no perder granularidad histórica y para el
índice de priorización); el nivel ordinal es la lectura que usa el modelo. La conversión
vive en `app/modelo/escala.py` y es auditable:

| Nivel verbal | Puntos | Banda 0–100 (equidistante, configurable) |
|---|---|---|
| Nula | 0 | 0 – 24 |
| Baja | 1 | 25 – 49 |
| Media | 2 | 50 – 74 |
| Alta | 3 | 75 – 100 |

**Consecuencia a cuidar**: `calcular_indice_priorizacion` y
`calcular_indice_relacionamiento` usan poder y legitimidad con pesos 0,25 y devuelven
0–100. Al pasar esas dos variables a 0–3 hay que **normalizar dentro de la función**
(`valor / 3 * 100`) para que los índices no cambien de escala.

### 4.2 Ponderación (B6): los pesos de la tesis son el default, no un dogma

La tesis descarta usar una constante y deja que **cada interviewed** haga su propio
apareamiento (Tabla 4.1). GOVStake replica ese procedimiento:

- Pantalla de ponderación con las 3 parejas (Poder–Legitimidad, Poder–Urgencia,
  Legitimidad–Urgencia), 10 puntos por pareja, total 30.
- Los pesos se derivan: `peso_poder = puntos_poder / 30`.
- **Default del sistema**: los pesos con los que están **impresas** las Tablas 4.4 y 4.5
  (ver §4.3), usados cuando el usuario no ha ponderado.
- Cada actor queda asociado a la ponderación vigente en el momento de su valoración, de
  modo que la relevancia es siempre reproducible.

### 4.3 Relevancia (B7): se corrige la fórmula

```text
relevancia_calculada = nivel_poder * peso_poder
                     + nivel_legitimidad * peso_legitimidad
                     + nivel_urgencia * peso_urgencia        # escala 0.00 – 3.00
```

**Pesos canónicos verificados**: `13/30` poder (43,33 %), `10/30` legitimidad (33,33 %),
`7/30` urgencia (23,33 %). Es la única combinación que reproduce **los 64 valores** de
las Tablas 4.4 y 4.5 impresas.

> ⚠️ **Inconsistencia interna del doctorado, detectada y documentada.** La nota al pie 39
> de la tesis afirma "Poder: 43,3 %; Legitimidad: 30,0 % y Urgencia: 26,7 %" y escribe el
> ejemplo `1×0,433 + 2×0,30 + 3×0,267 = 1,80`. Esa cuenta da **1,834**, no 1,80. Las
> tablas impresas, en cambio, dan 1,80 para el caso 28 (PLU 123) solo con 13/30, 10/30 y
> 7/30. GOVStake usa **los pesos de las tablas impresas** (son las que sostienen la
> jerarquía y los rangos publicados) y deja la discrepancia documentada, en lugar de
> propagar un redondeo que haría fallar 27 de los 64 casos.

Rangos (B8): Nula 0,00 (caso único) · Baja 0,23–1,0 · Media-Baja 1,03–1,47 ·
Media-Alta 1,53–1,97 · Alta 2,0–3,0. La Tabla 4.5 impresa reparte 1 caso nulo, 15 en
Baja y 16 en cada banda restante. Los saltos entre bandas (1,00 → 1,03) no existen en la
tabla publicada y se resuelven asignando al rango inferior el valor intermedio.

### 4.4 Los 64 casos (B3): transcritos del doctorado y verificados en código — **hecho**

Las Tablas 4.3, 4.4 y 4.5 son **imágenes** dentro del PDF, no texto. Se extrajeron y
transcribieron a `app/modelo/datos_tesis.py` (64 filas), y `app/modelo/plu.py` **genera**
la tabla por producto cartesiano 4×4×4. La prueba
`tests/test_modelo.py::TestTablaDeCasos::test_coincide_con_las_tablas_4_4_y_4_5`
compara los 64 casos en caso, PLU, identificación, estado, relevancia y rango: **32/32
pruebas verdes**.

La numeración de casos es `caso = 1 + 16·P + 4·L + U` (orden de las Tablas 4.3/4.4), y el
orden de salida es el jerárquico de la Tabla 4.5 (relevancia ascendente).

### 4.5 Expresiones del liderazgo participativo (B11–B13): regla explícita y auditada

La tesis no prescribe una regla deductiva: encuentra **correlaciones** (Hipótesis F). Por
eso GOVStake no debe presentar la expresión como "la verdad", sino como una
**recomendación fundamentada**. Regla propuesta, calibrada con las correlaciones
publicadas:

```text
relevancia >= 1.53 (media-alta o alta)  y frecuencia >= 2  -> "decision_conjunta"
relevancia >= 1.03 (media-baja o alta)  y 0 < frecuencia < 2 -> "consulta"
relevancia >= 1.53                     y frecuencia == 0     -> "delegacion"
relevancia <  1.03                     y frecuencia >= 2     -> "autocracia"
```

Cada actor guarda la expresión, la **confianza** (0–100), la **regla que la produjo** y
el usuario puede sobrescribirla (queda registrado como `origen = usuario`). Esto respeta la
naturaleza empírica del hallazgo: el sistema recomienda, el líder decide.

### 4.6 SLX (B12): los 4 conceptos por actor

```text
expectativas_del_papel   -> "lo que el stakeholder espera del lider"   (compromisos previos,
                                                                  canales, notas)
papel_transmitido        -> "lo que el stakeholder ha pedido"          (compromisos y
                                                                  relacionamientos registrados)
papel_recibido           -> "lo que el lider ha captado"               (alertas, notas del
                                                                  gestor, respuestas)
conducta_en_el_papel     -> la expresion de liderazgo participativo     (autocracia | consulta |
                                                                  decision_conjunta | delegacion)
```

El ciclo de retroalimentación se visualiza: la conducta en el papel genera un
compromiso → el compromiso es el papel transmitido en el siguiente ciclo → y así.

---

## 5. La parte teórica en la aplicación (resumen de la UX)

Usuario o administrador que entra a `pae-govstake.vercel.app/modelo` encuentra:

1. **Una frase que responde "¿qué es esto?"** en el encabezado, sin jerga:
   *"GOVStake 360 convierte la percepción del líder sobre sus grupos de interés en una
   jerarquía de atención, una recomendación de estilo de relacionamiento y un registro
   auditable de compromisos."*
2. **El modelo SLX con su actor real**: cada actor muestra en qué punto del ciclo está
   (expectativa, transmisión, recepción, conducta) y qué le falta para avanzar.
3. **La calculadora PLU**: el usuario introduce los tres niveles y ve, en vivo, el caso de
   la Tabla 4.3, su relevancia calculada paso a paso, su rango y la expresión sugerida.
4. **Las 4 expresiones** explicadas con el resultado empírico de la tesis y el protocolo
   de acción asociado.
5. **Las 5 etapas** como checklist con el estado real por entidad.
6. **La ficha del actor** (extensión de `/actores`): PLU, rango, frecuencia, expresión,
   hipótesis que sustentan la recomendación y trazabilidad (`evaluado_por`, `evaluado_en`,
   ponderación usada).

Y en la ruta pública `/que-es-govstake`, el mismo contenido en modo resumen para quien
aún no ha iniciado sesión.

---

## 6. Criterios de aceptación "100 %"

- [x] Los 64 casos PLU están transcritos del doctorado, se generan en código y se
      verifican contra las Tablas 4.4 y 4.5 (64/64, `tests/test_modelo.py`).
- [x] La relevancia calculada usa `Σ(puntos × peso)` y reproduce el ejemplo `123 → 1,80`.
- [x] Los 5 rangos de relevancia (Nula, Baja, Media-Baja, Media-Alta, Alta) se aplican y
      reproducen el reparto 1/15/16/16/16 de la Tabla 4.5.
- [x] La ponderación por apareamiento (Tabla 4.1) está implementada y parametrizable.
- [ ] La ponderación por apareamiento es realizable desde la UI y queda versionada por
      valoración.
- [ ] Las 4 expresiones del liderazgo participativo existen, se explican y se aplican.
- [ ] El ciclo SLX de 4 conceptos está modelado y visible por actor.
- [ ] La página `/modelo` existe, es navegable y su contenido coincide con el cálculo real.
- [ ] La página pública `/que-es-govstake` explica el sistema sin necesidad de login.
- [ ] El caso piloto de los 10 actores demo está valorado con PLU, rango, frecuencia y
      expresión, y documentado.
- [ ] Los 12 tipos de actor del PAE están disponibles y los 3 filtros rotos devuelven
      resultados correctos.
- [ ] Los requisitos éticos del PAE (consentimiento, anonimización, permiso
      institucional, supervisión) están implementados en esquema, API y formulario.
- [ ] La matriz de trazabilidad declara el estado real de las 20 brechas B1–B20.
- [ ] Existe un artefacto de socialización (póster o presentación).
- [ ] `pytest` verde en backend y `npm test` verde en frontend.

---

## 7. Decisiones que requieren tu confirmación

1. **Escala** *(resuelta el 10/11/2026)*: las 4 variables del modelo (poder, legitimidad,
   urgencia, frecuencia) pasan a **ordinal 0–3** con selector de 4 niveles; las otras 8
   siguen en 0–100. El 0–100 original se conserva como dato histórico.
2. **Ponderación** *(resuelta el 10/11/2026)*: los pesos **de las tablas impresas**
   (13/30, 10/30, 7/30) son el default y cada administrador puede hacer su propio
   apareamiento, que es lo que hace la tesis.
3. **Acceso**: ¿la página de fundamentos es solo para usuarios autenticados o además
   pública en `/que-es-govstake`? (recomendado: ambas)
4. **Alcance del piloto**: ¿se aplica el modelo a los 10 actores demo (con valoración real
   del gestor) y se dejan las 124 entidades públicas en estado "sin valoración" (fiel al
   rigor metodológico, porque el modelo exige la *percepción del líder*) o se auto-valúan
   las 124 con reglas por tipo de entidad?
5. **Socialización**: ¿póster, presentación o ambos, y en qué formato/plantilla de la
   universidad?

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| Romper el dashboard ya optimizado (4 queries) | F1–F2 no tocan los endpoints de listado; el benchmark de queries se repite tras cada fase |
| Que la UI teórica diverja del cálculo | El contenido teórico se sirve desde la API (`app/modelo/contenido.py`), no se escribe en JSX |
| Sobre-declarar en la matriz de trazabilidad | Cada brecha B1–B20 se marca con el estado **real**, verificado en código, y se actualiza al cierre de cada fase |
| Datos de las 124 entidades públicas sin valoración | Se etiquetan explícitamente como "sin percepción del líder registrada"; no se inventan valores |
| Tiempo de despliegue | Cada fase es un commit independiente y desplegable; se puede pausar entre fases |

---

## 9. Hallazgos de la revisión documental (10/11/2026)

Estos tres hallazgos se detectaron al contrastar el doctorado con el código y **modifican
el plan**. Quedan documentados para que la evaluación académica vea el rigor del
análisis, no solo el resultado.

### 9.1 Las tablas del doctorado son imágenes, no texto

Las Tablas 4.3, 4.4 y 4.5 no son texto extraíble del PDF: son imágenes. Cualquier
implementación que las "transcriba" a ojo introduce errores. Por eso se extrajeron
renderizadas a alta resolución (7×) y se transcribieron **caso por caso**, y esa
transcripción quedó como fixture en `app/modelo/datos_tesis.py`, con una prueba que
compara las 64 filas contra el generador.

### 9.2 El doctorado tiene una inconsistencia interna en los pesos

La nota al pie 39 declara los pesos 43,3 % / 30,0 % / 26,7 % y calcula
`1×0,433 + 2×0,30 + 3×0,267 = 1,80`, pero esa suma da **1,834**. Las tablas impresas dan
1,80 para ese caso (nº 28, PLU 123) **solo** con los pesos 13/30, 10/30 y 7/30
(43,33 % / 33,33 % / 23,33 %). Se comprobaron las 64 filas: con los pesos del pie de
página fallan 27 casos; con 13/30-10/30-7/30 cuadran **64/64**.

Decisión: GOVStake usa los pesos de las **tablas impresas**, porque son las que
sostienen la jerarquía y los rangos publicados, y deja la discrepancia documentada en
`app/modelo/datos_tesis.py` y en el informe.

### 9.3 El seed de GOVStake no es idempotente y dejó el caso piloto sesgado

`seed_if_empty()` aborta si ya existe algún actor (`if db.query(Actor).count() > 0`).
Los 10 actores del caso piloto se crearon **antes** de que existieran las columnas
`urgencia` y `frecuencia_intentos`, así que quedaron en 0 y nunca se actualizaron.
Consecuencia observable en producción: `pendientes_evaluacion: 124` de 134 actores y
**0 stakeholders definitivos** — la clasificación Mitchell del caso piloto está
falseada por un bug de seed, no por los datos. Se agrega la fase **F0.5** para reparar el
seed y re-valorar el piloto.
