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
- **Base de datos** en Neon (plan free, **sin expiración**), referenciada por `DATABASE_URL` en `render.yaml`.

---

## Reproducir el despliegue desde cero

### Paso 1 — Backends en Render (Blueprint)

1. https://dashboard.render.com → **New → Blueprint** → repo `estebanLopezU/PAE-2026-1`.
2. Blueprint Name: `intergovstake` · Branch: `main` · **Blueprint Path: vacío** (el `render.yaml` está en la raíz).
3. Render pedirá las variables marcadas `sync: false` (dos veces, una por servicio):
   - `ADMIN_PASSWORD` = contraseña del administrador
   - `ANALYST_PASSWORD` = contraseña del analista de cada plataforma
   - `OPENROUTER_API_KEY` = clave de OpenRouter (AgentGD)
4. **Apply** → ~5 min de build por servicio.

> ⚠️ El `render.yaml` **no** declara bases de datos: usa directamente las cadenas de conexión de **Neon** en `DATABASE_URL`. Las tablas y los datos semilla se crean solos en el primer arranque.

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

## Desarrollo local: sin cambios

Todo lo anterior **no rompe el flujo local** (`start-all.ps1`): los frontends usan el
proxy de Vite si `VITE_API_BASE_URL` no está definida, y los backends usan el puerto
8000/8002 por defecto si el proveedor no inyecta `$PORT`.
