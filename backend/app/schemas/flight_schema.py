# app/schemas/flight.py
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional

class FlightCreate(BaseModel):
    flight_number: str
    airplane_id: Optional[int] = None
    origin_airport_id: int
    destination_airport_id: int
    departure_time: datetime
    arrival_time: datetime
    status: Optional[str] = "scheduled"
    base_price: Decimal
    tax_rate: Optional[Decimal] = Decimal("0.15")

class FlightResponse(BaseModel):
    flight_id: int
    flight_number: str
    airplane_id: Optional[int] = None
    origin_airport_id: int
    destination_airport_id: int
    departure_time: datetime
    arrival_time: datetime
    status: str
    base_price: Decimal
    tax_rate: Optional[Decimal] = Decimal("0.15")

    class Config:
        from_attributes = True
