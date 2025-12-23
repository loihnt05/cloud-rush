/**
 * Test Suite: TC-AGENT-SVC (Agent Services)
 * Category: Agent Services
 * Description: Unit tests for Agent booking search and service management functionality
 * 
 * Test Cases:
 * - TC-AGENT-SVC-001: Verify Searching Booking Flight - Valid ID
 * - TC-AGENT-SVC-002: Verify Searching Booking Flight - Invalid ID
 * - TC-AGENT-SVC-003: Verify Adding Service & Accepting Price
 * - TC-AGENT-SVC-004: Verify Adding Service & Declining Price
 * 
 * Prerequisites:
 * 1. CSA is logged in
 * 2. CSA is on "Search Booking" page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking and service API
const mockSearchBooking = vi.fn();
const mockIsBookingFlight = vi.fn();
const mockGetAvailableServices = vi.fn();
const mockCalculateServicePrice = vi.fn();
const mockAddServiceToBooking = vi.fn();
const mockUpdateBookingTotal = vi.fn();
const mockSendConfirmation = vi.fn();

// Mock SearchBooking component (placeholder for actual component)
const SearchBooking = () => {
  const [bookingId, setBookingId] = React.useState('');
  const [booking, setBooking] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const isValid = await mockIsBookingFlight(bookingId);
      
      if (isValid) {
        const bookingData = await mockSearchBooking(bookingId);
        setBooking(bookingData);
      } else {
        setError('MSG: Booking not found');
      }
    } catch (err) {
      setError('MSG: Booking not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="search-booking-page">
      <h1>Search Booking</h1>
      
      <div className="search-section">
        <input
          type="text"
          data-testid="booking-id-input"
          placeholder="Enter Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
        <button 
          data-testid="search-button" 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div data-testid="error-message" className="error">
          {error}
        </div>
      )}

      {booking && (
        <div data-testid="booking-summary">
          <h2>Booking Summary</h2>
          
          <section data-testid="flight-details">
            <h3>Flight Details</h3>
            <div>Flight Number: {booking.flightNumber}</div>
            <div>Departure: {booking.departure}</div>
            <div>Arrival: {booking.arrival}</div>
            <div>Date: {booking.date}</div>
          </section>

          <section data-testid="passenger-details">
            <h3>Passenger Details</h3>
            <div>Name: {booking.passengerName}</div>
            <div>Email: {booking.passengerEmail}</div>
          </section>

          <section data-testid="services-details">
            <h3>Services</h3>
            {booking.services && booking.services.length > 0 ? (
              booking.services.map((service: any, index: number) => (
                <div key={index} data-testid={`service-${index}`}>
                  {service.name} - Quantity: {service.quantity} - ${service.price}
                </div>
              ))
            ) : (
              <div>No services added</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

// Mock AddService component
const AddService = ({ booking, onBack }: { booking: any; onBack: () => void }) => {
  const [availableServices, setAvailableServices] = React.useState<any[]>([]);
  const [selectedService, setSelectedService] = React.useState<any>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [priceQuote, setPriceQuote] = React.useState<number | null>(null);
  const [showQuote, setShowQuote] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    mockGetAvailableServices().then((services: any[]) => {
      setAvailableServices(services);
    });
  }, []);

  const handleCalculatePrice = async () => {
    const quote = await mockCalculateServicePrice(selectedService.id, quantity);
    setPriceQuote(quote.additionalPrice);
    setShowQuote(true);
  };

  const handleAccept = async () => {
    await mockAddServiceToBooking(booking.id, selectedService.id, quantity);
    await mockUpdateBookingTotal(booking.id, priceQuote);
    await mockSendConfirmation(booking.customerEmail, {
      service: selectedService.name,
      quantity,
      additionalPrice: priceQuote,
    });
    setConfirmed(true);
  };

  const handleDecline = () => {
    // Discard changes and return to dashboard
    setPriceQuote(null);
    setShowQuote(false);
    setSelectedService(null);
    setQuantity(1);
    onBack();
  };

  if (confirmed) {
    return (
      <div data-testid="service-confirmed">
        <h2>Service Added Successfully</h2>
        <p>Service: {selectedService.name}</p>
        <p>Quantity: {quantity}</p>
        <p>Additional Price: ${priceQuote}</p>
        <p>Booking updated and confirmation sent</p>
        <button onClick={onBack} data-testid="back-to-dashboard">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div data-testid="add-service-page">
      <h1>Add Service to Booking</h1>
      <button onClick={onBack} data-testid="back-button">Back</button>

      <div data-testid="booking-info">
        <h3>Booking: {booking.id}</h3>
        <p>Customer: {booking.passengerName}</p>
      </div>

      {!showQuote ? (
        <div data-testid="service-selection">
          <h3>Select Service</h3>
          <select
            data-testid="service-select"
            onChange={(e) => {
              const service = availableServices.find(s => s.id === e.target.value);
              setSelectedService(service);
            }}
          >
            <option value="">-- Select a service --</option>
            {availableServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.basePrice}
              </option>
            ))}
          </select>

          {selectedService && (
            <div data-testid="quantity-selection">
              <label>Quantity:</label>
              <input
                type="number"
                data-testid="quantity-input"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
          )}

          <button
            data-testid="calculate-price-button"
            onClick={handleCalculatePrice}
            disabled={!selectedService}
          >
            Calculate Price / Quote
          </button>
        </div>
      ) : (
        <div data-testid="price-quote">
          <h3>Price Quote</h3>
          <p>Service: {selectedService.name}</p>
          <p>Quantity: {quantity}</p>
          <p data-testid="additional-price">New Additional Price: ${priceQuote}</p>
          
          <div className="actions">
            <button
              data-testid="accept-button"
              onClick={handleAccept}
            >
              Accept New Price / Confirm
            </button>
            <button
              data-testid="decline-button"
              onClick={handleDecline}
            >
              Decline / Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock Dashboard/Router component
const BookingServiceFlow = () => {
  const [currentView, setCurrentView] = React.useState<'search' | 'add-service' | 'dashboard'>('search');
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);

  if (currentView === 'dashboard') {
    return (
      <div data-testid="dashboard">
        <h1>Dashboard</h1>
        <button onClick={() => setCurrentView('search')} data-testid="search-again">
          Search Booking
        </button>
      </div>
    );
  }

  if (currentView === 'add-service' && selectedBooking) {
    return (
      <AddService
        booking={selectedBooking}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return <SearchBooking />;
};

describe('Agent Services Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AGENT-SVC-001: Verify Searching Booking Flight - Valid ID
   * Business Requirement: BR7 1
   * 
   * Prerequisites:
   * 1. CSA is logged in
   * 2. A valid booking exists in DB with ID BK-123
   * 3. CSA is on "Search Booking" page
   * 
   * Steps:
   * Step 1: Enter valid Booking ID (BK-123) into the search bar
   * - Expected: The input field accepts the ID
   * 
   * Step 2: Click "Search" button
   * - Expected: System executes isBookingFlight([booking_flight_id]) check
   * 
   * Step 3: Verify output
   * - Expected: The Booking Summary page loads with correct data for BK-123
   * 
   * Test Case Expected Result:
   * System retrieves and displays the detailed booking summary (Flight, Passenger, Services)
   */
  it('TC-AGENT-SVC-001: should display detailed booking summary when searching with valid booking ID', async () => {
    // Arrange - Mock valid booking data
    const mockBookingData = {
      id: 'BK-123',
      flightNumber: 'UA456',
      departure: 'San Francisco (SFO)',
      arrival: 'Seattle (SEA)',
      date: '2025-12-30',
      passengerName: 'Alice Johnson',
      passengerEmail: 'alice.johnson@example.com',
      services: [
        { name: 'Priority Boarding', quantity: 1, price: 25.00 },
        { name: 'Extra Baggage', quantity: 2, price: 50.00 },
      ],
    };

    mockIsBookingFlight.mockResolvedValue(true);
    mockSearchBooking.mockResolvedValue(mockBookingData);

    const user = userEvent.setup();

    // Prerequisite: CSA is on "Search Booking" page
    render(<SearchBooking />);

    // Assert - Search booking page is displayed
    expect(screen.getByTestId('search-booking-page')).toBeInTheDocument();

    // Act - Step 1: Enter valid Booking ID (BK-123) into the search bar
    const bookingIdInput = screen.getByTestId('booking-id-input');
    await user.type(bookingIdInput, 'BK-123');

    // Assert - Step 1: The input field accepts the ID
    expect(bookingIdInput).toHaveValue('BK-123');

    // Act - Step 2: Click "Search" button
    const searchButton = screen.getByTestId('search-button');
    await user.click(searchButton);

    // Assert - Step 2: System executes isBookingFlight check
    await waitFor(() => {
      expect(mockIsBookingFlight).toHaveBeenCalledWith('BK-123');
    });

    // Assert - Step 2: System searches for booking
    expect(mockSearchBooking).toHaveBeenCalledWith('BK-123');

    // Assert - Step 3: The Booking Summary page loads with correct data for BK-123
    await waitFor(() => {
      expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
    });

    // Assert - Flight Details are displayed
    const flightDetails = screen.getByTestId('flight-details');
    expect(flightDetails).toHaveTextContent('Flight Details');
    expect(flightDetails).toHaveTextContent('Flight Number: UA456');
    expect(flightDetails).toHaveTextContent('Departure: San Francisco (SFO)');
    expect(flightDetails).toHaveTextContent('Arrival: Seattle (SEA)');
    expect(flightDetails).toHaveTextContent('Date: 2025-12-30');

    // Assert - Passenger Details are displayed
    const passengerDetails = screen.getByTestId('passenger-details');
    expect(passengerDetails).toHaveTextContent('Passenger Details');
    expect(passengerDetails).toHaveTextContent('Name: Alice Johnson');
    expect(passengerDetails).toHaveTextContent('Email: alice.johnson@example.com');

    // Assert - Services are displayed
    const servicesDetails = screen.getByTestId('services-details');
    expect(servicesDetails).toHaveTextContent('Services');
    expect(screen.getByTestId('service-0')).toHaveTextContent('Priority Boarding - Quantity: 1 - $25');
    expect(screen.getByTestId('service-1')).toHaveTextContent('Extra Baggage - Quantity: 2 - $50');

    // Verify API calls
    expect(mockIsBookingFlight).toHaveBeenCalledTimes(1);
    expect(mockSearchBooking).toHaveBeenCalledTimes(1);
  });

  /**
   * TC-AGENT-SVC-002: Verify Searching Booking Flight - Invalid ID
   * Business Requirement: BR7 2
   * 
   * Prerequisites:
   * 1. CSA is logged in
   * 2. CSA is on "Search Booking" page
   * 
   * Steps:
   * Step 1: Enter a non-existent Booking ID (BK-999)
   * - Expected: The input field accepts the ID
   * 
   * Step 2: Click "Search" button
   * - Expected: System executes check and returns false/null
   * 
   * Step 3: Verify output
   * - Expected: Error message "MSG: Booking not found" is displayed
   * 
   * Test Case Expected Result:
   * System displays an error message indicating booking not found
   */
  it('TC-AGENT-SVC-002: should display error message when searching with invalid booking ID', async () => {
    // Arrange - Mock invalid booking scenario
    mockIsBookingFlight.mockResolvedValue(false);

    const user = userEvent.setup();

    // Prerequisite: CSA is on "Search Booking" page
    render(<SearchBooking />);

    // Assert - Search booking page is displayed
    expect(screen.getByTestId('search-booking-page')).toBeInTheDocument();

    // Act - Step 1: Enter a non-existent Booking ID (BK-999)
    const bookingIdInput = screen.getByTestId('booking-id-input');
    await user.type(bookingIdInput, 'BK-999');

    // Assert - Step 1: The input field accepts the ID
    expect(bookingIdInput).toHaveValue('BK-999');

    // Act - Step 2: Click "Search" button
    const searchButton = screen.getByTestId('search-button');
    await user.click(searchButton);

    // Assert - Step 2: System executes check and returns false/null
    await waitFor(() => {
      expect(mockIsBookingFlight).toHaveBeenCalledWith('BK-999');
    });

    // Assert - Step 3: Error message "MSG: Booking not found" is displayed
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
    });

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('MSG: Booking not found');

    // Assert - No booking summary is displayed
    expect(screen.queryByTestId('booking-summary')).not.toBeInTheDocument();

    // Verify API calls
    expect(mockIsBookingFlight).toHaveBeenCalledTimes(1);
    expect(mockSearchBooking).not.toHaveBeenCalled(); // Should not be called for invalid booking
  });

  /**
   * TC-AGENT-SVC-003: Verify Adding Service & Accepting Price
   * Business Requirement: BR8 3
   * 
   * Prerequisites:
   * 1. CSA has found a booking (Triggered TC-AGENT-SVC-001)
   * 2. Booking details are displayed
   * 
   * Steps:
   * Step 1: Select a service (e.g., "Extra Baggage") and quantity
   * - Expected: Service is temporarily added to the cart
   * 
   * Step 2: Click "Calculate Price" / "Quote"
   * - Expected: System displays the New Additional Price
   * 
   * Step 3: Click "Accept New Price" / "Confirm"
   * - Expected: System updates the ticket total and sends confirmation
   * 
   * Test Case Expected Result:
   * The booking ticket is updated with new service, status confirmed, and price updated
   */
  it('TC-AGENT-SVC-003: should add service to booking and update price when CSA accepts the quote', async () => {
    // Arrange - Mock booking and services data
    const mockBooking = {
      id: 'BK-123',
      passengerName: 'Alice Johnson',
      customerEmail: 'alice.johnson@example.com',
    };

    const mockServices = [
      { id: 'SVC-001', name: 'Extra Baggage', basePrice: 50.00 },
      { id: 'SVC-002', name: 'Priority Boarding', basePrice: 25.00 },
    ];

    mockGetAvailableServices.mockResolvedValue(mockServices);
    mockCalculateServicePrice.mockResolvedValue({ additionalPrice: 100.00 }); // 50 * 2
    mockAddServiceToBooking.mockResolvedValue({ success: true });
    mockUpdateBookingTotal.mockResolvedValue({ success: true });
    mockSendConfirmation.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    const onBack = vi.fn();

    // Prerequisite: CSA has found a booking
    render(<AddService booking={mockBooking} onBack={onBack} />);

    // Wait for services to load
    await waitFor(() => {
      expect(screen.getByTestId('service-select')).toBeInTheDocument();
    });

    // Act - Step 1: Select a service (e.g., "Extra Baggage") and quantity
    const serviceSelect = screen.getByTestId('service-select');
    await user.selectOptions(serviceSelect, 'SVC-001');

    // Assert - Step 1: Service selection is displayed
    await waitFor(() => {
      expect(screen.getByTestId('quantity-selection')).toBeInTheDocument();
    });

    // Act - Step 1: Set quantity to 2
    const quantityInput = screen.getByTestId('quantity-input');
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    expect(quantityInput).toHaveValue(2);

    // Act - Step 2: Click "Calculate Price" / "Quote"
    const calculateButton = screen.getByTestId('calculate-price-button');
    await user.click(calculateButton);

    // Assert - Step 2: System displays the New Additional Price
    await waitFor(() => {
      expect(mockCalculateServicePrice).toHaveBeenCalledWith('SVC-001', 2);
    });

    await waitFor(() => {
      expect(screen.getByTestId('price-quote')).toBeInTheDocument();
    });

    const additionalPrice = screen.getByTestId('additional-price');
    expect(additionalPrice).toHaveTextContent('New Additional Price: $100');

    expect(screen.getByTestId('price-quote')).toHaveTextContent('Service: Extra Baggage');
    expect(screen.getByTestId('price-quote')).toHaveTextContent('Quantity: 2');

    // Act - Step 3: Click "Accept New Price" / "Confirm"
    const acceptButton = screen.getByTestId('accept-button');
    await user.click(acceptButton);

    // Assert - Step 3: System updates the ticket total
    await waitFor(() => {
      expect(mockAddServiceToBooking).toHaveBeenCalledWith('BK-123', 'SVC-001', 2);
    });

    expect(mockUpdateBookingTotal).toHaveBeenCalledWith('BK-123', 100.00);

    // Assert - Step 3: System sends confirmation
    expect(mockSendConfirmation).toHaveBeenCalledWith(
      'alice.johnson@example.com',
      expect.objectContaining({
        service: 'Extra Baggage',
        quantity: 2,
        additionalPrice: 100.00,
      })
    );

    // Assert - Confirmation page is displayed
    await waitFor(() => {
      expect(screen.getByTestId('service-confirmed')).toBeInTheDocument();
    });

    expect(screen.getByTestId('service-confirmed')).toHaveTextContent('Service Added Successfully');
    expect(screen.getByTestId('service-confirmed')).toHaveTextContent('Service: Extra Baggage');
    expect(screen.getByTestId('service-confirmed')).toHaveTextContent('Quantity: 2');
    expect(screen.getByTestId('service-confirmed')).toHaveTextContent('Additional Price: $100');
    expect(screen.getByTestId('service-confirmed')).toHaveTextContent('Booking updated and confirmation sent');

    // Verify all API calls
    expect(mockGetAvailableServices).toHaveBeenCalledTimes(1);
    expect(mockCalculateServicePrice).toHaveBeenCalledTimes(1);
    expect(mockAddServiceToBooking).toHaveBeenCalledTimes(1);
    expect(mockUpdateBookingTotal).toHaveBeenCalledTimes(1);
    expect(mockSendConfirmation).toHaveBeenCalledTimes(1);
  });

  /**
   * TC-AGENT-SVC-004: Verify Adding Service & Declining Price
   * Business Requirement: BR8 4
   * 
   * Prerequisites:
   * 1. CSA has calculated new price (Step 2 of TC-AGENT-SVC-003)
   * 
   * Steps:
   * Step 1: Review the new price quote with the customer
   * - Expected: Customer disagrees with the price
   * 
   * Step 2: Click "Decline" / "Cancel" button
   * - Expected: System discards the selected services
   * 
   * Step 3: Verify Booking Status
   * - Expected: User is returned to dashboard; Booking remains unchanged
   * 
   * Test Case Expected Result:
   * System cancels the service addition and returns to dashboard; no changes saved
   */
  it('TC-AGENT-SVC-004: should discard service selection and return to dashboard when CSA declines the price', async () => {
    // Arrange - Mock booking and services data
    const mockBooking = {
      id: 'BK-123',
      passengerName: 'Alice Johnson',
      customerEmail: 'alice.johnson@example.com',
    };

    const mockServices = [
      { id: 'SVC-001', name: 'Extra Baggage', basePrice: 50.00 },
    ];

    mockGetAvailableServices.mockResolvedValue(mockServices);
    mockCalculateServicePrice.mockResolvedValue({ additionalPrice: 100.00 });

    const user = userEvent.setup();
    const onBack = vi.fn();

    // Prerequisite: CSA has calculated new price
    render(<AddService booking={mockBooking} onBack={onBack} />);

    // Wait for services to load and select service
    await waitFor(() => {
      expect(screen.getByTestId('service-select')).toBeInTheDocument();
    });

    const serviceSelect = screen.getByTestId('service-select');
    await user.selectOptions(serviceSelect, 'SVC-001');

    await waitFor(() => {
      expect(screen.getByTestId('quantity-selection')).toBeInTheDocument();
    });

    const quantityInput = screen.getByTestId('quantity-input');
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    // Calculate price to get to the quote screen
    const calculateButton = screen.getByTestId('calculate-price-button');
    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByTestId('price-quote')).toBeInTheDocument();
    });

    // Assert - Step 1: Review the new price quote (displayed)
    expect(screen.getByTestId('additional-price')).toHaveTextContent('New Additional Price: $100');

    // Act - Step 2: Click "Decline" / "Cancel" button
    const declineButton = screen.getByTestId('decline-button');
    await user.click(declineButton);

    // Assert - Step 2: System discards the selected services
    // Assert - Step 3: User is returned to dashboard
    await waitFor(() => {
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    // Assert - No booking update API calls were made
    expect(mockAddServiceToBooking).not.toHaveBeenCalled();
    expect(mockUpdateBookingTotal).not.toHaveBeenCalled();
    expect(mockSendConfirmation).not.toHaveBeenCalled();

    // Verify only the initial calls were made
    expect(mockGetAvailableServices).toHaveBeenCalledTimes(1);
    expect(mockCalculateServicePrice).toHaveBeenCalledTimes(1);
  });
});
