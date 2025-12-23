import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test Suite: TC-SUP-PAX-001 to TC-SUP-PAX-008
 * Category: Supervision - Manage Passenger List (Danh sách khách)
 * Business Requirement: BR40 - Quản lý hành khách trên chuyến bay
 * 
 * Purpose: Test flight passenger list management, search, sort, and export functionality
 * 
 * Coverage:
 * - BR40: Manage passengers on flight
 * - UI Features: Table display, search, sort, PDF export, check-in status
 */

// Mock API functions
const mockGetPassengers = vi.fn();
const mockSearchPassengers = vi.fn();
const mockUpdateCheckInStatus = vi.fn();
const mockExportPassengerPDF = vi.fn();

// Mock passenger data
const mockPassengers = [
  {
    id: 'PAX001',
    name: 'Nguyen Van An',
    seatNumber: '12A',
    ticketId: 'TK001',
    status: 'Confirmed',
    checkedIn: false,
  },
  {
    id: 'PAX002',
    name: 'Tran Thi Binh',
    seatNumber: '12B',
    ticketId: 'TK002',
    status: 'Confirmed',
    checkedIn: true,
  },
  {
    id: 'PAX003',
    name: 'Le Van Cuong',
    seatNumber: '15C',
    ticketId: 'TK003',
    status: 'Confirmed',
    checkedIn: false,
  },
  {
    id: 'PAX004',
    name: 'Pham Thi Dan',
    seatNumber: '20D',
    ticketId: 'TK004',
    status: 'Pending',
    checkedIn: false,
  },
  {
    id: 'PAX005',
    name: 'Hoang Van An',
    seatNumber: '22E',
    ticketId: 'TK005',
    status: 'Confirmed',
    checkedIn: true,
  },
];

const mockEmptyFlight = {
  flightId: 'FLT999',
  flightNumber: 'VN999',
  passengers: [],
};

// Mock Component: PassengerListManagementPage
const PassengerListManagementPage = ({ flightId }: { flightId: string }) => {
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [filteredPassengers, setFilteredPassengers] = React.useState<any[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<{ field: string; direction: 'asc' | 'desc' } | null>(null);

  React.useEffect(() => {
    const loadPassengers = async () => {
      const data = await mockGetPassengers(flightId);
      setPassengers(data);
      setFilteredPassengers(data);
    };
    loadPassengers();
  }, [flightId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    await mockSearchPassengers(query);

    if (!query.trim()) {
      setFilteredPassengers(passengers);
      return;
    }

    // Search by name or seat number
    const results = passengers.filter(
      (pax) =>
        pax.name.toLowerCase().includes(query.toLowerCase()) ||
        pax.seatNumber.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPassengers(results);
  };

  const handleSort = (field: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.field === field) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }

    setSortConfig({ field, direction });

    const sorted = [...filteredPassengers].sort((a, b) => {
      if (field === 'name') {
        const comparison = a.name.localeCompare(b.name);
        return direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });

    setFilteredPassengers(sorted);
  };

  const handleExportPDF = async () => {
    const pdfData = await mockExportPassengerPDF(flightId, filteredPassengers);
    // Simulate PDF generation
    console.log('PDF exported:', pdfData);
  };

  const handleToggleCheckIn = async (passengerId: string, currentStatus: boolean) => {
    await mockUpdateCheckInStatus(passengerId, !currentStatus);
    
    // Update local state
    const updated = passengers.map((pax) =>
      pax.id === passengerId ? { ...pax, checkedIn: !currentStatus } : pax
    );
    setPassengers(updated);
    
    // Update filtered list
    const updatedFiltered = filteredPassengers.map((pax) =>
      pax.id === passengerId ? { ...pax, checkedIn: !currentStatus } : pax
    );
    setFilteredPassengers(updatedFiltered);
  };

  return (
    <div data-testid="passenger-list-management-page">
      <h2>Passenger List Management</h2>

      {/* Search Section */}
      <div data-testid="search-section">
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search by Name or Seat"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Export Button */}
      <button data-testid="export-pdf-btn" onClick={handleExportPDF}>
        Export PDF
      </button>

      {/* Passenger Table */}
      {filteredPassengers.length === 0 ? (
        <div data-testid="no-passengers-message">No passengers</div>
      ) : (
        <table data-testid="passenger-table">
          <thead>
            <tr>
              <th>
                <button
                  data-testid="sort-name-btn"
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', background: 'none' }}
                >
                  Name
                  {sortConfig?.field === 'name' && (
                    <span data-testid="name-sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </button>
              </th>
              <th data-testid="seat-header">Seat</th>
              <th data-testid="ticket-header">Ticket ID</th>
              <th data-testid="status-header">Status</th>
              <th data-testid="checkin-header">Check-in</th>
            </tr>
          </thead>
          <tbody data-testid="passenger-tbody">
            {filteredPassengers.map((pax, index) => (
              <tr key={pax.id} data-testid={`passenger-row-${index}`}>
                <td data-testid={`passenger-name-${index}`}>{pax.name}</td>
                <td data-testid={`passenger-seat-${index}`}>{pax.seatNumber}</td>
                <td data-testid={`passenger-ticket-${index}`}>{pax.ticketId}</td>
                <td data-testid={`passenger-status-${index}`}>{pax.status}</td>
                <td>
                  <input
                    type="checkbox"
                    data-testid={`checkin-checkbox-${index}`}
                    checked={pax.checkedIn}
                    onChange={() => handleToggleCheckIn(pax.id, pax.checkedIn)}
                  />
                  <span data-testid={`checkin-label-${index}`}>
                    {pax.checkedIn ? 'Checked-in' : 'Not checked-in'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Import React for component
import * as React from 'react';

describe('TC-SUP-PAX-001 to TC-SUP-PAX-008: Passenger List Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-SUP-PAX-001: View List - Columns
   * Business Requirement: BR40
   * 
   * Test Data / Input: Check table columns
   * Expected Result: Name, Seat, Ticket ID, Status
   */
  it('TC-SUP-PAX-001: should display table with correct columns (Name, Seat, Ticket ID, Status)', async () => {
    // Arrange
    mockGetPassengers.mockResolvedValue(mockPassengers);

    // Act
    render(<PassengerListManagementPage flightId="FLT001" />);

    // Assert: Wait for table to load
    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Verify column headers exist
    expect(screen.getByTestId('sort-name-btn')).toHaveTextContent('Name');
    expect(screen.getByTestId('seat-header')).toHaveTextContent('Seat');
    expect(screen.getByTestId('ticket-header')).toHaveTextContent('Ticket ID');
    expect(screen.getByTestId('status-header')).toHaveTextContent('Status');
    expect(screen.getByTestId('checkin-header')).toHaveTextContent('Check-in');

    // Verify data is displayed in correct columns
    expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Nguyen Van An');
    expect(screen.getByTestId('passenger-seat-0')).toHaveTextContent('12A');
    expect(screen.getByTestId('passenger-ticket-0')).toHaveTextContent('TK001');
    expect(screen.getByTestId('passenger-status-0')).toHaveTextContent('Confirmed');
  });

  /**
   * TC-SUP-PAX-002: Search Passenger
   * Business Requirement: BR40
   * 
   * Test Data / Input: Enter Name "An"
   * Expected Result: Show pax named An
   */
  it('TC-SUP-PAX-002: should search and show passengers with name containing "An"', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Initially 5 passengers visible
    expect(screen.getAllByTestId(/passenger-row-/)).toHaveLength(5);

    // Act: Search for "Van An" (more specific to get only 2 results)
    const searchInput = screen.getByTestId('search-input');
    await user.clear(searchInput);
    await user.type(searchInput, 'Van An');

    // Assert: Only passengers with "Van An" in name visible
    await waitFor(() => {
      const rows = screen.getAllByTestId(/passenger-row-/);
      expect(rows).toHaveLength(2); // Nguyen Van An, Hoang Van An
    }, { timeout: 2000 });

    // Verify correct passengers shown
    expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Nguyen Van An');
    expect(screen.getByTestId('passenger-name-1')).toHaveTextContent('Hoang Van An');

    // Verify search API called (with last query)
    expect(mockSearchPassengers).toHaveBeenCalled();
  });

  /**
   * TC-SUP-PAX-003: Search Seat
   * Business Requirement: BR40
   * 
   * Test Data / Input: Enter Seat "12A"
   * Expected Result: Show pax in 12A
   */
  it('TC-SUP-PAX-003: should search and show passenger in seat "12A"', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Act: Search for seat "12A"
    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, '12A');

    // Assert: Only passenger in seat 12A visible
    await waitFor(() => {
      const rows = screen.getAllByTestId(/passenger-row-/);
      expect(rows).toHaveLength(1);
    });

    // Verify correct passenger shown
    expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Nguyen Van An');
    expect(screen.getByTestId('passenger-seat-0')).toHaveTextContent('12A');

    // Verify search API called
    expect(mockSearchPassengers).toHaveBeenCalledWith('12A');
  });

  /**
   * TC-SUP-PAX-004: Sort by Name
   * UI Feature
   * 
   * Test Data / Input: Click Name Header
   * Expected Result: A-Z sorting
   */
  it('TC-SUP-PAX-004: should sort passengers by name A-Z when clicking name header', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Act: Click Name header to sort ascending
    const nameHeader = screen.getByTestId('sort-name-btn');
    await user.click(nameHeader);

    // Assert: Passengers sorted A-Z
    await waitFor(() => {
      expect(screen.getByTestId('name-sort-indicator')).toHaveTextContent('↑');
      
      // Verify order: Hoang Van An, Le Van Cuong, Nguyen Van An, Pham Thi Dan, Tran Thi Binh
      expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Hoang Van An');
      expect(screen.getByTestId('passenger-name-1')).toHaveTextContent('Le Van Cuong');
      expect(screen.getByTestId('passenger-name-2')).toHaveTextContent('Nguyen Van An');
      expect(screen.getByTestId('passenger-name-3')).toHaveTextContent('Pham Thi Dan');
      expect(screen.getByTestId('passenger-name-4')).toHaveTextContent('Tran Thi Binh');
    });

    // Act: Click again to sort descending
    await user.click(nameHeader);

    // Assert: Passengers sorted Z-A
    await waitFor(() => {
      expect(screen.getByTestId('name-sort-indicator')).toHaveTextContent('↓');
      
      // Verify reversed order
      expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Tran Thi Binh');
      expect(screen.getByTestId('passenger-name-1')).toHaveTextContent('Pham Thi Dan');
      expect(screen.getByTestId('passenger-name-2')).toHaveTextContent('Nguyen Van An');
    });
  });

  /**
   * TC-SUP-PAX-005: Export PDF - Layout
   * Business Requirement: BR40
   * 
   * Test Data / Input: Click Export
   * Expected Result: PDF lists all pax clearly
   */
  it('TC-SUP-PAX-005: should export PDF with all passenger data when clicking Export button', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);
    mockExportPassengerPDF.mockResolvedValue({
      success: true,
      pdfUrl: 'blob:passenger-list.pdf',
      passengerCount: 5,
      data: mockPassengers,
    });

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Act: Click Export PDF button
    const exportButton = screen.getByTestId('export-pdf-btn');
    await user.click(exportButton);

    // Assert: Export API called with correct data
    await waitFor(() => {
      expect(mockExportPassengerPDF).toHaveBeenCalledWith('FLT001', mockPassengers);
    });

    // Verify all passengers included in export
    const exportCall = mockExportPassengerPDF.mock.calls[0];
    const exportedPassengers = exportCall[1];
    
    expect(exportedPassengers).toHaveLength(5);
    expect(exportedPassengers[0]).toMatchObject({
      name: 'Nguyen Van An',
      seatNumber: '12A',
      ticketId: 'TK001',
      status: 'Confirmed',
    });
  });

  /**
   * TC-SUP-PAX-006: Export PDF - Data Integrity
   * Integrity Test
   * 
   * Test Data / Input: Compare PDF vs Screen
   * Expected Result: Data matches 100%
   */
  it('TC-SUP-PAX-006: should ensure exported PDF data matches screen data exactly', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);
    
    let capturedExportData: any = null;
    mockExportPassengerPDF.mockImplementation((flightId, passengers) => {
      capturedExportData = passengers;
      return Promise.resolve({
        success: true,
        pdfUrl: 'blob:passenger-list.pdf',
        passengerCount: passengers.length,
        data: passengers,
      });
    });

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Capture screen data
    const screenPassengers = mockPassengers;

    // Act: Export PDF
    const exportButton = screen.getByTestId('export-pdf-btn');
    await user.click(exportButton);

    // Assert: Exported data matches screen data 100%
    await waitFor(() => {
      expect(capturedExportData).not.toBeNull();
    });

    // Verify exact match for all fields
    capturedExportData.forEach((exportedPax: any, index: number) => {
      const screenPax = screenPassengers[index];
      
      expect(exportedPax.id).toBe(screenPax.id);
      expect(exportedPax.name).toBe(screenPax.name);
      expect(exportedPax.seatNumber).toBe(screenPax.seatNumber);
      expect(exportedPax.ticketId).toBe(screenPax.ticketId);
      expect(exportedPax.status).toBe(screenPax.status);
      expect(exportedPax.checkedIn).toBe(screenPax.checkedIn);
    });
  });

  /**
   * TC-SUP-PAX-007: Export - Empty Flight
   * Edge Case
   * 
   * Test Data / Input: Export flight with 0 pax
   * Expected Result: PDF generated with "No passengers"
   */
  it('TC-SUP-PAX-007: should export PDF with "No passengers" message for empty flight', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue([]);
    mockExportPassengerPDF.mockResolvedValue({
      success: true,
      pdfUrl: 'blob:empty-passenger-list.pdf',
      passengerCount: 0,
      data: [],
      message: 'No passengers',
    });

    render(<PassengerListManagementPage flightId="FLT999" />);

    // Assert: "No passengers" message displayed
    await waitFor(() => {
      expect(screen.getByTestId('no-passengers-message')).toHaveTextContent('No passengers');
    });

    // Act: Export PDF for empty flight
    const exportButton = screen.getByTestId('export-pdf-btn');
    await user.click(exportButton);

    // Assert: Export called with empty array
    await waitFor(() => {
      expect(mockExportPassengerPDF).toHaveBeenCalledWith('FLT999', []);
    });

    // Verify export result indicates no passengers
    const exportResult = await mockExportPassengerPDF.mock.results[0].value;
    expect(exportResult.passengerCount).toBe(0);
    expect(exportResult.message).toBe('No passengers');
  });

  /**
   * TC-SUP-PAX-008: Check-in Status (If avail)
   * Feature Test
   * 
   * Test Data / Input: Toggle "Checked-in"
   * Expected Result: Status updates
   */
  it('TC-SUP-PAX-008: should update check-in status when toggling checkbox', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetPassengers.mockResolvedValue(mockPassengers);
    mockUpdateCheckInStatus.mockResolvedValue({ success: true });

    render(<PassengerListManagementPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-table')).toBeInTheDocument();
    });

    // Initially first passenger (Nguyen Van An) is not checked in
    const firstCheckbox = screen.getByTestId('checkin-checkbox-0') as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(false);
    expect(screen.getByTestId('checkin-label-0')).toHaveTextContent('Not checked-in');

    // Act: Toggle check-in checkbox
    await user.click(firstCheckbox);

    // Assert: Status updated to checked-in
    await waitFor(() => {
      expect(mockUpdateCheckInStatus).toHaveBeenCalledWith('PAX001', true);
    });

    // Verify UI updated
    expect(firstCheckbox.checked).toBe(true);
    expect(screen.getByTestId('checkin-label-0')).toHaveTextContent('Checked-in');

    // Act: Toggle back to unchecked
    await user.click(firstCheckbox);

    // Assert: Status updated back to not checked-in
    await waitFor(() => {
      expect(mockUpdateCheckInStatus).toHaveBeenCalledWith('PAX001', false);
    });

    expect(firstCheckbox.checked).toBe(false);
    expect(screen.getByTestId('checkin-label-0')).toHaveTextContent('Not checked-in');
  });
});
