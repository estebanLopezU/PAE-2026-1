from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, role: str, expires_minutes: Optional[int] = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode = {
        "sub": subject,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def _validate_demo_user(email: str, password: str) -> Optional[Dict[str, str]]:
    """Validación de usuarios básicos por configuración.

    Nota: diseñado como mejora incremental sin romper el proyecto actual.
    Puede reemplazarse más adelante por usuarios persistidos en base de datos.
    """
    settings = get_settings()

    if email == settings.ADMIN_EMAIL and password == settings.ADMIN_PASSWORD:
        return {"email": email, "role": "admin", "name": "Administrador X-Road"}

    if email == settings.ANALYST_EMAIL and password == settings.ANALYST_PASSWORD:
        return {"email": email, "role": "analyst", "name": "Analista X-Road"}

    return None


def authenticate_user(email: str, password: str) -> Optional[Dict[str, str]]:
    return _validate_demo_user(email, password)


def _auth_disabled_fallback() -> Dict[str, str]:
    return {
        "email": "dev@localhost",
        "role": "admin",
        "name": "Development User",
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, Any]:
    settings = get_settings()

    if not settings.AUTH_ENABLED:
        return _auth_disabled_fallback()

    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
        )

    token = credentials.credentials

    try:
        payload = decode_token(token)
        email: Optional[str] = payload.get("sub")
        role: str = payload.get("role", "viewer")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
            )

        return {
            "email": email,
            "role": role,
            "name": payload.get("name", email),
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token",
        )


def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador",
        )
    return current_user
