from sqlalchemy.orm import Session
from app.models.refund import Refund, CancellationPolicy
from typing import Optional
from datetime import datetime


def create_refund(db: Session, refund_data: dict) -> Refund:
    """Create a new refund request"""
    refund = Refund(**refund_data)
    db.add(refund)
    db.commit()
    db.refresh(refund)
    return refund


def get_refund_by_id(db: Session, refund_id: int) -> Optional[Refund]:
    """Get refund by ID"""
    return db.query(Refund).filter(Refund.refund_id == refund_id).first()


def get_refunds_by_booking(db: Session, booking_id: int):
    """Get all refunds for a booking"""
    return db.query(Refund).filter(Refund.booking_id == booking_id).all()


def get_all_refunds(db: Session, status: Optional[str] = None):
    """Get all refunds, optionally filtered by status"""
    query = db.query(Refund)
    if status:
        query = query.filter(Refund.status == status)
    return query.all()


def update_refund_status(db: Session, refund_id: int, status: str, processed_by: str = None) -> Optional[Refund]:
    """Update refund status"""
    refund = get_refund_by_id(db, refund_id)
    if not refund:
        return None
    
    refund.status = status
    if processed_by:
        refund.processed_by = processed_by
    if status in ["approved", "rejected", "completed"]:
        refund.processed_at = datetime.now()
    
    db.commit()
    db.refresh(refund)
    return refund


def get_user_refunds(db: Session, user_id: str):
    """Get all refunds requested by a user"""
    return db.query(Refund).filter(Refund.requested_by == user_id).all()


# Cancellation Policy functions
def create_cancellation_policy(db: Session, policy_data: dict) -> CancellationPolicy:
    """Create a new cancellation policy"""
    policy = CancellationPolicy(**policy_data)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


def get_cancellation_policy_by_id(db: Session, policy_id: int) -> Optional[CancellationPolicy]:
    """Get cancellation policy by ID"""
    return db.query(CancellationPolicy).filter(CancellationPolicy.policy_id == policy_id).first()


def get_active_cancellation_policies(db: Session):
    """Get all active cancellation policies"""
    return db.query(CancellationPolicy).filter(CancellationPolicy.is_active == "true").order_by(
        CancellationPolicy.hours_before_departure.desc()
    ).all()


def get_applicable_policy(db: Session, hours_until_departure: float) -> Optional[CancellationPolicy]:
    """Get the applicable cancellation policy based on hours until departure"""
    policies = get_active_cancellation_policies(db)
    
    for policy in policies:
        if hours_until_departure >= policy.hours_before_departure:
            return policy
    
    # Return the policy with the lowest hours requirement (most restrictive)
    return policies[-1] if policies else None


def update_cancellation_policy(db: Session, policy_id: int, policy_data: dict) -> Optional[CancellationPolicy]:
    """Update a cancellation policy"""
    policy = get_cancellation_policy_by_id(db, policy_id)
    if not policy:
        return None
    
    for key, value in policy_data.items():
        if hasattr(policy, key):
            setattr(policy, key, value)
    
    db.commit()
    db.refresh(policy)
    return policy
