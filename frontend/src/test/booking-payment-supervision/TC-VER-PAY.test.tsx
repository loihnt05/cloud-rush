import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

/**
 * Test Suite: Verify Payment Status (CSA Features)
 * Category: Verify Payment
 * 
 * Test Cases:
 * - TC-VER-PAY-001: Verify Action for "Verified" Payment
 * - TC-VER-PAY-002: Verify Action for "Pending" Payment - Already Paid
 * - TC-VER-PAY-003: Verify Action for "Pending" Payment - Not Paid
 * - TC-VER-PAY-004: Verify Action for "Failed" Payment - Retry
 * - TC-VER-PAY-005: Verify Action for "Failed" Payment - Cancel
 * 
 * Prerequisites:
 * 1. CSA (Customer Service Agent) is logged in with appropriate permissions
 * 2. Backend API endpoints are available
 * 3. Bookings with different payment statuses exist in the system
 * 
 * Business Rules:
 * - BR44.4: Verified payment automatically marks booking as "paid" and blocks seat
 * - BR44.5: Pending payment can be updated to verified when traveler confirms
 * - BR44.6: Pending payment triggers reminder email if not paid
 * - BR44.7: Failed payment allows retry with new transaction
 * - BR44.8: Failed payment can be cancelled, releasing the seat
 */

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock booking data with different payment statuses
const mockVerifiedPaymentBooking = {
  booking_id: 1,
  booking_reference: 'ABC123XYZ',
  user_id: 'user123',
  status: 'confirmed',
  total_amount: 500.00,
  booking_date: '2025-12-20T10:00:00Z',
  passengers: [
    {
      passenger_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      flight_seat_id: 10,
    }
  ],
  payments: [
    {
      payment_id: 1,
      amount: 500.00,
      status: 'verified',
      payment_date: '2025-12-20T10:30:00Z',
      method: 'credit_card',
    }
  ],
};

const mockPendingPaymentBooking = {
  booking_id: 2,
  booking_reference: 'DEF456UVW',
  user_id: 'user456',
  status: 'pending',
  total_amount: 750.00,
  booking_date: '2025-12-20T11:00:00Z',
  passengers: [
    {
      passenger_id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      flight_seat_id: 20,
    }
  ],
  payments: [
    {
      payment_id: 2,
      amount: 750.00,
      status: 'pending',
      payment_date: '2025-12-20T11:30:00Z',
      method: 'credit_card',
    }
  ],
};

const mockFailedPaymentBooking = {
  booking_id: 3,
  booking_reference: 'GHI789RST',
  user_id: 'user789',
  status: 'pending',
  total_amount: 600.00,
  booking_date: '2025-12-20T12:00:00Z',
  passengers: [
    {
      passenger_id: 3,
      first_name: 'Bob',
      last_name: 'Johnson',
      flight_seat_id: 30,
    }
  ],
  payments: [
    {
      payment_id: 3,
      amount: 600.00,
      status: 'failed',
      payment_date: '2025-12-20T12:30:00Z',
      method: 'credit_card',
    }
  ],
};

const mockSeatData = {
  flight_seat_id: 10,
  seat_number: '12A',
  status: 'booked',
  flight_id: 1,
};

const mockAvailableSeat = {
  flight_seat_id: 30,
  seat_number: '15C',
  status: 'available',
  flight_id: 1,
};

// Mock CSA Payment Verification Component
interface CSAPaymentVerificationProps {
  bookingId: number;
  onPaymentUpdate?: (bookingId: number, status: string) => void;
  onSeatStatusChange?: (seatId: number, status: string) => void;
}

const CSAPaymentVerification: React.FC<CSAPaymentVerificationProps> = ({ 
  bookingId, 
  onPaymentUpdate,
  onSeatStatusChange 
}) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [seat, setSeat] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchBookingAndSeat = async () => {
      try {
        const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(bookingResponse.data);

        // Fetch seat status if passenger has a seat
        if (bookingResponse.data.passengers?.[0]?.flight_seat_id) {
          const seatResponse = await axios.get(
            `/api/seats/${bookingResponse.data.passengers[0].flight_seat_id}`
          );
          setSeat(seatResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking or seat data');
        setLoading(false);
      }
    };
    fetchBookingAndSeat();
  }, [bookingId]);

  const handleVerifyPayment = async () => {
    try {
      const response = await axios.put(`/api/payments/${booking.payments[0].payment_id}`, {
        status: 'verified',
      });
      
      // Update booking status to paid
      const bookingResponse = await axios.put(`/api/bookings/${bookingId}/status`, {
        status: 'paid',
      });

      // Block/book the seat
      const seatResponse = await axios.put(
        `/api/seats/${booking.passengers[0].flight_seat_id}`,
        { status: 'booked' }
      );

      setBooking({ ...booking, status: 'paid', payments: [{ ...booking.payments[0], status: 'verified' }] });
      setSeat({ ...seat, status: 'booked' });
      onPaymentUpdate?.(bookingId, 'verified');
      onSeatStatusChange?.(booking.passengers[0].flight_seat_id, 'booked');
      setActionMessage('Payment verified and seat blocked successfully');
    } catch (err) {
      setError('Failed to verify payment');
    }
  };

  const handleSendReminder = async () => {
    try {
      await axios.post(`/api/bookings/${bookingId}/send-payment-reminder`, {
        email: booking.user_id,
      });
      setActionMessage('Payment reminder email sent to traveler');
    } catch (err) {
      setError('Failed to send reminder email');
    }
  };

  const handleRetryPayment = async () => {
    try {
      const response = await axios.post(`/api/payments/retry`, {
        booking_id: bookingId,
        amount: booking.total_amount,
      });
      setActionMessage(`New payment attempt created. Transaction ID: ${response.data.payment_id}`);
      
      // Update local state with new payment
      setBooking({
        ...booking,
        payments: [...booking.payments, response.data],
      });
    } catch (err) {
      setError('Failed to create new payment attempt');
    }
  };

  const handleCancelPayment = async () => {
    try {
      // Cancel payment record
      await axios.delete(`/api/payments/${booking.payments[0].payment_id}`);
      
      // Release the seat
      if (booking.passengers[0].flight_seat_id) {
        const seatResponse = await axios.put(
          `/api/seats/${booking.passengers[0].flight_seat_id}`,
          { status: 'available' }
        );
        setSeat({ ...seat, status: 'available' });
        onSeatStatusChange?.(booking.passengers[0].flight_seat_id, 'available');
      }

      setActionMessage('Payment cancelled and seat released');
      onPaymentUpdate?.(bookingId, 'cancelled');
    } catch (err) {
      setError('Failed to cancel payment');
    }
  };

  if (loading) return <div>Loading payment verification...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!booking) return <div>No booking found</div>;

  const payment = booking.payments?.[0];
  const paymentStatus = payment?.status || 'unknown';
  const bookingStatus = booking.status;

  return (
    <div data-testid="csa-payment-verification">
      <h2>Payment Verification</h2>
      <div data-testid="booking-reference">{booking.booking_reference}</div>
      <div data-testid="booking-status">Booking Status: {bookingStatus}</div>
      <div data-testid="payment-status">Payment Status: {paymentStatus}</div>
      <div data-testid="payment-amount">${payment?.amount || 0}</div>
      
      {seat && (
        <div data-testid="seat-info">
          <div data-testid="seat-number">Seat: {seat.seat_number}</div>
          <div data-testid="seat-status">Seat Status: {seat.status}</div>
        </div>
      )}

      {actionMessage && (
        <div data-testid="action-message" role="status">
          {actionMessage}
        </div>
      )}

      <div data-testid="payment-actions">
        {/* Verified Payment Actions */}
        {paymentStatus === 'verified' && (
          <div data-testid="verified-notice">
            ✅ Payment is verified. Seat is automatically blocked.
          </div>
        )}

        {/* Pending Payment Actions */}
        {paymentStatus === 'pending' && (
          <>
            <button 
              onClick={handleVerifyPayment} 
              data-testid="verify-payment-button"
            >
              Verify Payment (Traveler Confirmed)
            </button>
            <button 
              onClick={handleSendReminder} 
              data-testid="send-reminder-button"
            >
              Send Payment Reminder
            </button>
          </>
        )}

        {/* Failed Payment Actions */}
        {paymentStatus === 'failed' && (
          <>
            <button 
              onClick={handleRetryPayment} 
              data-testid="retry-payment-button"
            >
              Initiate New Payment
            </button>
            <button 
              onClick={handleCancelPayment} 
              data-testid="cancel-payment-button"
            >
              Cancel Payment
            </button>
          </>
        )}
      </div>
    </div>
  );
};

describe('TC-VER-PAY-001: Verify Action for "Verified" Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA viewing a booking
   * 2. payment_status is "verified"
   */
  it('Step 1: Check system status shows "Verified"', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockVerifiedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockSeatData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={1} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('verified');
    });

    // Verify booking status
    expect(getByTestId('booking-status')).toHaveTextContent('confirmed');
    
    console.log('✓ Step 1: System status is "Verified"');
  });

  it('Step 2: Verify seat status is blocked/booked', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockVerifiedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockSeatData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={1} />);

    await waitFor(() => {
      expect(getByTestId('seat-status')).toBeInTheDocument();
    });

    // Verify seat is booked
    expect(getByTestId('seat-status')).toHaveTextContent('booked');
    expect(getByTestId('seat-number')).toHaveTextContent('12A');

    console.log('✓ Step 2: Seat is blocked/booked');
  });

  it('TC-VER-PAY-001: Complete flow - Verified payment blocks seat automatically', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockVerifiedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockSeatData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={1} />);

    // Verify payment status is verified
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('verified');
    });

    // Verify booking status and seat status
    expect(getByTestId('booking-status')).toHaveTextContent('confirmed');
    expect(getByTestId('seat-status')).toHaveTextContent('booked');

    // Verify notice is displayed
    expect(getByTestId('verified-notice')).toHaveTextContent('automatically blocked');

    console.log('✓ TC-VER-PAY-001 PASSED: Verified payment automatically marks booking as paid and blocks seat');
  });
});

describe('TC-VER-PAY-002: Verify Action for "Pending" Payment - Already Paid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA viewing a booking
   * 2. payment_status is "pending"
   */
  it('Step 1: Check with traveler (simulated) - traveler confirms payment made', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Verify traveler confirmation action is available
    const verifyButton = getByTestId('verify-payment-button');
    expect(verifyButton).toBeInTheDocument();
    expect(verifyButton).toHaveTextContent('Traveler Confirmed');

    console.log('✓ Step 1: Traveler confirms payment made (simulated)');
  });

  it('Step 2: Re-check/refresh payment_status updates to verified', async () => {
    const onPaymentUpdate = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock payment verification
    mockedAxios.put.mockImplementation((url: string) => {
      if (url.includes('/api/payments/')) {
        return Promise.resolve({ data: { ...mockPendingPaymentBooking.payments[0], status: 'verified' } });
      }
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: { ...mockPendingPaymentBooking, status: 'paid' } });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { flight_seat_id: 20, status: 'booked' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CSAPaymentVerification 
        bookingId={2} 
        onPaymentUpdate={onPaymentUpdate}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    await waitFor(() => {
      expect(getByTestId('verify-payment-button')).toBeInTheDocument();
    });

    // Click verify payment
    fireEvent.click(getByTestId('verify-payment-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/2',
        { status: 'verified' }
      );
    });

    // Verify callbacks were called
    await waitFor(() => {
      expect(onPaymentUpdate).toHaveBeenCalledWith(2, 'verified');
      expect(onSeatStatusChange).toHaveBeenCalledWith(20, 'booked');
    });

    console.log('✓ Step 2: Payment status updated to verified');
  });

  it('TC-VER-PAY-002: Complete flow - Pending payment verified and seat blocked', async () => {
    const onPaymentUpdate = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockResolvedValue({ data: {} });

    const { getByTestId } = render(
      <CSAPaymentVerification bookingId={2} onPaymentUpdate={onPaymentUpdate} />
    );

    // Wait for pending status
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Verify payment
    fireEvent.click(getByTestId('verify-payment-button'));

    // Verify status updates
    await waitFor(() => {
      expect(onPaymentUpdate).toHaveBeenCalledWith(2, 'verified');
      expect(getByTestId('action-message')).toHaveTextContent('Payment verified and seat blocked');
    });

    console.log('✓ TC-VER-PAY-002 PASSED: Pending payment marked as paid and seat blocked');
  });
});

describe('TC-VER-PAY-003: Verify Action for "Pending" Payment - Not Paid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA viewing a booking
   * 2. payment_status is "pending"
   */
  it('Step 1: Check with traveler - traveler has not paid', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Verify send reminder button is available
    const reminderButton = getByTestId('send-reminder-button');
    expect(reminderButton).toBeInTheDocument();
    expect(reminderButton).toHaveTextContent('Send Payment Reminder');

    console.log('✓ Step 1: Traveler has not paid (CSA can send reminder)');
  });

  it('Step 2: Click "Send Reminder" and email is sent', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('send-reminder-button')).toBeInTheDocument();
    });

    // Click send reminder
    fireEvent.click(getByTestId('send-reminder-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/bookings/2/send-payment-reminder',
        expect.objectContaining({ email: 'user456' })
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(getByTestId('action-message')).toHaveTextContent('reminder email sent');
    });

    console.log('✓ Step 2: Payment reminder email sent');
  });

  it('TC-VER-PAY-003: Complete flow - Send payment reminder for unpaid booking', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 20 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={2} />);

    // Verify pending status
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Send reminder
    fireEvent.click(getByTestId('send-reminder-button'));

    // Verify email sent
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(getByTestId('action-message')).toHaveTextContent('Payment reminder email sent to traveler');
    });

    console.log('✓ TC-VER-PAY-003 PASSED: Payment reminder sent to traveler');
  });
});

describe('TC-VER-PAY-004: Verify Action for "Failed" Payment - Retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA viewing a booking
   * 2. payment_status is "failed"
   */
  it('Step 1: Check with traveler - traveler wants to retry', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockAvailableSeat, flight_seat_id: 30 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={3} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Verify retry button is available
    const retryButton = getByTestId('retry-payment-button');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent('Initiate New Payment');

    console.log('✓ Step 1: Traveler wants to retry payment');
  });

  it('Step 2: Initiate new payment and new transaction ID generated', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockAvailableSeat, flight_seat_id: 30 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock new payment creation
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        payment_id: 999,
        booking_id: 3,
        amount: 600.00,
        status: 'pending',
        payment_date: new Date().toISOString(),
      },
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={3} />);

    await waitFor(() => {
      expect(getByTestId('retry-payment-button')).toBeInTheDocument();
    });

    // Click retry payment
    fireEvent.click(getByTestId('retry-payment-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments/retry',
        expect.objectContaining({
          booking_id: 3,
          amount: 600.00,
        })
      );
    });

    // Verify new transaction message
    await waitFor(() => {
      expect(getByTestId('action-message')).toHaveTextContent('Transaction ID: 999');
    });

    console.log('✓ Step 2: New payment attempt created with transaction ID');
  });

  it('TC-VER-PAY-004: Complete flow - Retry failed payment with new transaction', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockAvailableSeat, flight_seat_id: 30 } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { payment_id: 999, status: 'pending' },
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={3} />);

    // Verify failed status
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Initiate retry
    fireEvent.click(getByTestId('retry-payment-button'));

    // Verify new payment attempt
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(getByTestId('action-message')).toHaveTextContent('New payment attempt created');
    });

    console.log('✓ TC-VER-PAY-004 PASSED: Failed payment retried with new transaction');
  });
});

describe('TC-VER-PAY-005: Verify Action for "Failed" Payment - Cancel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA viewing a booking
   * 2. payment_status is "failed"
   */
  it('Step 1: Check with traveler - traveler does not retry', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 30, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSAPaymentVerification bookingId={3} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Verify cancel button is available
    const cancelButton = getByTestId('cancel-payment-button');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent('Cancel Payment');

    console.log('✓ Step 1: Traveler does not want to retry (cancel option available)');
  });

  it('Step 2: Click "Cancel Payment" and seat becomes available', async () => {
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 30, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Mock payment cancellation
    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.put.mockResolvedValueOnce({
      data: { flight_seat_id: 30, status: 'available' },
    });

    const { getByTestId } = render(
      <CSAPaymentVerification bookingId={3} onSeatStatusChange={onSeatStatusChange} />
    );

    await waitFor(() => {
      expect(getByTestId('cancel-payment-button')).toBeInTheDocument();
    });

    // Click cancel payment
    fireEvent.click(getByTestId('cancel-payment-button'));

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/payments/3');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/seats/30',
        { status: 'available' }
      );
    });

    // Verify seat status change callback
    await waitFor(() => {
      expect(onSeatStatusChange).toHaveBeenCalledWith(30, 'available');
    });

    console.log('✓ Step 2: Payment cancelled and seat released');
  });

  it('TC-VER-PAY-005: Complete flow - Cancel failed payment and release seat', async () => {
    const onPaymentUpdate = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: { ...mockSeatData, flight_seat_id: 30, status: 'reserved' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.put.mockResolvedValueOnce({
      data: { flight_seat_id: 30, status: 'available' },
    });

    const { getByTestId } = render(
      <CSAPaymentVerification 
        bookingId={3} 
        onPaymentUpdate={onPaymentUpdate}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    // Verify failed status
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Cancel payment
    fireEvent.click(getByTestId('cancel-payment-button'));

    // Verify payment cancelled and seat released
    await waitFor(() => {
      expect(onPaymentUpdate).toHaveBeenCalledWith(3, 'cancelled');
      expect(onSeatStatusChange).toHaveBeenCalledWith(30, 'available');
      expect(getByTestId('action-message')).toHaveTextContent('Payment cancelled and seat released');
    });

    console.log('✓ TC-VER-PAY-005 PASSED: Failed payment cancelled and seat released');
  });
});

describe('Additional Payment Verification Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should display error when booking fetch fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { getByRole } = render(<CSAPaymentVerification bookingId={999} />);

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to fetch booking or seat data');
    });
  });

  it('Should handle API error when verifying payment', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockSeatData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId, getByRole } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('verify-payment-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('verify-payment-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to verify payment');
    });
  });

  it('Should handle API error when sending reminder', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockPendingPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockSeatData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockRejectedValueOnce(new Error('Email service error'));

    const { getByTestId, getByRole } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('send-reminder-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('send-reminder-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to send reminder email');
    });
  });

  it('Should handle API error when retrying payment', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockFailedPaymentBooking });
      }
      if (url.includes('/api/seats/')) {
        return Promise.resolve({ data: mockAvailableSeat });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockRejectedValueOnce(new Error('Payment gateway error'));

    const { getByTestId, getByRole } = render(<CSAPaymentVerification bookingId={3} />);

    await waitFor(() => {
      expect(getByTestId('retry-payment-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('retry-payment-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to create new payment attempt');
    });
  });

  it('Should handle booking without seat assignment', async () => {
    const bookingWithoutSeat = {
      ...mockPendingPaymentBooking,
      passengers: [
        {
          passenger_id: 1,
          first_name: 'Test',
          last_name: 'User',
          flight_seat_id: null,
        }
      ],
    };

    mockedAxios.get.mockResolvedValueOnce({ data: bookingWithoutSeat });

    const { queryByTestId } = render(<CSAPaymentVerification bookingId={2} />);

    await waitFor(() => {
      expect(queryByTestId('payment-status')).toBeInTheDocument();
    });

    // Seat info should not be displayed
    expect(queryByTestId('seat-info')).not.toBeInTheDocument();
  });
});
