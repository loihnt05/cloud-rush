from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.forecast import RevenueForecast, RevenueMetrics
from datetime import date
from typing import Optional


# Revenue Forecast Repository
def get_latest_forecasts(db: Session, limit: int = 10):
    return db.query(RevenueForecast).order_by(RevenueForecast.forecast_date.desc()).limit(limit).all()
    
def get_all_forecasts(db: Session):
    return db.query(RevenueForecast).order_by(RevenueForecast.forecast_date.desc()).all()
    
def get_forecasts_by_date_range(db: Session, start_date: date, end_date: date):
    return db.query(RevenueForecast).filter(
        and_(
            RevenueForecast.forecast_date >= start_date,
            RevenueForecast.forecast_date <= end_date
        )
    ).order_by(RevenueForecast.forecast_date).all()

def get_forecast_by_date(db: Session, forecast_date: date):
    return db.query(RevenueForecast).filter(
        RevenueForecast.forecast_date == forecast_date
    ).first()
    
def create_forecast(db: Session, data: RevenueForecast):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

def update_forecast_actual(db: Session, forecast_id: int, actual_revenue: float):
    """Update forecast with actual revenue for accuracy tracking"""
    forecast = db.query(RevenueForecast).filter(
        RevenueForecast.forecast_id == forecast_id
    ).first()
    if forecast:
        forecast.actual_revenue = actual_revenue
        db.commit()
        db.refresh(forecast)
    return forecast


# Revenue Metrics Repository
def get_all_metrics(db: Session):
    return db.query(RevenueMetrics).order_by(RevenueMetrics.date.desc()).all()

def get_metrics_by_date_range(db: Session, start_date: date, end_date: date):
    return db.query(RevenueMetrics).filter(
        and_(
            RevenueMetrics.date >= start_date,
            RevenueMetrics.date <= end_date
        )
    ).order_by(RevenueMetrics.date).all()

def get_metric_by_date(db: Session, metric_date: date):
    return db.query(RevenueMetrics).filter(
        RevenueMetrics.date == metric_date
    ).first()

def create_metric(db: Session, data: RevenueMetrics):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

def update_metric(db: Session, metric_id: int, data: dict):
    metric = db.query(RevenueMetrics).filter(
        RevenueMetrics.metric_id == metric_id
    ).first()
    if metric:
        for key, value in data.items():
            if hasattr(metric, key):
                setattr(metric, key, value)
        db.commit()
        db.refresh(metric)
    return metric

def get_metrics_summary(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None):
    """Get aggregated metrics summary"""
    query = db.query(
        func.sum(RevenueMetrics.actual_revenue).label('total_revenue'),
        func.avg(RevenueMetrics.actual_revenue).label('avg_revenue'),
        func.sum(RevenueMetrics.booking_count).label('total_bookings'),
        func.sum(RevenueMetrics.passenger_count).label('total_passengers'),
        func.avg(RevenueMetrics.average_ticket_price).label('avg_ticket_price'),
        func.sum(RevenueMetrics.cancellation_count).label('total_cancellations'),
        func.sum(RevenueMetrics.refund_amount).label('total_refunds'),
    )
    
    if start_date and end_date:
        query = query.filter(
            and_(
                RevenueMetrics.date >= start_date,
                RevenueMetrics.date <= end_date
            )
        )
    
    return query.first()