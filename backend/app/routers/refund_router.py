from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.refund_schema import (
    RefundCreate, 
    RefundResponse, 
    RefundStatusUpdate, 
    RefundCalculation,
    CancellationPolicyCreate,
    CancellationPolicyResponse,
    CancellationPolicyUpdate
)
from app.services.refund_service import RefundService
from app.dependencies import verify_jwt, get_user_roles
from typing import Optional

router = APIRouter(prefix="/refunds", tags=["Refunds"])


@router.post("/calculate/{booking_id}", response_model=RefundCalculation)
def calculate_refund(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Calculate potential refund amount for a booking based on cancellation policy"""
    try:
        return RefundService(db).calculate_refund_amount(booking_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/", response_model=RefundResponse)
def create_refund_request(
    refund: RefundCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a refund request and cancel the booking
    
    - Users can only cancel their own bookings
    - The system will calculate the refund based on cancellation policy
    - Booking status will be changed to 'cancelled'
    - Flight seats will be released
    """
    try:
        user_id = payload.get("sub")
        return RefundService(db).create_refund_request(refund, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[RefundResponse])
def get_all_refunds(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all refunds, optionally filtered by status
    
    Admin/Agent can see all refunds
    Regular users see only their own refunds
    """
    user_id = payload.get("sub")
    roles = payload.get("http://localhost:8000/roles", [])
    is_admin_or_agent = "admin" in roles or "agent" in roles
    
    if is_admin_or_agent:
        return RefundService(db).get_all_refunds(status)
    else:
        # Regular users only see their own refunds
        return RefundService(db).get_user_refunds(user_id)


@router.get("/user/{user_id}", response_model=list[RefundResponse])
def get_user_refunds(
    user_id: str,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all refunds for a specific user
    
    - Users can only see their own refunds
    - Admins/Agents can see any user's refunds
    """
    authenticated_user_id = payload.get("sub")
    roles = payload.get("http://localhost:8000/roles", [])
    is_admin_or_agent = "admin" in roles or "agent" in roles
    
    if user_id != authenticated_user_id and not is_admin_or_agent:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own refunds"
        )
    
    return RefundService(db).get_user_refunds(user_id)


@router.get("/booking/{booking_id}", response_model=list[RefundResponse])
def get_booking_refunds(
    booking_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all refunds for a specific booking"""
    return RefundService(db).get_booking_refunds(booking_id)


@router.get("/{refund_id}", response_model=RefundResponse)
def get_refund(
    refund_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific refund by ID"""
    try:
        return RefundService(db).get_refund(refund_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{refund_id}/process", response_model=RefundResponse)
def process_refund(
    refund_id: int,
    status_update: RefundStatusUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Process a refund request (approve/reject/complete) - Admin/Agent only"""
    roles = payload.get("http://localhost:8000/roles", [])
    is_admin_or_agent = "admin" in roles or "agent" in roles
    
    if not is_admin_or_agent:
        raise HTTPException(
            status_code=403,
            detail="Only admins and agents can process refunds"
        )
    
    try:
        processed_by = payload.get("sub")
        return RefundService(db).process_refund(
            refund_id, 
            status_update.status, 
            processed_by,
            status_update.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Cancellation Policy Endpoints
@router.post("/policies", response_model=CancellationPolicyResponse)
def create_cancellation_policy(
    policy: CancellationPolicyCreate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Create a new cancellation policy - Admin only"""
    roles = payload.get("http://localhost:8000/roles", [])
    if "admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Only admins can create cancellation policies"
        )
    
    try:
        return RefundService(db).create_cancellation_policy(policy)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/policies/active", response_model=list[CancellationPolicyResponse])
def get_active_policies(
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get all active cancellation policies"""
    return RefundService(db).get_active_policies()


@router.get("/policies/{policy_id}", response_model=CancellationPolicyResponse)
def get_cancellation_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Get a specific cancellation policy by ID"""
    try:
        return RefundService(db).get_cancellation_policy(policy_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/policies/{policy_id}", response_model=CancellationPolicyResponse)
def update_cancellation_policy(
    policy_id: int,
    policy: CancellationPolicyUpdate,
    db: Session = Depends(get_db),
    payload: dict = Depends(verify_jwt)
):
    """Update a cancellation policy - Admin only"""
    roles = payload.get("http://localhost:8000/roles", [])
    if "admin" not in roles:
        raise HTTPException(
            status_code=403,
            detail="Only admins can update cancellation policies"
        )
    
    try:
        return RefundService(db).update_cancellation_policy(policy_id, policy)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
