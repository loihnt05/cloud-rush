# app/schemas/flight.py
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

# Shared properties
class FlightBase(BaseModel):
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    price: Decimal

# Properties to receive on creation (if you have an admin endpoint)
class FlightCreate(FlightBase):
    pass

# Properties to return to a client
class Flight(FlightBase):
    flight_id: int

    class Config:
        orm_mode = True # This allows Pydantic to read data from ORM models
