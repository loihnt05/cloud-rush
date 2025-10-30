from sqlalchemy import TIMESTAMP, CheckConstraint, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Airplane(Base):
    __tablename__ = 'airplanes'

    airplane_id = Column(Integer, primary_key=True)
    model = Column(String(100), nullable=False)
    manufacturer = Column(String)
    seat_capacity = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default="NOW()")

    seats = relationship("Seat", back_populates="airplane")
    flights = relationship("Flight", back_populates="airplane")
    
class Seat(Base):
    __tablename__ = 'seats'

    seat_id = Column(Integer, primary_key=True)
    airplane_id = Column(Integer, ForeignKey('airplanes.airplane_id', ondelete="CASCADE"))
    seat_number = Column(String(10), nullable=False)
    seat_class = Column(String(20))

    __table_args__ = (
        CheckConstraint("seat_class IN ('economy','business','first')"),
    )
    
    airplane = relationship("Airplane", back_populates="seats")
    flight_seats = relationship("FlightSeat", back_populates="seat")