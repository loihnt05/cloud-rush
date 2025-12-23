/**
 * Test Suite: TC-SUP-MOD (Booking Supervision - Modify Booking)
 * Category: Booking Supervision - Modify Booking
 * Description: Unit tests for CSA booking modification features
 * 
 * Test Cases:
 * - TC-SUP-MOD-001: Verify Update Booking Details
 * - TC-SUP-MOD-002: Verify Change Booking Status
 * - TC-SUP-MOD-003: Verify Validation on Update Booking
 * - TC-SUP-MOD-004: Verify Cancel Update Action
 * - TC-SUP-MOD-005: Verify Success Message After Update
 * - TC-SUP-MOD-006: Verify Success Message After Status Change
 * 
 * Prerequisites:
 * 1. User is logged in as CSA
 * 2. User has access to Booking Supervision features
 * 3. Bookings exist in the system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock booking modification APIs
const mockGetBookings = vi.fn();
const mockUpdateBookingDetails = vi.fn();
const mockChangeBookingStatus = vi.fn();

// Mock booking data
const mockBookings = [
  {
    id: 'booking_001',
    bookingRef: 'BK-001',
    flightNumber: 'VN123',
    passengerName: 'Nguyen Van A',
    age: 30,
    phoneNumber: '0901234567',
    seatNumber: '1A',
    seatId: 'seat_001',
    status: 'Confirmed',
    ticketPrice: 2500000
  },
  {
    id: 'booking_002',
    bookingRef: 'BK-002',
    flightNumber: 'VN456',
    passengerName: 'Tran Thi B',
    age: 25,
    phoneNumber: '0909876543',
    seatNumber: '2B',
    seatId: 'seat_002',
    status: 'Pending',
    ticketPrice: 3000000
  },
  {
    id: 'booking_003',
    bookingRef: 'BK-003',
    flightNumber: 'VN789',
    passengerName: 'Le Van C',
    age: 35,
    phoneNumber: '0912345678',
    seatNumber: '10C',
    seatId: 'seat_010',
    status: 'Cancelled',
    ticketPrice: 1800000
  }
];

// Mock BookingModificationPage component
const BookingModificationPage = () => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [updateForm, setUpdateForm] = React.useState({
    seatId: '',
    passengerName: '',
    age: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = React.useState<any>({});
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await mockGetBookings();
    setBookings(data);
  };

  const handleOpenUpdateModal = (booking: any) => {
    setSelectedBooking(booking);
    setUpdateForm({
      seatId: booking.seatId,
      passengerName: booking.passengerName,
      age: booking.age.toString(),
      phoneNumber: booking.phoneNumber
    });
    setErrors({});
    setSuccessMessage('');
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedBooking(null);
    setUpdateForm({ seatId: '', passengerName: '', age: '', phoneNumber: '' });
    setErrors({});
  };

  const validateUpdateForm = () => {
    const newErrors: any = {};

    if (!updateForm.seatId.trim()) {
      newErrors.seatId = 'Seat ID is required';
    }

    if (!updateForm.passengerName.trim()) {
      newErrors.passengerName = 'Passenger name is required';
    }

    if (!updateForm.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(updateForm.age)) || Number(updateForm.age) < 1) {
      newErrors.age = 'Age must be a positive number';
    }

    if (!updateForm.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(updateForm.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUpdate = async () => {
    if (!validateUpdateForm()) {
      return;
    }

    const result = await mockUpdateBookingDetails({
      bookingId: selectedBooking.id,
      seatId: updateForm.seatId,
      passengerName: updateForm.passengerName,
      age: Number(updateForm.age),
      phoneNumber: updateForm.phoneNumber
    });

    if (result.success) {
      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, ...updateForm, age: Number(updateForm.age) }
          : b
      ));

      setSuccessMessage('Booking details updated successfully');
      setShowUpdateModal(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setUpdateForm({ ...updateForm, [field]: value });
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div data-testid="booking-modification-page">
      <h2>Booking Modification</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="update-success-message" style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      {/* Booking List */}
      <table data-testid="booking-list-table">
        <thead>
          <tr>
            <th>Booking Ref</th>
            <th>Flight</th>
            <th>Passenger</th>
            <th>Phone</th>
            <th>Seat</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id} data-testid={`booking-row-${index}`}>
              <td data-testid={`booking-ref-${index}`}>{booking.bookingRef}</td>
              <td data-testid={`booking-flight-${index}`}>{booking.flightNumber}</td>
              <td data-testid={`booking-passenger-${index}`}>{booking.passengerName}</td>
              <td data-testid={`booking-phone-${index}`}>{booking.phoneNumber}</td>
              <td data-testid={`booking-seat-${index}`}>{booking.seatNumber}</td>
              <td data-testid={`booking-status-${index}`}>{booking.status}</td>
              <td data-testid={`booking-actions-${index}`}>
                <button
                  data-testid={`update-booking-btn-${index}`}
                  onClick={() => handleOpenUpdateModal(booking)}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Modal */}
      {showUpdateModal && selectedBooking && (
        <div data-testid="update-booking-modal">
          <h3>Update Booking Details</h3>
          <p data-testid="modal-booking-ref">Booking: {selectedBooking.bookingRef}</p>

          <div data-testid="update-form">
            {/* Seat ID */}
            <div>
              <label htmlFor="seat-id-input">Seat ID:</label>
              <input
                id="seat-id-input"
                data-testid="seat-id-input"
                type="text"
                value={updateForm.seatId}
                onChange={(e) => handleFormChange('seatId', e.target.value)}
              />
              {errors.seatId && (
                <div data-testid="seat-id-error" style={{ color: 'red' }}>
                  {errors.seatId}
                </div>
              )}
            </div>

            {/* Passenger Name */}
            <div>
              <label htmlFor="passenger-name-input">Passenger Name:</label>
              <input
                id="passenger-name-input"
                data-testid="passenger-name-input"
                type="text"
                value={updateForm.passengerName}
                onChange={(e) => handleFormChange('passengerName', e.target.value)}
              />
              {errors.passengerName && (
                <div data-testid="passenger-name-error" style={{ color: 'red' }}>
                  {errors.passengerName}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age-input">Age:</label>
              <input
                id="age-input"
                data-testid="age-input"
                type="text"
                value={updateForm.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
              />
              {errors.age && (
                <div data-testid="age-error" style={{ color: 'red' }}>
                  {errors.age}
                </div>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone-number-input">Phone Number:</label>
              <input
                id="phone-number-input"
                data-testid="phone-number-input"
                type="text"
                value={updateForm.phoneNumber}
                onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
              />
              {errors.phoneNumber && (
                <div data-testid="phone-number-error" style={{ color: 'red' }}>
                  {errors.phoneNumber}
                </div>
              )}
            </div>
          </div>

          <div data-testid="update-modal-actions">
            <button data-testid="save-update-btn" onClick={handleSaveUpdate}>
              Save Changes
            </button>
            <button data-testid="cancel-update-btn" onClick={handleCloseUpdateModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock BookingStatusManagementPage component
const BookingStatusManagementPage = () => {
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [newStatus, setNewStatus] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const statusOptions = ['Confirmed', 'Pending', 'Cancelled'];

  React.useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    const data = await mockGetBookings();
    setBookings(data);
  };

  const handleOpenStatusModal = (booking: any) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setSuccessMessage('');
    setShowStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedBooking(null);
    setNewStatus('');
  };

  const handleChangeStatus = async () => {
    const result = await mockChangeBookingStatus({
      bookingId: selectedBooking.id,
      newStatus: newStatus
    });

    if (result.success) {
      // Update local state
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: newStatus }
          : b
      ));

      setSuccessMessage('Booking status changed successfully');
      setShowStatusModal(false);
    }
  };

  return (
    <div data-testid="booking-status-management-page">
      <h2>Booking Status Management</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="status-change-success-message" style={{ color: 'green', marginBottom: '10px' }}>
          {successMessage}
        </div>
      )}

      {/* Booking List */}
      <table data-testid="booking-status-table">
        <thead>
          <tr>
            <th>Booking Ref</th>
            <th>Flight</th>
            <th>Passenger</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id} data-testid={`status-booking-row-${index}`}>
              <td data-testid={`status-booking-ref-${index}`}>{booking.bookingRef}</td>
              <td data-testid={`status-booking-flight-${index}`}>{booking.flightNumber}</td>
              <td data-testid={`status-booking-passenger-${index}`}>{booking.passengerName}</td>
              <td data-testid={`status-booking-status-${index}`}>{booking.status}</td>
              <td data-testid={`status-booking-actions-${index}`}>
                <button
                  data-testid={`change-status-btn-${index}`}
                  onClick={() => handleOpenStatusModal(booking)}
                >
                  Change Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Change Status Modal */}
      {showStatusModal && selectedBooking && (
        <div data-testid="change-status-modal">
          <h3>Change Booking Status</h3>
          <p data-testid="status-modal-booking-ref">Booking: {selectedBooking.bookingRef}</p>
          <p data-testid="status-modal-current-status">Current Status: {selectedBooking.status}</p>

          <div data-testid="status-form">
            <label htmlFor="status-dropdown">New Status:</label>
            <select
              id="status-dropdown"
              data-testid="status-dropdown"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status} data-testid={`status-option-${status}`}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div data-testid="status-modal-actions">
            <button data-testid="save-status-btn" onClick={handleChangeStatus}>
              Save Status
            </button>
            <button data-testid="cancel-status-btn" onClick={handleCloseStatusModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Test Suite: TC-SUP-MOD (Booking Modification)
describe('TC-SUP-MOD: Booking Supervision - Modify Booking Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookings.mockResolvedValue(mockBookings);
    mockUpdateBookingDetails.mockResolvedValue({ success: true });
    mockChangeBookingStatus.mockResolvedValue({ success: true });
  });

  /**
   * TC-SUP-MOD-001: Verify Update Booking Details
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA selected a booking to modify.
   * 
   * Steps:
   * Step 1: Click "Update" button.
   * Step Expected Result: Input fields become editable.
   * 
   * Step 2: Enter new passenger name/phone.
   * Step Expected Result: Data is accepted.
   * 
   * Step 3: Save changes.
   * Step Expected Result: System updates record.
   * 
   * Test Case Expected Result:
   * CSA can input/modify details: Seat ID, Name, Age, Phone Number.
   */
  it('TC-SUP-MOD-001: should update booking details with new passenger information', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingModificationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-list-table')).toBeInTheDocument();
    });

    // Act - Step 1: Click "Update" button
    await user.click(screen.getByTestId('update-booking-btn-0'));

    // Assert - Step Expected Result: Input fields become editable
    expect(screen.getByTestId('update-booking-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-booking-ref')).toHaveTextContent('BK-001');

    // Verify all input fields are present and editable
    const seatIdInput = screen.getByTestId('seat-id-input') as HTMLInputElement;
    const nameInput = screen.getByTestId('passenger-name-input') as HTMLInputElement;
    const ageInput = screen.getByTestId('age-input') as HTMLInputElement;
    const phoneInput = screen.getByTestId('phone-number-input') as HTMLInputElement;

    expect(seatIdInput).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(ageInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();

    // Verify fields are populated with current data
    expect(seatIdInput.value).toBe('seat_001');
    expect(nameInput.value).toBe('Nguyen Van A');
    expect(ageInput.value).toBe('30');
    expect(phoneInput.value).toBe('0901234567');

    // Act - Step 2: Enter new passenger name/phone
    await user.clear(nameInput);
    await user.type(nameInput, 'Nguyen Van B');
    await user.clear(phoneInput);
    await user.type(phoneInput, '0987654321');

    // Assert - Step Expected Result: Data is accepted
    expect(nameInput.value).toBe('Nguyen Van B');
    expect(phoneInput.value).toBe('0987654321');

    // Act - Step 3: Save changes
    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Step Expected Result: System updates record
    await waitFor(() => {
      expect(mockUpdateBookingDetails).toHaveBeenCalledWith({
        bookingId: 'booking_001',
        seatId: 'seat_001',
        passengerName: 'Nguyen Van B',
        age: 30,
        phoneNumber: '0987654321'
      });
    });

    // Test Case Expected Result: CSA can input/modify details
    expect(screen.queryByTestId('update-booking-modal')).not.toBeInTheDocument();
    
    // Verify updated data in table
    await waitFor(() => {
      expect(screen.getByTestId('booking-passenger-0')).toHaveTextContent('Nguyen Van B');
      expect(screen.getByTestId('booking-phone-0')).toHaveTextContent('0987654321');
    });
  });

  /**
   * TC-SUP-MOD-002: Verify Change Booking Status
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA selected a booking to modify.
   * 
   * Steps:
   * Step 1: Click "Change Status" button.
   * Step Expected Result: Status dropdown appears.
   * 
   * Step 2: Select a new status.
   * Step Expected Result: Selection is valid.
   * 
   * Test Case Expected Result:
   * CSA allows changing booking_flight_status (e.g., to Confirmed/Cancelled).
   */
  it('TC-SUP-MOD-002: should change booking status using dropdown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingStatusManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-status-table')).toBeInTheDocument();
    });

    // Verify initial status
    expect(screen.getByTestId('status-booking-status-1')).toHaveTextContent('Pending');

    // Act - Step 1: Click "Change Status" button
    await user.click(screen.getByTestId('change-status-btn-1'));

    // Assert - Step Expected Result: Status dropdown appears
    expect(screen.getByTestId('change-status-modal')).toBeInTheDocument();
    expect(screen.getByTestId('status-modal-booking-ref')).toHaveTextContent('BK-002');
    expect(screen.getByTestId('status-modal-current-status')).toHaveTextContent('Pending');

    const statusDropdown = screen.getByTestId('status-dropdown') as HTMLSelectElement;
    expect(statusDropdown).toBeInTheDocument();
    expect(statusDropdown.value).toBe('Pending');

    // Act - Step 2: Select a new status
    await user.selectOptions(statusDropdown, 'Confirmed');

    // Assert - Step Expected Result: Selection is valid
    expect(statusDropdown.value).toBe('Confirmed');

    // Save status change
    await user.click(screen.getByTestId('save-status-btn'));

    await waitFor(() => {
      expect(mockChangeBookingStatus).toHaveBeenCalledWith({
        bookingId: 'booking_002',
        newStatus: 'Confirmed'
      });
    });

    // Test Case Expected Result: Status changed successfully
    expect(screen.queryByTestId('change-status-modal')).not.toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('status-booking-status-1')).toHaveTextContent('Confirmed');
    });
  });

  /**
   * TC-SUP-MOD-003: Verify Validation on Update Booking
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA opened update booking modal.
   * 
   * Steps:
   * Step 1: Clear required fields (Name, Phone).
   * Step Expected Result: Error messages appear.
   * 
   * Step 2: Enter invalid phone number.
   * Step Expected Result: Phone validation error appears.
   * 
   * Test Case Expected Result:
   * System validates all required fields and shows specific error messages.
   */
  it('TC-SUP-MOD-003: should validate required fields when updating booking', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingModificationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-list-table')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('update-booking-btn-0'));

    // Act - Step 1: Clear required fields
    const nameInput = screen.getByTestId('passenger-name-input');
    const phoneInput = screen.getByTestId('phone-number-input');
    const ageInput = screen.getByTestId('age-input');
    const seatIdInput = screen.getByTestId('seat-id-input');

    await user.clear(nameInput);
    await user.clear(phoneInput);
    await user.clear(ageInput);
    await user.clear(seatIdInput);

    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Step Expected Result: Error messages appear
    await waitFor(() => {
      expect(screen.getByTestId('passenger-name-error')).toHaveTextContent('Passenger name is required');
      expect(screen.getByTestId('phone-number-error')).toHaveTextContent('Phone number is required');
      expect(screen.getByTestId('age-error')).toHaveTextContent('Age is required');
      expect(screen.getByTestId('seat-id-error')).toHaveTextContent('Seat ID is required');
    });

    // Verify modal is still open (update did not proceed)
    expect(screen.getByTestId('update-booking-modal')).toBeInTheDocument();
    expect(mockUpdateBookingDetails).not.toHaveBeenCalled();

    // Act - Step 2: Enter invalid phone number
    await user.type(nameInput, 'Test Name');
    await user.type(ageInput, '25');
    await user.type(seatIdInput, 'seat_999');
    await user.type(phoneInput, '123'); // Invalid: less than 10 digits

    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Step Expected Result: Phone validation error appears
    await waitFor(() => {
      expect(screen.getByTestId('phone-number-error')).toHaveTextContent('Phone number must be 10 digits');
    });

    // Test Case Expected Result: System validates all fields
    expect(mockUpdateBookingDetails).not.toHaveBeenCalled();
  });

  /**
   * TC-SUP-MOD-004: Verify Cancel Update Action
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA opened update booking modal.
   * 
   * Steps:
   * Step 1: Modify some fields.
   * Step Expected Result: Fields are changed.
   * 
   * Step 2: Click "Cancel" button.
   * Step Expected Result: Modal closes without saving.
   * 
   * Test Case Expected Result:
   * Changes are discarded and original data remains unchanged.
   */
  it('TC-SUP-MOD-004: should discard changes when cancel button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingModificationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-list-table')).toBeInTheDocument();
    });

    // Open update modal
    await user.click(screen.getByTestId('update-booking-btn-0'));

    // Act - Step 1: Modify some fields
    const nameInput = screen.getByTestId('passenger-name-input');
    const phoneInput = screen.getByTestId('phone-number-input');

    await user.clear(nameInput);
    await user.type(nameInput, 'Modified Name');
    await user.clear(phoneInput);
    await user.type(phoneInput, '0999999999');

    // Assert - Step Expected Result: Fields are changed
    expect((nameInput as HTMLInputElement).value).toBe('Modified Name');
    expect((phoneInput as HTMLInputElement).value).toBe('0999999999');

    // Act - Step 2: Click "Cancel" button
    await user.click(screen.getByTestId('cancel-update-btn'));

    // Assert - Step Expected Result: Modal closes without saving
    await waitFor(() => {
      expect(screen.queryByTestId('update-booking-modal')).not.toBeInTheDocument();
    });

    expect(mockUpdateBookingDetails).not.toHaveBeenCalled();

    // Test Case Expected Result: Original data remains unchanged
    expect(screen.getByTestId('booking-passenger-0')).toHaveTextContent('Nguyen Van A');
    expect(screen.getByTestId('booking-phone-0')).toHaveTextContent('0901234567');
  });

  /**
   * TC-SUP-MOD-005: Verify Success Message After Update
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA completed booking update.
   * 
   * Steps:
   * Step 1: Update booking with valid data.
   * Step Expected Result: Update succeeds.
   * 
   * Step 2: Verify success message.
   * Step Expected Result: Success message is displayed.
   * 
   * Test Case Expected Result:
   * "Booking details updated successfully" message appears.
   */
  it('TC-SUP-MOD-005: should display success message after updating booking', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingModificationPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-list-table')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('update-booking-btn-0'));

    // Act - Step 1: Update booking with valid data
    const nameInput = screen.getByTestId('passenger-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Passenger');

    await user.click(screen.getByTestId('save-update-btn'));

    // Assert - Step Expected Result: Update succeeds
    await waitFor(() => {
      expect(mockUpdateBookingDetails).toHaveBeenCalled();
    });

    // Act & Assert - Step 2: Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('update-success-message')).toHaveTextContent('Booking details updated successfully');
    });

    // Test Case Expected Result: Success message appears
    expect(screen.getByTestId('update-success-message')).toBeInTheDocument();
  });

  /**
   * TC-SUP-MOD-006: Verify Success Message After Status Change
   * Business Requirement: BR41
   * 
   * Prerequisites:
   * 1. CSA completed status change.
   * 
   * Steps:
   * Step 1: Change booking status to "Cancelled".
   * Step Expected Result: Status change succeeds.
   * 
   * Step 2: Verify success message.
   * Step Expected Result: Success message is displayed.
   * 
   * Test Case Expected Result:
   * "Booking status changed successfully" message appears.
   */
  it('TC-SUP-MOD-006: should display success message after changing status', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<BookingStatusManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-status-table')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('change-status-btn-0'));

    // Act - Step 1: Change booking status to "Cancelled"
    const statusDropdown = screen.getByTestId('status-dropdown');
    await user.selectOptions(statusDropdown, 'Cancelled');

    await user.click(screen.getByTestId('save-status-btn'));

    // Assert - Step Expected Result: Status change succeeds
    await waitFor(() => {
      expect(mockChangeBookingStatus).toHaveBeenCalledWith({
        bookingId: 'booking_001',
        newStatus: 'Cancelled'
      });
    });

    // Act & Assert - Step 2: Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('status-change-success-message')).toHaveTextContent('Booking status changed successfully');
    });

    // Test Case Expected Result: Success message appears
    expect(screen.getByTestId('status-change-success-message')).toBeInTheDocument();
  });
});
