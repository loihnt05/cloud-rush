from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.booking_service_schema import BookingServiceCreate, BookingServiceUpdate, BookingServiceResponse
from app.services.booking_service_service import BookingServiceService

router = APIRouter(prefix="/booking-services", tags=["Booking Services"])


@router.post("/", response_model=BookingServiceResponse)
def add_service_to_booking(
    booking_service: BookingServiceCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Add a service to a booking"""
    try:
        return BookingServiceService(db).add_service_to_booking(booking_service)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/booking/{booking_id}", response_model=list[BookingServiceResponse])
def get_booking_services(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all services for a specific booking"""
    try:
        return BookingServiceService(db).get_booking_services(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{booking_service_id}", response_model=BookingServiceResponse)
def update_booking_service(
    booking_service_id: int,
    booking_service_data: BookingServiceUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a booking service"""
    try:
        return BookingServiceService(db).update_booking_service(booking_service_id, booking_service_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{booking_service_id}")
def remove_service_from_booking(
    booking_service_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Remove a service from a booking"""
    try:
        BookingServiceService(db).remove_service_from_booking(booking_service_id)
        return {"message": "Service removed from booking successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=list[BookingServiceResponse])
def get_all_booking_services(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all booking services"""
    try:
        return BookingServiceService(db).get_all_booking_services()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))