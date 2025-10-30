from app.models.flight import Flight
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

def get_flights_by_airport(db: Session, origin_id: int, destination_id: int):
    return db.query(Flight).filter(
        (Flight.origin_airport_id == origin_id) & 
        (Flight.destination_airport_id == destination_id)
    ).all()
    
def get_flights_by_status(db: Session, status: str):
    return db.query(Flight).filter(Flight.status == status).all()
