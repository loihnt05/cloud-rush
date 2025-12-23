import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2, Plane, User, CreditCard } from "lucide-react";
import { getBooking, getPassengersByBooking, getBookingFlightId } from "@/api/booking";
import { getFlight } from "@/api/flight";
import { getAirportById } from "@/api/airport";
import { getPaymentByBooking } from "@/api/payment";
import { getFlightSeatDetails } from "@/api/seat";
import useUserRoles from "@/hooks/useUserRoles";
import type { Booking, Passenger } from "@/types/booking";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import type { Payment } from "@/types/payment";

interface BookingSearchResult {
  booking: Booking;
  passengers: Passenger[];
  flight: Flight | null;
  originAirport: Airport | null;
  destinationAirport: Airport | null;
  payment: Payment | null;
}

export default function SearchBooking() {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { isAgentOrAdmin } = useUserRoles();
  
  const [bookingId, setBookingId] = useState("");
  const [searchResults, setSearchResults] = useState<BookingSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!bookingId.trim()) {
      setError("Please enter a booking ID");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      // Extract numeric ID from booking reference (BK-123 -> 123)
      const numericId = bookingId.replace(/[^0-9]/g, "");
      const id = parseInt(numericId, 10);

      if (isNaN(id) || id <= 0) {
        throw new Error("Invalid booking ID format");
      }

      // Check if booking has flight (isBookingFlight check)
      await getBookingFlightId(id);

      // Fetch booking details
      const booking = await getBooking(id);
      const passengers = await getPassengersByBooking(id);

      let flight: Flight | null = null;
      let originAirport: Airport | null = null;
      let destinationAirport: Airport | null = null;
      let payment: Payment | null = null;

      // Get flight information from passengers
      if (passengers.length > 0 && passengers[0].flight_seat_id) {
        try {
          const seat = await getFlightSeatDetails(passengers[0].flight_seat_id);
          
          if (seat.flight_id) {
            flight = await getFlight(seat.flight_id);
            
            if (flight) {
              originAirport = await getAirportById(flight.departure_airport_id);
              destinationAirport = await getAirportById(flight.arrival_airport_id);
            }
          }
        } catch (err) {
          console.error("Error fetching flight details:", err);
        }
      }

      // Get payment details
      try {
        payment = await getPaymentByBooking(id);
      } catch (err) {
        console.log("No payment found for booking");
      }

      setSearchResults({
        booking,
        passengers,
        flight,
        originAirport,
        destinationAirport,
        payment,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to search booking");
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAgentOrAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Access denied. This page is only accessible to agents and administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Booking</h1>
        <p className="text-muted-foreground mt-2">
          Search for flight bookings by booking ID or reference number
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Search</CardTitle>
          <CardDescription>
            Enter a booking ID (e.g., BK-123 or 123) to retrieve booking details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="booking-id">Booking ID</Label>
              <Input
                id="booking-id"
                type="text"
                placeholder="Enter Booking ID (e.g., BK-123)"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={loading || !bookingId.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {searchResults && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Booking Summary</h2>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Reference</p>
                  <p className="font-medium">{searchResults.booking.booking_reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{searchResults.booking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-medium">${searchResults.booking.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-medium">
                    {searchResults.booking.booking_date 
                      ? new Date(searchResults.booking.booking_date).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              {searchResults.booking.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{searchResults.booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flight Information */}
          {searchResults.flight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flight Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Flight Number</p>
                    <p className="font-medium">{searchResults.flight.flight_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{searchResults.flight.status}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Departure</p>
                    <p className="font-semibold text-lg">
                      {searchResults.originAirport?.airport_code}
                    </p>
                    <p className="text-sm">{searchResults.originAirport?.airport_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {searchResults.originAirport?.city}, {searchResults.originAirport?.country}
                    </p>
                    <p className="text-sm mt-1">
                      {new Date(searchResults.flight.departure_time).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arrival</p>
                    <p className="font-semibold text-lg">
                      {searchResults.destinationAirport?.airport_code}
                    </p>
                    <p className="text-sm">{searchResults.destinationAirport?.airport_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {searchResults.destinationAirport?.city}, {searchResults.destinationAirport?.country}
                    </p>
                    <p className="text-sm mt-1">
                      {new Date(searchResults.flight.arrival_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Passenger Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Passenger Information ({searchResults.passengers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.passengers.map((passenger, index) => (
                  <div key={passenger.passenger_id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">
                          {passenger.first_name} {passenger.middle_name} {passenger.last_name} {passenger.suffix}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Passenger Type</p>
                        <p className="font-medium capitalize">{passenger.passenger_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{passenger.date_of_birth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{passenger.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{passenger.phone_number || "N/A"}</p>
                      </div>
                      {passenger.special_requests && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Special Requests</p>
                          <p className="font-medium">{passenger.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {searchResults.payment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <p className="font-medium capitalize">{searchResults.payment.payment_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">${searchResults.payment.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">
                      {searchResults.payment.payment_method.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Date</p>
                    <p className="font-medium">
                      {searchResults.payment.payment_date
                        ? new Date(searchResults.payment.payment_date).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
