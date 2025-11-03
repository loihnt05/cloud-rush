from sqlalchemy import TIMESTAMP, CheckConstraint, Column, Date, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Passenger(Base):
    __tablename__ = 'passengers'
    
    passenger_id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey('bookings.booking_id', ondelete='CASCADE'), nullable=False)
    passenger_type = Column(String(20), nullable=False)
    
    # Personal Information
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    last_name = Column(String(100), nullable=False)
    suffix = Column(String(20))
    date_of_birth = Column(Date, nullable=False)
    
    # Contact Information (usually for lead passenger)
    email = Column(String(255))
    phone_number = Column(String(20))
    
    # Travel Documents
    redress_number = Column(String(50))
    known_traveler_number = Column(String(50))
    
    # Seat Assignment
    flight_seat_id = Column(Integer, ForeignKey('flight_seats.flight_seat_id', ondelete='SET NULL'))
    
    # Special Requirements
    special_requests = Column(Text)
    
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    __table_args__ = (
        CheckConstraint("passenger_type IN ('adult','child','infant')"),
        UniqueConstraint('booking_id', 'flight_seat_id', name='uq_booking_flight_seat'),
    )
    
    # Relationships
    booking = relationship("Booking", back_populates="passengers")
    emergency_contacts = relationship("EmergencyContact", back_populates="passenger", cascade="all, delete-orphan")
    flight_seat = relationship("FlightSeat", back_populates="passengers")
    
class EmergencyContact(Base):
    __tablename__ = 'emergency_contacts'
    
    contact_id = Column(Integer, primary_key=True)
    passenger_id = Column(Integer, ForeignKey('passengers.passenger_id', ondelete='CASCADE'), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255))
    phone_number = Column(String(20), nullable=False)
    relationship_type = Column(String(50))  # spouse, parent, sibling, friend, etc.
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    passenger = relationship("Passenger", back_populates="emergency_contacts")