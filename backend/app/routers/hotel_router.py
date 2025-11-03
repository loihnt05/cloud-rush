from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.hotel_schema import HotelCreate, HotelUpdate, HotelResponse
from app.services.hotel_service import HotelService

router = APIRouter(prefix="/hotels", tags=["Hotels"])


@router.post("/", response_model=HotelResponse)
def create_hotel(
    hotel: HotelCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new hotel"""
    try:
        return HotelService(db).create_hotel(hotel)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[HotelResponse])
def list_hotels(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all hotels with pagination"""
    return HotelService(db).get_all_hotels(skip, limit)


@router.get("/stars/{stars}", response_model=list[HotelResponse])
def get_hotels_by_stars(
    stars: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get hotels filtered by star rating"""
    try:
        return HotelService(db).get_hotels_by_stars(stars)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific hotel by ID"""
    try:
        return HotelService(db).get_hotel(hotel_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{hotel_id}", response_model=HotelResponse)
def update_hotel(
    hotel_id: int,
    hotel_data: HotelUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a hotel"""
    try:
        return HotelService(db).update_hotel(hotel_id, hotel_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{hotel_id}")
def delete_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a hotel"""
    try:
        HotelService(db).delete_hotel(hotel_id)
        return {"message": "Hotel deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
