import { useState } from "react";
import { FaPlane, FaCreditCard, FaCheck, FaLock, FaCalendarAlt, FaUser } from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand, MdQrCode2 } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";

export default function Payment() {
    const [paymentStep, setPaymentStep] = useState<"payment" | "success">("payment");
    const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "paypal">("credit");
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // Sample booking data
    const bookingData = {
        bookingReference: "CLDR" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        flight: {
            airline: "Vietnam Airlines",
            flightNumber: "VN123",
            departure: { city: "Ho Chi Minh City", code: "SGN", time: "10:30 AM", date: "Nov 15, 2025" },
            arrival: { city: "Hanoi", code: "HAN", time: "12:45 PM", date: "Nov 15, 2025" },
            duration: "2h 15m"
        },
        passenger: {
            name: "John Doe",
            email: "john.doe@example.com"
        },
        seats: ["12A", "12B"],
        pricing: {
            baseFare: 250,
            seatSelection: 50,
            taxes: 45,
            total: 345
        }
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate payment processing
        setTimeout(() => {
            setPaymentStep("success");
        }, 1500);
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

    if (paymentStep === "success") {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
                        {/* Success Header */}
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <BsCheckCircleFill className="text-primary text-5xl" />
                            </div>
                            <h1 className="text-4xl font-bold text-foreground mb-2">Payment Successful!</h1>
                            <p className="text-muted-foreground">Your booking has been confirmed</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left: Booking Details */}
                            <div className="space-y-6">
                                {/* Booking Reference */}
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                                    <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
                                    <p className="text-3xl font-bold text-primary tracking-wider">{bookingData.bookingReference}</p>
                                </div>

                                {/* Flight Info */}
                                <div className="bg-muted/30 border border-border rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaPlane className="text-primary" />
                                        <h3 className="font-bold text-foreground">Flight Details</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {bookingData.flight.airline} • {bookingData.flight.flightNumber}
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MdFlightTakeoff className="text-primary" />
                                                <div>
                                                    <p className="font-semibold text-foreground">{bookingData.flight.departure.code}</p>
                                                    <p className="text-xs text-muted-foreground">{bookingData.flight.departure.city}</p>
                                                </div>
                                            </div>
                                            <div className="text-center px-4">
                                                <div className="text-xs text-muted-foreground">{bookingData.flight.duration}</div>
                                                <div className="w-16 h-0.5 bg-border my-1"></div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="font-semibold text-foreground">{bookingData.flight.arrival.code}</p>
                                                    <p className="text-xs text-muted-foreground">{bookingData.flight.arrival.city}</p>
                                                </div>
                                                <MdFlightLand className="text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaCalendarAlt className="text-muted-foreground" />
                                            <span className="text-foreground">{bookingData.flight.departure.date}</span>
                                            <span className="text-muted-foreground">at {bookingData.flight.departure.time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Passenger & Seats */}
                                <div className="bg-muted/30 border border-border rounded-xl p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Passenger</span>
                                            <span className="font-semibold text-foreground">{bookingData.passenger.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Seats</span>
                                            <span className="font-semibold text-foreground">{bookingData.seats.join(", ")}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border">
                                            <span className="text-sm text-muted-foreground">Total Paid</span>
                                            <span className="text-xl font-bold text-primary">${bookingData.pricing.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirmation Email */}
                                <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                                    <p className="text-xs text-foreground">
                                        📧 A confirmation email has been sent to <span className="font-semibold">{bookingData.passenger.email}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Right: QR Code */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-primary/20">
                                    <div className="w-64 h-64 bg-white flex items-center justify-center">
                                        {/* Example QR Code - Using a placeholder image or SVG */}
                                        <div className="relative w-full h-full">
                                            <svg viewBox="0 0 256 256" className="w-full h-full">
                                                {/* QR Code Pattern - Simplified example */}
                                                <rect width="256" height="256" fill="white"/>
                                                
                                                {/* Corner markers */}
                                                <rect x="0" y="0" width="70" height="70" fill="none" stroke="black" strokeWidth="10"/>
                                                <rect x="20" y="20" width="30" height="30" fill="black"/>
                                                
                                                <rect x="186" y="0" width="70" height="70" fill="none" stroke="black" strokeWidth="10"/>
                                                <rect x="206" y="20" width="30" height="30" fill="black"/>
                                                
                                                <rect x="0" y="186" width="70" height="70" fill="none" stroke="black" strokeWidth="10"/>
                                                <rect x="20" y="206" width="30" height="30" fill="black"/>
                                                
                                                {/* Random pattern blocks to simulate QR code */}
                                                {Array.from({ length: 100 }).map((_, i) => {
                                                    const x = 80 + (i % 10) * 10;
                                                    const y = 80 + Math.floor(i / 10) * 10;
                                                    const shouldFill = Math.random() > 0.5;
                                                    return shouldFill ? <rect key={i} x={x} y={y} width="8" height="8" fill="black"/> : null;
                                                })}
                                                
                                                {/* Additional pattern blocks */}
                                                <rect x="90" y="20" width="8" height="8" fill="black"/>
                                                <rect x="110" y="20" width="8" height="8" fill="black"/>
                                                <rect x="130" y="20" width="8" height="8" fill="black"/>
                                                <rect x="90" y="40" width="8" height="8" fill="black"/>
                                                <rect x="130" y="40" width="8" height="8" fill="black"/>
                                                
                                                <rect x="20" y="90" width="8" height="8" fill="black"/>
                                                <rect x="20" y="110" width="8" height="8" fill="black"/>
                                                <rect x="20" y="130" width="8" height="8" fill="black"/>
                                                <rect x="40" y="90" width="8" height="8" fill="black"/>
                                                <rect x="40" y="130" width="8" height="8" fill="black"/>
                                                
                                                <rect x="200" y="90" width="8" height="8" fill="black"/>
                                                <rect x="220" y="90" width="8" height="8" fill="black"/>
                                                <rect x="240" y="90" width="8" height="8" fill="black"/>
                                                <rect x="200" y="110" width="8" height="8" fill="black"/>
                                                <rect x="240" y="110" width="8" height="8" fill="black"/>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-white rounded-lg p-2 shadow-lg">
                                                    <FaPlane className="text-primary text-2xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <MdQrCode2 className="text-primary text-xl" />
                                        <h3 className="font-bold text-foreground">Your Boarding Pass</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Scan this QR code at the airport
                                    </p>
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                                        <p className="text-xs text-foreground font-mono">
                                            {bookingData.bookingReference}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 w-full">
                                    <button className="w-full bg-primary hover:bg-accent text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl">
                                        Download Boarding Pass
                                    </button>
                                    <button className="w-full bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 rounded-lg transition-all duration-300">
                                        Email Boarding Pass
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 pt-8 border-t border-border flex flex-wrap gap-4 justify-center">
                            <button className="px-6 py-3 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-lg transition-all">
                                View My Bookings
                            </button>
                            <button className="px-6 py-3 bg-card hover:bg-muted border border-border text-foreground font-semibold rounded-lg transition-all">
                                Book Another Flight
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-accent text-primary-foreground font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <FaCheck />
                                Confirm Payment ${bookingData.pricing.total}
                            </button>
                        </form>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4">
                            <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>

                            {/* Flight Info */}
                            <div className="mb-6 pb-6 border-b border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaPlane className="text-primary" />
                                    <p className="text-sm font-semibold text-foreground">
                                        {bookingData.flight.airline}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-foreground">{bookingData.flight.departure.code}</p>
                                            <p className="text-xs text-muted-foreground">{bookingData.flight.departure.time}</p>
                                        </div>
                                        <div className="text-center px-4">
                                            <div className="text-xs text-muted-foreground">{bookingData.flight.duration}</div>
                                            <div className="w-12 h-0.5 bg-border my-1"></div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">{bookingData.flight.arrival.code}</p>
                                            <p className="text-xs text-muted-foreground">{bookingData.flight.arrival.time}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{bookingData.flight.departure.date}</p>
                                </div>
                            </div>

                            {/* Passenger & Seats */}
                            <div className="mb-6 pb-6 border-b border-border space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Passenger</span>
                                    <span className="text-sm font-semibold text-foreground">{bookingData.passenger.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Seats</span>
                                    <span className="text-sm font-semibold text-foreground">{bookingData.seats.join(", ")}</span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Base Fare</span>
                                    <span className="text-sm font-semibold text-foreground">${bookingData.pricing.baseFare}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Seat Selection</span>
                                    <span className="text-sm font-semibold text-foreground">${bookingData.pricing.seatSelection}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Taxes & Fees</span>
                                    <span className="text-sm font-semibold text-foreground">${bookingData.pricing.taxes}</span>
                                </div>
                                <div className="border-t border-border pt-3 flex items-center justify-between">
                                    <span className="text-lg font-bold text-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">${bookingData.pricing.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
