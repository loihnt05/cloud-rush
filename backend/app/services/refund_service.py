from sqlalchemy.orm import Session
from app.repositories import refund_repository, booking_repository, payment_repository, passenger_repository, flight_seat_repository, flight_repository
from app.schemas.refund_schema import RefundCreate, RefundCalculation, CancellationPolicyCreate, CancellationPolicyUpdate
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional


class RefundService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_refund_amount(self, booking_id: int) -> RefundCalculation:
        """Calculate refund amount based on cancellation policy"""
        # Get booking
        booking = booking_repository.get_booking_by_id(self.db, booking_id)
        if not booking:
            raise ValueError("Booking not found")

        if booking.status == "cancelled":
            raise ValueError("Booking is already cancelled")

        # Get first passenger's flight to determine departure time
        passengers = passenger_repository.get_passengers_by_booking(self.db, booking_id)
        if not passengers:
            raise ValueError("No passengers found for this booking")

        # Get flight information from first passenger
        first_passenger = passengers[0]
        if not first_passenger.flight_seat_id:
            raise ValueError("No flight seat assigned to passenger")

        flight_seat = flight_seat_repository.get_flight_seat_by_id(self.db, first_passenger.flight_seat_id)
        if not flight_seat:
            raise ValueError("Flight seat not found")

        flight = flight_repository.get_flight_by_id(self.db, flight_seat.flight_id)
        if not flight:
            raise ValueError("Flight not found")

        # Calculate hours until departure
        now = datetime.now(timezone.utc)
        departure_time = flight.departure_time
        
        # Make departure_time timezone-aware if it isn't already
        if departure_time.tzinfo is None:
            departure_time = departure_time.replace(tzinfo=timezone.utc)
        
        time_delta = departure_time - now
        hours_until_departure = time_delta.total_seconds() / 3600

        # Get applicable cancellation policy
        policy = refund_repository.get_applicable_policy(self.db, hours_until_departure)
        
        original_amount = float(booking.total_amount or 0)
        
        if not policy:
            # No policy found - no refund allowed
            return RefundCalculation(
                booking_id=booking_id,
                original_amount=Decimal(str(original_amount)),
                refund_percentage=Decimal("0.00"),
                cancellation_fee=Decimal("0.00"),
                refund_amount=Decimal("0.00"),
                hours_until_departure=hours_until_departure,
                policy_applied="No policy",
                can_cancel=False,
                message="No refund available for this booking"
            )

        # Calculate refund
        refund_percentage = float(policy.refund_percentage)
        cancellation_fee = float(policy.cancellation_fee)
        
        refund_amount = (original_amount * refund_percentage / 100) - cancellation_fee
        refund_amount = max(0, refund_amount)  # Ensure non-negative

        return RefundCalculation(
            booking_id=booking_id,
            original_amount=Decimal(str(original_amount)),
            refund_percentage=Decimal(str(refund_percentage)),
            cancellation_fee=Decimal(str(cancellation_fee)),
            refund_amount=Decimal(str(refund_amount)),
            hours_until_departure=hours_until_departure,
            policy_applied=policy.name,
            can_cancel=True,
            message=f"Refund available: {refund_percentage}% of total amount minus ${cancellation_fee} cancellation fee"
        )

    def create_refund_request(self, refund_data: RefundCreate, user_id: str):
        """Create a refund request and cancel the booking"""
        # Calculate refund amount
        refund_calculation = self.calculate_refund_amount(refund_data.booking_id)
        
        if not refund_calculation.can_cancel:
            raise ValueError(refund_calculation.message)

        # Get booking
        booking = booking_repository.get_booking_by_id(self.db, refund_data.booking_id)
        if not booking:
            raise ValueError("Booking not found")

        # Check if user owns this booking
        if booking.user_id != user_id:
            raise ValueError("You can only cancel your own bookings")

        # Get payment for this booking
        payment = payment_repository.get_payment_by_booking(self.db, refund_data.booking_id)

        # Create refund record
        refund_dict = {
            "booking_id": refund_data.booking_id,
            "payment_id": payment.payment_id if payment else None,
            "refund_amount": refund_calculation.refund_amount,
            "refund_percentage": refund_calculation.refund_percentage,
            "cancellation_fee": refund_calculation.cancellation_fee,
            "refund_reason": refund_data.refund_reason,
            "status": "pending",
            "requested_by": user_id,
            "requested_at": datetime.now(),
            "notes": refund_data.notes
        }
        
        refund = refund_repository.create_refund(self.db, refund_dict)

        # Cancel the booking
        self._cancel_booking_internal(refund_data.booking_id)

        return refund

    def _cancel_booking_internal(self, booking_id: int):
        """Internal method to cancel a booking and free up seats"""
        # Get all passengers and free up their seats
        passengers = passenger_repository.get_passengers_by_booking(self.db, booking_id)
        for passenger in passengers:
            if passenger.flight_seat_id:
                flight_seat_repository.update_flight_seat(
                    self.db,
                    passenger.flight_seat_id,
                    {"status": "available"}
                )

        # Update booking status to cancelled
        booking_repository.update_booking_status(self.db, booking_id, "cancelled")

    def get_refund(self, refund_id: int):
        """Get refund by ID"""
        refund = refund_repository.get_refund_by_id(self.db, refund_id)
        if not refund:
            raise ValueError("Refund not found")
        return refund

    def get_all_refunds(self, status: Optional[str] = None):
        """Get all refunds, optionally filtered by status"""
        return refund_repository.get_all_refunds(self.db, status)

    def get_user_refunds(self, user_id: str):
        """Get all refunds for a user"""
        return refund_repository.get_user_refunds(self.db, user_id)

    def get_booking_refunds(self, booking_id: int):
        """Get all refunds for a booking"""
        return refund_repository.get_refunds_by_booking(self.db, booking_id)

    def process_refund(self, refund_id: int, status: str, processed_by: str, notes: Optional[str] = None):
        """Process a refund (approve/reject) - Admin/Agent only"""
        if status not in ["approved", "rejected", "completed"]:
            raise ValueError("Invalid status. Must be 'approved', 'rejected', or 'completed'")

        refund = refund_repository.get_refund_by_id(self.db, refund_id)
        if not refund:
            raise ValueError("Refund not found")

        if refund.status != "pending":
            raise ValueError(f"Cannot process refund with status: {refund.status}")

        # Update refund status
        updated_refund = refund_repository.update_refund_status(self.db, refund_id, status, processed_by)
        
        if notes:
            updated_refund.notes = (updated_refund.notes or "") + f"\n{notes}"
            self.db.commit()
            self.db.refresh(updated_refund)

        # If approved, you would integrate with payment gateway here
        # For now, we just mark it as approved
        
        return updated_refund

    # Cancellation Policy Management
    def create_cancellation_policy(self, policy_data: CancellationPolicyCreate):
        """Create a new cancellation policy - Admin only"""
        policy_dict = policy_data.model_dump()
        policy_dict["is_active"] = "true"
        return refund_repository.create_cancellation_policy(self.db, policy_dict)

    def get_cancellation_policy(self, policy_id: int):
        """Get cancellation policy by ID"""
        policy = refund_repository.get_cancellation_policy_by_id(self.db, policy_id)
        if not policy:
            raise ValueError("Cancellation policy not found")
        return policy

    def get_active_policies(self):
        """Get all active cancellation policies"""
        return refund_repository.get_active_cancellation_policies(self.db)

    def update_cancellation_policy(self, policy_id: int, policy_data: CancellationPolicyUpdate):
        """Update a cancellation policy - Admin only"""
        policy_dict = policy_data.model_dump(exclude_unset=True)
        policy = refund_repository.update_cancellation_policy(self.db, policy_id, policy_dict)
        if not policy:
            raise ValueError("Cancellation policy not found")
        return policy
