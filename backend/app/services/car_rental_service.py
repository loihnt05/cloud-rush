from sqlalchemy.orm import Session
from app.models.car_rental import CarRental
from app.repositories import car_rental_repository
from app.schemas.car_rental_schema import CarRentalCreate, CarRentalUpdate


class CarRentalService:
    def __init__(self, db: Session):
        self.db = db

    def get_car_rental(self, car_rental_id: int):
        """Get a car rental by ID"""
        car_rental = car_rental_repository.get_car_rental_by_id(self.db, car_rental_id)
        if not car_rental:
            raise ValueError("Car rental not found")
        return car_rental

    def get_all_car_rentals(self, skip: int = 0, limit: int = 100):
        """Get all car rentals"""
        return car_rental_repository.get_all_car_rentals(self.db, skip, limit)

    def get_available_car_rentals(self):
        """Get all available car rentals"""
        return car_rental_repository.get_available_car_rentals(self.db)

    def get_car_rentals_by_brand(self, brand: str):
        """Get car rentals filtered by brand"""
        return car_rental_repository.get_car_rentals_by_brand(self.db, brand)

    def create_car_rental(self, car_rental_data: CarRentalCreate):
        """Create a new car rental"""
        car_rental_dict = car_rental_data.model_dump()
        car_rental = CarRental(**car_rental_dict)
        return car_rental_repository.create_car_rental(self.db, car_rental)

    def update_car_rental(self, car_rental_id: int, car_rental_data: CarRentalUpdate):
        """Update an existing car rental"""
        existing_car_rental = car_rental_repository.get_car_rental_by_id(self.db, car_rental_id)
        if not existing_car_rental:
            raise ValueError("Car rental not found")
        
        update_dict = car_rental_data.model_dump(exclude_unset=True)
        return car_rental_repository.update_car_rental(self.db, car_rental_id, update_dict)

    def delete_car_rental(self, car_rental_id: int):
        """Delete a car rental"""
        existing_car_rental = car_rental_repository.get_car_rental_by_id(self.db, car_rental_id)
        if not existing_car_rental:
            raise ValueError("Car rental not found")
        
        return car_rental_repository.delete_car_rental(self.db, car_rental_id)
