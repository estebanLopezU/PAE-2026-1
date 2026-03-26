"""
Módulo de Selector de Muestra
Permite seleccionar muestras representativas de entidades para análisis de interoperabilidad
"""

import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import random
import json


class SelectionCriteria(Enum):
    """Criterios de selección de muestra"""
    RANDOM = "random"
    STRATIFIED = "stratified"  # Por sector/tipo
    SIZE_BASED = "size_based"  # Por tamaño de entidad
    REGIONAL = "regional"  # Por región geográfica
    MATURITY_LEVEL = "maturity_level"  # Por nivel de madurez digital
    SERVICE_TYPE = "service_type"  # Por tipo de servicios


class EntityType(Enum):
    """Tipos de entidad"""
    NATIONAL = "national"
    DEPARTMENTAL = "departmental"
    MUNICIPAL = "municipal"
    AUTONOMOUS = "autonomous"
    TERRITORIAL = "territorial"


@dataclass
class Entity:
    """Entidad gubernamental"""
    id: str
    name: str
    code: str
    entity_type: EntityType
    sector: str
    department: str
    municipality: Optional[str]
    population_served: int
    digital_maturity_score: float  # 0-100
    services_count: int
    interoperability_level: str  # basic, intermediate, advanced
    has_api: bool
    xroad_member: bool
    contact_email: Optional[str]


@dataclass
class SampleConfig:
    """Configuración de selección de muestra"""
    total_sample_size: int
    selection_criteria: SelectionCriteria
    stratification_fields: List[str]  # Campos para estratificar
    min_entities_per_stratum: int
    max_entities_per_stratum: int
    include_types: List[EntityType]
    exclude_entity_ids: List[str]
    random_seed: Optional[int]


@dataclass
class SampleResult:
    """Resultado de selección de muestra"""
    sample_id: str
    config: SampleConfig
    selected_entities: List[Entity]
    selection_summary: Dict
    representativeness_score: float  # 0-100
    created_at: datetime


class SampleSelector:
    """Selector de muestras para análisis"""
    
    def __init__(self):
        self.entities_db = self._load_sample_entities()
        self.samples_history = {}
    
    def _load_sample_entities(self) -> List[Entity]:
        """Cargar entidades de ejemplo (simulación)"""
        entities = [
            Entity(
                id="ENT001",
                name="Registraduría Nacional del Estado Civil",
                code="RNEC",
                entity_type=EntityType.NATIONAL,
                sector="Gobierno",
                department="Bogotá D.C.",
                municipality=None,
                population_served=50000000,
                digital_maturity_score=85.5,
                services_count=45,
                interoperability_level="advanced",
                has_api=True,
                xroad_member=True,
                contact_email="interoperabilidad@registraduria.gov.co"
            ),
            Entity(
                id="ENT002",
                name="Dirección de Impuestos y Aduanas Nacionales",
                code="DIAN",
                entity_type=EntityType.NATIONAL,
                sector="Hacienda",
                department="Bogotá D.C.",
                municipality=None,
                population_served=50000000,
                digital_maturity_score=92.0,
                services_count=120,
                interoperability_level="advanced",
                has_api=True,
                xroad_member=True,
                contact_email="soporte@dian.gov.co"
            ),
            Entity(
                id="ENT003",
                name="Alcaldía de Medellín",
                code="ALC_MDZ",
                entity_type=EntityType.MUNICIPAL,
                sector="Gobierno Local",
                department="Antioquia",
                municipality="Medellín",
                population_served=2500000,
                digital_maturity_score=78.3,
                services_count=85,
                interoperability_level="intermediate",
                has_api=True,
                xroad_member=False,
                contact_email="digital@medellin.gov.co"
            ),
            Entity(
                id="ENT004",
                name="Gobernación del Valle del Cauca",
                code="GOB_VAC",
                entity_type=EntityType.DEPARTAMENTAL,
                sector="Gobierno Regional",
                department="Valle del Cauca",
                municipality=None,
                population_served=4500000,
                digital_maturity_score=65.7,
                services_count=52,
                interoperability_level="basic",
                has_api=False,
                xroad_member=False,
                contact_email="tic@valle.gov.co"
            ),
            Entity(
                id="ENT005",
                name="Ministerio de Salud",
                code="MINSALUD",
                entity_type=EntityType.NATIONAL,
                sector="Salud",
                department="Bogotá D.C.",
                municipality=None,
                population_served=50000000,
                digital_maturity_score=88.9,
                services_count=78,
                interoperability_level="advanced",
                has_api=True,
                xroad_member=True,
                contact_email="interoperabilidad@minsalud.gov.co"
            ),
            Entity(
                id="ENT006",
                name="Alcaldía de Bogotá",
                code="ALC_BOG",
                entity_type=EntityType.MUNICIPAL,
                sector="Gobierno Local",
                department="Bogotá D.C.",
                municipality="Bogotá",
                population_served=7500000,
                digital_maturity_score=82.1,
                services_count=156,
                interoperability_level="intermediate",
                has_api=True,
                xroad_member=True,
                contact_email="innovacion@bogota.gov.co"
            ),
            Entity(
                id="ENT007",
                name="Policía Nacional",
                code="POLICIA",
                entity_type=EntityType.NATIONAL,
                sector="Seguridad",
                department="Bogotá D.C.",
                municipality=None,
                population_served=50000000,
                digital_maturity_score=71.5,
                services_count=34,
                interoperability_level="intermediate",
                has_api=True,
                xroad_member=True,
                contact_email="tecnologia@policia.gov.co"
            ),
            Entity(
                id="ENT008",
                name="Alcaldía de Cali",
                code="ALC_CALI",
                entity_type=EntityType.MUNICIPAL,
                sector="Gobierno Local",
                department="Valle del Cauca",
                municipality="Cali",
                population_served=2200000,
                digital_maturity_score=69.8,
                services_count=67,
                interoperability_level="basic",
                has_api=False,
                xroad_member=False,
                contact_email="tic@cali.gov.co"
            ),
            Entity(
                id="ENT009",
                name="Superintendencia de Industria y Comercio",
                code="SIC",
                entity_type=EntityType.AUTONOMOUS,
                sector="Control",
                department="Bogotá D.C.",
                municipality=None,
                population_served=50000000,
                digital_maturity_score=79.4,
                services_count=28,
                interoperability_level="intermediate",
                has_api=True,
                xroad_member=False,
                contact_email="info@sic.gov.co"
            ),
            Entity(
                id="ENT010",
                name="Gobernación de Antioquia",
                code="GOB_ANT",
                entity_type=EntityType.DEPARTAMENTAL,
                sector="Gobierno Regional",
                department="Antioquia",
                municipality=None,
                population_served=6500000,
                digital_maturity_score=72.3,
                services_count=48,
                interoperability_level="intermediate",
                has_api=True,
                xroad_member=False,
                contact_email="gobierno.digital@antioquia.gov.co"
            )
        ]
        return entities
    
    async def select_sample(
        self,
        config: SampleConfig
    ) -> SampleResult:
        """
        Seleccionar muestra según configuración
        
        Args:
            config: Configuración de selección
        
        Returns:
            Resultado de la selección
        """
        # Filtrar entidades por tipo
        filtered_entities = [
            e for e in self.entities_db
            if e.entity_type in config.include_types
            and e.id not in config.exclude_entity_ids
        ]
        
        # Aplicar criterio de selección
        if config.selection_criteria == SelectionCriteria.RANDOM:
            selected = await self._random_selection(filtered_entities, config)
        elif config.selection_criteria == SelectionCriteria.STRATIFIED:
            selected = await self._stratified_selection(filtered_entities, config)
        elif config.selection_criteria == SelectionCriteria.SIZE_BASED:
            selected = await self._size_based_selection(filtered_entities, config)
        elif config.selection_criteria == SelectionCriteria.REGIONAL:
            selected = await self._regional_selection(filtered_entities, config)
        elif config.selection_criteria == SelectionCriteria.MATURITY_LEVEL:
            selected = await self._maturity_selection(filtered_entities, config)
        elif config.selection_criteria == SelectionCriteria.SERVICE_TYPE:
            selected = await self._service_type_selection(filtered_entities, config)
        else:
            selected = await self._random_selection(filtered_entities, config)
        
        # Calcular resumen de selección
        summary = self._calculate_selection_summary(selected, filtered_entities)
        
        # Calcular score de representatividad
        representativeness = self._calculate_representativeness(selected, filtered_entities)
        
        # Crear resultado
        result = SampleResult(
            sample_id=f"SAMPLE_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            config=config,
            selected_entities=selected,
            selection_summary=summary,
            representativeness_score=representativeness,
            created_at=datetime.now()
        )
        
        # Guardar en historial
        self.samples_history[result.sample_id] = result
        
        return result
    
    async def _random_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección aleatoria simple"""
        if config.random_seed:
            random.seed(config.random_seed)
        
        sample_size = min(config.total_sample_size, len(entities))
        return random.sample(entities, sample_size)
    
    async def _stratified_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección estratificada por campos especificados"""
        # Agrupar por campos de estratificación
        strata = {}
        for entity in entities:
            key_parts = []
            for field in config.stratification_fields:
                if field == "sector":
                    key_parts.append(entity.sector)
                elif field == "entity_type":
                    key_parts.append(entity.entity_type.value)
                elif field == "department":
                    key_parts.append(entity.department)
                elif field == "interoperability_level":
                    key_parts.append(entity.interoperability_level)
            
            key = tuple(key_parts)
            if key not in strata:
                strata[key] = []
            strata[key].append(entity)
        
        # Seleccionar de cada estrato
        selected = []
        entities_per_stratum = max(
            config.min_entities_per_stratum,
            min(config.max_entities_per_stratum, config.total_sample_size // len(strata))
        )
        
        for stratum_entities in strata.values():
            sample_size = min(entities_per_stratum, len(stratum_entities))
            if config.random_seed:
                random.seed(config.random_seed)
            selected.extend(random.sample(stratum_entities, sample_size))
        
        # Ajustar al tamaño total deseado
        if len(selected) > config.total_sample_size:
            if config.random_seed:
                random.seed(config.random_seed)
            selected = random.sample(selected, config.total_sample_size)
        
        return selected
    
    async def _size_based_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección basada en tamaño de entidad"""
        # Ordenar por población atendida
        sorted_entities = sorted(
            entities,
            key=lambda e: e.population_served,
            reverse=True
        )
        
        # Dividir en cuartiles y seleccionar proporcionalmente
        quartile_size = len(sorted_entities) // 4
        selected = []
        
        # 40% del sample del primer cuartil (entidades grandes)
        q1_sample = int(config.total_sample_size * 0.4)
        selected.extend(sorted_entities[:quartile_size][:q1_sample])
        
        # 30% del segundo cuartil
        q2_sample = int(config.total_sample_size * 0.3)
        selected.extend(sorted_entities[quartile_size:quartile_size*2][:q2_sample])
        
        # 20% del tercer cuartil
        q3_sample = int(config.total_sample_size * 0.2)
        selected.extend(sorted_entities[quartile_size*2:quartile_size*3][:q3_sample])
        
        # 10% del cuarto cuartil (entidades pequeñas)
        q4_sample = config.total_sample_size - len(selected)
        selected.extend(sorted_entities[quartile_size*3:][:q4_sample])
        
        return selected
    
    async def _regional_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección por región geográfica"""
        # Agrupar por departamento
        regions = {}
        for entity in entities:
            dept = entity.department
            if dept not in regions:
                regions[dept] = []
            regions[dept].append(entity)
        
        # Selección proporcional por región
        selected = []
        total_entities = len(entities)
        
        for region_entities in regions.values():
            proportion = len(region_entities) / total_entities
            sample_size = max(1, int(config.total_sample_size * proportion))
            sample_size = min(sample_size, len(region_entities))
            
            if config.random_seed:
                random.seed(config.random_seed)
            selected.extend(random.sample(region_entities, sample_size))
        
        return selected[:config.total_sample_size]
    
    async def _maturity_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección por nivel de madurez digital"""
        # Categorizar por nivel de madurez
        high_maturity = [e for e in entities if e.digital_maturity_score >= 80]
        medium_maturity = [e for e in entities if 50 <= e.digital_maturity_score < 80]
        low_maturity = [e for e in entities if e.digital_maturity_score < 50]
        
        # Distribución: 40% alta, 40% media, 20% baja madurez
        selected = []
        
        high_sample = min(int(config.total_sample_size * 0.4), len(high_maturity))
        medium_sample = min(int(config.total_sample_size * 0.4), len(medium_maturity))
        low_sample = min(config.total_sample_size - high_sample - medium_sample, len(low_maturity))
        
        if config.random_seed:
            random.seed(config.random_seed)
        
        selected.extend(random.sample(high_maturity, high_sample))
        selected.extend(random.sample(medium_maturity, medium_sample))
        selected.extend(random.sample(low_maturity, low_sample))
        
        return selected
    
    async def _service_type_selection(
        self,
        entities: List[Entity],
        config: SampleConfig
    ) -> List[Entity]:
        """Selección por tipo de servicios"""
        # Priorizar entidades con API y X-Road
        with_api = [e for e in entities if e.has_api]
        with_xroad = [e for e in entities if e.xroad_member]
        without_api = [e for e in entities if not e.has_api]
        
        selected = []
        
        # 50% con API
        api_sample = min(int(config.total_sample_size * 0.5), len(with_api))
        # 30% con X-Road
        xroad_sample = min(int(config.total_sample_size * 0.3), len(with_xroad))
        # 20% sin API
        no_api_sample = config.total_sample_size - api_sample - xroad_sample
        
        if config.random_seed:
            random.seed(config.random_seed)
        
        selected.extend(random.sample(with_api, api_sample))
        selected.extend(random.sample(with_xroad, xroad_sample))
        if no_api_sample > 0 and without_api:
            selected.extend(random.sample(without_api, min(no_api_sample, len(without_api))))
        
        return selected
    
    def _calculate_selection_summary(
        self,
        selected: List[Entity],
        all_entities: List[Entity]
    ) -> Dict:
        """Calcular resumen de la selección"""
        # Distribución por tipo
        type_distribution = {}
        for entity in selected:
            etype = entity.entity_type.value
            type_distribution[etype] = type_distribution.get(etype, 0) + 1
        
        # Distribución por sector
        sector_distribution = {}
        for entity in selected:
            sector = entity.sector
            sector_distribution[sector] = sector_distribution.get(sector, 0) + 1
        
        # Distribución por nivel de interoperabilidad
        interop_distribution = {}
        for entity in selected:
            level = entity.interoperability_level
            interop_distribution[level] = interop_distribution.get(level, 0) + 1
        
        # Estadísticas de madurez digital
        maturity_scores = [e.digital_maturity_score for e in selected]
        
        return {
            "total_selected": len(selected),
            "total_population": len(all_entities),
            "selection_rate": round(len(selected) / len(all_entities) * 100, 1),
            "type_distribution": type_distribution,
            "sector_distribution": sector_distribution,
            "interoperability_distribution": interop_distribution,
            "maturity_statistics": {
                "min": min(maturity_scores) if maturity_scores else 0,
                "max": max(maturity_scores) if maturity_scores else 0,
                "average": round(sum(maturity_scores) / len(maturity_scores), 1) if maturity_scores else 0
            },
            "entities_with_api": sum(1 for e in selected if e.has_api),
            "entities_with_xroad": sum(1 for e in selected if e.xroad_member)
        }
    
    def _calculate_representativeness(
        self,
        selected: List[Entity],
        all_entities: List[Entity]
    ) -> float:
        """Calcular score de representatividad (0-100)"""
        if not selected or not all_entities:
            return 0.0
        
        score = 0.0
        max_score = 100.0
        
        # 1. Representación por tipo de entidad (25 puntos)
        all_types = set(e.entity_type for e in all_entities)
        selected_types = set(e.entity_type for e in selected)
        type_coverage = len(selected_types) / len(all_types) if all_types else 0
        score += type_coverage * 25
        
        # 2. Representación por sector (25 puntos)
        all_sectors = set(e.sector for e in all_entities)
        selected_sectors = set(e.sector for e in selected)
        sector_coverage = len(selected_sectors) / len(all_sectors) if all_sectors else 0
        score += sector_coverage * 25
        
        # 3. Representación por región (25 puntos)
        all_regions = set(e.department for e in all_entities)
        selected_regions = set(e.department for e in selected)
        region_coverage = len(selected_regions) / len(all_regions) if all_regions else 0
        score += region_coverage * 25
        
        # 4. Distribución de madurez (25 puntos)
        all_avg_maturity = sum(e.digital_maturity_score for e in all_entities) / len(all_entities)
        selected_avg_maturity = sum(e.digital_maturity_score for e in selected) / len(selected)
        maturity_diff = abs(all_avg_maturity - selected_avg_maturity)
        maturity_score = max(0, 25 - maturity_diff)
        score += maturity_score
        
        return round(min(score, max_score), 1)
    
    async def get_sample(self, sample_id: str) -> Optional[SampleResult]:
        """Obtener una muestra por ID"""
        return self.samples_history.get(sample_id)
    
    async def list_samples(self) -> List[Dict]:
        """Listar todas las muestras generadas"""
        return [
            {
                "sample_id": result.sample_id,
                "total_selected": len(result.selected_entities),
                "selection_criteria": result.config.selection_criteria.value,
                "representativeness_score": result.representativeness_score,
                "created_at": result.created_at.isoformat()
            }
            for result in self.samples_history.values()
        ]
    
    async def get_available_entities(
        self,
        entity_type: Optional[str] = None,
        sector: Optional[str] = None,
        department: Optional[str] = None
    ) -> List[Dict]:
        """
        Obtener entidades disponibles con filtros
        
        Args:
            entity_type: Filtrar por tipo de entidad
            sector: Filtrar por sector
            department: Filtrar por departamento
        
        Returns:
            Lista de entidades filtradas
        """
        filtered = self.entities_db
        
        if entity_type:
            filtered = [e for e in filtered if e.entity_type.value == entity_type]
        
        if sector:
            filtered = [e for e in filtered if e.sector.lower() == sector.lower()]
        
        if department:
            filtered = [e for e in filtered if e.department.lower() == department.lower()]
        
        return [
            {
                "id": e.id,
                "name": e.name,
                "code": e.code,
                "entity_type": e.entity_type.value,
                "sector": e.sector,
                "department": e.department,
                "digital_maturity_score": e.digital_maturity_score,
                "services_count": e.services_count,
                "interoperability_level": e.interoperability_level,
                "has_api": e.has_api,
                "xroad_member": e.xroad_member
            }
            for e in filtered
        ]


# Instancia global del selector
sample_selector = SampleSelector()


async def select_sample(
    sample_size: int,
    selection_criteria: str = "random",
    stratification_fields: List[str] = None,
    include_types: List[str] = None,
    random_seed: Optional[int] = None
) -> Dict:
    """
    Función de conveniencia para seleccionar muestra
    
    Args:
        sample_size: Tamaño de la muestra
        selection_criteria: Criterio de selección
        stratification_fields: Campos para estratificación
        include_types: Tipos de entidad a incluir
        random_seed: Semilla aleatoria
    
    Returns:
        Resultado de la selección en formato dict
    """
    # Convertir strings a enums
    criteria = SelectionCriteria(selection_criteria)
    
    entity_types = [EntityType(t) for t in (include_types or ["national", "departmental", "municipal"])]
    
    config = SampleConfig(
        total_sample_size=sample_size,
        selection_criteria=criteria,
        stratification_fields=stratification_fields or ["sector"],
        min_entities_per_stratum=1,
        max_entities_per_stratum=sample_size,
        include_types=entity_types,
        exclude_entity_ids=[],
        random_seed=random_seed
    )
    
    result = await sample_selector.select_sample(config)
    
    return {
        "sample_id": result.sample_id,
        "selected_entities": [
            {
                "id": e.id,
                "name": e.name,
                "code": e.code,
                "entity_type": e.entity_type.value,
                "sector": e.sector,
                "department": e.department,
                "digital_maturity_score": e.digital_maturity_score,
                "services_count": e.services_count,
                "interoperability_level": e.interoperability_level,
                "has_api": e.has_api,
                "xroad_member": e.xroad_member
            }
            for e in result.selected_entities
        ],
        "selection_summary": result.selection_summary,
        "representativeness_score": result.representativeness_score,
        "created_at": result.created_at.isoformat()
    }


async def get_available_entities(
    entity_type: Optional[str] = None,
    sector: Optional[str] = None,
    department: Optional[str] = None
) -> List[Dict]:
    """
    Obtener entidades disponibles con filtros
    
    Args:
        entity_type: Filtrar por tipo de entidad
        sector: Filtrar por sector
        department: Filtrar por departamento
    
    Returns:
        Lista de entidades en formato dict
    """
    return await sample_selector.get_available_entities(
        entity_type=entity_type,
        sector=sector,
        department=department
    )


async def get_sample(sample_id: str) -> Optional[Dict]:
    """
    Obtener una muestra por ID
    
    Args:
        sample_id: ID de la muestra
    
    Returns:
        Muestra en formato dict o None
    """
    result = await sample_selector.get_sample(sample_id)
    if not result:
        return None
    
    return {
        "sample_id": result.sample_id,
        "config": {
            "total_sample_size": result.config.total_sample_size,
            "selection_criteria": result.config.selection_criteria.value,
            "stratification_fields": result.config.stratification_fields,
            "include_types": [t.value for t in result.config.include_types]
        },
        "selected_entities": [
            {
                "id": e.id,
                "name": e.name,
                "code": e.code,
                "entity_type": e.entity_type.value,
                "sector": e.sector,
                "department": e.department,
                "digital_maturity_score": e.digital_maturity_score,
                "services_count": e.services_count,
                "interoperability_level": e.interoperability_level,
                "has_api": e.has_api,
                "xroad_member": e.xroad_member
            }
            for e in result.selected_entities
        ],
        "selection_summary": result.selection_summary,
        "representativeness_score": result.representativeness_score,
        "created_at": result.created_at.isoformat()
    }


async def list_samples() -> List[Dict]:
    """
    Listar todas las muestras generadas
    
    Returns:
        Lista de muestras en formato dict
    """
    return await sample_selector.list_samples()