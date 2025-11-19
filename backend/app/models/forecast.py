from sqlalchemy import DECIMAL, TIMESTAMP, Column, Date, Integer, String, Text, Float, CheckConstraint
from app.core.database import Base


class RevenueForecast(Base):
    __tablename__ = "revenue_forecasts"

    forecast_id = Column(Integer, primary_key=True)
    forecast_date = Column(Date, nullable=False)
    predicted_revenue = Column(DECIMAL(12, 2), nullable=False)
    actual_revenue = Column(DECIMAL(12, 2))  # Actual revenue for comparison
    confidence_score = Column(Float)  # Prediction confidence (0-100)
    model_used = Column(String(100))
    model_version = Column(String(50))
    prediction_type = Column(String(50), default="daily")  # daily, weekly, monthly
    features_used = Column(Text)  # JSON string of features
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default="NOW()")
    
    __table_args__ = (
        CheckConstraint("prediction_type IN ('daily','weekly','monthly','yearly')"),
        CheckConstraint("confidence_score >= 0 AND confidence_score <= 100"),
    )


class RevenueMetrics(Base):
    __tablename__ = "revenue_metrics"
    
    metric_id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    actual_revenue = Column(DECIMAL(12, 2), nullable=False)
    booking_count = Column(Integer, default=0)
    passenger_count = Column(Integer, default=0)
    average_ticket_price = Column(DECIMAL(10, 2))
    flight_count = Column(Integer, default=0)
    cancellation_count = Column(Integer, default=0)
    refund_amount = Column(DECIMAL(12, 2), default=0)
    notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default="NOW()")