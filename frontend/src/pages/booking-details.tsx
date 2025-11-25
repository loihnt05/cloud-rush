import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  FaPlane,
  FaTicketAlt,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaChair,
  FaCreditCard,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { getBooking, getPassengersByBooking } from "@/api/booking";
import { getEmergencyContactsByPassenger } from "@/api/booking";
import { getPaymentByBooking } from "@/api/payment";
import { getFlight } from "@/api/flight";
import { getAirportById } from "@/api/airport";
import { getFlightSeatDetails, getSeatDetails } from "@/api/seat";
import type { Booking, Passenger, EmergencyContact } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import type { FlightSeat, Seat } from "@/types/seat";
import { Button } from "@/components/ui/button";
import useSettingStore from "@/stores/setting-store";

interface PassengerWithDetails extends Passenger {
  emergencyContacts: EmergencyContact[];
  seat?: Seat;
  flightSeat?: FlightSeat;
}

export default function BookingDetails() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [passengers, setPassengers] = useState<PassengerWithDetails[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async () => {

      if (authLoading) {
        return;
      }

      if (!bookingId) {
        setError("Booking ID is required");
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !user?.sub) {
        setError("Please log in to view booking details");
        setLoading(false);
        return;
      }

      if (!accessToken) {
        console.error("Access token not available yet, waiting...");
        return;
      }

      try {
        setLoading(true);

        // Fetch booking
        const bookingData = await getBooking(parseInt(bookingId));

        // Authorization check
        if (bookingData.user_id !== user.sub) {
          console.error("Authorization failed: Booking does not belong to user");
          setError("You are not authorized to view this booking");
          setLoading(false);
          return;
        }

        setBooking(bookingData);

        // Fetch passengers
        const passengersData = await getPassengersByBooking(parseInt(bookingId));

        // Get flight info from first passenger's seat
        if (passengersData.length > 0 && passengersData[0].flight_seat_id) {
          const flightSeat = await getFlightSeatDetails(passengersData[0].flight_seat_id);
          const flightData = await getFlight(flightSeat.flight_id);
          setFlight(flightData);

          const origin = await getAirportById(flightData.origin_airport_id);
          const destination = await getAirportById(flightData.destination_airport_id);
          setOriginAirport(origin);
          setDestinationAirport(destination);
        }

        // Load detailed passenger information
        const passengersWithDetails = await Promise.all(
          passengersData.map(async (passenger) => {
            // Get emergency contacts
            let emergencyContacts: EmergencyContact[] = [];
            try {
              emergencyContacts = await getEmergencyContactsByPassenger(
                passenger.passenger_id
              );
            } catch (err) {
              console.error(
                `Failed to load emergency contacts for passenger ${passenger.passenger_id}:`,
                err
              );
            }

            // Get seat details
            let seat: Seat | undefined;
            let flightSeat: FlightSeat | undefined;
            if (passenger.flight_seat_id) {
              try {
                flightSeat = await getFlightSeatDetails(passenger.flight_seat_id);
                seat = await getSeatDetails(flightSeat.seat_id);
              } catch (err) {
                console.error(
                  `Failed to load seat for passenger ${passenger.passenger_id}:`,
                  err
                );
              }
            }

            return {
              ...passenger,
              emergencyContacts,
              seat,
              flightSeat,
            };
          })
        );

        setPassengers(passengersWithDetails);

        // Fetch payment
        try {
          const paymentData = await getPaymentByBooking(parseInt(bookingId));
          setPayment(paymentData);
        } catch {
          console.log("No payment found for booking:", bookingId);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking details");
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [bookingId, user, authLoading, isAuthenticated, accessToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOfBirth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculatePriceBreakdown = (): {
    basePrice: number;
    baseFare: number;
    seatUpgrades: Array<{
      passengerName: string;
      seatNumber: string;
      seatClass: string;
      upgrade: number;
    }>;
    totalSeatUpgrades: number;
    subtotal: number;
    taxRate: number;
    taxes: number;
    total: number;
  } => {
    if (!flight) {
      return {
        basePrice: 0,
        baseFare: 0,
        seatUpgrades: [],
        totalSeatUpgrades: 0,
        subtotal: 0,
        taxRate: 0.15,
        taxes: 0,
        total: 0,
      };
    }

    const basePrice =
      typeof flight.base_price === "string"
        ? parseFloat(flight.base_price)
        : flight.base_price;

    const baseFare = basePrice * passengers.length;

    const seatUpgrades = passengers
      .map((passenger) => {
        if (!passenger.seat || !passenger.flightSeat) {
          return {
            passengerName: `${passenger.first_name} ${passenger.last_name}`,
            seatNumber: "No seat selected",
            seatClass: "economy",
            upgrade: 0,
          };
        }

        const priceMultiplier =
          typeof passenger.flightSeat.price_multiplier === "string"
            ? parseFloat(passenger.flightSeat.price_multiplier)
            : passenger.flightSeat.price_multiplier;

        const upgradePrice = basePrice * (priceMultiplier - 1);

        return {
          passengerName: `${passenger.first_name} ${passenger.last_name}`,
          seatNumber: passenger.seat.seat_number,
          seatClass: passenger.seat.seat_class,
          upgrade: Math.max(0, upgradePrice),
        };
      });

    const totalSeatUpgrades = seatUpgrades.reduce(
      (sum, item) => sum + item.upgrade,
      0
    );
    const subtotal = baseFare + totalSeatUpgrades;
    
    const taxRate =
      typeof flight.tax_rate === "string"
        ? parseFloat(flight.tax_rate)
        : (flight.tax_rate || 0.15); // Default to 15% if not set
    
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    return {
      basePrice,
      baseFare,
      seatUpgrades,
      totalSeatUpgrades,
      subtotal,
      taxRate,
      taxes,
      total,
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  const isConfirmed =
    booking?.status === "confirmed" && payment?.status === "success";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-destructive text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Booking not found"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/my-bookings")}>
              Back to My Bookings
            </Button>
            {error?.includes("log in") && (
              <Button variant="outline" onClick={() => navigate("/home")}>
                Go to Home
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/my-bookings")}
          className="mb-4 flex items-center gap-2"
        >
          <FaArrowLeft />
          Back to My Bookings
        </Button>

        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FaTicketAlt className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Booking Details
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Reference: <span className="font-bold text-primary">{booking.booking_reference}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConfirmed ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <FaCheckCircle className="text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Confirmed & Paid
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <FaClock className="text-yellow-500" />
                  <span className="font-medium text-yellow-700 dark:text-yellow-400">
                    Payment Pending
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flight Information */}
        {flight && originAirport && destinationAirport && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-6">
              <FaPlane className="text-primary text-xl" />
              <h2 className="text-2xl font-bold text-foreground">
                Flight Information
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Departure */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FaMapMarkerAlt />
                  <span className="text-sm font-medium">Departure</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {originAirport.iata_code}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {originAirport.name}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-muted-foreground" />
                      <span>{formatDate(flight.departure_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaClock className="text-muted-foreground" />
                      <span className="font-bold text-lg">
                        {formatTime(flight.departure_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-sm text-muted-foreground">Flight Number</div>
                <div className="text-xl font-bold text-primary">
                  {flight.flight_number}
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-px bg-border"></div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {calculateDuration(flight.departure_time, flight.arrival_time)}
                  </div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Status:{" "}
                  <span className="font-medium capitalize">{flight.status}</span>
                </div>
              </div>

              {/* Arrival */}
              <div className="space-y-3 text-right md:text-left">
                <div className="flex items-center gap-2 text-muted-foreground justify-end md:justify-start">
                  <FaMapMarkerAlt />
                  <span className="text-sm font-medium">Arrival</span>
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {destinationAirport.iata_code}
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {destinationAirport.name}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm justify-end md:justify-start">
                      <FaCalendarAlt className="text-muted-foreground" />
                      <span>{formatDate(flight.arrival_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm justify-end md:justify-start">
                      <FaClock className="text-muted-foreground" />
                      <span className="font-bold text-lg">
                        {formatTime(flight.arrival_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passengers */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-6">
            <FaUser className="text-primary text-xl" />
            <h2 className="text-2xl font-bold text-foreground">
              Passengers ({passengers.length})
            </h2>
          </div>

          <div className="space-y-4">
            {passengers.map((passenger, index) => (
              <div
                key={passenger.passenger_id}
                className="border border-border rounded-xl p-5 bg-muted/30"
              >
                {/* Passenger Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {passenger.first_name}{" "}
                        {passenger.middle_name && `${passenger.middle_name} `}
                        {passenger.last_name}
                        {passenger.suffix && ` ${passenger.suffix}`}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {passenger.passenger_type}
                      </p>
                    </div>
                  </div>
                  {passenger.seat && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <FaChair className="text-primary" />
                      <span className="font-bold text-primary">
                        Seat {passenger.seat.seat_number}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        ({passenger.seat.seat_class})
                      </span>
                    </div>
                  )}
                </div>

                {/* Passenger Details */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Date of Birth
                    </div>
                    <div className="font-medium">
                      {formatDateOfBirth(passenger.date_of_birth)}
                    </div>
                  </div>
                  {passenger.email && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <FaEnvelope className="text-xs" />
                        Email
                      </div>
                      <div className="font-medium">{passenger.email}</div>
                    </div>
                  )}
                  {passenger.phone_number && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <FaPhone className="text-xs" />
                        Phone
                      </div>
                      <div className="font-medium">{passenger.phone_number}</div>
                    </div>
                  )}
                  {passenger.known_traveler_number && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Known Traveler Number
                      </div>
                      <div className="font-medium">
                        {passenger.known_traveler_number}
                      </div>
                    </div>
                  )}
                  {passenger.redress_number && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Redress Number
                      </div>
                      <div className="font-medium">{passenger.redress_number}</div>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                {passenger.special_requests && (
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-1">
                      Special Requests
                    </div>
                    <div className="text-sm bg-background/50 rounded-lg p-3">
                      {passenger.special_requests}
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                {passenger.emergencyContacts.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="text-sm font-semibold text-foreground mb-3">
                      Emergency Contacts
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {passenger.emergencyContacts.map((contact) => (
                        <div
                          key={contact.contact_id}
                          className="bg-background/50 rounded-lg p-3"
                        >
                          <div className="font-medium text-foreground mb-1">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.relationship_type && (
                            <div className="text-xs text-muted-foreground capitalize mb-2">
                              {contact.relationship_type}
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <FaPhone className="text-muted-foreground" />
                              <span>{contact.phone_number}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-2 text-xs">
                                <FaEnvelope className="text-muted-foreground" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <FaCreditCard className="text-primary text-xl" />
            <h2 className="text-2xl font-bold text-foreground">
              Payment & Pricing Details
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Price Breakdown */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Price Breakdown
              </h3>

              {/* Base Fare */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Base Fare ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium">
                    ${priceBreakdown.baseFare.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ${priceBreakdown.basePrice.toFixed(2)} × {passengers.length}
                </div>
              </div>

              {/* Seat Upgrades */}
              {priceBreakdown.totalSeatUpgrades > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-foreground">
                      Seat Upgrades
                    </span>
                    <span className="font-medium">
                      ${priceBreakdown.totalSeatUpgrades.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {priceBreakdown.seatUpgrades.map((item, index) => (
                      item.upgrade > 0 && (
                        <div
                          key={index}
                          className="flex justify-between items-center text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FaChair className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {item.passengerName} - Seat {item.seatNumber}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">
                              {item.seatClass}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            +${item.upgrade.toFixed(2)}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    ${priceBreakdown.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Taxes */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Taxes & Fees ({((priceBreakdown.taxRate || 0.15) * 100).toFixed(0)}%)
                  </span>
                  <span className="font-medium">
                    ${priceBreakdown.taxes.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t-2 border-primary/20 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    ${priceBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status & Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Payment Information
              </h3>

              {/* Payment Status Card */}
              <div
                className={`rounded-lg p-4 border-2 ${
                  payment?.status === "success"
                    ? "bg-green-500/10 border-green-500/30"
                    : payment?.status === "failed"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {payment?.status === "success" ? (
                    <FaCheckCircle className="text-green-500 text-xl" />
                  ) : payment?.status === "failed" ? (
                    <FaExclamationCircle className="text-red-500 text-xl" />
                  ) : (
                    <FaClock className="text-yellow-500 text-xl" />
                  )}
                  <span
                    className={`font-bold text-lg capitalize ${
                      payment?.status === "success"
                        ? "text-green-700 dark:text-green-400"
                        : payment?.status === "failed"
                        ? "text-red-700 dark:text-red-400"
                        : "text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {payment?.status || "Pending"}
                  </span>
                </div>
                {payment?.status === "success" && (
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your payment has been successfully processed.
                  </p>
                )}
                {payment?.status === "pending" && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Payment is pending. Please complete the payment to confirm your booking.
                  </p>
                )}
                {payment?.status === "failed" && (
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Payment failed. Please try again or contact support.
                  </p>
                )}
              </div>

              {/* Payment Details */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Reference:</span>
                  <span className="font-bold text-primary">
                    {booking.booking_reference}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking Date:</span>
                  <span className="font-medium">
                    {booking.booking_date
                      ? formatDate(booking.booking_date)
                      : "N/A"}
                  </span>
                </div>
                {payment && (
                  <>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Payment Date:</span>
                        <span className="font-medium">
                          {payment.payment_date
                            ? formatDate(payment.payment_date)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Payment Method:</span>
                        <span className="font-medium capitalize flex items-center gap-2">
                          <FaCreditCard className="text-primary" />
                          {payment.method === "credit_card"
                            ? "Credit Card"
                            : payment.method}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <span className="font-mono text-xs">
                          {payment.payment_id}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Booking Notes */}
              {booking.notes && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm font-semibold text-foreground mb-2">
                    Booking Notes
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.notes}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!isConfirmed && (
                <Button
                  onClick={() =>
                    navigate(
                      `/payment?bookingId=${booking.booking_id}&flightId=${flight?.flight_id}`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 mt-4"
                  size="lg"
                >
                  <FaCreditCard />
                  Complete Payment - ${priceBreakdown.total.toFixed(2)}
                </Button>
              )}

              {/* View E-Ticket Button */}
              {isConfirmed && (
                <Button
                  onClick={() => navigate(`/e-ticket/${booking.booking_id}`)}
                  className="w-full flex items-center justify-center gap-2 mt-4"
                  size="lg"
                >
                  <FaTicketAlt />
                  View E-Ticket
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
