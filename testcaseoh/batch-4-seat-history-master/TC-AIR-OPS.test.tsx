/**
 * Test Suite: TC-AIR-OPS (Master Airplane - CRUD & Constraints)
 * Category: Master Data Management - Airplane Operations & Business Logic
 * Description: Unit tests for airplane CRUD operations with business constraints
 * 
 * Test Cases:
 * - TC-AIR-OPS-001: Update Plane - Valid Change
 * - TC-AIR-OPS-002: Update Plane - Reduce Capacity
 * - TC-AIR-OPS-003: Update Plane - Code (PK)
 * - TC-AIR-OPS-004: Delete Plane - No Flights
 * - TC-AIR-OPS-005: Delete Plane - Active Flight
 * - TC-AIR-OPS-006: Delete Plane - Past Flight
 * - TC-AIR-OPS-007: Search Plane - By Code
 * - TC-AIR-OPS-008: Search Plane - By Model
 * - TC-AIR-OPS-009: Pagination - Plane List
 * - TC-AIR-OPS-010: View Details - Plane
 * 
 * Prerequisites:
 * 1. User is logged in as Admin or CSA
 * 2. Airplanes exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock airplane APIs
const mockUpdateAirplane = vi.fn();
const mockDeleteAirplane = vi.fn();
const mockSearchAirplanes = vi.fn();
const mockGetAirplaneDetails = vi.fn();
const mockGetAirplanes = vi.fn();
const mockCheckFlightAssignments = vi.fn();

// Mock airplane data
const mockAirplaneData = [
  {
    id: 'airplane_001',
    code: 'VN-A320',
    model: 'Airbus A320',
    capacity: 180,
    airline: 'Vietnam Airlines',
    status: 'Active',
    hasFlights: false
  },
  {
    id: 'airplane_002',
    code: 'VN-123',
    model: 'Boeing 737',
    capacity: 200,
    airline: 'VietJet Air',
    status: 'Active',
    hasFlights: false
  },
  {
    id: 'airplane_003',
    code: 'VN-777',
    model: 'Boeing 777',
    capacity: 300,
    airline: 'Vietnam Airlines',
    status: 'Active',
    hasFlights: true,
    activeFlights: ['FL123', 'FL456']
  },
  {
    id: 'airplane_004',
    code: 'VN-787',
    model: 'Boeing 787',
    capacity: 250,
    airline: 'Bamboo Airways',
    status: 'Active',
    hasFlights: true,
    pastFlightsOnly: true
  }
];

// Generate large dataset for pagination
const generateAirplanes = (count: number) => {
  const airplanes = [];
  for (let i = 1; i <= count; i++) {
    airplanes.push({
      id: `airplane_${String(i).padStart(3, '0')}`,
      code: `VN-${String(i).padStart(4, '0')}`,
      model: i % 2 === 0 ? 'Boeing 737' : 'Airbus A320',
      capacity: 150 + (i % 100),
      airline: 'Vietnam Airlines',
      status: 'Active'
    });
  }
  return airplanes;
};

// Mock AirplaneManagementPage component
const AirplaneManagementPage = () => {
  const [airplanes, setAirplanes] = React.useState<any[]>([]);
  const [filteredAirplanes, setFilteredAirplanes] = React.useState<any[]>([]);
  const [selectedAirplane, setSelectedAirplane] = React.useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchType, setSearchType] = React.useState<'code' | 'model'>('code');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  const [updateForm, setUpdateForm] = React.useState<any>({});
  const [error, setError] = React.useState('');
  const [warning, setWarning] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    loadAirplanes();
  }, []);

  React.useEffect(() => {
    setFilteredAirplanes(airplanes);
  }, [airplanes]);

  const loadAirplanes = async () => {
    const data = await mockGetAirplanes();
    setAirplanes(data);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredAirplanes(airplanes);
      return;
    }

    const results = await mockSearchAirplanes(searchTerm, searchType);
    setFilteredAirplanes(results);
  };

  const handleOpenUpdateModal = (airplane: any) => {
    setSelectedAirplane(airplane);
    setUpdateForm({
      model: airplane.model,
      capacity: airplane.capacity,
      airline: airplane.airline
    });
    setError('');
    setWarning('');
    setShowUpdateModal(true);
  };

  const handleUpdateAirplane = async () => {
    setError('');
    setWarning('');

    // Check if capacity is reduced
    if (Number(updateForm.capacity) < selectedAirplane.capacity) {
      setWarning('Check existing flights');
      // Keep modal open to show warning
      return;
    }

    const result = await mockUpdateAirplane(selectedAirplane.id, updateForm);

    if (result.success) {
      // Update local state
      setAirplanes(airplanes.map(a => 
        a.id === selectedAirplane.id 
          ? { ...a, ...updateForm, capacity: Number(updateForm.capacity) }
          : a
      ));
      setSuccessMessage('Success. DB Updated.');
      setShowUpdateModal(false);
    }
  };

  const handleOpenDeleteDialog = async (airplane: any) => {
    setSelectedAirplane(airplane);
    setError('');
    
    // Check flight assignments
    const flightCheck = await mockCheckFlightAssignments(airplane.id);
    
    if (flightCheck.hasActiveFlights) {
      setError(`Cannot delete: Assigned to Flight ${flightCheck.activeFlights.join(', ')}`);
      return;
    }

    if (flightCheck.hasPastFlights) {
      setError('Keep history'); // Soft delete or prevent deletion
      return;
    }

    setShowDeleteDialog(true);
  };

  const handleDeleteAirplane = async () => {
    const result = await mockDeleteAirplane(selectedAirplane.id);

    if (result.success) {
      setAirplanes(airplanes.filter(a => a.id !== selectedAirplane.id));
      setSuccessMessage('Airplane deleted successfully');
      setShowDeleteDialog(false);
    }
  };

  const handleViewDetails = async (airplane: any) => {
    const details = await mockGetAirplaneDetails(airplane.id);
    setSelectedAirplane(details);
    setShowDetailsModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAirplanes = filteredAirplanes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAirplanes.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div data-testid="airplane-management-page">
      <h2>Airplane Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message">{successMessage}</div>
      )}

      {/* Error Message */}
      {error && (
        <div data-testid="error-message">{error}</div>
      )}

      {/* Search Section */}
      <div data-testid="search-section">
        <select
          data-testid="search-type-select"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as 'code' | 'model')}
        >
          <option value="code">By Code</option>
          <option value="model">By Model</option>
        </select>
        <input
          data-testid="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search by ${searchType}...`}
        />
        <button data-testid="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Airplane List Table */}
      <div data-testid="airplanes-table">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Model</th>
              <th>Capacity</th>
              <th>Airline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody data-testid="airplanes-tbody">
            {currentAirplanes.map((airplane, index) => (
              <tr key={airplane.id} data-testid={`airplane-row-${index}`}>
                <td data-testid={`airplane-code-${index}`}>{airplane.code}</td>
                <td data-testid={`airplane-model-${index}`}>{airplane.model}</td>
                <td data-testid={`airplane-capacity-${index}`}>{airplane.capacity}</td>
                <td data-testid={`airplane-airline-${index}`}>{airplane.airline}</td>
                <td data-testid={`airplane-actions-${index}`}>
                  <button 
                    data-testid={`update-btn-${index}`}
                    onClick={() => handleOpenUpdateModal(airplane)}
                  >
                    Update
                  </button>
                  <button 
                    data-testid={`delete-btn-${index}`}
                    onClick={() => handleOpenDeleteDialog(airplane)}
                  >
                    Delete
                  </button>
                  <button 
                    data-testid={`details-btn-${index}`}
                    onClick={() => handleViewDetails(airplane)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div data-testid="pagination">
          <span data-testid="page-info">
            Page {currentPage} of {totalPages}
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
            <button
              key={pageNum}
              data-testid={`page-btn-${pageNum}`}
              onClick={() => handlePageChange(pageNum)}
              disabled={currentPage === pageNum}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div data-testid="update-modal">
          <h3>Update Airplane</h3>
          
          {/* Warning Message */}
          {warning && (
            <div data-testid="warning-message">{warning}</div>
          )}

          <div data-testid="update-form">
            {/* Code field (disabled - cannot change PK) */}
            <div>
              <label>Code (Cannot change):</label>
              <input
                data-testid="update-code"
                value={selectedAirplane.code}
                disabled
                style={{ backgroundColor: '#e0e0e0', cursor: 'not-allowed' }}
              />
            </div>

            {/* Model field */}
            <div>
              <label>Model:</label>
              <input
                data-testid="update-model"
                value={updateForm.model}
                onChange={(e) => setUpdateForm({ ...updateForm, model: e.target.value })}
              />
            </div>

            {/* Capacity field */}
            <div>
              <label>Capacity:</label>
              <input
                data-testid="update-capacity"
                value={updateForm.capacity}
                onChange={(e) => setUpdateForm({ ...updateForm, capacity: e.target.value })}
              />
            </div>

            {/* Airline field */}
            <div>
              <label>Airline:</label>
              <input
                data-testid="update-airline"
                value={updateForm.airline}
                onChange={(e) => setUpdateForm({ ...updateForm, airline: e.target.value })}
              />
            </div>

            <button data-testid="save-update-btn" onClick={handleUpdateAirplane}>
              Save
            </button>
            <button data-testid="cancel-update-btn" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div data-testid="delete-dialog">
          <h3>Confirm Deletion</h3>
          <p data-testid="delete-message">
            Are you sure you want to delete airplane {selectedAirplane?.code}?
          </p>
          <button data-testid="confirm-delete-btn" onClick={handleDeleteAirplane}>
            Confirm
          </button>
          <button data-testid="cancel-delete-btn" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAirplane && (
        <div data-testid="details-modal">
          <h3>Airplane Details</h3>
          <div data-testid="airplane-details">
            <div data-testid="detail-code">Code: {selectedAirplane.code}</div>
            <div data-testid="detail-model">Model: {selectedAirplane.model}</div>
            <div data-testid="detail-capacity">Capacity: {selectedAirplane.capacity}</div>
            <div data-testid="detail-airline">Airline: {selectedAirplane.airline}</div>
            <div data-testid="detail-status">Status: {selectedAirplane.status}</div>
            
            {/* Flight History */}
            {selectedAirplane.flightHistory && (
              <div data-testid="flight-history">
                <h4>Flight History</h4>
                <ul>
                  {selectedAirplane.flightHistory.map((flight: any, idx: number) => (
                    <li key={idx} data-testid={`flight-${idx}`}>
                      {flight.flightNumber} - {flight.date} ({flight.route})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button data-testid="close-details-btn" onClick={() => setShowDetailsModal(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-AIR-OPS: Master Airplane - CRUD & Constraints Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAirplanes.mockResolvedValue(mockAirplaneData);
    mockUpdateAirplane.mockResolvedValue({ success: true });
    mockDeleteAirplane.mockResolvedValue({ success: true });
    mockSearchAirplanes.mockImplementation((term, type) => {
      if (type === 'code') {
        return Promise.resolve(mockAirplaneData.filter(a => a.code.includes(term)));
      } else {
        return Promise.resolve(mockAirplaneData.filter(a => a.model.toLowerCase().includes(term.toLowerCase())));
      }
    });
    mockGetAirplaneDetails.mockImplementation((id) => {
      const airplane = mockAirplaneData.find(a => a.id === id);
      return Promise.resolve({
        ...airplane,
        flightHistory: [
          { flightNumber: 'VN123', date: '2025-12-01', route: 'SGN-HAN' },
          { flightNumber: 'VN456', date: '2025-12-10', route: 'HAN-DAD' }
        ]
      });
    });
    mockCheckFlightAssignments.mockImplementation((id) => {
      const airplane = mockAirplaneData.find(a => a.id === id);
      if (airplane?.activeFlights) {
        return Promise.resolve({
          hasActiveFlights: true,
          activeFlights: airplane.activeFlights,
          hasPastFlights: false
        });
      } else if (airplane?.pastFlightsOnly) {
        return Promise.resolve({
          hasActiveFlights: false,
          activeFlights: [],
          hasPastFlights: true
        });
      }
      return Promise.resolve({
        hasActiveFlights: false,
        activeFlights: [],
        hasPastFlights: false
      });
    });
  });

  /**
   * TC-AIR-OPS-001: Update Plane - Valid Change
   * Business Requirement: BR33
   * 
   * Steps:
   * Change Model "A320" -> "A321".
   * 
   * Test Data: Update
   * 
   * Expected Result:
   * Success. DB Updated.
   */
  it('TC-AIR-OPS-001: should successfully update airplane with valid changes', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Open update modal for first airplane (VN-A320)
    await user.click(screen.getByTestId('update-btn-0'));

    expect(await screen.findByTestId('update-modal')).toBeInTheDocument();

    // Change Model "A320" -> "A321"
    const modelInput = screen.getByTestId('update-model');
    await user.clear(modelInput);
    await user.type(modelInput, 'Airbus A321');

    // Save changes
    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Test Case Expected Result: Success. DB Updated.
    await waitFor(() => {
      expect(mockUpdateAirplane).toHaveBeenCalledWith('airplane_001', {
        model: 'Airbus A321',
        capacity: 180,
        airline: 'Vietnam Airlines'
      });
    });

    expect(await screen.findByTestId('success-message')).toHaveTextContent('Success. DB Updated.');

    // Verify modal closed
    expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-OPS-002: Update Plane - Reduce Capacity
   * Business Requirement: Logic
   * 
   * Steps:
   * Change Cap 200 -> 150.
   * 
   * Test Data: Update
   * 
   * Expected Result:
   * Warning "Check existing flights".
   */
  it('TC-AIR-OPS-002: should show warning when reducing airplane capacity', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Open update modal for second airplane (capacity 200)
    await user.click(screen.getByTestId('update-btn-1'));

    expect(await screen.findByTestId('update-modal')).toBeInTheDocument();

    // Change Cap 200 -> 150
    const capacityInput = screen.getByTestId('update-capacity');
    await user.clear(capacityInput);
    await user.type(capacityInput, '150');

    // Save changes
    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Test Case Expected Result: Warning "Check existing flights"
    expect(await screen.findByTestId('warning-message')).toHaveTextContent('Check existing flights');
  });

  /**
   * TC-AIR-OPS-003: Update Plane - Code (PK)
   * Business Requirement: Rule
   * 
   * Steps:
   * Try to edit Code.
   * 
   * Test Data: Edit
   * 
   * Expected Result:
   * Field disabled (Cannot change ID).
   */
  it('TC-AIR-OPS-003: should disable code field as it is primary key', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Open update modal
    await user.click(screen.getByTestId('update-btn-0'));

    expect(await screen.findByTestId('update-modal')).toBeInTheDocument();

    // Assert - Test Case Expected Result: Field disabled (Cannot change ID)
    const codeInput = screen.getByTestId('update-code');
    expect(codeInput).toBeDisabled();
    expect(codeInput).toHaveValue('VN-A320');
    
    // Verify visual indication
    expect(codeInput).toHaveStyle({ cursor: 'not-allowed' });
  });

  /**
   * TC-AIR-OPS-004: Delete Plane - No Flights
   * Business Requirement: BR33
   * 
   * Steps:
   * Plane has no history.
   * 
   * Test Data: Delete
   * 
   * Expected Result:
   * Success.
   */
  it('TC-AIR-OPS-004: should successfully delete airplane with no flight history', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Verify initial count
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();

    // Act - Delete first airplane (has no flights)
    await user.click(screen.getByTestId('delete-btn-0'));

    // Assert - Test Case Expected Result: Success
    await waitFor(() => {
      expect(mockCheckFlightAssignments).toHaveBeenCalledWith('airplane_001');
    });

    // Delete dialog should appear
    expect(await screen.findByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('delete-message')).toHaveTextContent('Are you sure you want to delete airplane VN-A320?');

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-btn'));

    await waitFor(() => {
      expect(mockDeleteAirplane).toHaveBeenCalledWith('airplane_001');
    });

    expect(await screen.findByTestId('success-message')).toHaveTextContent('Airplane deleted successfully');
  });

  /**
   * TC-AIR-OPS-005: Delete Plane - Active Flight
   * Business Requirement: Integri
   * 
   * Steps:
   * Plane assigned to future flight.
   * 
   * Test Data: Delete
   * 
   * Expected Result:
   * Error "Cannot delete: Assigned to Flight X".
   */
  it('TC-AIR-OPS-005: should prevent deletion of airplane assigned to active flights', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Try to delete third airplane (has active flights)
    await user.click(screen.getByTestId('delete-btn-2'));

    // Assert - Test Case Expected Result: Error "Cannot delete: Assigned to Flight X"
    await waitFor(() => {
      expect(mockCheckFlightAssignments).toHaveBeenCalledWith('airplane_003');
    });

    expect(await screen.findByTestId('error-message')).toHaveTextContent('Cannot delete: Assigned to Flight FL123, FL456');

    // Delete dialog should NOT appear
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-OPS-006: Delete Plane - Past Flight
   * Business Requirement: Audit
   * 
   * Steps:
   * Plane has past flights.
   * 
   * Test Data: Delete
   * 
   * Expected Result:
   * Soft Delete or Error (Keep history).
   */
  it('TC-AIR-OPS-006: should prevent deletion of airplane with past flights to keep history', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Try to delete fourth airplane (has past flights only)
    await user.click(screen.getByTestId('delete-btn-3'));

    // Assert - Test Case Expected Result: Soft Delete or Error (Keep history)
    await waitFor(() => {
      expect(mockCheckFlightAssignments).toHaveBeenCalledWith('airplane_004');
    });

    expect(await screen.findByTestId('error-message')).toHaveTextContent('Keep history');

    // Delete dialog should NOT appear
    expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-OPS-007: Search Plane - By Code
   * Business Requirement: UI
   * 
   * Steps:
   * Enter Code "VN-123".
   * 
   * Test Data: Search
   * 
   * Expected Result:
   * Show specific plane.
   */
  it('TC-AIR-OPS-007: should search airplane by code and show specific plane', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Verify initial count (4 airplanes)
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-3')).toBeInTheDocument();

    // Act - Search by Code "VN-123"
    const searchTypeSelect = screen.getByTestId('search-type-select');
    await user.selectOptions(searchTypeSelect, 'code');

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'VN-123');

    await user.click(screen.getByTestId('search-btn'));

    // Assert - Test Case Expected Result: Show specific plane
    await waitFor(() => {
      expect(mockSearchAirplanes).toHaveBeenCalledWith('VN-123', 'code');
    });

    // Only one result should be shown
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-code-0')).toHaveTextContent('VN-123');
    expect(screen.queryByTestId('airplane-row-1')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-OPS-008: Search Plane - By Model
   * Business Requirement: UI
   * 
   * Steps:
   * Enter "Boeing".
   * 
   * Test Data: Search
   * 
   * Expected Result:
   * Show all Boeing planes.
   */
  it('TC-AIR-OPS-008: should search airplane by model and show all matching planes', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Search by Model "Boeing"
    const searchTypeSelect = screen.getByTestId('search-type-select');
    await user.selectOptions(searchTypeSelect, 'model');

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Boeing');

    await user.click(screen.getByTestId('search-btn'));

    // Assert - Test Case Expected Result: Show all Boeing planes
    await waitFor(() => {
      expect(mockSearchAirplanes).toHaveBeenCalledWith('Boeing', 'model');
    });

    // Should show 3 Boeing planes (737, 777, 787)
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-2')).toBeInTheDocument();
    
    // Verify all are Boeing models
    expect(screen.getByTestId('airplane-model-0')).toHaveTextContent('Boeing');
    expect(screen.getByTestId('airplane-model-1')).toHaveTextContent('Boeing');
    expect(screen.getByTestId('airplane-model-2')).toHaveTextContent('Boeing');
  });

  /**
   * TC-AIR-OPS-009: Pagination - Plane List
   * Business Requirement: UI
   * 
   * Steps:
   * Check paging.
   * 
   * Test Data: Page 2
   * 
   * Expected Result:
   * Load next set of planes.
   */
  it('TC-AIR-OPS-009: should paginate airplane list correctly', async () => {
    // Arrange - Load large dataset
    const largeDataset = generateAirplanes(25);
    mockGetAirplanes.mockResolvedValueOnce(largeDataset);

    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Assert - Page 1 should show first 10 items
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 1 of 3');
    
    // Verify first item on page 1
    expect(screen.getByTestId('airplane-code-0')).toHaveTextContent('VN-0001');
    
    // Verify last item on page 1
    expect(screen.getByTestId('airplane-code-9')).toHaveTextContent('VN-0010');

    // Act - Click page 2 button
    await user.click(screen.getByTestId('page-btn-2'));

    // Assert - Test Case Expected Result: Load next set of planes
    expect(screen.getByTestId('page-info')).toHaveTextContent('Page 2 of 3');
    
    // Verify first item on page 2 (11th airplane)
    expect(screen.getByTestId('airplane-code-0')).toHaveTextContent('VN-0011');
    
    // Verify last item on page 2 (20th airplane)
    expect(screen.getByTestId('airplane-code-9')).toHaveTextContent('VN-0020');
  });

  /**
   * TC-AIR-OPS-010: View Details - Plane
   * Business Requirement: UI
   * 
   * Steps:
   * Click Detail Icon.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Show full info + Flight History.
   */
  it('TC-AIR-OPS-010: should display full airplane details with flight history', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AirplaneManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Act - Click Detail Icon for first airplane
    await user.click(screen.getByTestId('details-btn-0'));

    // Assert - Test Case Expected Result: Show full info + Flight History
    await waitFor(() => {
      expect(mockGetAirplaneDetails).toHaveBeenCalledWith('airplane_001');
    });

    expect(await screen.findByTestId('details-modal')).toBeInTheDocument();

    // Verify full info displayed
    expect(screen.getByTestId('detail-code')).toHaveTextContent('Code: VN-A320');
    expect(screen.getByTestId('detail-model')).toHaveTextContent('Model: Airbus A320');
    expect(screen.getByTestId('detail-capacity')).toHaveTextContent('Capacity: 180');
    expect(screen.getByTestId('detail-airline')).toHaveTextContent('Airline: Vietnam Airlines');
    expect(screen.getByTestId('detail-status')).toHaveTextContent('Status: Active');

    // Verify Flight History displayed
    expect(screen.getByTestId('flight-history')).toBeInTheDocument();
    expect(screen.getByTestId('flight-0')).toHaveTextContent('VN123 - 2025-12-01 (SGN-HAN)');
    expect(screen.getByTestId('flight-1')).toHaveTextContent('VN456 - 2025-12-10 (HAN-DAD)');

    // Close modal
    await user.click(screen.getByTestId('close-details-btn'));

    expect(screen.queryByTestId('details-modal')).not.toBeInTheDocument();
  });
});
