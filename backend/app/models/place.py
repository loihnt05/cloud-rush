from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from sqlalchemy.orm import relationship

class Place(Base):
    __tablename__ = "places"

    place_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100))
    city = Column(String(100))
    description = Column(String(255))

    explores = relationship("Explore", back_populates="place")
    activities = relationship("TripActivity", back_populates="place")


class Explore(Base):
    __tablename__ = "explores"

    explore_id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    place_id = Column(Integer, ForeignKey("places.place_id"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default="NOW()")

    user = relationship("User", back_populates="explores")
    place = relationship("Place", back_populates="explores")