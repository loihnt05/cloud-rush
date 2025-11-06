import { useState } from "react";

export function useSeatSelection(totalPassengers: number) {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

    const handleSeatClick = (seatId: string, status: "available" | "occupied" | "selected") => {
        if (status === "occupied") return;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            // Check if we've reached the passenger limit
            if (selectedSeats.length >= totalPassengers) {
                alert(`You can only select ${totalPassengers} seat${totalPassengers > 1 ? 's' : ''} for ${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''}`);
                return;
            }
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const handleSeatHover = (seatId: string | null) => {
        setHoveredSeat(seatId);
    };

    const clearSelection = () => {
        setSelectedSeats([]);
    };

    return {
        selectedSeats,
        hoveredSeat,
        handleSeatClick,
        handleSeatHover,
        clearSelection
    };
}
