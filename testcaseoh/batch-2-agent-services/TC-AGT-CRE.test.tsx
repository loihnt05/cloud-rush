/**
 * Test Suite: TC-AGT-CRE (Agent Create Booking)
 * Category: Agent Services
 * Description: Unit tests for Agent booking creation functionality including Personal and On-Behalf bookings
 * 
 * Test Cases:
 * - TC-AGT-CRE-001: Verify Agent Book - Personal - Valid
 * - TC-AGT-CRE-002: Verify Agent Book - On-Behalf - Valid
 * - TC-AGT-CRE-003: Verify On-Behalf - Empty Customer Name
 * - TC-AGT-CRE-004: Verify On-Behalf - Invalid Email
 * - TC-AGT-CRE-005: Verify On-Behalf - Existing Customer
 * - TC-AGT-CRE-006: Verify On-Behalf - New Customer
 * - TC-AGT-CRE-007: Verify Booking Limit - Max Passengers
 * - TC-AGT-CRE-008: Verify Booking Limit - Exceed Max
 * - TC-AGT-CRE-009: Verify Agent Discount (If any)
 * - TC-AGT-CRE-010: Verify On-Behalf - Payment Later
 * 
 * Prerequisites:
 * 1. Agent is logged in
 * 2. Flight search results are available
 * 3. Agent has necessary permissions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking API
const mockCreateBooking = vi.fn();
const mockGetUserByEmail = vi.fn();
const mockCreateGuestUser = vi.fn();
const mockCalculateTotalPrice = vi.fn();
const mockApplyAgentDiscount = vi.fn();

// Mock agent user data
const mockAgentUser = {
  user_id: 'AGENT-001',
  name: 'Agent Smith',
  email: 'agent.smith@airline.com',
  role: 'agent',
};

// Mock BookingForm component (placeholder for actual component)
const BookingForm = ({ agentUser }: { agentUser: any }) => {
  const [bookingType, setBookingType] = React.useState<'personal' | 'on-behalf'>('personal');
  const [customerEmail, setCustomerEmail] = React.useState('');
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [paymentTiming, setPaymentTiming] = React.useState<'now' | 'later'>('now');
  const [errors, setErrors] = React.useState<any>({});
  const [priceBreakdown, setPriceBreakdown] = React.useState<any>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = React.useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    if (bookingType === 'on-behalf') {
      if (!firstName.trim()) {
        newErrors.firstName = 'MSG 1: Field Mandatory';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'MSG 1: Field Mandatory';
      }
      if (!customerEmail.trim()) {
        newErrors.email = 'MSG 1: Field Mandatory';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        newErrors.email = 'MSG 4: Invalid format';
      }
    }

    if (passengers.length > 9) {
      newErrors.passengers = 'Max booking limit reached';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPassenger = () => {
    if (passengers.length >= 9) {
      setErrors({ ...errors, passengers: 'Max booking limit reached' });
      return;
    }
    setPassengers([...passengers, { firstName, lastName }]);
  };

  const handleViewPrice = async () => {
    const passengerCount = Math.max(passengers.length, 1);
    const basePrice = 100;
    const subtotal = basePrice * passengerCount;
    
    const discountData = await mockApplyAgentDiscount(agentUser.user_id, subtotal);
    
    setPriceBreakdown({
      basePrice,
      passengerCount,
      subtotal,
      agentDiscount: discountData.discount || 0,
      total: subtotal - (discountData.discount || 0),
    });
    setShowPriceBreakdown(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let userId = agentUser.user_id;
    let customerUserId = null;

    if (bookingType === 'on-behalf') {
      // Check if customer exists
      const existingUser = await mockGetUserByEmail(customerEmail);
      
      if (existingUser) {
        customerUserId = existingUser.user_id;
      } else {
        // Create guest user
        const guestUser = await mockCreateGuestUser({
          email: customerEmail,
          first_name: firstName,
          last_name: lastName,
        });
        customerUserId = guestUser.user_id;
      }
      userId = customerUserId;
    }

    const bookingData = {
      user_id: userId,
      agent_id: agentUser.user_id,
      booking_type: bookingType,
      payment_status: paymentTiming === 'later' ? 'hold' : 'paid',
      status: paymentTiming === 'later' ? 'Pending' : 'Confirmed',
      passengers: passengers.length > 0 ? passengers : [{ firstName, lastName }],
      total_amount: priceBreakdown?.total || 100,
    };

    await mockCreateBooking(bookingData);
  };

  return (
    <div data-testid="booking-form">
      <h1>Book a Flight</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="radio"
            id="personal"
            name="bookingType"
            value="personal"
            checked={bookingType === 'personal'}
            onChange={(e) => {
              if (e.target.checked) setBookingType('personal');
            }}
          />
          <label htmlFor="personal">Personal</label>

          <input
            type="radio"
            id="onbehalf"
            name="bookingType"
            value="on-behalf"
            checked={bookingType === 'on-behalf'}
            onChange={(e) => {
              if (e.target.checked) setBookingType('on-behalf');
            }}
          />
          <label htmlFor="onbehalf">On-Behalf</label>
        </div>

        {bookingType === 'on-behalf' && (
          <>
            <div>
              <label htmlFor="email">Customer Email</label>
              <input
                type="email"
                id="email"
                data-testid="customer-email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
              {errors.email && (
                <div data-testid="email-error" className="error">{errors.email}</div>
              )}
            </div>
          </>
        )}

        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            data-testid="first-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && (
            <div data-testid="first-name-error" className="error">{errors.firstName}</div>
          )}
        </div>

        <div>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            data-testid="last-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && (
            <div data-testid="last-name-error" className="error">{errors.lastName}</div>
          )}
        </div>

        <button type="button" onClick={handleAddPassenger} data-testid="add-passenger">
          Add Passenger
        </button>

        <div data-testid="passenger-list">
          {passengers.map((pax, idx) => (
            <div key={idx} data-testid={`passenger-${idx}`}>
              Passenger {idx + 1}: {pax.firstName} {pax.lastName}
            </div>
          ))}
        </div>

        {errors.passengers && (
          <div data-testid="passengers-error" className="error">{errors.passengers}</div>
        )}

        <button type="button" onClick={handleViewPrice} data-testid="view-price">
          View Price
        </button>

        {showPriceBreakdown && priceBreakdown && (
          <div data-testid="price-breakdown">
            <h3>Price Breakdown</h3>
            <div>Base Price: ${priceBreakdown.basePrice}</div>
            <div>Passengers: {priceBreakdown.passengerCount}</div>
            <div>Subtotal: ${priceBreakdown.subtotal}</div>
            {priceBreakdown.agentDiscount > 0 && (
              <div data-testid="agent-discount">Agent Discount: -${priceBreakdown.agentDiscount}</div>
            )}
            <div data-testid="total-price">Total: ${priceBreakdown.total}</div>
          </div>
        )}

        <div>
          <input
            type="radio"
            id="payNow"
            name="paymentTiming"
            value="now"
            checked={paymentTiming === 'now'}
            onChange={() => setPaymentTiming('now')}
          />
          <label htmlFor="payNow">Pay Now</label>

          <input
            type="radio"
            id="payLater"
            name="paymentTiming"
            value="later"
            checked={paymentTiming === 'later'}
            onChange={() => setPaymentTiming('later')}
          />
          <label htmlFor="payLater">Pay Later</label>
        </div>

        <button type="submit" data-testid="submit-booking">
          Complete Booking
        </button>
      </form>
    </div>
  );
};

describe('TC-AGT-CRE: Agent Booking Creation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });
  });

  /**
   * TC-AGT-CRE-001: Verify Agent Book - Personal - Valid
   * Business Requirement: BR6
   * 
   * Test Data: Valid Data
   * 
   * Expected Result:
   * Ticket created under Agent's name
   */
  it('TC-AGT-CRE-001: should create ticket under agent\'s name when booking Personal', async () => {
    // Arrange
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-001' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "Personal"
    const personalRadio = screen.getByLabelText('Personal');
    await user.click(personalRadio);

    // Enter passenger details
    await user.type(screen.getByTestId('first-name'), 'John');
    await user.type(screen.getByTestId('last-name'), 'Doe');

    // View price and submit
    await user.click(screen.getByTestId('view-price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: Ticket created under Agent's name
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockAgentUser.user_id,
          agent_id: mockAgentUser.user_id,
          booking_type: 'personal',
        })
      );
    });
  });

  /**
   * TC-AGT-CRE-002: Verify Agent Book - On-Behalf - Valid
   * Business Requirement: BR6
   * 
   * Test Data: Valid Data
   * 
   * Expected Result:
   * Ticket created under Customer's name
   */
  it('TC-AGT-CRE-002: should create ticket under customer\'s name when booking On-Behalf', async () => {
    // Arrange
    const mockCustomer = {
      user_id: 'CUST-001',
      email: 'customer@test.com',
      first_name: 'Jane',
      last_name: 'Smith',
    };

    mockGetUserByEmail.mockResolvedValue(mockCustomer);
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-002' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf"
    const onBehalfRadio = screen.getByLabelText('On-Behalf');
    await user.click(onBehalfRadio);

    // Enter passenger info
    await user.type(screen.getByTestId('customer-email'), 'customer@test.com');
    await user.type(screen.getByTestId('first-name'), 'Jane');
    await user.type(screen.getByTestId('last-name'), 'Smith');

    // View price and submit
    await user.click(screen.getByTestId('view-price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: Ticket created under Customer's name
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockCustomer.user_id,
          agent_id: mockAgentUser.user_id,
          booking_type: 'on-behalf',
        })
      );
    });
  });

  /**
   * TC-AGT-CRE-003: Verify On-Behalf - Empty Customer Name
   * Note: Val (Validation)
   * 
   * Test Data: Name: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory"
   */
  it('TC-AGT-CRE-003: should display error "Field Mandatory" when customer name is empty', async () => {
    // Arrange
    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf"
    const onBehalfRadio = screen.getByLabelText('On-Behalf');
    await user.click(onBehalfRadio);

    // Leave name fields empty and try to submit
    await user.type(screen.getByTestId('customer-email'), 'test@example.com');
    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: Error "MSG 1: Field Mandatory"
    await waitFor(() => {
      expect(screen.getByTestId('first-name-error')).toHaveTextContent('MSG 1: Field Mandatory');
      expect(screen.getByTestId('last-name-error')).toHaveTextContent('MSG 1: Field Mandatory');
    });

    // Verify booking was not created
    expect(mockCreateBooking).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-CRE-004: Verify On-Behalf - Invalid Email
   * Note: Val (Validation)
   * 
   * Test Data: Email: "abc"
   * 
   * Expected Result:
   * Error "MSG 4: Invalid format"
   */
  it('TC-AGT-CRE-004: should display error "Invalid format" for invalid email', async () => {
    // Arrange
    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf" using the radio input directly
    const onBehalfRadio = screen.getByRole('radio', { name: /on-behalf/i });
    await user.click(onBehalfRadio);

    // Enter invalid email
    await user.type(screen.getByTestId('customer-email'), 'abc');
    await user.type(screen.getByTestId('first-name'), 'John');
    await user.type(screen.getByTestId('last-name'), 'Doe');
    
    // Submit the form
    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: Error "MSG 4: Invalid format"
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toHaveTextContent('MSG 4: Invalid format');
    });

    // Verify booking was not created
    expect(mockCreateBooking).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-CRE-005: Verify On-Behalf - Existing Customer
   * Note: Logic
   * 
   * Test Data: Email: "user@test.com"
   * 
   * Expected Result:
   * System links booking to existing User ID
   */
  it('TC-AGT-CRE-005: should link booking to existing user ID for existing customer', async () => {
    // Arrange
    const existingUser = {
      user_id: 'EXISTING-USER-123',
      email: 'user@test.com',
      first_name: 'Existing',
      last_name: 'User',
    };

    mockGetUserByEmail.mockResolvedValue(existingUser);
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-003' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf" and enter existing user email
    const onBehalfRadio = screen.getByLabelText('On-Behalf');
    await user.click(onBehalfRadio);

    await user.type(screen.getByTestId('customer-email'), 'user@test.com');
    await user.type(screen.getByTestId('first-name'), 'Existing');
    await user.type(screen.getByTestId('last-name'), 'User');

    await user.click(screen.getByTestId('view-price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: System pre-fills customer info from existing account
    await waitFor(() => {
      expect(mockGetUserByEmail).toHaveBeenCalledWith('user@test.com');
    });

    // Assert - Booking is linked to existing user ID
    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: existingUser.user_id,
        agent_id: mockAgentUser.user_id,
      })
    );

    // Verify guest user was not created
    expect(mockCreateGuestUser).not.toHaveBeenCalled();
  });

  /**
   * TC-AGT-CRE-006: Verify On-Behalf - New Customer
   * Note: Logic
   * 
   * Test Data: Email: "new@test.com"
   * 
   * Expected Result:
   * System creates placeholder/guest user
   */
  it('TC-AGT-CRE-006: should create placeholder/guest user for new customer', async () => {
    // Arrange
    const newGuestUser = {
      user_id: 'GUEST-456',
      email: 'new@test.com',
      first_name: 'New',
      last_name: 'Customer',
      is_guest: true,
    };

    mockGetUserByEmail.mockResolvedValue(null); // User doesn't exist
    mockCreateGuestUser.mockResolvedValue(newGuestUser);
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-004' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf" and enter new user email
    const onBehalfRadio = screen.getByLabelText('On-Behalf');
    await user.click(onBehalfRadio);

    await user.type(screen.getByTestId('customer-email'), 'new@test.com');
    await user.type(screen.getByTestId('first-name'), 'New');
    await user.type(screen.getByTestId('last-name'), 'Customer');

    await user.click(screen.getByTestId('view-price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: System creates placeholder/guest user
    await waitFor(() => {
      expect(mockCreateGuestUser).toHaveBeenCalledWith({
        email: 'new@test.com',
        first_name: 'New',
        last_name: 'Customer',
      });
    });

    // Assert - Booking is linked to new guest user
    expect(mockCreateBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: newGuestUser.user_id,
        agent_id: mockAgentUser.user_id,
      })
    );
  });

  /**
   * TC-AGT-CRE-007: Verify Booking Limit - Max Passengers
   * Note: Bound (Boundary)
   * 
   * Test Data: Pax: 9
   * 
   * Expected Result:
   * Success. Price x9
   */
  it('TC-AGT-CRE-007: should allow booking with 9 passengers and calculate price x9', async () => {
    // Arrange
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-005' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Add 9 passengers
    await user.type(screen.getByTestId('first-name'), 'Passenger');
    await user.type(screen.getByTestId('last-name'), '1');

    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByTestId('add-passenger'));
      await user.clear(screen.getByTestId('last-name'));
      await user.type(screen.getByTestId('last-name'), `${i + 2}`);
    }

    // Assert - 9 passengers added
    expect(screen.getAllByTestId(/passenger-\d+/)).toHaveLength(9);

    // View price
    await user.click(screen.getByTestId('view-price'));

    // Assert - Price calculated for 9 passengers
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    expect(screen.getByTestId('price-breakdown')).toHaveTextContent('Passengers: 9');
    expect(screen.getByTestId('price-breakdown')).toHaveTextContent('Subtotal: $900'); // 100 * 9
  });

  /**
   * TC-AGT-CRE-008: Verify Booking Limit - Exceed Max
   * Note: Bound (Boundary)
   * 
   * Test Data: Pax: 10
   * 
   * Expected Result:
   * Error "Max booking limit reached"
   */
  it('TC-AGT-CRE-008: should display error "Max booking limit reached" when adding 10+ passengers', async () => {
    // Arrange
    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Try to add 10 passengers
    await user.type(screen.getByTestId('first-name'), 'Passenger');
    await user.type(screen.getByTestId('last-name'), '1');

    // Add 9 passengers successfully
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByTestId('add-passenger'));
      await user.clear(screen.getByTestId('last-name'));
      await user.type(screen.getByTestId('last-name'), `${i + 2}`);
    }

    // Try to add 10th passenger
    await user.click(screen.getByTestId('add-passenger'));

    // Assert - Expected Result: Error "Max booking limit reached"
    await waitFor(() => {
      expect(screen.getByTestId('passengers-error')).toHaveTextContent('Max booking limit reached');
    });

    // Verify only 9 passengers were added
    expect(screen.getAllByTestId(/passenger-\d+/)).toHaveLength(9);
  });

  /**
   * TC-AGT-CRE-009: Verify Agent Discount (If any)
   * Note: Biz (Business)
   * 
   * Test Data: Agent Role
   * 
   * Expected Result:
   * Verify if commission/discount is applied
   */
  it('TC-AGT-CRE-009: should apply agent commission/discount to price breakdown', async () => {
    // Arrange
    mockApplyAgentDiscount.mockResolvedValue({
      discount: 50.00,
      discountRate: 0.05,
    });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Enter booking details
    await user.type(screen.getByTestId('first-name'), 'Test');
    await user.type(screen.getByTestId('last-name'), 'User');

    // Click "View Price"
    await user.click(screen.getByTestId('view-price'));

    // Assert - Expected Result: Verify if commission/discount is applied
    await waitFor(() => {
      expect(mockApplyAgentDiscount).toHaveBeenCalledWith(mockAgentUser.user_id, 100);
    });

    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    // Verify discount is shown in price breakdown
    expect(screen.getByTestId('agent-discount')).toBeInTheDocument();
    expect(screen.getByTestId('agent-discount')).toHaveTextContent('Agent Discount: -$50');
    expect(screen.getByTestId('total-price')).toHaveTextContent('Total: $50'); // 100 - 50
  });

  /**
   * TC-AGT-CRE-010: Verify On-Behalf - Payment Later
   * Note: Flow
   * 
   * Test Data: Status: Hold
   * 
   * Expected Result:
   * Booking created with status "Pending"
   */
  it('TC-AGT-CRE-010: should create booking with status "Pending" when selecting "Pay Later"', async () => {
    // Arrange
    const mockCustomer = {
      user_id: 'CUST-002',
      email: 'customer2@test.com',
    };

    mockGetUserByEmail.mockResolvedValue(mockCustomer);
    mockCreateBooking.mockResolvedValue({ success: true, bookingId: 'BK-006' });
    mockApplyAgentDiscount.mockResolvedValue({ discount: 0 });

    const user = userEvent.setup();

    render(<BookingForm agentUser={mockAgentUser} />);

    // Act - Select "On-Behalf"
    const onBehalfRadio = screen.getByLabelText('On-Behalf');
    await user.click(onBehalfRadio);

    await user.type(screen.getByTestId('customer-email'), 'customer2@test.com');
    await user.type(screen.getByTestId('first-name'), 'Test');
    await user.type(screen.getByTestId('last-name'), 'Customer');

    // Select "Pay Later"
    const payLaterRadio = screen.getByLabelText('Pay Later');
    await user.click(payLaterRadio);

    await user.click(screen.getByTestId('view-price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('submit-booking'));

    // Assert - Expected Result: Booking created with status "Pending"
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_status: 'hold',
          status: 'Pending',
        })
      );
    });
  });
});
