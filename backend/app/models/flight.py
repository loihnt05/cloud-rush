from sqlalchemy import DECIMAL, TIMESTAMP, Column, ForeignKey, Integer, String, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
from .base import Base

Base = declarative_base()


class Flight(Base):
    __tablename__ = "flights"

    flight_id = Column(Integer, primary_key=True)
    flight_number = Column(String(20), unique=True, nullable=False)
    airplane_id = Column(Integer, ForeignKey(
        "airplanes.airplane_id", ondelete="SET NULL"))
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(TIMESTAMP, nullable=False)
    arrival_time = Column(TIMESTAMP, nullable=False)
    base_price = Column(DECIMAL(10, 2), nullable=False)

    airplane = relationship("Airplane", back_populates="flights")
    bookings = relationship("Booking", back_populates="flight")
    activities = relationship("TripActivity", back_populates="flight")
