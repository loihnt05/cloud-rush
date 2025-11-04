"""
Base Service Factory and Registry
This implements the Factory Pattern for creating different types of services
"""

from abc import ABC, abstractmethod
from typing import Dict, Type, Any
from sqlalchemy.orm import Session


class ServiceFactory(ABC):
    """
    Abstract Factory for creating services.
    All concrete factories must implement this interface.
    """

    @abstractmethod
    def create_service(self, db: Session, **kwargs) -> Any:
        """
        Create a service entity.
        
        Args:
            db: Database session
            **kwargs: Service-specific parameters
            
        Returns:
            Created service entity
        """
        pass

    @abstractmethod
    def create_service_with_details(self, db: Session, service_data: dict, details_data: dict) -> tuple:
        """
        Create a service with its specific details.
        
        Args:
            db: Database session
            service_data: Common service data (name, type, price)
            details_data: Specific details for the service type
            
        Returns:
            Tuple of (Service, ServiceDetails)
        """
        pass

    @abstractmethod
    def get_service_type(self) -> str:
        """Return the service type this factory creates."""
        pass


class ServiceFactoryRegistry:
    """
    Registry to manage and retrieve service factories.
    Implements the Factory Method pattern with registration.
    """

    _factories: Dict[str, ServiceFactory] = {}

    @classmethod
    def register_factory(cls, service_type: str, factory: ServiceFactory) -> None:
        """
        Register a factory for a specific service type.
        
        Args:
            service_type: Type of service (hotel, rental_car, package)
            factory: Factory instance to register
        """
        cls._factories[service_type] = factory

    @classmethod
    def get_factory(cls, service_type: str) -> ServiceFactory:
        """
        Retrieve a factory for the given service type.
        
        Args:
            service_type: Type of service to get factory for
            
        Returns:
            ServiceFactory instance
            
        Raises:
            ValueError: If service type is not registered
        """
        factory = cls._factories.get(service_type)
        if not factory:
            raise ValueError(
                f"No factory registered for service type: {service_type}. "
                f"Available types: {list(cls._factories.keys())}"
            )
        return factory

    @classmethod
    def get_available_types(cls) -> list:
        """Get list of all registered service types."""
        return list(cls._factories.keys())

    @classmethod
    def clear_registry(cls) -> None:
        """Clear all registered factories (useful for testing)."""
        cls._factories.clear()
