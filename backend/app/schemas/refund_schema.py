from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class RefundCreate(BaseModel):
    """Schema for creating a refund request"""
    booking_id: int
    refund_reason: Optional[str] = None
    notes: Optional[str] = None


class RefundResponse(BaseModel):
    """Schema for refund response"""
    refund_id: int
    booking_id: int
    payment_id: Optional[int] = None
    refund_amount: Decimal
    refund_percentage: Decimal
    cancellation_fee: Decimal
    refund_reason: Optional[str] = None
    status: str
    requested_by: str
    processed_by: Optional[str] = None
    requested_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class RefundStatusUpdate(BaseModel):
    """Schema for updating refund status"""
    status: str = Field(..., description="Status: pending, approved, rejected, completed")
    notes: Optional[str] = None


class RefundCalculation(BaseModel):
    """Schema for refund calculation response"""
    booking_id: int
    original_amount: Decimal
    refund_percentage: Decimal
    cancellation_fee: Decimal
    refund_amount: Decimal
    hours_until_departure: float
    policy_applied: str
    can_cancel: bool
    message: str


class CancellationPolicyCreate(BaseModel):
    """Schema for creating a cancellation policy"""
    name: str
    description: Optional[str] = None
    hours_before_departure: int = Field(..., ge=0)
    refund_percentage: Decimal = Field(..., ge=0, le=100)
    cancellation_fee: Decimal = Field(default=0.00, ge=0)


class CancellationPolicyResponse(BaseModel):
    """Schema for cancellation policy response"""
    policy_id: int
    name: str
    description: Optional[str] = None
    hours_before_departure: int
    refund_percentage: Decimal
    cancellation_fee: Decimal
    is_active: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CancellationPolicyUpdate(BaseModel):
    """Schema for updating a cancellation policy"""
    name: Optional[str] = None
    description: Optional[str] = None
    hours_before_departure: Optional[int] = Field(None, ge=0)
    refund_percentage: Optional[Decimal] = Field(None, ge=0, le=100)
    cancellation_fee: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[str] = None
