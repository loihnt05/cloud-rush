from typing import List
from sqlalchemy.orm import Session
from app.models.flight import Flight
from app.repositories import flight_repository
from app.schemas.flight_schema import FlightCreate

class FlightService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_flight(self, flight_id: int):
        """Get a flight by ID"""
        flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not flight:
            raise ValueError("Flight not found")
        return flight
    
    def get_all_flights(self):
        """Get all flights"""
        return flight_repository.get_all_flights(self.db)
    
    def create_flight(self, flight_data: FlightCreate):
        """Create a new flight"""
        # Convert Pydantic model to dict
        flight_dict = flight_data.model_dump()
        
        # Create Flight model instance
        flight = Flight(**flight_dict)
        
        return flight_repository.create_flight(self.db, flight)
    
    def update_flight(self, flight_id: int, flight_data: dict):
        """Update an existing flight"""
        existing_flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not existing_flight:
            raise ValueError("Flight not found")
        
        return flight_repository.update_flight(self.db, flight_id, flight_data)
    
    def delete_flight(self, flight_id: int):
        """Delete a flight"""
        existing_flight = flight_repository.get_flight_by_id(self.db, flight_id)
        if not existing_flight:
            raise ValueError("Flight not found")
        
        return flight_repository.delete_flight(self.db, flight_id)
    
    def search_flights(self, origin: str, destination: str) -> List[Flight]:
        """Search for flights between an origin and destination"""
        flights = self.db.query(Flight).filter(
            Flight.origin == origin,
            Flight.destination == destination
        ).all()
        return flights