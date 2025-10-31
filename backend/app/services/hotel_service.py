from sqlalchemy.orm import Session
from app.models.hotel import Hotel
from app.repositories import hotel_repository
from app.schemas.hotel_schema import HotelCreate, HotelUpdate


class HotelService:
    def __init__(self, db: Session):
        self.db = db

    def get_hotel(self, hotel_id: int):
        """Get a hotel by ID"""
        hotel = hotel_repository.get_hotel_by_id(self.db, hotel_id)
        if not hotel:
            raise ValueError("Hotel not found")
        return hotel

    def get_all_hotels(self, skip: int = 0, limit: int = 100):
        """Get all hotels"""
        return hotel_repository.get_all_hotels(self.db, skip, limit)

    def get_hotels_by_stars(self, stars: int):
        """Get hotels filtered by star rating"""
        if stars < 1 or stars > 5:
            raise ValueError("Star rating must be between 1 and 5")
        return hotel_repository.get_hotels_by_stars(self.db, stars)

    def create_hotel(self, hotel_data: HotelCreate):
        """Create a new hotel"""
        hotel_dict = hotel_data.model_dump()
        hotel = Hotel(**hotel_dict)
        return hotel_repository.create_hotel(self.db, hotel)

    def update_hotel(self, hotel_id: int, hotel_data: HotelUpdate):
        """Update an existing hotel"""
        existing_hotel = hotel_repository.get_hotel_by_id(self.db, hotel_id)
        if not existing_hotel:
            raise ValueError("Hotel not found")
        
        update_dict = hotel_data.model_dump(exclude_unset=True)
        return hotel_repository.update_hotel(self.db, hotel_id, update_dict)

    def delete_hotel(self, hotel_id: int):
        """Delete a hotel"""
        existing_hotel = hotel_repository.get_hotel_by_id(self.db, hotel_id)
        if not existing_hotel:
            raise ValueError("Hotel not found")
        
        return hotel_repository.delete_hotel(self.db, hotel_id)
