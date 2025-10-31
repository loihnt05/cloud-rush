from sqlalchemy import DECIMAL, Column, ForeignKey, Integer, String
from app.core.database import Base
from sqlalchemy.orm import relationship


class BookingPackage(Base):
    __tablename__ = "booking_packages"

    package_id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="CASCADE"), unique=True)
    hotel_id = Column(Integer, ForeignKey("hotels.hotel_id", ondelete="SET NULL"))
    car_rental_id = Column(Integer, ForeignKey("car_rentals.car_rental_id", ondelete="SET NULL"))
    name = Column(String(100))
    total_price = Column(DECIMAL(10, 2))

    service = relationship("Service", back_populates="package")
    hotel = relationship("Hotel", back_populates="packages")
    car_rental = relationship("CarRental", back_populates="packages")
    package_places = relationship("PackagePlace", back_populates="package")


class PackagePlace(Base):
    __tablename__ = "package_places"

    package_place_id = Column(Integer, primary_key=True)
    package_id = Column(Integer, ForeignKey("booking_packages.package_id", ondelete="CASCADE"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.place_id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer)

    package = relationship("BookingPackage", back_populates="package_places")
    place = relationship("Place", back_populates="package_places")
