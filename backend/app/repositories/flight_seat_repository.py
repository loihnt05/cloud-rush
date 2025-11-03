from sqlalchemy.orm import Session, joinedload
from app.models.flight import FlightSeat
from app.schemas.flight_seat_schema import FlightSeatCreate

# == seats
def get_flight_seat_by_id(db: Session, flight_seat_id: int):
    """Get a flight seat by ID with related data"""
    return db.query(FlightSeat)\
        .options(joinedload(FlightSeat.flight), joinedload(FlightSeat.seat))\
        .filter(FlightSeat.flight_seat_id == flight_seat_id)\
        .first()


def get_all_flight_seats(db: Session, skip: int = 0, limit: int = 100):
    """Get all flight seats with pagination"""
    return db.query(FlightSeat)\
        .options(joinedload(FlightSeat.flight), joinedload(FlightSeat.seat))\
        .offset(skip)\
        .limit(limit)\
        .all()


def get_flight_seats_by_flight(db: Session, flight_id: int):
    """Get all seats for a specific flight"""
    return db.query(FlightSeat)\
        .options(joinedload(FlightSeat.seat))\
        .filter(FlightSeat.flight_id == flight_id)\
        .all()


def get_available_flight_seats(db: Session, flight_id: int):
    """Get all available seats for a specific flight"""
    return db.query(FlightSeat)\
        .options(joinedload(FlightSeat.seat))\
        .filter(FlightSeat.flight_id == flight_id, FlightSeat.status == "available")\
        .all()


def get_flight_seats_by_status(db: Session, flight_id: int, status: str):
    """Get flight seats filtered by status"""
    return db.query(FlightSeat)\
        .options(joinedload(FlightSeat.seat))\
        .filter(FlightSeat.flight_id == flight_id, FlightSeat.status == status)\
        .all()


def get_flight_seats_by_class(db: Session, flight_id: int, seat_class: str):
    """Get flight seats filtered by seat class (economy, business, first)"""
    return db.query(FlightSeat)\
        .join(FlightSeat.seat)\
        .filter(FlightSeat.flight_id == flight_id)\
        .filter(FlightSeat.seat.has(seat_class=seat_class))\
        .all()

# === flight seat
def create_flight_seat(db: Session, flight_seat: FlightSeatCreate):
    """Create a new flight seat"""
    # Convert Pydantic schema to ORM model instance
    db_flight_seat = FlightSeat(**flight_seat.model_dump() if hasattr(flight_seat, 'model_dump') else flight_seat)
    db.add(db_flight_seat)
    db.commit()
    db.refresh(db_flight_seat)
    return db_flight_seat


def create_flight_seats_bulk(db: Session, flight_seats: list[FlightSeatCreate]):
    """Create multiple flight seats at once"""
    # Convert Pydantic schemas to ORM model instances
    db_flight_seats = [FlightSeat(**fs.model_dump() if hasattr(fs, 'model_dump') else fs) for fs in flight_seats]
    db.add_all(db_flight_seats)
    db.commit()
    for flight_seat in db_flight_seats:
        db.refresh(flight_seat)
    return db_flight_seats


def update_flight_seat(db: Session, flight_seat_id: int, flight_seat_data: dict):
    """Update a flight seat"""
    flight_seat = get_flight_seat_by_id(db, flight_seat_id)
    if not flight_seat:
        return None
    for key, value in flight_seat_data.items():
        if value is not None:
            setattr(flight_seat, key, value)
    db.commit()
    db.refresh(flight_seat)
    return flight_seat


def update_flight_seat_status(db: Session, flight_seat_id: int, status: str):
    """Update only the status of a flight seat"""
    return update_flight_seat(db, flight_seat_id, {"status": status})


def delete_flight_seat(db: Session, flight_seat_id: int):
    """Delete a flight seat"""
    flight_seat = get_flight_seat_by_id(db, flight_seat_id)
    if not flight_seat:
        return False
    db.delete(flight_seat)
    db.commit()
    return True


def delete_flight_seats_by_flight(db: Session, flight_id: int):
    """Delete all flight seats for a specific flight"""
    db.query(FlightSeat).filter(FlightSeat.flight_id == flight_id).delete()
    db.commit()
    return True
