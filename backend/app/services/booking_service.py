from sqlalchemy.orm import Session
from app.repositories import booking_repository, flight_repository, flight_seat_repository, payment_repository, seat_repository
from app.models.booking import Booking, Payment
from app.schemas.booking_schema import BookingCreate
from app.schemas.flight_seat_schema import FlightSeatCreate
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
        flight_seat = None
        total_amount = 0.0
        
        # Check if flight seat exists and is available (only if flight_seat_id is provided)
        if booking_data.flight_seat_id is not None:
            flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, booking_data.flight_seat_id)
            if not flight_seat:
                raise ValueError("Flight seat not existed")

        # Convert Pydantic model to dict and create booking
        booking_dict = booking_data.model_dump()
        booking_dict['booking_date'] = datetime.now()
        
        booking = booking_repository.create_booking(self.db, booking_dict)
        
        # Calculate price if there's a flight booking
        if flight_seat is not None:
            # Calculate price (base_price * price_multiplier + tax)
            flight = flight_repository.get_flight_by_id(self.db, flight_seat.flight_id)
            price = float(flight.base_price) * float(flight_seat.price_multiplier)
            tax = price * float(flight.tax_rate)
            total_amount = price + tax
            
            # Update flight seat status to reserved
            flight_seat_repository.update_flight_seat(self.db, booking_data.flight_seat_id, {"status": "reserved"})
        
        # Create payment for all bookings (with flight or services only)
        payment = Payment(
            booking_id=booking.booking_id,
            amount=total_amount,
            payment_date=datetime.now(),
            method="credit_card",
            # status="success"
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
        
        # If cancelling, free up the flight seat (only if flight_seat_id exists)
        if status == "cancelled" and booking.flight_seat_id is not None and booking.flight_seat:
            flight_seat_repository.update_flight_seat(
                self.db, 
                booking.flight_seat_id, 
                {"status": "available"}
            )
        
        return booking_repository.update_booking_status(self.db, booking_id, status)
