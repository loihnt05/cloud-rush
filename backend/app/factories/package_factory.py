"""
Package Factory for creating package services
"""

from typing import Tuple, Optional
from sqlalchemy.orm import Session
from app.factories.service_factory import ServiceFactory
from app.models.booking import Service
from app.models.package import BookingPackage


class PackageFactory(ServiceFactory):
    """
    Concrete Factory for creating Package services.
    """

    def get_service_type(self) -> str:
        """Return the service type this factory creates."""
        return "package"

    def create_service(self, db: Session, **kwargs) -> Service:
        """
        Create a basic service entry for a package.
        
        Args:
            db: Database session
            **kwargs: Service parameters (name, price)
            
        Returns:
            Created Service entity
        """
        service = Service(
            name=kwargs.get("name"),
            type="package",
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
    ) -> Tuple[Service, BookingPackage]:
        """
        Create a package service with its specific details.
        
        Args:
            db: Database session
            service_data: Common service data (name, price)
            details_data: Package-specific data (package_name, total_price, hotel_id, car_rental_id)
            
        Returns:
            Tuple of (Service, BookingPackage)
        """
        # Create the base service
        service = self.create_service(
            db,
            name=service_data.get("name"),
            price=service_data.get("price")
        )

        # Create package details
        package = BookingPackage(
            service_id=service.service_id,
            hotel_id=details_data.get("hotel_id"),
            car_rental_id=details_data.get("car_rental_id"),
            name=details_data.get("name"),
            total_price=details_data.get("total_price")
        )
        db.add(package)
        db.flush()

        return service, package
