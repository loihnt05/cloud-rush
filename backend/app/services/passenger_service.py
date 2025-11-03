from sqlalchemy.orm import Session
from app.repositories import passenger_repository, flight_seat_repository
from app.schemas.passenger_schema import PassengerCreate, PassengerUpdate


class PassengerService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_passenger(self, passenger_id: int):
        """Get a passenger by ID"""
        passenger = passenger_repository.get_passenger_by_id(self.db, passenger_id)
        if not passenger:
            raise ValueError("Passenger not found")
        return passenger
    
    def get_all_passengers(self, skip: int = 0, limit: int = 100):
        """Get all passengers"""
        return passenger_repository.get_all_passengers(self.db, skip, limit)
    
    def get_passengers_by_booking(self, booking_id: int):
        """Get all passengers for a specific booking"""
        return passenger_repository.get_passengers_by_booking(self.db, booking_id)
    
    def get_passengers_by_type(self, booking_id: int, passenger_type: str):
        """Get passengers filtered by type"""
        return passenger_repository.get_passengers_by_type(self.db, booking_id, passenger_type)
    
    def create_passenger(self, passenger_data: PassengerCreate):
        """Create a new passenger"""
        # Validate flight seat if provided
        if passenger_data.flight_seat_id:
            flight_seat = flight_seat_repository.get_flight_seat_by_id(
                self.db, 
                passenger_data.flight_seat_id
            )
            if not flight_seat:
                raise ValueError("Flight seat not found")
            if flight_seat.status != "available":
                raise ValueError("Flight seat is not available")
        
        # Create passenger
        passenger_dict = passenger_data.model_dump()
        passenger = passenger_repository.create_passenger(self.db, passenger_dict)
        
        # Update flight seat status if seat was assigned
        if passenger_data.flight_seat_id:
            flight_seat_repository.update_flight_seat_status(
                self.db,
                passenger_data.flight_seat_id,
                "booked"
            )
        
        return passenger
    
    def create_passengers_bulk(self, passengers_data: list[PassengerCreate]):
        """Create multiple passengers at once"""
        passengers_dict = [p.model_dump() for p in passengers_data]
        return passenger_repository.create_passengers_bulk(self.db, passengers_dict)
    
    def update_passenger(self, passenger_id: int, passenger_data: PassengerUpdate):
        """Update a passenger"""
        passenger = passenger_repository.get_passenger_by_id(self.db, passenger_id)
        if not passenger:
            raise ValueError("Passenger not found")
        
        # Handle flight seat changes
        if passenger_data.flight_seat_id is not None:
            # Free up old seat if exists
            if passenger.flight_seat_id:
                flight_seat_repository.update_flight_seat_status(
                    self.db,
                    passenger.flight_seat_id,
                    "available"
                )
            
            # Validate and book new seat
            if passenger_data.flight_seat_id:
                flight_seat = flight_seat_repository.get_flight_seat_by_id(
                    self.db,
                    passenger_data.flight_seat_id
                )
                if not flight_seat:
                    raise ValueError("Flight seat not found")
                if flight_seat.status != "available":
                    raise ValueError("Flight seat is not available")
                
                flight_seat_repository.update_flight_seat_status(
                    self.db,
                    passenger_data.flight_seat_id,
                    "booked"
                )
        
        update_dict = passenger_data.model_dump(exclude_unset=True)
        return passenger_repository.update_passenger(self.db, passenger_id, update_dict)
    
    def assign_seat(self, passenger_id: int, flight_seat_id: int):
        """Assign a flight seat to a passenger"""
        passenger = passenger_repository.get_passenger_by_id(self.db, passenger_id)
        if not passenger:
            raise ValueError("Passenger not found")
        
        # Validate flight seat
        flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, flight_seat_id)
        if not flight_seat:
            raise ValueError("Flight seat not found")
        if flight_seat.status != "available":
            raise ValueError("Flight seat is not available")
        
        # Free up old seat if exists
        if passenger.flight_seat_id:
            flight_seat_repository.update_flight_seat_status(
                self.db,
                passenger.flight_seat_id,
                "available"
            )
        
        # Assign new seat
        passenger_repository.assign_seat_to_passenger(self.db, passenger_id, flight_seat_id)
        flight_seat_repository.update_flight_seat_status(self.db, flight_seat_id, "booked")
        
        return passenger_repository.get_passenger_by_id(self.db, passenger_id)
    
    def delete_passenger(self, passenger_id: int):
        """Delete a passenger"""
        passenger = passenger_repository.get_passenger_by_id(self.db, passenger_id)
        if not passenger:
            raise ValueError("Passenger not found")
        
        # Free up flight seat if assigned
        if passenger.flight_seat_id:
            flight_seat_repository.update_flight_seat_status(
                self.db,
                passenger.flight_seat_id,
                "available"
            )
        
        success = passenger_repository.delete_passenger(self.db, passenger_id)
        if not success:
            raise ValueError("Failed to delete passenger")
        return {"message": "Passenger deleted successfully"}
