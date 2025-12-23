import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

/**
 * Test Suite: Manual Verification and Receipts
 * 
 * Test Cases:
 * - TC-VER-RCP-001: Upload Receipt - Valid Image
 * - TC-VER-RCP-002: Upload Receipt - PDF
 * - TC-VER-RCP-003: Upload Receipt - Invalid Type
 * - TC-VER-RCP-004: Upload Receipt - Max Size
 * - TC-VER-RCP-005: Verify Transaction ID - Empty
 * - TC-VER-RCP-006: Verify Transaction ID - Duplicate
 * - TC-VER-RCP-007: Verify Amount - Match
 * - TC-VER-RCP-008: Verify Amount - Underpayment
 * - TC-VER-RCP-009: Verify Amount - Overpayment
 * - TC-VER-RCP-010: Add Note to Payment
 * 
 * Categories:
 * - UI: File upload validation and handling
 * - Security: File type validation
 * - Boundary: File size limits
 * - Validation: Required fields
 * - Uniqueness: Duplicate detection
 * - Business Logic: Payment amount verification
 * - Feature: Notes and payment history
 */

// Mock axios for API calls
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock booking data
const mockBooking = {
  booking_id: 101,
  total_amount: 500.00,
  status: 'pending',
  payment_status: 'pending',
};

// Mock payment data
const mockPayment = {
  payment_id: 1,
  booking_id: 101,
  amount: 0,
  status: 'pending',
  transaction_id: null,
  receipt_url: null,
  notes: [],
};

// Mock Manual Payment Verification Component
interface ManualPaymentVerificationProps {
  bookingId: number;
  onVerificationComplete?: (paymentId: number) => void;
}

const ManualPaymentVerification: React.FC<ManualPaymentVerificationProps> = ({
  bookingId,
  onVerificationComplete,
}) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [transactionId, setTransactionId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');
  const [note, setNote] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [uploadedReceiptUrl, setUploadedReceiptUrl] = React.useState<string | null>(null);
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);

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

  const validateFileType = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    return validTypes.includes(file.type);
  };

  const validateFileSize = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSize;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);

    // Validate file type
    if (!validateFileType(file)) {
      setError('Invalid file format. Only JPG, PNG, and PDF are allowed.');
      return;
    }

    // Validate file size
    if (!validateFileSize(file)) {
      setError('File too large (Max 5MB)');
      return;
    }

    setReceiptFile(file);
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setError(null);
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('booking_id', bookingId.toString());

      const response = await axios.post('/api/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedReceiptUrl(response.data.receipt_url);
      setSuccessMessage('Upload success. Link stored.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setError(null);
      setAlertMessage(null);
      setSuccessMessage(null);

      // Validate transaction ID
      if (!transactionId.trim()) {
        setError('Transaction ID mandatory');
        return;
      }

      // Check for duplicate transaction ID
      try {
        const checkResponse = await axios.get(`/api/payments/check-transaction/${transactionId}`);
        if (checkResponse.data.exists) {
          setError('Transaction ID already exists');
          return;
        }
      } catch (err: any) {
        // If check fails, continue (assume it doesn't exist)
      }

      const paidAmount = parseFloat(amount);
      const bookingTotal = booking.total_amount;

      let paymentStatus = 'verified';
      let bookingStatus = 'paid';

      // Check amount matching
      if (paidAmount < bookingTotal) {
        paymentStatus = 'partial';
        bookingStatus = 'partial_payment';
        setAlertMessage(`Partial payment detected. Paid: $${paidAmount}, Total: $${bookingTotal}. Alert sent.`);
      } else if (paidAmount > bookingTotal) {
        paymentStatus = 'verified';
        bookingStatus = 'paid';
        const credit = paidAmount - bookingTotal;
        setAlertMessage(`Overpayment detected. Credit of $${credit.toFixed(2)} noted.`);
      }

      // Create payment record
      const paymentResponse = await axios.post('/api/payments', {
        booking_id: bookingId,
        transaction_id: transactionId,
        amount: paidAmount,
        status: paymentStatus,
        receipt_url: uploadedReceiptUrl,
      });

      // Update booking status
      await axios.put(`/api/bookings/${bookingId}/status`, {
        status: bookingStatus,
        payment_status: paymentStatus,
      });

      if (paidAmount === bookingTotal) {
        setSuccessMessage('Payment verified successfully. Amount matches booking total.');
      } else if (paidAmount < bookingTotal) {
        setSuccessMessage('Partial payment recorded. Alert sent to customer.');
      } else {
        setSuccessMessage('Payment verified. Overpayment credit noted.');
      }

      onVerificationComplete?.(paymentResponse.data.payment_id);
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) {
      setError('Note cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await axios.post(`/api/payments/${booking.payment_id}/notes`, {
        note: note,
        created_by: 'CSA',
        timestamp: new Date().toISOString(),
      });

      setSuccessMessage('Note saved in history');
      setNote('');
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
    }
  };

  if (loading) return <div>Loading booking...</div>;
  if (!booking) return <div>No booking found</div>;

  return (
    <div data-testid="manual-payment-verification">
      <h2>Manual Payment Verification</h2>
      <div data-testid="booking-id">Booking ID: {booking.booking_id}</div>
      <div data-testid="booking-total">Total Amount: ${booking.total_amount}</div>

      {error && <div data-testid="error-message" role="alert">{error}</div>}
      {successMessage && <div data-testid="success-message" role="status">{successMessage}</div>}
      {alertMessage && <div data-testid="alert-message" role="status">{alertMessage}</div>}

      {/* Receipt Upload Section */}
      <div data-testid="receipt-upload-section">
        <h3>Upload Receipt</h3>
        <input
          type="file"
          onChange={handleFileChange}
          data-testid="file-input"
          accept=".jpg,.jpeg,.png,.pdf"
        />
        {receiptFile && (
          <div data-testid="selected-file">
            Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(2)} KB)
          </div>
        )}
        <button onClick={handleUploadReceipt} data-testid="upload-button">
          Upload Receipt
        </button>
        {uploadedReceiptUrl && (
          <div data-testid="receipt-url">Receipt URL: {uploadedReceiptUrl}</div>
        )}
      </div>

      {/* Payment Verification Section */}
      <div data-testid="payment-verification-section">
        <h3>Verify Payment</h3>
        <div>
          <label htmlFor="transaction-id">Transaction ID:</label>
          <input
            id="transaction-id"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            data-testid="transaction-id-input"
            placeholder="Enter transaction ID"
          />
        </div>
        <div>
          <label htmlFor="amount">Paid Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid="amount-input"
            placeholder="Enter paid amount"
            step="0.01"
          />
        </div>
        <button onClick={handleVerifyPayment} data-testid="verify-button">
          Verify Payment
        </button>
      </div>

      {/* Notes Section */}
      <div data-testid="notes-section">
        <h3>Add Note</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          data-testid="note-input"
          placeholder="Add note (e.g., 'Customer paid cash')"
          rows={3}
        />
        <button onClick={handleAddNote} data-testid="add-note-button">
          Add Note
        </button>
      </div>
    </div>
  );
};

describe('TC-VER-RCP-001: Upload Receipt - Valid Image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Upload JPG evidence successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });
    mockedAxios.post.mockResolvedValueOnce({
      data: { receipt_url: 'https://storage.example.com/receipts/receipt-123.jpg' },
    });

    const { getByTestId } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Create a mock JPG file
    const jpgFile = new File(['fake image content'], 'receipt.jpg', { type: 'image/jpeg' });

    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [jpgFile],
      writable: false,
    });

    // Trigger file change
    fireEvent.change(fileInput);

    // Verify file selected
    await waitFor(() => {
      expect(getByTestId('selected-file')).toHaveTextContent('receipt.jpg');
    });

    // Upload file
    fireEvent.click(getByTestId('upload-button'));

    // Verify upload success
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/receipts/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Upload success. Link stored.');
      expect(getByTestId('receipt-url')).toHaveTextContent('https://storage.example.com/receipts/receipt-123.jpg');
    });

    console.log('✓ TC-VER-RCP-001 PASSED: JPG receipt uploaded successfully');
  });
});

describe('TC-VER-RCP-002: Upload Receipt - PDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Upload banking PDF successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });
    mockedAxios.post.mockResolvedValueOnce({
      data: { receipt_url: 'https://storage.example.com/receipts/bank-statement.pdf' },
    });

    const { getByTestId } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Create a mock PDF file
    const pdfFile = new File(['fake pdf content'], 'bank-statement.pdf', { type: 'application/pdf' });

    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [pdfFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(getByTestId('selected-file')).toHaveTextContent('bank-statement.pdf');
    });

    fireEvent.click(getByTestId('upload-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(getByTestId('success-message')).toHaveTextContent('Upload success');
    });

    console.log('✓ TC-VER-RCP-002 PASSED: PDF receipt uploaded successfully');
  });
});

describe('TC-VER-RCP-003: Upload Receipt - Invalid Type', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Upload .exe file shows error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Create a mock .exe file
    const exeFile = new File(['fake exe content'], 'malware.exe', { type: 'application/x-msdownload' });

    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [exeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify error message
    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Invalid file format');
    });

    // Ensure upload was not triggered
    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ TC-VER-RCP-003 PASSED: Invalid file type rejected');
  });
});

describe('TC-VER-RCP-004: Upload Receipt - Max Size', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Upload 20MB file shows size error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Create a mock 20MB file
    const largeContent = new Uint8Array(20 * 1024 * 1024); // 20MB
    const largeFile = new File([largeContent], 'large-receipt.jpg', { type: 'image/jpeg' });

    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify size error
    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('File too large (Max 5MB)');
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ TC-VER-RCP-004 PASSED: Large file rejected');
  });
});

describe('TC-VER-RCP-005: Verify Transaction ID - Empty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Verify without transaction ID shows error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Leave transaction ID empty and try to verify
    fireEvent.change(getByTestId('amount-input'), { target: { value: '500' } });
    fireEvent.click(getByTestId('verify-button'));

    // Verify error
    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Transaction ID mandatory');
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ TC-VER-RCP-005 PASSED: Empty transaction ID rejected');
  });
});

describe('TC-VER-RCP-006: Verify Transaction ID - Duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Enter duplicate transaction ID shows error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });
    mockedAxios.get.mockResolvedValueOnce({
      data: { exists: true },
    });

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Enter duplicate transaction ID
    fireEvent.change(getByTestId('transaction-id-input'), { target: { value: 'TX123' } });
    fireEvent.change(getByTestId('amount-input'), { target: { value: '500' } });
    fireEvent.click(getByTestId('verify-button'));

    // Verify duplicate error
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/payments/check-transaction/TX123');
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Transaction ID already exists');
    });

    // Payment should not be created
    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ TC-VER-RCP-006 PASSED: Duplicate transaction ID rejected');
  });
});

describe('TC-VER-RCP-007: Verify Amount - Match', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Paid amount equals booking total - Success', async () => {
    const onVerificationComplete = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockBooking });
      }
      if (url.includes('/api/payments/check-transaction/')) {
        return Promise.resolve({ data: { exists: false } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { payment_id: 1, transaction_id: 'TX001', amount: 500, status: 'verified' },
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { booking_id: 101, status: 'paid' },
    });

    const { getByTestId } = render(
      <ManualPaymentVerification bookingId={101} onVerificationComplete={onVerificationComplete} />
    );

    await waitFor(() => {
      expect(getByTestId('booking-total')).toHaveTextContent('500');
    });

    // Enter matching amount
    fireEvent.change(getByTestId('transaction-id-input'), { target: { value: 'TX001' } });
    fireEvent.change(getByTestId('amount-input'), { target: { value: '500' } });
    fireEvent.click(getByTestId('verify-button'));

    // Verify success
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments',
        expect.objectContaining({
          booking_id: 101,
          transaction_id: 'TX001',
          amount: 500,
          status: 'verified',
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Amount matches booking total');
    });

    expect(onVerificationComplete).toHaveBeenCalledWith(1);

    console.log('✓ TC-VER-RCP-007 PASSED: Matching amount verified successfully');
  });
});

describe('TC-VER-RCP-008: Verify Amount - Underpayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Paid amount less than total - Partial payment alert', async () => {
    const onVerificationComplete = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockBooking });
      }
      if (url.includes('/api/payments/check-transaction/')) {
        return Promise.resolve({ data: { exists: false } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { payment_id: 2, transaction_id: 'TX002', amount: 300, status: 'partial' },
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { booking_id: 101, status: 'partial_payment' },
    });

    const { getByTestId } = render(
      <ManualPaymentVerification bookingId={101} onVerificationComplete={onVerificationComplete} />
    );

    await waitFor(() => {
      expect(getByTestId('booking-total')).toHaveTextContent('500');
    });

    // Enter less than total amount
    fireEvent.change(getByTestId('transaction-id-input'), { target: { value: 'TX002' } });
    fireEvent.change(getByTestId('amount-input'), { target: { value: '300' } });
    fireEvent.click(getByTestId('verify-button'));

    // Verify partial payment handling
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments',
        expect.objectContaining({
          amount: 300,
          status: 'partial',
        })
      );
      expect(getByTestId('alert-message')).toHaveTextContent('Partial payment detected');
      expect(getByTestId('alert-message')).toHaveTextContent('Alert sent');
      expect(getByTestId('success-message')).toHaveTextContent('Partial payment recorded');
    });

    console.log('✓ TC-VER-RCP-008 PASSED: Underpayment handled with alert');
  });
});

describe('TC-VER-RCP-009: Verify Amount - Overpayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Paid amount more than total - Credit noted', async () => {
    const onVerificationComplete = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockBooking });
      }
      if (url.includes('/api/payments/check-transaction/')) {
        return Promise.resolve({ data: { exists: false } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { payment_id: 3, transaction_id: 'TX003', amount: 600, status: 'verified' },
    });

    mockedAxios.put.mockResolvedValueOnce({
      data: { booking_id: 101, status: 'paid' },
    });

    const { getByTestId } = render(
      <ManualPaymentVerification bookingId={101} onVerificationComplete={onVerificationComplete} />
    );

    await waitFor(() => {
      expect(getByTestId('booking-total')).toHaveTextContent('500');
    });

    // Enter more than total amount
    fireEvent.change(getByTestId('transaction-id-input'), { target: { value: 'TX003' } });
    fireEvent.change(getByTestId('amount-input'), { target: { value: '600' } });
    fireEvent.click(getByTestId('verify-button'));

    // Verify overpayment handling
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments',
        expect.objectContaining({
          amount: 600,
          status: 'verified',
        })
      );
      expect(getByTestId('alert-message')).toHaveTextContent('Overpayment detected');
      expect(getByTestId('alert-message')).toHaveTextContent('Credit of $100.00 noted');
      expect(getByTestId('success-message')).toHaveTextContent('Overpayment credit noted');
    });

    console.log('✓ TC-VER-RCP-009 PASSED: Overpayment handled with credit note');
  });
});

describe('TC-VER-RCP-010: Add Note to Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Add "Customer paid cash" note successfully', async () => {
    const bookingWithPayment = {
      ...mockBooking,
      payment_id: 1,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: bookingWithPayment });
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        note_id: 1,
        note: 'Customer paid cash',
        created_by: 'CSA',
      },
    });

    const { getByTestId } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Add note
    fireEvent.change(getByTestId('note-input'), { target: { value: 'Customer paid cash' } });
    fireEvent.click(getByTestId('add-note-button'));

    // Verify note saved
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/payments/1/notes',
        expect.objectContaining({
          note: 'Customer paid cash',
          created_by: 'CSA',
        })
      );
      expect(getByTestId('success-message')).toHaveTextContent('Note saved in history');
    });

    console.log('✓ TC-VER-RCP-010 PASSED: Note added to payment history');
  });
});

describe('Additional Manual Verification Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should handle API error when fetching booking', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    const { getByText } = render(<ManualPaymentVerification bookingId={999} />);

    await waitFor(() => {
      expect(getByText('No booking found')).toBeInTheDocument();
    });
  });

  it('Should handle upload API error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });
    mockedAxios.post.mockRejectedValueOnce(new Error('Upload failed'));

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    const jpgFile = new File(['content'], 'receipt.jpg', { type: 'image/jpeg' });
    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [jpgFile],
      writable: false,
    });

    fireEvent.change(fileInput);
    fireEvent.click(getByTestId('upload-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Upload failed');
    });
  });

  it('Should handle payment verification API error', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/api/bookings/')) {
        return Promise.resolve({ data: mockBooking });
      }
      if (url.includes('/api/payments/check-transaction/')) {
        return Promise.resolve({ data: { exists: false } });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockRejectedValueOnce(new Error('Payment creation failed'));

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('transaction-id-input'), { target: { value: 'TX999' } });
    fireEvent.change(getByTestId('amount-input'), { target: { value: '500' } });
    fireEvent.click(getByTestId('verify-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Payment creation failed');
    });
  });

  it('Should handle empty note submission', async () => {
    const bookingWithPayment = { ...mockBooking, payment_id: 1 };
    mockedAxios.get.mockResolvedValueOnce({ data: bookingWithPayment });

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    // Try to add empty note
    fireEvent.click(getByTestId('add-note-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Note cannot be empty');
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('Should handle add note API error', async () => {
    const bookingWithPayment = { ...mockBooking, payment_id: 1 };
    mockedAxios.get.mockResolvedValueOnce({ data: bookingWithPayment });
    mockedAxios.post.mockRejectedValueOnce(new Error('Database error'));

    const { getByTestId, getByRole } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('note-input'), { target: { value: 'Test note' } });
    fireEvent.click(getByTestId('add-note-button'));

    await waitFor(() => {
      const alert = getByRole('alert');
      expect(alert).toHaveTextContent('Database error');
    });
  });

  it('Should handle PNG file upload', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockBooking });
    mockedAxios.post.mockResolvedValueOnce({
      data: { receipt_url: 'https://storage.example.com/receipts/receipt.png' },
    });

    const { getByTestId } = render(<ManualPaymentVerification bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('booking-id')).toBeInTheDocument();
    });

    const pngFile = new File(['content'], 'receipt.png', { type: 'image/png' });
    const fileInput = getByTestId('file-input') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [pngFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(getByTestId('selected-file')).toHaveTextContent('receipt.png');
    });

    fireEvent.click(getByTestId('upload-button'));

    await waitFor(() => {
      expect(getByTestId('success-message')).toHaveTextContent('Upload success');
    });
  });
});
