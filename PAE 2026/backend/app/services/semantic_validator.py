"""
Módulo de validación semántica de APIs
Permite validar la semántica y estructura de endpoints de APIs gubernamentales
"""

import asyncio
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import re


class ValidationSeverity(Enum):
    """Niveles de severidad de validación"""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ValidationCategory(Enum):
    """Categorías de validación"""
    NAMING = "naming"
    STRUCTURE = "structure"
    PARAMETERS = "parameters"
    RESPONSE = "response"
    DOCUMENTATION = "documentation"
    SECURITY = "security"


@dataclass
class ValidationIssue:
    """Modelo de datos para un issue de validación"""
    id: str
    category: ValidationCategory
    severity: ValidationSeverity
    field: str
    message: str
    current_value: Any
    expected_value: Any
    suggestion: str
    endpoint: str


@dataclass
class ValidationResult:
    """Resultado de la validación semántica"""
    api_name: str
    api_version: str
    total_issues: int
    error_count: int
    warning_count: int
    info_count: int
    issues: List[ValidationIssue]
    overall_score: float
    validation_date: datetime


class SemanticValidator:
    """Validador semántico de APIs"""
    
    # Patrones de nomenclatura
    NAMING_PATTERNS = {
        "endpoint": r"^/[a-z][a-z0-9]*(/[a-z][a-z0-9]*)*$",
        "parameter": r"^[a-z][a-zA-Z0-9]*$",
        "header": r"^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)*$"
    }
    
    # Endpoints comunes esperados
    EXPECTED_ENDPOINTS = [
        "/health",
        "/version",
        "/docs",
        "/api/v1"
    ]
    
    # Headers de seguridad recomendados
    SECURITY_HEADERS = [
        "X-Content-Type-Options",
        "X-Frame-Options",
        "X-XSS-Protection",
        "Strict-Transport-Security"
    ]
    
    def __init__(self):
        self.issues: List[ValidationIssue] = []
        self.issue_counter = 0
    
    async def validate_api(
        self,
        api_spec: Dict,
        api_name: str = "Unknown",
        api_version: str = "v1"
    ) -> ValidationResult:
        """
        Validar una API completa
        
        Args:
            api_spec: Especificación de la API (OpenAPI/Swagger)
            api_name: Nombre de la API
            api_version: Versión de la API
        
        Returns:
            Resultado de la validación
        """
        self.issues = []
        self.issue_counter = 0
        
        # Validar estructura general
        self._validate_structure(api_spec)
        
        # Validar endpoints
        paths = api_spec.get("paths", {})
        for path, methods in paths.items():
            self._validate_endpoint(path, methods)
        
        # Validar componentes/esquemas
        components = api_spec.get("components", {})
        schemas = components.get("schemas", {})
        for schema_name, schema in schemas.items():
            self._validate_schema(schema_name, schema)
        
        # Validar seguridad
        self._validate_security(api_spec)
        
        # Generar resultado
        return self._generate_result(api_name, api_version)
    
    def _validate_structure(self, api_spec: Dict):
        """Validar estructura general de la API"""
        # Verificar campos requeridos
        required_fields = ["openapi", "info", "paths"]
        for field in required_fields:
            if field not in api_spec:
                self._add_issue(
                    category=ValidationCategory.STRUCTURE,
                    severity=ValidationSeverity.ERROR,
                    field=field,
                    message=f"Campo requerido '{field}' no encontrado",
                    current_value=None,
                    expected_value=field,
                    suggestion=f"Agregar campo '{field}' a la especificación",
                    endpoint="root"
                )
        
        # Verificar info
        info = api_spec.get("info", {})
        if not info.get("title"):
            self._add_issue(
                category=ValidationCategory.STRUCTURE,
                severity=ValidationSeverity.WARNING,
                field="info.title",
                message="Título de la API no especificado",
                current_value=None,
                expected_value="Título descriptivo",
                suggestion="Agregar título descriptivo en info.title",
                endpoint="root"
            )
        
        if not info.get("version"):
            self._add_issue(
                category=ValidationCategory.STRUCTURE,
                severity=ValidationSeverity.WARNING,
                field="info.version",
                message="Versión de la API no especificada",
                current_value=None,
                expected_value="1.0.0",
                suggestion="Agregar versión en info.version",
                endpoint="root"
            )
    
    def _validate_endpoint(self, path: str, methods: Dict):
        """Validar un endpoint específico"""
        # Validar nomenclatura del path
        if not re.match(self.NAMING_PATTERNS["endpoint"], path):
            self._add_issue(
                category=ValidationCategory.NAMING,
                severity=ValidationSeverity.WARNING,
                field="path",
                message=f"Path '{path}' no sigue convención de nomenclatura",
                current_value=path,
                expected_value="/lowercase/paths",
                suggestion="Usar lowercase con guiones para separar palabras",
                endpoint=path
            )
        
        # Validar cada método HTTP
        for method, details in methods.items():
            if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                self._validate_method(path, method, details)
    
    def _validate_method(self, path: str, method: str, details: Dict):
        """Validar un método HTTP específico"""
        endpoint = f"{method.upper()} {path}"
        
        # Verificar descripción
        if not details.get("description") and not details.get("summary"):
            self._add_issue(
                category=ValidationCategory.DOCUMENTATION,
                severity=ValidationSeverity.WARNING,
                field="description",
                message="Endpoint sin descripción",
                current_value=None,
                expected_value="Descripción del endpoint",
                suggestion="Agregar description o summary al endpoint",
                endpoint=endpoint
            )
        
        # Verificar respuestas
        responses = details.get("responses", {})
        if not responses:
            self._add_issue(
                category=ValidationCategory.RESPONSE,
                severity=ValidationSeverity.ERROR,
                field="responses",
                message="Endpoint sin definición de respuestas",
                current_value=None,
                expected_value={"200": "OK"},
                suggestion="Definir al menos respuesta 200",
                endpoint=endpoint
            )
        
        # Verificar parámetros
        parameters = details.get("parameters", [])
        for param in parameters:
            self._validate_parameter(endpoint, param)
        
        # Verificar seguridad
        security = details.get("security", [])
        if not security and method.upper() != "GET":
            self._add_issue(
                category=ValidationCategory.SECURITY,
                severity=ValidationSeverity.WARNING,
                field="security",
                message="Endpoint sin definición de seguridad",
                current_value=None,
                expected_value="Security scheme",
                suggestion="Definir esquema de seguridad para endpoints no-GET",
                endpoint=endpoint
            )
    
    def _validate_parameter(self, endpoint: str, param: Dict):
        """Validar un parámetro"""
        param_name = param.get("name", "")
        
        # Validar nomenclatura
        if param_name and not re.match(self.NAMING_PATTERNS["parameter"], param_name):
            self._add_issue(
                category=ValidationCategory.NAMING,
                severity=ValidationSeverity.WARNING,
                field=f"parameter.{param_name}",
                message=f"Parámetro '{param_name}' no sigue convención",
                current_value=param_name,
                expected_value="camelCase",
                suggestion="Usar camelCase para nombres de parámetros",
                endpoint=endpoint
            )
        
        # Verificar descripción
        if not param.get("description"):
            self._add_issue(
                category=ValidationCategory.DOCUMENTATION,
                severity=ValidationSeverity.INFO,
                field=f"parameter.{param_name}.description",
                message=f"Parámetro '{param_name}' sin descripción",
                current_value=None,
                expected_value="Descripción del parámetro",
                suggestion="Agregar descripción al parámetro",
                endpoint=endpoint
            )
    
    def _validate_schema(self, schema_name: str, schema: Dict):
        """Validar un esquema/componente"""
        # Verificar tipo
        if "type" not in schema and "$ref" not in schema:
            self._add_issue(
                category=ValidationCategory.STRUCTURE,
                severity=ValidationSeverity.WARNING,
                field=f"schemas.{schema_name}.type",
                message=f"Esquema '{schema_name}' sin tipo definido",
                current_value=None,
                expected_value="object",
                suggestion="Definir tipo del esquema",
                endpoint=f"schemas/{schema_name}"
            )
        
        # Verificar propiedades
        properties = schema.get("properties", {})
        for prop_name, prop_details in properties.items():
            if not prop_details.get("type"):
                self._add_issue(
                    category=ValidationCategory.STRUCTURE,
                    severity=ValidationSeverity.INFO,
                    field=f"schemas.{schema_name}.properties.{prop_name}.type",
                    message=f"Propiedad '{prop_name}' sin tipo",
                    current_value=None,
                    expected_value="string/integer/etc",
                    suggestion="Definir tipo de la propiedad",
                    endpoint=f"schemas/{schema_name}"
                )
    
    def _validate_security(self, api_spec: Dict):
        """Validar configuración de seguridad"""
        # Verificar definición de seguridad global
        security_defs = api_spec.get("components", {}).get("securitySchemes", {})
        if not security_defs:
            self._add_issue(
                category=ValidationCategory.SECURITY,
                severity=ValidationSeverity.WARNING,
                field="components.securitySchemes",
                message="No se encontraron esquemas de seguridad",
                current_value=None,
                expected_value="Security scheme",
                suggestion="Definir al menos un esquema de seguridad",
                endpoint="root"
            )
        
        # Verificar seguridad global
        global_security = api_spec.get("security", [])
        if not global_security:
            self._add_issue(
                category=ValidationCategory.SECURITY,
                severity=ValidationSeverity.INFO,
                field="security",
                message="No se definió seguridad global",
                current_value=None,
                expected_value="Global security",
                suggestion="Definir seguridad global si aplica",
                endpoint="root"
            )
    
    def _add_issue(
        self,
        category: ValidationCategory,
        severity: ValidationSeverity,
        field: str,
        message: str,
        current_value: Any,
        expected_value: Any,
        suggestion: str,
        endpoint: str
    ):
        """Agregar un issue de validación"""
        self.issue_counter += 1
        issue_id = f"VAL-{self.issue_counter:04d}"
        
        issue = ValidationIssue(
            id=issue_id,
            category=category,
            severity=severity,
            field=field,
            message=message,
            current_value=current_value,
            expected_value=expected_value,
            suggestion=suggestion,
            endpoint=endpoint
        )
        
        self.issues.append(issue)
    
    def _generate_result(self, api_name: str, api_version: str) -> ValidationResult:
        """Generar resultado de la validación"""
        error_count = sum(1 for i in self.issues if i.severity == ValidationSeverity.ERROR)
        warning_count = sum(1 for i in self.issues if i.severity == ValidationSeverity.WARNING)
        info_count = sum(1 for i in self.issues if i.severity == ValidationSeverity.INFO)
        
        # Calcular score (0-100)
        if len(self.issues) == 0:
            overall_score = 100.0
        else:
            # Penalizar más los errores que los warnings
            penalty = (error_count * 10) + (warning_count * 3) + (info_count * 1)
            overall_score = max(0, 100 - penalty)
        
        return ValidationResult(
            api_name=api_name,
            api_version=api_version,
            total_issues=len(self.issues),
            error_count=error_count,
            warning_count=warning_count,
            info_count=info_count,
            issues=self.issues,
            overall_score=overall_score,
            validation_date=datetime.now()
        )
    
    async def generate_validation_report(self, result: ValidationResult) -> Dict:
        """
        Generar reporte de validación
        
        Args:
            result: Resultado de la validación
        
        Returns:
            Reporte en formato dict
        """
        return {
            "summary": {
                "api_name": result.api_name,
                "api_version": result.api_version,
                "total_issues": result.total_issues,
                "error_count": result.error_count,
                "warning_count": result.warning_count,
                "info_count": result.info_count,
                "overall_score": result.overall_score,
                "validation_date": result.validation_date.isoformat()
            },
            "issues_by_category": {
                cat.value: sum(1 for i in result.issues if i.category == cat)
                for cat in ValidationCategory
            },
            "issues_by_severity": {
                "error": result.error_count,
                "warning": result.warning_count,
                "info": result.info_count
            },
            "issues": [
                {
                    "id": issue.id,
                    "category": issue.category.value,
                    "severity": issue.severity.value,
                    "field": issue.field,
                    "message": issue.message,
                    "current_value": str(issue.current_value) if issue.current_value else None,
                    "expected_value": str(issue.expected_value) if issue.expected_value else None,
                    "suggestion": issue.suggestion,
                    "endpoint": issue.endpoint
                }
                for issue in result.issues
            ]
        }


# Instancia global del validador
semantic_validator = SemanticValidator()


async def validate_api_semantics(
    api_spec: Dict,
    api_name: str = "Unknown",
    api_version: str = "v1"
) -> Dict:
    """
    Función helper para validar semántica de API
    
    Args:
        api_spec: Especificación de la API
        api_name: Nombre de la API
        api_version: Versión de la API
    
    Returns:
        Reporte de validación en formato dict
    """
    result = await semantic_validator.validate_api(api_spec, api_name, api_version)
    report = await semantic_validator.generate_validation_report(result)
    return report


async def get_validation_errors(
    api_spec: Dict,
    api_name: str = "Unknown",
    api_version: str = "v1"
) -> List[Dict]:
    """
    Función helper para obtener solo errores de validación
    
    Args:
        api_spec: Especificación de la API
        api_name: Nombre de la API
        api_version: Versión de la API
    
    Returns:
        Lista de errores
    """
    result = await semantic_validator.validate_api(api_spec, api_name, api_version)
    
    return [
        {
            "id": issue.id,
            "field": issue.field,
            "message": issue.message,
            "suggestion": issue.suggestion,
            "endpoint": issue.endpoint
        }
        for issue in result.issues
        if issue.severity == ValidationSeverity.ERROR
    ]


async def calculate_validation_score(
    api_spec: Dict,
    api_name: str = "Unknown",
    api_version: str = "v1"
) -> Dict:
    """
    Función helper para calcular score de validación
    
    Args:
        api_spec: Especificación de la API
        api_name: Nombre de la API
        api_version: Versión de la API
    
    Returns:
        Score y métricas principales
    """
    result = await semantic_validator.validate_api(api_spec, api_name, api_version)
    
    return {
        "overall_score": result.overall_score,
        "total_issues": result.total_issues,
        "error_count": result.error_count,
        "warning_count": result.warning_count,
        "info_count": result.info_count
    }