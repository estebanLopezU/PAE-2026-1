from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ....database import get_db
from ....security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
    registrar_auditoria,
)


router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Autenticación con JWT para GOVStake 360 (usuarios en BD + auditoría)."""
    ip = request.client.host if request.client else "unknown"
    email_norm = payload.email.strip().lower()

    try:
        user = authenticate_user(email_norm, payload.password, db=db)
    except HTTPException as exc:
        # Cuenta bloqueada por intentos fallidos
        registrar_auditoria(db, email_norm, "cuenta_bloqueada", str(exc.detail), ip)
        raise

    if not user:
        registrar_auditoria(db, email_norm, "login_fallido", "Credenciales inválidas", ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    registrar_auditoria(db, user["email"], "login_ok", f"Rol: {user['role']}", ip)

    token = create_access_token(subject=user["email"], role=user["role"], name=user["name"])
    refresh_token = create_refresh_token(subject=user["email"], role=user["role"], name=user["name"])

    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
        },
    }


@router.post("/refresh")
def refresh(payload: RefreshRequest):
    data = decode_refresh_token(payload.refresh_token)
    access_token = create_access_token(subject=data["sub"], role=data.get("role", "viewer"), name=data.get("name", data["sub"]))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def me(current_user: Dict = Depends(get_current_user)):
    return {"user": current_user}