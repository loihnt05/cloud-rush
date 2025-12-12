import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlane,
  FaQuoteLeft,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { MdFlightLand, MdFlightTakeoff } from "react-icons/md";
import { getAirports } from "@/api/airport";
import { getFlights } from "@/api/flight";
import { hotelsApi } from "@/api/hotels";
import { placesApi } from "@/api/places";
import type { Airport } from "@/types/airport";
import { Button } from "@/components/ui/button";

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

type Testimonial = {
  id: number;
  name: string;
  avatar: string;
  comment: string;
  rating: number;
};

function Flight() {
  const navigate = useNavigate();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [fromAirport, setFromAirport] = useState<Airport | null>(null);
  const [toAirport, setToAirport] = useState<Airport | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch airports using useQuery
  const { data: airports = [], isLoading: isLoadingAirports } = useQuery({
    queryKey: ["airports"],
    queryFn: getAirports,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch flights from database
  const { data: flightsData = [], isLoading: isLoadingFlights } = useQuery({
    queryKey: ["flights"],
    queryFn: getFlights,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch hotels from database
  const { data: hotelsData = [], isLoading: isLoadingHotels } = useQuery({
    queryKey: ["hotels"],
    queryFn: hotelsApi.getHotels,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch places from database
  const { data: placesData = [], isLoading: isLoadingPlaces } = useQuery({
    queryKey: ["places"],
    queryFn: placesApi.getPlaces,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearchFlights = () => {
    // Clear previous errors
    setErrorMessage("");

    // Validation: Check if origin and destination are selected
    if (!fromAirport || !toAirport) {
      setErrorMessage("Please select both origin and destination airports.");
      return;
    }

    // Validation: Check if origin and destination are the same
    if (fromAirport.airport_id === toAirport.airport_id) {
      setErrorMessage("Origin and destination cannot be the same. Please select different airports.");
      return;
    }

    // Validation: Check if date is selected
    if (!departureDate) {
      setErrorMessage("Please select a departure date.");
      return;
    }

    // Validation: Check if date is in the past
    const selectedDate = new Date(departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setErrorMessage("Please select a future date. Past dates are not allowed.");
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("from", fromAirport.airport_id.toString());
    searchParams.set("to", toAirport.airport_id.toString());
    searchParams.set("adults", adults.toString());
    searchParams.set("children", children.toString());
    searchParams.set("date", departureDate);

    navigate(`/flights/search?${searchParams.toString()}`);
  };

  const filteredFromAirports = airports.filter(
    (airport) =>
      airport.name.toLowerCase().includes(fromSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(fromSearch.toLowerCase()) ||
      airport.iata_code.toLowerCase().includes(fromSearch.toLowerCase()) ||
      airport.country.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToAirports = airports.filter(
    (airport) =>
      airport.name.toLowerCase().includes(toSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(toSearch.toLowerCase()) ||
      airport.iata_code.toLowerCase().includes(toSearch.toLowerCase()) ||
      airport.country.toLowerCase().includes(toSearch.toLowerCase())
  );

  // Random image generator for variety
  const getRandomFlightImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1470&q=80",
      "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1470&q=80",
      "https://images.unsplash.com/photo-1583946099379-f9c9cb8bc030?w=1470&q=80",
      "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1470&q=80",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getRandomHotelImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1470&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1470&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1470&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1470&q=80",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  const getRandomPlaceImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1470&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1470&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1470&q=80",
      "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1470&q=80",
    ];
    return images[Math.floor(Math.random() * images.length)];
  };

  // Transform database flights into display format - limit to 4 items
  const flights = (flightsData || []).slice(0, 4).map(flight => {
    const departureDate = new Date(flight.departure_time);
    const arrivalDate = new Date(flight.arrival_time);
    const durationMs = arrivalDate.getTime() - departureDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const price = typeof flight.base_price === 'string' 
      ? parseFloat(flight.base_price) 
      : flight.base_price;
    
    return {
      id: flight.flight_id,
      name: `Flight ${flight.flight_number}`,
      description: `${flight.status} flight with premium amenities`,
      price: Math.round(price),
      imageUrl: getRandomFlightImage(),
      departure: flight.origin || `Airport ${flight.origin_airport_id}`,
      destination: flight.destination || `Airport ${flight.destination_airport_id}`,
      rating: 4.5,
      duration: `${hours}h ${minutes}m`,
    };
  });

  // Transform hotels data - limit to 4 items
  const hotels = (hotelsData || []).slice(0, 4).map(hotel => ({
    id: hotel.hotel_id,
    name: `${hotel.stars || 3}-Star Hotel`,
    description: hotel.description || "Luxury accommodation with excellent amenities",
    imgUrl: getRandomHotelImage(),
    location: hotel.location || "Premium Location",
    stars: hotel.stars || 3,
  }));

  // Transform places data - limit to 4 items
  const places = (placesData || []).slice(0, 4).map(place => ({
    id: place.place_id,
    name: place.name,
    description: place.description || "Explore this amazing destination",
    imgUrl: getRandomPlaceImage(),
    location: `${place.city || ''}${place.city && place.country ? ', ' : ''}${place.country || ''}`.trim() || "Beautiful Location",
  }));

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
      comment:
        "Amazing experience! The booking process was seamless and the flight was incredible. Highly recommend CloudRush!",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      comment:
        "Best travel platform I've used. Great deals and excellent customer service throughout my journey.",
      rating: 5,
    },
    {
      id: 3,
      name: "Emma Wilson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
      comment:
        "CloudRush made my vacation planning so easy. Found amazing deals and the hotels were perfect!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
          <div className="bg-card border-border rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Error Message */}
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* From */}
              <div className="relative">
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-md border border-[#357D52] bg-transparent px-4 pl-10 text-left text-gray-600 hover:bg-[#148C56]/10 transition-colors flex items-center">
                      <MdFlightTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 text-[#148C56] text-xl" />
                      {fromAirport ? (
                        <span className="text-gray-900">
                          {fromAirport.city} ({fromAirport.iata_code})
                        </span>
                      ) : (
                        "From where?"
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={fromSearch}
                        onValueChange={setFromSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingAirports
                            ? "Loading airports..."
                            : "No airports found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredFromAirports.map((airport) => (
                            <CommandItem
                              key={airport.airport_id}
                              value={`${airport.city} ${airport.name} ${airport.iata_code}`}
                              onSelect={() => {
                                setFromAirport(airport);
                                setFromOpen(false);
                                setFromSearch("");
                                setErrorMessage(""); // Clear error when selection changes
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  {airport.city} ({airport.iata_code})
                                </span>
                                <span className="text-sm text-gray-500">
                                  {airport.name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* To */}
              <div className="relative">
                <Popover open={toOpen} onOpenChange={setToOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-md border border-[#357D52] bg-transparent px-4 pl-10 text-left text-gray-600 hover:bg-[#148C56]/10 transition-colors flex items-center">
                      <MdFlightLand className="absolute left-3 top-1/2 -translate-y-1/2 text-[#148C56] text-xl" />
                      {toAirport ? (
                        <span className="text-gray-900">
                          {toAirport.city} ({toAirport.iata_code})
                        </span>
                      ) : (
                        "To where?"
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search airports..."
                        value={toSearch}
                        onValueChange={setToSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isLoadingAirports
                            ? "Loading airports..."
                            : "No airports found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredToAirports.map((airport) => (
                            <CommandItem
                              key={airport.airport_id}
                              value={`${airport.city} ${airport.name} ${airport.iata_code}`}
                              onSelect={() => {
                                setToAirport(airport);
                                setToOpen(false);
                                setToSearch("");
                                setErrorMessage(""); // Clear error when selection changes
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">
                                  {airport.city} ({airport.iata_code})
                                </span>
                                <span className="text-sm text-gray-500">
                                  {airport.name}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date */}
              <div>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 rounded-md border border-[#357D52] bg-transparent px-4 text-left text-gray-600 hover:bg-[#148C56]/10 transition-colors flex items-center gap-2">
                      <FaCalendarAlt className="text-[#148C56]" />
                      {departureDate ? new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "When?"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Input 
                      type="date" 
                      value={departureDate}
                      onChange={(e) => {
                        setDepartureDate(e.target.value);
                        setErrorMessage(""); // Clear error when date changes
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
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
                          <span className="w-8 text-center font-semibold">
                            {adults}
                          </span>
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
                            onClick={() =>
                              setChildren(Math.max(0, children - 1))
                            }
                            className="w-8 h-8 rounded-full bg-[#357D52] text-white hover:bg-[#148C56] transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {children}
                          </span>
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
              <button
                onClick={handleSearchFlights}
                className="h-12 bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-bold rounded-lg hover:from-[#148C56] hover:to-[#357D52] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
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
            <h2 className="text-3xl font-bold text-[#07401F]">
              Featured Flight Deals
            </h2>
            <p className="text-gray-600 mt-2">
              Find your next adventure with these{" "}
              <span className="text-[#148C56] font-semibold">
                exciting flight deals
              </span>
            </p>
          </div>
          <button onClick={() => {}} className="px-6 py-2 border-2 border-[#148C56] text-[#148C56] font-semibold rounded-lg hover:bg-[#148C56] hover:text-white transition-all duration-300">
            View All
          </button>
        </div>

        {isLoadingFlights ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#148C56]"></div>
              <p className="mt-4 text-gray-600">Loading flights...</p>
            </div>
          </div>
        ) : flights.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No flights available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="group bg-card border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
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
                  <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-lg text-sm font-semibold text-[#07401F]">
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
                <p className="text-gray-600 text-sm line-clamp-2">
                  {flight.description}
                </p>

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
                <Button className="hover:cursor-pointer w-full bg-linear-to-r from-[#224A33] to-[#148C56] text-white font-semibold 
                py-3 rounded-lg hover:from-[#148C56] hover:to-[#357D52] 
                transition-all duration-300 shadow-md hover:shadow-xl"
                onClick={() => navigate(`/passenger-information?flightId=${flight.id}&adults=${adults}&children=${children}`)}
                >
                  Book Now
                </Button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Places to Stay */}
      <div className="bg-[#07401F]/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#07401F]">
                Places to Stay
              </h2>
              <p className="text-gray-600 mt-2">
                Explore unique{" "}
                <span className="text-[#148C56] font-semibold">
                  places to stay
                </span>
              </p>
            </div>
            <button className="px-6 py-2 border-2 border-[#148C56] text-[#148C56] font-semibold rounded-lg hover:bg-[#148C56] hover:text-white transition-all duration-300">
              View All
            </button>
          </div>

          {isLoadingHotels ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#148C56]"></div>
                <p className="mt-4 text-gray-600">Loading hotels...</p>
              </div>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No hotels available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group bg-card border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={hotel.imgUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {hotel.stars && (
                      <div className="absolute top-4 right-4 bg-[#148C56] text-white px-3 py-1 rounded-full shadow-lg font-bold flex items-center gap-1">
                        {[...Array(hotel.stars)].map((_, i) => (
                          <FaStar key={i} className="text-xs" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    {hotel.location && (
                      <div className="flex items-center gap-2 text-[#357D52]">
                        <FaMapMarkerAlt className="text-[#148C56]" />
                        <span className="text-sm font-medium">
                          {hotel.location}
                        </span>
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-[#07401F] line-clamp-2 group-hover:text-[#148C56] transition-colors">
                      {hotel.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {hotel.description}
                    </p>

                    <button className="w-full bg-background border-2 border-[#357D52] text-[#357D52] font-semibold py-3 rounded-lg hover:bg-[#357D52] hover:text-white transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Places to Explore */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#07401F]">
              Places to Explore
            </h2>
            <p className="text-gray-600 mt-2">
              Discover amazing{" "}
              <span className="text-[#148C56] font-semibold">
                destinations
              </span>
            </p>
          </div>
          <button className="px-6 py-2 border-2 border-[#148C56] text-[#148C56] font-semibold rounded-lg hover:bg-[#148C56] hover:text-white transition-all duration-300">
            View All
          </button>
        </div>

        {isLoadingPlaces ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#148C56]"></div>
              <p className="mt-4 text-gray-600">Loading places...</p>
            </div>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No places available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {places.map((place) => (
              <div
                key={place.id}
                className="group bg-card border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
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
                      <span className="text-sm font-medium">
                        {place.location}
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-[#07401F] line-clamp-2 group-hover:text-[#148C56] transition-colors">
                    {place.name}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {place.description}
                  </p>

                  <button className="w-full bg-background border-2 border-[#357D52] text-[#357D52] font-semibold py-3 rounded-lg hover:bg-[#357D52] hover:text-white transition-all duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Testimonials */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#07401F] mb-4">
            What CloudRush Users Are Saying
          </h2>
          <p className="text-gray-600 text-lg">
            Real experiences from our travelers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card border-border rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
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
