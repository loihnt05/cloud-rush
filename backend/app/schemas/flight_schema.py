# app/schemas/flight.py
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional

class FlightCreate(BaseModel):
    flight_number: str
    airplane_id: Optional[int] = None
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    base_price: Decimal

class FlightResponse(BaseModel):
    flight_id: int
    flight_number: str
    airplane_id: Optional[int] = None
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    base_price: Decimal

    class Config:
        from_attributes = True
