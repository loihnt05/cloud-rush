from sqlalchemy.orm import Session
from app.models.booking import BookingService
from app.repositories import booking_service_repository, booking_repository, service_repository, payment_repository
from app.schemas.booking_service_schema import BookingServiceCreate, BookingServiceUpdate
from decimal import Decimal


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
        booking = booking_repository.get_booking_by_id(self.db, booking_id=booking_service_data.booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        # Verify service exists
        service = service_repository.get_service_by_id(self.db, booking_service_data.service_id)
        if not service:
            raise ValueError("Service not found")
        
        # Create booking service
        booking_service_dict = booking_service_data.model_dump()
        booking_service = BookingService(**booking_service_dict)
        created_service = booking_service_repository.create_booking_service(self.db, booking_service)
        
        # Update payment amount if payment exists
        payment = payment_repository.get_payment_by_booking(self.db, booking_service_data.booking_id)
        if payment:
            # Calculate additional service cost
            quantity = booking_service_data.quantity if booking_service_data.quantity else 1
            service_cost = Decimal(str(service.price)) * quantity
            
            # Update payment amount
            new_amount = Decimal(str(payment.amount)) + service_cost
            payment.amount = new_amount
            self.db.commit()
            self.db.refresh(payment)
        
        return created_service

    def update_booking_service(self, booking_service_id: int, booking_service_data: BookingServiceUpdate):
        """Update a booking service"""
        existing = booking_service_repository.get_booking_service_by_id(self.db, booking_service_id)
        if not existing:
            raise ValueError("Booking service not found")
        
        # Get current service details before update
        old_quantity = existing.quantity
        old_service = service_repository.get_service_by_id(self.db, existing.service_id)
        
        update_dict = booking_service_data.model_dump(exclude_unset=True)
        updated_service = booking_service_repository.update_booking_service(self.db, booking_service_id, update_dict)
        
        # Update payment if quantity changed
        if 'quantity' in update_dict and update_dict['quantity'] != old_quantity:
            payment = payment_repository.get_payment_by_booking(self.db, existing.booking_id)
            if payment and old_service:
                # Calculate the difference in cost
                quantity_diff = update_dict['quantity'] - old_quantity
                service_cost_diff = Decimal(str(old_service.price)) * quantity_diff
                
                # Update payment amount
                new_amount = Decimal(str(payment.amount)) + service_cost_diff
                payment.amount = new_amount
                self.db.commit()
                self.db.refresh(payment)
        
        return updated_service

    def remove_service_from_booking(self, booking_service_id: int):
        """Remove a service from a booking"""
        existing = booking_service_repository.get_booking_service_by_id(self.db, booking_service_id)
        if not existing:
            raise ValueError("Booking service not found")
        
        # Get service details before deletion
        service = service_repository.get_service_by_id(self.db, existing.service_id)
        booking_id = existing.booking_id
        quantity = existing.quantity
        
        # Delete the booking service
        result = booking_service_repository.delete_booking_service(self.db, booking_service_id)
        
        # Update payment amount to subtract the service cost
        if result:
            payment = payment_repository.get_payment_by_booking(self.db, booking_id)
            if payment and service:
                # Calculate service cost to subtract
                service_cost = Decimal(str(service.price)) * quantity
                
                # Update payment amount
                new_amount = Decimal(str(payment.amount)) - service_cost
                payment.amount = max(new_amount, Decimal('0'))  # Ensure amount doesn't go negative
                self.db.commit()
                self.db.refresh(payment)
        
        return result
