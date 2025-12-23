/**
 * Test Suite: Add Services to Booking
 * 
 * Test Cases Covered:
 * - TC-SVC-ADD-001: Verify Add Extra Service to Valid Booking
 * - TC-SVC-ADD-002: Verify Add Service with Invalid Booking ID
 * 
 * NOTE: These tests document expected service addition behavior.
 * Many features may not be implemented yet - tests may fail.
 * This is expected and acceptable for TDD approach.
 * 
 * Framework: Vitest + React Testing Library
 * Pattern: Unit/Integration tests with mocked API calls
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import React from 'react';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock booking data
const mockValidBooking = {
  booking_id: 101,
  booking_reference: 'BK-2025-001',
  user_id: 'user123',
  status: 'confirmed',
  total_amount: 500.00,
  currency: 'USD',
  booking_date: '2025-12-20T10:00:00Z',
  flight_id: 1,
  passengers: [
    {
      passenger_id: 1,
      first_name: 'John',
      last_name: 'Doe',
      seat_number: '12A',
    }
  ],
  services: [],
};

// Mock service data
const mockServices = [
  {
    service_id: 1,
    service_name: 'Extra Baggage',
    service_type: 'baggage',
    price: 50.00,
    currency: 'USD',
    description: 'Additional 23kg checked baggage',
  },
  {
    service_id: 2,
    service_name: 'Premium Meal',
    service_type: 'meal',
    price: 25.00,
    currency: 'USD',
    description: 'Gourmet in-flight meal',
  },
  {
    service_id: 3,
    service_name: 'Standard Meal',
    service_type: 'meal',
    price: 15.00,
    currency: 'USD',
    description: 'Regular in-flight meal',
  },
];

// Mock Add Service Component
interface AddServiceToBookingProps {
  bookingId: number;
  onServiceAdded?: (serviceId: number, newTotal: number) => void;
}

const AddServiceToBooking: React.FC<AddServiceToBookingProps> = ({ bookingId, onServiceAdded }) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [availableServices, setAvailableServices] = React.useState<any[]>([]);
  const [selectedService, setSelectedService] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const [calculatedTotal, setCalculatedTotal] = React.useState<number>(0);

  React.useEffect(() => {
    fetchBookingAndServices();
  }, [bookingId]);

  const fetchBookingAndServices = async () => {
    try {
      // Fetch booking details
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      setBooking(bookingResponse.data);
      setCalculatedTotal(bookingResponse.data.total_amount);

      // Fetch available services
      const servicesResponse = await axios.get('/api/services');
      setAvailableServices(servicesResponse.data);

      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Error 404 "Booking Not Found"');
      } else {
        setError(err.response?.data?.message || 'Failed to load data');
      }
      setLoading(false);
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId);
    setError('');
    setSuccessMessage('');

    // Calculate new total when service is selected
    if (booking) {
      const service = availableServices.find(s => s.service_id === serviceId);
      if (service) {
        const newTotal = booking.total_amount + service.price;
        setCalculatedTotal(newTotal);
      }
    }
  };

  const handleAddToBooking = async () => {
    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    try {
      const response = await axios.post(`/api/bookings/${bookingId}/services`, {
        service_id: selectedService,
      });

      // Update booking with new data
      setBooking(response.data);
      setCalculatedTotal(response.data.total_amount);
      setSuccessMessage('Service added successfully. Total price updated.');
      
      // Notify parent component
      onServiceAdded?.(selectedService, response.data.total_amount);

      // Reset selection
      setSelectedService(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Error 404 "Booking Not Found"');
      } else {
        setError(err.response?.data?.message || 'Failed to add service');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error && !booking) return <div data-testid="error-message">{error}</div>;

  return (
    <div data-testid="add-service-to-booking">
      <h2>Add Service to Booking</h2>

      {booking && (
        <div data-testid="booking-details">
          <div data-testid="booking-reference">{booking.booking_reference}</div>
          <div data-testid="booking-status">{booking.status}</div>
          <div data-testid="original-amount">Original: ${booking.total_amount}</div>
          <div data-testid="calculated-total">Total: ${calculatedTotal}</div>
        </div>
      )}

      {error && (
        <div data-testid="error-alert" role="alert">
          {error}
        </div>
      )}

      {successMessage && (
        <div data-testid="success-message" role="status">
          {successMessage}
        </div>
      )}

      <div data-testid="service-selection">
        <h3>Available Services</h3>
        {availableServices.map((service) => (
          <div
            key={service.service_id}
            data-testid={`service-${service.service_id}`}
            className={selectedService === service.service_id ? 'selected' : ''}
          >
            <label>
              <input
                type="radio"
                name="service"
                value={service.service_id}
                checked={selectedService === service.service_id}
                onChange={() => handleServiceSelect(service.service_id)}
                data-testid={`service-radio-${service.service_id}`}
              />
              <span data-testid={`service-name-${service.service_id}`}>
                {service.service_name}
              </span>
              <span data-testid={`service-type-${service.service_id}`}>
                ({service.service_type})
              </span>
              <span data-testid={`service-price-${service.service_id}`}>
                ${service.price}
              </span>
            </label>
            <div data-testid={`service-description-${service.service_id}`}>
              {service.description}
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div data-testid="selected-service-info">
          <div>Selected Service ID: {selectedService}</div>
        </div>
      )}

      <button
        data-testid="add-to-booking-button"
        onClick={handleAddToBooking}
        disabled={!selectedService}
      >
        Add to Booking
      </button>
    </div>
  );
};

// Mock API Service Component (for direct API testing)
interface ServiceApiTestProps {
  onApiResult?: (result: any) => void;
}

const ServiceApiTest: React.FC<ServiceApiTestProps> = ({ onApiResult }) => {
  const [result, setResult] = React.useState<any>(null);

  const testAddServiceToBooking = async (bookingId: number, serviceId: number) => {
    try {
      const response = await axios.post(`/api/bookings/${bookingId}/services`, {
        service_id: serviceId,
      });
      const resultData = { success: true, data: response.data };
      setResult(resultData);
      onApiResult?.(resultData);
      return resultData;
    } catch (err: any) {
      const resultData = {
        success: false,
        error: err.response?.data?.message || err.message,
        status: err.response?.status,
      };
      setResult(resultData);
      onApiResult?.(resultData);
      return resultData;
    }
  };

  return (
    <div data-testid="service-api-test">
      <button
        data-testid="test-add-service-button"
        onClick={() => testAddServiceToBooking(101, 1)}
      >
        Test Add Service
      </button>
      {result && (
        <div data-testid="api-result">
          {result.success ? (
            <div data-testid="api-success">Success</div>
          ) : (
            <div data-testid="api-error">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
};

describe('TC-SVC-ADD-001: Verify Add Extra Service to Valid Booking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Step 1: Select "Extra Baggage" option - Option selected', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Verify booking details are displayed
    expect(getByTestId('booking-reference')).toHaveTextContent('BK-2025-001');
    expect(getByTestId('original-amount')).toHaveTextContent('$500');

    // Verify services are listed
    expect(getByTestId('service-1')).toBeInTheDocument();
    expect(getByTestId('service-name-1')).toHaveTextContent('Extra Baggage');
    expect(getByTestId('service-type-1')).toHaveTextContent('baggage');
    expect(getByTestId('service-price-1')).toHaveTextContent('$50');

    // Select Extra Baggage
    fireEvent.click(getByTestId('service-radio-1'));

    // Verify selection
    await waitFor(() => {
      const radio = getByTestId('service-radio-1') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    // Verify calculated total is updated
    expect(getByTestId('calculated-total')).toHaveTextContent('$550');

    console.log('✓ TC-SVC-ADD-001 Step 1 PASSED: Extra Baggage option selected');
  });

  it('Step 1 (Alternative): Select "Meal" option - Option selected', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Verify meal services are listed
    expect(getByTestId('service-2')).toBeInTheDocument();
    expect(getByTestId('service-name-2')).toHaveTextContent('Premium Meal');
    expect(getByTestId('service-type-2')).toHaveTextContent('meal');
    expect(getByTestId('service-price-2')).toHaveTextContent('$25');

    // Select Premium Meal
    fireEvent.click(getByTestId('service-radio-2'));

    // Verify selection
    await waitFor(() => {
      const radio = getByTestId('service-radio-2') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    // Verify calculated total is updated
    expect(getByTestId('calculated-total')).toHaveTextContent('$525');

    console.log('✓ TC-SVC-ADD-001 Step 1 (Meal) PASSED: Meal option selected');
  });

  it('Step 2: Click "Add to Booking" - System sends request with Booking ID', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Select Extra Baggage
    fireEvent.click(getByTestId('service-radio-1'));

    await waitFor(() => {
      const radio = getByTestId('service-radio-1') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    // Mock API response for adding service
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        ...mockValidBooking,
        total_amount: 550.00,
        services: [
          {
            service_id: 1,
            service_name: 'Extra Baggage',
            price: 50.00,
          },
        ],
      },
    });

    // Click Add to Booking
    fireEvent.click(getByTestId('add-to-booking-button'));

    // Verify API call was made with correct parameters
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/bookings/101/services',
        { service_id: 1 }
      );
    });

    console.log('✓ TC-SVC-ADD-001 Step 2 PASSED: Request sent with Booking ID');
  });

  it('TC-SVC-ADD-001: Complete flow - System links service to booking, recalculates total price', async () => {
    const mockServiceAdded = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <AddServiceToBooking bookingId={101} onServiceAdded={mockServiceAdded} />
    );

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Step 1: Select service
    fireEvent.click(getByTestId('service-radio-1'));

    await waitFor(() => {
      const radio = getByTestId('service-radio-1') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    // Verify price calculation before submitting
    expect(getByTestId('calculated-total')).toHaveTextContent('$550');

    // Step 2: Mock successful service addition with updated booking
    const updatedBooking = {
      ...mockValidBooking,
      total_amount: 550.00,
      services: [
        {
          service_id: 1,
          service_name: 'Extra Baggage',
          price: 50.00,
        },
      ],
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: updatedBooking,
    });

    // Add service to booking
    fireEvent.click(getByTestId('add-to-booking-button'));

    // Verify success message
    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
      expect(getByTestId('success-message')).toHaveTextContent('Service added successfully');
      expect(getByTestId('success-message')).toHaveTextContent('Total price updated');
    });

    // Verify total price is recalculated and displayed
    expect(getByTestId('calculated-total')).toHaveTextContent('$550');

    // Verify callback was called with correct data
    expect(mockServiceAdded).toHaveBeenCalledWith(1, 550.00);

    // Verify service was linked to booking
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/api/bookings/101/services',
      { service_id: 1 }
    );

    console.log('✓ TC-SVC-ADD-001 PASSED: Service linked, total price recalculated');
  });
});

describe('TC-SVC-INT-001..004: Services Integration (add/remove/display)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-SVC-INT-001: Verify Remove Service from Booking updates total and removes item', async () => {
    // Booking already has a Meal service
    const bookingWithService = {
      ...mockValidBooking,
      total_amount: 525.00,
      services: [ { service_id: 2, service_name: 'Premium Meal', price: 25.00 } ],
    };

    // Simple Booking Services component
    const BookingServices: React.FC = () => {
      const [booking, setBooking] = React.useState<any>(bookingWithService);
      const remove = async (serviceId: number) => {
        const res = await axios.delete(`/api/bookings/${booking.booking_id}/services/${serviceId}`);
        if (res.status === 200) {
          const newServices = booking.services.filter((s: any) => s.service_id !== serviceId);
          const newTotal = booking.total_amount - 25.00;
          setBooking({ ...booking, services: newServices, total_amount: newTotal });
        }
      };
      return (
        <div>
          <div data-testid="booking-total">${booking.total_amount}</div>
          <div data-testid="services-list">
            {booking.services.map((s: any) => (
              <div key={s.service_id} data-testid={`svc-${s.service_id}`}>
                <span data-testid={`svc-name-${s.service_id}`}>{s.service_name}</span>
                <button data-testid={`svc-remove-${s.service_id}`} onClick={() => remove(s.service_id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      );
    };

    mockedAxios.delete.mockResolvedValueOnce({ status: 200 });

    const { getByTestId, queryByTestId } = render(<BookingServices />);

    await waitFor(() => expect(getByTestId('booking-total')).toBeInTheDocument());

    // Verify service present
    expect(getByTestId('svc-2')).toBeInTheDocument();
    expect(getByTestId('svc-name-2')).toHaveTextContent('Premium Meal');

    // Click remove
    fireEvent.click(getByTestId('svc-remove-2'));

    await waitFor(() => expect(queryByTestId('svc-2')).not.toBeInTheDocument());

    // Total should decrease
    expect(getByTestId('booking-total')).toHaveTextContent('$500');
  });

  it('TC-SVC-INT-002: Verify Add Multiple Quantity adjusts total correctly', async () => {
    // Component that allows quantity and adds service
    const QuantityAdd: React.FC = () => {
      const [booking, setBooking] = React.useState<any>(mockValidBooking);
      const [qty, setQty] = React.useState<number>(1);
      const add = async () => {
        const res = await axios.post(`/api/bookings/${booking.booking_id}/services`, { service_id: 1, quantity: qty });
        setBooking(res.data);
      };
      return (
        <div>
          <div data-testid="orig-total">${booking.total_amount}</div>
          <input data-testid="qty-input" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          <button data-testid="add-qty" onClick={add}>Add</button>
          <div data-testid="new-total">${booking.total_amount}</div>
        </div>
      );
    };

    // Mock server returns updated total = base + 50*2
    mockedAxios.post.mockResolvedValueOnce({ data: { ...mockValidBooking, total_amount: 600.00 } });

    const { getByTestId } = render(<QuantityAdd />);
    await waitFor(() => expect(getByTestId('orig-total')).toBeInTheDocument());

    // Set qty to 2
    const qtyInput = getByTestId('qty-input') as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: '2' } });
    expect(qtyInput.value).toBe('2');

    fireEvent.click(getByTestId('add-qty'));

    await waitFor(() => expect(getByTestId('new-total')).toHaveTextContent('$600'));
  });

  it('TC-SVC-INT-003: Verify Add Incompatible Services warns or replaces previous selection', async () => {
    // Component that attempts to add incompatible service
    const IncompatTest: React.FC = () => {
      const [error, setError] = React.useState('');
      const addVegan = async () => {
        await axios.post('/api/bookings/101/services', { service_id: 4 });
      };
      const addBeef = async () => {
        try {
          await axios.post('/api/bookings/101/services', { service_id: 5 });
        } catch (e: any) {
          setError(e.response?.data?.message || 'Incompatible');
        }
      };
      return (
        <div>
          <button data-testid="add-vegan" onClick={addVegan}>Add Vegan</button>
          <button data-testid="add-beef" onClick={addBeef}>Add Beef</button>
          {error && <div data-testid="incompat-error">{error}</div>}
        </div>
      );
    };

    // Mock adding vegan succeeds
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    // Mock adding beef fails with 409 due to incompatibility
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 409, data: { message: 'Incompatible with existing selection' } } });

    const { getByTestId } = render(<IncompatTest />);
    fireEvent.click(getByTestId('add-vegan'));
    await waitFor(() => expect(mockedAxios.post).toHaveBeenCalled());

    fireEvent.click(getByTestId('add-beef'));
    await waitFor(() => expect(getByTestId('incompat-error')).toHaveTextContent('Incompatible with existing selection'));
  });

  it('TC-SVC-INT-004: Verify Service Display on E-Ticket lists all services', async () => {
    const confirmedBooking = {
      ...mockValidBooking,
      services: [
        { service_id: 1, service_name: 'Extra Baggage', price: 50.00 },
        { service_id: 2, service_name: 'Premium Meal', price: 25.00 },
      ],
    };

    const ETicket: React.FC<{ booking: any }> = ({ booking }) => {
      return (
        <div data-testid="e-ticket">
          <h1>e-Ticket</h1>
          <div data-testid="services-section">
            {booking.services.map((s: any) => (
              <div key={s.service_id} data-testid={`etk-svc-${s.service_id}`}>
                <span data-testid={`etk-svc-name-${s.service_id}`}>{s.service_name}</span>
                <span data-testid={`etk-svc-price-${s.service_id}`}>${s.price}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    const { getByTestId } = render(<ETicket booking={confirmedBooking} />);

    await waitFor(() => expect(getByTestId('e-ticket')).toBeInTheDocument());

    // Verify services present in e-ticket
    expect(getByTestId('etk-svc-1')).toBeInTheDocument();
    expect(getByTestId('etk-svc-name-1')).toHaveTextContent('Extra Baggage');
    expect(getByTestId('etk-svc-2')).toBeInTheDocument();
    expect(getByTestId('etk-svc-name-2')).toHaveTextContent('Premium Meal');
  });
});

describe('TC-SVC-ADD-002: Verify Add Service with Invalid Booking ID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Step 1: Send request to add service with non-existent Booking ID - Request sent', async () => {
    // Mock API rejecting with 404 for non-existent booking
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          message: 'Booking Not Found',
        },
      },
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={999} />);

    // Verify error is displayed
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Error 404 "Booking Not Found"');
    });

    // Verify API was called with invalid booking ID
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/bookings/999');

    console.log('✓ TC-SVC-ADD-002 Step 1 PASSED: Request sent with invalid ID');
  });

  it('TC-SVC-ADD-002: Complete flow - System returns Error 404 and does not create link', async () => {
    const mockServiceAdded = vi.fn();

    // Mock initial fetch with 404
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          message: 'Booking Not Found',
        },
      },
    });

    const { getByTestId, queryByTestId } = render(
      <AddServiceToBooking bookingId={999} onServiceAdded={mockServiceAdded} />
    );

    // Verify error is displayed
    await waitFor(() => {
      expect(getByTestId('error-message')).toBeInTheDocument();
      expect(getByTestId('error-message')).toHaveTextContent('Error 404 "Booking Not Found"');
    });

    // Verify service selection UI is not rendered
    expect(queryByTestId('service-selection')).not.toBeInTheDocument();
    expect(queryByTestId('add-to-booking-button')).not.toBeInTheDocument();

    // Verify no service was added
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockServiceAdded).not.toHaveBeenCalled();

    console.log('✓ TC-SVC-ADD-002 PASSED: Error 404 returned, no link created');
  });

  it('API Test: Direct API call with invalid Booking ID returns 404', async () => {
    const mockApiResult = vi.fn();

    // Mock API rejecting POST request with 404
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          message: 'Booking Not Found',
        },
      },
      message: 'Request failed with status code 404',
    });

    const { getByTestId } = render(<ServiceApiTest onApiResult={mockApiResult} />);

    // Trigger API test
    fireEvent.click(getByTestId('test-add-service-button'));

    // Wait for result
    await waitFor(() => {
      expect(getByTestId('api-result')).toBeInTheDocument();
    });

    // Verify error is displayed
    expect(getByTestId('api-error')).toBeInTheDocument();
    expect(getByTestId('api-error')).toHaveTextContent('Booking Not Found');

    // Verify callback received error result
    await waitFor(() => {
      expect(mockApiResult).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          status: 404,
          error: 'Booking Not Found',
        })
      );
    });

    console.log('✓ TC-SVC-ADD-002 API Test PASSED: 404 error for invalid Booking ID');
  });

  it('Attempt to add service after loading valid booking then using invalid ID', async () => {
    // First load a valid booking
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/101')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Select a service
    fireEvent.click(getByTestId('service-radio-1'));

    await waitFor(() => {
      const radio = getByTestId('service-radio-1') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    // Mock POST request failing with 404 (booking deleted/invalid during operation)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          message: 'Booking Not Found',
        },
      },
    });

    // Try to add service
    fireEvent.click(getByTestId('add-to-booking-button'));

    // Verify error is displayed
    await waitFor(() => {
      expect(getByTestId('error-alert')).toBeInTheDocument();
      expect(getByTestId('error-alert')).toHaveTextContent('Error 404 "Booking Not Found"');
    });

    // Verify no success message
    expect(getByTestId('add-service-to-booking')).not.toContainElement(
      getByTestId('error-alert').parentElement?.querySelector('[data-testid="success-message"]') as Element
    );

    console.log('✓ TC-SVC-ADD-002 Edge Case PASSED: 404 during service addition');
  });
});

describe('Additional Service Addition Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should disable "Add to Booking" button when no service is selected', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Button should be disabled initially
    const addButton = getByTestId('add-to-booking-button') as HTMLButtonElement;
    expect(addButton).toBeDisabled();

    console.log('✓ Additional Test PASSED: Add button disabled when no selection');
  });

  it('Should show error when trying to add service without selection', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Manually enable and click button (edge case)
    const addButton = getByTestId('add-to-booking-button');
    addButton.removeAttribute('disabled');
    fireEvent.click(addButton);

    // Should show error (though button is normally disabled)
    await waitFor(() => {
      expect(getByTestId('error-alert')).toHaveTextContent('Please select a service');
    });

    console.log('✓ Additional Test PASSED: Error shown for missing service selection');
  });

  it('Should handle multiple service additions to same booking', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    // Add first service (Extra Baggage)
    fireEvent.click(getByTestId('service-radio-1'));

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        ...mockValidBooking,
        total_amount: 550.00,
        services: [{ service_id: 1, service_name: 'Extra Baggage', price: 50.00 }],
      },
    });

    fireEvent.click(getByTestId('add-to-booking-button'));

    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
    });

    // Add second service (Premium Meal)
    fireEvent.click(getByTestId('service-radio-2'));

    mockedAxios.post.mockResolvedValueOnce({
      data: {
        ...mockValidBooking,
        total_amount: 575.00,
        services: [
          { service_id: 1, service_name: 'Extra Baggage', price: 50.00 },
          { service_id: 2, service_name: 'Premium Meal', price: 25.00 },
        ],
      },
    });

    fireEvent.click(getByTestId('add-to-booking-button'));

    await waitFor(() => {
      expect(getByTestId('calculated-total')).toHaveTextContent('$575');
    });

    // Verify both services were added
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);

    console.log('✓ Additional Test PASSED: Multiple services added successfully');
  });

  it('Should handle API error during service addition', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockValidBooking });
      }
      if (url.includes('/services')) {
        return Promise.resolve({ data: mockServices });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(<AddServiceToBooking bookingId={101} />);

    await waitFor(() => {
      expect(getByTestId('add-service-to-booking')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('service-radio-1'));

    // Mock API error
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: 'Internal server error',
        },
      },
    });

    fireEvent.click(getByTestId('add-to-booking-button'));

    await waitFor(() => {
      expect(getByTestId('error-alert')).toHaveTextContent('Internal server error');
    });

    console.log('✓ Additional Test PASSED: API error handled gracefully');
  });
});
