from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    provider: str
    provider_id: str
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    role_id: Optional[int] = None
    status: Optional[str] = "active"
    two_factor_enabled: Optional[bool] = False
    preferences: Optional[dict] = None

class UserResponse(BaseModel):
    user_id: UUID
    provider: str
    provider_id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    role_id: Optional[int] = None
    status: str
    last_login_at: Optional[datetime] = None
    two_factor_enabled: bool
    preferences: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
