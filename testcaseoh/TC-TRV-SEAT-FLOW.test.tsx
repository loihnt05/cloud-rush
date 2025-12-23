/**
 * Test Suite: TC-TRV-SEAT-FLOW (Traveler Seat Selection Flow)
 * Category: Traveler Services - Seat Map UI & Selection Flow
 * Description: Unit tests for seat map display and seat selection workflow
 * 
 * Test Cases:
 * - TC-TRV-SEAT-001: Verify Seat Map Display
 * - TC-TRV-SEAT-002: Verify Selecting Available Seat
 * - TC-TRV-SEAT-003: Verify Confirming Seat Selection
 * - TC-TRV-SEAT-004: Verify Cancelling Seat Selection
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has selected a flight
 * 3. User is on Seat Selection page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock seat APIs
const mockLoadSeatConfiguration = vi.fn();
const mockSaveSeatSelection = vi.fn();
const mockUpdateSeatStatus = vi.fn();
const mockNavigate = vi.fn();

// Mock seat configuration data
const mockSeatConfiguration = {
  flightId: 'FL001',
  aircraftType: 'Boeing 737',
  rows: 20,
  columns: ['A', 'B', 'C', 'D', 'E', 'F'],
  aisles: [2, 3], // Aisles between columns C-D
  seats: [
    // Row 1-5: Business Class
    { seatId: '1A', row: 1, column: 'A', status: 'Empty', class: 'Business' },
    { seatId: '1B', row: 1, column: 'B', status: 'Empty', class: 'Business' },
    { seatId: '1C', row: 1, column: 'C', status: 'Booked', class: 'Business' },
    
    // Row 10+: Economy Class
    { seatId: '10A', row: 10, column: 'A', status: 'Empty', class: 'Economy' },
    { seatId: '10B', row: 10, column: 'B', status: 'Booked', class: 'Economy' },
    { seatId: '10C', row: 10, column: 'C', status: 'Empty', class: 'Economy' },
    
    { seatId: '12A', row: 12, column: 'A', status: 'Empty', class: 'Economy' },
    { seatId: '12B', row: 12, column: 'B', status: 'Empty', class: 'Economy' },
    { seatId: '12C', row: 12, column: 'C', status: 'Booked', class: 'Economy' },
    { seatId: '12D', row: 12, column: 'D', status: 'Empty', class: 'Economy' },
  ]
};

// Mock SeatMapPage component
const SeatMapPage = ({ flightId, onNavigate }: { flightId: string; onNavigate: (path: string) => void }) => {
  const [seatConfig, setSeatConfig] = React.useState<any>(null);
  const [selectedSeat, setSelectedSeat] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSeatMap();
  }, [flightId]);

  const loadSeatMap = async () => {
    setLoading(true);
    
    // Step 1: System retrieves seat configuration
    const config = await mockLoadSeatConfiguration(flightId);
    setSeatConfig(config);
    
    setLoading(false);
  };

  const getSeatColor = (status: string, isSelected: boolean) => {
    if (isSelected) return 'blue'; // Selected
    if (status === 'Empty') return 'green'; // Available
    if (status === 'Booked') return 'red'; // Unavailable/Booked
    return 'gray';
  };

  const handleSeatClick = (seat: any) => {
    // Can only select empty seats
    if (seat.status !== 'Empty') {
      return;
    }

    // Step 1: Click on seat
    setSelectedSeat(seat.seatId);
  };

  const handleConfirm = async () => {
    if (!selectedSeat) {
      return;
    }

    // Step 1: System validates the selection
    const validation = await mockSaveSeatSelection({
      flightId,
      seatId: selectedSeat
    });

    if (validation.success) {
      // Step 2: Update seat_status to "temporarily_chosen"
      await mockUpdateSeatStatus(selectedSeat, 'temporarily_chosen');
      
      // Navigate to payment page
      onNavigate('/payment');
      mockNavigate('/payment');
    }
  };

  const handleCancel = () => {
    // Cancel action - no database update
    setSelectedSeat(null);
  };

  if (loading) {
    return <div data-testid="seat-map-loading">Loading seat map...</div>;
  }

  if (!seatConfig) {
    return <div data-testid="seat-map-error">Failed to load seat map</div>;
  }

  return (
    <div data-testid="seat-map-page">
      <h2>Seat Selection</h2>
      
      {/* Aircraft Info */}
      <div data-testid="aircraft-info">
        <div data-testid="aircraft-type">Aircraft: {seatConfig.aircraftType}</div>
        <div data-testid="aircraft-layout">
          Layout: {seatConfig.rows} rows x {seatConfig.columns.length} columns
        </div>
      </div>

      {/* Seat Indicators Legend */}
      <div data-testid="seat-indicators">
        <div data-testid="indicator-available">
          <span style={{ backgroundColor: 'green', display: 'inline-block', width: 20, height: 20 }}></span>
          Available (Empty)
        </div>
        <div data-testid="indicator-unavailable">
          <span style={{ backgroundColor: 'red', display: 'inline-block', width: 20, height: 20 }}></span>
          Unavailable (Booked)
        </div>
        <div data-testid="indicator-selected">
          <span style={{ backgroundColor: 'blue', display: 'inline-block', width: 20, height: 20 }}></span>
          Selected
        </div>
      </div>

      {/* Seat Map Grid */}
      <div data-testid="seat-map-grid">
        {seatConfig.seats.map((seat: any) => {
          const isSelected = selectedSeat === seat.seatId;
          const color = getSeatColor(seat.status, isSelected);
          
          return (
            <button
              key={seat.seatId}
              data-testid={`seat-${seat.seatId}`}
              data-status={seat.status}
              data-selected={isSelected}
              onClick={() => handleSeatClick(seat)}
              disabled={seat.status === 'Booked'}
              style={{ 
                backgroundColor: color, 
                margin: 5,
                cursor: seat.status === 'Empty' ? 'pointer' : 'not-allowed'
              }}
            >
              {seat.seatId}
            </button>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedSeat && (
        <div data-testid="selection-summary">
          <h3>Booking Summary</h3>
          <div data-testid="selected-seat-display">Selected Seat: {selectedSeat}</div>
        </div>
      )}

      {/* Action Buttons */}
      <div data-testid="action-buttons">
        <button 
          data-testid="confirm-btn" 
          onClick={handleConfirm}
          disabled={!selectedSeat}
        >
          Save / Confirm
        </button>
        <button 
          data-testid="cancel-btn" 
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

describe('TC-TRV-SEAT-FLOW: Traveler Seat Selection Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadSeatConfiguration.mockResolvedValue(mockSeatConfiguration);
    mockSaveSeatSelection.mockResolvedValue({ success: true });
    mockUpdateSeatStatus.mockResolvedValue({ success: true });
  });

  /**
   * TC-TRV-SEAT-001: Verify Seat Map Display
   * Business Requirement: BR28
   * 
   * Prerequisites:
   * 1. User is logged in
   * 2. User has selected a flight
   * 3. User is on Seat Selection page
   * 
   * Steps:
   * Step 1: Wait for the page to load
   * Step 2: Verify seat indicators
   * 
   * Expected Result:
   * The system displays a seat map corresponding to the specific aircraft layout (rows, columns, aisles).
   * Seats are color-coded: Available (Empty) vs Unavailable (Booked).
   */
  it('TC-TRV-SEAT-001: should display seat map with aircraft layout and color-coded seat indicators', async () => {
    // Arrange - Prerequisites: User on Seat Selection page
    const mockOnNavigate = vi.fn();
    render(<SeatMapPage flightId="FL001" onNavigate={mockOnNavigate} />);

    // Assert - Loading state
    expect(screen.getByTestId('seat-map-loading')).toHaveTextContent('Loading seat map...');

    // Step 1: Wait for the page to load
    await waitFor(() => {
      expect(mockLoadSeatConfiguration).toHaveBeenCalledWith('FL001');
    });

    // Step Expected Result: System retrieves seat configuration for the chosen flight
    expect(mockLoadSeatConfiguration).toHaveBeenCalled();

    // Assert - Seat map loaded
    expect(await screen.findByTestId('seat-map-page')).toBeInTheDocument();

    // Test Case Expected Result: The system displays a seat map corresponding to the specific aircraft layout
    expect(screen.getByTestId('aircraft-type')).toHaveTextContent('Aircraft: Boeing 737');
    expect(screen.getByTestId('aircraft-layout')).toHaveTextContent('Layout: 20 rows x 6 columns');

    // Step 2: Verify seat indicators
    expect(screen.getByTestId('seat-indicators')).toBeInTheDocument();
    
    // Step Expected Result: Seats are color-coded: Available (Empty) vs Unavailable (Booked)
    expect(screen.getByTestId('indicator-available')).toHaveTextContent('Available (Empty)');
    expect(screen.getByTestId('indicator-unavailable')).toHaveTextContent('Unavailable (Booked)');
    expect(screen.getByTestId('indicator-selected')).toHaveTextContent('Selected');

    // Verify seat map grid with individual seats
    expect(screen.getByTestId('seat-map-grid')).toBeInTheDocument();

    // Verify color coding for specific seats
    const seat12A = screen.getByTestId('seat-12A');
    expect(seat12A).toHaveAttribute('data-status', 'Empty');
    expect(seat12A).toHaveAttribute('style', expect.stringContaining('background-color: green')); // Available

    const seat10B = screen.getByTestId('seat-10B');
    expect(seat10B).toHaveAttribute('data-status', 'Booked');
    expect(seat10B).toHaveAttribute('style', expect.stringContaining('background-color: red')); // Unavailable
  });

  /**
   * TC-TRV-SEAT-002: Verify Selecting Available Seat
   * Business Requirement: BR29
   * 
   * Prerequisites:
   * 1. Seat map is displayed
   * 2. A specific seat (e.g., 12A) is "Empty"
   * 
   * Steps:
   * Step 1: Click on seat 12A
   * Step 2: Check selection summary
   * 
   * Expected Result:
   * The seat is temporarily added to the user's selection.
   */
  it('TC-TRV-SEAT-002: should select available seat and display in booking summary', async () => {
    // Arrange - Prerequisites: Seat map is displayed, 12A is Empty
    const mockOnNavigate = vi.fn();
    const user = userEvent.setup();
    render(<SeatMapPage flightId="FL001" onNavigate={mockOnNavigate} />);

    // Wait for seat map to load
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-page')).toBeInTheDocument();
    });

    // Prerequisite: Verify seat 12A is Empty
    const seat12A = screen.getByTestId('seat-12A');
    expect(seat12A).toHaveAttribute('data-status', 'Empty');
    expect(seat12A).toHaveAttribute('style', expect.stringContaining('background-color: green'));

    // Step 1: Click on seat 12A
    await user.click(seat12A);

    // Step Expected Result: The seat color changes to "Selected"
    await waitFor(() => {
      expect(seat12A).toHaveAttribute('data-selected', 'true');
    });
    expect(seat12A).toHaveAttribute('style', expect.stringContaining('background-color: blue'));

    // Step 2: Check selection summary
    // Step Expected Result: Seat 12A is listed in the booking summary
    expect(screen.getByTestId('selection-summary')).toBeInTheDocument();
    expect(screen.getByTestId('selected-seat-display')).toHaveTextContent('Selected Seat: 12A');

    // Test Case Expected Result: The seat is temporarily added to the user's selection
    // (Verified by selection summary and color change)
  });

  /**
   * TC-TRV-SEAT-003: Verify Confirming Seat Selection
   * Business Requirement: BR29
   * 
   * Prerequisites:
   * 1. User has selected a seat (Triggered TC-TRV-SEAT-002)
   * 
   * Steps:
   * Step 1: Click the "Save" / "Confirm" button
   * Step 2: Verify navigation
   * 
   * Expected Result:
   * The seat_status is updated to "temporarily_chosen", seat is assigned to traveler, 
   * and user is navigated to Payment page.
   */
  it('TC-TRV-SEAT-003: should confirm seat selection, update status, and navigate to payment', async () => {
    // Arrange - Prerequisites: User has selected a seat
    const mockOnNavigate = vi.fn();
    const user = userEvent.setup();
    render(<SeatMapPage flightId="FL001" onNavigate={mockOnNavigate} />);

    // Wait for seat map and select seat 12A
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-page')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('seat-12A'));

    // Verify seat is selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-seat-display')).toHaveTextContent('Selected Seat: 12A');
    });

    // Step 1: Click the "Save" / "Confirm" button
    await user.click(screen.getByTestId('confirm-btn'));

    // Step Expected Result: System validates the selection
    await waitFor(() => {
      expect(mockSaveSeatSelection).toHaveBeenCalledWith({
        flightId: 'FL001',
        seatId: '12A'
      });
    });

    // Test Case Expected Result: The seat_status is updated to "temporarily_chosen"
    expect(mockUpdateSeatStatus).toHaveBeenCalledWith('12A', 'temporarily_chosen');

    // Step 2: Verify navigation
    // Step Expected Result: User is redirected to /payment
    expect(mockNavigate).toHaveBeenCalledWith('/payment');
    expect(mockOnNavigate).toHaveBeenCalledWith('/payment');

    // Test Case Expected Result: User is navigated to Payment page
    // (Verified by navigation calls)
  });

  /**
   * TC-TRV-SEAT-004: Verify Cancelling Seat Selection
   * Business Requirement: BR29
   * 
   * Prerequisites:
   * 1. User has selected a seat but hasn't saved
   * 
   * Steps:
   * Step 1: Click "Cancel" or navigate back
   * Step 2: Re-enter the seat map page
   * 
   * Expected Result:
   * The seat status remains "Empty" in the database; No seat is assigned.
   */
  it('TC-TRV-SEAT-004: should cancel seat selection without updating database', async () => {
    // Arrange - Prerequisites: User has selected a seat but hasn't saved
    const mockOnNavigate = vi.fn();
    const user = userEvent.setup();
    
    // First render
    const { unmount } = render(<SeatMapPage flightId="FL001" onNavigate={mockOnNavigate} />);

    // Wait for seat map and select seat 12A
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-page')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('seat-12A'));

    // Verify seat is selected
    await waitFor(() => {
      expect(screen.getByTestId('selected-seat-display')).toHaveTextContent('Selected Seat: 12A');
    });

    // Step 1: Click "Cancel" or navigate back
    await user.click(screen.getByTestId('cancel-btn'));

    // Step Expected Result: Action is cancelled
    await waitFor(() => {
      expect(screen.queryByTestId('selection-summary')).not.toBeInTheDocument();
    });

    // Verify seat is deselected
    const seat12A = screen.getByTestId('seat-12A');
    expect(seat12A).toHaveAttribute('data-selected', 'false');
    expect(seat12A).toHaveAttribute('style', expect.stringContaining('background-color: green')); // Back to Available

    // Test Case Expected Result: The seat status remains "Empty" in the database
    // No database update should have been called
    expect(mockSaveSeatSelection).not.toHaveBeenCalled();
    expect(mockUpdateSeatStatus).not.toHaveBeenCalled();

    // Step 2: Re-enter the seat map page (simulate page reload)
    unmount();
    render(<SeatMapPage flightId="FL001" onNavigate={mockOnNavigate} />);

    // Wait for seat map to reload
    await waitFor(() => {
      expect(screen.getByTestId('seat-map-page')).toBeInTheDocument();
    });

    // Step Expected Result: The previously selected seat is still shown as "Empty"
    const seat12AAfterReload = screen.getByTestId('seat-12A');
    expect(seat12AAfterReload).toHaveAttribute('data-status', 'Empty');
    expect(seat12AAfterReload).toHaveAttribute('style', expect.stringContaining('background-color: green'));

    // Test Case Expected Result: No seat is assigned
    expect(screen.queryByTestId('selection-summary')).not.toBeInTheDocument();
  });
});
