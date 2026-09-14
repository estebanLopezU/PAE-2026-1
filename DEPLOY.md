# Guía de Despliegue en Internet — PAE 2026

**Objetivo:** que el proyecto no dependa de tu PC y se abra desde una URL pública 24/7.

**Arquitectura en la nube:**

```
Vercel (frontends, gratis)                Render (backends + BD, gratis)
┌──────────────────────────┐              ┌─────────────────────────────┐
│ pae-portal.vercel.app    │──links────►  │ govstake-api  (Docker :PORT)│──► govstake-db  (PostgreSQL)
│ pae-govstake.vercel.app  │──/api─────►  │ xroad-api     (Docker :PORT)│──► xroad-db     (PostgreSQL)
│ pae-interop.vercel.app   │──/api─────►  └─────────────────────────────┘
└──────────────────────────┘
```

---

## Paso 1 — Desplegar backends en Render (Blueprint, 1 clic)

1. Entra a **https://dashboard.render.com** (cuenta gratis; puedes loguearte con GitHub).
2. **New → Blueprint** → selecciona el repo `estebanLopezU/PAE-2026-1`.
   Render detecta `render.yaml` (raíz del repo) y creará automáticamente:
   - 2 bases de datos PostgreSQL: `govstake-db` y `xroad-db`
   - 2 servicios web Docker: `govstake-api` y `xroad-api`
3. Render te pedirá los valores de las variables `sync: false`. Escríbelas (son las de tu `.env` local):
   - `ADMIN_PASSWORD`, `ANALYST_PASSWORD`, `OPENROUTER_API_KEY` (ambos servicios)
4. Acepta y espera el build (~5 min por servicio).

Resultado: URLs tipo `https://govstake-api.onrender.com` y `https://xroad-api.onrender.com`.
**Verifica** abriendo `https://<url>/api/health` → `{"status": "healthy"}`.

> Las tablas y los datos semilla (10 actores GOVStake, usuarios admin) se crean solos al primer arranque.

## Paso 2 — Desplegar frontends en Vercel (gratis)

Importa el mismo repo **3 veces** en https://vercel.com/new (cuenta gratis con GitHub):

| # | Root Directory | Variables de entorno (Production) |
|---|----------------|-----------------------------------|
| 1 | `PAE 2026/FrontendGovstacke` | `VITE_API_BASE_URL` = `https://govstake-api.onrender.com/api/v1` |
| 2 | `PAE 2026/FrontendInteroperabilidad` | `VITE_API_BASE_URL` = `https://xroad-api.onrender.com/api/v1` |
| 3 | `PAE 2026/PortalEntrada` | `VITE_INTEROP_URL` = URL Vercel del #2 · `VITE_GOVSTAKE_URL` = URL Vercel del #1 |

- Framework preset: **Vite** (detectado solo). No cambies nada más.
- Usa nombres de proyecto `pae-govstake`, `pae-interop`, `pae-portal` (o los que salgan).

> ⚠️ Importante: `VITE_API_BASE_URL` **debe terminar en `/api/v1`**.

## Paso 3 — Actualizar CORS en Render (una vez conocidas las URLs de Vercel)

1. En Render → servicio `govstake-api` → **Environment** → edita `CORS_ORIGINS` y reemplaza
   los `https://pae-*.vercel.app` por tus URLs reales (formato JSON, sin espacios raros):
   ```json
   ["https://pae-govstake.vercel.app","https://pae-interop.vercel.app","https://pae-portal.vercel.app","http://localhost:3002","http://localhost:3000","http://localhost:5173"]
   ```
2. Lo mismo en `xroad-api`.
3. Guarda → Render redespliega automáticamente.

## Paso 4 — Prueba final

1. Abre el Portal (`https://pae-portal.vercel.app`) → entra a GOVSTAKE e INTEROP.
2. Login con las credenciales admin que pusiste en el Paso 1.
3. Revisa que el Dashboard cargue datos y que el chat AgentGD responda (usa tu `OPENROUTER_API_KEY`).

---

## Limitaciones del plan gratuito (conocerlas)

| Limitación | Impacto | Mitigación |
|---|---|---|
| Render free "duerme" el servicio tras 15 min sin tráfico | El primer click tarda ~50 s en responder | Abrir la app 1 vez antes de una demo, o upgrade $7/mes |
| PostgreSQL free **expira a los 30 días** | Se pide recrear la BD (se re-siembran los datos demo) | Recrear el Blueprint o plan Starter |
| Build/datos: sin persistencia entre rebuilds de free web | Solo afecta archivos locales, no la BD | — |

## Desarrollo local: sin cambios

Todo lo anterior **no rompe el flujo local** (`start-all.ps1`): los frontends usan el
proxy de Vite si `VITE_API_BASE_URL` no está definida, y los backends usan el puerto
8000/8002 por defecto si el proveedor no inyecta `$PORT`.
