from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.forecast import RevenueForecast, RevenueMetrics
from app.models.booking import Booking, Payment
from app.models.passenger import Passenger
from app.models.flight import Flight
from app.models.refund import Refund
from app.repositories import revenue_forecast_repository
from app.schemas.revenue_schema import (
    RevenueForecastCreate, 
    RevenueMetricsCreate, 
    PredictionRequest,
    RevenuePredictionResult,
    RevenueAnalytics
)
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional
import json
import math


class RevenueService:
    def __init__(self, db: Session):
        self.db = db
    
    # ============ FORECAST CRUD ============
    def get_all_forecasts(self):
        """Get all revenue forecasts"""
        return revenue_forecast_repository.get_all_forecasts(self.db)
    
    def get_latest_forecast(self, limit: int = 10):
        """Get the latest revenue forecasts"""
        return revenue_forecast_repository.get_latest_forecasts(self.db, limit)
    
    def get_forecasts_by_date_range(self, start_date: date, end_date: date):
        """Get forecasts within a date range"""
        return revenue_forecast_repository.get_forecasts_by_date_range(self.db, start_date, end_date)
    
    def create_forecast(self, forecast_data: RevenueForecastCreate):
        """Create a new revenue forecast"""
        forecast_dict = forecast_data.model_dump()
        forecast_dict['created_at'] = datetime.now()
        forecast = RevenueForecast(**forecast_dict)
        return revenue_forecast_repository.create_forecast(self.db, forecast)
    
    # ============ METRICS CRUD ============
    def get_all_metrics(self):
        """Get all revenue metrics"""
        return revenue_forecast_repository.get_all_metrics(self.db)
    
    def get_metrics_by_date_range(self, start_date: date, end_date: date):
        """Get metrics within a date range"""
        return revenue_forecast_repository.get_metrics_by_date_range(self.db, start_date, end_date)
    
    def create_metric(self, metric_data: RevenueMetricsCreate):
        """Create a new revenue metric"""
        metric_dict = metric_data.model_dump()
        metric_dict['created_at'] = datetime.now()
        metric = RevenueMetrics(**metric_dict)
        return revenue_forecast_repository.create_metric(self.db, metric)
    
    # ============ DATA COLLECTION ============
    def collect_daily_metrics(self, target_date: date) -> RevenueMetrics:
        """Collect actual metrics for a specific date"""
        # Get all confirmed bookings for the date
        bookings = self.db.query(Booking).filter(
            and_(
                func.date(Booking.booking_date) == target_date,
                Booking.status == 'confirmed'
            )
        ).all()
        
        # Get successful payments for the date
        payments = self.db.query(Payment).filter(
            and_(
                func.date(Payment.payment_date) == target_date,
                Payment.status == 'success'
            )
        ).all()
        
        # Get passengers count
        passenger_count = self.db.query(func.count(Passenger.passenger_id)).join(
            Booking
        ).filter(
            and_(
                func.date(Booking.booking_date) == target_date,
                Booking.status == 'confirmed'
            )
        ).scalar() or 0
        
        # Get flights count
        flight_count = self.db.query(func.count(Flight.flight_id)).filter(
            func.date(Flight.departure_time) == target_date
        ).scalar() or 0
        
        # Get cancellations and refunds
        cancellations = self.db.query(Booking).filter(
            and_(
                func.date(Booking.booking_date) == target_date,
                Booking.status == 'cancelled'
            )
        ).count()
        
        refunds = self.db.query(func.sum(Refund.refund_amount)).filter(
            func.date(Refund.requested_at) == target_date
        ).scalar() or Decimal("0.00")
        
        # Calculate metrics
        actual_revenue = sum(float(p.amount) for p in payments)
        booking_count = len(bookings)
        avg_ticket_price = Decimal(str(actual_revenue / passenger_count)) if passenger_count > 0 else Decimal("0.00")
        
        # Create metric record
        metric = RevenueMetrics(
            date=target_date,
            actual_revenue=Decimal(str(actual_revenue)),
            booking_count=booking_count,
            passenger_count=passenger_count,
            average_ticket_price=avg_ticket_price,
            flight_count=flight_count,
            cancellation_count=cancellations,
            refund_amount=refunds,
            created_at=datetime.now()
        )
        
        return revenue_forecast_repository.create_metric(self.db, metric)
    
    # ============ PREDICTION MODELS ============
    def predict_revenue_linear_regression(self, days_ahead: int = 30) -> List[RevenueForecast]:
        """Predict revenue using linear regression on historical data"""
        # Get historical metrics
        end_date = date.today()
        start_date = end_date - timedelta(days=90)  # Use last 90 days
        historical_metrics = revenue_forecast_repository.get_metrics_by_date_range(
            self.db, start_date, end_date
        )
        
        if len(historical_metrics) < 7:
            # Not enough data, use simple moving average
            return self.predict_revenue_moving_average(days_ahead)
        
        # Prepare data for linear regression
        x_values = []
        y_values = []
        for i, metric in enumerate(historical_metrics):
            x_values.append(i)
            y_values.append(float(metric.actual_revenue))
        
        # Calculate linear regression coefficients (y = mx + b)
        n = len(x_values)
        sum_x = sum(x_values)
        sum_y = sum(y_values)
        sum_xy = sum(x * y for x, y in zip(x_values, y_values))
        sum_x2 = sum(x * x for x in x_values)
        
        # Slope (m)
        m = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x)
        # Intercept (b)
        b = (sum_y - m * sum_x) / n
        
        # Calculate R-squared for confidence
        mean_y = sum_y / n
        ss_tot = sum((y - mean_y) ** 2 for y in y_values)
        ss_res = sum((y - (m * x + b)) ** 2 for x, y in zip(x_values, y_values))
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Generate predictions
        forecasts = []
        base_x = len(x_values)
        
        for day in range(1, days_ahead + 1):
            forecast_date = date.today() + timedelta(days=day)
            x = base_x + day
            predicted_value = m * x + b
            
            # Ensure non-negative
            predicted_value = max(0, predicted_value)
            
            # Add some randomness based on historical variance
            std_dev = math.sqrt(ss_res / n) if n > 0 else 0
            confidence = min(100, r_squared * 100)
            
            forecast = RevenueForecast(
                forecast_date=forecast_date,
                predicted_revenue=Decimal(str(round(predicted_value, 2))),
                confidence_score=round(confidence, 2),
                model_used="linear_regression",
                model_version="1.0",
                prediction_type="daily",
                features_used=json.dumps({
                    "historical_days": len(historical_metrics),
                    "r_squared": round(r_squared, 4),
                    "slope": round(m, 4),
                    "intercept": round(b, 2)
                }),
                created_at=datetime.now()
            )
            
            forecasts.append(
                revenue_forecast_repository.create_forecast(self.db, forecast)
            )
        
        return forecasts
    
    def predict_revenue_moving_average(self, days_ahead: int = 30, window: int = 7) -> List[RevenueForecast]:
        """Predict revenue using moving average"""
        # Get historical metrics
        end_date = date.today()
        start_date = end_date - timedelta(days=window * 2)
        historical_metrics = revenue_forecast_repository.get_metrics_by_date_range(
            self.db, start_date, end_date
        )
        
        if len(historical_metrics) == 0:
            # No historical data, return default predictions
            return self._create_default_predictions(days_ahead)
        
        # Calculate moving average
        recent_revenues = [float(m.actual_revenue) for m in historical_metrics[-window:]]
        avg_revenue = sum(recent_revenues) / len(recent_revenues)
        
        # Calculate standard deviation for confidence
        variance = sum((x - avg_revenue) ** 2 for x in recent_revenues) / len(recent_revenues)
        std_dev = math.sqrt(variance)
        confidence = max(50, 100 - (std_dev / avg_revenue * 100)) if avg_revenue > 0 else 50
        
        # Generate predictions
        forecasts = []
        for day in range(1, days_ahead + 1):
            forecast_date = date.today() + timedelta(days=day)
            
            forecast = RevenueForecast(
                forecast_date=forecast_date,
                predicted_revenue=Decimal(str(round(avg_revenue, 2))),
                confidence_score=round(confidence, 2),
                model_used="moving_average",
                model_version="1.0",
                prediction_type="daily",
                features_used=json.dumps({
                    "window_size": window,
                    "historical_count": len(historical_metrics),
                    "avg_revenue": round(avg_revenue, 2),
                    "std_dev": round(std_dev, 2)
                }),
                created_at=datetime.now()
            )
            
            forecasts.append(
                revenue_forecast_repository.create_forecast(self.db, forecast)
            )
        
        return forecasts
    
    def predict_revenue_growth_based(self, days_ahead: int = 30) -> List[RevenueForecast]:
        """Predict revenue based on historical growth rate"""
        # Get metrics from last 60 days
        end_date = date.today()
        start_date = end_date - timedelta(days=60)
        historical_metrics = revenue_forecast_repository.get_metrics_by_date_range(
            self.db, start_date, end_date
        )
        
        if len(historical_metrics) < 14:
            return self.predict_revenue_moving_average(days_ahead)
        
        # Calculate growth rate
        first_half = historical_metrics[:len(historical_metrics)//2]
        second_half = historical_metrics[len(historical_metrics)//2:]
        
        first_avg = sum(float(m.actual_revenue) for m in first_half) / len(first_half)
        second_avg = sum(float(m.actual_revenue) for m in second_half) / len(second_half)
        
        growth_rate = (second_avg - first_avg) / first_avg if first_avg > 0 else 0.05
        
        # Use recent average as base
        recent_avg = sum(float(m.actual_revenue) for m in historical_metrics[-7:]) / 7
        
        # Generate predictions with growth
        forecasts = []
        for day in range(1, days_ahead + 1):
            forecast_date = date.today() + timedelta(days=day)
            
            # Apply growth rate exponentially
            predicted_value = recent_avg * (1 + growth_rate) ** (day / 7)
            
            confidence = max(40, 80 - abs(growth_rate * 1000))
            
            forecast = RevenueForecast(
                forecast_date=forecast_date,
                predicted_revenue=Decimal(str(round(predicted_value, 2))),
                confidence_score=round(confidence, 2),
                model_used="growth_based",
                model_version="1.0",
                prediction_type="daily",
                features_used=json.dumps({
                    "growth_rate": round(growth_rate * 100, 2),
                    "base_revenue": round(recent_avg, 2),
                    "historical_count": len(historical_metrics)
                }),
                created_at=datetime.now()
            )
            
            forecasts.append(
                revenue_forecast_repository.create_forecast(self.db, forecast)
            )
        
        return forecasts
    
    def generate_predictions(self, request: PredictionRequest) -> RevenuePredictionResult:
        """Generate revenue predictions based on request"""
        days_ahead = (request.end_date - request.start_date).days + 1
        
        # Select prediction model
        if request.model_type == "moving_average":
            forecasts = self.predict_revenue_moving_average(days_ahead)
        elif request.model_type == "growth_based":
            forecasts = self.predict_revenue_growth_based(days_ahead)
        else:  # linear_regression (default)
            forecasts = self.predict_revenue_linear_regression(days_ahead)
        
        # Calculate metrics
        total_predicted = sum(float(f.predicted_revenue) for f in forecasts)
        avg_confidence = sum(f.confidence_score or 0 for f in forecasts) / len(forecasts) if forecasts else 0
        
        from app.schemas.revenue_schema import RevenueForecastResponse
        forecast_responses = [
            RevenueForecastResponse.model_validate(f) for f in forecasts
        ]
        
        return RevenuePredictionResult(
            predictions=forecast_responses,
            metrics={
                "total_predicted_revenue": round(total_predicted, 2),
                "average_daily_revenue": round(total_predicted / days_ahead, 2) if days_ahead > 0 else 0,
                "prediction_count": len(forecasts),
                "date_range": f"{request.start_date} to {request.end_date}"
            },
            model_info={
                "model_type": request.model_type,
                "prediction_type": request.prediction_type,
                "average_confidence": round(avg_confidence, 2)
            }
        )
    
    def get_revenue_analytics(self, start_date: Optional[date] = None, end_date: Optional[date] = None) -> RevenueAnalytics:
        """Get comprehensive revenue analytics"""
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get metrics summary
        summary = revenue_forecast_repository.get_metrics_summary(self.db, start_date, end_date)
        metrics = revenue_forecast_repository.get_metrics_by_date_range(self.db, start_date, end_date)
        
        # Calculate trend
        if len(metrics) >= 2:
            first_half = metrics[:len(metrics)//2]
            second_half = metrics[len(metrics)//2:]
            first_avg = sum(float(m.actual_revenue) for m in first_half) / len(first_half) if first_half else 0
            second_avg = sum(float(m.actual_revenue) for m in second_half) / len(second_half) if second_half else 0
            growth_rate = ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
            
            if growth_rate > 5:
                trend = "increasing"
            elif growth_rate < -5:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            growth_rate = 0
            trend = "stable"
        
        # Find best and worst days
        best_day = max(metrics, key=lambda m: m.actual_revenue).date if metrics else None
        worst_day = min(metrics, key=lambda m: m.actual_revenue).date if metrics else None
        
        total_revenue = summary.total_revenue or Decimal("0.00")
        avg_revenue = summary.avg_revenue or Decimal("0.00")
        total_bookings = summary.total_bookings or 0
        total_passengers = summary.total_passengers or 0
        avg_ticket = summary.avg_ticket_price or Decimal("0.00")
        
        return RevenueAnalytics(
            total_revenue=total_revenue,
            average_daily_revenue=avg_revenue,
            total_bookings=total_bookings,
            total_passengers=total_passengers,
            average_ticket_price=avg_ticket,
            growth_rate=round(growth_rate, 2),
            trend=trend,
            best_day=best_day,
            worst_day=worst_day
        )
    
    def _create_default_predictions(self, days_ahead: int) -> List[RevenueForecast]:
        """Create default predictions when no historical data exists"""
        forecasts = []
        default_revenue = 5000.0  # Default daily revenue estimate
        
        for day in range(1, days_ahead + 1):
            forecast_date = date.today() + timedelta(days=day)
            
            forecast = RevenueForecast(
                forecast_date=forecast_date,
                predicted_revenue=Decimal(str(default_revenue)),
                confidence_score=30.0,
                model_used="default",
                model_version="1.0",
                prediction_type="daily",
                features_used=json.dumps({"note": "Insufficient historical data"}),
                created_at=datetime.now()
            )
            
            forecasts.append(
                revenue_forecast_repository.create_forecast(self.db, forecast)
            )
        
        return forecasts
