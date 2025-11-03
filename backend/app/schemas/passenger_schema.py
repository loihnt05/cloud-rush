from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum


class PassengerType(str, Enum):
    adult = "adult"
    child = "child"
    infant = "infant"


class PassengerCreate(BaseModel):
    booking_id: int
    passenger_type: PassengerType
    
    # Personal Information
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    suffix: Optional[str] = None
    date_of_birth: date
    
    # Contact Information
    email: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Travel Documents
    redress_number: Optional[str] = None
    known_traveler_number: Optional[str] = None
    
    # Seat Assignment
    flight_seat_id: Optional[int] = None
    
    # Special Requirements
    special_requests: Optional[str] = None


class PassengerUpdate(BaseModel):
    passenger_type: Optional[PassengerType] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    suffix: Optional[str] = None
    date_of_birth: Optional[date] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    redress_number: Optional[str] = None
    known_traveler_number: Optional[str] = None
    flight_seat_id: Optional[int] = None
    special_requests: Optional[str] = None


class PassengerResponse(BaseModel):
    passenger_id: int
    booking_id: int
    passenger_type: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    suffix: Optional[str] = None
    date_of_birth: date
    email: Optional[str] = None
    phone_number: Optional[str] = None
    redress_number: Optional[str] = None
    known_traveler_number: Optional[str] = None
    flight_seat_id: Optional[int] = None
    special_requests: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
