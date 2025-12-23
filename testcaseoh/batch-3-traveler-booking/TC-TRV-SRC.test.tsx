/**
 * Test Suite: TC-TRV-SRC (Traveler Search Flight)
 * Category: Traveler Services - Flight Search & Discovery
 * Description: Unit tests for flight search functionality including one-way, round-trip, validation, and edge cases
 * 
 * Test Cases:
 * - TC-TRV-SRC-001: Search Flight - One Way
 * - TC-TRV-SRC-002: Search Flight - Round Trip
 * - TC-TRV-SRC-003: Search Flight - Same Day
 * - TC-TRV-SRC-004: Search Flight - Past Date
 * - TC-TRV-SRC-005: Search Flight - Return < Depart
 * - TC-TRV-SRC-006: Search Flight - 0 Passengers
 * - TC-TRV-SRC-007: Search Flight - Max Passengers
 * - TC-TRV-SRC-008: Search Flight - No Results
 * - TC-TRV-SRC-009: Search Flight - Sold Out
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User is on flight search page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock search APIs
const mockSearchFlights = vi.fn();
const mockValidateSearchParams = vi.fn();

// Mock flight data
const mockFlights = [
  {
    flightId: 'FL001',
    flightNumber: 'VN123',
    from: 'SGN',
    to: 'HAN',
    departureDate: '2025-12-30',
    departureTime: '10:00',
    arrivalTime: '12:00',
    price: 2000000,
    availableSeats: 50
  },
  {
    flightId: 'FL002',
    flightNumber: 'VN456',
    from: 'SGN',
    to: 'HAN',
    departureDate: '2025-12-30',
    departureTime: '14:00',
    arrivalTime: '16:00',
    price: 2500000,
    availableSeats: 30
  }
];

const mockReturnFlights = [
  {
    flightId: 'FL003',
    flightNumber: 'VN789',
    from: 'HAN',
    to: 'SGN',
    departureDate: '2026-01-05',
    departureTime: '08:00',
    arrivalTime: '10:00',
    price: 2200000,
    availableSeats: 40
  }
];

// Mock FlightSearch component
const FlightSearch = () => {
  const [tripType, setTripType] = React.useState<'oneWay' | 'roundTrip'>('oneWay');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [departureDate, setDepartureDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');
  const [passengers, setPassengers] = React.useState(1);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [returnFlights, setReturnFlights] = React.useState<any[]>([]);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const validateDates = (): string | null => {
    if (!departureDate) {
      return 'Departure date required';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depDate = new Date(departureDate);
    depDate.setHours(0, 0, 0, 0);

    // Check if departure date is in the past
    if (depDate < today) {
      return 'Invalid Date';
    }

    // For round trip, validate return date
    if (tripType === 'roundTrip') {
      if (!returnDate) {
        return 'Return date required';
      }

      const retDate = new Date(returnDate);
      retDate.setHours(0, 0, 0, 0);

      if (retDate < depDate) {
        return 'Return date must be after Depart';
      }
    }

    return null;
  };

  const validatePassengers = (): string | null => {
    if (passengers < 1) {
      return 'At least 1 passenger';
    }

    if (passengers > 9) {
      return 'Maximum 9 passengers';
    }

    return null;
  };

  const filterSameDayFlights = (flights: any[], date: string) => {
    const searchDate = new Date(date);
    const today = new Date();
    
    // If searching for today, filter out past flights
    if (searchDate.toDateString() === today.toDateString()) {
      const currentTime = today.getHours() * 60 + today.getMinutes();
      
      return flights.filter(flight => {
        const [hours, minutes] = flight.departureTime.split(':').map(Number);
        const flightTime = hours * 60 + minutes;
        return flightTime > currentTime;
      });
    }

    return flights;
  };

  const handleSearch = async () => {
    setError('');
    setSearchResults([]);
    setReturnFlights([]);

    // Validate dates
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    // Validate passengers
    const passengerError = validatePassengers();
    if (passengerError) {
      setError(passengerError);
      return;
    }

    // Validate origin and destination
    if (!from || !to) {
      setError('Origin and destination required');
      return;
    }

    setLoading(true);

    try {
      // Search outbound flights
      const outboundResult = await mockSearchFlights({
        from,
        to,
        date: departureDate,
        passengers,
        tripType
      });

      if (outboundResult.flights.length === 0) {
        setError('No flights found');
        setLoading(false);
        return;
      }

      // Filter same-day flights if needed
      const filteredFlights = filterSameDayFlights(outboundResult.flights, departureDate);

      setSearchResults(filteredFlights);

      // Search return flights for round trip
      if (tripType === 'roundTrip') {
        const returnResult = await mockSearchFlights({
          from: to,
          to: from,
          date: returnDate,
          passengers,
          tripType
        });

        setReturnFlights(returnResult.flights);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="flight-search">
      <h2>Search Flights</h2>

      {/* Trip Type */}
      <div data-testid="trip-type-section">
        <label>
          <input
            data-testid="one-way-radio"
            type="radio"
            name="tripType"
            checked={tripType === 'oneWay'}
            onChange={() => setTripType('oneWay')}
          />
          One Way
        </label>
        <label>
          <input
            data-testid="round-trip-radio"
            type="radio"
            name="tripType"
            checked={tripType === 'roundTrip'}
            onChange={() => setTripType('roundTrip')}
          />
          Round Trip
        </label>
      </div>

      {/* Origin and Destination */}
      <div data-testid="route-section">
        <input
          data-testid="from-input"
          type="text"
          placeholder="From"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          data-testid="to-input"
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Dates */}
      <div data-testid="date-section">
        <input
          data-testid="departure-date-input"
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
        />
        {tripType === 'roundTrip' && (
          <input
            data-testid="return-date-input"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        )}
      </div>

      {/* Passengers */}
      <div data-testid="passenger-section">
        <label>Passengers:</label>
        <input
          data-testid="passengers-input"
          type="number"
          min="0"
          max="9"
          value={passengers}
          onChange={(e) => setPassengers(parseInt(e.target.value) || 0)}
        />
      </div>

      {/* Search Button */}
      <button data-testid="search-btn" onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Error Message */}
      {error && <div data-testid="search-error">{error}</div>}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div data-testid="search-results">
          <h3>Available Flights</h3>
          {searchResults.map((flight, index) => (
            <div key={flight.flightId} data-testid={`flight-result-${index}`}>
              <div data-testid={`flight-number-${index}`}>{flight.flightNumber}</div>
              <div data-testid={`flight-route-${index}`}>{flight.from} → {flight.to}</div>
              <div data-testid={`flight-time-${index}`}>{flight.departureTime} - {flight.arrivalTime}</div>
              <div data-testid={`flight-price-${index}`}>₫{flight.price.toLocaleString()}</div>
              <div data-testid={`flight-seats-${index}`}>
                {flight.availableSeats === 0 ? 'Full' : `${flight.availableSeats} seats`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Flights */}
      {returnFlights.length > 0 && (
        <div data-testid="return-results">
          <h3>Return Flights</h3>
          {returnFlights.map((flight, index) => (
            <div key={flight.flightId} data-testid={`return-flight-${index}`}>
              <div data-testid={`return-number-${index}`}>{flight.flightNumber}</div>
              <div data-testid={`return-route-${index}`}>{flight.from} → {flight.to}</div>
              <div data-testid={`return-time-${index}`}>{flight.departureTime} - {flight.arrivalTime}</div>
              <div data-testid={`return-price-${index}`}>₫{flight.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('TC-TRV-SRC: Traveler Search Flight Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchFlights.mockResolvedValue({ flights: mockFlights });
    mockValidateSearchParams.mockResolvedValue({ valid: true });
  });

  /**
   * TC-TRV-SRC-001: Search Flight - One Way
   * Business Requirement: BR23
   * 
   * Test Data: SGN -> HAN
   * 
   * Expected Result:
   * Show available flights.
   */
  it('TC-TRV-SRC-001: should display available flights for one-way search', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightSearch />);

    // Assert - One Way is default
    expect(screen.getByTestId('one-way-radio')).toBeChecked();

    // Act - Select One Way. Search.
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Search API called
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalledWith({
        from: 'SGN',
        to: 'HAN',
        date: '2025-12-30',
        passengers: 1,
        tripType: 'oneWay'
      });
    });

    // Assert - Show available flights
    expect(await screen.findByTestId('search-results')).toBeInTheDocument();
    expect(screen.getByTestId('flight-result-0')).toBeInTheDocument();
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN123');
    expect(screen.getByTestId('flight-route-0')).toHaveTextContent('SGN → HAN');
    expect(screen.getByTestId('flight-time-0')).toHaveTextContent('10:00 - 12:00');
    expect(screen.getByTestId('flight-price-0')).toHaveTextContent('₫2,000,000');
    
    // Assert - Multiple flights shown
    expect(screen.getByTestId('flight-result-1')).toBeInTheDocument();
    expect(screen.getByTestId('flight-number-1')).toHaveTextContent('VN456');
  });

  /**
   * TC-TRV-SRC-002: Search Flight - Round Trip
   * Business Requirement: BR23
   * 
   * Test Data: SGN <-> HAN
   * 
   * Expected Result:
   * Show Dep and Return flights.
   */
  it('TC-TRV-SRC-002: should display departure and return flights for round-trip search', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock return flights
    mockSearchFlights
      .mockResolvedValueOnce({ flights: mockFlights })
      .mockResolvedValueOnce({ flights: mockReturnFlights });
    
    render(<FlightSearch />);

    // Act - Select Round Trip
    await user.click(screen.getByTestId('round-trip-radio'));

    // Assert - Round trip selected, return date field shown
    expect(screen.getByTestId('round-trip-radio')).toBeChecked();
    expect(screen.getByTestId('return-date-input')).toBeInTheDocument();

    // Act - Search SGN <-> HAN
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.type(screen.getByTestId('return-date-input'), '2026-01-05');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Search called for both outbound and return
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalledTimes(2);
    });

    // Assert - Outbound search
    expect(mockSearchFlights).toHaveBeenNthCalledWith(1, {
      from: 'SGN',
      to: 'HAN',
      date: '2025-12-30',
      passengers: 1,
      tripType: 'roundTrip'
    });

    // Assert - Return search
    expect(mockSearchFlights).toHaveBeenNthCalledWith(2, {
      from: 'HAN',
      to: 'SGN',
      date: '2026-01-05',
      passengers: 1,
      tripType: 'roundTrip'
    });

    // Assert - Show Dep and Return flights
    expect(await screen.findByTestId('search-results')).toBeInTheDocument();
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN123');
    
    expect(screen.getByTestId('return-results')).toBeInTheDocument();
    expect(screen.getByTestId('return-number-0')).toHaveTextContent('VN789');
    expect(screen.getByTestId('return-route-0')).toHaveTextContent('HAN → SGN');
  });

  /**
   * TC-TRV-SRC-003: Search Flight - Same Day
   * Note: Logic
   * 
   * Test Data: Date: Today
   * 
   * Expected Result:
   * Show flights later than current time.
   */
  it('TC-TRV-SRC-003: should show only flights later than current time when searching same day', async () => {
    // Arrange
    const user = userEvent.setup();
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Mock flights with different times
    const currentHour = today.getHours();
    const sameDayFlights = [
      {
        ...mockFlights[0],
        departureDate: todayString,
        departureTime: `${(currentHour - 1).toString().padStart(2, '0')}:00`, // Past flight
        flightNumber: 'VN100'
      },
      {
        ...mockFlights[1],
        departureDate: todayString,
        departureTime: `${(currentHour + 2).toString().padStart(2, '0')}:00`, // Future flight
        flightNumber: 'VN200'
      },
      {
        ...mockFlights[0],
        departureDate: todayString,
        departureTime: `${(currentHour + 3).toString().padStart(2, '0')}:00`, // Future flight
        flightNumber: 'VN300'
      }
    ];

    mockSearchFlights.mockResolvedValueOnce({ flights: sameDayFlights });
    
    render(<FlightSearch />);

    // Act - Dep = Today
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), todayString);
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Search results shown
    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    // Assert - Show flights later than current time (only VN200 and VN300)
    // Past flight (VN100) should be filtered out
    const flightResults = screen.queryAllByTestId(/^flight-result-\d+$/);
    expect(flightResults.length).toBe(2); // Only 2 future flights

    // Verify shown flights are in the future
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN200');
    expect(screen.getByTestId('flight-number-1')).toHaveTextContent('VN300');
  });

  /**
   * TC-TRV-SRC-004: Search Flight - Past Date
   * Note: Val
   * 
   * Test Data: Date: Past
   * 
   * Expected Result:
   * Error "Invalid Date" or Disable date picker.
   */
  it('TC-TRV-SRC-004: should display error when departure date is in the past', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightSearch />);

    // Act - Dep = Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), yesterdayString);
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Error "Invalid Date"
    expect(await screen.findByTestId('search-error')).toHaveTextContent('Invalid Date');

    // Assert - Search not performed
    expect(mockSearchFlights).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-SRC-005: Search Flight - Return < Depart
   * Note: Val
   * 
   * Test Data: Date logic
   * 
   * Expected Result:
   * Error "Return date must be after Depart".
   */
  it('TC-TRV-SRC-005: should display error when return date is before departure date', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightSearch />);

    // Act - Select Round Trip
    await user.click(screen.getByTestId('round-trip-radio'));

    // Act - Return date before Depart
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.type(screen.getByTestId('return-date-input'), '2025-12-25'); // Before departure
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Error "Return date must be after Depart"
    expect(await screen.findByTestId('search-error')).toHaveTextContent('Return date must be after Depart');

    // Assert - Search not performed
    expect(mockSearchFlights).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-SRC-006: Search Flight - 0 Passengers
   * Note: Val
   * 
   * Test Data: Pax: 0
   * 
   * Expected Result:
   * Error "At least 1 passenger".
   */
  it('TC-TRV-SRC-006: should display error when passenger count is zero', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightSearch />);

    // Act - Adults = 0
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.clear(screen.getByTestId('passengers-input'));
    await user.type(screen.getByTestId('passengers-input'), '0');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Error "At least 1 passenger"
    expect(await screen.findByTestId('search-error')).toHaveTextContent('At least 1 passenger');

    // Assert - Search not performed
    expect(mockSearchFlights).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-SRC-007: Search Flight - Max Passengers
   * Note: Bound
   * 
   * Test Data: Pax: 9
   * 
   * Expected Result:
   * Valid.
   */
  it('TC-TRV-SRC-007: should allow maximum 9 passengers', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightSearch />);

    // Act - Adults = 9
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.clear(screen.getByTestId('passengers-input'));
    await user.type(screen.getByTestId('passengers-input'), '9');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Valid - search performed
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalledWith({
        from: 'SGN',
        to: 'HAN',
        date: '2025-12-30',
        passengers: 9,
        tripType: 'oneWay'
      });
    });

    // Assert - Results shown
    expect(await screen.findByTestId('search-results')).toBeInTheDocument();

    // Assert - No error
    expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
  });

  /**
   * TC-TRV-SRC-008: Search Flight - No Results
   * Note: UI
   * 
   * Test Data: SGN -> NYC
   * 
   * Expected Result:
   * "No flights found".
   */
  it('TC-TRV-SRC-008: should display no flights message for route with no planes', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Route with no planes
    mockSearchFlights.mockResolvedValueOnce({ flights: [] });
    
    render(<FlightSearch />);

    // Act - Search route with no planes (SGN -> NYC)
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'NYC');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Search performed
    await waitFor(() => {
      expect(mockSearchFlights).toHaveBeenCalled();
    });

    // Assert - "No flights found"
    expect(await screen.findByTestId('search-error')).toHaveTextContent('No flights found');

    // Assert - No results section shown
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
  });

  /**
   * TC-TRV-SRC-009: Search Flight - Sold Out
   * Business Requirement: BR39
   * 
   * Test Data: Flight Full
   * 
   * Expected Result:
   * Flight shown as "Full" or hidden.
   */
  it('TC-TRV-SRC-009: should display sold-out flight as Full', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Search fully booked flight
    const soldOutFlights = [
      {
        ...mockFlights[0],
        availableSeats: 0 // Fully booked
      },
      {
        ...mockFlights[1],
        availableSeats: 5 // Still available
      }
    ];

    mockSearchFlights.mockResolvedValueOnce({ flights: soldOutFlights });
    
    render(<FlightSearch />);

    // Act - Search
    await user.type(screen.getByTestId('from-input'), 'SGN');
    await user.type(screen.getByTestId('to-input'), 'HAN');
    await user.type(screen.getByTestId('departure-date-input'), '2025-12-30');
    await user.click(screen.getByTestId('search-btn'));

    // Assert - Results shown
    await waitFor(() => {
      expect(screen.getByTestId('search-results')).toBeInTheDocument();
    });

    // Assert - Flight shown as "Full"
    expect(screen.getByTestId('flight-seats-0')).toHaveTextContent('Full');

    // Assert - Available flight shows seat count
    expect(screen.getByTestId('flight-seats-1')).toHaveTextContent('5 seats');
  });
});
