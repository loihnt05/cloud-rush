from sqlalchemy.orm import Session

from app.models.booking import Booking

def get_booking_by_id(db: Session, booking_id: int):
    return db.query(Booking).filter(Booking.booking_id == booking_id).first()
    
def get_all_bookings(db: Session):
    return db.query(Booking).all()
    
def create_booking(db: Session, booking_data):
    booking = Booking(**booking_data)
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking
    
def update_booking_status(db: Session, booking_id: int, status: str):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        return None
    booking.status = status
    db.commit()
    db.refresh(booking)
    return booking
    
def get_user_bookings(db: Session, user_id: str):
    return db.query(Booking).filter(Booking.user_id == user_id).all()

def delete_booking(db: Session, booking_id: int):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        return None
    db.delete(booking)
    db.commit()
    return booking