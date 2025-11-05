import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaPlane, FaQuoteLeft, FaStar, FaUsers } from "react-icons/fa";
import { MdFlightLand, MdFlightTakeoff } from "react-icons/md";

type Flight = {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    departure: string;
    destination: string;
    rating?: number;
    duration?: string;
};

type Place = {
    id: number;
    description: string;
    name: string;
    imgUrl: string;
    location?: string;
};

type Testimonial = {
    id: number;
    name: string;
    avatar: string;
    comment: string;
    rating: number;
};

function Flight() {
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);

    const flights: Flight[] = [
        {
            id: 1,
            name: "Direct Flight to Hanoi",
            description: "Comfortable direct flight with premium amenities",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1470&q=80",
            departure: "Ho Chi Minh City",
            destination: "Hanoi",
            rating: 4.8,
            duration: "2h 15m"
        },
        {
            id: 2,
            name: "Direct Flight to Hanoi",
            description: "Comfortable direct flight with premium amenities",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1470&q=80",
            departure: "Ho Chi Minh City",
            destination: "Hanoi",
            rating: 4.8,
            duration: "2h 15m"
        },
        {
            id: 3,
            name: "Direct Flight to Hanoi",
            description: "Comfortable direct flight with premium amenities",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1470&q=80",
            departure: "Ho Chi Minh City",
            destination: "Hanoi",
            rating: 4.8,
            duration: "2h 15m"
        },
        {
            id: 4,
            name: "Direct Flight to Hanoi",
            description: "Comfortable direct flight with premium amenities",
            price: 250,
            imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1470&q=80",
            departure: "Ho Chi Minh City",
            destination: "Hanoi",
            rating: 4.8,
            duration: "2h 15m"
        }
    ];

    const places: Place[] = [
        {
            id: 1,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            location: "Hanoi, Vietnam"
        },
        {
            id: 2,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            location: "Hanoi, Vietnam"
        },
        {
            id: 3,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            location: "Hanoi, Vietnam"
        },
        {
            id: 4,
            name: "Sofitel Legend Metropole Hanoi",
            description: "Historic luxury hotel in the heart of Hanoi since 1901",
            imgUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
            location: "Hanoi, Vietnam"
        }
    ];

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Sarah Johnson",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
            comment: "Amazing experience! The booking process was seamless and the flight was incredible. Highly recommend CloudRush!",
            rating: 5
        },
        {
            id: 2,
            name: "Michael Chen",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
            comment: "Best travel platform I've used. Great deals and excellent customer service throughout my journey.",
            rating: 5
        },
        {
            id: 3,
            name: "Emma Wilson",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
            comment: "CloudRush made my vacation planning so easy. Found amazing deals and the hotels were perfect!",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Search */}
            <div className="relative bg-linear-to-br from-[#07401F] via-[#224A33] to-[#357D52] py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Animated Icons */}
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <FaPlane className="text-[#148C56] text-5xl animate-pulse" />
                        <MdFlightTakeoff className="text-white text-6xl" />
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-6xl font-bold text-white text-center mb-8">
                        It's more than just a trip
                    </h1>

                    {/* Search Bar */}
                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* From */}
                            <div className="relative">
                                <MdFlightTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 text-[#148C56] text-xl" />
                                <Input
                                    placeholder="From where?"
                                    className="pl-10 h-12 border-[#357D52] focus:ring-[#148C56]"
                                />
                            </div>

                            {/* To */}
                            <div className="relative">
                                <MdFlightLand className="absolute left-3 top-1/2 -translate-y-1/2 text-[#148C56] text-xl" />
                                <Input
                                    placeholder="To where?"
                                    className="pl-10 h-12 border-[#357D52] focus:ring-[#148C56]"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="w-full h-12 rounded-md border border-[#357D52] bg-transparent px-4 text-left text-gray-600 hover:bg-[#148C56]/10 transition-colors flex items-center gap-2">
                                            <FaCalendarAlt className="text-[#148C56]" />
                                            When?
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Input type="date" />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Passengers */}
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="w-full h-12 rounded-md border border-[#357D52] bg-transparent px-4 text-left text-gray-600 hover:bg-[#148C56]/10 transition-colors flex items-center gap-2">
                                            <FaUsers className="text-[#148C56]" />
                                            {adults + children} Passengers
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                        <div className="space-y-4 p-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Adults</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                                        className="w-8 h-8 rounded-full bg-[#357D52] text-white hover:bg-[#148C56] transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{adults}</span>
                                                    <button
                                                        onClick={() => setAdults(adults + 1)}
                                                        className="w-8 h-8 rounded-full bg-[#357D52] text-white hover:bg-[#148C56] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">Children</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                                        className="w-8 h-8 rounded-full bg-[#357D52] text-white hover:bg-[#148C56] transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-semibold">{children}</span>
                                                    <button
                                                        onClick={() => setChildren(children + 1)}
                                                        className="w-8 h-8 rounded-full bg-[#357D52] text-white hover:bg-[#148C56] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Search Button */}
                            <button className="h-12 bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-bold rounded-lg hover:from-[#148C56] hover:to-[#357D52] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                Search Flights
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Flight Deals */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#07401F]">Featured Flight Deals</h2>
                        <p className="text-gray-600 mt-2">
                            Find your next adventure with these{" "}
                            <span className="text-[#148C56] font-semibold">exciting flight deals</span>
                        </p>
                    </div>
                    <button className="px-6 py-2 border-2 border-[#148C56] text-[#148C56] font-semibold rounded-lg hover:bg-[#148C56] hover:text-white transition-all duration-300">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {flights.map((flight) => (
                        <div
                            key={flight.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={flight.imageUrl}
                                    alt={flight.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-[#148C56] text-white px-4 py-2 rounded-full shadow-lg font-bold">
                                    ${flight.price}
                                </div>
                                {flight.duration && (
                                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold text-[#07401F]">
                                        {flight.duration}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-3">
                                {/* Route */}
                                <div className="flex items-center gap-2 text-sm text-[#357D52]">
                                    <span>{flight.departure}</span>
                                    <FaPlane className="text-[#148C56]" />
                                    <span>{flight.destination}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-[#07401F] group-hover:text-[#148C56] transition-colors">
                                    {flight.name}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 text-sm line-clamp-2">{flight.description}</p>

                                {/* Rating */}
                                {flight.rating && (
                                    <div className="flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={`text-sm ${
                                                    i < Math.floor(flight.rating!)
                                                        ? "text-[#148C56]"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                        <span className="text-sm font-semibold text-[#224A33]">
                                            {flight.rating}
                                        </span>
                                    </div>
                                )}

                                {/* Button */}
                                <button className="w-full bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-semibold py-3 rounded-lg hover:from-[#148C56] hover:to-[#357D52] transition-all duration-300 shadow-md hover:shadow-xl">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Featured Places to Stay */}
            <div className="bg-[#07401F]/5 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-[#07401F]">Places to Stay</h2>
                            <p className="text-gray-600 mt-2">
                                Explore unique{" "}
                                <span className="text-[#148C56] font-semibold">places to stay</span>
                            </p>
                        </div>
                        <button className="px-6 py-2 border-2 border-[#148C56] text-[#148C56] font-semibold rounded-lg hover:bg-[#148C56] hover:text-white transition-all duration-300">
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {places.map((place) => (
                            <div
                                key={place.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                            >
                                {/* Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={place.imgUrl}
                                        alt={place.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    {place.location && (
                                        <div className="flex items-center gap-2 text-[#357D52]">
                                            <FaMapMarkerAlt className="text-[#148C56]" />
                                            <span className="text-sm font-medium">{place.location}</span>
                                        </div>
                                    )}

                                    <h3 className="text-lg font-bold text-[#07401F] line-clamp-2 group-hover:text-[#148C56] transition-colors">
                                        {place.name}
                                    </h3>

                                    <p className="text-gray-600 text-sm line-clamp-2">{place.description}</p>

                                    <button className="w-full bg-white border-2 border-[#357D52] text-[#357D52] font-semibold py-3 rounded-lg hover:bg-[#357D52] hover:text-white transition-all duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Testimonials */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#07401F] mb-4">
                        What CloudRush Users Are Saying
                    </h2>
                    <p className="text-gray-600 text-lg">Real experiences from our travelers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Quote Icon */}
                            <FaQuoteLeft className="text-[#148C56] text-3xl mb-4 opacity-50" />

                            {/* Comment */}
                            <p className="text-gray-700 mb-6 italic">{testimonial.comment}</p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-[#148C56]" />
                                ))}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#148C56]"
                                />
                                <div>
                                    <p className="font-bold text-[#07401F]">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">Verified Traveler</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Flight;
