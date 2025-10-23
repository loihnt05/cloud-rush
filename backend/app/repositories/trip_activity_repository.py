from app.models.trip import TripActivity
from sqlalchemy.orm import Session

def get_activities_by_trip(db: Session, trip_id: int):
    return db.query(TripActivity).filter(TripActivity.trip_id == trip_id).all()
    
def create_activity(db: Session, activity_data: TripActivity):
    db.add(activity_data)
    db.commit()
    db.refresh(activity_data)
    return activity_data