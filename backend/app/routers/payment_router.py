from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.payment_schema import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService
from app.dependencies import verify_jwt

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentResponse)
def make_payment(
    payment: PaymentCreate, 
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    return PaymentService(db).create_payment(payment)

@router.get("/", response_model=list[PaymentResponse])
def read_payments(db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    return PaymentService(db).get_all_payments()

@router.get("/booking/{booking_id}", response_model=PaymentResponse)
def read_payment_by_booking(booking_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    return PaymentService(db).get_payment_by_booking(booking_id)

@router.put("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    return PaymentService(db).update_payment_status(payment_id, status)