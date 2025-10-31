from sqlalchemy.orm import Session
from app.models.airport import Airport 

def create_airport(db: Session, airport: Airport):
    db.add(airport)
    db.commit()
    db.refresh(airport)
    return airport

def get_airport_by_id(db: Session, airport_id: int):
    return db.query(Airport).filter(Airport.airport_id == airport_id).first()

def get_all_airports(db: Session):
    return db.query(Airport).all()

def update_airport(db: Session, airport_id: int, airport_data: dict):
    airport = get_airport_by_id(db, airport_id)
    if not airport:
        return None
    for key, value in airport_data.items():
        setattr(airport, key, value)
    db.commit()
    db.refresh(airport)
    return airport

def delete_airport(db: Session, airport_id: int):
    airport = get_airport_by_id(db, airport_id)
    if not airport:
        return False
    db.delete(airport)
    db.commit()
    return True