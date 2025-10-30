from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt
from app.schemas.revenue_schema import RevenueForecastCreate, RevenueForecastResponse
from app.services.revenue_service import RevenueService

router = APIRouter(prefix="/revenue", tags=["Revenue Forecast"])


@router.post("/", response_model=RevenueForecastResponse)
def create_forecast(forecast: RevenueForecastCreate, db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    return RevenueService(db).create_forecast(forecast)


@router.get("/", response_model=list[RevenueForecastResponse])
def get_forecasts(db: Session = Depends(get_db), payload: dict = Depends(verify_jwt)):
    return RevenueService(db).get_all_forecasts()
