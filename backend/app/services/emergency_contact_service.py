from sqlalchemy.orm import Session
from app.repositories import emergency_contact_repository, passenger_repository
from app.schemas.emergency_contact_schema import EmergencyContactCreate, EmergencyContactUpdate


class EmergencyContactService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_emergency_contact(self, contact_id: int):
        """Get an emergency contact by ID"""
        contact = emergency_contact_repository.get_emergency_contact_by_id(self.db, contact_id)
        if not contact:
            raise ValueError("Emergency contact not found")
        return contact
    
    def get_all_emergency_contacts(self, skip: int = 0, limit: int = 100):
        """Get all emergency contacts"""
        return emergency_contact_repository.get_all_emergency_contacts(self.db, skip, limit)
    
    def get_emergency_contacts_by_passenger(self, passenger_id: int):
        """Get all emergency contacts for a specific passenger"""
        return emergency_contact_repository.get_emergency_contacts_by_passenger(self.db, passenger_id)
    
    def create_emergency_contact(self, contact_data: EmergencyContactCreate):
        """Create a new emergency contact"""
        # Validate passenger exists
        passenger = passenger_repository.get_passenger_by_id(self.db, contact_data.passenger_id)
        if not passenger:
            raise ValueError("Passenger not found")
        
        contact_dict = contact_data.model_dump()
        return emergency_contact_repository.create_emergency_contact(self.db, contact_dict)
    
    def create_emergency_contacts_bulk(self, contacts_data: list[EmergencyContactCreate]):
        """Create multiple emergency contacts at once"""
        contacts_dict = [c.model_dump() for c in contacts_data]
        return emergency_contact_repository.create_emergency_contacts_bulk(self.db, contacts_dict)
    
    def update_emergency_contact(self, contact_id: int, contact_data: EmergencyContactUpdate):
        """Update an emergency contact"""
        contact = emergency_contact_repository.get_emergency_contact_by_id(self.db, contact_id)
        if not contact:
            raise ValueError("Emergency contact not found")
        
        update_dict = contact_data.model_dump(exclude_unset=True)
        return emergency_contact_repository.update_emergency_contact(self.db, contact_id, update_dict)
    
    def delete_emergency_contact(self, contact_id: int):
        """Delete an emergency contact"""
        contact = emergency_contact_repository.get_emergency_contact_by_id(self.db, contact_id)
        if not contact:
            raise ValueError("Emergency contact not found")
        
        success = emergency_contact_repository.delete_emergency_contact(self.db, contact_id)
        if not success:
            raise ValueError("Failed to delete emergency contact")
        return {"message": "Emergency contact deleted successfully"}
