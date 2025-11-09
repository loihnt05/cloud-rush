from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class BookingCreate(BaseModel):
    user_id: str  # For regular users: their own ID. For agents: the traveler's user ID
    notes: Optional[str] = None
    status: Optional[str] = "pending"


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    booking_id: int
    user_id: str
    booking_reference: str
    booking_date: Optional[datetime] = None
    status: str
    total_amount: Optional[Decimal] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class BookingDetailResponse(BookingResponse):
    """Extended booking response with passengers and payments"""
    passengers: Optional[List] = []
    payments: Optional[List] = []
    booking_services: Optional[List] = []

    class Config:
        from_attributes = True
