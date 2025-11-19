import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaPlane, FaTicketAlt, FaCheckCircle, FaClock } from "react-icons/fa";
import { getUserBookings, getPassengersByBooking } from "@/api/booking";
import { getPaymentByBooking } from "@/api/payment";
import { getFlight } from "@/api/flight";
import { getAirportById } from "@/api/airport";
import { getFlightSeatDetails } from "@/api/seat";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import useSettingStore from "@/stores/setting-store";
import BookingCard from "@/components/my-bookings/booking-card";
import { Button } from "@/components/ui/button";

interface BookingWithDetails {
  booking: Booking;
  flight: Flight;
  passengers: Passenger[];
  payment: Payment | null;
  originAirport: Airport;
  destinationAirport: Airport;
}

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "confirmed" | "pending">("all");

  const loadBookings = async () => {
    console.log("=== My Bookings Page Debug ===");
    console.log("authLoading:", authLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("accessToken:", accessToken ? "Present" : "Missing");

    if (authLoading) {
      console.log("Waiting for authentication...");
      return;
    }

    if (!isAuthenticated || !user?.sub) {
      console.error("User not authenticated");
      setError("Please log in to view your bookings");
      setLoading(false);
      return;
    }

    if (!accessToken) {
      console.error("Access token not available yet, waiting...");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching bookings for user:", user.sub);

      const userBookings = await getUserBookings(user.sub);
      console.log("User bookings:", userBookings);

      if (userBookings.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // Load details for each booking
      const bookingsWithDetails = await Promise.all(
        userBookings.map(async (booking) => {
          try {
            // Get passengers
            const passengers = await getPassengersByBooking(booking.booking_id);
            
            // Find the flight from the first passenger's flight seat
            let flight: Flight | null = null;
            let originAirport: Airport | null = null;
            let destinationAirport: Airport | null = null;

            if (passengers.length > 0 && passengers[0].flight_seat_id) {
              try {
                // Get flight seat details to get the flight ID
                const flightSeat = await getFlightSeatDetails(passengers[0].flight_seat_id);
                const flightId = flightSeat.flight_id;
                
                flight = await getFlight(flightId);
                
                if (flight) {
                  originAirport = await getAirportById(flight.origin_airport_id);
                  destinationAirport = await getAirportById(flight.destination_airport_id);
                }
              } catch (err) {
                console.error("Failed to load flight for booking:", booking.booking_id, err);
              }
            }

            // Get payment info
            let payment: Payment | null = null;
            try {
              payment = await getPaymentByBooking(booking.booking_id);
            } catch {
              console.log("No payment found for booking:", booking.booking_id);
            }

            // Only return bookings that have valid flight data
            if (flight && originAirport && destinationAirport) {
              return {
                booking,
                flight,
                passengers,
                payment,
                originAirport,
                destinationAirport,
              };
            }
            return null;
          } catch (err) {
            console.error("Error loading details for booking:", booking.booking_id, err);
            return null;
          }
        })
      );

      // Filter out null entries
      const validBookings = bookingsWithDetails.filter(
        (b): b is BookingWithDetails => b !== null
      );

      console.log("Bookings with details:", validBookings);
      setBookings(validBookings);
      setLoading(false);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user, authLoading, isAuthenticated, accessToken]);

  const filteredBookings = bookings.filter((bookingDetail) => {
    if (filter === "all") return true;
    if (filter === "confirmed") {
      return bookingDetail.booking.status === "confirmed" && 
             bookingDetail.payment?.status === "success";
    }
    if (filter === "pending") {
      return bookingDetail.booking.status !== "confirmed" || 
             !bookingDetail.payment || 
             bookingDetail.payment.status !== "success";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-destructive text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          {error.includes("log in") && (
            <Button onClick={() => navigate("/home")}>Go to Home</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FaTicketAlt className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View and manage your flight bookings
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/flights/search")}
              className="flex items-center gap-2"
            >
              <FaPlane />
              Book New Flight
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter("confirmed")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === "confirmed"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <FaCheckCircle />
              Confirmed (
              {
                bookings.filter(
                  (b) =>
                    b.booking.status === "confirmed" &&
                    b.payment?.status === "success"
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                filter === "pending"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <FaClock />
              Pending (
              {
                bookings.filter(
                  (b) =>
                    b.booking.status !== "confirmed" ||
                    !b.payment ||
                    b.payment.status !== "success"
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 shadow-lg text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FaTicketAlt className="text-muted-foreground text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {filter === "all" && "No bookings yet"}
              {filter === "confirmed" && "No confirmed bookings"}
              {filter === "pending" && "No pending bookings"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {filter === "all" &&
                "Start your journey by booking your first flight!"}
              {filter === "confirmed" &&
                "You don't have any confirmed bookings yet."}
              {filter === "pending" &&
                "All your bookings are confirmed!"}
            </p>
            {filter === "all" && (
              <Button
                onClick={() => navigate("/flights/search")}
                className="flex items-center gap-2 mx-auto"
              >
                <FaPlane />
                Search Flights
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((bookingDetail) => (
              <BookingCard
                key={bookingDetail.booking.booking_id}
                bookingDetail={bookingDetail}
                onRefresh={loadBookings}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
