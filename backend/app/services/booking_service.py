from sqlalchemy.orm import Session
from repositories import booking_repository, flight_repository, payment_repository
from models.booking import Booking, Payment
from datetime import datetime

def get_all_bookings(db: Session):
    return booking_repository.get_all_bookings(db)

def get_booking(db: Session, booking_id: int):
    booking = booking_repository.get_booking_by_id(db, booking_id)
    if not booking:
        raise ValueError("Booking not found")
    return booking

def create_booking(db: Session, user_id: str, flight_id: int):
    flight = flight_repository.get_flight_by_id(db, flight_id)
    if not flight:
        raise ValueError("Flight not found")

    booking = Booking(user_id=user_id, flight_id=flight_id, status="pending", booking_date=datetime.now())
    booking = booking_repository.create_booking(db, booking)

    # Auto payment mock
    payment = Payment(
        booking_id=booking.booking_id,
        amount=flight.price,
        payment_date=datetime.now(),
        method="credit_card",
        status="success"
    )
    payment_repository.create_payment(db, payment)

    booking_repository.update_booking_status(db, booking.booking_id, "confirmed")
    return booking
