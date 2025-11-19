from sqlalchemy import DECIMAL, TIMESTAMP, CheckConstraint, Column, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Refund(Base):
    __tablename__ = "refunds"

    refund_id = Column(Integer, primary_key=True)
    booking_id = Column(ForeignKey("bookings.booking_id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(ForeignKey("payments.payment_id", ondelete="CASCADE"), nullable=True)
    refund_amount = Column(DECIMAL(10, 2), nullable=False)
    refund_percentage = Column(DECIMAL(5, 2), nullable=False)  # 0.00 to 100.00
    cancellation_fee = Column(DECIMAL(10, 2), default=0.00)
    refund_reason = Column(String(255))
    status = Column(String(20), default="pending")
    requested_by = Column(String(255), nullable=False)  # user_id who requested
    processed_by = Column(String(255))  # admin/agent who processed
    requested_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    processed_at = Column(TIMESTAMP)
    notes = Column(Text)

    __table_args__ = (
        CheckConstraint("status IN ('pending','approved','rejected','completed')"),
        CheckConstraint("refund_percentage >= 0 AND refund_percentage <= 100"),
    )

    # Relationships
    booking = relationship("Booking", backref="refunds")
    payment = relationship("Payment", backref="refunds")


class CancellationPolicy(Base):
    __tablename__ = "cancellation_policies"

    policy_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    hours_before_departure = Column(Integer, nullable=False)  # Minimum hours before departure
    refund_percentage = Column(DECIMAL(5, 2), nullable=False)  # 0.00 to 100.00
    cancellation_fee = Column(DECIMAL(10, 2), default=0.00)
    is_active = Column(String(10), default="true")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

    __table_args__ = (
        CheckConstraint("refund_percentage >= 0 AND refund_percentage <= 100"),
        CheckConstraint("is_active IN ('true','false')"),
    )
