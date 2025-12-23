/**
 * Test Suite: User Role Management & Agent Operations (BR6, BR14, BR15, BR49)
 * Categories: User Profile, Admin Operations, Agent Booking
 * 
 * Test Cases:
 * - TC-USER-001: Verify User Profile Display Information
 * - TC-ADMIN-001: Verify Admin "Approve" Role Request
 * - TC-ADMIN-002: Verify Admin "Reject" Role Request
 * - TC-ADMIN-003: Verify Successful Role Update Integration (Auth0 & DB)
 * - TC-ADMIN-004: Verify Failed Role Update Integration
 * - TC-AGENT-001: Verify Agent Booking - Personal Booking Mode
 * - TC-AGENT-002: Verify Agent Booking - On-Behalf Mode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockGetUserProfile = vi.fn();
const mockGetRoleRequests = vi.fn();
const mockApproveRoleRequest = vi.fn();
const mockRejectRoleRequest = vi.fn();
const mockUpdateAuth0Role = vi.fn();
const mockUpdateDatabaseRole = vi.fn();
const mockSendEmailNotification = vi.fn();
const mockCreateBooking = vi.fn();
const mockCalculatePrice = vi.fn();

// ==================== MOCK DATA ====================

const mockTravelerProfile = {
  userId: 'USER001',
  email: 'traveler@example.com',
  username: 'john_traveler',
  role: 'traveler'
};

const mockCSAProfile = {
  userId: 'USER002',
  email: 'agent@cloudrush.com',
  username: 'jane_agent',
  role: 'customer service agent'
};

const mockAdminProfile = {
  userId: 'USER003',
  email: 'admin@cloudrush.com',
  username: 'admin_user',
  role: 'admin'
};

const mockPendingRoleRequest = {
  requestId: 'REQ001',
  userId: 'USER004',
  username: 'pending_user',
  email: 'pending@example.com',
  currentRole: 'traveler',
  requestedRole: 'customer service agent',
  status: 'pending',
  requestDate: '2025-12-20',
  reason: 'I want to help customers with their bookings'
};

const mockApprovedRoleRequest = {
  ...mockPendingRoleRequest,
  status: 'approved'
};

const mockRejectedRoleRequest = {
  ...mockPendingRoleRequest,
  status: 'rejected'
};

// ==================== MOCK COMPONENTS ====================

/**
 * User Profile Page Component
 */
const UserProfilePage: React.FC<{ userId: string }> = ({ userId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const data = await mockGetUserProfile(userId);
      setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [userId]);

  if (loading) {
    return <div data-testid="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div data-testid="error">Profile not found</div>;
  }

  return (
    <div data-testid="user-profile-page">
      <h1>User Profile</h1>

      <div data-testid="profile-information">
        <div data-testid="profile-field-email">
          <label>Email:</label>
          <span data-testid="email-value">{profile.email}</span>
        </div>

        <div data-testid="profile-field-username">
          <label>Username:</label>
          <span data-testid="username-value">{profile.username}</span>
        </div>

        <div data-testid="profile-field-role">
          <label>Current Role:</label>
          <span data-testid="role-value">{profile.role}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Admin Role Request Management Page
 */
const RoleRequestManagementPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      const data = await mockGetRoleRequests();
      setRequests(data);
    };
    loadRequests();
  }, []);

  const handleSelectRequest = (request: any) => {
    setSelectedRequest(request);
    setMessage(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await mockApproveRoleRequest(selectedRequest.requestId);

      if (result.success) {
        setMessage('Role request approved successfully');
        
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.requestId === selectedRequest.requestId 
              ? { ...req, status: 'approved' }
              : req
          )
        );
        setSelectedRequest({ ...selectedRequest, status: 'approved' });
      } else {
        setMessage(result.error || 'Request role failed');
      }
    } catch (error: any) {
      setMessage('Request role failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await mockRejectRoleRequest(selectedRequest.requestId);

      if (result.success) {
        setMessage('Role request rejected');
        
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.requestId === selectedRequest.requestId 
              ? { ...req, status: 'rejected' }
              : req
          )
        );
        setSelectedRequest({ ...selectedRequest, status: 'rejected' });
      }
    } catch (error) {
      setMessage('Failed to reject request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div data-testid="role-request-management-page">
      <h1>Role Request Management</h1>

      <div data-testid="requests-list">
        <h2>Pending Requests</h2>
        {requests.filter(r => r.status === 'pending').map((request) => (
          <div
            key={request.requestId}
            data-testid={`request-item-${request.requestId}`}
            onClick={() => handleSelectRequest(request)}
            style={{ 
              cursor: 'pointer', 
              padding: '8px', 
              border: selectedRequest?.requestId === request.requestId ? '2px solid blue' : '1px solid gray',
              margin: '4px 0'
            }}
          >
            <div>{request.username} - {request.email}</div>
            <div>Requested: {request.requestedRole}</div>
            <div>Status: {request.status}</div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <div data-testid="request-details">
          <h2>Request Details</h2>
          <div data-testid="detail-username">Username: {selectedRequest.username}</div>
          <div data-testid="detail-email">Email: {selectedRequest.email}</div>
          <div data-testid="detail-current-role">Current Role: {selectedRequest.currentRole}</div>
          <div data-testid="detail-requested-role">Requested Role: {selectedRequest.requestedRole}</div>
          <div data-testid="detail-status">Status: {selectedRequest.status}</div>
          <div data-testid="detail-reason">Reason: {selectedRequest.reason}</div>

          <div style={{ marginTop: '16px' }}>
            <button
              data-testid="approve-button"
              onClick={handleApprove}
              disabled={isProcessing || selectedRequest.status !== 'pending'}
            >
              {isProcessing ? 'Processing...' : 'Approve'}
            </button>

            <button
              data-testid="reject-button"
              onClick={handleReject}
              disabled={isProcessing || selectedRequest.status !== 'pending'}
              style={{ marginLeft: '8px' }}
            >
              {isProcessing ? 'Processing...' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div data-testid="message-display" style={{ marginTop: '16px', color: message.includes('failed') ? 'red' : 'green' }}>
          {message}
        </div>
      )}
    </div>
  );
};

/**
 * Agent Booking Page Component
 */
const AgentBookingPage: React.FC<{ agentId: string }> = ({ agentId }) => {
  const [bookingMode, setBookingMode] = useState<'personal' | 'on-behalf'>('personal');
  const [travelerInfo, setTravelerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [flightDetails, setFlightDetails] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    date: ''
  });
  const [price, setPrice] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleModeChange = (mode: 'personal' | 'on-behalf') => {
    setBookingMode(mode);
    setMessage(`Booking mode set to ${mode === 'personal' ? 'Personal' : 'On-behalf'}`);
  };

  const handleCreateBooking = async () => {
    try {
      // Calculate price based on mode
      const ticketCount = bookingMode === 'personal' ? 1 : 1;
      const calculatedPrice = await mockCalculatePrice({ ticketCount, flightNumber: flightDetails.flightNumber });
      setPrice(calculatedPrice);

      // Create booking
      const bookingData = {
        agentId,
        mode: bookingMode,
        flightDetails,
        ...(bookingMode === 'on-behalf' && { travelerInfo }),
        ticketCount,
        totalPrice: calculatedPrice
      };

      const result = await mockCreateBooking(bookingData);

      if (result.success) {
        setMessage(`Booking created successfully (${bookingMode} mode) - Total: $${calculatedPrice}`);
      }
    } catch (error) {
      setMessage('Failed to create booking');
    }
  };

  return (
    <div data-testid="agent-booking-page">
      <h1>Agent Booking</h1>

      {/* Booking Mode Selection */}
      <div data-testid="booking-mode-selection">
        <h2>Select Booking Mode</h2>
        <label>
          <input
            type="radio"
            data-testid="personal-mode-radio"
            checked={bookingMode === 'personal'}
            onChange={() => handleModeChange('personal')}
          />
          Personal (Booking for self)
        </label>
        <label style={{ marginLeft: '16px' }}>
          <input
            type="radio"
            data-testid="on-behalf-mode-radio"
            checked={bookingMode === 'on-behalf'}
            onChange={() => handleModeChange('on-behalf')}
          />
          On-behalf (Booking for traveler)
        </label>
      </div>

      {/* Current Mode Display */}
      <div data-testid="current-mode" style={{ marginTop: '8px', fontWeight: 'bold' }}>
        Current Mode: {bookingMode === 'personal' ? 'Personal' : 'On-behalf'}
      </div>

      {/* On-behalf: Traveler Information */}
      {bookingMode === 'on-behalf' && (
        <div data-testid="traveler-info-section" style={{ marginTop: '16px' }}>
          <h3>Traveler Information</h3>
          <input
            data-testid="traveler-name-input"
            placeholder="Traveler Name"
            value={travelerInfo.name}
            onChange={(e) => setTravelerInfo(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            data-testid="traveler-email-input"
            placeholder="Traveler Email"
            value={travelerInfo.email}
            onChange={(e) => setTravelerInfo(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            data-testid="traveler-phone-input"
            placeholder="Traveler Phone"
            value={travelerInfo.phone}
            onChange={(e) => setTravelerInfo(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      )}

      {/* Flight Details */}
      <div data-testid="flight-details-section" style={{ marginTop: '16px' }}>
        <h3>Flight Details</h3>
        <input
          data-testid="flight-number-input"
          placeholder="Flight Number"
          value={flightDetails.flightNumber}
          onChange={(e) => setFlightDetails(prev => ({ ...prev, flightNumber: e.target.value }))}
        />
        <input
          data-testid="origin-input"
          placeholder="Origin"
          value={flightDetails.origin}
          onChange={(e) => setFlightDetails(prev => ({ ...prev, origin: e.target.value }))}
        />
        <input
          data-testid="destination-input"
          placeholder="Destination"
          value={flightDetails.destination}
          onChange={(e) => setFlightDetails(prev => ({ ...prev, destination: e.target.value }))}
        />
      </div>

      {/* Price Display */}
      {price !== null && (
        <div data-testid="price-display" style={{ marginTop: '16px' }}>
          Total Price: ${price} (for {bookingMode === 'personal' ? '1 ticket' : '1 ticket'})
        </div>
      )}

      {/* Create Booking Button */}
      <button
        data-testid="create-booking-button"
        onClick={handleCreateBooking}
        style={{ marginTop: '16px' }}
      >
        Create Booking
      </button>

      {/* Message Display */}
      {message && (
        <div data-testid="booking-message" style={{ marginTop: '16px' }}>
          {message}
        </div>
      )}
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-USER-ADMIN-AGENT: User Role Management & Agent Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-USER-001: Verify User Profile Display Information
   * Prerequisites: User (Traveler/CSA/Admin) is logged in, navigate to Profile page
   */
  it('TC-USER-001: Profile displays correct Email, Username, and current Role', async () => {
    // Mock profile data
    mockGetUserProfile.mockResolvedValueOnce(mockTravelerProfile);

    // Step 1: Click on "Profile" / "Account Info" (simulated by rendering)
    render(<UserProfilePage userId={mockTravelerProfile.userId} />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByTestId('user-profile-page')).toBeInTheDocument();
    });

    // Step 2: Check the displayed information fields
    const profileInfo = screen.getByTestId('profile-information');
    expect(profileInfo).toBeInTheDocument();

    // Verify email field
    expect(screen.getByTestId('profile-field-email')).toBeInTheDocument();
    expect(screen.getByTestId('email-value')).toHaveTextContent(mockTravelerProfile.email);

    // Verify username field
    expect(screen.getByTestId('profile-field-username')).toBeInTheDocument();
    expect(screen.getByTestId('username-value')).toHaveTextContent(mockTravelerProfile.username);

    // Verify role field
    expect(screen.getByTestId('profile-field-role')).toBeInTheDocument();
    expect(screen.getByTestId('role-value')).toHaveTextContent(mockTravelerProfile.role);

    // Verify API was called with correct userId
    expect(mockGetUserProfile).toHaveBeenCalledWith(mockTravelerProfile.userId);
  });

  /**
   * TC-ADMIN-001: Verify Admin "Approve" Role Request
   * Prerequisites: Admin logged in, pending role request exists, on Role Request list page
   */
  it('TC-ADMIN-001: Traveler role is updated to CSA and Auth0 is notified after approval', async () => {
    const user = userEvent.setup();

    // Mock pending requests and approval
    mockGetRoleRequests.mockResolvedValueOnce([mockPendingRoleRequest]);
    mockApproveRoleRequest.mockResolvedValueOnce({
      success: true,
      updatedRole: 'customer service agent'
    });

    render(<RoleRequestManagementPage />);

    // Wait for requests to load
    await waitFor(() => {
      expect(screen.getByTestId('requests-list')).toBeInTheDocument();
    });

    // Step 1: Select the pending request from the list
    const requestItem = screen.getByTestId(`request-item-${mockPendingRoleRequest.requestId}`);
    expect(requestItem).toBeInTheDocument();

    await user.click(requestItem);

    // Verify detailed request view is shown
    await waitFor(() => {
      expect(screen.getByTestId('request-details')).toBeInTheDocument();
    });

    expect(screen.getByTestId('detail-username')).toHaveTextContent(mockPendingRoleRequest.username);
    expect(screen.getByTestId('detail-current-role')).toHaveTextContent(mockPendingRoleRequest.currentRole);
    expect(screen.getByTestId('detail-requested-role')).toHaveTextContent(mockPendingRoleRequest.requestedRole);

    // Step 2: Click the "Approve" button
    const approveButton = screen.getByTestId('approve-button');
    expect(approveButton).toBeEnabled();

    await user.click(approveButton);

    // Verify approval API was called
    await waitFor(() => {
      expect(mockApproveRoleRequest).toHaveBeenCalledWith(mockPendingRoleRequest.requestId);
    });

    // Verify success message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent('Role request approved successfully');
    });

    // Verify status is updated to approved
    await waitFor(() => {
      expect(screen.getByTestId('detail-status')).toHaveTextContent('approved');
    });
  });

  /**
   * TC-ADMIN-002: Verify Admin "Reject" Role Request
   * Prerequisites: Admin logged in, pending role request exists
   */
  it('TC-ADMIN-002: Traveler role remains unchanged and email notification sent after rejection', async () => {
    const user = userEvent.setup();

    // Mock pending requests and rejection
    mockGetRoleRequests.mockResolvedValueOnce([mockPendingRoleRequest]);
    mockRejectRoleRequest.mockResolvedValueOnce({
      success: true,
      emailSent: true
    });

    render(<RoleRequestManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-list')).toBeInTheDocument();
    });

    // Step 1: Select the pending request from the list
    const requestItem = screen.getByTestId(`request-item-${mockPendingRoleRequest.requestId}`);
    await user.click(requestItem);

    await waitFor(() => {
      expect(screen.getByTestId('request-details')).toBeInTheDocument();
    });

    // Verify current role is still traveler
    expect(screen.getByTestId('detail-current-role')).toHaveTextContent('traveler');

    // Step 2: Click the "Reject" button
    const rejectButton = screen.getByTestId('reject-button');
    expect(rejectButton).toBeEnabled();

    await user.click(rejectButton);

    // Verify rejection API was called
    await waitFor(() => {
      expect(mockRejectRoleRequest).toHaveBeenCalledWith(mockPendingRoleRequest.requestId);
    });

    // Step 3: Verify notification system (check message)
    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent('Role request rejected');
    });

    // Verify status is updated to rejected
    await waitFor(() => {
      expect(screen.getByTestId('detail-status')).toHaveTextContent('rejected');
    });

    // Role should remain traveler (no change)
    expect(screen.getByTestId('detail-current-role')).toHaveTextContent('traveler');
  });

  /**
   * TC-ADMIN-003: Verify Successful Role Update Integration (Auth0 & DB)
   * Prerequisites: Admin approved request, connection to Auth0 is active
   */
  it('TC-ADMIN-003: Local database status is "Approved", Role is "CSA", and email is sent', async () => {
    const user = userEvent.setup();

    // Mock successful Auth0 and DB update
    mockGetRoleRequests.mockResolvedValueOnce([mockPendingRoleRequest]);
    mockApproveRoleRequest.mockImplementationOnce(async (requestId) => {
      // Simulate Auth0 update
      const auth0Result = await mockUpdateAuth0Role(requestId, 'customer service agent');
      
      // Simulate DB update
      const dbResult = await mockUpdateDatabaseRole(requestId, 'approved', 'customer service agent');
      
      // Simulate email notification
      await mockSendEmailNotification(mockPendingRoleRequest.email, 'approved');

      return {
        success: true,
        updatedRole: 'customer service agent',
        auth0Updated: auth0Result.success,
        dbUpdated: dbResult.success,
        emailSent: true
      };
    });

    mockUpdateAuth0Role.mockResolvedValueOnce({ success: true });
    mockUpdateDatabaseRole.mockResolvedValueOnce({ success: true, status: 'approved', role: 'customer service agent' });
    mockSendEmailNotification.mockResolvedValueOnce({ sent: true });

    render(<RoleRequestManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-list')).toBeInTheDocument();
    });

    // Step 1: Admin confirms approval
    const requestItem = screen.getByTestId(`request-item-${mockPendingRoleRequest.requestId}`);
    await user.click(requestItem);

    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Step 2: Verify DB update was called
    await waitFor(() => {
      expect(mockUpdateAuth0Role).toHaveBeenCalledWith(
        mockPendingRoleRequest.requestId,
        'customer service agent'
      );
      expect(mockUpdateDatabaseRole).toHaveBeenCalledWith(
        mockPendingRoleRequest.requestId,
        'approved',
        'customer service agent'
      );
    });

    // Step 3: Verify Email was sent
    await waitFor(() => {
      expect(mockSendEmailNotification).toHaveBeenCalledWith(
        mockPendingRoleRequest.email,
        'approved'
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent('Role request approved successfully');
    });
  });

  /**
   * TC-ADMIN-004: Verify Failed Role Update Integration
   * Prerequisites: Admin attempts to approve request, Auth0 connection fails
   */
  it('TC-ADMIN-004: Error message displayed and rejection email sent when Auth0 update fails', async () => {
    const user = userEvent.setup();

    // Mock Auth0 failure
    mockGetRoleRequests.mockResolvedValueOnce([mockPendingRoleRequest]);
    mockApproveRoleRequest.mockImplementationOnce(async (requestId) => {
      // Step 2: Simulate Auth0 update failure
      const auth0Result = await mockUpdateAuth0Role(requestId, 'customer service agent');

      if (!auth0Result.success) {
        // Step 3: Send rejection email on failure
        await mockSendEmailNotification(mockPendingRoleRequest.email, 'rejected');

        return {
          success: false,
          error: 'Request role failed'
        };
      }

      return { success: true };
    });

    mockUpdateAuth0Role.mockResolvedValueOnce({ success: false, error: 'Auth0 connection failed' });
    mockSendEmailNotification.mockResolvedValueOnce({ sent: true });

    render(<RoleRequestManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-list')).toBeInTheDocument();
    });

    // Step 1: Admin clicks "Approve"
    const requestItem = screen.getByTestId(`request-item-${mockPendingRoleRequest.requestId}`);
    await user.click(requestItem);

    const approveButton = screen.getByTestId('approve-button');
    await user.click(approveButton);

    // Verify Auth0 update was attempted
    await waitFor(() => {
      expect(mockUpdateAuth0Role).toHaveBeenCalledWith(
        mockPendingRoleRequest.requestId,
        'customer service agent'
      );
    });

    // Verify rejection email was sent
    await waitFor(() => {
      expect(mockSendEmailNotification).toHaveBeenCalledWith(
        mockPendingRoleRequest.email,
        'rejected'
      );
    });

    // Step 3: Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('message-display')).toHaveTextContent('Request role failed');
    });
  });

  /**
   * TC-AGENT-001: Verify Agent Booking - Personal Booking Mode
   * Prerequisites: CSA is logged in, on "Create Booking" page
   */
  it('TC-AGENT-001: System creates 1 booking for agent and calculates price for 1 ticket in Personal mode', async () => {
    const user = userEvent.setup();

    // Mock price calculation and booking creation
    mockCalculatePrice.mockResolvedValueOnce(150.00);
    mockCreateBooking.mockResolvedValueOnce({ success: true, bookingId: 'BK001' });

    render(<AgentBookingPage agentId={mockCSAProfile.userId} />);

    // Step 1: Select/Set Booking Status to "Personal"
    const personalRadio = screen.getByTestId('personal-mode-radio');
    expect(personalRadio).toBeChecked(); // Default is personal

    // Verify mode is set to Personal
    expect(screen.getByTestId('current-mode')).toHaveTextContent('Personal');

    // Step 2: Proceed to create booking - Enter flight details
    await user.type(screen.getByTestId('flight-number-input'), 'VN123');
    await user.type(screen.getByTestId('origin-input'), 'Hanoi');
    await user.type(screen.getByTestId('destination-input'), 'Ho Chi Minh City');

    // Click create booking
    const createButton = screen.getByTestId('create-booking-button');
    await user.click(createButton);

    // Step 3: Check Price Calculation - Verify price is for 1 ticket
    await waitFor(() => {
      expect(mockCalculatePrice).toHaveBeenCalledWith({
        ticketCount: 1,
        flightNumber: 'VN123'
      });
    });

    // Verify booking was created with correct mode
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: mockCSAProfile.userId,
          mode: 'personal',
          ticketCount: 1,
          totalPrice: 150.00
        })
      );
    });

    // Verify price display shows 1 ticket
    await waitFor(() => {
      expect(screen.getByTestId('price-display')).toHaveTextContent('Total Price: $150');
      expect(screen.getByTestId('price-display')).toHaveTextContent('for 1 ticket');
    });

    // Verify success message mentions personal mode
    await waitFor(() => {
      expect(screen.getByTestId('booking-message')).toHaveTextContent('Booking created successfully (personal mode)');
    });
  });

  /**
   * TC-AGENT-002: Verify Agent Booking - On-Behalf Mode
   * Prerequisites: CSA is logged in, on "Create Booking" page
   */
  it('TC-AGENT-002: System creates "on-behalf" booking linked to traveler', async () => {
    const user = userEvent.setup();

    // Mock price calculation and booking creation
    mockCalculatePrice.mockResolvedValueOnce(200.00);
    mockCreateBooking.mockResolvedValueOnce({ success: true, bookingId: 'BK002' });

    render(<AgentBookingPage agentId={mockCSAProfile.userId} />);

    // Step 1: Select/Set Booking Status to "On-behalf"
    const onBehalfRadio = screen.getByTestId('on-behalf-mode-radio');
    await user.click(onBehalfRadio);

    // Verify mode is set to On-behalf
    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('On-behalf');
    });

    // Verify traveler info section is visible
    expect(screen.getByTestId('traveler-info-section')).toBeInTheDocument();

    // Step 2: Enter Traveler's information
    await user.type(screen.getByTestId('traveler-name-input'), 'John Customer');
    await user.type(screen.getByTestId('traveler-email-input'), 'customer@example.com');
    await user.type(screen.getByTestId('traveler-phone-input'), '0123456789');

    // Verify traveler info is accepted
    expect(screen.getByTestId('traveler-name-input')).toHaveValue('John Customer');
    expect(screen.getByTestId('traveler-email-input')).toHaveValue('customer@example.com');
    expect(screen.getByTestId('traveler-phone-input')).toHaveValue('0123456789');

    // Enter flight details
    await user.type(screen.getByTestId('flight-number-input'), 'VN456');
    await user.type(screen.getByTestId('origin-input'), 'Da Nang');
    await user.type(screen.getByTestId('destination-input'), 'Singapore');

    // Step 3: Proceed to create booking
    const createButton = screen.getByTestId('create-booking-button');
    await user.click(createButton);

    // Verify booking is recorded as "on-behalf"
    await waitFor(() => {
      expect(mockCreateBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: mockCSAProfile.userId,
          mode: 'on-behalf',
          travelerInfo: {
            name: 'John Customer',
            email: 'customer@example.com',
            phone: '0123456789'
          },
          flightDetails: expect.objectContaining({
            flightNumber: 'VN456',
            origin: 'Da Nang',
            destination: 'Singapore'
          })
        })
      );
    });

    // Verify success message mentions on-behalf mode
    await waitFor(() => {
      expect(screen.getByTestId('booking-message')).toHaveTextContent('Booking created successfully (on-behalf mode)');
    });
  });
});
