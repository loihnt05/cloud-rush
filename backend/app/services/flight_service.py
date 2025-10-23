from typing import List
from sqlalchemy.orm import Session
from app.models.flight import Flight
from app.repositories import flight_repository


# def search_flights(db: Session, origin: str, destination: str) -> List[Flight]:
#     """
#     Search for flights between an origin and destination.
#     """
#     flights = db.query(Flight).filter(
#         Flight.origin == origin,
#         Flight.destination == destination
#     ).all()
#     return flights


def get_all_flights(db: Session):
    return flight_repository.get_all_flights(db)

def get_flight_by_id(db: Session, flight_id: int):
    flight = flight_repository.get_flight_by_id(db, flight_id)
    if not flight:
        raise ValueError("Flight not found")

    return flight

def create_flight(db: Session, flight_number: str, origin: str, destination: str, departure_time, arrival_time, price: float):
    flight = Flight(
        flight_number=flight_number,
        origin=origin,
        destination=destination,
        departure_time=departure_time,
        arrival_time=arrival_time,
        price=price
    )
    return flight_repository.create_flight(db, flight)
    
def update_flight(db: Session, flight_id: int, flight_data: Flight):
    existing_flight = flight_repository.get_flight_by_id(db, flight_id)
    if not existing_flight:
        raise ValueError("Flight not found")

    for key, value in flight_data.dict(exclude_unset=True).items():
        setattr(existing_flight, key, value)

    return flight_repository.update_flight(db, existing_flight)

# def delete_flight(db: Session, flight_id: int):
#     existing_flight = flight_repository.get_flight_by_id(db, flight_id)
#     if not existing_flight:
#         raise ValueError("Flight not found")

#     return flight_repository.delete_flight(db, flight_id)