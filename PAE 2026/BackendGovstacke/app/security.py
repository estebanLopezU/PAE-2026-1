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


def create_access_token(subject: str, role: str, name: str, expires_minutes: Optional[int] = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode = {
        "sub": subject,
        "role": role,
        "name": name,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str, role: str, name: str, expires_minutes: Optional[int] = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.REFRESH_TOKEN_EXPIRE_MINUTES
    )

    to_encode = {
        "sub": subject,
        "role": role,
        "name": name,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    settings = get_settings()
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def decode_refresh_token(token: str) -> Dict[str, Any]:
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )
    return payload


MAX_INTENTOS = 5
BLOQUEO_MINUTOS = 15


def registrar_auditoria(db, usuario: str, accion: str, detalle: str = None, ip: str = None):
    """Guarda un evento de auditoría; nunca interrumpe el flujo principal."""
    try:
        from .models import Auditoria
        db.add(Auditoria(usuario=usuario[:255], accion=accion[:100], detalle=(detalle or "")[:500], ip=ip))
        db.commit()
    except Exception:
        db.rollback()


def autenticar_db(db, email: str, password: str):
    """Valida credenciales contra la tabla usuarios (hash bcrypt).

    - Bloqueo temporal tras MAX_INTENTOS fallidos.
    - Reset de contador al acertar.
    Retorna dict de usuario o None. Lanza HTTPException 423 si está bloqueada.
    """
    from .models import Usuario
    from datetime import datetime, timedelta, timezone

    user = db.query(Usuario).filter(Usuario.email == email.strip().lower()).first()
    if not user or not user.activo:
        return None

    now = datetime.now(timezone.utc)
    if user.bloqueado_hasta:
        bloqueo = user.bloqueado_hasta
        if bloqueo.tzinfo is None:
            bloqueo = bloqueo.replace(tzinfo=timezone.utc)
        if now < bloqueo:
            restante = int((bloqueo - now).total_seconds() // 60) + 1
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Cuenta bloqueada temporalmente por intentos fallidos. Intente en {restante} min.",
            )
        user.bloqueado_hasta = None
        user.intentos_fallidos = 0

    if not verify_password(password, user.password_hash):
        user.intentos_fallidos += 1
        if user.intentos_fallidos >= MAX_INTENTOS:
            user.bloqueado_hasta = now + timedelta(minutes=BLOQUEO_MINUTOS)
            user.intentos_fallidos = 0
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Demasiados intentos fallidos. Cuenta bloqueada por {BLOQUEO_MINUTOS} minutos.",
            )
        db.commit()
        return None

    user.intentos_fallidos = 0
    user.bloqueado_hasta = None
    user.ultimo_acceso = now
    db.commit()
    return {"email": user.email, "role": user.role, "name": user.nombre or user.email}


def _validate_demo_user(email: str, password: str) -> Optional[Dict[str, str]]:
    """Fallback de emergencia por configuración, solo si la BD no tiene usuarios."""
    settings = get_settings()

    if email == settings.ADMIN_EMAIL and password == settings.ADMIN_PASSWORD:
        return {"email": email, "role": "admin", "name": "Administrador GOVStake"}

    if email == settings.ANALYST_EMAIL and password == settings.ANALYST_PASSWORD:
        return {"email": email, "role": "viewer", "name": "Usuario GOVStake (solo lectura)"}

    return None


def authenticate_user(email: str, password: str, db=None) -> Optional[Dict[str, str]]:
    """Autenticación principal: BD con bcrypt; fallback a env si la BD no tiene usuarios."""
    if db is not None:
        try:
            user = autenticar_db(db, email, password)
            if user is not None:
                return user
            # No coincide en BD: permitir fallback solo si la tabla está vacía (primer arranque)
            from .models import Usuario
            if db.query(Usuario).count() == 0:
                return _validate_demo_user(email, password)
            return None
        except HTTPException:
            raise
        except Exception:
            pass
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