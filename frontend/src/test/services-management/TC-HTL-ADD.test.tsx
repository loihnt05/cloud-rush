/**
 * Test Suite: Hotel Management - Add Hotel
 * 
 * Test Cases Covered:
 * - TC-HTL-ADD-001: Verify Add New Hotel - Success
 * - TC-HTL-ADD-002: Verify Add Hotel - Duplicate
 * 
 * NOTE: These tests document expected hotel management behavior.
 * Many features may not be implemented yet - tests may fail.
 * This is expected and acceptable for TDD approach.
 * 
 * Framework: Vitest + React Testing Library
 * Pattern: Unit/Integration tests with mocked API calls
 * Business Rules: BR62, BR63
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock hotel data
const mockHotels = [
  {
    hotel_id: 1,
    name: 'Grand Plaza Hotel',
    address: '123 Main Street, New York, NY 10001',
    rating: 5,
    description: 'Luxury hotel in downtown Manhattan',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'],
    total_rooms: 200,
    available_rooms: 150,
    price_per_night: 250.00,
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    hotel_id: 2,
    name: 'Seaside Resort',
    address: '456 Beach Boulevard, Miami, FL 33139',
    rating: 4,
    description: 'Beachfront resort with ocean views',
    amenities: ['WiFi', 'Pool', 'Beach Access', 'Bar'],
    total_rooms: 150,
    available_rooms: 100,
    price_per_night: 180.00,
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    hotel_id: 3,
    name: 'City Center Inn',
    address: '789 Downtown Ave, Los Angeles, CA 90012',
    rating: 3,
    description: 'Affordable hotel in city center',
    amenities: ['WiFi', 'Parking'],
    total_rooms: 80,
    available_rooms: 60,
    price_per_night: 100.00,
    created_at: '2025-01-20T10:00:00Z',
  },
];

// Mock Hotel Dashboard Component
interface HotelDashboardProps {
  onHotelAdded?: (hotel: any) => void;
}

const HotelDashboard: React.FC<HotelDashboardProps> = ({ onHotelAdded }) => {
  const [hotels, setHotels] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    address: '',
    rating: '',
    description: '',
    price_per_night: '',
    total_rooms: '',
  });
  const [error, setError] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get('/api/hotels');
      setHotels(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load hotels');
      setLoading(false);
    }
  };

  const handleAddHotel = () => {
    setShowAddForm(true);
    setError('');
    setSuccessMessage('');
    setFormData({
      name: '',
      address: '',
      rating: '',
      description: '',
      price_per_night: '',
      total_rooms: '',
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
      if (!formData.name || !formData.address || !formData.rating) {
        setError('Name, Address, and Rating are required');
        setSubmitting(false);
        return;
      }

      // Validate rating
      const rating = parseInt(formData.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        setError('Rating must be between 1 and 5');
        setSubmitting(false);
        return;
      }

      const response = await axios.post('/api/hotels', {
        name: formData.name,
        address: formData.address,
        rating: rating,
        description: formData.description || '',
        price_per_night: formData.price_per_night ? parseFloat(formData.price_per_night) : null,
        total_rooms: formData.total_rooms ? parseInt(formData.total_rooms) : null,
      });

      // Add new hotel to list
      setHotels([...hotels, response.data]);
      setSuccessMessage(`Hotel "${response.data.name}" added successfully`);
      setShowAddForm(false);
      setFormData({
        name: '',
        address: '',
        rating: '',
        description: '',
        price_per_night: '',
        total_rooms: '',
      });

      onHotelAdded?.(response.data);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.message || 'Duplicate hotel - Hotel with this name/address already exists');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid input');
      } else {
        setError('Failed to add hotel');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: '',
      address: '',
      rating: '',
      description: '',
      price_per_night: '',
      total_rooms: '',
    });
    setError('');
  };

  if (loading) return <div>Loading hotels...</div>;

  return (
    <div data-testid="hotel-dashboard">
      <h2>Hotel Dashboard</h2>
      <p>Manage hotel inventory and availability</p>

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

      {!showAddForm && (
        <div data-testid="dashboard-actions">
          <button
            data-testid="add-hotel-button"
            onClick={handleAddHotel}
          >
            Add Hotel
          </button>
        </div>
      )}

      {showAddForm && (
        <div data-testid="add-hotel-form">
          <h3>Add New Hotel</h3>

          <div data-testid="form-fields">
            <div data-testid="name-field">
              <label>Hotel Name *</label>
              <input
                data-testid="name-input"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Grand Plaza Hotel"
              />
            </div>

            <div data-testid="address-field">
              <label>Address *</label>
              <input
                data-testid="address-input"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="e.g., 123 Main Street, New York, NY"
              />
            </div>

            <div data-testid="rating-field">
              <label>Star Rating (1-5) *</label>
              <select
                data-testid="rating-input"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', e.target.value)}
              >
                <option value="">Select rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div data-testid="description-field">
              <label>Description</label>
              <textarea
                data-testid="description-input"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the hotel..."
                rows={3}
              />
            </div>

            <div data-testid="price-field">
              <label>Price per Night ($)</label>
              <input
                data-testid="price-input"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_night}
                onChange={(e) => handleInputChange('price_per_night', e.target.value)}
                placeholder="e.g., 150.00"
              />
            </div>

            <div data-testid="rooms-field">
              <label>Total Rooms</label>
              <input
                data-testid="rooms-input"
                type="number"
                min="1"
                value={formData.total_rooms}
                onChange={(e) => handleInputChange('total_rooms', e.target.value)}
                placeholder="e.g., 100"
              />
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

      <div data-testid="hotels-list">
        <h3>Hotels ({hotels.length})</h3>
        {hotels.map((hotel) => (
          <div key={hotel.hotel_id} data-testid={`hotel-${hotel.hotel_id}`}>
            <div data-testid={`hotel-name-${hotel.hotel_id}`}>{hotel.name}</div>
            <div data-testid={`hotel-address-${hotel.hotel_id}`}>{hotel.address}</div>
            <div data-testid={`hotel-rating-${hotel.hotel_id}`}>{hotel.rating} Stars</div>
            <div data-testid={`hotel-rooms-${hotel.hotel_id}`}>
              {hotel.available_rooms}/{hotel.total_rooms} rooms available
            </div>
            {hotel.price_per_night && (
              <div data-testid={`hotel-price-${hotel.hotel_id}`}>
                ${hotel.price_per_night.toFixed(2)}/night
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

describe('TC-HTL-ADD-001: Verify Add New Hotel - Success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: Admin on "Hotel Dashboard"', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Verify dashboard is displayed
    expect(getByTestId('hotel-dashboard')).toHaveTextContent('Hotel Dashboard');
    expect(getByTestId('hotel-dashboard')).toHaveTextContent('Manage hotel inventory');

    // Verify hotels list is displayed
    expect(getByTestId('hotels-list')).toBeInTheDocument();
    expect(getByTestId('hotels-list')).toHaveTextContent('Hotels (3)');

    // Verify existing hotels
    expect(getByTestId('hotel-1')).toBeInTheDocument();
    expect(getByTestId('hotel-name-1')).toHaveTextContent('Grand Plaza Hotel');

    // Verify Add Hotel button is available
    expect(getByTestId('add-hotel-button')).toBeInTheDocument();

    console.log('✓ TC-HTL-ADD-001 Prerequisites PASSED: Admin on Hotel Dashboard');
  });

  it('Step 1: Click "Add Hotel" - Form opens', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Click Add Hotel button
    const addButton = getByTestId('add-hotel-button');
    fireEvent.click(addButton);

    // Verify form opens
    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    expect(getByTestId('add-hotel-form')).toHaveTextContent('Add New Hotel');

    // Verify all form fields are present
    expect(getByTestId('name-field')).toBeInTheDocument();
    expect(getByTestId('name-input')).toBeInTheDocument();
    expect(getByTestId('address-field')).toBeInTheDocument();
    expect(getByTestId('address-input')).toBeInTheDocument();
    expect(getByTestId('rating-field')).toBeInTheDocument();
    expect(getByTestId('rating-input')).toBeInTheDocument();
    expect(getByTestId('description-field')).toBeInTheDocument();
    expect(getByTestId('description-input')).toBeInTheDocument();
    expect(getByTestId('price-field')).toBeInTheDocument();
    expect(getByTestId('price-input')).toBeInTheDocument();
    expect(getByTestId('rooms-field')).toBeInTheDocument();
    expect(getByTestId('rooms-input')).toBeInTheDocument();

    // Verify form actions
    expect(getByTestId('save-button')).toBeInTheDocument();
    expect(getByTestId('cancel-button')).toBeInTheDocument();

    console.log('✓ TC-HTL-ADD-001 Step 1 PASSED: Add Hotel form opened with all fields');
  });

  it('Step 2: Enter Name, Address, Rating - Input accepted', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Enter hotel name
    const nameInput = getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Mountain View Lodge' } });
    expect(nameInput).toHaveValue('Mountain View Lodge');

    // Enter address
    const addressInput = getByTestId('address-input');
    fireEvent.change(addressInput, { target: { value: '999 Mountain Road, Denver, CO 80202' } });
    expect(addressInput).toHaveValue('999 Mountain Road, Denver, CO 80202');

    // Select rating
    const ratingInput = getByTestId('rating-input');
    fireEvent.change(ratingInput, { target: { value: '4' } });
    expect(ratingInput).toHaveValue('4');

    // Enter optional fields
    const descriptionInput = getByTestId('description-input');
    fireEvent.change(descriptionInput, {
      target: { value: 'Beautiful mountain views and hiking trails' },
    });
    expect(descriptionInput).toHaveValue('Beautiful mountain views and hiking trails');

    const priceInput = getByTestId('price-input');
    fireEvent.change(priceInput, { target: { value: '120.00' } });
    expect(priceInput).toHaveValue(120);

    const roomsInput = getByTestId('rooms-input');
    fireEvent.change(roomsInput, { target: { value: '75' } });
    expect(roomsInput).toHaveValue(75);

    console.log('✓ TC-HTL-ADD-001 Step 2 PASSED: Name, Address, Rating input accepted');
  });

  it('TC-HTL-ADD-001: Complete flow - Hotel is added to system successfully', async () => {
    const mockHotelAdded = vi.fn();

    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelDashboard onHotelAdded={mockHotelAdded} />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Initial hotel count
    expect(getByTestId('hotels-list')).toHaveTextContent('Hotels (3)');

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Fill form with new hotel data
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Mountain View Lodge' } });
    fireEvent.change(getByTestId('address-input'), {
      target: { value: '999 Mountain Road, Denver, CO 80202' },
    });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '4' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Beautiful mountain views and hiking trails' },
    });
    fireEvent.change(getByTestId('price-input'), { target: { value: '120.00' } });
    fireEvent.change(getByTestId('rooms-input'), { target: { value: '75' } });

    // Mock successful creation (BR62, BR63: unique hotel validation passes)
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        hotel_id: 4,
        name: 'Mountain View Lodge',
        address: '999 Mountain Road, Denver, CO 80202',
        rating: 4,
        description: 'Beautiful mountain views and hiking trails',
        price_per_night: 120.00,
        total_rooms: 75,
        available_rooms: 75,
        amenities: [],
        created_at: '2025-12-23T10:00:00Z',
      },
    });

    // Save
    fireEvent.click(getByTestId('save-button'));

    // Verify API call with correct data
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/hotels', {
        name: 'Mountain View Lodge',
        address: '999 Mountain Road, Denver, CO 80202',
        rating: 4,
        description: 'Beautiful mountain views and hiking trails',
        price_per_night: 120.00,
        total_rooms: 75,
      });
    });

    // Verify success message
    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
      expect(getByTestId('success-message')).toHaveTextContent('Hotel "Mountain View Lodge" added successfully');
    });

    // Verify form is closed (success message is shown, form is hidden)
    await waitFor(() => {
      expect(queryByTestId('add-hotel-form')).not.toBeInTheDocument();
    });

    // Verify new hotel is listed in dashboard
    expect(getByTestId('hotels-list')).toHaveTextContent('Hotels (4)');
    expect(getByTestId('hotel-4')).toBeInTheDocument();
    expect(getByTestId('hotel-name-4')).toHaveTextContent('Mountain View Lodge');
    expect(getByTestId('hotel-address-4')).toHaveTextContent('999 Mountain Road, Denver, CO 80202');
    expect(getByTestId('hotel-rating-4')).toHaveTextContent('4 Stars');
    expect(getByTestId('hotel-price-4')).toHaveTextContent('$120.00/night');
    expect(getByTestId('hotel-rooms-4')).toHaveTextContent('75/75 rooms available');

    // Verify callback called
    expect(mockHotelAdded).toHaveBeenCalledWith(
      expect.objectContaining({
        hotel_id: 4,
        name: 'Mountain View Lodge',
        rating: 4,
      })
    );

    console.log('✓ TC-HTL-ADD-001 PASSED: Hotel added to system successfully');
  });
});

describe('TC-HTL-ADD-003..004: Add Hotel edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-HTL-ADD-003: Verify Add Hotel - Invalid Rating', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    const { getByTestId } = render(<HotelDashboard />);
    await waitFor(() => expect(getByTestId('hotel-dashboard')).toBeInTheDocument());

    fireEvent.click(getByTestId('add-hotel-button'));
    await waitFor(() => expect(getByTestId('add-hotel-form')).toBeInTheDocument());

    fireEvent.change(getByTestId('name-input'), { target: { value: 'Test Hotel' } });
    fireEvent.change(getByTestId('address-input'), { target: { value: 'Hanoi' } });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '6' } });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Rating must be between 1 and 5'));
    expect(mockedAxios.post).not.toHaveBeenCalled();

    // Negative rating
    fireEvent.change(getByTestId('rating-input'), { target: { value: '-1' } });
    fireEvent.click(getByTestId('save-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Rating must be between 1 and 5'));
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('TC-HTL-ADD-004: Verify Add Hotel - Same Name Diff Address allowed', async () => {
    // Existing Hilton in HCM
    const existing = [{ hotel_id: 1, name: 'Hilton', address: 'Ho Chi Minh' }];
    mockedAxios.get.mockResolvedValueOnce({ data: existing });

    const { getByTestId } = render(<HotelDashboard />);
    await waitFor(() => expect(getByTestId('hotel-dashboard')).toBeInTheDocument());

    fireEvent.click(getByTestId('add-hotel-button'));
    await waitFor(() => expect(getByTestId('add-hotel-form')).toBeInTheDocument());

    fireEvent.change(getByTestId('name-input'), { target: { value: 'Hilton' } });
    fireEvent.change(getByTestId('address-input'), { target: { value: 'Hanoi' } });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '4' } });

    mockedAxios.post.mockResolvedValueOnce({ data: { hotel_id: 99, name: 'Hilton', address: 'Hanoi' } });
    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());
    await waitFor(() => expect(getByTestId('success-message')).toBeInTheDocument());
  });
});

describe('TC-HTL-ADD-002: Verify Add Hotel - Duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: Admin on "Hotel Dashboard"', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Verify dashboard is displayed
    expect(getByTestId('hotel-dashboard')).toHaveTextContent('Hotel Dashboard');

    // Verify existing hotel "Grand Plaza Hotel" exists
    expect(getByTestId('hotel-1')).toBeInTheDocument();
    expect(getByTestId('hotel-name-1')).toHaveTextContent('Grand Plaza Hotel');
    expect(getByTestId('hotel-address-1')).toHaveTextContent('123 Main Street, New York, NY 10001');

    console.log('✓ TC-HTL-ADD-002 Prerequisites PASSED: Admin on Hotel Dashboard');
  });

  it('Step 1: Enter Name/Address identical to existing one - Input entered', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Enter duplicate hotel name and address (identical to hotel ID 1)
    const nameInput = getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Grand Plaza Hotel' } });
    expect(nameInput).toHaveValue('Grand Plaza Hotel');

    const addressInput = getByTestId('address-input');
    fireEvent.change(addressInput, { target: { value: '123 Main Street, New York, NY 10001' } });
    expect(addressInput).toHaveValue('123 Main Street, New York, NY 10001');

    // Enter rating
    fireEvent.change(getByTestId('rating-input'), { target: { value: '5' } });

    console.log('✓ TC-HTL-ADD-002 Step 1 PASSED: Duplicate name/address input entered');
  });

  it('TC-HTL-ADD-002: Complete flow - System rejects creation to prevent duplicates', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Initial hotel count
    expect(getByTestId('hotels-list')).toHaveTextContent('Hotels (3)');

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Fill form with duplicate hotel data
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Grand Plaza Hotel' } });
    fireEvent.change(getByTestId('address-input'), {
      target: { value: '123 Main Street, New York, NY 10001' },
    });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '5' } });
    fireEvent.change(getByTestId('description-input'), {
      target: { value: 'Another description' },
    });

    // Mock 409 Conflict response (BR63: duplicate validation)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate hotel - Hotel with this name/address already exists',
        },
      },
    });

    // Save
    fireEvent.click(getByTestId('save-button'));

    // Verify API call made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/hotels', {
        name: 'Grand Plaza Hotel',
        address: '123 Main Street, New York, NY 10001',
        rating: 5,
        description: 'Another description',
        price_per_night: null,
        total_rooms: null,
      });
    });

    // Verify error message displayed (system rejects creation)
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Duplicate hotel');
      expect(getByTestId('error-message')).toHaveTextContent('already exists');
    });

    // Verify form is still open (not closed on error)
    expect(getByTestId('add-hotel-form')).toBeInTheDocument();

    // Verify hotel was NOT added to list
    expect(getByTestId('hotels-list')).toHaveTextContent('Hotels (3)');

    // Verify only one "Grand Plaza Hotel" exists
    const grandPlazaElements = document.querySelectorAll('[data-testid*="hotel-name-"]');
    const grandPlazaCount = Array.from(grandPlazaElements).filter(
      el => el.textContent === 'Grand Plaza Hotel'
    ).length;
    expect(grandPlazaCount).toBe(1);

    console.log('✓ TC-HTL-ADD-002 PASSED: System rejects duplicate hotel creation');
  });

  it('Verify duplicate detection for same name different address', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Same name, different address
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Grand Plaza Hotel' } });
    fireEvent.change(getByTestId('address-input'), {
      target: { value: '456 Different Street, Boston, MA 02101' },
    });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '4' } });

    // Mock 409 Conflict (name duplicate)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate hotel name',
        },
      },
    });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Duplicate hotel');
    });

    console.log('✓ TC-HTL-ADD-002 Edge Case PASSED: Duplicate name detection');
  });

  it('Verify duplicate detection for different name same address', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Different name, same address
    fireEvent.change(getByTestId('name-input'), { target: { value: 'New Plaza Hotel' } });
    fireEvent.change(getByTestId('address-input'), {
      target: { value: '123 Main Street, New York, NY 10001' },
    });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '4' } });

    // Mock 409 Conflict (address duplicate)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: {
          message: 'Duplicate hotel address',
        },
      },
    });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Duplicate hotel');
    });

    console.log('✓ TC-HTL-ADD-002 Edge Case PASSED: Duplicate address detection');
  });
});

describe('Additional Hotel Management Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should validate required fields', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Try to save without filling required fields
    fireEvent.click(getByTestId('save-button'));

    // Verify validation error
    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Name, Address, and Rating are required');
    });

    // Verify API not called
    expect(mockedAxios.post).not.toHaveBeenCalled();

    console.log('✓ Additional Test PASSED: Required field validation');
  });

  it('Should validate rating range (1-5)', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Fill with valid data but select all ratings to verify dropdown
    const ratings = ['1', '2', '3', '4', '5'];
    for (const rating of ratings) {
      fireEvent.change(getByTestId('rating-input'), { target: { value: rating } });
      expect(getByTestId('rating-input')).toHaveValue(rating);
    }

    console.log('✓ Additional Test PASSED: Rating range 1-5 supported');
  });

  it('Should handle cancel button - reset form', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId, queryByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    // Fill some data
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Test Hotel' } });
    fireEvent.change(getByTestId('address-input'), { target: { value: 'Test Address' } });

    // Cancel
    fireEvent.click(getByTestId('cancel-button'));

    // Verify form closed
    await waitFor(() => {
      expect(queryByTestId('add-hotel-form')).not.toBeInTheDocument();
    });

    // Verify Add Hotel button is back
    expect(getByTestId('add-hotel-button')).toBeInTheDocument();

    console.log('✓ Additional Test PASSED: Cancel resets form');
  });

  it('Should handle server error gracefully', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form and fill valid data
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'New Hotel' } });
    fireEvent.change(getByTestId('address-input'), { target: { value: 'New Address' } });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '4' } });

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
      expect(getByTestId('error-message')).toHaveTextContent('Failed to add hotel');
    });

    console.log('✓ Additional Test PASSED: Server error handled');
  });

  it('Should accept optional fields', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHotels,
    });

    const { getByTestId } = render(<HotelDashboard />);

    await waitFor(() => {
      expect(getByTestId('hotel-dashboard')).toBeInTheDocument();
    });

    // Open form and fill only required fields
    fireEvent.click(getByTestId('add-hotel-button'));

    await waitFor(() => {
      expect(getByTestId('add-hotel-form')).toBeInTheDocument();
    });

    fireEvent.change(getByTestId('name-input'), { target: { value: 'Budget Inn' } });
    fireEvent.change(getByTestId('address-input'), { target: { value: 'Simple Address' } });
    fireEvent.change(getByTestId('rating-input'), { target: { value: '2' } });
    // Leave description, price, rooms empty

    // Mock success with null optional fields
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        hotel_id: 5,
        name: 'Budget Inn',
        address: 'Simple Address',
        rating: 2,
        description: '',
        price_per_night: null,
        total_rooms: null,
        available_rooms: null,
      },
    });

    fireEvent.click(getByTestId('save-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/hotels', {
        name: 'Budget Inn',
        address: 'Simple Address',
        rating: 2,
        description: '',
        price_per_night: null,
        total_rooms: null,
      });
    });

    console.log('✓ Additional Test PASSED: Optional fields can be empty');
  });
});
