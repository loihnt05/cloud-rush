from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.airport_schema import AirportCreate, AirportUpdate, AirportResponse
from app.services.airport_service import AirportService

router = APIRouter(prefix="/airports", tags=["Airports"])


@router.post("/", response_model=AirportResponse)
def create_airport(
    airport: AirportCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new airport"""
    try:
        return AirportService(db).create_airport(airport)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all", response_model=list[AirportResponse])
def list_airports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Get all airports with pagination"""
    return AirportService(db).get_all_airports(skip, limit)


@router.get("/iata/{iata_code}", response_model=AirportResponse)
def get_airport_by_iata(
    iata_code: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get an airport by IATA code (e.g., JFK, LAX, LHR)"""
    try:
        return AirportService(db).get_airport_by_iata(iata_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/city/{city}", response_model=list[AirportResponse])
def get_airports_by_city(
    city: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get airports filtered by city"""
    return AirportService(db).get_airports_by_city(city)


@router.get("/country/{country}", response_model=list[AirportResponse])
def get_airports_by_country(
    country: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get airports filtered by country"""
    return AirportService(db).get_airports_by_country(country)


@router.get("/{airport_id}", response_model=AirportResponse)
def get_airport(
    airport_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific airport by ID"""
    try:
        return AirportService(db).get_airport(airport_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{airport_id}", response_model=AirportResponse)
def update_airport(
    airport_id: int,
    airport_data: AirportUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update an airport"""
    try:
        return AirportService(db).update_airport(airport_id, airport_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{airport_id}")
def delete_airport(
    airport_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Delete an airport"""
    try:
        AirportService(db).delete_airport(airport_id)
        return {"message": "Airport deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
