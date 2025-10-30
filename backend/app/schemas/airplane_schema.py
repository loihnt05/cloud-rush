from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AirplaneCreate(BaseModel):
    model: str
    manufacturer: Optional[str] = None
    seat_capacity: int

class AirplaneResponse(BaseModel):
    airplane_id: int
    model: str
    manufacturer: Optional[str] = None
    seat_capacity: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True