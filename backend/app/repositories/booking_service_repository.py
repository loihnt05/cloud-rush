from sqlalchemy.orm import Session
from app.models.booking import BookingService


def get_booking_service_by_id(db: Session, booking_service_id: int):
    """Get a booking service by ID"""
    return db.query(BookingService).filter(BookingService.booking_service_id == booking_service_id).first()


def get_booking_services_by_booking(db: Session, booking_id: int):
    """Get all services for a specific booking"""
    return db.query(BookingService).filter(BookingService.booking_id == booking_id).all()

def get_all_booking_services(db: Session):
    """Get all booking services"""
    return db.query(BookingService).all()

def create_booking_service(db: Session, booking_service_data: BookingService):
    """Add a service to a booking"""
    db.add(booking_service_data)
    db.commit()
    db.refresh(booking_service_data)
    return booking_service_data


def update_booking_service(db: Session, booking_service_id: int, booking_service_data: dict):
    """Update a booking service"""
    booking_service = get_booking_service_by_id(db, booking_service_id)
    if not booking_service:
        return None
    for key, value in booking_service_data.items():
        if value is not None:
            setattr(booking_service, key, value)
    db.commit()
    db.refresh(booking_service)
    return booking_service


def delete_booking_service(db: Session, booking_service_id: int):
    """Remove a service from a booking"""
    booking_service = get_booking_service_by_id(db, booking_service_id)
    if not booking_service:
        return False
    db.delete(booking_service)
    db.commit()
    return True
