from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from app.core.database import Base
from sqlalchemy.orm import relationship

class Place(Base):
    __tablename__ = "places"

    place_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    country = Column(String(100))
    city = Column(String(100))
    description = Column(Text)

    explores = relationship("Explore", back_populates="place")
    activities = relationship("TripActivity", back_populates="place")


class Explore(Base):
    __tablename__ = "explores"

    explore_id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=False)
    place_id = Column(Integer, ForeignKey("places.place_id", ondelete="SET NULL"))
    title = Column(String(200), nullable=False)
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    place = relationship("Place", back_populates="explores")