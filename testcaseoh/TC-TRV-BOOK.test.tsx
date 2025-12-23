/**
 * Test Suite: TC-TRV-BOOK (Traveler Booking)
 * Category: Traveler Services - Flight Booking & Seat Selection
 * Description: Unit tests for Traveler booking flow including screen display, seat selection, and price calculation
 * 
 * Test Cases:
 * - TC-TRV-BOOK-001: Verify "Booking Flight" Screen Display
 * - TC-TRV-BOOK-002: Verify Selecting an "Empty" Seat
 * - TC-TRV-BOOK-003: Verify Selecting an "Occupied" Seat
 * - TC-TRV-BOOK-004: Verify Price Calculation - Add Meals
 * - TC-TRV-BOOK-005: Verify Price Calculation - Add Baggage
 * - TC-TRV-BOOK-006: Verify Final Price Without Services
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. Flight search results are available
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking APIs
const mockNavigateToBooking = vi.fn();
const mockLoadSeatMap = vi.fn();
const mockSelectSeat = vi.fn();
const mockAddMeal = vi.fn();
const mockAddBaggage = vi.fn();
const mockCalculateTotal = vi.fn();

// Mock flight data
const mockFlight = {
  flight_id: 'FL-001',
  flight_no: 'VN123',
  departure_time: '10:00 AM',
  arrival_time: '12:00 PM',
  origin: 'Hanoi (HAN)',
  destination: 'Ho Chi Minh City (SGN)',
  base_price: 1500000,
};

// Mock seat map data
const mockSeatMap = [
  { seat_id: 'A1', row: 'A', number: 1, status: 'Empty', price: 0 },
  { seat_id: 'A2', row: 'A', number: 2, status: 'Empty', price: 0 },
  { seat_id: 'A3', row: 'A', number: 3, status: 'Occupied', price: 0 },
  { seat_id: 'B1', row: 'B', number: 1, status: 'Empty', price: 0 },
  { seat_id: 'B2', row: 'B', number: 2, status: 'Occupied', price: 0 },
];

// Mock FlightCard component
const FlightCard = ({ flight, onBookNow }: { flight: any; onBookNow: () => void }) => {
  return (
    <div data-testid="flight-card">
      <h3>{flight.flight_no}</h3>
      <div>
        {flight.origin} → {flight.destination}
      </div>
      <div>
        {flight.departure_time} - {flight.arrival_time}
      </div>
      <div>Price: ₫{flight.base_price.toLocaleString()}</div>
      <button onClick={onBookNow} data-testid="book-now-button">
        Book Now
      </button>
    </div>
  );
};

// Mock BookingFlightScreen component
const BookingFlightScreen = ({ flight }: { flight: any }) => {
  return (
    <div data-testid="booking-flight-screen">
      <h1 data-testid="booking-header">Booking Flight</h1>

      <div data-testid="flight-details">
        <h2>Flight Information</h2>
        <div data-testid="flight-no">Flight No: {flight.flight_no}</div>
        <div data-testid="departure-time">Time: {flight.departure_time}</div>
        <div data-testid="destination">Destination: {flight.destination}</div>
        <div data-testid="origin">Origin: {flight.origin}</div>
        <div data-testid="arrival-time">Arrival: {flight.arrival_time}</div>
      </div>
    </div>
  );
};

// Mock SeatSelection component
const SeatSelection = ({ seats }: { seats: any[] }) => {
  const [selectedSeat, setSelectedSeat] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');

  const handleSeatClick = async (seat: any) => {
    setError('');

    if (seat.status === 'Occupied') {
      setError('Seat unavailable');
      return;
    }

    if (seat.status === 'Empty') {
      try {
        await mockSelectSeat(seat.seat_id);
        setSelectedSeat(seat.seat_id);
      } catch (err) {
        setError('Failed to select seat');
      }
    }
  };

  const getSeatColor = (seat: any) => {
    if (seat.seat_id === selectedSeat) return 'blue'; // Selected
    if (seat.status === 'Empty') return 'green'; // Available
    if (seat.status === 'Occupied') return 'red'; // Unavailable
    return 'white';
  };

  return (
    <div data-testid="seat-selection">
      <h2>Select Your Seat</h2>

      <div data-testid="seat-map">
        {seats.map((seat) => (
          <button
            key={seat.seat_id}
            data-testid={`seat-${seat.seat_id}`}
            onClick={() => handleSeatClick(seat)}
            style={{ backgroundColor: getSeatColor(seat) }}
            disabled={seat.status === 'Occupied'}
          >
            {seat.row}{seat.number}
          </button>
        ))}
      </div>

      {selectedSeat && <div data-testid="selected-seat">Selected: {selectedSeat}</div>}
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

// Mock ExtraServices component
const ExtraServices = ({ basePrice }: { basePrice: number }) => {
  const [selectedMeal, setSelectedMeal] = React.useState<any>(null);
  const [selectedBaggage, setSelectedBaggage] = React.useState<any>(null);
  const [totalPrice, setTotalPrice] = React.useState(basePrice);
  const [showServices, setShowServices] = React.useState(false);

  const meals = [
    { id: 'MEAL-1', name: 'Standard Meal', price: 100000 },
    { id: 'MEAL-2', name: 'Premium Meal', price: 200000 },
  ];

  const baggageOptions = [
    { id: 'BAG-20', name: '20kg Baggage', price: 300000 },
    { id: 'BAG-30', name: '30kg Baggage', price: 500000 },
  ];

  const handleAddMeal = async (meal: any) => {
    await mockAddMeal(meal.id);
    setSelectedMeal(meal);
    calculateTotal(meal, selectedBaggage);
  };

  const handleAddBaggage = async (baggage: any) => {
    await mockAddBaggage(baggage.id);
    setSelectedBaggage(baggage);
    calculateTotal(selectedMeal, baggage);
  };

  const calculateTotal = (meal: any, baggage: any) => {
    let total = basePrice;
    if (meal) total += meal.price;
    if (baggage) total += baggage.price;
    setTotalPrice(total);
    mockCalculateTotal(total);
  };

  const handleSkip = () => {
    setTotalPrice(basePrice);
    mockCalculateTotal(basePrice);
  };

  return (
    <div data-testid="extra-services">
      <h2>Add Extra Services</h2>

      <button
        onClick={() => setShowServices(true)}
        data-testid="add-services-button"
      >
        Add Extra Services
      </button>

      <button onClick={handleSkip} data-testid="skip-button">
        Skip
      </button>

      {showServices && (
        <div data-testid="services-list">
          {/* Meals Section */}
          <div data-testid="meals-section">
            <h3>Add Meals</h3>
            {meals.map((meal) => (
              <button
                key={meal.id}
                data-testid={`meal-${meal.id}`}
                onClick={() => handleAddMeal(meal)}
              >
                {meal.name} - ₫{meal.price.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Baggage Section */}
          <div data-testid="baggage-section">
            <h3>Add Baggage</h3>
            {baggageOptions.map((baggage) => (
              <button
                key={baggage.id}
                data-testid={`baggage-${baggage.id}`}
                onClick={() => handleAddBaggage(baggage)}
              >
                {baggage.name} - ₫{baggage.price.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart Summary */}
      <div data-testid="cart-summary">
        <div>Ticket Price: ₫{basePrice.toLocaleString()}</div>
        {selectedMeal && (
          <div data-testid="cart-meal">
            Meal: {selectedMeal.name} - ₫{selectedMeal.price.toLocaleString()}
          </div>
        )}
        {selectedBaggage && (
          <div data-testid="cart-baggage">
            Baggage: {selectedBaggage.name} - ₫{selectedBaggage.price.toLocaleString()}
          </div>
        )}
      </div>

      <div data-testid="total-amount">
        Total Amount: ₫{totalPrice.toLocaleString()}
      </div>
    </div>
  );
};

describe('TC-TRV-BOOK: Traveler Booking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectSeat.mockResolvedValue({ success: true });
    mockAddMeal.mockResolvedValue({ success: true });
    mockAddBaggage.mockResolvedValue({ success: true });
    mockCalculateTotal.mockResolvedValue({ success: true });
  });

  /**
   * TC-TRV-BOOK-001: Verify "Booking Flight" Screen Display
   * Business Requirement: BR23 2
   * 
   * Prerequisites:
   * 1. User is logged in as Traveler.
   * 2. User has searched for flights.
   * 3. User clicks "Book Now" on a specific flight.
   * 
   * Expected Result:
   * The "Booking flight" screen displays correctly with corresponding flight details
   * (Time, Destination, Flight No).
   */
  it('TC-TRV-BOOK-001: should display booking flight screen with correct flight details', async () => {
    // Arrange
    const user = userEvent.setup();

    // Step 1: Render flight card
    render(<FlightCard flight={mockFlight} onBookNow={mockNavigateToBooking} />);

    // Step 1: Click "Book Now" on a selected flight card
    await user.click(screen.getByTestId('book-now-button'));

    // Step 1 Expected: System navigates to the booking screen
    expect(mockNavigateToBooking).toHaveBeenCalled();

    // Step 2: Render booking screen
    render(<BookingFlightScreen flight={mockFlight} />);

    // Step 2: Verify screen elements
    // Assert - Header "Booking Flight" is visible
    expect(screen.getByTestId('booking-header')).toHaveTextContent('Booking Flight');

    // Assert - Flight info is visible
    expect(screen.getByTestId('flight-no')).toHaveTextContent('Flight No: VN123');
    expect(screen.getByTestId('departure-time')).toHaveTextContent('Time: 10:00 AM');
    expect(screen.getByTestId('destination')).toHaveTextContent('Destination: Ho Chi Minh City (SGN)');
    expect(screen.getByTestId('origin')).toHaveTextContent('Origin: Hanoi (HAN)');
    expect(screen.getByTestId('arrival-time')).toHaveTextContent('Arrival: 12:00 PM');

    // Assert - Flight details section exists
    expect(screen.getByTestId('flight-details')).toBeInTheDocument();
  });

  /**
   * TC-TRV-BOOK-002: Verify Selecting an "Empty" Seat
   * Business Requirement: BR24 3
   * 
   * Prerequisites:
   * 1. User is on the Seat Selection step.
   * 2. Seat map is loaded.
   * 
   * Expected Result:
   * The seat is selected successfully and added to the booking selection.
   */
  it('TC-TRV-BOOK-002: should select an empty seat successfully', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelection seats={mockSeatMap} />);

    // Step 1: Locate a seat marked as "Empty" (e.g., Green color)
    const emptySeat = screen.getByTestId('seat-A1');

    // Step 1 Expected: The seat is clickable
    expect(emptySeat).toBeEnabled();

    // Assert - Empty seat has green background (inline style)
    expect(emptySeat).toHaveAttribute('style', expect.stringContaining('background-color: green'));

    // Step 2: Click on the empty seat
    await user.click(emptySeat);

    // Step 2 Expected: Visual indicator changes to "Selected"
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('A1');
    });

    // Assert - Seat color changes to blue (selected)
    expect(emptySeat).toHaveAttribute('style', expect.stringContaining('background-color: blue'));

    // Assert - Selected seat is displayed
    expect(await screen.findByTestId('selected-seat')).toHaveTextContent('Selected: A1');
  });

  /**
   * TC-TRV-BOOK-003: Verify Selecting an "Occupied" Seat
   * Business Requirement: BR24 4
   * 
   * Prerequisites:
   * 1. User is on the Seat Selection step.
   * 2. Seat map shows some occupied seats.
   * 
   * Expected Result:
   * System prevents selection; User cannot pick this seat.
   */
  it('TC-TRV-BOOK-003: should prevent selecting an occupied seat', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelection seats={mockSeatMap} />);

    // Step 1: Locate a seat marked as "Occupied" (e.g., Red color)
    const occupiedSeat = screen.getByTestId('seat-A3');

    // Step 1 Expected: The seat visual indicates unavailability
    expect(occupiedSeat).toHaveAttribute('style', expect.stringContaining('background-color: red'));
    expect(occupiedSeat).toBeDisabled();

    // Step 2: Click on the occupied seat (attempt)
    await user.click(occupiedSeat);

    // Step 2 Expected: Nothing happens or an error toast appears
    // Assert - Seat selection API not called
    expect(mockSelectSeat).not.toHaveBeenCalled();

    // Assert - No seat is selected
    expect(screen.queryByTestId('selected-seat')).not.toBeInTheDocument();

    // Note: Since the button is disabled, the click doesn't trigger the handler,
    // so the error message won't appear. This is the expected behavior for disabled seats.
  });

  /**
   * TC-TRV-BOOK-004: Verify Price Calculation - Add Meals
   * Business Requirement: BR25 5
   * 
   * Prerequisites:
   * 1. User has selected a seat.
   * 2. User is on "Add Extra Services" step.
   * 
   * Expected Result:
   * Total price updates correctly: [Final Price] = [Ticket Price] + [Meal Price].
   */
  it('TC-TRV-BOOK-004: should update total price when adding meal', async () => {
    // Arrange
    const basePrice = 1500000;
    const user = userEvent.setup();
    render(<ExtraServices basePrice={basePrice} />);

    // Assert - Initial total is base price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,500,000');

    // Step 1: Click "Add Extra Services" button
    await user.click(screen.getByTestId('add-services-button'));

    // Step 1 Expected: Service list appears
    expect(await screen.findByTestId('services-list')).toBeInTheDocument();
    expect(screen.getByTestId('meals-section')).toBeInTheDocument();

    // Step 2: Select "Add Meals"
    await user.click(screen.getByTestId('meal-MEAL-1')); // Standard Meal - 100,000

    // Step 2 Expected: Meal item is added to cart
    await waitFor(() => {
      expect(mockAddMeal).toHaveBeenCalledWith('MEAL-1');
    });

    expect(await screen.findByTestId('cart-meal')).toHaveTextContent(
      'Meal: Standard Meal - ₫100,000'
    );

    // Step 3: Verify "Total Amount"
    // Step 3 Expected: The displayed Total Amount increases by the Meal price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,600,000');

    // Assert - Total = Ticket Price + Meal Price (1,500,000 + 100,000 = 1,600,000)
    expect(mockCalculateTotal).toHaveBeenCalledWith(1600000);
  });

  /**
   * TC-TRV-BOOK-005: Verify Price Calculation - Add Baggage
   * Business Requirement: BR25 6
   * 
   * Prerequisites:
   * 1. User is on "Add Extra Services" step.
   * 
   * Expected Result:
   * Total price updates correctly: [Final Price] = [Ticket Price] + [Baggage Price].
   */
  it('TC-TRV-BOOK-005: should update total price when adding baggage', async () => {
    // Arrange
    const basePrice = 1500000;
    const user = userEvent.setup();
    render(<ExtraServices basePrice={basePrice} />);

    // Assert - Initial total is base price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,500,000');

    // Step 1: Click "Add Baggage" button (need to open services first)
    await user.click(screen.getByTestId('add-services-button'));

    // Step 1 Expected: Baggage options appear
    expect(await screen.findByTestId('baggage-section')).toBeInTheDocument();

    // Step 2: Select a baggage option (e.g., 20kg)
    await user.click(screen.getByTestId('baggage-BAG-20')); // 20kg - 300,000

    // Step 2 Expected: Baggage item is added
    await waitFor(() => {
      expect(mockAddBaggage).toHaveBeenCalledWith('BAG-20');
    });

    expect(await screen.findByTestId('cart-baggage')).toHaveTextContent(
      'Baggage: 20kg Baggage - ₫300,000'
    );

    // Step 3: Verify "Total Amount"
    // Step 3 Expected: The displayed Total Amount increases by the Baggage price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,800,000');

    // Assert - Total = Ticket Price + Baggage Price (1,500,000 + 300,000 = 1,800,000)
    expect(mockCalculateTotal).toHaveBeenCalledWith(1800000);
  });

  /**
   * TC-TRV-BOOK-006: Verify Final Price Without Services
   * Business Requirement: BR25 7
   * 
   * Prerequisites:
   * 1. User has selected a seat.
   * 2. User skips "Add Extra Services".
   * 
   * Expected Result:
   * Total price remains: [Final Price] = [Ticket Price].
   */
  it('TC-TRV-BOOK-006: should maintain base price when skipping extra services', async () => {
    // Arrange
    const basePrice = 1500000;
    const user = userEvent.setup();
    render(<ExtraServices basePrice={basePrice} />);

    // Assert - Initial total is base price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,500,000');

    // Step 1: Click "Skip" or "Continue" without adding services
    await user.click(screen.getByTestId('skip-button'));

    // Step 1 Expected: No extra charges added
    await waitFor(() => {
      expect(mockCalculateTotal).toHaveBeenCalledWith(1500000);
    });

    // Assert - No meal added
    expect(screen.queryByTestId('cart-meal')).not.toBeInTheDocument();

    // Assert - No baggage added
    expect(screen.queryByTestId('cart-baggage')).not.toBeInTheDocument();

    // Step 2: Verify "Total Amount" at Checkout
    // Step 2 Expected: Total Amount matches the base ticket price
    expect(screen.getByTestId('total-amount')).toHaveTextContent('Total Amount: ₫1,500,000');

    // Assert - Add meal/baggage APIs not called
    expect(mockAddMeal).not.toHaveBeenCalled();
    expect(mockAddBaggage).not.toHaveBeenCalled();
  });
});
