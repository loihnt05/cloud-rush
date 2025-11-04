import { useState } from "react";
import { FaPlane, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { MdAirlineSeatReclineNormal, MdFlightTakeoff, MdFlightLand } from "react-icons/md";

interface Seat {
    id: string;
    row: number;
    column: string;
    type: "economy" | "business" | "premium";
    status: "available" | "occupied" | "selected";
    price: number;
}

export default function SeatSelection() {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

    // Sample flight data
    const flightInfo = {
        airline: "Vietnam Airlines",
        flightNumber: "VN123",
        departure: { city: "Ho Chi Minh City", code: "SGN", time: "10:30 AM" },
        arrival: { city: "Hanoi", code: "HAN", time: "12:45 PM" },
        duration: "2h 15m",
        date: "Nov 15, 2025"
    };

    // Generate seats
    const generateSeats = (): Seat[] => {
        const seats: Seat[] = [];
        const columns = ["A", "B", "C", "D", "E", "F"];
        
        // Business class (rows 1-3)
        for (let row = 1; row <= 3; row++) {
            columns.forEach((col) => {
                seats.push({
                    id: `${row}${col}`,
                    row,
                    column: col,
                    type: "business",
                    status: Math.random() > 0.7 ? "occupied" : "available",
                    price: 150
                });
            });
        }

        // Premium economy (rows 4-8)
        for (let row = 4; row <= 8; row++) {
            columns.forEach((col) => {
                seats.push({
                    id: `${row}${col}`,
                    row,
                    column: col,
                    type: "premium",
                    status: Math.random() > 0.6 ? "occupied" : "available",
                    price: 50
                });
            });
        }

        // Economy (rows 9-30)
        for (let row = 9; row <= 30; row++) {
            columns.forEach((col) => {
                seats.push({
                    id: `${row}${col}`,
                    row,
                    column: col,
                    type: "economy",
                    status: Math.random() > 0.5 ? "occupied" : "available",
                    price: 0
                });
            });
        }

        return seats;
    };

    const [seats] = useState<Seat[]>(generateSeats());

    const handleSeatClick = (seat: Seat) => {
        if (seat.status === "occupied") return;

        if (selectedSeats.includes(seat.id)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat.id]);
        }
    };

    const getSeatClass = (seat: Seat) => {
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
            case "premium":
                return "bg-card hover:bg-primary/10 border-primary/30";
            default:
                return "bg-card hover:bg-muted border-border";
        }
    };

    const getSelectedSeatsInfo = () => {
        return selectedSeats.map(id => seats.find(s => s.id === id)).filter(Boolean) as Seat[];
    };

    const getTotalPrice = () => {
        return getSelectedSeatsInfo().reduce((sum, seat) => sum + seat.price, 0);
    };

    const rows = Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b);
    const columns = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <FaPlane className="text-primary text-xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Select Your Seat</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {flightInfo.airline} • {flightInfo.flightNumber}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MdFlightTakeoff className="text-primary" />
                                    <span>{flightInfo.departure.code}</span>
                                </div>
                                <p className="text-lg font-semibold text-foreground">{flightInfo.departure.time}</p>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-muted-foreground">{flightInfo.duration}</div>
                                <div className="w-16 h-0.5 bg-border my-1"></div>
                                <div className="text-xs text-muted-foreground">{flightInfo.date}</div>
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{flightInfo.arrival.code}</span>
                                    <MdFlightLand className="text-primary" />
                                </div>
                                <p className="text-lg font-semibold text-foreground">{flightInfo.arrival.time}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Seat Map */}
                    <div className="lg:col-span-2">
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
                                                    onClick={() => handleSeatClick(seat)}
                                                    onMouseEnter={() => setHoveredSeat(seat.id)}
                                                    onMouseLeave={() => setHoveredSeat(null)}
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
                                                    onClick={() => handleSeatClick(seat)}
                                                    onMouseEnter={() => setHoveredSeat(seat.id)}
                                                    onMouseLeave={() => setHoveredSeat(null)}
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

                                        {/* Section labels */}
                                        {row === 2 && (
                                            <div className="absolute right-4 text-xs font-semibold text-accent">
                                                Business
                                            </div>
                                        )}
                                        {row === 6 && (
                                            <div className="absolute right-4 text-xs font-semibold text-primary">
                                                Premium
                                            </div>
                                        )}
                                        {row === 15 && (
                                            <div className="absolute right-4 text-xs font-semibold text-muted-foreground">
                                                Economy
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Class Info */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                                <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/20">
                                    <p className="text-xs text-muted-foreground mb-1">Business Class</p>
                                    <p className="text-lg font-bold text-accent">+$150</p>
                                    <p className="text-xs text-muted-foreground">Rows 1-3</p>
                                </div>
                                <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                                    <p className="text-xs text-muted-foreground mb-1">Premium Economy</p>
                                    <p className="text-lg font-bold text-primary">+$50</p>
                                    <p className="text-xs text-muted-foreground">Rows 4-8</p>
                                </div>
                                <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground mb-1">Economy</p>
                                    <p className="text-lg font-bold text-foreground">Free</p>
                                    <p className="text-xs text-muted-foreground">Rows 9-30</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selection Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4">
                            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <FaUser className="text-primary" />
                                Your Selection
                            </h3>

                            {selectedSeats.length === 0 ? (
                                <div className="text-center py-8">
                                    <MdAirlineSeatReclineNormal className="text-5xl text-muted-foreground/30 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground">No seats selected</p>
                                    <p className="text-xs text-muted-foreground mt-2">Click on available seats to select</p>
                                </div>
                            ) : (
                                <div className="space-y-3 mb-6">
                                    {getSelectedSeatsInfo().map((seat) => (
                                        <div key={seat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                                                    <span className="text-xs font-bold text-primary-foreground">{seat.id}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Seat {seat.id}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{seat.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">
                                                    {seat.price > 0 ? `$${seat.price}` : "Free"}
                                                </span>
                                                <button
                                                    onClick={() => handleSeatClick(seat)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <FaTimes className="text-lg" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Price Summary */}
                            <div className="border-t border-border pt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Base Fare</span>
                                    <span className="text-sm font-semibold text-foreground">$250</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Seat Selection ({selectedSeats.length})
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {getTotalPrice() > 0 ? `$${getTotalPrice()}` : "$0"}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3 flex items-center justify-between">
                                    <span className="text-lg font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ${250 + getTotalPrice()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <button 
                                    className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={selectedSeats.length === 0}
                                >
                                    Continue to Payment
                                </button>
                                <button 
                                    className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-lg transition-all duration-300"
                                    onClick={() => setSelectedSeats([])}
                                    disabled={selectedSeats.length === 0}
                                >
                                    Clear Selection
                                </button>
                            </div>

                            {/* Tips */}
                            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <p className="text-xs text-foreground font-semibold mb-2">💡 Pro Tips:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li>• Exit rows offer extra legroom</li>
                                    <li>• Window seats (A, F) for views</li>
                                    <li>• Aisle seats (C, D) for easy access</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
