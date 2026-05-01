# Seguridad y Endurecimiento (Integrado)

## Cambios aplicados

1. **Auth reactivada**
   - `AUTH_ENABLED=True` en `backend/.env`.

2. **JWT Access + Refresh**
   - Nuevo `refresh_token` en `POST /api/v1/auth/login`.
   - Nuevo endpoint `POST /api/v1/auth/refresh`.
   - Claims con `type=access|refresh`.

3. **Frontend con token Bearer consistente**
   - `Dashboard.jsx` y `Reportes.jsx` ahora envían `Authorization: Bearer ...`.
   - `AuthContext.jsx` guarda/limpia `xroad_refresh_token`.
   - `api.js` usa interceptor para refrescar access token al recibir `401`.

4. **Rate limiting básico backend**
   - Middleware global para rutas `/api/*`.
   - Configurable con `RATE_LIMIT_PER_MINUTE` (por defecto 120).

## Variables relevantes en `.env`

```env
AUTH_ENABLED=True
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_MINUTES=10080
RATE_LIMIT_PER_MINUTE=120
```

## Pendientes recomendados (producción)

- Mover secretos a vault/secret manager.
- Rotación de `JWT_SECRET_KEY` y credenciales.
- Añadir persistencia/blacklist de refresh tokens.
- Auditoría estructurada (SIEM) y alertas.
- MFA para cuentas administrativas.