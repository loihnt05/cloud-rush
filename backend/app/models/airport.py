from sqlalchemy import Column, Integer, String
from app.core.database import Base
from sqlalchemy.orm import relationship

class Airport(Base):
    __tablename__ = "airports"

    airport_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    iata_code = Column(String(3), unique=True, nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)

    origin_flights = relationship("Flight", foreign_keys="[Flight.origin_airport_id]", back_populates="origin_airport")
    destination_flights = relationship("Flight", foreign_keys="[Flight.destination_airport_id]", back_populates="destination_airport")