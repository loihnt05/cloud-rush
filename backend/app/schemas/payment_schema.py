from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import datetime

class PaymentCreate(BaseModel):
    booking_id: int
    amount: Decimal
    method: Optional[str] = "credit_card"
    status: Optional[str] = "pending"

class PaymentResponse(BaseModel):
    payment_id: int
    booking_id: int
    amount: Decimal
    payment_date: Optional[datetime] = None
    method: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
