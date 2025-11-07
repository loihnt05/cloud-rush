import { createBooking, createPassenger } from "@/api/booking";
import { getFlight } from "@/api/flight";
import { createPayment } from "@/api/payment";
import { getFlightSeatsWithDetails } from "@/api/seat";
import { PassengerForm } from "@/components/passenger";
import type { Flight } from "@/types/flight";
import type { SeatWithStatus } from "@/types/seat";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaCalendarAlt, FaCheck, FaCreditCard, FaLock, FaPlane, FaUser } from "react-icons/fa";
import { MdAirlineSeatReclineNormal } from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";

interface PassengerFormData {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    dateOfBirth: string;
    email: string;
    phoneNumber: string;
    passengerType: "adult" | "child" | "infant";
    flightSeatId: number;
    seatNumber: string;
}

export default function Payment() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth0();
    
    // Get URL parameters
    const flightId = searchParams.get("flightId");
    const adults = parseInt(searchParams.get("adults") || "1");
    const children = parseInt(searchParams.get("children") || "0");
    const flightSeatIdsParam = searchParams.get("flightSeatIds");
    const flightSeatIds = flightSeatIdsParam ? flightSeatIdsParam.split(',').map(Number) : [];
    
    const [paymentStep, setPaymentStep] = useState<"passenger" | "payment" | "processing" | "success">("passenger");
    const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "paypal">("credit");
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    
    // Flight and seat data
    const [flight, setFlight] = useState<Flight | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<SeatWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Passenger data
    const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
    
    // Booking reference for success page
    const [bookingReference, setBookingReference] = useState<string>("");
    const [bookingId, setBookingId] = useState<number | null>(null);
    
    // Load flight and seat data
    useEffect(() => {
        const loadData = async () => {
            if (!flightId) {
                setError("No flight ID provided");
                setLoading(false);
                return;
            }

            if (flightSeatIds.length === 0) {
                setError("No seats selected");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const flightData = await getFlight(parseInt(flightId));
                setFlight(flightData);

                const seatsData = await getFlightSeatsWithDetails(parseInt(flightId), flightData);

                // Filter selected seats based on flightSeatIds
                const selected = seatsData.filter(seat => 
                    flightSeatIds.includes(seat.flight_seat_id)
                );
                setSelectedSeats(selected);

                // Initialize passenger forms
                const passengerForms: PassengerFormData[] = [];
                for (let i = 0; i < adults; i++) {
                    passengerForms.push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        suffix: "",
                        dateOfBirth: "",
                        email: "",
                        phoneNumber: "",
                        passengerType: "adult",
                        flightSeatId: selected[i]?.flight_seat_id || 0,
                        seatNumber: selected[i]?.seat_number || "",
                    });
                }
                for (let i = 0; i < children; i++) {
                    passengerForms.push({
                        firstName: "",
                        middleName: "",
                        lastName: "",
                        suffix: "",
                        dateOfBirth: "",
                        email: "",
                        phoneNumber: "",
                        passengerType: "child",
                        flightSeatId: selected[adults + i]?.flight_seat_id || 0,
                        seatNumber: selected[adults + i]?.seat_number || "",
                    });
                }
                setPassengers(passengerForms);
                setLoading(false);
            } catch (err) {
                console.error("Error loading data:", err);
                setError(err instanceof Error ? err.message : "Failed to load data");
                setLoading(false);
            }
        };

        loadData();
    }, [flightId]);

    const updatePassenger = (index: number, field: string, value: string) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const calculateTotal = () => {
        if (!flight) return 0;
        const basePrice = typeof flight.base_price === 'string' 
            ? parseFloat(flight.base_price) 
            : flight.base_price;
        const baseFare = basePrice * passengers.length;
        const seatUpgrades = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
        const taxes = (baseFare + seatUpgrades) * 0.15; // 15% tax
        return baseFare + seatUpgrades + taxes;
    };

    const validatePassengers = () => {
        for (const passenger of passengers) {
            if (!passenger.firstName || !passenger.lastName || !passenger.dateOfBirth || !passenger.email || !passenger.phoneNumber) {
                return false;
            }
        }
        return true;
    };

    const handleContinueToPayment = () => {
        if (!validatePassengers()) {
            alert("Please fill in all required passenger information");
            return;
        }
        setPaymentStep("payment");
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user?.sub) {
            alert("Please log in to complete your booking");
            return;
        }

        try {
            setPaymentStep("processing");

            // Step 1: Create booking
            const bookingData = await createBooking({
                user_id: user.sub,
                notes: `Flight ${flight?.flight_number} - ${passengers.length} passengers`,
            });

            const createdBookingId = bookingData.booking_id;
            setBookingId(createdBookingId);
            setBookingReference(bookingData.booking_reference);

            // Step 2: Create passengers
            for (const passenger of passengers) {
                await createPassenger({
                    booking_id: createdBookingId,
                    passenger_type: passenger.passengerType,
                    first_name: passenger.firstName,
                    middle_name: passenger.middleName || undefined,
                    last_name: passenger.lastName,
                    suffix: passenger.suffix || undefined,
                    date_of_birth: passenger.dateOfBirth,
                    email: passenger.email,
                    phone_number: passenger.phoneNumber,
                    flight_seat_id: passenger.flightSeatId,
                });
            }

            // Step 3: Create payment
            const total = calculateTotal();
            await createPayment({
                booking_id: createdBookingId,
                amount: total,
                method: paymentMethod === "credit" ? "credit_card" : paymentMethod,
                status: "completed",
            });

            // Success!
            setPaymentStep("success");
        } catch (err) {
            console.error("Error creating booking:", err);
            alert("Failed to process payment. Please try again.");
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
                    <p className="text-muted-foreground">Loading booking information...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !flight) {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-2xl p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
                    <p className="text-muted-foreground mb-6">{error || "Flight not found"}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-accent transition-all"
                    >
                        Go Back
                    </button>
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
                            <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                            <p className="text-3xl font-bold text-primary tracking-wider">{bookingReference}</p>
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
                                    <p className="text-muted-foreground">
                                        {new Date(flight.departure_time).toLocaleDateString()} at{" "}
                                        {new Date(flight.departure_time).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted/30 border border-border rounded-xl p-6">
                                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                    <MdAirlineSeatReclineNormal className="text-primary" />
                                    Passenger & Seats
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-muted-foreground">{passengers.length} Passenger(s)</p>
                                    <p className="font-semibold text-foreground">
                                        Seats: {selectedSeats.map(s => s.seat_number).join(", ")}
                                    </p>
                                    <p className="text-xl font-bold text-primary mt-3">
                                        Total: ${calculateTotal().toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate("/my-bookings")}
                                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-accent transition-all"
                            >
                                View My Bookings
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-all"
                            >
                                Book Another Flight
                            </button>
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
                    <p className="text-muted-foreground">Please wait while we process your booking...</p>
                </div>
            </div>
        );
    }

    // Passenger Information Step
    if (paymentStep === "passenger") {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
                        <h1 className="text-3xl font-bold text-foreground">Passenger Information</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Please provide details for all passengers
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Passenger Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {passengers.map((passenger, index) => (
                                <PassengerForm
                                    key={index}
                                    index={index}
                                    passenger={passenger}
                                    onUpdate={updatePassenger}
                                />
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4">
                                <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Flight</span>
                                        <span className="font-semibold text-foreground">{flight.flight_number}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Passengers</span>
                                        <span className="font-semibold text-foreground">{passengers.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Seats</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedSeats.map(s => s.seat_number).join(", ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Base Fare</span>
                                        <span className="text-sm font-semibold text-foreground">
                                            ${((typeof flight.base_price === 'string' ? parseFloat(flight.base_price) : flight.base_price) * passengers.length).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Seat Upgrades</span>
                                        <span className="text-sm font-semibold text-foreground">
                                            ${selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Taxes & Fees</span>
                                        <span className="text-sm font-semibold text-foreground">
                                            ${(calculateTotal() * 0.15).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="border-t border-border pt-3 flex items-center justify-between">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-2xl font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleContinueToPayment}
                                    className="w-full mt-6 bg-primary hover:bg-accent text-primary-foreground font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        </div>
                    </div>
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
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Payment</h1>
                            <p className="text-sm text-muted-foreground mt-1">Complete your booking</p>
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
                                <div className="grid md:grid-cols-3 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("credit")}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            paymentMethod === "credit"
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-muted/30 hover:border-primary/50"
                                        }`}
                                    >
                                        <FaCreditCard className={`text-2xl mx-auto mb-2 ${paymentMethod === "credit" ? "text-primary" : "text-muted-foreground"}`} />
                                        <p className="text-sm font-semibold text-foreground">Credit Card</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("debit")}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            paymentMethod === "debit"
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-muted/30 hover:border-primary/50"
                                        }`}
                                    >
                                        <FaCreditCard className={`text-2xl mx-auto mb-2 ${paymentMethod === "debit" ? "text-primary" : "text-muted-foreground"}`} />
                                        <p className="text-sm font-semibold text-foreground">Debit Card</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("paypal")}
                                        className={`p-4 rounded-xl border-2 transition-all ${
                                            paymentMethod === "paypal"
                                                ? "border-primary bg-primary/5"
                                                : "border-border bg-muted/30 hover:border-primary/50"
                                        }`}
                                    >
                                        <FaCreditCard className={`text-2xl mx-auto mb-2 ${paymentMethod === "paypal" ? "text-primary" : "text-muted-foreground"}`} />
                                        <p className="text-sm font-semibold text-foreground">PayPal</p>
                                    </button>
                                </div>
                            </div>

                            {/* Card Details */}
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
                                <button
                                    type="button"
                                    onClick={() => setPaymentStep("passenger")}
                                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-bold py-4 rounded-xl transition-all duration-300"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary hover:bg-accent text-primary-foreground font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <FaCheck />
                                    Confirm Payment ${calculateTotal().toFixed(2)}
                                </button>
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
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(flight.departure_time).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6 pb-6 border-b border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Passengers</span>
                                    <span className="text-sm font-semibold text-foreground">{passengers.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Seats</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        {selectedSeats.map(s => s.seat_number).join(", ")}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Base Fare</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        ${((typeof flight.base_price === 'string' ? parseFloat(flight.base_price) : flight.base_price) * passengers.length).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Seat Selection</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        ${selectedSeats.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Taxes & Fees</span>
                                    <span className="text-sm font-semibold text-foreground">
                                        ${(calculateTotal() * 0.15).toFixed(2)}
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
