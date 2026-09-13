# Manual: Cómo levantar el proyecto (un solo comando)

**Proyecto:** PAE-2026-1 (GOVStake 360 + Interoperabilidad X-Road + Portal de Entrada)
**Scripts:** `PAE 2026/start-all.ps1` · `PAE 2026/stop-all.ps1` · `PAE 2026/setup-all.ps1` · `PAE 2026/start-all.cmd`

---

## 0. Instalar todo (primera vez) — `setup-all.ps1`

Si es la primera vez en una máquina (o algo no corre por falta de dependencias), ejecuta **una sola vez**:

```powershell
powershell -ExecutionPolicy Bypass -File ".\PAE 2026\setup-all.ps1"
```

o doble clic en `PAE 2026\setup-all.cmd`.

**Qué instala automáticamente (vía `winget` si falta):**

| Aplicación | ID winget | Para qué |
|------------|-----------|----------|
| Docker Desktop | `Docker.DockerDesktop` | backends, BDs y frontend interop |
| Node.js LTS | `OpenJS.NodeJS.LTS` | frontends Vite + npm |
| Python 3.12 | `Python.Python.3.12` | backends (utilidades locales) |

**Y luego:**
- `npm install` en los 3 frontends (`FrontendGovstacke`, `FrontendInteroperabilidad`, `PortalEntrada`)
- `pip install -r requirements.txt` en los 2 backends
- Con `-Build`: además reconstruye las imágenes Docker (`docker compose build`)
- Con `-Force`: reinstala las dependencias aunque ya existan

**Es idempotente:** lo puedes ejecutar cuantas veces quieras; solo instala lo que falte.

> 💡 **Auto-reparación:** además, `start-all.ps1` detecta si a un frontend le faltan `node_modules` y ejecuta `npm install` automáticamente antes de arrancarlo. Así el flujo normal es siempre: `setup-all` (una vez) → `start-all` (siempre).

---

## 1. Requisitos previos

| Requisito | Verificación |
|-----------|--------------|
| **Docker Desktop** instalado y con licencia | `docker --version` |
| **Node.js 18+** (incluye npm) | `node -v` y `npm -v` |
| PowerShell 5.1+ (viene con Windows) | — |

> La primera ejecución descarga imágenes (`postgres:15-alpine`) y puede tardar varios minutos. Si no tienes nada instalado, ejecuta primero `setup-all.ps1` (sección 0).

---

## 2. Levantar TODO con un solo comando

### Opción A — Doble clic (la más fácil)
1. Abre el Explorador en la carpeta `PAE 2026/`.
2. Doble clic en **`start-all.cmd`**.
3. Espera el resumen final `STACK LEVANTADO`.

### Opción B — Terminal
```powershell
powershell -ExecutionPolicy Bypass -File "PAE 2026\start-all.ps1"
```

> ⚠️ **Importante:** la carpeta se llama `PAE 2026` (con espacio). En PowerShell debes entrecomillarla:
> ```powershell
> cd "PAE 2026"      # ✅ correcto
> cd PAE 2026        # ❌ error: '2026' no es un argumento válido
> ```
> Ya dentro de la carpeta, basta con: `.\start-all.ps1`

### ¿Qué hace el script?
1. **Verifica prerequisitos** (Docker instalado; si Docker Desktop no corre, intenta iniciarlo y espera).
2. **Docker Compose** (`PAE 2026/docker-compose.yml`): levanta backends, bases de datos y el frontend de interoperabilidad. Además reintentará `xroad-frontend` si nginx arrancó antes que su backend (error conocido *"host not found in upstream backend"*).
3. **Frontends Vite locales** (solo si no están ya corriendo; si lo están, los salta):
   - `FrontendGovstacke` → puerto **3002**
   - `PortalEntrada` → puerto **3000**
   - Los logs quedan en `logs/FrontendGovstacke.log` y `logs/PortalEntrada.log`.
4. **Verificación de salud**: comprueba los 6 servicios e imprime un resumen con URLs.

---

## 3. URLs del stack

| Servicio | URL | Notas |
|----------|-----|-------|
| 🏠 Portal de Entrada (landing) | http://localhost:3000 | Vite local |
| 🟢 GOVStake 360 (app) | http://localhost:3002 | Vite local; proxy `/api` → 8002 |
| 🔵 Interoperabilidad X-Road | http://localhost:5173 | nginx en Docker (build del frontend) |
| 🛠 API GOVStake (docs) | http://localhost:8002/docs | FastAPI + PostgreSQL |
| 🛠 API Interop (docs) | http://localhost:8000/docs | FastAPI + PostgreSQL (`DEBUG=true` por override) |

Credenciales de demo de GOVStake (las crea la semilla de datos):
- **admin:** `elopezu@unal.edu.co` / `BZTfne48`

---

## 4. Detener todo

```powershell
powershell -ExecutionPolicy Bypass -File "PAE 2026\stop-all.ps1"
```

Detiene los frontends Vite (puertos 3000 y 3002) y ejecuta `docker compose stop`.
Los **volúmenes de datos se conservan** (PostgreSQL no pierde la información).
Para eliminar también contenedores y volúmenes: `docker compose down -v` (⚠️ borra los datos).

---

## 5. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|---------|
| `[X] Docker Desktop no respondio` | Docker recién instalado / arranque lento | Abre Docker Desktop manualmente y reintenta |
| `xroad-frontend` en bucle *Restarting* | nginx arrancó antes que `xroad-backend` | `docker restart xroad-frontend` (el script ya lo reintenta) |
| Puerto 3000/3002/5173 ocupado | Quedó un proceso de una sesión anterior | Cierra ese proceso o ejecuta `stop-all.ps1` primero |
| El frontend de interop no refleja cambios de código | Sirve el `dist` compilado dentro de la imagen | `docker compose build frontend` y `docker compose up -d frontend` |
| Error de conexión de la API desde un frontend | Backend aún inicializando la BD | Espera ~10 s y recarga |

---

## 6. Arquitectura (resumen)

```
                    ┌── PortalEntrada (Vite :3000, local)
Usuario ──► Navegador┼── FrontendGovstacke (Vite :3002, local) ──proxy /api──► govstake-backend :8002 ──► govstake-db (Postgres)
                    └── xroad-frontend (nginx :5173, Docker) ──proxy /api──► xroad-backend :8000 ──► xroad-postgres (Postgres)
```

- **Docker Compose** gestiona: `xroad-postgres`, `xroad-backend`, `xroad-frontend`, `govstake-db`, `govstake-backend`.
- **Vite local** gestiona: Portal de Entrada y FrontendGovstacke (no están dockerizados).
