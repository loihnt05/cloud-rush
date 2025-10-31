from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.flight_seat_schema import (
    FlightSeatCreate, FlightSeatUpdate, FlightSeatResponse, 
    FlightSeatBulkCreate, FlightSeatDetailResponse
)
from app.services.flight_seat_service import FlightSeatService

router = APIRouter(prefix="/flight-seats", tags=["Flight Seats"])


@router.post("/", response_model=FlightSeatResponse)
def create_flight_seat(
    flight_seat: FlightSeatCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new flight seat (assign a seat to a flight)"""
    try:
        return FlightSeatService(db).create_flight_seat(flight_seat)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/bulk", response_model=list[FlightSeatResponse])
def create_flight_seats_bulk(
    bulk_data: FlightSeatBulkCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create multiple flight seats at once for a flight"""
    try:
        return FlightSeatService(db).create_flight_seats_bulk(bulk_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[FlightSeatResponse])
def list_flight_seats(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all flight seats with pagination"""
    return FlightSeatService(db).get_all_flight_seats(skip, limit)


@router.get("/flight/{flight_id}", response_model=list[FlightSeatResponse])
def get_flight_seats_by_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all seats for a specific flight"""
    try:
        return FlightSeatService(db).get_flight_seats_by_flight(flight_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/flight/{flight_id}/available", response_model=list[FlightSeatResponse])
def get_available_seats(
    flight_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all available seats for a specific flight"""
    try:
        return FlightSeatService(db).get_available_seats(flight_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/flight/{flight_id}/status/{status}", response_model=list[FlightSeatResponse])
def get_seats_by_status(
    flight_id: int,
    status: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get flight seats filtered by status (available, reserved, booked)"""
    try:
        return FlightSeatService(db).get_seats_by_status(flight_id, status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/flight/{flight_id}/class/{seat_class}", response_model=list[FlightSeatResponse])
def get_seats_by_class(
    flight_id: int,
    seat_class: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get flight seats filtered by class (economy, business, first)"""
    try:
        return FlightSeatService(db).get_seats_by_class(flight_id, seat_class)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{flight_seat_id}", response_model=FlightSeatResponse)
def get_flight_seat(
    flight_seat_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific flight seat by ID"""
    try:
        return FlightSeatService(db).get_flight_seat(flight_seat_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{flight_seat_id}", response_model=FlightSeatResponse)
def update_flight_seat(
    flight_seat_id: int,
    flight_seat_data: FlightSeatUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a flight seat"""
    try:
        return FlightSeatService(db).update_flight_seat(flight_seat_id, flight_seat_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{flight_seat_id}/status/{status}")
def update_flight_seat_status(
    flight_seat_id: int,
    status: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update only the status of a flight seat"""
    try:
        FlightSeatService(db).update_status(flight_seat_id, status)
        return {"message": f"Flight seat status updated to {status}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{flight_seat_id}")
def delete_flight_seat(
    flight_seat_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a flight seat"""
    try:
        FlightSeatService(db).delete_flight_seat(flight_seat_id)
        return {"message": "Flight seat deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
