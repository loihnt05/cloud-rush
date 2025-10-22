from sqlalchemy import DECIMAL, TIMESTAMP, Column, Date, Integer, String
from app.core.database import Base


class RevenueForecast(Base):
    __tablename__ = "revenue_forecasts"

    forecast_id = Column(Integer, primary_key=True)
    forecast_date = Column(Date, nullable=False)
    predicted_revenue = Column(DECIMAL(12, 2), nullable=False)
    model_used = Column(String(100))
    created_at = Column(TIMESTAMP, server_default="NOW()")