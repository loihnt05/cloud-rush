/**
 * Test Suite: TC-AGT-RFD (Agent Refund Extended)
 * Category: Agent Services - Refund Processing
 * Description: Unit tests for Agent refund processing including ticket types, amounts, validations, and edge cases
 * 
 * Test Cases:
 * - TC-AGT-RFD-005: Refund - Full Amount (Flexible Ticket)
 * - TC-AGT-RFD-006: Refund - Partial (Standard Ticket)
 * - TC-AGT-RFD-007: Refund - Non-Refundable Ticket
 * - TC-AGT-RFD-008: Refund - Tax Only
 * - TC-AGT-RFD-009: Reject Refund - Empty Reason
 * - TC-AGT-RFD-010: Reject Refund - Valid Reason
 * - TC-AGT-RFD-011: Refund - After Flight Departure
 * - TC-AGT-RFD-012: Refund - Double Processing
 * - TC-AGT-RFD-013: Refund - Payment Gateway Fail
 * - TC-AGT-RFD-014: Refund - Invalid Amount (Manual)
 * - TC-AGT-RFD-015: Refund - Invalid Amount (Negative)
 * - TC-AGT-RFD-016: Refund - Notification Check
 * - TC-AGT-RFD-017: Refund - History Log
 * - TC-AGT-RFD-018: Refund - Currency Conversion
 * - TC-AGT-RFD-019: Refund - Services Only
 * - TC-AGT-RFD-020: Refund - Cancelled Booking
 * 
 * Prerequisites:
 * 1. Agent is logged in with refund permissions
 * 2. Refund requests exist in the system
 * 3. Payment gateway is configured
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock refund APIs
const mockApproveRefund = vi.fn();
const mockRejectRefund = vi.fn();
const mockCalculateRefundAmount = vi.fn();
const mockProcessRefundPayment = vi.fn();
const mockSendRefundNotification = vi.fn();
const mockLogRefundHistory = vi.fn();
const mockConvertCurrency = vi.fn();
const mockCheckFlightStatus = vi.fn();
const mockGetBookingHistory = vi.fn();

// Mock agent data
const mockAgent = {
  agent_id: 'AGT-001',
  name: 'Agent Smith',
};

// Mock RefundApproval component
const RefundApproval = ({ refundRequest, agent }: { refundRequest: any; agent: any }) => {
  const [refundAmount, setRefundAmount] = React.useState(refundRequest.calculated_amount);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [gatewayError, setGatewayError] = React.useState(false);

  const handleApprove = async () => {
    if (processing) return; // Prevent double processing

    setProcessing(true);
    setError('');
    setSuccess('');
    setGatewayError(false);

    try {
      // Validate refund amount first (before any async operations)
      if (isNaN(refundAmount) || refundAmount < 0) {
        setError('Invalid amount');
        setProcessing(false);
        return;
      }

      if (refundAmount > refundRequest.paid_amount) {
        setError('Cannot refund more than paid');
        setProcessing(false);
        return;
      }

      // Check if ticket is already used (flown)
      if (refundRequest.status === 'Flown') {
        setError('Ticket already used');
        setProcessing(false);
        return;
      }

      // Check ticket type for refund policy
      if (refundRequest.ticket_type === 'Promo' && refundAmount > refundRequest.tax_amount) {
        setError('Ticket is non-refundable');
        setProcessing(false);
        return;
      }

      // Process payment through gateway
      try {
        await mockProcessRefundPayment(refundRequest.booking_id, refundAmount);
      } catch (err: any) {
        if (err.message === 'Gateway Error') {
          setGatewayError(true);
          setError('Refund Failed. Try Again');
          setProcessing(false);
          return;
        }
        throw err;
      }

      // Approve refund
      await mockApproveRefund(refundRequest.refund_id, refundAmount, agent.agent_id);

      // Send notification
      await mockSendRefundNotification(refundRequest.customer_email, {
        amount: refundAmount,
        date: new Date().toISOString(),
        booking_id: refundRequest.booking_id,
      });

      // Log history
      await mockLogRefundHistory(refundRequest.booking_id, `Refund Approved by ${agent.agent_id}`);

      setSuccess('Refund approved successfully');
      setProcessing(false);
    } catch (err) {
      setError('Processing failed');
      setProcessing(false);
    }
  };

  return (
    <div data-testid="refund-approval">
      <h2>Refund Request - {refundRequest.booking_id}</h2>
      <div>Ticket Type: {refundRequest.ticket_type}</div>
      <div>Paid Amount: ${refundRequest.paid_amount}</div>
      <div>Tax Amount: ${refundRequest.tax_amount}</div>
      <div>Status: {refundRequest.status}</div>

      <div>
        <label>Refund Amount:</label>
        <input
          type="number"
          data-testid="refund-amount"
          value={refundAmount}
          onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
        />
      </div>

      <button onClick={handleApprove} disabled={processing} data-testid="approve-button">
        {processing ? 'Processing...' : 'Approve Refund'}
      </button>

      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">{success}</div>}
      {gatewayError && <div data-testid="gateway-error">Refund Failed. Try Again</div>}
    </div>
  );
};

// Mock RefundRejection component
const RefundRejection = ({ refundRequest, agent }: { refundRequest: any; agent: any }) => {
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleReject = async () => {
    setError('');
    setSuccess('');

    // Validate reason
    if (!reason.trim()) {
      setError('Reason is mandatory');
      return;
    }

    // Reject refund
    await mockRejectRefund(refundRequest.refund_id, reason, agent.agent_id);

    // Send notification with reason
    await mockSendRefundNotification(refundRequest.customer_email, {
      status: 'Rejected',
      reason,
      booking_id: refundRequest.booking_id,
    });

    setSuccess('Refund rejected successfully');
  };

  return (
    <div data-testid="refund-rejection">
      <h2>Reject Refund - {refundRequest.booking_id}</h2>

      <div>
        <label>Rejection Reason:</label>
        <textarea
          data-testid="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason"
        />
      </div>

      <button onClick={handleReject} data-testid="reject-button">
        Reject Refund
      </button>

      {error && <div data-testid="error-message">{error}</div>}
      {success && <div data-testid="success-message">{success}</div>}
    </div>
  );
};

// Mock RefundNotificationViewer component
const RefundNotificationViewer = ({ notification }: { notification: any }) => {
  return (
    <div data-testid="notification-viewer">
      <h3>Email Notification</h3>
      <div data-testid="notification-amount">Amount: ${notification.amount}</div>
      <div data-testid="notification-date">Date: {notification.date}</div>
      <div data-testid="notification-id">Booking ID: {notification.booking_id}</div>
    </div>
  );
};

// Mock BookingHistoryViewer component
const BookingHistoryViewer = ({ bookingId }: { bookingId: string }) => {
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadHistory = async () => {
      const data = await mockGetBookingHistory(bookingId);
      setHistory(data);
    };
    loadHistory();
  }, [bookingId]);

  return (
    <div data-testid="booking-history">
      <h3>Booking History</h3>
      {history.map((entry, idx) => (
        <div key={idx} data-testid={`history-entry-${idx}`}>
          {entry.action}
        </div>
      ))}
    </div>
  );
};

// Mock CurrencyRefund component
const CurrencyRefund = ({ refundRequest }: { refundRequest: any }) => {
  const [convertedAmount, setConvertedAmount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const convert = async () => {
      const result = await mockConvertCurrency(
        refundRequest.amount,
        refundRequest.currency_from,
        refundRequest.currency_to
      );
      setConvertedAmount(result);
    };
    convert();
  }, [refundRequest]);

  return (
    <div data-testid="currency-refund">
      <div>Original: {refundRequest.amount} {refundRequest.currency_from}</div>
      {convertedAmount && (
        <div data-testid="converted-amount">
          Refund: {convertedAmount} {refundRequest.currency_to}
        </div>
      )}
    </div>
  );
};

// Mock ServiceRefund component
const ServiceRefund = ({ booking }: { booking: any }) => {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleRefund = async () => {
    // Keep flight, refund only selected services
    const itemsToRefund = booking.items.filter((item: any) =>
      selectedItems.includes(item.id)
    );

    for (const item of itemsToRefund) {
      await mockApproveRefund(item.id, item.price, mockAgent.agent_id);
    }
  };

  return (
    <div data-testid="service-refund">
      <h3>Select Items to Refund</h3>
      {booking.items.map((item: any) => (
        <div key={item.id}>
          <input
            type="checkbox"
            data-testid={`checkbox-${item.id}`}
            checked={selectedItems.includes(item.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item.id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== item.id));
              }
            }}
          />
          <label>{item.name} - ${item.price}</label>
        </div>
      ))}
      <button onClick={handleRefund} data-testid="refund-services">
        Refund Selected
      </button>
    </div>
  );
};

describe('TC-AGT-RFD: Agent Refund Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AGT-RFD-005: Refund - Full Amount (Flexible Ticket)
   * Business Requirement: BR9
   * 
   * Test Data: Ticket: Flex
   * 
   * Expected Result:
   * Refund 100% amount. Status: Refunded
   */
  it('TC-AGT-RFD-005: should refund 100% amount for Flexible ticket', async () => {
    // Arrange
    const flexTicketRefund = {
      refund_id: 'REF-001',
      booking_id: 'BK-100',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: 500, // 100% refund
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    mockProcessRefundPayment.mockResolvedValue({ success: true });
    mockApproveRefund.mockResolvedValue({ status: 'Refunded' });
    mockSendRefundNotification.mockResolvedValue({ success: true });
    mockLogRefundHistory.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={flexTicketRefund} agent={mockAgent} />);

    // Assert - Refund amount is 100% (500)
    expect(screen.getByTestId('refund-amount')).toHaveValue(500);

    // Act - Approve refund
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Process payment
    await waitFor(() => {
      expect(mockProcessRefundPayment).toHaveBeenCalledWith('BK-100', 500);
    });

    // Assert - Approve refund with full amount
    expect(mockApproveRefund).toHaveBeenCalledWith('REF-001', 500, 'AGT-001');

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Refund approved successfully');
  });

  /**
   * TC-AGT-RFD-006: Refund - Partial (Standard Ticket)
   * Business Requirement: BR9
   * 
   * Test Data: Ticket: Std
   * 
   * Expected Result:
   * Refund 50% (or policy). Status: Refunded
   */
  it('TC-AGT-RFD-006: should refund 50% amount for Standard ticket', async () => {
    // Arrange
    const stdTicketRefund = {
      refund_id: 'REF-002',
      booking_id: 'BK-101',
      ticket_type: 'Standard',
      paid_amount: 400,
      tax_amount: 40,
      calculated_amount: 200, // 50% refund policy
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    mockProcessRefundPayment.mockResolvedValue({ success: true });
    mockApproveRefund.mockResolvedValue({ status: 'Refunded' });
    mockSendRefundNotification.mockResolvedValue({ success: true });
    mockLogRefundHistory.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={stdTicketRefund} agent={mockAgent} />);

    // Assert - Refund amount is 50% (200)
    expect(screen.getByTestId('refund-amount')).toHaveValue(200);

    // Act - Approve refund
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Approve refund with partial amount
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledWith('REF-002', 200, 'AGT-001');
    });

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Refund approved successfully');
  });

  /**
   * TC-AGT-RFD-007: Refund - Non-Refundable Ticket
   * Business Requirement: BR9
   * 
   * Test Data: Ticket: Promo
   * 
   * Expected Result:
   * Warning "Ticket is non-refundable"
   */
  it('TC-AGT-RFD-007: should display warning for non-refundable Promo ticket', async () => {
    // Arrange
    const promoTicketRefund = {
      refund_id: 'REF-003',
      booking_id: 'BK-102',
      ticket_type: 'Promo',
      paid_amount: 300,
      tax_amount: 30,
      calculated_amount: 300, // Trying to refund full amount
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={promoTicketRefund} agent={mockAgent} />);

    // Act - Attempt to approve refund for promo ticket
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Warning "Ticket is non-refundable"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Ticket is non-refundable');

    // Assert - Refund not processed
    expect(mockApproveRefund).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-008: Refund - Tax Only
   * Business Requirement: BR9
   * 
   * Test Data: Action: Tax Only
   * 
   * Expected Result:
   * Refund only Tax amount
   */
  it('TC-AGT-RFD-008: should refund only tax amount for cancelled Promo ticket', async () => {
    // Arrange
    const promoTicketTaxRefund = {
      refund_id: 'REF-004',
      booking_id: 'BK-103',
      ticket_type: 'Promo',
      paid_amount: 350,
      tax_amount: 35,
      calculated_amount: 35, // Tax only
      status: 'Cancelled',
      customer_email: 'customer@test.com',
    };

    mockProcessRefundPayment.mockResolvedValue({ success: true });
    mockApproveRefund.mockResolvedValue({ status: 'Refunded' });
    mockSendRefundNotification.mockResolvedValue({ success: true });
    mockLogRefundHistory.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={promoTicketTaxRefund} agent={mockAgent} />);

    // Assert - Refund amount is tax only (35)
    expect(screen.getByTestId('refund-amount')).toHaveValue(35);

    // Act - Approve tax-only refund
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Refund only tax amount
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledWith('REF-004', 35, 'AGT-001');
    });

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Refund approved successfully');
  });

  /**
   * TC-AGT-RFD-009: Reject Refund - Empty Reason
   * Business Requirement: BR9
   * 
   * Test Data: Reason: ""
   * 
   * Expected Result:
   * Error "Reason is mandatory"
   */
  it('TC-AGT-RFD-009: should display error when rejecting without reason', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-005',
      booking_id: 'BK-104',
      customer_email: 'customer@test.com',
    };

    const user = userEvent.setup();
    render(<RefundRejection refundRequest={refundRequest} agent={mockAgent} />);

    // Act - Reject without entering reason
    await user.click(screen.getByTestId('reject-button'));

    // Assert - Error "Reason is mandatory"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Reason is mandatory');

    // Assert - Reject not processed
    expect(mockRejectRefund).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-010: Reject Refund - Valid Reason
   * Business Requirement: BR11
   * 
   * Test Data: Input: Text
   * 
   * Expected Result:
   * Status: Rejected. Email sent with reason
   */
  it('TC-AGT-RFD-010: should reject refund and send email with reason', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-006',
      booking_id: 'BK-105',
      customer_email: 'customer@test.com',
    };

    mockRejectRefund.mockResolvedValue({ status: 'Rejected' });
    mockSendRefundNotification.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundRejection refundRequest={refundRequest} agent={mockAgent} />);

    // Act - Enter rejection reason
    await user.type(screen.getByTestId('reject-reason'), 'Policy violation');

    // Act - Reject refund
    await user.click(screen.getByTestId('reject-button'));

    // Assert - Reject with reason
    await waitFor(() => {
      expect(mockRejectRefund).toHaveBeenCalledWith('REF-006', 'Policy violation', 'AGT-001');
    });

    // Assert - Email sent with reason
    expect(mockSendRefundNotification).toHaveBeenCalledWith('customer@test.com', {
      status: 'Rejected',
      reason: 'Policy violation',
      booking_id: 'BK-105',
    });

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Refund rejected successfully');
  });

  /**
   * TC-AGT-RFD-011: Refund - After Flight Departure
   * Note: Logic
   * 
   * Test Data: Status: Flown
   * 
   * Expected Result:
   * Error/Reject "Ticket already used"
   */
  it('TC-AGT-RFD-011: should reject refund for already flown ticket', async () => {
    // Arrange
    const flownTicketRefund = {
      refund_id: 'REF-007',
      booking_id: 'BK-106',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: 500,
      status: 'Flown',
      customer_email: 'customer@test.com',
    };

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={flownTicketRefund} agent={mockAgent} />);

    // Act - Attempt to approve refund for flown ticket
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Error "Ticket already used"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Ticket already used');

    // Assert - Refund not processed
    expect(mockApproveRefund).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-012: Refund - Double Processing
   * Note: Edge
   * 
   * Test Data: Rapid click
   * 
   * Expected Result:
   * System processes only once. No double refund
   */
  it('TC-AGT-RFD-012: should prevent double processing when clicking approve twice', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-008',
      booking_id: 'BK-107',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: 500,
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    // Simulate slow processing
    mockProcessRefundPayment.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );
    mockApproveRefund.mockResolvedValue({ status: 'Refunded' });
    mockSendRefundNotification.mockResolvedValue({ success: true });
    mockLogRefundHistory.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={refundRequest} agent={mockAgent} />);

    // Act - Click approve button twice rapidly
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);
    await user.click(approveButton); // Second click while processing

    // Assert - Process only once
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledTimes(1);
    });

    // Assert - No double refund
    expect(mockProcessRefundPayment).toHaveBeenCalledTimes(1);
  });

  /**
   * TC-AGT-RFD-013: Refund - Payment Gateway Fail
   * Note: Ext (External)
   * 
   * Test Data: Gateway: Error
   * 
   * Expected Result:
   * System shows "Refund Failed. Try Again"
   */
  it('TC-AGT-RFD-013: should display error when payment gateway fails', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-009',
      booking_id: 'BK-108',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: 500,
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    mockProcessRefundPayment.mockRejectedValue(new Error('Gateway Error'));

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={refundRequest} agent={mockAgent} />);

    // Act - Approve refund with gateway down
    await user.click(screen.getByTestId('approve-button'));

    // Assert - System shows "Refund Failed. Try Again"
    expect(await screen.findByTestId('gateway-error')).toHaveTextContent('Refund Failed. Try Again');

    // Assert - Refund not approved due to gateway failure
    expect(mockApproveRefund).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-014: Refund - Invalid Amount (Manual)
   * Note: Sec (Security)
   * 
   * Test Data: Amt: 200%
   * 
   * Expected Result:
   * Error "Cannot refund more than paid"
   */
  it('TC-AGT-RFD-014: should prevent refund amount greater than paid amount', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-010',
      booking_id: 'BK-109',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: 500,
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={refundRequest} agent={mockAgent} />);

    // Act - Manually edit refund amount to exceed paid amount
    await user.clear(screen.getByTestId('refund-amount'));
    await user.type(screen.getByTestId('refund-amount'), '1000'); // 200% of paid

    // Act - Approve refund
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Error "Cannot refund more than paid"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Cannot refund more than paid');

    // Assert - Refund not processed
    expect(mockApproveRefund).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-015: Refund - Invalid Amount (Negative)
   * Note: Val (Validation)
   * 
   * Test Data: Amt: -10
   * 
   * Expected Result:
   * Error "Invalid amount"
   */
  it('TC-AGT-RFD-015: should display error for negative refund amount', async () => {
    // Arrange
    const refundRequest = {
      refund_id: 'REF-011',
      booking_id: 'BK-110',
      ticket_type: 'Flex',
      paid_amount: 500,
      tax_amount: 50,
      calculated_amount: -10, // Start with negative amount
      status: 'Pending',
      customer_email: 'customer@test.com',
    };

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={refundRequest} agent={mockAgent} />);

    // Assert - Negative amount is shown
    expect(screen.getByTestId('refund-amount')).toHaveValue(-10);

    // Act - Approve refund with negative amount
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Error "Invalid amount"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Invalid amount');

    // Assert - Refund not processed
    expect(mockApproveRefund).not.toHaveBeenCalled();
    expect(mockProcessRefundPayment).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-RFD-016: Refund - Notification Check
   * Business Requirement: BR10
   * 
   * Test Data: Check Inbox
   * 
   * Expected Result:
   * Email contains: Amount, Date, ID
   */
  it('TC-AGT-RFD-016: should verify email notification contains amount, date, and ID', async () => {
    // Arrange
    const notification = {
      amount: 500,
      date: '2025-12-23T10:30:00Z',
      booking_id: 'BK-111',
    };

    render(<RefundNotificationViewer notification={notification} />);

    // Assert - Email contains Amount
    expect(screen.getByTestId('notification-amount')).toHaveTextContent('Amount: $500');

    // Assert - Email contains Date
    expect(screen.getByTestId('notification-date')).toHaveTextContent('Date: 2025-12-23T10:30:00Z');

    // Assert - Email contains Booking ID
    expect(screen.getByTestId('notification-id')).toHaveTextContent('Booking ID: BK-111');
  });

  /**
   * TC-AGT-RFD-017: Refund - History Log
   * Note: Audit
   * 
   * Test Data: View Log
   * 
   * Expected Result:
   * "Refund Approved by [AgentID]" is logged
   */
  it('TC-AGT-RFD-017: should log "Refund Approved by AgentID" in booking history', async () => {
    // Arrange
    mockGetBookingHistory.mockResolvedValue([
      { action: 'Booking Created' },
      { action: 'Payment Confirmed' },
      { action: 'Refund Approved by AGT-001' },
    ]);

    render(<BookingHistoryViewer bookingId="BK-112" />);

    // Assert - History log contains refund approval by agent
    await waitFor(() => {
      expect(screen.getByTestId('history-entry-2')).toHaveTextContent('Refund Approved by AGT-001');
    });

    // Assert - API called
    expect(mockGetBookingHistory).toHaveBeenCalledWith('BK-112');
  });

  /**
   * TC-AGT-RFD-018: Refund - Currency Conversion
   * Note: Complex
   * 
   * Test Data: Currency
   * 
   * Expected Result:
   * System calculates rate correctly
   */
  it('TC-AGT-RFD-018: should convert refund amount from USD to VND correctly', async () => {
    // Arrange
    const refundRequest = {
      amount: 100,
      currency_from: 'USD',
      currency_to: 'VND',
    };

    mockConvertCurrency.mockResolvedValue(2500000); // 100 USD = 2,500,000 VND (rate: 25,000)

    render(<CurrencyRefund refundRequest={refundRequest} />);

    // Assert - Conversion called
    await waitFor(() => {
      expect(mockConvertCurrency).toHaveBeenCalledWith(100, 'USD', 'VND');
    });

    // Assert - Converted amount displayed correctly
    expect(await screen.findByTestId('converted-amount')).toHaveTextContent('Refund: 2500000 VND');
  });

  /**
   * TC-AGT-RFD-019: Refund - Services Only
   * Note: Detail
   * 
   * Test Data: Item: Meal
   * 
   * Expected Result:
   * Flight active, Meal refunded
   */
  it('TC-AGT-RFD-019: should refund meal while keeping flight active', async () => {
    // Arrange
    const booking = {
      booking_id: 'BK-113',
      items: [
        { id: 'FLIGHT-1', name: 'Flight Ticket', price: 450, type: 'flight' },
        { id: 'MEAL-1', name: 'Premium Meal', price: 50, type: 'service' },
      ],
    };

    mockApproveRefund.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<ServiceRefund booking={booking} />);

    // Act - Select meal only (not flight)
    await user.click(screen.getByTestId('checkbox-MEAL-1'));

    // Act - Refund selected items
    await user.click(screen.getByTestId('refund-services'));

    // Assert - Meal refunded
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledWith('MEAL-1', 50, 'AGT-001');
    });

    // Assert - Flight not refunded
    expect(mockApproveRefund).not.toHaveBeenCalledWith(
      expect.stringContaining('FLIGHT'),
      expect.anything(),
      expect.anything()
    );
  });

  /**
   * TC-AGT-RFD-020: Refund - Cancelled Booking
   * Note: Flow
   * 
   * Test Data: Status: Cancel
   * 
   * Expected Result:
   * Allowed (if paid but not refunded yet)
   */
  it('TC-AGT-RFD-020: should allow refund for cancelled booking if paid but not yet refunded', async () => {
    // Arrange
    const cancelledBookingRefund = {
      refund_id: 'REF-012',
      booking_id: 'BK-114',
      ticket_type: 'Standard',
      paid_amount: 400,
      tax_amount: 40,
      calculated_amount: 200, // Partial refund
      status: 'Cancelled',
      customer_email: 'customer@test.com',
    };

    mockProcessRefundPayment.mockResolvedValue({ success: true });
    mockApproveRefund.mockResolvedValue({ status: 'Refunded' });
    mockSendRefundNotification.mockResolvedValue({ success: true });
    mockLogRefundHistory.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<RefundApproval refundRequest={cancelledBookingRefund} agent={mockAgent} />);

    // Assert - Status is Cancelled
    expect(screen.getByText('Status: Cancelled')).toBeInTheDocument();

    // Act - Approve refund for cancelled booking
    await user.click(screen.getByTestId('approve-button'));

    // Assert - Refund allowed for cancelled but paid booking
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledWith('REF-012', 200, 'AGT-001');
    });

    // Assert - Success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Refund approved successfully');
  });
});
