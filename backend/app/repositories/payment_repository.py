from sqlalchemy.orm import Session

from app.models.booking import Payment

def get_payment_by_booking(db: Session, booking_id: int):
    return db.query(Payment).filter(Payment.booking_id == booking_id).first()
    
def get_all_payments(db: Session):
    return db.query(Payment).all()
    
def create_payment(db: Session, payment_data: dict):
    """Create a new payment from dictionary data"""
    payment = Payment(**payment_data)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

def update_payment_status(db: Session, payment_id: int, status: str):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if payment:
        payment.status = status
        db.commit()
        db.refresh(payment)
    return payment

def delete_payment(db: Session, payment_id: int):
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if payment:
        db.delete(payment)
        db.commit()
    return payment
