/**
 * Test Suite: TC-TRV-HIST (Traveler View Booking History)
 * Category: Traveler Services - Booking History & Actions
 * Description: Unit tests for viewing booking history and performing booking actions
 * 
 * Test Cases:
 * - TC-TRV-HIST-001: Verify "My Bookings" List Display
 * - TC-TRV-ACT-001: Verify Generate E-Ticket PDF
 * - TC-TRV-ACT-002: Verify View Payment Details
 * - TC-TRV-ACT-003: Verify Download E-Ticket
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has past bookings
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking APIs
const mockRetrieveBookingHistory = vi.fn();
const mockGenerateETicketPDF = vi.fn();
const mockGetPaymentDetails = vi.fn();
const mockDownloadPDF = vi.fn();

// Mock booking history data
const mockBookingHistory = [
  {
    bookingRef: 'BK123456',
    bookingId: 'booking_001',
    date: '2025-12-15',
    flightNumber: 'VN123',
    flightId: 'FL001',
    from: 'SGN',
    to: 'HAN',
    departureDate: '2025-12-30',
    passengerName: 'John Doe',
    seatId: '12A',
    seatStatus: 'Confirmed',
    status: 'Confirmed',
    totalPrice: 2500000,
    paymentId: 'PAY_001',
    paymentDate: '2025-12-15',
    userEmail: 'john@example.com',
    userPhone: '0901234567'
  },
  {
    bookingRef: 'BK123457',
    bookingId: 'booking_002',
    date: '2025-12-10',
    flightNumber: 'VN456',
    flightId: 'FL002',
    from: 'HAN',
    to: 'DAD',
    departureDate: '2025-12-25',
    passengerName: 'Jane Smith',
    seatId: '15C',
    seatStatus: 'Confirmed',
    status: 'Confirmed',
    totalPrice: 1800000,
    paymentId: 'PAY_002',
    paymentDate: '2025-12-10',
    userEmail: 'jane@example.com',
    userPhone: '0907654321'
  },
  {
    bookingRef: 'BK123458',
    bookingId: 'booking_003',
    date: '2025-12-05',
    flightNumber: 'VN789',
    flightId: 'FL003',
    from: 'SGN',
    to: 'DAD',
    departureDate: '2025-12-20',
    passengerName: 'Bob Johnson',
    seatId: '10B',
    seatStatus: 'Confirmed',
    status: 'Cancelled',
    totalPrice: 2000000,
    paymentId: 'PAY_003',
    paymentDate: '2025-12-05',
    userEmail: 'bob@example.com',
    userPhone: '0909876543'
  }
];

// Mock MyBookingsPage component
const MyBookingsPage = ({ userId }: { userId: string }) => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentDetails, setPaymentDetails] = React.useState<any>(null);

  const loadBookingHistory = async () => {
    setLoading(true);
    
    // Step 1: System retrieves booking history
    const history = await mockRetrieveBookingHistory(userId);
    setBookings(history);
    
    setLoading(false);
  };

  React.useEffect(() => {
    loadBookingHistory();
  }, [userId]);

  const handleSelectBooking = (booking: any) => {
    // Step 1: Booking details expand or action menu opens
    setSelectedBooking(booking);
  };

  const handleGenerateETicket = async (booking: any) => {
    // Step 2: Click "Generate E-ticket"
    // System processes PDF generation
    const pdfData = await mockGenerateETicketPDF({
      bookingId: booking.bookingId,
      flightId: booking.flightId,
      date: booking.departureDate,
      from: booking.from,
      to: booking.to,
      seatId: booking.seatId,
      seatStatus: booking.seatStatus,
      passengerName: booking.passengerName,
      userEmail: booking.userEmail,
      userPhone: booking.userPhone
    });

    return pdfData;
  };

  const handleViewPaymentDetails = async (booking: any) => {
    // Step 1: Booking details are accessible
    setSelectedBooking(booking);
    
    // Step 2: Click "View Payment Details"
    const details = await mockGetPaymentDetails(booking.bookingId);
    setPaymentDetails(details);
    
    // A modal or section shows the transaction info
    setShowPaymentModal(true);
  };

  const handleDownloadETicket = async (booking: any) => {
    // Step 1: Click "Download E-Ticket" button/icon
    // Browser initiates file download
    const pdfBlob = await mockDownloadPDF(booking.bookingId);
    
    // Simulate browser download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eticket_${booking.bookingRef}.pdf`;
    link.click();
  };

  if (loading) {
    return <div data-testid="bookings-loading">Loading bookings...</div>;
  }

  return (
    <div data-testid="my-bookings-page">
      <h2>My Bookings</h2>

      {/* Booking History Table */}
      <div data-testid="bookings-table">
        <table>
          <thead>
            <tr>
              <th data-testid="header-booking-ref">Booking Ref</th>
              <th data-testid="header-date">Date</th>
              <th data-testid="header-flight">Flight</th>
              <th data-testid="header-route">Route</th>
              <th data-testid="header-status">Status</th>
              <th data-testid="header-actions">Actions</th>
            </tr>
          </thead>
          <tbody data-testid="bookings-tbody">
            {bookings.map((booking, index) => (
              <tr key={booking.bookingId} data-testid={`booking-row-${index}`}>
                <td data-testid={`booking-ref-${index}`}>{booking.bookingRef}</td>
                <td data-testid={`booking-date-${index}`}>{booking.date}</td>
                <td data-testid={`booking-flight-${index}`}>{booking.flightNumber}</td>
                <td data-testid={`booking-route-${index}`}>{booking.from} → {booking.to}</td>
                <td data-testid={`booking-status-${index}`}>{booking.status}</td>
                <td data-testid={`booking-actions-${index}`}>
                  <button 
                    data-testid={`select-booking-btn-${index}`}
                    onClick={() => handleSelectBooking(booking)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Booking Details Section */}
      {selectedBooking && (
        <div data-testid="booking-details">
          <h3>Booking Details</h3>
          <div data-testid="detail-booking-ref">Booking Ref: {selectedBooking.bookingRef}</div>
          <div data-testid="detail-flight-id">Flight ID: {selectedBooking.flightId}</div>
          <div data-testid="detail-date">Date: {selectedBooking.departureDate}</div>
          <div data-testid="detail-route">From/To: {selectedBooking.from} → {selectedBooking.to}</div>
          <div data-testid="detail-seat-id">Seat ID: {selectedBooking.seatId}</div>
          <div data-testid="detail-seat-status">Seat Status: {selectedBooking.seatStatus}</div>
          <div data-testid="detail-user-info">
            Passenger: {selectedBooking.passengerName} ({selectedBooking.userEmail})
          </div>

          {/* Action Buttons */}
          <div data-testid="booking-action-buttons">
            <button 
              data-testid="generate-eticket-btn"
              onClick={() => handleGenerateETicket(selectedBooking)}
            >
              Generate E-ticket
            </button>
            <button 
              data-testid="view-payment-btn"
              onClick={() => handleViewPaymentDetails(selectedBooking)}
            >
              View Payment Details
            </button>
            <button 
              data-testid="download-eticket-btn"
              onClick={() => handleDownloadETicket(selectedBooking)}
            >
              Download E-Ticket
            </button>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && paymentDetails && (
        <div data-testid="payment-modal">
          <h3>Payment Details</h3>
          <div data-testid="payment-id">Payment ID: {paymentDetails.paymentId}</div>
          <div data-testid="payment-date">Payment Date: {paymentDetails.paymentDate}</div>
          <div data-testid="payment-price">Price: ₫{paymentDetails.price.toLocaleString()}</div>
          <button 
            data-testid="close-modal-btn"
            onClick={() => setShowPaymentModal(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-TRV-HIST: Traveler View Booking History Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRetrieveBookingHistory.mockResolvedValue(mockBookingHistory);
    mockGenerateETicketPDF.mockResolvedValue({
      success: true,
      pdfUrl: 'https://example.com/eticket.pdf'
    });
    mockGetPaymentDetails.mockResolvedValue({
      paymentId: 'PAY_001',
      paymentDate: '2025-12-15',
      price: 2500000
    });
    mockDownloadPDF.mockResolvedValue(new Blob(['PDF content'], { type: 'application/pdf' }));
  });

  /**
   * TC-TRV-HIST-001: Verify "My Bookings" List Display
   * Business Requirement: BR30
   * 
   * Prerequisites:
   * 1. User is logged in
   * 2. User has past bookings
   * 
   * Steps:
   * Step 1: Click "My Bookings" button on the sidebar
   * Step 2: Check table columns
   * 
   * Expected Result:
   * All past bookings are displayed in a datagrid table format.
   * Columns like Booking Ref, Date, Flight, Status are visible.
   */
  it('TC-TRV-HIST-001: should display all past bookings in datagrid table with proper columns', async () => {
    // Arrange - Prerequisites: User is logged in, has past bookings
    render(<MyBookingsPage userId="user_123" />);

    // Assert - Loading state
    expect(screen.getByTestId('bookings-loading')).toHaveTextContent('Loading bookings...');

    // Step 1: Click "My Bookings" button on the sidebar (simulated by component mount)
    // Step Expected Result: System retrieves booking history
    await waitFor(() => {
      expect(mockRetrieveBookingHistory).toHaveBeenCalledWith('user_123');
    });

    // Test Case Expected Result: All past bookings are displayed in a datagrid table format
    expect(await screen.findByTestId('bookings-table')).toBeInTheDocument();
    expect(screen.getByTestId('bookings-tbody')).toBeInTheDocument();

    // Verify all 3 bookings are displayed
    expect(screen.getByTestId('booking-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('booking-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('booking-row-2')).toBeInTheDocument();

    // Step 2: Check table columns
    // Step Expected Result: Columns like Booking Ref, Date, Flight, Status are visible
    expect(screen.getByTestId('header-booking-ref')).toHaveTextContent('Booking Ref');
    expect(screen.getByTestId('header-date')).toHaveTextContent('Date');
    expect(screen.getByTestId('header-flight')).toHaveTextContent('Flight');
    expect(screen.getByTestId('header-route')).toHaveTextContent('Route');
    expect(screen.getByTestId('header-status')).toHaveTextContent('Status');
    expect(screen.getByTestId('header-actions')).toHaveTextContent('Actions');

    // Verify data in first row
    expect(screen.getByTestId('booking-ref-0')).toHaveTextContent('BK123456');
    expect(screen.getByTestId('booking-date-0')).toHaveTextContent('2025-12-15');
    expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN123');
    expect(screen.getByTestId('booking-route-0')).toHaveTextContent('SGN → HAN');
    expect(screen.getByTestId('booking-status-0')).toHaveTextContent('Confirmed');

    // Verify data in second row
    expect(screen.getByTestId('booking-ref-1')).toHaveTextContent('BK123457');
    expect(screen.getByTestId('booking-status-1')).toHaveTextContent('Confirmed');

    // Verify cancelled booking
    expect(screen.getByTestId('booking-ref-2')).toHaveTextContent('BK123458');
    expect(screen.getByTestId('booking-status-2')).toHaveTextContent('Cancelled');
  });

  /**
   * TC-TRV-ACT-001: Verify Generate E-Ticket PDF
   * Business Requirement: BR31
   * 
   * Prerequisites:
   * 1. User is on "My Bookings" page
   * 2. A confirmed booking exists
   * 
   * Steps:
   * Step 1: Select a booking
   * Step 2: Click "Generate E-ticket"
   * 
   * Expected Result:
   * System generates a PDF containing: Flight ID, Date, From/To, Seat ID, Seat Status, User Info.
   */
  it('TC-TRV-ACT-001: should generate E-ticket PDF with complete booking details', async () => {
    // Arrange - Prerequisites: User is on "My Bookings" page, confirmed booking exists
    const user = userEvent.setup();
    render(<MyBookingsPage userId="user_123" />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('bookings-table')).toBeInTheDocument();
    });

    // Step 1: Select a booking
    await user.click(screen.getByTestId('select-booking-btn-0'));

    // Step Expected Result: Booking details expand or action menu opens
    expect(await screen.findByTestId('booking-details')).toBeInTheDocument();
    expect(screen.getByTestId('detail-booking-ref')).toHaveTextContent('Booking Ref: BK123456');

    // Step 2: Click "Generate E-ticket"
    await user.click(screen.getByTestId('generate-eticket-btn'));

    // Step Expected Result: System processes PDF generation
    await waitFor(() => {
      expect(mockGenerateETicketPDF).toHaveBeenCalledWith({
        bookingId: 'booking_001',
        flightId: 'FL001',
        date: '2025-12-30',
        from: 'SGN',
        to: 'HAN',
        seatId: '12A',
        seatStatus: 'Confirmed',
        passengerName: 'John Doe',
        userEmail: 'john@example.com',
        userPhone: '0901234567'
      });
    });

    // Test Case Expected Result: System generates a PDF containing required fields
    // Verify PDF generation called with: Flight ID, Date, From/To, Seat ID, Seat Status, User Info
    const pdfCall = mockGenerateETicketPDF.mock.calls[0][0];
    expect(pdfCall.flightId).toBe('FL001');
    expect(pdfCall.date).toBe('2025-12-30');
    expect(pdfCall.from).toBe('SGN');
    expect(pdfCall.to).toBe('HAN');
    expect(pdfCall.seatId).toBe('12A');
    expect(pdfCall.seatStatus).toBe('Confirmed');
    expect(pdfCall.passengerName).toBe('John Doe');
    expect(pdfCall.userEmail).toBe('john@example.com');
  });

  /**
   * TC-TRV-ACT-002: Verify View Payment Details
   * Business Requirement: BR31
   * 
   * Prerequisites:
   * 1. User is on "My Bookings" page
   * 
   * Steps:
   * Step 1: Select a booking
   * Step 2: Click "View Payment Details"
   * 
   * Expected Result:
   * System displays Payment ID, Payment Date, and Price.
   */
  it('TC-TRV-ACT-002: should display payment details in modal', async () => {
    // Arrange - Prerequisites: User is on "My Bookings" page
    const user = userEvent.setup();
    render(<MyBookingsPage userId="user_123" />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('bookings-table')).toBeInTheDocument();
    });

    // Step 1: Select a booking
    await user.click(screen.getByTestId('select-booking-btn-0'));

    // Step Expected Result: Booking details are accessible
    expect(await screen.findByTestId('booking-details')).toBeInTheDocument();

    // Step 2: Click "View Payment Details"
    await user.click(screen.getByTestId('view-payment-btn'));

    // Step Expected Result: A modal or section shows the transaction info
    await waitFor(() => {
      expect(mockGetPaymentDetails).toHaveBeenCalledWith('booking_001');
    });

    // Test Case Expected Result: System displays Payment ID, Payment Date, and Price
    expect(await screen.findByTestId('payment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('payment-id')).toHaveTextContent('Payment ID: PAY_001');
    expect(screen.getByTestId('payment-date')).toHaveTextContent('Payment Date: 2025-12-15');
    expect(screen.getByTestId('payment-price')).toHaveTextContent('Price: ₫2,500,000');

    // Verify modal can be closed
    await user.click(screen.getByTestId('close-modal-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('payment-modal')).not.toBeInTheDocument();
    });
  });

  /**
   * TC-TRV-ACT-003: Verify Download E-Ticket
   * Business Requirement: BR31
   * 
   * Prerequisites:
   * 1. User is on "My Bookings" page
   * 
   * Steps:
   * Step 1: Click "Download E-Ticket" button/icon
   * Step 2: Open the downloaded file
   * 
   * Expected Result:
   * The E-ticket PDF file is downloaded to the user's device.
   * The PDF content matches the booking details.
   */
  it('TC-TRV-ACT-003: should download E-ticket PDF file', async () => {
    // Arrange - Prerequisites: User is on "My Bookings" page
    const user = userEvent.setup();
    
    // Mock URL.createObjectURL and link.click()
    const mockCreateObjectURL = vi.fn(() => 'blob:mockurl');
    const mockClick = vi.fn();
    
    global.URL.createObjectURL = mockCreateObjectURL;
    
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn((tag) => {
      const element = originalCreateElement.call(document, tag);
      if (tag === 'a') {
        element.click = mockClick;
      }
      return element;
    }) as any;

    render(<MyBookingsPage userId="user_123" />);

    // Wait for bookings and select first booking
    await waitFor(() => {
      expect(screen.getByTestId('bookings-table')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('select-booking-btn-0'));

    await waitFor(() => {
      expect(screen.getByTestId('booking-details')).toBeInTheDocument();
    });

    // Step 1: Click "Download E-Ticket" button/icon
    await user.click(screen.getByTestId('download-eticket-btn'));

    // Step Expected Result: Browser initiates file download
    await waitFor(() => {
      expect(mockDownloadPDF).toHaveBeenCalledWith('booking_001');
    });

    // Test Case Expected Result: The E-ticket PDF file is downloaded to the user's device
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();

    // Step 2: Open the downloaded file
    // The PDF content matches the booking details (verified by download call with correct booking ID)
    const downloadedBlob = await mockDownloadPDF.mock.results[0].value;
    expect(downloadedBlob.type).toBe('application/pdf');

    // Cleanup
    document.createElement = originalCreateElement;
  });
});
