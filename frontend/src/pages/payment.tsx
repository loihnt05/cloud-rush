import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaPlane, FaCreditCard, FaCheck, FaLock, FaCalendarAlt, FaUser, FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { getFlight } from "@/api/flight";
import { getBooking, getPassengersByBooking, confirmBooking } from "@/api/booking";
import { createPayment, getPaymentByBooking } from "@/api/payment";
import { getFlightSeatDetails } from "@/api/seat";
import { getSeatDetails } from "@/api/seat";
import type { Flight } from "@/types/flight";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { FlightSeat, Seat } from "@/types/seat";
import { Button } from "@/components/ui/button";
import useSettingStore from "@/stores/setting-store";

export default function Payment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
    const { accessToken } = useSettingStore();
    
    // Get URL parameters
    const bookingId = searchParams.get("bookingId");
    const flightId = searchParams.get("flightId");
    
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
            
            // Wait for authentication to complete
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

            // Check if user is authenticated
            if (!isAuthenticated || !user?.sub) {
                console.error("User not authenticated");
                setError("Please log in to access this page");
                setLoading(false);
                return;
            }

            // Check if access token is available
            if (!accessToken) {
                console.error("Access token not available yet, waiting...");
                // Keep loading state, will retry when accessToken becomes available
                return;
            }

            try {
                setLoading(true);
                
                console.log("Fetching booking:", bookingId);
                // Load booking
                const bookingData = await getBooking(parseInt(bookingId));
                console.log("Booking data:", bookingData);
                
                // Authorization check: Verify the booking belongs to the current user
                console.log("Checking authorization:");
                console.log("- booking.user_id:", bookingData.user_id);
                console.log("- user.sub:", user.sub);
                console.log("- Match:", bookingData.user_id === user.sub);
                
                if (bookingData.user_id !== user.sub) {
                    console.error("Authorization failed: Booking does not belong to user");
                    setError("You are not authorized to access this booking");
                    setLoading(false);
                    return;
                }
                
                console.log("✅ Authorization passed");
                setBooking(bookingData);

                console.log("Fetching flight:", flightId);
                // Load flight
                const flightData = await getFlight(parseInt(flightId));
                console.log("Flight data:", flightData);
                setFlight(flightData);

                console.log("Fetching passengers for booking:", bookingId);
                // Load passengers
                const passengersData = await getPassengersByBooking(parseInt(bookingId));
                console.log("Passengers data:", passengersData);
                setPassengers(passengersData);

                // Load seat details for passengers with assigned seats
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

                // Check if payment already exists for this booking
                try {
                    const paymentData = await getPaymentByBooking(parseInt(bookingId));
                    console.log("Existing payment:", paymentData);
                    if (paymentData && (paymentData.status === 'completed' || paymentData.status === 'success')) {
                        // Payment already exists and is completed
                        setExistingPayment(paymentData);
                        setPaymentStep("success");
                    }
                } catch {
                    // No payment exists yet, which is fine
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
        // Always calculate total based on flight, passengers, and seats
        if (!flight) return 0;
        
        const basePrice = typeof flight.base_price === 'string' 
            ? parseFloat(flight.base_price) 
            : flight.base_price;
        
        // Calculate base fare for all passengers
        const baseFare = basePrice * passengers.length;
        
        // Add seat upgrade costs
        let seatUpgradeCost = 0;
        passengers.forEach((passenger) => {
            const seatData = passengerSeats.get(passenger.passenger_id);
            if (seatData) {
                const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                    ? parseFloat(seatData.flightSeat.price_multiplier)
                    : seatData.flightSeat.price_multiplier;
                // Calculate upgrade cost: base_price * (multiplier - 1)
                const upgradeCost = basePrice * (priceMultiplier - 1);
                seatUpgradeCost += Math.max(0, upgradeCost);
            }
        });
        
        const subtotal = baseFare + seatUpgradeCost;
        const taxes = subtotal * 0.15; // 15% tax
        return subtotal + taxes;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.sub || !bookingId) {
            alert("Missing authentication or booking information");
            return;
        }

        // Validate card information only for credit card payment
        if (paymentMethod === "credit") {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
                alert("Please enter a valid 16-digit card number");
                return;
            }

            if (!cardName.trim()) {
                alert("Please enter the cardholder name");
                return;
            }

            if (!expiryDate || expiryDate.length !== 5) {
                alert("Please enter a valid expiry date (MM/YY)");
                return;
            }

            if (!cvv || cvv.length !== 3) {
                alert("Please enter a valid 3-digit CVV");
                return;
            }
        }

        try {
            setPaymentStep("processing");

            // Create payment
            const total = calculateTotal();
            await createPayment({
                booking_id: parseInt(bookingId),
                amount: total,
                method: paymentMethod === "credit" ? "credit_card" : paymentMethod,
                status: "success", // Using "success" as per backend model
            });

            // Confirm booking
            await confirmBooking(parseInt(bookingId));

            // Success!
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

            // Only confirm booking without payment
            await confirmBooking(parseInt(bookingId));

            // Navigate to bookings page or home
            alert("Booking confirmed successfully!");
            navigate("/my-bookings");
        } catch (err) {
            console.error("Error confirming booking:", err);
            alert("Failed to confirm booking. Please try again.");
            setPaymentStep("payment");
        }
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, "");
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setCardNumber(formatCardNumber(value));
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length >= 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        if (value.length <= 5) {
            setExpiryDate(value);
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 3 && /^\d*$/.test(value)) {
            setCvv(value);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading payment information...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !flight || !booking) {
        const isAuthError = error?.includes("not authorized") || error?.includes("log in");
        const errorIcon = isAuthError ? "🔒" : "⚠️";
        const errorTitle = isAuthError ? "Access Denied" : "Error";
        
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
                    <div className="text-5xl mb-4">{errorIcon}</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{errorTitle}</h2>
                    <p className="text-muted-foreground mb-6">{error || "Booking or flight not found"}</p>
                    {isAuthError ? (
                        <div className="space-y-3">
                            <Button
                                onClick={() => navigate("/my-bookings")}
                                className="w-full font-semibold rounded-lg hover:cursor-pointer transition-all"
                            >
                                View My Bookings
                            </Button>
                            <Button
                                onClick={() => navigate("/")}
                                variant="outline"
                                className="w-full font-semibold rounded-lg hover:cursor-pointer transition-all"
                            >
                                Go Home
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => navigate(-1)}
                            className="font-semibold rounded-lg hover:cursor-pointer transition-all"
                        >
                            Go Back
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Success state
    if (paymentStep === "success") {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <BsCheckCircleFill className="text-primary text-5xl" />
                            </div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">Payment Successful!</h1>
                            <p className="text-muted-foreground">Your booking has been confirmed</p>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                                    <p className="text-2xl font-bold text-primary tracking-wider">{booking.booking_reference}</p>
                                </div>
                                {existingPayment && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {(existingPayment.status === 'completed' || existingPayment.status === 'success') ? '✓ PAID' : existingPayment.status.toUpperCase()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                    <FaPlane className="text-primary" />
                                    Flight Details
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">{flight.flight_number}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground">{flight.origin}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="font-semibold text-foreground">{flight.destination}</span>
                                    </div>
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground mb-1">Departure</p>
                                        <p className="text-muted-foreground">
                                            {new Date(flight.departure_time).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="font-semibold text-foreground">
                                            {new Date(flight.departure_time).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    {flight.arrival_time && (
                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                                            <p className="text-muted-foreground">
                                                {new Date(flight.arrival_time).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="font-semibold text-foreground">
                                                {new Date(flight.arrival_time).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                    <MdAirlineSeatReclineNormal className="text-primary" />
                                    Passengers & Payment
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground mb-2">{passengers.length} Passenger(s)</p>
                                    {passengers.slice(0, 3).map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-1">
                                            <span className="font-semibold text-foreground">
                                                {p.first_name} {p.last_name}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                                {p.passenger_type}
                                            </span>
                                        </div>
                                    ))}
                                    {passengers.length > 3 && (
                                        <p className="text-xs text-muted-foreground italic">
                                            +{passengers.length - 3} more passenger{passengers.length - 3 > 1 ? 's' : ''}
                                        </p>
                                    )}
                                    <div className="pt-3 border-t border-border mt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-muted-foreground">Payment Amount</span>
                                            <span className="text-xl font-bold text-primary">
                                                ${calculateTotal().toFixed(2)}
                                            </span>
                                        </div>
                                        {existingPayment && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Payment Method</span>
                                                <span className="text-foreground font-medium">
                                                    {existingPayment.method || 'Credit Card'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                onClick={() => navigate("/my-bookings")}
                                className="font-semibold rounded hover:cursor-pointer transition-all"
                            >
                                View My Bookings
                            </Button>
                            <Button
                                onClick={() => navigate("/")}
                                className="hover:cursor-pointer font-semibold transition-all"
                            >
                                Book Another Flight
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Processing state
    if (paymentStep === "processing") {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center">
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Processing Payment</h2>
                    <p className="text-muted-foreground">Please wait while we process your payment...</p>
                </div>
            </div>
        );
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
                            {/* Payment Method Selection */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-foreground mb-4">Payment Method</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("credit")}
                                        className={`p-6 rounded-xl border-2 transition-all ${
                                            paymentMethod === "credit"
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-border bg-muted/30 hover:border-primary/50"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <FaCreditCard className={`text-3xl mb-3 ${paymentMethod === "credit" ? "text-primary" : "text-muted-foreground"}`} />
                                            <p className="text-base font-semibold text-foreground mb-2">Credit Card</p>
                                            <div className="flex gap-2 mt-2">
                                                <FaCcVisa className="text-2xl text-blue-600" />
                                                <FaCcMastercard className="text-2xl text-orange-500" />
                                                <FaCcAmex className="text-2xl text-blue-500" />
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("paypal")}
                                        className={`p-6 rounded-xl border-2 transition-all ${
                                            paymentMethod === "paypal"
                                                ? "border-primary bg-primary/5 shadow-md"
                                                : "border-border bg-muted/30 hover:border-primary/50"
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <FaPaypal className={`text-3xl mb-3 ${paymentMethod === "paypal" ? "text-primary" : "text-muted-foreground"}`} />
                                            <p className="text-base font-semibold text-foreground mb-2">PayPal</p>
                                            <p className="text-xs text-muted-foreground">Fast & secure checkout</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Card Details - Only show for Credit Card */}
                            {paymentMethod === "credit" && (
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                                    <h2 className="text-xl font-bold text-foreground mb-4">Card Details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                                <FaCreditCard className="text-primary" />
                                                Card Number<span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={handleCardNumberChange}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                                <FaUser className="text-primary" />
                                                Cardholder Name<span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                                required
                                            />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                                    <FaCalendarAlt className="text-primary" />
                                                    Expiry Date<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={expiryDate}
                                                    onChange={handleExpiryChange}
                                                    placeholder="MM/YY"
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                                    <FaLock className="text-primary" />
                                                    CVV<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={cvv}
                                                    onChange={handleCvvChange}
                                                    placeholder="123"
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PayPal Info - Only show for PayPal */}
                            {paymentMethod === "paypal" && (
                                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                                    <div className="flex items-center gap-4 mb-4">
                                        <FaPaypal className="text-4xl text-[#0070BA]" />
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">PayPal Checkout</h2>
                                            <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment</p>
                                        </div>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center gap-2">
                                                <FaCheck className="text-primary" />
                                                <span className="text-foreground">Pay with your PayPal balance or linked account</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <FaCheck className="text-primary" />
                                                <span className="text-foreground">Secure and encrypted transaction</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <FaCheck className="text-primary" />
                                                <span className="text-foreground">Buyer protection included</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Security Notice */}
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                                <FaLock className="text-primary mt-1" />
                                <div>
                                    <p className="text-sm font-semibold text-foreground mb-1">Secure Payment</p>
                                    <p className="text-xs text-muted-foreground">
                                        Your payment information is encrypted and secure. We do not store your card details.
                                    </p>
                                </div>
                            </div>

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
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4">
                            <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>

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

                            <div className="space-y-3 mb-6 pb-6 border-b border-border">
                                <h4 className="text-sm font-semibold text-foreground mb-2">Passenger Details</h4>
                                {passengers.map((p, idx) => {
                                    const seatData = passengerSeats.get(p.passenger_id);
                                    const basePrice = typeof flight.base_price === 'string' 
                                        ? parseFloat(flight.base_price) 
                                        : flight.base_price;
                                    
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

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Base Fare ({passengers.length} × ${
                                        typeof flight.base_price === 'string' 
                                            ? parseFloat(flight.base_price).toFixed(2)
                                            : flight.base_price.toFixed(2)
                                    })</span>
                                    <span className="text-foreground font-medium">
                                        ${(passengers.length * (typeof flight.base_price === 'string' 
                                            ? parseFloat(flight.base_price) 
                                            : flight.base_price)).toFixed(2)}
                                    </span>
                                </div>
                                {(() => {
                                    const basePrice = typeof flight.base_price === 'string' 
                                        ? parseFloat(flight.base_price) 
                                        : flight.base_price;
                                    let totalSeatUpgrades = 0;
                                    passengers.forEach((passenger) => {
                                        const seatData = passengerSeats.get(passenger.passenger_id);
                                        if (seatData) {
                                            const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                                                ? parseFloat(seatData.flightSeat.price_multiplier)
                                                : seatData.flightSeat.price_multiplier;
                                            totalSeatUpgrades += Math.max(0, basePrice * (priceMultiplier - 1));
                                        }
                                    });
                                    
                                    if (totalSeatUpgrades > 0) {
                                        return (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Seat Upgrades</span>
                                                <span className="text-foreground font-medium">
                                                    ${totalSeatUpgrades.toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Taxes & Fees (15%)</span>
                                    <span className="text-foreground font-medium">
                                        ${(() => {
                                            const basePrice = typeof flight.base_price === 'string' 
                                                ? parseFloat(flight.base_price) 
                                                : flight.base_price;
                                            const baseFare = basePrice * passengers.length;
                                            let seatUpgrades = 0;
                                            passengers.forEach((passenger) => {
                                                const seatData = passengerSeats.get(passenger.passenger_id);
                                                if (seatData) {
                                                    const priceMultiplier = typeof seatData.flightSeat.price_multiplier === 'string'
                                                        ? parseFloat(seatData.flightSeat.price_multiplier)
                                                        : seatData.flightSeat.price_multiplier;
                                                    seatUpgrades += Math.max(0, basePrice * (priceMultiplier - 1));
                                                }
                                            });
                                            const subtotal = baseFare + seatUpgrades;
                                            return (subtotal * 0.15).toFixed(2);
                                        })()}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3 flex items-center justify-between">
                                    <span className="text-lg font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
