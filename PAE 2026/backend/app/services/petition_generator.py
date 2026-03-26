"""
Módulo de Generador de Derecho de Petición
Permite generar derechos de petición formales basados en análisis de interoperabilidad
"""

import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import json
import uuid


class PetitionType(Enum):
    """Tipos de derecho de petición"""
    INTEROPERABILITY_REQUEST = "interoperability_request"
    DATA_ACCESS = "data_access"
    SERVICE_INTEGRATION = "service_integration"
    TECHNICAL_REQUIREMENTS = "technical_requirements"
    COMPLIANCE_VERIFICATION = "compliance_verification"


class PetitionStatus(Enum):
    """Estados de un derecho de petición"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


@dataclass
class PetitionTemplate:
    """Plantilla de derecho de petición"""
    id: str
    name: str
    petition_type: PetitionType
    subject_template: str
    body_template: str
    legal_basis: List[str]
    required_fields: List[str]
    optional_fields: List[str]


@dataclass
class GeneratedPetition:
    """Derecho de petición generado"""
    id: str
    petition_type: PetitionType
    status: PetitionStatus
    subject: str
    body: str
    requesting_entity: str
    target_entity: str
    legal_basis: List[str]
    requested_actions: List[str]
    deadline_days: int
    created_at: datetime
    submitted_at: Optional[datetime]
    response_deadline: Optional[datetime]
    metadata: Dict


class PetitionGenerator:
    """Generador de derechos de petición"""
    
    # Plantillas predefinidas
    TEMPLATES = {
        PetitionType.INTEROPERABILITY_REQUEST: PetitionTemplate(
            id="interop_request",
            name="Solicitud de Interoperabilidad",
            petition_type=PetitionType.INTEROPERABILITY_REQUEST,
            subject_template="Solicitud de Interoperabilidad entre {requesting_entity} y {target_entity}",
            body_template="""
            Ciudadano/a {recipient_name},
            
            Yo, {requester_name}, en mi calidad de {requester_position} de {requesting_entity}, 
            me dirijo a usted con el fin de solicitar la implementación de servicios de 
            interoperabilidad entre nuestra entidad y {target_entity}, de conformidad 
            con lo establecido en la Ley 1712 de 2014, Ley 1150 de 2007 y demás normas 
            reglamentarias.
            
            FUNDAMENTO JURÍDICO:
            {legal_basis}
            
            OBJETO DE LA PETICIÓN:
            {petition_objective}
            
            SERVICIOS SOLICITADOS:
            {requested_services}
            
            JUSTIFICACIÓN TÉCNICA:
            {technical_justification}
            
            BENEFICIOS ESPERADOS:
            {expected_benefits}
            
            PLAZO DE RESPUESTA:
            De conformidad con el artículo 14 de la Ley 1751 de 2015, solicito 
            respuesta a la presente petición dentro de los {deadline_days} días 
            hábiles siguientes a la fecha de recepción.
            
            Atentamente,
            
            {requester_name}
            {requester_position}
            {requesting_entity}
            {contact_email}
            {contact_phone}
            
            Fecha: {current_date}
            """,
            legal_basis=[
                "Ley 1712 de 2014 - Ley de Transparencia y del Derecho de Acceso a la Información Pública",
                "Ley 1150 de 2007 - Por medio de la cual se introducen medidas para la eficiencia y la transparencia en la Ley 80 de 1993",
                "Ley 1751 de 2015 - Ley de Regulación del Derecho de Petición",
                "Decreto 1008 de 2018 - Por el cual se dictan disposiciones para la gestión de la interoperabilidad",
                "CONPES 3920 de 2018 - Política Nacional de Transformación Digital"
            ],
            required_fields=[
                "recipient_name",
                "requester_name", 
                "requester_position",
                "requesting_entity",
                "target_entity",
                "petition_objective",
                "requested_services",
                "technical_justification"
            ],
            optional_fields=[
                "expected_benefits",
                "contact_email",
                "contact_phone"
            ]
        ),
        
        PetitionType.DATA_ACCESS: PetitionTemplate(
            id="data_access",
            name="Solicitud de Acceso a Datos",
            petition_type=PetitionType.DATA_ACCESS,
            subject_template="Solicitud de Acceso a Datos de {target_entity}",
            body_template="""
            Ciudadano/a {recipient_name},
            
            En ejercicio del derecho fundamental de acceso a la información pública 
            consagrado en el artículo 74 de la Constitución Política de Colombia y 
            la Ley 1712 de 2014, me permito solicitar a {target_entity}:
            
            DATOS SOLICITADOS:
            {requested_data}
            
            FORMATO DE ENTREGA:
            {delivery_format}
            
            FINALIDAD:
            {purpose}
            
            Fundamento legal: {legal_basis}
            
            Plazo de respuesta: {deadline_days} días hábiles
            
            Atentamente,
            {requester_name}
            """,
            legal_basis=[
                "Artículo 74 Constitución Política de Colombia",
                "Ley 1712 de 2014",
                "Ley 1751 de 2015"
            ],
            required_fields=[
                "recipient_name",
                "requester_name",
                "target_entity",
                "requested_data",
                "purpose"
            ],
            optional_fields=[
                "delivery_format",
                "contact_email"
            ]
        )
    }
    
    def __init__(self):
        self.petitions_db = {}  # Simulación de base de datos
    
    async def generate_petition(
        self,
        petition_type: PetitionType,
        context_data: Dict,
        requesting_entity: str,
        target_entity: str,
        deadline_days: int = 15
    ) -> GeneratedPetition:
        """
        Generar un derecho de petición
        
        Args:
            petition_type: Tipo de petición
            context_data: Datos de contexto para la plantilla
            requesting_entity: Entidad solicitante
            target_entity: Entidad objetivo
            deadline_days: Días hábiles para respuesta
        
        Returns:
            Derecho de petición generado
        """
        # Obtener plantilla
        template = self.TEMPLATES.get(petition_type)
        if not template:
            raise ValueError(f"Tipo de petición no soportado: {petition_type}")
        
        # Verificar campos requeridos
        for field in template.required_fields:
            if field not in context_data:
                raise ValueError(f"Campo requerido faltante: {field}")
        
        # Preparar datos para la plantilla
        template_data = {
            "requesting_entity": requesting_entity,
            "target_entity": target_entity,
            "current_date": datetime.now().strftime("%d de %B de %Y"),
            "deadline_days": deadline_days,
            **context_data
        }
        
        # Generar asunto y cuerpo
        subject = template.subject_template.format(**template_data)
        body = template.body_template.format(**template_data)
        
        # Crear petición
        petition = GeneratedPetition(
            id=str(uuid.uuid4()),
            petition_type=petition_type,
            status=PetitionStatus.DRAFT,
            subject=subject,
            body=body,
            requesting_entity=requesting_entity,
            target_entity=target_entity,
            legal_basis=template.legal_basis,
            requested_actions=context_data.get("requested_services", []),
            deadline_days=deadline_days,
            created_at=datetime.now(),
            submitted_at=None,
            response_deadline=None,
            metadata=context_data
        )
        
        # Guardar en "base de datos"
        self.petitions_db[petition.id] = petition
        
        return petition
    
    async def get_petition(self, petition_id: str) -> Optional[GeneratedPetition]:
        """Obtener una petición por ID"""
        return self.petitions_db.get(petition_id)
    
    async def list_petitions(
        self,
        requesting_entity: Optional[str] = None,
        target_entity: Optional[str] = None,
        status: Optional[PetitionStatus] = None
    ) -> List[GeneratedPetition]:
        """
        Listar peticiones con filtros
        
        Args:
            requesting_entity: Filtrar por entidad solicitante
            target_entity: Filtrar por entidad objetivo
            status: Filtrar por estado
        
        Returns:
            Lista de peticiones
        """
        petitions = list(self.petitions_db.values())
        
        if requesting_entity:
            petitions = [p for p in petitions if p.requesting_entity == requesting_entity]
        
        if target_entity:
            petitions = [p for p in petitions if p.target_entity == target_entity]
        
        if status:
            petitions = [p for p in petitions if p.status == status]
        
        return sorted(petitions, key=lambda p: p.created_at, reverse=True)
    
    async def update_petition_status(
        self,
        petition_id: str,
        new_status: PetitionStatus
    ) -> Optional[GeneratedPetition]:
        """
        Actualizar estado de una petición
        
        Args:
            petition_id: ID de la petición
            new_status: Nuevo estado
        
        Returns:
            Petición actualizada o None si no existe
        """
        petition = self.petitions_db.get(petition_id)
        if not petition:
            return None
        
        petition.status = new_status
        
        if new_status == PetitionStatus.SUBMITTED:
            petition.submitted_at = datetime.now()
            from datetime import timedelta
            petition.response_deadline = datetime.now() + timedelta(days=petition.deadline_days)
        
        return petition
    
    async def generate_from_gap_analysis(
        self,
        gap_analysis: Dict,
        requesting_entity: str,
        target_entity: str
    ) -> GeneratedPetition:
        """
        Generar petición basada en análisis de brechas
        
        Args:
            gap_analysis: Resultado del análisis de brechas
            requesting_entity: Entidad solicitante
            target_entity: Entidad objetivo
        
        Returns:
            Derecho de petición generado
        """
        # Extraer información del análisis de brechas
        missing_services = gap_analysis.get("missing_services", [])
        technical_gaps = gap_analysis.get("technical_gaps", [])
        
        # Preparar servicios solicitados
        requested_services = []
        for service in missing_services[:5]:  # Limitar a 5 servicios
            requested_services.append(
                f"- {service.get('name', 'Servicio')}: {service.get('description', 'Sin descripción')}"
            )
        
        # Preparar justificación técnica
        technical_justification = "Se han identificado las siguientes brechas técnicas:\n"
        for gap in technical_gaps[:3]:
            technical_justification += f"- {gap.get('description', 'Brecha técnica')}\n"
        
        # Preparar datos de contexto
        context_data = {
            "recipient_name": "Director(a) de Tecnología",
            "requester_name": "Director de Transformación Digital",
            "requester_position": "Director de Transformación Digital",
            "petition_objective": f"Implementar servicios de interoperabilidad para mejorar la eficiencia en los procesos entre {requesting_entity} y {target_entity}",
            "requested_services": "\n".join(requested_services) if requested_services else "Servicios de interoperabilidad básicos",
            "technical_justification": technical_justification,
            "expected_benefits": "- Reducción de tiempos de trámites\n- Mejora en la calidad del servicio\n- Eliminación de duplicidad de información\n- Cumplimiento de normativas de gobierno digital"
        }
        
        return await self.generate_petition(
            petition_type=PetitionType.INTEROPERABILITY_REQUEST,
            context_data=context_data,
            requesting_entity=requesting_entity,
            target_entity=target_entity
        )
    
    async def get_petition_statistics(self) -> Dict:
        """Obtener estadísticas de peticiones"""
        petitions = list(self.petitions_db.values())
        
        stats = {
            "total_petitions": len(petitions),
            "by_status": {},
            "by_type": {},
            "by_entity": {},
            "average_deadline_days": 0
        }
        
        for status in PetitionStatus:
            stats["by_status"][status.value] = len([p for p in petitions if p.status == status])
        
        for ptype in PetitionType:
            stats["by_type"][ptype.value] = len([p for p in petitions if p.petition_type == ptype])
        
        # Contar por entidad objetivo
        entity_count = {}
        for petition in petitions:
            entity = petition.target_entity
            entity_count[entity] = entity_count.get(entity, 0) + 1
        stats["by_entity"] = entity_count
        
        # Promedio de días de plazo
        if petitions:
            stats["average_deadline_days"] = sum(p.deadline_days for p in petitions) / len(petitions)
        
        return stats
    
    async def export_petition(self, petition_id: str, format: str = "json") -> Optional[Dict]:
        """
        Exportar una petición en el formato especificado
        
        Args:
            petition_id: ID de la petición
            format: Formato de exportación (json, text)
        
        Returns:
            Datos exportados o None si no existe
        """
        petition = self.petitions_db.get(petition_id)
        if not petition:
            return None
        
        if format == "json":
            return {
                "id": petition.id,
                "type": petition.petition_type.value,
                "status": petition.status.value,
                "subject": petition.subject,
                "body": petition.body,
                "requesting_entity": petition.requesting_entity,
                "target_entity": petition.target_entity,
                "legal_basis": petition.legal_basis,
                "requested_actions": petition.requested_actions,
                "deadline_days": petition.deadline_days,
                "created_at": petition.created_at.isoformat(),
                "submitted_at": petition.submitted_at.isoformat() if petition.submitted_at else None,
                "response_deadline": petition.response_deadline.isoformat() if petition.response_deadline else None
            }
        elif format == "text":
            return {
                "text": f"""
{petition.subject}

{petition.body}

FUNDAMENTO LEGAL:
{chr(10).join(f'- {basis}' for basis in petition.legal_basis)}

ACCIONES SOLICITADAS:
{chr(10).join(f'- {action}' for action in petition.requested_actions)}

Fecha de creación: {petition.created_at.strftime('%d/%m/%Y %H:%M')}
Estado: {petition.status.value}
Plazo: {petition.deadline_days} días hábiles
                """
            }
        
        return None


# Instancia global del generador
petition_generator = PetitionGenerator()


async def generate_petition(
    petition_type: str,
    context_data: Dict,
    requesting_entity: str,
    target_entity: str,
    deadline_days: int = 15
) -> Dict:
    """
    Función helper para generar un derecho de petición
    
    Args:
        petition_type: Tipo de petición (string)
        context_data: Datos de contexto
        requesting_entity: Entidad solicitante
        target_entity: Entidad objetivo
        deadline_days: Días hábiles para respuesta
    
    Returns:
        Petición generada en formato dict
    """
    # Convertir string a enum
    ptype = PetitionType(petition_type)
    
    petition = await petition_generator.generate_petition(
        petition_type=ptype,
        context_data=context_data,
        requesting_entity=requesting_entity,
        target_entity=target_entity,
        deadline_days=deadline_days
    )
    
    return {
        "id": petition.id,
        "type": petition.petition_type.value,
        "status": petition.status.value,
        "subject": petition.subject,
        "body": petition.body,
        "requesting_entity": petition.requesting_entity,
        "target_entity": petition.target_entity,
        "legal_basis": petition.legal_basis,
        "requested_actions": petition.requested_actions,
        "deadline_days": petition.deadline_days,
        "created_at": petition.created_at.isoformat()
    }


async def get_petition_templates() -> List[Dict]:
    """
    Obtener plantillas de peticiones disponibles
    
    Returns:
        Lista de plantillas
    """
    templates = []
    for ptype, template in PetitionGenerator.TEMPLATES.items():
        templates.append({
            "id": template.id,
            "name": template.name,
            "type": template.petition_type.value,
            "required_fields": template.required_fields,
            "optional_fields": template.optional_fields,
            "legal_basis_count": len(template.legal_basis)
        })
    return templates


async def generate_petition_from_gap_analysis(
    gap_analysis: Dict,
    requesting_entity: str,
    target_entity: str
) -> Dict:
    """
    Generar petición basada en análisis de brechas
    
    Args:
        gap_analysis: Resultado del análisis de brechas
        requesting_entity: Entidad solicitante
        target_entity: Entidad objetivo
    
    Returns:
        Petición generada en formato dict
    """
    petition = await petition_generator.generate_from_gap_analysis(
        gap_analysis=gap_analysis,
        requesting_entity=requesting_entity,
        target_entity=target_entity
    )
    
    return {
        "id": petition.id,
        "type": petition.petition_type.value,
        "status": petition.status.value,
        "subject": petition.subject,
        "body": petition.body,
        "requesting_entity": petition.requesting_entity,
        "target_entity": petition.target_entity,
        "legal_basis": petition.legal_basis,
        "requested_actions": petition.requested_actions,
        "deadline_days": petition.deadline_days,
        "created_at": petition.created_at.isoformat()
    }


async def list_petitions(
    requesting_entity: Optional[str] = None,
    target_entity: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict]:
    """
    Listar peticiones con filtros
    
    Args:
        requesting_entity: Filtrar por entidad solicitante
        target_entity: Filtrar por entidad objetivo
        status: Filtrar por estado
    
    Returns:
        Lista de peticiones en formato dict
    """
    # Convertir status string a enum si se proporciona
    status_enum = PetitionStatus(status) if status else None
    
    petitions = await petition_generator.list_petitions(
        requesting_entity=requesting_entity,
        target_entity=target_entity,
        status=status_enum
    )
    
    return [
        {
            "id": p.id,
            "type": p.petition_type.value,
            "status": p.status.value,
            "subject": p.subject,
            "requesting_entity": p.requesting_entity,
            "target_entity": p.target_entity,
            "deadline_days": p.deadline_days,
            "created_at": p.created_at.isoformat(),
            "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None
        }
        for p in petitions
    ]


async def get_petition_statistics() -> Dict:
    """
    Obtener estadísticas de peticiones
    
    Returns:
        Estadísticas en formato dict
    """
    return await petition_generator.get_petition_statistics()   # Promedio de días de plazo
        if petitions:
            stats["average_deadline_days"] = sum(p.deadline_days for p in petitions) / len(petitions)
        
        return stats
    
    async def export_petition(self, petition_id: str, format: str = "json") -> Optional[Dict]:
        """
        Exportar una petición en el formato especificado
        
        Args:
            petition_id: ID de la petición
            format: Formato de exportación (json, text)
        
        Returns:
            Datos exportados o None si no existe
        """
        petition = self.petitions_db.get(petition_id)
        if not petition:
            return None
        
        if format == "json":
            return {
                "id": petition.id,
                "type": petition.petition_type.value,
                "status": petition.status.value,
                "subject": petition.subject,
                "body": petition.body,
                "requesting_entity": petition.requesting_entity,
                "target_entity": petition.target_entity,
                "legal_basis": petition.legal_basis,
                "requested_actions": petition.requested_actions,
                "deadline_days": petition.deadline_days,
                "created_at": petition.created_at.isoformat(),
                "submitted_at": petition.submitted_at.isoformat() if petition.submitted_at else None,
                "response_deadline": petition.response_deadline.isoformat() if petition.response_deadline else None
            }
        elif format == "text":
            return {
                "text": f"""
{petition.subject}

{petition.body}

FUNDAMENTO LEGAL:
{chr(10).join(f'- {basis}' for basis in petition.legal_basis)}

ACCIONES SOLICITADAS:
{chr(10).join(f'- {action}' for action in petition.requested_actions)}

Fecha de creación: {petition.created_at.strftime('%d/%m/%Y %H:%M')}
Estado: {petition.status.value}
Plazo: {petition.deadline_days} días hábiles
                """
            }
        
        return None


# Instancia global del generador
petition_generator = PetitionGenerator()


async def generate_petition(
    petition_type: str,
    context_data: Dict,
    requesting_entity: str,
    target_entity: str,
    deadline_days: int = 15
) -> Dict:
    """
    Función helper para generar un derecho de petición
    
    Args:
        petition_type: Tipo de petición (string)
        context_data: Datos de contexto
        requesting_entity: Entidad solicitante
        target_entity: Entidad objetivo
        deadline_days: Días hábiles para respuesta
    
    Returns:
        Petición generada en formato dict
    """
    # Convertir string a enum
    ptype = PetitionType(petition_type)
    
    petition = await petition_generator.generate_petition(
        petition_type=ptype,
        context_data=context_data,
        requesting_entity=requesting_entity,
        target_entity=target_entity,
        deadline_days=deadline_days
    )
    
    return {
        "id": petition.id,
        "type": petition.petition_type.value,
        "status": petition.status.value,
        "subject": petition.subject,
        "body": petition.body,
        "requesting_entity": petition.requesting_entity,
        "target_entity": petition.target_entity,
        "legal_basis": petition.legal_basis,
        "requested_actions": petition.requested_actions,
        "deadline_days": petition.deadline_days,
        "created_at": petition.created_at.isoformat()
    }


async def get_petition_templates() -> List[Dict]:
    """
    Obtener plantillas de peticiones disponibles
    
    Returns:
        Lista de plantillas
    """
    templates = []
    for ptype, template in PetitionGenerator.TEMPLATES.items():
        templates.append({
            "id": template.id,
            "name": template.name,
            "type": template.petition_type.value,
            "required_fields": template.required_fields,
            "optional_fields": template.optional_fields,
            "legal_basis_count": len(template.legal_basis)
        })
    return templates


async def generate_petition_from_gap_analysis(
    gap_analysis: Dict,
    requesting_entity: str,
    target_entity: str
) -> Dict:
    """
    Generar petición basada en análisis de brechas
    
    Args:
        gap_analysis: Resultado del análisis de brechas
        requesting_entity: Entidad solicitante
        target_entity: Entidad objetivo
    
    Returns:
        Petición generada en formato dict
    """
    petition = await petition_generator.generate_from_gap_analysis(
        gap_analysis=gap_analysis,
        requesting_entity=requesting_entity,
        target_entity=target_entity
    )
    
    return {
        "id": petition.id,
        "type": petition.petition_type.value,
        "status": petition.status.value,
        "subject": petition.subject,
        "body": petition.body,
        "requesting_entity": petition.requesting_entity,
        "target_entity": petition.target_entity,
        "legal_basis": petition.legal_basis,
        "requested_actions": petition.requested_actions,
        "deadline_days": petition.deadline_days,
        "created_at": petition.created_at.isoformat()
    }


async def list_petitions(
    requesting_entity: Optional[str] = None,
    target_entity: Optional[str] = None,
    status: Optional[str] = None
) -> List[Dict]:
    """
    Listar peticiones con filtros
    
    Args:
        requesting_entity: Filtrar por entidad solicitante
        target_entity: Filtrar por entidad objetivo
        status: Filtrar por estado
    
    Returns:
        Lista de peticiones en formato dict
    """
    # Convertir status string a enum si se proporciona
    status_enum = PetitionStatus(status) if status else None
    
    petitions = await petition_generator.list_petitions(
        requesting_entity=requesting_entity,
        target_entity=target_entity,
        status=status_enum
    )
    
    return [
        {
            "id": p.id,
            "type": p.petition_type.value,
            "status": p.status.value,
            "subject": p.subject,
            "requesting_entity": p.requesting_entity,
            "target_entity": p.target_entity,
            "deadline_days": p.deadline_days,
            "created_at": p.created_at.isoformat(),
            "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None
        }
        for p in petitions
