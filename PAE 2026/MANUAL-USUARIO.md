# 📘 Manual de Usuario - X-Road Colombia

**Plataforma de Interoperabilidad Gubernamental Colombiana**

---

## 📋 Tabla de Contenido

- [1. Introducción](#1-introducción)
- [2. Requisitos del Sistema](#2-requisitos-del-sistema)
- [3. Instalación de Docker Desktop](#3-instalación-de-docker-desktop)
- [4. Instalación de Git](#4-instalación-de-git)
- [5. Descarga del Proyecto](#5-descarga-del-proyecto)
- [6. Configuración del Entorno](#6-configuración-del-entorno)
- [7. Ejecución del Proyecto](#7-ejecución-del-proyecto)
  - [7.1. Opción 1: Todo con Docker (Recomendada)](#71-opción-1-todo-con-docker-recomendada)
  - [7.2. Opción 2: Frontend local + Backend/DB en Docker (Desarrollo)](#72-opción-2-frontend-local--backenddb-en-docker-desarrollo)
  - [7.3. Opción 3: Desarrollo completamente local](#73-opción-3-desarrollo-completamente-local)
- [8. Acceso a la Aplicación](#8-acceso-a-la-aplicación)
- [9. Gestión de la Base de Datos](#9-gestión-de-la-base-de-datos)
- [10. Credenciales de Acceso](#10-credenciales-de-acceso)
- [11. Comandos Útiles](#11-comandos-útiles)
- [12. Solución de Problemas Comunes](#12-solución-de-problemas-comunes)
- [13. Estructura del Proyecto](#13-estructura-del-proyecto)
- [14. Apéndice: Dependencias del Proyecto](#14-apéndice-dependencias-del-proyecto)

---

## 1. Introducción

**X-Road Colombia** es una plataforma integral para la gestión y monitoreo de la interoperabilidad entre entidades gubernamentales colombianas. Está diseñada para facilitar el seguimiento del Marco de Interoperabilidad del MinTIC.

### Arquitectura General

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend API   │────▶│   PostgreSQL    │
│  (React/Vite)   │◀────│   (FastAPI)     │◀────│   (Base Datos)  │
│   Puerto 5173   │     │   Puerto 8000   │     │   Puerto 5432   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Requisitos del Sistema

### Requisitos Mínimos de Hardware

| Componente | Especificación |
|------------|----------------|
| **Procesador** | Intel Core i5 / AMD Ryzen 5 o superior |
| **Memoria RAM** | 8 GB (16 GB recomendados) |
| **Disco Duro** | 10 GB de espacio libre |
| **Sistema Operativo** | Windows 10/11, macOS 12+, o Linux (Ubuntu 22.04+) |

### Software Necesario

| Software | Versión Mínima | Propósito |
|----------|----------------|-----------|
| **Docker Desktop** | v20.x | Contenerización de servicios |
| **Git** | v2.x | Control de versiones y clonación |
| **Navegador Web** | Moderno (Chrome, Firefox, Edge) | Interfaz de usuario |
| **Node.js** (opcional) | v18.x o superior | Desarrollo frontend local |
| **Python** (opcional) | v3.11 o superior | Desarrollo backend local |

### Verificar Instalación Previa

Abre una terminal (CMD, PowerShell o Git Bash) y ejecuta:

```bash
# Verificar Docker
docker --version
# Salida esperada: Docker version 24.x.x o superior

# Verificar Docker Compose (viene integrado en Docker Desktop)
docker compose version
# Salida esperada: Docker Compose version v2.x.x o superior

# Verificar Git
git --version
# Salida esperada: git version 2.x.x.windows.x o superior
```

---

## 3. Instalación de Docker Desktop

### Windows

1. **Descargar Docker Desktop**
   - Ve a: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   - Haz clic en **"Download for Windows"**

2. **Instalar Docker Desktop**
   - Ejecuta el instalador (`Docker Desktop Installer.exe`)
   - Asegúrate de marcar la opción **"Use WSL 2 instead of Hyper-V"** (recomendado)
   - Haz clic en **"OK"** y espera a que termine la instalación
   - Cuando termine, haz clic en **"Close and restart"**

3. **Configurar Docker Desktop**
   - Una vez reiniciado, Docker Desktop se iniciará automáticamente
   - Acepta los términos de servicio
   - Completa el tutorial de inicio (opcional, puedes saltarlo)
   - Espera a que aparezca el mensaje **"Docker Desktop is running"** en la esquina inferior izquierda

4. **Verificar la instalación**
   ```bash
   docker run hello-world
   ```
   Deberías ver un mensaje de bienvenida de Docker.

5. **Asignar recursos suficientes a Docker** (recomendado)
   - Abre Docker Desktop
   - Ve a **Settings** → **Resources** → **Advanced**
   - Asigna al menos:
     - **CPUs:** 4
     - **Memory:** 6 GB (6144 MB)
     - **Swap:** 2 GB
     - **Disk image size:** 64 GB
   - Haz clic en **"Apply & Restart"**

### macOS

1. Descarga Docker Desktop desde [docker.com](https://www.docker.com/products/docker-desktop/)
2. Arrastra el ícono de Docker a la carpeta **Applications**
3. Abre Docker Desktop desde **Applications**
4. Espera a que aparezca **"Docker Desktop is running"**

### Linux (Ubuntu 22.04+)

```bash
# Actualizar paquetes
sudo apt update

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg

# Agregar repositorio oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Iniciar Docker y habilitar inicio automático
sudo systemctl enable docker
sudo systemctl start docker

# Agregar tu usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER
# Cerrar sesión y volver a iniciar para aplicar cambios
```

---

## 4. Instalación de Git

### Windows

1. Descarga Git desde: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Ejecuta el instalador (`Git-2.x.x-64-bit.exe`)
3. Durante la instalación, **mantén las opciones predeterminadas**
4. Al llegar a **"Choosing the default editor"**, puedes elegir **Visual Studio Code** (si lo tienes instalado) o **Nano**
5. En **"Adjusting your PATH environment"**, selecciona **"Git from the command line and also from 3rd-party software"**
6. Completa la instalación con las opciones por defecto

### macOS

```bash
# Opción 1: Con Homebrew
brew install git

# Opción 2: Xcode Command Line Tools (ya incluye Git)
xcode-select --install
```

### Linux (Ubuntu/Debian)

```bash
sudo apt install -y git
```

---

## 5. Descarga del Proyecto

### Paso 1: Clonar el Repositorio

Abre una terminal (CMD, PowerShell o Git Bash) y ejecuta:

```bash
# Navegar al directorio donde quieres guardar el proyecto
cd C:\Users\esteb\OneDrive\Desktop

# Clonar el repositorio
git clone https://github.com/estebanLopezU/PAE-2026-1.git

# Entrar al directorio del proyecto
cd PAE-2026-1
```

### Paso 2: Verificar la Estructura

```bash
# En Windows
dir

# En Mac/Linux
ls -la
```

Deberías ver algo similar a:

```
PAE 2026/          ← Carpeta principal del proyecto
.git/              ← Repositorio git (oculto)
.gitattributes     ← Configuración de Git
.gitignore         ← Archivos ignorados por Git
INFORME_PRACTICA_ACADEMICA.md
desktop.ini
```

### Paso 3: Entrar al Directorio del Proyecto

```bash
cd "PAE 2026"
```

A partir de ahora, todos los comandos asumen que estás dentro de la carpeta `PAE 2026`.

---

## 6. Configuración del Entorno

### Variables de Entorno (Backend)

El archivo `backend/.env` ya viene preconfigurado con valores por defecto. No necesitas modificarlo a menos que quieras cambiar credenciales o configuraciones:

```env
# Aplicación
APP_NAME="X-Road Interoperability Mapper"
APP_VERSION="1.0.0"
DEBUG=False

# Autenticación
AUTH_ENABLED=True
JWT_SECRET_KEY="502114ecd6f777493c9c42218ce673a49542b172e62e4819580e6829e50ac507"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_MINUTES=10080
RATE_LIMIT_PER_MINUTE=120

# Credenciales de administrador
ADMIN_EMAIL="elopezu@unal.edu.co"
ADMIN_PASSWORD="BZTfne48"

# Credenciales de analista
ANALYST_EMAIL="analista@xroad.gov.co"
ANALYST_PASSWORD="Analista123*"

# Base de datos
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/xroad_colombia"
```

> **⚠️ Importante:** En producción, debes cambiar `JWT_SECRET_KEY`, `ADMIN_PASSWORD` y `ANALYST_PASSWORD` por valores seguros.

### Variables del Frontend

El frontend se configura automáticamente a través de Docker. La URL base de la API se define en el `docker-compose.yml`:

```yaml
args:
  VITE_API_BASE_URL: /api/v1
```

---

## 7. Ejecución del Proyecto

### 7.1. Opción 1: Todo con Docker (Recomendada)

Esta opción inicia todos los servicios (frontend, backend y base de datos) con un solo comando.

#### Requisitos
- ✅ Docker Desktop instalado y corriendo

#### Pasos

**Paso 1:** Asegúrate de que **Docker Desktop esté corriendo** (debe mostrar "Running" en la barra de estado)

**Paso 2:** Abre una terminal y navega al proyecto:

```bash
cd C:\Users\esteb\OneDrive\Desktop\PAE-2026-1\"PAE 2026"
```

**Paso 3:** Inicia todos los servicios:

```bash
docker compose up -d
```

**Salida esperada:**
```
[+] Running 4/4
 ✔ Network pae-2026_default       Created
 ✔ Container xroad-postgres       Started
 ✔ Container xroad-backend        Started
 ✔ Container xroad-frontend       Started
```

**Paso 4:** Espera 30-60 segundos para que los servicios se inicien completamente, luego verifica:

```bash
docker ps --filter "name=xroad"
```

**Salida esperada:**
```
CONTAINER ID   IMAGE                STATUS          PORTS
xxxxxxxxxxxx   pae2026-frontend     Up 2 minutes    0.0.0.0:5173->80/tcp
xxxxxxxxxxxx   pae2026-backend      Up 2 minutes    0.0.0.0:8000->8000/tcp
xxxxxxxxxxxx   postgres:15-alpine   Up 2 minutes    0.0.0.0:5432->5432/tcp
```

**Paso 5 (opcional):** Carga datos iniciales de ejemplo:

```bash
docker exec xroad-backend python scripts/seed_data.py
```

#### Si hay cambios en el código

Si modificaste el código fuente y necesitas reconstruir las imágenes:

```bash
docker compose up -d --build
```

---

### 7.2. Opción 2: Frontend local + Backend/DB en Docker (Desarrollo)

Esta opción te permite tener **hot reload rápido en el frontend** con Vite mientras usas Docker para el backend y la base de datos.

#### Requisitos
- ✅ Docker Desktop instalado y corriendo
- ✅ Node.js v18+ instalado

#### Pasos

**Paso 1:** Levanta el backend y la base de datos en Docker:

```bash
cd C:\Users\esteb\OneDrive\Desktop\PAE-2026-1\"PAE 2026"
docker compose up -d postgres backend
```

**Paso 2:** En una terminal diferente, instala las dependencias del frontend y ejecútalo localmente:

```bash
cd C:\Users\esteb\OneDrive\Desktop\PAE-2026-1\"PAE 2026"\frontend
npm install
npm run dev
```

**Salida esperada:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

**Paso 3 (opcional):** Carga datos iniciales:

```bash
docker exec xroad-backend python scripts/seed_data.py
```

#### ¿Qué se actualiza automáticamente?

- Cambios en `frontend/src/` → **Sí** (hot reload con Vite)
- Cambios en `backend/app/` → **Sí** (uvicorn con `--reload`)
- Cambios en `backend/requirements.txt` o `Dockerfile` → Requieren reinicio (`docker compose up -d --build`)
- Cambios en dependencias del frontend → Requieren reinstalar con `npm install`

---

### 7.3. Opción 3: Desarrollo completamente local

Esta opción ejecuta todo sin Docker. Útil si no puedes instalar Docker o si quieres ejecutar todo de forma nativa.

#### Requisitos
- ✅ Node.js v18+ instalado
- ✅ Python 3.11+ instalado
- ✅ PostgreSQL instalado y corriendo localmente

#### Backend

```bash
# Navegar al directorio del backend
cd "PAE 2026/backend"

# Crear y activar entorno virtual
python -m venv venv

# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variable de entorno para base de datos local
# En Windows:
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xroad_colombia
# En Mac/Linux:
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/xroad_colombia

# Ejecutar el servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

En otra terminal:

```bash
# Navegar al directorio del frontend
cd "PAE 2026/frontend"

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

---

## 8. Acceso a la Aplicación

Una vez que los servicios estén corriendo, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 **Frontend** | [http://localhost:5173](http://localhost:5173) | Interfaz de usuario |
| ⚙️ **Backend API** | [http://localhost:8000](http://localhost:8000) | API REST principal |
| 📖 **Documentación API (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Documentación interactiva de la API |
| 🗄️ **Base de Datos** | `localhost:5432` | PostgreSQL |

### Abrir Automáticamente en el Navegador

```bash
# Windows
start http://localhost:5173
start http://localhost:8000/docs

# Mac
open http://localhost:5173

# Linux
xdg-open http://localhost:5173
```

---

## 9. Gestión de la Base de Datos

### Acceder a PostgreSQL

```bash
# Conectar a la base de datos
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia

# Comandos útiles dentro de psql:
\dt           # Listar tablas
\d entities   # Ver estructura de una tabla
SELECT COUNT(*) FROM entities;  # Contar registros
\q            # Salir
```

### Cargar Datos Iniciales

```bash
# Cargar datos de ejemplo (entidades y relaciones)
docker exec xroad-backend python scripts/seed_data.py

# Verificar que se cargaron los datos
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia -c "SELECT COUNT(*) FROM entities;"
```

### Respaldo y Restauración (Opcional)

```bash
# Respaldo de la base de datos
docker exec -t xroad-postgres pg_dump -U postgres xroad_colombia > respaldo_xroad.sql

# Restauración de la base de datos
docker exec -i xroad-postgres psql -U postgres -d xroad_colombia < respaldo_xroad.sql
```

---

## 10. Credenciales de Acceso

| Rol | Correo Electrónico | Contraseña |
|-----|--------------------|------------|
| 👑 **Administrador** | `elopezu@unal.edu.co` | `BZTfne48` |
| 🔍 **Analista** | `analista@xroad.gov.co` | `Analista123*` |

> **⚠️ Importante:** Cambia estas credenciales en `backend/.env` antes de usar el sistema en producción.

---

## 11. Comandos Útiles

### Gestión de Contenedores

```bash
# Ver contenedores activos
docker ps

# Ver contenedores del proyecto
docker ps --filter "name=xroad"

# Ver estado de todos los contenedores (incluso detenidos)
docker ps -a --filter "name=xroad"

# Detener servicios (mantiene datos)
docker compose stop

# Detener y eliminar contenedores (mantiene datos)
docker compose down

# Eliminar todo (contenedores, redes y volúmenes ⚠️ BORRA DATOS)
docker compose down -v

# Reconstruir imágenes
docker compose build

# Reconstruir e iniciar
docker compose up -d --build

# Solo reconstruir el backend
docker compose up -d --build backend

# Solo reconstruir el frontend
docker compose up -d --build frontend
```

### Ver Logs

```bash
# Logs de todos los servicios
docker compose logs -f

# Logs del backend (últimas 50 líneas)
docker logs xroad-backend --tail 50

# Logs del frontend
docker logs xroad-frontend --tail 50

# Logs de PostgreSQL
docker logs xroad-postgres --tail 50

# Seguir logs del backend en tiempo real
docker logs -f xroad-backend
```

### Acceder a Contenedores

```bash
# Acceder al backend (bash)
docker exec -it xroad-backend bash

# Acceder al frontend (sh - Alpine usa BusyBox/sh)
docker exec -it xroad-frontend sh

# Acceder a PostgreSQL (consola psql)
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia
```

### Monitoreo de Recursos

```bash
# Ver uso de CPU y memoria de todos los contenedores
docker stats

# Ver uso específico
docker stats xroad-backend xroad-frontend xroad-postgres
```

### Limpieza de Docker (cuando sea necesario)

```bash
# Ver imágenes descargadas
docker images

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar todo lo no utilizado (contenedores, imágenes, redes)
docker system prune -a

# Liberar espacio: eliminar todo (⚠️ CUIDADO: borra datos)
docker system prune -a --volumes
```

---

## 12. Solución de Problemas Comunes

### Problema 1: Docker Desktop no está corriendo

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...":
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solución:**
1. Abre **Docker Desktop** desde el menú de inicio
2. Espera a que aparezca **"Docker Desktop is running"**
3. Verifica en la bandeja del sistema (esquina inferior derecha) que el ícono de Docker esté activo
4. Si no se inicia, reinicia Docker Desktop desde el menú **Troubleshoot** → **Restart**

---

### Problema 2: Puerto ya en uso

**Error:**
```
Bind for 0.0.0.0:8000 failed: port is already allocated
```

**Solución:**
```bash
# Opción 1: Detener todos los contenedores
docker stop $(docker ps -aq)

# Opción 2: Ver qué proceso usa el puerto
netstat -ano | findstr :8000
# Toma el PID de la última columna y termínalo:
# taskkill /PID <PID> /F

# Opción 3: Si es otro contenedor de Docker, detenerlo:
docker stop <nombre_del_contenedor>

# Opción 4: Cambiar el puerto en docker-compose.yml
# Edita "8000:8000" a "8001:8000" (first number = external port)
```

---

### Problema 3: Contenedores no inician correctamente

**Síntomas:** `docker ps` no muestra los contenedores o muestran "Exited"

**Solución:**
```bash
# Ver logs para identificar el problema
docker logs xroad-backend
docker logs xroad-frontend
docker logs xroad-postgres

# Si es problema de base de datos: detener todo y reconstruir
docker compose down -v
docker compose up -d --build

# Si es problema de dependencias: reconstruir imágenes
docker compose up -d --build
```

---

### Problema 4: La base de datos está vacía

**Síntomas:** El frontend carga pero no muestra datos

**Solución:**
```bash
# Verificar si hay datos
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia -c "SELECT COUNT(*) FROM entities;"

# Si el resultado es 0, cargar datos:
docker exec xroad-backend python scripts/seed_data.py

# Si quieres reiniciar con datos frescos:
docker compose down -v
docker compose up -d
docker exec xroad-backend python scripts/seed_data.py
```

---

### Problema 5: Error de conexión a la API

**Síntomas:** El frontend muestra "Error de conexión" o "No se puede conectar al servidor"

**Solución:**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health

# Verificar logs del backend
docker logs xroad-backend --tail 100

# Verificar que el backend pueda conectarse a PostgreSQL
docker exec xroad-backend python -c "
from app.database import SessionLocal
try:
    db = SessionLocal()
    db.execute(text('SELECT 1'))
    print('✅ Conexión a BD exitosa')
except Exception as e:
    print(f'❌ Error: {e}')
"

# Reiniciar el backend
docker compose restart backend
```

---

### Problema 6: Frontend muestra pantalla blanca o error

**Solución:**
```bash
# Limpiar caché del navegador
# Chrome: Ctrl + Shift + Delete → Caché e imágenes
# Firefox: Ctrl + Shift + Delete → Caché
# Edge: Ctrl + Shift + Delete → Datos almacenados en caché

# Reconstruir frontend
docker compose up -d --build frontend
```

---

### Problema 7: Error de permisos en Linux

**Error:**
```
Permission denied while trying to connect to the Docker daemon socket
```

**Solución:**
```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a iniciar, o ejecutar:
newgrp docker
```

---

### Problema 8: Las imágenes no se descargan (proxy/firewall)

**Solución:**
```bash
# Verificar conectividad
docker pull hello-world

# Si hay proxy corporativo, configurar Docker:
# En Windows: Docker Desktop → Settings → Resources → Proxies
# En Linux: crear /etc/systemd/system/docker.service.d/proxy.conf

# Probar con un mirror de registro
echo '{"registry-mirrors": ["https://mirror.gcr.io"]}' > /etc/docker/daemon.json
sudo systemctl restart docker
```

---

### Problema 9: Comando `node` no encontrado

**Solución (Windows):**
```bash
# Descargar Node.js desde https://nodejs.org/ (versión LTS)
# Ejecutar el instalador y marcar "Add to PATH"
# Reiniciar la terminal

# Verificar instalación:
node --version
npm --version
```

---

### Problema 10: `git clone` falla

**Error:**
```
fatal: unable to access 'https://github.com/...': OpenSSL SSL_connect
```

**Solución:**
```bash
# Deshabilitar temporalmente la verificación SSL (solo como último recurso)
git config --global http.sslVerify false

# O usar SSH (si tienes configurada la clave SSH):
git clone git@github.com:estebanLopezU/PAE-2026-1.git

# Si estás detrás de un proxy corporativo:
git config --global http.proxy http://proxy:puerto
git config --global https.proxy http://proxy:puerto
```

---

## 13. Estructura del Proyecto

```
PAE-2026-1/
├── PAE 2026/                          ← Carpeta raíz del proyecto
│   ├── docker-compose.yml             ← Orquestación de servicios (producción)
│   ├── docker-compose.override.yml    ← Configuración adicional para desarrollo
│   ├── README.md                      ← Documentación general del proyecto
│   ├── GUIA_EJECUCION.md              ← Guía de ejecución detallada
│   ├── SECURITY_HARDENING.md          ← Medidas de seguridad implementadas
│   ├── articulo.md                    ← Artículo académico del proyecto
│   │
│   ├── backend/                       ← API REST (FastAPI)
│   │   ├── Dockerfile                 ← Imagen Docker del backend
│   │   ├── requirements.txt           ← Dependencias de Python
│   │   ├── .env                       ← Variables de entorno
│   │   ├── app/
│   │   │   ├── main.py                ← Punto de entrada de la aplicación
│   │   │   ├── config.py              ← Configuración de la aplicación
│   │   │   ├── database.py            ← Conexión a la base de datos
│   │   │   ├── security.py            ← Autenticación y seguridad
│   │   │   ├── api/                   ← Endpoints de la API
│   │   │   ├── models/                ← Modelos de SQLAlchemy
│   │   │   ├── schemas/               ← Esquemas de Pydantic
│   │   │   ├── seeds/                 ← Datos de prueba/semillas
│   │   │   ├── services/              ← Lógica de negocio
│   │   │   └── __init__.py
│   │   ├── scripts/
│   │   │   ├── seed_data.py           ← Script para cargar datos iniciales
│   │   │   ├── seed_relationships.py  ← Script para cargar relaciones
│   │   │   └── add_entities.py        ← Script para agregar entidades
│   │   └── reports/                   ← Reportes generados
│   │
│   ├── frontend/                      ← Aplicación React (Vite + Tailwind)
│   │   ├── Dockerfile                 ← Imagen Docker del frontend
│   │   ├── nginx.conf                 ← Configuración de Nginx (producción)
│   │   ├── package.json               ← Dependencias de Node.js
│   │   ├── vite.config.js             ← Configuración de Vite
│   │   ├── tailwind.config.js         ← Configuración de Tailwind CSS
│   │   ├── postcss.config.js          ← Configuración de PostCSS
│   │   ├── index.html                 ← Archivo HTML principal
│   │   ├── src/                       ← Código fuente del frontend
│   │   ├── public/                    ← Archivos estáticos públicos
│   │   ├── images/                    ← Imágenes del proyecto
│   │   ├── video/                     ← Videos del proyecto
│   │   └── dist/                      ← Compilación de producción
│   │
│   └── docs/                          ← Documentación adicional
│
├── .gitignore                         ← Archivos ignorados por Git
├── .gitattributes                     ← Configuración de Git
└── INFORME_PRACTICA_ACADEMICA.md      ← Informe de práctica académica
```

---

## 14. Apéndice: Dependencias del Proyecto

### Backend (Python)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| **fastapi** | 0.104.1 | Framework web para la API REST |
| **uvicorn** | 0.24.0 | Servidor ASGI para FastAPI |
| **sqlalchemy** | 2.0.23 | ORM para la base de datos |
| **alembic** | 1.12.1 | Migraciones de base de datos |
| **psycopg2-binary** | 2.9.9 | Conector a PostgreSQL |
| **pydantic** | 2.5.0 | Validación de datos |
| **pydantic-settings** | 2.1.0 | Gestión de configuración |
| **python-dotenv** | 1.0.0 | Carga de variables de entorno |
| **python-multipart** | 0.0.6 | Soporte para formularios |
| **httpx** | 0.25.2 | Cliente HTTP asíncrono |
| **pandas** | 2.1.3 | Análisis y manipulación de datos |
| **openpyxl** | 3.1.2 | Lectura/escritura de Excel |
| **scikit-learn** | 1.3.2 | Machine Learning |
| **numpy** | 1.26.2 | Cómputo numérico |
| **joblib** | 1.3.2 | Paralelización de tareas |
| **reportlab** | 4.0.7 | Generación de PDFs |
| **jinja2** | 3.1.2 | Motor de plantillas |
| **aiofiles** | 23.2.1 | Manejo de archivos asíncrono |
| **python-jose** | 3.3.0 | JWT para autenticación |
| **passlib** | 1.7.4 | Hash de contraseñas |

### Frontend (JavaScript/React)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| **react** | 18.2.0 | Framework de UI |
| **react-dom** | 18.2.0 | Renderizado DOM |
| **react-router-dom** | 6.20.0 | Enrutamiento SPA |
| **axios** | 1.6.2 | Cliente HTTP |
| **recharts** | 2.10.3 | Gráficos y visualizaciones |
| **leaflet** | 1.9.4 | Mapas interactivos |
| **react-leaflet** | 4.2.1 | Componentes de Leaflet para React |
| **d3-force** | 3.0.0 | Gráficos de fuerza/redes |
| **react-force-graph-2d** | 1.29.1 | Visualización de grafos |
| **lucide-react** | 0.294.0 | Iconos SVG |
| **i18next** | 23.7.16 | Internacionalización |
| **react-i18next** | 14.0.0 | Bindings de i18n para React |
| **i18next-browser-languagedetector** | 7.2.0 | Detección automática de idioma |
| **clsx** | 2.0.0 | Manejo de clases CSS condicionales |
| **jspdf** | 4.2.1 | Generación de PDFs en frontend |
| **jspdf-autotable** | 5.0.7 | Tablas en PDF |
| **vite** | 5.0.0 | Bundler y dev server |
| **tailwindcss** | 3.3.5 | Framework CSS utilitario |
| **postcss** | 8.4.31 | Procesador CSS |
| **autoprefixer** | 10.4.16 | Prefijos CSS automáticos |

### Tecnologías de Infraestructura

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Docker** | 20.x+ | Contenerización |
| **PostgreSQL** | 15 (Alpine) | Base de datos relacional |
| **Nginx** | Alpine | Servidor web y proxy inverso |
| **Node.js** | 20 (Alpine) | Entorno de ejecución frontend |
| **Python** | 3.11 (Slim) | Entorno de ejecución backend |

---

## 📞 Soporte y Contacto

- **Repositorio:** [https://github.com/estebanLopezU/PAE-2026-1](https://github.com/estebanLopezU/PAE-2026-1)
- **Documentación Adicional:** Revisa los archivos `README.md` y `GUIA_EJECUCION.md` en la carpeta del proyecto
- **Reportar Problemas:** Abre un *Issue* en el repositorio de GitHub

---

## 🧹 Checklist de Verificación Rápida

Antes de reportar un problema, verifica lo siguiente:

- [ ] Docker Desktop está instalado y corriendo
- [ ] Los puertos 5173, 8000 y 5432 están libres
- [ ] Ejecutaste `docker compose up -d` desde la carpeta `PAE 2026`
- [ ] Esperaste al menos 30 segundos después de iniciar
- [ ] Los contenedores aparecen con `docker ps --filter "name=xroad"`
- [ ] El frontend carga en `http://localhost:5173`
- [ ] La API responde en `http://localhost:8000/health`
- [ ] Los datos de ejemplo están cargados (ejecuta `seed_data.py` si es necesario)

---

**🇨🇴 X-Road Colombia - Plataforma de Interoperabilidad Gubernamental**  
*PAE 2026 - Universidad Nacional de Colombia*