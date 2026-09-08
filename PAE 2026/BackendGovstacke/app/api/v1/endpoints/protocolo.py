"""Protocolos de participación según el tipo de actor.

Base de conocimiento: define para cada tipo de actor los objetivos del
relacionamiento, canales apropiados, frecuencia sugerida, formato de
participación y condiciones de habilitación.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ....database import get_db
from ....models import Actor
from ....security import get_current_user
from ._helpers import actor_to_dict

router = APIRouter()

PROTOCOLOS = {
    "ciudadania": {
        "nombre": "Ciudadanía",
        "objetivo": "Garantizar participación informada y retroalimentación abierta sobre decisiones públicas.",
        "canales_recomendados": ["encuestas ciudadanas", "cabildos abiertos", "portales de participación digital", "mesas comunitarias"],
        "frecuencia_sugerida": "Permanente, con hitos trimestrales de socialización",
        "formato_participacion": "Consulta pública, audiencias abiertas y votaciones simbólicas",
        "requisitos_habilitacion": "Acreditación de residencia o interés legítimo; registro en plataforma de participación",
        "nivel_incidencia": "Consultiva / propositiva",
        "indicadores_seguimiento": ["tasa de participación", "diversidad demográfica", "satisfacción del proceso"],
    },
    "organizacion": {
        "nombre": "Organizaciones civiles",
        "objetivo": "Articular capacidades técnicas y de movilización de la sociedad civil organizada.",
        "canales_recomendados": ["convenios de colaboración", "mesas técnicas sectoriales", "correos institucionales", "foros especializados"],
        "frecuencia_sugerida": "Mensual (mesas técnicas) y bimestral (seguimiento de convenios)",
        "formato_participacion": "Co-diseño de programas, veeduría solidaria y ejecución conjunta",
        "requisitos_habilitacion": "Registro ante cámaras o entidades de control, representación legal vigente",
        "nivel_incidencia": "Decisional compartida",
        "indicadores_seguimiento": ["convenios activos", "cumplimiento de acuerdos", "cobertura territorial"],
    },
    "veeduria": {
        "nombre": "Veedurías ciudadanas",
        "objetivo": "Fortalecer el control social sobre la gestión pública y la ejecución de recursos.",
        "canales_recomendados": ["oficios formales", "audiencias públicas de rendición de cuentas", "acceso a información (Ley 1712)"],
        "frecuencia_sugerida": "Bimestral y ante cada hito de proyecto vigilado",
        "formato_participacion": "Derecho de petición, comisiones de vigilancia y pronunciamientos públicos",
        "requisitos_habilitacion": "Registro de la veeduría ante la entidad (Ley 850 de 2003)",
        "nivel_incidencia": "Control / vigilancia",
        "indicadores_seguimiento": ["peticiones respondidas en término", "hallazgos atendidos", "nivel de transparencia"],
    },
    "concejo": {
        "nombre": "Concejos y corporaciones públicas",
        "objetivo": "Sostener relación institucional para agenda legislativa, presupuesto y control político.",
        "canales_recomendados": ["proyectos de acuerdo", "debates de control político", "audiencias de presupuesto"],
        "frecuencia_sugerida": "Semanal en periodos de sesiones",
        "formato_participacion": "Presentación de informes, debates de control político y concertación normativa",
        "requisitos_habilitacion": "Marco constitucional y reglamento interno de la corporación",
        "nivel_incidencia": "Normativa / decisional",
        "indicadores_seguimiento": ["iniciativas aprobadas", "tiempo de respuesta a citaciones", "aprobación presupuestal"],
    },
}
PROTOCOLOS.update({
    "servidor_publico": {
        "nombre": "Servidores públicos",
        "objetivo": "Coordinar la operación interna y la implementación de decisiones de la entidad.",
        "canales_recomendados": ["reuniones de despacho", "sistemas de gestión interna", "comités operativos"],
        "frecuencia_sugerida": "Semanal (operación) y mensual (seguimiento de metas)",
        "formato_participacion": "Grupos de trabajo, comités técnicos y planes de mejoramiento",
        "requisitos_habilitacion": "Vinculación laboral vigente y competencias asignadas",
        "nivel_incidencia": "Ejecutiva",
        "indicadores_seguimiento": ["cumplimiento de metas", "oportunidad de reportes", "clima organizacional"],
    },
    "empresa": {
        "nombre": "Empresas y sector privado",
        "objetivo": "Promover alianzas de valor público y responsabilidad social empresarial.",
        "canales_recomendados": ["juntas sectoriales", "procesos de compra pública", "convenios de asociación público-privada"],
        "frecuencia_sugerida": "Trimestral",
        "formato_participacion": "Propuestas técnicas, inversión social y participación en APP/obras",
        "requisitos_habilitacion": "Cumplimiento tributario, habilitación en SECOP y normas de integridad",
        "nivel_incidencia": "Propositiva / ejecutiva",
        "indicadores_seguimiento": ["inversión social ejecutada", "contratación transparente", "generación de empleo local"],
    },
    "medio_comunicacion": {
        "nombre": "Medios de comunicación",
        "objetivo": "Asegurar comunicación pública veraz, oportuna y accesible.",
        "canales_recomendados": ["ruedas de prensa", "boletines oficiales", "kits de datos abiertos"],
        "frecuencia_sugerida": "Permanente con agenda mensual",
        "formato_participacion": "Cobertura informativa, entrevistas y verificación de datos",
        "requisitos_habilitacion": "Registro periodístico o plataforma digital activa",
        "nivel_incidencia": "Agenda-setting / rendición de cuentas",
        "indicadores_seguimiento": ["cobertura de temas clave", "exactitud de información", "alcance de audiencia"],
    },
    "universidad": {
        "nombre": "Universidades y centros de investigación",
        "objetivo": "Incorporar evidencia, innovación y formación al ciclo de la política pública.",
        "canales_recomendados": ["convenios marco", "semilleros de investigación", "consultorías académicas"],
        "frecuencia_sugerida": "Semestral (agendas) y continua (proyectos)",
        "formato_participacion": "Estudios aplicados, monitoreo evaluación y prácticas pedagógicas",
        "requisitos_habilitacion": "Acreditación institucional y registro de grupos de investigación",
        "nivel_incidencia": "Técnica / propositiva",
        "indicadores_seguimiento": ["estudios publicados", "estudiantes vinculados", "transferencia de conocimiento"],
    },
    "entidad_control": {
        "nombre": "Entidades de control",
        "objetivo": "Responder a requisitos de control fiscal, disciplinario y jurídico con plena colaboración.",
        "canales_recomendados": ["reportes oficiales", "visitas de control", "atención de requerimientos"],
        "frecuencia_sugerida": "Según calendario de control y ante requerimientos inmediatos",
        "formato_participacion": "Suministro de información, planes de mejora y atención de hallazgos",
        "requisitos_habilitacion": "Competencia legal de la entidad de control",
        "nivel_incidencia": "Control / correctiva",
        "indicadores_seguimiento": ["requerimientos respondidos", "hallazgos superados", "resultados de auditoría"],
    },
    "cooperacion": {
        "nombre": "Cooperación internacional",
        "objetivo": "Movilizar recursos técnicos y financieros para el desarrollo con estándares internacionales.",
        "canales_recomendados": ["comités de cooperación", "agendas país", "cartas de intención"],
        "frecuencia_sugerida": "Semestral",
        "formato_participacion": "Proyectos de cooperación, asistencia técnica y fondos concursables",
        "requisitos_habilitacion": "Registro en Agencia Presidencial de Cooperación y prioridades país",
        "nivel_incidencia": "Financiera / técnica",
        "indicadores_seguimiento": ["recursos movilizados", "proyectos aprobados", "alineación con ODS"],
    },
})

TIPOS_SIN_PROTOCOLO_MSG = "Tipo de actor sin protocolo definido. Tipos válidos: " + ", ".join(PROTOCOLOS.keys())
@router.get("")
def listar_protocolos(_=Depends(get_current_user)):
    """Devuelve todos los protocolos de participación disponibles."""
    items = [{"tipo": k, **v} for k, v in PROTOCOLOS.items()]
    return {"items": items, "total": len(items)}


@router.get("/actor/{actor_id}")
def protocolo_para_actor(actor_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Protocolo de participación personalizado para un actor específico,
    ajustado por sus variables (riesgo de conflicto, posición y prioridad)."""
    actor = db.query(Actor).filter(Actor.id == actor_id).first()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")
    base = dict(PROTOCOLOS.get(actor.tipo, {}))
    if not base:
        raise HTTPException(status_code=400, detail=TIPOS_SIN_PROTOCOLO_MSG)
    d = actor_to_dict(actor)
    v = d["variables"]
    ajustes = []
    riesgo = v["riesgo_conflicto"] if v else 0
    if riesgo >= 70:
        base["frecuencia_sugerida"] = "Inmediata y semanal mientras persista el riesgo"
        base["prioridad_gestion"] = "CRÍTICA"
        ajustes.append("Riesgo de conflicto alto: anticipar comunicación directa y mediación.")
    elif riesgo >= 40:
        base["prioridad_gestion"] = "MEDIA"
        ajustes.append("Riesgo moderado: seguimiento cercano y canales de desescalamiento.")
    else:
        base["prioridad_gestion"] = "NORMAL"
    posicion = v["posicion"] if v else 50
    if posicion <= 30:
        ajustes.append("Actor con posición contraria: priorizar espacios de diálogo y construcción de confianza.")
    elif posicion >= 70:
        ajustes.append("Actor aliado: explorar co-ejecución y posicionamiento conjunto.")
    if d["nivel_prioridad"] == "alta":
        ajustes.append("Actor de prioridad ALTA: asignar responsable de relacionamiento dedicado.")
    base["ajustes_dinamicos"] = ajustes
    base["actor"] = {"id": d["id"], "nombre": d["nombre"], "tipo": d["tipo"],
                     "nivel_prioridad": d["nivel_prioridad"],
                     "indice_priorizacion": d["indice_priorizacion"]}
    return base

