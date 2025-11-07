import { FaPlane } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import type { Flight } from "@/types/flight";
import type { Booking, Passenger } from "@/types/booking";
import type { FlightSeat, Seat } from "@/types/seat";

interface BookingSummaryProps {
    flight: Flight;
    booking: Booking;
    passengers: Passenger[];
    passengerSeats: Map<number, { seat: Seat; flightSeat: FlightSeat }>;
    totalAmount: number;
}

export default function BookingSummary({
    flight,
    booking,
    passengers,
    passengerSeats,
    totalAmount,
}: BookingSummaryProps) {
    const basePrice = typeof flight.base_price === 'string' 
        ? parseFloat(flight.base_price) 
        : flight.base_price;

    const calculateSeatUpgrades = () => {
        let total = 0;
        passengers.forEach((passenger) => {
            const seatData = passengerSeats.get(passenger.passenger_id);
            if (seatData) {
                const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                    ? parseFloat(seatData.flightSeat.price_multiplier)
                    : seatData.flightSeat.price_multiplier;
                total += Math.max(0, basePrice * (priceMultiplier - 1));
            }
        });
        return total;
    };

    const seatUpgrades = calculateSeatUpgrades();
    const baseFare = basePrice * passengers.length;
    const taxes = (baseFare + seatUpgrades) * 0.15;

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>

            {/* Flight Info */}
            <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                    <FaPlane className="text-primary" />
                    <p className="text-sm font-semibold text-foreground">{flight.flight_number}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{flight.origin}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{flight.destination}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                            <span className="font-medium">Departure:</span>{" "}
                            {new Date(flight.departure_time).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}{" at "}
                            {new Date(flight.departure_time).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        {flight.arrival_time && (
                            <p>
                                <span className="font-medium">Arrival:</span>{" "}
                                {new Date(flight.arrival_time).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}{" at "}
                                {new Date(flight.arrival_time).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Info */}
            <div className="mb-6 pb-6 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Reference</span>
                    <span className="text-sm font-semibold text-foreground">{booking.booking_reference}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking Status</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        booking.status === 'confirmed' ? 'bg-green-500/10 text-green-600' : 
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 
                        'bg-gray-500/10 text-gray-600'
                    }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Passengers</span>
                    <span className="text-sm font-semibold text-foreground">{passengers.length}</span>
                </div>
            </div>

            {/* Passenger Details */}
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Passenger Details</h4>
                {passengers.map((p, idx) => {
                    const seatData = passengerSeats.get(p.passenger_id);
                    let seatUpgradeCost = 0;
                    
                    if (seatData) {
                        const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                            ? parseFloat(seatData.flightSeat.price_multiplier)
                            : seatData.flightSeat.price_multiplier;
                        seatUpgradeCost = basePrice * (priceMultiplier - 1);
                    }

                    return (
                        <div key={idx} className="bg-muted/30 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-foreground">
                                    {p.first_name} {p.last_name}
                                </span>
                                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                    {p.passenger_type.charAt(0).toUpperCase() + p.passenger_type.slice(1)}
                                </span>
                            </div>
                            {p.email && (
                                <p className="text-xs text-muted-foreground">{p.email}</p>
                            )}
                            {seatData && (
                                <div className="mt-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MdAirlineSeatReclineNormal className="text-primary text-sm" />
                                            <span className="text-xs font-medium text-foreground">
                                                Seat {seatData.seat.seat_number}
                                            </span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                                {seatData.seat.seat_class}
                                            </span>
                                        </div>
                                        {seatUpgradeCost > 0 && (
                                            <span className="text-xs font-semibold text-primary">
                                                +${seatUpgradeCost.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Base Fare ({passengers.length} × ${basePrice.toFixed(2)})</span>
                    <span className="text-foreground font-medium">${baseFare.toFixed(2)}</span>
                </div>
                {seatUpgrades > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Seat Upgrades</span>
                        <span className="text-foreground font-medium">${seatUpgrades.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taxes & Fees (15%)</span>
                    <span className="text-foreground font-medium">${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
