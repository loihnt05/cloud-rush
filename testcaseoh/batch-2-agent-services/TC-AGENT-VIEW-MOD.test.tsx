/**
 * Test Suite: TC-AGENT-VIEW-MOD (Agent View and Modify Booking)
 * Category: Agent View and Agent Modify
 * Description: Unit tests for Agent booking view and modification functionality
 * 
 * Test Cases:
 * - TC-AGENT-VIEW-001: Verify Detailed Booking View
 * - TC-AGENT-MOD-001: Verify Modify Booking Status (Change)
 * - TC-AGENT-MOD-002: Verify Close View without Modification
 * 
 * Prerequisites:
 * 1. CSA is logged in
 * 2. CSA searches for a booking ID
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking API
const mockGetBookingDetails = vi.fn();
const mockUpdateBookingStatus = vi.fn();

// Mock BookingDetailView component (placeholder for actual component)
const BookingDetailView = ({ bookingId, onClose }: { bookingId: string; onClose: () => void }) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState('');

  React.useEffect(() => {
    mockGetBookingDetails(bookingId).then((data: any) => {
      setBooking(data);
      setSelectedStatus(data.status);
    });
  }, [bookingId]);

  const handleModifyClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    await mockUpdateBookingStatus(bookingId, selectedStatus);
    const updatedBooking = await mockGetBookingDetails(bookingId);
    setBooking(updatedBooking);
    setIsEditing(false);
  };

  const handleCloseClick = () => {
    onClose();
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div data-testid="booking-detail-view">
      <div className="header">
        <h1>Booking Details</h1>
        <button onClick={handleCloseClick} data-testid="close-button">X</button>
      </div>

      <section data-testid="flight-section">
        <h2>Flight Information</h2>
        <div>Flight Number: {booking.flightNumber}</div>
        <div>Departure: {booking.departure}</div>
        <div>Arrival: {booking.arrival}</div>
        <div>Date: {booking.date}</div>
      </section>

      <section data-testid="passenger-section">
        <h2>Passenger Information</h2>
        <div>Name: {booking.passengerName}</div>
        <div>Email: {booking.passengerEmail}</div>
        <div>Phone: {booking.passengerPhone}</div>
      </section>

      <section data-testid="payment-section">
        <h2>Payment Details</h2>
        <div>Total Amount: ${booking.totalAmount}</div>
        <div>Payment Method: {booking.paymentMethod}</div>
        <div>Payment Status: {booking.paymentStatus}</div>
      </section>

      <section data-testid="status-section">
        <h2>Booking Status</h2>
        {isEditing ? (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            data-testid="status-dropdown"
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        ) : (
          <div data-testid="status-display">Status: {booking.status}</div>
        )}
      </section>

      <div className="actions">
        {!isEditing ? (
          <button onClick={handleModifyClick} data-testid="modify-button">
            Change
          </button>
        ) : (
          <button onClick={handleSaveClick} data-testid="save-button">
            Save
          </button>
        )}
      </div>
    </div>
  );
};

// Mock BookingList component
const BookingList = () => {
  const [selectedBooking, setSelectedBooking] = React.useState<string | null>(null);

  const bookings = [
    { id: 'BK001', status: 'Confirmed' },
    { id: 'BK002', status: 'Pending' },
  ];

  if (selectedBooking) {
    return (
      <BookingDetailView
        bookingId={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    );
  }

  return (
    <div data-testid="booking-list">
      <h1>Booking List</h1>
      {bookings.map((booking) => (
        <div key={booking.id} onClick={() => setSelectedBooking(booking.id)}>
          <button data-testid={`booking-${booking.id}`}>
            {booking.id} - {booking.status}
          </button>
        </div>
      ))}
    </div>
  );
};

describe('Agent View and Modify Booking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AGENT-VIEW-001: Verify Detailed Booking View
   * Business Requirement: BR12 9
   * 
   * Prerequisites:
   * 1. CSA is logged in
   * 2. CSA searches for a booking ID
   * 
   * Steps:
   * Step 1: Select a booking from the list
   * - Expected: System navigates to the detailed view page
   * 
   * Step 2: Verify displayed sections
   * - Expected: Sections [Flight], [Passenger], [Payment] are visible
   * 
   * Test Case Expected Result:
   * Page displays Flight info, Passenger info, and Payment details correctly
   */
  it('TC-AGENT-VIEW-001: should display detailed booking view with Flight, Passenger, and Payment sections when a booking is selected', async () => {
    // Arrange - Mock booking data
    const mockBookingData = {
      id: 'BK001',
      flightNumber: 'AA123',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      date: '2025-12-25',
      passengerName: 'John Doe',
      passengerEmail: 'john.doe@example.com',
      passengerPhone: '+1234567890',
      totalAmount: 350.00,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      status: 'Confirmed',
    };

    mockGetBookingDetails.mockResolvedValue(mockBookingData);

    const user = userEvent.setup();

    // Act - Step 1: Select a booking from the list
    render(<BookingList />);
    
    const bookingButton = screen.getByTestId('booking-BK001');
    await user.click(bookingButton);

    // Assert - Step 1: System navigates to the detailed view page
    await waitFor(() => {
      expect(screen.getByTestId('booking-detail-view')).toBeInTheDocument();
    });

    // Assert - Step 2: Verify displayed sections
    const flightSection = screen.getByTestId('flight-section');
    const passengerSection = screen.getByTestId('passenger-section');
    const paymentSection = screen.getByTestId('payment-section');

    
    expect(flightSection).toBeInTheDocument();
    expect(passengerSection).toBeInTheDocument();
    expect(paymentSection).toBeInTheDocument();

    // Assert - Verify Flight Information is displayed correctly
    expect(flightSection).toHaveTextContent('Flight Information');
    expect(flightSection).toHaveTextContent('Flight Number: AA123');
    expect(flightSection).toHaveTextContent('Departure: New York (JFK)');
    expect(flightSection).toHaveTextContent('Arrival: Los Angeles (LAX)');
    expect(flightSection).toHaveTextContent('Date: 2025-12-25');

    // Assert - Verify Passenger Information is displayed correctly
    expect(passengerSection).toHaveTextContent('Passenger Information');
    expect(passengerSection).toHaveTextContent('Name: John Doe');
    expect(passengerSection).toHaveTextContent('Email: john.doe@example.com');
    expect(passengerSection).toHaveTextContent('Phone: +1234567890');

    // Assert - Verify Payment Details are displayed correctly
    expect(paymentSection).toHaveTextContent('Payment Details');
    expect(paymentSection).toHaveTextContent('Total Amount: $350');
    expect(paymentSection).toHaveTextContent('Payment Method: Credit Card');
    expect(paymentSection).toHaveTextContent('Payment Status: Paid');

    // Verify API was called with correct booking ID
    expect(mockGetBookingDetails).toHaveBeenCalledWith('BK001');
  });

  /**
   * TC-AGENT-MOD-001: Verify Modify Booking Status (Change)
   * Business Requirement: BR13 10
   * 
   * Prerequisites:
   * 1. CSA is viewing a booking (Triggered TC-AGENT-VIEW-001)
   * 
   * Steps:
   * Step 1: Click the "Change" / "Modify" button
   * - Expected: Fields become editable or Status dropdown appears
   * 
   * Step 2: Change status (e.g., from "Confirmed" to "Cancelled")
   * - Expected: New status is selected
   * 
   * Step 3: Click "Save" button
   * - Expected: System saves the new status to DB
   * 
   * Test Case Expected Result:
   * Booking status is updated in DB and Traveler is notified via email
   */
  it('TC-AGENT-MOD-001: should update booking status in DB when CSA modifies and saves the booking status', async () => {
    // Arrange - Mock booking data
    const initialBookingData = {
      id: 'BK001',
      flightNumber: 'AA123',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      date: '2025-12-25',
      passengerName: 'John Doe',
      passengerEmail: 'john.doe@example.com',
      passengerPhone: '+1234567890',
      totalAmount: 350.00,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      status: 'Confirmed',
    };

    const updatedBookingData = {
      ...initialBookingData,
      status: 'Cancelled',
    };

    mockGetBookingDetails
      .mockResolvedValueOnce(initialBookingData)
      .mockResolvedValueOnce(updatedBookingData);
    
    mockUpdateBookingStatus.mockResolvedValue({ success: true });

    const user = userEvent.setup();
    const onClose = vi.fn();

    // Render booking detail view directly (prerequisite: CSA is viewing a booking)
    render(<BookingDetailView bookingId="BK001" onClose={onClose} />);

    // Wait for initial booking data to load
    await waitFor(() => {
      expect(screen.getByTestId('status-display')).toHaveTextContent('Status: Confirmed');
    });

    // Act - Step 1: Click the "Change" / "Modify" button
    const modifyButton = screen.getByTestId('modify-button');
    await user.click(modifyButton);

    // Assert - Step 1: Status dropdown appears
    await waitFor(() => {
      expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
    });

    const statusDropdown = screen.getByTestId('status-dropdown');
    expect(statusDropdown).toHaveValue('Confirmed');

    // Act - Step 2: Change status from "Confirmed" to "Cancelled"
    await user.selectOptions(statusDropdown, 'Cancelled');

    // Assert - Step 2: New status is selected
    expect(statusDropdown).toHaveValue('Cancelled');

    // Act - Step 3: Click "Save" button
    const saveButton = screen.getByTestId('save-button');
    await user.click(saveButton);

    // Assert - Step 3: System saves the new status to DB
    await waitFor(() => {
      expect(mockUpdateBookingStatus).toHaveBeenCalledWith('BK001', 'Cancelled');
    });

    // Assert - Booking status is updated in the UI after save
    await waitFor(() => {
      expect(screen.getByTestId('status-display')).toHaveTextContent('Status: Cancelled');
    });

    // Verify DB was updated with new status
    expect(mockUpdateBookingStatus).toHaveBeenCalledTimes(1);
    expect(mockGetBookingDetails).toHaveBeenCalledTimes(2); // Initial load + after save

    // Note: Email notification to traveler would be handled by backend
    // and is not part of the frontend unit test scope
  });

  /**
   * TC-AGENT-MOD-002: Verify Close View without Modification
   * Business Requirement: BR13 11
   * 
   * Prerequisites:
   * 1. CSA is viewing a booking
   * 
   * Steps:
   * Step 1: Click the "X" (Close) button on top right
   * - Expected: System closes the detail view modal/page
   * 
   * Step 2: Check booking status in list
   * - Expected: Status remains unchanged
   * 
   * Test Case Expected Result:
   * User returns to the previous list/dashboard; no data is changed
   */
  it('TC-AGENT-MOD-002: should close detail view without modifying data when CSA clicks the close button', async () => {
    // Arrange - Mock booking data
    const mockBookingData = {
      id: 'BK001',
      flightNumber: 'AA123',
      departure: 'New York (JFK)',
      arrival: 'Los Angeles (LAX)',
      date: '2025-12-25',
      passengerName: 'John Doe',
      passengerEmail: 'john.doe@example.com',
      passengerPhone: '+1234567890',
      totalAmount: 350.00,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      status: 'Confirmed',
    };

    mockGetBookingDetails.mockResolvedValue(mockBookingData);

    const user = userEvent.setup();

    // Prerequisite: CSA is viewing a booking
    render(<BookingList />);
    
    // Open booking detail view
    const bookingButton = screen.getByTestId('booking-BK001');
    await user.click(bookingButton);

    await waitFor(() => {
      expect(screen.getByTestId('booking-detail-view')).toBeInTheDocument();
    });

    // Verify initial status
    const statusDisplay = screen.getByTestId('status-display');
    expect(statusDisplay).toHaveTextContent('Status: Confirmed');

    // Store the initial number of API calls
    const initialApiCalls = mockUpdateBookingStatus.mock.calls.length;

    // Act - Step 1: Click the "X" (Close) button on top right
    const closeButton = screen.getByTestId('close-button');
    await user.click(closeButton);

    // Assert - Step 1: System closes the detail view modal/page
    await waitFor(() => {
      expect(screen.queryByTestId('booking-detail-view')).not.toBeInTheDocument();
    });

    // Assert - Step 1: User returns to the previous list/dashboard
    expect(screen.getByTestId('booking-list')).toBeInTheDocument();

    // Assert - Step 2: No data modification occurred
    expect(mockUpdateBookingStatus.mock.calls.length).toBe(initialApiCalls);
    expect(mockUpdateBookingStatus).not.toHaveBeenCalled();

    // Assert - Step 2: Booking status in list remains unchanged
    const bookingInList = screen.getByTestId('booking-BK001');
    expect(bookingInList).toHaveTextContent('BK001 - Confirmed');
  });
});
