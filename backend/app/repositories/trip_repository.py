from sqlalchemy.orm import Session

from app.models.trip import Trip

def get_user_trips(db: Session, user_id: int):
    return db.query(Trip).filter(Trip.user_id == user_id).all()

def create_trip(db: Session, data: Trip):
    db.add(data)
    db.commit()
    db.refresh(data)
    return data