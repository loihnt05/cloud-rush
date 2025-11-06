import { FaPlane } from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand } from "react-icons/md";
import { type Flight } from "@/types/flight";

interface FlightHeaderProps {
    flight: Flight;
    totalPassengers: number;
}

export function FlightHeader({ flight, totalPassengers }: FlightHeaderProps) {
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateDuration = () => {
        const departure = new Date(flight.departure_time);
        const arrival = new Date(flight.arrival_time);
        const diff = arrival.getTime() - departure.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaPlane className="text-primary text-xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Select Your Seat</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Flight {flight.flight_number} • {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MdFlightTakeoff className="text-primary" />
                            <span>{flight.origin || "Origin"}</span>
                        </div>
                        <p className="text-lg font-semibold text-foreground">{formatTime(flight.departure_time)}</p>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">{calculateDuration()}</div>
                        <div className="w-16 h-0.5 bg-border my-1"></div>
                        <div className="text-xs text-muted-foreground">{formatDate(flight.departure_time)}</div>
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{flight.destination || "Destination"}</span>
                            <MdFlightLand className="text-primary" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">{formatTime(flight.arrival_time)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
