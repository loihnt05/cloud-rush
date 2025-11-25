import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  FaPlane,
  FaTicketAlt,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaChair,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaDownload,
  FaPrint,
  FaBarcode,
} from "react-icons/fa";
import { getBooking, getPassengersByBooking } from "@/api/booking";
import { getPaymentByBooking } from "@/api/payment";
import { getFlight } from "@/api/flight";
import { getAirportById } from "@/api/airport";
import { getFlightSeatDetails, getSeatDetails } from "@/api/seat";
import type { Booking, Passenger } from "@/types/booking";
import type { Payment } from "@/types/payment";
import type { Flight } from "@/types/flight";
import type { Airport } from "@/types/airport";
import { Button } from "@/components/ui/button";
import useSettingStore from "@/stores/setting-store";

interface PassengerWithSeat extends Passenger {
  seatNumber?: string;
  seatClass?: string;
}

export default function ETicket() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const { accessToken } = useSettingStore();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [passengers, setPassengers] = useState<PassengerWithSeat[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadTicketDetails = async () => {
      if (authLoading) return;

      if (!bookingId) {
        setError("Booking ID is required");
        setLoading(false);
        return;
      }

      if (!isAuthenticated || !user?.sub) {
        setError("Please log in to view your e-ticket");
        setLoading(false);
        return;
      }

      if (!accessToken) {
        return;
      }

      try {
        setLoading(true);

        // Fetch booking
        const bookingData = await getBooking(parseInt(bookingId));

        // Authorization check
        if (bookingData.user_id !== user.sub) {
          setError("You are not authorized to view this e-ticket");
          setLoading(false);
          return;
        }

        // Check if booking is confirmed
        if (bookingData.status !== "confirmed") {
          setError("E-ticket is only available for confirmed bookings");
          setLoading(false);
          return;
        }

        setBooking(bookingData);

        // Fetch passengers
        const passengersData = await getPassengersByBooking(parseInt(bookingId));

        // Get flight info
        if (passengersData.length > 0 && passengersData[0].flight_seat_id) {
          const flightSeat = await getFlightSeatDetails(passengersData[0].flight_seat_id);
          const flightData = await getFlight(flightSeat.flight_id);
          setFlight(flightData);

          const origin = await getAirportById(flightData.origin_airport_id);
          const destination = await getAirportById(flightData.destination_airport_id);
          setOriginAirport(origin);
          setDestinationAirport(destination);
        }

        // Load seat information for passengers
        const passengersWithSeats = await Promise.all(
          passengersData.map(async (passenger) => {
            if (passenger.flight_seat_id) {
              try {
                const flightSeat = await getFlightSeatDetails(passenger.flight_seat_id);
                const seat = await getSeatDetails(flightSeat.seat_id);
                return {
                  ...passenger,
                  seatNumber: seat.seat_number,
                  seatClass: seat.seat_class,
                };
              } catch {
                return passenger;
              }
            }
            return passenger;
          })
        );

        setPassengers(passengersWithSeats);

        // Fetch payment
        try {
          const paymentData = await getPaymentByBooking(parseInt(bookingId));
          setPayment(paymentData);
        } catch {
          console.log("No payment found for booking:", bookingId);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading e-ticket details:", err);
        setError(err instanceof Error ? err.message : "Failed to load e-ticket");
        setLoading(false);
      }
    };

    loadTicketDetails();
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

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleExportPDF = async () => {
    if (!ticketRef.current) {
      alert("E-ticket element not found. Please refresh the page.");
      return;
    }

    setIsExporting(true);
    try {
      // Capture the ticket element as canvas using html2canvas-pro
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to generate canvas from e-ticket");
      }

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Limit height to prevent overflow
      const maxHeight = 297; // A4 height in mm
      const finalHeight = Math.min(imgHeight, maxHeight);

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      
      if (!imgData || imgData === "data:,") {
        throw new Error("Failed to convert canvas to image");
      }

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, finalHeight);

      // Save PDF
      const filename = `e-ticket-${booking?.booking_reference || 'unknown'}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error("Error exporting PDF:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to export e-ticket: ${errorMessage}\n\nPlease try using the "Save as Image" button instead, or use the Print button.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!ticketRef.current) {
      alert("E-ticket element not found. Please refresh the page.");
      return;
    }

    setIsExporting(true);
    try {
      // Capture using html2canvas-pro which supports modern CSS
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to generate canvas");
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create image");
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `e-ticket-${booking?.booking_reference || 'unknown'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error("Error downloading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to download image: ${errorMessage}\n\nPlease try the Print option instead.`);
      setIsExporting(false);
    }
  };

  // Generate QR code data - contains booking reference and verification URL
  const qrCodeData = booking
    ? JSON.stringify({
        bookingRef: booking.booking_reference,
        bookingId: booking.booking_id,
        status: booking.status,
        verifyUrl: `${window.location.origin}/verify-ticket/${booking.booking_reference}`,
      })
    : "";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading e-ticket...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <FaTicketAlt className="text-destructive text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Cannot Display E-Ticket</h2>
          <p className="text-muted-foreground mb-4">{error || "E-ticket not found"}</p>
          <Button onClick={() => navigate("/my-bookings")}>Back to My Bookings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#07401F]/5 via-[#224A33]/5 to-[#357D52]/5 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons - Hide on print */}
        <div className="mb-6 flex items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => navigate("/my-bookings")} className="flex items-center gap-2">
            <FaArrowLeft />
            Back to Bookings
          </Button>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <FaPrint />
              Print
            </Button>
            <Button
              onClick={handleDownloadImage}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaDownload />
              {isExporting ? "Saving..." : "Save as Image"}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FaDownload />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </div>

        {/* E-Ticket */}
        <div ref={ticketRef} id="e-ticket-content" className="bg-background rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div 
            className="bg-linear-to-r from-[#07401F] via-[#224A33] to-[#357D52] text-white p-8"
            style={{
              background: 'linear-gradient(to right, #07401F, #224A33, #357D52)',
              color: 'white'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Electronic Ticket</h1>
                <p className="text-white/80">Booking Reference: {booking.booking_reference}</p>
              </div>
              <div className="text-right">
                <FaTicketAlt className="text-6xl opacity-20" />
              </div>
            </div>
          </div>

          {/* Flight Information */}
          {flight && originAirport && destinationAirport && (
            <div className="p-8 border-b-2 border-dashed border-gray-300">
              <div className="flex items-center gap-2 mb-6">
                <FaPlane className="text-primary text-xl" />
                <h2 className="text-2xl font-bold text-gray-800">Flight Details</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Departure */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <FaMapMarkerAlt />
                    <span className="text-sm font-medium">Departure</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{originAirport.iata_code}</div>
                  <div className="text-sm text-gray-600 mb-3">{originAirport.name}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="font-medium">{formatDateShort(flight.departure_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaClock className="text-gray-500" />
                      <span className="font-bold text-lg">{formatTime(flight.departure_time)}</span>
                    </div>
                  </div>
                </div>

                {/* Flight Info */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-600 mb-2">Flight Number</div>
                  <div className="text-2xl font-bold text-primary mb-3">{flight.flight_number}</div>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <FaPlane className="text-primary transform rotate-90" />
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-600 mb-2 justify-end">
                    <FaMapMarkerAlt />
                    <span className="text-sm font-medium">Arrival</span>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{destinationAirport.iata_code}</div>
                  <div className="text-sm text-gray-600 mb-3">{destinationAirport.name}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm justify-end">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="font-medium">{formatDateShort(flight.arrival_time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm justify-end">
                      <FaClock className="text-gray-500" />
                      <span className="font-bold text-lg">{formatTime(flight.arrival_time)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passenger Information */}
          <div className="p-8 border-b-2 border-dashed border-gray-300">
            <div className="flex items-center gap-2 mb-6">
              <FaUser className="text-primary text-xl" />
              <h2 className="text-2xl font-bold text-gray-800">Passenger Information</h2>
            </div>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={passenger.passenger_id} className="bg-muted rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Passenger {index + 1}</div>
                      <div className="text-lg font-bold text-gray-900">
                        {passenger.first_name} {passenger.middle_name && `${passenger.middle_name} `}
                        {passenger.last_name}
                        {passenger.suffix && ` ${passenger.suffix}`}
                      </div>
                      <div className="text-sm text-gray-600 capitalize mt-1">
                        {passenger.passenger_type}
                      </div>
                    </div>
                    <div className="md:text-right">
                      {passenger.seatNumber && (
                        <div className="flex items-center gap-2 justify-start md:justify-end">
                          <FaChair className="text-primary" />
                          <div>
                            <div className="text-xs text-gray-600">Seat</div>
                            <div className="text-lg font-bold text-gray-900">
                              {passenger.seatNumber}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">
                              {passenger.seatClass}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-8 bg-muted/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <FaBarcode className="text-primary text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Boarding Pass</h2>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Please present this QR code at check-in and boarding gate.
                </p>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Booking Date:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {formatDate(booking.booking_date || "")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span className="font-medium text-green-600 uppercase">{booking.status}</span>
                  </div>
                  {payment && (
                    <div>
                      <span className="text-gray-600">Payment:</span>{" "}
                      <span className="font-medium text-green-600 uppercase">{payment.status}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-background p-4 rounded-lg shadow-md">
                  <QRCodeSVG value={qrCodeData} size={200} level="H" includeMargin={true} />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Scan to verify booking</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-muted text-center">
            <p className="text-xs text-gray-600">
              This is an electronic ticket. Please arrive at the airport at least 2 hours before
              departure for international flights and 1 hour for domestic flights.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              For assistance, please contact customer service or visit our website.
            </p>
          </div>
        </div>

        {/* Notes - Hide on print */}
        <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-4 print:hidden">
          <h3 className="font-semibold text-blue-900 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please check in online or at the airport counter before your flight</li>
            <li>• Valid photo ID is required for boarding</li>
            <li>• Arrive at the gate at least 30 minutes before departure</li>
            <li>• Keep this e-ticket accessible on your device or print a copy</li>
          </ul>
        </div>

        {/* Export Help - Hide on print */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 print:hidden">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <FaDownload />
            Export Options:
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• <strong>Export PDF:</strong> Best for email or digital storage (may have compatibility issues on some devices)</li>
            <li>• <strong>Save as Image:</strong> Most reliable option, works on all devices</li>
            <li>• <strong>Print:</strong> For physical copy or "Save as PDF" from print dialog</li>
          </ul>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
