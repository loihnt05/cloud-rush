from typing import List
from sqlalchemy.orm import Session
from app.models.flight_model import Flight


def search_flights(db: Session, origin: str, destination: str) -> List[Flight]:
    """
    Search for flights between an origin and destination.
    """
    flights = db.query(Flight).filter(
        Flight.origin == origin,
        Flight.destination == destination
    ).all()
    return flights
