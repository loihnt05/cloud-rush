/**
 * Example: How to Navigate to Payment Page
 * 
 * This file demonstrates different ways to navigate to the payment page
 * with the required bookingId and flightId parameters.
 */

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NavigateToPaymentExample() {
    const navigate = useNavigate();

    // Example 1: After creating a new booking
    const handleNewBookingCreated = (bookingId: number, flightId: number) => {
        // After creating booking and passengers, navigate to payment
        navigate(`/payment?bookingId=${bookingId}&flightId=${flightId}`);
    };

    // Example 2: From a pending bookings list
    const handleResumePayment = (booking: { booking_id: number; flight_id?: number }) => {
        // Assuming the booking object has flight information
        // You may need to fetch flight details if not available
        const flightId = booking.flight_id; // You'll need to get this from your data
        
        if (flightId) {
            navigate(`/payment?bookingId=${booking.booking_id}&flightId=${flightId}`);
        } else {
            console.error("Flight ID is required to navigate to payment");
        }
    };

    // Example 3: From a booking confirmation email link
    // The email would contain a link like:
    // https://yourdomain.com/payment?bookingId=123&flightId=456
    // When user clicks it, React Router will handle the navigation

    // Example 4: Using URLSearchParams for more complex scenarios
    const handleComplexNavigation = (
        bookingId: number, 
        flightId: number, 
        additionalParams?: { returnUrl?: string }
    ) => {
        const searchParams = new URLSearchParams();
        searchParams.append('bookingId', bookingId.toString());
        searchParams.append('flightId', flightId.toString());
        
        if (additionalParams?.returnUrl) {
            searchParams.append('returnUrl', additionalParams.returnUrl);
        }
        
        navigate(`/payment?${searchParams.toString()}`);
    };

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Payment Navigation Examples</h1>

            <div className="space-y-4">
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Example 1: New Booking Flow</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        After creating a booking with passengers, navigate to payment
                    </p>
                    <Button onClick={() => handleNewBookingCreated(123, 456)}>
                        Create Booking & Pay
                    </Button>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Example 2: Resume Pending Payment</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        From a list of pending bookings, allow user to resume payment
                    </p>
                    <Button onClick={() => handleResumePayment({ booking_id: 789, flight_id: 101 })}>
                        Resume Payment
                    </Button>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Example 3: Email Link</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Email template should include:
                    </p>
                    <code className="block bg-muted p-2 rounded text-xs">
                        {`<a href="https://yourdomain.com/payment?bookingId=123&flightId=456">
    Complete Your Payment
</a>`}
                    </code>
                </div>

                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Example 4: With Additional Parameters</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        Navigate with additional query parameters
                    </p>
                    <Button onClick={() => handleComplexNavigation(123, 456, { returnUrl: '/my-bookings' })}>
                        Pay with Return URL
                    </Button>
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-3">Integration Points</h2>
                <div className="space-y-3 text-sm">
                    <div>
                        <strong>1. After Flight Selection & Passenger Details:</strong>
                        <pre className="bg-muted p-3 rounded mt-2 overflow-x-auto">
{`// In your booking flow component
const handleBookingComplete = async (passengerData) => {
  try {
    // Create booking
    const booking = await createBooking({
      user_id: user.sub,
      status: 'pending'
    });

    // Create passengers
    await Promise.all(
      passengerData.map(p => createPassenger({
        ...p,
        booking_id: booking.booking_id
      }))
    );

    // Navigate to payment
    navigate(\`/payment?bookingId=\${booking.booking_id}&flightId=\${selectedFlight.flight_id}\`);
  } catch (error) {
    console.error('Booking creation failed:', error);
  }
};`}
                        </pre>
                    </div>

                    <div>
                        <strong>2. In "My Bookings" Page:</strong>
                        <pre className="bg-muted p-3 rounded mt-2 overflow-x-auto">
{`// Display pending bookings with "Complete Payment" button
{userBookings
  .filter(b => b.status === 'pending')
  .map(booking => (
    <div key={booking.booking_id}>
      <h3>{booking.booking_reference}</h3>
      <Button 
        onClick={() => navigate(
          \`/payment?bookingId=\${booking.booking_id}&flightId=\${booking.flight_id}\`
        )}
      >
        Complete Payment
      </Button>
    </div>
  ))
}`}
                        </pre>
                    </div>

                    <div>
                        <strong>3. Email Notification Template:</strong>
                        <pre className="bg-muted p-3 rounded mt-2 overflow-x-auto">
{`Subject: Complete Your Flight Booking - {{booking_reference}}

Dear {{passenger_name}},

Your booking is almost complete! 

Booking Reference: {{booking_reference}}
Flight: {{flight_number}} from {{origin}} to {{destination}}
Departure: {{departure_date}}

To complete your booking and secure your seat, please complete payment:

[Complete Payment Button] -> /payment?bookingId={{booking_id}}&flightId={{flight_id}}

This booking will be held for 24 hours.`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
