import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.entity import Entity

def add_entities():
    db = SessionLocal()
    
    with open('entities_to_add.json', 'r', encoding='utf-8') as f:
        entities_data = json.load(f)
    
    added_count = 0
    for entity_data in entities_data:
        existing = db.query(Entity).filter(Entity.nit == entity_data["nit"]).first()
        if not existing:
            entity = Entity(**entity_data)
            db.add(entity)
            added_count += 1
            print(f"Added: {entity_data['name']} ({entity_data['acronym']})")
        else:
            print(f"Already exists: {entity_data['name']} ({entity_data['acronym']})")
    
    db.commit()
    db.close()
    print(f"\nTotal entities added: {added_count}")

if __name__ == "__main__":
    add_entities()
