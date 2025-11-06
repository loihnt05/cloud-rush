import { useState, useEffect } from "react";
import { getFlight } from "@/api/flight";
import { getFlightSeatsWithDetails } from "@/api/seat";
import { getAirports } from "@/api/airport";
import { type Flight } from "@/types/flight";
import { type SeatWithStatus } from "@/types/seat";

interface SeatDisplay {
    id: string;
    row: number;
    column: string;
    type: "economy" | "business" | "first";
    status: "available" | "occupied" | "selected";
    price: number;
    flight_seat_id: number;
    seat_id: number;
}

export function useFlightData(flightId: string | null) {
    const [flight, setFlight] = useState<Flight | null>(null);
    const [seats, setSeats] = useState<SeatDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlightAndSeats = async () => {
            if (!flightId) {
                setError("No flight ID provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const flightData = await getFlight(parseInt(flightId));
                setFlight(flightData);

                const seatsData = await getFlightSeatsWithDetails(parseInt(flightId), flightData);
                const airports = await getAirports();
                
                // Get airport names
                const originAirport = airports.find(a => a.airport_id === flightData.origin_airport_id);
                const destAirport = airports.find(a => a.airport_id === flightData.destination_airport_id);
                
                // Update flight with airport names
                if (originAirport) {
                    flightData.origin = originAirport.name;
                }
                if (destAirport) {
                    flightData.destination = destAirport.name;
                }

                // Transform seats to display format
                const displaySeats: SeatDisplay[] = seatsData.map((seat: SeatWithStatus) => {
                    // Parse row and column from seat_number (e.g., "1A" -> row: 1, col: "A")
                    const match = seat.seat_number.match(/^(\d+)([A-Z])$/);
                    const row = match ? parseInt(match[1]) : 0;
                    const column = match ? match[2] : "";

                    return {
                        id: seat.seat_number,
                        row,
                        column,
                        type: seat.seat_class,
                        status: seat.status === "available" ? "available" : "occupied",
                        price: seat.price,
                        flight_seat_id: seat.flight_seat_id,
                        seat_id: seat.seat_id,
                    };
                });

                setSeats(displaySeats);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching flight data:", err);
                setError(err instanceof Error ? err.message : "Failed to load flight data");
                setLoading(false);
            }
        };

        fetchFlightAndSeats();
    }, [flightId]);

    return { flight, seats, loading, error };
}
