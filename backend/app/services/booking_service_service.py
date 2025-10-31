from sqlalchemy.orm import Session
from app.models.booking import BookingService
from app.repositories import booking_service_repository, booking_repository, service_repository
from app.schemas.booking_service_schema import BookingServiceCreate, BookingServiceUpdate


class BookingServiceService:
    def __init__(self, db: Session):
        self.db = db

    def get_booking_services(self, booking_id: int):
        """Get all services for a specific booking"""
        # Verify booking exists
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        return booking_service_repository.get_booking_services_by_booking(self.db, booking_id)

    def get_all_booking_services(self):
        """Get all booking services"""
        return booking_service_repository.get_all_booking_services(self.db)
    
    def add_service_to_booking(self, booking_service_data: BookingServiceCreate):
        """Add a service to a booking"""
        # Verify booking exists
        booking = booking_repository.get_booking_by_id(self.db, booking_service_data.booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Verify service exists
        service = service_repository.get_service_by_id(self.db, booking_service_data.service_id)
        if not service:
            raise ValueError("Service not found")
        
        booking_service_dict = booking_service_data.model_dump()
        booking_service = BookingService(**booking_service_dict)
        return booking_service_repository.create_booking_service(self.db, booking_service)

    def update_booking_service(self, booking_service_id: int, booking_service_data: BookingServiceUpdate):
        """Update a booking service"""
        existing = booking_service_repository.get_booking_service_by_id(self.db, booking_service_id)
        if not existing:
            raise ValueError("Booking service not found")
        
        update_dict = booking_service_data.model_dump(exclude_unset=True)
        return booking_service_repository.update_booking_service(self.db, booking_service_id, update_dict)

    def remove_service_from_booking(self, booking_service_id: int):
        """Remove a service from a booking"""
        existing = booking_service_repository.get_booking_service_by_id(self.db, booking_service_id)
        if not existing:
            raise ValueError("Booking service not found")
        
        return booking_service_repository.delete_booking_service(self.db, booking_service_id)
