/**
 * Test Suite: UI & Edge Cases (Giao diện & Lỗi biên)
 * Sub-Category: Flight Management - UI Formatting and Edge Case Handling
 * 
 * Test Cases:
 * - TC-FLT-UI-001: Date Picker - Format DD/MM/YYYY
 * - TC-FLT-UI-002: Time Picker - Format 24h HH:MM
 * - TC-FLT-UI-003: Responsive Table - Flight list adapts on resize
 * - TC-FLT-UI-004: Currency Display - Correct symbols ($, VND)
 * - TC-FLT-UI-005: Status Colors - Scheduled=Blue, Delayed=Orange, Canceled=Red
 * - TC-FLT-UI-006: Long Destination Name - Text wraps/truncates without overflow
 * - TC-FLT-UI-007: Network Fail - Create - Error handling with data preservation
 * - TC-FLT-UI-008: Double Submit - Prevent duplicate flight creation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockCreateFlight = vi.fn();
const mockGetFlightList = vi.fn();
const mockFormatDate = vi.fn();
const mockFormatTime = vi.fn();

// ==================== MOCK DATA ====================

const mockFlights = [
  {
    id: 'FL001',
    flightNumber: 'VN123',
    origin: 'Hanoi',
    destination: 'Ho Chi Minh City',
    departureDate: '2025-12-25',
    departureTime: '14:30',
    price: 1500000,
    currency: 'VND',
    status: 'Scheduled'
  },
  {
    id: 'FL002',
    flightNumber: 'VN456',
    origin: 'Da Nang',
    destination: 'Singapore',
    departureDate: '2025-12-26',
    departureTime: '09:15',
    price: 150,
    currency: 'USD',
    status: 'Delayed'
  },
  {
    id: 'FL003',
    flightNumber: 'VN789',
    origin: 'Hanoi',
    destination: 'Tokyo',
    departureDate: '2025-12-27',
    departureTime: '23:45',
    price: 300,
    currency: 'USD',
    status: 'Canceled'
  }
];

const mockLongDestinationFlight = {
  id: 'FL004',
  flightNumber: 'VN999',
  origin: 'Hanoi',
  destination: 'Ho Chi Minh City International Airport Terminal 2',
  departureDate: '2025-12-28',
  departureTime: '18:00',
  price: 2000000,
  currency: 'VND',
  status: 'Scheduled'
};

// ==================== MOCK COMPONENTS ====================

/**
 * Date Picker Component with DD/MM/YYYY format
 */
const DatePickerInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  // Format date to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert DD/MM/YYYY back to YYYY-MM-DD for storage
  const parseDisplayDate = (displayDate: string) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  };

  const [displayValue, setDisplayValue] = useState(formatDateForDisplay(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;
    setDisplayValue(newDisplayValue);
    
    // Update parent only if valid format
    if (newDisplayValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      onChange(parseDisplayDate(newDisplayValue));
    }
  };

  return (
    <div>
      <label htmlFor="date-picker">{label}</label>
      <input
        id="date-picker"
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder="DD/MM/YYYY"
        data-testid="date-picker-input"
        data-format="DD/MM/YYYY"
      />
      <span data-testid="date-format-hint">Format: DD/MM/YYYY</span>
    </div>
  );
};

/**
 * Time Picker Component with 24h HH:MM format
 */
const TimePickerInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  return (
    <div>
      <label htmlFor="time-picker">{label}</label>
      <input
        id="time-picker"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="HH:MM"
        data-testid="time-picker-input"
        data-format="24h"
        pattern="[0-2][0-9]:[0-5][0-9]"
      />
      <span data-testid="time-format-hint">24-hour format (HH:MM)</span>
    </div>
  );
};

/**
 * Responsive Flight Table
 */
const FlightTable: React.FC<{ flights: any[] }> = ({ flights }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth < 768;

  return (
    <div data-testid="flight-table-container" data-window-width={windowWidth}>
      <div
        style={{
          overflowX: isSmallScreen ? 'auto' : 'visible',
          maxWidth: '100%'
        }}
        data-testid="table-scroll-container"
      >
        <table
          data-testid="flight-table"
          style={{
            minWidth: isSmallScreen ? '800px' : 'auto',
            width: '100%'
          }}
        >
          <thead>
            <tr>
              <th>Flight Number</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.id} data-testid={`flight-row-${flight.id}`}>
                <td>{flight.flightNumber}</td>
                <td>{flight.origin}</td>
                <td>{flight.destination}</td>
                <td>{flight.departureDate}</td>
                <td>{flight.departureTime}</td>
                <td>{flight.price} {flight.currency}</td>
                <td>{flight.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Currency Display Component
 */
const CurrencyDisplay: React.FC<{ amount: number; currency: string }> = ({ amount, currency }) => {
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'VND': '₫'
    };

    const symbol = symbols[currency] || currency;

    if (currency === 'USD') {
      return `${symbol}${amount.toFixed(2)}`;
    } else if (currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')}${symbol}`;
    }

    return `${amount} ${currency}`;
  };

  return (
    <span data-testid="currency-display" data-currency={currency}>
      {formatCurrency(amount, currency)}
    </span>
  );
};

/**
 * Status Badge Component with color coding
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'blue';
      case 'Delayed':
        return 'orange';
      case 'Canceled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <span
      data-testid="status-badge"
      data-status={status}
      style={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px'
      }}
    >
      {status}
    </span>
  );
};

/**
 * Destination Display with overflow handling
 */
const DestinationDisplay: React.FC<{ destination: string; maxLength?: number }> = ({ 
  destination, 
  maxLength = 30 
}) => {
  const shouldTruncate = destination.length > maxLength;

  return (
    <div
      data-testid="destination-display"
      style={{
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
      title={shouldTruncate ? destination : undefined}
    >
      {destination}
    </div>
  );
};

/**
 * Flight Create Form with network error handling
 */
const FlightCreateForm: React.FC = () => {
  const [formData, setFormData] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    price: '',
    currency: 'VND'
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFormData, setLastFormData] = useState<any>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return; // Prevent double submit
    }

    setIsSubmitting(true);
    setLastFormData({ ...formData }); // Save form data

    try {
      await mockCreateFlight(formData);
      setFormData({
        flightNumber: '',
        origin: '',
        destination: '',
        departureDate: '',
        departureTime: '',
        price: '',
        currency: 'VND'
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Network Error');
      // Form data is preserved in state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="flight-create-form">
      {error && (
        <div data-testid="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      <input
        data-testid="flight-number-input"
        value={formData.flightNumber}
        onChange={(e) => handleChange('flightNumber', e.target.value)}
        placeholder="Flight Number"
      />

      <input
        data-testid="origin-input"
        value={formData.origin}
        onChange={(e) => handleChange('origin', e.target.value)}
        placeholder="Origin"
      />

      <input
        data-testid="destination-input"
        value={formData.destination}
        onChange={(e) => handleChange('destination', e.target.value)}
        placeholder="Destination"
      />

      <input
        data-testid="price-input"
        value={formData.price}
        onChange={(e) => handleChange('price', e.target.value)}
        placeholder="Price"
      />

      <button
        data-testid="submit-button"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Flight'}
      </button>

      {lastFormData && (
        <div data-testid="preserved-data" style={{ display: 'none' }}>
          {JSON.stringify(lastFormData)}
        </div>
      )}
    </div>
  );
};

/**
 * Flight List Page with all UI features
 */
const FlightListPage: React.FC = () => {
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    const loadFlights = async () => {
      const data = await mockGetFlightList();
      setFlights(data);
    };
    loadFlights();
  }, []);

  return (
    <div data-testid="flight-list-page">
      <h1>Flight List</h1>
      
      <div data-testid="flights-container">
        {flights.map((flight) => (
          <div key={flight.id} data-testid={`flight-card-${flight.id}`}>
            <div>
              <strong>{flight.flightNumber}</strong>
              {' - '}
              <DestinationDisplay destination={flight.destination} />
            </div>
            <div>
              Price: <CurrencyDisplay amount={flight.price} currency={flight.currency} />
            </div>
            <div>
              Status: <StatusBadge status={flight.status} />
            </div>
          </div>
        ))}
      </div>

      <FlightTable flights={flights} />
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-FLT-UI: UI & Edge Cases (Giao diện & Lỗi biên)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-FLT-UI-001: Date Picker - Format DD/MM/YYYY
   * Verify date input displays in DD/MM/YYYY format
   */
  it('TC-FLT-UI-001: Date Picker displays format DD/MM/YYYY', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <DatePickerInput 
        value="2025-12-25" 
        onChange={handleChange} 
        label="Departure Date"
      />
    );

    // Check format hint is displayed
    expect(screen.getByTestId('date-format-hint')).toHaveTextContent('Format: DD/MM/YYYY');

    // Check input has correct data-format attribute
    const input = screen.getByTestId('date-picker-input');
    expect(input).toHaveAttribute('data-format', 'DD/MM/YYYY');

    // Check date is displayed in DD/MM/YYYY format
    expect(input).toHaveValue('25/12/2025');

    // Check placeholder
    expect(input).toHaveAttribute('placeholder', 'DD/MM/YYYY');

    // Type new date in DD/MM/YYYY format
    await user.clear(input);
    await user.type(input, '31/12/2025');

    // Verify onChange called with YYYY-MM-DD format
    expect(handleChange).toHaveBeenCalledWith('2025-12-31');
  });

  /**
   * TC-FLT-UI-002: Time Picker - Format 24h HH:MM
   * Verify time input uses 24-hour format
   */
  it('TC-FLT-UI-002: Time Picker displays 24-hour format (HH:MM)', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <TimePickerInput 
        value="14:30" 
        onChange={handleChange} 
        label="Departure Time"
      />
    );

    // Check format hint is displayed
    expect(screen.getByTestId('time-format-hint')).toHaveTextContent('24-hour format (HH:MM)');

    // Check input has correct data-format attribute
    const input = screen.getByTestId('time-picker-input');
    expect(input).toHaveAttribute('data-format', '24h');

    // Check time is displayed in HH:MM format
    expect(input).toHaveValue('14:30');

    // Check pattern attribute for 24-hour validation
    expect(input).toHaveAttribute('pattern', '[0-2][0-9]:[0-5][0-9]');

    // Clear and verify it triggers onChange
    await user.clear(input);
    expect(handleChange).toHaveBeenCalled();

    // Directly set value to test onChange behavior
    fireEvent.change(input, { target: { value: '23:45' } });
    expect(handleChange).toHaveBeenCalledWith('23:45');
  });

  /**
   * TC-FLT-UI-003: Responsive Table - Flight list adapts on resize
   * Verify table becomes scrollable on small screens
   */
  it('TC-FLT-UI-003: Flight table adapts to window resize with horizontal scroll', async () => {
    // Set initial window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    render(<FlightTable flights={mockFlights} />);

    // Check table is rendered
    expect(screen.getByTestId('flight-table')).toBeInTheDocument();

    // On large screen, no scroll needed
    let container = screen.getByTestId('table-scroll-container');
    expect(container).toHaveStyle({ overflowX: 'visible' });

    // Simulate resize to small screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600
    });

    // Trigger resize event
    fireEvent(window, new Event('resize'));

    // Wait for state update
    await waitFor(() => {
      // Check window width is tracked
      const tableContainer = screen.getByTestId('flight-table-container');
      expect(tableContainer).toHaveAttribute('data-window-width', '600');
    });

    // Table should have horizontal scroll on small screen
    container = screen.getByTestId('table-scroll-container');
    expect(container).toHaveStyle({ overflowX: 'auto' });

    // Table should have minimum width to trigger scroll
    const table = screen.getByTestId('flight-table');
    expect(table).toHaveStyle({ minWidth: '800px' });
  });

  /**
   * TC-FLT-UI-004: Currency Display - Correct symbols ($, VND)
   * Verify currency displays with proper symbols
   */
  it('TC-FLT-UI-004: Currency displays with correct symbols ($ for USD, ₫ for VND)', () => {
    const { rerender } = render(<CurrencyDisplay amount={150} currency="USD" />);

    // Check USD displays with $ symbol
    let display = screen.getByTestId('currency-display');
    expect(display).toHaveTextContent('$150.00');
    expect(display).toHaveAttribute('data-currency', 'USD');

    // Check VND displays with ₫ symbol
    rerender(<CurrencyDisplay amount={1500000} currency="VND" />);
    display = screen.getByTestId('currency-display');
    expect(display).toHaveTextContent('₫');
    // VND locale uses period as thousand separator
    expect(display).toHaveTextContent('1.500.000');
    expect(display).toHaveAttribute('data-currency', 'VND');
  });

  /**
   * TC-FLT-UI-005: Status Colors - Scheduled=Blue, Delayed=Orange, Canceled=Red
   * Verify status badges display correct colors
   */
  it('TC-FLT-UI-005: Status badges display correct colors (Scheduled=Blue, Delayed=Orange, Canceled=Red)', () => {
    // Test Scheduled - Blue
    const { rerender } = render(<StatusBadge status="Scheduled" />);
    let badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Scheduled');
    expect(badge).toHaveAttribute('data-status', 'Scheduled');
    expect(badge.style.backgroundColor).toBe('blue');

    // Test Delayed - Orange
    rerender(<StatusBadge status="Delayed" />);
    badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Delayed');
    expect(badge).toHaveAttribute('data-status', 'Delayed');
    expect(badge.style.backgroundColor).toBe('orange');

    // Test Canceled - Red
    rerender(<StatusBadge status="Canceled" />);
    badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Canceled');
    expect(badge).toHaveAttribute('data-status', 'Canceled');
    expect(badge.style.backgroundColor).toBe('red');
  });

  /**
   * TC-FLT-UI-006: Long Destination Name - Text wraps/truncates without overflow
   * Verify long destination names don't break layout
   */
  it('TC-FLT-UI-006: Long destination name truncates with ellipsis and no overflow', () => {
    const longDestination = 'Ho Chi Minh City International Airport Terminal 2';

    render(<DestinationDisplay destination={longDestination} maxLength={30} />);

    const display = screen.getByTestId('destination-display');

    // Check text is present
    expect(display).toHaveTextContent(longDestination);

    // Check overflow is hidden
    expect(display).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });

    // Check max width is set
    expect(display).toHaveStyle({ maxWidth: '200px' });

    // Check title attribute for full text on hover
    expect(display).toHaveAttribute('title', longDestination);
  });

  /**
   * TC-FLT-UI-007: Network Fail - Create - Error handling with data preservation
   * Verify network error shows message and preserves form data
   */
  it('TC-FLT-UI-007: Network error displays message and preserves form data', async () => {
    const user = userEvent.setup();

    // Mock network failure
    mockCreateFlight.mockRejectedValueOnce(new Error('Network Error'));

    render(<FlightCreateForm />);

    // Fill form
    await user.type(screen.getByTestId('flight-number-input'), 'VN123');
    await user.type(screen.getByTestId('origin-input'), 'Hanoi');
    await user.type(screen.getByTestId('destination-input'), 'Ho Chi Minh City');
    await user.type(screen.getByTestId('price-input'), '1500000');

    // Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    // Check error message is displayed
    expect(screen.getByTestId('error-message')).toHaveTextContent('Network Error');

    // Check form data is preserved
    expect(screen.getByTestId('flight-number-input')).toHaveValue('VN123');
    expect(screen.getByTestId('origin-input')).toHaveValue('Hanoi');
    expect(screen.getByTestId('destination-input')).toHaveValue('Ho Chi Minh City');
    expect(screen.getByTestId('price-input')).toHaveValue('1500000');

    // Check preserved data is saved
    const preservedData = screen.getByTestId('preserved-data');
    expect(preservedData).toBeInTheDocument();
    expect(preservedData.textContent).toContain('VN123');

    // User can type again (error clears)
    await user.type(screen.getByTestId('flight-number-input'), '456');
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  /**
   * TC-FLT-UI-008: Double Submit - Prevent duplicate flight creation
   * Verify clicking create button twice only creates one flight
   */
  it('TC-FLT-UI-008: Double submit prevention - only one flight created', async () => {
    const user = userEvent.setup();

    // Mock successful creation with delay
    mockCreateFlight.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 100);
      });
    });

    render(<FlightCreateForm />);

    // Fill form
    await user.type(screen.getByTestId('flight-number-input'), 'VN123');
    await user.type(screen.getByTestId('origin-input'), 'Hanoi');

    // Click submit button twice quickly
    const submitButton = screen.getByTestId('submit-button');
    
    await user.click(submitButton);
    await user.click(submitButton); // Second click should be ignored

    // Button should be disabled while submitting
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Creating...');

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 200 });

    // Verify API was called only once despite two clicks
    expect(mockCreateFlight).toHaveBeenCalledTimes(1);

    // Verify it was called with correct data
    expect(mockCreateFlight).toHaveBeenCalledWith({
      flightNumber: 'VN123',
      origin: 'Hanoi',
      destination: '',
      departureDate: '',
      departureTime: '',
      price: '',
      currency: 'VND'
    });
  });
});
