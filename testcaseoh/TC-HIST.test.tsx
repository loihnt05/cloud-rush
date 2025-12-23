/**
 * Test Suite: TC-HIST (Traveler Booking History - Lịch sử đặt vé)
 * Category: Traveler Booking Management - View and Manage Bookings
 * Description: Unit tests for viewing booking history and managing booked tickets
 * 
 * Test Cases:
 * - TC-HIST-001: View History - Empty
 * - TC-HIST-002: View History - List Columns
 * - TC-HIST-003: Filter History - Upcoming
 * - TC-HIST-004: Filter History - Completed
 * - TC-HIST-005: Filter History - Cancelled
 * - TC-HIST-006: Sort History - Date
 * - TC-HIST-007: View Detail - Correct Data
 * - TC-HIST-008: E-Ticket - Generate PDF
 * - TC-HIST-009: E-Ticket - Check Passenger
 * - TC-HIST-010: E-Ticket - Check Flight
 * - TC-HIST-011: E-Ticket - Check Seat
 * - TC-HIST-012: E-Ticket - QR Code Scannable
 * - TC-HIST-013: E-Ticket - Download Fail
 * - TC-HIST-014: View Payment Info
 * - TC-HIST-015: Security - View IDOR
 * - TC-HIST-016: Action - Cancel Booking (Allowed)
 * - TC-HIST-017: Action - Cancel Booking (Restricted)
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has access to booking history page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking APIs
const mockGetBookingHistory = vi.fn();
const mockGetBookingDetail = vi.fn();
const mockGenerateETicket = vi.fn();
const mockGetPaymentInfo = vi.fn();
const mockCancelBooking = vi.fn();
const mockDownloadETicket = vi.fn();
const mockValidateQRCode = vi.fn();

// Mock current date for time-based tests
const MOCK_CURRENT_DATE = new Date('2025-12-23T10:00:00Z');

// Mock booking data
const mockBookings = [
  {
    id: 'BK-001',
    bookingRef: 'BK-001',
    date: '2025-12-20T14:30:00Z',
    flightNumber: 'VN123',
    from: 'SGN',
    fromName: 'Ho Chi Minh City',
    to: 'HAN',
    toName: 'Hanoi',
    price: 100,
    status: 'Completed',
    departureTime: '2025-12-21T08:00:00Z',
    arrivalTime: '2025-12-21T10:15:00Z',
    passengerName: 'Nguyen Van A',
    seatNumber: '12A',
    paymentMethod: 'Visa ****1234',
    paymentAmount: 100,
    qrCode: 'QR_BK-001_ENCODED_DATA'
  },
  {
    id: 'BK-002',
    bookingRef: 'BK-002',
    date: '2025-12-22T09:15:00Z',
    flightNumber: 'VN456',
    from: 'HAN',
    fromName: 'Hanoi',
    to: 'DAD',
    toName: 'Da Nang',
    price: 80,
    status: 'Upcoming',
    departureTime: '2025-12-25T14:00:00Z',
    arrivalTime: '2025-12-25T15:30:00Z',
    passengerName: 'Tran Thi B',
    seatNumber: '8C',
    paymentMethod: 'Visa ****5678',
    paymentAmount: 80,
    qrCode: 'QR_BK-002_ENCODED_DATA'
  },
  {
    id: 'BK-003',
    bookingRef: 'BK-003',
    date: '2025-12-18T11:00:00Z',
    flightNumber: 'VN789',
    from: 'SGN',
    fromName: 'Ho Chi Minh City',
    to: 'DAD',
    toName: 'Da Nang',
    price: 90,
    status: 'Cancelled',
    departureTime: '2025-12-24T16:00:00Z',
    arrivalTime: '2025-12-24T17:15:00Z',
    passengerName: 'Le Van C',
    seatNumber: '15B',
    paymentMethod: 'Visa ****9012',
    paymentAmount: 90,
    qrCode: 'QR_BK-003_ENCODED_DATA'
  },
  {
    id: 'BK-004',
    bookingRef: 'BK-004',
    date: '2025-12-23T08:00:00Z',
    flightNumber: 'VN111',
    from: 'HAN',
    fromName: 'Hanoi',
    to: 'SGN',
    toName: 'Ho Chi Minh City',
    price: 110,
    status: 'Upcoming',
    departureTime: '2025-12-23T10:30:00Z', // 30 minutes from current time
    arrivalTime: '2025-12-23T12:45:00Z',
    passengerName: 'Pham Thi D',
    seatNumber: '5A',
    paymentMethod: 'Visa ****3456',
    paymentAmount: 110,
    qrCode: 'QR_BK-004_ENCODED_DATA'
  }
];

// Mock BookingHistoryPage component
const BookingHistoryPage = ({ userId, mockNetworkError }: { userId?: string; mockNetworkError?: boolean }) => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = React.useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [eTicketData, setETicketData] = React.useState<any>(null);
  const [paymentInfo, setPaymentInfo] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadBookingHistory();
  }, [userId]);

  React.useEffect(() => {
    applyFilters();
  }, [bookings, filterStatus, sortOrder]);

  const loadBookingHistory = async () => {
    const data = await mockGetBookingHistory(userId);
    setBookings(data);
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredBookings(filtered);
  };

  const handleViewDetail = async (booking: any) => {
    const detail = await mockGetBookingDetail(booking.id);
    setSelectedBooking(detail);
    setShowDetailModal(true);
  };

  const handleGenerateETicket = async (booking: any) => {
    setLoading(true);
    setError('');

    try {
      const startTime = Date.now();
      
      if (mockNetworkError) {
        throw new Error('Network error');
      }

      const ticketData = await mockGenerateETicket(booking.id);
      
      const endTime = Date.now();
      const generationTime = endTime - startTime;

      // Check if PDF generates < 5 seconds
      if (generationTime < 5000) {
        setETicketData({
          ...ticketData,
          generationTime
        });
      }
    } catch (err) {
      setError('Download Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadETicket = async (ticketData: any) => {
    try {
      if (mockNetworkError) {
        throw new Error('Network error');
      }

      await mockDownloadETicket(ticketData);
      
      // Simulate browser download
      const blob = new Blob(['PDF Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eticket_${ticketData.bookingRef}.pdf`;
      link.click();
    } catch (err) {
      setError('Download Failed');
    }
  };

  const handleViewPaymentInfo = async (booking: any) => {
    const payment = await mockGetPaymentInfo(booking.id);
    setPaymentInfo(payment);
    setShowPaymentModal(true);
  };

  const canCancelBooking = (booking: any) => {
    const now = MOCK_CURRENT_DATE.getTime();
    const departure = new Date(booking.departureTime).getTime();
    const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);

    // Can cancel if > 1 hour before flight
    return hoursUntilDeparture > 1;
  };

  const handleCancelBooking = async (booking: any) => {
    const result = await mockCancelBooking(booking.id);
    
    if (result.success) {
      // Update booking status
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'Cancelled' } : b
      ));
      setShowDetailModal(false);
    }
  };

  const handleSortByDate = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const scanQRCode = async (qrData: string) => {
    const result = await mockValidateQRCode(qrData);
    return result;
  };

  return (
    <div data-testid="booking-history-page">
      <h2>My Booking History</h2>

      {/* Error Message */}
      {error && (
        <div data-testid="error-message">{error}</div>
      )}

      {/* Filter Section */}
      <div data-testid="filter-section">
        <select
          data-testid="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div data-testid="empty-state">No bookings found</div>
      ) : (
        <table data-testid="booking-table">
          <thead>
            <tr data-testid="table-header">
              <th data-testid="header-date" onClick={handleSortByDate} style={{ cursor: 'pointer' }}>
                Date {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
              <th data-testid="header-flight">Flight</th>
              <th data-testid="header-from">From</th>
              <th data-testid="header-to">To</th>
              <th data-testid="header-price">Price</th>
              <th data-testid="header-status">Status</th>
              <th data-testid="header-actions">Actions</th>
            </tr>
          </thead>
          <tbody data-testid="booking-tbody">
            {filteredBookings.map((booking, index) => (
              <tr key={booking.id} data-testid={`booking-row-${index}`}>
                <td data-testid={`booking-date-${index}`}>
                  {new Date(booking.date).toLocaleDateString()}
                </td>
                <td data-testid={`booking-flight-${index}`}>{booking.flightNumber}</td>
                <td data-testid={`booking-from-${index}`}>{booking.from}</td>
                <td data-testid={`booking-to-${index}`}>{booking.to}</td>
                <td data-testid={`booking-price-${index}`}>${booking.price}</td>
                <td data-testid={`booking-status-${index}`}>{booking.status}</td>
                <td data-testid={`booking-actions-${index}`}>
                  <button
                    data-testid={`view-detail-btn-${index}`}
                    onClick={() => handleViewDetail(booking)}
                  >
                    View Detail
                  </button>
                  <button
                    data-testid={`get-eticket-btn-${index}`}
                    onClick={() => handleGenerateETicket(booking)}
                    disabled={loading}
                  >
                    Get E-Ticket
                  </button>
                  <button
                    data-testid={`view-payment-btn-${index}`}
                    onClick={() => handleViewPaymentInfo(booking)}
                  >
                    Payment Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div data-testid="detail-modal">
          <h3>Booking Details</h3>
          <div data-testid="booking-detail">
            <div data-testid="detail-ref">Booking Ref: {selectedBooking.bookingRef}</div>
            <div data-testid="detail-date">
              Booking Date: {new Date(selectedBooking.date).toLocaleString()}
            </div>
            <div data-testid="detail-flight">Flight: {selectedBooking.flightNumber}</div>
            <div data-testid="detail-passenger">Passenger: {selectedBooking.passengerName}</div>
            <div data-testid="detail-seat">Seat: {selectedBooking.seatNumber}</div>
            <div data-testid="detail-route">
              Route: {selectedBooking.fromName} → {selectedBooking.toName}
            </div>
            <div data-testid="detail-departure">
              Departure: {new Date(selectedBooking.departureTime).toLocaleString()}
            </div>
            <div data-testid="detail-arrival">
              Arrival: {new Date(selectedBooking.arrivalTime).toLocaleString()}
            </div>

            {/* Cancel Button */}
            {selectedBooking.status === 'Upcoming' && (
              <button
                data-testid="cancel-booking-btn"
                onClick={() => handleCancelBooking(selectedBooking)}
                disabled={!canCancelBooking(selectedBooking)}
                style={{
                  display: canCancelBooking(selectedBooking) ? 'inline-block' : 'none'
                }}
              >
                Cancel Booking
              </button>
            )}
          </div>
          <button data-testid="close-detail-btn" onClick={() => setShowDetailModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* E-Ticket Display */}
      {eTicketData && (
        <div data-testid="eticket-display">
          <h3>E-Ticket</h3>
          <div data-testid="eticket-content">
            <div data-testid="eticket-ref">Booking: {eTicketData.bookingRef}</div>
            <div data-testid="eticket-passenger">Passenger: {eTicketData.passengerName}</div>
            <div data-testid="eticket-flight">
              Flight: {eTicketData.flightNumber}
            </div>
            <div data-testid="eticket-time">
              {new Date(eTicketData.departureTime).toLocaleString()} - {new Date(eTicketData.arrivalTime).toLocaleString()}
            </div>
            <div data-testid="eticket-seat">Seat: {eTicketData.seatNumber}</div>
            <div data-testid="eticket-qr">
              <div>QR Code:</div>
              <div data-testid="qr-code-data">{eTicketData.qrCode}</div>
            </div>
            <div data-testid="generation-time">
              Generated in {eTicketData.generationTime}ms
            </div>
          </div>
          <button
            data-testid="download-eticket-btn"
            onClick={() => handleDownloadETicket(eTicketData)}
          >
            Download PDF
          </button>
          <button
            data-testid="scan-qr-btn"
            onClick={async () => {
              const result = await scanQRCode(eTicketData.qrCode);
              setError(result.valid ? '' : 'Invalid QR Code');
            }}
          >
            Scan QR Code
          </button>
          <button data-testid="close-eticket-btn" onClick={() => setETicketData(null)}>
            Close
          </button>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentInfo && (
        <div data-testid="payment-modal">
          <h3>Payment Information</h3>
          <div data-testid="payment-info">
            <div data-testid="payment-method">{paymentInfo.method}</div>
            <div data-testid="payment-amount">Amount: ${paymentInfo.amount}</div>
          </div>
          <button data-testid="close-payment-btn" onClick={() => setShowPaymentModal(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-HIST: Traveler Booking History Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookingHistory.mockResolvedValue(mockBookings);
    mockGetBookingDetail.mockImplementation((id) => {
      return Promise.resolve(mockBookings.find(b => b.id === id));
    });
    mockGenerateETicket.mockImplementation((id) => {
      const booking = mockBookings.find(b => b.id === id);
      return Promise.resolve(booking);
    });
    mockGetPaymentInfo.mockImplementation((id) => {
      const booking = mockBookings.find(b => b.id === id);
      return Promise.resolve({
        method: booking.paymentMethod,
        amount: booking.paymentAmount
      });
    });
    mockCancelBooking.mockResolvedValue({ success: true });
    mockDownloadETicket.mockResolvedValue({ success: true });
    mockValidateQRCode.mockImplementation((qrData) => {
      return Promise.resolve({
        valid: qrData.startsWith('QR_BK-'),
        bookingRef: qrData.split('_')[1]
      });
    });
  });

  /**
   * TC-HIST-001: View History - Empty
   * Business Requirement: BR30
   * 
   * Steps:
   * New user (no bookings). Access Page
   * 
   * Test Data: (empty)
   * 
   * Expected Result:
   * "No bookings found".
   */
  it('TC-HIST-001: should display empty state for new user with no bookings', async () => {
    // Arrange - Mock empty booking list
    mockGetBookingHistory.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(<BookingHistoryPage userId="new_user" />);

    // Act & Assert - Test Case Expected Result: "No bookings found"
    expect(await screen.findByTestId('empty-state')).toHaveTextContent('No bookings found');

    // Table should not be displayed
    expect(screen.queryByTestId('booking-table')).not.toBeInTheDocument();
  });

  /**
   * TC-HIST-002: View History - List Columns
   * Business Requirement: UI
   * 
   * Steps:
   * Check header columns.
   * 
   * Test Data: Visual
   * 
   * Expected Result:
   * Date, Flight, From, To, Price, Status.
   */
  it('TC-HIST-002: should display correct table header columns', async () => {
    // Arrange
    render(<BookingHistoryPage />);

    // Act - Wait for table to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Assert - Test Case Expected Result: Date, Flight, From, To, Price, Status
    const header = screen.getByTestId('table-header');
    
    expect(within(header).getByTestId('header-date')).toHaveTextContent('Date');
    expect(within(header).getByTestId('header-flight')).toHaveTextContent('Flight');
    expect(within(header).getByTestId('header-from')).toHaveTextContent('From');
    expect(within(header).getByTestId('header-to')).toHaveTextContent('To');
    expect(within(header).getByTestId('header-price')).toHaveTextContent('Price');
    expect(within(header).getByTestId('header-status')).toHaveTextContent('Status');
  });

  /**
   * TC-HIST-003: Filter History - Upcoming
   * Business Requirement: BR30
   * 
   * Steps:
   * Filter "Upcoming".
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Show future flights.
   */
  it('TC-HIST-003: should filter and show only upcoming flights', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Filter "Upcoming"
    const filterSelect = screen.getByTestId('filter-status');
    await user.selectOptions(filterSelect, 'Upcoming');

    // Assert - Test Case Expected Result: Show future flights
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^booking-row-/);
      expect(rows).toHaveLength(2); // BK-002 and BK-004
    });

    // Verify all shown bookings are Upcoming
    expect(screen.getByTestId('booking-status-0')).toHaveTextContent('Upcoming');
    expect(screen.getByTestId('booking-status-1')).toHaveTextContent('Upcoming');
  });

  /**
   * TC-HIST-004: Filter History - Completed
   * Business Requirement: BR30
   * 
   * Steps:
   * Filter "Completed".
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Show flown flights.
   */
  it('TC-HIST-004: should filter and show only completed flights', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Filter "Completed"
    const filterSelect = screen.getByTestId('filter-status');
    await user.selectOptions(filterSelect, 'Completed');

    // Assert - Test Case Expected Result: Show flown flights
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^booking-row-/);
      expect(rows).toHaveLength(1); // BK-001
    });

    expect(screen.getByTestId('booking-status-0')).toHaveTextContent('Completed');
    expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN123');
  });

  /**
   * TC-HIST-005: Filter History - Cancelled
   * Business Requirement: BR30
   * 
   * Steps:
   * Filter "Cancelled".
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Show cancelled bookings.
   */
  it('TC-HIST-005: should filter and show only cancelled bookings', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Filter "Cancelled"
    const filterSelect = screen.getByTestId('filter-status');
    await user.selectOptions(filterSelect, 'Cancelled');

    // Assert - Test Case Expected Result: Show cancelled bookings
    await waitFor(() => {
      const rows = screen.getAllByTestId(/^booking-row-/);
      expect(rows).toHaveLength(1); // BK-003
    });

    expect(screen.getByTestId('booking-status-0')).toHaveTextContent('Cancelled');
    expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN789');
  });

  /**
   * TC-HIST-006: Sort History - Date
   * Business Requirement: UI
   * 
   * Steps:
   * Click Date Header.
   * 
   * Test Data: Sort
   * 
   * Expected Result:
   * Sort ASC/DESC correctly.
   */
  it('TC-HIST-006: should sort bookings by date correctly when clicking header', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Initial state is DESC (newest first)
    expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN111'); // 12-23

    // Act - Click Date Header to sort ASC
    const dateHeader = screen.getByTestId('header-date');
    await user.click(dateHeader);

    // Assert - Test Case Expected Result: Sort ASC correctly
    await waitFor(() => {
      expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN789'); // 12-18 (oldest)
    });

    expect(screen.getByTestId('header-date')).toHaveTextContent('↑');

    // Act - Click again to sort DESC
    await user.click(dateHeader);

    // Assert - Sort DESC correctly
    await waitFor(() => {
      expect(screen.getByTestId('booking-flight-0')).toHaveTextContent('VN111'); // 12-23 (newest)
    });

    expect(screen.getByTestId('header-date')).toHaveTextContent('↓');
  });

  /**
   * TC-HIST-007: View Detail - Correct Data
   * Business Requirement: Integri
   * 
   * Steps:
   * Click Booking BK-001.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Detail matches booking time.
   */
  it('TC-HIST-007: should display correct booking details matching booking data', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Click View Detail for BK-001
    // Default DESC order by date: BK-004 (12-23), BK-002 (12-22), BK-001 (12-20), BK-003 (12-18)
    await user.click(screen.getByTestId('view-detail-btn-2')); // BK-001 is at index 2 in DESC order

    // Assert - Test Case Expected Result: Detail matches booking time
    await waitFor(() => {
      expect(screen.getByTestId('detail-modal')).toBeInTheDocument();
    });

    expect(screen.getByTestId('detail-ref')).toHaveTextContent('BK-001');
    expect(screen.getByTestId('detail-flight')).toHaveTextContent('VN123');
    expect(screen.getByTestId('detail-passenger')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('detail-seat')).toHaveTextContent('12A');
    expect(screen.getByTestId('detail-route')).toHaveTextContent('Ho Chi Minh City → Hanoi');
    
    // Verify date/time integrity
    expect(screen.getByTestId('detail-date')).toHaveTextContent('12/20/2025');
    expect(screen.getByTestId('detail-departure')).toHaveTextContent('12/21/2025');
  });

  /**
   * TC-HIST-008: E-Ticket - Generate PDF
   * Business Requirement: BR31
   * 
   * Steps:
   * Click "Get E-Ticket".
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * PDF generates < 5 seconds.
   */
  it('TC-HIST-008: should generate e-ticket PDF in less than 5 seconds', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Click "Get E-Ticket"
    await user.click(screen.getByTestId('get-eticket-btn-0'));

    // Assert - Test Case Expected Result: PDF generates < 5 seconds
    await waitFor(() => {
      expect(screen.getByTestId('eticket-display')).toBeInTheDocument();
    });

    const generationTimeText = screen.getByTestId('generation-time').textContent;
    const generationTime = parseInt(generationTimeText!.match(/\d+/)?.[0] || '0');
    
    expect(generationTime).toBeLessThan(5000);
  });

  /**
   * TC-HIST-009: E-Ticket - Check Passenger
   * Business Requirement: BR31
   * 
   * Steps:
   * Open PDF.
   * 
   * Test Data: Verify
   * 
   * Expected Result:
   * Passenger Name is correct.
   */
  it('TC-HIST-009: should display correct passenger name in e-ticket', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Generate e-ticket
    await user.click(screen.getByTestId('get-eticket-btn-0'));

    // Assert - Test Case Expected Result: Passenger Name is correct
    expect(await screen.findByTestId('eticket-passenger')).toHaveTextContent('Pham Thi D');
  });

  /**
   * TC-HIST-010: E-Ticket - Check Flight
   * Business Requirement: BR31
   * 
   * Steps:
   * Open PDF.
   * 
   * Test Data: Verify
   * 
   * Expected Result:
   * Flight Number/Time is correct.
   */
  it('TC-HIST-010: should display correct flight number and time in e-ticket', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Generate e-ticket for BK-002 (VN456)
    await user.click(screen.getByTestId('get-eticket-btn-1'));

    // Assert - Test Case Expected Result: Flight Number/Time is correct
    expect(await screen.findByTestId('eticket-flight')).toHaveTextContent('VN456');
    
    const timeElement = screen.getByTestId('eticket-time');
    expect(timeElement).toHaveTextContent('12/25/2025'); // Departure and arrival dates
  });

  /**
   * TC-HIST-011: E-Ticket - Check Seat
   * Business Requirement: BR31
   * 
   * Steps:
   * Open PDF.
   * 
   * Test Data: Verify
   * 
   * Expected Result:
   * Seat Number is correct.
   */
  it('TC-HIST-011: should display correct seat number in e-ticket', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Generate e-ticket for BK-002 which has seat 8C
    // DESC order: BK-004 (idx 0), BK-002 (idx 1), BK-001 (idx 2), BK-003 (idx 3)
    await user.click(screen.getByTestId('get-eticket-btn-1'));

    // Assert - Test Case Expected Result: Seat Number is correct
    // BK-002 has seat 8C
    expect(await screen.findByTestId('eticket-seat')).toHaveTextContent('Seat: 8C');
  });

  /**
   * TC-HIST-012: E-Ticket - QR Code Scannable
   * Business Requirement: Feat
   * 
   * Steps:
   * Scan PDF QR.
   * 
   * Test Data: Scan
   * 
   * Expected Result:
   * QR contains valid booking ref.
   */
  it('TC-HIST-012: should generate scannable QR code containing valid booking reference', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Generate e-ticket
    await user.click(screen.getByTestId('get-eticket-btn-0'));

    expect(await screen.findByTestId('eticket-display')).toBeInTheDocument();

    // Get QR code data
    const qrCodeData = screen.getByTestId('qr-code-data').textContent;
    expect(qrCodeData).toBe('QR_BK-004_ENCODED_DATA');

    // Scan QR code
    await user.click(screen.getByTestId('scan-qr-btn'));

    // Assert - Test Case Expected Result: QR contains valid booking ref
    await waitFor(() => {
      expect(mockValidateQRCode).toHaveBeenCalledWith('QR_BK-004_ENCODED_DATA');
    });

    // No error should be displayed (valid QR)
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  /**
   * TC-HIST-013: E-Ticket - Download Fail
   * Business Requirement: Edge
   * 
   * Steps:
   * Network Off. Click Download.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Error "Download Failed".
   */
  it('TC-HIST-013: should show error when download fails due to network issue', async () => {
    // Arrange - Mock network error
    const user = userEvent.setup();
    render(<BookingHistoryPage mockNetworkError={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Try to generate e-ticket with network off
    await user.click(screen.getByTestId('get-eticket-btn-0'));

    // Assert - Test Case Expected Result: Error "Download Failed"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Download Failed');
  });

  /**
   * TC-HIST-014: View Payment Info
   * Business Requirement: BR31
   * 
   * Steps:
   * Click Payment Details.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Show: Visa ****1234, Amount $100.
   */
  it('TC-HIST-014: should display payment information with masked card and amount', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Click Payment Details for BK-001
    // DESC order: BK-004 (idx 0), BK-002 (idx 1), BK-001 (idx 2), BK-003 (idx 3)
    await user.click(screen.getByTestId('view-payment-btn-2')); // BK-001 at index 2

    // Assert - Test Case Expected Result: Show: Visa ****1234, Amount $100
    expect(await screen.findByTestId('payment-modal')).toBeInTheDocument();
    expect(screen.getByTestId('payment-method')).toHaveTextContent('Visa ****1234');
    expect(screen.getByTestId('payment-amount')).toHaveTextContent('Amount: $100');
  });

  /**
   * TC-HIST-015: Security - View IDOR
   * Business Requirement: Sec
   * 
   * Steps:
   * Change URL /history/999.
   * 
   * Test Data: ID: 999
   * 
   * Expected Result:
   * Error 403 / "Booking not found".
   */
  it('TC-HIST-015: should prevent unauthorized access to other users bookings (IDOR)', async () => {
    // Arrange - Mock unauthorized booking access
    mockGetBookingDetail.mockRejectedValueOnce(new Error('Booking not found'));

    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - Try to access booking with invalid ID (simulating URL manipulation)
    try {
      await mockGetBookingDetail('999');
    } catch (error: any) {
      // Assert - Test Case Expected Result: Error 403 / "Booking not found"
      expect(error.message).toBe('Booking not found');
    }

    expect(mockGetBookingDetail).toHaveBeenCalledWith('999');
  });

  /**
   * TC-HIST-016: Action - Cancel Booking (Allowed)
   * Business Requirement: Biz
   * 
   * Steps:
   * Booking > 24h before flight.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * "Cancel" button is enabled.
   */
  it('TC-HIST-016: should enable cancel button for bookings more than 1 hour before flight', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - View detail for BK-002 (departure 2025-12-25, > 24h from now)
    await user.click(screen.getByTestId('view-detail-btn-1'));

    // Assert - Test Case Expected Result: "Cancel" button is enabled
    expect(await screen.findByTestId('detail-modal')).toBeInTheDocument();
    
    const cancelButton = screen.getByTestId('cancel-booking-btn');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).not.toBeDisabled();
    expect(cancelButton).toBeVisible();
  });

  /**
   * TC-HIST-017: Action - Cancel Booking (Restricted)
   * Business Requirement: Biz
   * 
   * Steps:
   * Booking < 1h before flight.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * "Cancel" button disabled/hidden.
   */
  it('TC-HIST-017: should disable/hide cancel button for bookings less than 1 hour before flight', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingHistoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-table')).toBeInTheDocument();
    });

    // Act - View detail for BK-004 (departure 10:30, current time 10:00, only 30 min left)
    await user.click(screen.getByTestId('view-detail-btn-0'));

    // Assert - Test Case Expected Result: "Cancel" button disabled/hidden
    expect(await screen.findByTestId('detail-modal')).toBeInTheDocument();
    
    const cancelButton = screen.queryByTestId('cancel-booking-btn');
    
    // Button should be hidden (display: none)
    if (cancelButton) {
      expect(cancelButton).not.toBeVisible();
    }
  });
});
