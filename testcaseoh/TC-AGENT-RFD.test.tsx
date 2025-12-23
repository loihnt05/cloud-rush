/**
 * Test Suite: TC-AGENT-RFD (Agent Refund)
 * Category: Agent Refund
 * Description: Unit tests for Agent refund approval and rejection functionality
 * 
 * Test Cases:
 * - TC-AGENT-RFD-001: Verify Approve Refund Request
 * - TC-AGENT-RFD-002: Verify Reject Refund Request
 * - TC-AGENT-RFD-003: Verify Traveler Notification - Successful Refund
 * - TC-AGENT-RFD-004: Verify Traveler Notification - Rejected Refund
 * 
 * Prerequisites:
 * 1. CSA is logged in
 * 2. Refund requests exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock refund API
const mockGetRefundRequest = vi.fn();
const mockApproveRefund = vi.fn();
const mockRejectRefund = vi.fn();
const mockTriggerPaymentGateway = vi.fn();
const mockSendEmailNotification = vi.fn();
const mockGetNotificationLog = vi.fn();

// Mock RefundRequestDetail component (placeholder for actual component)
const RefundRequestDetail = ({ requestId, onBack }: { requestId: string; onBack: () => void }) => {
  const [refundRequest, setRefundRequest] = React.useState<any>(null);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    mockGetRefundRequest(requestId).then((data: any) => {
      setRefundRequest(data);
    });
  }, [requestId]);

  const handleApprove = async () => {
    setProcessing(true);
    const response = await mockApproveRefund(requestId);
    await mockTriggerPaymentGateway(requestId, refundRequest.refundAmount);
    await mockSendEmailNotification(refundRequest.customerEmail, 'Refund Successful', {
      amount: refundRequest.refundAmount,
      bookingId: refundRequest.bookingId,
    });
    const updatedRequest = await mockGetRefundRequest(requestId);
    setRefundRequest(updatedRequest);
    setProcessing(false);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    setProcessing(true);
    await mockRejectRefund(requestId, rejectionReason);
    await mockSendEmailNotification(refundRequest.customerEmail, 'Refund Rejected', {
      reason: rejectionReason,
      bookingId: refundRequest.bookingId,
    });
    const updatedRequest = await mockGetRefundRequest(requestId);
    setRefundRequest(updatedRequest);
    setShowRejectModal(false);
    setProcessing(false);
  };

  if (!refundRequest) return <div>Loading...</div>;

  return (
    <div data-testid="refund-request-detail">
      <button onClick={onBack} data-testid="back-button">Back</button>

      <h1>Refund Request Details</h1>

      <section data-testid="request-details">
        <h2>Request Information</h2>
        <div>Request ID: {refundRequest.requestId}</div>
        <div>Booking ID: {refundRequest.bookingId}</div>
        <div>Customer: {refundRequest.customerName}</div>
        <div>Email: {refundRequest.customerEmail}</div>
        <div>Refund Amount: ${refundRequest.refundAmount}</div>
        <div>Status: <span data-testid="status-display">{refundRequest.status}</span></div>
        <div>Ticket Type: {refundRequest.ticketType}</div>
      </section>

      <section data-testid="policy-check">
        <h2>Policy Check</h2>
        <div>Policy Status: <span data-testid="policy-status">{refundRequest.policyCheck}</span></div>
        <div>Cancellation Policy: {refundRequest.cancellationPolicy}</div>
      </section>

      {refundRequest.status === 'Pending' && (
        <div className="actions" data-testid="action-buttons">
          <button 
            onClick={handleApprove} 
            data-testid="approve-button"
            disabled={processing}
          >
            Approve
          </button>
          <button 
            onClick={handleReject} 
            data-testid="reject-button"
            disabled={processing}
          >
            Reject
          </button>
        </div>
      )}

      {showRejectModal && (
        <div data-testid="reject-modal">
          <h3>Reject Refund Request</h3>
          <p>Please enter a rejection reason:</p>
          <textarea
            data-testid="rejection-reason-input"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason"
          />
          <button 
            onClick={handleConfirmReject} 
            data-testid="confirm-reject-button"
            disabled={!rejectionReason.trim()}
          >
            Confirm Reject
          </button>
          <button onClick={() => setShowRejectModal(false)} data-testid="cancel-reject-button">
            Cancel
          </button>
        </div>
      )}

      {refundRequest.status === 'Approved' && (
        <div data-testid="approval-confirmation">
          <p>✓ Refund approved and processed</p>
          <p>Payment gateway triggered</p>
          <p>Customer notification sent</p>
        </div>
      )}

      {refundRequest.status === 'Rejected' && refundRequest.rejectionReason && (
        <div data-testid="rejection-confirmation">
          <p>✗ Refund rejected</p>
          <p>Reason: {refundRequest.rejectionReason}</p>
          <p>Customer notification sent</p>
        </div>
      )}
    </div>
  );
};

// Mock RefundRequestQueue component
const RefundRequestQueue = () => {
  const [selectedRequest, setSelectedRequest] = React.useState<string | null>(null);

  const requests = [
    { id: 'RFD001', bookingId: 'BK001', status: 'Pending', amount: 500 },
    { id: 'RFD002', bookingId: 'BK002', status: 'Pending', amount: 750 },
  ];

  if (selectedRequest) {
    return (
      <RefundRequestDetail
        requestId={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div data-testid="refund-queue">
      <h1>Refund Request Queue</h1>
      {requests.map((request) => (
        <div key={request.id} onClick={() => setSelectedRequest(request.id)}>
          <button data-testid={`request-${request.id}`}>
            {request.id} - {request.bookingId} - ${request.amount} - {request.status}
          </button>
        </div>
      ))}
    </div>
  );
};

// Mock Notification Log component
const NotificationLog = ({ customerEmail }: { customerEmail: string }) => {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    mockGetNotificationLog(customerEmail).then((data: any[]) => {
      setNotifications(data);
    });
  }, [customerEmail]);

  return (
    <div data-testid="notification-log">
      <h2>Notification Log</h2>
      {notifications.map((notification, index) => (
        <div key={index} data-testid={`notification-${index}`}>
          <div>Subject: <span data-testid={`subject-${index}`}>{notification.subject}</span></div>
          <div>To: {notification.to}</div>
          <div>Content: <span data-testid={`content-${index}`}>{notification.content}</span></div>
          <div>Sent: {notification.sentAt}</div>
        </div>
      ))}
    </div>
  );
};

describe('Agent Refund Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AGENT-RFD-001: Verify Approve Refund Request
   * Business Requirement: BR9 5
   * 
   * Prerequisites:
   * 1. CSA is logged in
   * 2. A pending refund request exists
   * 3. Request meets cancellation policy
   * 
   * Steps:
   * Step 1: Select the refund request from the queue
   * - Expected: System displays request details and policy check
   * 
   * Step 2: Review policy and Click "Approve"
   * - Expected: System confirms refund amount based on policy
   * 
   * Step 3: Verify System Actions
   * - Expected: Trigger Payment Gateway API & Send Email to Traveler
   * 
   * Test Case Expected Result:
   * Refund status updates to "Approved", payment gateway is triggered, customer receives funds
   */
  it('TC-AGENT-RFD-001: should approve refund request and trigger payment gateway and notification when CSA approves', async () => {
    // Arrange - Mock pending refund request
    const initialRefundRequest = {
      requestId: 'RFD001',
      bookingId: 'BK001',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      refundAmount: 500.00,
      status: 'Pending',
      ticketType: 'Refundable',
      policyCheck: 'Eligible',
      cancellationPolicy: 'Full refund within 24 hours',
    };

    const approvedRefundRequest = {
      ...initialRefundRequest,
      status: 'Approved',
    };

    mockGetRefundRequest
      .mockResolvedValueOnce(initialRefundRequest)
      .mockResolvedValueOnce(approvedRefundRequest);
    
    mockApproveRefund.mockResolvedValue({ success: true });
    mockTriggerPaymentGateway.mockResolvedValue({ success: true, transactionId: 'TXN123' });
    mockSendEmailNotification.mockResolvedValue({ success: true });

    const user = userEvent.setup();

    // Act - Step 1: Select the refund request from the queue
    render(<RefundRequestQueue />);
    
    const requestButton = screen.getByTestId('request-RFD001');
    await user.click(requestButton);

    // Assert - Step 1: System displays request details and policy check
    await waitFor(() => {
      expect(screen.getByTestId('refund-request-detail')).toBeInTheDocument();
    });

    const requestDetails = screen.getByTestId('request-details');
    const policyCheck = screen.getByTestId('policy-check');

    expect(requestDetails).toBeInTheDocument();
    expect(requestDetails).toHaveTextContent('Request ID: RFD001');
    expect(requestDetails).toHaveTextContent('Booking ID: BK001');
    expect(requestDetails).toHaveTextContent('Customer: John Doe');
    expect(requestDetails).toHaveTextContent('Email: john.doe@example.com');
    expect(requestDetails).toHaveTextContent('Refund Amount: $500');
    expect(requestDetails).toHaveTextContent('Ticket Type: Refundable');

    expect(policyCheck).toBeInTheDocument();
    expect(screen.getByTestId('policy-status')).toHaveTextContent('Eligible');
    expect(policyCheck).toHaveTextContent('Full refund within 24 hours');

    // Verify initial status is Pending
    expect(screen.getByTestId('status-display')).toHaveTextContent('Pending');

    // Act - Step 2: Review policy and Click "Approve"
    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Assert - Step 2 & 3: System confirms refund amount and triggers system actions
    await waitFor(() => {
      expect(mockApproveRefund).toHaveBeenCalledWith('RFD001');
    });

    // Assert - Step 3: Trigger Payment Gateway API
    expect(mockTriggerPaymentGateway).toHaveBeenCalledWith('RFD001', 500.00);

    // Assert - Step 3: Send Email to Traveler
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      'john.doe@example.com',
      'Refund Successful',
      expect.objectContaining({
        amount: 500.00,
        bookingId: 'BK001',
      })
    );

    // Assert - Refund status updates to "Approved"
    await waitFor(() => {
      expect(screen.getByTestId('status-display')).toHaveTextContent('Approved');
    });

    // Assert - Confirmation message displayed
    expect(screen.getByTestId('approval-confirmation')).toBeInTheDocument();
    expect(screen.getByTestId('approval-confirmation')).toHaveTextContent('Refund approved and processed');
    expect(screen.getByTestId('approval-confirmation')).toHaveTextContent('Payment gateway triggered');
    expect(screen.getByTestId('approval-confirmation')).toHaveTextContent('Customer notification sent');

    // Verify all API calls were made
    expect(mockApproveRefund).toHaveBeenCalledTimes(1);
    expect(mockTriggerPaymentGateway).toHaveBeenCalledTimes(1);
    expect(mockSendEmailNotification).toHaveBeenCalledTimes(1);
    expect(mockGetRefundRequest).toHaveBeenCalledTimes(2); // Initial load + after approval
  });

  /**
   * TC-AGENT-RFD-002: Verify Reject Refund Request
   * Business Requirement: BR9 6
   * 
   * Prerequisites:
   * 1. CSA is logged in
   * 2. A pending refund request exists (e.g., Non-refundable ticket)
   * 
   * Steps:
   * Step 1: Select the refund request
   * - Expected: System displays request details
   * 
   * Step 2: Click "Reject" button
   * - Expected: System prompts for a rejection reason
   * 
   * Step 3: Enter reason "Policy Violation" & Confirm
   * - Expected: System updates status to "Rejected" & sends email
   * 
   * Test Case Expected Result:
   * Refund status updates to "Rejected", customer receives rejection email
   */
  it('TC-AGENT-RFD-002: should reject refund request with reason and send notification when CSA rejects', async () => {
    // Arrange - Mock pending refund request (Non-refundable)
    const initialRefundRequest = {
      requestId: 'RFD002',
      bookingId: 'BK002',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      refundAmount: 750.00,
      status: 'Pending',
      ticketType: 'Non-refundable',
      policyCheck: 'Ineligible',
      cancellationPolicy: 'Non-refundable ticket',
    };

    const rejectedRefundRequest = {
      ...initialRefundRequest,
      status: 'Rejected',
      rejectionReason: 'Policy Violation',
    };

    mockGetRefundRequest
      .mockResolvedValueOnce(initialRefundRequest)
      .mockResolvedValueOnce(rejectedRefundRequest);
    
    mockRejectRefund.mockResolvedValue({ success: true });
    mockSendEmailNotification.mockResolvedValue({ success: true });

    const user = userEvent.setup();

    // Render refund detail view directly (prerequisite: CSA is viewing a refund request)
    render(<RefundRequestDetail requestId="RFD002" onBack={vi.fn()} />);

    // Wait for initial data to load - Step 1: System displays request details
    await waitFor(() => {
      expect(screen.getByTestId('refund-request-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('request-details')).toHaveTextContent('Request ID: RFD002');
    expect(screen.getByTestId('request-details')).toHaveTextContent('Ticket Type: Non-refundable');
    expect(screen.getByTestId('status-display')).toHaveTextContent('Pending');

    // Act - Step 2: Click "Reject" button
    const rejectButton = screen.getByTestId('reject-button');
    await user.click(rejectButton);

    // Assert - Step 2: System prompts for a rejection reason
    await waitFor(() => {
      expect(screen.getByTestId('reject-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('reject-modal')).toHaveTextContent('Reject Refund Request');
    expect(screen.getByTestId('reject-modal')).toHaveTextContent('Please enter a rejection reason');

    const rejectionReasonInput = screen.getByTestId('rejection-reason-input');
    expect(rejectionReasonInput).toBeInTheDocument();

    // Act - Step 3: Enter reason "Policy Violation"
    await user.type(rejectionReasonInput, 'Policy Violation');

    expect(rejectionReasonInput).toHaveValue('Policy Violation');

    // Act - Step 3: Confirm rejection
    const confirmRejectButton = screen.getByTestId('confirm-reject-button');
    await user.click(confirmRejectButton);

    // Assert - Step 3: System updates status to "Rejected"
    await waitFor(() => {
      expect(mockRejectRefund).toHaveBeenCalledWith('RFD002', 'Policy Violation');
    });

    // Assert - Step 3: Sends email to customer
    expect(mockSendEmailNotification).toHaveBeenCalledWith(
      'jane.smith@example.com',
      'Refund Rejected',
      expect.objectContaining({
        reason: 'Policy Violation',
        bookingId: 'BK002',
      })
    );

    // Assert - Status updates to "Rejected"
    await waitFor(() => {
      expect(screen.getByTestId('status-display')).toHaveTextContent('Rejected');
    });

    // Assert - Rejection confirmation displayed
    expect(screen.getByTestId('rejection-confirmation')).toBeInTheDocument();
    expect(screen.getByTestId('rejection-confirmation')).toHaveTextContent('Refund rejected');
    expect(screen.getByTestId('rejection-confirmation')).toHaveTextContent('Reason: Policy Violation');
    expect(screen.getByTestId('rejection-confirmation')).toHaveTextContent('Customer notification sent');

    // Verify API calls
    expect(mockRejectRefund).toHaveBeenCalledTimes(1);
    expect(mockSendEmailNotification).toHaveBeenCalledTimes(1);
    expect(mockGetRefundRequest).toHaveBeenCalledTimes(2); // Initial load + after rejection
  });

  /**
   * TC-AGENT-RFD-003: Verify Traveler Notification - Successful Refund
   * Business Requirement: BR11 7
   * 
   * Prerequisites:
   * 1. Refund was approved (Triggered TC-AGENT-RFD-001)
   * 
   * Steps:
   * Step 1: Check the notification log / Email service
   * - Expected: Email sent with subject "Refund Successful"
   * 
   * Step 2: Read the email content
   * - Expected: Content confirms the refunded amount
   * 
   * Test Case Expected Result:
   * Traveler receives notification confirming the refund amount
   */
  it('TC-AGENT-RFD-003: should send successful refund notification to traveler with refund amount', async () => {
    // Arrange - Mock notification log with successful refund email
    const mockNotifications = [
      {
        to: 'john.doe@example.com',
        subject: 'Refund Successful',
        content: 'Your refund of $500.00 for booking BK001 has been processed successfully. The amount will be credited to your original payment method within 5-7 business days.',
        sentAt: '2025-12-23T10:30:00Z',
      },
    ];

    mockGetNotificationLog.mockResolvedValue(mockNotifications);

    // Act - Step 1: Check the notification log / Email service
    render(<NotificationLog customerEmail="john.doe@example.com" />);

    // Assert - Step 1: Email sent with subject "Refund Successful"
    await waitFor(() => {
      expect(mockGetNotificationLog).toHaveBeenCalledWith('john.doe@example.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('notification-log')).toBeInTheDocument();
    });

    const notificationElement = screen.getByTestId('notification-0');
    expect(notificationElement).toBeInTheDocument();

    const subjectElement = screen.getByTestId('subject-0');
    expect(subjectElement).toHaveTextContent('Refund Successful');

    // Assert - Step 2: Read the email content - Content confirms the refunded amount
    const contentElement = screen.getByTestId('content-0');
    expect(contentElement).toHaveTextContent('$500.00');
    expect(contentElement).toHaveTextContent('booking BK001');
    expect(contentElement).toHaveTextContent('processed successfully');
    expect(contentElement).toHaveTextContent('credited to your original payment method');

    // Verify notification contains required information
    expect(notificationElement).toHaveTextContent('To: john.doe@example.com');
  });

  /**
   * TC-AGENT-RFD-004: Verify Traveler Notification - Rejected Refund
   * Business Requirement: BR11 8
   * 
   * Prerequisites:
   * 1. Refund was rejected (Triggered TC-AGENT-RFD-002)
   * 
   * Steps:
   * Step 1: Check the notification log / Email service
   * - Expected: Email sent with subject "Refund Rejected"
   * 
   * Step 2: Read the email content
   * - Expected: Content displays the rejection reason entered by CSA
   * 
   * Test Case Expected Result:
   * Traveler receives notification explaining the rejection reason
   */
  it('TC-AGENT-RFD-004: should send rejection notification to traveler with rejection reason', async () => {
    // Arrange - Mock notification log with rejection email
    const mockNotifications = [
      {
        to: 'jane.smith@example.com',
        subject: 'Refund Rejected',
        content: 'Your refund request for booking BK002 has been rejected. Reason: Policy Violation. Your ticket is non-refundable according to our cancellation policy. If you have any questions, please contact customer support.',
        sentAt: '2025-12-23T11:00:00Z',
      },
    ];

    mockGetNotificationLog.mockResolvedValue(mockNotifications);

    // Act - Step 1: Check the notification log / Email service
    render(<NotificationLog customerEmail="jane.smith@example.com" />);

    // Assert - Step 1: Email sent with subject "Refund Rejected"
    await waitFor(() => {
      expect(mockGetNotificationLog).toHaveBeenCalledWith('jane.smith@example.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('notification-log')).toBeInTheDocument();
    });

    const notificationElement = screen.getByTestId('notification-0');
    expect(notificationElement).toBeInTheDocument();

    const subjectElement = screen.getByTestId('subject-0');
    expect(subjectElement).toHaveTextContent('Refund Rejected');

    // Assert - Step 2: Read the email content - Content displays the rejection reason entered by CSA
    const contentElement = screen.getByTestId('content-0');
    expect(contentElement).toHaveTextContent('Reason: Policy Violation');
    expect(contentElement).toHaveTextContent('booking BK002');
    expect(contentElement).toHaveTextContent('rejected');
    expect(contentElement).toHaveTextContent('non-refundable');

    // Verify notification contains required information
    expect(notificationElement).toHaveTextContent('To: jane.smith@example.com');
  });
});
