from typing import List
from sqlalchemy.orm import Session
from app.models.airplane import Seat
from app.repositories import seat_repository
from app.schemas.seat_schema import SeatCreate

class SeatService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_seat(self, seat_id: int):
        """Get a seat by ID"""
        seat = seat_repository.get_seat_by_id(self.db, seat_id)
        if not seat:
            raise ValueError("Seat not found")
        return seat
    
    def get_all_seats(self):
        """Get all seats"""
        return seat_repository.get_all_seats(self.db)
    
    def get_seats_by_airplane(self, airplane_id: int):
        """Get all seats for a specific airplane"""
        return seat_repository.get_seats_by_airplane(self.db, airplane_id)
    
    def get_available_seats_by_airplane(self, airplane_id: int):
        """Get available seats for a specific airplane"""
        return seat_repository.get_available_seats_by_airplane(self.db, airplane_id)
    
    def get_seats_by_class(self, airplane_id: int, seat_class: str):
        """Get seats by class for a specific airplane"""
        return seat_repository.get_seats_by_class(self.db, airplane_id, seat_class)
    
    def create_seat(self, seat_data: SeatCreate):
        """Create a new seat"""
        # Convert Pydantic model to dict
        seat_dict = seat_data.model_dump()
        
        # Create Seat model instance
        seat = Seat(**seat_dict)
        
        return seat_repository.create_seat(self.db, seat)
    
    def update_seat(self, seat_id: int, seat_data: dict):
        """Update an existing seat"""
        existing_seat = seat_repository.get_seat_by_id(self.db, seat_id)
        if not existing_seat:
            raise ValueError("Seat not found")
        
        return seat_repository.update_seat(self.db, seat_id, seat_data)
    
    def delete_seat(self, seat_id: int):
        """Delete a seat"""
        existing_seat = seat_repository.get_seat_by_id(self.db, seat_id)
        if not existing_seat:
            raise ValueError("Seat not found")
        
        return seat_repository.delete_seat(self.db, seat_id)
    
    def update_seat_availability(self, seat_id: int, available: bool):
        """Update seat availability status"""
        seat = seat_repository.update_seat_availability(self.db, seat_id, available)
        if not seat:
            raise ValueError("Seat not found")
        return seat
