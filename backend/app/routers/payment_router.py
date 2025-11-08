from fastapi import APIRouter, Depends, HTTPException
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
    try:
        return PaymentService(db).create_payment(payment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")

@router.get("/", response_model=list[PaymentResponse])
def read_payments(db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    return PaymentService(db).get_all_payments()

@router.get("/booking/{booking_id}", response_model=PaymentResponse)
def read_payment_by_booking(booking_id: int, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    try:
        return PaymentService(db).get_payment_by_booking(booking_id)
    except ValueError as e:
        # Return 404 when payment is not found (this is expected for new bookings)
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving payment: {str(e)}")

@router.put("/{payment_id}/status", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int, 
    status: str, 
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    try:
        return PaymentService(db).update_payment_status(payment_id, status)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating payment status: {str(e)}")