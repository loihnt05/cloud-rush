from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.car_rental_schema import CarRentalCreate, CarRentalUpdate, CarRentalResponse
from app.services.car_rental_service import CarRentalService

router = APIRouter(prefix="/car-rentals", tags=["Car Rentals"])


@router.post("/", response_model=CarRentalResponse)
def create_car_rental(
    car_rental: CarRentalCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new car rental"""
    try:
        return CarRentalService(db).create_car_rental(car_rental)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[CarRentalResponse])
def list_car_rentals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all car rentals with pagination"""
    return CarRentalService(db).get_all_car_rentals(skip, limit)


@router.get("/available", response_model=list[CarRentalResponse])
def get_available_car_rentals(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all available car rentals"""
    return CarRentalService(db).get_available_car_rentals()


@router.get("/brand/{brand}", response_model=list[CarRentalResponse])
def get_car_rentals_by_brand(
    brand: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get car rentals filtered by brand"""
    return CarRentalService(db).get_car_rentals_by_brand(brand)


@router.get("/{car_rental_id}", response_model=CarRentalResponse)
def get_car_rental(
    car_rental_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific car rental by ID"""
    try:
        return CarRentalService(db).get_car_rental(car_rental_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{car_rental_id}", response_model=CarRentalResponse)
def update_car_rental(
    car_rental_id: int,
    car_rental_data: CarRentalUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a car rental"""
    try:
        return CarRentalService(db).update_car_rental(car_rental_id, car_rental_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{car_rental_id}")
def delete_car_rental(
    car_rental_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete a car rental"""
    try:
        CarRentalService(db).delete_car_rental(car_rental_id)
        return {"message": "Car rental deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
