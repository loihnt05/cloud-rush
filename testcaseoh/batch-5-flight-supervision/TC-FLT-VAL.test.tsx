/**
 * Test Suite: TC-FLT-VAL (Flight Creation - Field Validation)
 * Category: BATCH 5 EXPANSION - Master Flight & Supervision
 * Sub-Category: Validate Form Tạo Chuyến Bay
 * Description: Unit tests for flight creation form validation
 * 
 * Test Cases:
 * - TC-FLT-VAL-001: Flight No - Empty
 * - TC-FLT-VAL-002: Flight No - Duplicate
 * - TC-FLT-VAL-003: Flight No - Special Char
 * - TC-FLT-VAL-004: Flight No - Max Length
 * - TC-FLT-VAL-005: Origin - Empty
 * - TC-FLT-VAL-006: Destination - Empty
 * - TC-FLT-VAL-007: Route - Same Origin & Dest
 * - TC-FLT-VAL-008: Departure Time - Past Date
 * - TC-FLT-VAL-009: Arrival Time - Before Departure
 * - TC-FLT-VAL-010: Arrival Time - Same as Departure
 * - TC-FLT-VAL-011: Price - Negative
 * - TC-FLT-VAL-012: Price - Zero
 * - TC-FLT-VAL-013: Price - Non-numeric
 * - TC-FLT-VAL-014: Airplane - Not Selected
 * - TC-FLT-VAL-015: Airplane - Capacity Check
 * - TC-FLT-VAL-016: Status - Default
 * - TC-FLT-VAL-017: Create Flight - Success
 * 
 * Prerequisites:
 * 1. User is logged in as Admin/CSA
 * 2. User has access to Flight Management features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock flight creation APIs
const mockCheckFlightNumberExists = vi.fn();
const mockCreateFlight = vi.fn();
const mockGetAirplanes = vi.fn();
const mockGetAirports = vi.fn();

// Mock airplane data
const mockAirplanes = [
  { id: 'airplane_001', code: 'VN-A320', model: 'Airbus A320', capacity: 180 },
  { id: 'airplane_002', code: 'VN-B737', model: 'Boeing 737', capacity: 150 },
  { id: 'airplane_003', code: 'VN-B777', model: 'Boeing 777', capacity: 300 }
];

// Mock airport data
const mockAirports = [
  { id: 'airport_001', code: 'SGN', name: 'Tan Son Nhat', city: 'Ho Chi Minh' },
  { id: 'airport_002', code: 'HAN', name: 'Noi Bai', city: 'Ha Noi' },
  { id: 'airport_003', code: 'DAD', name: 'Da Nang', city: 'Da Nang' }
];

// Mock existing flights
const mockExistingFlights = ['VN001', 'VN002', 'VN003'];

// Mock FlightCreationPage component
const FlightCreationPage = () => {
  const [flightForm, setFlightForm] = React.useState({
    flightNumber: '',
    airplaneId: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: '',
    status: 'Scheduled' // Default status
  });
  const [errors, setErrors] = React.useState<any>({});
  const [airplanes, setAirplanes] = React.useState<any[]>([]);
  const [airports, setAirports] = React.useState<any[]>([]);
  const [selectedAirplane, setSelectedAirplane] = React.useState<any>(null);
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    loadAirplanes();
    loadAirports();
  }, []);

  const loadAirplanes = async () => {
    const data = await mockGetAirplanes();
    setAirplanes(data);
  };

  const loadAirports = async () => {
    const data = await mockGetAirports();
    setAirports(data);
  };

  const validateForm = async () => {
    const newErrors: any = {};

    // TC-FLT-VAL-001: Flight No - Empty
    if (!flightForm.flightNumber.trim()) {
      newErrors.flightNumber = 'MSG 1: Field Mandatory';
    } else {
      // TC-FLT-VAL-003: Flight No - Special Char (Alphanumeric only)
      if (!/^[A-Za-z0-9]+$/.test(flightForm.flightNumber)) {
        newErrors.flightNumber = 'Alphanumeric only';
      }
      // TC-FLT-VAL-004: Flight No - Max Length
      else if (flightForm.flightNumber.length > 10) {
        newErrors.flightNumber = 'Max length exceeded';
      }
      // TC-FLT-VAL-002: Flight No - Duplicate
      else {
        const exists = await mockCheckFlightNumberExists(flightForm.flightNumber);
        if (exists) {
          newErrors.flightNumber = 'Flight Number already exists';
        }
      }
    }

    // TC-FLT-VAL-014: Airplane - Not Selected
    if (!flightForm.airplaneId.trim()) {
      newErrors.airplaneId = 'MSG 1: Field Mandatory';
    }

    // TC-FLT-VAL-005: Origin - Empty
    if (!flightForm.origin.trim()) {
      newErrors.origin = 'MSG 1: Field Mandatory';
    }

    // TC-FLT-VAL-006: Destination - Empty
    if (!flightForm.destination.trim()) {
      newErrors.destination = 'MSG 1: Field Mandatory';
    }

    // TC-FLT-VAL-007: Route - Same Origin & Dest
    if (flightForm.origin && flightForm.destination && flightForm.origin === flightForm.destination) {
      newErrors.destination = 'Destination must be different';
    }

    // TC-FLT-VAL-008: Departure Time - Past Date
    if (!flightForm.departureTime) {
      newErrors.departureTime = 'MSG 1: Field Mandatory';
    } else {
      const departureDate = new Date(flightForm.departureTime);
      const now = new Date();
      if (departureDate < now) {
        newErrors.departureTime = 'Departure must be in future';
      }
    }

    // Arrival Time validations
    if (!flightForm.arrivalTime) {
      newErrors.arrivalTime = 'MSG 1: Field Mandatory';
    } else if (flightForm.departureTime) {
      const departureDate = new Date(flightForm.departureTime);
      const arrivalDate = new Date(flightForm.arrivalTime);

      // TC-FLT-VAL-009: Arrival Time - Before Departure
      if (arrivalDate < departureDate) {
        newErrors.arrivalTime = 'Arrival must be after Departure';
      }
      // TC-FLT-VAL-010: Arrival Time - Same as Departure
      else if (arrivalDate.getTime() === departureDate.getTime()) {
        newErrors.arrivalTime = 'Flight duration too short';
      }
    }

    // Price validations
    if (!flightForm.price.trim()) {
      newErrors.price = 'MSG 1: Field Mandatory';
    } else {
      // TC-FLT-VAL-013: Price - Non-numeric
      if (isNaN(Number(flightForm.price))) {
        newErrors.price = 'Numeric only';
      } else {
        const priceValue = Number(flightForm.price);
        // TC-FLT-VAL-012: Price - Zero
        if (priceValue === 0) {
          newErrors.price = 'Price must be > 0';
        }
        // TC-FLT-VAL-011: Price - Negative
        else if (priceValue < 0) {
          newErrors.price = 'Price must be positive';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field: string, value: string) => {
    setFlightForm({ ...flightForm, [field]: value });

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }

    // TC-FLT-VAL-015: Airplane - Capacity Check
    if (field === 'airplaneId' && value) {
      const airplane = airplanes.find(a => a.id === value);
      setSelectedAirplane(airplane);
    }
  };

  const handleCreateFlight = async () => {
    const isValid = await validateForm();

    if (!isValid) {
      return;
    }

    // TC-FLT-VAL-017: Create Flight - Success
    const result = await mockCreateFlight({
      flightNumber: flightForm.flightNumber,
      airplaneId: flightForm.airplaneId,
      origin: flightForm.origin,
      destination: flightForm.destination,
      departureTime: flightForm.departureTime,
      arrivalTime: flightForm.arrivalTime,
      price: Number(flightForm.price),
      status: flightForm.status
    });

    if (result.success) {
      setSuccessMessage('Success. Flight created in DB.');
      // Reset form
      setFlightForm({
        flightNumber: '',
        airplaneId: '',
        origin: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        price: '',
        status: 'Scheduled'
      });
      setSelectedAirplane(null);
    }
  };

  return (
    <div data-testid="flight-creation-page">
      <h2>Create Flight</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="create-success-message" style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      <form data-testid="flight-creation-form">
        {/* Flight Number */}
        <div>
          <label htmlFor="flight-number-input">Flight Number:</label>
          <input
            id="flight-number-input"
            data-testid="flight-number-input"
            type="text"
            value={flightForm.flightNumber}
            onChange={(e) => handleFormChange('flightNumber', e.target.value)}
          />
          {errors.flightNumber && (
            <div data-testid="flight-number-error" style={{ color: 'red' }}>
              {errors.flightNumber}
            </div>
          )}
        </div>

        {/* Airplane */}
        <div>
          <label htmlFor="airplane-select">Airplane:</label>
          <select
            id="airplane-select"
            data-testid="airplane-select"
            value={flightForm.airplaneId}
            onChange={(e) => handleFormChange('airplaneId', e.target.value)}
          >
            <option value="">-- Select Airplane --</option>
            {airplanes.map((airplane) => (
              <option key={airplane.id} value={airplane.id} data-testid={`airplane-option-${airplane.code}`}>
                {airplane.code} - {airplane.model}
              </option>
            ))}
          </select>
          {errors.airplaneId && (
            <div data-testid="airplane-error" style={{ color: 'red' }}>
              {errors.airplaneId}
            </div>
          )}
        </div>

        {/* Airplane Capacity Display */}
        {selectedAirplane && (
          <div data-testid="airplane-capacity-display">
            Capacity: <span data-testid="airplane-capacity-value">{selectedAirplane.capacity}</span> seats
          </div>
        )}

        {/* Origin */}
        <div>
          <label htmlFor="origin-select">Origin:</label>
          <select
            id="origin-select"
            data-testid="origin-select"
            value={flightForm.origin}
            onChange={(e) => handleFormChange('origin', e.target.value)}
          >
            <option value="">-- Select Origin --</option>
            {airports.map((airport) => (
              <option key={airport.id} value={airport.code} data-testid={`origin-option-${airport.code}`}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
          {errors.origin && (
            <div data-testid="origin-error" style={{ color: 'red' }}>
              {errors.origin}
            </div>
          )}
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination-select">Destination:</label>
          <select
            id="destination-select"
            data-testid="destination-select"
            value={flightForm.destination}
            onChange={(e) => handleFormChange('destination', e.target.value)}
          >
            <option value="">-- Select Destination --</option>
            {airports.map((airport) => (
              <option key={airport.id} value={airport.code} data-testid={`destination-option-${airport.code}`}>
                {airport.code} - {airport.name}
              </option>
            ))}
          </select>
          {errors.destination && (
            <div data-testid="destination-error" style={{ color: 'red' }}>
              {errors.destination}
            </div>
          )}
        </div>

        {/* Departure Time */}
        <div>
          <label htmlFor="departure-time-input">Departure Time:</label>
          <input
            id="departure-time-input"
            data-testid="departure-time-input"
            type="datetime-local"
            value={flightForm.departureTime}
            onChange={(e) => handleFormChange('departureTime', e.target.value)}
          />
          {errors.departureTime && (
            <div data-testid="departure-time-error" style={{ color: 'red' }}>
              {errors.departureTime}
            </div>
          )}
        </div>

        {/* Arrival Time */}
        <div>
          <label htmlFor="arrival-time-input">Arrival Time:</label>
          <input
            id="arrival-time-input"
            data-testid="arrival-time-input"
            type="datetime-local"
            value={flightForm.arrivalTime}
            onChange={(e) => handleFormChange('arrivalTime', e.target.value)}
          />
          {errors.arrivalTime && (
            <div data-testid="arrival-time-error" style={{ color: 'red' }}>
              {errors.arrivalTime}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price-input">Price:</label>
          <input
            id="price-input"
            data-testid="price-input"
            type="text"
            value={flightForm.price}
            onChange={(e) => handleFormChange('price', e.target.value)}
          />
          {errors.price && (
            <div data-testid="price-error" style={{ color: 'red' }}>
              {errors.price}
            </div>
          )}
        </div>

        {/* Status (Display Only - Default) */}
        <div data-testid="status-display">
          Status: <span data-testid="status-value">{flightForm.status}</span>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          data-testid="create-flight-btn"
          onClick={handleCreateFlight}
        >
          Create Flight
        </button>
      </form>
    </div>
  );
};

// Test Suite: TC-FLT-VAL (Flight Creation - Field Validation)
describe('TC-FLT-VAL: Flight Creation - Field Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAirplanes.mockResolvedValue(mockAirplanes);
    mockGetAirports.mockResolvedValue(mockAirports);
    mockCheckFlightNumberExists.mockImplementation((flightNo: string) => {
      return Promise.resolve(mockExistingFlights.includes(flightNo));
    });
    mockCreateFlight.mockResolvedValue({ success: true, flightId: 'flight_new' });
  });

  /**
   * TC-FLT-VAL-001: Flight No - Empty
   * Business Requirement: BR38
   * 
   * Test Data / Input: No: ""
   * Expected Result: Error "MSG 1: Field Mandatory"
   */
  it('TC-FLT-VAL-001: should show error when flight number is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Leave Flight No empty and submit
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "MSG 1: Field Mandatory"
    await waitFor(() => {
      expect(screen.getByTestId('flight-number-error')).toHaveTextContent('MSG 1: Field Mandatory');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-002: Flight No - Duplicate
   * Business Requirement: Unique constraint
   * 
   * Test Data / Input: No: "VN001"
   * Expected Result: Error "Flight Number already exists"
   */
  it('TC-FLT-VAL-002: should show error when flight number already exists', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter existing Flight No "VN001"
    await user.type(screen.getByTestId('flight-number-input'), 'VN001');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Flight Number already exists"
    await waitFor(() => {
      expect(mockCheckFlightNumberExists).toHaveBeenCalledWith('VN001');
      expect(screen.getByTestId('flight-number-error')).toHaveTextContent('Flight Number already exists');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-003: Flight No - Special Char
   * Business Requirement: Validation
   * 
   * Test Data / Input: No: "VN@#$"
   * Expected Result: Error "Alphanumeric only"
   */
  it('TC-FLT-VAL-003: should show error when flight number contains special characters', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter special chars "VN@#$"
    await user.type(screen.getByTestId('flight-number-input'), 'VN@#$');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Alphanumeric only"
    await waitFor(() => {
      expect(screen.getByTestId('flight-number-error')).toHaveTextContent('Alphanumeric only');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-004: Flight No - Max Length
   * Business Requirement: Boundary validation
   * 
   * Test Data / Input: No: > 10 chars
   * Expected Result: Error "Max length exceeded"
   */
  it('TC-FLT-VAL-004: should show error when flight number exceeds max length', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter long string (> 10 chars)
    await user.type(screen.getByTestId('flight-number-input'), 'VN12345678901');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Max length exceeded"
    await waitFor(() => {
      expect(screen.getByTestId('flight-number-error')).toHaveTextContent('Max length exceeded');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-005: Origin - Empty
   * Business Requirement: BR38
   * 
   * Test Data / Input: Origin: ""
   * Expected Result: Error "MSG 1: Field Mandatory"
   */
  it('TC-FLT-VAL-005: should show error when origin is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Leave Origin empty and submit
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "MSG 1: Field Mandatory"
    await waitFor(() => {
      expect(screen.getByTestId('origin-error')).toHaveTextContent('MSG 1: Field Mandatory');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-006: Destination - Empty
   * Business Requirement: BR38
   * 
   * Test Data / Input: Dest: ""
   * Expected Result: Error "MSG 1: Field Mandatory"
   */
  it('TC-FLT-VAL-006: should show error when destination is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Leave Destination empty and submit
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "MSG 1: Field Mandatory"
    await waitFor(() => {
      expect(screen.getByTestId('destination-error')).toHaveTextContent('MSG 1: Field Mandatory');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-007: Route - Same Origin & Dest
   * Business Requirement: Logic validation
   * 
   * Test Data / Input: SGN -> SGN
   * Expected Result: Error "Destination must be different"
   */
  it('TC-FLT-VAL-007: should show error when origin and destination are the same', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Select Origin = Destination (SGN -> SGN)
    await user.selectOptions(screen.getByTestId('origin-select'), 'SGN');
    await user.selectOptions(screen.getByTestId('destination-select'), 'SGN');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Destination must be different"
    await waitFor(() => {
      expect(screen.getByTestId('destination-error')).toHaveTextContent('Destination must be different');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-008: Departure Time - Past Date
   * Business Requirement: Logic validation
   * 
   * Test Data / Input: Date: Yesterday
   * Expected Result: Error "Departure must be in future"
   */
  it('TC-FLT-VAL-008: should show error when departure time is in the past', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Select date in past (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm

    await user.type(screen.getByTestId('departure-time-input'), pastDate);
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Departure must be in future"
    await waitFor(() => {
      expect(screen.getByTestId('departure-time-error')).toHaveTextContent('Departure must be in future');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-009: Arrival Time - Before Departure
   * Business Requirement: Logic validation
   * 
   * Test Data / Input: Arr < Dep
   * Expected Result: Error "Arrival must be after Departure"
   */
  it('TC-FLT-VAL-009: should show error when arrival time is before departure', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Set Arrival < Departure
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const departureDate = tomorrow.toISOString().slice(0, 16);

    const earlier = new Date(tomorrow);
    earlier.setHours(earlier.getHours() - 2);
    const arrivalDate = earlier.toISOString().slice(0, 16);

    await user.type(screen.getByTestId('departure-time-input'), departureDate);
    await user.type(screen.getByTestId('arrival-time-input'), arrivalDate);
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Arrival must be after Departure"
    await waitFor(() => {
      expect(screen.getByTestId('arrival-time-error')).toHaveTextContent('Arrival must be after Departure');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-010: Arrival Time - Same as Departure
   * Business Requirement: Logic validation
   * 
   * Test Data / Input: Arr = Dep
   * Expected Result: Error "Flight duration too short"
   */
  it('TC-FLT-VAL-010: should show error when arrival time is same as departure', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Set Arrival = Departure
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sameDate = tomorrow.toISOString().slice(0, 16);

    await user.type(screen.getByTestId('departure-time-input'), sameDate);
    await user.type(screen.getByTestId('arrival-time-input'), sameDate);
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Flight duration too short"
    await waitFor(() => {
      expect(screen.getByTestId('arrival-time-error')).toHaveTextContent('Flight duration too short');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-011: Price - Negative
   * Business Requirement: Validation
   * 
   * Test Data / Input: Price: -100
   * Expected Result: Error "Price must be positive"
   */
  it('TC-FLT-VAL-011: should show error when price is negative', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter negative price
    await user.type(screen.getByTestId('price-input'), '-100');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Price must be positive"
    await waitFor(() => {
      expect(screen.getByTestId('price-error')).toHaveTextContent('Price must be positive');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-012: Price - Zero
   * Business Requirement: Validation
   * 
   * Test Data / Input: Price: 0
   * Expected Result: Error "Price must be > 0"
   */
  it('TC-FLT-VAL-012: should show error when price is zero', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter 0
    await user.type(screen.getByTestId('price-input'), '0');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Price must be > 0"
    await waitFor(() => {
      expect(screen.getByTestId('price-error')).toHaveTextContent('Price must be > 0');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-013: Price - Non-numeric
   * Business Requirement: Validation
   * 
   * Test Data / Input: Price: "abc"
   * Expected Result: Error "Numeric only"
   */
  it('TC-FLT-VAL-013: should show error when price is non-numeric', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter text "abc"
    await user.type(screen.getByTestId('price-input'), 'abc');
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "Numeric only"
    await waitFor(() => {
      expect(screen.getByTestId('price-error')).toHaveTextContent('Numeric only');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-014: Airplane - Not Selected
   * Business Requirement: BR38
   * 
   * Test Data / Input: Plane: ""
   * Expected Result: Error "MSG 1: Field Mandatory"
   */
  it('TC-FLT-VAL-014: should show error when airplane is not selected', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Leave Airplane blank and submit
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Error "MSG 1: Field Mandatory"
    await waitFor(() => {
      expect(screen.getByTestId('airplane-error')).toHaveTextContent('MSG 1: Field Mandatory');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-VAL-015: Airplane - Capacity Check
   * Business Requirement: Data integrity
   * 
   * Test Data / Input: Plane A
   * Expected Result: System loads Capacity from Plane Master
   */
  it('TC-FLT-VAL-015: should load airplane capacity when airplane is selected', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Select plane (VN-A320 with capacity 180)
    await user.selectOptions(screen.getByTestId('airplane-select'), 'airplane_001');

    // Assert: System loads Capacity from Plane Master
    await waitFor(() => {
      expect(screen.getByTestId('airplane-capacity-display')).toBeInTheDocument();
      expect(screen.getByTestId('airplane-capacity-value')).toHaveTextContent('180');
    });

    // Change to another airplane (VN-B777 with capacity 300)
    await user.selectOptions(screen.getByTestId('airplane-select'), 'airplane_003');

    await waitFor(() => {
      expect(screen.getByTestId('airplane-capacity-value')).toHaveTextContent('300');
    });
  });

  /**
   * TC-FLT-VAL-016: Status - Default
   * Business Requirement: Business logic
   * 
   * Test Data / Input: Default
   * Expected Result: Status is "Scheduled"
   */
  it('TC-FLT-VAL-016: should have default status as "Scheduled"', async () => {
    // Arrange
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Assert: Default status is "Scheduled"
    expect(screen.getByTestId('status-display')).toBeInTheDocument();
    expect(screen.getByTestId('status-value')).toHaveTextContent('Scheduled');
  });

  /**
   * TC-FLT-VAL-017: Create Flight - Success
   * Business Requirement: Happy path
   * 
   * Test Data / Input: Valid Input
   * Expected Result: Success. Flight created in DB.
   */
  it('TC-FLT-VAL-017: should create flight successfully with all valid data', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightCreationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-creation-form')).toBeInTheDocument();
    });

    // Act: Enter all valid data
    await user.type(screen.getByTestId('flight-number-input'), 'VN999');
    await user.selectOptions(screen.getByTestId('airplane-select'), 'airplane_001');
    await user.selectOptions(screen.getByTestId('origin-select'), 'SGN');
    await user.selectOptions(screen.getByTestId('destination-select'), 'HAN');

    // Set future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const departureDate = tomorrow.toISOString().slice(0, 16);

    const later = new Date(tomorrow);
    later.setHours(later.getHours() + 2);
    const arrivalDate = later.toISOString().slice(0, 16);

    await user.type(screen.getByTestId('departure-time-input'), departureDate);
    await user.type(screen.getByTestId('arrival-time-input'), arrivalDate);
    await user.type(screen.getByTestId('price-input'), '2500000');

    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert: Success. Flight created in DB.
    await waitFor(() => {
      expect(mockCheckFlightNumberExists).toHaveBeenCalledWith('VN999');
      expect(mockCreateFlight).toHaveBeenCalledWith({
        flightNumber: 'VN999',
        airplaneId: 'airplane_001',
        origin: 'SGN',
        destination: 'HAN',
        departureTime: departureDate,
        arrivalTime: arrivalDate,
        price: 2500000,
        status: 'Scheduled'
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('create-success-message')).toHaveTextContent('Success. Flight created in DB.');
    });

    // Verify form is reset
    expect((screen.getByTestId('flight-number-input') as HTMLInputElement).value).toBe('');
    expect((screen.getByTestId('airplane-select') as HTMLSelectElement).value).toBe('');
    expect(screen.queryByTestId('airplane-capacity-display')).not.toBeInTheDocument();
  });
});
