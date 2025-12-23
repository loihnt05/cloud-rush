/**
 * Test Suite: TC-MST-AIR (Master Data - Airplane Management)
 * Category: Master Data Management - Airplane CRUD
 * Description: Unit tests for managing airplane master data
 * 
 * Test Cases:
 * - TC-MST-AIR-001: Verify Airplane Management Screen
 * - TC-MST-AIR-002: Verify Single Action Restriction
 * - TC-MST-AIR-003: Verify Create Airplane - Valid Data
 * - TC-MST-AIR-004: Verify Create Airplane - Missing Mandatory Fields
 * - TC-MST-AIR-005: Verify Update Airplane - Success
 * - TC-MST-AIR-006: Verify Delete Airplane - Success
 * 
 * Prerequisites:
 * 1. User is logged in as Admin or CSA
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock airplane APIs
const mockGetAllAirplanes = vi.fn();
const mockCreateAirplane = vi.fn();
const mockUpdateAirplane = vi.fn();
const mockDeleteAirplane = vi.fn();

// Mock airplane data
const mockAirplaneList = [
  {
    id: 'airplane_001',
    code: 'VN-A123',
    model: 'Boeing 737',
    capacity: 180,
    airline: 'Vietnam Airlines',
    status: 'Active'
  },
  {
    id: 'airplane_002',
    code: 'VN-A456',
    model: 'Airbus A320',
    capacity: 150,
    airline: 'VietJet Air',
    status: 'Active'
  },
  {
    id: 'airplane_003',
    code: 'VN-A789',
    model: 'Boeing 787',
    capacity: 250,
    airline: 'Bamboo Airways',
    status: 'Maintenance'
  }
];

// Mock AirplaneManagement component
const AirplaneManagement = ({ userRole }: { userRole: string }) => {
  const [airplanes, setAirplanes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [activeAction, setActiveAction] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedAirplane, setSelectedAirplane] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    code: '',
    model: '',
    capacity: '',
    airline: ''
  });
  const [errors, setErrors] = React.useState<any>({});
  const [successMessage, setSuccessMessage] = React.useState('');

  const loadAirplanes = async () => {
    setLoading(true);
    
    // Step 1: Page loads
    const data = await mockGetAllAirplanes();
    setAirplanes(data);
    
    setLoading(false);
  };

  React.useEffect(() => {
    loadAirplanes();
  }, []);

  const handleOpenCreateModal = () => {
    // Step 1: Try to click "Create" button while another action is active
    if (activeAction) {
      // System prevents initiating a second parallel action
      return;
    }
    
    setActiveAction('create');
    setFormData({ code: '', model: '', capacity: '', airline: '' });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleOpenUpdateModal = (airplane: any) => {
    // Step 1: Initiate an action (e.g., Click "Update" on a plane)
    if (activeAction) {
      // System prevents initiating a second parallel action
      return;
    }
    
    setActiveAction('update');
    setSelectedAirplane(airplane);
    setFormData({
      code: airplane.code,
      model: airplane.model,
      capacity: airplane.capacity.toString(),
      airline: airplane.airline
    });
    setErrors({});
    setShowUpdateModal(true);
  };

  const handleOpenDeleteDialog = (airplane: any) => {
    // Step 1: Click "Delete" button
    if (activeAction) {
      return;
    }
    
    setActiveAction('delete');
    setSelectedAirplane(airplane);
    setShowDeleteDialog(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowUpdateModal(false);
    setShowDeleteDialog(false);
    setActiveAction(null);
    setSelectedAirplane(null);
    setFormData({ code: '', model: '', capacity: '', airline: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Step 1: Leave "Model" or "Capacity" empty
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    }
    if (!formData.airline.trim()) {
      newErrors.airline = 'Airline is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAirplane = async () => {
    // Step 2: Click "Save" / "Create"
    // Step Expected Result: Validation logic triggers
    if (!validateForm()) {
      // System rejects the action and displays validation errors for missing fields
      return;
    }
    
    // Step Expected Result: System validates and commits to DB
    const newAirplane = await mockCreateAirplane({
      code: formData.code,
      model: formData.model,
      capacity: Number(formData.capacity),
      airline: formData.airline
    });
    
    // Test Case Expected Result: System creates the airplane record
    setAirplanes([...airplanes, newAirplane]);
    
    // and shows a success confirmation message
    setSuccessMessage('Airplane created successfully');
    handleCloseModals();
  };

  const handleUpdateAirplane = async () => {
    // Step 2: Click "Save"
    if (!validateForm()) {
      return;
    }
    
    // Step Expected Result: System commits changes
    const updatedAirplane = await mockUpdateAirplane(selectedAirplane.id, {
      code: formData.code,
      model: formData.model,
      capacity: Number(formData.capacity),
      airline: formData.airline
    });
    
    // Test Case Expected Result: System updates the record
    setAirplanes(airplanes.map(a => 
      a.id === selectedAirplane.id ? updatedAirplane : a
    ));
    
    // and displays a success confirmation message
    setSuccessMessage('Airplane updated successfully');
    handleCloseModals();
  };

  const handleDeleteAirplane = async () => {
    // Step 2: Confirm deletion
    // Step Expected Result: System removes record from DB
    await mockDeleteAirplane(selectedAirplane.id);
    
    // Test Case Expected Result: System deletes the record
    setAirplanes(airplanes.filter(a => a.id !== selectedAirplane.id));
    
    // and displays a success confirmation message
    setSuccessMessage('Airplane deleted successfully');
    handleCloseModals();
  };

  if (loading) {
    return <div data-testid="airplanes-loading">Loading airplanes...</div>;
  }

  return (
    <div data-testid="airplane-management-page">
      <h2>Airplane Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message">{successMessage}</div>
      )}

      {/* Create Button */}
      <button 
        data-testid="create-airplane-btn"
        onClick={handleOpenCreateModal}
        disabled={activeAction !== null}
      >
        Create Airplane
      </button>

      {/* Airplane List Table */}
      <div data-testid="airplanes-table">
        <table>
          <thead>
            <tr>
              <th data-testid="header-code">Code</th>
              <th data-testid="header-model">Model</th>
              <th data-testid="header-capacity">Capacity</th>
              <th data-testid="header-airline">Airline</th>
              <th data-testid="header-status">Status</th>
              <th data-testid="header-actions">Actions</th>
            </tr>
          </thead>
          <tbody data-testid="airplanes-tbody">
            {airplanes.map((airplane, index) => (
              <tr key={airplane.id} data-testid={`airplane-row-${index}`}>
                <td data-testid={`airplane-code-${index}`}>{airplane.code}</td>
                <td data-testid={`airplane-model-${index}`}>{airplane.model}</td>
                <td data-testid={`airplane-capacity-${index}`}>{airplane.capacity}</td>
                <td data-testid={`airplane-airline-${index}`}>{airplane.airline}</td>
                <td data-testid={`airplane-status-${index}`}>{airplane.status}</td>
                <td data-testid={`airplane-actions-${index}`}>
                  <button 
                    data-testid={`update-btn-${index}`}
                    onClick={() => handleOpenUpdateModal(airplane)}
                    disabled={activeAction !== null}
                  >
                    Update
                  </button>
                  <button 
                    data-testid={`delete-btn-${index}`}
                    onClick={() => handleOpenDeleteDialog(airplane)}
                    disabled={activeAction !== null}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Airplane Modal */}
      {showCreateModal && (
        <div data-testid="create-modal">
          <h3>Create Airplane</h3>
          <div data-testid="create-form">
            <div>
              <label>Code:</label>
              <input 
                data-testid="input-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
              {errors.code && (
                <div data-testid="error-code">{errors.code}</div>
              )}
            </div>
            <div>
              <label>Model:</label>
              <input 
                data-testid="input-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
              {errors.model && (
                <div data-testid="error-model">{errors.model}</div>
              )}
            </div>
            <div>
              <label>Capacity:</label>
              <input 
                data-testid="input-capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
              {errors.capacity && (
                <div data-testid="error-capacity">{errors.capacity}</div>
              )}
            </div>
            <div>
              <label>Airline:</label>
              <input 
                data-testid="input-airline"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              />
              {errors.airline && (
                <div data-testid="error-airline">{errors.airline}</div>
              )}
            </div>
            <button 
              data-testid="save-create-btn"
              onClick={handleCreateAirplane}
            >
              Save
            </button>
            <button 
              data-testid="cancel-create-btn"
              onClick={handleCloseModals}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Update Airplane Modal */}
      {showUpdateModal && (
        <div data-testid="update-modal">
          <h3>Update Airplane</h3>
          <div data-testid="update-form">
            <div>
              <label>Code:</label>
              <input 
                data-testid="input-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label>Model:</label>
              <input 
                data-testid="input-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <label>Capacity:</label>
              <input 
                data-testid="input-capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div>
              <label>Airline:</label>
              <input 
                data-testid="input-airline"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
              />
            </div>
            <button 
              data-testid="save-update-btn"
              onClick={handleUpdateAirplane}
            >
              Save
            </button>
            <button 
              data-testid="cancel-update-btn"
              onClick={handleCloseModals}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div data-testid="delete-dialog">
          <h3>Confirm Deletion</h3>
          <p data-testid="delete-message">
            Are you sure you want to delete airplane {selectedAirplane?.code}?
          </p>
          <button 
            data-testid="confirm-delete-btn"
            onClick={handleDeleteAirplane}
          >
            Confirm
          </button>
          <button 
            data-testid="cancel-delete-btn"
            onClick={handleCloseModals}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

describe('TC-MST-AIR: Master Data - Airplane Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllAirplanes.mockResolvedValue(mockAirplaneList);
    mockCreateAirplane.mockImplementation((data) => Promise.resolve({
      id: `airplane_${Date.now()}`,
      ...data,
      status: 'Active'
    }));
    mockUpdateAirplane.mockImplementation((id, data) => Promise.resolve({
      id,
      ...data,
      status: 'Active'
    }));
    mockDeleteAirplane.mockResolvedValue({ success: true });
  });

  /**
   * TC-MST-AIR-001: Verify Airplane Management Screen
   * Business Requirement: BR32
   * 
   * Prerequisites:
   * 1. User is logged in as Admin or CSA
   * 
   * Steps:
   * Step 1: Navigate to "Airplane Management" via sidebar
   * 
   * Expected Result:
   * The screen displays a list of all existing airplanes in the system.
   */
  it('TC-MST-AIR-001: should display all existing airplanes in the system', async () => {
    // Arrange - Prerequisites: User is logged in as Admin or CSA
    render(<AirplaneManagement userRole="Admin" />);

    // Assert - Loading state
    expect(screen.getByTestId('airplanes-loading')).toHaveTextContent('Loading airplanes...');

    // Step 1: Navigate to "Airplane Management" via sidebar (simulated by component mount)
    // Step Expected Result: Page loads
    await waitFor(() => {
      expect(mockGetAllAirplanes).toHaveBeenCalled();
    });

    // Test Case Expected Result: The screen displays a list of all existing airplanes
    expect(await screen.findByTestId('airplanes-table')).toBeInTheDocument();
    expect(screen.getByTestId('airplanes-tbody')).toBeInTheDocument();

    // Verify all 3 airplanes are displayed
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-2')).toBeInTheDocument();

    // Verify table headers
    expect(screen.getByTestId('header-code')).toHaveTextContent('Code');
    expect(screen.getByTestId('header-model')).toHaveTextContent('Model');
    expect(screen.getByTestId('header-capacity')).toHaveTextContent('Capacity');
    expect(screen.getByTestId('header-airline')).toHaveTextContent('Airline');
    expect(screen.getByTestId('header-status')).toHaveTextContent('Status');
    expect(screen.getByTestId('header-actions')).toHaveTextContent('Actions');

    // Verify first airplane data
    expect(screen.getByTestId('airplane-code-0')).toHaveTextContent('VN-A123');
    expect(screen.getByTestId('airplane-model-0')).toHaveTextContent('Boeing 737');
    expect(screen.getByTestId('airplane-capacity-0')).toHaveTextContent('180');
    expect(screen.getByTestId('airplane-airline-0')).toHaveTextContent('Vietnam Airlines');
    expect(screen.getByTestId('airplane-status-0')).toHaveTextContent('Active');

    // Verify second airplane data
    expect(screen.getByTestId('airplane-code-1')).toHaveTextContent('VN-A456');
    expect(screen.getByTestId('airplane-model-1')).toHaveTextContent('Airbus A320');
    expect(screen.getByTestId('airplane-capacity-1')).toHaveTextContent('150');

    // Verify third airplane data
    expect(screen.getByTestId('airplane-code-2')).toHaveTextContent('VN-A789');
    expect(screen.getByTestId('airplane-status-2')).toHaveTextContent('Maintenance');
  });

  /**
   * TC-MST-AIR-002: Verify Single Action Restriction
   * Business Requirement: BR33
   * 
   * Prerequisites:
   * 1. User is on Airplane Management screen
   * 
   * Steps:
   * Step 1: Initiate an action (e.g., Click "Update" on a plane)
   * Step 2: Try to click "Create" button while Update form is open
   * 
   * Expected Result:
   * System prevents initiating a second parallel action until the first is completed or cancelled.
   * The button is disabled or modal blocks interaction.
   */
  it('TC-MST-AIR-002: should prevent parallel actions when one action is active', async () => {
    // Arrange - Prerequisites: User is on Airplane Management screen
    const user = userEvent.setup();
    render(<AirplaneManagement userRole="Admin" />);

    // Wait for airplanes to load
    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Verify Create button is initially enabled
    const createBtn = screen.getByTestId('create-airplane-btn');
    expect(createBtn).not.toBeDisabled();

    // Step 1: Initiate an action (e.g., Click "Update" on a plane)
    await user.click(screen.getByTestId('update-btn-0'));

    // Step Expected Result: The Update modal/form opens
    expect(await screen.findByTestId('update-modal')).toBeInTheDocument();
    expect(screen.getByTestId('update-form')).toBeInTheDocument();

    // Step 2: Try to click "Create" button while Update form is open
    // Test Case Expected Result: The button is disabled or modal blocks interaction
    expect(createBtn).toBeDisabled();

    // Verify other action buttons are also disabled
    expect(screen.getByTestId('update-btn-0')).toBeDisabled();
    expect(screen.getByTestId('update-btn-1')).toBeDisabled();
    expect(screen.getByTestId('delete-btn-0')).toBeDisabled();
    expect(screen.getByTestId('delete-btn-1')).toBeDisabled();

    // Test Case Expected Result: System prevents initiating a second parallel action
    // Attempt to click Create button (should not open modal)
    await user.click(createBtn);
    expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();

    // Cancel the update action
    await user.click(screen.getByTestId('cancel-update-btn'));

    // Verify buttons are re-enabled after cancellation
    await waitFor(() => {
      expect(createBtn).not.toBeDisabled();
    });
    expect(screen.getByTestId('update-btn-0')).not.toBeDisabled();
    expect(screen.getByTestId('delete-btn-0')).not.toBeDisabled();
  });

  /**
   * TC-MST-AIR-003: Verify Create Airplane - Valid Data
   * Business Requirement: BR34, BR35
   * 
   * Prerequisites:
   * 1. User is on "Create Airplane" form
   * 
   * Steps:
   * Step 1: Enter valid data for all mandatory fields: Code, Model, Capacity, Airline
   * Step 2: Click "Save" / "Create"
   * 
   * Expected Result:
   * System creates the airplane record and shows a success confirmation message.
   */
  it('TC-MST-AIR-003: should create airplane with valid data successfully', async () => {
    // Arrange - Prerequisites: User is on "Create Airplane" form
    const user = userEvent.setup();
    render(<AirplaneManagement userRole="Admin" />);

    // Wait for page to load and open create modal
    await waitFor(() => {
      expect(screen.getByTestId('create-airplane-btn')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('create-airplane-btn'));

    expect(await screen.findByTestId('create-modal')).toBeInTheDocument();

    // Step 1: Enter valid data for all mandatory fields: Code, Model, Capacity, Airline
    await user.type(screen.getByTestId('input-code'), 'VN-A999');
    await user.type(screen.getByTestId('input-model'), 'Boeing 777');
    await user.type(screen.getByTestId('input-capacity'), '300');
    await user.type(screen.getByTestId('input-airline'), 'Vietnam Airlines');

    // Step Expected Result: Input is accepted
    expect(screen.getByTestId('input-code')).toHaveValue('VN-A999');
    expect(screen.getByTestId('input-model')).toHaveValue('Boeing 777');
    expect(screen.getByTestId('input-capacity')).toHaveValue('300');
    expect(screen.getByTestId('input-airline')).toHaveValue('Vietnam Airlines');

    // Step 2: Click "Save" / "Create"
    await user.click(screen.getByTestId('save-create-btn'));

    // Step Expected Result: System validates and commits to DB
    await waitFor(() => {
      expect(mockCreateAirplane).toHaveBeenCalledWith({
        code: 'VN-A999',
        model: 'Boeing 777',
        capacity: 300,
        airline: 'Vietnam Airlines'
      });
    });

    // Test Case Expected Result: System creates the airplane record
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('create-modal')).not.toBeInTheDocument();
    });

    // and shows a success confirmation message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Airplane created successfully');

    // Verify new airplane appears in the table (4th row)
    expect(screen.getByTestId('airplane-row-3')).toBeInTheDocument();
  });

  /**
   * TC-MST-AIR-004: Verify Create Airplane - Missing Mandatory Fields
   * Business Requirement: BR34
   * 
   * Prerequisites:
   * 1. User is on "Create Airplane" form
   * 
   * Steps:
   * Step 1: Leave "Model" or "Capacity" empty
   * Step 2: Click "Save"
   * 
   * Expected Result:
   * System rejects the action and displays validation errors for missing fields.
   */
  it('TC-MST-AIR-004: should display validation errors for missing mandatory fields', async () => {
    // Arrange - Prerequisites: User is on "Create Airplane" form
    const user = userEvent.setup();
    render(<AirplaneManagement userRole="Admin" />);

    await waitFor(() => {
      expect(screen.getByTestId('create-airplane-btn')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('create-airplane-btn'));

    expect(await screen.findByTestId('create-modal')).toBeInTheDocument();

    // Step 1: Leave "Model" or "Capacity" empty
    // Only fill Code and Airline, leave Model and Capacity empty
    await user.type(screen.getByTestId('input-code'), 'VN-A888');
    await user.type(screen.getByTestId('input-airline'), 'VietJet Air');

    // Step Expected Result: Fields are empty
    expect(screen.getByTestId('input-model')).toHaveValue('');
    expect(screen.getByTestId('input-capacity')).toHaveValue('');

    // Step 2: Click "Save"
    await user.click(screen.getByTestId('save-create-btn'));

    // Step Expected Result: Validation logic triggers
    // Test Case Expected Result: System rejects the action and displays validation errors
    await waitFor(() => {
      expect(screen.getByTestId('error-model')).toHaveTextContent('Model is required');
      expect(screen.getByTestId('error-capacity')).toHaveTextContent('Capacity is required');
    });

    // Verify API was not called
    expect(mockCreateAirplane).not.toHaveBeenCalled();

    // Verify modal is still open
    expect(screen.getByTestId('create-modal')).toBeInTheDocument();

    // Test with all fields empty
    await user.clear(screen.getByTestId('input-code'));
    await user.clear(screen.getByTestId('input-airline'));
    await user.click(screen.getByTestId('save-create-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('error-code')).toHaveTextContent('Code is required');
      expect(screen.getByTestId('error-model')).toHaveTextContent('Model is required');
      expect(screen.getByTestId('error-capacity')).toHaveTextContent('Capacity is required');
      expect(screen.getByTestId('error-airline')).toHaveTextContent('Airline is required');
    });
  });

  /**
   * TC-MST-AIR-005: Verify Update Airplane - Success
   * Business Requirement: BR34, BR35
   * 
   * Prerequisites:
   * 1. Existing airplane record selected
   * 
   * Steps:
   * Step 1: Modify "Capacity" field with valid number
   * Step 2: Click "Save"
   * 
   * Expected Result:
   * System updates the record and displays a success confirmation message.
   */
  it('TC-MST-AIR-005: should update airplane record successfully', async () => {
    // Arrange - Prerequisites: Existing airplane record selected
    const user = userEvent.setup();
    render(<AirplaneManagement userRole="Admin" />);

    // Wait for airplanes to load
    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Select first airplane (Boeing 737, capacity 180)
    await user.click(screen.getByTestId('update-btn-0'));

    expect(await screen.findByTestId('update-modal')).toBeInTheDocument();

    // Verify initial values are loaded
    expect(screen.getByTestId('input-code')).toHaveValue('VN-A123');
    expect(screen.getByTestId('input-model')).toHaveValue('Boeing 737');
    expect(screen.getByTestId('input-capacity')).toHaveValue('180');
    expect(screen.getByTestId('input-airline')).toHaveValue('Vietnam Airlines');

    // Step 1: Modify "Capacity" field with valid number
    await user.clear(screen.getByTestId('input-capacity'));
    await user.type(screen.getByTestId('input-capacity'), '200');

    // Step Expected Result: Input is accepted
    expect(screen.getByTestId('input-capacity')).toHaveValue('200');

    // Step 2: Click "Save"
    await user.click(screen.getByTestId('save-update-btn'));

    // Step Expected Result: System commits changes
    await waitFor(() => {
      expect(mockUpdateAirplane).toHaveBeenCalledWith('airplane_001', {
        code: 'VN-A123',
        model: 'Boeing 737',
        capacity: 200,
        airline: 'Vietnam Airlines'
      });
    });

    // Test Case Expected Result: System updates the record
    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId('update-modal')).not.toBeInTheDocument();
    });

    // and displays a success confirmation message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Airplane updated successfully');

    // Verify updated capacity in table
    expect(screen.getByTestId('airplane-capacity-0')).toHaveTextContent('200');
  });

  /**
   * TC-MST-AIR-006: Verify Delete Airplane - Success
   * Business Requirement: BR33, BR35
   * 
   * Prerequisites:
   * 1. Existing airplane record selected (with no active flights)
   * 
   * Steps:
   * Step 1: Click "Delete" button
   * Step 2: Confirm deletion
   * 
   * Expected Result:
   * System deletes the record and displays a success confirmation message.
   */
  it('TC-MST-AIR-006: should delete airplane record successfully', async () => {
    // Arrange - Prerequisites: Existing airplane record selected (with no active flights)
    const user = userEvent.setup();
    render(<AirplaneManagement userRole="Admin" />);

    // Wait for airplanes to load
    await waitFor(() => {
      expect(screen.getByTestId('airplanes-table')).toBeInTheDocument();
    });

    // Verify initial count of 3 airplanes
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-2')).toBeInTheDocument();

    // Step 1: Click "Delete" button
    await user.click(screen.getByTestId('delete-btn-1'));

    // Step Expected Result: Confirmation dialog appears
    expect(await screen.findByTestId('delete-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('delete-message')).toHaveTextContent(
      'Are you sure you want to delete airplane VN-A456?'
    );

    // Step 2: Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-btn'));

    // Step Expected Result: System removes record from DB
    await waitFor(() => {
      expect(mockDeleteAirplane).toHaveBeenCalledWith('airplane_002');
    });

    // Test Case Expected Result: System deletes the record
    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
    });

    // and displays a success confirmation message
    expect(await screen.findByTestId('success-message')).toHaveTextContent('Airplane deleted successfully');

    // Verify airplane is removed from table (only 2 rows remain)
    expect(screen.getByTestId('airplane-row-0')).toBeInTheDocument();
    expect(screen.getByTestId('airplane-row-1')).toBeInTheDocument();
    expect(screen.queryByTestId('airplane-row-2')).not.toBeInTheDocument();

    // Verify the deleted airplane (VN-A456) is no longer in the list
    expect(screen.queryByText('VN-A456')).not.toBeInTheDocument();
  });
});
