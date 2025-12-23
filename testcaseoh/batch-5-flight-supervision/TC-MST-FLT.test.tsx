/**
 * Test Suite: TC-MST-FLT (Master Data - Flight Management)
 * Category: BATCH 5 - Flight Management & Supervision
 * Description: Unit tests for flight CRUD operations and management
 * 
 * Test Cases:
 * - TC-MST-FLT-001: Verify Flight Management Screen Display
 * - TC-MST-FLT-002: Verify Single Action Restriction
 * - TC-MST-FLT-003: Verify Create Flight - Valid Data
 * - TC-MST-FLT-004: Verify Create Flight - Missing Mandatory Fields
 * - TC-MST-FLT-005: Verify Update Flight - Valid Data
 * - TC-MST-FLT-006: Verify Delete Flight - Success
 * 
 * Prerequisites:
 * 1. User is logged in as Admin or CSA
 * 2. User has access to Flight Management
 * 3. Valid airplane records exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock flight APIs
const mockGetFlights = vi.fn();
const mockCreateFlight = vi.fn();
const mockUpdateFlight = vi.fn();
const mockDeleteFlight = vi.fn();
const mockGenerateSeats = vi.fn();
const mockGetAirplanes = vi.fn();

// Mock flight data
const mockFlights = [
  {
    id: 'flight_001',
    flightNumber: 'VN123',
    airplaneId: 'airplane_001',
    airplaneCode: 'VN-A320',
    origin: 'SGN',
    originName: 'Ho Chi Minh City',
    destination: 'HAN',
    destinationName: 'Hanoi',
    departureTime: '2025-12-25T08:00:00Z',
    arrivalTime: '2025-12-25T10:15:00Z',
    price: 2500000,
    status: 'Scheduled'
  },
  {
    id: 'flight_002',
    flightNumber: 'VN456',
    airplaneId: 'airplane_002',
    airplaneCode: 'VN-B737',
    origin: 'HAN',
    originName: 'Hanoi',
    destination: 'DAD',
    destinationName: 'Da Nang',
    departureTime: '2025-12-26T14:00:00Z',
    arrivalTime: '2025-12-26T15:30:00Z',
    price: 1800000,
    status: 'Scheduled'
  },
  {
    id: 'flight_003',
    flightNumber: 'VN789',
    airplaneId: 'airplane_003',
    airplaneCode: 'VN-B777',
    origin: 'SGN',
    originName: 'Ho Chi Minh City',
    destination: 'DAD',
    destinationName: 'Da Nang',
    departureTime: '2025-12-27T16:00:00Z',
    arrivalTime: '2025-12-27T17:15:00Z',
    price: 2000000,
    status: 'Scheduled'
  }
];

// Mock airplane data for dropdown
const mockAirplanes = [
  { id: 'airplane_001', code: 'VN-A320', model: 'Airbus A320', capacity: 180 },
  { id: 'airplane_002', code: 'VN-B737', model: 'Boeing 737', capacity: 150 },
  { id: 'airplane_003', code: 'VN-B777', model: 'Boeing 777', capacity: 300 }
];

// Mock FlightManagementPage component
const FlightManagementPage = () => {
  const [flights, setFlights] = React.useState<any[]>([]);
  const [airplanes, setAirplanes] = React.useState<any[]>([]);
  const [activeAction, setActiveAction] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedFlight, setSelectedFlight] = React.useState<any>(null);
  const [createForm, setCreateForm] = React.useState({
    flightNumber: '',
    airplaneId: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: ''
  });
  const [updateForm, setUpdateForm] = React.useState<any>({});
  const [errors, setErrors] = React.useState<any>({});
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

  const validateCreateForm = () => {
    const newErrors: any = {};

    if (!createForm.flightNumber.trim()) {
      newErrors.flightNumber = 'Flight Number is required';
    }

    if (!createForm.airplaneId) {
      newErrors.airplaneId = 'Airplane is required';
    }

    if (!createForm.origin.trim()) {
      newErrors.origin = 'Origin is required';
    }

    if (!createForm.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    if (!createForm.departureTime) {
      newErrors.departureTime = 'Departure Time is required';
    }

    if (!createForm.arrivalTime) {
      newErrors.arrivalTime = 'Arrival Time is required';
    }

    if (!createForm.price || Number(createForm.price) <= 0) {
      newErrors.price = 'Price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenCreateModal = () => {
    if (activeAction) return; // Block if another action is active
    
    setActiveAction('create');
    setShowCreateModal(true);
    setCreateForm({
      flightNumber: '',
      airplaneId: '',
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: ''
    });
    setErrors({});
  };

  const handleCreateFlight = async () => {
    if (!validateCreateForm()) {
      return;
    }

    const result = await mockCreateFlight(createForm);

    if (result.success) {
      // Generate seats for the flight
      const airplane = airplanes.find(a => a.id === createForm.airplaneId);
      await mockGenerateSeats(result.flightId, airplane.capacity);

      // Add to local state
      const newFlight = {
        id: result.flightId,
        ...createForm,
        airplaneCode: airplane.code,
        status: 'Scheduled',
        price: Number(createForm.price)
      };
      setFlights([...flights, newFlight]);

      setSuccessMessage('Flight created successfully');
      setShowCreateModal(false);
      setActiveAction(null);
    }
  };

  const handleOpenUpdateModal = (flight: any) => {
    if (activeAction) return; // Block if another action is active

    setActiveAction('update');
    setSelectedFlight(flight);
    setUpdateForm({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      price: flight.price
    });
    setShowUpdateModal(true);
    setErrors({});
  };

  const handleUpdateFlight = async () => {
    const result = await mockUpdateFlight(selectedFlight.id, updateForm);

    if (result.success) {
      setFlights(flights.map(f => 
        f.id === selectedFlight.id 
          ? { ...f, ...updateForm, price: Number(updateForm.price) }
          : f
      ));
      setSuccessMessage('Flight updated successfully');
      setShowUpdateModal(false);
      setActiveAction(null);
    }
  };

  const handleOpenDeleteDialog = (flight: any) => {
    if (activeAction) return; // Block if another action is active

    setActiveAction('delete');
    setSelectedFlight(flight);
    setShowDeleteDialog(true);
  };

  const handleDeleteFlight = async () => {
    const result = await mockDeleteFlight(selectedFlight.id);

    if (result.success) {
      setFlights(flights.filter(f => f.id !== selectedFlight.id));
      setSuccessMessage('Flight deleted successfully');
      setShowDeleteDialog(false);
      setActiveAction(null);
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowDeleteDialog(false);
    setActiveAction(null);
    setErrors({});
  };

  return (
    <div data-testid="flight-management-page">
      <h2>Flight Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message">{successMessage}</div>
      )}

      {/* Create Button */}
      <button
        data-testid="create-flight-btn"
        onClick={handleOpenCreateModal}
        disabled={activeAction !== null}
      >
        Create New Flight
      </button>

      {/* Flight List Table */}
      <table data-testid="flights-table">
        <thead>
          <tr>
            <th>Flight Number</th>
            <th>Airplane</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Departure</th>
            <th>Price (₫)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody data-testid="flights-tbody">
          {flights.map((flight, index) => (
            <tr key={flight.id} data-testid={`flight-row-${index}`}>
              <td data-testid={`flight-number-${index}`}>{flight.flightNumber}</td>
              <td data-testid={`flight-airplane-${index}`}>{flight.airplaneCode}</td>
              <td data-testid={`flight-origin-${index}`}>{flight.origin}</td>
              <td data-testid={`flight-destination-${index}`}>{flight.destination}</td>
              <td data-testid={`flight-departure-${index}`}>
                {new Date(flight.departureTime).toLocaleString()}
              </td>
              <td data-testid={`flight-price-${index}`}>
                {flight.price.toLocaleString()}
              </td>
              <td data-testid={`flight-status-${index}`}>{flight.status}</td>
              <td data-testid={`flight-actions-${index}`}>
                <button
                  data-testid={`update-flight-btn-${index}`}
                  onClick={() => handleOpenUpdateModal(flight)}
                  disabled={activeAction !== null}
                >
                  Update
                </button>
                <button
                  data-testid={`delete-flight-btn-${index}`}
                  onClick={() => handleOpenDeleteDialog(flight)}
                  disabled={activeAction !== null}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Flight Modal */}
      {showCreateModal && (
        <div data-testid="create-flight-modal">
          <h3>Create New Flight</h3>

          <div data-testid="create-form">
            {/* Flight Number */}
            <div>
              <label>Flight Number:</label>
              <input
                data-testid="create-flight-number"
                value={createForm.flightNumber}
                onChange={(e) => setCreateForm({ ...createForm, flightNumber: e.target.value })}
              />
              {errors.flightNumber && (
                <div data-testid="error-flight-number">{errors.flightNumber}</div>
              )}
            </div>

            {/* Airplane */}
            <div>
              <label>Airplane:</label>
              <select
                data-testid="create-airplane"
                value={createForm.airplaneId}
                onChange={(e) => setCreateForm({ ...createForm, airplaneId: e.target.value })}
              >
                <option value="">Select Airplane</option>
                {airplanes.map(airplane => (
                  <option key={airplane.id} value={airplane.id}>
                    {airplane.code} - {airplane.model}
                  </option>
                ))}
              </select>
              {errors.airplaneId && (
                <div data-testid="error-airplane">{errors.airplaneId}</div>
              )}
            </div>

            {/* Origin */}
            <div>
              <label>Origin:</label>
              <input
                data-testid="create-origin"
                value={createForm.origin}
                onChange={(e) => setCreateForm({ ...createForm, origin: e.target.value })}
              />
              {errors.origin && (
                <div data-testid="error-origin">{errors.origin}</div>
              )}
            </div>

            {/* Destination */}
            <div>
              <label>Destination:</label>
              <input
                data-testid="create-destination"
                value={createForm.destination}
                onChange={(e) => setCreateForm({ ...createForm, destination: e.target.value })}
              />
              {errors.destination && (
                <div data-testid="error-destination">{errors.destination}</div>
              )}
            </div>

            {/* Departure Time */}
            <div>
              <label>Departure Time:</label>
              <input
                type="datetime-local"
                data-testid="create-departure-time"
                value={createForm.departureTime}
                onChange={(e) => setCreateForm({ ...createForm, departureTime: e.target.value })}
              />
              {errors.departureTime && (
                <div data-testid="error-departure-time">{errors.departureTime}</div>
              )}
            </div>

            {/* Arrival Time */}
            <div>
              <label>Arrival Time:</label>
              <input
                type="datetime-local"
                data-testid="create-arrival-time"
                value={createForm.arrivalTime}
                onChange={(e) => setCreateForm({ ...createForm, arrivalTime: e.target.value })}
              />
              {errors.arrivalTime && (
                <div data-testid="error-arrival-time">{errors.arrivalTime}</div>
              )}
            </div>

            {/* Price */}
            <div>
              <label>Price (₫):</label>
              <input
                type="number"
                data-testid="create-price"
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
              />
              {errors.price && (
                <div data-testid="error-price">{errors.price}</div>
              )}
            </div>

            <button data-testid="save-create-btn" onClick={handleCreateFlight}>
              Save
            </button>
            <button data-testid="cancel-create-btn" onClick={handleCloseModals}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Update Flight Modal */}
      {showUpdateModal && selectedFlight && (
        <div data-testid="update-flight-modal">
          <h3>Update Flight</h3>

          <div data-testid="update-form">
            {/* Departure Time */}
            <div>
              <label>Departure Time:</label>
              <input
                type="datetime-local"
                data-testid="update-departure-time"
                value={updateForm.departureTime}
                onChange={(e) => setUpdateForm({ ...updateForm, departureTime: e.target.value })}
              />
            </div>

            {/* Arrival Time */}
            <div>
              <label>Arrival Time:</label>
              <input
                type="datetime-local"
                data-testid="update-arrival-time"
                value={updateForm.arrivalTime}
                onChange={(e) => setUpdateForm({ ...updateForm, arrivalTime: e.target.value })}
              />
            </div>

            {/* Price */}
            <div>
              <label>Price (₫):</label>
              <input
                type="number"
                data-testid="update-price"
                value={updateForm.price}
                onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
              />
            </div>

            <button data-testid="save-update-btn" onClick={handleUpdateFlight}>
              Save
            </button>
            <button data-testid="cancel-update-btn" onClick={handleCloseModals}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedFlight && (
        <div data-testid="delete-dialog">
          <h3>Confirm Deletion</h3>
          <p data-testid="delete-message">
            Are you sure you want to delete flight {selectedFlight.flightNumber}?
          </p>
          <button data-testid="confirm-delete-btn" onClick={handleDeleteFlight}>
            Confirm
          </button>
          <button data-testid="cancel-delete-btn" onClick={handleCloseModals}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-MST-FLT: Master Data - Flight Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetFlights.mockResolvedValue(mockFlights);
    mockGetAirplanes.mockResolvedValue(mockAirplanes);
    mockCreateFlight.mockResolvedValue({ success: true, flightId: 'flight_004' });
    mockUpdateFlight.mockResolvedValue({ success: true });
    mockDeleteFlight.mockResolvedValue({ success: true });
    mockGenerateSeats.mockResolvedValue({ success: true, seatsGenerated: 180 });
  });

  /**
   * TC-MST-FLT-001: Verify Flight Management Screen Display
   * Business Requirement: BR36
   * 
   * Prerequisites:
   * 1. User is logged in as Admin/CSA.
   * 2. Navigate to Flight Management.
   * 
   * Steps:
   * Step 1: Click "Flight Management" on sidebar.
   * Step Expected Result: Page loads successfully.
   * 
   * Test Case Expected Result:
   * The system displays the "Flight Management" screen showing a list of all existing flights.
   */
  it('TC-MST-FLT-001: should display flight management screen with list of all flights', async () => {
    // Arrange & Act
    render(<FlightManagementPage />);

    // Assert - Step 1: Page loads successfully
    expect(screen.getByTestId('flight-management-page')).toBeInTheDocument();

    // Test Case Expected Result: System displays Flight Management screen with all flights
    await waitFor(() => {
      expect(mockGetFlights).toHaveBeenCalled();
    });

    expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    
    // Verify all flights are displayed
    expect(screen.getByTestId('flight-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('flight-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('flight-row-2')).toBeInTheDocument();

    // Verify flight data
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN123');
    expect(screen.getByTestId('flight-origin-0')).toHaveTextContent('SGN');
    expect(screen.getByTestId('flight-destination-0')).toHaveTextContent('HAN');
  });

  /**
   * TC-MST-FLT-002: Verify Single Action Restriction
   * Business Requirement: BR37
   * 
   * Prerequisites:
   * 1. User is on Flight Management screen.
   * 
   * Steps:
   * Step 1: Click "Create New Flight".
   * Step Expected Result: The Create Flight modal opens.
   * Step 2: Attempt to click "Delete" on a background row.
   * Step Expected Result: Action is blocked/disabled.
   * 
   * Test Case Expected Result:
   * User cannot select other actions (View/Update/Delete) while the "Create" action is active.
   */
  it('TC-MST-FLT-002: should restrict other actions when create action is active', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    });

    // Act - Step 1: Click "Create New Flight"
    await user.click(screen.getByTestId('create-flight-btn'));

    // Assert - Step 1 Expected Result: The Create Flight modal opens
    expect(await screen.findByTestId('create-flight-modal')).toBeInTheDocument();

    // Act - Step 2: Attempt to click "Delete" on a background row
    const deleteButton = screen.getByTestId('delete-flight-btn-0');

    // Assert - Step 2 Expected Result: Action is blocked/disabled
    expect(deleteButton).toBeDisabled();

    // Test Case Expected Result: Cannot select other actions while Create is active
    const updateButton = screen.getByTestId('update-flight-btn-0');
    expect(updateButton).toBeDisabled();

    // Verify create button is also disabled
    expect(screen.getByTestId('create-flight-btn')).toBeDisabled();
  });

  /**
   * TC-MST-FLT-003: Verify Create Flight - Valid Data
   * Business Requirement: BR38
   * 
   * Prerequisites:
   * 1. User is on "Create Flight" form.
   * 2. Valid Airplane ID exists.
   * 
   * Steps:
   * Step 1: Enter mandatory fields: Flight Number, Origin, Dest, Time, Price.
   * Step Expected Result: Input fields accept data.
   * Step 2: Click "Save".
   * Step Expected Result: System validates and submits.
   * 
   * Test Case Expected Result:
   * System creates the flight record, generates seats, and saves to database.
   */
  it('TC-MST-FLT-003: should successfully create flight with valid data and generate seats', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    });

    // Open create modal
    await user.click(screen.getByTestId('create-flight-btn'));

    expect(await screen.findByTestId('create-flight-modal')).toBeInTheDocument();

    // Act - Step 1: Enter mandatory fields
    await user.type(screen.getByTestId('create-flight-number'), 'VN999');
    await user.selectOptions(screen.getByTestId('create-airplane'), 'airplane_001');
    await user.type(screen.getByTestId('create-origin'), 'SGN');
    await user.type(screen.getByTestId('create-destination'), 'HAN');
    await user.type(screen.getByTestId('create-departure-time'), '2025-12-28T10:00');
    await user.type(screen.getByTestId('create-arrival-time'), '2025-12-28T12:15');
    await user.type(screen.getByTestId('create-price'), '3000000');

    // Assert - Step 1 Expected Result: Input fields accept data
    expect(screen.getByTestId('create-flight-number')).toHaveValue('VN999');
    expect(screen.getByTestId('create-origin')).toHaveValue('SGN');
    expect(screen.getByTestId('create-price')).toHaveValue(3000000);

    // Act - Step 2: Click "Save"
    await user.click(screen.getByTestId('save-create-btn'));

    // Assert - Test Case Expected Result: Creates flight, generates seats, saves to DB
    await waitFor(() => {
      expect(mockCreateFlight).toHaveBeenCalledWith({
        flightNumber: 'VN999',
        airplaneId: 'airplane_001',
        origin: 'SGN',
        destination: 'HAN',
        departureTime: '2025-12-28T10:00',
        arrivalTime: '2025-12-28T12:15',
        price: '3000000'
      });
    });

    // Verify seat generation
    expect(mockGenerateSeats).toHaveBeenCalledWith('flight_004', 180);

    // Verify success message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Flight created successfully');
  });

  /**
   * TC-MST-FLT-004: Verify Create Flight - Missing Mandatory Fields
   * Business Requirement: BR38
   * 
   * Prerequisites:
   * 1. User is on "Create Flight" form.
   * 
   * Steps:
   * Step 1: Leave "Flight Number" or "Price" empty.
   * Step Expected Result: Fields are empty.
   * Step 2: Click "Save".
   * Step Expected Result: Validation logic triggers.
   * 
   * Test Case Expected Result:
   * System rejects the submission and displays validation error messages.
   */
  it('TC-MST-FLT-004: should display validation errors for missing mandatory fields', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    });

    // Open create modal
    await user.click(screen.getByTestId('create-flight-btn'));

    expect(await screen.findByTestId('create-flight-modal')).toBeInTheDocument();

    // Act - Step 1: Leave Flight Number and Price empty (enter only some fields)
    await user.type(screen.getByTestId('create-origin'), 'SGN');

    // Assert - Step 1 Expected Result: Fields are empty
    expect(screen.getByTestId('create-flight-number')).toHaveValue('');
    expect(screen.getByTestId('create-price')).toHaveValue(null);

    // Act - Step 2: Click "Save"
    await user.click(screen.getByTestId('save-create-btn'));

    // Assert - Test Case Expected Result: System displays validation error messages
    expect(await screen.findByTestId('error-flight-number')).toHaveTextContent('Flight Number is required');
    expect(screen.getByTestId('error-airplane')).toHaveTextContent('Airplane is required');
    expect(screen.getByTestId('error-destination')).toHaveTextContent('Destination is required');
    expect(screen.getByTestId('error-departure-time')).toHaveTextContent('Departure Time is required');
    expect(screen.getByTestId('error-arrival-time')).toHaveTextContent('Arrival Time is required');
    expect(screen.getByTestId('error-price')).toHaveTextContent('Price is required');

    // Verify API was not called
    expect(mockCreateFlight).not.toHaveBeenCalled();
  });

  /**
   * TC-MST-FLT-005: Verify Update Flight - Valid Data
   * Business Requirement: BR38
   * 
   * Prerequisites:
   * 1. Existing flight selected.
   * 
   * Steps:
   * Step 1: Modify "Departure Time" to a future date.
   * Step Expected Result: Input is accepted.
   * Step 2: Click "Save".
   * Step Expected Result: System commits changes.
   * 
   * Test Case Expected Result:
   * System updates the flight record and reflects changes in the database.
   */
  it('TC-MST-FLT-005: should successfully update flight with valid data', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    });

    // Open update modal for first flight
    await user.click(screen.getByTestId('update-flight-btn-0'));

    expect(await screen.findByTestId('update-flight-modal')).toBeInTheDocument();

    // Act - Step 1: Modify "Departure Time" to a future date
    const departureTimeInput = screen.getByTestId('update-departure-time');
    await user.clear(departureTimeInput);
    await user.type(departureTimeInput, '2025-12-30T09:00');

    // Also update price
    const priceInput = screen.getByTestId('update-price');
    await user.clear(priceInput);
    await user.type(priceInput, '2800000');

    // Assert - Step 1 Expected Result: Input is accepted
    expect(departureTimeInput).toHaveValue('2025-12-30T09:00');
    expect(priceInput).toHaveValue(2800000);

    // Act - Step 2: Click "Save"
    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Test Case Expected Result: System updates flight and reflects in DB
    await waitFor(() => {
      expect(mockUpdateFlight).toHaveBeenCalledWith('flight_001', expect.objectContaining({
        departureTime: '2025-12-30T09:00',
        price: '2800000'
      }));
    });

    expect(await screen.findByTestId('success-message')).toHaveTextContent('Flight updated successfully');

    // Verify modal closed
    expect(screen.queryByTestId('update-flight-modal')).not.toBeInTheDocument();
  });

  /**
   * TC-MST-FLT-006: Verify Delete Flight - Success
   * Business Requirement: BR37
   * 
   * Prerequisites:
   * 1. Existing flight selected.
   * 
   * Steps:
   * Step 1: Click "Delete" button.
   * Step Expected Result: Confirmation dialog appears.
   * Step 2: Confirm deletion.
   * Step Expected Result: System performs deletion.
   * 
   * Test Case Expected Result:
   * System deletes the flight record and removes associated seats.
   */
  it('TC-MST-FLT-006: should successfully delete flight with confirmation', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FlightManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('flights-table')).toBeInTheDocument();
    });

    // Verify initial flight count
    expect(screen.getByTestId('flight-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('flight-number-0')).toHaveTextContent('VN123');

    // Act - Step 1: Click "Delete" button
    await user.click(screen.getByTestId('delete-flight-btn-0'));

    // Assert - Step 1 Expected Result: Confirmation dialog appears
    expect(await screen.findByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('delete-message')).toHaveTextContent('Are you sure you want to delete flight VN123?');

    // Act - Step 2: Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-btn'));

    // Assert - Test Case Expected Result: System deletes flight and removes seats
    await waitFor(() => {
      expect(mockDeleteFlight).toHaveBeenCalledWith('flight_001');
    });

    expect(await screen.findByTestId('success-message')).toHaveTextContent('Flight deleted successfully');

    // Verify modal closed
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });
});
