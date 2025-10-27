from typing import List
from sqlalchemy.orm import Session
from app.models.airplane import Airplane
from app.repositories import airplane_repository
from app.schemas.airplane_schema import AirplaneCreate

class AirplaneService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_airplane(self, airplane_id: int):
        """Get an airplane by ID"""
        airplane = airplane_repository.get_airplane_by_id(self.db, airplane_id)
        if not airplane:
            raise ValueError("Airplane not found")
        return airplane
    
    def get_all_airplanes(self):
        """Get all airplanes"""
        return airplane_repository.get_all_airplanes(self.db)
    
    def create_airplane(self, airplane_data: AirplaneCreate):
        """Create a new airplane"""
        # Convert Pydantic model to dict
        airplane_dict = airplane_data.model_dump()
        
        # Create Airplane model instance
        airplane = Airplane(**airplane_dict)
        
        return airplane_repository.create_airplane(self.db, airplane)
    
    def update_airplane(self, airplane_id: int, airplane_data: dict):
        """Update an existing airplane"""
        existing_airplane = airplane_repository.get_airplane_by_id(self.db, airplane_id)
        if not existing_airplane:
            raise ValueError("Airplane not found")
        
        return airplane_repository.update_airplane(self.db, airplane_id, airplane_data)
    
    def delete_airplane(self, airplane_id: int):
        """Delete an airplane"""
        existing_airplane = airplane_repository.get_airplane_by_id(self.db, airplane_id)
        if not existing_airplane:
            raise ValueError("Airplane not found")
        
        return airplane_repository.delete_airplane(self.db, airplane_id)
