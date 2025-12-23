import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// Mock API Functions
const mockSearchBooking = vi.fn();
const mockAddServiceToBooking = vi.fn();
const mockRemoveServiceFromBooking = vi.fn();
const mockCalculateRefund = vi.fn();
const mockInitiateRefund = vi.fn();
const mockUpdateFlightDate = vi.fn();
const mockCalculatePriceDifference = vi.fn();
const mockRequestAdditionalPayment = vi.fn();
const mockIssueRefundCredit = vi.fn();
const mockCheckSeatAvailability = vi.fn();
const mockUpdatePassengerInfo = vi.fn();
const mockRecalculateFare = vi.fn();

// Mock Component: Search Booking with edge cases
const SearchBooking: React.FC<{ onSearch: (id: string) => void }> = ({ onSearch }) => {
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setBooking(null);
    
    // Trim whitespace
    const trimmedId = bookingId.trim();
    
    // Validate format - only alphanumeric and hyphen
    if (!/^[a-zA-Z0-9-]+$/.test(trimmedId)) {
      setError('Invalid ID format');
      return;
    }
    
    // Case-insensitive search
    const result = await mockSearchBooking(trimmedId.toUpperCase());
    
    if (result) {
      setBooking(result);
    } else {
      setError('Not Found');
    }
  };

  return (
    <div>
      <h2>Search Booking</h2>
      <input
        type="text"
        placeholder="Enter Booking ID"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      
      {error && <div className="error">{error}</div>}
      
      {booking && (
        <div className="booking-result">
          <h3>Booking Found: {booking.id}</h3>
          <p>Passenger: {booking.passenger}</p>
          <p>Flight: {booking.flight}</p>
          <p>Status: {booking.status}</p>
        </div>
      )}
    </div>
  );
};

// Mock Component: Add/Remove Services
const ManageServices: React.FC<{ booking: any }> = ({ booking }) => {
  const [services, setServices] = useState<any[]>(booking.services || []);
  const [selectedService, setSelectedService] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(booking.totalPrice);
  const [refundInitiated, setRefundInitiated] = useState(false);

  const handleAddService = async () => {
    setError('');
    
    // Check for duplicate meals
    if (selectedService === 'Vegan Meal') {
      const existingMeal = services.find(s => s.name === 'Vegan Meal');
      if (existingMeal) {
        // Allow duplicate - increase quantity
        const updated = services.map(s => 
          s.name === 'Vegan Meal' ? { ...s, quantity: s.quantity + quantity } : s
        );
        setServices(updated);
        await mockAddServiceToBooking(booking.id, 'Vegan Meal', quantity);
        return;
      }
    }
    
    // Check max baggage limit
    if (selectedService === 'Baggage') {
      const baggageCount = services.filter(s => s.name === 'Baggage').reduce((sum, s) => sum + s.quantity, 0);
      if (baggageCount + quantity > 3) {
        setError('Max baggage allowance reached');
        return;
      }
    }
    
    const newService = { name: selectedService, quantity };
    setServices([...services, newService]);
    await mockAddServiceToBooking(booking.id, selectedService, quantity);
    setTotalPrice(totalPrice + 50 * quantity); // Mock price
  };

  const handleRemoveService = async (serviceName: string) => {
    const serviceToRemove = services.find(s => s.name === serviceName);
    const servicePrice = 50; // Mock price per service
    
    setServices(services.filter(s => s.name !== serviceName));
    await mockRemoveServiceFromBooking(booking.id, serviceName);
    
    if (booking.status === 'Paid') {
      // Initiate refund for paid bookings
      const refundAmount = await mockCalculateRefund(servicePrice);
      await mockInitiateRefund(booking.id, refundAmount);
      setRefundInitiated(true);
    }
    
    setTotalPrice(totalPrice - servicePrice);
  };

  return (
    <div>
      <h2>Manage Services - {booking.id}</h2>
      <p>Status: {booking.status}</p>
      <p>Total Price: ${totalPrice}</p>
      
      <div className="add-service">
        <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
          <option value="">Select Service</option>
          <option value="Vegan Meal">Vegan Meal</option>
          <option value="Baggage">Baggage</option>
        </select>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
        />
        <button onClick={handleAddService}>Add Service</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="services-list">
        <h3>Current Services:</h3>
        {services.map((service, idx) => (
          <div key={idx} className="service-item">
            <span>{service.name} x{service.quantity}</span>
            <button onClick={() => handleRemoveService(service.name)}>Remove</button>
          </div>
        ))}
      </div>
      
      {refundInitiated && <div className="refund-notice">Refund initiated for removed service</div>}
    </div>
  );
};

// Mock Component: Modify Flight Date
const ModifyFlightDate: React.FC<{ booking: any }> = ({ booking }) => {
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [additionalPayment, setAdditionalPayment] = useState<number | null>(null);
  const [refundCredit, setRefundCredit] = useState<number | null>(null);

  const handleDateChange = async () => {
    setError('');
    setSuccess('');
    setAdditionalPayment(null);
    setRefundCredit(null);
    
    // Validate not past date
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Invalid date');
      return;
    }
    
    // Check seat availability
    const seatsAvailable = await mockCheckSeatAvailability(newDate);
    if (seatsAvailable === 0) {
      setError('No seats available');
      return;
    }
    
    // Calculate price difference
    const priceDiff = await mockCalculatePriceDifference(booking.originalDate, newDate);
    
    if (priceDiff > 0) {
      // Higher price - request additional payment
      setAdditionalPayment(priceDiff);
      await mockRequestAdditionalPayment(booking.id, priceDiff);
    } else if (priceDiff < 0) {
      // Lower price - refund difference
      setRefundCredit(Math.abs(priceDiff));
      await mockIssueRefundCredit(booking.id, Math.abs(priceDiff));
    } else {
      // Same price
      await mockUpdateFlightDate(booking.id, newDate);
      setSuccess('Update success. No extra charge.');
    }
  };

  return (
    <div>
      <h2>Modify Flight Date - {booking.id}</h2>
      <p>Current Date: {booking.originalDate}</p>
      
      <input
        type="date"
        data-testid="new-flight-date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
      />
      <button onClick={handleDateChange}>Change Date</button>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      {additionalPayment !== null && (
        <div className="payment-request">System requests additional payment: ${additionalPayment}</div>
      )}
      {refundCredit !== null && (
        <div className="refund-credit">System refunds difference: ${refundCredit}</div>
      )}
    </div>
  );
};

// Mock Component: Modify Passenger Info
const ModifyPassengerInfo: React.FC<{ booking: any }> = ({ booking }) => {
  const [passengerName, setPassengerName] = useState(booking.passengerName);
  const [passengerDOB, setPassengerDOB] = useState(booking.passengerDOB);
  const [success, setSuccess] = useState('');
  const [priceRecalculation, setPriceRecalculation] = useState<string | null>(null);

  const handleUpdateName = async () => {
    await mockUpdatePassengerInfo(booking.id, { name: passengerName });
    setSuccess('Update success');
  };

  const handleUpdateDOB = async () => {
    const dob = new Date(passengerDOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    
    // Check if DOB change affects fare type
    if (age < 12) {
      // Child fare
      const newFare = await mockRecalculateFare(booking.id, 'child');
      setPriceRecalculation(`Price recalculated to Child fare: $${newFare}`);
    } else {
      await mockUpdatePassengerInfo(booking.id, { dob: passengerDOB });
      setSuccess('Update success');
    }
  };

  return (
    <div>
      <h2>Modify Passenger Info - {booking.id}</h2>
      
      <div className="edit-name">
        <label>Passenger Name:</label>
        <input
          type="text"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
        />
        <button onClick={handleUpdateName}>Update Name</button>
      </div>
      
      <div className="edit-dob">
        <label>Date of Birth:</label>
        <input
          type="date"
          value={passengerDOB}
          onChange={(e) => setPassengerDOB(e.target.value)}
        />
        <button onClick={handleUpdateDOB}>Update DOB</button>
      </div>
      
      {success && <div className="success">{success}</div>}
      {priceRecalculation && <div className="price-change">{priceRecalculation}</div>}
    </div>
  );
};

describe('Agent Modify Booking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-AGT-MOD-001: Verify Search Booking - Case Insensitive (BR7)', async () => {
    // BR7: Search should be case insensitive
    
    // Arrange
    mockSearchBooking.mockResolvedValue({
      id: 'BK-123',
      passenger: 'John Doe',
      flight: 'FL-100',
      status: 'Confirmed'
    });
    
    const user = userEvent.setup();
    render(<SearchBooking onSearch={() => {}} />);
    
    // Step 1: Agent enters booking ID in lowercase "bk-123"
    const input = screen.getByPlaceholderText('Enter Booking ID');
    await user.type(input, 'bk-123');
    expect(input).toHaveValue('bk-123');
    
    // Step 2: Agent clicks Search button
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    
    // Step 3: System converts to uppercase and searches
    await waitFor(() => {
      expect(mockSearchBooking).toHaveBeenCalledWith('BK-123');
    });
    
    // Expected Result: Booking BK-123 displayed
    await waitFor(() => {
      expect(screen.getByText('Booking Found: BK-123')).toBeInTheDocument();
      expect(screen.getByText('Passenger: John Doe')).toBeInTheDocument();
      expect(screen.getByText('Flight: FL-100')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-002: Verify Search Booking - Special Character (BR7)', async () => {
    // BR7: Invalid characters should be rejected
    
    // Arrange
    const user = userEvent.setup();
    render(<SearchBooking onSearch={() => {}} />);
    
    // Step 1: Agent enters booking ID with special character "BK@123"
    const input = screen.getByPlaceholderText('Enter Booking ID');
    await user.type(input, 'BK@123');
    
    // Step 2: Agent clicks Search button
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    
    // Expected Result: Error "Invalid ID format"
    await waitFor(() => {
      expect(screen.getByText('Invalid ID format')).toBeInTheDocument();
    });
    
    // Step 3: Verify API not called with invalid format
    expect(mockSearchBooking).not.toHaveBeenCalled();
  });

  it('TC-AGT-MOD-003: Verify Search Booking - Whitespace Trimming (BR7)', async () => {
    // BR7: System should trim whitespace before searching
    
    // Arrange
    mockSearchBooking.mockResolvedValue({
      id: 'BK-123',
      passenger: 'Jane Smith',
      flight: 'FL-200',
      status: 'Confirmed'
    });
    
    const user = userEvent.setup();
    render(<SearchBooking onSearch={() => {}} />);
    
    // Step 1: Agent enters booking ID with leading/trailing spaces " BK-123 "
    const input = screen.getByPlaceholderText('Enter Booking ID');
    await user.type(input, ' BK-123 ');
    expect(input).toHaveValue(' BK-123 ');
    
    // Step 2: Agent clicks Search button
    const searchButton = screen.getByText('Search');
    await user.click(searchButton);
    
    // Step 3: System trims whitespace and searches
    await waitFor(() => {
      expect(mockSearchBooking).toHaveBeenCalledWith('BK-123');
    });
    
    // Expected Result: Booking found successfully
    await waitFor(() => {
      expect(screen.getByText('Booking Found: BK-123')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-004: Verify Add Service - Duplicate Meal (BR8)', async () => {
    // BR8: System should allow duplicate meals by increasing quantity
    
    // Arrange
    const booking = {
      id: 'BK-100',
      status: 'Unpaid',
      services: [{ name: 'Vegan Meal', quantity: 1 }],
      totalPrice: 250
    };
    
    const user = userEvent.setup();
    render(<ManageServices booking={booking} />);
    
    // Step 1: Agent selects "Vegan Meal" (already exists with quantity 1)
    const serviceSelect = screen.getByRole('combobox');
    await user.selectOptions(serviceSelect, 'Vegan Meal');
    
    // Step 2: Agent sets quantity to 1 and clicks Add Service
    const addButton = screen.getByText('Add Service');
    await user.click(addButton);
    
    // Expected Result: System allows duplicate - increases quantity to x2
    await waitFor(() => {
      expect(mockAddServiceToBooking).toHaveBeenCalledWith('BK-100', 'Vegan Meal', 1);
    });
    
    // Step 3: Verify service shows x2 quantity
    await waitFor(() => {
      expect(screen.getByText('Vegan Meal x2')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-005: Verify Add Service - Max Baggage Limit (BR8)', async () => {
    // BR8: System should enforce max 3 baggage items
    
    // Arrange
    const booking = {
      id: 'BK-101',
      status: 'Unpaid',
      services: [
        { name: 'Baggage', quantity: 2 },
        { name: 'Baggage', quantity: 1 }
      ],
      totalPrice: 350
    };
    
    const user = userEvent.setup();
    render(<ManageServices booking={booking} />);
    
    // Step 1: Agent already has 3 baggage items (2+1)
    // Step 2: Agent attempts to add 1 more baggage
    const serviceSelect = screen.getByRole('combobox');
    await user.selectOptions(serviceSelect, 'Baggage');
    
    const addButton = screen.getByText('Add Service');
    await user.click(addButton);
    
    // Expected Result: Error "Max baggage allowance reached"
    await waitFor(() => {
      expect(screen.getByText('Max baggage allowance reached')).toBeInTheDocument();
    });
    
    // Step 3: Verify service not added
    expect(mockAddServiceToBooking).not.toHaveBeenCalled();
  });

  it('TC-AGT-MOD-006: Verify Remove Service - Unpaid Booking (BR8)', async () => {
    // BR8: Remove service from unpaid booking should decrease total
    
    // Arrange
    const booking = {
      id: 'BK-102',
      status: 'Unpaid',
      services: [{ name: 'Vegan Meal', quantity: 1 }],
      totalPrice: 300
    };
    
    const user = userEvent.setup();
    render(<ManageServices booking={booking} />);
    
    // Step 1: Agent clicks Remove on "Vegan Meal" service
    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);
    
    // Step 2: System removes service
    await waitFor(() => {
      expect(mockRemoveServiceFromBooking).toHaveBeenCalledWith('BK-102', 'Vegan Meal');
    });
    
    // Expected Result: Service removed, total price decreases
    await waitFor(() => {
      expect(screen.getByText('Total Price: $250')).toBeInTheDocument();
    });
    
    // Step 3: Verify no refund initiated for unpaid booking
    expect(screen.queryByText('Refund initiated for removed service')).not.toBeInTheDocument();
  });

  it('TC-AGT-MOD-007: Verify Remove Service - Paid Booking with Refund (BR8, Complex)', async () => {
    // Complex: Removing service from paid booking should initiate refund
    
    // Arrange
    mockCalculateRefund.mockResolvedValue(50);
    mockInitiateRefund.mockResolvedValue({ refundId: 'REF-001', amount: 50 });
    
    const booking = {
      id: 'BK-103',
      status: 'Paid',
      services: [{ name: 'Vegan Meal', quantity: 1 }],
      totalPrice: 300
    };
    
    const user = userEvent.setup();
    render(<ManageServices booking={booking} />);
    
    // Step 1: Agent clicks Remove on service from paid booking
    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);
    
    // Step 2: System removes service
    await waitFor(() => {
      expect(mockRemoveServiceFromBooking).toHaveBeenCalledWith('BK-103', 'Vegan Meal');
    });
    
    // Step 3: System calculates refund amount
    await waitFor(() => {
      expect(mockCalculateRefund).toHaveBeenCalledWith(50);
    });
    
    // Step 4: System initiates refund for service amount
    await waitFor(() => {
      expect(mockInitiateRefund).toHaveBeenCalledWith('BK-103', 50);
    });
    
    // Expected Result: Refund initiated notification displayed
    await waitFor(() => {
      expect(screen.getByText('Refund initiated for removed service')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-009: Verify Modify Flight Date - Same Price (BR13)', async () => {
    // BR13: Date change with same price should have no extra charge
    
    // Arrange
    mockCheckSeatAvailability.mockResolvedValue(50);
    mockCalculatePriceDifference.mockResolvedValue(0); // Same price
    mockUpdateFlightDate.mockResolvedValue({ success: true });
    
    const booking = {
      id: 'BK-104',
      originalDate: '2025-12-25'
    };
    
    const user = userEvent.setup();
    render(<ModifyFlightDate booking={booking} />);
    
    // Step 1: Agent selects new date with same price
    const dateInput = screen.getByTestId('new-flight-date');
    await user.type(dateInput, '2025-12-26');
    
    // Step 2: Agent clicks Change Date
    const changeButton = screen.getByText('Change Date');
    await user.click(changeButton);
    
    // Step 3: System checks seat availability
    await waitFor(() => {
      expect(mockCheckSeatAvailability).toHaveBeenCalledWith('2025-12-26');
    });
    
    // Step 4: System calculates price difference (returns 0)
    await waitFor(() => {
      expect(mockCalculatePriceDifference).toHaveBeenCalledWith('2025-12-25', '2025-12-26');
    });
    
    // Expected Result: Update success with no extra charge
    await waitFor(() => {
      expect(screen.getByText('Update success. No extra charge.')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-010: Verify Modify Flight Date - Higher Price (BR13)', async () => {
    // BR13: Date change to higher price should request additional payment
    
    // Arrange
    mockCheckSeatAvailability.mockResolvedValue(30);
    mockCalculatePriceDifference.mockResolvedValue(100); // $100 more expensive
    mockRequestAdditionalPayment.mockResolvedValue({ paymentId: 'PAY-001' });
    
    const booking = {
      id: 'BK-105',
      originalDate: '2025-12-20'
    };
    
    const user = userEvent.setup();
    render(<ModifyFlightDate booking={booking} />);
    
    // Step 1: Agent selects peak date (higher price)
    const dateInput = screen.getByTestId('new-flight-date');
    await user.type(dateInput, '2025-12-31');
    
    // Step 2: Agent clicks Change Date
    const changeButton = screen.getByText('Change Date');
    await user.click(changeButton);
    
    // Step 3: System calculates price difference (returns +$100)
    await waitFor(() => {
      expect(mockCalculatePriceDifference).toHaveBeenCalledWith('2025-12-20', '2025-12-31');
    });
    
    // Expected Result: System requests additional payment
    await waitFor(() => {
      expect(mockRequestAdditionalPayment).toHaveBeenCalledWith('BK-105', 100);
      expect(screen.getByText('System requests additional payment: $100')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-011: Verify Modify Flight Date - Lower Price (BR13)', async () => {
    // BR13: Date change to lower price should refund difference
    
    // Arrange
    mockCheckSeatAvailability.mockResolvedValue(80);
    mockCalculatePriceDifference.mockResolvedValue(-75); // $75 cheaper
    mockIssueRefundCredit.mockResolvedValue({ creditId: 'CRD-001' });
    
    const booking = {
      id: 'BK-106',
      originalDate: '2026-01-15'
    };
    
    const user = userEvent.setup();
    render(<ModifyFlightDate booking={booking} />);
    
    // Step 1: Agent selects cheaper date
    const dateInput = screen.getByTestId('new-flight-date');
    await user.type(dateInput, '2025-12-27');
    
    // Step 2: Agent clicks Change Date
    const changeButton = screen.getByText('Change Date');
    await user.click(changeButton);
    
    // Step 3: System calculates price difference (returns -$75)
    await waitFor(() => {
      expect(mockCalculatePriceDifference).toHaveBeenCalledWith('2026-01-15', '2025-12-27');
    });
    
    // Expected Result: System refunds difference or holds credit
    await waitFor(() => {
      expect(mockIssueRefundCredit).toHaveBeenCalledWith('BK-106', 75);
      expect(screen.getByText('System refunds difference: $75')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-012: Verify Modify Flight Date - Past Date Validation (Val)', async () => {
    // Validation: Cannot change to past date
    
    // Arrange
    const booking = {
      id: 'BK-107',
      originalDate: '2025-12-25'
    };
    
    const user = userEvent.setup();
    render(<ModifyFlightDate booking={booking} />);
    
    // Step 1: Agent selects yesterday's date
    const dateInput = screen.getByTestId('new-flight-date');
    await user.type(dateInput, '2025-12-22'); // Past date
    
    // Step 2: Agent clicks Change Date
    const changeButton = screen.getByText('Change Date');
    await user.click(changeButton);
    
    // Expected Result: Error "Invalid date"
    await waitFor(() => {
      expect(screen.getByText('Invalid date')).toBeInTheDocument();
    });
    
    // Step 3: Verify no API calls made
    expect(mockUpdateFlightDate).not.toHaveBeenCalled();
  });

  it('TC-AGT-MOD-013: Verify Modify Flight Date - Full Flight (Val)', async () => {
    // Validation: Cannot change to flight with no seats
    
    // Arrange
    mockCheckSeatAvailability.mockResolvedValue(0); // No seats
    
    const booking = {
      id: 'BK-108',
      originalDate: '2025-12-20'
    };
    
    const user = userEvent.setup();
    render(<ModifyFlightDate booking={booking} />);
    
    // Step 1: Agent selects date for full flight
    const dateInput = screen.getByTestId('new-flight-date');
    await user.type(dateInput, '2025-12-28');
    
    // Step 2: Agent clicks Change Date
    const changeButton = screen.getByText('Change Date');
    await user.click(changeButton);
    
    // Step 3: System checks seat availability (returns 0)
    await waitFor(() => {
      expect(mockCheckSeatAvailability).toHaveBeenCalledWith('2025-12-28');
    });
    
    // Expected Result: Error "No seats available"
    await waitFor(() => {
      expect(screen.getByText('No seats available')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-014: Verify Modify Passenger Name (BR41)', async () => {
    // BR41: Agent can edit passenger name for typo correction
    
    // Arrange
    mockUpdatePassengerInfo.mockResolvedValue({ success: true });
    
    const booking = {
      id: 'BK-109',
      passengerName: 'Jonh Doe',
      passengerDOB: '1990-05-15'
    };
    
    const user = userEvent.setup();
    render(<ModifyPassengerInfo booking={booking} />);
    
    // Step 1: Agent sees typo "Jonh" in passenger name
    const nameInput = screen.getByDisplayValue('Jonh Doe');
    expect(nameInput).toBeInTheDocument();
    
    // Step 2: Agent corrects name to "John Doe"
    await user.clear(nameInput);
    await user.type(nameInput, 'John Doe');
    
    // Step 3: Agent clicks Update Name
    const updateButton = screen.getByText('Update Name');
    await user.click(updateButton);
    
    // Step 4: System updates passenger name
    await waitFor(() => {
      expect(mockUpdatePassengerInfo).toHaveBeenCalledWith('BK-109', { name: 'John Doe' });
    });
    
    // Expected Result: Update success
    await waitFor(() => {
      expect(screen.getByText('Update success')).toBeInTheDocument();
    });
  });

  it('TC-AGT-MOD-015: Verify Modify Passenger DOB - Adult to Child Fare Recalculation (Biz)', async () => {
    // Business Logic: Changing DOB to child age should recalculate to child fare
    
    // Arrange
    mockRecalculateFare.mockResolvedValue(150); // Child fare
    
    const booking = {
      id: 'BK-110',
      passengerName: 'Alice Smith',
      passengerDOB: '2000-06-10' // Adult
    };
    
    const user = userEvent.setup();
    render(<ModifyPassengerInfo booking={booking} />);
    
    // Step 1: Agent changes DOB to < 12 years old
    const dobInput = screen.getByDisplayValue('2000-06-10');
    await user.clear(dobInput);
    await user.type(dobInput, '2015-06-10'); // 10 years old
    
    // Step 2: Agent clicks Update DOB
    const updateButton = screen.getByText('Update DOB');
    await user.click(updateButton);
    
    // Step 3: System calculates age (< 12 years)
    // Step 4: System recalculates fare to child fare
    await waitFor(() => {
      expect(mockRecalculateFare).toHaveBeenCalledWith('BK-110', 'child');
    });
    
    // Expected Result: Price recalculated to child fare
    await waitFor(() => {
      expect(screen.getByText('Price recalculated to Child fare: $150')).toBeInTheDocument();
    });
  });
});
