import sys
import os
from sqlalchemy.orm import Session

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app.models.entity import Entity
from app.models.sector import Sector
from app.models.relationship import Relationship
from app.models.service import Service

def seed_relationships():
    # Create tables if they don't exist
    from app.models.entity import Entity
    from app.models.sector import Sector
    from app.models.relationship import Relationship
    from app.models.service import Service
    from app.database import Base
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Clear existing relationships
        db.query(Relationship).delete()
        
        entities = db.query(Entity).all()
        sectors = db.query(Sector).all()
        
        sector_map = {s.name: [] for s in sectors}
        for e in entities:
            if e.sector_id:
                s_name = db.query(Sector).filter(Sector.id == e.sector_id).first().name
                sector_map[s_name].append(e.id)
        
        relationships = []
        
        # 1. Intra-sector connections (High density)
        for s_name, e_ids in sector_map.items():
            if len(e_ids) > 1:
                # Connect first 3 entities in a circle
                for i in range(min(3, len(e_ids))):
                    source = e_ids[i]
                    target = e_ids[(i + 1) % len(e_ids)]
                    relationships.append(Relationship(
                        source_id=source,
                        target_id=target,
                        description=f"Intercambio sectorial {s_name}",
                        protocol="X-Road"
                    ))

        # 2. Key inter-sector connections (Strategic)
        # Hacienda -> All sectors (Presupuesto)
        hacienda_ids = sector_map.get("Hacienda y Crédito Público", [])
        if hacienda_ids:
            h_source = hacienda_ids[0]
            for s_name, e_ids in sector_map.items():
                if s_name != "Hacienda y Crédito Público" and e_ids:
                    relationships.append(Relationship(
                        source_id=h_source,
                        target_id=e_ids[0],
                        description="Reporte Financiero y Presupuestal",
                        protocol="REST"
                    ))

        # Salud -> Registraduría (Identificación)
        salud_ids = sector_map.get("Salud y Protección Social", [])
        interior_ids = sector_map.get("Interior", []) # Registraduria suele estar aqui o cerca
        if salud_ids and interior_ids:
            relationships.append(Relationship(
                source_id=salud_ids[0],
                target_id=interior_ids[0],
                description="Validación de Identidad Ciudadana",
                protocol="X-Road"
            ))

        # 3. Add to DB
        for r in relationships:
            db.add(r)
        
        db.commit()
        print(f"✅ Seeding complete: {len(relationships)} relationships created.")
        
    except Exception as e:
        print(f"❌ Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_relationships()
