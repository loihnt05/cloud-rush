from sqlalchemy import DECIMAL, TIMESTAMP, CheckConstraint, Column, ForeignKey, Integer, String, Text, func
from app.core.database import Base
from sqlalchemy.orm import relationship

class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=False)
    booking_reference = Column(String(20), unique=True, nullable=False)  # e.g., ABC123XYZ
    booking_date = Column(TIMESTAMP, server_default=func.current_timestamp())
    status = Column(String(20), default="pending")
    total_amount = Column(DECIMAL(10, 2))
    notes = Column(Text)

    __table_args__ = (
        CheckConstraint("status IN ('pending','confirmed','cancelled')"),
    )

    # Relationships
    passengers = relationship("Passenger", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    booking_services = relationship("BookingService", back_populates="booking", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"
    
    payment_id = Column(Integer, primary_key=True)
    booking_id = Column(ForeignKey(
        "bookings.booking_id", ondelete="CASCADE"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_date = Column(TIMESTAMP, server_default="NOW()")
    method = Column(String(50))
    status = Column(String(20), default="pending")

    __table_args__ = (
        CheckConstraint("status IN ('success','failed','pending')"),
    )
    
    booking = relationship("Booking", back_populates="payments")

class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("type IN ('rental_car','hotel','package')"),
    )
    
    booking_services = relationship("BookingService", back_populates="service")
    trip_plan_items = relationship("TripPlanItem", back_populates="service")
    hotel = relationship("Hotel", back_populates="service", uselist=False)
    car_rental = relationship("CarRental", back_populates="service", uselist=False)
    package = relationship("BookingPackage", back_populates="service", uselist=False)

class BookingService(Base):
    __tablename__ = "booking_services"

    booking_service_id = Column(Integer, primary_key=True)
    booking_id = Column(ForeignKey("bookings.booking_id", ondelete="CASCADE"), nullable=False)
    service_id = Column(ForeignKey("services.service_id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    booking = relationship("Booking", back_populates="booking_services")
    service = relationship("Service", back_populates="booking_services")
