import { useSearchParams, useNavigate } from "react-router-dom";
import { FlightHeader } from "@/components/seat-selection/flight-header";
import { SeatMap } from "@/components/seat-selection/seat-map";
import { SelectionSummary } from "@/components/seat-selection/selection-summary";
import { LoadingState, ErrorState } from "@/components/seat-selection/state-components";
import { useFlightData } from "@/hooks/use-flight-data";
import { useSeatSelection } from "@/hooks/use-seat-selection";

export default function SeatSelection() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get URL parameters
    const flightId = searchParams.get("flightId");
    const adults = parseInt(searchParams.get("adults") || "1");
    const children = parseInt(searchParams.get("children") || "0");
    const totalPassengers = adults + children;

    // Custom hooks for data and selection
    const { flight, seats, loading, error } = useFlightData(flightId);
    const {
        selectedSeats,
        hoveredSeat,
        handleSeatClick,
        handleSeatHover,
        clearSelection
    } = useSeatSelection(totalPassengers);

    // Handle seat click wrapper
    const onSeatClick = (seat: typeof seats[0]) => {
        handleSeatClick(seat.id, seat.status);
    };

    // Handle remove seat
    const onRemoveSeat = (seat: typeof seats[0]) => {
        handleSeatClick(seat.id, seat.status);
    };

    // Handle continue
    const onContinue = () => {
        // Get the flight_seat_ids for the selected seats
        const selectedSeatDetails = selectedSeats
            .map(seatId => seats.find(s => s.id === seatId))
            .filter(Boolean);
        
        const flightSeatIds = selectedSeatDetails
            .map(seat => seat!.flight_seat_id)
            .join(',');
        
        // Create URL with all parameters including selected flight seat IDs
        const params = new URLSearchParams(searchParams);
        params.set('flightSeatIds', flightSeatIds);

        // Navigate to passenger information page first
        navigate(`/passenger-information?${params.toString()}`);
    };

    if (loading) {
        return <LoadingState />;
    }

    if (error || !flight) {
        return <ErrorState error={error || "Flight not found"} onGoBack={() => navigate(-1)} />;
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Flight Header */}
                <FlightHeader flight={flight} totalPassengers={totalPassengers} />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Seat Map */}
                    <div className="lg:col-span-2">
                        <SeatMap 
                            seats={seats}
                            selectedSeats={selectedSeats}
                            hoveredSeat={hoveredSeat}
                            onSeatClick={onSeatClick}
                            onSeatHover={handleSeatHover}
                        />
                    </div>

                    {/* Selection Summary */}
                    <div className="lg:col-span-1">
                        <SelectionSummary 
                            selectedSeats={selectedSeats}
                            seats={seats}
                            flight={flight}
                            totalPassengers={totalPassengers}
                            onRemoveSeat={onRemoveSeat}
                            onClearSelection={clearSelection}
                            onContinue={onContinue}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
