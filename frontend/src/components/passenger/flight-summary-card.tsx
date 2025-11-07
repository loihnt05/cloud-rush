import { Button } from "@/components/ui/button";
import {
  FaPlane,
  FaClock,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import {
  MdFlightTakeoff,
  MdFlightLand,
  MdAirlineSeatReclineNormal,
} from "react-icons/md";
import type { Airport } from "@/types/airport";
import type { SeatWithStatus } from "@/types/seat";

interface Flight {
  flight_id: number;
  flight_number: string;
  origin_airport_id: number;
  destination_airport_id: number;
  departure_time: string;
  arrival_time: string;
  base_price: number | string;
  status: string;
}

interface FlightSummaryCardProps {
  flight: Flight;
  originAirport?: Airport;
  destinationAirport?: Airport;
  passengerCount: number;
  selectedSeats?: SeatWithStatus[];
  isProcessing: boolean;
  onContinue: (e: React.FormEvent) => void;
}

export default function FlightSummaryCard({
  flight,
  originAirport,
  destinationAirport,
  passengerCount,
  selectedSeats = [],
  isProcessing,
  onContinue,
}: FlightSummaryCardProps) {
  // Format time from datetime string
  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date from datetime string
  const formatDate = (datetime: string) => {
    return new Date(datetime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate duration between departure and arrival
  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate pricing breakdown
  const basePrice = typeof flight.base_price === "string" 
    ? parseFloat(flight.base_price) 
    : flight.base_price;
  
  const baseFare = basePrice * passengerCount;
  const seatUpgrades = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const subtotal = baseFare + seatUpgrades;
  const taxesAndFees = subtotal * 0.15; // 15% tax
  const total = subtotal + taxesAndFees;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sticky top-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Flight Details</h3>
        <FaPlane className="text-primary text-2xl" />
      </div>

      {/* Flight Number & Airline */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Flight</p>
        <p className="text-lg font-semibold text-foreground">
          Flight {flight.flight_number}
        </p>
      </div>

      {/* Route */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Departure */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MdFlightTakeoff className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {originAirport?.iata_code || flight.origin_airport_id}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(flight.departure_time)}
            </p>
            <p className="text-sm text-muted-foreground">
              {originAirport?.city || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <FaCalendarAlt className="inline mr-1" />
              {formatDate(flight.departure_time)}
            </p>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center px-4">
            <FaClock className="text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {calculateDuration(flight.departure_time, flight.arrival_time)}
            </p>
            <div className="w-16 h-0.5 bg-border my-2"></div>
          </div>

          {/* Arrival */}
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <span className="text-sm font-medium text-foreground">
                {destinationAirport?.iata_code || flight.destination_airport_id}
              </span>
              <MdFlightLand className="text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(flight.arrival_time)}
            </p>
            <p className="text-sm text-muted-foreground">
              {destinationAirport?.city || ""}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <FaCalendarAlt className="inline mr-1" />
              {formatDate(flight.arrival_time)}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6"></div>

      {/* Additional Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FaUsers />
            Passengers
          </span>
          <span className="text-sm font-semibold text-foreground">
            {passengerCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className="text-sm font-semibold text-foreground">
            {flight.status}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-6"></div>

      {/* Selected Seats */}
      {selectedSeats.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MdAirlineSeatReclineNormal className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Selected Seats</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary"
              >
                {seat.seat_number}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Base Fare ({passengerCount}x ${basePrice.toFixed(2)})
          </span>
          <span className="text-sm font-semibold text-foreground">
            ${baseFare.toFixed(2)}
          </span>
        </div>

        {seatUpgrades > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Seat Upgrades ({selectedSeats.length})
            </span>
            <span className="text-sm font-semibold text-foreground">
              ${seatUpgrades.toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Taxes & Fees (15%)
          </span>
          <span className="text-sm font-semibold text-foreground">
            ${taxesAndFees.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-border pt-3"></div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            Total
          </span>
          <span className="text-2xl font-bold text-primary">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={(e) => onContinue(e)}
        disabled={isProcessing}
        className="w-full mt-6 hover:cursor-pointer text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Continue to Payment"}
      </Button>
    </div>
  );
}
