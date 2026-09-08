"""Datos simulados de actores para el prototipo GOVStake 360.

Solo se cargan si la tabla de actores está vacía. Útil para validar el
modelo con un caso piloto sin depender de datos institucionales reales.
"""
from sqlalchemy.orm import Session

from ..models import Actor, ActorVariables


ACTORES_DE_EJEMPLO = [
    {
        "nombre": "Alcaldía de [Municipio]",
        "tipo": "gobierno_local",
        "descripcion": "Entidad territorial responsable de la administración municipal.",
        "institucion": "Alcaldía Municipal",
        "es_interno": True,
        "variables": {"poder": 85, "legitimidad": 75, "influencia": 80, "interes": 90,
                      "dependencia": 60, "capacidad_movilizacion": 70, "posicion": 85,
                      "historial_participacion": 80, "riesgo_conflicto": 20, "canales_relacionamiento": 85},
    },
    {
        "nombre": "Concejo Municipal",
        "tipo": "concejo_municipal",
        "descripcion": "Corporación de elección popular que ejerce control político.",
        "institucion": "Concejo Municipal",
        "es_interno": False,
        "variables": {"poder": 80, "legitimidad": 85, "influencia": 75, "interes": 80,
                      "dependencia": 40, "capacidad_movilizacion": 75, "posicion": 70,
                      "historial_participacion": 75, "riesgo_conflicto": 45, "canales_relacionamiento": 80},
    },
    {
        "nombre": "Veeduría Ciudadana",
        "tipo": "veeduria",
        "descripcion": "Organización de la sociedad civil que ejerce control social.",
        "institucion": "Organización social",
        "es_interno": False,
        "variables": {"poder": 55, "legitimidad": 70, "influencia": 60, "interes": 90,
                      "dependencia": 30, "capacidad_movilizacion": 80, "posicion": 40,
                      "historial_participacion": 85, "riesgo_conflicto": 75, "canales_relacionamiento": 65},
    },
    {
        "nombre": "Comunidad Local / Ciudadanía",
        "tipo": "ciudadania",
        "descripcion": "Población del territorio, principal beneficiaria de la gestión pública.",
        "institucion": None,
        "es_interno": False,
        "variables": {"poder": 45, "legitimidad": 80, "influencia": 50, "interes": 95,
                      "dependencia": 70, "capacidad_movilizacion": 75, "posicion": 60,
                      "historial_participacion": 50, "riesgo_conflicto": 60, "canales_relacionamiento": 55},
    },
    {
        "nombre": "Empresa de Servicios Públicos Regional",
        "tipo": "empresa",
        "descripcion": "Empresa prestadora de servicios públicos con incidencia territorial.",
        "institucion": "Empresa de Servicios Públicos",
        "es_interno": False,
        "variables": {"poder": 70, "legitimidad": 55, "influencia": 75, "interes": 65,
                      "dependencia": 50, "capacidad_movilizacion": 50, "posicion": 75,
                      "historial_participacion": 45, "riesgo_conflicto": 35, "canales_relacionamiento": 70},
    },
    {
        "nombre": "Universidad Pública Local",
        "tipo": "universidad",
        "descripcion": "Institución de educación superior con capacidad de investigación y análisis.",
        "institucion": "Universidad Pública",
        "es_interno": False,
        "variables": {"poder": 50, "legitimidad": 80, "influencia": 60, "interes": 75,
                      "dependencia": 35, "capacidad_movilizacion": 45, "posicion": 80,
                      "historial_participacion": 70, "riesgo_conflicto": 15, "canales_relacionamiento": 75},
    },
    {
        "nombre": "Medios de Comunicación Regionales",
        "tipo": "medios",
        "descripcion": "Prensa y medios con capacidad de difusión e influencia en la opinión.",
        "institucion": "Medios de Comunicación",
        "es_interno": False,
        "variables": {"poder": 60, "legitimidad": 45, "influencia": 85, "interes": 60,
                      "dependencia": 25, "capacidad_movilizacion": 60, "posicion": 55,
                      "historial_participacion": 40, "riesgo_conflicto": 50, "canales_relacionamiento": 50},
    },
    {
        "nombre": "Entidad de Control (Contraloría/Procuraduría)",
        "tipo": "entidad_control",
        "descripcion": "Órgano de control fiscal y disciplinario.",
        "institucion": "Entidad de Control",
        "es_interno": False,
        "variables": {"poder": 90, "legitimidad": 90, "influencia": 85, "interes": 80,
                      "dependencia": 20, "capacidad_movilizacion": 55, "posicion": 70,
                      "historial_participacion": 65, "riesgo_conflicto": 30, "canales_relacionamiento": 70},
    },
    {
        "nombre": "Asociación de Usuarios / JAC",
        "tipo": "organizaciones",
        "descripcion": "Organizaciones comunitarias de base territorial.",
        "institucion": "Organización comunitaria",
        "es_interno": False,
        "variables": {"poder": 40, "legitimidad": 65, "influencia": 50, "interes": 85,
                      "dependencia": 65, "capacidad_movilizacion": 70, "posicion": 60,
                      "historial_participacion": 75, "riesgo_conflicto": 55, "canales_relacionamiento": 50},
    },
    {
        "nombre": "Gobernación Departamental",
        "tipo": "gobierno_departamental",
        "descripcion": "Administración departamental con articulación territorial.",
        "institucion": "Gobernación",
        "es_interno": False,
        "variables": {"poder": 85, "legitimidad": 70, "influencia": 80, "interes": 70,
                      "dependencia": 40, "capacidad_movilizacion": 70, "posicion": 80,
                      "historial_participacion": 60, "riesgo_conflicto": 25, "canales_relacionamiento": 70},
    },
]

USUARIOS_INICIALES = [
    {
        "email": "elopezu@unal.edu.co",
        "nombre": "Esteban López (Administrador)",
        "password": "BZTfne48",
        "role": "admin",
    },
    {
        "email": "gestor@govstake.gov.co",
        "nombre": "Gestor GOVStake (solo lectura)",
        "password": "Govstake360*",
        "role": "viewer",
    },
]


def seed_usuarios(db: Session) -> int:
    """Crea usuarios iniciales con contraseña hasheada (bcrypt) si no existen."""
    from ..models import Usuario
    from ..security import get_password_hash

    creados = 0
    for datos in USUARIOS_INICIALES:
        email = datos["email"].strip().lower()
        if db.query(Usuario).filter(Usuario.email == email).first():
            continue
        db.add(Usuario(
            email=email,
            nombre=datos["nombre"],
            password_hash=get_password_hash(datos["password"]),
            role=datos["role"],
            activo=True,
        ))
        creados += 1
    if creados:
        db.commit()
    return creados


def seed_if_empty(db: Session) -> int:
    """Inserta actores de ejemplo si la tabla está vacía. Retorna cantidad creada."""
    if db.query(Actor).count() > 0:
        return 0

    creados = 0
    for datos in ACTORES_DE_EJEMPLO:
        # Copia para no mutar la lista global
        variables = dict(datos.get("variables", {}))
        actor = Actor(**{k: v for k, v in datos.items() if k != "variables"})
        db.add(actor)
        actor.variables = ActorVariables(actor_id=actor.id, **variables)
        creados += 1
    db.commit()
    return creados