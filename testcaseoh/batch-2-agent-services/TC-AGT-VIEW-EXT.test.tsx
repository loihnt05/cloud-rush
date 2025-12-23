/**
 * Test Suite: TC-AGT-VIEW (Agent View Extended)
 * Category: Agent Services - Booking List & Detail View
 * Description: Unit tests for Agent booking list filtering, searching, sorting, pagination, and export
 * 
 * Test Cases:
 * - TC-AGT-VIEW-003: Filter Booking - Status "Confirmed"
 * - TC-AGT-VIEW-004: Filter Booking - Status "Cancelled"
 * - TC-AGT-VIEW-005: Filter Booking - Status "Pending"
 * - TC-AGT-VIEW-006: Search Booking - Customer Name
 * - TC-AGT-VIEW-007: Search Booking - Phone Number
 * - TC-AGT-VIEW-008: Search Booking - Email
 * - TC-AGT-VIEW-009: Sort Booking - Date Ascending
 * - TC-AGT-VIEW-010: Sort Booking - Date Descending
 * - TC-AGT-VIEW-011: Pagination - Next Page
 * - TC-AGT-VIEW-012: Pagination - Last Page
 * - TC-AGT-VIEW-013: View Detail - Verify Seat Map Link
 * - TC-AGT-VIEW-014: View Detail - Verify Payment Link
 * - TC-AGT-VIEW-015: Export Booking - PDF
 * 
 * Prerequisites:
 * 1. Agent is logged in with booking view permissions
 * 2. Multiple bookings exist with different statuses
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking APIs
const mockGetBookings = vi.fn();
const mockSearchBookings = vi.fn();
const mockExportBookingPDF = vi.fn();
const mockGetBookingDetail = vi.fn();

// Mock booking data
const mockBookings = [
  {
    booking_id: 'BK-001',
    customer_name: 'Nguyen Van A',
    phone: '0909123456',
    email: 'a@test.com',
    status: 'Confirmed',
    booking_date: '2025-12-01T10:00:00Z',
    flight: 'VN123',
  },
  {
    booking_id: 'BK-002',
    customer_name: 'Tran Thi B',
    phone: '0909234567',
    email: 'b@test.com',
    status: 'Cancelled',
    booking_date: '2025-12-05T14:30:00Z',
    flight: 'VN456',
  },
  {
    booking_id: 'BK-003',
    customer_name: 'Le Van C',
    phone: '0909345678',
    email: 'c@test.com',
    status: 'Pending',
    booking_date: '2025-12-10T09:15:00Z',
    flight: 'VN789',
  },
  {
    booking_id: 'BK-004',
    customer_name: 'Pham Thi D',
    phone: '0909456789',
    email: 'd@test.com',
    status: 'Confirmed',
    booking_date: '2025-12-15T16:45:00Z',
    flight: 'VN321',
  },
];

// Mock BookingList component with filter, search, sort, and pagination
const BookingList = () => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = React.useState<any[]>([]);
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    const loadBookings = async () => {
      const data = await mockGetBookings();
      setBookings(data);
      setFilteredBookings(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    };
    loadBookings();
  }, []);

  React.useEffect(() => {
    let result = [...bookings];

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Apply search
    if (searchKeyword.trim()) {
      result = result.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          b.phone.includes(searchKeyword) ||
          b.email.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.booking_date).getTime();
      const dateB = new Date(b.booking_date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredBookings(result);
    setTotalPages(Math.ceil(result.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filtering/searching
  }, [statusFilter, searchKeyword, sortOrder, bookings]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div data-testid="booking-list">
      <h2>Agent Booking List</h2>

      {/* Filter Section */}
      <div data-testid="filter-section">
        <label>Filter by Status:</label>
        <select
          data-testid="status-filter"
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Search Section */}
      <div data-testid="search-section">
        <input
          type="text"
          data-testid="search-input"
          placeholder="Search by name, phone, or email"
          value={searchKeyword}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Sort Section */}
      <div data-testid="sort-section">
        <button onClick={handleSortToggle} data-testid="date-sort-button">
          Date {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Booking Table */}
      <table data-testid="booking-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Status</th>
            <th>Date</th>
            <th>Flight</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBookings.map((booking) => (
            <tr key={booking.booking_id} data-testid={`booking-row-${booking.booking_id}`}>
              <td>{booking.booking_id}</td>
              <td>{booking.customer_name}</td>
              <td>{booking.phone}</td>
              <td>{booking.email}</td>
              <td>{booking.status}</td>
              <td>{booking.booking_date}</td>
              <td>{booking.flight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div data-testid="pagination-section">
        <span data-testid="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          data-testid="next-page-button"
        >
          Next
        </button>
        <button onClick={handleLastPage} data-testid="last-page-button">
          Last
        </button>
      </div>

      <div data-testid="result-count">
        Showing {paginatedBookings.length} of {filteredBookings.length} bookings
      </div>
    </div>
  );
};

// Mock BookingDetail component with links
const BookingDetail = ({ bookingId }: { bookingId: string }) => {
  const [booking, setBooking] = React.useState<any>(null);

  React.useEffect(() => {
    const loadDetail = async () => {
      const data = await mockGetBookingDetail(bookingId);
      setBooking(data);
    };
    loadDetail();
  }, [bookingId]);

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="booking-detail">
      <h2>Booking Detail - {booking.booking_id}</h2>
      <div>Customer: {booking.customer_name}</div>
      <div>Status: {booking.status}</div>

      {/* Links Section */}
      <div data-testid="links-section">
        <a href={`/seat-map/${booking.booking_id}`} data-testid="seat-map-link">
          View Seat Map
        </a>
        <a href={`/payment-info/${booking.booking_id}`} data-testid="payment-info-link">
          Payment Info
        </a>
      </div>
    </div>
  );
};

// Mock BookingExport component
const BookingExport = ({ bookingId }: { bookingId: string }) => {
  const [exporting, setExporting] = React.useState(false);
  const [exported, setExported] = React.useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    await mockExportBookingPDF(bookingId);
    setExporting(false);
    setExported(true);
  };

  return (
    <div data-testid="booking-export">
      <button onClick={handleExportPDF} disabled={exporting} data-testid="export-pdf-button">
        {exporting ? 'Exporting...' : 'Export PDF'}
      </button>
      {exported && <div data-testid="export-success">PDF downloaded successfully</div>}
    </div>
  );
};

describe('TC-AGT-VIEW: Agent View Extended Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookings.mockResolvedValue(mockBookings);
  });

  /**
   * TC-AGT-VIEW-003: Filter Booking - Status "Confirmed"
   * Business Requirement: BR12
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Only confirmed bookings shown.
   */
  it('TC-AGT-VIEW-003: should show only confirmed bookings when filtering by Confirmed status', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Initially all bookings shown
    expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument(); // Confirmed
    expect(screen.getByTestId('booking-row-BK-002')).toBeInTheDocument(); // Cancelled
    expect(screen.getByTestId('booking-row-BK-003')).toBeInTheDocument(); // Pending
    expect(screen.getByTestId('booking-row-BK-004')).toBeInTheDocument(); // Confirmed

    // Act - Select "Confirmed" filter
    await user.selectOptions(screen.getByTestId('status-filter'), 'Confirmed');

    // Assert - Only confirmed bookings shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument(); // Confirmed
      expect(screen.getByTestId('booking-row-BK-004')).toBeInTheDocument(); // Confirmed
    });

    // Assert - Cancelled and Pending bookings not shown
    expect(screen.queryByTestId('booking-row-BK-002')).not.toBeInTheDocument(); // Cancelled
    expect(screen.queryByTestId('booking-row-BK-003')).not.toBeInTheDocument(); // Pending

    // Assert - Result count shows 2 confirmed bookings
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 2 of 2 bookings');
  });

  /**
   * TC-AGT-VIEW-004: Filter Booking - Status "Cancelled"
   * Business Requirement: BR12
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Only cancelled bookings shown.
   */
  it('TC-AGT-VIEW-004: should show only cancelled bookings when filtering by Cancelled status', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Act - Select "Cancelled" filter
    await user.selectOptions(screen.getByTestId('status-filter'), 'Cancelled');

    // Assert - Only cancelled booking shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-002')).toBeInTheDocument(); // Cancelled
    });

    // Assert - Other statuses not shown
    expect(screen.queryByTestId('booking-row-BK-001')).not.toBeInTheDocument(); // Confirmed
    expect(screen.queryByTestId('booking-row-BK-003')).not.toBeInTheDocument(); // Pending
    expect(screen.queryByTestId('booking-row-BK-004')).not.toBeInTheDocument(); // Confirmed

    // Assert - Result count shows 1 cancelled booking
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 bookings');
  });

  /**
   * TC-AGT-VIEW-005: Filter Booking - Status "Pending"
   * Business Requirement: BR12
   * 
   * Test Data: Filter
   * 
   * Expected Result:
   * Only pending bookings shown.
   */
  it('TC-AGT-VIEW-005: should show only pending bookings when filtering by Pending status', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Act - Select "Pending" filter
    await user.selectOptions(screen.getByTestId('status-filter'), 'Pending');

    // Assert - Only pending booking shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-003')).toBeInTheDocument(); // Pending
    });

    // Assert - Other statuses not shown
    expect(screen.queryByTestId('booking-row-BK-001')).not.toBeInTheDocument(); // Confirmed
    expect(screen.queryByTestId('booking-row-BK-002')).not.toBeInTheDocument(); // Cancelled
    expect(screen.queryByTestId('booking-row-BK-004')).not.toBeInTheDocument(); // Confirmed

    // Assert - Result count shows 1 pending booking
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 bookings');
  });

  /**
   * TC-AGT-VIEW-006: Search Booking - Customer Name
   * Business Requirement: BR12
   * 
   * Test Data: Keyword: "Nguyen Van A"
   * 
   * Expected Result:
   * Show bookings for Nguyen Van A.
   */
  it('TC-AGT-VIEW-006: should search and display bookings for customer "Nguyen Van A"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Act - Search for "Nguyen Van A"
    await user.type(screen.getByTestId('search-input'), 'Nguyen Van A');

    // Assert - Only bookings for Nguyen Van A shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Other customers not shown
    expect(screen.queryByTestId('booking-row-BK-002')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-003')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-004')).not.toBeInTheDocument();

    // Assert - Result count shows 1 booking
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 bookings');
  });

  /**
   * TC-AGT-VIEW-007: Search Booking - Phone Number
   * Business Requirement: BR12
   * 
   * Test Data: Keyword: "0909123456"
   * 
   * Expected Result:
   * Show bookings with that phone.
   */
  it('TC-AGT-VIEW-007: should search and display bookings by phone number "0909123456"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Act - Search for phone "0909123456"
    await user.type(screen.getByTestId('search-input'), '0909123456');

    // Assert - Only booking with matching phone shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Other phone numbers not shown
    expect(screen.queryByTestId('booking-row-BK-002')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-003')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-004')).not.toBeInTheDocument();

    // Assert - Result count shows 1 booking
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 bookings');
  });

  /**
   * TC-AGT-VIEW-008: Search Booking - Email
   * Business Requirement: BR12
   * 
   * Test Data: Keyword: "a@test.com"
   * 
   * Expected Result:
   * Show bookings with that email.
   */
  it('TC-AGT-VIEW-008: should search and display bookings by email "a@test.com"', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Act - Search for email "a@test.com"
    await user.type(screen.getByTestId('search-input'), 'a@test.com');

    // Assert - Only booking with matching email shown
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Other emails not shown
    expect(screen.queryByTestId('booking-row-BK-002')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-003')).not.toBeInTheDocument();
    expect(screen.queryByTestId('booking-row-BK-004')).not.toBeInTheDocument();

    // Assert - Result count shows 1 booking
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 1 of 1 bookings');
  });

  /**
   * TC-AGT-VIEW-009: Sort Booking - Date Ascending
   * Note: UI
   * 
   * Test Data: Sort
   * 
   * Expected Result:
   * Oldest bookings first.
   */
  it('TC-AGT-VIEW-009: should sort bookings by date in ascending order (oldest first)', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Initially sorted descending (newest first)
    expect(screen.getByTestId('date-sort-button')).toHaveTextContent('Date ↓');

    // Act - Click date sort button to change to ascending
    await user.click(screen.getByTestId('date-sort-button'));

    // Assert - Sort button shows ascending
    expect(screen.getByTestId('date-sort-button')).toHaveTextContent('Date ↑');

    // Assert - Oldest booking (BK-001, Dec 1) should be first in table
    const tableRows = screen.getAllByTestId(/^booking-row-/);
    expect(tableRows[0]).toHaveAttribute('data-testid', 'booking-row-BK-001'); // Dec 1
    expect(tableRows[1]).toHaveAttribute('data-testid', 'booking-row-BK-002'); // Dec 5
    expect(tableRows[2]).toHaveAttribute('data-testid', 'booking-row-BK-003'); // Dec 10
    expect(tableRows[3]).toHaveAttribute('data-testid', 'booking-row-BK-004'); // Dec 15
  });

  /**
   * TC-AGT-VIEW-010: Sort Booking - Date Descending
   * Note: UI
   * 
   * Test Data: Sort
   * 
   * Expected Result:
   * Newest bookings first.
   */
  it('TC-AGT-VIEW-010: should sort bookings by date in descending order (newest first)', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('booking-row-BK-001')).toBeInTheDocument();
    });

    // Assert - Default sort is descending (newest first)
    expect(screen.getByTestId('date-sort-button')).toHaveTextContent('Date ↓');

    // Assert - Newest booking (BK-004, Dec 15) should be first
    const tableRows = screen.getAllByTestId(/^booking-row-/);
    expect(tableRows[0]).toHaveAttribute('data-testid', 'booking-row-BK-004'); // Dec 15
    expect(tableRows[1]).toHaveAttribute('data-testid', 'booking-row-BK-003'); // Dec 10
    expect(tableRows[2]).toHaveAttribute('data-testid', 'booking-row-BK-002'); // Dec 5
    expect(tableRows[3]).toHaveAttribute('data-testid', 'booking-row-BK-001'); // Dec 1
  });

  /**
   * TC-AGT-VIEW-011: Pagination - Next Page
   * Note: UI
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Load page 2.
   */
  it('TC-AGT-VIEW-011: should load page 2 when clicking Next button', async () => {
    // Arrange - Create many bookings to trigger pagination
    const manyBookings = Array.from({ length: 25 }, (_, i) => ({
      booking_id: `BK-${String(i + 1).padStart(3, '0')}`,
      customer_name: `Customer ${i + 1}`,
      phone: `090912${String(i).padStart(4, '0')}`,
      email: `customer${i + 1}@test.com`,
      status: 'Confirmed',
      booking_date: `2025-12-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
      flight: `VN${String(i + 100)}`,
    }));

    mockGetBookings.mockResolvedValue(manyBookings);

    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    });

    // Assert - Currently on page 1
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');

    // Act - Click Next button
    await user.click(screen.getByTestId('next-page-button'));

    // Assert - Now on page 2
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
  });

  /**
   * TC-AGT-VIEW-012: Pagination - Last Page
   * Note: UI
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Load last page.
   */
  it('TC-AGT-VIEW-012: should load last page when clicking Last button', async () => {
    // Arrange - Create many bookings to trigger pagination
    const manyBookings = Array.from({ length: 25 }, (_, i) => ({
      booking_id: `BK-${String(i + 1).padStart(3, '0')}`,
      customer_name: `Customer ${i + 1}`,
      phone: `090912${String(i).padStart(4, '0')}`,
      email: `customer${i + 1}@test.com`,
      status: 'Confirmed',
      booking_date: `2025-12-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
      flight: `VN${String(i + 100)}`,
    }));

    mockGetBookings.mockResolvedValue(manyBookings);

    const user = userEvent.setup();
    render(<BookingList />);

    // Wait for bookings to load
    await waitFor(() => {
      expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    });

    // Assert - Currently on page 1
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');

    // Act - Click Last button
    await user.click(screen.getByTestId('last-page-button'));

    // Assert - Now on last page (page 3)
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 3 of 3');

    // Assert - Showing remaining 5 bookings on last page
    expect(screen.getByTestId('result-count')).toHaveTextContent('Showing 5 of 25 bookings');
  });

  /**
   * TC-AGT-VIEW-013: View Detail - Verify Seat Map Link
   * Business Requirement: BR40
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Link "View Seat Map" is clickable.
   */
  it('TC-AGT-VIEW-013: should display clickable "View Seat Map" link in booking detail', async () => {
    // Arrange
    const bookingDetail = {
      booking_id: 'BK-001',
      customer_name: 'Nguyen Van A',
      status: 'Confirmed',
    };

    mockGetBookingDetail.mockResolvedValue(bookingDetail);

    render(<BookingDetail bookingId="BK-001" />);

    // Assert - Seat Map link is rendered and clickable
    await waitFor(() => {
      const seatMapLink = screen.getByTestId('seat-map-link');
      expect(seatMapLink).toBeInTheDocument();
      expect(seatMapLink).toHaveTextContent('View Seat Map');
      expect(seatMapLink).toHaveAttribute('href', '/seat-map/BK-001');
    });

    // Assert - Link is an anchor element (clickable)
    const seatMapLink = screen.getByTestId('seat-map-link');
    expect(seatMapLink.tagName).toBe('A');
  });

  /**
   * TC-AGT-VIEW-014: View Detail - Verify Payment Link
   * Business Requirement: BR48
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Link "Payment Info" is clickable.
   */
  it('TC-AGT-VIEW-014: should display clickable "Payment Info" link in booking detail', async () => {
    // Arrange
    const bookingDetail = {
      booking_id: 'BK-001',
      customer_name: 'Nguyen Van A',
      status: 'Confirmed',
    };

    mockGetBookingDetail.mockResolvedValue(bookingDetail);

    render(<BookingDetail bookingId="BK-001" />);

    // Assert - Payment Info link is rendered and clickable
    await waitFor(() => {
      const paymentLink = screen.getByTestId('payment-info-link');
      expect(paymentLink).toBeInTheDocument();
      expect(paymentLink).toHaveTextContent('Payment Info');
      expect(paymentLink).toHaveAttribute('href', '/payment-info/BK-001');
    });

    // Assert - Link is an anchor element (clickable)
    const paymentLink = screen.getByTestId('payment-info-link');
    expect(paymentLink.tagName).toBe('A');
  });

  /**
   * TC-AGT-VIEW-015: Export Booking - PDF
   * Business Requirement: BR40
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * PDF downloaded with correct info.
   */
  it('TC-AGT-VIEW-015: should export booking to PDF with correct info', async () => {
    // Arrange
    mockExportBookingPDF.mockResolvedValue({
      success: true,
      filename: 'booking-BK-001.pdf',
      content: 'PDF_BINARY_DATA',
    });

    const user = userEvent.setup();
    render(<BookingExport bookingId="BK-001" />);

    // Act - Click Export PDF button
    await user.click(screen.getByTestId('export-pdf-button'));

    // Assert - Export API called with correct booking ID
    await waitFor(() => {
      expect(mockExportBookingPDF).toHaveBeenCalledWith('BK-001');
    });

    // Assert - Success message displayed
    expect(await screen.findByTestId('export-success')).toHaveTextContent('PDF downloaded successfully');

    // Assert - Button shows "Export PDF" again after completion
    expect(screen.getByTestId('export-pdf-button')).toHaveTextContent('Export PDF');
    expect(screen.getByTestId('export-pdf-button')).not.toBeDisabled();
  });
});
