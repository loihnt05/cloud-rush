import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { calculateRefund, createRefundRequest } from "@/api/refund";
import type { RefundCalculation } from "@/api/refund";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  bookingReference: string;
  onSuccess: () => void;
}

export default function CancelBookingDialog({
  isOpen,
  onClose,
  bookingId,
  bookingReference,
  onSuccess,
}: CancelBookingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState<RefundCalculation | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"calculate" | "confirm">("calculate");

  const handleCalculateRefund = async () => {
    setCalculating(true);
    setError(null);
    
    try {
      const calculation = await calculateRefund(bookingId);
      setRefundCalculation(calculation);
      
      if (!calculation.can_cancel) {
        setError(calculation.message);
      } else {
        setStep("confirm");
      }
    } catch (err) {
      console.error("Error calculating refund:", err);
      setError(err instanceof Error ? err.message : "Failed to calculate refund");
    } finally {
      setCalculating(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!refundCalculation?.can_cancel) return;

    setLoading(true);
    setError(null);

    try {
      await createRefundRequest({
        booking_id: bookingId,
        refund_reason: reason || "Customer requested cancellation",
        notes: `Booking reference: ${bookingReference}`,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      console.error("Error creating refund request:", err);
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("calculate");
    setRefundCalculation(null);
    setReason("");
    setError(null);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${Math.floor(hours)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Booking Reference: <span className="font-semibold">{bookingReference}</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "calculate" && (
          <div className="space-y-4">
            <Alert>
              <FaInfoCircle className="h-4 w-4" />
              <AlertDescription>
                We'll calculate your refund amount based on our cancellation policy and how far in advance you're cancelling.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleCalculateRefund}
              disabled={calculating}
              className="w-full"
            >
              {calculating ? "Calculating..." : "Check Refund Amount"}
            </Button>
          </div>
        )}

        {step === "confirm" && refundCalculation && (
          <div className="space-y-4">
            {/* Refund Summary */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time until departure:</span>
                <span className="font-medium">{formatHours(refundCalculation.hours_until_departure)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Policy applied:</span>
                <span className="font-medium">{refundCalculation.policy_applied}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Original amount:</span>
                  <span className="font-medium">{formatCurrency(refundCalculation.original_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Refund percentage:</span>
                  <span className="font-medium">{refundCalculation.refund_percentage}%</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Cancellation fee:</span>
                  <span className="font-medium">-{formatCurrency(refundCalculation.cancellation_fee)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Refund amount:</span>
                    <span className="text-primary">{formatCurrency(refundCalculation.refund_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for cancellation (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <Alert variant="destructive">
              <FaExclamationTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This action cannot be undone. Your booking will be cancelled and seats will be released.
              </AlertDescription>
            </Alert>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancellation}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
