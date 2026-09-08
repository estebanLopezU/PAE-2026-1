# ðŸš€ GuÃ­a de EjecuciÃ³n Detallada - Gobierno Digital Colombia (X-Road + GOVStake 360)

## ðŸ“‹ Arquitectura de Servicios

| Servicio | Puerto | TecnologÃ­a | CÃ³mo corre |
|----------|--------|-----------|------------|
| Portal de Entrada | 3000 | React + Vite | Desarrollo local (`npx vite --port 3000`) |
| Frontend GOVStake 360 | 3002 | React + Vite + Tailwind | Desarrollo local (`npx vite --port 3002`) |
| Frontend Interoperabilidad | 5173 | React + Vite + nginx | Docker |
| Backend Interoperabilidad | 8000 | FastAPI | Docker |
| Backend GOVStake | 8002 | FastAPI | Docker |
| Bases de datos PostgreSQL | internas | postgres:15-alpine | Docker (healthy) |

> ðŸ¤– Ambos dashboards incluyen **AgentGD**, chatbot de IA (OpenRouter) como nube flotante arrastrable con contexto real de la base de datos.

## ðŸ“‹ Tabla de Contenido

- [Requisitos Previos](#requisitos-previos)
- [InstalaciÃ³n Paso a Paso](#instalaciÃ³n-paso-a-paso)
- [ConfiguraciÃ³n del Entorno](#configuraciÃ³n-del-entorno)
- [EjecuciÃ³n del Proyecto](#ejecuciÃ³n-del-proyecto)
- [VerificaciÃ³n de Servicios](#verificaciÃ³n-de-servicios)
- [Acceso a la AplicaciÃ³n](#acceso-a-la-aplicaciÃ³n)
- [Comandos Ãštiles](#comandos-Ãºtiles)
- [SoluciÃ³n de Problemas Comunes](#soluciÃ³n-de-problemas-comunes)

---

## âœ… Requisitos Previos

### Software Necesario:

| Software | VersiÃ³n MÃ­nima | VerificaciÃ³n | Descarga |
|----------|----------------|--------------|----------|
| **Docker Desktop** | 20.x+ | `docker --version` | [Docker](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.x+ | `git --version` | [Git](https://git-scm.com/) |
| **Navegador Web** | Moderno | - | Chrome, Firefox, Edge |

### Verificar InstalaciÃ³n:

```bash
# Verificar Docker
docker --version
# Salida esperada: Docker version 20.x.x o superior

# Verificar Docker Compose
docker-compose --version
# Salida esperada: docker-compose version 2.x.x o superior

# Verificar Git
git --version
# Salida esperada: git version 2.x.x o superior
```

---

## ðŸ“¥ InstalaciÃ³n Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
# Abrir terminal y navegar al directorio deseado
cd C:\Users\[tu_usuario]\Desktop

# Clonar el repositorio
git clone https://github.com/estebanLopezU/PAE-2026-1.git

# Entrar al directorio del proyecto
cd PAE-2026-1
```

### Paso 2: Verificar Estructura del Proyecto

```bash
# Listar archivos del proyecto
dir
# DeberÃ­as ver:
# - PAE 2026/
# - .git/
# - .gitignore
```

### Paso 3: Iniciar Docker Desktop

1. **Buscar Docker Desktop** en el menÃº de inicio
2. **Hacer clic** para abrir Docker Desktop
3. **Esperar** a que aparezca "Docker Desktop is running" en la barra de tareas
4. **Verificar** que no haya errores en la interfaz de Docker Desktop

---

## âš™ï¸ ConfiguraciÃ³n del Entorno

### Variables de Entorno del Backend:

El archivo `BackendInteroperabilidad/.env` ya estÃ¡ configurado con valores por defecto:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/xroad_colombia

# ConfiguraciÃ³n de la aplicaciÃ³n
SECRET_KEY=xroad-colombia-secret-key-2026
DEBUG=false

# ConfiguraciÃ³n del servidor
HOST=0.0.0.0
PORT=8000
```

### Variables de Entorno del Frontend:

El frontend se configura automÃ¡ticamente a travÃ©s de Docker.

---

## â–¶ï¸ EjecuciÃ³n del Proyecto

### OpciÃ³n 0: Frontend local (`npm run dev`) + Backend/DB en Docker (Recomendada para desarrollo)

Esta opciÃ³n te permite tener:
- **Hot reload rÃ¡pido en frontend** con Vite.
- **Mismos datos de Docker** (backend + postgres).

#### Paso A: Levantar backend y base de datos en Docker

```bash
cd "PAE 2026"
docker compose up -d postgres backend
```

> Nota: En este proyecto existe `docker-compose.override.yml` para desarrollo, que habilita:
> - `backend` con `--reload`
> - `postgres` expuesto en `5432:5432`

#### Paso B: Ejecutar frontend en local

En otra terminal:

```bash
cd "PAE 2026/FrontendInteroperabilidad"
npm run dev
```

Frontend disponible en:
- `http://localhost:5173`

#### Paso C: Ejecutar Portal de Entrada y GOVStake en local

En otra terminal (requieren Node.js):

```bash
# Portal de entrada (puerto 3000)
cd "PAE 2026/PortalEntrada"
npm install
npx vite --port 3000

# Frontend GOVStake (puerto 3002)
cd "PAE 2026/FrontendGovstacke"
npm install
npx vite --port 3002
```

> El backend de GOVStake ya corre en Docker (puerto 8002) con el comando `docker compose up -d` del Paso A (incluye `govstake-backend` y `govstake-db`).

#### Error comÃºn y soluciÃ³n

Si ves:

```bash
npm error Missing script: "dev"
```

estÃ¡s en la carpeta incorrecta. Debes ejecutar en `PAE 2026/FrontendInteroperabilidad`.

TambiÃ©n puedes lanzarlo desde la raÃ­z con:

```bash
npm --prefix "PAE 2026/FrontendInteroperabilidad" run dev
```

#### Â¿QuÃ© se actualiza automÃ¡ticamente?

- Cambios en `frontend/src`: **sÃ­** (hot reload).
- Cambios en `backend/app`: **sÃ­** (uvicorn `--reload` en Docker).
- Cambios de datos en PostgreSQL: **sÃ­**, al refrescar/reconsultar API.
- Cambios en `Dockerfile`, dependencias o `docker-compose*.yml`: requieren reinicio/rebuild.

### OpciÃ³n 1: EjecuciÃ³n Simple (Recomendada)

```bash
# Navegar al directorio del proyecto
cd "PAE 2026"

# Iniciar todos los servicios
docker-compose up -d
```

**Salida Esperada:**
```
[+] Running 4/4
 âœ” Network pae-2026_default       Created
 âœ” Container xroad-postgres       Started
 âœ” Container xroad-backend        Started
 âœ” Container xroad-frontend       Started
```

### OpciÃ³n 2: EjecuciÃ³n con ReconstrucciÃ³n

```bash
# Si es la primera vez o hubo cambios en el cÃ³digo
docker-compose up -d --build
```

### OpciÃ³n 3: EjecuciÃ³n con Logs Visibles

```bash
# Para ver los logs en tiempo real
docker-compose up
```

---

## ðŸ” VerificaciÃ³n de Servicios

### Verificar Estado de Contenedores:

```bash
# Ver todos los contenedores corriendo
docker ps

# Ver solo los contenedores del proyecto
docker ps --filter "name=xroad"

# Salida esperada:
# CONTAINER ID   IMAGE                STATUS          PORTS
# xxxxx          pae2026-frontend     Up 2 minutes    0.0.0.0:5173->80/tcp
# xxxxx          pae2026-backend      Up 2 minutes    0.0.0.0:8000->8000/tcp
# xxxxx          postgres:15-alpine   Up 2 minutes    0.0.0.0:5432->5432/tcp
```

### Verificar Logs:

```bash
# Logs del backend
docker logs xroad-backend --tail 50

# Logs del frontend
docker logs xroad-frontend --tail 50

# Logs de PostgreSQL
docker logs xroad-postgres --tail 50

# Seguir logs en tiempo real
docker logs -f xroad-backend
```

### Verificar ConexiÃ³n a la Base de Datos:

```bash
# Acceder a PostgreSQL
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia

# Dentro de PostgreSQL, ejecutar:
\dt  # Ver tablas
SELECT COUNT(*) FROM entities;  # Contar entidades
\q   # Salir
```

---

## ðŸŒ Acceso a la AplicaciÃ³n

### URLs de Acceso:

| Servicio | URL | DescripciÃ³n |
|----------|-----|-------------|
| **Frontend Principal** | http://localhost:5173 | Interfaz de usuario |
| **Backend API** | http://localhost:8000 | API REST |
| **DocumentaciÃ³n API** | http://localhost:8000/docs | Swagger UI |
| **PostgreSQL** | localhost:5432 | Base de datos |

### Abrir en el Navegador:

```bash
# Windows - Abrir frontend
start http://localhost:5173

# Windows - Abrir documentaciÃ³n API
start http://localhost:8000/docs

# Mac/Linux - Abrir frontend
open http://localhost:5173
```

---

## ðŸ› ï¸ Comandos Ãštiles

### GestiÃ³n de Contenedores:

```bash
# Iniciar servicios
docker-compose start

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volÃºmenes
docker-compose down -v

# Reconstruir imÃ¡genes
docker-compose build

# Reconstruir y iniciar
docker-compose up -d --build
```

### GestiÃ³n de ImÃ¡genes:

```bash
# Ver imÃ¡genes descargadas
docker images

# Eliminar imÃ¡genes no utilizadas
docker image prune

# Eliminar todas las imÃ¡genes no utilizadas
docker image prune -a
```

### Acceso a Contenedores:

```bash
# Acceder al backend
docker exec -it xroad-backend bash

# Acceder al frontend
docker exec -it xroad-frontend sh

# Acceder a PostgreSQL
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia
```

### Cargar Datos de Ejemplo:

```bash
# Ejecutar script de datos iniciales
docker exec xroad-backend python scripts/seed_data.py

# Verificar que se cargaron los datos
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia -c "SELECT COUNT(*) FROM entities;"
```

---

## ðŸ”§ SoluciÃ³n de Problemas Comunes

### Problema 1: Docker Desktop No EstÃ¡ Corriendo

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**SoluciÃ³n:**
1. Abrir Docker Desktop desde el menÃº de inicio
2. Esperar a que aparezca "Docker Desktop is running"
3. Verificar en la barra de tareas que Docker estÃ© corriendo
4. Ejecutar nuevamente: `docker-compose up -d`

---

### Problema 2: Puerto Ya en Uso

**Error:**
```
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**SoluciÃ³n:**
```bash
# OpciÃ³n 1: Detener todos los contenedores
docker stop $(docker ps -aq)

# OpciÃ³n 2: Ver quÃ© proceso usa el puerto
netstat -ano | findstr :8000

# OpciÃ³n 3: Cambiar puerto en docker-compose.yml
# Editar docker-compose.yml y cambiar los puertos
```

---

### Problema 3: Contenedores No Inician

**Ver logs para identificar el problema:**
```bash
docker logs xroad-backend
docker logs xroad-frontend
docker logs xroad-postgres
```

**SoluciÃ³n general:**
```bash
# Detener todo
docker-compose down

# Reconstruir desde cero
docker-compose up -d --build
```

---

### Problema 4: No Hay Datos en la Base de Datos

**Verificar si hay datos:**
```bash
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia -c "SELECT COUNT(*) FROM entities;"
```

**Cargar datos de ejemplo:**
```bash
docker exec xroad-backend python scripts/seed_data.py
```

**Reiniciar con datos nuevos:**
```bash
docker-compose down -v
docker-compose up -d
docker exec xroad-backend python scripts/seed_data.py
```

---

### Problema 5: Error de ConexiÃ³n a la API

**Verificar que el backend estÃ© corriendo:**
```bash
curl http://localhost:8000/health
```

**Verificar logs del backend:**
```bash
docker logs xroad-backend --tail 100
```

**Reiniciar el backend:**
```bash
docker-compose restart backend
```

---

### Problema 6: Pantalla Blanca o Error en el Frontend

**Limpiar cachÃ© del navegador:**
- Chrome: `Ctrl + Shift + Delete` â†’ Limpiar datos de navegaciÃ³n
- Firefox: `Ctrl + Shift + Delete` â†’ Limpiar todo
- Edge: `Ctrl + Shift + Delete` â†’ Limpiar datos de navegaciÃ³n

**Reconstruir el frontend:**
```bash
docker-compose up -d --build frontend
```

---

## ðŸ“Š Monitoreo de la AplicaciÃ³n

### Ver Uso de Recursos:

```bash
# Ver uso de CPU y memoria
docker stats

# Ver uso especÃ­fico de contenedores
docker stats xroad-backend xroad-frontend xroad-postgres
```

### Ver Logs en Tiempo Real:

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker logs -f xroad-backend

# Solo frontend
docker logs -f xroad-frontend

# Solo PostgreSQL
docker logs -f xroad-postgres
```

---

## ðŸ›‘ Detener el Proyecto

### OpciÃ³n 1: Detener Manteniendo Datos

```bash
# Los datos se mantienen en los volÃºmenes de Docker
docker-compose stop
```

### OpciÃ³n 2: Detener y Eliminar Contenedores

```bash
# Los datos se mantienen en los volÃºmenes de Docker
docker-compose down
```

### OpciÃ³n 3: Eliminar Todo Incluyendo Datos

```bash
# âš ï¸ CUIDADO: Esto elimina todos los datos de la base de datos
docker-compose down -v
```

---

## ðŸ“ž Soporte Adicional

### Comandos de Emergencia:

```bash
# Si todo falla, ejecutar en orden:
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Recursos:

- **DocumentaciÃ³n del Proyecto:** README.md
- **Repositorio:** https://github.com/estebanLopezU/PAE-2026-1
- **Docker Desktop:** https://www.docker.com/products/docker-desktop/

---

**Â¡Listo! Ahora puedes ejecutar y usar el proyecto X-Road Colombia sin problemas. ðŸ‡¨ðŸ‡´**