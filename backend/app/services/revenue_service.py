from sqlalchemy.orm import Session
from app.models.forecast import RevenueForecast
from app.repositories import payment_repository, revenue_forecast_repository
from app.schemas.revenue_schema import RevenueForecastCreate
from datetime import date, datetime
import random

class RevenueService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_forecasts(self):
        """Get all revenue forecasts"""
        return revenue_forecast_repository.get_all_forecasts(self.db)
    
    def get_latest_forecast(self):
        """Get the latest revenue forecast"""
        return revenue_forecast_repository.get_latest_forecasts(self.db)
    
    def create_forecast(self, forecast_data: RevenueForecastCreate):
        """Create a new revenue forecast"""
        # Convert Pydantic model to dict
        forecast_dict = forecast_data.model_dump()
        forecast_dict['created_at'] = datetime.now()
        
        # Create forecast instance
        forecast = RevenueForecast(**forecast_dict)
        
        return revenue_forecast_repository.create_forecast(self.db, forecast)
    
    def predict_revenue(self):
        """Predict revenue based on payments (mock implementation)"""
        # Example mock: sum payments + random growth
        payments = payment_repository.get_all_payments(self.db)
        total = sum(float(p.amount) for p in payments)
        predicted = total * (1 + random.uniform(0.05, 0.15))  # +5% to +15%
        
        forecast = RevenueForecast(
            forecast_date=date.today(),
            predicted_revenue=predicted,
            model_used="mock_linear_regression",
            created_at=datetime.now()
        )
        
        return revenue_forecast_repository.create_forecast(self.db, forecast)
