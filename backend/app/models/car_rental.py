from sqlalchemy import DECIMAL, Boolean, Column, ForeignKey, Integer, String
from app.core.database import Base
from sqlalchemy.orm import relationship


class CarRental(Base):
    __tablename__ = "car_rentals"

    car_rental_id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="CASCADE"), unique=True)
    car_model = Column(String(100))
    brand = Column(String(100))
    daily_rate = Column(DECIMAL(10, 2))
    available = Column(Boolean, default=True)

    service = relationship("Service", back_populates="car_rental")
    packages = relationship("BookingPackage", back_populates="car_rental")
