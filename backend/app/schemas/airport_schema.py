from pydantic import BaseModel, Field
from typing import Optional


class AirportCreate(BaseModel):
    """Schema for creating an airport"""
    name: str = Field(..., max_length=100, description="Airport name")
    iata_code: str = Field(..., min_length=3, max_length=3, description="3-letter IATA code (e.g., JFK, LAX)")
    city: str = Field(..., max_length=100, description="City where airport is located")
    country: str = Field(..., max_length=100, description="Country where airport is located")


class AirportUpdate(BaseModel):
    """Schema for updating an airport"""
    name: Optional[str] = Field(None, max_length=100, description="Airport name")
    iata_code: Optional[str] = Field(None, min_length=3, max_length=3, description="3-letter IATA code")
    city: Optional[str] = Field(None, max_length=100, description="City")
    country: Optional[str] = Field(None, max_length=100, description="Country")


class AirportResponse(BaseModel):
    """Schema for airport response"""
    airport_id: int
    name: str
    iata_code: str
    city: str
    country: str

    class Config:
        from_attributes = True
