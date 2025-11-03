from sqlalchemy import DECIMAL, TIMESTAMP, CheckConstraint, Column, ForeignKey, Integer, String, DateTime, Numeric, UniqueConstraint
from app.core.database import Base
from sqlalchemy.orm import relationship


class FlightSeat(Base):
    __tablename__ = "flight_seats"

    flight_seat_id = Column(Integer, primary_key=True)
    flight_id = Column(Integer, ForeignKey("flights.flight_id", ondelete="CASCADE"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.seat_id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="available")
    price_multiplier = Column(DECIMAL(5, 2), default=1.0)

    __table_args__ = (
        CheckConstraint("status IN ('available', 'reserved', 'booked')"),
        UniqueConstraint('flight_id', 'seat_id', name='uq_flight_seat'),
    )

    flight = relationship("Flight", back_populates="flight_seats")
    seat = relationship("Seat", back_populates="flight_seats")
    passengers = relationship("Passenger", back_populates="flight_seat")


class Flight(Base):
    __tablename__ = "flights"

    flight_id = Column(Integer, primary_key=True)
    flight_number = Column(String(20), nullable=False)
    airplane_id = Column(Integer, ForeignKey(
        "airplanes.airplane_id", ondelete="SET NULL"))
    origin_airport_id = Column(Integer, ForeignKey("airports.airport_id"), nullable=False)
    destination_airport_id = Column(Integer, ForeignKey("airports.airport_id"), nullable=False)
    departure_time = Column(TIMESTAMP, nullable=False)
    arrival_time = Column(TIMESTAMP, nullable=False)
    status = Column(String(20), default="scheduled")
    base_price = Column(DECIMAL(10, 2), nullable=False)
    tax_rate = Column(DECIMAL(5, 2), default=0.15)

    __table_args__ = (
        CheckConstraint("status IN ('scheduled','delayed','cancelled','completed')"),
    )

    airplane = relationship("Airplane", back_populates="flights")
    origin_airport = relationship("Airport", foreign_keys=[origin_airport_id], back_populates="origin_flights")
    destination_airport = relationship("Airport", foreign_keys=[destination_airport_id], back_populates="destination_flights")
    flight_seats = relationship("FlightSeat", back_populates="flight")
    trip_plan_items = relationship("TripPlanItem", back_populates="flight")
