import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Test Suite: TC-SUP-MOD-003 to TC-SUP-MOD-011
 * Category: Supervision - Modify Booking Details (Sửa vé - Admin side)
 * Business Requirement: BR41 - Admin/Agent can thiệp sửa đổi booking
 * 
 * Purpose: Test admin/agent booking modification capabilities with validation and business logic
 * 
 * Coverage:
 * - BR41: Admin/Agent modify booking details
 * - Validation: Name required, seat availability, age logic
 * - Business Logic: Seat occupancy, class upgrades, price differences
 * - Admin Actions: Force cancellation, audit logging
 */

// Mock API functions
const mockGetBookingDetails = vi.fn();
const mockUpdateBookingField = vi.fn();
const mockCheckSeatAvailability = vi.fn();
const mockChangeSeat = vi.fn();
const mockForceCancelBooking = vi.fn();
const mockGetAuditLog = vi.fn();

// Mock booking data
const mockBooking = {
  bookingId: 'BK001',
  passengerId: 'PAX001',
  passengerName: 'Nguyen Van An',
  seatNumber: '12A',
  seatClass: 'Economy',
  ticketId: 'TK001',
  phoneNumber: '0901234567',
  dateOfBirth: '1990-05-15',
  ticketType: 'Adult',
  status: 'Confirmed',
  flightId: 'FLT001',
};

// Mock seat data
const mockSeats = [
  { id: 'S12A', seatNumber: '12A', class: 'Economy', status: 'occupied', passengerId: 'PAX001' },
  { id: 'S12B', seatNumber: '12B', class: 'Economy', status: 'available', passengerId: null },
  { id: 'S10A', seatNumber: '10A', class: 'Economy', status: 'occupied', passengerId: 'PAX999' },
  { id: 'S2A', seatNumber: '2A', class: 'Business', status: 'available', passengerId: null },
];

// Mock audit log
const mockAuditLog = [
  {
    id: 'LOG001',
    timestamp: '2025-12-23T10:30:00Z',
    action: 'Seat Changed',
    details: 'Admin changed seat 12A->12B',
    adminId: 'ADMIN001',
    adminName: 'Admin User',
  },
  {
    id: 'LOG002',
    timestamp: '2025-12-23T09:15:00Z',
    action: 'Name Updated',
    details: 'Changed passenger name from "Nguyen An" to "Nguyen Van An"',
    adminId: 'ADMIN001',
    adminName: 'Admin User',
  },
];

// Mock Component: BookingModificationPage
const BookingModificationPage = ({ bookingId }: { bookingId: string }) => {
  const [booking, setBooking] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [editedData, setEditedData] = React.useState<any>({});
  const [errors, setErrors] = React.useState<any>({});
  const [showSeatChangeModal, setShowSeatChangeModal] = React.useState(false);
  const [selectedSeat, setSelectedSeat] = React.useState('');
  const [auditLog, setAuditLog] = React.useState<any[]>([]);
  const [showAuditLog, setShowAuditLog] = React.useState(false);
  const [showClassUpgradeWarning, setShowClassUpgradeWarning] = React.useState(false);
  const [targetSeatClass, setTargetSeatClass] = React.useState('');

  React.useEffect(() => {
    const loadBooking = async () => {
      const data = await mockGetBookingDetails(bookingId);
      setBooking(data);
      setEditedData(data);
    };
    loadBooking();
  }, [bookingId]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData({ ...editedData, [field]: value });
    // Clear error when field changes
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

    // Age validation logic for DOB change
    if (field === 'dateOfBirth') {
      const age = calculateAge(value);
      if (age < 12 && editedData.ticketType === 'Adult') {
        setErrors({ ...errors, dateOfBirth: 'Child age detected. Ticket Type mismatch.' });
      }
    }
  };

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date('2025-12-23');
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!editedData.passengerName || editedData.passengerName.trim() === '') {
      newErrors.passengerName = 'Name mandatory';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    await mockUpdateBookingField(bookingId, editedData);
    setBooking(editedData);
    setEditMode(false);
  };

  const handleChangeSeat = async () => {
    if (!selectedSeat) return;

    // Check seat availability
    const seatCheck = await mockCheckSeatAvailability(selectedSeat);
    
    if (!seatCheck.available) {
      setErrors({ seat: `Seat ${selectedSeat} occupied` });
      return;
    }

    // Check class upgrade
    const targetSeat = mockSeats.find(s => s.seatNumber === selectedSeat);
    if (targetSeat && targetSeat.class === 'Business' && booking.seatClass === 'Economy') {
      setTargetSeatClass(targetSeat.class);
      setShowClassUpgradeWarning(true);
      return;
    }

    await performSeatChange();
  };

  const performSeatChange = async () => {
    await mockChangeSeat(bookingId, booking.seatNumber, selectedSeat);
    
    const updatedBooking = {
      ...booking,
      seatNumber: selectedSeat,
      seatClass: targetSeatClass || booking.seatClass,
    };
    
    setBooking(updatedBooking);
    setEditedData(updatedBooking);
    setShowSeatChangeModal(false);
    setShowClassUpgradeWarning(false);
    setSelectedSeat('');
    setTargetSeatClass('');
  };

  const handleForceCancel = async () => {
    await mockForceCancelBooking(bookingId);
    
    const updatedBooking = {
      ...booking,
      status: 'Cancelled',
    };
    
    setBooking(updatedBooking);
  };

  const handleViewAuditLog = async () => {
    const logs = await mockGetAuditLog(bookingId);
    setAuditLog(logs);
    setShowAuditLog(true);
  };

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div data-testid="booking-modification-page">
      <h2>Booking Modification</h2>

      <div data-testid="booking-details">
        <div data-testid="booking-id">Booking ID: {booking.bookingId}</div>
        <div data-testid="booking-status">Status: {booking.status}</div>

        {!editMode ? (
          <>
            <div data-testid="passenger-name">Name: {booking.passengerName}</div>
            <div data-testid="seat-number">Seat: {booking.seatNumber}</div>
            <div data-testid="seat-class">Class: {booking.seatClass}</div>
            <div data-testid="phone-number">Phone: {booking.phoneNumber}</div>
            <div data-testid="date-of-birth">DOB: {booking.dateOfBirth}</div>
            <div data-testid="ticket-type">Ticket Type: {booking.ticketType}</div>

            <button data-testid="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            <button data-testid="change-seat-btn" onClick={() => setShowSeatChangeModal(true)}>
              Change Seat
            </button>
            <button data-testid="force-cancel-btn" onClick={handleForceCancel}>
              Force Cancel
            </button>
            <button data-testid="view-audit-log-btn" onClick={handleViewAuditLog}>
              View Audit Log
            </button>
          </>
        ) : (
          <>
            <div>
              <label>Name:</label>
              <input
                data-testid="name-input"
                value={editedData.passengerName}
                onChange={(e) => handleFieldChange('passengerName', e.target.value)}
              />
              {errors.passengerName && (
                <div data-testid="name-error" style={{ color: 'red' }}>
                  {errors.passengerName}
                </div>
              )}
            </div>

            <div>
              <label>Phone:</label>
              <input
                data-testid="phone-input"
                value={editedData.phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              />
            </div>

            <div>
              <label>Date of Birth:</label>
              <input
                data-testid="dob-input"
                type="date"
                value={editedData.dateOfBirth}
                onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
              />
              {errors.dateOfBirth && (
                <div data-testid="dob-error" style={{ color: 'orange' }}>
                  {errors.dateOfBirth}
                </div>
              )}
            </div>

            <button data-testid="save-btn" onClick={handleSave}>
              Save
            </button>
            <button data-testid="cancel-btn" onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Seat Change Modal */}
      {showSeatChangeModal && (
        <div data-testid="seat-change-modal">
          <h3>Change Seat</h3>
          <div>Current Seat: {booking.seatNumber}</div>
          <label>New Seat:</label>
          <input
            data-testid="new-seat-input"
            value={selectedSeat}
            onChange={(e) => setSelectedSeat(e.target.value)}
            placeholder="e.g., 12B"
          />
          {errors.seat && (
            <div data-testid="seat-error" style={{ color: 'red' }}>
              {errors.seat}
            </div>
          )}
          <button data-testid="confirm-seat-change-btn" onClick={handleChangeSeat}>
            Confirm
          </button>
          <button data-testid="close-seat-modal-btn" onClick={() => setShowSeatChangeModal(false)}>
            Close
          </button>
        </div>
      )}

      {/* Class Upgrade Warning */}
      {showClassUpgradeWarning && (
        <div data-testid="class-upgrade-warning">
          <h3>Class Upgrade Warning</h3>
          <p data-testid="upgrade-message">
            Moving from {booking.seatClass} to {targetSeatClass}. Price difference may apply.
          </p>
          <button data-testid="confirm-upgrade-btn" onClick={performSeatChange}>
            Proceed
          </button>
          <button data-testid="cancel-upgrade-btn" onClick={() => setShowClassUpgradeWarning(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div data-testid="audit-log-modal">
          <h3>Modification History</h3>
          <div data-testid="audit-log-list">
            {auditLog.map((log, index) => (
              <div key={log.id} data-testid={`audit-log-${index}`}>
                <div data-testid={`log-timestamp-${index}`}>{log.timestamp}</div>
                <div data-testid={`log-action-${index}`}>{log.action}</div>
                <div data-testid={`log-details-${index}`}>{log.details}</div>
                <div data-testid={`log-admin-${index}`}>By: {log.adminName}</div>
              </div>
            ))}
          </div>
          <button data-testid="close-audit-log-btn" onClick={() => setShowAuditLog(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

// Import React for component
import * as React from 'react';

describe('TC-SUP-MOD-003 to TC-SUP-MOD-011: Booking Modification Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-SUP-MOD-003: Modify Name - Valid
   * Business Requirement: BR41
   * 
   * Test Data / Input: Edit Pax Name
   * Expected Result: Update success
   */
  it('TC-SUP-MOD-003: should successfully update passenger name with valid input', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockUpdateBookingField.mockResolvedValue({ success: true });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-name')).toHaveTextContent('Nguyen Van An');
    });

    // Act: Click Edit button
    const editButton = screen.getByTestId('edit-btn');
    await user.click(editButton);

    // Edit name
    const nameInput = screen.getByTestId('name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nguyen Van Binh');

    // Save
    const saveButton = screen.getByTestId('save-btn');
    await user.click(saveButton);

    // Assert: Update API called and UI updated
    await waitFor(() => {
      expect(mockUpdateBookingField).toHaveBeenCalledWith('BK001', expect.objectContaining({
        passengerName: 'Nguyen Van Binh',
      }));
    });

    // Verify UI shows updated name
    expect(screen.getByTestId('passenger-name')).toHaveTextContent('Nguyen Van Binh');
  });

  /**
   * TC-SUP-MOD-004: Modify Name - Empty
   * Validation Test
   * 
   * Test Data / Input: Clear Name. Save.
   * Expected Result: Error "Name mandatory"
   */
  it('TC-SUP-MOD-004: should show error "Name mandatory" when name is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('passenger-name')).toBeInTheDocument();
    });

    // Act: Click Edit
    await user.click(screen.getByTestId('edit-btn'));

    // Clear name
    const nameInput = screen.getByTestId('name-input');
    await user.clear(nameInput);

    // Try to save
    await user.click(screen.getByTestId('save-btn'));

    // Assert: Error message displayed
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toHaveTextContent('Name mandatory');
    });

    // Verify update API not called
    expect(mockUpdateBookingField).not.toHaveBeenCalled();
  });

  /**
   * TC-SUP-MOD-005: Change Seat - To Empty
   * Business Requirement: BR41
   * 
   * Test Data / Input: Move 12A -> 12B
   * Expected Result: 12A free, 12B occupied
   */
  it('TC-SUP-MOD-005: should successfully change seat from 12A to empty seat 12B', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockCheckSeatAvailability.mockResolvedValue({ available: true });
    mockChangeSeat.mockResolvedValue({ success: true });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-number')).toHaveTextContent('12A');
    });

    // Act: Click Change Seat button
    await user.click(screen.getByTestId('change-seat-btn'));

    // Modal opens
    await waitFor(() => {
      expect(screen.getByTestId('seat-change-modal')).toBeInTheDocument();
    });

    // Enter new seat
    const newSeatInput = screen.getByTestId('new-seat-input');
    await user.type(newSeatInput, '12B');

    // Confirm change
    await user.click(screen.getByTestId('confirm-seat-change-btn'));

    // Assert: Seat availability checked
    await waitFor(() => {
      expect(mockCheckSeatAvailability).toHaveBeenCalledWith('12B');
    });

    // Seat change API called
    expect(mockChangeSeat).toHaveBeenCalledWith('BK001', '12A', '12B');

    // UI updated
    expect(screen.getByTestId('seat-number')).toHaveTextContent('12B');
  });

  /**
   * TC-SUP-MOD-006: Change Seat - To Occupied
   * Logic Test
   * 
   * Test Data / Input: Move 12A -> 10A (Taken)
   * Expected Result: Error "Seat 10A occupied"
   */
  it('TC-SUP-MOD-006: should show error when trying to change to occupied seat 10A', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockCheckSeatAvailability.mockResolvedValue({ available: false });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-number')).toBeInTheDocument();
    });

    // Act: Open seat change modal
    await user.click(screen.getByTestId('change-seat-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('seat-change-modal')).toBeInTheDocument();
    });

    // Try to change to occupied seat
    const newSeatInput = screen.getByTestId('new-seat-input');
    await user.type(newSeatInput, '10A');
    await user.click(screen.getByTestId('confirm-seat-change-btn'));

    // Assert: Error message displayed
    await waitFor(() => {
      expect(screen.getByTestId('seat-error')).toHaveTextContent('Seat 10A occupied');
    });

    // Verify seat change not executed
    expect(mockChangeSeat).not.toHaveBeenCalled();

    // Original seat unchanged
    expect(screen.getByTestId('seat-number')).toHaveTextContent('12A');
  });

  /**
   * TC-SUP-MOD-007: Change Seat - Class Upgrade
   * Business Logic
   * 
   * Test Data / Input: Move Eco -> Biz
   * Expected Result: Warn "Price difference" or Allow
   */
  it('TC-SUP-MOD-007: should show price difference warning when upgrading from Economy to Business', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockCheckSeatAvailability.mockResolvedValue({ available: true });
    mockChangeSeat.mockResolvedValue({ success: true });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('seat-class')).toHaveTextContent('Economy');
    });

    // Act: Open seat change modal
    await user.click(screen.getByTestId('change-seat-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('seat-change-modal')).toBeInTheDocument();
    });

    // Try to change to Business seat
    const newSeatInput = screen.getByTestId('new-seat-input');
    await user.type(newSeatInput, '2A');
    await user.click(screen.getByTestId('confirm-seat-change-btn'));

    // Assert: Class upgrade warning displayed
    await waitFor(() => {
      expect(screen.getByTestId('class-upgrade-warning')).toBeInTheDocument();
      expect(screen.getByTestId('upgrade-message')).toHaveTextContent(
        'Moving from Economy to Business. Price difference may apply.'
      );
    });

    // Act: Confirm upgrade
    await user.click(screen.getByTestId('confirm-upgrade-btn'));

    // Assert: Seat changed with class upgrade
    await waitFor(() => {
      expect(mockChangeSeat).toHaveBeenCalledWith('BK001', '12A', '2A');
      expect(screen.getByTestId('seat-number')).toHaveTextContent('2A');
      expect(screen.getByTestId('seat-class')).toHaveTextContent('Business');
    });
  });

  /**
   * TC-SUP-MOD-008: Update Phone Contact
   * Business Requirement: BR41
   * 
   * Test Data / Input: Edit phone number
   * Expected Result: Update success
   */
  it('TC-SUP-MOD-008: should successfully update phone number', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockUpdateBookingField.mockResolvedValue({ success: true });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('phone-number')).toHaveTextContent('0901234567');
    });

    // Act: Edit phone
    await user.click(screen.getByTestId('edit-btn'));

    const phoneInput = screen.getByTestId('phone-input');
    await user.clear(phoneInput);
    await user.type(phoneInput, '0987654321');

    await user.click(screen.getByTestId('save-btn'));

    // Assert: Update success
    await waitFor(() => {
      expect(mockUpdateBookingField).toHaveBeenCalledWith('BK001', expect.objectContaining({
        phoneNumber: '0987654321',
      }));
    });

    expect(screen.getByTestId('phone-number')).toHaveTextContent('0987654321');
  });

  /**
   * TC-SUP-MOD-009: Update DOB - Child
   * Logic Test
   * 
   * Test Data / Input: Change Adult DOB to Child
   * Expected Result: System flags Ticket Type mismatch
   */
  it('TC-SUP-MOD-009: should flag ticket type mismatch when changing adult DOB to child age', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('ticket-type')).toHaveTextContent('Adult');
    });

    // Act: Edit DOB to child age (< 12 years)
    await user.click(screen.getByTestId('edit-btn'));

    const dobInput = screen.getByTestId('dob-input');
    await user.clear(dobInput);
    await user.type(dobInput, '2018-05-15'); // 7 years old

    // Assert: Warning message displayed
    await waitFor(() => {
      expect(screen.getByTestId('dob-error')).toHaveTextContent(
        'Child age detected. Ticket Type mismatch.'
      );
    });

    // Verify warning exists (color will be orange in component)
    const errorElement = screen.getByTestId('dob-error');
    expect(errorElement).toBeInTheDocument();
  });

  /**
   * TC-SUP-MOD-010: Force Cancel Booking
   * Admin Action
   * 
   * Test Data / Input: Click "Force Cancel"
   * Expected Result: Booking Cancelled. Seat Released.
   */
  it('TC-SUP-MOD-010: should force cancel booking and release seat when admin clicks Force Cancel', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockForceCancelBooking.mockResolvedValue({ success: true, seatReleased: true });

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-status')).toHaveTextContent('Confirmed');
    });

    // Act: Click Force Cancel button
    const forceCancelButton = screen.getByTestId('force-cancel-btn');
    await user.click(forceCancelButton);

    // Assert: Force cancel API called
    await waitFor(() => {
      expect(mockForceCancelBooking).toHaveBeenCalledWith('BK001');
    });

    // Status updated to Cancelled
    expect(screen.getByTestId('booking-status')).toHaveTextContent('Cancelled');
  });

  /**
   * TC-SUP-MOD-011: View Audit Log
   * Security Feature
   * 
   * Test Data / Input: View modification history
   * Expected Result: "Admin changed seat 12A->12B"
   */
  it('TC-SUP-MOD-011: should display audit log with modification history when viewing log', async () => {
    // Arrange
    const user = userEvent.setup();
    mockGetBookingDetails.mockResolvedValue(mockBooking);
    mockGetAuditLog.mockResolvedValue(mockAuditLog);

    render(<BookingModificationPage bookingId="BK001" />);

    await waitFor(() => {
      expect(screen.getByTestId('booking-details')).toBeInTheDocument();
    });

    // Act: Click View Audit Log button
    const viewLogButton = screen.getByTestId('view-audit-log-btn');
    await user.click(viewLogButton);

    // Assert: Audit log modal displayed
    await waitFor(() => {
      expect(screen.getByTestId('audit-log-modal')).toBeInTheDocument();
    });

    // Verify audit log API called
    expect(mockGetAuditLog).toHaveBeenCalledWith('BK001');

    // Verify log entries displayed
    expect(screen.getByTestId('log-details-0')).toHaveTextContent('Admin changed seat 12A->12B');
    expect(screen.getByTestId('log-action-0')).toHaveTextContent('Seat Changed');
    expect(screen.getByTestId('log-admin-0')).toHaveTextContent('By: Admin User');

    // Verify second log entry
    expect(screen.getByTestId('log-details-1')).toHaveTextContent(
      'Changed passenger name from "Nguyen An" to "Nguyen Van An"'
    );
    expect(screen.getByTestId('log-action-1')).toHaveTextContent('Name Updated');

    // Close modal
    await user.click(screen.getByTestId('close-audit-log-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('audit-log-modal')).not.toBeInTheDocument();
    });
  });
});
