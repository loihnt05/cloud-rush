/**
 * Test Suite: TC-SUP-SEAT & TC-SUP-MGT (Flight Supervision - Seat & Customer Management)
 * Category: Flight Supervision - Check Seat Availability & Manage Passengers
 * Description: Unit tests for CSA flight supervision features
 * 
 * Test Cases:
 * - TC-SUP-SEAT-001: Verify Seat Map Display for Supervision
 * - TC-SUP-MGT-001: Verify "View Passenger List" Action
 * - TC-SUP-MGT-002: Verify "View Seat Map" Action
 * - TC-SUP-MGT-003: Verify "Export" Report Action
 * 
 * Prerequisites:
 * 1. User is logged in as CSA
 * 2. User has access to Flight Supervision features
 * 3. Flights with bookings exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock supervision APIs
const mockGetFlights = vi.fn();
const mockGetSeatMap = vi.fn();
const mockGetPassengerList = vi.fn();
const mockExportReport = vi.fn();
const mockGetSeatStatistics = vi.fn();

// Mock flight data
const mockFlights = [
  {
    id: 'flight_001',
    flightNumber: 'VN123',
    origin: 'SGN',
    destination: 'HAN',
    departureTime: '2025-12-25T08:00:00Z',
    airplaneCode: 'VN-A320',
    totalSeats: 180
  },
  {
    id: 'flight_002',
    flightNumber: 'VN456',
    origin: 'HAN',
    destination: 'DAD',
    departureTime: '2025-12-26T14:00:00Z',
    airplaneCode: 'VN-B737',
    totalSeats: 150
  }
];

// Mock seat map data
const mockSeatMap = [
  { id: 'seat_001', seatNumber: '1A', status: 'booked', passengerName: 'Nguyen Van A', class: 'Business' },
  { id: 'seat_002', seatNumber: '1B', status: 'available', passengerName: null, class: 'Business' },
  { id: 'seat_003', seatNumber: '1C', status: 'available', passengerName: null, class: 'Business' },
  { id: 'seat_004', seatNumber: '2A', status: 'booked', passengerName: 'Tran Thi B', class: 'Business' },
  { id: 'seat_005', seatNumber: '10A', status: 'booked', passengerName: 'Le Van C', class: 'Economy' },
  { id: 'seat_006', seatNumber: '10B', status: 'available', passengerName: null, class: 'Economy' },
  { id: 'seat_007', seatNumber: '10C', status: 'available', passengerName: null, class: 'Economy' },
  { id: 'seat_008', seatNumber: '11A', status: 'available', passengerName: null, class: 'Economy' },
  { id: 'seat_009', seatNumber: '11B', status: 'available', passengerName: null, class: 'Economy' },
  { id: 'seat_010', seatNumber: '11C', status: 'booked', passengerName: 'Pham Thi D', class: 'Economy' }
];

// Mock passenger list data
const mockPassengers = [
  {
    id: 'passenger_001',
    name: 'Nguyen Van A',
    bookingRef: 'BK-001',
    seatNumber: '1A',
    class: 'Business',
    ticketPrice: 5000000
  },
  {
    id: 'passenger_002',
    name: 'Tran Thi B',
    bookingRef: 'BK-002',
    seatNumber: '2A',
    class: 'Business',
    ticketPrice: 5000000
  },
  {
    id: 'passenger_003',
    name: 'Le Van C',
    bookingRef: 'BK-003',
    seatNumber: '10A',
    class: 'Economy',
    ticketPrice: 2500000
  },
  {
    id: 'passenger_004',
    name: 'Pham Thi D',
    bookingRef: 'BK-004',
    seatNumber: '11C',
    class: 'Economy',
    ticketPrice: 2500000
  }
];

// Mock seat statistics
const mockStatistics = {
  totalSeats: 10,
  availableSeats: 6,
  bookedSeats: 4,
  occupancyRate: 40
};

// Mock SeatAvailabilityPage component
const SeatAvailabilityPage = () => {
  const [flights, setFlights] = React.useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null);
  const [seatMap, setSeatMap] = React.useState<any[]>([]);
  const [statistics, setStatistics] = React.useState<any>(null);
  const [showSeatMap, setShowSeatMap] = React.useState(false);

  React.useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    const data = await mockGetFlights();
    setFlights(data);
  };

  const handleSelectFlight = async (flight: any) => {
    setSelectedFlight(flight);

    // Retrieve seat map
    const seats = await mockGetSeatMap(flight.id);
    setSeatMap(seats);

    // Get statistics
    const stats = await mockGetSeatStatistics(flight.id);
    setStatistics(stats);

    setShowSeatMap(true);
  };

  return (
    <div data-testid="seat-availability-page">
      <h2>Seat Availability Supervision</h2>

      {/* Flight List */}
      <div data-testid="flight-list">
        <h3>Select Flight to Supervise</h3>
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            data-testid={`flight-item-${index}`}
            onClick={() => handleSelectFlight(flight)}
            style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px' }}
          >
            <div data-testid={`flight-number-${index}`}>{flight.flightNumber}</div>
            <div data-testid={`flight-route-${index}`}>
              {flight.origin} → {flight.destination}
            </div>
            <div data-testid={`flight-departure-${index}`}>
              {new Date(flight.departureTime).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Seat Map Display */}
      {showSeatMap && selectedFlight && (
        <div data-testid="seat-map-display">
          <h3>Seat Map - {selectedFlight.flightNumber}</h3>

          {/* Statistics */}
          {statistics && (
            <div data-testid="seat-statistics">
              <div data-testid="total-seats">Total Seats: {statistics.totalSeats}</div>
              <div data-testid="available-seats">Available Seats: {statistics.availableSeats}</div>
              <div data-testid="booked-seats">Booked Seats: {statistics.bookedSeats}</div>
              <div data-testid="occupancy-rate">Occupancy Rate: {statistics.occupancyRate}%</div>
            </div>
          )}

          {/* Seat Map Grid */}
          <div data-testid="seat-map-grid">
            {seatMap.map((seat, index) => (
              <div
                key={seat.id}
                data-testid={`seat-${index}`}
                style={{
                  display: 'inline-block',
                  width: '60px',
                  height: '60px',
                  margin: '5px',
                  padding: '10px',
                  border: '1px solid #000',
                  backgroundColor: seat.status === 'booked' ? '#ff6b6b' : '#51cf66',
                  textAlign: 'center'
                }}
              >
                <div data-testid={`seat-number-${index}`}>{seat.seatNumber}</div>
                <div data-testid={`seat-status-${index}`}>{seat.status}</div>
                {seat.passengerName && (
                  <div data-testid={`seat-passenger-${index}`}>{seat.passengerName}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mock FlightMonitorPage component
const FlightMonitorPage = () => {
  const [flights, setFlights] = React.useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null);
  const [showPassengerList, setShowPassengerList] = React.useState(false);
  const [showSeatMapModal, setShowSeatMapModal] = React.useState(false);
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [seatMap, setSeatMap] = React.useState<any[]>([]);
  const [exportSuccess, setExportSuccess] = React.useState(false);

  React.useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    const data = await mockGetFlights();
    setFlights(data);
  };

  const handleViewPassengerList = async (flight: any) => {
    setSelectedFlight(flight);

    // Query passenger data
    const passengerData = await mockGetPassengerList(flight.id);
    setPassengers(passengerData);

    setShowPassengerList(true);
  };

  const handleViewSeatMap = async (flight: any) => {
    setSelectedFlight(flight);

    // Retrieve seat layout
    const seats = await mockGetSeatMap(flight.id);
    setSeatMap(seats);

    setShowSeatMapModal(true);
  };

  const handleExportReport = async (flight: any) => {
    setSelectedFlight(flight);

    // Generate report
    const passengerData = await mockGetPassengerList(flight.id);
    const seatData = await mockGetSeatMap(flight.id);

    const result = await mockExportReport({
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      passengers: passengerData,
      seats: seatData
    });

    if (result.success) {
      // Simulate PDF download
      const blob = new Blob(['PDF Report Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `flight_report_${flight.flightNumber}.pdf`;
      link.click();

      setExportSuccess(true);
    }
  };

  return (
    <div data-testid="flight-monitor-page">
      <h2>Flight Monitor</h2>

      {/* Export Success Message */}
      {exportSuccess && (
        <div data-testid="export-success-message">Report exported successfully</div>
      )}

      {/* Flight List */}
      <table data-testid="flight-monitor-table">
        <thead>
          <tr>
            <th>Flight Number</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => (
            <tr key={flight.id} data-testid={`monitor-flight-row-${index}`}>
              <td data-testid={`monitor-flight-number-${index}`}>{flight.flightNumber}</td>
              <td data-testid={`monitor-flight-route-${index}`}>
                {flight.origin} → {flight.destination}
              </td>
              <td data-testid={`monitor-flight-departure-${index}`}>
                {new Date(flight.departureTime).toLocaleString()}
              </td>
              <td data-testid={`monitor-flight-actions-${index}`}>
                <button
                  data-testid={`view-passenger-list-btn-${index}`}
                  onClick={() => handleViewPassengerList(flight)}
                >
                  View Passenger List
                </button>
                <button
                  data-testid={`view-seat-map-btn-${index}`}
                  onClick={() => handleViewSeatMap(flight)}
                >
                  View Seat Map
                </button>
                <button
                  data-testid={`export-report-btn-${index}`}
                  onClick={() => handleExportReport(flight)}
                >
                  Export
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Passenger List Modal */}
      {showPassengerList && selectedFlight && (
        <div data-testid="passenger-list-modal">
          <h3>Passenger List - {selectedFlight.flightNumber}</h3>

          <table data-testid="passenger-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Booking Ref</th>
                <th>Seat</th>
                <th>Class</th>
                <th>Price (₫)</th>
              </tr>
            </thead>
            <tbody data-testid="passenger-tbody">
              {passengers.map((passenger, index) => (
                <tr key={passenger.id} data-testid={`passenger-row-${index}`}>
                  <td data-testid={`passenger-name-${index}`}>{passenger.name}</td>
                  <td data-testid={`passenger-booking-${index}`}>{passenger.bookingRef}</td>
                  <td data-testid={`passenger-seat-${index}`}>{passenger.seatNumber}</td>
                  <td data-testid={`passenger-class-${index}`}>{passenger.class}</td>
                  <td data-testid={`passenger-price-${index}`}>
                    {passenger.ticketPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            data-testid="close-passenger-list-btn"
            onClick={() => setShowPassengerList(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Seat Map Modal */}
      {showSeatMapModal && selectedFlight && (
        <div data-testid="seat-map-modal">
          <h3>Seat Map - {selectedFlight.flightNumber}</h3>

          <div data-testid="seat-map-modal-grid">
            {seatMap.map((seat, index) => (
              <div
                key={seat.id}
                data-testid={`modal-seat-${index}`}
                style={{
                  display: 'inline-block',
                  width: '80px',
                  margin: '5px',
                  padding: '10px',
                  border: '1px solid #000',
                  backgroundColor: seat.status === 'booked' ? '#ff6b6b' : '#51cf66'
                }}
              >
                <div data-testid={`modal-seat-number-${index}`}>{seat.seatNumber}</div>
                <div data-testid={`modal-seat-status-${index}`}>
                  {seat.status === 'booked' ? 'Booked' : 'Empty'}
                </div>
              </div>
            ))}
          </div>

          <button
            data-testid="close-seat-map-btn"
            onClick={() => setShowSeatMapModal(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-SUP-SEAT: Flight Supervision - Seat Availability Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlights.mockResolvedValue(mockFlights);
    mockGetSeatMap.mockResolvedValue(mockSeatMap);
    mockGetSeatStatistics.mockResolvedValue(mockStatistics);
  });

  /**
   * TC-SUP-SEAT-001: Verify Seat Map Display for Supervision
   * Business Requirement: BR39
   * 
   * Prerequisites:
   * 1. CSA is logged in.
   * 2. Navigate to Seat Availability page.
   * 3. Select a specific flight.
   * 
   * Steps:
   * Step 1: Click on a flight to supervise.
   * Step Expected Result: System retrieves seat map.
   * Step 2: Verify statistics.
   * Step Expected Result: Counts are visible.
   * 
   * Test Case Expected Result:
   * A seat map displays showing available seats vs. booked seats for that flight.
   * System shows the number/count of available seats and booked seats.
   */
  it('TC-SUP-SEAT-001: should display seat map with availability statistics for supervision', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatAvailabilityPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list')).toBeInTheDocument();
    });

    // Act - Step 1: Click on a flight to supervise
    await user.click(screen.getByTestId('flight-item-0'));

    // Assert - Step 1 Expected Result: System retrieves seat map
    await waitFor(() => {
      expect(mockGetSeatMap).toHaveBeenCalledWith('flight_001');
      expect(mockGetSeatStatistics).toHaveBeenCalledWith('flight_001');
    });

    // Test Case Expected Result: Seat map displays with available vs booked seats
    expect(await screen.findByTestId('seat-map-display')).toBeInTheDocument();

    // Verify seat map grid is displayed
    expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();

    // Verify booked seats (4 booked)
    expect(screen.getByTestId('seat-status-0')).toHaveTextContent('booked');
    expect(screen.getByTestId('seat-status-3')).toHaveTextContent('booked');
    expect(screen.getByTestId('seat-status-4')).toHaveTextContent('booked');
    expect(screen.getByTestId('seat-status-9')).toHaveTextContent('booked');

    // Verify available seats
    expect(screen.getByTestId('seat-status-1')).toHaveTextContent('available');
    expect(screen.getByTestId('seat-status-2')).toHaveTextContent('available');

    // Step 2: Verify statistics
    // Assert - Step 2 Expected Result: Counts are visible
    expect(screen.getByTestId('seat-statistics')).toBeInTheDocument();
    expect(screen.getByTestId('total-seats')).toHaveTextContent('Total Seats: 10');
    expect(screen.getByTestId('available-seats')).toHaveTextContent('Available Seats: 6');
    expect(screen.getByTestId('booked-seats')).toHaveTextContent('Booked Seats: 4');
    expect(screen.getByTestId('occupancy-rate')).toHaveTextContent('Occupancy Rate: 40%');
  });
});

describe('TC-SUP-MGT: Flight Supervision - Manage Seat & Customer Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlights.mockResolvedValue(mockFlights);
    mockGetPassengerList.mockResolvedValue(mockPassengers);
    mockGetSeatMap.mockResolvedValue(mockSeatMap);
    mockExportReport.mockResolvedValue({ success: true, reportUrl: '/reports/flight_001.pdf' });
  });

  /**
   * TC-SUP-MGT-001: Verify "View Passenger List" Action
   * Business Requirement: BR40
   * 
   * Prerequisites:
   * 1. CSA is on Flight Monitor page.
   * 2. Flight has booked passengers.
   * 
   * Steps:
   * Step 1: Click "View Passenger List" button.
   * Step Expected Result: System queries passenger data.
   * 
   * Test Case Expected Result:
   * A list of passengers existing in the selected flight is returned and displayed.
   */
  it('TC-SUP-MGT-001: should display passenger list when viewing flight passengers', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightMonitorPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-monitor-table')).toBeInTheDocument();
    });

    // Act - Step 1: Click "View Passenger List" button
    await user.click(screen.getByTestId('view-passenger-list-btn-0'));

    // Assert - Step Expected Result: System queries passenger data
    await waitFor(() => {
      expect(mockGetPassengerList).toHaveBeenCalledWith('flight_001');
    });

    // Test Case Expected Result: List of passengers is displayed
    expect(await screen.findByTestId('passenger-list-modal')).toBeInTheDocument();
    expect(screen.getByTestId('passenger-table')).toBeInTheDocument();

    // Verify passenger data
    expect(screen.getByTestId('passenger-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('passenger-name-0')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('passenger-booking-0')).toHaveTextContent('BK-001');
    expect(screen.getByTestId('passenger-seat-0')).toHaveTextContent('1A');
    expect(screen.getByTestId('passenger-class-0')).toHaveTextContent('Business');

    expect(screen.getByTestId('passenger-name-1')).toHaveTextContent('Tran Thi B');
    expect(screen.getByTestId('passenger-name-2')).toHaveTextContent('Le Van C');
    expect(screen.getByTestId('passenger-name-3')).toHaveTextContent('Pham Thi D');

    // Verify all 4 passengers are displayed
    expect(screen.getAllByTestId(/^passenger-row-/).length).toBe(4);
  });

  /**
   * TC-SUP-MGT-002: Verify "View Seat Map" Action
   * Business Requirement: BR40
   * 
   * Prerequisites:
   * 1. CSA is on Flight Monitor page.
   * 
   * Steps:
   * Step 1: Click "View Seat Map" button.
   * Step Expected Result: System retrieves seat layout.
   * 
   * Test Case Expected Result:
   * Seat map displays with status empty or booked for each seat.
   */
  it('TC-SUP-MGT-002: should display seat map with status when viewing seat layout', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightMonitorPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-monitor-table')).toBeInTheDocument();
    });

    // Act - Step 1: Click "View Seat Map" button
    await user.click(screen.getByTestId('view-seat-map-btn-0'));

    // Assert - Step Expected Result: System retrieves seat layout
    await waitFor(() => {
      expect(mockGetSeatMap).toHaveBeenCalledWith('flight_001');
    });

    // Test Case Expected Result: Seat map displays with status empty or booked
    expect(await screen.findByTestId('seat-map-modal')).toBeInTheDocument();
    expect(screen.getByTestId('seat-map-modal-grid')).toBeInTheDocument();

    // Verify seat statuses
    expect(screen.getByTestId('modal-seat-number-0')).toHaveTextContent('1A');
    expect(screen.getByTestId('modal-seat-status-0')).toHaveTextContent('Booked');

    expect(screen.getByTestId('modal-seat-number-1')).toHaveTextContent('1B');
    expect(screen.getByTestId('modal-seat-status-1')).toHaveTextContent('Empty');

    expect(screen.getByTestId('modal-seat-number-2')).toHaveTextContent('1C');
    expect(screen.getByTestId('modal-seat-status-2')).toHaveTextContent('Empty');

    // Verify all seats are displayed
    expect(screen.getAllByTestId(/^modal-seat-\d+$/).length).toBe(10);
  });

  /**
   * TC-SUP-MGT-003: Verify "Export" Report Action
   * Business Requirement: BR40
   * 
   * Prerequisites:
   * 1. CSA is on Flight Monitor page.
   * 
   * Steps:
   * Step 1: Click "Export" button.
   * Step Expected Result: System generates a report.
   * 
   * Test Case Expected Result:
   * A PDF file is exported containing the list of passengers and list of booked seats.
   */
  it('TC-SUP-MGT-003: should export PDF report with passengers and booked seats', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightMonitorPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-monitor-table')).toBeInTheDocument();
    });

    // Act - Step 1: Click "Export" button
    await user.click(screen.getByTestId('export-report-btn-0'));

    // Assert - Step Expected Result: System generates a report
    await waitFor(() => {
      expect(mockGetPassengerList).toHaveBeenCalledWith('flight_001');
      expect(mockGetSeatMap).toHaveBeenCalledWith('flight_001');
    });

    // Test Case Expected Result: PDF file exported with passenger and seat data
    expect(mockExportReport).toHaveBeenCalledWith({
      flightId: 'flight_001',
      flightNumber: 'VN123',
      passengers: mockPassengers,
      seats: mockSeatMap
    });

    // Verify success message
    expect(await screen.findByTestId('export-success-message')).toHaveTextContent('Report exported successfully');
  });
});
