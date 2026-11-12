# Guía de Despliegue en Internet — PAE 2026

**Objetivo:** que el proyecto no dependa de tu PC y se abra desde una URL pública 24/7.

---

## URLs en producción (estado actual)

| Componente | URL pública | Plataforma |
|---|---|---|
| 🏛️ **Portal de Entrada** (landing) | **https://pae-portal.vercel.app** | Vercel |
| 🎯 **GOVStake 360** (app) | **https://pae-govstake.vercel.app** | Vercel |
| 🔗 **Interoperabilidad X-Road** (app) | **https://pae-interop.vercel.app** | Vercel |
| ⚙️ **API GOVStake** | https://govstake-api.onrender.com | Render (Docker) |
| ⚙️ **API Interoperabilidad** | https://xroad-api.onrender.com | Render (Docker) |
| 🗄️ **Base de datos (PostgreSQL)** | `govstake360` + `xroad_colombia` (proyecto Neon) | Neon.tech |

Enlaces de diagnóstico de las APIs:

- Salud GOVStake: https://govstake-api.onrender.com/api/health
- Salud Interoperabilidad: https://xroad-api.onrender.com/api/health
- Swagger GOVStake: https://govstake-api.onrender.com/api/docs
- Swagger Interoperabilidad: https://xroad-api.onrender.com/api/docs

> **Empieza aquí:** https://pae-portal.vercel.app

### Credenciales de demo

| Plataforma | Rol | Usuario | Contraseña |
|---|---|---|---|
| GOVStake 360 / Interoperabilidad | 👑 Administrador | `elopezu@unal.edu.co` | `BZTfne48` |
| GOVStake 360 | 👤 Usuario (solo lectura) | `gestor@govstake.gov.co` | `Govstake360*` |
| Interoperabilidad X-Road | 🔍 Analista | `analista@xroad.gov.co` | `Analista123*` |

---

## Arquitectura desplegada

```
Vercel (frontends, gratis)                Render (backends Docker, gratis)
+---------------------------+             +-------------------------------+
| pae-portal.vercel.app     |--links---->| govstake-api.onrender.com     |--+
| pae-govstake.vercel.app   |--/api/v1-->| xroad-api.onrender.com        |  |
| pae-interop.vercel.app    |--/api/v1-->+-------------------------------+  |
+---------------------------+                                              |
                        Neon.tech (PostgreSQL, gratis)  <------------------+
                        govstake360  ·  xroad_colombia
```

- **Frontends (3 proyectos Vercel)** → variables `VITE_API_BASE_URL`, `VITE_GOVSTAKE_URL`, `VITE_INTEROP_URL`.
- **Backends (2 servicios Render Docker)** definidos en `render.yaml` (Blueprint `intergovstake`, branch `main`).
- **Base de datos** en Neon (plan free, **sin expiración**), referenciada por `DATABASE_URL` (declarada como `sync: false` en `render.yaml` para no versionar credenciales).

---

## Reproducir el despliegue desde cero

### Paso 1 — Backends en Render (Blueprint)

1. https://dashboard.render.com → **New → Blueprint** → repo `estebanLopezU/PAE-2026-1`.
2. Blueprint Name: `intergovstake` · Branch: `main` · **Blueprint Path: vacío** (el `render.yaml` está en la raíz).
3. Render pedirá las variables marcadas `sync: false` (una vez por servicio):
   - `DATABASE_URL` = cadena de conexión de **Neon** (`postgresql://neondb_owner:<password>@<host>/<db>?sslmode=require`)
   - `ADMIN_PASSWORD` = contraseña del administrador
   - `ANALYST_PASSWORD` = contraseña del analista de cada plataforma
   - `OPENROUTER_API_KEY` = clave de OpenRouter (AgentGD)
4. **Apply** → ~5 min de build por servicio.

#### Variables opcionales de AgentGD

Todas tienen valor por defecto en `app/config.py`; solo se declaran en Render si se quiere
cambiar el comportamiento sin tocar código:

| Variable | Por defecto | Para qué sirve |
|---|---|---|
| `OPENROUTER_MODEL` | `nvidia/nemotron-3.5-lightning:free` | Modelo de texto |
| `OPENROUTER_VISION_MODEL` | `nvidia/nemotron-3.5-super-vl:free` | Modelo que lee imágenes |
| `OPENROUTER_FALLBACK_MODELS` | `google/gemma-4-31b-it:free,...` | Cadena de respaldo si el primero falla o da 429 |
| `AGENTGD_TOOLS` | `true` | Activa las herramientas de consulta (function calling) |
| `AGENTGD_IMAGES` | `true` | Activa la lectura de imágenes |
| `AGENTGD_MAX_CALLS` | `2` | Llamadas al modelo por pregunta (cuida el cupo gratuito) |
| `AGENTGD_MAX_TOKENS` | `900` | Tope de tokens de la respuesta |
| `AGENTGD_MAX_HISTORY` | `8` | Turnos de conversación que viajan al modelo |
| `AGENTGD_REQUESTS_PER_MINUTE` | `6` | Preguntas por minuto por usuario |

> 💡 El plan gratuito de OpenRouter limita a **50 peticiones al día** por clave sin saldo. Una
> pregunta compleja consume hasta **2** (una para pedir herramientas y otra para redactar).
> Si el cupo se agota, AgentGD responde con un aviso y los respaldos configurados.

> ⚠️ El `render.yaml` **no** declara bases de datos: usa directamente las cadenas de conexión de **Neon** en `DATABASE_URL`. Estas se configuran **manualmente en el panel de Render** (`sync: false`) y **no se versionan en git**, para evitar filtrar la contraseña de la base de datos. Las tablas y los datos semilla se crean solos en el primer arranque.
>
> 🔐 Si la contraseña de Neon estuvo expuesta previamente en `render.yaml`, **rotala** desde el panel de Neon (Settings → Reset password) y actualiza `DATABASE_URL` en Render.

### Paso 2 — Frontends en Vercel

Importar el repo **3 veces** en https://vercel.com/new:

| # | Root Directory | Variable de entorno (Production) |
|---|---|---|
| 1 | `PAE 2026/FrontendGovstacke` | `VITE_API_BASE_URL` = `https://govstake-api.onrender.com/api/v1` |
| 2 | `PAE 2026/FrontendInteroperabilidad` | `VITE_API_BASE_URL` = `https://xroad-api.onrender.com/api/v1` |
| 3 | `PAE 2026/PortalEntrada` | `VITE_INTEROP_URL` = URL del #2 · `VITE_GOVSTAKE_URL` = URL del #1 |

- Framework preset: **Vite**. Nombres de proyecto: `pae-govstake`, `pae-interop`, `pae-portal`.

> ⚠️ `VITE_API_BASE_URL` **debe terminar en `/api/v1`**.

### Paso 3 — CORS

`CORS_ORIGINS` en `render.yaml` ya incluye las URLs de Vercel y los `localhost`. Si cambian los dominios, actualízalo y vuelve a aplicar el Blueprint (o edítalo en **Environment** del servicio).

---

## Verificación del despliegue

```powershell
# Salud de las APIs
curl https://govstake-api.onrender.com/api/health
curl https://xroad-api.onrender.com/api/health

# Login de prueba
curl -X POST https://xroad-api.onrender.com/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"elopezu@unal.edu.co","password":"BZTfne48"}'
```

---

## Limitaciones del plan gratuito

| Limitación | Impacto | Mitigación |
|---|---|---|
| Render free "duerme" el servicio tras 15 min sin tráfico | El primer click tarda ~50 s | Abrir la app una vez antes de una demo |
| Build sin persistencia local entre despliegues | Solo afecta archivos temporales, no la BD | — |
| 2 servicios Render + 1 proyecto Neon free | Suficiente para la demo académica | — |

> ✅ La base de datos en **Neon no expira** (a diferencia del PostgreSQL free de Render, que dura 30 días).

---

## Actualizar el despliegue (cuando cambies código)

| Qué cambiaste | Cómo se publica |
|---|---|
| Backends (`BackendGovstacke`, `BackendInteroperabilidad`) o `render.yaml` | `git push` → **Render redespliega solo** (auto-deploy activo sobre `main`) |
| Frontends (`PortalEntrada`, `FrontendGovstacke`, `FrontendInteroperabilidad`) | `git push` → **GitHub Actions** publica solo las carpetas que cambiaron |

### Despliegue automático de los frontends

El workflow `.github/workflows/vercel-deploy.yml` se ejecuta en cada push a
`main`. Detecta qué carpeta cambió y publica en Vercel únicamente esos
proyectos, usando el token guardado en el secret `VERCEL_TOKEN`.

- GOVStake 360 → `PAE 2026/FrontendGovstacke`
- Interoperabilidad → `PAE 2026/FrontendInteroperabilidad`
- Portal de entrada → `PAE 2026/PortalEntrada`

Si cambias algo compartido y quieres publicar los tres, entra en **Actions →
Desplegar frontends en Vercel → Run workflow** (con `forzar` activo).

> **Por qué Actions y no la integración Git de Vercel:** la cuenta de Vercel no
> tiene la conexión de login con GitHub, así que Vercel no puede leer el repo
> directamente. El workflow usa `VERCEL_TOKEN` y los IDs de proyecto, que ya
> están configurados. No hace falta volver a tocar el panel.
>
> Si algún día conectas Vercel a GitHub, recuerda poner el **Root Directory** de
> cada proyecto en `PAE 2026/<carpeta del frontend>` y replicar las variables
> `VITE_*` en el entorno **Preview**.

### Despliegue manual (si hiciera falta)

```powershell
cd "PAE 2026\FrontendGovstacke"
vercel --prod
```

Repetir en `FrontendInteroperabilidad` y `PortalEntrada`. Las variables
`VITE_API_BASE_URL` / `VITE_*_URL` ya están definidas en Production.

---

## Desarrollo local: sin cambios

Todo lo anterior **no rompe el flujo local** (`start-all.ps1`): los frontends usan el
proxy de Vite si `VITE_API_BASE_URL` no está definida, y los backends usan el puerto
8000/8002 por defecto si el proveedor no inyecta `$PORT`.
