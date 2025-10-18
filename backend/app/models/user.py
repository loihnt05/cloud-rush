from uuid import UUID
import uuid
from sqlalchemy import JSON, TIMESTAMP, Boolean, CheckConstraint, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .base import Base

class Role(Base):
    __tablename__ = "roles"
    
    role_id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    
    users = relationship("User", back_populates="role")
    
class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(50), nullable=False)
    provider_id = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    avatar_url = Column(Text)
    role_id = Column(Integer, ForeignKey("roles.role_id"))
    status = Column(String(20), default="active")
    last_login_at = Column(TIMESTAMP)
    two_factor_enabled = Column(Boolean, default=False)
    preferences = Column(JSON)
    created_at = Column(TIMESTAMP, server_default="NOW()")

    __table_args__ = (
        CheckConstraint("status IN ('active','inactive','banned')"),
    )

    role = relationship("Role", back_populates="users")
    bookings = relationship("Booking", back_populates="user")
    explores = relationship("Explore", back_populates="user")
    trips = relationship("Trip", back_populates="user")
