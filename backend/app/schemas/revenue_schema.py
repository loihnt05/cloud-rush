from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional
from datetime import date, datetime

class RevenueForecastCreate(BaseModel):
    forecast_date: date
    predicted_revenue: Decimal
    confidence_score: Optional[float] = None
    model_used: Optional[str] = None
    model_version: Optional[str] = None
    prediction_type: Optional[str] = "daily"
    features_used: Optional[str] = None
    notes: Optional[str] = None

class RevenueForecastResponse(BaseModel):
    forecast_id: int
    forecast_date: date
    predicted_revenue: Decimal
    actual_revenue: Optional[Decimal] = None
    confidence_score: Optional[float] = None
    model_used: Optional[str] = None
    model_version: Optional[str] = None
    prediction_type: Optional[str] = None
    features_used: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RevenueMetricsCreate(BaseModel):
    date: date
    actual_revenue: Decimal
    booking_count: int = 0
    passenger_count: int = 0
    average_ticket_price: Optional[Decimal] = None
    flight_count: int = 0
    cancellation_count: int = 0
    refund_amount: Decimal = Decimal("0.00")
    notes: Optional[str] = None


class RevenueMetricsResponse(BaseModel):
    metric_id: int
    date: date
    actual_revenue: Decimal
    booking_count: int
    passenger_count: int
    average_ticket_price: Optional[Decimal] = None
    flight_count: int
    cancellation_count: int
    refund_amount: Decimal
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    """Request to generate revenue predictions"""
    start_date: date
    end_date: date
    prediction_type: str = Field(default="daily", description="daily, weekly, monthly")
    model_type: str = Field(default="linear_regression", description="linear_regression, moving_average, prophet")


class RevenuePredictionResult(BaseModel):
    """Result of revenue prediction"""
    predictions: list[RevenueForecastResponse]
    metrics: dict
    model_info: dict
    accuracy: Optional[float] = None


class RevenueAnalytics(BaseModel):
    """Revenue analytics and statistics"""
    total_revenue: Decimal
    average_daily_revenue: Decimal
    total_bookings: int
    total_passengers: int
    average_ticket_price: Decimal
    growth_rate: Optional[float] = None
    trend: Optional[str] = None  # "increasing", "decreasing", "stable"
    best_day: Optional[date] = None
    worst_day: Optional[date] = None
