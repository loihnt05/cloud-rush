import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

/**
 * Test Suite: Payment State Transitions
 * 
 * Test Cases:
 * - TC-STAT-001: Transition: Pending -> Verified
 * - TC-STAT-002: Transition: Pending -> Failed
 * - TC-STAT-003: Transition: Verified -> Refunded
 * - TC-STAT-004: Transition: Failed -> Pending
 * - TC-STAT-005: Transition: Refunded -> Verified (Invalid)
 * - TC-STAT-006: Transition: Completed -> Failed
 * - TC-STAT-007: Transition: Failed -> Verified (Force)
 * - TC-STAT-008: Transition: Refunded -> Pending (Invalid)
 * - TC-STAT-009: Bulk Transition: Mark 10 as Paid
 * - TC-STAT-010: Status Consistency Check
 * 
 * Business Rules:
 * - BR46: Invalid status transitions are blocked
 * - BR47: Valid status transitions trigger appropriate actions
 */

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock payment data
const mockPendingPayment = {
  payment_id: 1,
  booking_id: 101,
  amount: 500.00,
  status: 'pending',
  payment_date: '2025-12-20T10:00:00Z',
  method: 'manual',
  transaction_id: 'TXN001',
  seat_id: 'A1',
};

const mockVerifiedPayment = {
  payment_id: 2,
  booking_id: 102,
  amount: 750.00,
  status: 'verified',
  payment_date: '2025-12-20T11:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN002',
  seat_id: 'A2',
};

const mockFailedPayment = {
  payment_id: 3,
  booking_id: 103,
  amount: 600.00,
  status: 'failed',
  payment_date: '2025-12-19T09:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN003',
  seat_id: 'A3',
};

const mockRefundedPayment = {
  payment_id: 4,
  booking_id: 104,
  amount: 800.00,
  status: 'refunded',
  payment_date: '2025-12-18T08:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN004',
  refund_date: '2025-12-19T14:00:00Z',
  seat_id: 'A4',
};

const mockCompletedPayment = {
  payment_id: 5,
  booking_id: 105,
  amount: 900.00,
  status: 'completed',
  payment_date: '2025-12-17T10:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN005',
  seat_id: 'A5',
};

const mockPendingPayments = Array.from({ length: 10 }, (_, i) => ({
  payment_id: 100 + i,
  booking_id: 200 + i,
  amount: 500 + i * 10,
  status: 'pending',
  payment_date: '2025-12-20T10:00:00Z',
  method: 'credit_card',
  transaction_id: `TXN-BULK-${i}`,
  seat_id: `B${i + 1}`,
}));

// Mock Payment State Transition Component
interface PaymentStateTransitionProps {
  paymentId: number;
  onStatusChange?: (paymentId: number, newStatus: string) => void;
  onSeatStatusChange?: (seatId: string, status: string) => void;
}

const PaymentStateTransition: React.FC<PaymentStateTransitionProps> = ({
  paymentId,
  onStatusChange,
  onSeatStatusChange,
}) => {
  const [payment, setPayment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/${paymentId}`);
        setPayment(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payment');
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const isValidTransition = (currentStatus: string, newStatus: string): boolean => {
    // Invalid transitions
    const invalidTransitions = [
      { from: 'refunded', to: 'verified' },
      { from: 'refunded', to: 'pending' },
    ];

    return !invalidTransitions.some(
      (t) => t.from === currentStatus && t.to === newStatus
    );
  };

  const handleVerify = async () => {
    try {
      setError(null);
      setWarning(null);

      // Check if transition is valid
      if (!isValidTransition(payment.status, 'verified')) {
        setError('Invalid transition: Cannot verify a refunded transaction');
        return;
      }

      // Show warning for failed -> verified
      if (payment.status === 'failed') {
        setWarning('Payment marked as failed previously. Proceeding with verification.');
      }

      // Update payment status
      const response = await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'verified',
      });

      // Book seat
      await axios.put(`/api/seats/${payment.seat_id}/status`, {
        status: 'booked',
      });

      setPayment(response.data);
      onStatusChange?.(paymentId, 'verified');
      onSeatStatusChange?.(payment.seat_id, 'booked');
      setSuccessMessage('Payment verified and seat booked');
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    }
  };

  const handleReject = async () => {
    try {
      setError(null);

      // Update payment status to failed
      const response = await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'failed',
      });

      // Release seat
      await axios.put(`/api/seats/${payment.seat_id}/status`, {
        status: 'available',
      });

      setPayment(response.data);
      onStatusChange?.(paymentId, 'failed');
      onSeatStatusChange?.(payment.seat_id, 'available');
      setSuccessMessage('Payment rejected and seat released');
    } catch (err: any) {
      setError(err.message || 'Failed to reject payment');
    }
  };

  const handleRefund = async () => {
    try {
      setError(null);

      // Process refund
      const response = await axios.post(`/api/payments/${paymentId}/refund`);

      // Update payment status
      await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'refunded',
      });

      setPayment({ ...payment, status: 'refunded', refund_date: new Date().toISOString() });
      onStatusChange?.(paymentId, 'refunded');
      setSuccessMessage('Payment refunded and money returned');
    } catch (err: any) {
      setError(err.message || 'Failed to process refund');
    }
  };

  const handleRetry = async () => {
    try {
      setError(null);

      // Update payment status to pending
      const response = await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'pending',
      });

      // Hold seat again
      await axios.put(`/api/seats/${payment.seat_id}/status`, {
        status: 'reserved',
      });

      setPayment(response.data);
      onStatusChange?.(paymentId, 'pending');
      onSeatStatusChange?.(payment.seat_id, 'reserved');
      setSuccessMessage('Payment retry initiated and seat held');
    } catch (err: any) {
      setError(err.message || 'Failed to retry payment');
    }
  };

  const handleReopen = async () => {
    try {
      setError(null);

      // Check if refunded
      if (payment.status === 'refunded') {
        setError('Cannot reopen refunded booking');
        return;
      }

      // Update to pending
      const response = await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'pending',
      });

      setPayment(response.data);
      onStatusChange?.(paymentId, 'pending');
      setSuccessMessage('Booking reopened');
    } catch (err: any) {
      setError(err.message || 'Failed to reopen booking');
    }
  };

  const handleFlagFraud = async () => {
    try {
      setError(null);

      // Update payment status to failed
      const response = await axios.put(`/api/payments/${paymentId}/status`, {
        status: 'failed',
      });

      // Flag account and booking
      await axios.post(`/api/payments/${paymentId}/flag-fraud`, {
        reason: 'fraud_chargeback',
      });

      setPayment({ ...response.data, fraud_flag: true });
      onStatusChange?.(paymentId, 'failed');
      setSuccessMessage('Payment marked as failed and account/booking flagged');
    } catch (err: any) {
      setError(err.message || 'Failed to flag fraud');
    }
  };

  if (loading) return <div>Loading payment...</div>;
  if (!payment) return <div>No payment found</div>;

  return (
    <div data-testid="payment-state-transition">
      <h2>Payment State Transition</h2>
      <div data-testid="payment-id">Payment ID: {payment.payment_id}</div>
      <div data-testid="payment-status">Status: {payment.status}</div>
      <div data-testid="payment-amount">${payment.amount}</div>
      <div data-testid="seat-id">Seat: {payment.seat_id}</div>

      {error && <div data-testid="error-message" role="alert">{error}</div>}
      {warning && <div data-testid="warning-message" role="status">{warning}</div>}
      {successMessage && <div data-testid="success-message" role="status">{successMessage}</div>}

      <div data-testid="action-buttons">
        <button onClick={handleVerify} data-testid="verify-button">
          Verify Payment
        </button>
        <button onClick={handleReject} data-testid="reject-button">
          Reject Payment
        </button>
        <button onClick={handleRefund} data-testid="refund-button">
          Refund Payment
        </button>
        <button onClick={handleRetry} data-testid="retry-button">
          Retry Payment
        </button>
        <button onClick={handleReopen} data-testid="reopen-button">
          Reopen Booking
        </button>
        <button onClick={handleFlagFraud} data-testid="flag-fraud-button">
          Flag as Fraud
        </button>
      </div>
    </div>
  );
};

// Mock Bulk Payment Transition Component
interface BulkPaymentTransitionProps {
  paymentIds: number[];
  onBulkUpdate?: (count: number) => void;
}

const BulkPaymentTransition: React.FC<BulkPaymentTransitionProps> = ({
  paymentIds,
  onBulkUpdate,
}) => {
  const [selectedPayments, setSelectedPayments] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSelectAll = () => {
    setSelectedPayments(paymentIds);
  };

  const handleBulkVerify = async () => {
    try {
      setLoading(true);
      setError(null);

      // Bulk update payments
      const response = await axios.post('/api/payments/bulk-verify', {
        payment_ids: selectedPayments,
      });

      setSuccessMessage(`Successfully verified ${response.data.updated_count} payments`);
      onBulkUpdate?.(response.data.updated_count);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to bulk verify payments');
      setLoading(false);
    }
  };

  return (
    <div data-testid="bulk-payment-transition">
      <h2>Bulk Payment Transition</h2>
      <div data-testid="payment-count">Total: {paymentIds.length}</div>
      <div data-testid="selected-count">Selected: {selectedPayments.length}</div>

      <button onClick={handleSelectAll} data-testid="select-all-button">
        Select All
      </button>
      <button onClick={handleBulkVerify} data-testid="bulk-verify-button" disabled={loading}>
        Bulk Verify
      </button>

      {error && <div data-testid="error-message" role="alert">{error}</div>}
      {successMessage && <div data-testid="success-message" role="status">{successMessage}</div>}
      {loading && <div data-testid="loading">Processing...</div>}
    </div>
  );
};

// Mock Status Consistency Check Component
interface StatusConsistencyCheckProps {
  bookingId: number;
  onConsistencyCheck?: (isConsistent: boolean) => void;
}

const StatusConsistencyCheck: React.FC<StatusConsistencyCheckProps> = ({
  bookingId,
  onConsistencyCheck,
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = React.useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = React.useState<string | null>(null);
  const [isConsistent, setIsConsistent] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkConsistency = async () => {
      try {
        // Fetch booking
        const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
        const booking = bookingResponse.data;
        setBookingStatus(booking.status);

        // Fetch payment
        const paymentResponse = await axios.get(`/api/payments/booking/${bookingId}`);
        const payment = paymentResponse.data;
        setPaymentStatus(payment.status);

        // Check consistency
        const consistent = 
          (payment.status === 'verified' && (booking.status === 'paid' || booking.status === 'confirmed')) ||
          (payment.status === 'completed' && (booking.status === 'paid' || booking.status === 'confirmed'));

        setIsConsistent(consistent);
        onConsistencyCheck?.(consistent);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to check consistency');
        setLoading(false);
      }
    };
    checkConsistency();
  }, [bookingId, onConsistencyCheck]);

  if (loading) return <div>Checking consistency...</div>;
  if (error) return <div role="alert">{error}</div>;

  return (
    <div data-testid="status-consistency-check">
      <h2>Status Consistency Check</h2>
      <div data-testid="booking-status">Booking Status: {bookingStatus}</div>
      <div data-testid="payment-status">Payment Status: {paymentStatus}</div>
      <div data-testid="consistency-result">
        {isConsistent ? (
          <span data-testid="consistent">✓ Status is consistent</span>
        ) : (
          <span data-testid="inconsistent">✗ Status is inconsistent</span>
        )}
      </div>
    </div>
  );
};

describe('TC-STAT-001: Transition: Pending -> Verified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Agent marks manual payment as valid and transitions to verified', async () => {
    const onStatusChange = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockPendingPayment });
    mockedAxios.put.mockResolvedValue({ data: { ...mockPendingPayment, status: 'verified' } });

    const { getByTestId } = render(
      <PaymentStateTransition 
        paymentId={1} 
        onStatusChange={onStatusChange}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Click verify button
    fireEvent.click(getByTestId('verify-button'));

    // Verify status changed to verified and seat booked
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/1/status',
        { status: 'verified' }
      );
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/seats/A1/status',
        { status: 'booked' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('verified and seat booked');
    });

    expect(onStatusChange).toHaveBeenCalledWith(1, 'verified');
    expect(onSeatStatusChange).toHaveBeenCalledWith('A1', 'booked');

    console.log('✓ TC-STAT-001 PASSED: Pending -> Verified with seat booked');
  });
});

describe('TC-STAT-002: Transition: Pending -> Failed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Payment timeout/rejection transitions to failed and releases seat', async () => {
    const onStatusChange = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockPendingPayment });
    mockedAxios.put.mockResolvedValue({ data: { ...mockPendingPayment, status: 'failed' } });

    const { getByTestId } = render(
      <PaymentStateTransition 
        paymentId={1}
        onStatusChange={onStatusChange}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Click reject button
    fireEvent.click(getByTestId('reject-button'));

    // Verify status changed to failed and seat released
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/1/status',
        { status: 'failed' }
      );
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/seats/A1/status',
        { status: 'available' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('rejected and seat released');
    });

    expect(onStatusChange).toHaveBeenCalledWith(1, 'failed');
    expect(onSeatStatusChange).toHaveBeenCalledWith('A1', 'available');

    console.log('✓ TC-STAT-002 PASSED: Pending -> Failed with seat released');
  });
});

describe('TC-STAT-003: Transition: Verified -> Refunded', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Admin approves refund and transitions to refunded', async () => {
    const onStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockVerifiedPayment });
    mockedAxios.post.mockResolvedValueOnce({ data: { refund_id: 1, amount: 750 } });
    mockedAxios.put.mockResolvedValueOnce({ data: { ...mockVerifiedPayment, status: 'refunded' } });

    const { getByTestId } = render(
      <PaymentStateTransition paymentId={2} onStatusChange={onStatusChange} />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('verified');
    });

    // Click refund button
    fireEvent.click(getByTestId('refund-button'));

    // Verify refund processed
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/2/refund');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/2/status',
        { status: 'refunded' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('refunded and money returned');
    });

    expect(onStatusChange).toHaveBeenCalledWith(2, 'refunded');

    console.log('✓ TC-STAT-003 PASSED: Verified -> Refunded with money returned');
  });
});

describe('TC-STAT-004: Transition: Failed -> Pending', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Agent allows retry and transitions to pending with seat held', async () => {
    const onStatusChange = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockFailedPayment });
    mockedAxios.put.mockResolvedValue({ data: { ...mockFailedPayment, status: 'pending' } });

    const { getByTestId } = render(
      <PaymentStateTransition 
        paymentId={3}
        onStatusChange={onStatusChange}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Click retry button
    fireEvent.click(getByTestId('retry-button'));

    // Verify status changed to pending and seat held
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/3/status',
        { status: 'pending' }
      );
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/seats/A3/status',
        { status: 'reserved' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('retry initiated and seat held');
    });

    expect(onStatusChange).toHaveBeenCalledWith(3, 'pending');
    expect(onSeatStatusChange).toHaveBeenCalledWith('A3', 'reserved');

    console.log('✓ TC-STAT-004 PASSED: Failed -> Pending with seat held again');
  });
});

describe('TC-STAT-005: Transition: Refunded -> Verified (Invalid)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Attempt to verify refunded transaction shows error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockRefundedPayment });

    const { getByTestId, getByRole } = render(
      <PaymentStateTransition paymentId={4} />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('refunded');
    });

    // Try to verify
    fireEvent.click(getByTestId('verify-button'));

    // Verify error displayed
    await waitFor(() => {
      const errorAlert = getByRole('alert');
      expect(errorAlert).toHaveTextContent('Invalid transition');
      expect(errorAlert).toHaveTextContent('Cannot verify a refunded transaction');
    });

    // Ensure no API call was made
    expect(mockedAxios.put).not.toHaveBeenCalledWith(
      expect.stringContaining('/status'),
      expect.anything()
    );

    console.log('✓ TC-STAT-005 PASSED: Refunded -> Verified blocked with error');
  });
});

describe('TC-STAT-006: Transition: Completed -> Failed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Mark completed payment as fraud/chargeback', async () => {
    const onStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockCompletedPayment });
    mockedAxios.put.mockResolvedValueOnce({ data: { ...mockCompletedPayment, status: 'failed' } });
    mockedAxios.post.mockResolvedValueOnce({ data: { fraud_flag: true } });

    const { getByTestId } = render(
      <PaymentStateTransition paymentId={5} onStatusChange={onStatusChange} />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('completed');
    });

    // Flag as fraud
    fireEvent.click(getByTestId('flag-fraud-button'));

    // Verify fraud flagged
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/5/status',
        { status: 'failed' }
      );
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments/5/flag-fraud',
        { reason: 'fraud_chargeback' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('marked as failed and account/booking flagged');
    });

    expect(onStatusChange).toHaveBeenCalledWith(5, 'failed');

    console.log('✓ TC-STAT-006 PASSED: Completed -> Failed with fraud flag');
  });
});

describe('TC-STAT-007: Transition: Failed -> Verified (Force)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Force verify a failed transaction with warning', async () => {
    const onStatusChange = vi.fn();
    const onSeatStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockFailedPayment });
    mockedAxios.put.mockResolvedValue({ data: { ...mockFailedPayment, status: 'verified' } });

    const { getByTestId } = render(
      <PaymentStateTransition 
        paymentId={3}
        onStatusChange={onStatusChange}
        onSeatStatusChange={onSeatStatusChange}
      />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('failed');
    });

    // Force verify
    fireEvent.click(getByTestId('verify-button'));

    // Verify warning displayed and action completed
    await waitFor(() => {
      expect(getByTestId('warning-message')).toHaveTextContent('Payment marked as failed previously');
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/3/status',
        { status: 'verified' }
      );
      expect(getByTestId('success-message')).toHaveTextContent('verified');
    });

    expect(onStatusChange).toHaveBeenCalledWith(3, 'verified');
    expect(onSeatStatusChange).toHaveBeenCalledWith('A3', 'booked');

    console.log('✓ TC-STAT-007 PASSED: Failed -> Verified with warning');
  });
});

describe('TC-STAT-008: Transition: Refunded -> Pending (Invalid)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Attempt to reopen refunded booking shows error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockRefundedPayment });

    const { getByTestId, getByRole } = render(
      <PaymentStateTransition paymentId={4} />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('refunded');
    });

    // Try to reopen
    fireEvent.click(getByTestId('reopen-button'));

    // Verify error displayed
    await waitFor(() => {
      const errorAlert = getByRole('alert');
      expect(errorAlert).toHaveTextContent('Cannot reopen refunded booking');
    });

    // Ensure no API call was made
    expect(mockedAxios.put).not.toHaveBeenCalled();

    console.log('✓ TC-STAT-008 PASSED: Refunded -> Pending blocked with error');
  });
});

describe('TC-STAT-009: Bulk Transition: Mark 10 as Paid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Select 10 pending transactions and bulk verify all', async () => {
    const onBulkUpdate = vi.fn();

    mockedAxios.post.mockResolvedValueOnce({ 
      data: { 
        updated_count: 10,
        updated_ids: mockPendingPayments.map(p => p.payment_id)
      } 
    });

    const { getByTestId } = render(
      <BulkPaymentTransition 
        paymentIds={mockPendingPayments.map(p => p.payment_id)}
        onBulkUpdate={onBulkUpdate}
      />
    );

    // Verify initial count
    expect(getByTestId('payment-count')).toHaveTextContent('Total: 10');
    expect(getByTestId('selected-count')).toHaveTextContent('Selected: 0');

    // Select all
    fireEvent.click(getByTestId('select-all-button'));

    await waitFor(() => {
      expect(getByTestId('selected-count')).toHaveTextContent('Selected: 10');
    });

    // Bulk verify
    fireEvent.click(getByTestId('bulk-verify-button'));

    // Verify bulk update
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments/bulk-verify',
        expect.objectContaining({
          payment_ids: expect.arrayContaining([100, 101, 102, 103, 104, 105, 106, 107, 108, 109])
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Successfully verified 10 payments');
    });

    expect(onBulkUpdate).toHaveBeenCalledWith(10);

    console.log('✓ TC-STAT-009 PASSED: Bulk verified 10 pending payments');
  });
});

describe('TC-STAT-010: Status Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Check booking vs payment status consistency - Consistent', async () => {
    const onConsistencyCheck = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: { booking_id: 101, status: 'paid' } });
      }
      if (url.includes('/api/payments/booking/')) {
        return Promise.resolve({ data: { payment_id: 1, status: 'verified' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <StatusConsistencyCheck bookingId={101} onConsistencyCheck={onConsistencyCheck} />
    );

    // Verify consistency check
    await waitFor(() => {
      expect(getByTestId('booking-status')).toHaveTextContent('paid');
      expect(getByTestId('payment-status')).toHaveTextContent('verified');
      expect(getByTestId('consistent')).toHaveTextContent('Status is consistent');
    });

    expect(onConsistencyCheck).toHaveBeenCalledWith(true);

    console.log('✓ TC-STAT-010 PASSED: Payment=Verified, Booking=Paid (Consistent)');
  });

  it('Check booking vs payment status consistency - Inconsistent', async () => {
    const onConsistencyCheck = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: { booking_id: 102, status: 'pending' } });
      }
      if (url.includes('/api/payments/booking/')) {
        return Promise.resolve({ data: { payment_id: 2, status: 'verified' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <StatusConsistencyCheck bookingId={102} onConsistencyCheck={onConsistencyCheck} />
    );

    // Verify inconsistency detected
    await waitFor(() => {
      expect(getByTestId('booking-status')).toHaveTextContent('pending');
      expect(getByTestId('payment-status')).toHaveTextContent('verified');
      expect(getByTestId('inconsistent')).toHaveTextContent('Status is inconsistent');
    });

    expect(onConsistencyCheck).toHaveBeenCalledWith(false);

    console.log('✓ TC-STAT-010 PASSED: Inconsistency detected (Payment=Verified, Booking=Pending)');
  });
});

describe('Additional Payment State Transition Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should handle API error when fetching payment', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<PaymentStateTransition paymentId={999} />);

    await waitFor(() => {
      expect(getByText('No payment found')).toBeInTheDocument();
    });
  });

  it('Should handle API error during verify transition', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockPendingPayment });
    mockedAxios.put.mockRejectedValueOnce(new Error('Database error'));

    const { getByTestId, getByRole } = render(<PaymentStateTransition paymentId={1} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('verify-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Database error');
    });
  });

  it('Should handle bulk verify API error', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Bulk operation failed'));

    const { getByTestId, getByRole } = render(
      <BulkPaymentTransition paymentIds={[1, 2, 3]} />
    );

    fireEvent.click(getByTestId('select-all-button'));
    fireEvent.click(getByTestId('bulk-verify-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Bulk operation failed');
    });
  });

  it('Should handle consistency check API error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API error'));

    const { getByRole } = render(<StatusConsistencyCheck bookingId={999} />);

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('API error');
    });
  });

  it('Should allow completed to verified transition without error', async () => {
    const onStatusChange = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({ data: mockCompletedPayment });
    mockedAxios.put.mockResolvedValue({ data: { ...mockCompletedPayment, status: 'verified' } });

    const { getByTestId, queryByRole } = render(
      <PaymentStateTransition paymentId={5} onStatusChange={onStatusChange} />
    );

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('completed');
    });

    fireEvent.click(getByTestId('verify-button'));

    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
      expect(queryByRole('alert')).not.toBeInTheDocument();
    });

    expect(onStatusChange).toHaveBeenCalledWith(5, 'verified');
  });
});
