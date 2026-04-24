# 🚀 X-Road Colombia - Plataforma de Interoperabilidad Gubernamental

**X-Road Colombia** es una plataforma integral para la gestión y monitoreo de la interoperabilidad entre entidades gubernamentales colombianas, diseñada para facilitar el seguimiento del Marco de Interoperabilidad del MinTIC.

---

## ⚡ Guía Rápida de Ejecución (Docker)

Sigue estos pasos para poner en marcha todo el ecosistema en menos de 5 minutos:

### 1. Requisitos Previos
- Tener instalado **Docker Desktop**.
- Asegurarse de que Docker Desktop esté iniciado y funcionando.

### 2. Iniciar Servicios
Abre una terminal en la carpeta raíz del proyecto (`PAE 2026`) y ejecuta:

```bash
docker-compose up -d
```

### 3. Accesos Directos
Una vez que los contenedores estén activos, puedes acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 **Frontend** | [http://localhost:5173](http://localhost:5173) | Interfaz de usuario (React/Vite) |
| ⚙️ **Backend API** | [http://localhost:8000](http://localhost:8000) | API REST principal (FastAPI) |
| 📖 **Docs API** | [http://localhost:8000/docs](http://localhost:8000/docs) | Documentación interactiva Swagger |
| 🗄️ **Base de Datos** | `localhost:5432` | PostgreSQL (User: `postgres` / Pass: `postgres`) |

---

## 🛠️ Comandos Útiles de Mantenimiento

### Ver el estado de los contenedores:
```bash
docker ps
```

### Ver logs en tiempo real (útil para depuración):
```bash
# Backend
docker logs -f xroad-backend

# Frontend
docker logs -f xroad-frontend
```

### Detener la aplicación:
```bash
# Detener sin borrar datos
docker-compose stop

# Detener y eliminar contenedores
docker-compose down
```

---

## 📁 Estructura del Proyecto

*   **`/frontend`**: Aplicación React con Vite y Tailwind CSS.
*   **`/backend`**: API construida con FastAPI, SQLAlchemy y PostgreSQL.
*   **`/backend/app/models`**: Definiciones de tablas de la base de datos.
*   **`/backend/app/api`**: Endpoints de la lógica de negocio.
*   **`docker-compose.yml`**: Orquestación de servicios.

---

## 🎯 Hallazgo Principal del Estudio
De las **127 entidades** registradas en el nodo central:
- **77 entidades (60%)**: Operativas con información pública y servicios accesibles.
- **50 entidades (40%)**: Registradas pero sin presencia pública ni operativa verificable.

---

## 🔧 Solución de Problemas Comunes

**1. ¿El frontend muestra un error de conexión?**
Verifica que el contenedor `xroad-backend` esté corriendo (`docker ps`). Si no, revisa los logs con `docker logs xroad-backend`.

**2. ¿Puertos ocupados?**
Si el puerto 8000 o 5173 ya están en uso, asegúrate de cerrar otras aplicaciones que los utilicen o cambia la configuración en `docker-compose.yml`.

**3. ¿Base de datos vacía?**
Puedes cargar datos iniciales ejecutando:
```bash
docker exec xroad-backend python scripts/seed_data.py
```

---
**PAE 2026** - *Impulsando la interoperabilidad en Colombia* 🇨🇴
