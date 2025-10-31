from sqlalchemy.orm import Session
from app.models.booking import Service
from app.repositories import service_repository
from app.schemas.service_schema import ServiceCreate, ServiceUpdate


class ServiceService:
    def __init__(self, db: Session):
        self.db = db

    def get_service(self, service_id: int):
        """Get a service by ID"""
        service = service_repository.get_service_by_id(self.db, service_id)
        if not service:
            raise ValueError("Service not found")
        return service

    def get_all_services(self, skip: int = 0, limit: int = 100):
        """Get all services"""
        return service_repository.get_all_services(self.db, skip, limit)

    def get_services_by_type(self, service_type: str):
        """Get services filtered by type"""
        valid_types = ["hotel", "rental_car", "package"]
        if service_type not in valid_types:
            raise ValueError(f"Invalid service type. Must be one of: {', '.join(valid_types)}")
        return service_repository.get_services_by_type(self.db, service_type)

    def create_service(self, service_data: ServiceCreate):
        """Create a new service"""
        service_dict = service_data.model_dump()
        service = Service(**service_dict)
        return service_repository.create_service(self.db, service)

    def update_service(self, service_id: int, service_data: ServiceUpdate):
        """Update an existing service"""
        existing_service = service_repository.get_service_by_id(self.db, service_id)
        if not existing_service:
            raise ValueError("Service not found")
        
        update_dict = service_data.model_dump(exclude_unset=True)
        return service_repository.update_service(self.db, service_id, update_dict)

    def delete_service(self, service_id: int):
        """Delete a service"""
        existing_service = service_repository.get_service_by_id(self.db, service_id)
        if not existing_service:
            raise ValueError("Service not found")
        
        return service_repository.delete_service(self.db, service_id)
