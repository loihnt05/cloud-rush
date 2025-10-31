from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class CarRentalCreate(BaseModel):
    """Schema for creating a car rental"""
    service_id: int
    car_model: Optional[str] = None
    brand: Optional[str] = None
    daily_rate: Optional[Decimal] = Field(None, ge=0, description="Daily rate must be non-negative")
    available: bool = True


class CarRentalUpdate(BaseModel):
    """Schema for updating a car rental"""
    service_id: Optional[int] = None
    car_model: Optional[str] = None
    brand: Optional[str] = None
    daily_rate: Optional[Decimal] = Field(None, ge=0, description="Daily rate must be non-negative")
    available: Optional[bool] = None


class CarRentalResponse(BaseModel):
    """Schema for car rental response"""
    car_rental_id: int
    service_id: int
    car_model: Optional[str] = None
    brand: Optional[str] = None
    daily_rate: Optional[Decimal] = None
    available: bool

    class Config:
        from_attributes = True
