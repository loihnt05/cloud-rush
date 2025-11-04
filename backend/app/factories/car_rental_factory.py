"""
Car Rental Factory for creating car rental services
"""

from typing import Tuple
from sqlalchemy.orm import Session
from app.factories.service_factory import ServiceFactory
from app.models.booking import Service
from app.models.car_rental import CarRental


class CarRentalFactory(ServiceFactory):
    """
    Concrete Factory for creating Car Rental services.
    """

    def get_service_type(self) -> str:
        """Return the service type this factory creates."""
        return "rental_car"

    def create_service(self, db: Session, **kwargs) -> Service:
        """
        Create a basic service entry for a car rental.
        
        Args:
            db: Database session
            **kwargs: Service parameters (name, price)
            
        Returns:
            Created Service entity
        """
        service = Service(
            name=kwargs.get("name"),
            type="rental_car",
            price=kwargs.get("price")
        )
        db.add(service)
        db.flush()  # Get the service_id without committing
        return service

    def create_service_with_details(
        self, 
        db: Session, 
        service_data: dict, 
        details_data: dict
    ) -> Tuple[Service, CarRental]:
        """
        Create a car rental service with its specific details.
        
        Args:
            db: Database session
            service_data: Common service data (name, price)
            details_data: Car rental-specific data (car_model, brand, daily_rate, available)
            
        Returns:
            Tuple of (Service, CarRental)
        """
        # Create the base service
        service = self.create_service(
            db,
            name=service_data.get("name"),
            price=service_data.get("price")
        )

        # Create car rental details
        car_rental = CarRental(
            service_id=service.service_id,
            car_model=details_data.get("car_model"),
            brand=details_data.get("brand"),
            daily_rate=details_data.get("daily_rate"),
            available=details_data.get("available", True)
        )
        db.add(car_rental)
        db.flush()

        return service, car_rental
