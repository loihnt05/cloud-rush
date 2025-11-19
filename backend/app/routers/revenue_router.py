from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import verify_jwt, verify_admin
from app.schemas.revenue_schema import (
    RevenueForecastCreate, 
    RevenueForecastResponse,
    RevenueMetricsCreate,
    RevenueMetricsResponse,
    PredictionRequest,
    RevenuePredictionResult,
    RevenueAnalytics
)
from app.services.revenue_service import RevenueService
from datetime import date, timedelta
from typing import Optional

router = APIRouter(prefix="/revenue", tags=["Revenue Forecast"])


# ============ FORECAST ENDPOINTS ============
@router.post("/forecasts", response_model=RevenueForecastResponse)
def create_forecast(
    forecast: RevenueForecastCreate, 
    db: Session = Depends(get_db), 
    payload: dict = Depends(verify_admin)
):
    """Create a new revenue forecast manually"""
    try:
        return RevenueService(db).create_forecast(forecast)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/forecasts", response_model=list[RevenueForecastResponse])
def get_forecasts(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db), 
    payload: dict = Depends(verify_admin)
):
    """Get revenue forecasts, optionally filtered by date range"""
    service = RevenueService(db)
    if start_date and end_date:
        return service.get_forecasts_by_date_range(start_date, end_date)
    return service.get_all_forecasts()


@router.get("/forecasts/latest", response_model=list[RevenueForecastResponse])
def get_latest_forecasts(
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db), 
    payload: dict = Depends(verify_admin)
):
    """Get the most recent revenue forecasts"""
    return RevenueService(db).get_latest_forecast(limit)


# ============ PREDICTION ENDPOINTS ============
@router.post("/predict", response_model=RevenuePredictionResult)
def generate_revenue_predictions(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Generate revenue predictions using specified model
    
    Models available:
    - linear_regression: Uses historical trend analysis
    - moving_average: Uses recent average revenue
    - growth_based: Projects based on growth rate
    """
    try:
        return RevenueService(db).generate_predictions(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/predict/quick", response_model=list[RevenueForecastResponse])
def quick_prediction(
    days: int = Query(default=30, ge=1, le=365),
    model: str = Query(default="linear_regression", regex="^(linear_regression|moving_average|growth_based)$"),
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Quick revenue prediction for next N days
    
    - days: Number of days to predict (1-365)
    - model: Prediction model to use
    """
    try:
        service = RevenueService(db)
        
        if model == "moving_average":
            return service.predict_revenue_moving_average(days)
        elif model == "growth_based":
            return service.predict_revenue_growth_based(days)
        else:
            return service.predict_revenue_linear_regression(days)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ METRICS ENDPOINTS ============
@router.post("/metrics", response_model=RevenueMetricsResponse)
def create_metric(
    metric: RevenueMetricsCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Create a new revenue metric record"""
    try:
        return RevenueService(db).create_metric(metric)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metrics", response_model=list[RevenueMetricsResponse])
def get_metrics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Get revenue metrics, optionally filtered by date range"""
    service = RevenueService(db)
    if start_date and end_date:
        return service.get_metrics_by_date_range(start_date, end_date)
    return service.get_all_metrics()


@router.post("/metrics/collect/{target_date}", response_model=RevenueMetricsResponse)
def collect_metrics_for_date(
    target_date: date,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Collect and store actual revenue metrics for a specific date
    
    This analyzes bookings, payments, passengers, and flights for the date
    """
    try:
        return RevenueService(db).collect_daily_metrics(target_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/metrics/collect-range", response_model=list[RevenueMetricsResponse])
def collect_metrics_range(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Collect metrics for a date range"""
    try:
        service = RevenueService(db)
        metrics = []
        
        current_date = start_date
        while current_date <= end_date:
            metric = service.collect_daily_metrics(current_date)
            metrics.append(metric)
            current_date += timedelta(days=1)
        
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ ANALYTICS ENDPOINTS ============
@router.get("/analytics", response_model=RevenueAnalytics)
def get_revenue_analytics(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_admin)
):
    """Get comprehensive revenue analytics and statistics
    
    Provides:
    - Total and average revenue
    - Booking and passenger statistics
    - Growth rate and trend analysis
    - Best and worst performing days
    """
    try:
        return RevenueService(db).get_revenue_analytics(start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ LEGACY ENDPOINTS (for backward compatibility) ============
@router.post("/", response_model=RevenueForecastResponse)
def create_forecast_legacy(
    forecast: RevenueForecastCreate, 
    db: Session = Depends(get_db), 
    payload: dict = Depends(verify_admin)
):
    """Legacy endpoint - use /forecasts instead"""
    return RevenueService(db).create_forecast(forecast)


@router.get("/", response_model=list[RevenueForecastResponse])
def get_forecasts_legacy(
    db: Session = Depends(get_db), 
    payload: dict = Depends(verify_admin)
):
    """Legacy endpoint - use /forecasts instead"""
    return RevenueService(db).get_all_forecasts()
