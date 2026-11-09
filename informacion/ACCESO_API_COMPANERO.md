# Acceso API temporal para compañero — PAE 2026

Este documento explica cómo conectarse a las dos APIs del proyecto con un usuario de **solo lectura**.

> Entrega las credenciales por un canal privado. **No las guardes en Git, capturas de pantalla ni repositorios.** El acceso es temporal y revocable.

## 1. URLs base

| Servicio | Base URL | Swagger |
|---|---|---|
| X-Road Interoperabilidad | `https://xroad-api.onrender.com/api/v1` | `https://xroad-api.onrender.com/api/docs` |
| GOVStake 360 | `https://govstake-api.onrender.com/api/v1` | `https://govstake-api.onrender.com/api/docs` |

## 2. Credenciales temporales

- Usuario: `companero@dominio.com`
- Rol: `viewer`
- Tipo de acceso: solo lectura
- Contraseña: entregada aparte por el administrador

## 3. Flujo de conexión

El acceso se hace con JWT. Primero se obtiene un token con `login`, y después se envía el header:

```http
Authorization: Bearer ACCESS_TOKEN
```

### 3.1 Login

Reemplaza `BASE_URL` por una de las URLs de la tabla anterior.

```bash
curl -X POST BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "companero@dominio.com",
    "password": "PASSWORD_TEMPORAL"
  }'
```

Respuesta esperada:

```json
{
  "access_token": "TOKEN_JWT",
  "refresh_token": "TOKEN_REFRESH",
  "token_type": "bearer",
  "user": {
    "email": "companero@dominio.com",
    "name": "Companero API temporal (viewer)",
    "role": "viewer"
  }
}
```

### 3.2 Verificar sesión

```bash
curl BASE_URL/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### 3.3 Renovar token

El access token dura 2 horas. Si expira, renovarlo con:

```bash
curl -X POST BASE_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"REFRESH_TOKEN"}'
```

## 4. Endpoints de lectura útiles

### X-Road

```http
GET /api/v1/entities/?skip=0&limit=20
GET /api/v1/services/?skip=0&limit=20
GET /api/v1/sectors/
GET /api/v1/dashboard/kpis
GET /api/v1/maturity/levels
GET /api/v1/maturity/assessments?skip=0&limit=20
GET /api/v1/relationships/graph
```

Ejemplo real:

```bash
curl "https://xroad-api.onrender.com/api/v1/entities/?skip=0&limit=1" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### GOVStake

```http
GET /api/v1/actors?page=1&page_size=20
GET /api/v1/dashboard
GET /api/v1/matriz
GET /api/v1/compromisos
GET /api/v1/alertas
GET /api/v1/relacionamientos
GET /api/v1/protocolo
GET /api/v1/reportes
```

Ejemplo real:

```bash
curl "https://govstake-api.onrender.com/api/v1/actors?page=1&page_size=1" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## 5. Ejemplo en JavaScript

```javascript
const baseUrl = "https://xroad-api.onrender.com/api/v1";

const login = await fetch(`${baseUrl}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "companero@dominio.com",
    password: "PASSWORD_TEMPORAL",
  }),
});

const { access_token } = await login.json();

const response = await fetch(`${baseUrl}/entities/?skip=0&limit=10`, {
  headers: { Authorization: `Bearer ${access_token}` },
});

const data = await response.json();
console.log(data);
```

## 6. Ejemplo en Python

```python
import requests

base_url = "https://govstake-api.onrender.com/api/v1"

login = requests.post(
    f"{base_url}/auth/login",
    json={
        "email": "companero@dominio.com",
        "password": "PASSWORD_TEMPORAL",
    },
    timeout=60,
)
login.raise_for_status()
token = login.json()["access_token"]

actores = requests.get(
    f"{base_url}/actors",
    headers={"Authorization": f"Bearer {token}"},
    params={"page": 1, "page_size": 20},
    timeout=60,
)
print(actores.json())
```

## 7. Qué no puede hacer el usuario `viewer`

No debe ejecutar operaciones de escritura ni administración. El backend debe responder `403 Forbidden` en rutas como:

- `POST /entities/`
- `PUT /entities/{id}`
- `DELETE /entities/{id}`
- `POST /maturity/assessments`
- `POST /maturity/assessments/generate-all`
- `POST /actors`
- `PUT /actors/{id}`
- `DELETE /actors/{id}`

Si una de esas rutas responde `200`, revisa la autorización antes de seguir compartiendo el acceso.

## 8. Revocar acceso

> Recomendado revocar manualmente el **16/11/2026** o en cuanto termine la revisión.
> El sistema no aplica todavía una fecha de expiración automática.

Ejecuta estos comandos **solo si `DATABASE_URL` apunta a la base de producción**; de lo contrario podrías tocar la base local.

```powershell
# X-Road
$env:DATABASE_URL = "DATABASE_URL_PRODUCCION_XROAD"
cd "PAE 2026\BackendInteroperabilidad"
python scripts\delete_readonly_user.py --email companero@dominio.com

# GOVStake
$env:DATABASE_URL = "DATABASE_URL_PRODUCCION_GOVSTAKE"
cd "PAE 2026\BackendGovstacke"
python scripts\delete_readonly_user.py --email companero@dominio.com
```

Para solo desactivarlo sin borrar el registro, agrega `--solo-desactivar`.

## 9. Nota importante de seguridad

El usuario se crea directamente en la base de datos de producción- Los scripts usan bcrypt y nunca almacenan la contraseña en texto plano.
- El token de acceso dura 2 horas y el refresh 7 días.
- El backend aplica rate limiting por minuto.
- La base de datos sigue en Neon y la cadena de conexión debe permanecer fuera del código.
