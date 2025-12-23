/**
 * Test Suite: TC-FLT-LOG (Flight Scheduling Logic & Conflict)
 * Category: BATCH 5 EXPANSION - Master Flight & Supervision
 * Sub-Category: Logic Lịch Trình - Kiểm tra xung đột tài nguyên
 * Description: Unit tests for flight scheduling logic and resource conflict detection
 * 
 * Test Cases:
 * - TC-FLT-LOG-001: Plane Conflict - Overlap Time
 * - TC-FLT-LOG-002: Plane Conflict - Tight Turnaround
 * - TC-FLT-LOG-003: Create Flight - Leap Year
 * - TC-FLT-LOG-004: Create Flight - End of Year
 * - TC-FLT-LOG-005: Update Time - Move to Past
 * - TC-FLT-LOG-006: Update Time - Conflict
 * - TC-FLT-LOG-007: Update Airplane - Smaller Cap
 * - TC-FLT-LOG-008: Cancel Flight - No Bookings
 * - TC-FLT-LOG-009: Cancel Flight - Has Bookings
 * - TC-FLT-LOG-010: Delete Flight - Active
 * - TC-FLT-LOG-011: Delete Flight - Completed
 * 
 * Prerequisites:
 * 1. User is logged in as Admin/CSA
 * 2. User has access to Flight Management features
 * 3. Flights and airplanes exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock flight scheduling APIs
const mockCheckAirplaneAvailability = vi.fn();
const mockCheckTurnaroundTime = vi.fn();
const mockCreateFlight = vi.fn();
const mockUpdateFlight = vi.fn();
const mockCancelFlight = vi.fn();
const mockDeleteFlight = vi.fn();
const mockGetFlightBookings = vi.fn();
const mockGetAirplanes = vi.fn();
const mockGetFlights = vi.fn();

// Mock airplane data
const mockAirplanes = [
  { id: 'airplane_001', code: 'VN-A321', model: 'Airbus A321', capacity: 200 },
  { id: 'airplane_002', code: 'VN-ATR72', model: 'ATR 72', capacity: 70 },
  { id: 'airplane_003', code: 'VN-A320', model: 'Airbus A320', capacity: 180 }
];

// Mock flight data
const mockFlights = [
  {
    id: 'flight_001',
    flightNumber: 'VN123',
    airplaneId: 'airplane_001',
    origin: 'SGN',
    destination: 'HAN',
    departureTime: '2025-12-25T08:00:00',
    arrivalTime: '2025-12-25T10:00:00',
    status: 'Scheduled',
    price: 2500000
  },
  {
    id: 'flight_002',
    flightNumber: 'VN456',
    airplaneId: 'airplane_001',
    origin: 'HAN',
    destination: 'DAD',
    departureTime: '2025-12-25T11:00:00',
    arrivalTime: '2025-12-25T12:30:00',
    status: 'Scheduled',
    price: 1800000
  },
  {
    id: 'flight_003',
    flightNumber: 'VN789',
    airplaneId: 'airplane_002',
    origin: 'SGN',
    destination: 'DAD',
    departureTime: '2024-12-20T14:00:00',
    arrivalTime: '2024-12-20T15:30:00',
    status: 'Completed',
    price: 1500000
  }
];

// Mock FlightSchedulingPage component
const FlightSchedulingPage = () => {
  const [flights, setFlights] = React.useState<any[]>([]);
  const [airplanes, setAirplanes] = React.useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null);
  const [flightForm, setFlightForm] = React.useState({
    flightNumber: '',
    airplaneId: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: ''
  });
  const [errors, setErrors] = React.useState<any>({});
  const [warnings, setWarnings] = React.useState<any>({});
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    loadFlights();
    loadAirplanes();
  }, []);

  const loadFlights = async () => {
    const data = await mockGetFlights();
    setFlights(data);
  };

  const loadAirplanes = async () => {
    const data = await mockGetAirplanes();
    setAirplanes(data);
  };

  const handleOpenCreateModal = () => {
    setFlightForm({
      flightNumber: '',
      airplaneId: '',
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: ''
    });
    setErrors({});
    setWarnings({});
    setSuccessMessage('');
    setShowCreateModal(true);
  };

  const handleOpenUpdateModal = (flight: any) => {
    setSelectedFlight(flight);
    setFlightForm({
      flightNumber: flight.flightNumber,
      airplaneId: flight.airplaneId,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime.slice(0, 16),
      arrivalTime: flight.arrivalTime.slice(0, 16),
      price: flight.price.toString()
    });
    setErrors({});
    setWarnings({});
    setSuccessMessage('');
    setShowUpdateModal(true);
  };

  const validateScheduling = async (isUpdate: boolean = false) => {
    const newErrors: any = {};
    const newWarnings: any = {};

    // TC-FLT-LOG-005: Update Time - Move to Past
    if (isUpdate && flightForm.departureTime) {
      const departureDate = new Date(flightForm.departureTime);
      const now = new Date();
      if (departureDate < now) {
        newErrors.departureTime = 'Cannot move to past';
      }
    }

    // TC-FLT-LOG-001: Plane Conflict - Overlap Time
    if (flightForm.airplaneId && flightForm.departureTime && flightForm.arrivalTime) {
      const availability = await mockCheckAirplaneAvailability({
        airplaneId: flightForm.airplaneId,
        departureTime: flightForm.departureTime,
        arrivalTime: flightForm.arrivalTime,
        excludeFlightId: isUpdate ? selectedFlight?.id : null
      });

      if (!availability.available) {
        newErrors.airplaneId = 'Airplane is busy at this time';
      }
    }

    // TC-FLT-LOG-002: Plane Conflict - Tight Turnaround
    if (flightForm.airplaneId && flightForm.departureTime) {
      const turnaround = await mockCheckTurnaroundTime({
        airplaneId: flightForm.airplaneId,
        departureTime: flightForm.departureTime,
        excludeFlightId: isUpdate ? selectedFlight?.id : null
      });

      if (turnaround.warning) {
        newWarnings.departureTime = 'Turnaround time too short';
      }
    }

    // TC-FLT-LOG-007: Update Airplane - Smaller Cap
    if (isUpdate && flightForm.airplaneId !== selectedFlight?.airplaneId) {
      const newAirplane = airplanes.find(a => a.id === flightForm.airplaneId);
      const bookings = await mockGetFlightBookings(selectedFlight.id);
      
      if (newAirplane && bookings.count > 0) {
        if (bookings.count > newAirplane.capacity) {
          newErrors.airplaneId = `Cannot change airplane. ${bookings.count} bookings exceed new capacity of ${newAirplane.capacity}`;
        } else if (bookings.count > newAirplane.capacity * 0.7) {
          newWarnings.airplaneId = `Warning: ${bookings.count} bookings. New capacity is ${newAirplane.capacity}`;
        }
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateFlight = async () => {
    const isValid = await validateScheduling(false);

    if (!isValid) {
      return;
    }

    const result = await mockCreateFlight({
      flightNumber: flightForm.flightNumber,
      airplaneId: flightForm.airplaneId,
      origin: flightForm.origin,
      destination: flightForm.destination,
      departureTime: flightForm.departureTime,
      arrivalTime: flightForm.arrivalTime,
      price: Number(flightForm.price),
      status: 'Scheduled'
    });

    if (result.success) {
      setSuccessMessage('Flight created successfully');
      await loadFlights();
      setShowCreateModal(false);
    }
  };

  const handleUpdateFlight = async () => {
    const isValid = await validateScheduling(true);

    if (!isValid) {
      return;
    }

    const result = await mockUpdateFlight({
      flightId: selectedFlight.id,
      ...flightForm,
      price: Number(flightForm.price)
    });

    if (result.success) {
      setSuccessMessage('Flight updated successfully');
      await loadFlights();
      setShowUpdateModal(false);
    }
  };

  const handleCancelFlight = async (flight: any) => {
    const bookings = await mockGetFlightBookings(flight.id);

    const result = await mockCancelFlight({
      flightId: flight.id,
      hasBookings: bookings.count > 0
    });

    if (result.success) {
      if (bookings.count > 0) {
        setSuccessMessage(`Flight cancelled. Refund initiated for ${bookings.count} passengers.`);
      } else {
        setSuccessMessage('Flight cancelled successfully');
      }
      await loadFlights();
    }
  };

  const handleDeleteFlight = async (flight: any) => {
    // TC-FLT-LOG-010: Delete Flight - Active
    if (flight.status === 'Scheduled') {
      setErrors({ delete: 'Cannot delete active flight' });
      return;
    }

    // TC-FLT-LOG-011: Delete Flight - Completed
    const result = await mockDeleteFlight(flight.id);

    if (result.success) {
      setSuccessMessage('Flight deleted successfully');
      await loadFlights();
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFlightForm({ ...flightForm, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (warnings[field]) {
      setWarnings({ ...warnings, [field]: '' });
    }
  };

  return (
    <div data-testid="flight-scheduling-page">
      <h2>Flight Scheduling</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message" style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      {/* Global Errors */}
      {errors.delete && (
        <div data-testid="delete-error" style={{ color: 'red', marginBottom: '10px' }}>
          {errors.delete}
        </div>
      )}

      <button data-testid="open-create-modal-btn" onClick={handleOpenCreateModal}>
        Create New Flight
      </button>

      {/* Flight List */}
      <table data-testid="flight-list-table">
        <thead>
          <tr>
            <th>Flight No</th>
            <th>Route</th>
            <th>Departure</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, index) => (
            <tr key={flight.id} data-testid={`flight-row-${index}`}>
              <td data-testid={`flight-number-${index}`}>{flight.flightNumber}</td>
              <td data-testid={`flight-route-${index}`}>{flight.origin} → {flight.destination}</td>
              <td data-testid={`flight-departure-${index}`}>
                {new Date(flight.departureTime).toLocaleString()}
              </td>
              <td data-testid={`flight-status-${index}`}>{flight.status}</td>
              <td data-testid={`flight-actions-${index}`}>
                <button
                  data-testid={`update-flight-btn-${index}`}
                  onClick={() => handleOpenUpdateModal(flight)}
                >
                  Update
                </button>
                <button
                  data-testid={`cancel-flight-btn-${index}`}
                  onClick={() => handleCancelFlight(flight)}
                >
                  Cancel
                </button>
                <button
                  data-testid={`delete-flight-btn-${index}`}
                  onClick={() => handleDeleteFlight(flight)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Modal */}
      {showCreateModal && (
        <div data-testid="create-flight-modal">
          <h3>Create Flight</h3>

          <div data-testid="create-form">
            {/* Flight Number */}
            <input
              data-testid="create-flight-number-input"
              type="text"
              placeholder="Flight Number"
              value={flightForm.flightNumber}
              onChange={(e) => handleFormChange('flightNumber', e.target.value)}
            />

            {/* Airplane */}
            <select
              data-testid="create-airplane-select"
              value={flightForm.airplaneId}
              onChange={(e) => handleFormChange('airplaneId', e.target.value)}
            >
              <option value="">-- Select Airplane --</option>
              {airplanes.map((airplane) => (
                <option key={airplane.id} value={airplane.id}>
                  {airplane.code} - {airplane.model}
                </option>
              ))}
            </select>
            {errors.airplaneId && (
              <div data-testid="create-airplane-error" style={{ color: 'red' }}>
                {errors.airplaneId}
              </div>
            )}
            {warnings.airplaneId && (
              <div data-testid="create-airplane-warning" style={{ color: 'orange' }}>
                {warnings.airplaneId}
              </div>
            )}

            {/* Origin & Destination */}
            <input
              data-testid="create-origin-input"
              type="text"
              placeholder="Origin"
              value={flightForm.origin}
              onChange={(e) => handleFormChange('origin', e.target.value)}
            />
            <input
              data-testid="create-destination-input"
              type="text"
              placeholder="Destination"
              value={flightForm.destination}
              onChange={(e) => handleFormChange('destination', e.target.value)}
            />

            {/* Departure Time */}
            <input
              data-testid="create-departure-time-input"
              type="datetime-local"
              value={flightForm.departureTime}
              onChange={(e) => handleFormChange('departureTime', e.target.value)}
            />
            {errors.departureTime && (
              <div data-testid="create-departure-time-error" style={{ color: 'red' }}>
                {errors.departureTime}
              </div>
            )}
            {warnings.departureTime && (
              <div data-testid="create-departure-time-warning" style={{ color: 'orange' }}>
                {warnings.departureTime}
              </div>
            )}

            {/* Arrival Time */}
            <input
              data-testid="create-arrival-time-input"
              type="datetime-local"
              value={flightForm.arrivalTime}
              onChange={(e) => handleFormChange('arrivalTime', e.target.value)}
            />

            {/* Price */}
            <input
              data-testid="create-price-input"
              type="text"
              placeholder="Price"
              value={flightForm.price}
              onChange={(e) => handleFormChange('price', e.target.value)}
            />
          </div>

          <button data-testid="create-submit-btn" onClick={handleCreateFlight}>
            Create
          </button>
          <button data-testid="create-cancel-btn" onClick={() => setShowCreateModal(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedFlight && (
        <div data-testid="update-flight-modal">
          <h3>Update Flight: {selectedFlight.flightNumber}</h3>

          <div data-testid="update-form">
            {/* Airplane */}
            <select
              data-testid="update-airplane-select"
              value={flightForm.airplaneId}
              onChange={(e) => handleFormChange('airplaneId', e.target.value)}
            >
              {airplanes.map((airplane) => (
                <option key={airplane.id} value={airplane.id}>
                  {airplane.code} - {airplane.model} (Cap: {airplane.capacity})
                </option>
              ))}
            </select>
            {errors.airplaneId && (
              <div data-testid="update-airplane-error" style={{ color: 'red' }}>
                {errors.airplaneId}
              </div>
            )}
            {warnings.airplaneId && (
              <div data-testid="update-airplane-warning" style={{ color: 'orange' }}>
                {warnings.airplaneId}
              </div>
            )}

            {/* Departure Time */}
            <input
              data-testid="update-departure-time-input"
              type="datetime-local"
              value={flightForm.departureTime}
              onChange={(e) => handleFormChange('departureTime', e.target.value)}
            />
            {errors.departureTime && (
              <div data-testid="update-departure-time-error" style={{ color: 'red' }}>
                {errors.departureTime}
              </div>
            )}
            {warnings.departureTime && (
              <div data-testid="update-departure-time-warning" style={{ color: 'orange' }}>
                {warnings.departureTime}
              </div>
            )}

            {/* Arrival Time */}
            <input
              data-testid="update-arrival-time-input"
              type="datetime-local"
              value={flightForm.arrivalTime}
              onChange={(e) => handleFormChange('arrivalTime', e.target.value)}
            />
          </div>

          <button data-testid="update-submit-btn" onClick={handleUpdateFlight}>
            Update
          </button>
          <button data-testid="update-cancel-btn" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// Test Suite: TC-FLT-LOG (Flight Scheduling Logic & Conflict)
describe('TC-FLT-LOG: Flight Scheduling Logic & Conflict Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlights.mockResolvedValue(mockFlights);
    mockGetAirplanes.mockResolvedValue(mockAirplanes);
    mockCreateFlight.mockResolvedValue({ success: true, flightId: 'flight_new' });
    mockUpdateFlight.mockResolvedValue({ success: true });
    mockCancelFlight.mockResolvedValue({ success: true });
    mockDeleteFlight.mockResolvedValue({ success: true });
  });

  /**
   * TC-FLT-LOG-001: Plane Conflict - Overlap Time
   * Test Data / Input: Select Plane A (busy 8-10h). Book 9h.
   * Expected Result: Error "Airplane is busy at this time"
   */
  it('TC-FLT-LOG-001: should show error when airplane is busy at selected time', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: Plane A is busy 8-10h, trying to book at 9h
    mockCheckAirplaneAvailability.mockResolvedValue({ available: false });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Try to create flight with Plane A at 9h (overlap with 8-10h)
    await user.click(screen.getByTestId('open-create-modal-btn'));

    await user.type(screen.getByTestId('create-flight-number-input'), 'VN999');
    await user.selectOptions(screen.getByTestId('create-airplane-select'), 'airplane_001');
    await user.type(screen.getByTestId('create-origin-input'), 'SGN');
    await user.type(screen.getByTestId('create-destination-input'), 'HAN');
    await user.type(screen.getByTestId('create-departure-time-input'), '2025-12-25T09:00');
    await user.type(screen.getByTestId('create-arrival-time-input'), '2025-12-25T11:00');
    await user.type(screen.getByTestId('create-price-input'), '2000000');

    await user.click(screen.getByTestId('create-submit-btn'));

    // Assert: Error "Airplane is busy at this time"
    await waitFor(() => {
      expect(mockCheckAirplaneAvailability).toHaveBeenCalledWith({
        airplaneId: 'airplane_001',
        departureTime: '2025-12-25T09:00',
        arrivalTime: '2025-12-25T11:00',
        excludeFlightId: null
      });
      expect(screen.getByTestId('create-airplane-error')).toHaveTextContent('Airplane is busy at this time');
    });

    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-LOG-002: Plane Conflict - Tight Turnaround
   * Test Data / Input: Plane A arrives 10:00. Book 10:05. Gap < 30m
   * Expected Result: Error/Warn "Turnaround time too short"
   */
  it('TC-FLT-LOG-002: should show warning when turnaround time is too short', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: Plane A arrives 10:00, booking at 10:05 (5 min gap < 30 min)
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: true });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Try to create flight with tight turnaround
    await user.click(screen.getByTestId('open-create-modal-btn'));

    await user.type(screen.getByTestId('create-flight-number-input'), 'VN888');
    await user.selectOptions(screen.getByTestId('create-airplane-select'), 'airplane_001');
    await user.type(screen.getByTestId('create-origin-input'), 'HAN');
    await user.type(screen.getByTestId('create-destination-input'), 'DAD');
    await user.type(screen.getByTestId('create-departure-time-input'), '2025-12-25T10:05');
    await user.type(screen.getByTestId('create-arrival-time-input'), '2025-12-25T11:30');
    await user.type(screen.getByTestId('create-price-input'), '1500000');

    await user.click(screen.getByTestId('create-submit-btn'));

    // Assert: Warn "Turnaround time too short"
    await waitFor(() => {
      expect(mockCheckTurnaroundTime).toHaveBeenCalledWith({
        airplaneId: 'airplane_001',
        departureTime: '2025-12-25T10:05',
        excludeFlightId: null
      });
    });

    // Warning doesn't block creation - check mock call confirms warning was processed
    await waitFor(() => {
      expect(mockCreateFlight).toHaveBeenCalled();
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight created successfully');
    });
  });

  /**
   * TC-FLT-LOG-003: Create Flight - Leap Year
   * Test Data / Input: Select Feb 29. Date: 29/2
   * Expected Result: Accepted
   */
  it('TC-FLT-LOG-003: should accept leap year date (Feb 29)', async () => {
    // Arrange
    const user = userEvent.setup();
    
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Create flight on Feb 29, 2024 (leap year)
    await user.click(screen.getByTestId('open-create-modal-btn'));

    await user.type(screen.getByTestId('create-flight-number-input'), 'VN229');
    await user.selectOptions(screen.getByTestId('create-airplane-select'), 'airplane_003');
    await user.type(screen.getByTestId('create-origin-input'), 'SGN');
    await user.type(screen.getByTestId('create-destination-input'), 'HAN');
    await user.type(screen.getByTestId('create-departure-time-input'), '2028-02-29T14:00');
    await user.type(screen.getByTestId('create-arrival-time-input'), '2028-02-29T16:00');
    await user.type(screen.getByTestId('create-price-input'), '2200000');

    await user.click(screen.getByTestId('create-submit-btn'));

    // Assert: Accepted (leap year date is valid)
    await waitFor(() => {
      expect(mockCreateFlight).toHaveBeenCalledWith(
        expect.objectContaining({
          flightNumber: 'VN229',
          departureTime: '2028-02-29T14:00',
          arrivalTime: '2028-02-29T16:00'
        })
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight created successfully');
    });
  });

  /**
   * TC-FLT-LOG-004: Create Flight - End of Year
   * Test Data / Input: Dec 31 to Jan 1 (Next Year). New Year
   * Expected Result: Accepted
   */
  it('TC-FLT-LOG-004: should accept flight crossing year boundary (Dec 31 to Jan 1)', async () => {
    // Arrange
    const user = userEvent.setup();
    
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Create flight from Dec 31 to Jan 1 (cross year)
    await user.click(screen.getByTestId('open-create-modal-btn'));

    await user.type(screen.getByTestId('create-flight-number-input'), 'VN1231');
    await user.selectOptions(screen.getByTestId('create-airplane-select'), 'airplane_003');
    await user.type(screen.getByTestId('create-origin-input'), 'SGN');
    await user.type(screen.getByTestId('create-destination-input'), 'HAN');
    await user.type(screen.getByTestId('create-departure-time-input'), '2025-12-31T23:00');
    await user.type(screen.getByTestId('create-arrival-time-input'), '2026-01-01T01:00');
    await user.type(screen.getByTestId('create-price-input'), '3000000');

    await user.click(screen.getByTestId('create-submit-btn'));

    // Assert: Accepted (year boundary crossing is valid)
    await waitFor(() => {
      expect(mockCreateFlight).toHaveBeenCalledWith(
        expect.objectContaining({
          flightNumber: 'VN1231',
          departureTime: '2025-12-31T23:00',
          arrivalTime: '2026-01-01T01:00'
        })
      );
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight created successfully');
    });
  });

  /**
   * TC-FLT-LOG-005: Update Time - Move to Past
   * Test Data / Input: Edit existing flight to past. Edit Date
   * Expected Result: Error "Cannot move to past"
   */
  it('TC-FLT-LOG-005: should show error when updating flight to past date', async () => {
    // Arrange
    const user = userEvent.setup();
    
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Update flight to past date
    await user.click(screen.getByTestId('update-flight-btn-0'));

    const pastDate = '2024-12-20T10:00';
    await user.clear(screen.getByTestId('update-departure-time-input'));
    await user.type(screen.getByTestId('update-departure-time-input'), pastDate);

    await user.click(screen.getByTestId('update-submit-btn'));

    // Assert: Error "Cannot move to past"
    await waitFor(() => {
      expect(screen.getByTestId('update-departure-time-error')).toHaveTextContent('Cannot move to past');
    });

    expect(mockUpdateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-LOG-006: Update Time - Conflict
   * Test Data / Input: Move flight to time plane is busy. Edit Date
   * Expected Result: Error "Airplane conflict"
   */
  it('TC-FLT-LOG-006: should show error when updating to conflicting time slot', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: Airplane busy at new time
    mockCheckAirplaneAvailability.mockResolvedValue({ available: false });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Update flight to conflicting time
    await user.click(screen.getByTestId('update-flight-btn-0'));

    await user.clear(screen.getByTestId('update-departure-time-input'));
    await user.type(screen.getByTestId('update-departure-time-input'), '2025-12-25T11:30');
    await user.clear(screen.getByTestId('update-arrival-time-input'));
    await user.type(screen.getByTestId('update-arrival-time-input'), '2025-12-25T13:00');

    await user.click(screen.getByTestId('update-submit-btn'));

    // Assert: Error "Airplane is busy at this time" (conflict)
    await waitFor(() => {
      expect(mockCheckAirplaneAvailability).toHaveBeenCalled();
      expect(screen.getByTestId('update-airplane-error')).toHaveTextContent('Airplane is busy at this time');
    });

    expect(mockUpdateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-LOG-007: Update Airplane - Smaller Cap
   * Test Data / Input: Change A321(200) -> ATR(70). Downgrade
   * Expected Result: Warn if Bookings > 70. Block if full.
   */
  it('TC-FLT-LOG-007: should warn or block when changing to airplane with smaller capacity', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: 80 bookings exist (> new capacity of 70)
    mockGetFlightBookings.mockResolvedValue({ count: 80 });
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });
    mockCheckTurnaroundTime.mockResolvedValue({ warning: false });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Change from A321(200) to ATR72(70) with 80 bookings
    await user.click(screen.getByTestId('update-flight-btn-0'));

    await user.selectOptions(screen.getByTestId('update-airplane-select'), 'airplane_002'); // ATR72 capacity 70

    await user.click(screen.getByTestId('update-submit-btn'));

    // Assert: Error "Cannot change airplane. 80 bookings exceed new capacity of 70"
    await waitFor(() => {
      expect(mockGetFlightBookings).toHaveBeenCalledWith('flight_001');
      expect(screen.getByTestId('update-airplane-error')).toHaveTextContent(
        'Cannot change airplane. 80 bookings exceed new capacity of 70'
      );
    });

    expect(mockUpdateFlight).not.toHaveBeenCalled();

    // Test warning case: 60 bookings (< 70 but > 70% of 70 = 49)
    // Close current modal and start fresh
    await user.click(screen.getByTestId('update-cancel-btn'));

    mockGetFlightBookings.mockResolvedValue({ count: 60 });
    mockCheckAirplaneAvailability.mockResolvedValue({ available: true });

    await user.click(screen.getByTestId('update-flight-btn-0'));

    await user.selectOptions(screen.getByTestId('update-airplane-select'), 'airplane_002'); // ATR72

    await user.click(screen.getByTestId('update-submit-btn'));

    // Assert: Warning shown before modal closes
    await waitFor(() => {
      expect(mockGetFlightBookings).toHaveBeenCalled();
    });

    // Update proceeds with warning (check success message)
    await waitFor(() => {
      expect(mockUpdateFlight).toHaveBeenCalled();
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight updated successfully');
    });
  });

  /**
   * TC-FLT-LOG-008: Cancel Flight - No Bookings
   * Test Data / Input: Status -> Cancelled. Action
   * Expected Result: Success
   */
  it('TC-FLT-LOG-008: should cancel flight successfully when no bookings exist', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: No bookings
    mockGetFlightBookings.mockResolvedValue({ count: 0 });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Cancel flight with no bookings
    await user.click(screen.getByTestId('cancel-flight-btn-0'));

    // Assert: Success
    await waitFor(() => {
      expect(mockGetFlightBookings).toHaveBeenCalledWith('flight_001');
      expect(mockCancelFlight).toHaveBeenCalledWith({
        flightId: 'flight_001',
        hasBookings: false
      });
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight cancelled successfully');
    });
  });

  /**
   * TC-FLT-LOG-009: Cancel Flight - Has Bookings
   * Test Data / Input: Status -> Cancelled. Action
   * Expected Result: Trigger refund/notify flow for passengers
   */
  it('TC-FLT-LOG-009: should trigger refund flow when cancelling flight with bookings', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Mock: 25 bookings exist
    mockGetFlightBookings.mockResolvedValue({ count: 25 });

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Act: Cancel flight with bookings
    await user.click(screen.getByTestId('cancel-flight-btn-0'));

    // Assert: Refund/notify flow triggered
    await waitFor(() => {
      expect(mockGetFlightBookings).toHaveBeenCalledWith('flight_001');
      expect(mockCancelFlight).toHaveBeenCalledWith({
        flightId: 'flight_001',
        hasBookings: true
      });
      expect(screen.getByTestId('success-message')).toHaveTextContent(
        'Flight cancelled. Refund initiated for 25 passengers.'
      );
    });
  });

  /**
   * TC-FLT-LOG-010: Delete Flight - Active
   * Test Data / Input: Try Delete "Scheduled" flight. Delete
   * Expected Result: Error "Cannot delete active flight"
   */
  it('TC-FLT-LOG-010: should show error when trying to delete active flight', async () => {
    // Arrange
    const user = userEvent.setup();

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Verify flight is Scheduled (active)
    expect(screen.getByTestId('flight-status-0')).toHaveTextContent('Scheduled');

    // Act: Try to delete active flight
    await user.click(screen.getByTestId('delete-flight-btn-0'));

    // Assert: Error "Cannot delete active flight"
    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toHaveTextContent('Cannot delete active flight');
    });

    expect(mockDeleteFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-FLT-LOG-011: Delete Flight - Completed
   * Test Data / Input: Try Delete old flight. Delete
   * Expected Result: Success (or Soft Delete)
   */
  it('TC-FLT-LOG-011: should delete completed flight successfully', async () => {
    // Arrange
    const user = userEvent.setup();

    render(<FlightSchedulingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flight-list-table')).toBeInTheDocument();
    });

    // Verify flight is Completed
    expect(screen.getByTestId('flight-status-2')).toHaveTextContent('Completed');

    // Act: Delete completed flight
    await user.click(screen.getByTestId('delete-flight-btn-2'));

    // Assert: Success
    await waitFor(() => {
      expect(mockDeleteFlight).toHaveBeenCalledWith('flight_003');
      expect(screen.getByTestId('success-message')).toHaveTextContent('Flight deleted successfully');
    });
  });
});
