from pydantic import BaseModel, Field
from typing import Optional


class BookingServiceCreate(BaseModel):
    """Schema for adding a service to a booking"""
    booking_id: int
    service_id: int
    quantity: int = Field(default=1, ge=1, description="Quantity must be at least 1")


class BookingServiceUpdate(BaseModel):
    """Schema for updating a booking service"""
    quantity: Optional[int] = Field(None, ge=1, description="Quantity must be at least 1")


class BookingServiceResponse(BaseModel):
    """Schema for booking service response"""
    booking_service_id: int
    booking_id: int
    service_id: int
    quantity: int

    class Config:
        from_attributes = True
