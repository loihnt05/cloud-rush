"""
Factory initialization and registration
"""

from app.factories.service_factory import ServiceFactoryRegistry
from app.factories.hotel_factory import HotelFactory
from app.factories.car_rental_factory import CarRentalFactory
from app.factories.package_factory import PackageFactory


def initialize_factories():
    """
    Initialize and register all service factories.
    This should be called during application startup.
    """
    # Register all concrete factories
    ServiceFactoryRegistry.register_factory("hotel", HotelFactory())
    ServiceFactoryRegistry.register_factory("rental_car", CarRentalFactory())
    ServiceFactoryRegistry.register_factory("package", PackageFactory())
    
    print(f"Registered factories for: {ServiceFactoryRegistry.get_available_types()}")


def get_service_factory(service_type: str):
    """
    Convenience function to get a factory by service type.
    
    Args:
        service_type: Type of service (hotel, rental_car, package)
        
    Returns:
        ServiceFactory instance
    """
    return ServiceFactoryRegistry.get_factory(service_type)
