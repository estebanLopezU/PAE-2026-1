# Plan de evolución de AgentGD

> Asistente IA de GOVStake 360 e Interoperabilidad X-Road.
> Estado: propuesta para aprobación. Autor: equipo PAE 2026-1.

---

## 1. Diagnóstico del estado actual

AgentGD hoy es un **chat con un resumen de la base de datos en el prompt**. Funciona para
preguntas simples ("¿cuántos actores hay?"), pero no para preguntas complejas, no lee imágenes,
no consulta datos a demanda y no sabe en qué pantalla está el usuario.

| Pieza | Situación actual | Limitación |
|---|---|---|
| `endpoints/agentgd.py` | Contexto de ~15 líneas: 4 contadores + top 5 actores | No permite preguntas por actor, tipo, compromiso o alerta |
| `services/agentgd.py` | Una llamada a `/chat/completions`, `max_tokens=900` | Sin herramientas, sin visión, sin streaming |
| Prompt | "Usa únicamente los datos…" | No conoce la página actual ni el modelo del doctorado |
| Frontend | Panel de 360×208 px, texto plano | Sin imágenes, sin markdown, sin acciones, sin contexto de ruta |
| Modelo | `nemotron-3.5-lightning:free` (solo texto) | No ve imágenes; los fallbacks tampoco se usan para visión |
| Pruebas | Ninguna | No hay forma de saber si una mejora rompe respuestas |
| Duplicación | Mismo código copiado en los dos backends | Dos mantenimientos y deriva de comportamiento |

**Consecuencia:** el asistente responde bien lo que "ya viene en el resumen", pero se queda corto
ante "¿por qué la Contraloría es prioridad alta?", "compárame las dos alcaldías" o "explícame esta
gráfica que acabo de capturar".

---

## 2. Objetivos y criterios de éxito

| Objetivo | Métrica | Meta |
|---|---|---|
| Responder preguntas complejas con datos reales | Precisión del conjunto dorado (40 preguntas por plataforma) | ≥ 90 % |
| Usar herramientas en vez de inventar | Tasa de selección correcta de herramienta | ≥ 90 % |
| Leer imágenes | 3 casos de uso validados (captura de tablero, tabla, gráfica) | 3/3 |
| Guiar en el dashboard | Acciones de navegación ofrecidas y ejecutables | 100 % de rutas |
| Latencia aceptable | p95 por respuesta | ≤ 12 s |
| No filtrar datos | 0 envíos de PII al modelo sin acción explícita del usuario | 0 |
| No romper | Suite `pytest` de AgentGD | 100 % verde |

---

## 3. Arquitectura propuesta

```
┌──────────────────────────── Frontend (React) ────────────────────────────┐
│ AgentGDChat.jsx                                                          │
│  · useLocation()  → página actual                                        │
│  · adjuntar imagen (canvas → JPEG ≤1280 px)                              │
│  · render markdown + chips de acción + sugerencias                       │
│  · POST {message, history, page, image?}                                 │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ JWT
┌──────────────────────────────────▼───────────────────────────────────────┐
│ Backend (FastAPI)                                                        │
│  app/agentgd/                                                            │
│    contexto.py      → snapshot de datos + página + rol                   │
│    herramientas.py  → registro de skills (JSON Schema + ejecutor)        │
│    bucle.py         → orquestador LLM ↔ herramientas (máx. 3 vueltas)    │
│    prompts.py       → rol, reglas, conocimiento del dominio, few-shot    │
│    vision.py        → validación y armado del mensaje multimodal         │
│    navegacion.py    → mapa de rutas y acciones de UI                     │
│  app/services/agentgd.py → cliente OpenRouter (tools, visión, fallback)  │
│  app/api/v1/endpoints/agentgd.py → /chat, /capacidades, /diagnostico     │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ HTTPS
                          OpenRouter (modelo multimodal + tools)
```

**Decisión clave:** las "skills" son **herramientas del backend** (function calling de OpenAI,
que OpenRouter soporta). No se delega la ejecución a OpenRouter ni se sube la base de datos al
modelo: el modelo **pide**, el backend **consulta** y devuelve solo lo necesario.

---

## 4. Fases de implementación

### Fase 0 · Núcleo y observabilidad (0,5 día)

- Crear `app/agentgd/` en ambos backends con la misma estructura (código gemelo, no compartido,
  porque los despliegues son independientes).
- Extender el contrato del endpoint sin romper el actual:
  ```json
  POST /api/v1/agentgd/chat
  {
    "message": "…",
    "history": [{"role": "user|assistant", "content": "…"}],
    "page": "/matriz",
    "image": "data:image/jpeg;base64,…"
  }
  ```
  ```json
  {
    "response": "…",
    "ok": true,
    "acciones": [{"etiqueta": "Ver matriz", "ruta": "/matriz"}],
    "trazabilidad": ["buscar_actores", "ficha_actor"],
    "uso": {"tokens_entrada": 2100, "tokens_salida": 340, "modelo": "…"}
  }
  ```
- Registrar métricas sin contenido sensible: `request_id`, plataforma, página, herramientas usadas,
  modelo, tokens, latencia, estado. Nunca el texto de la conversación ni imágenes.
- Endpoint `GET /agentgd/diagnostico` (solo admin): clave configurada, modelos disponibles,
  cupo diario de OpenRouter.

### Fase 1 · Skills: herramientas de consulta (2 días)

Registro declarativo `HERRAMIENTAS = [{nombre, descripcion, parametros, ejecutar}]`.
Las herramientas son **de solo lectura** y validan sus argumentos con Pydantic.

**GOVStake 360**

| Herramienta | Qué resuelve |
|---|---|
| `resumen_ejecutivo` | Totales, Mitchell, índices y pendientes en una sola llamada |
| `buscar_actores` | Filtros por texto, tipo, prioridad, rango y límite |
| `ficha_actor` | Variables, PLU, rango, expresión sugerida, compromisos y alertas |
| `explicar_priorizacion` | Desglose `P·13/30 + L·10/30 + U·7/30`, niveles ordinales y tabla del doctorado |
| `listar_compromisos` | Por estado, actor o vencimiento |
| `listar_alertas` | Por nivel, leídas y actor |
| `listar_relacionamientos` | Por actor y tipo |
| `estado_mitchell` | Grupos, tipos, umbral y casos sin percepción |
| `comparar_actores` | Dos o más actores lado a lado |
| `top_actores` | Por índice, influencia, riesgo o urgencia |
| `buscar_en_fundamentos` | Fragmentos del modelo teórico (`app/modelo`) |
| `navegar` | Devuelve ruta y acciones de UI (ver Fase 3) |

**Interoperabilidad X-Road**

| Herramienta | Qué resuelve |
|---|---|
| `resumen_interop` | Entidades, conexión, servicios y madurez promedio |
| `buscar_entidades` | Texto, sector, estado X-Road, nivel de madurez |
| `ficha_entidad` | Datos, servicios, relaciones y evaluación |
| `servicios_entidad` | Catálogo y estado de servicios |
| `madurez_entidad` | Cuatro dominios MinTIC, niveles y brechas |
| `brechas_dominio` | Agregado de brechas por dominio |
| `relaciones_entidad` | Interoperabilidad declarada con otras entidades |
| `comparar_entidades` | Comparación lado a lado |
| `marco_mintic` | Definiciones de dominios y niveles |
| `navegar` | Ruta y acciones de UI |

**Bucle del agente** (`bucle.py`):

1. Enviar sistema + historial (máx. 8 turnos) + pregunta.
2. Si el modelo pide herramientas, ejecutarlas (en paralelo si son independientes).
3. Devolver los resultados como mensajes `tool` y repetir.
4. Máximo 3 vueltas y 6 ejecuciones; si se agota, responder con lo obtenido.
5. Detección de bucle: misma herramienta con los mismos argumentos dos veces → se corta.
6. Si una herramienta falla, el error se devuelve al modelo como texto; nunca se rompe la respuesta.
7. Si el modelo no soporta tools o falla, modo degradado: responder solo con el snapshot.

**Contexto enriquecido** (reemplaza las 15 líneas actuales):

- Snapshot en JSON compacto: totales, distribución por prioridad, por tipo, Mitchell, top 10,
  pendientes de valoración, fecha y página actual.
- Presupuesto: ~1 500 tokens de contexto + ~1 500 de esquemas + 2 000 de historial + 1 000 de salida.
- Regla dura: **toda cifra debe venir del snapshot o de una herramienta**; si no está, decirlo.

### Fase 2 · Visión (1 día)

- **Frontend**: botón de clip + pegar desde portapapeles + arrastrar. Compresión en canvas a
  1280 px y JPEG 0.8 (≈200–400 KB). Vista previa antes de enviar. Límite 2 MB.
- **Backend**: validar tipo (`png`, `jpeg`, `webp`) y tamaño; convertir a `data:` URL y enviar como
  `content: [{type:"text"}, {type:"image_url", image_url:{url}}]`.
- **Modelo**: `nvidia/nemotron-3.5-super-vl:free` o `google/gemma-4-31b-it:free`
  (ambos gratuitos, con imagen y tools; el segundo ya está en la cadena de respaldo).
- **Prompt de visión**: "Describe lo que ves y relaciónalo con los datos. No inventes cifras que no
  aparezcan en la imagen. Si es una captura del tablero, compara con el snapshot actual."
- **Fallback**: si el modelo de visión falla, responder en texto indicando que no se pudo leer la
  imagen (nunca dejar al usuario sin respuesta).
- **Privacidad**: la imagen no se guarda ni se registra; se envía solo cuando el usuario la adjunta.
  Aviso visible: "No adjuntes documentos con datos personales".

### Fase 3 · Copiloto de navegación (1,5 días)

Tres niveles, de menor a mayor esfuerzo:

**Nivel 1 — Conocer la página (incluido en Fase 1).**
El frontend envía `page`; el prompt incluye un diccionario por página (qué mide cada KPI, qué
significa cada columna, qué hacer si algo está vacío). Permite "¿qué significa prioridad alta?" o
"¿por qué este actor está en rojo?" sin salir del tablero.

**Nivel 2 — Acciones sugeridas.**
La herramienta `navegar` devuelve `acciones`. El chat las pinta como chips clicables:

> *"La Contraloría tiene índice 86.25 por poder alto y urgencia alta."*
> `[Ver ficha en Actores]` `[Abrir matriz]` `[Ver compromisos]`

El chip ejecuta `navigate(ruta)` con `react-router`, sin recargar la página.

**Nivel 3 — Tour guiado.**
Definiciones en `navegacion.py` (fuente única en Python):

```python
TOURS = {
  "/matriz": [
    {"selector": "[data-agentgd='kpi-total']", "titulo": "Total de actores",
     "texto": "Aquí ves cuántos grupos de interés hay activos."},
    ...
  ]
}
```

El frontend muestra un foco (spotlight) sobre el elemento, un globo con el paso y botones
*Anterior / Siguiente / Terminar*. Se activa con "guíame por esta pantalla". Sin dependencias nuevas.

**Fuera de alcance por ahora:** acciones de escritura ("crea el compromiso", "marca la alerta").
Requieren permisos, confirmación y auditoría; se evalúan en una fase posterior.

### Fase 4 · Conocimiento y calidad (2 días)

**Conocimiento (sin fine-tuning).** El modelo no se reentrena porque los datos cambian a diario y
el ajuste fino no aporta frente a un buen contexto + herramientas. En su lugar:

1. **Pack de conocimiento** generado desde `app/modelo/` (PLU, escala, expresiones, ponderación,
   procedimiento) y desde el marco MinTIC. Es la misma fuente que usan la UI y los reportes.
2. **Glosario** por plataforma (13 tipos de actor; 4 dominios y 4 niveles de madurez).
3. **3 ejemplos few-shot** de preguntas complejas con respuesta ideal.
4. **RAG opcional** sobre `informacion/*.md` (documentación, artículo, manual) solo si el pack
   crece. Para v1 el conocimiento cabe en el contexto; añadir embeddings sería complejidad sin
   beneficio medible.

**Evaluación.**

- `tests/test_agentgd.py`: bucle con OpenRouter simulado (mock de `httpx`), ejecución de
  herramientas, fallback de modelos, imágenes inválidas, límites de tamaño y de vueltas.
- `tests/golden_agentgd.json`: 40 preguntas por plataforma con hechos esperados.
- `scripts/evaluar_agentgd.py`: corrida manual contra la API real; reporta acierto de herramienta,
  acierto de cifras, latencia y modelo usado. No corre en CI para no gastar cupo.

**Seguridad de prompts.** Se tratan los datos de la base y las imágenes como **datos, no
instrucciones**; las herramientas son de solo lectura; las rutas están en lista blanca; los
argumentos se validan con Pydantic; se limita el tamaño de la entrada y de la salida.

### Fase 5 · MCP (opcional, 1 día)

Aclaración importante: **OpenRouter no aloja servidores MCP**. MCP es un protocolo que un cliente
(Claude Desktop, Cursor, n8n) usa para conectarse a herramientas. Dos caminos:

- **Recomendado:** nuestras herramientas ya son "skills" del agente; no hace falta MCP para el
  producto.
- **Valor académico:** exponer un servidor MCP de solo lectura (`/mcp`) con las mismas 10–12
  herramientas, para que cualquier cliente externo consulte GOVStake o X-Road. Sirve para demostrar
  interoperabilidad de agentes y deja la puerta abierta a integraciones institucionales.

---

## 5. Modelos y costos

| Uso | Modelo | Contexto | Imagen | Tools | Costo |
|---|---|---|---|---|---|
| Principal (texto) | `nvidia/nemotron-3.5-lightning:free` | 1M | No | Sí | $0 |
| Visión | `nvidia/nemotron-3.5-super-vl:free` | 1M | Sí | Sí | $0 |
| Respaldo visión/texto | `google/gemma-4-31b-it:free` | 262k | Sí | Sí | $0 |
| Respaldo texto | `nemotron-3-nano-omni…:free` | 256k | Sí | Sí | $0 |

- Variables nuevas: `OPENROUTER_VISION_MODEL`, `AGENTGD_MAX_STEPS`, `AGENTGD_IMAGES`,
  `AGENTGD_TOOLS`.
- **Límite de los modelos gratuitos:** 20 req/min y 50 req/día con menos de 10 créditos
  comprados; 1 000 req/día desde 10 créditos. Con tools, una pregunta consume 2–3 peticiones.
  Para una demo con dos plataformas conviene **comprar 10 USD una vez** (los modelos siguen
  siendo gratuitos). Alternativa: modelo de pago barato (~0,01–0,20 USD por millón de tokens).
- Presupuesto por conversación: ~6k tokens de entrada y 1k de salida.

---

## 6. Cambios concretos por archivo

### GOVStake 360
```
PAE 2026/BackendGovstacke/app/agentgd/__init__.py          (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/contexto.py          (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/herramientas.py      (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/bucle.py             (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/prompts.py           (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/vision.py            (nuevo)
PAE 2026/BackendGovstacke/app/agentgd/navegacion.py        (nuevo)
PAE 2026/BackendGovstacke/app/services/agentgd.py          (extender)
PAE 2026/BackendGovstacke/app/api/v1/endpoints/agentgd.py  (reescribir endpoint)
PAE 2026/BackendGovstacke/app/config.py                    (nuevas variables)
PAE 2026/BackendGovstacke/tests/test_agentgd.py            (nuevo)
PAE 2026/FrontendGovstacke/src/components/chatbot/AgentGDChat.jsx (reescribir)
```

### Interoperabilidad
```
PAE 2026/BackendInteroperabilidad/app/agentgd/…            (misma estructura)
PAE 2026/BackendInteroperabilidad/app/services/agentgd.py  (extender)
PAE 2026/BackendInteroperabilidad/app/api/v1/endpoints/agentgd.py
PAE 2026/BackendInteroperabilidad/app/config.py
PAE 2026/FrontendInteroperabilidad/src/components/chatbot/AgentGDChat.jsx
```

### Documentación
```
informacion/PLAN_AGENTGD.md      (este documento)
informacion/MANUAL-USUARIO.md    (sección AgentGD actualizada)
informacion/DEPLOY.md            (variables nuevas)
```

---

## 7. Plan de commits

1. `refactor(agentgd): extraer núcleo del agente y contrato extendido`
2. `feat(agentgd): herramientas de consulta para GOVStake`
3. `feat(agentgd): herramientas de consulta para interoperabilidad`
4. `feat(agentgd): lectura de imágenes con modelo multimodal`
5. `feat(agentgd): navegación y guía dentro de los dashboards`
6. `feat(agentgd): conocimiento del modelo y evaluación automática`
7. `docs(agentgd): plan, manual y variables de despliegue`

---

## 8. Cronograma estimado

| Fase | Alcance | Días |
|---|---|---|
| 0 | Núcleo, contrato, diagnóstico | 0,5 |
| 1 | Skills y bucle (2 plataformas) | 2 |
| 2 | Visión | 1 |
| 3 | Navegación guiada | 1,5 |
| 4 | Conocimiento y evaluación | 2 |
| 5 | MCP (opcional) | 1 |
| **Total** | | **7–8 días** |

**MVP recomendado (2 días):** Fase 0 + Fase 1 + nivel 1 de Fase 3. Es lo que más cambia la
experiencia: preguntas complejas con datos reales y respuestas conscientes de la pantalla.

---

## 9. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Los modelos gratuitos fallan o van lentos | Respuestas vacías o demora | Cadena de 3 modelos, timeout, modo degradado con snapshot |
| Tool calling débil en modelos pequeños | Herramienta equivocada | Conjunto dorado, descripciones precisas, fallback a contexto |
| Cupo diario de 50 peticiones | Demo bloqueada | Comprar 10 USD una vez; caché de resúmenes; límite por sesión |
| Alucinación de cifras | Pérdida de confianza | Cifras solo desde snapshot/tools + pruebas de verificación |
| Imagen con datos personales | Riesgo de privacidad | Acción explícita, aviso, sin almacenamiento, límite de tamaño |
| Inyección de prompts en datos | Comportamiento indebido | Datos tratados como evidencia, tools de solo lectura, rutas en lista blanca |
| Crecimiento del contexto | Costo y latencia | Recorte de historial, resultados truncados, resumen por herramienta |

---

## 10. Lo que NO se hará (y por qué)

- **Fine-tuning del modelo:** los datos cambian a diario y el catálogo es pequeño; un contexto
  curado + herramientas da mejor resultado y no queda obsoleto.
- **Enviar la base completa al modelo:** costo, latencia y riesgo de privacidad.
- **Dejar que el modelo escriba en la base:** sin permisos ni auditoría por acción.
- **MCP alojado en OpenRouter:** no existe; MCP se ejecuta en nuestro backend o en un cliente.
- **Capturar la pantalla automáticamente:** solo imágenes que el usuario adjunte.

---

## 11. Definición de terminado

- [ ] AgentGD responde 36/40 preguntas del conjunto dorado con cifras correctas.
- [ ] Responde "¿por qué este actor es prioridad alta?" citando el modelo del doctorado.
- [ ] Lee una captura del tablero y explica qué muestra.
- [ ] Ofrece acciones que navegan a la pantalla correcta.
- [ ] `pytest` verde en los dos backends.
- [ ] Desplegado en Render y Vercel sin cambios manuales.
- [ ] Documentación y variables de entorno actualizadas.
