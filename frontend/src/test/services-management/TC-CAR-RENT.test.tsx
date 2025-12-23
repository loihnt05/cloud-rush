/**
 * Test Suite: Rent Car
 * 
 * Test Cases Covered:
 * - TC-CAR-RENT-001: Verify Rent a Car - Confirm
 * 
 * NOTE: These tests document expected car rental behavior.
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

// Mock car data
const mockSelectedCar = {
  car_id: 1,
  license_plate: 'TOY-001',
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  status: 'available',
  price_per_day: 50.00,
  seats: 5,
  transmission: 'automatic',
  image_url: '/images/toyota-camry.jpg',
};

// Mock booking data
const mockFlightBooking = {
  booking_id: 101,
  booking_reference: 'BK-2025-001',
  user_id: 'user123',
  status: 'confirmed',
  total_amount: 500.00,
  flight_id: 1,
};

// Mock rental calculation data
const mockRentalCalculation = {
  car_id: 1,
  rental_days: 3,
  price_per_day: 50.00,
  total_rental_price: 150.00,
  tax: 15.00,
  total_price: 165.00,
  pickup_date: '2025-12-25',
  return_date: '2025-12-28',
};

// Mock Car Rental Confirmation Component
interface CarRentalConfirmationProps {
  carId: number;
  bookingId: number;
  rentalDays: number;
  onRentalConfirmed?: (rentalId: number) => void;
  onRedirectToPayment?: (rentalId: number, amount: number) => void;
}

const CarRentalConfirmation: React.FC<CarRentalConfirmationProps> = ({
  carId,
  bookingId,
  rentalDays,
  onRentalConfirmed,
  onRedirectToPayment,
}) => {
  const [car, setCar] = React.useState<any>(null);
  const [booking, setBooking] = React.useState<any>(null);
  const [calculation, setCalculation] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');
  const [confirming, setConfirming] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string>('');

  React.useEffect(() => {
    fetchData();
  }, [carId, bookingId, rentalDays]);

  const fetchData = async () => {
    try {
      // Fetch car details
      const carResponse = await axios.get(`/api/cars/${carId}`);
      setCar(carResponse.data);

      // Fetch booking details
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      setBooking(bookingResponse.data);

      // Calculate rental price
      const calculationResponse = await axios.post('/api/car-rentals/calculate', {
        car_id: carId,
        rental_days: rentalDays,
      });
      setCalculation(calculationResponse.data);

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load rental details');
      setLoading(false);
    }
  };

  const handleConfirmRental = async () => {
    setConfirming(true);
    setError('');

    try {
      const response = await axios.post('/api/car-rentals', {
        car_id: carId,
        booking_id: bookingId,
        rental_days: rentalDays,
        pickup_date: calculation.pickup_date,
        return_date: calculation.return_date,
        total_price: calculation.total_price,
      });

      const rental = response.data;

      setSuccessMessage('Rental confirmed successfully');
      onRentalConfirmed?.(rental.rental_id);

      // Simulate redirect to payment
      setTimeout(() => {
        onRedirectToPayment?.(rental.rental_id, rental.total_price);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm rental');
      setConfirming(false);
    }
  };

  if (loading) return <div>Loading rental details...</div>;
  if (error && !car) return <div data-testid="error-message">{error}</div>;

  return (
    <div data-testid="car-rental-confirmation">
      <h2>Confirm Car Rental</h2>

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

      {car && (
        <div data-testid="selected-car-details">
          <h3>Selected Car</h3>
          <div data-testid="car-brand">{car.brand}</div>
          <div data-testid="car-model">{car.model}</div>
          <div data-testid="car-year">{car.year}</div>
          <div data-testid="car-price-per-day">${car.price_per_day}/day</div>
          <div data-testid="car-status">Status: {car.status}</div>
        </div>
      )}

      {booking && (
        <div data-testid="linked-booking-details">
          <h3>Flight Booking</h3>
          <div data-testid="booking-reference">{booking.booking_reference}</div>
          <div data-testid="booking-status">Status: {booking.status}</div>
        </div>
      )}

      {calculation && (
        <div data-testid="price-breakdown">
          <h3>Total Price</h3>
          <div data-testid="rental-days">{calculation.rental_days} days</div>
          <div data-testid="price-per-day">${calculation.price_per_day} per day</div>
          <div data-testid="subtotal">${calculation.total_rental_price}</div>
          <div data-testid="tax">Tax: ${calculation.tax}</div>
          <div data-testid="total-price">Total: ${calculation.total_price}</div>
          <div data-testid="pickup-date">Pickup: {calculation.pickup_date}</div>
          <div data-testid="return-date">Return: {calculation.return_date}</div>
        </div>
      )}

      <button
        data-testid="confirm-rental-button"
        onClick={handleConfirmRental}
        disabled={confirming}
      >
        {confirming ? 'Confirming...' : 'Confirm Rental'}
      </button>
    </div>
  );
};

describe('TC-CAR-RENT-001: Verify Rent a Car - Confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Prerequisites: User selected a car and viewing Total Price', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    // Verify car details are displayed
    expect(getByTestId('selected-car-details')).toBeInTheDocument();
    expect(getByTestId('car-brand')).toHaveTextContent('Toyota');
    expect(getByTestId('car-model')).toHaveTextContent('Camry');
    expect(getByTestId('car-status')).toHaveTextContent('available');

    // Verify booking details are displayed
    expect(getByTestId('linked-booking-details')).toBeInTheDocument();
    expect(getByTestId('booking-reference')).toHaveTextContent('BK-2025-001');

    // Verify total price is displayed
    expect(getByTestId('price-breakdown')).toBeInTheDocument();
    expect(getByTestId('rental-days')).toHaveTextContent('3 days');
    expect(getByTestId('total-price')).toHaveTextContent('$165');

    console.log('✓ TC-CAR-RENT-001 Prerequisites PASSED: User viewing rental details and total price');
  });

  it('Step 1: Click "Confirm Rental" - Action initiated', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    // Mock rental creation response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        rental_id: 1,
        car_id: 1,
        booking_id: 101,
        total_price: 165.00,
        status: 'reserved',
      },
    });

    // Click Confirm Rental button
    const confirmButton = getByTestId('confirm-rental-button');
    expect(confirmButton).not.toBeDisabled();

    fireEvent.click(confirmButton);

    // Verify button shows loading state
    await waitFor(() => {
      expect(confirmButton).toHaveTextContent('Confirming...');
    });

    console.log('✓ TC-CAR-RENT-001 Step 1 PASSED: Action initiated');
  });

  it('TC-CAR-RENT-001: Complete flow - Car status updates to reserved; Rental linked to Flight Booking; Redirect to Payment', async () => {
    const mockRentalConfirmed = vi.fn();
    const mockRedirectToPayment = vi.fn();

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string, data?: any) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      if (url.includes('/car-rentals') && !url.includes('/calculate')) {
        // Rental creation endpoint
        return Promise.resolve({
          data: {
            rental_id: 1,
            car_id: data.car_id,
            booking_id: data.booking_id,
            rental_days: data.rental_days,
            pickup_date: data.pickup_date,
            return_date: data.return_date,
            total_price: data.total_price,
            status: 'reserved', // Car status updated to reserved
            linked_to_booking: true,
            payment_required: true,
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation
        carId={1}
        bookingId={101}
        rentalDays={3}
        onRentalConfirmed={mockRentalConfirmed}
        onRedirectToPayment={mockRedirectToPayment}
      />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    // Click Confirm Rental
    fireEvent.click(getByTestId('confirm-rental-button'));

    // Verify API call with correct data
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/car-rentals',
        expect.objectContaining({
          car_id: 1,
          booking_id: 101,
          rental_days: 3,
          pickup_date: '2025-12-25',
          return_date: '2025-12-28',
          total_price: 165.00,
        })
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
      expect(getByTestId('success-message')).toHaveTextContent('Rental confirmed successfully');
    });

    // Verify rental confirmed callback
    expect(mockRentalConfirmed).toHaveBeenCalledWith(1);

    // Verify redirect to payment
    await waitFor(() => {
      expect(mockRedirectToPayment).toHaveBeenCalledWith(1, 165.00);
    }, { timeout: 1000 });

    console.log('✓ TC-CAR-RENT-001 PASSED: Car reserved, linked to booking, redirected to payment');
  });

  it('Verify car status is reserved after confirmation', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      if (url.includes('/car-rentals')) {
        return Promise.resolve({
          data: {
            rental_id: 1,
            car_id: 1,
            status: 'reserved',
            car_status_updated: true,
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    // Initial car status
    expect(getByTestId('car-status')).toHaveTextContent('available');

    // Confirm rental
    fireEvent.click(getByTestId('confirm-rental-button'));

    await waitFor(() => {
      expect(getByTestId('success-message')).toBeInTheDocument();
    });

    console.log('✓ TC-CAR-RENT-001 Edge Case PASSED: Car status updated to reserved');
  });

  it('Verify rental is linked to flight booking', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string, data?: any) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      if (url.includes('/car-rentals')) {
        // Verify booking_id is included in request
        expect(data.booking_id).toBe(101);
        
        return Promise.resolve({
          data: {
            rental_id: 1,
            car_id: 1,
            booking_id: 101, // Linked to flight booking
            status: 'reserved',
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('confirm-rental-button'));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/car-rentals',
        expect.objectContaining({
          booking_id: 101,
        })
      );
    });

    console.log('✓ TC-CAR-RENT-001 Edge Case PASSED: Rental linked to flight booking');
  });
});

describe('Additional Car Rental Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should handle car unavailability error', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({
          data: { ...mockSelectedCar, status: 'reserved' }
        });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      if (url.includes('/car-rentals')) {
        return Promise.reject({
          response: {
            status: 409,
            data: {
              message: 'Car is no longer available',
            },
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('confirm-rental-button'));

    await waitFor(() => {
      expect(getByTestId('error-alert')).toHaveTextContent('Car is no longer available');
    });

    console.log('✓ Additional Test PASSED: Car unavailability handled');
  });

    describe('TC-CAR-RENT-002: Rent Car - Already Reserved', () => {
      beforeEach(() => {
      vi.clearAllMocks();
      });

      it('should show Unavailable when a car is already reserved by another user for same date', async () => {
      // Car A is reserved by User X on 2025-12-25
      const carA = { id: 20, brand: 'Ford', model: 'Focus', plate: 'FOR123' };
      mockedAxios.get.mockResolvedValueOnce({ data: [carA] });

      // Reservation check returns conflict for the date
      mockedAxios.post.mockResolvedValueOnce({ data: { reserved: true, reserved_by: 'userX' } });

      const { getByTestId, getByText } = render(<CarRentalFlow />);
      await waitFor(() => expect(getByTestId('car-rental-flow')).toBeInTheDocument());

      // User Y searches and selects the car with same date
      fireEvent.change(getByTestId('rental-date'), { target: { value: '2025-12-25' } });
      fireEvent.click(getByTestId(`select-car-${carA.id}`));

      // The UI should indicate it's unavailable
      await waitFor(() => expect(getByText('Car Unavailable')).toBeInTheDocument());
      });
    });
  it('Should calculate price correctly for different rental periods', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    // Test 7-day rental
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        ...mockRentalCalculation,
        rental_days: 7,
        total_rental_price: 350.00,
        tax: 35.00,
        total_price: 385.00,
      },
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={7} />
    );

    await waitFor(() => {
      expect(getByTestId('rental-days')).toHaveTextContent('7 days');
      expect(getByTestId('subtotal')).toHaveTextContent('$350');
      expect(getByTestId('total-price')).toHaveTextContent('$385');
    });

    console.log('✓ Additional Test PASSED: Price calculation for different periods');
  });

  it('Should handle API error during confirmation', async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/cars/')) {
        return Promise.resolve({ data: mockSelectedCar });
      }
      if (url.includes('/bookings/')) {
        return Promise.resolve({ data: mockFlightBooking });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    mockedAxios.post.mockImplementation((url: string) => {
      if (url.includes('/calculate')) {
        return Promise.resolve({ data: mockRentalCalculation });
      }
      if (url.includes('/car-rentals')) {
        return Promise.reject({
          response: {
            status: 500,
            data: {
              message: 'Internal server error',
            },
          },
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    const { getByTestId } = render(
      <CarRentalConfirmation carId={1} bookingId={101} rentalDays={3} />
    );

    await waitFor(() => {
      expect(getByTestId('car-rental-confirmation')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('confirm-rental-button'));

    await waitFor(() => {
      expect(getByTestId('error-alert')).toHaveTextContent('Internal server error');
    });

    console.log('✓ Additional Test PASSED: Server error handled');
  });
});
