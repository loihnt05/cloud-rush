from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String, Text
from app.core.database import Base
from sqlalchemy.orm import relationship


class Hotel(Base):
    __tablename__ = "hotels"

    hotel_id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.service_id", ondelete="CASCADE"), unique=True)
    location = Column(String(200))
    stars = Column(Integer)
    description = Column(Text)

    __table_args__ = (
        CheckConstraint("stars BETWEEN 1 AND 5"),
    )

    service = relationship("Service", back_populates="hotel")
    packages = relationship("BookingPackage", back_populates="hotel")
