"""
Script to seed the database with initial data for X-Road Interoperability Mapper
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models.sector import Sector
from app.models.entity import Entity
from app.models.service import Service
from app.models.maturity import MaturityAssessment


def seed_sectors():
    """Create initial sectors"""
    sectors = [
        {"name": "Salud", "code": "SALUD", "description": "Entidades del sector salud", "color": "#EF4444", "icon": "heart"},
        {"name": "Educación", "code": "EDUCACION", "description": "Entidades del sector educativo", "color": "#3B82F6", "icon": "book"},
        {"name": "Hacienda", "code": "HACIENDA", "description": "Entidades del sector hacendístico", "color": "#10B981", "icon": "dollar"},
        {"name": "Transporte", "code": "TRANSPORTE", "description": "Entidades del sector transporte", "color": "#F59E0B", "icon": "truck"},
        {"name": "Justicia", "code": "JUSTICIA", "description": "Entidades del sector justicia", "color": "#8B5CF6", "icon": "scale"},
        {"name": "Agricultura", "code": "AGRICULTURA", "description": "Entidades del sector agrícola", "color": "#22C55E", "icon": "leaf"},
        {"name": "MinTIC", "code": "MINTIC", "description": "Ministerio de Tecnologías de la Información", "color": "#06B6D4", "icon": "cpu"},
        {"name": "Interior", "code": "INTERIOR", "description": "Ministerio del Interior", "color": "#EC4899", "icon": "building"},
        {"name": "Trabajo", "code": "TRABAJO", "description": "Ministerio del Trabajo", "color": "#F97316", "icon": "briefcase"},
        {"name": "Ambiente", "code": "AMBIENTE", "description": "Ministerio de Ambiente", "color": "#84CC16", "icon": "tree"},
    ]
    
    db = SessionLocal()
    for sector_data in sectors:
        existing = db.query(Sector).filter(Sector.code == sector_data["code"]).first()
        if not existing:
            sector = Sector(**sector_data)
            db.add(sector)
    db.commit()
    print(f"✓ Seeded {len(sectors)} sectors")
    db.close()


def seed_entities():
    """Create sample entities"""
    db = SessionLocal()
    
    entities = [
        # Salud - Bogotá, Medellín, Cali
        {"name": "Ministerio de Salud y Protección Social", "acronym": "MinSalud", "nit": "8999990001", "sector_id": 1, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.7110, "longitude": -74.0721},
        {"name": "EPS Sura", "acronym": "SURA", "nit": "8001979370", "sector_id": 1, "department": "Antioquia", "xroad_status": "connected", "latitude": 6.2442, "longitude": -75.5812},
        {"name": "ISS", "acronym": "ISS", "nit": "8999990002", "sector_id": 1, "department": "Bogotá D.C.", "xroad_status": "pending", "latitude": 4.6097, "longitude": -74.0818},
        
        # Educación - Bogotá, Barranquilla
        {"name": "Ministerio de Educación Nacional", "acronym": "MEN", "nit": "8999990003", "sector_id": 2, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.5981, "longitude": -74.0758},
        {"name": "ICFES", "acronym": "ICFES", "nit": "8999990004", "sector_id": 2, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6533, "longitude": -74.0835},
        {"name": "SENA", "acronym": "SENA", "nit": "8999990005", "sector_id": 2, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6280, "longitude": -74.0960},
        
        # Hacienda - Bogotá, Cartagena
        {"name": "Dirección de Impuestos y Aduanas Nacionales", "acronym": "DIAN", "nit": "8999990006", "sector_id": 3, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6126, "longitude": -74.0705},
        {"name": "Ministerio de Hacienda", "acronym": "MinHacienda", "nit": "8999990007", "sector_id": 3, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.5977, "longitude": -74.0742},
        
        # Transporte - Bogotá, Bucaramanga
        {"name": "Ministerio de Transporte", "acronym": "MinTransporte", "nit": "8999990008", "sector_id": 4, "department": "Bogotá D.C.", "xroad_status": "pending", "latitude": 4.6486, "longitude": -74.0854},
        
        # Justicia - Bogotá, Pereira
        {"name": "Registraduría Nacional del Estado Civil", "acronym": "RNEC", "nit": "8999990009", "sector_id": 5, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6018, "longitude": -74.0770},
        {"name": "Policía Nacional", "acronym": "Policía", "nit": "8999990010", "sector_id": 5, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6584, "longitude": -74.0937},
        
        # MinTIC - Bogotá, Cúcuta
        {"name": "Agencia Nacional Digital", "acronym": "AND", "nit": "8999990011", "sector_id": 7, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6675, "longitude": -74.0503},
        
        # Entidades adicionales con estados variados
        {"name": "Superintendencia de Salud", "acronym": "Supersalud", "nit": "8999990012", "sector_id": 1, "department": "Valle del Cauca", "xroad_status": "not_connected", "latitude": 3.4516, "longitude": -76.5320},
        {"name": "Universidad Nacional", "acronym": "UNAL", "nit": "8999990013", "sector_id": 2, "department": "Bogotá D.C.", "xroad_status": "connected", "latitude": 4.6382, "longitude": -74.0845},
        {"name": "Superintendencia Financiera", "acronym": "SFC", "nit": "8999990014", "sector_id": 3, "department": "Bogotá D.C.", "xroad_status": "pending", "latitude": 4.6156, "longitude": -74.0682},
    ]
    
    for entity_data in entities:
        existing = db.query(Entity).filter(Entity.nit == entity_data["nit"]).first()
        if not existing:
            entity = Entity(**entity_data)
            db.add(entity)
    db.commit()
    print(f"✓ Seeded {len(entities)} entities")
    db.close()


def seed_services():
    """Create sample services"""
    db = SessionLocal()
    
    # Get entity IDs by NIT
    dian = db.query(Entity).filter(Entity.nit == "8999990006").first()
    rnec = db.query(Entity).filter(Entity.nit == "8999990009").first()
    minsalud = db.query(Entity).filter(Entity.nit == "8999990001").first()
    men = db.query(Entity).filter(Entity.nit == "8999990003").first()
    and_entity = db.query(Entity).filter(Entity.nit == "8999990011").first()
    
    services = []
    
    if dian:
        services.extend([
            {"entity_id": dian.id, "name": "Consulta RUT", "code": "DIAN-RUT", "description": "Consulta del Registro Único Tributario", "protocol": "X-Road", "category": "Consulta"},
            {"entity_id": dian.id, "name": "Validación NIT", "code": "DIAN-NIT", "description": "Validación de Número de Identificación Tributaria", "protocol": "REST", "category": "Validación"},
        ])
    
    if rnec:
        services.extend([
            {"entity_id": rnec.id, "name": "Consulta Cédula", "code": "RNEC-CC", "description": "Consulta de información de cédula de ciudadanía", "protocol": "X-Road", "category": "Consulta"},
            {"entity_id": rnec.id, "name": "Validación Civil", "code": "RNEC-CIVIL", "description": "Validación de estado civil", "protocol": "X-Road", "category": "Validación"},
        ])
    
    if minsalud:
        services.extend([
            {"entity_id": minsalud.id, "name": "Consulta Afiliación EPS", "code": "SALUD-EPS", "description": "Consulta de afiliación a EPS", "protocol": "REST", "category": "Consulta"},
            {"entity_id": minsalud.id, "name": "Validación RIPS", "code": "SALUD-RIPS", "description": "Validación de registros individuales de prestación de servicios", "protocol": "SOAP", "category": "Validación"},
        ])
    
    if men:
        services.append(
            {"entity_id": men.id, "name": "Consulta SNIES", "code": "MEN-SNIES", "description": "Consulta del Sistema Nacional de Información de la Educación Superior", "protocol": "REST", "category": "Consulta"}
        )
    
    if and_entity:
        services.append(
            {"entity_id": and_entity.id, "name": "Autenticación Ciudadana", "code": "AND-AUTH", "description": "Servicio de autenticación ciudadana", "protocol": "X-Road", "category": "Autenticación"}
        )
    
    for service_data in services:
        existing = db.query(Service).filter(Service.code == service_data["code"]).first()
        if not existing:
            service = Service(**service_data)
            db.add(service)
    db.commit()
    print(f"✓ Seeded {len(services)} services")
    db.close()


def seed_maturity_assessments():
    """Create sample maturity assessments"""
    db = SessionLocal()
    
    # Get all active entities
    entities = db.query(Entity).filter(Entity.is_active == True).all()
    
    assessments = []
    
    # Define assessment scenarios with variety
    scenarios = [
        # Level 4 - Advanced (3 entities)
        {"overall_level": 4, "overall_score": 92.5, "legal_domain_score": 95, "organizational_domain_score": 90, "semantic_domain_score": 88, "technical_domain_score": 97, "has_api_documentation": 4, "uses_standard_protocols": 4, "has_data_quality": 4, "has_security_standards": 4, "has_interoperability_policy": 4, "has_trained_personnel": 4},
        {"overall_level": 4, "overall_score": 88.0, "legal_domain_score": 90, "organizational_domain_score": 85, "semantic_domain_score": 82, "technical_domain_score": 95, "has_api_documentation": 4, "uses_standard_protocols": 4, "has_data_quality": 4, "has_security_standards": 4, "has_interoperability_policy": 3, "has_trained_personnel": 4},
        {"overall_level": 4, "overall_score": 85.0, "legal_domain_score": 88, "organizational_domain_score": 82, "semantic_domain_score": 80, "technical_domain_score": 90, "has_api_documentation": 4, "uses_standard_protocols": 4, "has_data_quality": 3, "has_security_standards": 4, "has_interoperability_policy": 4, "has_trained_personnel": 3},
        
        # Level 3 - Intermediate (5 entities)
        {"overall_level": 3, "overall_score": 72.0, "legal_domain_score": 75, "organizational_domain_score": 70, "semantic_domain_score": 65, "technical_domain_score": 78, "has_api_documentation": 3, "uses_standard_protocols": 3, "has_data_quality": 3, "has_security_standards": 3, "has_interoperability_policy": 2, "has_trained_personnel": 3},
        {"overall_level": 3, "overall_score": 68.5, "legal_domain_score": 70, "organizational_domain_score": 65, "semantic_domain_score": 60, "technical_domain_score": 75, "has_api_documentation": 3, "uses_standard_protocols": 3, "has_data_quality": 3, "has_security_standards": 3, "has_interoperability_policy": 2, "has_trained_personnel": 2},
        {"overall_level": 3, "overall_score": 65.0, "legal_domain_score": 68, "organizational_domain_score": 62, "semantic_domain_score": 58, "technical_domain_score": 72, "has_api_documentation": 3, "uses_standard_protocols": 3, "has_data_quality": 2, "has_security_standards": 3, "has_interoperability_policy": 2, "has_trained_personnel": 2},
        {"overall_level": 3, "overall_score": 60.0, "legal_domain_score": 65, "organizational_domain_score": 58, "semantic_domain_score": 52, "technical_domain_score": 68, "has_api_documentation": 2, "uses_standard_protocols": 3, "has_data_quality": 2, "has_security_standards": 3, "has_interoperability_policy": 2, "has_trained_personnel": 2},
        {"overall_level": 3, "overall_score": 55.0, "legal_domain_score": 60, "organizational_domain_score": 52, "semantic_domain_score": 48, "technical_domain_score": 62, "has_api_documentation": 2, "uses_standard_protocols": 2, "has_data_quality": 2, "has_security_standards": 2, "has_interoperability_policy": 2, "has_trained_personnel": 2},
        
        # Level 2 - Basic (4 entities)
        {"overall_level": 2, "overall_score": 45.0, "legal_domain_score": 50, "organizational_domain_score": 40, "semantic_domain_score": 35, "technical_domain_score": 55, "has_api_documentation": 2, "uses_standard_protocols": 2, "has_data_quality": 2, "has_security_standards": 2, "has_interoperability_policy": 1, "has_trained_personnel": 2},
        {"overall_level": 2, "overall_score": 40.0, "legal_domain_score": 45, "organizational_domain_score": 38, "semantic_domain_score": 32, "technical_domain_score": 48, "has_api_documentation": 2, "uses_standard_protocols": 2, "has_data_quality": 1, "has_security_standards": 2, "has_interoperability_policy": 1, "has_trained_personnel": 1},
        {"overall_level": 2, "overall_score": 35.0, "legal_domain_score": 40, "organizational_domain_score": 32, "semantic_domain_score": 28, "technical_domain_score": 42, "has_api_documentation": 1, "uses_standard_protocols": 2, "has_data_quality": 1, "has_security_standards": 2, "has_interoperability_policy": 1, "has_trained_personnel": 1},
        {"overall_level": 2, "overall_score": 30.0, "legal_domain_score": 35, "organizational_domain_score": 28, "semantic_domain_score": 22, "technical_domain_score": 38, "has_api_documentation": 1, "uses_standard_protocols": 1, "has_data_quality": 1, "has_security_standards": 1, "has_interoperability_policy": 1, "has_trained_personnel": 1},
        
        # Level 1 - Initial (3 entities)
        {"overall_level": 1, "overall_score": 20.0, "legal_domain_score": 25, "organizational_domain_score": 18, "semantic_domain_score": 15, "technical_domain_score": 22, "has_api_documentation": 1, "uses_standard_protocols": 1, "has_data_quality": 0, "has_security_standards": 1, "has_interoperability_policy": 0, "has_trained_personnel": 1},
        {"overall_level": 1, "overall_score": 15.0, "legal_domain_score": 18, "organizational_domain_score": 12, "semantic_domain_score": 10, "technical_domain_score": 18, "has_api_documentation": 0, "uses_standard_protocols": 1, "has_data_quality": 0, "has_security_standards": 1, "has_interoperability_policy": 0, "has_trained_personnel": 0},
        {"overall_level": 1, "overall_score": 10.0, "legal_domain_score": 12, "organizational_domain_score": 8, "semantic_domain_score": 5, "technical_domain_score": 15, "has_api_documentation": 0, "uses_standard_protocols": 0, "has_data_quality": 0, "has_security_standards": 0, "has_interoperability_policy": 0, "has_trained_personnel": 0},
    ]
    
    # Assign assessments to entities
    for i, entity in enumerate(entities):
        # Use modulo to cycle through scenarios
        scenario = scenarios[i % len(scenarios)]
        
        existing = db.query(MaturityAssessment).filter(
            MaturityAssessment.entity_id == entity.id
        ).first()
        
        if not existing:
            assessment_data = {
                "entity_id": entity.id,
                "assessor_name": "Sistema",
                "assessor_notes": f"Evaluación inicial de {entity.name}",
                **scenario
            }
            assessment = MaturityAssessment(**assessment_data)
            db.add(assessment)
            assessments.append(assessment_data)
    
    db.commit()
    print(f"✓ Seeded {len(assessments)} maturity assessments")
    db.close()


def main():
    """Run all seed functions"""
    print("🌱 Starting database seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")
    
    # Seed data
    seed_sectors()
    seed_entities()
    seed_services()
    seed_maturity_assessments()
    
    print("\n✅ Database seeding completed successfully!")


if __name__ == "__main__":
    main()