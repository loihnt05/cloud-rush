from sqlalchemy.orm import Session
from app.repositories import booking_repository, flight_repository, payment_repository
from app.models.booking import Booking, Payment
from app.schemas.booking_schema import BookingCreate
from datetime import datetime

class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_bookings(self):
        """Get all bookings"""
        return booking_repository.get_all_bookings(self.db)
    
    def get_booking(self, booking_id: int):
        """Get a booking by ID"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        return booking
    
    def create_booking(self, booking_data: BookingCreate):
        """Create a new booking"""
        # Check if flight exists
        flight = flight_repository.get_flight_by_id(self.db, booking_data.flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        # Convert Pydantic model to dict and create booking
        booking_dict = booking_data.model_dump()
        booking_dict['booking_date'] = datetime.now()
        
        booking = booking_repository.create_booking(self.db, booking_dict)
        
        # Auto payment mock
        payment = Payment(
            booking_id=booking.booking_id,
            amount=flight.base_price,
            payment_date=datetime.now(),
            method="credit_card",
            status="success"
        )
        payment_repository.create_payment(self.db, payment)
        
        # Update booking status to confirmed
        booking_repository.update_booking_status(self.db, booking.booking_id, "confirmed")
        
        return booking
    
    def get_user_bookings(self, user_id: str):
        """Get all bookings for a specific user"""
        return booking_repository.get_user_bookings(self.db, user_id)
    
    def update_booking_status(self, booking_id: int, status: str):
        """Update booking status"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        return booking_repository.update_booking_status(self.db, booking_id, status)
