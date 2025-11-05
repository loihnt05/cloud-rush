from sqlalchemy.orm import Session
from app.models.car_rental import CarRental
from app.repositories import car_rental_repository
from app.schemas.car_rental_schema import CarRentalCreate, CarRentalUpdate
from app.factories import get_service_factory


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
        """Create a new car rental (traditional way - kept for backward compatibility)"""
        car_rental_dict = car_rental_data.model_dump()
        car_rental = CarRental(**car_rental_dict)
        return car_rental_repository.create_car_rental(self.db, car_rental)
    
    def create_car_rental_with_service(self, name: str, price: float, car_model: str, brand: str, 
                                       daily_rate: float, available: bool = True):
        """
        Create a car rental using the Factory Pattern.
        This is the recommended way to create car rentals.
        
        Args:
            name: Service name
            price: Service price
            car_model: Car model
            brand: Car brand
            daily_rate: Daily rental rate
            available: Availability status
            
        Returns:
            Tuple of (Service, CarRental)
        """
        try:
            factory = get_service_factory("rental_car")
            service, car_rental = factory.create_service_with_details(
                self.db,
                service_data={"name": name, "price": price},
                details_data={
                    "car_model": car_model,
                    "brand": brand,
                    "daily_rate": daily_rate,
                    "available": available
                }
            )
            self.db.commit()
            self.db.refresh(service)
            self.db.refresh(car_rental)
            return service, car_rental
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Failed to create car rental: {str(e)}")

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
