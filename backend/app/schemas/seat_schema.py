from pydantic import BaseModel, field_validator
from typing import Optional, Literal

class SeatCreate(BaseModel):
    airplane_id: int
    seat_number: str
    seat_class: Literal['economy', 'business', 'first']

    @field_validator('seat_number')
    @classmethod
    def validate_seat_number(cls, v: str) -> str:
        if len(v) > 10:
            raise ValueError('Seat number must be 10 characters or less')
        return v

class SeatResponse(BaseModel):
    seat_id: int
    airplane_id: int
    seat_number: str
    seat_class: str

    class Config:
        from_attributes = True