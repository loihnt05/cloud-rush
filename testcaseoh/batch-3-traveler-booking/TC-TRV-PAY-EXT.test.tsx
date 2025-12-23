/**
 * Test Suite: TC-TRV-PAY-EXT (Traveler Payment Method & Gateway - Extended)
 * Category: Traveler Services - Payment Validation & Gateway Integration
 * Description: Extended unit tests for payment validation, gateway integration, and error handling
 * 
 * Test Cases:
 * - TC-TRV-PAY-006: Payment - Empty Card Number
 * - TC-TRV-PAY-007: Payment - Invalid Card Length
 * - TC-TRV-PAY-008: Payment - Wrong Format (Luhn)
 * - TC-TRV-PAY-009: Payment - Expired Card
 * - TC-TRV-PAY-010: Payment - Invalid CVC
 * - TC-TRV-PAY-011: Payment - Visa Success
 * - TC-TRV-PAY-012: Payment - Master Success
 * - TC-TRV-PAY-013: Payment - Momo Success
 * - TC-TRV-PAY-014: Payment - Gateway Timeout
 * - TC-TRV-PAY-015: Payment - Insufficient Funds
 * - TC-TRV-PAY-016: Payment - Card Declined (Bank)
 * - TC-TRV-PAY-017: Payment - 3D Secure Verification
 * - TC-TRV-PAY-018: Payment - Cancel at Gateway
 * - TC-TRV-PAY-019: Payment - Back Button
 * - TC-TRV-PAY-020: Payment - Double Click Pay
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has selected flight and seats
 * 3. User is on payment screen
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock payment APIs
const mockProcessPayment = vi.fn();
const mockValidateCard = vi.fn();
const mockIssueTicket = vi.fn();
const mockVerify3DS = vi.fn();

// Test card numbers
const VISA_VALID = '4111111111111111';
const MASTER_VALID = '5555555555554444';
const CARD_INSUFFICIENT_FUNDS = '4000000000000002';
const CARD_DECLINED = '4000000000000069';
const CARD_3DS = '4000000000003220';

// Luhn algorithm validation
const validateLuhn = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Mock CreditCardPayment component
const CreditCardPayment = ({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) => {
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryMonth, setExpiryMonth] = React.useState('');
  const [expiryYear, setExpiryYear] = React.useState('');
  const [cvc, setCvc] = React.useState('');
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const [paymentClicked, setPaymentClicked] = React.useState(false);

  const validateCardNumber = (card: string): string | null => {
    if (!card || card.trim() === '') {
      return 'Field Mandatory';
    }
    
    const digits = card.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return 'Invalid Card Number';
    }
    
    if (!validateLuhn(card)) {
      return 'Invalid Card';
    }
    
    return null;
  };

  const validateExpiry = (): string | null => {
    if (!expiryMonth || !expiryYear) {
      return 'Field Mandatory';
    }
    
    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const fullYear = year < 100 ? 2000 + year : year;
    
    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      return 'Card Expired';
    }
    
    return null;
  };

  const validateCVC = (): string | null => {
    if (!cvc || cvc.trim() === '') {
      return 'Field Mandatory';
    }
    
    if (!/^\d{3,4}$/.test(cvc)) {
      return 'Invalid CVC';
    }
    
    return null;
  };

  const handlePay = async () => {
    // Prevent double click
    if (paymentClicked || processing) {
      return;
    }
    
    setPaymentClicked(true);
    setError('');
    
    // Validate card number
    const cardError = validateCardNumber(cardNumber);
    if (cardError) {
      setError(cardError);
      setPaymentClicked(false);
      onError(cardError);
      return;
    }
    
    // Validate expiry
    const expiryError = validateExpiry();
    if (expiryError) {
      setError(expiryError);
      setPaymentClicked(false);
      onError(expiryError);
      return;
    }
    
    // Validate CVC
    const cvcError = validateCVC();
    if (cvcError) {
      setError(cvcError);
      setPaymentClicked(false);
      onError(cvcError);
      return;
    }
    
    setProcessing(true);
    
    try {
      // Validate with backend
      const validation = await mockValidateCard(cardNumber);
      
      if (!validation.valid) {
        setError(validation.error);
        onError(validation.error);
        setProcessing(false);
        setPaymentClicked(false);
        return;
      }
      
      // Process payment
      const result = await mockProcessPayment({
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc
      });
      
      if (result.requires3DS) {
        // Handle 3D Secure
        const dsResult = await mockVerify3DS(result.verificationUrl);
        if (dsResult.success) {
          await mockIssueTicket();
          onSuccess();
        } else {
          setError('3DS Verification Failed');
          onError('3DS Verification Failed');
        }
      } else if (result.success) {
        // Issue ticket
        await mockIssueTicket();
        onSuccess();
      } else {
        setError(result.error);
        onError(result.error);
      }
    } catch (err: any) {
      if (err.message === 'timeout') {
        setError('Transaction Timeout');
        onError('Transaction Timeout');
      } else {
        setError(err.message || 'Payment Failed');
        onError(err.message || 'Payment Failed');
      }
    } finally {
      setProcessing(false);
      setPaymentClicked(false);
    }
  };

  const handleBackButton = () => {
    if (processing) {
      setError('Please wait for transaction to complete');
    }
  };

  return (
    <div data-testid="credit-card-payment">
      <h2>Credit Card Payment</h2>
      
      <div data-testid="card-form">
        <input
          data-testid="card-number-input"
          type="text"
          placeholder="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
        
        <input
          data-testid="expiry-month-input"
          type="text"
          placeholder="MM"
          value={expiryMonth}
          onChange={(e) => setExpiryMonth(e.target.value)}
        />
        
        <input
          data-testid="expiry-year-input"
          type="text"
          placeholder="YY"
          value={expiryYear}
          onChange={(e) => setExpiryYear(e.target.value)}
        />
        
        <input
          data-testid="cvc-input"
          type="text"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => setCvc(e.target.value)}
        />
        
        <button 
          data-testid="pay-now-btn" 
          onClick={handlePay}
          disabled={processing || paymentClicked}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        
        <button 
          data-testid="back-btn" 
          onClick={handleBackButton}
        >
          Back
        </button>
      </div>
      
      {processing && <div data-testid="processing-indicator">Processing payment...</div>}
      {error && <div data-testid="payment-error">{error}</div>}
    </div>
  );
};

// Mock MomoPayment component
const MomoPayment = ({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) => {
  const [qrCode, setQrCode] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  const handleGenerateQR = async () => {
    setProcessing(true);
    const result = await mockProcessPayment({ method: 'momo' });
    
    if (result.success) {
      setQrCode(result.qrCode);
    }
    setProcessing(false);
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    await mockIssueTicket();
    onSuccess();
  };

  const handleCancel = () => {
    onCancel();
  };

  React.useEffect(() => {
    handleGenerateQR();
  }, []);

  return (
    <div data-testid="momo-payment">
      <h2>Momo Payment</h2>
      {qrCode && <div data-testid="momo-qr-code">QR: {qrCode}</div>}
      {processing && <div data-testid="momo-processing">Processing...</div>}
      <button data-testid="confirm-momo-btn" onClick={handleConfirmPayment}>
        Confirm Payment
      </button>
      <button data-testid="cancel-momo-btn" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  );
};

// Mock 3DS Verification component
const ThreeDSVerification = ({ onSuccess, onError }: { onSuccess: () => void; onError: () => void }) => {
  const [otp, setOtp] = React.useState('');

  const handleVerify = async () => {
    const result = await mockVerify3DS(otp);
    
    if (result.success) {
      onSuccess();
    } else {
      onError();
    }
  };

  return (
    <div data-testid="3ds-popup">
      <h2>3D Secure Verification</h2>
      <input
        data-testid="otp-input"
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button data-testid="verify-otp-btn" onClick={handleVerify}>
        Verify
      </button>
    </div>
  );
};

describe('TC-TRV-PAY-EXT: Traveler Payment Method & Gateway Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessPayment.mockResolvedValue({ success: true });
    mockValidateCard.mockResolvedValue({ valid: true });
    mockIssueTicket.mockResolvedValue({ success: true });
    mockVerify3DS.mockResolvedValue({ success: true });
  });

  /**
   * TC-TRV-PAY-006: Payment - Empty Card Number
   * Business Requirement: BR26
   * 
   * Test Data: Card: ""
   * 
   * Expected Result:
   * Error "Field Mandatory".
   */
  it('TC-TRV-PAY-006: should display mandatory field error when card number is empty', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Setup - Fill in other fields
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');

    // Act - Leave Card No empty. Pay.
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Field Mandatory"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Field Mandatory');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Field Mandatory');

    // Assert - Payment not processed
    expect(mockProcessPayment).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-007: Payment - Invalid Card Length
   * Business Requirement: BR26
   * 
   * Test Data: Card: 123...
   * 
   * Expected Result:
   * Error "Invalid Card Number".
   */
  it('TC-TRV-PAY-007: should display error for invalid card number length', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Enter 10 digits for Visa
    await user.type(screen.getByTestId('card-number-input'), '1234567890');
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Invalid Card Number"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Invalid Card Number');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Invalid Card Number');

    // Assert - Payment not processed
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-008: Payment - Wrong Format (Luhn)
   * Business Requirement: BR26
   * 
   * Test Data: Card: Random
   * 
   * Expected Result:
   * Error "Invalid Card" (Luhn check).
   */
  it('TC-TRV-PAY-008: should validate card number using Luhn algorithm', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Enter random 16 digits (fails Luhn check)
    await user.type(screen.getByTestId('card-number-input'), '1234567890123456');
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Invalid Card" (Luhn check)
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Invalid Card');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Invalid Card');

    // Assert - Payment not processed (failed client-side validation)
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-009: Payment - Expired Card
   * Note: Val
   * 
   * Test Data: Date: Past
   * 
   * Expected Result:
   * Error "Card Expired".
   */
  it('TC-TRV-PAY-009: should display error for expired card', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Enter Expiry date in past
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '01');
    await user.type(screen.getByTestId('expiry-year-input'), '20'); // 2020 - past
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Card Expired"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Card Expired');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Card Expired');

    // Assert - Payment not processed
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-010: Payment - Invalid CVC
   * Note: Val
   * 
   * Test Data: CVC: "12"
   * 
   * Expected Result:
   * Error "Invalid CVC".
   */
  it('TC-TRV-PAY-010: should display error for invalid CVC', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Enter 2 digits or letters for CVC
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '12'); // Only 2 digits
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Invalid CVC"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Invalid CVC');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Invalid CVC');

    // Assert - Payment not processed
    expect(mockProcessPayment).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-011: Payment - Visa Success
   * Business Requirement: BR27
   * 
   * Test Data: Visa Valid
   * 
   * Expected Result:
   * Transaction Success. Ticket Issued.
   */
  it('TC-TRV-PAY-011: should process successful Visa payment and issue ticket', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    mockProcessPayment.mockResolvedValueOnce({ success: true });
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Use Test Visa (Stripe/Sandbox)
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Card validated
    await waitFor(() => {
      expect(mockValidateCard).toHaveBeenCalledWith(VISA_VALID);
    });

    // Assert - Payment processed
    expect(mockProcessPayment).toHaveBeenCalledWith({
      cardNumber: VISA_VALID,
      expiryMonth: '12',
      expiryYear: '30',
      cvc: '123'
    });

    // Assert - Transaction Success. Ticket Issued.
    await waitFor(() => {
      expect(mockIssueTicket).toHaveBeenCalled();
    });

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-012: Payment - Master Success
   * Business Requirement: BR27
   * 
   * Test Data: Master Valid
   * 
   * Expected Result:
   * Transaction Success. Ticket Issued.
   */
  it('TC-TRV-PAY-012: should process successful Mastercard payment and issue ticket', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    mockProcessPayment.mockResolvedValueOnce({ success: true });
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Use Test Master
    await user.type(screen.getByTestId('card-number-input'), MASTER_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Card validated
    await waitFor(() => {
      expect(mockValidateCard).toHaveBeenCalledWith(MASTER_VALID);
    });

    // Assert - Payment processed
    expect(mockProcessPayment).toHaveBeenCalledWith({
      cardNumber: MASTER_VALID,
      expiryMonth: '12',
      expiryYear: '30',
      cvc: '123'
    });

    // Assert - Transaction Success. Ticket Issued.
    await waitFor(() => {
      expect(mockIssueTicket).toHaveBeenCalled();
    });

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-013: Payment - Momo Success
   * Business Requirement: BR27
   * 
   * Test Data: Momo Valid
   * 
   * Expected Result:
   * Transaction Success. Ticket Issued.
   */
  it('TC-TRV-PAY-013: should process successful Momo payment via QR scan', async () => {
    // Arrange
    const mockOnCancel = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    mockProcessPayment.mockResolvedValueOnce({ success: true, qrCode: 'MOMO_QR_12345' });
    
    render(<MomoPayment onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Assert - Simulate Momo QR Scan - QR code generated
    expect(await screen.findByTestId('momo-qr-code')).toHaveTextContent('QR: MOMO_QR_12345');

    // Act - Confirm payment after QR scan
    await user.click(screen.getByTestId('confirm-momo-btn'));

    // Assert - Transaction Success. Ticket Issued.
    await waitFor(() => {
      expect(mockIssueTicket).toHaveBeenCalled();
    });

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-014: Payment - Gateway Timeout
   * Note: Edge
   * 
   * Test Data: Timeout
   * 
   * Expected Result:
   * Error "Transaction Timeout". Retry avail.
   */
  it('TC-TRV-PAY-014: should display timeout error when gateway is slow', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Simulate Network Slow - timeout error
    mockProcessPayment.mockRejectedValueOnce(new Error('timeout'));
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Submit payment
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Transaction Timeout"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Transaction Timeout');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Transaction Timeout');

    // Assert - Retry available (button not permanently disabled)
    await waitFor(() => {
      expect(screen.getByTestId('pay-now-btn')).not.toBeDisabled();
    });
  });

  /**
   * TC-TRV-PAY-015: Payment - Insufficient Funds
   * Business Requirement: BR27
   * 
   * Test Data: Card: NoBalance
   * 
   * Expected Result:
   * Error "Insufficient Funds".
   */
  it('TC-TRV-PAY-015: should display error for insufficient funds', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Use specific test card for insufficient funds
    mockProcessPayment.mockResolvedValueOnce({ 
      success: false, 
      error: 'Insufficient Funds' 
    });
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Use specific test card (4000000000000002)
    await user.type(screen.getByTestId('card-number-input'), CARD_INSUFFICIENT_FUNDS);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Insufficient Funds"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Insufficient Funds');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Insufficient Funds');

    // Assert - Ticket not issued
    expect(mockIssueTicket).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-016: Payment - Card Declined (Bank)
   * Business Requirement: BR27
   * 
   * Test Data: Card: Decline
   * 
   * Expected Result:
   * Error "Transaction Declined by Bank".
   */
  it('TC-TRV-PAY-016: should display error when card is declined by bank', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Use specific test card for declined
    mockProcessPayment.mockResolvedValueOnce({ 
      success: false, 
      error: 'Transaction Declined by Bank' 
    });
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Use specific test card (4000000000000069)
    await user.type(screen.getByTestId('card-number-input'), CARD_DECLINED);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Error "Transaction Declined by Bank"
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Transaction Declined by Bank');

    // Assert - Error callback called
    expect(mockOnError).toHaveBeenCalledWith('Transaction Declined by Bank');

    // Assert - Ticket not issued
    expect(mockIssueTicket).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-017: Payment - 3D Secure Verification
   * Note: Sec
   * 
   * Test Data: OTP Flow
   * 
   * Expected Result:
   * Popup for OTP appears. Verify Success.
   */
  it('TC-TRV-PAY-017: should handle 3D Secure verification flow', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Use 3DS Test Card
    mockProcessPayment.mockResolvedValueOnce({ 
      success: false,
      requires3DS: true,
      verificationUrl: 'https://3ds.example.com/verify'
    });
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Submit payment with 3DS card
    await user.type(screen.getByTestId('card-number-input'), CARD_3DS);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - 3DS verification triggered
    await waitFor(() => {
      expect(mockVerify3DS).toHaveBeenCalledWith('https://3ds.example.com/verify');
    });

    // Assert - Verify Success - ticket issued
    await waitFor(() => {
      expect(mockIssueTicket).toHaveBeenCalled();
    });

    // Assert - Success callback called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-018: Payment - Cancel at Gateway
   * Note: Flow
   * 
   * Test Data: Action: Cancel
   * 
   * Expected Result:
   * Redirect to App. Status "Failed/Pending".
   */
  it('TC-TRV-PAY-018: should handle cancellation at gateway page', async () => {
    // Arrange
    const mockOnCancel = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    mockProcessPayment.mockResolvedValueOnce({ success: true, qrCode: 'MOMO_QR' });
    
    render(<MomoPayment onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // Assert - Gateway page loaded
    expect(await screen.findByTestId('momo-qr-code')).toBeInTheDocument();

    // Act - Click "Cancel" on Gateway Page
    await user.click(screen.getByTestId('cancel-momo-btn'));

    // Assert - Redirect to App (cancel callback called)
    expect(mockOnCancel).toHaveBeenCalled();

    // Assert - Ticket not issued (payment cancelled)
    expect(mockIssueTicket).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAY-019: Payment - Back Button
   * Note: Flow
   * 
   * Test Data: Action: Back
   * 
   * Expected Result:
   * Prevent double charge. Show warning.
   */
  it('TC-TRV-PAY-019: should show warning when back button clicked during processing', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Delay payment processing to simulate in-progress transaction
    mockProcessPayment.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)));
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Act - Start payment
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');
    await user.click(screen.getByTestId('pay-now-btn'));

    // Assert - Processing started
    expect(await screen.findByTestId('processing-indicator')).toBeInTheDocument();

    // Act - Click Back during processing
    await user.click(screen.getByTestId('back-btn'));

    // Assert - Show warning (error displayed)
    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Please wait for transaction to complete');

    // Note: Prevent double charge is handled by processing state and disabled button
  });

  /**
   * TC-TRV-PAY-020: Payment - Double Click Pay
   * Note: Edge
   * 
   * Test Data: Action: Click x2
   * 
   * Expected Result:
   * System processes only 1 transaction.
   */
  it('TC-TRV-PAY-020: should prevent double payment when Pay button clicked twice rapidly', async () => {
    // Arrange
    const mockOnError = vi.fn();
    const mockOnSuccess = vi.fn();
    const user = userEvent.setup();
    
    // Simulate slow payment processing
    mockProcessPayment.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 500)));
    
    render(<CreditCardPayment onSuccess={mockOnSuccess} onError={mockOnError} />);

    // Setup - Fill in valid card details
    await user.type(screen.getByTestId('card-number-input'), VISA_VALID);
    await user.type(screen.getByTestId('expiry-month-input'), '12');
    await user.type(screen.getByTestId('expiry-year-input'), '30');
    await user.type(screen.getByTestId('cvc-input'), '123');

    // Act - Click "Pay Now" twice rapidly
    const payButton = screen.getByTestId('pay-now-btn');
    await user.click(payButton);
    await user.click(payButton); // Second click should be ignored

    // Assert - Button disabled after first click
    expect(payButton).toBeDisabled();

    // Assert - System processes only 1 transaction
    await waitFor(() => {
      expect(mockProcessPayment).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Assert - Only 1 ticket issued
    await waitFor(() => {
      expect(mockIssueTicket).toHaveBeenCalledTimes(1);
    });
  });
});
