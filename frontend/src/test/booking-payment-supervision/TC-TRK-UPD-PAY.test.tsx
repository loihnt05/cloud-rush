import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

/**
 * Test Suite: Track and Update Payment Status (CSA Features)
 * Categories: Track Payment, Update Payment, View Payments
 * 
 * Test Cases:
 * - TC-TRK-PAY-001: Verify Track Completed Payment
 * - TC-TRK-PAY-002: Verify Track Pending Payment
 * - TC-UPD-PAY-001: Verify Invalid Status Transition (Refunded -> Pending)
 * - TC-UPD-PAY-002: Verify Update to "Completed"
 * - TC-UPD-PAY-003: Verify Update to "Refunded"
 * - TC-VIEW-PAY-001: Verify Filter Payments by Date
 * - TC-VIEW-PAY-002: Verify Filter Payments by Date Range
 * 
 * Prerequisites:
 * 1. CSA (Customer Service Agent) is logged in with appropriate permissions
 * 2. Payment gateway API endpoints are available
 * 3. Payments with different statuses exist in the system
 * 
 * Business Rules:
 * - BR45.9: Completed payment marks booking as "verified"
 * - BR45.10: Pending payment waits for gateway status
 * - BR46.11: Invalid status transitions are blocked
 * - BR47.12: Update to "Completed" triggers verification and receipt email
 * - BR47.13: Update to "Refunded" triggers refund process
 * - BR48.14: Filter payments by specific date
 * - BR48.15: Filter payments by date range
 */

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock payment data
const mockCompletedPayment = {
  payment_id: 1,
  booking_id: 101,
  amount: 500.00,
  status: 'completed',
  payment_date: '2025-12-20T10:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN001',
  gateway_response: {
    status: 'success',
    message: 'Payment processed successfully',
  },
};

const mockPendingPayment = {
  payment_id: 2,
  booking_id: 102,
  amount: 750.00,
  status: 'pending',
  payment_date: '2025-12-20T11:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN002',
  gateway_response: null,
};

const mockRefundedPayment = {
  payment_id: 3,
  booking_id: 103,
  amount: 600.00,
  status: 'refunded',
  payment_date: '2025-12-18T09:00:00Z',
  method: 'credit_card',
  transaction_id: 'TXN003',
  refund_date: '2025-12-19T14:00:00Z',
};

const mockPaymentsList = [
  {
    payment_id: 1,
    booking_id: 101,
    amount: 500.00,
    status: 'completed',
    payment_date: '2025-12-20T10:00:00Z',
  },
  {
    payment_id: 2,
    booking_id: 102,
    amount: 750.00,
    status: 'pending',
    payment_date: '2025-12-20T15:30:00Z',
  },
  {
    payment_id: 3,
    booking_id: 103,
    amount: 300.00,
    status: 'completed',
    payment_date: '2025-12-21T08:00:00Z',
  },
  {
    payment_id: 4,
    booking_id: 104,
    amount: 900.00,
    status: 'completed',
    payment_date: '2025-12-22T12:00:00Z',
  },
];

// Mock CSA Track Payment Component
interface CSATrackPaymentProps {
  paymentId: number;
  onStatusUpdate?: (paymentId: number, status: string) => void;
}

const CSATrackPayment: React.FC<CSATrackPaymentProps> = ({ paymentId, onStatusUpdate }) => {
  const [payment, setPayment] = React.useState<any>(null);
  const [gatewayStatus, setGatewayStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/${paymentId}`);
        setPayment(response.data);

        // If pending, check gateway status
        if (response.data.status === 'pending') {
          const gatewayResponse = await axios.get(
            `/api/payment-gateway/status/${response.data.transaction_id}`
          );
          setGatewayStatus(gatewayResponse.data);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch payment details');
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const handleMarkAsVerified = async () => {
    try {
      await axios.put(`/api/bookings/${payment.booking_id}/status`, {
        status: 'verified',
      });
      onStatusUpdate?.(paymentId, 'verified');
    } catch (err) {
      setError('Failed to mark booking as verified');
    }
  };

  if (loading) return <div>Loading payment tracking...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!payment) return <div>No payment found</div>;

  return (
    <div data-testid="csa-track-payment">
      <h2>Track Payment</h2>
      <div data-testid="payment-id">Payment ID: {payment.payment_id}</div>
      <div data-testid="payment-status">Status: {payment.status}</div>
      <div data-testid="payment-amount">${payment.amount}</div>
      <div data-testid="transaction-id">Transaction: {payment.transaction_id}</div>

      {payment.status === 'completed' && (
        <div data-testid="completed-section">
          <div data-testid="completion-notice">✅ Payment completed successfully</div>
          <button onClick={handleMarkAsVerified} data-testid="mark-verified-button">
            Mark Booking as Verified
          </button>
        </div>
      )}

      {payment.status === 'pending' && gatewayStatus && (
        <div data-testid="pending-section">
          <div data-testid="gateway-status">
            Gateway Status: {gatewayStatus.status}
          </div>
          <div data-testid="gateway-message">
            {gatewayStatus.message || 'Waiting for final status from gateway'}
          </div>
        </div>
      )}
    </div>
  );
};

// Mock CSA Update Payment Component
interface CSAUpdatePaymentProps {
  paymentId: number;
  onPaymentUpdate?: (paymentId: number, newStatus: string) => void;
  onRefundTriggered?: (paymentId: number) => void;
}

const CSAUpdatePayment: React.FC<CSAUpdatePaymentProps> = ({ 
  paymentId, 
  onPaymentUpdate,
  onRefundTriggered 
}) => {
  const [payment, setPayment] = React.useState<any>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await axios.get(`/api/payments/${paymentId}`);
        setPayment(response.data);
        setSelectedStatus(response.data.status);
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
      { from: 'refunded', to: 'pending' },
      { from: 'refunded', to: 'completed' },
      { from: 'completed', to: 'pending' },
    ];

    return !invalidTransitions.some(
      (t) => t.from === currentStatus && t.to === newStatus
    );
  };

  const handleUpdateStatus = async () => {
    try {
      // Validate transition
      if (!isValidTransition(payment.status, selectedStatus)) {
        setError('Invalid transition: Cannot change from ' + payment.status + ' to ' + selectedStatus);
        return;
      }

      // Update payment status
      const response = await axios.put(`/api/payments/${paymentId}`, {
        status: selectedStatus,
      });

      setPayment(response.data);

      // Handle "completed" status
      if (selectedStatus === 'completed') {
        // Mark booking as verified
        await axios.put(`/api/bookings/${payment.booking_id}/status`, {
          status: 'verified',
        });

        // Send receipt email
        await axios.post(`/api/payments/${paymentId}/send-receipt`);

        setSuccessMessage('Payment marked as completed. Booking verified and receipt sent.');
      }

      // Handle "refunded" status
      if (selectedStatus === 'refunded') {
        // Trigger refund process
        await axios.post(`/api/refunds/process`, {
          payment_id: paymentId,
          booking_id: payment.booking_id,
        });

        onRefundTriggered?.(paymentId);
        setSuccessMessage('Payment marked as refunded. Refund process initiated.');
      }

      onPaymentUpdate?.(paymentId, selectedStatus);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
    }
  };

  if (loading) return <div>Loading payment update...</div>;
  if (error) return <div role="alert">{error}</div>;
  if (!payment) return <div>No payment found</div>;

  return (
    <div data-testid="csa-update-payment">
      <h2>Update Payment Status</h2>
      <div data-testid="current-status">Current Status: {payment.status}</div>
      <div data-testid="payment-amount">${payment.amount}</div>

      <div data-testid="status-selector">
        <label htmlFor="status-select">Update Status:</label>
        <select
          id="status-select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          data-testid="status-select"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <button onClick={handleUpdateStatus} data-testid="update-button">
        Update Payment Status
      </button>

      {successMessage && (
        <div data-testid="success-message" role="status">
          {successMessage}
        </div>
      )}
    </div>
  );
};

// Mock CSA View Payments Component
interface CSAViewPaymentsProps {
  onPaymentsLoaded?: (count: number) => void;
}

const CSAViewPayments: React.FC<CSAViewPaymentsProps> = ({ onPaymentsLoaded }) => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [filterDate, setFilterDate] = React.useState<string>('');
  const [filterStartDate, setFilterStartDate] = React.useState<string>('');
  const [filterEndDate, setFilterEndDate] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFilterByDate = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments', {
        params: { date: filterDate },
      });
      setPayments(response.data);
      onPaymentsLoaded?.(response.data.length);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter payments by date');
      setLoading(false);
    }
  };

  const handleFilterByDateRange = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments', {
        params: {
          start_date: filterStartDate,
          end_date: filterEndDate,
        },
      });
      setPayments(response.data);
      onPaymentsLoaded?.(response.data.length);
      setLoading(false);
    } catch (err) {
      setError('Failed to filter payments by date range');
      setLoading(false);
    }
  };

  if (error) return <div role="alert">{error}</div>;

  return (
    <div data-testid="csa-view-payments">
      <h2>Payment Dashboard</h2>

      <div data-testid="filter-by-date">
        <label htmlFor="date-input">Filter by Date:</label>
        <input
          id="date-input"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          data-testid="date-input"
        />
        <button onClick={handleFilterByDate} data-testid="filter-date-button">
          Apply Date Filter
        </button>
      </div>

      <div data-testid="filter-by-range">
        <label htmlFor="start-date-input">Start Date:</label>
        <input
          id="start-date-input"
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          data-testid="start-date-input"
        />
        <label htmlFor="end-date-input">End Date:</label>
        <input
          id="end-date-input"
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          data-testid="end-date-input"
        />
        <button onClick={handleFilterByDateRange} data-testid="filter-range-button">
          Apply Range Filter
        </button>
      </div>

      {loading && <div data-testid="loading">Loading payments...</div>}

      <div data-testid="payments-list">
        {payments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id} data-testid={`payment-row-${payment.payment_id}`}>
                  <td>{payment.payment_id}</td>
                  <td>${payment.amount}</td>
                  <td>{payment.status}</td>
                  <td>{payment.payment_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div data-testid="no-payments">No payments found</div>
        )}
        <div data-testid="payment-count">Total: {payments.length}</div>
      </div>
    </div>
  );
};

describe('TC-TRK-PAY-001: Verify Track Completed Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA selects a payment to track
   * 2. payment_status is "completed"
   */
  it('Step 1: View payment details and status is visible', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompletedPayment,
    });

    const { getByTestId } = render(<CSATrackPayment paymentId={1} />);

    await waitFor(() => {
      expect(getByTestId('csa-track-payment')).toBeInTheDocument();
    });

    // Verify payment details are visible
    expect(getByTestId('payment-status')).toHaveTextContent('completed');
    expect(getByTestId('payment-amount')).toHaveTextContent('500');
    expect(getByTestId('transaction-id')).toHaveTextContent('TXN001');

    console.log('✓ Step 1: Payment details and status are visible');
  });

  it('TC-TRK-PAY-001: Complete flow - CSA marks booking as verified after tracking completed payment', async () => {
    const onStatusUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompletedPayment,
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { booking_id: 101, status: 'verified' },
    });

    const { getByTestId } = render(
      <CSATrackPayment paymentId={1} onStatusUpdate={onStatusUpdate} />
    );

    // Wait for completed payment
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('completed');
    });

    // Verify completion notice
    expect(getByTestId('completion-notice')).toHaveTextContent('completed successfully');

    // Mark booking as verified
    const verifyButton = getByTestId('mark-verified-button');
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/bookings/101/status',
        { status: 'verified' }
      );
    });

    expect(onStatusUpdate).toHaveBeenCalledWith(1, 'verified');

    console.log('✓ TC-TRK-PAY-001 PASSED: Completed payment tracked and booking marked as verified');
  });
});

describe('TC-TRK-PAY-002: Verify Track Pending Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA selects a payment to track
   * 2. payment_status is "pending"
   */
  it('Step 1: Check gateway and gateway status is retrieved', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/payments/')) {
        return Promise.resolve({ data: mockPendingPayment });
      }
      if (url.includes('/api/payment-gateway/status/')) {
        return Promise.resolve({
          data: {
            status: 'processing',
            message: 'Payment is being processed by gateway',
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSATrackPayment paymentId={2} />);

    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Verify gateway status section
    expect(getByTestId('pending-section')).toBeInTheDocument();
    expect(getByTestId('gateway-status')).toHaveTextContent('processing');

    console.log('✓ Step 1: Gateway status retrieved successfully');
  });

  it('TC-TRK-PAY-002: Complete flow - System waits for final status from gateway', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/payments/')) {
        return Promise.resolve({ data: mockPendingPayment });
      }
      if (url.includes('/api/payment-gateway/status/')) {
        return Promise.resolve({
          data: {
            status: 'pending',
            message: 'Waiting for final status from gateway',
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<CSATrackPayment paymentId={2} />);

    // Verify pending status
    await waitFor(() => {
      expect(getByTestId('payment-status')).toHaveTextContent('pending');
    });

    // Verify gateway message about waiting
    expect(getByTestId('gateway-message')).toHaveTextContent('Waiting for final status from gateway');

    console.log('✓ TC-TRK-PAY-002 PASSED: System waits for gateway status for pending payment');
  });
});

describe('TC-UPD-PAY-001: Verify Invalid Status Transition (Refunded -> Pending)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA selects a payment
   * 2. Current payment_status is "Refunded"
   */
  it('Step 1: Attempt to change status to "Pending" and system displays error', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockRefundedPayment,
    });

    const { getByTestId, getByRole } = render(<CSAUpdatePayment paymentId={3} />);

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('refunded');
    });

    // Select "pending" status
    const statusSelect = getByTestId('status-select') as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'pending' } });

    // Click update button
    fireEvent.click(getByTestId('update-button'));

    // Verify error is displayed
    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Invalid transition');
    });

    console.log('✓ Step 1: Invalid transition blocked with error message');
  });

  it('TC-UPD-PAY-001: Complete flow - System blocks invalid refunded to pending transition', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockRefundedPayment,
    });

    const onPaymentUpdate = vi.fn();

    const { getByTestId, getByRole } = render(
      <CSAUpdatePayment paymentId={3} onPaymentUpdate={onPaymentUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('refunded');
    });

    // Attempt invalid transition
    fireEvent.change(getByTestId('status-select'), { target: { value: 'pending' } });
    fireEvent.click(getByTestId('update-button'));

    // Verify error and no API call
    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Invalid transition');
    });

    expect(mockedAxios.put).not.toHaveBeenCalled();
    expect(onPaymentUpdate).not.toHaveBeenCalled();

    console.log('✓ TC-UPD-PAY-001 PASSED: Invalid status transition blocked');
  });
});

describe('TC-UPD-PAY-002: Verify Update to "Completed"', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA selects a payment
   * 2. Change status to "Completed"
   */
  it('Step 1: Confirm status change and update is processed', async () => {
    const onPaymentUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockPendingPayment,
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockPendingPayment, status: 'completed' },
    });

    mockedAxios.post.mockResolvedValue({ data: { success: true } });

    const { getByTestId } = render(
      <CSAUpdatePayment paymentId={2} onPaymentUpdate={onPaymentUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('pending');
    });

    // Change to completed
    fireEvent.change(getByTestId('status-select'), { target: { value: 'completed' } });
    fireEvent.click(getByTestId('update-button'));

    // Verify update processed
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/payments/2',
        { status: 'completed' }
      );
    });

    console.log('✓ Step 1: Status change to completed processed');
  });

  it('TC-UPD-PAY-002: Complete flow - Booking verified, receipt sent, success notification', async () => {
    const onPaymentUpdate = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockPendingPayment,
    });

    mockedAxios.put.mockImplementation((url: string) => {
      if (url.includes('/api/payments/')) {
        return Promise.resolve({ data: { ...mockPendingPayment, status: 'completed' } });
      }
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: { booking_id: 102, status: 'verified' } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({ data: { email_sent: true } });

    const { getByTestId } = render(
      <CSAUpdatePayment paymentId={2} onPaymentUpdate={onPaymentUpdate} />
    );

    await waitFor(() => {
      expect(getByTestId('status-select')).toBeInTheDocument();
    });

    // Update to completed
    fireEvent.change(getByTestId('status-select'), { target: { value: 'completed' } });
    fireEvent.click(getByTestId('update-button'));

    // Verify all actions
    await waitFor(() => {
      // Payment updated
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/payments/2', { status: 'completed' });
      
      // Booking verified
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/bookings/102/status', { status: 'verified' });
      
      // Receipt sent
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/2/send-receipt');
      
      // Success message
      expect(getByTestId('success-message')).toHaveTextContent('Booking verified and receipt sent');
    });

    expect(onPaymentUpdate).toHaveBeenCalledWith(2, 'completed');

    console.log('✓ TC-UPD-PAY-002 PASSED: Payment completed with booking verification and receipt');
  });
});

describe('TC-UPD-PAY-003: Verify Update to "Refunded"', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA selects a payment
   * 2. Change status to "Refunded"
   */
  it('Step 1: Confirm status change triggers refund process', async () => {
    const onRefundTriggered = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompletedPayment,
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockCompletedPayment, status: 'refunded' },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { refund_id: 999, status: 'processing' },
    });

    const { getByTestId } = render(
      <CSAUpdatePayment paymentId={1} onRefundTriggered={onRefundTriggered} />
    );

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('completed');
    });

    // Change to refunded
    fireEvent.change(getByTestId('status-select'), { target: { value: 'refunded' } });
    fireEvent.click(getByTestId('update-button'));

    // Verify refund process triggered
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/refunds/process',
        expect.objectContaining({
          payment_id: 1,
          booking_id: 101,
        })
      );
    });

    expect(onRefundTriggered).toHaveBeenCalledWith(1);

    console.log('✓ Step 1: Refund process triggered');
  });

  it('TC-UPD-PAY-003: Complete flow - Update to refunded triggers Process Refund flow', async () => {
    const onPaymentUpdate = vi.fn();
    const onRefundTriggered = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompletedPayment,
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockCompletedPayment, status: 'refunded' },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { refund_id: 999, status: 'processing' },
    });

    const { getByTestId } = render(
      <CSAUpdatePayment 
        paymentId={1} 
        onPaymentUpdate={onPaymentUpdate}
        onRefundTriggered={onRefundTriggered}
      />
    );

    await waitFor(() => {
      expect(getByTestId('status-select')).toBeInTheDocument();
    });

    // Update to refunded
    fireEvent.change(getByTestId('status-select'), { target: { value: 'refunded' } });
    fireEvent.click(getByTestId('update-button'));

    // Verify refund flow
    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(getByTestId('success-message')).toHaveTextContent('Refund process initiated');
    });

    expect(onPaymentUpdate).toHaveBeenCalledWith(1, 'refunded');
    expect(onRefundTriggered).toHaveBeenCalledWith(1);

    console.log('✓ TC-UPD-PAY-003 PASSED: Refund status update triggers refund process');
  });
});

describe('TC-VIEW-PAY-001: Verify Filter Payments by Date', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA on Payment Dashboard
   */
  it('Step 1: Select a specific date and date filter is applied', async () => {
    const onPaymentsLoaded = vi.fn();

    const paymentsOnDate = mockPaymentsList.filter(
      (p) => p.payment_date.startsWith('2025-12-20')
    );

    mockedAxios.get.mockResolvedValueOnce({
      data: paymentsOnDate,
    });

    const { getByTestId } = render(<CSAViewPayments onPaymentsLoaded={onPaymentsLoaded} />);

    // Set date filter
    const dateInput = getByTestId('date-input') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2025-12-20' } });

    // Apply filter
    fireEvent.click(getByTestId('filter-date-button'));

    // Verify API call with date parameter
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments',
        expect.objectContaining({
          params: { date: '2025-12-20' },
        })
      );
    });

    console.log('✓ Step 1: Date filter applied');
  });

  it('TC-VIEW-PAY-001: Complete flow - System retrieves and displays payments for specific date', async () => {
    const onPaymentsLoaded = vi.fn();

    const paymentsOnDate = [
      mockPaymentsList[0],
      mockPaymentsList[1],
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: paymentsOnDate,
    });

    const { getByTestId } = render(<CSAViewPayments onPaymentsLoaded={onPaymentsLoaded} />);

    // Apply date filter
    fireEvent.change(getByTestId('date-input'), { target: { value: '2025-12-20' } });
    fireEvent.click(getByTestId('filter-date-button'));

    // Verify payments displayed
    await waitFor(() => {
      expect(getByTestId('payment-row-1')).toBeInTheDocument();
      expect(getByTestId('payment-row-2')).toBeInTheDocument();
      expect(getByTestId('payment-count')).toHaveTextContent('Total: 2');
    });

    expect(onPaymentsLoaded).toHaveBeenCalledWith(2);

    console.log('✓ TC-VIEW-PAY-001 PASSED: Payments filtered and displayed by specific date');
  });
});

describe('TC-VIEW-PAY-002: Verify Filter Payments by Date Range', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Prerequisites:
   * 1. CSA on Payment Dashboard
   */
  it('Step 1: Select date range (Start - End) and range filter is applied', async () => {
    const onPaymentsLoaded = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockPaymentsList,
    });

    const { getByTestId } = render(<CSAViewPayments onPaymentsLoaded={onPaymentsLoaded} />);

    // Set date range
    fireEvent.change(getByTestId('start-date-input'), { target: { value: '2025-12-20' } });
    fireEvent.change(getByTestId('end-date-input'), { target: { value: '2025-12-22' } });

    // Apply range filter
    fireEvent.click(getByTestId('filter-range-button'));

    // Verify API call with date range parameters
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/payments',
        expect.objectContaining({
          params: {
            start_date: '2025-12-20',
            end_date: '2025-12-22',
          },
        })
      );
    });

    console.log('✓ Step 1: Date range filter applied');
  });

  it('TC-VIEW-PAY-002: Complete flow - System retrieves and displays payments within date range', async () => {
    const onPaymentsLoaded = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockPaymentsList,
    });

    const { getByTestId } = render(<CSAViewPayments onPaymentsLoaded={onPaymentsLoaded} />);

    // Apply date range filter
    fireEvent.change(getByTestId('start-date-input'), { target: { value: '2025-12-20' } });
    fireEvent.change(getByTestId('end-date-input'), { target: { value: '2025-12-22' } });
    fireEvent.click(getByTestId('filter-range-button'));

    // Verify all payments in range displayed
    await waitFor(() => {
      expect(getByTestId('payment-row-1')).toBeInTheDocument();
      expect(getByTestId('payment-row-2')).toBeInTheDocument();
      expect(getByTestId('payment-row-3')).toBeInTheDocument();
      expect(getByTestId('payment-row-4')).toBeInTheDocument();
      expect(getByTestId('payment-count')).toHaveTextContent('Total: 4');
    });

    expect(onPaymentsLoaded).toHaveBeenCalledWith(4);

    console.log('✓ TC-VIEW-PAY-002 PASSED: Payments filtered and displayed by date range');
  });
});

describe('Additional Track and Update Payment Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should display error when payment fetch fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { getByRole } = render(<CSATrackPayment paymentId={999} />);

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to fetch payment details');
    });
  });

  it('Should handle gateway API error for pending payment', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/payments/')) {
        return Promise.resolve({ data: mockPendingPayment });
      }
      if (url.includes('/api/payment-gateway/status/')) {
        return Promise.reject(new Error('Gateway unavailable'));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByRole } = render(<CSATrackPayment paymentId={2} />);

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to fetch payment details');
    });
  });

  it('Should display no payments message when filter returns empty results', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    const { getByTestId } = render(<CSAViewPayments />);

    fireEvent.change(getByTestId('date-input'), { target: { value: '2025-12-25' } });
    fireEvent.click(getByTestId('filter-date-button'));

    await waitFor(() => {
      expect(getByTestId('no-payments')).toHaveTextContent('No payments found');
      expect(getByTestId('payment-count')).toHaveTextContent('Total: 0');
    });
  });

  it('Should handle API error when filtering payments', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Database error'));

    const { getByTestId, getByRole } = render(<CSAViewPayments />);

    fireEvent.change(getByTestId('date-input'), { target: { value: '2025-12-20' } });
    fireEvent.click(getByTestId('filter-date-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Failed to filter payments');
    });
  });

  it('Should block other invalid transitions (completed -> pending)', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockCompletedPayment,
    });

    const { getByTestId, getByRole } = render(<CSAUpdatePayment paymentId={1} />);

    await waitFor(() => {
      expect(getByTestId('current-status')).toHaveTextContent('completed');
    });

    // Attempt invalid transition
    fireEvent.change(getByTestId('status-select'), { target: { value: 'pending' } });
    fireEvent.click(getByTestId('update-button'));

    await waitFor(() => {
      expect(getByRole('alert')).toHaveTextContent('Invalid transition');
    });

    expect(mockedAxios.put).not.toHaveBeenCalled();
  });
});
