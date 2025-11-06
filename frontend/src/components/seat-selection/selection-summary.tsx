import { FaUser, FaTimes } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { type Flight } from "@/types/flight";
import { type SeatDisplay } from "@/types/seatDisplay";

interface SelectionSummaryProps {
    selectedSeats: string[];
    seats: SeatDisplay[];
    flight: Flight;
    totalPassengers: number;
    onRemoveSeat: (seat: SeatDisplay) => void;
    onClearSelection: () => void;
    onContinue: () => void;
}

export function SelectionSummary({
    selectedSeats,
    seats,
    flight,
    totalPassengers,
    onRemoveSeat,
    onClearSelection,
    onContinue
}: SelectionSummaryProps) {
    const getSelectedSeatsInfo = () => {
        return selectedSeats.map(id => seats.find(s => s.id === id)).filter(Boolean) as SeatDisplay[];
    };

    const getTotalPrice = () => {
        const selectedSeatsInfo = getSelectedSeatsInfo();
        const total = selectedSeatsInfo.reduce((sum, seat) => sum + seat.price, 0);
        
        // Debug logging
        console.log('💰 getTotalPrice Debug:', {
            selectedSeats: selectedSeatsInfo.map(s => ({
                id: s.id,
                seat_id: s.seat_id,
                type: s.type,
                price: s.price
            })),
            total: total
        });
        
        return total;
    };

    const basePrice = typeof flight.base_price === 'string' 
        ? parseFloat(flight.base_price) 
        : flight.base_price;

    return (
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
                                    {seat.price > 0 ? `+$${seat.price.toFixed(2)}` : "Included"}
                                </span>
                                <button
                                    onClick={() => onRemoveSeat(seat)}
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
                    <span className="text-sm text-muted-foreground">
                        Base Fare ({totalPassengers}x)
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                        ${(basePrice * totalPassengers).toFixed(2)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Seat Upgrades ({selectedSeats.length})
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                        {getTotalPrice() > 0 ? `$${getTotalPrice().toFixed(2)}` : "$0"}
                    </span>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">
                        ${((basePrice * totalPassengers) + getTotalPrice()).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Passenger Warning */}
            {selectedSeats.length > 0 && selectedSeats.length < totalPassengers && (
                <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        ⚠️ You need to select {totalPassengers - selectedSeats.length} more seat{totalPassengers - selectedSeats.length > 1 ? 's' : ''} for all passengers
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
                <Button 
                    className="w-full font-semibold transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedSeats.length !== totalPassengers}
                    title={selectedSeats.length !== totalPassengers ? `Please select exactly ${totalPassengers} seat${totalPassengers > 1 ? 's' : ''}` : ''}
                    onClick={onContinue}
                >
                    Continue
                </Button>
                <Button 
                    className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-lg transition-all duration-300"
                    onClick={onClearSelection}
                    disabled={selectedSeats.length === 0}
                >
                    Clear Selection
                </Button>
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
    );
}
