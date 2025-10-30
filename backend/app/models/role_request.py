# models.py
from sqlalchemy import Column, String, Boolean, DateTime
import datetime

from app.core.database import Base

class RoleRequest(Base):
    __tablename__ = "role_requests"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    requested_role = Column(String, nullable=False)
    approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.now)
