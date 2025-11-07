import { FaPlane, FaCheck } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { type SeatDisplay } from "@/types/seatDisplay";

interface SeatMapProps {
    seats: SeatDisplay[];
    selectedSeats: string[];
    hoveredSeat: string | null;
    onSeatClick: (seat: SeatDisplay) => void;
    onSeatHover: (seatId: string | null) => void;
}

export function SeatMap({ 
    seats, 
    selectedSeats, 
    hoveredSeat, 
    onSeatClick, 
    onSeatHover 
}: SeatMapProps) {
    const rows = Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b);
    const columns = ["A", "B", "C", "D", "E", "F"];

    const getSeatClass = (seat: SeatDisplay) => {
        const isSelected = selectedSeats.includes(seat.id);
        const isHovered = hoveredSeat === seat.id;

        if (seat.status === "occupied") {
            return "bg-muted border-border cursor-not-allowed opacity-50";
        }
        if (isSelected) {
            return "bg-primary text-primary-foreground border-primary shadow-lg scale-105";
        }
        if (isHovered && seat.status === "available") {
            return "bg-accent/20 border-accent scale-105";
        }

        switch (seat.type) {
            case "business":
                return "bg-card hover:bg-accent/10 border-accent";
            case "first":
                return "bg-card hover:bg-primary/10 border-primary/30";
            default:
                return "bg-card hover:bg-muted border-border";
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-card border border-border"></div>
                    <span className="text-sm text-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary border border-primary"></div>
                    <span className="text-sm text-foreground">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted border border-border opacity-50"></div>
                    <span className="text-sm text-foreground">Occupied</span>
                </div>
            </div>

            {/* Plane Front */}
            <div className="flex justify-center mb-4">
                <div className="w-32 h-8 bg-linear-to-r from-transparent via-primary/20 to-transparent rounded-t-full border-t-2 border-x-2 border-primary/30 flex items-center justify-center">
                    <FaPlane className="text-primary" />
                </div>
            </div>

            {/* Seat Grid */}
            <div className="space-y-1">
                {/* Column Headers */}
                <div className="flex justify-center gap-2 mb-2">
                    <div className="w-8 text-center text-xs font-semibold text-muted-foreground"></div>
                    {columns.slice(0, 3).map(col => (
                        <div key={col} className="w-10 text-center text-xs font-semibold text-muted-foreground">
                            {col}
                        </div>
                    ))}
                    <div className="w-8"></div>
                    {columns.slice(3, 6).map(col => (
                        <div key={col} className="w-10 text-center text-xs font-semibold text-muted-foreground">
                            {col}
                        </div>
                    ))}
                    <div className="w-8 text-center text-xs font-semibold text-muted-foreground"></div>
                </div>

                {rows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-2">
                        {/* Row number left */}
                        <div className="w-8 text-center text-xs font-semibold text-muted-foreground">
                            {row}
                        </div>

                        {/* Left side seats (A, B, C) */}
                        {columns.slice(0, 3).map(col => {
                            const seat = seats.find(s => s.row === row && s.column === col);
                            if (!seat) return null;
                            return (
                                <button
                                    key={seat.id}
                                    onClick={() => onSeatClick(seat)}
                                    onMouseEnter={() => onSeatHover(seat.id)}
                                    onMouseLeave={() => onSeatHover(null)}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xs font-semibold ${getSeatClass(seat)}`}
                                    disabled={seat.status === "occupied"}
                                >
                                    {selectedSeats.includes(seat.id) ? (
                                        <FaCheck className="text-sm" />
                                    ) : (
                                        <MdAirlineSeatReclineNormal className="text-lg" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Aisle */}
                        <div className="w-8"></div>

                        {/* Right side seats (D, E, F) */}
                        {columns.slice(3, 6).map(col => {
                            const seat = seats.find(s => s.row === row && s.column === col);
                            if (!seat) return null;
                            return (
                                <button
                                    key={seat.id}
                                    onClick={() => onSeatClick(seat)}
                                    onMouseEnter={() => onSeatHover(seat.id)}
                                    onMouseLeave={() => onSeatHover(null)}
                                    className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xs font-semibold ${getSeatClass(seat)}`}
                                    disabled={seat.status === "occupied"}
                                >
                                    {selectedSeats.includes(seat.id) ? (
                                        <FaCheck className="text-sm" />
                                    ) : (
                                        <MdAirlineSeatReclineNormal className="text-lg" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Row number right */}
                        <div className="w-8 text-center text-xs font-semibold text-muted-foreground">
                            {row}
                        </div>
                    </div>
                ))}
            </div>

            {/* Class Info */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">Business Class</p>
                    <p className="text-xs text-muted-foreground">
                        {seats.filter(s => s.type === 'business').length} seats
                    </p>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">First Class</p>
                    <p className="text-xs text-muted-foreground">
                        {seats.filter(s => s.type === 'first').length} seats
                    </p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Economy</p>
                    <p className="text-xs text-muted-foreground">
                        {seats.filter(s => s.type === 'economy').length} seats
                    </p>
                </div>
            </div>
        </div>
    );
}
