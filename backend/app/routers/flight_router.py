from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.flight_schema import FlightCreate, FlightResponse
from app.services.flight_service import FlightService

router = APIRouter(prefix="/flights", tags=["Flights"])

@router.post("/", response_model=FlightResponse)    
def create_flight(flight: FlightCreate, db: Session = Depends(get_db)):
    return FlightService(db).create_flight(flight)

@router.get("/all", response_model=list[FlightResponse])
def list_flights(db: Session = Depends(get_db)):
    return FlightService(db).get_all_flights()

@router.get("/{flight_id}", response_model=FlightResponse)
def get_flight(flight_id: int, db: Session = Depends(get_db)):
    flight = FlightService(db).get_flight(flight_id)
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    return flight

@router.delete("/{flight_id}")
def delete_flight(flight_id: int, db: Session = Depends(get_db)):
    FlightService(db).delete_flight(flight_id)
    return {"message": "Flight deleted successfully"}
