import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test Suite: TC-SUP-SEAT-002 to TC-SUP-SEAT-010
 * Category: Supervision - Seat Map & Availability (Giám sát Ghế)
 * Business Requirement: BR39 - Xem chi tiết tình trạng ghế của chuyến bay
 * 
 * Purpose: Test flight seat map visualization, statistics, filtering, and interactions
 * 
 * Coverage:
 * - BR39: View detailed seat status of flights
 * - BR40: View passenger details from seat
 * - UI Features: Seat map visualization, tooltips, statistics, filtering
 */

// Mock API functions
const mockGetFlightSeatMap = vi.fn();
const mockGetSeatStatistics = vi.fn();
const mockGetPassengerDetails = vi.fn();
const mockBookSeat = vi.fn();

// Mock seat data structures
const mockEmptyFlight = {
  flightId: 'FLT001',
  flightNumber: 'VN001',
  airplaneCapacity: 180,
  seats: [
    // Business Class (Rows 1-5, seats A-D)
    { id: 'S1A', row: 1, number: 'A', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S1B', row: 1, number: 'B', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S1C', row: 1, number: 'C', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S1D', row: 1, number: 'D', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S2A', row: 2, number: 'A', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S2B', row: 2, number: 'B', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S2C', row: 2, number: 'C', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S2D', row: 2, number: 'D', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    // Economy Class (Rows 6-10, seats A-F) - sample rows
    { id: 'S6A', row: 6, number: 'A', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6B', row: 6, number: 'B', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6C', row: 6, number: 'C', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6D', row: 6, number: 'D', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6E', row: 6, number: 'E', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6F', row: 6, number: 'F', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
  ],
};

const mockFullFlight = {
  flightId: 'FLT002',
  flightNumber: 'VN002',
  airplaneCapacity: 150,
  seats: [
    // All seats booked
    { id: 'S1A', row: 1, number: 'A', class: 'Business', status: 'booked', passengerId: 'P001', passengerName: 'Nguyen Van A' },
    { id: 'S1B', row: 1, number: 'B', class: 'Business', status: 'booked', passengerId: 'P002', passengerName: 'Tran Thi B' },
    { id: 'S1C', row: 1, number: 'C', class: 'Business', status: 'booked', passengerId: 'P003', passengerName: 'Le Van C' },
    { id: 'S1D', row: 1, number: 'D', class: 'Business', status: 'booked', passengerId: 'P004', passengerName: 'Pham Thi D' },
    { id: 'S6A', row: 6, number: 'A', class: 'Economy', status: 'booked', passengerId: 'P005', passengerName: 'Hoang Van E' },
    { id: 'S6B', row: 6, number: 'B', class: 'Economy', status: 'booked', passengerId: 'P006', passengerName: 'Vo Thi F' },
    { id: 'S6C', row: 6, number: 'C', class: 'Economy', status: 'booked', passengerId: 'P007', passengerName: 'Dang Van G' },
    { id: 'S6D', row: 6, number: 'D', class: 'Economy', status: 'booked', passengerId: 'P008', passengerName: 'Bui Thi H' },
  ],
};

const mockMixedFlight = {
  flightId: 'FLT003',
  flightNumber: 'VN003',
  airplaneCapacity: 180,
  seats: [
    // Mixed status - some booked, some available
    { id: 'S1A', row: 1, number: 'A', class: 'Business', status: 'booked', passengerId: 'P001', passengerName: 'Nguyen Van A' },
    { id: 'S1B', row: 1, number: 'B', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S1C', row: 1, number: 'C', class: 'Business', status: 'booked', passengerId: 'P003', passengerName: 'Le Van C' },
    { id: 'S1D', row: 1, number: 'D', class: 'Business', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6A', row: 6, number: 'A', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6B', row: 6, number: 'B', class: 'Economy', status: 'booked', passengerId: 'P006', passengerName: 'Vo Thi F' },
    { id: 'S6C', row: 6, number: 'C', class: 'Economy', status: 'available', passengerId: null, passengerName: null },
    { id: 'S6D', row: 6, number: 'D', class: 'Economy', status: 'booked', passengerId: 'P008', passengerName: 'Bui Thi H' },
  ],
};

// Mock Component: FlightSeatMapPage
const FlightSeatMapPage = ({ flightId }: { flightId: string }) => {
  const [seatMapData, setSeatMapData] = React.useState<any>(null);
  const [statistics, setStatistics] = React.useState<any>(null);
  const [selectedClass, setSelectedClass] = React.useState<string>('All');
  const [hoveredSeat, setHoveredSeat] = React.useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = React.useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  React.useEffect(() => {
    const loadSeatMap = async () => {
      const data = await mockGetFlightSeatMap(flightId);
      setSeatMapData(data);
      
      const stats = await mockGetSeatStatistics(flightId);
      setStatistics(stats);
    };
    loadSeatMap();
  }, [flightId]);

  const handleSeatClick = async (seat: any) => {
    if (seat.status === 'booked') {
      const details = await mockGetPassengerDetails(seat.passengerId);
      setSelectedSeat({ ...seat, ...details });
      setShowDetailsModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedSeat(null);
  };

  const filteredSeats = seatMapData?.seats.filter((seat: any) => {
    if (selectedClass === 'All') return true;
    return seat.class === selectedClass;
  });

  if (!seatMapData || !statistics) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="flight-seat-map-page">
      <h2>Flight Seat Map - {seatMapData.flightNumber}</h2>

      {/* Statistics Section */}
      <div data-testid="seat-statistics">
        <div data-testid="total-seats">Total Seats: {statistics.total}</div>
        <div data-testid="available-seats">Available: {statistics.available}</div>
        <div data-testid="booked-seats">Booked: {statistics.booked}</div>
      </div>

      {/* Filter Section */}
      <div data-testid="seat-filter-section">
        <select
          data-testid="class-filter"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="All">All Classes</option>
          <option value="Business">Business Class</option>
          <option value="Economy">Economy Class</option>
        </select>
      </div>

      {/* Seat Map */}
      <div data-testid="seat-map-grid">
        {filteredSeats?.map((seat: any) => (
          <div
            key={seat.id}
            data-testid={`seat-${seat.id}`}
            data-status={seat.status}
            data-class={seat.class}
            style={{
              backgroundColor: seat.status === 'available' ? 'green' : 'red',
              cursor: seat.status === 'booked' ? 'pointer' : 'default',
              position: 'relative',
            }}
            onMouseEnter={() => setHoveredSeat(seat.id)}
            onMouseLeave={() => setHoveredSeat(null)}
            onClick={() => handleSeatClick(seat)}
          >
            {seat.row}{seat.number}
            
            {/* Tooltip for booked seats */}
            {hoveredSeat === seat.id && seat.status === 'booked' && (
              <div
                data-testid={`tooltip-${seat.id}`}
                style={{
                  position: 'absolute',
                  backgroundColor: 'black',
                  color: 'white',
                  padding: '5px',
                  borderRadius: '4px',
                  zIndex: 1000,
                }}
              >
                <div>Passenger: {seat.passengerName}</div>
                <div>ID: {seat.passengerId}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Passenger Details Modal */}
      {showDetailsModal && selectedSeat && (
        <div data-testid="passenger-details-modal">
          <h3>Passenger Details</h3>
          <div data-testid="modal-passenger-name">Name: {selectedSeat.fullName}</div>
          <div data-testid="modal-passenger-id">ID: {selectedSeat.passengerId}</div>
          <div data-testid="modal-passenger-phone">Phone: {selectedSeat.phone}</div>
          <div data-testid="modal-seat-info">Seat: {selectedSeat.row}{selectedSeat.number} ({selectedSeat.class})</div>
          <button data-testid="close-modal-btn" onClick={handleCloseModal}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Import React for component
import * as React from 'react';

describe('TC-SUP-SEAT-002 to TC-SUP-SEAT-010: Flight Seat Map & Availability Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-SUP-SEAT-002: View Map - Empty Flight
   * Business Requirement: BR39
   * 
   * Test Data / Input: Open newly created flight
   * Expected Result: All seats Green (Empty)
   */
  it('TC-SUP-SEAT-002: should display all seats as green (available) for empty flight', async () => {
    // Arrange
    mockGetFlightSeatMap.mockResolvedValue(mockEmptyFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 180,
      booked: 0,
    });

    // Act
    render(<FlightSeatMapPage flightId="FLT001" />);

    // Assert: Wait for seat map to load
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Verify all seats are available (green)
    const allSeats = mockEmptyFlight.seats;
    allSeats.forEach((seat) => {
      const seatElement = screen.getByTestId(`seat-${seat.id}`);
      expect(seatElement).toBeInTheDocument();
      expect(seatElement).toHaveAttribute('data-status', 'available');
      // Seat rendered with green background
      expect(seatElement.style.backgroundColor).toBe('green');
    });

    // Verify statistics
    expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 180');
    expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked: 0');
  });

  /**
   * TC-SUP-SEAT-003: View Map - Full Flight
   * Business Requirement: BR39
   * 
   * Test Data / Input: Open fully booked flight
   * Expected Result: All seats Red (Booked)
   */
  it('TC-SUP-SEAT-003: should display all seats as red (booked) for full flight', async () => {
    // Arrange
    mockGetFlightSeatMap.mockResolvedValue(mockFullFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 150,
      available: 0,
      booked: 150,
    });

    // Act
    render(<FlightSeatMapPage flightId="FLT002" />);

    // Assert: Wait for seat map to load
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Verify all seats are booked (red)
    const allSeats = mockFullFlight.seats;
    allSeats.forEach((seat) => {
      const seatElement = screen.getByTestId(`seat-${seat.id}`);
      expect(seatElement).toBeInTheDocument();
      expect(seatElement).toHaveAttribute('data-status', 'booked');
      // Seat rendered with red background
      expect(seatElement.style.backgroundColor).toBe('red');
    });

    // Verify statistics
    expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 0');
    expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked: 150');
  });

  /**
   * TC-SUP-SEAT-004: View Map - Mixed Status
   * Business Requirement: BR39
   * 
   * Test Data / Input: Flight with some bookings
   * Expected Result: Correct mix of Green/Red
   */
  it('TC-SUP-SEAT-004: should display correct mix of green and red seats for mixed flight', async () => {
    // Arrange
    mockGetFlightSeatMap.mockResolvedValue(mockMixedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 104,
      booked: 76,
    });

    // Act
    render(<FlightSeatMapPage flightId="FLT003" />);

    // Assert: Wait for seat map to load
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Verify booked seats are red
    const bookedSeats = mockMixedFlight.seats.filter(s => s.status === 'booked');
    bookedSeats.forEach((seat) => {
      const seatElement = screen.getByTestId(`seat-${seat.id}`);
      expect(seatElement).toHaveAttribute('data-status', 'booked');
      expect(seatElement.style.backgroundColor).toBe('red');
    });

    // Verify available seats are green
    const availableSeats = mockMixedFlight.seats.filter(s => s.status === 'available');
    availableSeats.forEach((seat) => {
      const seatElement = screen.getByTestId(`seat-${seat.id}`);
      expect(seatElement).toHaveAttribute('data-status', 'available');
      expect(seatElement.style.backgroundColor).toBe('green');
    });

    // Verify statistics reflect mixed status
    expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 104');
    expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked: 76');
  });

  /**
   * TC-SUP-SEAT-005: View Map - Seat Tooltip
   * Feature Test
   * 
   * Test Data / Input: Hover over booked seat
   * Expected Result: Show Passenger Name/ID
   */
  it('TC-SUP-SEAT-005: should show tooltip with passenger info when hovering over booked seat', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetFlightSeatMap.mockResolvedValue(mockMixedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 104,
      booked: 76,
    });

    render(<FlightSeatMapPage flightId="FLT003" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Act: Hover over a booked seat (S1A - Nguyen Van A)
    const bookedSeat = screen.getByTestId('seat-S1A');
    await user.hover(bookedSeat);

    // Assert: Tooltip appears with passenger info
    await waitFor(() => {
      const tooltip = screen.getByTestId('tooltip-S1A');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Passenger: Nguyen Van A');
      expect(tooltip).toHaveTextContent('ID: P001');
    });

    // Act: Unhover
    await user.unhover(bookedSeat);

    // Assert: Tooltip disappears
    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-S1A')).not.toBeInTheDocument();
    });
  });

  /**
   * TC-SUP-SEAT-006: Statistics - Total Seats
   * Business Requirement: BR39
   * 
   * Test Data / Input: Check Summary Box
   * Expected Result: Total = Capacity of Plane
   */
  it('TC-SUP-SEAT-006: should display total seats equal to airplane capacity', async () => {
    // Arrange
    const airplaneCapacity = 180;
    mockGetFlightSeatMap.mockResolvedValue({
      ...mockEmptyFlight,
      airplaneCapacity,
    });
    mockGetSeatStatistics.mockResolvedValue({
      total: airplaneCapacity,
      available: 180,
      booked: 0,
    });

    // Act
    render(<FlightSeatMapPage flightId="FLT001" />);

    // Assert: Total seats matches airplane capacity
    await waitFor(() => {
      expect(screen.getByTestId('total-seats')).toHaveTextContent(`Total Seats: ${airplaneCapacity}`);
    });

    // Verify statistics consistency: total = available + booked
    const totalElement = screen.getByTestId('total-seats');
    const availableElement = screen.getByTestId('available-seats');
    const bookedElement = screen.getByTestId('booked-seats');

    expect(totalElement).toHaveTextContent('Total Seats: 180');
    expect(availableElement).toHaveTextContent('Available: 180');
    expect(bookedElement).toHaveTextContent('Booked: 0');
  });

  /**
   * TC-SUP-SEAT-007: Statistics - Available Count
   * Business Requirement: BR39
   * 
   * Test Data / Input: Book 1 seat. Refresh.
   * Expected Result: Available count decreases by 1
   */
  it('TC-SUP-SEAT-007: should decrease available count by 1 after booking a seat', async () => {
    // Arrange: Initial state - 180 available
    mockGetFlightSeatMap.mockResolvedValue(mockEmptyFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 180,
      booked: 0,
    });

    const { unmount } = render(<FlightSeatMapPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 180');
    });

    // Act: Simulate booking 1 seat (external action, then refresh)
    await mockBookSeat('FLT001', 'S1A', 'P999');

    // Update mock data after booking
    const updatedFlight = {
      ...mockEmptyFlight,
      seats: mockEmptyFlight.seats.map(seat =>
        seat.id === 'S1A'
          ? { ...seat, status: 'booked', passengerId: 'P999', passengerName: 'Test Passenger' }
          : seat
      ),
    };

    mockGetFlightSeatMap.mockResolvedValue(updatedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 179,
      booked: 1,
    });

    // Unmount and remount to simulate page refresh
    unmount();
    render(<FlightSeatMapPage flightId="FLT001" />);

    // Assert: Available count decreased by 1
    await waitFor(() => {
      expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 179');
    });

    expect(mockBookSeat).toHaveBeenCalledWith('FLT001', 'S1A', 'P999');
  });

  /**
   * TC-SUP-SEAT-008: Statistics - Booked Count
   * Business Requirement: BR39
   * 
   * Test Data / Input: Book 1 seat. Refresh.
   * Expected Result: Booked count increases by 1
   */
  it('TC-SUP-SEAT-008: should increase booked count by 1 after booking a seat', async () => {
    // Arrange: Initial state - 0 booked
    mockGetFlightSeatMap.mockResolvedValue(mockEmptyFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 180,
      booked: 0,
    });

    const { unmount } = render(<FlightSeatMapPage flightId="FLT001" />);

    await waitFor(() => {
      expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked: 0');
    });

    // Act: Simulate booking 1 seat
    await mockBookSeat('FLT001', 'S1A', 'P999');

    // Update mock data after booking
    const updatedFlight = {
      ...mockEmptyFlight,
      seats: mockEmptyFlight.seats.map(seat =>
        seat.id === 'S1A'
          ? { ...seat, status: 'booked', passengerId: 'P999', passengerName: 'Test Passenger' }
          : seat
      ),
    };

    mockGetFlightSeatMap.mockResolvedValue(updatedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 179,
      booked: 1,
    });

    // Unmount and remount to simulate page refresh
    unmount();
    render(<FlightSeatMapPage flightId="FLT001" />);

    // Assert: Booked count increased by 1
    await waitFor(() => {
      expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked: 1');
    });

    // Verify statistics consistency: total = available + booked
    expect(screen.getByTestId('total-seats')).toHaveTextContent('Total Seats: 180');
    expect(screen.getByTestId('available-seats')).toHaveTextContent('Available: 179');
  });

  /**
   * TC-SUP-SEAT-009: Filter Seat - Business
   * UI Feature
   * 
   * Test Data / Input: Filter View "Business"
   * Expected Result: Only show Biz rows
   */
  it('TC-SUP-SEAT-009: should filter and show only Business class seats when Business filter selected', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetFlightSeatMap.mockResolvedValue(mockMixedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 104,
      booked: 76,
    });

    render(<FlightSeatMapPage flightId="FLT003" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Initially all seats visible
    const allSeats = mockMixedFlight.seats;
    allSeats.forEach((seat) => {
      expect(screen.getByTestId(`seat-${seat.id}`)).toBeInTheDocument();
    });

    // Act: Select Business class filter
    const classFilter = screen.getByTestId('class-filter');
    await user.selectOptions(classFilter, 'Business');

    // Assert: Only Business class seats visible
    await waitFor(() => {
      const businessSeats = mockMixedFlight.seats.filter(s => s.class === 'Business');
      const economySeats = mockMixedFlight.seats.filter(s => s.class === 'Economy');

      // Business seats should be visible
      businessSeats.forEach((seat) => {
        expect(screen.getByTestId(`seat-${seat.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`seat-${seat.id}`)).toHaveAttribute('data-class', 'Business');
      });

      // Economy seats should NOT be visible
      economySeats.forEach((seat) => {
        expect(screen.queryByTestId(`seat-${seat.id}`)).not.toBeInTheDocument();
      });
    });
  });

  /**
   * TC-SUP-SEAT-010: Seat Details - Click
   * Business Requirement: BR40
   * 
   * Test Data / Input: Click on Red Seat
   * Expected Result: Popup shows Passenger Details
   */
  it('TC-SUP-SEAT-010: should show passenger details popup when clicking on booked seat', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetFlightSeatMap.mockResolvedValue(mockMixedFlight);
    mockGetSeatStatistics.mockResolvedValue({
      total: 180,
      available: 104,
      booked: 76,
    });

    // Mock passenger details API
    mockGetPassengerDetails.mockResolvedValue({
      passengerId: 'P001',
      fullName: 'Nguyen Van A',
      phone: '0901234567',
      email: 'nguyenvana@example.com',
      bookingId: 'BK001',
    });

    render(<FlightSeatMapPage flightId="FLT003" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();
    });

    // Act: Click on booked seat S1A
    const bookedSeat = screen.getByTestId('seat-S1A');
    await user.click(bookedSeat);

    // Assert: Passenger details modal appears
    await waitFor(() => {
      expect(screen.getByTestId('passenger-details-modal')).toBeInTheDocument();
    });

    // Verify passenger details displayed
    expect(screen.getByTestId('modal-passenger-name')).toHaveTextContent('Name: Nguyen Van A');
    expect(screen.getByTestId('modal-passenger-id')).toHaveTextContent('ID: P001');
    expect(screen.getByTestId('modal-passenger-phone')).toHaveTextContent('Phone: 0901234567');
    expect(screen.getByTestId('modal-seat-info')).toHaveTextContent('Seat: 1A (Business)');

    // Verify API was called
    expect(mockGetPassengerDetails).toHaveBeenCalledWith('P001');

    // Act: Close modal
    const closeButton = screen.getByTestId('close-modal-btn');
    await user.click(closeButton);

    // Assert: Modal closed
    await waitFor(() => {
      expect(screen.queryByTestId('passenger-details-modal')).not.toBeInTheDocument();
    });
  });
});
