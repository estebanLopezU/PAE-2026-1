"""
Módulo de análisis de APIs de entidades gubernamentales
Permite analizar protocolos, documentación y calidad de APIs
"""

import httpx
import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
from urllib.parse import urlparse
import re


class APIProtocol(Enum):
    """Protocolos de API soportados"""
    REST = "REST"
    SOAP = "SOAP"
    GRAPHQL = "GraphQL"
    GRPC = "gRPC"
    WEBSOCKET = "WebSocket"
    UNKNOWN = "Unknown"


class APIQuality(Enum):
    """Niveles de calidad de API"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNKNOWN = "unknown"


@dataclass
class APIEndpoint:
    """Modelo de datos para un endpoint de API"""
    url: str
    method: str
    path: str
    description: Optional[str]
    parameters: List[Dict]
    response_format: str
    authentication: str
    status: str


@dataclass
class APIAnalysis:
    """Modelo de datos para análisis de API"""
    entity_name: str
    entity_code: str
    base_url: str
    protocol: APIProtocol
    has_documentation: bool
    documentation_url: Optional[str]
    has_openapi_spec: bool
    openapi_url: Optional[str]
    endpoints_count: int
    authentication_methods: List[str]
    quality_score: float
    quality_level: APIQuality
    issues: List[str]
    recommendations: List[str]
    last_analyzed: datetime


class APIAnalyzer:
    """Analizador de APIs gubernamentales"""
    
    # Patrones para detectar protocolos
    SOAP_INDICATORS = ["/soap", "/wsdl", "?wsdl", "SOAPAction"]
    GRAPHQL_INDICATORS = ["/graphql", "query", "mutation", "subscription"]
    GRPC_INDICATORS = ["/grpc", "proto", "protobuf"]
    
    # Patrones para detectar documentación
    DOC_INDICATORS = ["/docs", "/swagger", "/openapi", "/api-docs", "/documentation"]
    OPENAPI_INDICATORS = ["/openapi.json", "/swagger.json", "/openapi.yaml", "/swagger.yaml"]
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            verify=False
        )
    
    async def close(self):
        """Cerrar cliente HTTP"""
        await self.client.aclose()
    
    async def analyze_api(self, base_url: str, entity_name: str = "", entity_code: str = "") -> APIAnalysis:
        """
        Analizar una API gubernamental
        
        Args:
            base_url: URL base de la API
            entity_name: Nombre de la entidad
            entity_code: Código de la entidad
        
        Returns:
            Análisis completo de la API
        """
        issues = []
        recommendations = []
        
        # Normalizar URL
        base_url = self._normalize_url(base_url)
        
        # Detectar protocolo
        protocol = await self._detect_protocol(base_url)
        
        # Buscar documentación
        has_docs, docs_url = await self._find_documentation(base_url)
        
        # Buscar especificación OpenAPI
        has_openapi, openapi_url = await self._find_openapi_spec(base_url)
        
        # Analizar endpoints
        endpoints = await self._discover_endpoints(base_url, protocol)
        
        # Detectar métodos de autenticación
        auth_methods = await self._detect_auth_methods(base_url)
        
        # Calcular calidad
        quality_score, quality_level = self._calculate_quality(
            has_docs, has_openapi, len(endpoints), len(auth_methods), protocol
        )
        
        # Identificar issues
        if not has_docs:
            issues.append("No se encontró documentación de la API")
            recommendations.append("Agregar documentación usando Swagger/OpenAPI")
        
        if not has_openapi:
            issues.append("No se encontró especificación OpenAPI/Swagger")
            recommendations.append("Generar especificación OpenAPI 3.0")
        
        if len(endpoints) == 0:
            issues.append("No se detectaron endpoints públicos")
            recommendations.append("Verificar que la API esté accesible")
        
        if len(auth_methods) == 0:
            issues.append("No se detectaron métodos de autenticación")
            recommendations.append("Implementar autenticación OAuth 2.0 o API Key")
        
        if protocol == APIProtocol.UNKNOWN:
            issues.append("No se pudo determinar el protocolo de la API")
            recommendations.append("Estandarizar a REST o GraphQL")
        
        return APIAnalysis(
            entity_name=entity_name,
            entity_code=entity_code,
            base_url=base_url,
            protocol=protocol,
            has_documentation=has_docs,
            documentation_url=docs_url,
            has_openapi_spec=has_openapi,
            openapi_url=openapi_url,
            endpoints_count=len(endpoints),
            authentication_methods=auth_methods,
            quality_score=quality_score,
            quality_level=quality_level,
            issues=issues,
            recommendations=recommendations,
            last_analyzed=datetime.now()
        )
    
    def _normalize_url(self, url: str) -> str:
        """Normalizar URL"""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        return url.rstrip("/")
    
    async def _detect_protocol(self, base_url: str) -> APIProtocol:
        """
        Detectar protocolo de la API
        
        Args:
            base_url: URL base de la API
        
        Returns:
            Protocolo detectado
        """
        try:
            # Intentar obtener la página principal
            response = await self.client.get(base_url)
            content = response.text.lower()
            headers = str(response.headers).lower()
            
            # Verificar indicadores de SOAP
            for indicator in self.SOAP_INDICATORS:
                if indicator.lower() in content or indicator.lower() in headers:
                    return APIProtocol.SOAP
            
            # Verificar indicadores de GraphQL
            for indicator in self.GRAPHQL_INDICATORS:
                if indicator.lower() in content:
                    return APIProtocol.GRAPHQL
            
            # Verificar indicadores de gRPC
            for indicator in self.GRPC_INDICATORS:
                if indicator.lower() in content:
                    return APIProtocol.GRPC
            
            # Intentar acceder a endpoints REST comunes
            rest_endpoints = ["/api", "/api/v1", "/api/v2", "/v1", "/v2"]
            for endpoint in rest_endpoints:
                try:
                    test_response = await self.client.get(f"{base_url}{endpoint}")
                    if test_response.status_code < 500:
                        return APIProtocol.REST
                except:
                    continue
            
            # Si no se detectó otro protocolo, asumir REST
            return APIProtocol.REST
            
        except Exception as e:
            print(f"Error detectando protocolo: {e}")
            return APIProtocol.UNKNOWN
    
    async def _find_documentation(self, base_url: str) -> Tuple[bool, Optional[str]]:
        """
        Buscar documentación de la API
        
        Args:
            base_url: URL base de la API
        
        Returns:
            Tupla (tiene_documentación, url_documentación)
        """
        for indicator in self.DOC_INDICATORS:
            try:
                url = f"{base_url}{indicator}"
                response = await self.client.get(url)
                
                if response.status_code == 200:
                    return True, url
            except:
                continue
        
        return False, None
    
    async def _find_openapi_spec(self, base_url: str) -> Tuple[bool, Optional[str]]:
        """
        Buscar especificación OpenAPI/Swagger
        
        Args:
            base_url: URL base de la API
        
        Returns:
            Tupla (tiene_openapi, url_openapi)
        """
        for indicator in self.OPENAPI_INDICATORS:
            try:
                url = f"{base_url}{indicator}"
                response = await self.client.get(url)
                
                if response.status_code == 200:
                    content_type = response.headers.get("content-type", "")
                    if "json" in content_type or "yaml" in content_type:
                        return True, url
            except:
                continue
        
        return False, None
    
    async def _discover_endpoints(self, base_url: str, protocol: APIProtocol) -> List[APIEndpoint]:
        """
        Descubrir endpoints de la API
        
        Args:
            base_url: URL base de la API
            protocol: Protocolo detectado
        
        Returns:
            Lista de endpoints descubiertos
        """
        endpoints = []
        
        # Endpoints comunes a probar
        common_paths = [
            "/api",
            "/api/v1",
            "/api/v2",
            "/health",
            "/status",
            "/users",
            "/services",
            "/data",
            "/information"
        ]
        
        for path in common_paths:
            try:
                url = f"{base_url}{path}"
                response = await self.client.get(url)
                
                if response.status_code < 500:
                    endpoint = APIEndpoint(
                        url=url,
                        method="GET",
                        path=path,
                        description=None,
                        parameters=[],
                        response_format=self._detect_response_format(response),
                        authentication=self._detect_auth_from_response(response),
                        status="active" if response.status_code == 200 else "inactive"
                    )
                    endpoints.append(endpoint)
            except:
                continue
        
        return endpoints
    
    async def _detect_auth_methods(self, base_url: str) -> List[str]:
        """
        Detectar métodos de autenticación
        
        Args:
            base_url: URL base de la API
        
        Returns:
            Lista de métodos de autenticación
        """
        auth_methods = []
        
        try:
            response = await self.client.get(base_url)
            headers = response.headers
            content = response.text.lower()
            
            # Verificar headers de autenticación
            if "www-authenticate" in headers:
                auth_header = headers["www-authenticate"].lower()
                if "bearer" in auth_header:
                    auth_methods.append("Bearer Token")
                if "basic" in auth_header:
                    auth_methods.append("Basic Auth")
                if "digest" in auth_header:
                    auth_methods.append("Digest Auth")
            
            # Verificar indicadores en contenido
            if "oauth" in content:
                auth_methods.append("OAuth")
            if "api-key" in content or "apikey" in content or "x-api-key" in content:
                auth_methods.append("API Key")
            if "jwt" in content or "jsonwebtoken" in content:
                auth_methods.append("JWT")
            
        except Exception as e:
            print(f"Error detectando autenticación: {e}")
        
        return auth_methods
    
    def _detect_response_format(self, response: httpx.Response) -> str:
        """Detectar formato de respuesta"""
        content_type = response.headers.get("content-type", "").lower()
        
        if "json" in content_type:
            return "JSON"
        elif "xml" in content_type:
            return "XML"
        elif "yaml" in content_type or "yml" in content_type:
            return "YAML"
        elif "text" in content_type:
            return "Text"
        else:
            return "Unknown"
    
    def _detect_auth_from_response(self, response: httpx.Response) -> str:
        """Detectar autenticación desde respuesta"""
        if response.status_code == 401:
            return "Required"
        elif response.status_code == 403:
            return "Forbidden"
        else:
            return "None"
    
    def _calculate_quality(
        self,
        has_docs: bool,
        has_openapi: bool,
        endpoints_count: int,
        auth_methods_count: int,
        protocol: APIProtocol
    ) -> Tuple[float, APIQuality]:
        """
        Calcular calidad de la API
        
        Args:
            has_docs: Tiene documentación
            has_openapi: Tiene especificación OpenAPI
            endpoints_count: Número de endpoints
            auth_methods_count: Número de métodos de autenticación
            protocol: Protocolo detectado
        
        Returns:
            Tupla (puntuación, nivel_calidad)
        """
        score = 0.0
        
        # Documentación (30 puntos)
        if has_docs:
            score += 15
        if has_openapi:
            score += 15
        
        # Endpoints (30 puntos)
        if endpoints_count > 0:
            score += min(30, endpoints_count * 3)
        
        # Autenticación (20 puntos)
        if auth_methods_count > 0:
            score += min(20, auth_methods_count * 10)
        
        # Protocolo (20 puntos)
        if protocol == APIProtocol.REST:
            score += 20
        elif protocol == APIProtocol.GRAPHQL:
            score += 15
        elif protocol == APIProtocol.SOAP:
            score += 10
        
        # Determinar nivel de calidad
        if score >= 80:
            quality_level = APIQuality.EXCELLENT
        elif score >= 60:
            quality_level = APIQuality.GOOD
        elif score >= 40:
            quality_level = APIQuality.FAIR
        elif score > 0:
            quality_level = APIQuality.POOR
        else:
            quality_level = APIQuality.UNKNOWN
        
        return score, quality_level
    
    async def analyze_multiple_entities(self, entities: List[Dict]) -> List[APIAnalysis]:
        """
        Analizar múltiples entidades
        
        Args:
            entities: Lista de entidades con url_api
        
        Returns:
            Lista de análisis
        """
        analyses = []
        
        for entity in entities:
            if entity.get("url_api"):
                analysis = await self.analyze_api(
                    base_url=entity["url_api"],
                    entity_name=entity.get("name", ""),
                    entity_code=entity.get("code", "")
                )
                analyses.append(analysis)
        
        return analyses
    
    async def generate_quality_report(self, analyses: List[APIAnalysis]) -> Dict:
        """
        Generar reporte de calidad de APIs
        
        Args:
            analyses: Lista de análisis
        
        Returns:
            Reporte de calidad
        """
        if not analyses:
            return {}
        
        # Estadísticas generales
        total_apis = len(analyses)
        apis_with_docs = sum(1 for a in analyses if a.has_documentation)
        apis_with_openapi = sum(1 for a in analyses if a.has_openapi_spec)
        
        # Distribución por calidad
        quality_distribution = {}
        for quality in APIQuality:
            count = sum(1 for a in analyses if a.quality_level == quality)
            quality_distribution[quality.value] = count
        
        # Distribución por protocolo
        protocol_distribution = {}
        for protocol in APIProtocol:
            count = sum(1 for a in analyses if a.protocol == protocol)
            protocol_distribution[protocol.value] = count
        
        # Promedio de calidad
        avg_quality = sum(a.quality_score for a in analyses) / total_apis
        
        # Issues más comunes
        all_issues = []
        for analysis in analyses:
            all_issues.extend(analysis.issues)
        
        issue_count = {}
        for issue in all_issues:
            issue_count[issue] = issue_count.get(issue, 0) + 1
        
        common_issues = sorted(issue_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_apis": total_apis,
            "apis_with_documentation": apis_with_docs,
            "documentation_rate": round(apis_with_docs / total_apis * 100, 1),
            "apis_with_openapi": apis_with_openapi,
            "openapi_rate": round(apis_with_openapi / total_apis * 100, 1),
            "average_quality_score": round(avg_quality, 1),
            "quality_distribution": quality_distribution,
            "protocol_distribution": protocol_distribution,
            "common_issues": [{"issue": issue, "count": count} for issue, count in common_issues],
            "generated_at": datetime.now().isoformat()
        }


# Instancia global del analizador
api_analyzer = APIAnalyzer()


async def analyze_entity_api(base_url: str, entity_name: str = "", entity_code: str = "") -> Dict:
    """
    Función helper para analizar API de una entidad
    
    Args:
        base_url: URL base de la API
        entity_name: Nombre de la entidad
        entity_code: Código de la entidad
    
    Returns:
        Análisis de la API en formato dict
    """
    analysis = await api_analyzer.analyze_api(base_url, entity_name, entity_code)
    await api_analyzer.close()
    
    return {
        "entity_name": analysis.entity_name,
        "entity_code": analysis.entity_code,
        "base_url": analysis.base_url,
        "protocol": analysis.protocol.value,
        "has_documentation": analysis.has_documentation,
        "documentation_url": analysis.documentation_url,
        "has_openapi_spec": analysis.has_openapi_spec,
        "openapi_url": analysis.openapi_url,
        "endpoints_count": analysis.endpoints_count,
        "authentication_methods": analysis.authentication_methods,
        "quality_score": analysis.quality_score,
        "quality_level": analysis.quality_level.value,
        "issues": analysis.issues,
        "recommendations": analysis.recommendations,
        "last_analyzed": analysis.last_analyzed.isoformat()
    }


async def analyze_multiple_apis(entities: List[Dict]) -> List[Dict]:
    """
    Función helper para analizar múltiples APIs
    
    Args:
        entities: Lista de entidades
    
    Returns:
        Lista de análisis en formato dict
    """
    analyses = await api_analyzer.analyze_multiple_entities(entities)
    await api_analyzer.close()
    
    return [
        {
            "entity_name": a.entity_name,
            "entity_code": a.entity_code,
            "base_url": a.base_url,
            "protocol": a.protocol.value,
            "has_documentation": a.has_documentation,
            "has_openapi_spec": a.has_openapi_spec,
            "quality_score": a.quality_score,
            "quality_level": a.quality_level.value,
            "issues_count": len(a.issues),
            "recommendations_count": len(a.recommendations)
        }
        for a in analyses
    ]