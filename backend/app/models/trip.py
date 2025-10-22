from app.core.database import Base
from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

class Trip(Base):
    __tablename__ = "trips"

    trip_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    name = Column(String(100), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    
    user = relationship("User", back_populates="trips")
    activities = relationship("Activity", back_populates="trip")
    
    
class TripActivity(Base):
    __tablename__ = "trip_activities"

    trip_activity_id = Column(Integer, primary_key=True)
    trip_id = Column(Integer, ForeignKey("trips.trip_id", ondelete="CASCADE"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.flight_id", ondelete="SET NULL"))
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="SET NULL"))
    place_id = Column(Integer, ForeignKey("places.place_id", ondelete="SET NULL"))
    scheduled_date = Column(TIMESTAMP)

    trip = relationship("Trip", back_populates="activities")
    flight = relationship("Flight", back_populates="activities")
    service = relationship("Service", back_populates="activities")
    place = relationship("Place", back_populates="activities")