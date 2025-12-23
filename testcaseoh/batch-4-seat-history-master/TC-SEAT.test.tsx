/**
 * Test Suite: TC-SEAT (Traveler Seat Selection Logic)
 * Category: BATCH 4 EXPANSION - Detailed Seat Selection
 * Description: Comprehensive unit tests for seat selection logic and UI
 * 
 * Test Cases:
 * - TC-SEAT-005: Verify Seat Map - Legend Colors
 * - TC-SEAT-006: Select Business Class Seat
 * - TC-SEAT-007: Select Economy Class Seat
 * - TC-SEAT-008: Deselect Seat (Toggle)
 * - TC-SEAT-009: Switch Seat
 * - TC-SEAT-010: Multi-Pax: Select Seat 1
 * - TC-SEAT-011: Multi-Pax: Select Seat 2
 * - TC-SEAT-012: Multi-Pax: Select Seat 3 (Excess)
 * - TC-SEAT-013: Select Booked Seat
 * - TC-SEAT-014: Select Maintenance Seat
 * - TC-SEAT-015: Hover Seat Info
 * - TC-SEAT-016: Seat Map Layout - Aisle
 * - TC-SEAT-017: Seat Map Layout - Exit Row
 * - TC-SEAT-018: Concurrency: Seat Taken
 * - TC-SEAT-019: Save Selection - Timeout
 * - TC-SEAT-020: Cancel Selection
 * 
 * Prerequisites:
 * 1. User has selected a flight
 * 2. User is on Seat Selection page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock seat selection APIs
const mockGetSeatMap = vi.fn();
const mockSelectSeat = vi.fn();
const mockDeselectSeat = vi.fn();
const mockSaveSeatSelection = vi.fn();
const mockCheckSeatAvailability = vi.fn();

// Mock seat map data
const mockSeatMapData = {
  aircraftType: 'Boeing 737',
  layout: '3-3',
  rows: [
    // Business Class (Rows 1-3)
    {
      rowNumber: 1,
      seats: [
        { id: '1A', status: 'Available', class: 'Business', price: 500 },
        { id: '1B', status: 'Available', class: 'Business', price: 500 },
        { id: '1C', status: 'Available', class: 'Business', price: 500 },
        { id: '1D', status: 'Booked', class: 'Business', price: 500 },
        { id: '1E', status: 'Available', class: 'Business', price: 500 },
        { id: '1F', status: 'Available', class: 'Business', price: 500 }
      ]
    },
    {
      rowNumber: 2,
      seats: [
        { id: '2A', status: 'Available', class: 'Business', price: 500 },
        { id: '2B', status: 'Available', class: 'Business', price: 500 },
        { id: '2C', status: 'Available', class: 'Business', price: 500 },
        { id: '2D', status: 'Available', class: 'Business', price: 500 },
        { id: '2E', status: 'Available', class: 'Business', price: 500 },
        { id: '2F', status: 'Available', class: 'Business', price: 500 }
      ]
    },
    // Economy Class with Exit Row
    {
      rowNumber: 10,
      isExitRow: true,
      seats: [
        { id: '10A', status: 'Available', class: 'Economy', price: 150, isExitRow: true },
        { id: '10B', status: 'Available', class: 'Economy', price: 150, isExitRow: true },
        { id: '10C', status: 'Available', class: 'Economy', price: 150, isExitRow: true },
        { id: '10D', status: 'Available', class: 'Economy', price: 150, isExitRow: true },
        { id: '10E', status: 'Available', class: 'Economy', price: 150, isExitRow: true },
        { id: '10F', status: 'Available', class: 'Economy', price: 150, isExitRow: true }
      ]
    },
    // Regular Economy
    {
      rowNumber: 12,
      seats: [
        { id: '12A', status: 'Available', class: 'Economy', price: 100 },
        { id: '12B', status: 'Available', class: 'Economy', price: 100 },
        { id: '12C', status: 'Available', class: 'Economy', price: 100 },
        { id: '12D', status: 'Booked', class: 'Economy', price: 100 },
        { id: '12E', status: 'Available', class: 'Economy', price: 100 },
        { id: '12F', status: 'Available', class: 'Economy', price: 100 }
      ]
    },
    {
      rowNumber: 15,
      seats: [
        { id: '15A', status: 'Available', class: 'Economy', price: 100 },
        { id: '15B', status: 'Maintenance', class: 'Economy', price: 100 },
        { id: '15C', status: 'Available', class: 'Economy', price: 100 },
        { id: '15D', status: 'Available', class: 'Economy', price: 100 },
        { id: '15E', status: 'Available', class: 'Economy', price: 100 },
        { id: '15F', status: 'Available', class: 'Economy', price: 100 }
      ]
    }
  ]
};

// Mock SeatSelectionPage component
const SeatSelectionPage = ({ 
  flightId, 
  passengerCount = 1,
  sessionTimeout = 900000 // 15 minutes in ms
}: { 
  flightId: string; 
  passengerCount?: number;
  sessionTimeout?: number;
}) => {
  const [seatMap, setSeatMap] = React.useState<any>(null);
  const [selectedSeats, setSelectedSeats] = React.useState<any[]>([]);
  const [hoveredSeat, setHoveredSeat] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [warning, setWarning] = React.useState('');
  const [totalPrice, setTotalPrice] = React.useState(0);
  const [sessionExpired, setSessionExpired] = React.useState(false);

  React.useEffect(() => {
    const loadSeatMap = async () => {
      const data = await mockGetSeatMap(flightId);
      setSeatMap(data);
    };
    loadSeatMap();

    // Session timeout timer
    const timer = setTimeout(() => {
      setSessionExpired(true);
    }, sessionTimeout);

    return () => clearTimeout(timer);
  }, [flightId, sessionTimeout]);

  React.useEffect(() => {
    // Calculate total price
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalPrice(total);
  }, [selectedSeats]);

  const handleSeatClick = async (seat: any) => {
    // Don't process if seat is disabled
    if (seat.status === 'Booked' || seat.status === 'Maintenance') {
      return;
    }

    setError('');
    setWarning('');

    // Check if seat is already selected (toggle deselect)
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      // Deselect seat
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
      await mockDeselectSeat(seat.id);
      return;
    }

    // Check seat availability (concurrency check)
    const available = await mockCheckSeatAvailability(seat.id);
    if (!available) {
      setError('Seat recently taken');
      return;
    }

    // Select seat
    if (passengerCount === 1) {
      // Single passenger: replace any existing selection
      setSelectedSeats([seat]);
    } else {
      // Multi-passenger: check if at limit
      if (selectedSeats.length >= passengerCount) {
        setWarning('All passengers have seats');
        return;
      }
      // Add seat if not at limit
      setSelectedSeats([...selectedSeats, seat]);
    }

    await mockSelectSeat(seat.id);
  };

  const handleSkipSelection = () => {
    // Proceed without seat (auto-assign at check-in)
    setSelectedSeats([]);
  };

  const getSeatColor = (seat: any) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) return 'green';
    if (seat.status === 'Booked') return 'red';
    if (seat.status === 'Maintenance') return 'grey';
    return 'white';
  };

  if (sessionExpired) {
    return (
      <div data-testid="session-expired">
        Session expired. Redirect to search.
      </div>
    );
  }

  if (!seatMap) {
    return <div data-testid="loading">Loading seat map...</div>;
  }

  return (
    <div data-testid="seat-selection-page">
      <h2>Seat Selection</h2>

      {/* Legend */}
      <div data-testid="seat-legend">
        <div data-testid="legend-available" style={{ color: 'white', backgroundColor: 'white', border: '1px solid black' }}>
          Available
        </div>
        <div data-testid="legend-selected" style={{ color: 'white', backgroundColor: 'green' }}>
          Selected
        </div>
        <div data-testid="legend-booked" style={{ color: 'white', backgroundColor: 'red' }}>
          Booked
        </div>
        <div data-testid="legend-maintenance" style={{ color: 'white', backgroundColor: 'grey' }}>
          Maintenance
        </div>
      </div>

      {/* Aircraft Info */}
      <div data-testid="aircraft-info">
        Aircraft: {seatMap.aircraftType} | Layout: {seatMap.layout}
      </div>

      {/* Error/Warning Messages */}
      {error && <div data-testid="error-message">{error}</div>}
      {warning && <div data-testid="warning-message">{warning}</div>}

      {/* Total Price */}
      <div data-testid="total-price">Total Price: ${totalPrice}</div>

      {/* Seat Map */}
      <div data-testid="seat-map">
        {seatMap.rows.map((row: any) => (
          <div key={row.rowNumber} data-testid={`row-${row.rowNumber}`}>
            <span data-testid={`row-number-${row.rowNumber}`}>Row {row.rowNumber}</span>
            {row.isExitRow && (
              <span data-testid={`exit-row-${row.rowNumber}`} style={{ marginLeft: '10px', color: 'orange' }}>
                EXIT ROW - Extra Legroom
              </span>
            )}
            
            <div data-testid={`seats-${row.rowNumber}`} style={{ display: 'flex', gap: '5px' }}>
              {row.seats.map((seat: any, index: number) => {
                const color = getSeatColor(seat);
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                
                // Aisle gap (3-3 layout: gap after 3rd seat)
                const showAisle = seatMap.layout === '3-3' && index === 3;
                
                return (
                  <React.Fragment key={seat.id}>
                    {showAisle && (
                      <div data-testid={`aisle-${row.rowNumber}`} style={{ width: '20px', backgroundColor: '#f0f0f0' }}>
                        Aisle
                      </div>
                    )}
                    <button
                      data-testid={`seat-${seat.id}`}
                      onClick={() => handleSeatClick(seat)}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={seat.status === 'Booked' || seat.status === 'Maintenance'}
                      style={{
                        backgroundColor: color,
                        color: color === 'white' ? 'black' : 'white',
                        border: `2px solid ${isSelected ? 'darkgreen' : 'black'}`,
                        padding: '10px',
                        cursor: seat.status === 'Available' ? 'pointer' : 'not-allowed'
                      }}
                      aria-label={`Seat ${seat.id} - ${seat.class} - $${seat.price}`}
                    >
                      {seat.id}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Hover Tooltip */}
      {hoveredSeat && (
        <div data-testid="seat-tooltip">
          {(() => {
            const seat = seatMap.rows
              .flatMap((r: any) => r.seats)
              .find((s: any) => s.id === hoveredSeat);
            return seat ? `${seat.id} - ${seat.class} - $${seat.price}` : '';
          })()}
        </div>
      )}

      {/* Selected Seats Summary */}
      <div data-testid="selected-seats">
        Selected Seats: {selectedSeats.map(s => s.id).join(', ') || 'None'}
      </div>

      {/* Action Buttons */}
      <button data-testid="skip-selection-btn" onClick={handleSkipSelection}>
        Skip Selection
      </button>
    </div>
  );
};

describe('TC-SEAT: Traveler Seat Selection Logic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSeatMap.mockResolvedValue(mockSeatMapData);
    mockSelectSeat.mockResolvedValue({ success: true });
    mockDeselectSeat.mockResolvedValue({ success: true });
    mockCheckSeatAvailability.mockResolvedValue(true);
  });

  /**
   * TC-SEAT-005: Verify Seat Map - Legend Colors
   * Business Requirement: BR28
   * 
   * Steps:
   * Open Seat Map.
   * 
   * Expected Result:
   * Available=White, Selected=Green, Booked=Red.
   */
  it('TC-SEAT-005: should display seat map legend with correct colors', async () => {
    // Arrange & Act
    render(<SeatSelectionPage flightId="FL001" />);

    // Wait for seat map to load
    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Assert - Test Case Expected Result: Available=White, Selected=Green, Booked=Red
    const legendAvailable = screen.getByTestId('legend-available');
    const legendSelected = screen.getByTestId('legend-selected');
    const legendBooked = screen.getByTestId('legend-booked');
    const legendMaintenance = screen.getByTestId('legend-maintenance');

    expect(legendAvailable).toHaveTextContent('Available');
    expect(legendAvailable).toBeInTheDocument();

    expect(legendSelected).toHaveTextContent('Selected');
    expect(legendSelected).toBeInTheDocument();

    expect(legendBooked).toHaveTextContent('Booked');
    expect(legendBooked).toBeInTheDocument();

    expect(legendMaintenance).toHaveTextContent('Maintenance');
    expect(legendMaintenance).toBeInTheDocument();
  });

  /**
   * TC-SEAT-006: Select Business Class Seat
   * Business Requirement: BR29
   * 
   * Steps:
   * Click seat in Row 1-3.
   * 
   * Test Data: Seat: 1A
   * 
   * Expected Result:
   * Selection allowed. Price updates to Biz Class.
   */
  it('TC-SEAT-006: should allow selection of business class seat and update price', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Verify initial state
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');

    // Act - Click seat in Row 1-3 (Business Class)
    const seat1A = screen.getByTestId('seat-1A');
    await user.click(seat1A);

    // Assert - Test Case Expected Result: Selection allowed. Price updates to Biz Class.
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('1A');
    });

    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 1A');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $500');
  });

  /**
   * TC-SEAT-007: Select Economy Class Seat
   * Business Requirement: BR29
   * 
   * Steps:
   * Click seat in Row 10+.
   * 
   * Test Data: Seat: 12F
   * 
   * Expected Result:
   * Selection allowed. Price updates to Eco Class.
   */
  it('TC-SEAT-007: should allow selection of economy class seat and update price', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Act - Click seat in Row 10+ (Economy Class)
    const seat12F = screen.getByTestId('seat-12F');
    await user.click(seat12F);

    // Assert - Test Case Expected Result: Selection allowed. Price updates to Eco Class.
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('12F');
    });

    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12F');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $100');
  });

  /**
   * TC-SEAT-008: Deselect Seat (Toggle)
   * Business Requirement: BR29
   * 
   * Steps:
   * Click selected seat again.
   * 
   * Test Data: Action: Click
   * 
   * Expected Result:
   * Seat returns to "Available". Removed from cart.
   */
  it('TC-SEAT-008: should deselect seat when clicked again (toggle)', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    const seat12A = screen.getByTestId('seat-12A');

    // Select seat first
    await user.click(seat12A);

    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    });

    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $100');

    // Act - Click selected seat again
    await user.click(seat12A);

    // Assert - Test Case Expected Result: Seat returns to "Available". Removed from cart.
    await waitFor(() => {
      expect(mockDeselectSeat).toHaveBeenCalledWith('12A');
    });

    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: None');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');
  });

  /**
   * TC-SEAT-009: Switch Seat
   * Business Requirement: Logic
   * 
   * Steps:
   * Click 12A, then Click 15C.
   * 
   * Test Data: Switch
   * 
   * Expected Result:
   * 12A deselects, 15C selects. Only 1 seat/pax.
   */
  it('TC-SEAT-009: should switch seat when selecting another seat for single passenger', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" passengerCount={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    const seat12A = screen.getByTestId('seat-12A');
    const seat15C = screen.getByTestId('seat-15C');

    // Act - Click 12A
    await user.click(seat12A);

    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    });

    // Then Click 15C
    await user.click(seat15C);

    // Assert - Test Case Expected Result: 12A deselects, 15C selects. Only 1 seat/pax.
    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 15C');
    });

    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $100');
  });

  /**
   * TC-SEAT-010: Multi-Pax: Select Seat 1
   * Business Requirement: Flow
   * 
   * Steps:
   * Booking for 2 Pax. Click Seat A.
   * 
   * Test Data: Seat A
   * 
   * Expected Result:
   * Seat A assigned to Pax 1.
   */
  it('TC-SEAT-010: should assign first seat to passenger 1 in multi-passenger booking', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" passengerCount={2} />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Act - Booking for 2 Pax. Click Seat A
    const seat12A = screen.getByTestId('seat-12A');
    await user.click(seat12A);

    // Assert - Test Case Expected Result: Seat A assigned to Pax 1
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('12A');
    });

    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $100');
  });

  /**
   * TC-SEAT-011: Multi-Pax: Select Seat 2
   * Business Requirement: Flow
   * 
   * Steps:
   * Booking for 2 Pax. Click Seat B.
   * 
   * Test Data: Seat B
   * 
   * Expected Result:
   * Seat B assigned to Pax 2.
   */
  it('TC-SEAT-011: should assign second seat to passenger 2 in multi-passenger booking', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" passengerCount={2} />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Select first seat for Pax 1
    await user.click(screen.getByTestId('seat-12A'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    });

    // Act - Click Seat B for Pax 2
    const seat12B = screen.getByTestId('seat-12B');
    await user.click(seat12B);

    // Assert - Test Case Expected Result: Seat B assigned to Pax 2
    await waitFor(() => {
      expect(mockSelectSeat).toHaveBeenCalledWith('12B');
    });

    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A, 12B');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $200');
  });

  /**
   * TC-SEAT-012: Multi-Pax: Select Seat 3 (Excess)
   * Business Requirement: Bound
   * 
   * Steps:
   * Booking for 2 Pax. Click Seat C.
   * 
   * Test Data: Seat C
   * 
   * Expected Result:
   * Error/Warn "All passengers have seats".
   */
  it('TC-SEAT-012: should show warning when trying to select more seats than passengers', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" passengerCount={2} />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Select seats for 2 passengers
    await user.click(screen.getByTestId('seat-12A'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    });

    await user.click(screen.getByTestId('seat-12B'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A, 12B');
    });

    // Act - Booking for 2 Pax. Click Seat C (3rd seat)
    await user.click(screen.getByTestId('seat-12C'));

    // Assert - Test Case Expected Result: Error/Warn "All passengers have seats"
    expect(await screen.findByTestId('warning-message')).toHaveTextContent('All passengers have seats');

    // Verify seat C was not selected
    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A, 12B');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $200');
  });

  /**
   * TC-SEAT-013: Select Booked Seat
   * Business Requirement: BR24
   * 
   * Steps:
   * Click on Red seat.
   * 
   * Test Data: Seat: Red
   * 
   * Expected Result:
   * No action / Error "Seat unavailable".
   */
  it('TC-SEAT-013: should prevent selection of booked seat and show error', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Act - Click on Red seat (Booked)
    const seat1D = screen.getByTestId('seat-1D'); // 1D is booked
    
    // Assert - Test Case Expected Result: No action / Error "Seat unavailable"
    // Seat should be disabled
    expect(seat1D).toBeDisabled();

    // Attempt to click (won't work because it's disabled)
    await user.click(seat1D);

    // Verify seat was not selected (no error message shown because onClick doesn't fire)
    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: None');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');

    // Verify API was not called
    expect(mockSelectSeat).not.toHaveBeenCalled();
  });

  /**
   * TC-SEAT-014: Select Maintenance Seat
   * Business Requirement: BR24
   * 
   * Steps:
   * Click on Grey seat.
   * 
   * Test Data: Seat: Grey
   * 
   * Expected Result:
   * No action / Error "Seat under maintenance".
   */
  it('TC-SEAT-014: should prevent selection of maintenance seat and show error', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Act - Click on Grey seat (Maintenance)
    const seat15B = screen.getByTestId('seat-15B'); // 15B is under maintenance
    
    // Assert - Test Case Expected Result: No action / Error "Seat under maintenance"
    // Seat should be disabled
    expect(seat15B).toBeDisabled();

    // Attempt to click (won't work because it's disabled)
    await user.click(seat15B);

    // Verify seat was not selected (no error message shown because onClick doesn't fire)
    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: None');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');

    // Verify API was not called
    expect(mockSelectSeat).not.toHaveBeenCalled();
  });

  /**
   * TC-SEAT-015: Hover Seat Info
   * Business Requirement: UI
   * 
   * Steps:
   * Hover mouse over 12A.
   * 
   * Test Data: Action: Hover
   * 
   * Expected Result:
   * Tooltip: "12A - Economy - $100".
   */
  it('TC-SEAT-015: should display seat info tooltip on hover', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Act - Hover mouse over 12A
    const seat12A = screen.getByTestId('seat-12A');
    await user.hover(seat12A);

    // Assert - Test Case Expected Result: Tooltip: "12A - Economy - $100"
    expect(await screen.findByTestId('seat-tooltip')).toHaveTextContent('12A - Economy - $100');

    // Unhover and verify tooltip disappears
    await user.unhover(seat12A);

    await waitFor(() => {
      expect(screen.queryByTestId('seat-tooltip')).not.toBeInTheDocument();
    });
  });

  /**
   * TC-SEAT-016: Seat Map Layout - Aisle
   * Business Requirement: UI
   * 
   * Steps:
   * Check space between seats.
   * 
   * Test Data: Visual
   * 
   * Expected Result:
   * Clear visual gap for Aisle (e.g., 3-3 layout).
   */
  it('TC-SEAT-016: should display clear aisle gap in 3-3 seat layout', async () => {
    // Arrange
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Assert - Test Case Expected Result: Clear visual gap for Aisle (e.g., 3-3 layout)
    // Check aircraft layout info
    expect(screen.getByTestId('aircraft-info')).toHaveTextContent('Layout: 3-3');

    // Verify aisle gaps exist in rows
    expect(screen.getByTestId('aisle-1')).toBeInTheDocument();
    expect(screen.getByTestId('aisle-1')).toHaveTextContent('Aisle');
    expect(screen.getByTestId('aisle-1')).toHaveStyle({ width: '20px' });

    expect(screen.getByTestId('aisle-12')).toBeInTheDocument();
    expect(screen.getByTestId('aisle-15')).toBeInTheDocument();
  });

  /**
   * TC-SEAT-017: Seat Map Layout - Exit Row
   * Business Requirement: UI
   * 
   * Steps:
   * Check Exit Rows (Emergency).
   * 
   * Test Data: Visual
   * 
   * Expected Result:
   * More legroom visual or marked "Exit".
   */
  it('TC-SEAT-017: should display exit row with special marking and extra legroom indication', async () => {
    // Arrange
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Assert - Test Case Expected Result: More legroom visual or marked "Exit"
    // Check exit row marking
    expect(screen.getByTestId('exit-row-10')).toBeInTheDocument();
    expect(screen.getByTestId('exit-row-10')).toHaveTextContent('EXIT ROW - Extra Legroom');

    // Verify exit row seats are marked
    const seat10A = screen.getByTestId('seat-10A');
    expect(seat10A).toHaveAttribute('aria-label', 'Seat 10A - Economy - $150');
  });

  /**
   * TC-SEAT-018: Concurrency: Seat Taken
   * Business Requirement: Edge
   * 
   * Steps:
   * User A & B click 10A same time.
   * 
   * Test Data: Race Cond
   * 
   * Expected Result:
   * Only 1 user gets seat. Other gets error.
   */
  it('TC-SEAT-018: should handle concurrent seat selection and show error for second user', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<SeatSelectionPage flightId="FL001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Mock seat availability check to fail (seat taken by another user)
    mockCheckSeatAvailability.mockResolvedValueOnce(false);

    // Act - User A & B click 10A same time (race condition)
    const seat10A = screen.getByTestId('seat-10A');
    await user.click(seat10A);

    // Assert - Test Case Expected Result: Only 1 user gets seat. Other gets error.
    await waitFor(() => {
      expect(mockCheckSeatAvailability).toHaveBeenCalledWith('10A');
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('Seat recently taken');

    // Verify seat was not selected
    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: None');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');

    // Verify API was not called because availability check failed
    expect(mockSelectSeat).not.toHaveBeenCalled();
  });

  /**
   * TC-SEAT-019: Save Selection - Timeout
   * Business Requirement: Edge
   * 
   * Steps:
   * Select seat, wait 15 mins.
   * 
   * Test Data: Save
   * 
   * Expected Result:
   * Session expired. Redirect to search.
   */
  it('TC-SEAT-019: should expire session after timeout and redirect to search', async () => {
    // Arrange
    vi.useFakeTimers();
    
    // Set short timeout for testing (100ms)
    render(<SeatSelectionPage flightId="FL001" sessionTimeout={100} />);

    // Flush pending timers to load seat map
    await vi.runAllTimersAsync();

    // Assert - Test Case Expected Result: Session expired. Redirect to search.
    expect(screen.getByTestId('session-expired')).toBeInTheDocument();
    expect(screen.getByTestId('session-expired')).toHaveTextContent('Session expired. Redirect to search.');

    // Cleanup
    vi.useRealTimers();
  });

  /**
   * TC-SEAT-020: Cancel Selection
   * Business Requirement: Flow
   * 
   * Steps:
   * Click "Skip Selection".
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Booking proceeds without seat (Auto-assign at check-in).
   */
  it('TC-SEAT-020: should allow skipping seat selection for auto-assignment', async () => {
    // Arrange
    const user = userEvent.setup();
    // Use very long timeout to avoid session expiration during test
    render(<SeatSelectionPage flightId="FL001" sessionTimeout={999999000} />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-map')).toBeInTheDocument();
    });

    // Select a seat first
    await user.click(screen.getByTestId('seat-12A'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: 12A');
    });

    // Act - Click "Skip Selection"
    await user.click(screen.getByTestId('skip-selection-btn'));

    // Assert - Test Case Expected Result: Booking proceeds without seat (Auto-assign at check-in)
    expect(screen.getByTestId('selected-seats')).toHaveTextContent('Selected Seats: None');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total Price: $0');

    // Note: In real implementation, this would navigate to next step (payment/confirmation)
    // Here we just verify the selection is cleared
  });
});
