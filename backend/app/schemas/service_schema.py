from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal
from enum import Enum


class ServiceType(str, Enum):
    """Service type enum"""
    hotel = "hotel"
    rental_car = "rental_car"
    package = "package"


class ServiceCreate(BaseModel):
    """Schema for creating a service"""
    name: str = Field(..., max_length=100)
    type: ServiceType
    price: Decimal = Field(..., ge=0, description="Price must be non-negative")


class ServiceUpdate(BaseModel):
    """Schema for updating a service"""
    name: Optional[str] = Field(None, max_length=100)
    type: Optional[ServiceType] = None
    price: Optional[Decimal] = Field(None, ge=0, description="Price must be non-negative")


class ServiceResponse(BaseModel):
    """Schema for service response"""
    service_id: int
    name: str
    type: str
    price: Decimal

    class Config:
        from_attributes = True
