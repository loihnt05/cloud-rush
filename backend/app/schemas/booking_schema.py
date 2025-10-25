from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookingCreate(BaseModel):
    user_id: str
    flight_id: int
    seat_id: Optional[int] = None
    status: Optional[str] = "pending"

class BookingResponse(BaseModel):
    booking_id: int
    user_id: str
    flight_id: int
    seat_id: Optional[int] = None
    booking_date: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True
