from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    google_id: str | None = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    google_id: str | None = None

    class Config:
        from_attributes = True
