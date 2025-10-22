from sqlalchemy.orm import Session

from app.models.forecast import RevenueForecast


def get_latest_forecasts(db: Session):
    return db.query(RevenueForecast).order_by(RevenueForecast.forecast_date.desc()).first
    
def get_all_forecasts(db: Session):
    return db.query(RevenueForecast).all()
    
def create_forecast(db: Session, data: RevenueForecast):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data