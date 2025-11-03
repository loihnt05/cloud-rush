from sqlalchemy.orm import Session
from app.models.airport import Airport
from app.repositories import aiport_repository
from app.schemas.airport_schema import AirportCreate, AirportUpdate


class AirportService:
    def __init__(self, db: Session):
        self.db = db

    def get_airport(self, airport_id: int):
        """Get an airport by ID"""
        airport = aiport_repository.get_airport_by_id(self.db, airport_id)
        if not airport:
            raise ValueError("Airport not found")
        return airport

    def get_airport_by_iata(self, iata_code: str):
        """Get an airport by IATA code"""
        if len(iata_code) != 3:
            raise ValueError("IATA code must be exactly 3 characters")
        
        airport = aiport_repository.get_airport_by_iata_code(self.db, iata_code)
        if not airport:
            raise ValueError(f"Airport with IATA code '{iata_code.upper()}' not found")
        return airport

    def get_all_airports(self, skip: int = 0, limit: int = 100):
        """Get all airports"""
        return aiport_repository.get_all_airports(self.db, skip, limit)

    def get_airports_by_city(self, city: str):
        """Get airports filtered by city"""
        return aiport_repository.get_airports_by_city(self.db, city)

    def get_airports_by_country(self, country: str):
        """Get airports filtered by country"""
        return aiport_repository.get_airports_by_country(self.db, country)

    def create_airport(self, airport_data: AirportCreate):
        """Create a new airport"""
        # Check if IATA code already exists
        existing = aiport_repository.get_airport_by_iata_code(self.db, airport_data.iata_code)
        if existing:
            raise ValueError(f"Airport with IATA code '{airport_data.iata_code.upper()}' already exists")
        
        # Convert IATA code to uppercase
        airport_dict = airport_data.model_dump()
        airport_dict['iata_code'] = airport_dict['iata_code'].upper()
        
        airport = Airport(**airport_dict)
        return aiport_repository.create_airport(self.db, airport)

    def update_airport(self, airport_id: int, airport_data: AirportUpdate):
        """Update an existing airport"""
        existing_airport = aiport_repository.get_airport_by_id(self.db, airport_id)
        if not existing_airport:
            raise ValueError("Airport not found")
        
        update_dict = airport_data.model_dump(exclude_unset=True)
        
        # Check if updating IATA code and if it's already taken
        if 'iata_code' in update_dict:
            update_dict['iata_code'] = update_dict['iata_code'].upper()
            existing_iata = aiport_repository.get_airport_by_iata_code(self.db, update_dict['iata_code'])
            if existing_iata and existing_iata.airport_id != airport_id:
                raise ValueError(f"Airport with IATA code '{update_dict['iata_code']}' already exists")
        
        return aiport_repository.update_airport(self.db, airport_id, update_dict)

    def delete_airport(self, airport_id: int):
        """Delete an airport"""
        existing_airport = aiport_repository.get_airport_by_id(self.db, airport_id)
        if not existing_airport:
            raise ValueError("Airport not found")
        
        return aiport_repository.delete_airport(self.db, airport_id)
