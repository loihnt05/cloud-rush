import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaHotel, FaCar, FaBoxOpen, FaCheckCircle, FaClock, FaCreditCard } from "react-icons/fa";
import { MdCardTravel } from "react-icons/md";
import { getUserBookings } from "@/api/booking";
import { bookingServiceApi } from "@/api/booking-service";
import { serviceApi } from "@/api/service";
import { getPaymentByBooking } from "@/api/payment";
import type { Booking } from "@/types/booking";
import type { BookingService } from "@/api/booking-service";
import type { Service } from "@/api/service";
import type { Payment } from "@/types/payment";
import useSettingStore from "@/stores/setting-store";
import { Button } from "@/components/ui/button";

interface ServiceBookingDetails {
  booking: Booking;
  bookingService: BookingService;
  service: Service;
  payment: Payment | null;
}

export default function MyServiceBookings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();

  const [serviceBookings, setServiceBookings] = useState<ServiceBookingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServiceBookings = async () => {
      console.log("=== My Service Bookings Page Debug ===");
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
        setError("Please log in to view your service bookings");
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
          setServiceBookings([]);
          setLoading(false);
          return;
        }

        // Load service booking details
        const serviceBookingDetails: ServiceBookingDetails[] = [];

        for (const booking of userBookings) {
          try {
            // Get booking services for this booking
            const bookingServices = await bookingServiceApi.getBookingServices(booking.booking_id);
            
            if (bookingServices.length === 0) {
              // This is a flight booking, skip it
              continue;
            }

            // For each booking service, get the service details
            for (const bookingService of bookingServices) {
              try {
                const service = await serviceApi.getServiceById(bookingService.service_id);
                
                // Get payment info
                let payment: Payment | null = null;
                try {
                  payment = await getPaymentByBooking(booking.booking_id);
                } catch {
                  console.log("No payment found for booking:", booking.booking_id);
                }

                serviceBookingDetails.push({
                  booking,
                  bookingService,
                  service,
                  payment,
                });
              } catch (serviceErr) {
                console.error("Error loading service details:", serviceErr);
              }
            }
          } catch {
            // No booking services found, this is probably a flight booking
            console.log("No booking services for booking:", booking.booking_id);
          }
        }

        console.log("Service booking details:", serviceBookingDetails);
        setServiceBookings(serviceBookingDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error loading service bookings:", err);
        setError(err instanceof Error ? err.message : "Failed to load service bookings");
        setLoading(false);
      }
    };

    loadServiceBookings();
  }, [user, authLoading, isAuthenticated, accessToken]);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <FaHotel className="text-primary text-xl" />;
      case "package":
        return <MdCardTravel className="text-primary text-xl" />;
      case "rental_car":
        return <FaCar className="text-primary text-xl" />;
      default:
        return <FaBoxOpen className="text-primary text-xl" />;
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case "hotel":
        return "Hotel";
      case "package":
        return "Package";
      case "rental_car":
        return "Car Rental";
      default:
        return "Service";
    }
  };

  const isPending = (serviceBooking: ServiceBookingDetails) => {
    return (
      serviceBooking.booking.status !== "confirmed" ||
      !serviceBooking.payment ||
      serviceBooking.payment.status !== "success"
    );
  };

  const isConfirmed = (serviceBooking: ServiceBookingDetails) => {
    return (
      serviceBooking.booking.status === "confirmed" &&
      serviceBooking.payment?.status === "success"
    );
  };

  const handleCompletePayment = (serviceBooking: ServiceBookingDetails) => {
    navigate(`/payment?bookingId=${serviceBooking.booking.booking_id}&serviceType=${serviceBooking.service.type}&serviceId=${serviceBooking.bookingService.service_id}`);
  };

  const pendingBookings = serviceBookings.filter(isPending);
  const confirmedBookings = serviceBookings.filter(isConfirmed);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-foreground">Loading your service bookings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isAuthError = error.includes("not authorized") || error.includes("log in");
    return (
      <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FaClock className="text-destructive text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          {isAuthError && (
            <Button onClick={() => navigate("/home")}>Go to Home</Button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (serviceBookings.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-6">
            <h1 className="text-3xl font-bold text-foreground">My Service Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your hotel, package, and car rental bookings
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-12 shadow-lg text-center">
            <FaBoxOpen className="text-muted-foreground text-6xl mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Service Bookings Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't made any hotel, package, or car rental bookings yet.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate("/hotels")}>Browse Hotels</Button>
              <Button onClick={() => navigate("/packages")} variant="outline">
                View Packages
              </Button>
              <Button onClick={() => navigate("/car-rentals")} variant="outline">
                Rent a Car
              </Button>
            </div>
          </div>
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Service Bookings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {serviceBookings.length} total booking{serviceBookings.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/my-bookings")} variant="outline">
                View Flight Bookings
              </Button>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-yellow-600 text-xl" />
              <h2 className="text-2xl font-bold text-foreground">
                Pending Payment ({pendingBookings.length})
              </h2>
            </div>
            <div className="space-y-4">
              {pendingBookings.map((serviceBooking) => (
                <div
                  key={`${serviceBooking.booking.booking_id}-${serviceBooking.bookingService.booking_service_id}`}
                  className="bg-card border-2 border-yellow-200 dark:border-yellow-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          {getServiceIcon(serviceBooking.service.type)}
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {serviceBooking.service.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getServiceTypeLabel(serviceBooking.service.type)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Booking Reference</p>
                            <p className="font-semibold text-primary">
                              {serviceBooking.booking.booking_reference}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Booking Date</p>
                            <p className="font-semibold text-foreground">
                              {new Date(serviceBooking.booking.booking_date || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                        <p className="text-3xl font-bold text-primary">
                          ${typeof serviceBooking.service.price === 'string' 
                            ? parseFloat(serviceBooking.service.price).toFixed(2)
                            : serviceBooking.service.price.toFixed(2)}
                        </p>
                        <div className="mt-4">
                          <Button
                            onClick={() => handleCompletePayment(serviceBooking)}
                            className="flex items-center gap-2"
                          >
                            <FaCreditCard />
                            Complete Payment
                          </Button>
                        </div>
                      </div>
                    </div>

                    {serviceBooking.booking.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Notes:</span> {serviceBooking.booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Bookings */}
        {confirmedBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaCheckCircle className="text-green-600 text-xl" />
              <h2 className="text-2xl font-bold text-foreground">
                Confirmed Bookings ({confirmedBookings.length})
              </h2>
            </div>
            <div className="space-y-4">
              {confirmedBookings.map((serviceBooking) => (
                <div
                  key={`${serviceBooking.booking.booking_id}-${serviceBooking.bookingService.booking_service_id}`}
                  className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          {getServiceIcon(serviceBooking.service.type)}
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {serviceBooking.service.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getServiceTypeLabel(serviceBooking.service.type)}
                            </p>
                          </div>
                          <div className="ml-auto">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium">
                              <FaCheckCircle />
                              Confirmed
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Booking Reference</p>
                            <p className="font-semibold text-primary">
                              {serviceBooking.booking.booking_reference}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Booking Date</p>
                            <p className="font-semibold text-foreground">
                              {new Date(serviceBooking.booking.booking_date || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                        <p className="text-3xl font-bold text-green-600">
                          ${typeof serviceBooking.service.price === 'string' 
                            ? parseFloat(serviceBooking.service.price).toFixed(2)
                            : serviceBooking.service.price.toFixed(2)}
                        </p>
                        {serviceBooking.payment && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Paid via {serviceBooking.payment.method === 'credit_card' ? 'Credit Card' : serviceBooking.payment.method}
                          </p>
                        )}
                      </div>
                    </div>

                    {serviceBooking.booking.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Notes:</span> {serviceBooking.booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
