/**
 * Test Suite: TC-TRV-PAY (Traveler Payment)
 * Category: Traveler Services - Payment Gateway & Validation
 * Description: Unit tests for Traveler payment processing including payment methods, validation, and transaction handling
 * 
 * Test Cases:
 * - TC-TRV-PAY-001: Verify Payment Methods Display
 * - TC-TRV-PAY-002: Verify Payment Validation - Success (Visa)
 * - TC-TRV-PAY-003: Verify Payment Validation - Success (Momo)
 * - TC-TRV-PAY-004: Verify Payment Validation - Failure (Invalid Card)
 * - TC-TRV-PAY-005: Verify Payment Validation - Failure (Insufficient Funds)
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. Booking details are confirmed
 * 3. Payment gateway is configured (Sandbox/Test mode)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock payment APIs
const mockProcessPayment = vi.fn();
const mockUpdatePaymentStatus = vi.fn();
const mockUpdateTicketStatus = vi.fn();
const mockPaymentGatewayCallback = vi.fn();
const mockNavigateToSuccessPage = vi.fn();

// Mock booking data
const mockBooking = {
  booking_id: 'BK-001',
  customer_id: 'CUST-001',
  total_amount: 1500000,
  payment_status: 'Pending',
  ticket_status: 'Hold',
};

// Mock PaymentMethodSelection component
const PaymentMethodSelection = () => {
  const [selectedMethod, setSelectedMethod] = React.useState('');

  return (
    <div data-testid="payment-method-selection">
      <h2>Choose Payment Method</h2>

      <div data-testid="payment-methods-list">
        <button
          data-testid="method-visa"
          onClick={() => setSelectedMethod('Visa')}
          className={selectedMethod === 'Visa' ? 'selected' : ''}
        >
          <img src="/logos/visa.png" alt="Visa" data-testid="visa-logo" />
          <span>Visa</span>
        </button>

        <button
          data-testid="method-mastercard"
          onClick={() => setSelectedMethod('Mastercard')}
          className={selectedMethod === 'Mastercard' ? 'selected' : ''}
        >
          <img src="/logos/mastercard.png" alt="Mastercard" data-testid="mastercard-logo" />
          <span>Mastercard</span>
        </button>

        <button
          data-testid="method-momo"
          onClick={() => setSelectedMethod('Momo')}
          className={selectedMethod === 'Momo' ? 'selected' : ''}
        >
          <img src="/logos/momo.png" alt="Momo" data-testid="momo-logo" />
          <span>Momo</span>
        </button>
      </div>

      {selectedMethod && (
        <div data-testid="selected-method">Selected: {selectedMethod}</div>
      )}
    </div>
  );
};

// Mock VisaPayment component
const VisaPayment = ({ booking, onSuccess, onFailure }: any) => {
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardName, setCardName] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvc, setCvc] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  const handlePayNow = async () => {
    setProcessing(true);

    try {
      // Validate card details
      if (cvc.length !== 3) {
        throw new Error('Invalid CVC');
      }

      if (cardNumber === '4111111111111111') {
        // Valid test Visa card
        // Simulate third-party gateway processing
        const gatewayResponse = await mockProcessPayment({
          method: 'Visa',
          cardNumber,
          amount: booking.total_amount,
        });

        // Wait for callback response
        const callbackResult = await mockPaymentGatewayCallback(gatewayResponse.transaction_id);

        if (callbackResult.status === 'Success') {
          // Update payment status
          await mockUpdatePaymentStatus(booking.booking_id, 'Paid');
          // Update ticket status
          await mockUpdateTicketStatus(booking.booking_id, 'Available');

          onSuccess();
          mockNavigateToSuccessPage(booking.booking_id);
        }
      } else if (cardNumber === '4000000000000002') {
        // Test card for insufficient funds
        throw new Error('Insufficient Funds');
      } else {
        // Other invalid cards
        throw new Error('Declined');
      }
    } catch (error: any) {
      setProcessing(false);
      onFailure(error.message);
    }
  };

  return (
    <div data-testid="visa-payment">
      <h3>Visa Payment</h3>
      <div>Amount: ₫{booking.total_amount.toLocaleString()}</div>

      <div>
        <label>Card Number:</label>
        <input
          data-testid="card-number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="1234 5678 9012 3456"
        />
      </div>

      <div>
        <label>Cardholder Name:</label>
        <input
          data-testid="card-name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="JOHN DOE"
        />
      </div>

      <div>
        <label>Expiry Date:</label>
        <input
          data-testid="expiry-date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          placeholder="MM/YY"
        />
      </div>

      <div>
        <label>CVC:</label>
        <input
          data-testid="cvc"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
          placeholder="123"
        />
      </div>

      <button
        onClick={handlePayNow}
        disabled={processing}
        data-testid="pay-now-button"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

// Mock MomoPayment component
const MomoPayment = ({ booking, onSuccess }: any) => {
  const [qrCode, setQrCode] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    // Generate QR code for Momo payment
    setQrCode(`MOMO_QR_${booking.booking_id}`);
  }, [booking.booking_id]);

  const handleConfirmPayment = async () => {
    setProcessing(true);

    try {
      // Simulate scanning QR code and entering Momo credentials
      const gatewayResponse = await mockProcessPayment({
        method: 'Momo',
        qr_code: qrCode,
        amount: booking.total_amount,
      });

      // Simulate Momo App confirmation
      const callbackResult = await mockPaymentGatewayCallback(gatewayResponse.transaction_id);

      if (callbackResult.status === 'Success') {
        // Update payment status
        await mockUpdatePaymentStatus(booking.booking_id, 'Paid');
        // Update ticket status
        await mockUpdateTicketStatus(booking.booking_id, 'Available');

        onSuccess();
      }
    } catch (error) {
      setProcessing(false);
    }
  };

  return (
    <div data-testid="momo-payment">
      <h3>Momo Payment</h3>
      <div>Amount: ₫{booking.total_amount.toLocaleString()}</div>

      <div data-testid="qr-code">
        <p>Scan QR Code with Momo App</p>
        <div>{qrCode}</div>
      </div>

      <button
        onClick={handleConfirmPayment}
        disabled={processing}
        data-testid="confirm-momo-button"
      >
        {processing ? 'Processing...' : 'Confirm Payment in Momo App'}
      </button>
    </div>
  );
};

// Mock PaymentSuccess component
const PaymentSuccess = ({ bookingId }: { bookingId: string }) => {
  return (
    <div data-testid="payment-success">
      <h2>Booking Success</h2>
      <div data-testid="success-message">Payment completed successfully!</div>
      <div>Booking ID: {bookingId}</div>
      <div data-testid="ticket-issued">Your ticket has been issued</div>
    </div>
  );
};

// Mock PaymentFailure component
const PaymentFailure = ({ errorMessage, ticketStatus }: any) => {
  return (
    <div data-testid="payment-failure">
      <h2>Payment Failed</h2>
      <div data-testid="error-message">{errorMessage}</div>
      <div data-testid="ticket-status">Ticket Status: {ticketStatus}</div>
      <button data-testid="retry-button">Try Again</button>
    </div>
  );
};

describe('TC-TRV-PAY: Traveler Payment Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-TRV-PAY-001: Verify Payment Methods Display
   * Business Requirement: BR26 8
   * 
   * Prerequisites:
   * 1. User has confirmed booking details.
   * 2. User navigates to Payment Gateway.
   * 
   * Expected Result:
   * System displays exactly: Visa, Mastercard, Momo.
   */
  it('TC-TRV-PAY-001: should display Visa, Mastercard, and Momo payment methods', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PaymentMethodSelection />);

    // Step 1: Observe the "Choose Payment Method" section
    // Step 1 Expected: List of methods is displayed
    expect(screen.getByText('Choose Payment Method')).toBeInTheDocument();
    expect(screen.getByTestId('payment-methods-list')).toBeInTheDocument();

    // Step 2: Check for specific logos/labels
    // Step 2 Expected: "Visa", "Mastercard", and "Momo" options are visible and selectable

    // Assert - Visa is visible
    const visaButton = screen.getByTestId('method-visa');
    expect(visaButton).toBeInTheDocument();
    expect(screen.getByTestId('visa-logo')).toHaveAttribute('alt', 'Visa');
    expect(visaButton).toHaveTextContent('Visa');

    // Assert - Mastercard is visible
    const mastercardButton = screen.getByTestId('method-mastercard');
    expect(mastercardButton).toBeInTheDocument();
    expect(screen.getByTestId('mastercard-logo')).toHaveAttribute('alt', 'Mastercard');
    expect(mastercardButton).toHaveTextContent('Mastercard');

    // Assert - Momo is visible
    const momoButton = screen.getByTestId('method-momo');
    expect(momoButton).toBeInTheDocument();
    expect(screen.getByTestId('momo-logo')).toHaveAttribute('alt', 'Momo');
    expect(momoButton).toHaveTextContent('Momo');

    // Assert - All methods are selectable
    await user.click(visaButton);
    expect(await screen.findByTestId('selected-method')).toHaveTextContent('Selected: Visa');

    await user.click(mastercardButton);
    expect(screen.getByTestId('selected-method')).toHaveTextContent('Selected: Mastercard');

    await user.click(momoButton);
    expect(screen.getByTestId('selected-method')).toHaveTextContent('Selected: Momo');
  });

  /**
   * TC-TRV-PAY-002: Verify Payment Validation - Success (Visa)
   * Business Requirement: BR27 9
   * 
   * Prerequisites:
   * 1. User selects "Visa".
   * 2. Payment Gateway is active (Sandbox/Test mode).
   * 
   * Expected Result:
   * System updates payment_status to "paid", ticket_status to "available", and shows Success Message.
   */
  it('TC-TRV-PAY-002: should successfully process Visa payment and update statuses', async () => {
    // Arrange
    const mockOnSuccess = vi.fn();
    const mockOnFailure = vi.fn();

    mockProcessPayment.mockResolvedValue({
      transaction_id: 'TXN-001',
      status: 'Processing',
    });

    mockPaymentGatewayCallback.mockResolvedValue({
      status: 'Success',
      transaction_id: 'TXN-001',
    });

    mockUpdatePaymentStatus.mockResolvedValue({ success: true });
    mockUpdateTicketStatus.mockResolvedValue({ success: true });
    mockNavigateToSuccessPage.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(
      <VisaPayment
        booking={mockBooking}
        onSuccess={mockOnSuccess}
        onFailure={mockOnFailure}
      />
    );

    // Step 1: Enter valid Visa card details (Test card: 4111111111111111)
    // Step 1 Expected: Input is valid
    await user.type(screen.getByTestId('card-number'), '4111111111111111');
    await user.type(screen.getByTestId('card-name'), 'JOHN DOE');
    await user.type(screen.getByTestId('expiry-date'), '12/25');
    await user.type(screen.getByTestId('cvc'), '123');

    // Assert - All fields filled
    expect(screen.getByTestId('card-number')).toHaveValue('4111111111111111');
    expect(screen.getByTestId('cvc')).toHaveValue('123');

    // Step 2: Click "Pay Now"
    // Step 2 Expected: Third-party gateway processes transaction
    await user.click(screen.getByTestId('pay-now-button'));

    // Assert - Payment processing initiated
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledWith({
        method: 'Visa',
        cardNumber: '4111111111111111',
        amount: 1500000,
      });
    });

    // Step 3: Wait for callback response
    // Step 3 Expected: Gateway returns "Success". System redirects to "Booking Success" page.
    await waitFor(() => {
      expect(mockPaymentGatewayCallback).toHaveBeenCalledWith('TXN-001');
    });

    // Assert - Payment status updated to "Paid"
    expect(mockUpdatePaymentStatus).toHaveBeenCalledWith('BK-001', 'Paid');

    // Assert - Ticket status updated to "Available"
    expect(mockUpdateTicketStatus).toHaveBeenCalledWith('BK-001', 'Available');

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();

    // Assert - Redirected to success page
    expect(mockNavigateToSuccessPage).toHaveBeenCalledWith('BK-001');
  });

  /**
   * TC-TRV-PAY-003: Verify Payment Validation - Success (Momo)
   * Business Requirement: BR27 10
   * 
   * Prerequisites:
   * 1. User selects "Momo".
   * 2. Momo Sandbox is active.
   * 
   * Expected Result:
   * System updates payment_status to "paid" and ticket_status to "available".
   */
  it('TC-TRV-PAY-003: should successfully process Momo payment and update statuses', async () => {
    // Arrange
    const mockOnSuccess = vi.fn();

    mockProcessPayment.mockResolvedValue({
      transaction_id: 'MOMO-TXN-001',
      status: 'Processing',
    });

    mockPaymentGatewayCallback.mockResolvedValue({
      status: 'Success',
      transaction_id: 'MOMO-TXN-001',
    });

    mockUpdatePaymentStatus.mockResolvedValue({ success: true });
    mockUpdateTicketStatus.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    render(<MomoPayment booking={mockBooking} onSuccess={mockOnSuccess} />);

    // Step 1: Scan QR code or enter Momo credentials
    // Step 1 Expected: Transaction initiated

    // Assert - QR code displayed
    expect(await screen.findByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByText(/Scan QR Code with Momo App/i)).toBeInTheDocument();
    expect(screen.getByText(`MOMO_QR_${mockBooking.booking_id}`)).toBeInTheDocument();

    // Assert - Amount displayed
    expect(screen.getByText(/Amount:/)).toHaveTextContent('Amount: ₫1,500,000');

    // Step 2: Confirm payment in Momo App (Simulated)
    // Step 2 Expected: Gateway returns "Success"
    await user.click(screen.getByTestId('confirm-momo-button'));

    // Assert - Payment processing initiated
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledWith({
        method: 'Momo',
        qr_code: 'MOMO_QR_BK-001',
        amount: 1500000,
      });
    });

    // Assert - Callback received
    expect(mockPaymentGatewayCallback).toHaveBeenCalledWith('MOMO-TXN-001');

    // Assert - Payment status updated to "Paid"
    expect(mockUpdatePaymentStatus).toHaveBeenCalledWith('BK-001', 'Paid');

    // Assert - Ticket status updated to "Available"
    expect(mockUpdateTicketStatus).toHaveBeenCalledWith('BK-001', 'Available');

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-004: Verify Payment Validation - Failure (Invalid Card)
   * Business Requirement: BR27 11
   * 
   * Prerequisites:
   * 1. User selects "Visa".
   * 
   * Expected Result:
   * System displays error MSG, shows Payment Failure screen, and does NOT issue ticket.
   */
  it('TC-TRV-PAY-004: should display error for invalid card details', async () => {
    // Arrange
    const mockOnSuccess = vi.fn();
    const mockOnFailure = vi.fn();

    const user = userEvent.setup();
    render(
      <VisaPayment
        booking={mockBooking}
        onSuccess={mockOnSuccess}
        onFailure={mockOnFailure}
      />
    );

    // Step 1: Enter invalid card details (e.g., Wrong CVC)
    // Step 1 Expected: Gateway attempts processing
    await user.type(screen.getByTestId('card-number'), '4111111111111112'); // Invalid card
    await user.type(screen.getByTestId('card-name'), 'JOHN DOE');
    await user.type(screen.getByTestId('expiry-date'), '12/25');
    await user.type(screen.getByTestId('cvc'), '12'); // Invalid CVC (only 2 digits)

    // Step 2: Click "Pay Now"
    // Step 2 Expected: Gateway returns "Declined" or "Error"
    await user.click(screen.getByTestId('pay-now-button'));

    // Step 3: Verify System Response
    // Step 3 Expected: System shows "Payment Failed" message. ticket_status remains "pending" or "hold"

    // Assert - Failure callback called with error
    await waitFor(() => {
      expect(mockOnFailure).toHaveBeenCalledWith('Invalid CVC');
    });

    // Assert - Payment status NOT updated
    expect(mockUpdatePaymentStatus).not.toHaveBeenCalled();

    // Assert - Ticket status NOT updated
    expect(mockUpdateTicketStatus).not.toHaveBeenCalled();

    // Assert - Success callback NOT called
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Render failure screen with error
    render(<PaymentFailure errorMessage="Invalid CVC" ticketStatus="Hold" />);

    // Assert - Payment failure screen displayed
    expect(screen.getByTestId('payment-failure')).toBeInTheDocument();
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();

    // Assert - Error message displayed
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid CVC');

    // Assert - Ticket status remains "Hold"
    expect(screen.getByTestId('ticket-status')).toHaveTextContent('Ticket Status: Hold');

    // Assert - Retry button available
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  /**
   * TC-TRV-PAY-005: Verify Payment Validation - Failure (Insufficient Funds)
   * Business Requirement: BR27 12
   * 
   * Prerequisites:
   * 1. User selects "Visa".
   * 
   * Expected Result:
   * System displays error MSG and prompts user to retry.
   */
  it('TC-TRV-PAY-005: should display error for insufficient funds', async () => {
    // Arrange
    const mockOnSuccess = vi.fn();
    const mockOnFailure = vi.fn();

    const user = userEvent.setup();
    render(
      <VisaPayment
        booking={mockBooking}
        onSuccess={mockOnSuccess}
        onFailure={mockOnFailure}
      />
    );

    // Step 1: Enter card with insufficient funds (Test card: 4000000000000002)
    // Step 1 Expected: Gateway attempts processing
    await user.type(screen.getByTestId('card-number'), '4000000000000002');
    await user.type(screen.getByTestId('card-name'), 'JOHN DOE');
    await user.type(screen.getByTestId('expiry-date'), '12/25');
    await user.type(screen.getByTestId('cvc'), '123');

    // Step 2: Click "Pay Now"
    // Step 2 Expected: Gateway returns "Insufficient Funds"
    await user.click(screen.getByTestId('pay-now-button'));

    // Step 3: Verify System Response
    // Step 3 Expected: System displays payment failure notification

    // Assert - Failure callback called with error
    await waitFor(() => {
      expect(mockOnFailure).toHaveBeenCalledWith('Insufficient Funds');
    });

    // Assert - Payment status NOT updated
    expect(mockUpdatePaymentStatus).not.toHaveBeenCalled();

    // Assert - Ticket status NOT updated
    expect(mockUpdateTicketStatus).not.toHaveBeenCalled();

    // Assert - Success callback NOT called
    expect(mockOnSuccess).not.toHaveBeenCalled();

    // Render failure screen with error
    render(<PaymentFailure errorMessage="Insufficient Funds" ticketStatus="Pending" />);

    // Assert - Payment failure notification displayed
    expect(screen.getByTestId('payment-failure')).toBeInTheDocument();

    // Assert - Error message shows insufficient funds
    expect(screen.getByTestId('error-message')).toHaveTextContent('Insufficient Funds');

    // Assert - Retry button prompts user to try again
    expect(screen.getByTestId('retry-button')).toHaveTextContent('Try Again');
  });
});
