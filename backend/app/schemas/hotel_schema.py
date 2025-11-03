from pydantic import BaseModel, Field
from typing import Optional


class HotelCreate(BaseModel):
    """Schema for creating a hotel"""
    service_id: int
    location: Optional[str] = None
    stars: int = Field(..., ge=1, le=5, description="Star rating must be between 1 and 5")
    description: Optional[str] = None


class HotelUpdate(BaseModel):
    """Schema for updating a hotel"""
    service_id: Optional[int] = None
    location: Optional[str] = None
    stars: Optional[int] = Field(None, ge=1, le=5, description="Star rating must be between 1 and 5")
    description: Optional[str] = None


class HotelResponse(BaseModel):
    """Schema for hotel response"""
    hotel_id: int
    service_id: int
    location: Optional[str] = None
    stars: Optional[int] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
