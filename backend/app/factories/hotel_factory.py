"""
Hotel Factory for creating hotel services
"""

from typing import Tuple
from sqlalchemy.orm import Session
from app.factories.service_factory import ServiceFactory
from app.models.booking import Service
from app.models.hotel import Hotel


class HotelFactory(ServiceFactory):
    """
    Concrete Factory for creating Hotel services.
    """

    def get_service_type(self) -> str:
        """Return the service type this factory creates."""
        return "hotel"

    def create_service(self, db: Session, **kwargs) -> Service:
        """
        Create a basic service entry for a hotel.
        
        Args:
            db: Database session
            **kwargs: Service parameters (name, price)
            
        Returns:
            Created Service entity
        """
        service = Service(
            name=kwargs.get("name"),
            type="hotel",
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
    ) -> Tuple[Service, Hotel]:
        """
        Create a hotel service with its specific details.
        
        Args:
            db: Database session
            service_data: Common service data (name, price)
            details_data: Hotel-specific data (location, stars, description)
            
        Returns:
            Tuple of (Service, Hotel)
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        # Validate hotel-specific data
        stars = details_data.get("stars")
        if stars is not None and (stars < 1 or stars > 5):
            raise ValueError("Hotel stars must be between 1 and 5")

        # Create the base service
        service = self.create_service(
            db,
            name=service_data.get("name"),
            price=service_data.get("price")
        )

        # Create hotel details
        hotel = Hotel(
            service_id=service.service_id,
            location=details_data.get("location"),
            stars=details_data.get("stars"),
            description=details_data.get("description")
        )
        db.add(hotel)
        db.flush()

        return service, hotel
