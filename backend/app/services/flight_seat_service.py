from sqlalchemy.orm import Session
from app.models.flight import FlightSeat
from app.repositories import flight_seat_repository, flight_repository, seat_repository
from app.schemas.flight_seat_schema import FlightSeatCreate, FlightSeatUpdate, FlightSeatBulkCreate


class FlightSeatService:
    def __init__(self, db: Session):
        self.db = db

    def get_flight_seat(self, flight_seat_id: int):
        """Get a flight seat by ID"""
        flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, flight_seat_id)
        if not flight_seat:
            raise ValueError("Flight seat not found")
        return flight_seat

    def get_all_flight_seats(self, skip: int = 0, limit: int = 100):
        """Get all flight seats"""
        return flight_seat_repository.get_all_flight_seats(self.db, skip, limit)

    def get_flight_seats_by_flight(self, flight_id: int):
        """Get all seats for a specific flight"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        return flight_seat_repository.get_flight_seats_by_flight(self.db, flight_id)

    def get_available_seats(self, flight_id: int):
        """Get all available seats for a specific flight"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        return flight_seat_repository.get_available_flight_seats(self.db, flight_id)

    def get_seats_by_status(self, flight_id: int, status: str):
        """Get flight seats filtered by status"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        valid_statuses = ["available", "reserved", "booked"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        return flight_seat_repository.get_flight_seats_by_status(self.db, flight_id, status)

    def get_seats_by_class(self, flight_id: int, seat_class: str):
        """Get flight seats filtered by seat class"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        valid_classes = ["economy", "business", "first"]
        if seat_class not in valid_classes:
            raise ValueError(f"Invalid seat class. Must be one of: {', '.join(valid_classes)}")
        
        return flight_seat_repository.get_flight_seats_by_class(self.db, flight_id, seat_class)

    def create_flight_seat(self, flight_seat_data: FlightSeatCreate):
        """Create a new flight seat"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, flight_seat_data.flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        # Verify seat exists
        seat = seat_repository.get_seat_by_id(self.db, flight_seat_data.seat_id)
        if not seat:
            raise ValueError("Seat not found")
        
        # Check if this flight-seat combination already exists
        existing = self.db.query(FlightSeat).filter(
            FlightSeat.flight_id == flight_seat_data.flight_id,
            FlightSeat.seat_id == flight_seat_data.seat_id
        ).first()
        if existing:
            raise ValueError("This seat is already assigned to this flight")
        
        flight_seat_dict = flight_seat_data.model_dump()
        flight_seat = FlightSeat(**flight_seat_dict)
        return flight_seat_repository.create_flight_seat(self.db, flight_seat)

    def create_flight_seats_bulk(self, bulk_data: FlightSeatBulkCreate):
        """Create multiple flight seats at once for a flight"""
        # Verify flight exists
        flight = flight_repository.get_flight_by_id(self.db, bulk_data.flight_id)
        if not flight:
            raise ValueError("Flight not found")
        
        flight_seats = []
        for seat_id in bulk_data.seat_ids:
            # Verify seat exists
            seat = seat_repository.get_seat_by_id(self.db, seat_id)
            if not seat:
                raise ValueError(f"Seat with ID {seat_id} not found")
            
            # Check if this flight-seat combination already exists
            existing = self.db.query(FlightSeat).filter(
                FlightSeat.flight_id == bulk_data.flight_id,
                FlightSeat.seat_id == seat_id
            ).first()
            if existing:
                raise ValueError(f"Seat {seat_id} is already assigned to this flight")
            
            flight_seat = FlightSeat(
                flight_id=bulk_data.flight_id,
                seat_id=seat_id,
                status="available",
                price_multiplier=bulk_data.price_multiplier
            )
            flight_seats.append(flight_seat)
        
        return flight_seat_repository.create_flight_seats_bulk(self.db, flight_seats)

    def update_flight_seat(self, flight_seat_id: int, flight_seat_data: FlightSeatUpdate):
        """Update a flight seat"""
        existing_flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, flight_seat_id)
        if not existing_flight_seat:
            raise ValueError("Flight seat not found")
        
        # Check if seat is already booked and trying to change status
        if existing_flight_seat.status == "booked" and flight_seat_data.status and flight_seat_data.status != "booked":
            # Check if there's an active booking
            if existing_flight_seat.booking and existing_flight_seat.booking.status in ["pending", "confirmed"]:
                raise ValueError("Cannot change status of a booked seat with active booking")
        
        update_dict = flight_seat_data.model_dump(exclude_unset=True)
        return flight_seat_repository.update_flight_seat(self.db, flight_seat_id, update_dict)

    def update_status(self, flight_seat_id: int, status: str):
        """Update only the status of a flight seat"""
        existing_flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, flight_seat_id)
        if not existing_flight_seat:
            raise ValueError("Flight seat not found")
        
        valid_statuses = ["available", "reserved", "booked"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        return flight_seat_repository.update_flight_seat_status(self.db, flight_seat_id, status)

    def delete_flight_seat(self, flight_seat_id: int):
        """Delete a flight seat"""
        existing_flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, flight_seat_id)
        if not existing_flight_seat:
            raise ValueError("Flight seat not found")
        
        # Check if seat has an active booking
        if existing_flight_seat.booking and existing_flight_seat.booking.status in ["pending", "confirmed"]:
            raise ValueError("Cannot delete a flight seat with an active booking")
        
        return flight_seat_repository.delete_flight_seat(self.db, flight_seat_id)
