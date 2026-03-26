"""
Módulo de análisis de brechas de interoperabilidad
Permite identificar gaps en servicios, APIs y documentos de entidades gubernamentales
"""

import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import statistics


class GapSeverity(Enum):
    """Niveles de severidad de brechas"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class GapCategory(Enum):
    """Categorías de brechas"""
    API_AVAILABILITY = "api_availability"
    DOCUMENTATION = "documentation"
    SECURITY = "security"
    PERFORMANCE = "performance"
    COMPLIANCE = "compliance"
    INTEROPERABILITY = "interoperability"


@dataclass
class Gap:
    """Modelo de datos para una brecha identificada"""
    id: str
    title: str
    description: str
    category: GapCategory
    severity: GapSeverity
    entity_name: str
    entity_code: str
    current_value: Any
    expected_value: Any
    impact: str
    recommendation: str
    priority: int
    estimated_effort: str
    created_at: datetime


@dataclass
class GapAnalysisResult:
    """Resultado del análisis de brechas"""
    total_gaps: int
    gaps_by_severity: Dict[str, int]
    gaps_by_category: Dict[str, int]
    critical_gaps: List[Gap]
    top_recommendations: List[str]
    overall_score: float
    improvement_potential: float
    analysis_date: datetime


class GapAnalyzer:
    """Analizador de brechas de interoperabilidad"""
    
    # Definición de estándares esperados
    EXPECTED_STANDARDS = {
        "api_availability": {
            "min_endpoints": 3,
            "required_protocols": ["REST"],
            "max_response_time": 2.0
        },
        "documentation": {
            "required_docs": ["API", "Technical", "User Guide"],
            "min_completeness": 80
        },
        "security": {
            "required_auth": ["OAuth2", "API Key"],
            "https_required": True
        },
        "performance": {
            "min_success_rate": 95,
            "max_avg_response_time": 1.5
        }
    }
    
    def __init__(self):
        self.gaps: List[Gap] = []
    
    async def analyze_ecosystem(
        self,
        services: List[Dict],
        apis: List[Dict],
        documents: List[Dict]
    ) -> GapAnalysisResult:
        """
        Analizar el ecosistema completo para identificar brechas
        
        Args:
            services: Lista de servicios
            apis: Lista de APIs
            documents: Lista de documentos
        
        Returns:
            Resultado del análisis de brechas
        """
        self.gaps = []
        
        # Analizar brechas en APIs
        await self._analyze_api_gaps(apis)
        
        # Analizar brechas en servicios
        await self._analyze_service_gaps(services)
        
        # Analizar brechas en documentación
        await self._analyze_documentation_gaps(documents)
        
        # Analizar brechas de seguridad
        await self._analyze_security_gaps(apis, services)
        
        # Analizar brechas de rendimiento
        await self._analyze_performance_gaps(apis, services)
        
        # Generar resultado
        return self._generate_result()
    
    async def _analyze_api_gaps(self, apis: List[Dict]):
        """Analizar brechas en APIs"""
        for api in apis:
            entity_name = api.get("entity_name", "Unknown")
            entity_code = api.get("entity_code", "Unknown")
            
            # Verificar disponibilidad de API
            if not api.get("is_available", False):
                self._add_gap(
                    title="API No Disponible",
                    description=f"La API de {entity_name} no está disponible",
                    category=GapCategory.API_AVAILABILITY,
                    severity=GapSeverity.CRITICAL,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value="No disponible",
                    expected_value="Disponible",
                    impact="Servicios no pueden integrarse con la entidad",
                    recommendation="Implementar y desplegar la API",
                    priority=1,
                    estimated_effort="Alto"
                )
            
            # Verificar protocolo
            protocol = api.get("protocol", "Unknown")
            if protocol not in self.EXPECTED_STANDARDS["api_availability"]["required_protocols"]:
                self._add_gap(
                    title="Protocolo No Estándar",
                    description=f"API usa {protocol} en lugar de REST",
                    category=GapCategory.INTEROPERABILITY,
                    severity=GapSeverity.MEDIUM,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value=protocol,
                    expected_value="REST",
                    impact="Dificulta la integración con otros sistemas",
                    recommendation="Migrar a protocolo REST",
                    priority=3,
                    estimated_effort="Medio"
                )
            
            # Verificar documentación de API
            if not api.get("has_documentation", False):
                self._add_gap(
                    title="Sin Documentación de API",
                    description=f"API de {entity_name} carece de documentación",
                    category=GapCategory.DOCUMENTATION,
                    severity=GapSeverity.HIGH,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value="Sin documentación",
                    expected_value="Documentación completa",
                    impact="Desarrolladores no pueden usar la API eficientemente",
                    recommendation="Crear documentación Swagger/OpenAPI",
                    priority=2,
                    estimated_effort="Bajo"
                )
    
    async def _analyze_service_gaps(self, services: List[Dict]):
        """Analizar brechas en servicios"""
        for service in services:
            entity_name = service.get("entity_name", "Unknown")
            entity_code = service.get("entity_code", "Unknown")
            
            # Verificar estado del servicio
            status = service.get("status", "unknown")
            if status != "active":
                self._add_gap(
                    title="Servicio Inactivo",
                    description=f"Servicio {service.get('name', 'Unknown')} no está activo",
                    category=GapCategory.API_AVAILABILITY,
                    severity=GapSeverity.HIGH,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value=status,
                    expected_value="active",
                    impact="Ciudadanos no pueden acceder al servicio",
                    recommendation="Restaurar el servicio",
                    priority=2,
                    estimated_effort="Medio"
                )
            
            # Verificar tasa de éxito
            success_rate = service.get("success_rate", 0)
            if success_rate < self.EXPECTED_STANDARDS["performance"]["min_success_rate"]:
                self._add_gap(
                    title="Baja Tasa de Éxito",
                    description=f"Servicio tiene {success_rate}% de éxito",
                    category=GapCategory.PERFORMANCE,
                    severity=GapSeverity.MEDIUM,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value=f"{success_rate}%",
                    expected_value=">95%",
                    impact="Experiencia deficiente del usuario",
                    recommendation="Investigar y resolver errores frecuentes",
                    priority=3,
                    estimated_effort="Medio"
                )
    
    async def _analyze_documentation_gaps(self, documents: List[Dict]):
        """Analizar brechas en documentación"""
        # Agrupar documentos por entidad
        docs_by_entity = {}
        for doc in documents:
            entity_code = doc.get("entity_code", "Unknown")
            if entity_code not in docs_by_entity:
                docs_by_entity[entity_code] = []
            docs_by_entity[entity_code].append(doc)
        
        # Verificar cobertura de documentación
        for entity_code, docs in docs_by_entity.items():
            entity_name = docs[0].get("entity_name", "Unknown") if docs else "Unknown"
            doc_types = [doc.get("type", "") for doc in docs]
            
            for required_type in self.EXPECTED_STANDARDS["documentation"]["required_docs"]:
                if required_type not in doc_types:
                    self._add_gap(
                        title=f"Falta Documentación: {required_type}",
                        description=f"{entity_name} no tiene documentación de tipo {required_type}",
                        category=GapCategory.DOCUMENTATION,
                        severity=GapSeverity.MEDIUM,
                        entity_name=entity_name,
                        entity_code=entity_code,
                        current_value=f"{len(docs)} documentos",
                        expected_value=f"Documentación {required_type}",
                        impact="Información insuficiente para usuarios",
                        recommendation=f"Crear documentación de tipo {required_type}",
                        priority=4,
                        estimated_effort="Bajo"
                    )
    
    async def _analyze_security_gaps(self, apis: List[Dict], services: List[Dict]):
        """Analizar brechas de seguridad"""
        all_items = apis + services
        
        for item in all_items:
            entity_name = item.get("entity_name", "Unknown")
            entity_code = item.get("entity_code", "Unknown")
            
            # Verificar autenticación
            auth_methods = item.get("authentication_methods", [])
            if not auth_methods:
                self._add_gap(
                    title="Sin Autenticación",
                    description=f"API/Servicio de {entity_name} no tiene autenticación",
                    category=GapCategory.SECURITY,
                    severity=GapSeverity.CRITICAL,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value="Sin autenticación",
                    expected_value="OAuth2 o API Key",
                    impact="Riesgo de seguridad crítico",
                    recommendation="Implementar autenticación OAuth2",
                    priority=1,
                    estimated_effort="Alto"
                )
            
            # Verificar HTTPS
            base_url = item.get("base_url", item.get("url", ""))
            if base_url and not base_url.startswith("https://"):
                self._add_gap(
                    title="Sin HTTPS",
                    description=f"API/Servicio de {entity_name} no usa HTTPS",
                    category=GapCategory.SECURITY,
                    severity=GapSeverity.HIGH,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value="HTTP",
                    expected_value="HTTPS",
                    impact="Datos transmitidos sin cifrado",
                    recommendation="Configurar HTTPS/TLS",
                    priority=2,
                    estimated_effort="Medio"
                )
    
    async def _analyze_performance_gaps(self, apis: List[Dict], services: List[Dict]):
        """Analizar brechas de rendimiento"""
        all_items = apis + services
        
        for item in all_items:
            entity_name = item.get("entity_name", "Unknown")
            entity_code = item.get("entity_code", "Unknown")
            
            # Verificar tiempo de respuesta
            response_time = item.get("avg_response_time", item.get("response_time", 0))
            max_time = self.EXPECTED_STANDARDS["api_availability"]["max_response_time"]
            
            if response_time > max_time:
                self._add_gap(
                    title="Tiempo de Respuesta Alto",
                    description=f"API/Servicio de {entity_name} responde en {response_time}s",
                    category=GapCategory.PERFORMANCE,
                    severity=GapSeverity.MEDIUM,
                    entity_name=entity_name,
                    entity_code=entity_code,
                    current_value=f"{response_time}s",
                    expected_value=f"<{max_time}s",
                    impact="Experiencia de usuario degradada",
                    recommendation="Optimizar rendimiento del servidor",
                    priority=3,
                    estimated_effort="Medio"
                )
    
    def _add_gap(
        self,
        title: str,
        description: str,
        category: GapCategory,
        severity: GapSeverity,
        entity_name: str,
        entity_code: str,
        current_value: Any,
        expected_value: Any,
        impact: str,
        recommendation: str,
        priority: int,
        estimated_effort: str
    ):
        """Agregar una brecha al análisis"""
        gap_id = f"GAP-{len(self.gaps) + 1:04d}"
        
        gap = Gap(
            id=gap_id,
            title=title,
            description=description,
            category=category,
            severity=severity,
            entity_name=entity_name,
            entity_code=entity_code,
            current_value=current_value,
            expected_value=expected_value,
            impact=impact,
            recommendation=recommendation,
            priority=priority,
            estimated_effort=estimated_effort,
            created_at=datetime.now()
        )
        
        self.gaps.append(gap)
    
    def _generate_result(self) -> GapAnalysisResult:
        """Generar resultado del análisis"""
        # Contar por severidad
        gaps_by_severity = {}
        for severity in GapSeverity:
            count = sum(1 for g in self.gaps if g.severity == severity)
            gaps_by_severity[severity.value] = count
        
        # Contar por categoría
        gaps_by_category = {}
        for category in GapCategory:
            count = sum(1 for g in self.gaps if g.category == category)
            gaps_by_category[category.value] = count
        
        # Obtener brechas críticas
        critical_gaps = [g for g in self.gaps if g.severity in [GapSeverity.CRITICAL, GapSeverity.HIGH]]
        critical_gaps.sort(key=lambda x: x.priority)
        
        # Generar recomendaciones top
        recommendations = list(set([g.recommendation for g in self.gaps]))
        top_recommendations = recommendations[:10]
        
        # Calcular score general (0-100)
        if len(self.gaps) == 0:
            overall_score = 100.0
        else:
            severity_weights = {
                GapSeverity.CRITICAL: 20,
                GapSeverity.HIGH: 10,
                GapSeverity.MEDIUM: 5,
                GapSeverity.LOW: 2,
                GapSeverity.INFO: 1
            }
            total_weight = sum(severity_weights[g.severity] for g in self.gaps)
            overall_score = max(0, 100 - total_weight)
        
        # Calcular potencial de mejora
        improvement_potential = len(self.gaps) * 5  # 5 puntos por brecha
        
        return GapAnalysisResult(
            total_gaps=len(self.gaps),
            gaps_by_severity=gaps_by_severity,
            gaps_by_category=gaps_by_category,
            critical_gaps=critical_gaps,
            top_recommendations=top_recommendations,
            overall_score=overall_score,
            improvement_potential=improvement_potential,
            analysis_date=datetime.now()
        )
    
    async def generate_detailed_report(self, result: GapAnalysisResult) -> Dict:
        """
        Generar reporte detallado del análisis
        
        Args:
            result: Resultado del análisis
        
        Returns:
            Reporte detallado en formato dict
        """
        return {
            "summary": {
                "total_gaps": result.total_gaps,
                "overall_score": result.overall_score,
                "improvement_potential": result.improvement_potential,
                "analysis_date": result.analysis_date.isoformat()
            },
            "distribution": {
                "by_severity": result.gaps_by_severity,
                "by_category": result.gaps_by_category
            },
            "critical_issues": [
                {
                    "id": gap.id,
                    "title": gap.title,
                    "entity": gap.entity_name,
                    "impact": gap.impact,
                    "recommendation": gap.recommendation
                }
                for gap in result.critical_gaps[:10]
            ],
            "top_recommendations": result.top_recommendations,
            "all_gaps": [
                {
                    "id": gap.id,
                    "title": gap.title,
                    "description": gap.description,
                    "category": gap.category.value,
                    "severity": gap.severity.value,
                    "entity_name": gap.entity_name,
                    "entity_code": gap.entity_code,
                    "current_value": str(gap.current_value),
                    "expected_value": str(gap.expected_value),
                    "impact": gap.impact,
                    "recommendation": gap.recommendation,
                    "priority": gap.priority,
                    "estimated_effort": gap.estimated_effort
                }
                for gap in sorted(self.gaps, key=lambda x: x.priority)
            ]
        }


# Instancia global del analizador
gap_analyzer = GapAnalyzer()


async def analyze_interoperability_gaps(
    services: List[Dict],
    apis: List[Dict],
    documents: List[Dict]
) -> Dict:
    """
    Función helper para analizar brechas de interoperabilidad
    
    Args:
        services: Lista de servicios
        apis: Lista de APIs
        documents: Lista de documentos
    
    Returns:
        Reporte de brechas en formato dict
    """
    result = await gap_analyzer.analyze_ecosystem(services, apis, documents)
    report = await gap_analyzer.generate_detailed_report(result)
    return report


async def get_critical_gaps(
    services: List[Dict],
    apis: List[Dict],
    documents: List[Dict]
) -> List[Dict]:
    """
    Función helper para obtener solo brechas críticas
    
    Args:
        services: Lista de servicios
        apis: Lista de APIs
        documents: Lista de documentos
    
    Returns:
        Lista de brechas críticas
    """
    result = await gap_analyzer.analyze_ecosystem(services, apis, documents)
    
    return [
        {
            "id": gap.id,
            "title": gap.title,
            "entity": gap.entity_name,
            "severity": gap.severity.value,
            "impact": gap.impact,
            "recommendation": gap.recommendation
        }
        for gap in result.critical_gaps
    ]


async def calculate_gap_score(
    services: List[Dict],
    apis: List[Dict],
    documents: List[Dict]
) -> Dict:
    """
    Función helper para calcular score de brechas
    
    Args:
        services: Lista de servicios
        apis: Lista de APIs
        documents: Lista de documentos
    
    Returns:
        Score y métricas principales
    """
    result = await gap_analyzer.analyze_ecosystem(services, apis, documents)
    
    return {
        "overall_score": result.overall_score,
        "total_gaps": result.total_gaps,
        "critical_count": result.gaps_by_severity.get("critical", 0),
        "high_count": result.gaps_by_severity.get("high", 0),
        "improvement_potential": result.improvement_potential
    }