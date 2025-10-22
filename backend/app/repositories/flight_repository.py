from app.schemas.flight_schema import Flight
from sqlalchemy.orm import Session

def get_flight_by_id(db: Session, flight_id: int):
    return db.query(Flight).filter(Flight.flight_id == flight_id).first()

def get_all_flights(db: Session):
    return db.query(Flight).all()
    
def create_flight(db: Session, flight_data: Flight):
    db.add(flight_data)
    db.commit()
    db.refresh(flight_data)
    return flight_data

def update_flight(db: Session, flight_id: int, flight_data: dict):
    flight = get_flight_by_id(db, flight_id)
    if not flight:
        return None
    for key, value in flight_data.items():
        setattr(flight, key, value)
    db.commit()
    db.refresh(flight)
    return flight
    
def delete_flight(db: Session, flight_id: int):
    flight = get_flight_by_id(db, flight_id)
    if not flight:
        return False
    db.delete(flight)
    db.commit()
    return True
