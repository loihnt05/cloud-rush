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
}

const CSABookingReview: React.FC<CSABookingReviewProps> = ({ bookingId, onStatusUpdate }) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  if (loading) return <div>Loading booking...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!booking) return <div>No booking found</div>;

  const isIncomplete = booking.status === 'pending' && 
    (booking.passengers.length === 0 || booking.payments.length === 0);
  const isPending = booking.status === 'pending';
  const isComplete = booking.passengers.length > 0 && booking.payments.length > 0;

  return (
    <div data-testid="csa-booking-review">
      <h2>Booking Review</h2>
      <div data-testid="booking-reference">{booking.booking_reference}</div>
      <div data-testid="booking-status">{booking.status}</div>
      <div data-testid="booking-amount">${booking.total_amount}</div>
      
      {isIncomplete && (
        <div data-testid="incomplete-notice">
          ⚠️ Booking is incomplete (missing passenger details or payment)
        </div>
      )}

      <div data-testid="booking-actions">
        {isPending && isComplete && (
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
          </>
        )}
        
        {(isPending || isIncomplete) && (
          <button onClick={handleCancel} data-testid="cancel-button">
            Cancel Booking
          </button>
        )}
      </div>
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
