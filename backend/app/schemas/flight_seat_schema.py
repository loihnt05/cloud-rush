from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from enum import Enum


class FlightSeatStatus(str, Enum):
    """Flight seat status enum"""
    available = "available"
    reserved = "reserved"
    booked = "booked"


class FlightSeatCreate(BaseModel):
    """Schema for creating a flight seat"""
    flight_id: int
    seat_id: int
    status: FlightSeatStatus = FlightSeatStatus.available
    price_multiplier: Decimal = Field(default=1.0, ge=0.1, le=10.0, description="Price multiplier (0.1 to 10.0)")


class FlightSeatBulkCreate(BaseModel):
    """Schema for creating multiple flight seats at once"""
    flight_id: int
    seat_ids: list[int]
    price_multiplier: Decimal = Field(default=1.0, ge=0.1, le=10.0)


class FlightSeatUpdate(BaseModel):
    """Schema for updating a flight seat"""
    status: Optional[FlightSeatStatus] = None
    price_multiplier: Optional[Decimal] = Field(None, ge=0.1, le=10.0, description="Price multiplier (0.1 to 10.0)")


class FlightSeatResponse(BaseModel):
    """Schema for flight seat response"""
    flight_seat_id: int
    flight_id: int
    seat_id: int
    status: str
    price_multiplier: Decimal

    class Config:
        from_attributes = True


class FlightSeatDetailResponse(BaseModel):
    """Schema for detailed flight seat response with seat info"""
    flight_seat_id: int
    flight_id: int
    seat_id: int
    status: str
    price_multiplier: Decimal
    seat_number: Optional[str] = None
    seat_class: Optional[str] = None

    class Config:
        from_attributes = True
