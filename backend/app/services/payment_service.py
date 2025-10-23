from sqlalchemy.orm import Session
from app.models.booking import Payment
from app.repositories import payment_repository
from app.schemas.payment_schema import PaymentCreate
from datetime import datetime

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_payments(self):
        """Get all payments"""
        return payment_repository.get_all_payments(self.db)
    
    def get_payment_by_booking(self, booking_id: int):
        """Get payment by booking ID"""
        payment = payment_repository.get_payment_by_booking(self.db, booking_id)
        if not payment:
            raise ValueError("Payment not found for this booking")
        return payment
    
    def create_payment(self, payment_data: PaymentCreate):
        """Create a new payment"""
        # Convert Pydantic model to dict
        payment_dict = payment_data.model_dump()
        payment_dict['payment_date'] = datetime.now()
        
        # Set status to success by default (can be overridden)
        if payment_dict.get('status') == 'pending':
            payment_dict['status'] = 'success'
        
        return payment_repository.create_payment(self.db, payment_dict)
