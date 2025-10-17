from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.flight_model import Flight as FlightModel
from app.schemas.flight_schema import Flight as FlightSchema

router = APIRouter()

@router.get("/", response_model=List[FlightSchema])
def search_flights(origin: str, destination: str, db: Session = Depends(get_db)):
    """
    Search for flights between an origin and destination.
    """
    flights = db.query(FlightModel).filter(
        FlightModel.origin == origin,
        FlightModel.destination == destination
    ).all()
    return flights