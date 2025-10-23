from sqlalchemy.orm import Session
from app.models.forecast import RevenueForecast
from repositories import payment_repository, revenue_forecast_repository
from datetime import date, datetime
import random

def get_revenue_forecasts(db: Session):
    return revenue_forecast_repository.get_all_forecasts(db)

def predict_revenue(db: Session):
    # Example mock: sum payments + random growth
    payments = payment_repository.get_payments(db)
    total = sum(p.amount for p in payments)
    predicted = total * (1 + random.uniform(0.05, 0.15))  # +5% to +15%

    forecast = RevenueForecast(
        forecast_date=date.today(),
        predicted_revenue=predicted,
        model_used="mock_linear_regression",
        created_at=datetime.now()
    )
    return revenue_forecast_repository.create_forecast(db, forecast)
