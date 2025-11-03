import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FaPlane, FaClock, FaCalendarAlt, FaUsers, FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaIdCard } from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand, MdLuggage, MdContactPhone } from "react-icons/md";

export default function PassengerInformation() {
    const [CountBag, setCountBag] = useState(1);

    // Sample flight data - replace with actual data from props or API
    const flightInfo = {
        airline: "Vietnam Airlines",
        flightNumber: "VN123",
        departure: {
            city: "Ho Chi Minh City",
            airport: "SGN",
            time: "10:30 AM",
            date: "Nov 15, 2025"
        },
        arrival: {
            city: "Hanoi",
            airport: "HAN",
            time: "12:45 PM",
            date: "Nov 15, 2025"
        },
        duration: "2h 15m",
        passengers: 1,
        class: "Economy",
        price: 250
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5">
            {/* Left side - Form (w-3/5) */}
            <div className="w-full lg:w-3/5 space-y-6">
                {/* Passenger Information Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FaUser className="text-primary text-lg" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Passenger Information</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enter the required information for each traveler and be sure that it exactly matches the government-issued ID presented at the airport.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-6 grid-cols-1 gap-4 mt-6">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaIdCard className="text-primary" />
                                First name<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="Enter first name" 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Middle name
                            </label>
                            <Input 
                                placeholder="Enter middle name" 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaIdCard className="text-primary" />
                                Last name<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="Enter last name" 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 block">
                                Suffix
                            </label>
                            <Input 
                                placeholder="Jr., Sr., III, etc." 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaBirthdayCake className="text-primary" />
                                Date of birth<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="MM/DD/YYYY" 
                                type="date"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-primary" />
                                Email address<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="example@email.com" 
                                type="email"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaPhone className="text-primary" />
                                Phone number<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="+1 (555) 000-0000" 
                                type="tel"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <MdContactPhone className="text-accent text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Emergency Contact</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Provide contact information for someone we can reach in case of emergency.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-6 grid-cols-1 gap-4 mt-6">
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaUser className="text-accent" />
                                First name<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="Enter first name" 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaUser className="text-accent" />
                                Last name<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="Enter last name" 
                                type="text"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaEnvelope className="text-accent" />
                                Email address<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="example@email.com" 
                                type="email"
                                className="mt-1"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <FaPhone className="text-accent" />
                                Phone number<span className="text-red-500">*</span>
                            </label>
                            <Input 
                                placeholder="+1 (555) 000-0000" 
                                type="tel"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Bag Information Section */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                            <MdLuggage className="text-secondary text-xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">Bag Information</h2>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                        <p className="text-sm text-foreground leading-relaxed">
                            ✈️ Each passenger is allowed <span className="font-semibold text-primary">one free carry-on bag</span> and one personal item. 
                            First checked bag for each passenger is also <span className="font-semibold text-primary">free</span>. 
                            Second bag check fees are waived for loyalty program members. 
                            <a href="#" className="text-primary hover:underline ml-1">See the full bag policy</a>.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Passenger</label>
                            <p className="text-lg font-semibold text-foreground">First Seat</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 border border-border">
                            <label className="text-sm font-medium text-muted-foreground mb-2 block">Checked Bags</label>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setCountBag(c => Math.max(0, c - 1))}
                                    className="w-10 h-10 rounded-lg bg-muted hover:bg-accent/20 border border-border flex items-center justify-center font-bold text-foreground transition-all"
                                >
                                    −
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-bold text-primary">{CountBag}</span>
                                    <span className="text-sm text-muted-foreground ml-2">bag{CountBag !== 1 ? 's' : ''}</span>
                                </div>
                                <button 
                                    onClick={() => setCountBag(c => c + 1)}
                                    className="w-10 h-10 rounded-lg bg-primary hover:bg-accent text-primary-foreground border border-primary flex items-center justify-center font-bold transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Flight Information (w-2/5) */}
            <div className="w-full lg:w-2/5">
                <div className="bg-card border border-border rounded-2xl p-6 sticky top-4 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-foreground">Flight Details</h3>
                        <FaPlane className="text-primary text-2xl" />
                    </div>

                    {/* Flight Number & Airline */}
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground">Flight</p>
                        <p className="text-lg font-semibold text-foreground">
                            {flightInfo.airline} {flightInfo.flightNumber}
                        </p>
                    </div>

                    {/* Route */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            {/* Departure */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdFlightTakeoff className="text-primary" />
                                    <span className="text-sm font-medium text-foreground">{flightInfo.departure.airport}</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">{flightInfo.departure.time}</p>
                                <p className="text-sm text-muted-foreground">{flightInfo.departure.city}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <FaCalendarAlt className="inline mr-1" />
                                    {flightInfo.departure.date}
                                </p>
                            </div>

                            {/* Duration */}
                            <div className="flex flex-col items-center px-4">
                                <FaClock className="text-muted-foreground mb-1" />
                                <p className="text-xs text-muted-foreground whitespace-nowrap">{flightInfo.duration}</p>
                                <div className="w-16 h-0.5 bg-border my-2"></div>
                            </div>

                            {/* Arrival */}
                            <div className="flex-1 text-right">
                                <div className="flex items-center gap-2 mb-2 justify-end">
                                    <span className="text-sm font-medium text-foreground">{flightInfo.arrival.airport}</span>
                                    <MdFlightLand className="text-primary" />
                                </div>
                                <p className="text-2xl font-bold text-foreground">{flightInfo.arrival.time}</p>
                                <p className="text-sm text-muted-foreground">{flightInfo.arrival.city}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    <FaCalendarAlt className="inline mr-1" />
                                    {flightInfo.arrival.date}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border my-6"></div>

                    {/* Additional Info */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <FaUsers />
                                Passengers
                            </span>
                            <span className="text-sm font-semibold text-foreground">{flightInfo.passengers}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Class</span>
                            <span className="text-sm font-semibold text-foreground">{flightInfo.class}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Checked Bags</span>
                            <span className="text-sm font-semibold text-foreground">{CountBag}</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border my-6"></div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">Total Price</span>
                        <span className="text-2xl font-bold text-primary">${flightInfo.price}</span>
                    </div>

                    {/* Continue Button */}
                    <button className="w-full mt-6 bg-primary hover:bg-accent text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl">
                        Continue to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}