from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, Integer, String, Text
from app.core.database import Base
from sqlalchemy.orm import relationship


class TripPlan(Base):
    __tablename__ = "trip_plans"

    plan_id = Column(Integer, primary_key=True)
    user_id = Column(String(255), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    start_date = Column(Date)
    end_date = Column(Date)
    notes = Column(Text)

    user = relationship("User", back_populates="trip_plans")
    trip_plan_items = relationship("TripPlanItem", back_populates="trip_plan")


class TripPlanItem(Base):
    __tablename__ = "trip_plan_items"

    plan_item_id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("trip_plans.plan_id", ondelete="CASCADE"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.flight_id", ondelete="SET NULL"))
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="SET NULL"))
    place_id = Column(Integer, ForeignKey("places.place_id", ondelete="SET NULL"))
    scheduled_time = Column(TIMESTAMP)

    trip_plan = relationship("TripPlan", back_populates="trip_plan_items")
    flight = relationship("Flight", back_populates="trip_plan_items")
    service = relationship("Service", back_populates="trip_plan_items")
    place = relationship("Place", back_populates="trip_plan_items")
