from sqlalchemy.orm import Session
from repositories import trip_repository, trip_activity_repository
from models.trip import Trip, TripActivity
from datetime import datetime

def create_trip(db: Session, user_id: str, name: str, start_date, end_date):
    trip = Trip(user_id=user_id, name=name, start_date=start_date, end_date=end_date)
    return trip_repository.create_trip(db, trip)

def add_trip_activity(db: Session, trip_id: int, flight_id=None, service_id=None, place_id=None, scheduled_time=None):
    activity = TripActivity(
        trip_id=trip_id,
        flight_id=flight_id,
        service_id=service_id,
        place_id=place_id,
        scheduled_time=scheduled_time or datetime.now()
    )
    return trip_activity_repository.create_activity(db, activity)

def get_trip_activities(db: Session, trip_id: int):
    return trip_activity_repository.get_activities_by_trip(db, trip_id)