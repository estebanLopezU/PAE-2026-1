#!/usr/bin/env python3
"""Crea un usuario temporal de solo lectura (rol viewer) para la API.

La contraseña se genera de forma aleatoria y se muestra una sola vez.
No se guarda en el repositorio ni en la base de datos en texto plano.

Ejemplo:
    python scripts/create_readonly_user.py --email companero@dominio.com

Para reconectar o regenerar credenciales de un usuario viewer existente:
    python scripts/create_readonly_user.py --email companero@dominio.com --reset
"""

import argparse
import os
import secrets
import string
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Usuario
from app.security import get_password_hash


ROLE_VIEWER = "viewer"


def generar_password(longitud: int = 32) -> str:
    """Genera una contraseña fuerte y fácil de copiar/pegar."""
    alfabeto = string.ascii_letters + string.digits
    while True:
        password = "".join(secrets.choice(alfabeto) for _ in range(longitud))
        if (
            any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
        ):
            return password


def normalizar_email(email: str) -> str:
    return email.strip().lower()


def crear_usuario(email: str, nombre: str, reset: bool) -> str:
    db = SessionLocal()
    try:
        email_norm = normalizar_email(email)
        usuario = db.query(Usuario).filter(Usuario.email == email_norm).first()

        if usuario and not reset:
            raise SystemExit(
                f"El usuario {email_norm} ya existe. Usa --reset solo si es un usuario viewer."
            )

        password = generar_password()

        if usuario:
            if usuario.role != ROLE_VIEWER:
                raise SystemExit(
                    f"Seguridad: {email_norm} tiene rol '{usuario.role}'. "
                    "Este script solo puede resetear usuarios viewer."
                )
            usuario.nombre = nombre or usuario.nombre
            usuario.password_hash = get_password_hash(password)
            usuario.role = ROLE_VIEWER
            usuario.activo = True
            usuario.intentos_fallidos = 0
            usuario.bloqueado_hasta = None
            accion = "actualizado"
        else:
            usuario = Usuario(
                email=email_norm,
                nombre=nombre or "Acceso API temporal (solo lectura)",
                password_hash=get_password_hash(password),
                role=ROLE_VIEWER,
                activo=True,
                intentos_fallidos=0,
            )
            db.add(usuario)
            accion = "creado"

        db.commit()
        print(f"USUARIO_{accion.upper()}")
        print(f"email={usuario.email}")
        print(f"role={usuario.role}")
        print(f"activo={usuario.activo}")
        print(f"password={password}")
        print("AVISO=Guardala ahora; no se puede recuperar despues.")
        return password
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Crear usuario API de solo lectura temporal")
    parser.add_argument("--email", required=True, help="Correo del compañero")
    parser.add_argument("--nombre", default="", help="Nombre visible del usuario")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Regenera credenciales solo si el usuario existente es viewer",
    )
    args = parser.parse_args()

    crear_usuario(args.email, args.nombre, args.reset)


if __name__ == "__main__":
    main()
