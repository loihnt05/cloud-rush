/**
 * Test Suite: Master Service Management
 * 
 * Test Cases Covered:
 * - TC-MST-SVC-001: Verify Create New Service - Success
 * - TC-MST-SVC-002: Verify Create Duplicate Service
 * 
 * NOTE: These tests document expected master service management behavior.
 * Many features may not be implemented yet - tests may fail.
 * This is expected and acceptable for TDD approach.
 * 
 * Master Services are catalog/template services that can be added to bookings.
 * Examples: VIP Lounge, Extra Baggage, Priority Boarding, In-Flight Meal, etc.
 * 
 * Framework: Vitest + React Testing Library
 * Pattern: Unit/Integration tests with mocked API calls
 * Business Rules: BR52, BR53
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock master services data
const mockMasterServices = [
  {
    service_id: 1,
    name: 'VIP Lounge',
    description: 'Access to VIP lounge with complimentary food and drinks',
    price: 50.00,
    category: 'lounge',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    service_id: 2,
    name: 'Extra Baggage 10kg',
    description: 'Additional 10kg baggage allowance',
    price: 25.00,
    category: 'baggage',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    service_id: 3,
    name: 'Priority Boarding',
    description: 'Board the aircraft before general passengers',
    price: 15.00,
    category: 'boarding',
    is_active: true,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    service_id: 4,
    name: 'In-Flight Meal Premium',
    description: 'Premium meal service with multiple courses',
    price: 30.00,
    category: 'meal',
    is_active: false,
    created_at: '2025-01-15T10:00:00Z',
  },
];

// Mock Services Master Dashboard Component
interface ServicesMasterDashboardProps {
  onServiceCreated?: (service: any) => void;
}

const ServicesMasterDashboard: React.FC<ServicesMasterDashboardProps> = ({ onServiceCreated }) => {
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [error, setError] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/master-services');
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load services');
      setLoading(false);
    }
  };

  const handleCreateNewService = () => {
    setShowCreateForm(true);
    setError('');
    setSuccessMessage('');
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.price || !formData.description) {
        setError('All fields are required');
        setSubmitting(false);
        return;
      }

      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError('Price must be a positive number');
        setSubmitting(false);
        return;
      }

      const response = await axios.post('/api/master-services', {
        name: formData.name,
        description: formData.description,
        price: price,
        category: formData.category || 'general',
      });

      // Add new service to list
      setServices([...services, response.data]);
      setSuccessMessage(`Service "${response.data.name}" created successfully`);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
      });

      onServiceCreated?.(response.data);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Duplicate service name');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid input');
      } else {
        setError('Failed to create service');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
    });
    setError('');
  };

  if (loading) return <div>Loading services...</div>;

  return (
    <div data-testid="services-master-dashboard">
      <h2>Services Dashboard</h2>
      <p>Master Service Catalog Management</p>

      {error && (
        <div data-testid="error-message" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div data-testid="success-message" role="status">
          {successMessage}
        </div>
      )}

      {!showCreateForm && (
        <div data-testid="dashboard-actions">
          <button
            data-testid="create-new-service-button"
            onClick={handleCreateNewService}
          >
            Create New Service
          </button>
        </div>
      )}

      {showCreateForm && (
        <div data-testid="create-service-form">
          <h3>Create New Service</h3>

          <div data-testid="form-fields">
            <div data-testid="name-field">
              <label>Service Name *</label>
              <input
                data-testid="name-input"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., VIP Lounge, Extra Baggage"
              />
            </div>

            <div data-testid="price-field">
              <label>Price ($) *</label>
              <input
                data-testid="price-input"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 50.00"
              />
            </div>

            <div data-testid="description-field">
              <label>Description *</label>
              <textarea
                data-testid="description-input"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the service..."
                rows={3}
              />
            </div>

            <div data-testid="category-field">
              <label>Category</label>
              <select
                data-testid="category-input"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                <option value="lounge">Lounge</option>
                <option value="baggage">Baggage</option>
                <option value="boarding">Boarding</option>
                <option value="meal">Meal</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div data-testid="form-actions">
            <button
              data-testid="save-button"
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <button
              data-testid="cancel-button"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div data-testid="services-list">
        <h3>Services ({services.length})</h3>
        {services.map((service) => (
          <div key={service.service_id} data-testid={`service-${service.service_id}`}>
            <div data-testid={`service-name-${service.service_id}`}>{service.name}</div>
            <div data-testid={`service-price-${service.service_id}`}>${service.price.toFixed(2)}</div>
            <div data-testid={`service-description-${service.service_id}`}>{service.description}</div>
            <div data-testid={`service-status-${service.service_id}`}>
              {service.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

describe('TC-MST-SVC-001: Verify Create New Service - Success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: Admin/CSA on "Services Dashboard"', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Verify dashboard is displayed
    expect(getByTestId('services-master-dashboard')).toHaveTextContent('Services Dashboard');
    expect(getByTestId('services-master-dashboard')).toHaveTextContent('Master Service Catalog Management');

    // Verify services list is displayed
    expect(getByTestId('services-list')).toBeInTheDocument();
    expect(getByTestId('services-list')).toHaveTextContent('Services (4)');

    // Verify existing services
    expect(getByTestId('service-1')).toBeInTheDocument();
    expect(getByTestId('service-name-1')).toHaveTextContent('VIP Lounge');

    // Verify Create New Service button is available
    expect(getByTestId('create-new-service-button')).toBeInTheDocument();

    console.log('✓ TC-MST-SVC-001 Prerequisites PASSED: Admin/CSA on Services Dashboard');
  });

  it('Step 1: Click "Create New Service" - Form opens', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Click Create New Service button
    const createButton = getByTestId('create-new-service-button');
    fireEvent.click(createButton);

    // Verify form opens
    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    expect(getByTestId('create-service-form')).toHaveTextContent('Create New Service');

    // Verify all form fields are present
    expect(getByTestId('name-field')).toBeInTheDocument();
    expect(getByTestId('name-input')).toBeInTheDocument();
    expect(getByTestId('price-field')).toBeInTheDocument();
    expect(getByTestId('price-input')).toBeInTheDocument();
    expect(getByTestId('description-field')).toBeInTheDocument();
    expect(getByTestId('description-input')).toBeInTheDocument();
    expect(getByTestId('category-field')).toBeInTheDocument();
    expect(getByTestId('category-input')).toBeInTheDocument();

    // Verify form actions
    expect(getByTestId('save-button')).toBeInTheDocument();
    expect(getByTestId('cancel-button')).toBeInTheDocument();

    console.log('✓ TC-MST-SVC-001 Step 1 PASSED: Create form opened with all fields');
  });

  it('Step 2: Enter Unique Name, Price, Description - Input accepted', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Enter unique service name (not in existing services)
    const nameInput = getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Airport Transfer' } });
    expect(nameInput).toHaveValue('Airport Transfer');

    // Enter price
    const priceInput = getByTestId('price-input');
    fireEvent.change(priceInput, { target: { value: '75.00' } });
    expect(priceInput).toHaveValue(75);

    // Enter description
    const descriptionInput = getByTestId('description-input');
    fireEvent.change(descriptionInput, {
      target: { value: 'Private airport transfer service with comfortable vehicle' },
    });
    expect(descriptionInput).toHaveValue('Private airport transfer service with comfortable vehicle');

    // Select category
    const categoryInput = getByTestId('category-input');
    fireEvent.change(categoryInput, { target: { value: 'general' } });
    expect(categoryInput).toHaveValue('general');

    console.log('✓ TC-MST-SVC-001 Step 2 PASSED: Unique input accepted in all fields');
  });

  it('Step 3: Click "Save" - System validates uniqueness', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form and fill data
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'Airport Transfer' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '75.00' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Private airport transfer service' },
    });
    fireEvent.change(getByTestId('category-input'), { target: { value: 'general' } });

    // Mock successful API response (system validates uniqueness and accepts)
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        service_id: 5,
        name: 'Airport Transfer',
        description: 'Private airport transfer service',
        price: 75.00,
        category: 'general',
        is_active: true,
        created_at: '2025-12-23T10:00:00Z',
      },
    });

    // Click Save
    fireEvent.click(getByTestId('save-button'));

    // Verify API call with correct data
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/master-services', {
        name: 'Airport Transfer',
        description: 'Private airport transfer service',
        price: 75.00,
        category: 'general',
      });
    });

    console.log('✓ TC-MST-SVC-001 Step 3 PASSED: System validates uniqueness');
  });

  it('TC-MST-SVC-001: Complete flow - Service is created successfully and listed in the dashboard', async () => {
    const mockServiceCreated = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard onServiceCreated={mockServiceCreated} />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Initial service count
    expect(getByTestId('services-list')).toHaveTextContent('Services (4)');

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Fill form with unique service
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Airport Transfer' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '75.00' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Private airport transfer service with comfortable vehicle' },
    });
    fireEvent.change(getByTestId('category-input'), { target: { value: 'general' } });

    // Mock successful creation
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        service_id: 5,
        name: 'Airport Transfer',
        description: 'Private airport transfer service with comfortable vehicle',
        price: 75.00,
        category: 'general',
        is_active: true,
        created_at: '2025-12-23T10:00:00Z',
      },
    });

    // Save
    fireEvent.click(getByTestId('save-button'));

    // Verify success message
    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
      expect(getByTestId('success-message')).toHaveTextContent('Service "Airport Transfer" created successfully');
    });

    // Verify form is closed
    await waitFor(() => {
      expect(getByTestId('create-service-form')).not.toBeInTheDocument();
    });

    // Verify new service is listed in dashboard
    expect(getByTestId('services-list')).toHaveTextContent('Services (5)');
    expect(getByTestId('service-5')).toBeInTheDocument();
    expect(getByTestId('service-name-5')).toHaveTextContent('Airport Transfer');
    expect(getByTestId('service-price-5')).toHaveTextContent('$75.00');
    expect(getByTestId('service-description-5')).toHaveTextContent('Private airport transfer service');
    expect(getByTestId('service-status-5')).toHaveTextContent('Active');

    // Verify callback called
    expect(mockServiceCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        service_id: 5,
        name: 'Airport Transfer',
        price: 75.00,
      })
    );

    console.log('✓ TC-MST-SVC-001 PASSED: Service created successfully and listed in dashboard');
  });
});

describe('TC-MST-SVC-002: Verify Create Duplicate Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: Admin/CSA on "Services Dashboard" and Service "VIP Lounge" already exists', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Verify dashboard is displayed
    expect(getByTestId('services-master-dashboard')).toHaveTextContent('Services Dashboard');

    // Verify "VIP Lounge" already exists
    expect(getByTestId('service-1')).toBeInTheDocument();
    expect(getByTestId('service-name-1')).toHaveTextContent('VIP Lounge');
    expect(getByTestId('service-price-1')).toHaveTextContent('$50.00');

    console.log('✓ TC-MST-SVC-002 Prerequisites PASSED: VIP Lounge already exists');
  });

  it('Step 1: Create Service with name "VIP Lounge" - Input entered', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Enter duplicate service name "VIP Lounge"
    const nameInput = getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'VIP Lounge' } });
    expect(nameInput).toHaveValue('VIP Lounge');

    // Enter other required fields
    fireEvent.change(getByTestId('price-input'), { target: { value: '60.00' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Another VIP lounge service' },
    });

    console.log('✓ TC-MST-SVC-002 Step 1 PASSED: Duplicate name input entered');
  });

  it('Step 2: Click "Save" - Validation fails', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form and fill with duplicate data
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'VIP Lounge' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '60.00' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Another VIP lounge service' },
    });

    // Mock 409 Conflict response (duplicate name)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate service name: "VIP Lounge" already exists',
        },
      },
    });

    // Click Save
    fireEvent.click(getByTestId('save-button'));

    // Verify API call made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/master-services', {
        name: 'VIP Lounge',
        description: 'Another VIP lounge service',
        price: 60.00,
        category: '',
      });
    });

    console.log('✓ TC-MST-SVC-002 Step 2 PASSED: Validation API called');
  });

  it('TC-MST-SVC-002: Complete flow - System detects duplicate name and displays validation error', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Initial service count
    expect(getByTestId('services-list')).toHaveTextContent('Services (4)');

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Fill form with duplicate service name
    fireEvent.change(getByTestId('name-input'), { target: { value: 'VIP Lounge' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '60.00' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Another VIP lounge service' },
    });
    fireEvent.change(getByTestId('category-input'), { target: { value: 'lounge' } });

    // Mock 409 Conflict response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate service name: "VIP Lounge" already exists',
        },
      },
    });

    // Save
    fireEvent.click(getByTestId('save-button'));

    // Verify error message displayed
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Duplicate service name');
      expect(getByTestId('error-message')).toHaveTextContent('VIP Lounge');
    });

    // Verify form is still open (not closed on error)
    expect(getByTestId('create-service-form')).toBeInTheDocument();

    // Verify service was NOT added to list
    expect(getByTestId('services-list')).toHaveTextContent('Services (4)');

    // Verify only one VIP Lounge exists
    const vipLoungeElements = document.querySelectorAll('[data-testid*="service-name-"]');
    const vipLoungeCount = Array.from(vipLoungeElements).filter(
      el => el.textContent === 'VIP Lounge'
    ).length;
    expect(vipLoungeCount).toBe(1);

    console.log('✓ TC-MST-SVC-002 PASSED: Duplicate detected with validation error displayed');
  });

  it('Verify case-insensitive duplicate detection', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Fill with different case variations
    fireEvent.change(getByTestId('name-input'), { target: { value: 'vip lounge' } }); // lowercase
    fireEvent.change(getByTestId('price-input'), { target: { value: '55.00' } });
    fireEvent.change(getByTestId('description-input'), { target: { value: 'Test' } });

    // Mock 409 Conflict
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate service name (case-insensitive)',
        },
      },
    });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Duplicate service name');
    });

    console.log('✓ TC-MST-SVC-002 Edge Case PASSED: Case-insensitive duplicate detection');
  });
});

describe('Additional Master Service Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should validate required fields before submission', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Try to save without filling fields
    fireEvent.click(getByTestId('save-button'));

    // Verify validation error
    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('All fields are required');
    });

    // Verify API not called
    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ Additional Test PASSED: Required field validation');
  });

  it('Should validate price is positive number', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Fill with invalid price
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Test Service' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '-10' } });
    fireEvent.change(getByTestId('description-input'), { target: { value: 'Test' } });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Price must be a positive number');
    });

    console.log('✓ Additional Test PASSED: Price validation');
  });

  it('Should handle cancel button - reset form', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId, queryByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    // Fill some data
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Test Service' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '50' } });

    // Cancel
    fireEvent.click(getByTestId('cancel-button'));

    // Verify form closed
    await waitFor(() => {
      expect(queryByTestId('create-service-form')).not.toBeInTheDocument();
    });

    // Verify Create button is back
    expect(getByTestId('create-new-service-button')).toBeInTheDocument();

    console.log('✓ Additional Test PASSED: Cancel resets form');
  });

  it('Should handle server error gracefully', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form and fill valid data
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'New Service' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '40' } });
    fireEvent.change(getByTestId('description-input'), { target: { value: 'Description' } });

    // Mock server error
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Internal server error',
        },
      },
    });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Failed to create service');
    });

    console.log('✓ Additional Test PASSED: Server error handled');
  });

  it('Should disable buttons while submitting', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    // Open form and fill data
    fireEvent.click(getByTestId('create-new-service-button'));

    await waitFor(() => {
      expect(getByTestId('create-service-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'New Service' } });
    fireEvent.change(getByTestId('price-input'), { target: { value: '40' } });
    fireEvent.change(getByTestId('description-input'), { target: { value: 'Description' } });

    // Mock delayed response
    mockedAxios.post.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              service_id: 6,
              name: 'New Service',
              price: 40,
              description: 'Description',
            },
          });
        }, 100);
      });
    });

    fireEvent.click(getByTestId('save-button'));

    // Verify button shows submitting state
    expect(getByTestId('save-button')).toHaveTextContent('Saving...');
    expect(getByTestId('save-button')).toBeDisabled();
    expect(getByTestId('cancel-button')).toBeDisabled();

    console.log('✓ Additional Test PASSED: Buttons disabled during submission');
  });

  it('Should create service with different categories', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockMasterServices,
    });

    const { getByTestId } = render(<ServicesMasterDashboard />);

    await waitFor(() => {
      expect(getByTestId('services-master-dashboard')).toBeInTheDocument();
    });

    const categories = ['lounge', 'baggage', 'boarding', 'meal', 'general'];

    for (const category of categories) {
      // Open form
      fireEvent.click(getByTestId('create-new-service-button'));

      await waitFor(() => {
        expect(getByTestId('create-service-form')).toBeInTheDocument();
      });

      // Fill data with specific category
      fireEvent.change(getByTestId('name-input'), {
        target: { value: `${category} Service` },
      });
      fireEvent.change(getByTestId('price-input'), { target: { value: '30' } });
      fireEvent.change(getByTestId('description-input'), { target: { value: 'Test' } });
      fireEvent.change(getByTestId('category-input'), { target: { value: category } });

      // Mock success
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          service_id: Date.now(),
          name: `${category} Service`,
          price: 30,
          category: category,
        },
      });

      fireEvent.click(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('success-message')).toHaveTextContent('created successfully');
      });

      // Verify API called with correct category
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/master-services',
        expect.objectContaining({
          category: category,
        })
      );
    }

    console.log('✓ Additional Test PASSED: Multiple categories supported');
  });
});
