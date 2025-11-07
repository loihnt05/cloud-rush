from sqlalchemy.orm import Session
from app.repositories import booking_repository, flight_repository, flight_seat_repository, payment_repository, passenger_repository
from app.models.booking import Booking
from app.schemas.booking_schema import BookingCreate, BookingUpdate
from datetime import datetime
import random
import string


class BookingService:
    def __init__(self, db: Session):
        self.db = db
    
    def _generate_booking_reference(self) -> str:
        """Generate a unique booking reference (e.g., ABC123XYZ)"""
        while True:
            # Generate 3 uppercase letters + 3 digits + 3 uppercase letters
            letters1 = ''.join(random.choices(string.ascii_uppercase, k=3))
            digits = ''.join(random.choices(string.digits, k=3))
            letters2 = ''.join(random.choices(string.ascii_uppercase, k=3))
            reference = f"{letters1}{digits}{letters2}"
            
            # Check if reference already exists
            existing = self.db.query(Booking).filter(
                Booking.booking_reference == reference
            ).first()
            if not existing:
                return reference
    
    def get_all_bookings(self):
        """Get all bookings"""
        return booking_repository.get_all_bookings(self.db)
    
    def get_booking(self, booking_id: int):
        """Get a booking by ID"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        return booking
    
    def get_booking_by_reference(self, booking_reference: str):
        """Get a booking by reference number"""
        booking = self.db.query(Booking).filter(
            Booking.booking_reference == booking_reference
        ).first()
        if not booking:
            raise ValueError("Booking not found")
        return booking
    
    def create_booking(self, booking_data: BookingCreate):
        """Create a new booking (group-level, can have multiple passengers)"""
        # Generate unique booking reference
        booking_reference = self._generate_booking_reference()
        
        # Convert Pydantic model to dict and create booking
        booking_dict = booking_data.model_dump()
        booking_dict['booking_reference'] = booking_reference
        booking_dict['booking_date'] = datetime.now()
        booking_dict['total_amount'] = 0.0  # Will be calculated later when passengers are added
        
        booking = booking_repository.create_booking(self.db, booking_dict)
        
        return booking
    
    def calculate_and_update_total(self, booking_id: int):
        """Calculate total amount for a booking based on all passengers' seats"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        total_amount = 0.0
        
        # Get all passengers for this booking
        passengers = passenger_repository.get_passengers_by_booking(self.db, booking_id)
        
        for passenger in passengers:
            if passenger.flight_seat_id:
                flight_seat = flight_seat_repository.get_flight_seat_by_id(
                    self.db, 
                    passenger.flight_seat_id
                )
                if flight_seat:
                    flight = flight_repository.get_flight_by_id(self.db, flight_seat.flight_id)
                    if flight:
                        # Calculate price (base_price * price_multiplier + tax)
                        price = float(flight.base_price) * float(flight_seat.price_multiplier)
                        tax = price * float(flight.tax_rate)
                        total_amount += price + tax
        
        # Update booking total amount
        booking_repository.update_booking_status(self.db, booking_id, booking.status)
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        booking.total_amount = total_amount
        self.db.commit()
        self.db.refresh(booking)
        
        return booking
    
    def update_booking(self, booking_id: int, booking_data: BookingUpdate):
        """Update booking details"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        update_dict = booking_data.model_dump(exclude_unset=True)
        
        for key, value in update_dict.items():
            if hasattr(booking, key):
                setattr(booking, key, value)
        
        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def get_user_bookings(self, user_id: str):
        """Get all bookings for a specific user"""
        return booking_repository.get_user_bookings(self.db, user_id)
    
    def update_booking_status(self, booking_id: int, status: str):
        """Update booking status"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # If cancelling, free up all flight seats assigned to passengers
        if status == "cancelled":
            passengers = passenger_repository.get_passengers_by_booking(self.db, booking_id)
            for passenger in passengers:
                if passenger.flight_seat_id:
                    flight_seat_repository.update_flight_seat(
                        self.db,
                        passenger.flight_seat_id,
                        {"status": "available"}
                    )
        
        return booking_repository.update_booking_status(self.db, booking_id, status)
    
    def confirm_booking(self, booking_id: int):
        """Confirm a booking and create payment"""
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Calculate total amount
        self.calculate_and_update_total(booking_id)
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        
        # Create payment (pass as dictionary)
        payment_data = {
            "booking_id": booking.booking_id,
            "amount": booking.total_amount or 0,
            "payment_date": datetime.now(),
            "method": "credit_card",
            "status": "success"
        }
        payment_repository.create_payment(self.db, payment_data)
        
        # Update booking status to confirmed
        booking_repository.update_booking_status(self.db, booking.booking_id, "confirmed")
        
        return booking_repository.get_booking_by_id(self.db, booking_id)
