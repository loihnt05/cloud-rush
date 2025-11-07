import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaCreditCard, FaCheck } from "react-icons/fa";
import { getFlight } from "@/api/flight";
import { getBooking, getPassengersByBooking, confirmBooking } from "@/api/booking";
import { createPayment, getPaymentByBooking } from "@/api/payment";
import { getFlightSeatDetails, getSeatDetails } from "@/api/seat";
import type { Flight } from "@/types/flight";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { FlightSeat, Seat } from "@/types/seat";
import { Button } from "@/components/ui/button";
import useSettingStore from "@/stores/setting-store";

// Import refactored components
import PaymentMethodSelector from "@/components/payment/payment-method-selector";
import CreditCardForm from "@/components/payment/credit-card-form";
import PayPalInfo from "@/components/payment/paypal-info";
import BookingSummary from "@/components/payment/booking-summary";
import PaymentSuccess from "@/components/payment/payment-success";
import ErrorDisplay from "@/components/payment/error-display";
import SecurityNotice from "@/components/payment/security-notice";
import { LoadingSpinner, ProcessingPayment } from "@/components/payment/loading-states";

export default function Payment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
    const { accessToken } = useSettingStore();
    
    // URL parameters
    const bookingId = searchParams.get("bookingId");
    const flightId = searchParams.get("flightId");
    
    // State
    const [paymentStep, setPaymentStep] = useState<"payment" | "processing" | "success">("payment");
    const [paymentMethod, setPaymentMethod] = useState<"credit" | "paypal">("credit");
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    
    // Data
    const [flight, setFlight] = useState<Flight | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [passengerSeats, setPassengerSeats] = useState<Map<number, { seat: Seat; flightSeat: FlightSeat }>>(new Map());
    const [existingPayment, setExistingPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Load booking, flight, and passenger data
    useEffect(() => {
        const loadData = async () => {
            console.log("=== Payment Page Debug ===");
            console.log("bookingId:", bookingId);
            console.log("flightId:", flightId);
            console.log("authLoading:", authLoading);
            console.log("isAuthenticated:", isAuthenticated);
            console.log("accessToken:", accessToken ? "Present" : "Missing");
            console.log("user:", user);
            console.log("user.sub:", user?.sub);
            
            if (authLoading) {
                console.log("Waiting for authentication to complete...");
                return;
            }
            
            if (!bookingId || !flightId) {
                console.error("Missing parameters:", { bookingId, flightId });
                setError("Missing booking or flight information");
                setLoading(false);
                return;
            }

            if (!isAuthenticated || !user?.sub) {
                console.error("User not authenticated");
                setError("Please log in to access this page");
                setLoading(false);
                return;
            }

            if (!accessToken) {
                console.error("Access token not available yet, waiting...");
                return;
            }

            try {
                setLoading(true);
                
                console.log("Fetching booking:", bookingId);
                const bookingData = await getBooking(parseInt(bookingId));
                console.log("Booking data:", bookingData);
                
                // Authorization check
                console.log("Checking authorization:");
                console.log("- booking.user_id:", bookingData.user_id);
                console.log("- user.sub:", user.sub);
                
                if (bookingData.user_id !== user.sub) {
                    console.error("Authorization failed: Booking does not belong to user");
                    setError("You are not authorized to access this booking");
                    setLoading(false);
                    return;
                }
                
                console.log("✅ Authorization passed");
                setBooking(bookingData);

                console.log("Fetching flight:", flightId);
                const flightData = await getFlight(parseInt(flightId));
                console.log("Flight data:", flightData);
                setFlight(flightData);

                console.log("Fetching passengers for booking:", bookingId);
                const passengersData = await getPassengersByBooking(parseInt(bookingId));
                console.log("Passengers data:", passengersData);
                setPassengers(passengersData);

                // Load seat details
                const seatMap = new Map<number, { seat: Seat; flightSeat: FlightSeat }>();
                await Promise.all(
                    passengersData
                        .filter(p => p.flight_seat_id)
                        .map(async (passenger) => {
                            try {
                                const flightSeat = await getFlightSeatDetails(passenger.flight_seat_id!);
                                const seat = await getSeatDetails(flightSeat.seat_id);
                                seatMap.set(passenger.passenger_id, { seat, flightSeat });
                            } catch (err) {
                                console.error(`Failed to load seat for passenger ${passenger.passenger_id}:`, err);
                            }
                        })
                );
                setPassengerSeats(seatMap);

                // Check for existing payment
                try {
                    const paymentData = await getPaymentByBooking(parseInt(bookingId));
                    console.log("Existing payment:", paymentData);
                    if (paymentData && (paymentData.status === 'completed' || paymentData.status === 'success')) {
                        setExistingPayment(paymentData);
                        setPaymentStep("success");
                    }
                } catch {
                    console.log("No existing payment found, proceeding with payment form");
                }

                console.log("✅ All data loaded successfully");
                setLoading(false);
            } catch (err) {
                console.error("❌ Error loading data:", err);
                console.error("Error details:", {
                    message: err instanceof Error ? err.message : "Unknown error",
                    error: err
                });
                setError(err instanceof Error ? err.message : "Failed to load data");
                setLoading(false);
            }
        };

        loadData();
    }, [bookingId, flightId, user, authLoading, isAuthenticated, accessToken]);

    const calculateTotal = () => {
        if (!flight) return 0;
        
        const basePrice = typeof flight.base_price === 'string' 
            ? parseFloat(flight.base_price) 
            : flight.base_price;
        
        const baseFare = basePrice * passengers.length;
        
        let seatUpgradeCost = 0;
        passengers.forEach((passenger) => {
            const seatData = passengerSeats.get(passenger.passenger_id);
            if (seatData) {
                const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                    ? parseFloat(seatData.flightSeat.price_multiplier)
                    : seatData.flightSeat.price_multiplier;
                const upgradeCost = basePrice * (priceMultiplier - 1);
                seatUpgradeCost += Math.max(0, upgradeCost);
            }
        });
        
        const subtotal = baseFare + seatUpgradeCost;
        const taxes = subtotal * 0.15;
        return subtotal + taxes;
    };

    const validatePayment = () => {
        if (paymentMethod === "credit") {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
                alert("Please enter a valid 16-digit card number");
                return false;
            }
            if (!cardName.trim()) {
                alert("Please enter the cardholder name");
                return false;
            }
            if (!expiryDate || expiryDate.length !== 5) {
                alert("Please enter a valid expiry date (MM/YY)");
                return false;
            }
            if (!cvv || cvv.length !== 3) {
                alert("Please enter a valid 3-digit CVV");
                return false;
            }
        }
        return true;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.sub || !bookingId) {
            alert("Missing authentication or booking information");
            return;
        }

        if (!validatePayment()) {
            return;
        }

        try {
            setPaymentStep("processing");

            const total = calculateTotal();
            await createPayment({
                booking_id: parseInt(bookingId),
                amount: total,
                method: paymentMethod === "credit" ? "credit_card" : paymentMethod,
                status: "success",
            });

            await confirmBooking(parseInt(bookingId));

            setPaymentStep("success");
        } catch (err) {
            console.error("Error processing payment:", err);
            alert("Failed to process payment. Please try again.");
            setPaymentStep("payment");
        }
    };

    const handleSaveAndClose = async () => {
        if (!bookingId) {
            alert("Missing booking information");
            return;
        }

        try {
            setPaymentStep("processing");
            await confirmBooking(parseInt(bookingId));
            alert("Booking confirmed successfully!");
            navigate("/my-bookings");
        } catch (err) {
            console.error("Error confirming booking:", err);
            alert("Failed to confirm booking. Please try again.");
            setPaymentStep("payment");
        }
    };

    // Loading state
    if (loading) {
        return <LoadingSpinner message="Loading payment information..." />;
    }

    // Error state
    if (error || !flight || !booking) {
        const isAuthError = error?.includes("not authorized") || error?.includes("log in");
        return <ErrorDisplay error={error || "Booking or flight not found"} isAuthError={isAuthError} />;
    }

    // Success state
    if (paymentStep === "success") {
        return (
            <PaymentSuccess
                flight={flight}
                booking={booking}
                passengers={passengers}
                existingPayment={existingPayment}
                totalAmount={calculateTotal()}
            />
        );
    }

    // Processing state
    if (paymentStep === "processing") {
        return <ProcessingPayment />;
    }

    // Payment Step
    return (
        <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaCreditCard className="text-primary text-xl" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground">Payment</h1>
                            <p className="text-sm text-muted-foreground mt-1">Complete your booking</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-muted-foreground">Booking Reference</p>
                            <p className="text-lg font-bold text-primary">{booking.booking_reference}</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handlePayment} className="space-y-6">
                            <PaymentMethodSelector
                                selectedMethod={paymentMethod}
                                onMethodChange={setPaymentMethod}
                            />

                            {paymentMethod === "credit" ? (
                                <CreditCardForm
                                    cardNumber={cardNumber}
                                    cardName={cardName}
                                    expiryDate={expiryDate}
                                    cvv={cvv}
                                    onCardNumberChange={setCardNumber}
                                    onCardNameChange={setCardName}
                                    onExpiryChange={setExpiryDate}
                                    onCvvChange={setCvv}
                                />
                            ) : (
                                <PayPalInfo />
                            )}

                            <SecurityNotice />

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={handleSaveAndClose}
                                    className="border flex-1 bg-muted hover:cursor-pointer hover:bg-muted/70 text-foreground font-bold py-4 transition-all duration-300"
                                >
                                    Save & Close
                                </Button>
                                <Button
                                    type="submit"
                                    className="hover:cursor-pointer flex-1 font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <FaCheck />
                                    Confirm Payment ${calculateTotal().toFixed(2)}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <BookingSummary
                            flight={flight}
                            booking={booking}
                            passengers={passengers}
                            passengerSeats={passengerSeats}
                            totalAmount={calculateTotal()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
