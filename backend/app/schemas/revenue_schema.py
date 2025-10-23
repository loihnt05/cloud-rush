from pydantic import BaseModel
from decimal import Decimal
from typing import Optional
from datetime import date, datetime

class RevenueForecastCreate(BaseModel):
    forecast_date: date
    predicted_revenue: Decimal
    model_used: Optional[str] = None

class RevenueForecastResponse(BaseModel):
    forecast_id: int
    forecast_date: date
    predicted_revenue: Decimal
    model_used: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
