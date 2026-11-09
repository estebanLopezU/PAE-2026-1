#!/usr/bin/env python3
"""Revoca un acceso temporal eliminando un usuario con rol viewer."""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Usuario


def main() -> None:
    parser = argparse.ArgumentParser(description="Eliminar usuario viewer temporal")
    parser.add_argument("--email", required=True, help="Correo del usuario a revocar")
    parser.add_argument(
        "--solo-desactivar",
        action="store_true",
        help="Solo marca activo=false en lugar de borrar el registro",
    )
    args = parser.parse_args()

    email = args.email.strip().lower()
    db = SessionLocal()
    try:
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        if not usuario:
            raise SystemExit(f"No existe el usuario {email}")

        if usuario.role != "viewer":
            raise SystemExit(
                f"Seguridad: {email} tiene rol '{usuario.role}'. Este script no lo toca."
            )

        if args.solo_desactivar:
            usuario.activo = False
            usuario.bloqueado_hasta = None
            db.commit()
            print(f"USUARIO_DESACTIVADO email={usuario.email}")
        else:
            db.delete(usuario)
            db.commit()
            print(f"USUARIO_ELIMINADO email={email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
