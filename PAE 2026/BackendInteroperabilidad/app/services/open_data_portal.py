"""
Módulo de integración con el Portal de Datos Abiertos de Colombia (datos.gov.co)
Permite consultar datasets relacionados con interoperabilidad gubernamental
"""

import httpx
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class Dataset:
    """Modelo de datos para un dataset del portal"""
    id: str
    title: str
    description: str
    organization: str
    sector: str
    format: List[str]
    url: str
    last_updated: datetime
    downloads: int
    tags: List[str]


class OpenDataPortalClient:
    """Cliente para interactuar con datos.gov.co"""
    
    BASE_URL = "https://www.datos.gov.co/api/views"
    SEARCH_URL = "https://www.datos.gov.co/api/catalog/v1"
    
    # Sectores de interés para interoperabilidad
    SECTORS_KEYWORDS = {
        "salud": ["salud", "hospital", "eps", "ips", "medicamento"],
        "educacion": ["educacion", "universidad", "colegio", "icfes", "men"],
        "hacienda": ["hacienda", "presupuesto", "tributaria", "dian", "impuestos"],
        "transporte": ["transporte", "movilidad", "transito", "runt"],
        "justicia": ["justicia", "procuraduria", "contraloria", "fiscalia"],
        "interior": ["interior", "gobernacion", "alcaldia", "municipio"],
        "planeacion": ["planeacion", " dane", "estadistica", "censo"],
        "tic": ["tic", "digital", "tecnologia", "ministerio"]
    }
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Cerrar cliente HTTP"""
        await self.client.aclose()
    
    async def search_datasets(
        self, 
        query: str = "interoperabilidad",
        limit: int = 100,
        offset: int = 0
    ) -> List[Dataset]:
        """
        Buscar datasets en el Portal de Datos Abiertos
        
        Args:
            query: Término de búsqueda
            limit: Número máximo de resultados
            offset: Offset para paginación
        
        Returns:
            Lista de datasets encontrados
        """
        try:
            params = {
                "q": query,
                "limit": limit,
                "offset": offset,
                "sortBy": "createdAt",
                "sortDirection": "desc"
            }
            
            response = await self.client.get(
                f"{self.SEARCH_URL}/search",
                params=params
            )
            response.raise_for_status()
            
            data = response.json()
            datasets = []
            
            for item in data.get("results", []):
                resource = item.get("resource", {})
                dataset = Dataset(
                    id=resource.get("id", ""),
                    title=resource.get("name", ""),
                    description=resource.get("description", ""),
                    organization=item.get("organization", {}).get("name", ""),
                    sector=self._classify_sector(resource.get("name", "") + " " + resource.get("description", "")),
                    format=[r.get("format", "") for r in resource.get("available_formats", [])],
                    url=resource.get("permalink", ""),
                    last_updated=datetime.fromisoformat(resource.get("updatedAt", datetime.now().isoformat())),
                    downloads=resource.get("downloads_count", 0),
                    tags=resource.get("tags", [])
                )
                datasets.append(dataset)
            
            return datasets
            
        except Exception as e:
            print(f"Error buscando datasets: {e}")
            return []
    
    async def get_interoperability_datasets(self) -> List[Dataset]:
        """
        Obtener datasets relacionados con interoperabilidad
        
        Returns:
            Lista de datasets de interoperabilidad
        """
        keywords = [
            "interoperabilidad",
            "servicios ciudadanos digitales",
            "x-road",
            "api gobierno",
            "datos abiertos",
            "servicios web",
            "consulta de datos"
        ]
        
        all_datasets = []
        for keyword in keywords:
            datasets = await self.search_datasets(keyword, limit=50)
            all_datasets.extend(datasets)
        
        # Eliminar duplicados por ID
        unique_datasets = {d.id: d for d in all_datasets}
        return list(unique_datasets.values())
    
    async def get_datasets_by_sector(self, sector: str) -> List[Dataset]:
        """
        Obtener datasets filtrados por sector
        
        Args:
            sector: Nombre del sector (salud, educacion, etc.)
        
        Returns:
            Lista de datasets del sector
        """
        keywords = self.SECTORS_KEYWORDS.get(sector.lower(), [sector])
        
        all_datasets = []
        for keyword in keywords:
            datasets = await self.search_datasets(keyword, limit=30)
            all_datasets.extend(datasets)
        
        # Eliminar duplicados
        unique_datasets = {d.id: d for d in all_datasets}
        return list(unique_datasets.values())
    
    async def get_dataset_metadata(self, dataset_id: str) -> Optional[Dict]:
        """
        Obtener metadatos detallados de un dataset
        
        Args:
            dataset_id: ID del dataset
        
        Returns:
            Metadatos del dataset o None si no existe
        """
        try:
            response = await self.client.get(f"{self.BASE_URL}/{dataset_id}.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error obteniendo metadatos del dataset {dataset_id}: {e}")
            return None
    
    async def get_statistics(self) -> Dict:
        """
        Obtener estadísticas del Portal de Datos Abiertos
        
        Returns:
            Diccionario con estadísticas
        """
        try:
            # Obtener datasets de interoperabilidad
            interop_datasets = await self.get_interoperability_datasets()
            
            # Contar por sector
            sector_count = {}
            for dataset in interop_datasets:
                sector = dataset.sector
                sector_count[sector] = sector_count.get(sector, 0) + 1
            
            # Formatos más comunes
            format_count = {}
            for dataset in interop_datasets:
                for fmt in dataset.format:
                    format_count[fmt] = format_count.get(fmt, 0) + 1
            
            return {
                "total_datasets": len(interop_datasets),
                "datasets_by_sector": sector_count,
                "datasets_by_format": format_count,
                "top_organizations": self._get_top_organizations(interop_datasets),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error obteniendo estadísticas: {e}")
            return {}
    
    def _classify_sector(self, text: str) -> str:
        """
        Clasificar un dataset por sector basado en palabras clave
        
        Args:
            text: Texto a clasificar (título + descripción)
        
        Returns:
            Nombre del sector
        """
        text_lower = text.lower()
        
        for sector, keywords in self.SECTORS_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return sector.capitalize()
        
        return "Otros"
    
    def _get_top_organizations(self, datasets: List[Dataset], limit: int = 10) -> List[Dict]:
        """
        Obtener las organizaciones con más datasets
        
        Args:
            datasets: Lista de datasets
            limit: Número máximo de organizaciones
        
        Returns:
            Lista de organizaciones con conteo
        """
        org_count = {}
        for dataset in datasets:
            org = dataset.organization
            org_count[org] = org_count.get(org, 0) + 1
        
        # Ordenar por conteo descendente
        sorted_orgs = sorted(org_count.items(), key=lambda x: x[1], reverse=True)
        
        return [
            {"organization": org, "count": count}
            for org, count in sorted_orgs[:limit]
        ]
    
    async def sync_to_database(self, db_session) -> Dict:
        """
        Sincronizar datasets del portal a la base de datos local
        
        Args:
            db_session: Sesión de base de datos
        
        Returns:
            Resultado de la sincronización
        """
        from ..models.service import Service
        from ..models.entity import Entity
        
        try:
            datasets = await self.get_interoperability_datasets()
            
            created = 0
            updated = 0
            errors = 0
            
            for dataset in datasets:
                try:
                    # Buscar si ya existe
                    existing = db_session.query(Service).filter(
                        Service.code == dataset.id
                    ).first()
                    
                    if existing:
                        # Actualizar
                        existing.name = dataset.title
                        existing.description = dataset.description
                        existing.documentation_url = dataset.url
                        existing.updated_at = datetime.now()
                        updated += 1
                    else:
                        # Crear nuevo
                        service = Service(
                            entity_id=1,  # Entidad por defecto
                            name=dataset.title,
                            code=dataset.id,
                            description=dataset.description,
                            protocol="REST",  # Asumir REST
                            category=dataset.sector,
                            status="active",
                            version="1.0",
                            documentation_url=dataset.url,
                            created_at=datetime.now()
                        )
                        db_session.add(service)
                        created += 1
                    
                except Exception as e:
                    errors += 1
                    print(f"Error procesando dataset {dataset.id}: {e}")
            
            db_session.commit()
            
            return {
                "success": True,
                "created": created,
                "updated": updated,
                "errors": errors,
                "total_processed": len(datasets)
            }
            
        except Exception as e:
            db_session.rollback()
            return {
                "success": False,
                "error": str(e)
            }


# Instancia global del cliente
open_data_client = OpenDataPortalClient()


async def get_open_data_statistics() -> Dict:
    """
    Función helper para obtener estadísticas del portal
    
    Returns:
        Estadísticas del portal de datos abiertos
    """
    stats = await open_data_client.get_statistics()
    await open_data_client.close()
    return stats


async def search_interop_datasets(query: str = "interoperabilidad") -> List[Dict]:
    """
    Función helper para buscar datasets
    
    Args:
        query: Término de búsqueda
    
    Returns:
        Lista de datasets en formato dict
    """
    datasets = await open_data_client.search_datasets(query)
    await open_data_client.close()
    
    return [
        {
            "id": d.id,
            "title": d.title,
            "description": d.description,
            "organization": d.organization,
            "sector": d.sector,
            "format": d.format,
            "url": d.url,
            "downloads": d.downloads
        }
        for d in datasets
    ]