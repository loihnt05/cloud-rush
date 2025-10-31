from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class TripPlanItemCreate(BaseModel):
    """Schema for adding an item to a trip plan"""
    flight_id: Optional[int] = None
    service_id: Optional[int] = None
    place_id: Optional[int] = None
    scheduled_time: Optional[datetime] = None


class TripPlanItemUpdate(BaseModel):
    """Schema for updating a trip plan item"""
    flight_id: Optional[int] = None
    service_id: Optional[int] = None
    place_id: Optional[int] = None
    scheduled_time: Optional[datetime] = None


class TripPlanItemResponse(BaseModel):
    """Schema for trip plan item response"""
    plan_item_id: int
    plan_id: int
    flight_id: Optional[int] = None
    service_id: Optional[int] = None
    place_id: Optional[int] = None
    scheduled_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class TripPlanCreate(BaseModel):
    """Schema for creating a trip plan"""
    user_id: str
    name: str = Field(..., max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    items: Optional[List[TripPlanItemCreate]] = []


class TripPlanUpdate(BaseModel):
    """Schema for updating a trip plan"""
    name: Optional[str] = Field(None, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class TripPlanResponse(BaseModel):
    """Schema for trip plan response"""
    plan_id: int
    user_id: str
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class TripPlanDetailResponse(TripPlanResponse):
    """Schema for detailed trip plan response with items"""
    trip_plan_items: List[TripPlanItemResponse] = []

    class Config:
        from_attributes = True
