"""
Módulo de generación de informes de interoperabilidad
Permite generar informes en diferentes formatos (PDF, Excel, JSON)
"""

import asyncio
from typing import List, Dict, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import json
import os


class ReportFormat(Enum):
    """Formatos de informe soportados"""
    PDF = "pdf"
    EXCEL = "excel"
    JSON = "json"
    HTML = "html"


class ReportType(Enum):
    """Tipos de informe"""
    EXECUTIVE = "executive"
    TECHNICAL = "technical"
    GAP_ANALYSIS = "gap_analysis"
    MATURITY = "maturity"
    SERVICES = "services"
    ENTITIES = "entities"


@dataclass
class ReportConfig:
    """Configuración de generación de informe"""
    report_type: ReportType
    format: ReportFormat
    title: str
    description: str
    include_charts: bool
    include_recommendations: bool
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
    filters: Dict[str, Any]


@dataclass
class GeneratedReport:
    """Modelo de datos para un informe generado"""
    id: str
    title: str
    report_type: str
    format: str
    file_path: str
    file_size: int
    generated_at: datetime
    metadata: Dict[str, Any]


class ReportGenerator:
    """Generador de informes de interoperabilidad"""
    
    # Directorio de salida para informes
    OUTPUT_DIR = "reports"
    
    def __init__(self):
        # Crear directorio de salida si no existe
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
    
    async def generate_executive_report(
        self,
        maturity_data: Dict,
        services_data: List[Dict],
        entities_data: List[Dict],
        gaps_data: Dict,
        format: ReportFormat = ReportFormat.PDF
    ) -> GeneratedReport:
        """
        Generar informe ejecutivo
        
        Args:
            maturity_data: Datos de evaluación de madurez
            services_data: Datos de servicios
            entities_data: Datos de entidades
            gaps_data: Datos de análisis de brechas
            format: Formato del informe
        
        Returns:
            Informe generado
        """
        report_id = f"EXEC-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Preparar contenido del informe
        content = {
            "title": "Informe Ejecutivo de Interoperabilidad",
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_entities": len(entities_data),
                "total_services": len(services_data),
                "maturity_score": maturity_data.get("overall_score", 0),
                "total_gaps": gaps_data.get("summary", {}).get("total_gaps", 0)
            },
            "maturity_analysis": maturity_data,
            "services_overview": {
                "total": len(services_data),
                "by_status": self._count_by_field(services_data, "status"),
                "by_category": self._count_by_field(services_data, "category")
            },
            "entities_overview": {
                "total": len(entities_data),
                "by_sector": self._count_by_field(entities_data, "sector_name")
            },
            "gaps_summary": gaps_data.get("summary", {}),
            "critical_issues": gaps_data.get("critical_issues", []),
            "top_recommendations": gaps_data.get("top_recommendations", [])
        }
        
        # Generar archivo según formato
        if format == ReportFormat.JSON:
            file_path = await self._generate_json_report(report_id, content)
        elif format == ReportFormat.HTML:
            file_path = await self._generate_html_report(report_id, content)
        elif format == ReportFormat.PDF:
            file_path = await self._generate_pdf_report(report_id, content)
        else:
            file_path = await self._generate_json_report(report_id, content)
        
        # Obtener tamaño del archivo
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        
        return GeneratedReport(
            id=report_id,
            title="Informe Ejecutivo de Interoperabilidad",
            report_type="executive",
            format=format.value,
            file_path=file_path,
            file_size=file_size,
            generated_at=datetime.now(),
            metadata={
                "entities_count": len(entities_data),
                "services_count": len(services_data),
                "maturity_score": maturity_data.get("overall_score", 0)
            }
        )
    
    async def generate_technical_report(
        self,
        apis_data: List[Dict],
        services_data: List[Dict],
        validation_data: Dict,
        format: ReportFormat = ReportFormat.PDF
    ) -> GeneratedReport:
        """
        Generar informe técnico
        
        Args:
            apis_data: Datos de APIs
            services_data: Datos de servicios
            validation_data: Datos de validación semántica
            format: Formato del informe
        
        Returns:
            Informe generado
        """
        report_id = f"TECH-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        content = {
            "title": "Informe Técnico de APIs y Servicios",
            "generated_at": datetime.now().isoformat(),
            "apis_analysis": {
                "total_apis": len(apis_data),
                "by_protocol": self._count_by_field(apis_data, "protocol"),
                "by_quality": self._count_by_field(apis_data, "quality_level")
            },
            "services_analysis": {
                "total_services": len(services_data),
                "by_protocol": self._count_by_field(services_data, "protocol"),
                "by_status": self._count_by_field(services_data, "status")
            },
            "validation_results": validation_data,
            "api_details": apis_data,
            "services_details": services_data
        }
        
        if format == ReportFormat.JSON:
            file_path = await self._generate_json_report(report_id, content)
        elif format == ReportFormat.HTML:
            file_path = await self._generate_html_report(report_id, content)
        elif format == ReportFormat.PDF:
            file_path = await self._generate_pdf_report(report_id, content)
        else:
            file_path = await self._generate_json_report(report_id, content)
        
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        
        return GeneratedReport(
            id=report_id,
            title="Informe Técnico de APIs y Servicios",
            report_type="technical",
            format=format.value,
            file_path=file_path,
            file_size=file_size,
            generated_at=datetime.now(),
            metadata={
                "apis_count": len(apis_data),
                "services_count": len(services_data),
                "validation_score": validation_data.get("summary", {}).get("overall_score", 0)
            }
        )
    
    async def generate_gap_analysis_report(
        self,
        gaps_data: Dict,
        recommendations: List[str],
        format: ReportFormat = ReportFormat.PDF
    ) -> GeneratedReport:
        """
        Generar informe de análisis de brechas
        
        Args:
            gaps_data: Datos de brechas
            recommendations: Lista de recomendaciones
            format: Formato del informe
        
        Returns:
            Informe generado
        """
        report_id = f"GAP-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        content = {
            "title": "Informe de Análisis de Brechas",
            "generated_at": datetime.now().isoformat(),
            "summary": gaps_data.get("summary", {}),
            "distribution": gaps_data.get("distribution", {}),
            "critical_issues": gaps_data.get("critical_issues", []),
            "all_gaps": gaps_data.get("all_gaps", []),
            "recommendations": recommendations,
            "action_plan": self._generate_action_plan(gaps_data)
        }
        
        if format == ReportFormat.JSON:
            file_path = await self._generate_json_report(report_id, content)
        elif format == ReportFormat.HTML:
            file_path = await self._generate_html_report(report_id, content)
        elif format == ReportFormat.PDF:
            file_path = await self._generate_pdf_report(report_id, content)
        else:
            file_path = await self._generate_json_report(report_id, content)
        
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        
        return GeneratedReport(
            id=report_id,
            title="Informe de Análisis de Brechas",
            report_type="gap_analysis",
            format=format.value,
            file_path=file_path,
            file_size=file_size,
            generated_at=datetime.now(),
            metadata={
                "total_gaps": gaps_data.get("summary", {}).get("total_gaps", 0),
                "overall_score": gaps_data.get("summary", {}).get("overall_score", 0)
            }
        )
    
    async def generate_maturity_report(
        self,
        maturity_data: Dict,
        entity_name: str,
        format: ReportFormat = ReportFormat.PDF
    ) -> GeneratedReport:
        """
        Generar informe de evaluación de madurez
        
        Args:
            maturity_data: Datos de evaluación de madurez
            entity_name: Nombre de la entidad
            format: Formato del informe
        
        Returns:
            Informe generado
        """
        report_id = f"MAT-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        content = {
            "title": f"Informe de Evaluación de Madurez - {entity_name}",
            "generated_at": datetime.now().isoformat(),
            "entity_name": entity_name,
            "overall_score": maturity_data.get("overall_score", 0),
            "level": maturity_data.get("level", "unknown"),
            "dimensions": maturity_data.get("dimensions", {}),
            "recommendations": maturity_data.get("recommendations", []),
            "strengths": maturity_data.get("strengths", []),
            "weaknesses": maturity_data.get("weaknesses", [])
        }
        
        if format == ReportFormat.JSON:
            file_path = await self._generate_json_report(report_id, content)
        elif format == ReportFormat.HTML:
            file_path = await self._generate_html_report(report_id, content)
        elif format == ReportFormat.PDF:
            file_path = await self._generate_pdf_report(report_id, content)
        else:
            file_path = await self._generate_json_report(report_id, content)
        
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        
        return GeneratedReport(
            id=report_id,
            title=f"Informe de Evaluación de Madurez - {entity_name}",
            report_type="maturity",
            format=format.value,
            file_path=file_path,
            file_size=file_size,
            generated_at=datetime.now(),
            metadata={
                "entity_name": entity_name,
                "maturity_score": maturity_data.get("overall_score", 0),
                "level": maturity_data.get("level", "unknown")
            }
        )
    
    async def _generate_json_report(self, report_id: str, content: Dict) -> str:
        """Generar informe en formato JSON"""
        file_path = os.path.join(self.OUTPUT_DIR, f"{report_id}.json")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, indent=2, ensure_ascii=False, default=str)
        
        return file_path
    
    async def _generate_html_report(self, report_id: str, content: Dict) -> str:
        """Generar informe en formato HTML"""
        file_path = os.path.join(self.OUTPUT_DIR, f"{report_id}.html")
        
        html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{content.get('title', 'Informe')}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #2c3e50; }}
        h2 {{ color: #34495e; border-bottom: 2px solid #3498db; }}
        .summary {{ background: #ecf0f1; padding: 15px; border-radius: 5px; }}
        .metric {{ display: inline-block; margin: 10px; padding: 10px; background: #3498db; color: white; border-radius: 5px; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background: #34495e; color: white; }}
        .critical {{ color: #e74c3c; font-weight: bold; }}
        .warning {{ color: #f39c12; }}
        .info {{ color: #3498db; }}
    </style>
</head>
<body>
    <h1>{content.get('title', 'Informe')}</h1>
    <p><strong>Generado:</strong> {content.get('generated_at', '')}</p>
    
    <h2>Resumen Ejecutivo</h2>
    <div class="summary">
        {self._dict_to_html_metrics(content.get('summary', {}))}
    </div>
    
    <h2>Detalles</h2>
    {self._dict_to_html_tables(content)}
    
    <h2>Recomendaciones</h2>
    <ul>
        {"".join(f"<li>{rec}</li>" for rec in content.get('recommendations', content.get('top_recommendations', [])))}
    </ul>
</body>
</html>
"""
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return file_path
    
    async def _generate_pdf_report(self, report_id: str, content: Dict) -> str:
        """Generar informe en formato PDF (simplificado)"""
        # Por ahora generamos HTML que puede ser convertido a PDF
        file_path = os.path.join(self.OUTPUT_DIR, f"{report_id}.html")
        
        html_content = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{content.get('title', 'Informe')}</title>
    <style>
        @media print {{
            body {{ font-size: 12pt; }}
            .page-break {{ page-break-after: always; }}
        }}
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ color: #2c3e50; font-size: 24pt; }}
        h2 {{ color: #34495e; font-size: 18pt; border-bottom: 2px solid #3498db; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .summary {{ background: #f5f5f5; padding: 15px; border: 1px solid #ddd; }}
        .metric-box {{ display: inline-block; margin: 10px; padding: 15px; background: #3498db; color: white; }}
        table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }}
        th, td {{ border: 1px solid #ddd; padding: 6px; }}
        th {{ background: #34495e; color: white; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{content.get('title', 'Informe')}</h1>
        <p>Fecha de generación: {content.get('generated_at', '')}</p>
    </div>
    
    <h2>Resumen</h2>
    <div class="summary">
        {self._dict_to_html_metrics(content.get('summary', {}))}
    </div>
    
    <div class="page-break"></div>
    
    <h2>Análisis Detallado</h2>
    {self._dict_to_html_tables(content)}
    
    <h2>Recomendaciones</h2>
    <ol>
        {"".join(f"<li>{rec}</li>" for rec in content.get('recommendations', content.get('top_recommendations', [])))}
    </ol>
</body>
</html>
"""
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return file_path
    
    def _dict_to_html_metrics(self, data: Dict) -> str:
        """Convertir diccionario a métricas HTML"""
        html = ""
        for key, value in data.items():
            if isinstance(value, (int, float, str)):
                html += f'<div class="metric-box"><strong>{key}:</strong> {value}</div>'
        return html
    
    def _dict_to_html_tables(self, data: Dict) -> str:
        """Convertir diccionario a tablas HTML"""
        html = ""
        for section_key, section_value in data.items():
            if isinstance(section_value, dict) and section_key not in ['summary', 'generated_at', 'title']:
                html += f"<h3>{section_key.replace('_', ' ').title()}</h3>"
                html += "<table>"
                html += "<tr><th>Clave</th><th>Valor</th></tr>"
                for key, value in section_value.items():
                    html += f"<tr><td>{key}</td><td>{value}</td></tr>"
                html += "</table>"
            elif isinstance(section_value, list) and len(section_value) > 0:
                html += f"<h3>{section_key.replace('_', ' ').title()}</h3>"
                if isinstance(section_value[0], dict):
                    html += "<table>"
                    headers = list(section_value[0].keys())
                    html += "<tr>" + "".join(f"<th>{h}</th>" for h in headers) + "</tr>"
                    for item in section_value[:10]:  # Limitar a 10 filas
                        html += "<tr>" + "".join(f"<td>{item.get(h, '')}</td>" for h in headers) + "</tr>"
                    html += "</table>"
        return html
    
    def _count_by_field(self, data: List[Dict], field: str) -> Dict[str, int]:
        """Contar elementos por campo"""
        counts = {}
        for item in data:
            value = item.get(field, "unknown")
            counts[value] = counts.get(value, 0) + 1
        return counts
    
    def _generate_action_plan(self, gaps_data: Dict) -> List[Dict]:
        """Generar plan de acción basado en brechas"""
        action_plan = []
        
        critical_issues = gaps_data.get("critical_issues", [])
        for i, issue in enumerate(critical_issues[:5], 1):
            action_plan.append({
                "priority": i,
                "action": issue.get("recommendation", ""),
                "target": issue.get("entity", ""),
                "impact": issue.get("impact", ""),
                "timeline": "Inmediato" if issue.get("severity") == "critical" else "Corto plazo"
            })
        
        return action_plan


# Instancia global del generador
report_generator = ReportGenerator()


async def generate_executive_summary(
    maturity_data: Dict,
    services_data: List[Dict],
    entities_data: List[Dict],
    gaps_data: Dict,
    format: str = "json"
) -> Dict:
    """
    Función helper para generar resumen ejecutivo
    
    Args:
        maturity_data: Datos de madurez
        services_data: Datos de servicios
        entities_data: Datos de entidades
        gaps_data: Datos de brechas
        format: Formato del informe
    
    Returns:
        Informe generado en formato dict
    """
    report_format = ReportFormat(format) if format in [f.value for f in ReportFormat] else ReportFormat.JSON
    
    report = await report_generator.generate_executive_report(
        maturity_data=maturity_data,
        services_data=services_data,
        entities_data=entities_data,
        gaps_data=gaps_data,
        format=report_format
    )
    
    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "format": report.format,
        "file_path": report.file_path,
        "file_size": report.file_size,
        "generated_at": report.generated_at.isoformat(),
        "metadata": report.metadata
    }


async def generate_gap_report(
    gaps_data: Dict,
    recommendations: List[str],
    format: str = "json"
) -> Dict:
    """
    Función helper para generar informe de brechas
    
    Args:
        gaps_data: Datos de brechas
        recommendations: Recomendaciones
        format: Formato del informe
    
    Returns:
        Informe generado en formato dict
    """
    report_format = ReportFormat(format) if format in [f.value for f in ReportFormat] else ReportFormat.JSON
    
    report = await report_generator.generate_gap_analysis_report(
        gaps_data=gaps_data,
        recommendations=recommendations,
        format=report_format
    )
    
    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "format": report.format,
        "file_path": report.file_path,
        "file_size": report.file_size,
        "generated_at": report.generated_at.isoformat(),
        "metadata": report.metadata
    }


async def generate_entity_maturity_report(
    maturity_data: Dict,
    entity_name: str,
    format: str = "json"
) -> Dict:
    """
    Función helper para generar informe de madurez de entidad
    
    Args:
        maturity_data: Datos de madurez
        entity_name: Nombre de la entidad
        format: Formato del informe
    
    Returns:
        Informe generado en formato dict
    """
    report_format = ReportFormat(format) if format in [f.value for f in ReportFormat] else ReportFormat.JSON
    
    report = await report_generator.generate_maturity_report(
        maturity_data=maturity_data,
        entity_name=entity_name,
        format=report_format
    )
    
    return {
        "id": report.id,
        "title": report.title,
        "report_type": report.report_type,
        "format": report.format,
        "file_path": report.file_path,
        "file_size": report.file_size,
        "generated_at": report.generated_at.isoformat(),
        "metadata": report.metadata
    }