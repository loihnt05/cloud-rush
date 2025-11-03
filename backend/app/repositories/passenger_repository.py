from sqlalchemy.orm import Session, joinedload
from app.models.passenger import Passenger


def get_passenger_by_id(db: Session, passenger_id: int):
    """Get a passenger by ID with related data"""
    return db.query(Passenger)\
        .options(
            joinedload(Passenger.booking),
            joinedload(Passenger.flight_seat),
            joinedload(Passenger.emergency_contacts)
        )\
        .filter(Passenger.passenger_id == passenger_id)\
        .first()


def get_all_passengers(db: Session, skip: int = 0, limit: int = 100):
    """Get all passengers with pagination"""
    return db.query(Passenger)\
        .options(joinedload(Passenger.booking))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_passengers_by_booking(db: Session, booking_id: int):
    """Get all passengers for a specific booking"""
    return db.query(Passenger)\
        .options(
            joinedload(Passenger.flight_seat),
            joinedload(Passenger.emergency_contacts)
        )\
        .filter(Passenger.booking_id == booking_id)\
        .all()


def get_passengers_by_flight_seat(db: Session, flight_seat_id: int):
    """Get all passengers assigned to a specific flight seat"""
    return db.query(Passenger)\
        .options(joinedload(Passenger.booking))\
        .filter(Passenger.flight_seat_id == flight_seat_id)\
        .all()


def get_passengers_by_type(db: Session, booking_id: int, passenger_type: str):
    """Get passengers filtered by type (adult, child, infant)"""
    return db.query(Passenger)\
        .filter(
            Passenger.booking_id == booking_id,
            Passenger.passenger_type == passenger_type
        )\
        .all()


def create_passenger(db: Session, passenger_data: dict):
    """Create a new passenger"""
    passenger = Passenger(**passenger_data)
    db.add(passenger)
    db.commit()
    db.refresh(passenger)
    return passenger


def create_passengers_bulk(db: Session, passengers_data: list[dict]):
    """Create multiple passengers at once"""
    passengers = [Passenger(**data) for data in passengers_data]
    db.add_all(passengers)
    db.commit()
    for passenger in passengers:
        db.refresh(passenger)
    return passengers


def update_passenger(db: Session, passenger_id: int, passenger_data: dict):
    """Update a passenger"""
    passenger = get_passenger_by_id(db, passenger_id)
    if not passenger:
        return None
    
    for key, value in passenger_data.items():
        if value is not None and hasattr(passenger, key):
            setattr(passenger, key, value)
    
    db.commit()
    db.refresh(passenger)
    return passenger


def assign_seat_to_passenger(db: Session, passenger_id: int, flight_seat_id: int):
    """Assign a flight seat to a passenger"""
    return update_passenger(db, passenger_id, {"flight_seat_id": flight_seat_id})


def delete_passenger(db: Session, passenger_id: int):
    """Delete a passenger"""
    passenger = get_passenger_by_id(db, passenger_id)
    if not passenger:
        return False
    db.delete(passenger)
    db.commit()
    return True


def delete_passengers_by_booking(db: Session, booking_id: int):
    """Delete all passengers for a specific booking"""
    count = db.query(Passenger).filter(Passenger.booking_id == booking_id).delete()
    db.commit()
    return count
