from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.booking_schema import BookingCreate, BookingResponse, BookingUpdate, BookingDetailResponse
from app.services.booking_service import BookingService
from app.dependencies import verify_jwt, get_user_roles

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new booking (group-level, passengers added separately)
    
    - Regular users can only book for themselves (user_id must match their auth token)
    - Agents and admins can book for any user (traveler)
    """
    try:
        # Get the authenticated user's ID from the JWT token
        authenticated_user_id = payload.get("sub")
        
        # Get user roles
        roles = payload.get("http://localhost:8000/roles", [])
        is_agent_or_admin = "agent" in roles or "admin" in roles
        
        # Validate that user can create booking for the specified user_id
        if booking.user_id != authenticated_user_id:
            # If trying to book for someone else, must be agent or admin
            if not is_agent_or_admin:
                raise HTTPException(
                    status_code=403,
                    detail="You can only create bookings for yourself. Agents or admins can book for others."
                )
        
        return BookingService(db).create_booking(booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all", response_model=list[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all bookings"""
    return BookingService(db).get_all_bookings()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific booking by ID"""
    try:
        booking = BookingService(db).get_booking(booking_id)
        return booking
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/reference/{booking_reference}", response_model=BookingResponse)
def get_booking_by_reference(
    booking_reference: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a booking by reference number"""
    try:
        return BookingService(db).get_booking_by_reference(booking_reference)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/user/{user_id}", response_model=list[BookingResponse])
def get_user_bookings(
    user_id: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all bookings for a specific user"""
    return BookingService(db).get_user_bookings(user_id)


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    booking: BookingUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update booking details"""
    try:
        return BookingService(db).update_booking(booking_id, booking)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{booking_id}/status/{status}", response_model=BookingResponse)
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update booking status (pending, confirmed, cancelled)"""
    try:
        return BookingService(db).update_booking_status(booking_id, status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{booking_id}/confirm", response_model=BookingResponse)
def confirm_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Confirm booking, calculate total, and create payment"""
    try:
        return BookingService(db).confirm_booking(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{booking_id}/calculate-total", response_model=BookingResponse)
def calculate_booking_total(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Calculate and update total amount based on all passengers"""
    try:
        return BookingService(db).calculate_and_update_total(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
