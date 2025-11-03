from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EmergencyContactCreate(BaseModel):
    passenger_id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: str
    relationship_type: Optional[str] = None  # spouse, parent, sibling, friend, etc.


class EmergencyContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    relationship_type: Optional[str] = None


class EmergencyContactResponse(BaseModel):
    contact_id: int
    passenger_id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone_number: str
    relationship_type: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
