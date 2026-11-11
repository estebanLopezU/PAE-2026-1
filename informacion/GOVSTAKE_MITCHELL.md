# GOVStake 360 · Modelo de stakeholders y clasificación PLU

> Fuente única de verdad: `PAE 2026/BackendGovstacke/app/modelo/`.
> Todo lo que muestran la aplicación, la API y los reportes se calcula con ese
> paquete, que transcribe las Tablas 4.1, 4.3, 4.4 y 4.5 del doctorado
> *Liderazgo y grupos de interés* (Pantoja Ospina, Universidad Nacional, 2015).

## 1. Qué es

GOVStake 360 convierte la percepción del líder sobre sus grupos de interés en
una jerarquía de atención y en una recomendación de relacionamiento. No es un
listado de contactos: aplica el modelo PLU del doctorado y deja registrado
quién valoró, cuándo y con qué ponderación.

## 2. Las cuatro variables del modelo

| Variable | Qué mide | Escala en la app |
|---|---|---|
| Poder | Capacidad de influir o imponer decisiones | Nula, Baja, Media, Alta |
| Legitimidad | Reconocimiento jurídico, institucional o social | Nula, Baja, Media, Alta |
| Urgencia | Sensibilidad al tiempo y criticidad de la exigencia | Nula, Baja, Media, Alta |
| Frecuencia de intentos | Cuántas veces el actor intenta influir | Nula, Baja, Media, Alta |

Las cuatro se leen como **ordinal 0–3** (nula, baja, media, alta). En la base de
datos se conserva el equivalente 0–100 mediante bandas equidistantes
(0–24, 25–49, 50–74, 75–100) para no perder la granularidad histórica ni romper
los índices de priorización. Las otras ocho variables de análisis siguen en
0–100.

Las cuatro variables ordinales se valoran con un selector de cuatro niveles en
**Actores**; el detalle del modelo y una calculadora están en **Fundamentos**
(`/modelo`) y en la página pública `/que-es-govstake`.

## 3. Clasificación Mitchell

Cada atributo está presente cuando su nivel es **al menos baja** (nivel 1 de 3).

| Atributos presentes | Clasificación |
|---|---|
| Ninguno | No relevante |
| Solo poder | Latente inactivo |
| Solo legitimidad | Latente discrecional |
| Solo urgencia | Latente demandante |
| Poder + legitimidad | Expectante dominante |
| Poder + urgencia | Expectante peligroso |
| Legitimidad + urgencia | Expectante dependiente |
| Poder + legitimidad + urgencia | Definitivo |

El código **PLU** es la representación compacta de los niveles: por ejemplo
`123` significa poder bajo, legitimidad media y urgencia alta. El caso va de 1 a
64 en el orden de la Tabla 4.3 del doctorado (`caso = 1 + 16·P + 4·L + U`).

## 4. Relevancia y rangos

La relevancia se calcula con los pesos con los que están impresas las Tablas
4.4 y 4.5:

```text
Relevancia = P·(13/30) + L·(10/30) + U·(7/30)
```

Es decir, 43,33 % para poder, 33,33 % para legitimidad y 23,33 % para urgencia.
El resultado va de 0,00 a 3,00 y se clasifica así:

| Rango | Intervalo |
|---|---|
| Nula | 0,00 – 0,50 |
| Baja | 0,50 – 1,00 |
| Media–Baja | 1,00 – 1,50 |
| Media–Alta | 1,50 – 2,50 |
| Alta | 2,50 – 3,00 |

> Nota de trazabilidad: la nota al pie 39 del doctorado ofrece 43,3 / 30,0 /
> 26,7 %, pero con esos valores la fórmula no reproduce la tabla impresa. Solo
> 13/30, 10/30 y 7/30 reproducen los 64 casos, así que esos son los pesos que
> aplica GOVStake. La discrepancia está documentada en
> `informacion/PLAN_TEORIA_GOVSTAKE_360.md`.

### Ponderación por apareamiento

El procedimiento del doctorado no fija una constante: cada líder reparte diez
puntos en cada una de las tres parejas de atributos (30 puntos en total). Los
subtotales se convierten en pesos y se guardan **junto con la valoración**, de
modo que la relevancia de un actor se puede reproducir meses después aunque la
ponderación institucional cambie.

En **Actores**, al editar las variables, se puede activar la ponderación por
apareamiento. En **Fundamentos** hay un simulador de las tres parejas.

## 5. Expresiones del liderazgo

Con la relevancia y la frecuencia de intentos, GOVStake recomienda una de las
cuatro expresiones del continuo de la Figura 1.1:

1. **Autocracia** (grado 1)
2. **Consulta** (grado 2)
3. **Decisión conjunta** (grado 3)
4. **Delegación** (grado 4)

La regla está calibrada con las correlaciones de la Hipótesis F del doctorado
(poder ↔ consulta, legitimidad ↔ decisión conjunta, frecuencia ↔ delegación,
entre otras). Por eso la app habla de **recomendación fundamentada con nivel de
confianza**, no de una orden: el líder puede sobrescribirla y el cambio queda
registrado con su nombre y fecha.

## 6. Etapas del modelo SLX

GOVStake registra la evidencia de las cuatro etapas de Katz y Kahn (1978):

1. **Expectativas**: el actor y sus demandas.
2. **Recursos**: compromisos y capacidad de respuesta.
3. **Intercambio**: relacionamientos registrados.
4. **Conducta**: compromisos cumplidos.

## 7. Quién evalúa y qué se guarda

La evaluación la realiza el **gestor o líder del proyecto** desde el módulo
Actores. GOVStake guarda:

- `evaluado_por` y `evaluado_en`
- `ponderacion` (parejas, subtotales y pesos)
- La clasificación, relevancia, rango y expresión calculadas

Los actores sincronizados desde interoperabilidad **no se auto-valoran**: se
muestran como *sin percepción del líder registrada* hasta que alguien los
evalúe. El modelo se aplica a los 10 actores de ejemplo y a todo actor que un
gestor valore.

## 8. Pantallas

### Fundamentos (`/modelo`)

Parte teórica visible para usuarios y administradores:

- Qué es GOVStake 360 y para qué sirve en la gestión pública.
- El ciclo SLX y las cinco etapas de la metodología.
- Calculadora PLU con pesos, aportes y expresión sugerida.
- Escala, atributos, ponderación por apareamiento y los 64 casos.
- Las cuatro expresiones y las correlaciones de la Hipótesis F.
- Principios éticos y fuentes.

La misma página existe sin sesión en `/que-es-govstake`.

### Actores

- Filtro por los 13 tipos canónicos.
- Selector ordinal para poder, legitimidad, urgencia y frecuencia.
- Ponderación por apareamiento opcional.
- Tabla con PLU, relevancia y rango; los actores sin valoración se etiquetan
  como *sin valoración del líder*.

### Mitchell (`/mitchell`)

- Tarjetas por grupo.
- Criterio de clasificación con el umbral ordinal.
- Matriz por actor con PLU, niveles P/L/U, relevancia, rango y expresión
  sugerida.
- Botón de sincronización de entidades públicas, solo para administradores.

### Dashboard

- Stakeholders definitivos, expectantes, latentes y no relevantes.
- Entidades pendientes de evaluación.

## 9. Sincronizar entidades públicas

```http
POST /api/v1/sincronizaciones/entidades-publicas
```

Configura en el `.env` del backend GOVStake:

```env
INTEROP_API_URL=http://localhost:8000/api/v1
INTEROP_SYNC_EMAIL=usuario_del_backend_interoperabilidad
INTEROP_SYNC_PASSWORD=contraseña_del_usuario
INTEROP_TIMEOUT_SECONDS=30
```

> `INTEROP_SYNC_EMAIL` y `INTEROP_SYNC_PASSWORD` son opcionales: permiten usar
> una cuenta de servicio dedicada. Si no se definen, la sincronización usa las
> credenciales de administrador del propio backend GOVStake.

En Docker, `backend` es el nombre interno del servicio de interoperabilidad:

```env
INTEROP_API_URL=http://backend:8000/api/v1
```

La sincronización crea entidades nuevas, actualiza información básica, no
sobrescribe la evaluación ya realizada y evita duplicados usando NIT y entidad
origen.

## 10. API del modelo

| Endpoint | Sesión | Qué devuelve |
|---|---|---|
| `GET /api/v1/modelo/teoria` | No | Todo el contenido teórico |
| `GET /api/v1/modelo/que-es` | No | Qué es GOVStake 360, propósito, ética y fuentes |
| `GET /api/v1/modelo/plu` | No | Los 64 casos |
| `GET /api/v1/modelo/plu/{codigo}` | No | Un caso con sus pasos de cálculo |
| `GET /api/v1/modelo/expresiones` | No | Las cuatro expresiones y correlaciones |
| `GET /api/v1/modelo/procedimiento` | No | Las cinco etapas |
| `GET /api/v1/modelo/slx` | No | Las cuatro etapas SLX |
| `GET /api/v1/modelo/escala` | No | Escala verbal y rangos |
| `POST /api/v1/modelo/calcular` | No | Relevancia y expresión para una valoración |
| `POST /api/v1/modelo/ponderacion` | No | Pesos a partir de tres parejas |
| `GET /api/v1/modelo/panorama` | Sí | Distribución por rango y expresión |
| `GET /api/v1/modelo/actor/{id}` | Sí | Ficha del actor con SLX y expresiones |

## 11. Recomendación de uso

1. Entra a **Fundamentos** y revisa el modelo.
2. Sincroniza las entidades públicas (solo administradores).
3. Evalúa poder, legitimidad, urgencia y frecuencia en **Actores**.
4. Revisa la matriz en **Mitchell**.
5. Usa el rango y la expresión sugerida para priorizar el relacionamiento.
