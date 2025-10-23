from sqlalchemy.orm import Session

from app.models.booking import Payment

def get_payment_by_booking(db: Session, booking_id: int):
    return db.query(Payment).filter(Payment.booking_id == booking_id).first()
    
def get_all_payments(db: Session):
    return db.query(Payment).all()
    
def create_payment(db: Session, payment_data):
    payment = Payment(**payment_data)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
