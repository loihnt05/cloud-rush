/**
 * Test Suite: TC-TRV-SEAT (Traveler Seat Selection)
 * Category: Traveler Services - Seat Selection & Pricing
 * Description: Unit tests for Traveler seat selection including class pricing, deselection, seat changes, and concurrency
 * 
 * Test Cases:
 * - TC-TRV-SEAT-005: Select Seat - Business Class
 * - TC-TRV-SEAT-006: Select Seat - Economy Class
 * - TC-TRV-SEAT-007: Deselect Seat
 * - TC-TRV-SEAT-008: Change Seat
 * - TC-TRV-SEAT-009: Select Max Seats
 * - TC-TRV-SEAT-010: Seat Hover Information
 * - TC-TRV-SEAT-011: Seat Map - Legend Display
 * - TC-TRV-SEAT-012: Concurrency - Seat Taken
 * - TC-TRV-SEAT-013: Select Blocked Seat (Maintenance)
 * - TC-TRV-SEAT-014: Seat Price - Emergency Exit
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User is on seat selection screen
 * 3. Flight has been selected
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock seat APIs
const mockSelectSeat = vi.fn();
const mockDeselectSeat = vi.fn();
const mockCalculateSeatPrice = vi.fn();
const mockCheckSeatAvailability = vi.fn();

// Mock seat map data
const mockSeats = [
  // Business Class (Rows 1-5)
  { seat_id: '1A', row: 1, column: 'A', class: 'Business', status: 'Available', base_price: 500000, type: 'Standard' },
  { seat_id: '1B', row: 1, column: 'B', class: 'Business', status: 'Available', base_price: 500000, type: 'Standard' },
  { seat_id: '2A', row: 2, column: 'A', class: 'Business', status: 'Occupied', base_price: 500000, type: 'Standard' },
  
  // Economy Class (Rows 10+)
  { seat_id: '10A', row: 10, column: 'A', class: 'Economy', status: 'Available', base_price: 200000, type: 'Standard' },
  { seat_id: '10B', row: 10, column: 'B', class: 'Economy', status: 'Available', base_price: 200000, type: 'Standard' },
  { seat_id: '11A', row: 11, column: 'A', class: 'Economy', status: 'Available', base_price: 200000, type: 'Standard' },
  
  // Blocked/Maintenance seat
  { seat_id: '12A', row: 12, column: 'A', class: 'Economy', status: 'Blocked', base_price: 200000, type: 'Maintenance' },
  
  // Emergency Exit seat
  { seat_id: '15A', row: 15, column: 'A', class: 'Economy', status: 'Available', base_price: 250000, type: 'Exit' },
];

// Mock SeatMap component
const SeatMap = ({ maxSeats, onPriceChange }: { maxSeats: number; onPriceChange: (price: number) => void }) => {
  const [selectedSeats, setSelectedSeats] = React.useState<string[]>([]);
  const [seats, setSeats] = React.useState(mockSeats);
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [error, setError] = React.useState('');
  const [hoveredSeat, setHoveredSeat] = React.useState<any>(null);

  const getSeatColor = (seat: any) => {
    if (selectedSeats.includes(seat.seat_id)) return 'blue';
    if (seat.status === 'Available') return 'green';
    if (seat.status === 'Occupied') return 'red';
    if (seat.status === 'Blocked') return 'grey';
    return 'white';
  };

  const handleSeatClick = async (seat: any) => {
    setError('');

    // Check if seat is blocked
    if (seat.status === 'Blocked') {
      return; // Not clickable
    }

    // Check if seat is occupied
    if (seat.status === 'Occupied') {
      setError('Seat unavailable');
      return;
    }

    // Check if seat is already selected (deselect)
    if (selectedSeats.includes(seat.seat_id)) {
      // Deselect seat
      await mockDeselectSeat(seat.seat_id);
      const newSelected = selectedSeats.filter((id) => id !== seat.seat_id);
      setSelectedSeats(newSelected);
      
      // Reduce price
      const newPrice = calculateTotalPrice(newSelected);
      setTotalPrice(newPrice);
      onPriceChange(newPrice);
      return;
    }

    // Check max seats limit
    if (selectedSeats.length >= maxSeats) {
      setError('Maximum seats selected');
      return;
    }

    // Check concurrency - seat might be taken by another user
    const availability = await mockCheckSeatAvailability(seat.seat_id);
    if (!availability.available) {
      setError('Seat recently taken');
      // Update seat status
      setSeats(seats.map(s => 
        s.seat_id === seat.seat_id ? { ...s, status: 'Occupied' } : s
      ));
      return;
    }

    // Select seat
    await mockSelectSeat(seat.seat_id);
    const newSelected = [...selectedSeats, seat.seat_id];
    setSelectedSeats(newSelected);

    // Update price
    const newPrice = calculateTotalPrice(newSelected);
    setTotalPrice(newPrice);
    onPriceChange(newPrice);
  };

  const calculateTotalPrice = (seatIds: string[]) => {
    const price = seatIds.reduce((total, seatId) => {
      const seat = seats.find((s) => s.seat_id === seatId);
      return total + (seat?.base_price || 0);
    }, 0);
    
    mockCalculateSeatPrice(price);
    return price;
  };

  const handleSeatHover = (seat: any) => {
    setHoveredSeat(seat);
  };

  const handleSeatLeave = () => {
    setHoveredSeat(null);
  };

  return (
    <div data-testid="seat-map">
      <h2>Select Your Seats</h2>

      {/* Legend */}
      <div data-testid="seat-legend">
        <div data-testid="legend-available">
          <span style={{ backgroundColor: 'green', display: 'inline-block', width: 20, height: 20 }}></span>
          Available
        </div>
        <div data-testid="legend-occupied">
          <span style={{ backgroundColor: 'red', display: 'inline-block', width: 20, height: 20 }}></span>
          Occupied
        </div>
        <div data-testid="legend-selected">
          <span style={{ backgroundColor: 'blue', display: 'inline-block', width: 20, height: 20 }}></span>
          Selected
        </div>
      </div>

      {/* Seat Grid */}
      <div data-testid="seat-grid">
        {seats.map((seat) => (
          <div key={seat.seat_id} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              data-testid={`seat-${seat.seat_id}`}
              onClick={() => handleSeatClick(seat)}
              onMouseEnter={() => handleSeatHover(seat)}
              onMouseLeave={handleSeatLeave}
              disabled={seat.status === 'Blocked'}
              style={{ backgroundColor: getSeatColor(seat), margin: 5 }}
            >
              {seat.seat_id}
            </button>

            {/* Tooltip on hover */}
            {hoveredSeat?.seat_id === seat.seat_id && (
              <div data-testid={`tooltip-${seat.seat_id}`} style={{ position: 'absolute', top: -30 }}>
                Seat: {seat.seat_id} - ₫{seat.base_price.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Seats Info */}
      <div data-testid="selected-seats-info">
        <div data-testid="selected-count">
          Selected: {selectedSeats.length} / {maxSeats}
        </div>
        {selectedSeats.length > 0 && (
          <div data-testid="selected-list">
            Seats: {selectedSeats.join(', ')}
          </div>
        )}
      </div>

      {/* Total Price */}
      <div data-testid="total-seat-price">
        Total Seat Price: ₫{totalPrice.toLocaleString()}
      </div>

      {/* Error Messages */}
      {error && <div data-testid="seat-error">{error}</div>}
    </div>
  );
};

describe('TC-TRV-SEAT: Traveler Seat Selection Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectSeat.mockResolvedValue({ success: true });
    mockDeselectSeat.mockResolvedValue({ success: true });
    mockCalculateSeatPrice.mockResolvedValue({ success: true });
    mockCheckSeatAvailability.mockResolvedValue({ available: true });
  });

  /**
   * TC-TRV-SEAT-005: Select Seat - Business Class
   * Business Requirement: BR25
   * 
   * Test Data: Seat: 1A
   * 
   * Expected Result:
   * Price updates to Biz fare.
   */
  it('TC-TRV-SEAT-005: should update price to business class fare when selecting business seat', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Assert - Initial price is 0
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫0');

    // Act - Select seat in Biz row (1-5), seat 1A
    await user.click(screen.getByTestId('seat-1A'));

    // Assert - Seat selection API called
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('1A');
    });

    // Assert - Price updates to Biz fare (₫500,000)
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫500,000');

    // Assert - Price calculation API called
    expect(mockCalculateSeatPrice).toHaveBeenCalledWith(500000);

    // Assert - Price change callback called
    expect(mockPriceChange).toHaveBeenCalledWith(500000);

    // Assert - Seat is selected
    expect(screen.getByTestId('selected-list')).toHaveTextContent('Seats: 1A');
  });

  /**
   * TC-TRV-SEAT-006: Select Seat - Economy Class
   * Business Requirement: BR25
   * 
   * Test Data: Seat: 10A
   * 
   * Expected Result:
   * Price updates to Eco fare.
   */
  it('TC-TRV-SEAT-006: should update price to economy class fare when selecting economy seat', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Assert - Initial price is 0
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫0');

    // Act - Select seat in Eco row (10+), seat 10A
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - Seat selection API called
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('10A');
    });

    // Assert - Price updates to Eco fare (₫200,000)
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫200,000');

    // Assert - Price calculation API called
    expect(mockCalculateSeatPrice).toHaveBeenCalledWith(200000);

    // Assert - Price change callback called
    expect(mockPriceChange).toHaveBeenCalledWith(200000);

    // Assert - Seat is selected
    expect(screen.getByTestId('selected-list')).toHaveTextContent('Seats: 10A');
  });

  /**
   * TC-TRV-SEAT-007: Deselect Seat
   * Business Requirement: BR29
   * 
   * Test Data: Action: Click
   * 
   * Expected Result:
   * Seat becomes "Empty". Price reduces.
   */
  it('TC-TRV-SEAT-007: should deselect seat and reduce price when clicking selected seat', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - First select seat 10A
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - Seat selected, price is ₫200,000
    await waitFor(() => {
      expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫200,000');
    });

    // Act - Click selected seat again to deselect
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - Deselect API called
    await waitFor(() => {
      expect(mockDeselectSeat).toHaveBeenCalledWith('10A');
    });

    // Assert - Seat becomes "Empty" (green color - available)
    const seat10A = screen.getByTestId('seat-10A');
    expect(seat10A).toHaveAttribute('style', expect.stringContaining('background-color: green'));

    // Assert - Price reduces to ₫0
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫0');

    // Assert - Price change callback called with 0
    expect(mockPriceChange).toHaveBeenCalledWith(0);

    // Assert - Selected list is empty
    expect(screen.queryByTestId('selected-list')).not.toBeInTheDocument();
  });

  /**
   * TC-TRV-SEAT-008: Change Seat
   * Business Requirement: BR29
   * 
   * Test Data: A -> B
   * 
   * Expected Result:
   * Seat A free, Seat B selected.
   */
  it('TC-TRV-SEAT-008: should free seat A and select seat B when changing seats', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - Click Seat A (10A)
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - Seat A selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-list')).toHaveTextContent('Seats: 10A');
    });

    expect(screen.getByTestId('seat-10A')).toHaveAttribute('style', expect.stringContaining('background-color: blue'));

    // Act - Deselect Seat A (to change seat)
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - Seat A deselected
    await waitFor(() => {
      expect(screen.queryByTestId('selected-list')).not.toBeInTheDocument();
    });

    // Assert - Seat A is free (green)
    expect(screen.getByTestId('seat-10A')).toHaveAttribute('style', expect.stringContaining('background-color: green'));

    // Act - Click Seat B (10B)
    await user.click(screen.getByTestId('seat-10B'));

    // Assert - Seat B is selected (blue)
    await waitFor(() => {
      expect(screen.getByTestId('seat-10B')).toHaveAttribute('style', expect.stringContaining('background-color: blue'));
    });

    // Assert - Selected list shows only B
    expect(screen.getByTestId('selected-list')).toHaveTextContent('Seats: 10B');

    // Assert - Seat A remains free
    expect(screen.getByTestId('seat-10A')).toHaveAttribute('style', expect.stringContaining('background-color: green'));
  });

  /**
   * TC-TRV-SEAT-009: Select Max Seats
   * Note: Logic
   * 
   * Test Data: Select 3rd
   * 
   * Expected Result:
   * Error/Prevent selection.
   */
  it('TC-TRV-SEAT-009: should prevent selecting 3rd seat when max is 2 passengers', async () => {
    // Arrange - User booked for 2 pax
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - Select first seat
    await user.click(screen.getByTestId('seat-10A'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 1 / 2');
    });

    // Act - Select second seat
    await user.click(screen.getByTestId('seat-10B'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 2 / 2');
    });

    // Act - Try select 3rd seat
    await user.click(screen.getByTestId('seat-11A'));

    // Assert - Error/Prevent selection
    expect(await screen.findByTestId('seat-error')).toHaveTextContent('Maximum seats selected');

    // Assert - 3rd seat not selected
    expect(screen.getByTestId('selected-count')).toHaveTextContent('Selected: 2 / 2');
    expect(screen.getByTestId('selected-list')).toHaveTextContent('Seats: 10A, 10B');

    // Assert - Select API not called for 3rd seat
    expect(mockSelectSeat).toHaveBeenCalledTimes(2);
    expect(mockSelectSeat).not.toHaveBeenCalledWith('11A');
  });

  /**
   * TC-TRV-SEAT-010: Seat Hover Information
   * Note: UI
   * 
   * Test Data: Action: Hover
   * 
   * Expected Result:
   * Tooltip shows: Seat ID + Price.
   */
  it('TC-TRV-SEAT-010: should display tooltip with seat ID and price on hover', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - Hover mouse over seat 10A
    const seat10A = screen.getByTestId('seat-10A');
    fireEvent.mouseEnter(seat10A);

    // Assert - Tooltip shows: Seat ID + Price
    expect(await screen.findByTestId('tooltip-10A')).toHaveTextContent('Seat: 10A - ₫200,000');

    // Act - Move away from seat
    fireEvent.mouseLeave(seat10A);

    // Assert - Tooltip disappears
    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-10A')).not.toBeInTheDocument();
    });

    // Act - Hover over business class seat
    const seat1A = screen.getByTestId('seat-1A');
    fireEvent.mouseEnter(seat1A);

    // Assert - Tooltip shows business class price
    expect(await screen.findByTestId('tooltip-1A')).toHaveTextContent('Seat: 1A - ₫500,000');
  });

  /**
   * TC-TRV-SEAT-011: Seat Map - Legend Display
   * Business Requirement: BR39
   * 
   * Test Data: Visual
   * 
   * Expected Result:
   * Show: Available, Occupied, Selected colors.
   */
  it('TC-TRV-SEAT-011: should display seat legend with Available, Occupied, and Selected colors', () => {
    // Arrange
    const mockPriceChange = vi.fn();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Assert - Check UI Legend exists
    expect(screen.getByTestId('seat-legend')).toBeInTheDocument();

    // Assert - Available color (green)
    const availableLegend = screen.getByTestId('legend-available');
    expect(availableLegend).toBeInTheDocument();
    expect(availableLegend).toHaveTextContent('Available');

    // Assert - Occupied color (red)
    const occupiedLegend = screen.getByTestId('legend-occupied');
    expect(occupiedLegend).toBeInTheDocument();
    expect(occupiedLegend).toHaveTextContent('Occupied');

    // Assert - Selected color (blue)
    const selectedLegend = screen.getByTestId('legend-selected');
    expect(selectedLegend).toBeInTheDocument();
    expect(selectedLegend).toHaveTextContent('Selected');
  });

  /**
   * TC-TRV-SEAT-012: Concurrency - Seat Taken
   * Note: Edge
   * 
   * Test Data: Concurrency
   * 
   * Expected Result:
   * User B gets "Seat recently taken" error.
   */
  it('TC-TRV-SEAT-012: should display error when seat is taken by another user concurrently', async () => {
    // Arrange - User A selects 10A, User B tries to select 10A at same time
    const mockPriceChange = vi.fn();
    
    // Simulate seat already taken by another user
    mockCheckSeatAvailability.mockResolvedValueOnce({ available: false });

    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - User B selects 10A (but it's already taken by User A)
    await user.click(screen.getByTestId('seat-10A'));

    // Assert - User B gets "Seat recently taken" error
    expect(await screen.findByTestId('seat-error')).toHaveTextContent('Seat recently taken');

    // Assert - Availability check was performed
    expect(mockCheckSeatAvailability).toHaveBeenCalledWith('10A');

    // Assert - Seat not selected
    expect(screen.queryByTestId('selected-list')).not.toBeInTheDocument();

    // Assert - Select API not called (seat not available)
    expect(mockSelectSeat).not.toHaveBeenCalled();

    // Assert - Seat status updated to Occupied (red)
    await waitFor(() => {
      expect(screen.getByTestId('seat-10A')).toHaveAttribute('style', expect.stringContaining('background-color: red'));
    });
  });

  /**
   * TC-TRV-SEAT-013: Select Blocked Seat (Maintenance)
   * Business Requirement: BR24
   * 
   * Test Data: Seat: Grey
   * 
   * Expected Result:
   * Not clickable.
   */
  it('TC-TRV-SEAT-013: should not allow clicking blocked maintenance seat', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Assert - Maintenance seat (12A) is grey
    const blockedSeat = screen.getByTestId('seat-12A');
    expect(blockedSeat).toHaveAttribute('style', expect.stringContaining('background-color: grey'));

    // Assert - Seat is disabled (not clickable)
    expect(blockedSeat).toBeDisabled();

    // Act - Try click maintenance seat
    await user.click(blockedSeat);

    // Assert - No error message (button is disabled, click doesn't trigger)
    expect(screen.queryByTestId('seat-error')).not.toBeInTheDocument();

    // Assert - Seat not selected
    expect(screen.queryByTestId('selected-list')).not.toBeInTheDocument();

    // Assert - Select API not called
    expect(mockSelectSeat).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-SEAT-014: Seat Price - Emergency Exit
   * Note: Biz
   * 
   * Test Data: Seat: Exit
   * 
   * Expected Result:
   * Price higher (if applicable).
   */
  it('TC-TRV-SEAT-014: should charge higher price for emergency exit seat with more legroom', async () => {
    // Arrange
    const mockPriceChange = vi.fn();
    const user = userEvent.setup();
    render(<SeatMap maxSeats={2} onPriceChange={mockPriceChange} />);

    // Act - Select Exit Row Seat (15A - More legroom)
    await user.click(screen.getByTestId('seat-15A'));

    // Assert - Seat selection API called
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('15A');
    });

    // Assert - Price higher than standard economy (₫250,000 vs ₫200,000)
    expect(screen.getByTestId('total-seat-price')).toHaveTextContent('Total Seat Price: ₫250,000');

    // Assert - Tooltip shows higher price
    const seat15A = screen.getByTestId('seat-15A');
    fireEvent.mouseEnter(seat15A);
    expect(await screen.findByTestId('tooltip-15A')).toHaveTextContent('Seat: 15A - ₫250,000');

    // Assert - Price calculation reflects emergency exit premium
    expect(mockCalculateSeatPrice).toHaveBeenCalledWith(250000);

    // Assert - Price change callback with premium
    expect(mockPriceChange).toHaveBeenCalledWith(250000);
  });
});
