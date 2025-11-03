from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.passenger_schema import PassengerCreate, PassengerUpdate, PassengerResponse
from app.services.passenger_service import PassengerService
from app.dependencies import verify_jwt
from typing import List

router = APIRouter(prefix="/passengers", tags=["Passengers"])


@router.post("/", response_model=PassengerResponse)
def create_passenger(
    passenger: PassengerCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new passenger for a booking"""
    try:
        return PassengerService(db).create_passenger(passenger)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all", response_model=List[PassengerResponse])
def get_all_passengers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all passengers with pagination"""
    return PassengerService(db).get_all_passengers(skip, limit)


@router.get("/{passenger_id}", response_model=PassengerResponse)
def get_passenger(
    passenger_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific passenger by ID"""
    try:
        return PassengerService(db).get_passenger(passenger_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/booking/{booking_id}", response_model=List[PassengerResponse])
def get_passengers_by_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all passengers for a specific booking"""
    return PassengerService(db).get_passengers_by_booking(booking_id)


@router.get("/booking/{booking_id}/type/{passenger_type}", response_model=List[PassengerResponse])
def get_passengers_by_type(
    booking_id: int,
    passenger_type: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get passengers filtered by type (adult, child, infant)"""
    return PassengerService(db).get_passengers_by_type(booking_id, passenger_type)


@router.put("/{passenger_id}", response_model=PassengerResponse)
def update_passenger(
    passenger_id: int,
    passenger: PassengerUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update passenger details"""
    try:
        return PassengerService(db).update_passenger(passenger_id, passenger)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{passenger_id}/assign-seat/{flight_seat_id}", response_model=PassengerResponse)
def assign_seat_to_passenger(
    passenger_id: int,
    flight_seat_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Assign a flight seat to a passenger"""
    try:
        return PassengerService(db).assign_seat(passenger_id, flight_seat_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{passenger_id}")
def delete_passenger(
    passenger_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a passenger"""
    try:
        return PassengerService(db).delete_passenger(passenger_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
