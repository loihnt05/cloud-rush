import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getFlight } from "@/api/flight";
import { getAirportById } from "@/api/airport";
import { getFlightSeatsWithDetails } from "@/api/seat";
import { createBooking, createPassenger, createEmergencyContact } from "@/api/booking";
import type { PassengerCreate, EmergencyContactCreate, PassengerType } from "@/types/booking";
import type { SeatWithStatus } from "@/types/seat";
import { useAuth0 } from "@auth0/auth0-react";
import PassengerForm from "@/components/passenger/passenger-form";
import EmergencyContactForm from "@/components/passenger/emergency-contact-form";
import FlightSummaryCard from "@/components/passenger/flight-summary-card";

interface PassengerFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  passengerType: PassengerType;
  flightSeatId?: number;
}

export default function PassengerInformation() {
  const [searchParams] = useSearchParams();
  const flightId = searchParams.get("flightId");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");
  const infantsParam = searchParams.get("infants");
  const flightSeatIdsParam = searchParams.get("flightSeatIds");
  const navigate = useNavigate();
  const { user } = useAuth0(); // Will be used for booking creation with user_id

  // Parse passenger counts from URL
  const adultsCount = adultsParam ? parseInt(adultsParam, 10) : 1;
  const childrenCount = childrenParam ? parseInt(childrenParam, 10) : 0;
  const infantsCount = infantsParam ? parseInt(infantsParam, 10) : 0;
  const totalPassengers = adultsCount + childrenCount + infantsCount;

  // Number of passengers
  const [passengerCount, setPassengerCount] = useState(totalPassengers);

  // Form state for multiple passengers
  const [passengerForms, setPassengerForms] = useState<PassengerFormData[]>([]);
  
  // Selected seats information
  const [selectedSeats, setSelectedSeats] = useState<SeatWithStatus[]>([]);

  // Initialize passenger forms based on URL parameters
  useEffect(() => {
    // Parse flight seat IDs inside useEffect
    const flightSeatIds = flightSeatIdsParam ? flightSeatIdsParam.split(',').map(Number) : [];
    
    const initialForms: PassengerFormData[] = [];
    let seatIndex = 0;
    
    // Add adult forms
    for (let i = 0; i < adultsCount; i++) {
      initialForms.push({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        dateOfBirth: "",
        email: "",
        phoneNumber: "",
        passengerType: "adult",
        flightSeatId: flightSeatIds[seatIndex] || undefined,
      });
      seatIndex++;
    }
    
    // Add children forms
    for (let i = 0; i < childrenCount; i++) {
      initialForms.push({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        dateOfBirth: "",
        email: "",
        phoneNumber: "",
        passengerType: "child",
        flightSeatId: flightSeatIds[seatIndex] || undefined,
      });
      seatIndex++;
    }
    
    // Add infant forms
    for (let i = 0; i < infantsCount; i++) {
      initialForms.push({
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        dateOfBirth: "",
        email: "",
        phoneNumber: "",
        passengerType: "infant",
        flightSeatId: flightSeatIds[seatIndex] || undefined,
      });
      seatIndex++;
    }
    
    setPassengerForms(initialForms);
    setPassengerCount(initialForms.length);
  }, [adultsCount, childrenCount, infantsCount, flightSeatIdsParam]);

  // Form state for emergency contact (only one for all passengers)
  const [emergencyForm, setEmergencyForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  // Helper function to update a specific passenger's form
  const updatePassengerForm = (index: number, field: string, value: string) => {
    const updatedForms = [...passengerForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };
    setPassengerForms(updatedForms);
  };

  // Fetch flight data based on flightId
  const { data: flight, isLoading: isFlightLoading, error: flightError } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: async () => {
      const result = await getFlight(Number(flightId));
      return result;
    },
    enabled: !!flightId,
  });

  // Fetch origin airport data
  const { data: originAirport } = useQuery({
    queryKey: ["airport", flight?.origin_airport_id],
    queryFn: () => getAirportById(flight!.origin_airport_id),
    enabled: !!flight?.origin_airport_id,
  });

  // Fetch destination airport data
  const { data: destinationAirport } = useQuery({
    queryKey: ["airport", flight?.destination_airport_id],
    queryFn: () => getAirportById(flight!.destination_airport_id),
    enabled: !!flight?.destination_airport_id,
  });

  // Fetch seat details
  const { data: seatsData } = useQuery({
    queryKey: ["seats", flightId, flightSeatIdsParam],
    queryFn: async () => {
      if (!flight) return [];
      const allSeats = await getFlightSeatsWithDetails(Number(flightId), flight);
      const flightSeatIds = flightSeatIdsParam ? flightSeatIdsParam.split(',').map(Number) : [];
      // Filter to only selected seats
      const selected = allSeats.filter(seat => flightSeatIds.includes(seat.flight_seat_id));
      setSelectedSeats(selected);
      return selected;
    },
    enabled: !!flight && !!flightId && !!flightSeatIdsParam,
  });

  // Mutation to create booking
  const createBookingMutation = useMutation({
    mutationFn: async (userId: string) => {
      const bookingData = {
        user_id: userId,
        status: "pending",
        notes: `Flight ${flightId}`
      };
      return createBooking(bookingData);
    },
    onSuccess: async (booking) => {
      // Create all passengers sequentially
      try {
        const passengerIds: number[] = [];
        
        for (let i = 0; i < passengerForms.length; i++) {
          const passenger = passengerForms[i];
          const passengerData: PassengerCreate = {
            booking_id: booking.booking_id,
            passenger_type: passenger.passengerType,
            first_name: passenger.firstName,
            middle_name: passenger.middleName || undefined,
            last_name: passenger.lastName,
            suffix: passenger.suffix || undefined,
            date_of_birth: passenger.dateOfBirth,
            email: passenger.email,
            phone_number: passenger.phoneNumber,
            flight_seat_id: passenger.flightSeatId,
          };
          
          const createdPassenger = await createPassenger(passengerData);
          passengerIds.push(createdPassenger.passenger_id);
        }
        
        // Create emergency contact for the first passenger
        if (passengerIds.length > 0) {
          const emergencyContact: EmergencyContactCreate = {
            passenger_id: passengerIds[0],
            first_name: emergencyForm.firstName,
            last_name: emergencyForm.lastName,
            email: emergencyForm.email || undefined,
            phone_number: emergencyForm.phoneNumber,
          };
          
          await createEmergencyContact(emergencyContact);
        }
        
        // Navigate to payment page with booking ID
        navigate(`/payment?bookingId=${booking.booking_id}&flightId=${flightId}`);
      } catch (error) {
        console.error("Error creating passengers or emergency contact:", error);
        alert("Failed to create passenger information. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all passenger forms
    for (let i = 0; i < passengerForms.length; i++) {
      const passenger = passengerForms[i];
      if (!passenger.firstName || !passenger.lastName || !passenger.dateOfBirth || 
          !passenger.email || !passenger.phoneNumber) {
        alert(`Please fill in all required fields for Passenger ${i + 1}`);
        return;
      }
    }

    // Validate emergency contact
    if (!emergencyForm.firstName || !emergencyForm.lastName || !emergencyForm.phoneNumber || 
        !emergencyForm.email) {
      alert("Please fill in all required emergency contact fields");
      return;
    }

    if (!user?.sub) {
      alert("User not authenticated. Please log in.");
      return;
    }

    // Create booking first, then passengers, then emergency contact
    createBookingMutation.mutate(user.sub);
  };

  if (!flightId) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl text-red-500">No Flight ID provided</div>
        <div className="text-sm text-muted-foreground">
          Please select a flight from the flights page
        </div>
        <button
          onClick={() => navigate("/flights/search")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent"
        >
          Go to Flights
        </button>
      </div>
    );
  }

  if (isFlightLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl">Loading flight information...</div>
        <div className="text-sm text-muted-foreground">Flight ID: {flightId}</div>
      </div>
    );
  }

  if (flightError) {
    console.error("Flight error:", flightError);
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl text-red-500">Error loading flight information</div>
        <div className="text-sm text-muted-foreground">
          {flightError instanceof Error ? flightError.message : "Unknown error"}
        </div>
        <div className="text-sm text-muted-foreground">Flight ID: {flightId}</div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-xl">No flight data found</div>
        <div className="text-sm text-muted-foreground">Flight ID: {flightId}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5">
      {/* Left side - Form (w-3/5) */}
      <div className="w-full lg:w-3/5 space-y-6">
        {/* Passenger Information Sections - Loop through all passengers */}
        {passengerForms.map((passenger, index) => (
          <PassengerForm
            key={index}
            index={index}
            passenger={passenger}
            onUpdate={updatePassengerForm}
          />
        ))}

        {/* Emergency Contact Section */}
        <EmergencyContactForm
          emergencyContact={emergencyForm}
          onChange={(field, value) => setEmergencyForm({ ...emergencyForm, [field]: value })}
        />
      </div>

      {/* Right side - Flight Information (w-2/5) */}
      <div className="w-full lg:w-2/5">
        <FlightSummaryCard
          flight={flight}
          originAirport={originAirport}
          destinationAirport={destinationAirport}
          passengerCount={passengerCount}
          selectedSeats={selectedSeats}
          isProcessing={createBookingMutation.isPending}
          onContinue={handleSubmit}
        />
      </div>
    </form>
  );
}
