from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ....security import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_current_user,
)


router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
def login(payload: LoginRequest):
    """Autenticación simple con JWT para fase inicial segura."""
    user = authenticate_user(payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    token = create_access_token(subject=user["email"], role=user["role"])
    refresh_token = create_refresh_token(subject=user["email"], role=user["role"])

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
    access_token = create_access_token(subject=data["sub"], role=data.get("role", "viewer"))
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def me(current_user: Dict = Depends(get_current_user)):
    return {"user": current_user}
