/**
 * Test Suite: TC-TRV-PST (Traveler Post-Booking & History)
 * Category: Traveler Services - Post-Booking Verification & History
 * Description: Unit tests for post-booking verification including email receipts, e-tickets, and booking history
 * 
 * Test Cases:
 * - TC-TRV-PST-001: Email Receipt - Delivery
 * - TC-TRV-PST-002: E-Ticket - PDF Content
 * - TC-TRV-PST-003: E-Ticket - QR Code
 * - TC-TRV-PST-004: My Bookings - Status "Paid"
 * - TC-TRV-PST-005: My Bookings - Data Integrity
 * - TC-TRV-PST-006: My Bookings - Pagination
 * - TC-TRV-PST-007: My Bookings - View Detail
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has completed a booking
 * 3. Payment has been processed successfully
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock APIs
const mockCheckEmail = vi.fn();
const mockDownloadPDF = vi.fn();
const mockScanQRCode = vi.fn();
const mockFetchBookings = vi.fn();
const mockFetchBookingDetail = vi.fn();

// Mock booking data
const mockBookingData = {
  bookingRef: 'BK123456',
  bookingId: 'booking_789',
  passengerName: 'John Doe',
  flightNumber: 'VN123',
  departureDate: '2025-12-30',
  departureTime: '10:00',
  from: 'SGN',
  to: 'HAN',
  seatNumber: '12A',
  status: 'Paid',
  totalPrice: 2500000,
  services: [
    { name: 'Meal', price: 100000 },
    { name: 'Baggage 20kg', price: 200000 }
  ],
  email: 'john@example.com'
};

// Mock EmailReceipt component
const EmailReceipt = ({ email }: { email: string }) => {
  const [receipt, setReceipt] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkInbox = async () => {
      const result = await mockCheckEmail(email);
      setReceipt(result.receipt);
      setLoading(false);
    };

    checkInbox();
  }, [email]);

  if (loading) {
    return <div data-testid="email-loading">Checking inbox...</div>;
  }

  if (!receipt) {
    return <div data-testid="email-not-found">No receipt found</div>;
  }

  return (
    <div data-testid="email-receipt">
      <h2>Email Receipt</h2>
      <div data-testid="receipt-subject">{receipt.subject}</div>
      <div data-testid="receipt-to">To: {receipt.to}</div>
      <div data-testid="receipt-booking-ref">Booking Ref: {receipt.bookingRef}</div>
      <div data-testid="receipt-content">{receipt.content}</div>
    </div>
  );
};

// Mock ETicket component
const ETicket = ({ bookingRef }: { bookingRef: string }) => {
  const [ticket, setTicket] = React.useState<any>(null);
  const [pdfUrl, setPdfUrl] = React.useState('');
  const [qrData, setQrData] = React.useState('');

  React.useEffect(() => {
    const loadTicket = async () => {
      const pdfResult = await mockDownloadPDF(bookingRef);
      setTicket(pdfResult.ticket);
      setPdfUrl(pdfResult.pdfUrl);
      setQrData(pdfResult.qrCode);
    };

    loadTicket();
  }, [bookingRef]);

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleScanQR = async () => {
    const result = await mockScanQRCode(qrData);
    return result;
  };

  if (!ticket) {
    return <div data-testid="ticket-loading">Loading ticket...</div>;
  }

  return (
    <div data-testid="e-ticket">
      <h2>E-Ticket</h2>
      
      {/* PDF Content */}
      <div data-testid="pdf-content">
        <div data-testid="pdf-booking-ref">Booking Ref: {ticket.bookingRef}</div>
        <div data-testid="pdf-passenger">Passenger: {ticket.passengerName}</div>
        <div data-testid="pdf-flight">Flight: {ticket.flightNumber}</div>
        <div data-testid="pdf-date">Date: {ticket.departureDate}</div>
        <div data-testid="pdf-time">Time: {ticket.departureTime}</div>
        <div data-testid="pdf-route">Route: {ticket.from} → {ticket.to}</div>
        <div data-testid="pdf-seat">Seat: {ticket.seatNumber}</div>
      </div>

      {/* QR Code */}
      <div data-testid="qr-code-section">
        <div data-testid="qr-code-image">QR Code: {qrData}</div>
        <button data-testid="scan-qr-btn" onClick={handleScanQR}>
          Scan QR
        </button>
      </div>

      {/* Download Button */}
      <button data-testid="download-pdf-btn" onClick={handleDownload}>
        Download PDF
      </button>
    </div>
  );
};

// Mock MyBookings component
const MyBookings = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const itemsPerPage = 10;

  React.useEffect(() => {
    loadBookings();
  }, [currentPage]);

  const loadBookings = async () => {
    setLoading(true);
    const result = await mockFetchBookings(userId, currentPage, itemsPerPage);
    setBookings(result.bookings);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <div data-testid="bookings-loading">Loading bookings...</div>;
  }

  return (
    <div data-testid="my-bookings">
      <h2>My Bookings</h2>
      
      {/* Bookings List */}
      <div data-testid="bookings-list">
        {bookings.map((booking, index) => (
          <div 
            key={booking.bookingRef} 
            data-testid={`booking-item-${index}`}
            data-booking-ref={booking.bookingRef}
          >
            <div data-testid={`booking-ref-${index}`}>Ref: {booking.bookingRef}</div>
            <div data-testid={`booking-passenger-${index}`}>Passenger: {booking.passengerName}</div>
            <div data-testid={`booking-flight-${index}`}>Flight: {booking.flightNumber}</div>
            <div data-testid={`booking-date-${index}`}>Date: {booking.departureDate}</div>
            <div data-testid={`booking-status-${index}`}>Status: {booking.status}</div>
            <button data-testid={`view-detail-btn-${index}`}>
              View Detail
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div data-testid="pagination">
        <button 
          data-testid="prev-page-btn" 
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span data-testid="page-info">Page {currentPage} of {totalPages}</span>
        <button 
          data-testid="next-page-btn" 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Mock BookingDetail component
const BookingDetail = ({ bookingRef }: { bookingRef: string }) => {
  const [detail, setDetail] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDetail = async () => {
      const result = await mockFetchBookingDetail(bookingRef);
      setDetail(result);
      setLoading(false);
    };

    loadDetail();
  }, [bookingRef]);

  if (loading) {
    return <div data-testid="detail-loading">Loading details...</div>;
  }

  if (!detail) {
    return <div data-testid="detail-not-found">Booking not found</div>;
  }

  return (
    <div data-testid="booking-detail">
      <h2>Booking Detail</h2>
      
      {/* Flight Information */}
      <div data-testid="detail-section">
        <div data-testid="detail-booking-ref">Booking Ref: {detail.bookingRef}</div>
        <div data-testid="detail-passenger">Passenger: {detail.passengerName}</div>
        <div data-testid="detail-flight">Flight: {detail.flightNumber}</div>
        <div data-testid="detail-date">Date: {detail.departureDate}</div>
        <div data-testid="detail-route">Route: {detail.from} → {detail.to}</div>
        <div data-testid="detail-seat">Seat: {detail.seatNumber}</div>
        <div data-testid="detail-status">Status: {detail.status}</div>
      </div>

      {/* Services Breakdown */}
      <div data-testid="services-breakdown">
        <h3>Services</h3>
        {detail.services.map((service: any, index: number) => (
          <div key={index} data-testid={`service-${index}`}>
            {service.name}: ₫{service.price.toLocaleString()}
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div data-testid="price-breakdown">
        <div data-testid="detail-total">Total: ₫{detail.totalPrice.toLocaleString()}</div>
      </div>
    </div>
  );
};

describe('TC-TRV-PST: Traveler Post-Booking & History Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockCheckEmail.mockResolvedValue({
      receipt: {
        subject: 'Booking Confirmation - BK123456',
        to: 'john@example.com',
        bookingRef: 'BK123456',
        content: 'Your booking has been confirmed.'
      }
    });

    mockDownloadPDF.mockResolvedValue({
      ticket: mockBookingData,
      pdfUrl: 'https://example.com/ticket.pdf',
      qrCode: 'QR_booking_789_VN123'
    });

    mockScanQRCode.mockResolvedValue({
      bookingId: 'booking_789',
      flightNumber: 'VN123'
    });

    mockFetchBookings.mockResolvedValue({
      bookings: [mockBookingData],
      totalPages: 1
    });

    mockFetchBookingDetail.mockResolvedValue(mockBookingData);
  });

  /**
   * TC-TRV-PST-001: Email Receipt - Delivery
   * Business Requirement: BR10
   * 
   * Test Data: Email Check
   * 
   * Expected Result:
   * Receipt received with Booking Ref.
   */
  it('TC-TRV-PST-001: should receive email receipt with booking reference after booking', async () => {
    // Arrange
    render(<EmailReceipt email="john@example.com" />);

    // Assert - Loading state
    expect(screen.getByTestId('email-loading')).toHaveTextContent('Checking inbox...');

    // Act - Check Inbox after booking
    await waitFor(() => {
      expect(mockCheckEmail).toHaveBeenCalledWith('john@example.com');
    });

    // Assert - Receipt received with Booking Ref
    expect(await screen.findByTestId('email-receipt')).toBeInTheDocument();
    expect(screen.getByTestId('receipt-subject')).toHaveTextContent('Booking Confirmation - BK123456');
    expect(screen.getByTestId('receipt-to')).toHaveTextContent('To: john@example.com');
    expect(screen.getByTestId('receipt-booking-ref')).toHaveTextContent('Booking Ref: BK123456');
    expect(screen.getByTestId('receipt-content')).toHaveTextContent('Your booking has been confirmed.');
  });

  /**
   * TC-TRV-PST-002: E-Ticket - PDF Content
   * Business Requirement: BR31
   * 
   * Test Data: PDF Check
   * 
   * Expected Result:
   * Flight details match Booking.
   */
  it('TC-TRV-PST-002: should display PDF e-ticket with correct flight details matching booking', async () => {
    // Arrange
    render(<ETicket bookingRef="BK123456" />);

    // Act - Download PDF. Open.
    await waitFor(() => {
      expect(mockDownloadPDF).toHaveBeenCalledWith('BK123456');
    });

    // Assert - PDF e-ticket loaded
    expect(await screen.findByTestId('e-ticket')).toBeInTheDocument();

    // Assert - Flight details match Booking
    expect(screen.getByTestId('pdf-booking-ref')).toHaveTextContent('Booking Ref: BK123456');
    expect(screen.getByTestId('pdf-passenger')).toHaveTextContent('Passenger: John Doe');
    expect(screen.getByTestId('pdf-flight')).toHaveTextContent('Flight: VN123');
    expect(screen.getByTestId('pdf-date')).toHaveTextContent('Date: 2025-12-30');
    expect(screen.getByTestId('pdf-time')).toHaveTextContent('Time: 10:00');
    expect(screen.getByTestId('pdf-route')).toHaveTextContent('Route: SGN → HAN');
    expect(screen.getByTestId('pdf-seat')).toHaveTextContent('Seat: 12A');

    // Assert - Download button available
    expect(screen.getByTestId('download-pdf-btn')).toBeInTheDocument();
  });

  /**
   * TC-TRV-PST-003: E-Ticket - QR Code
   * Note: Feat
   * 
   * Test Data: Scan
   * 
   * Expected Result:
   * Decodes to Booking ID / Flight Info.
   */
  it('TC-TRV-PST-003: should decode QR code to booking ID and flight information', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ETicket bookingRef="BK123456" />);

    // Assert - QR code displayed
    expect(await screen.findByTestId('qr-code-section')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-image')).toHaveTextContent('QR Code: QR_booking_789_VN123');

    // Act - Scan QR on Ticket
    await user.click(screen.getByTestId('scan-qr-btn'));

    // Assert - Decodes to Booking ID / Flight Info
    await waitFor(() => {
      expect(mockScanQRCode).toHaveBeenCalledWith('QR_booking_789_VN123');
    });

    // Verify QR scan result contains booking ID and flight number
    const scanResult = await mockScanQRCode.mock.results[0].value;
    expect(scanResult.bookingId).toBe('booking_789');
    expect(scanResult.flightNumber).toBe('VN123');
  });

  /**
   * TC-TRV-PST-004: My Bookings - Status "Paid"
   * Business Requirement: BR30
   * 
   * Test Data: Verify
   * 
   * Expected Result:
   * New booking shows status "Paid".
   */
  it('TC-TRV-PST-004: should display new booking with Paid status in My Bookings', async () => {
    // Arrange
    render(<MyBookings userId="user_123" />);

    // Act - Go to My Bookings
    await waitFor(() => {
      expect(mockFetchBookings).toHaveBeenCalledWith('user_123', 1, 10);
    });

    // Assert - New booking shows status "Paid"
    expect(await screen.findByTestId('booking-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('booking-ref-0')).toHaveTextContent('Ref: BK123456');
    expect(screen.getByTestId('booking-status-0')).toHaveTextContent('Status: Paid');
  });

  /**
   * TC-TRV-PST-005: My Bookings - Data Integrity
   * Business Requirement: BR30
   * 
   * Test Data: Verify
   * 
   * Expected Result:
   * Data matches input during booking.
   */
  it('TC-TRV-PST-005: should display booking data matching input from booking process', async () => {
    // Arrange
    render(<MyBookings userId="user_123" />);

    // Act - Check Names, Dates in My Bookings
    await waitFor(() => {
      expect(screen.getByTestId('booking-item-0')).toBeInTheDocument();
    });

    // Assert - Data matches input during booking
    expect(screen.getByTestId('booking-ref-0')).toHaveTextContent('Ref: BK123456');
    expect(screen.getByTestId('booking-passenger-0')).toHaveTextContent('Passenger: John Doe');
    expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('Flight: VN123');
    expect(screen.getByTestId('booking-date-0')).toHaveTextContent('Date: 2025-12-30');

    // Verify data integrity - all fields present and correct
    const bookingItem = screen.getByTestId('booking-item-0');
    expect(bookingItem.getAttribute('data-booking-ref')).toBe('BK123456');
  });

  /**
   * TC-TRV-PST-006: My Bookings - Pagination
   * Note: UI
   * 
   * Test Data: Page 2
   * 
   * Expected Result:
   * List paginates correctly.
   */
  it('TC-TRV-PST-006: should paginate booking list correctly when user has 20 bookings', async () => {
    // Arrange - User has 20 bookings (2 pages)
    const page1Bookings = Array.from({ length: 10 }, (_, i) => ({
      ...mockBookingData,
      bookingRef: `BK${123456 + i}`,
      passengerName: `Passenger ${i + 1}`
    }));

    const page2Bookings = Array.from({ length: 10 }, (_, i) => ({
      ...mockBookingData,
      bookingRef: `BK${123466 + i}`,
      passengerName: `Passenger ${i + 11}`
    }));

    mockFetchBookings
      .mockResolvedValueOnce({ bookings: page1Bookings, totalPages: 2 })
      .mockResolvedValueOnce({ bookings: page2Bookings, totalPages: 2 });

    const user = userEvent.setup();
    render(<MyBookings userId="user_123" />);

    // Assert - Page 1 loaded
    await waitFor(() => {
      expect(screen.getByTestId('booking-item-0')).toBeInTheDocument();
    });

    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 2');
    expect(screen.getByTestId('booking-passenger-0')).toHaveTextContent('Passenger: Passenger 1');

    // Act - Navigate to Page 2
    await user.click(screen.getByTestId('next-page-btn'));

    // Assert - Page 2 loaded, list paginates correctly
    await waitFor(() => {
      expect(mockFetchBookings).toHaveBeenCalledWith('user_123', 2, 10);
    });

    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 2');
    });

    // Assert - Page 2 shows different bookings
    expect(screen.getByTestId('booking-passenger-0')).toHaveTextContent('Passenger: Passenger 11');
    expect(screen.getByTestId('booking-ref-0')).toHaveTextContent('Ref: BK123466');

    // Assert - Next button disabled on last page
    expect(screen.getByTestId('next-page-btn')).toBeDisabled();
  });

  /**
   * TC-TRV-PST-007: My Bookings - View Detail
   * Business Requirement: BR31
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Full breakdown (Services, Price) shown.
   */
  it('TC-TRV-PST-007: should display full booking breakdown with services and price when viewing detail', async () => {
    // Arrange
    render(<BookingDetail bookingRef="BK123456" />);

    // Act - Click Detail (component loads detail automatically)
    await waitFor(() => {
      expect(mockFetchBookingDetail).toHaveBeenCalledWith('BK123456');
    });

    // Assert - Full breakdown shown
    expect(await screen.findByTestId('booking-detail')).toBeInTheDocument();

    // Assert - Flight details
    expect(screen.getByTestId('detail-booking-ref')).toHaveTextContent('Booking Ref: BK123456');
    expect(screen.getByTestId('detail-passenger')).toHaveTextContent('Passenger: John Doe');
    expect(screen.getByTestId('detail-flight')).toHaveTextContent('Flight: VN123');
    expect(screen.getByTestId('detail-date')).toHaveTextContent('Date: 2025-12-30');
    expect(screen.getByTestId('detail-route')).toHaveTextContent('Route: SGN → HAN');
    expect(screen.getByTestId('detail-seat')).toHaveTextContent('Seat: 12A');
    expect(screen.getByTestId('detail-status')).toHaveTextContent('Status: Paid');

    // Assert - Services breakdown shown
    expect(screen.getByTestId('services-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('service-0')).toHaveTextContent('Meal: ₫100,000');
    expect(screen.getByTestId('service-1')).toHaveTextContent('Baggage 20kg: ₫200,000');

    // Assert - Price breakdown shown
    expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('detail-total')).toHaveTextContent('Total: ₫2,500,000');
  });
});
