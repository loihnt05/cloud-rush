from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.seat_schema import SeatCreate, SeatResponse
from app.services.seat_service import SeatService
from typing import Optional

router = APIRouter(prefix="/seats", tags=["Seats"])

@router.post("/", response_model=SeatResponse)    
def create_seat(seat: SeatCreate, db: Session = Depends(get_db)):
    """Create a new seat"""
    return SeatService(db).create_seat(seat)

@router.get("/all", response_model=list[SeatResponse])
def list_seats(db: Session = Depends(get_db)):
    """Get all seats"""
    return SeatService(db).get_all_seats()

@router.get("/airplane/{airplane_id}", response_model=list[SeatResponse])
def get_seats_by_airplane(
    airplane_id: int,
    available_only: bool = Query(False, description="Filter for available seats only"),
    seat_class: Optional[str] = Query(None, description="Filter by seat class (economy, business, first)"),
    db: Session = Depends(get_db)
):
    """Get seats for a specific airplane with optional filters"""
    service = SeatService(db)
    
    if seat_class:
        return service.get_seats_by_class(airplane_id, seat_class)
    elif available_only:
        return service.get_available_seats_by_airplane(airplane_id)
    else:
        return service.get_seats_by_airplane(airplane_id)

@router.get("/{seat_id}", response_model=SeatResponse)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    """Get a specific seat by ID"""
    try:
        seat = SeatService(db).get_seat(seat_id)
        return seat
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{seat_id}", response_model=SeatResponse)
def update_seat(seat_id: int, seat_data: dict, db: Session = Depends(get_db)):
    """Update a seat"""
    try:
        return SeatService(db).update_seat(seat_id, seat_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{seat_id}/availability", response_model=SeatResponse)
def update_seat_availability(
    seat_id: int,
    available: bool = Query(..., description="Set seat availability"),
    db: Session = Depends(get_db)
):
    """Update seat availability status"""
    try:
        return SeatService(db).update_seat_availability(seat_id, available)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/available/{airplane_id}", response_model=list[SeatResponse])
def get_available_seats_by_airplane(airplane_id: int, db: Session = Depends(get_db)):
    """Get available seats for a specific airplane"""
    return SeatService(db).get_available_seats_by_airplane(airplane_id)

@router.delete("/{seat_id}")
def delete_seat(seat_id: int, db: Session = Depends(get_db)):
    """Delete a seat"""
    try:
        SeatService(db).delete_seat(seat_id)
        return {"message": "Seat deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
