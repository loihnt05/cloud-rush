import { useNavigate } from "react-router-dom";
import { FaPlane, FaHotel, FaCar } from "react-icons/fa";
import { MdAirlineSeatReclineNormal, MdCardTravel } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";
import type { Flight } from "@/types/flight";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";

interface PaymentSuccessProps {
    flight: Flight | null;
    booking: Booking;
    passengers: Passenger[];
    existingPayment: Payment | null;
    totalAmount: number;
    serviceName?: string;
    serviceType?: string | null;
}

export default function PaymentSuccess({
    flight,
    booking,
    passengers,
    existingPayment,
    totalAmount,
    serviceName,
    serviceType,
}: PaymentSuccessProps) {
    const navigate = useNavigate();

    const isFlightBooking = !!flight;
    const isServiceBooking = !!serviceType;

    const getServiceIcon = () => {
        switch (serviceType) {
            case "hotel":
                return <FaHotel className="text-primary" />;
            case "package":
                return <MdCardTravel className="text-primary" />;
            case "car_rental":
                return <FaCar className="text-primary" />;
            default:
                return <FaPlane className="text-primary" />;
        }
    };

    const getServiceLabel = () => {
        switch (serviceType) {
            case "hotel":
                return "Hotel";
            case "package":
                return "Package";
            case "car_rental":
                return "Car Rental";
            default:
                return "Service";
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <BsCheckCircleFill className="text-primary text-5xl" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">Payment Successful!</h1>
                        <p className="text-muted-foreground">Your booking has been confirmed</p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                                <p className="text-2xl font-bold text-primary tracking-wider">{booking.booking_reference}</p>
                            </div>
                            {existingPayment && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {(existingPayment.status === 'completed' || existingPayment.status === 'success') ? '✓ PAID' : existingPayment.status.toUpperCase()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-muted/30 border border-border rounded-xl p-6">
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                {getServiceIcon()}
                                {isServiceBooking ? `${getServiceLabel()} Details` : "Flight Details"}
                            </h3>
                            <div className="space-y-2 text-sm">
                                {isServiceBooking ? (
                                    <>
                                        <p className="text-foreground font-semibold text-lg">{serviceName}</p>
                                        <p className="text-muted-foreground">Type: {getServiceLabel()}</p>
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">Booking Date</p>
                                            <p className="text-foreground">
                                                {new Date(booking.booking_date || Date.now()).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </>
                                ) : flight ? (
                                    <>
                                        <p className="text-muted-foreground">{flight.flight_number}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground">{flight.origin}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-semibold text-foreground">{flight.destination}</span>
                                        </div>
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">Departure</p>
                                            <p className="text-muted-foreground">
                                                {new Date(flight.departure_time).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {new Date(flight.departure_time).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {flight.arrival_time && (
                                            <div className="pt-2 border-t border-border">
                                                <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                                                <p className="text-muted-foreground">
                                                    {new Date(flight.arrival_time).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="font-semibold text-foreground">
                                                    {new Date(flight.arrival_time).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>

                        <div className="bg-muted/30 border border-border rounded-xl p-6">
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                <MdAirlineSeatReclineNormal className="text-primary" />
                                {passengers.length > 0 ? "Passengers & Payment" : "Payment"}
                            </h3>
                            <div className="space-y-2 text-sm">
                                {passengers.length > 0 && (
                                    <>
                                        <p className="text-muted-foreground mb-2">{passengers.length} Passenger(s)</p>
                                        {passengers.slice(0, 3).map((p, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-1">
                                                <span className="font-semibold text-foreground">
                                                    {p.first_name} {p.last_name}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                                    {p.passenger_type}
                                                </span>
                                            </div>
                                        ))}
                                        {passengers.length > 3 && (
                                            <p className="text-xs text-muted-foreground italic">
                                                +{passengers.length - 3} more passenger{passengers.length - 3 > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </>
                                )}
                                <div className={`${passengers.length > 0 ? 'pt-3 border-t border-border mt-3' : ''}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">Payment Amount</span>
                                        <span className="text-xl font-bold text-primary">
                                            ${totalAmount.toFixed(2)}
                                        </span>
                                    </div>
                                    {existingPayment && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Payment Method</span>
                                            <span className="text-foreground font-medium">
                                                {existingPayment.method || 'Credit Card'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={() => navigate("/my-bookings")}
                            className="font-semibold rounded hover:cursor-pointer transition-all"
                        >
                            View My Bookings
                        </Button>
                        <Button
                            onClick={() => navigate("/")}
                            className="hover:cursor-pointer font-semibold transition-all"
                        >
                            Book Another Flight
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
