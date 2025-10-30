from sqlalchemy.orm import Session
from app.models.flight import FlightSeat

def create_flight_seat(db: Session, flight_seat: FlightSeat):
    db.add(flight_seat)
    db.commit()
    db.refresh(flight_seat)
    return flight_seat

def get_flight_seat_by_flight(db: Session, flight_id: int):
    return db.query(FlightSeat).filter(FlightSeat.flight_id == flight_id).all()

def get_flight_seat_by_id(db: Session, flight_seat_id: int):
    return db.query(FlightSeat).filter(FlightSeat.flight_seat_id == flight_seat_id).first()

def get_flight_seats_by_flight_status(db: Session, flight_id: int, status: str):
    return db.query(FlightSeat).filter(FlightSeat.flight_id == flight_id, FlightSeat.status == status).all()

def update_flight_seat(db: Session, flight_seat_id: int, flight_seat_data: dict):
    flight_seat = get_flight_seat_by_id(db, flight_seat_id)
    if not flight_seat:
        return None
    for key, value in flight_seat_data.items():
        setattr(flight_seat, key, value)
    db.commit()
    db.refresh(flight_seat)
    return flight_seat

def delete_flight_seat(db: Session, flight_seat_id: int):
    flight_seat = get_flight_seat_by_id(db, flight_seat_id)
    if not flight_seat:
        return False
    db.delete(flight_seat)
    db.commit()
    return True


