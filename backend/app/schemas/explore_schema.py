from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ExploreCreate(BaseModel):
    """Schema for creating an explore"""
    user_id: str
    place_id: Optional[int] = None
    title: str = Field(..., max_length=200)
    content: Optional[str] = None


class ExploreUpdate(BaseModel):
    """Schema for updating an explore"""
    place_id: Optional[int] = None
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None


class ExploreResponse(BaseModel):
    """Schema for explore response"""
    explore_id: int
    user_id: str
    place_id: Optional[int] = None
    title: str
    content: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlaceCreate(BaseModel):
    """Schema for creating a place"""
    name: str = Field(..., max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class PlaceUpdate(BaseModel):
    """Schema for updating a place"""
    name: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class PlaceResponse(BaseModel):
    """Schema for place response"""
    place_id: int
    name: str
    country: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True
