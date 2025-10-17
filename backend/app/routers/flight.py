from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.flight_schema import Flight as FlightSchema
from app.services import flight_service

router = APIRouter()

@router.get("/", response_model=List[FlightSchema])
def search_flights(origin: str, destination: str, db: Session = Depends(get_db)):
    """
    Search for flights between an origin and destination.
    """
    return flight_service.search_flights(db, origin, destination)