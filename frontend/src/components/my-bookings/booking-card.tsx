import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaPlane, 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaUser,
  FaChair,
  FaCreditCard,
  FaTicketAlt,
  FaBan
} from "react-icons/fa";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import { Button } from "@/components/ui/button";
import CancelBookingDialog from "./cancel-booking-dialog";

interface BookingWithDetails {
  booking: Booking;
  flight: Flight;
  passengers: Passenger[];
  payment: Payment | null;
  originAirport: Airport;
  destinationAirport: Airport;
}

interface BookingCardProps {
  bookingDetail: BookingWithDetails;
  onRefresh?: () => void;
}

export default function BookingCard({ bookingDetail, onRefresh }: BookingCardProps) {
  const navigate = useNavigate();
  const { booking, flight, passengers, payment, originAirport, destinationAirport } = bookingDetail;
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const isConfirmed = booking.status === "confirmed" && payment?.status === "success";
  const isPending = !isConfirmed;
  const isCancelled = booking.status === "cancelled";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getTotalAmount = () => {
    if (payment?.amount) {
      const amount = typeof payment.amount === 'string' 
        ? parseFloat(payment.amount) 
        : payment.amount;
      return amount.toFixed(2);
    }
    if (booking.total_amount) {
      const amount = typeof booking.total_amount === 'string'
        ? parseFloat(booking.total_amount)
        : booking.total_amount;
      return amount.toFixed(2);
    }
    return "0.00";
  };

  const handleCompletePayment = () => {
    // For flight bookings, include flightId
    if (flight?.flight_id) {
      navigate(`/payment?bookingId=${booking.booking_id}&flightId=${flight.flight_id}`);
    } else {
      // For service bookings, navigate without flightId
      // The payment page will detect it's a service booking from booking_services
      navigate(`/payment?bookingId=${booking.booking_id}`);
    }
  };

  const handleCancelSuccess = () => {
    // Refresh the bookings list
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Status Banner */}
      <div
        className={`px-6 py-3 flex items-center justify-between ${
          isCancelled
            ? "bg-red-500/10 border-b border-red-500/20"
            : isConfirmed
            ? "bg-green-500/10 border-b border-green-500/20"
            : "bg-yellow-500/10 border-b border-yellow-500/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {isCancelled ? (
            <>
              <FaBan className="text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-400">
                Cancelled
              </span>
            </>
          ) : isConfirmed ? (
            <>
              <FaCheckCircle className="text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-400">
                Confirmed & Paid
              </span>
            </>
          ) : (
            <>
              <FaExclamationCircle className="text-yellow-500" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">
                Payment Pending
              </span>
            </>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Booking Ref: <span className="font-bold text-primary">{booking.booking_reference}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Flight Information */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaPlane className="text-primary text-lg" />
            <h3 className="text-xl font-bold text-foreground">
              Flight {flight.flight_number}
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Departure */}
            <div>
              <div className="text-sm text-muted-foreground mb-1">Departure</div>
              <div className="text-2xl font-bold text-foreground">
                {originAirport.iata_code}
              </div>
              <div className="text-sm text-muted-foreground">
                {originAirport.name}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <FaCalendarAlt className="text-muted-foreground" />
                <span>{formatDate(flight.departure_time)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <FaClock className="text-muted-foreground" />
                <span className="font-bold">{formatTime(flight.departure_time)}</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground mb-2">Duration</div>
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-border"></div>
                <div className="text-sm font-medium">
                  {calculateDuration(flight.departure_time, flight.arrival_time)}
                </div>
                <div className="flex-1 h-px bg-border"></div>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-right md:text-left">
              <div className="text-sm text-muted-foreground mb-1">Arrival</div>
              <div className="text-2xl font-bold text-foreground">
                {destinationAirport.iata_code}
              </div>
              <div className="text-sm text-muted-foreground">
                {destinationAirport.name}
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm justify-end md:justify-start">
                <FaCalendarAlt className="text-muted-foreground" />
                <span>{formatDate(flight.arrival_time)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm justify-end md:justify-start">
                <FaClock className="text-muted-foreground" />
                <span className="font-bold">{formatTime(flight.arrival_time)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="border-t border-border pt-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FaUser className="text-primary" />
            <h4 className="font-semibold text-foreground">
              Passengers ({passengers.length})
            </h4>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {passengers.map((passenger, index) => (
              <div
                key={passenger.passenger_id}
                className="bg-muted/50 rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {passenger.first_name} {passenger.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {passenger.passenger_type}
                    {passenger.flight_seat_id && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <FaChair className="inline" /> Seat Selected
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info and Actions */}
        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaCreditCard className="text-primary" />
              <span className="font-semibold text-foreground">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              ${getTotalAmount()}
            </div>
            {payment && (
              <div className="text-xs text-muted-foreground mt-1">
                Paid via {payment.method === 'credit_card' ? 'Credit Card' : payment.method}
              </div>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {isPending && (
              <Button
                onClick={handleCompletePayment}
                className="flex-1 sm:flex-initial flex items-center gap-2"
              >
                <FaCreditCard />
                Complete Payment
              </Button>
            )}
            {isConfirmed && (
              <Button
                onClick={() => navigate(`/e-ticket/${booking.booking_id}`)}
                className="flex-1 sm:flex-initial flex items-center gap-2"
                variant="default"
              >
                <FaTicketAlt />
                E-Ticket
              </Button>
            )}
            {!isCancelled && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="flex-1 sm:flex-initial flex items-center gap-2"
              >
                <FaBan />
                Cancel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => navigate(`/my-bookings/${booking.booking_id}`)}
              className="flex-1 sm:flex-initial"
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Booking Notes */}
        {booking.notes && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">Notes:</span> {booking.notes}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Booking Dialog */}
      <CancelBookingDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        bookingId={booking.booking_id}
        bookingReference={booking.booking_reference}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
