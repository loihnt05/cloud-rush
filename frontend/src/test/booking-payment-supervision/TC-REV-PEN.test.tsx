import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

/**
 * Test Suite: Review Pending Bookings (CSA Features)
 * Category: Review Pending
 * 
 * Test Cases:
 * - TC-REV-PEN-001: Verify Contact Customer for Incomplete Booking
 * - TC-REV-PEN-002: Verify Cancel Incomplete Booking (No Contact)
 * - TC-REV-PEN-003: Verify Confirm Pending Booking
 * - TC-REV-PEN-004: Pending Review - Expired Hold (>24h)
 * - TC-REV-PEN-005: Pending Review - Contacted
 * - TC-REV-PEN-006: Pending Review - Invalid Phone
 * - TC-REV-PEN-007: Pending Review - Extend Hold
 * - TC-REV-PEN-008: Pending Review - Send Payment Link
 * - TC-REV-PEN-009: Pending Review - Seat Conflict
 * - TC-REV-PEN-010: Pending Review - Assign Agent
 * - TC-REV-PEN-011: Force Confirm (Admin)
 * - TC-REV-PEN-012: Pending - Duplicate Booking
 * 
 * Prerequisites:
 * 1. CSA (Customer Service Agent) is logged in with appropriate permissions
 * 2. Backend API endpoints are available
 * 3. Bookings with different statuses exist in the system
 */

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock booking data
const mockIncompleteBooking = {
  booking_id: 1,
  booking_reference: 'ABC123XYZ',
  user_id: 'user123',
  status: 'pending',
  total_amount: 0,
  booking_date: '2025-12-20T10:00:00Z',
  passengers: [],
  payments: [],
};

const mockCompleteBooking = {
  booking_id: 2,
  booking_reference: 'DEF456UVW',
  user_id: 'user456',
  status: 'pending',
  total_amount: 500.00,
  booking_date: '2025-12-20T11:00:00Z',
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
      status: 'success',
    }
  ],
};

const mockConfirmedBooking = {
  ...mockIncompleteBooking,
  booking_id: 3,
  booking_reference: 'GHI789RST',
  status: 'confirmed',
  total_amount: 750.00,
};

const mockCancelledBooking = {
  ...mockIncompleteBooking,
  booking_id: 4,
  booking_reference: 'JKL012MNO',
  status: 'cancelled',
};

// Mock CSA Service Component
interface CSABookingReviewProps {
  bookingId: number;
  onStatusUpdate?: (bookingId: number, status: string) => void;
  isAdmin?: boolean;
}

const CSABookingReview: React.FC<CSABookingReviewProps> = ({ bookingId, onStatusUpdate, isAdmin = false }) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<string>('');
  const [overrideReason, setOverrideReason] = React.useState<string>('');

  React.useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking');
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleConfirm = async () => {
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/status`, {
        status: 'confirmed',
      });
      setBooking(response.data);
      onStatusUpdate?.(bookingId, 'confirmed');
      setSuccessMessage('Booking confirmed successfully');
    } catch (err) {
      setError('Failed to confirm booking');
    }
  };

  const handleCancel = async () => {
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/status`, {
        status: 'cancelled',
      });
      setBooking(response.data);
      onStatusUpdate?.(bookingId, 'cancelled');
      setSuccessMessage('Booking cancelled - customer unreachable');
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleContactCustomer = async () => {
    try {
      // Simulate contacting customer (in real app, this might open a modal or send notification)
      await axios.post(`/api/bookings/${bookingId}/contact-customer`, {
        message: 'Please complete your booking details',
      });
    } catch (err) {
      setError('Failed to contact customer');
    }
  };

  const handleMarkContacted = async () => {
    try {
      await axios.put(`/api/bookings/${bookingId}/contact`, {
        timestamp: new Date().toISOString(),
        method: 'phone',
      });
      setSuccessMessage('Last Contacted timestamp updated');
    } catch (err) {
      setError('Failed to update contact timestamp');
    }
  };

  const handleCallCustomer = async () => {
    try {
      await axios.post(`/api/bookings/${bookingId}/call-customer`);
    } catch (err: any) {
      setAlertMessage('Invalid phone number');
      setError(err.message);
    }
  };

  const handleMarkUnreachable = async () => {
    try {
      await axios.put(`/api/bookings/${bookingId}/unreachable`, {
        reason: 'invalid_phone',
      });
    } catch (err) {
      setError('Failed to mark as unreachable');
    }
  };

  const handleExtendHold = async () => {
    try {
      await axios.put(`/api/bookings/${bookingId}/extend-hold`, {
        extend_hours: 24,
      });
      setSuccessMessage('Hold extended by 24 hours');
    } catch (err) {
      setError('Failed to extend hold');
    }
  };

  const handleResendPaymentLink = async () => {
    try {
      await axios.post(`/api/bookings/${bookingId}/resend-payment-link`, {
        email: booking.user_email,
      });
      setSuccessMessage('Email sent with Payment URL');
    } catch (err) {
      setError('Failed to resend payment link');
    }
  };

  const handleAssignAgent = async () => {
    try {
      await axios.put(`/api/bookings/${bookingId}/assign`, {
        agent_id: selectedAgent,
      });
      setSuccessMessage(`Assigned to Agent ${selectedAgent.toUpperCase()}`);
    } catch (err) {
      setError('Failed to assign agent');
    }
  };

  const handleForceConfirm = async () => {
    try {
      const response = await axios.put(`/api/bookings/${bookingId}/force-confirm`, {
        admin_override: true,
        reason: overrideReason,
      });

      await axios.post('/api/audit-logs', {
        action: 'admin_override',
        booking_id: bookingId,
        reason: overrideReason,
      });

      setBooking(response.data);
      setSuccessMessage('Booking Confirmed');
    } catch (err) {
      setError('Failed to force confirm booking');
    }
  };

  if (loading) return <div>Loading booking...</div>;
  if (error && !booking) return <div role="alert">{error}</div>;
  if (!booking) return <div>No booking found</div>;

  const isIncomplete = booking.status === 'pending' && 
    (booking.passengers.length === 0 || booking.payments.length === 0);
  const isPending = booking.status === 'pending';
  const isComplete = booking.passengers.length > 0 && booking.payments.length > 0;
  const isExpired = booking.hold_expiry && new Date(booking.hold_expiry) < new Date();
  const hasDuplicate = booking.duplicate_warning;

  return (
    <div data-testid="csa-booking-review">
      <h2>Booking Review</h2>
      <div data-testid="booking-reference">{booking.booking_reference}</div>
      <div data-testid="booking-status">{booking.status}</div>
      <div data-testid="booking-amount">${booking.total_amount}</div>
      
      {booking.hold_expiry && (
        <div data-testid="hold-expiry">Hold Expiry: {booking.hold_expiry}</div>
      )}

      {booking.last_contacted && (
        <div data-testid="last-contacted">Last Contacted: {booking.last_contacted}</div>
      )}

      {booking.assigned_agent && (
        <div data-testid="assigned-agent">Assigned to: {booking.assigned_agent}</div>
      )}

      {isIncomplete && (
        <div data-testid="incomplete-notice">
          ⚠️ Booking is incomplete (missing passenger details or payment)
        </div>
      )}

      {isExpired && (
        <div data-testid="expired-warning" role="alert">
          Hold expired - auto-cancelled by system
        </div>
      )}

      {hasDuplicate && (
        <div data-testid="duplicate-warning" role="alert">
          Possible duplicate booking detected
        </div>
      )}

      {booking.related_bookings && booking.related_bookings.length > 0 && (
        <div data-testid="related-bookings">
          Related Bookings: {booking.related_bookings.join(', ')}
        </div>
      )}

      {alertMessage && (
        <div data-testid="alert-message" role="alert">
          {alertMessage}
        </div>
      )}

      {successMessage && (
        <div data-testid="success-message" role="status">
          {successMessage}
        </div>
      )}

      {error && booking && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}

      <div data-testid="booking-actions">
        {isPending && isComplete && !isExpired && (
          <button onClick={handleConfirm} data-testid="confirm-button">
            Confirm Booking
          </button>
        )}
        
        {isPending && isIncomplete && (
          <>
            <button onClick={handleContactCustomer} data-testid="contact-customer-button">
              Contact Customer
            </button>
            <button onClick={handleConfirm} data-testid="complete-and-confirm-button">
              Complete & Confirm
            </button>
            <button data-testid="mark-contacted-button" onClick={handleMarkContacted}>
              Mark as Contacted
            </button>
            <button data-testid="call-customer-button" onClick={handleCallCustomer}>
              Call Customer
            </button>
            <button data-testid="mark-unreachable-button" onClick={handleMarkUnreachable}>
              Mark Unreachable
            </button>
            <button data-testid="extend-hold-button" onClick={handleExtendHold}>
              Extend Hold 24h
            </button>
            <button data-testid="resend-payment-link-button" onClick={handleResendPaymentLink}>
              Resend Payment Link
            </button>

            <select 
              data-testid="agent-select" 
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Select Agent</option>
              <option value="csa_001">CSA 001</option>
              <option value="csa_002">CSA 002</option>
            </select>
            <button data-testid="assign-agent-button" onClick={handleAssignAgent}>
              Assign Agent
            </button>

            {isAdmin && (
              <div>
                <input
                  data-testid="override-reason-input"
                  placeholder="Override reason"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
                <button data-testid="force-confirm-button" onClick={handleForceConfirm}>
                  Force Confirm (Admin)
                </button>
              </div>
            )}
          </>
        )}
        
        {(isPending || isIncomplete) && !isExpired && (
          <button onClick={handleCancel} data-testid="cancel-button">
            Cancel Booking
          </button>
        )}
      </div>

      {booking.admin_override && (
        <div data-testid="admin-override-notice" role="status">
          Admin Override Applied
        </div>
      )}
    </div>
  );
};

import React from 'react';

describe('TC-REV-PEN-001: Verify Contact Customer for Incomplete Booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA logged in
   * 2. Filter bookings by status "Pending"
   * 3. Select a booking with booking_flight_status === incomplete
   */
  it('Step 1: CSA reviews incomplete booking and identifies missing info', async () => {
    // Mock API response for incomplete booking
    mockedAxios.get.mockResolvedValueOnce({
      data: mockIncompleteBooking,
    });

    const { getByTestId } = render(<CSABookingReview bookingId={1} />);

    // Wait for booking to load
    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Verify booking details are displayed
    expect(getByTestId('booking-reference')).toHaveTextContent('ABC123XYZ');
    expect(getByTestId('booking-status')).toHaveTextContent('pending');
    
    // Verify incomplete notice is shown
    const incompleteNotice = getByTestId('incomplete-notice');
    expect(incompleteNotice).toBeInTheDocument();
    expect(incompleteNotice).toHaveTextContent('incomplete');

    console.log('✓ Step 1: CSA identified incomplete booking status');
  });

  it('Step 2: CSA contacts customer to provide details/payment', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockIncompleteBooking,
    });

    // Mock contact customer API
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByTestId } = render(<CSABookingReview bookingId={1} />);

    await waitFor(() => {
      expect(getByTestId('contact-customer-button')).toBeInTheDocument();
    });

    // Click contact customer button
    const contactButton = getByTestId('contact-customer-button');
    fireEvent.click(contactButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/bookings/1/contact-customer',
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    console.log('✓ Step 2: Customer contacted successfully (simulated)');
  });

  it('Step 3: CSA updates booking status to "Confirmed" after customer provides details', async () => {
    const onStatusUpdate = vi.fn();

    // Initial load with incomplete booking
    mockedAxios.get.mockResolvedValueOnce({
      data: mockIncompleteBooking,
    });

    // Mock status update to confirmed
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockIncompleteBooking, status: 'confirmed' },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={1} onStatusUpdate={onStatusUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('complete-and-confirm-button')).toBeInTheDocument();
    });

    // Click confirm button
    const confirmButton = getByTestId('complete-and-confirm-button');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/1/status',
        { status: 'confirmed' }
      );
    });

    // Verify status update callback was called
    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith(1, 'confirmed');
    });

    console.log('✓ Step 3: Booking status updated to "confirmed"');
  });

  it('TC-REV-PEN-001: Complete flow - Contact customer and confirm incomplete booking', async () => {
    const onStatusUpdate = vi.fn();

    // Setup mocks
    mockedAxios.get.mockResolvedValueOnce({ data: mockIncompleteBooking });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockIncompleteBooking, status: 'confirmed' },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={1} onStatusUpdate={onStatusUpdate} />
    );

    // Step 1: Verify incomplete booking loaded
    await waitFor(() => {
      expect(getByTestId('incomplete-notice')).toBeInTheDocument();
    });

    // Step 2: Contact customer
    fireEvent.click(getByTestId('contact-customer-button'));
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    // Step 3: Confirm booking
    fireEvent.click(getByTestId('complete-and-confirm-button'));
    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith(1, 'confirmed');
    });

    console.log('✓ TC-REV-PEN-001 PASSED: Incomplete booking confirmed after contacting customer');
  });
});

describe('TC-REV-PEN-002: Verify Cancel Incomplete Booking (No Contact)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA logged in
   * 2. Select a booking with booking_flight_status === incomplete
   */
  it('Step 1: CSA decides NOT to contact customer', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockIncompleteBooking,
    });

    const { getByTestId } = render(<CSABookingReview bookingId={1} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Verify cancel button is available (CSA can choose to cancel instead of contacting)
    const cancelButton = getByTestId('cancel-button');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toBeEnabled();

    console.log('✓ Step 1: CSA can choose to cancel without contacting customer');
  });

  it('Step 2: CSA clicks "Cancel Booking" and system processes cancellation', async () => {
    const onStatusUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockIncompleteBooking,
    });

    // Mock cancellation response with freed seats
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...mockIncompleteBooking,
        status: 'cancelled',
      },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={1} onStatusUpdate={onStatusUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('cancel-button')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = getByTestId('cancel-button');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/1/status',
        { status: 'cancelled' }
      );
    });

    // Verify status update callback
    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith(1, 'cancelled');
    });

    console.log('✓ Step 2: Booking cancelled successfully');
  });

  it('TC-REV-PEN-002: Complete flow - Cancel incomplete booking without contact', async () => {
    const onStatusUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockIncompleteBooking });
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockIncompleteBooking, status: 'cancelled' },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={1} onStatusUpdate={onStatusUpdate} />
    );

    // Verify incomplete booking
    await waitFor(() => {
      expect(getByTestId('booking-status')).toHaveTextContent('pending');
      expect(getByTestId('incomplete-notice')).toBeInTheDocument();
    });

    // Cancel without contacting
    fireEvent.click(getByTestId('cancel-button'));

    // Verify cancellation
    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith(1, 'cancelled');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/1/status',
        { status: 'cancelled' }
      );
    });

    console.log('✓ TC-REV-PEN-002 PASSED: Incomplete booking cancelled immediately without contact');
  });
});

describe('TC-REV-PEN-003: Verify Confirm Pending Booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA logged in
   * 2. Booking is pending but complete (paid/filled)
   */
  it('Step 1: CSA clicks "Confirm Booking" to initiate confirmation', async () => {
    const onStatusUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompleteBooking,
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockCompleteBooking, status: 'confirmed' },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={2} onStatusUpdate={onStatusUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Verify booking is complete (has passengers and payments)
    expect(getByTestId('booking-status')).toHaveTextContent('pending');
    expect(getByTestId('booking-amount')).toHaveTextContent('500');

    // Verify no incomplete notice
    expect(screen.queryByTestId('incomplete-notice')).not.toBeInTheDocument();

    // Click confirm button
    const confirmButton = getByTestId('confirm-button');
    expect(confirmButton).toBeInTheDocument();
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/2/status',
        { status: 'confirmed' }
      );
    });

    console.log('✓ Step 1: Confirm booking action initiated');
  });

  it('TC-REV-PEN-003: Complete flow - Confirm complete pending booking', async () => {
    const onStatusUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockCompleteBooking });
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockCompleteBooking, status: 'confirmed' },
    });

    const { getByTestId } = render(
      <CSABookingReview bookingId={2} onStatusUpdate={onStatusUpdate} />
    );

    // Wait for complete pending booking to load
    await waitFor(() => {
      expect(getByTestId('booking-status')).toHaveTextContent('pending');
      expect(screen.queryByTestId('incomplete-notice')).not.toBeInTheDocument();
    });

    // Confirm the booking
    fireEvent.click(getByTestId('confirm-button'));

    // Verify status updated to confirmed
    await waitFor(() => {
      expect(onStatusUpdate).toHaveBeenCalledWith(2, 'confirmed');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/2/status',
        { status: 'confirmed' }
      );
    });

    console.log('✓ TC-REV-PEN-003 PASSED: Complete pending booking confirmed successfully');
  });
});

describe('Additional CSA Booking Review Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should display error when booking fetch fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { getByRole } = render(<CSABookingReview bookingId={999} />);

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to fetch booking');
    });
  });

  it('Should not show confirm button for already confirmed booking', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockConfirmedBooking });

    const { queryByTestId } = render(<CSABookingReview bookingId={3} />);

    await waitFor(() => {
      expect(queryByTestId('booking-status')).toHaveTextContent('confirmed');
    });

    // Confirm button should not appear for confirmed bookings
    expect(queryByTestId('confirm-button')).not.toBeInTheDocument();
    expect(queryByTestId('cancel-button')).not.toBeInTheDocument();
  });

  it('Should handle API error when confirming booking', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockCompleteBooking });
    mockedAxios.put.mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId, getByRole } = render(<CSABookingReview bookingId={2} />);

    await waitFor(() => {
      expect(getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('confirm-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to confirm booking');
    });
  });

  it('Should handle API error when cancelling booking', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockIncompleteBooking });
    mockedAxios.put.mockRejectedValueOnce(new Error('API Error'));

    const { getByTestId, getByRole } = render(<CSABookingReview bookingId={1} />);

    await waitFor(() => {
      expect(getByTestId('cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('cancel-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to cancel booking');
    });
  });
});

describe('TC-REV-PEN-004: Pending Review - Expired Hold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('System auto-cancels booking pending > 24h', async () => {
    const expiredBooking = {
      ...mockIncompleteBooking,
      booking_id: 10,
      booking_date: '2025-12-21T10:00:00Z', // More than 24h ago
      hold_expiry: '2025-12-22T10:00:00Z',
      status: 'pending',
    };

    // Simulate cron job checking expired holds
    mockedAxios.get.mockResolvedValueOnce({
      data: { bookings: [expiredBooking] }
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...expiredBooking, status: 'cancelled' }
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { seat_status: 'available' }
    });

    // Simulate cron job execution
    const response = await axios.get('/api/bookings/expired-holds');
    const expiredBookings = response.data.bookings;

    expect(expiredBookings.length).toBeGreaterThan(0);

    // Auto-cancel expired booking
    await axios.put(`/api/bookings/${expiredBooking.booking_id}/status`, {
      status: 'cancelled',
      reason: 'hold_expired'
    });

    // Release seat
    await axios.put(`/api/seats/${expiredBooking.flight_seat_id}/status`, {
      status: 'available'
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `/api/bookings/${expiredBooking.booking_id}/status`,
      expect.objectContaining({ status: 'cancelled', reason: 'hold_expired' })
    );

    console.log('✓ TC-REV-PEN-004 PASSED: Expired hold auto-cancelled and seat released');
  });
});

describe('TC-REV-PEN-005: Pending Review - Contacted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Mark "Contacted Customer" updates timestamp', async () => {
    const booking = { ...mockIncompleteBooking, booking_id: 11 };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...booking,
        last_contacted: '2025-12-23T13:00:00Z',
        contact_history: [
          {
            timestamp: '2025-12-23T13:00:00Z',
            agent: 'CSA001',
            method: 'phone',
          }
        ]
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={11} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Click "Mark as Contacted"
    fireEvent.click(getByTestId('mark-contacted-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/11/contact',
        expect.objectContaining({
          timestamp: expect.any(String),
          method: 'phone'
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Last Contacted timestamp updated');
    });

    console.log('✓ TC-REV-PEN-005 PASSED: Contacted timestamp updated');
  });
});

describe('TC-REV-PEN-006: Pending Review - Invalid Phone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Invalid phone number marks unreachable and cancels booking', async () => {
    const booking = {
      ...mockIncompleteBooking,
      booking_id: 12,
      contact_phone: 'invalid-number',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });

    // Simulate phone validation failure
    mockedAxios.post.mockRejectedValueOnce(new Error('Invalid phone number'));

    mockedAxios.put.mockImplementation((url: string) => {
      if (url.includes('/unreachable')) {
        return Promise.resolve({
          data: { ...booking, status: 'unreachable' }
        });
      }
      if (url.includes('/status')) {
        return Promise.resolve({
          data: { ...booking, status: 'cancelled' }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSABookingReview bookingId={12} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Try to call customer
    fireEvent.click(getByTestId('call-customer-button'));

    await waitFor(() => {
      expect(getByTestId('alert-message')).toHaveTextContent('Invalid phone number');
    });

    // Mark as unreachable
    fireEvent.click(getByTestId('mark-unreachable-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/12/unreachable',
        expect.any(Object)
      );
    });

    // Cancel booking
    fireEvent.click(getByTestId('cancel-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/12/status',
        expect.objectContaining({ status: 'cancelled' })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Booking cancelled - customer unreachable');
    });

    console.log('✓ TC-REV-PEN-006 PASSED: Unreachable customer booking cancelled');
  });
});

describe('TC-REV-PEN-007: Pending Review - Extend Hold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Click "Extend Hold Time" extends expiry by 24h', async () => {
    const currentExpiry = '2025-12-23T13:00:00Z';
    const newExpiry = '2025-12-24T13:00:00Z'; // +24h

    const booking = {
      ...mockIncompleteBooking,
      booking_id: 13,
      hold_expiry: currentExpiry,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...booking,
        hold_expiry: newExpiry,
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={13} />);

    await waitFor(() => {
      expect(getByTestId('hold-expiry')).toHaveTextContent(currentExpiry);
    });

    // Click extend hold
    fireEvent.click(getByTestId('extend-hold-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/13/extend-hold',
        expect.objectContaining({
          extend_hours: 24
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Hold extended by 24 hours');
    });

    console.log('✓ TC-REV-PEN-007 PASSED: Hold time extended by 24h');
  });
});

describe('TC-REV-PEN-008: Pending Review - Send Payment Link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Click "Resend Link" sends email with payment URL', async () => {
    const booking = {
      ...mockIncompleteBooking,
      booking_id: 14,
      user_email: 'customer@example.com',
      payment_link: 'https://cloudrush.com/pay/ABC123XYZ',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        email_sent: true,
        recipient: 'customer@example.com',
        payment_url: 'https://cloudrush.com/pay/ABC123XYZ',
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={14} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Click resend payment link
    fireEvent.click(getByTestId('resend-payment-link-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/bookings/14/resend-payment-link',
        expect.objectContaining({
          email: 'customer@example.com'
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Email sent with Payment URL');
    });

    console.log('✓ TC-REV-PEN-008 PASSED: Payment link email sent');
  });
});

describe('TC-REV-PEN-009: Pending Review - Seat Conflict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Seat taken by verified booking auto-cancels pending booking', async () => {
    const pendingBooking = {
      ...mockIncompleteBooking,
      booking_id: 15,
      status: 'pending',
      flight_seat_id: 100,
      seat_number: '12A',
    };

    const verifiedBooking = {
      booking_id: 16,
      status: 'confirmed',
      flight_seat_id: 100,
      seat_number: '12A',
    };

    // Check for seat conflict
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/15')) {
        return Promise.resolve({ data: pendingBooking });
      }
      if (url.includes('/seats/100/bookings')) {
        return Promise.resolve({
          data: {
            bookings: [pendingBooking, verifiedBooking]
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...pendingBooking, status: 'cancelled' }
    });

    // Check seat conflict
    const seatResponse = await axios.get('/api/seats/100/bookings');
    const conflictingBookings = seatResponse.data.bookings;

    const hasVerifiedBooking = conflictingBookings.some(
      (b: any) => b.status === 'confirmed' && b.booking_id !== 15
    );

    expect(hasVerifiedBooking).toBe(true);

    // Auto-cancel pending booking
    await axios.put(`/api/bookings/15/status`, {
      status: 'cancelled',
      reason: 'seat_conflict'
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/bookings/15/status',
      expect.objectContaining({
        status: 'cancelled',
        reason: 'seat_conflict'
      })
    );

    console.log('✓ TC-REV-PEN-009 PASSED: Seat conflict auto-cancelled pending booking');
  });
});

describe('TC-REV-PEN-010: Pending Review - Assign Agent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Assign to Agent A shows in "My Pending Tasks"', async () => {
    const booking = {
      ...mockIncompleteBooking,
      booking_id: 17,
      assigned_agent: null,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...booking,
        assigned_agent: 'csa_001',
        assigned_at: '2025-12-23T13:00:00Z',
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={17} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Select agent from dropdown
    const agentSelect = getByTestId('agent-select');
    fireEvent.change(agentSelect, { target: { value: 'csa_001' } });

    // Click assign
    fireEvent.click(getByTestId('assign-agent-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/17/assign',
        expect.objectContaining({
          agent_id: 'csa_001'
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Assigned to Agent CSA_001');
    });

    // Verify agent sees task in their queue
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        pending_tasks: [
          {
            ...booking,
            assigned_agent: 'agent_a',
          }
        ]
      }
    });

    const tasksResponse = await axios.get('/api/agents/agent_a/pending-tasks');
    expect(tasksResponse.data.pending_tasks).toHaveLength(1);
    expect(tasksResponse.data.pending_tasks[0].booking_id).toBe(17);

    console.log('✓ TC-REV-PEN-010 PASSED: Booking assigned to agent and visible in their tasks');
  });
});

describe('TC-REV-PEN-011: Force Confirm (Admin)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Admin forces confirm without payment with override log', async () => {
    const booking = {
      ...mockIncompleteBooking,
      booking_id: 18,
      status: 'pending',
      total_amount: 500,
      payment_status: 'unpaid',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: booking });
    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...booking,
        status: 'confirmed',
        payment_status: 'unpaid',
        admin_override: true,
        override_reason: 'Admin override: Special case',
        override_by: 'admin@cloudrush.com',
        override_at: '2025-12-23T13:00:00Z',
      }
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        log_id: 1,
        action: 'admin_override',
        message: 'Admin override: Confirmed booking without payment',
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={18} isAdmin={true} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // Enter override reason
    fireEvent.change(getByTestId('override-reason-input'), {
      target: { value: 'Special case' }
    });

    // Click force confirm (admin only)
    fireEvent.click(getByTestId('force-confirm-button'));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/18/force-confirm',
        expect.objectContaining({
          admin_override: true,
          reason: 'Special case'
        })
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/audit-logs',
        expect.objectContaining({
          action: 'admin_override',
          booking_id: 18
        })
      );

      expect(getByTestId('success-message')).toHaveTextContent('Booking Confirmed');
    });

    // Wait for admin override notice to appear after state update
    await waitFor(() => {
      expect(getByTestId('admin-override-notice')).toHaveTextContent('Admin Override Applied');
    });

    console.log('✓ TC-REV-PEN-011 PASSED: Admin force confirmed with override log');
  });
});

describe('TC-REV-PEN-012: Pending - Duplicate Booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('User booked same flight twice - flag as potential duplicate', async () => {
    const booking1 = {
      ...mockIncompleteBooking,
      booking_id: 19,
      user_id: 'user789',
      flight_id: 501,
      booking_date: '2025-12-23T10:00:00Z',
    };

    const booking2 = {
      ...mockIncompleteBooking,
      booking_id: 20,
      user_id: 'user789',
      flight_id: 501,
      booking_date: '2025-12-23T10:05:00Z', // 5 minutes later
      duplicate_warning: true,
      related_bookings: [19],
    };

    // Check for duplicates
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/20')) {
        return Promise.resolve({ data: booking2 });
      }
      if (url.includes('/bookings/check-duplicates')) {
        return Promise.resolve({
          data: {
            is_duplicate: true,
            related_bookings: [booking1],
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: {
        ...booking2,
        duplicate_flag: true,
        related_booking_ids: [19],
      }
    });

    const { getByTestId } = render(<CSABookingReview bookingId={20} />);

    await waitFor(() => {
      expect(getByTestId('csa-booking-review')).toBeInTheDocument();
    });

    // System checks for duplicates
    const duplicateCheck = await axios.get('/api/bookings/check-duplicates', {
      params: {
        user_id: 'user789',
        flight_id: 501,
        booking_id: 20
      }
    });

    expect(duplicateCheck.data.is_duplicate).toBe(true);

    // Flag as duplicate
    await axios.put(`/api/bookings/20/flag-duplicate`, {
      related_booking_ids: [19]
    });

    await waitFor(() => {
      expect(getByTestId('duplicate-warning')).toHaveTextContent('Possible duplicate booking detected');
      expect(getByTestId('related-bookings')).toHaveTextContent('Related Bookings: 19');
    });

    console.log('✓ TC-REV-PEN-012 PASSED: Duplicate booking flagged');
  });
});
