/**
 * Test Suite: TC-AGT-PAY (Agent Payment Management)
 * Category: Agent Services - Payment Verification & Management
 * Description: Unit tests for Agent payment confirmation, status updates, receipts, and audit logging
 * 
 * Test Cases:
 * - TC-AGT-PAY-001: Verify Payment - Manual Confirm
 * - TC-AGT-PAY-002: Verify Payment - Upload Receipt
 * - TC-AGT-PAY-003: Update Payment - Pending to Failed
 * - TC-AGT-PAY-004: Update Payment - Failed to Paid
 * - TC-AGT-PAY-005: Update Payment - Invalid Flow
 * - TC-AGT-PAY-006: Verify Payment - Reminder Email
 * - TC-AGT-PAY-007: Verify Payment - Partial Payment
 * - TC-AGT-PAY-008: Verify Payment - Over Payment
 * - TC-AGT-PAY-009: Payment Log - Audit Trail
 * - TC-AGT-PAY-010: Verify Payment - Cash Handling
 * 
 * Prerequisites:
 * 1. Agent is logged in with payment management permissions
 * 2. Bookings exist with various payment statuses
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock payment APIs
const mockMarkAsPaid = vi.fn();
const mockUploadReceipt = vi.fn();
const mockUpdatePaymentStatus = vi.fn();
const mockReleaseSeat = vi.fn();
const mockRebookSeat = vi.fn();
const mockSendPaymentReminder = vi.fn();
const mockLogPaymentAction = vi.fn();
const mockGetPaymentLogs = vi.fn();
const mockProcessPartialPayment = vi.fn();
const mockRecordCredit = vi.fn();

// Mock agent data
const mockAgent = {
  agent_id: 'AGT-001',
  name: 'Agent Smith',
};

// Mock PaymentVerification component
const PaymentVerification = ({ booking, agent }: { booking: any; agent: any }) => {
  const [paymentStatus, setPaymentStatus] = React.useState(booking.payment_status);
  const [seatStatus, setSeatStatus] = React.useState(booking.seat_status);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  const handleMarkAsPaid = async () => {
    setError('');
    setSuccess('');

    try {
      // Mark payment as paid
      await mockMarkAsPaid(booking.booking_id, agent.agent_id);

      // Update seat to booked
      setPaymentStatus('Paid');
      setSeatStatus('Booked');

      // Log action
      await mockLogPaymentAction(booking.booking_id, `Agent ${agent.name} updated payment`);

      setSuccess('Payment marked as paid');
    } catch (err) {
      setError('Failed to mark as paid');
    }
  };

  return (
    <div data-testid="payment-verification">
      <h2>Payment Verification - {booking.booking_id}</h2>
      <div data-testid="payment-status">Payment Status: {paymentStatus}</div>
      <div data-testid="seat-status">Seat Status: {seatStatus}</div>

      <button onClick={handleMarkAsPaid} data-testid="mark-paid-button">
        Mark as Paid
      </button>

      {success && <div data-testid="success-message">{success}</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock ReceiptUpload component
const ReceiptUpload = ({ bookingId }: { bookingId: string }) => {
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError('No file selected');
      return;
    }

    setError('');
    setSuccess('');

    try {
      await mockUploadReceipt(bookingId, uploadedFile);
      setSuccess('Receipt uploaded successfully');
    } catch (err) {
      setError('Upload failed');
    }
  };

  return (
    <div data-testid="receipt-upload">
      <h3>Upload Payment Receipt</h3>
      <input type="file" data-testid="file-input" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} data-testid="upload-button">
        Upload Receipt
      </button>

      {uploadedFile && <div data-testid="file-name">Selected: {uploadedFile.name}</div>}
      {success && <div data-testid="success-message">{success}</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock PaymentStatusUpdate component
const PaymentStatusUpdate = ({ booking }: { booking: any }) => {
  const [status, setStatus] = React.useState(booking.payment_status);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [seatReleased, setSeatReleased] = React.useState(false);
  const [seatRebooked, setSeatRebooked] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setError('');
    setSuccess('');
    setSeatReleased(false);
    setSeatRebooked(false);

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      Pending: ['Paid', 'Failed'],
      Failed: ['Paid'],
      Paid: ['Refunded'],
      Refunded: [], // Cannot transition from Refunded
    };

    if (!validTransitions[status]?.includes(newStatus)) {
      setError('Invalid transition');
      return;
    }

    try {
      // Update payment status
      await mockUpdatePaymentStatus(booking.booking_id, newStatus);

      // Handle seat management based on status change
      if (status === 'Pending' && newStatus === 'Failed') {
        // Release seat after X hours (simulated immediately)
        await mockReleaseSeat(booking.booking_id);
        setSeatReleased(true);
      }

      if (status === 'Failed' && newStatus === 'Paid') {
        // Try to re-book seat if available
        const rebookResult = await mockRebookSeat(booking.booking_id);
        if (rebookResult.success) {
          setSeatRebooked(true);
        } else {
          setError('Seat no longer available');
          return;
        }
      }

      setStatus(newStatus);
      setSuccess(`Status updated to ${newStatus}`);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div data-testid="payment-status-update">
      <h3>Update Payment Status</h3>
      <div data-testid="current-status">Current Status: {status}</div>

      <div>
        <button onClick={() => handleStatusChange('Paid')} data-testid="set-paid-button">
          Set to Paid
        </button>
        <button onClick={() => handleStatusChange('Failed')} data-testid="set-failed-button">
          Set to Failed
        </button>
        <button onClick={() => handleStatusChange('Pending')} data-testid="set-pending-button">
          Set to Pending
        </button>
      </div>

      {seatReleased && <div data-testid="seat-released">Seat released</div>}
      {seatRebooked && <div data-testid="seat-rebooked">Seat re-booked successfully</div>}
      {success && <div data-testid="success-message">{success}</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock PaymentReminder component
const PaymentReminder = ({ booking }: { booking: any }) => {
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSendReminder = async () => {
    setSending(true);
    setError('');
    setSent(false);

    try {
      await mockSendPaymentReminder(booking.customer_email, {
        booking_id: booking.booking_id,
        amount_due: booking.total_amount,
        due_date: booking.payment_due_date,
      });
      setSent(true);
    } catch (err) {
      setError('Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="payment-reminder">
      <h3>Payment Reminder</h3>
      <div>Customer: {booking.customer_email}</div>
      <div>Amount Due: ${booking.total_amount}</div>

      <button onClick={handleSendReminder} disabled={sending} data-testid="send-reminder-button">
        {sending ? 'Sending...' : 'Send Reminder'}
      </button>

      {sent && <div data-testid="reminder-sent">Reminder email sent to customer</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock PartialPayment component
const PartialPayment = ({ booking }: { booking: any }) => {
  const [amount, setAmount] = React.useState(0);
  const [status, setStatus] = React.useState(booking.payment_status);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [warning, setWarning] = React.useState('');
  const [creditRecorded, setCreditRecorded] = React.useState(false);

  const handlePayment = async () => {
    setError('');
    setSuccess('');
    setWarning('');
    setCreditRecorded(false);

    try {
      if (amount < booking.total_amount) {
        // Partial payment
        await mockProcessPartialPayment(booking.booking_id, amount);
        setStatus('Partially Paid');
        setSuccess(`Partial payment of $${amount} recorded`);
      } else if (amount > booking.total_amount) {
        // Over payment
        const overpayment = amount - booking.total_amount;
        setWarning(`Overpayment of $${overpayment.toFixed(2)}`);

        // Record credit
        await mockRecordCredit(booking.customer_id, overpayment);
        setCreditRecorded(true);

        await mockMarkAsPaid(booking.booking_id, mockAgent.agent_id);
        setStatus('Paid');
        setSuccess(`Payment recorded with $${overpayment.toFixed(2)} credit`);
      } else {
        // Exact payment
        await mockMarkAsPaid(booking.booking_id, mockAgent.agent_id);
        setStatus('Paid');
        setSuccess('Payment completed');
      }
    } catch (err) {
      setError('Payment processing failed');
    }
  };

  return (
    <div data-testid="partial-payment">
      <h3>Process Payment</h3>
      <div>Total Amount: ${booking.total_amount}</div>
      <div data-testid="payment-status">Status: {status}</div>

      <div>
        <label>Payment Amount:</label>
        <input
          type="number"
          data-testid="amount-input"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        />
      </div>

      <button onClick={handlePayment} data-testid="process-payment-button">
        Process Payment
      </button>

      {warning && <div data-testid="warning-message">{warning}</div>}
      {creditRecorded && <div data-testid="credit-recorded">Credit recorded for customer</div>}
      {success && <div data-testid="success-message">{success}</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock PaymentAuditLog component
const PaymentAuditLog = ({ bookingId }: { bookingId: string }) => {
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadLogs = async () => {
      const data = await mockGetPaymentLogs(bookingId);
      setLogs(data);
    };
    loadLogs();
  }, [bookingId]);

  return (
    <div data-testid="payment-audit-log">
      <h3>Payment Audit Trail</h3>
      {logs.map((log, idx) => (
        <div key={idx} data-testid={`log-entry-${idx}`}>
          {log.action}
        </div>
      ))}
    </div>
  );
};

// Mock CashPayment component
const CashPayment = ({ booking }: { booking: any }) => {
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [cashReceived, setCashReceived] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const handleCashPayment = async () => {
    if (paymentMethod === 'Cash') {
      setCashReceived(true);
    }
  };

  const handleConfirmReceipt = async () => {
    await mockMarkAsPaid(booking.booking_id, mockAgent.agent_id);
    await mockLogPaymentAction(
      booking.booking_id,
      `Cash payment received at counter by ${mockAgent.name}`
    );
    setConfirmed(true);
  };

  return (
    <div data-testid="cash-payment">
      <h3>Cash Payment Processing</h3>
      <div>Amount Due: ${booking.total_amount}</div>

      <div>
        <label>Payment Method:</label>
        <select
          data-testid="payment-method-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="">Select Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Transfer">Bank Transfer</option>
        </select>
      </div>

      <button onClick={handleCashPayment} data-testid="receive-cash-button">
        Receive Payment
      </button>

      {cashReceived && (
        <div data-testid="cash-received">
          <div>Cash received at counter</div>
          <button onClick={handleConfirmReceipt} data-testid="confirm-receipt-button">
            Confirm Receipt of Cash
          </button>
        </div>
      )}

      {confirmed && <div data-testid="payment-confirmed">Cash payment confirmed</div>}
    </div>
  );
};

describe('TC-AGT-PAY: Agent Payment Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AGT-PAY-001: Verify Payment - Manual Confirm
   * Business Requirement: BR44
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Status -> Paid. Seat -> Booked.
   */
  it('TC-AGT-PAY-001: should mark payment as paid and update seat to booked', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-001',
      payment_status: 'Pending',
      seat_status: 'Reserved',
    };

    mockMarkAsPaid.mockResolvedValue({ success: true });
    mockLogPaymentAction.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PaymentVerification booking={booking} agent={mockAgent} />);

    // Assert - Initial status is Pending
    expect(screen.getByTestId('payment-status')).toHaveTextContent('Payment Status: Pending');
    expect(screen.getByTestId('seat-status')).toHaveTextContent('Seat Status: Reserved');

    // Act - Click "Mark as Paid"
    await user.click(screen.getByTestId('mark-paid-button'));

    // Assert - Payment status updated to Paid
    await waitFor(() => {
      expect(screen.getByTestId('payment-status')).toHaveTextContent('Payment Status: Paid');
    });

    // Assert - Seat status updated to Booked
    expect(screen.getByTestId('seat-status')).toHaveTextContent('Seat Status: Booked');

    // Assert - API called
    expect(mockMarkAsPaid).toHaveBeenCalledWith('BK-001', 'AGT-001');

    // Assert - Action logged
    expect(mockLogPaymentAction).toHaveBeenCalledWith('BK-001', 'Agent Agent Smith updated payment');

    // Assert - Success message
    expect(screen.getByTestId('success-message')).toHaveTextContent('Payment marked as paid');
  });

  /**
   * TC-AGT-PAY-002: Verify Payment - Upload Receipt
   * Note: UI
   * 
   * Test Data: File
   * 
   * Expected Result:
   * Image saved to booking record.
   */
  it('TC-AGT-PAY-002: should upload banking receipt image and save to booking record', async () => {
    // Arrange
    const receiptFile = new File(['receipt-image-data'], 'receipt.jpg', { type: 'image/jpeg' });

    mockUploadReceipt.mockResolvedValue({ success: true, file_url: '/receipts/receipt.jpg' });

    const user = userEvent.setup();
    render(<ReceiptUpload bookingId="BK-001" />);

    // Act - Upload receipt file
    const fileInput = screen.getByTestId('file-input');
    await user.upload(fileInput, receiptFile);

    // Assert - File selected
    expect(await screen.findByTestId('file-name')).toHaveTextContent('Selected: receipt.jpg');

    // Act - Click upload button
    await user.click(screen.getByTestId('upload-button'));

    // Assert - Upload API called with correct file
    await waitFor(() => {
      expect(mockUploadReceipt).toHaveBeenCalledWith('BK-001', receiptFile);
    });

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent(
      'Receipt uploaded successfully'
    );
  });

  /**
   * TC-AGT-PAY-003: Update Payment - Pending to Failed
   * Business Requirement: BR47
   * 
   * Test Data: Status
   * 
   * Expected Result:
   * System releases seat after X hours.
   */
  it('TC-AGT-PAY-003: should release seat when changing payment status from Pending to Failed', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-002',
      payment_status: 'Pending',
    };

    mockUpdatePaymentStatus.mockResolvedValue({ success: true });
    mockReleaseSeat.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PaymentStatusUpdate booking={booking} />);

    // Assert - Current status is Pending
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Pending');

    // Act - Change status to Failed
    await user.click(screen.getByTestId('set-failed-button'));

    // Assert - Payment status updated
    await waitFor(() => {
      expect(mockUpdatePaymentStatus).toHaveBeenCalledWith('BK-002', 'Failed');
    });

    // Assert - Seat released
    expect(mockReleaseSeat).toHaveBeenCalledWith('BK-002');
    expect(await screen.findByTestId('seat-released')).toHaveTextContent('Seat released');

    // Assert - Success message
    expect(screen.getByTestId('success-message')).toHaveTextContent('Status updated to Failed');

    // Assert - Current status shows Failed
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Failed');
  });

  /**
   * TC-AGT-PAY-004: Update Payment - Failed to Paid
   * Business Requirement: BR47
   * 
   * Test Data: Status
   * 
   * Expected Result:
   * Re-book seat (if available).
   */
  it('TC-AGT-PAY-004: should re-book seat when changing payment status from Failed to Paid', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-003',
      payment_status: 'Failed',
    };

    mockUpdatePaymentStatus.mockResolvedValue({ success: true });
    mockRebookSeat.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PaymentStatusUpdate booking={booking} />);

    // Assert - Current status is Failed
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Failed');

    // Act - Change status to Paid
    await user.click(screen.getByTestId('set-paid-button'));

    // Assert - Payment status updated
    await waitFor(() => {
      expect(mockUpdatePaymentStatus).toHaveBeenCalledWith('BK-003', 'Paid');
    });

    // Assert - Seat re-booked
    expect(mockRebookSeat).toHaveBeenCalledWith('BK-003');
    expect(await screen.findByTestId('seat-rebooked')).toHaveTextContent(
      'Seat re-booked successfully'
    );

    // Assert - Success message
    expect(screen.getByTestId('success-message')).toHaveTextContent('Status updated to Paid');

    // Assert - Current status shows Paid
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Paid');
  });

  /**
   * TC-AGT-PAY-005: Update Payment - Invalid Flow
   * Business Requirement: BR46
   * 
   * Test Data: Status: Refunded -> Pending
   * 
   * Expected Result:
   * Error "Invalid transition".
   */
  it('TC-AGT-PAY-005: should display error for invalid status transition from Refunded to Pending', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-004',
      payment_status: 'Refunded',
    };

    const user = userEvent.setup();
    render(<PaymentStatusUpdate booking={booking} />);

    // Assert - Current status is Refunded
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Refunded');

    // Act - Attempt to change to Pending (invalid transition)
    await user.click(screen.getByTestId('set-pending-button'));

    // Assert - Error "Invalid transition"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Invalid transition');

    // Assert - Status update not called
    expect(mockUpdatePaymentStatus).not.toHaveBeenCalled();

    // Assert - Status remains Refunded
    expect(screen.getByTestId('current-status')).toHaveTextContent('Current Status: Refunded');
  });

  /**
   * TC-AGT-PAY-006: Verify Payment - Reminder Email
   * Business Requirement: BR44
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Email sent to customer.
   */
  it('TC-AGT-PAY-006: should send payment reminder email to customer', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-005',
      customer_email: 'customer@test.com',
      total_amount: 500,
      payment_due_date: '2025-12-31',
    };

    mockSendPaymentReminder.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PaymentReminder booking={booking} />);

    // Assert - Customer info displayed
    expect(screen.getByText('Customer: customer@test.com')).toBeInTheDocument();
    expect(screen.getByText('Amount Due: $500')).toBeInTheDocument();

    // Act - Click "Send Reminder"
    await user.click(screen.getByTestId('send-reminder-button'));

    // Assert - Reminder API called with correct data
    await waitFor(() => {
      expect(mockSendPaymentReminder).toHaveBeenCalledWith('customer@test.com', {
        booking_id: 'BK-005',
        amount_due: 500,
        due_date: '2025-12-31',
      });
    });

    // Assert - Success message
    expect(await screen.findByTestId('reminder-sent')).toHaveTextContent(
      'Reminder email sent to customer'
    );
  });

  /**
   * TC-AGT-PAY-007: Verify Payment - Partial Payment
   * Note: Edge
   * 
   * Test Data: Amt: 50%
   * 
   * Expected Result:
   * Status -> Partially Paid.
   */
  it('TC-AGT-PAY-007: should process partial payment and set status to Partially Paid', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-006',
      customer_id: 'CUST-001',
      total_amount: 1000,
      payment_status: 'Pending',
    };

    mockProcessPartialPayment.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PartialPayment booking={booking} />);

    // Assert - Total amount displayed
    expect(screen.getByText('Total Amount: $1000')).toBeInTheDocument();

    // Act - Enter 50% payment (500)
    await user.clear(screen.getByTestId('amount-input'));
    await user.type(screen.getByTestId('amount-input'), '500');

    // Act - Process payment
    await user.click(screen.getByTestId('process-payment-button'));

    // Assert - Partial payment processed
    await waitFor(() => {
      expect(mockProcessPartialPayment).toHaveBeenCalledWith('BK-006', 500);
    });

    // Assert - Status updated to Partially Paid
    expect(screen.getByTestId('payment-status')).toHaveTextContent('Status: Partially Paid');

    // Assert - Success message
    expect(screen.getByTestId('success-message')).toHaveTextContent(
      'Partial payment of $500 recorded'
    );
  });

  /**
   * TC-AGT-PAY-008: Verify Payment - Over Payment
   * Note: Edge
   * 
   * Test Data: Amt: 110%
   * 
   * Expected Result:
   * Warning or Credit Record.
   */
  it('TC-AGT-PAY-008: should display warning and record credit for overpayment', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-007',
      customer_id: 'CUST-002',
      total_amount: 1000,
      payment_status: 'Pending',
    };

    mockRecordCredit.mockResolvedValue({ success: true });
    mockMarkAsPaid.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<PartialPayment booking={booking} />);

    // Act - Enter 110% payment (1100)
    await user.clear(screen.getByTestId('amount-input'));
    await user.type(screen.getByTestId('amount-input'), '1100');

    // Act - Process payment
    await user.click(screen.getByTestId('process-payment-button'));

    // Assert - Warning for overpayment
    await waitFor(() => {
      expect(screen.getByTestId('warning-message')).toHaveTextContent('Overpayment of $100.00');
    });

    // Assert - Credit recorded
    expect(mockRecordCredit).toHaveBeenCalledWith('CUST-002', 100);
    expect(screen.getByTestId('credit-recorded')).toHaveTextContent('Credit recorded for customer');

    // Assert - Payment marked as paid
    expect(mockMarkAsPaid).toHaveBeenCalledWith('BK-007', 'AGT-001');

    // Assert - Status updated to Paid
    expect(screen.getByTestId('payment-status')).toHaveTextContent('Status: Paid');

    // Assert - Success message with credit info
    expect(screen.getByTestId('success-message')).toHaveTextContent(
      'Payment recorded with $100.00 credit'
    );
  });

  /**
   * TC-AGT-PAY-009: Payment Log - Audit Trail
   * Note: Sec
   * 
   * Test Data: View
   * 
   * Expected Result:
   * "Agent [Name] updated payment" logged.
   */
  it('TC-AGT-PAY-009: should display audit trail with agent payment update log', async () => {
    // Arrange
    mockGetPaymentLogs.mockResolvedValue([
      { action: 'Booking created' },
      { action: 'Payment pending' },
      { action: 'Agent Agent Smith updated payment' },
      { action: 'Payment confirmed' },
    ]);

    render(<PaymentAuditLog bookingId="BK-008" />);

    // Assert - Audit log loaded
    await waitFor(() => {
      expect(mockGetPaymentLogs).toHaveBeenCalledWith('BK-008');
    });

    // Assert - Agent payment update logged
    expect(await screen.findByTestId('log-entry-2')).toHaveTextContent(
      'Agent Agent Smith updated payment'
    );

    // Assert - All log entries displayed
    expect(screen.getByTestId('log-entry-0')).toHaveTextContent('Booking created');
    expect(screen.getByTestId('log-entry-1')).toHaveTextContent('Payment pending');
    expect(screen.getByTestId('log-entry-3')).toHaveTextContent('Payment confirmed');
  });

  /**
   * TC-AGT-PAY-010: Verify Payment - Cash Handling
   * Note: Biz
   * 
   * Test Data: Method: Cash
   * 
   * Expected Result:
   * Confirm receipt of cash at counter.
   */
  it('TC-AGT-PAY-010: should confirm receipt of cash payment at counter', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-009',
      total_amount: 800,
    };

    mockMarkAsPaid.mockResolvedValue({ success: true });
    mockLogPaymentAction.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<CashPayment booking={booking} />);

    // Assert - Amount displayed
    expect(screen.getByText('Amount Due: $800')).toBeInTheDocument();

    // Act - Select "Cash" payment method
    await user.selectOptions(screen.getByTestId('payment-method-select'), 'Cash');

    // Act - Receive payment
    await user.click(screen.getByTestId('receive-cash-button'));

    // Assert - Cash received message displayed
    expect(await screen.findByTestId('cash-received')).toHaveTextContent('Cash received at counter');

    // Act - Confirm receipt of cash
    await user.click(screen.getByTestId('confirm-receipt-button'));

    // Assert - Payment marked as paid
    await waitFor(() => {
      expect(mockMarkAsPaid).toHaveBeenCalledWith('BK-009', 'AGT-001');
    });

    // Assert - Cash receipt logged
    expect(mockLogPaymentAction).toHaveBeenCalledWith(
      'BK-009',
      'Cash payment received at counter by Agent Smith'
    );

    // Assert - Payment confirmed
    expect(await screen.findByTestId('payment-confirmed')).toHaveTextContent(
      'Cash payment confirmed'
    );
  });
});
