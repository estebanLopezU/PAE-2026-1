# 🚀 Guía de Ejecución Detallada - X-Road Colombia

## 📋 Tabla de Contenido

- [Requisitos Previos](#requisitos-previos)
- [Instalación Paso a Paso](#instalación-paso-a-paso)
- [Configuración del Entorno](#configuración-del-entorno)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Verificación de Servicios](#verificación-de-servicios)
- [Acceso a la Aplicación](#acceso-a-la-aplicación)
- [Comandos Útiles](#comandos-útiles)
- [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## ✅ Requisitos Previos

### Software Necesario:

| Software | Versión Mínima | Verificación | Descarga |
|----------|----------------|--------------|----------|
| **Docker Desktop** | 20.x+ | `docker --version` | [Docker](https://www.docker.com/products/docker-desktop/) |
| **Git** | 2.x+ | `git --version` | [Git](https://git-scm.com/) |
| **Navegador Web** | Moderno | - | Chrome, Firefox, Edge |

### Verificar Instalación:

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

## 📥 Instalación Paso a Paso

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
# Deberías ver:
# - PAE 2026/
# - .git/
# - .gitignore
```

### Paso 3: Iniciar Docker Desktop

1. **Buscar Docker Desktop** en el menú de inicio
2. **Hacer clic** para abrir Docker Desktop
3. **Esperar** a que aparezca "Docker Desktop is running" en la barra de tareas
4. **Verificar** que no haya errores en la interfaz de Docker Desktop

---

## ⚙️ Configuración del Entorno

### Variables de Entorno del Backend:

El archivo `backend/.env` ya está configurado con valores por defecto:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/xroad_colombia

# Configuración de la aplicación
SECRET_KEY=xroad-colombia-secret-key-2026
DEBUG=false

# Configuración del servidor
HOST=0.0.0.0
PORT=8000
```

### Variables de Entorno del Frontend:

El frontend se configura automáticamente a través de Docker.

---

## ▶️ Ejecución del Proyecto

### Opción 1: Ejecución Simple (Recomendada)

```bash
# Navegar al directorio del proyecto
cd "PAE 2026"

# Iniciar todos los servicios
docker-compose up -d
```

**Salida Esperada:**
```
[+] Running 4/4
 ✔ Network pae-2026_default       Created
 ✔ Container xroad-postgres       Started
 ✔ Container xroad-backend        Started
 ✔ Container xroad-frontend       Started
```

### Opción 2: Ejecución con Reconstrucción

```bash
# Si es la primera vez o hubo cambios en el código
docker-compose up -d --build
```

### Opción 3: Ejecución con Logs Visibles

```bash
# Para ver los logs en tiempo real
docker-compose up
```

---

## 🔍 Verificación de Servicios

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

### Verificar Conexión a la Base de Datos:

```bash
# Acceder a PostgreSQL
docker exec -it xroad-postgres psql -U postgres -d xroad_colombia

# Dentro de PostgreSQL, ejecutar:
\dt  # Ver tablas
SELECT COUNT(*) FROM entities;  # Contar entidades
\q   # Salir
```

---

## 🌐 Acceso a la Aplicación

### URLs de Acceso:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend Principal** | http://localhost:5173 | Interfaz de usuario |
| **Backend API** | http://localhost:8000 | API REST |
| **Documentación API** | http://localhost:8000/docs | Swagger UI |
| **PostgreSQL** | localhost:5432 | Base de datos |

### Abrir en el Navegador:

```bash
# Windows - Abrir frontend
start http://localhost:5173

# Windows - Abrir documentación API
start http://localhost:8000/docs

# Mac/Linux - Abrir frontend
open http://localhost:5173
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores:

```bash
# Iniciar servicios
docker-compose start

# Detener servicios
docker-compose stop

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes
docker-compose down -v

# Reconstruir imágenes
docker-compose build

# Reconstruir y iniciar
docker-compose up -d --build
```

### Gestión de Imágenes:

```bash
# Ver imágenes descargadas
docker images

# Eliminar imágenes no utilizadas
docker image prune

# Eliminar todas las imágenes no utilizadas
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

## 🔧 Solución de Problemas Comunes

### Problema 1: Docker Desktop No Está Corriendo

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solución:**
1. Abrir Docker Desktop desde el menú de inicio
2. Esperar a que aparezca "Docker Desktop is running"
3. Verificar en la barra de tareas que Docker esté corriendo
4. Ejecutar nuevamente: `docker-compose up -d`

---

### Problema 2: Puerto Ya en Uso

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

# Opción 3: Cambiar puerto en docker-compose.yml
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

**Solución general:**
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

### Problema 5: Error de Conexión a la API

**Verificar que el backend esté corriendo:**
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

**Limpiar caché del navegador:**
- Chrome: `Ctrl + Shift + Delete` → Limpiar datos de navegación
- Firefox: `Ctrl + Shift + Delete` → Limpiar todo
- Edge: `Ctrl + Shift + Delete` → Limpiar datos de navegación

**Reconstruir el frontend:**
```bash
docker-compose up -d --build frontend
```

---

## 📊 Monitoreo de la Aplicación

### Ver Uso de Recursos:

```bash
# Ver uso de CPU y memoria
docker stats

# Ver uso específico de contenedores
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

## 🛑 Detener el Proyecto

### Opción 1: Detener Manteniendo Datos

```bash
# Los datos se mantienen en los volúmenes de Docker
docker-compose stop
```

### Opción 2: Detener y Eliminar Contenedores

```bash
# Los datos se mantienen en los volúmenes de Docker
docker-compose down
```

### Opción 3: Eliminar Todo Incluyendo Datos

```bash
# ⚠️ CUIDADO: Esto elimina todos los datos de la base de datos
docker-compose down -v
```

---

## 📞 Soporte Adicional

### Comandos de Emergencia:

```bash
# Si todo falla, ejecutar en orden:
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Recursos:

- **Documentación del Proyecto:** README.md
- **Repositorio:** https://github.com/estebanLopezU/PAE-2026-1
- **Docker Desktop:** https://www.docker.com/products/docker-desktop/

---

**¡Listo! Ahora puedes ejecutar y usar el proyecto X-Road Colombia sin problemas. 🇨🇴**