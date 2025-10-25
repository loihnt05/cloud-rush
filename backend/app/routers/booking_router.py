from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.booking_schema import BookingCreate, BookingResponse
from app.services.booking_service import BookingService
from app.dependencies import verify_jwt

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    return BookingService(db).create_booking(booking)


@router.get("/all", response_model=list[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    return BookingService(db).get_all_bookings()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    booking = BookingService(db).get_booking(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking
