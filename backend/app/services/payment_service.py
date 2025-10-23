from sqlalchemy.orm import Session
from app.models.booking import Payment
from repositories import payment_repository
from datetime import datetime

def get_all_payments(db: Session):
    return payment_repository.get_payments(db)

def create_payment(db: Session, booking_id: int, amount: float, method: str):
    payment = Payment(
        booking_id=booking_id,
        amount=amount,
        method=method,
        payment_date=datetime.now(),
        status="success"
    )
    return payment_repository.create_payment(db, payment)
