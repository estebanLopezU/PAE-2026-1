---
name: security-auth-jwt
description: Autenticación y autorización JWT, hashing bcrypt, control de roles admin/viewer, bloqueo por fuerza bruta, rate limiting y auditoría de accesos en los backends del proyecto. Alineado a app/security.py.
---

# Skill: Security / Auth JWT (Backends del proyecto)

Usa esta skill al trabajar con login, tokens, permisos, protección de endpoints,
bloqueo y auditoría en `BackendGovstacke` y `BackendInteroperabilidad`.

## Arquitectura de seguridad (archivo `app/security.py`)

### Hashing de contraseñas (bcrypt)

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password): ...
def get_password_hash(password): ...
```

- **Nunca** guardes contraseñas en texto plano. Usa `get_password_hash`.
- compara con `verify_password`, nunca con `==`.

### Tokens JWT

```python
create_access_token(subject, role, name, expires_minutes=None)
create_refresh_token(subject, role, name, expires_minutes=None)
decode_token(token)
decode_refresh_token(token)   # exige payload["type"] == "refresh"
```

- Access token: `ACCESS_TOKEN_EXPIRE_MINUTES` (2 h por defecto).
- Refresh token: `REFRESH_TOKEN_EXPIRE_MINUTES` (7 días por defecto).
- Algoritmo `JWT_ALGORITHM` (HS256) y `JWT_SECRET_KEY` desde `.env`.
- Los tokens llevan `sub`, `role`, `name`, `type` (`access`/`refresh`), `exp`,
  `iat`. No incrustar datos sensibles del actor.

### Protección de endpoints

- `get_current_user` como dependencia `Depends(...)`:
  ```python
  def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
      ...
  ```
  Lanza `401` si falta token o es inválido; devuelve `{"email","role","name"}`.
- `require_admin` como dependencia: lanza `403` si `role != "admin"`.

**Regla**: todo endpoint que toque datos debe incluir una de estas dependencias.
Solo rutas públicas explícitas (login, health) quedan abiertas.

### Bloqueo por fuerza bruta

En `autenticar_db` (ver `security.py`):
- `MAX_INTENTOS = 5` intentos fallidos.
- `BLOQUEO_MINUTOS = 15` minutos de bloqueo (`bloqueado_hasta`).
- Devuelve `423 LOCKED` tras superar el límite y resetea el contador al acertar.

### Auditoría

```python
registrar_auditoria(db, usuario, accion, detalle=None, ip=None)
```

- Guarda en el modelo `Auditoria`.
- **Nunca** interrumpe el flujo (try/except con rollback).
- Úsala en eventos relevantes: login, creación/borrado de actores, cambios de rol.

### Fallback de emergencia

`authenticate_user` usa BD por defecto y solo permite credenciales de `.env`
(`ADMIN_*`/`ANALYST_*`) cuando la tabla de usuarios está vacía (primer arranque).
No amplíes este fallback por defecto.

## Configuración relevante (`app/config.py`)

| Variable | Función |
|----------|---------|
| `AUTH_ENABLED` | Si `False`, `get_current_user` devuelve un usuario de desarrollo |
| `JWT_SECRET_KEY` | Secreto (obligatorio, desde `.env`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 120 |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | 10080 |
| `RATE_LIMIT_PER_MINUTE` | 120 (se aplica en middleware de `main.py`) |

## Convenciones

1. **No** implementar un segundo esquema de tokens; reutiliza `create_access_token`
   / `create_refresh_token`.
2. Mantén ambos backends consistentes entre sí (misma lógica de
   `get_current_user` / `require_admin`).
3. Pasword/secret: en `.env` y nunca en código ni commits.
4. Mensajes de error en español y sin revelar si el usuario existe o no
   (evita enumeración de usuarios: respuesta genérica en login).
5. El refresh debe validar que sea tipo `refresh` antes de emitir un nuevo access.

## Frontend (recordatorio)

El interceptor de `src/services/api.js` añade el `Bearer` y refresca el access con
el refresh token en `401`. No lo desactives al probar auth.

## Checklist

- [ ] Contraseñas con `get_password_hash` / `verify_password`.
- [ ] Endpoints protegidos con `Depends(get_current_user)` o `require_admin`.
- [ ] Secrets vía `.env`, no en código.
- [ ] Logs de auditoría en eventos relevantes (sin interrumpir flujo).
- [ ] Validado el tipo de token en `decode_refresh_token`.