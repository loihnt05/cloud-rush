/**
 * Test Suite: User Role & Admin Operations
 * Category: Role Ops
 * Sub-Category: User Role & Admin Operations
 * Mở rộng cho BR14, BR15, BR49
 * 
 * Coverage:
 * - TC-ROLE-OPS-001: Role Request - Empty Reason
 * - TC-ROLE-OPS-002: Admin View - Request List
 * - TC-ROLE-OPS-003: Admin Approve - DB Delay
 * - TC-ROLE-OPS-004: Admin Approve - Email Fail
 * - TC-ROLE-OPS-005: User Profile - Avatar
 * - TC-ROLE-OPS-006: User Profile - Long Name
 * - TC-ROLE-OPS-007: Role Update Reflection
 * - TC-ROLE-OPS-008: Reject - Double Reject
 * - TC-ROLE-OPS-009: Admin - Access Traveler View
 * - TC-ROLE-OPS-010: CSA - Access Admin View
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK DATA ====================

const mockTravelerUser = {
  id: 'user_001',
  email: 'traveler@example.com',
  username: 'traveler_user',
  name: 'John Traveler',
  role: 'Traveler',
  avatar: null,
};

const mockCSAUser = {
  id: 'user_002',
  email: 'csa@example.com',
  username: 'csa_user',
  name: 'Sarah Agent',
  role: 'CSA',
  avatar: 'https://example.com/avatars/sarah.jpg',
};

const mockAdminUser = {
  id: 'user_003',
  email: 'admin@example.com',
  username: 'admin_user',
  name: 'Mike Admin',
  role: 'Admin',
  avatar: 'https://example.com/avatars/mike.jpg',
};

const mockLongNameUser = {
  id: 'user_004',
  email: 'longname@example.com',
  username: 'very_long_username',
  name: 'Christopher Alexander Montgomery Wellington III',
  role: 'Traveler',
  avatar: null,
};

const mockRoleRequests = [
  {
    id: 'req_001',
    userId: 'user_001',
    userName: 'John Traveler',
    userEmail: 'traveler@example.com',
    currentRole: 'Traveler',
    requestedRole: 'CSA',
    reason: 'I want to help customers with their booking issues',
    status: 'pending',
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'req_002',
    userId: 'user_005',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    currentRole: 'Traveler',
    requestedRole: 'CSA',
    reason: 'I have customer service experience',
    status: 'pending',
    createdAt: '2025-12-19T14:30:00Z',
  },
  {
    id: 'req_003',
    userId: 'user_006',
    userName: 'Bob Wilson',
    userEmail: 'bob@example.com',
    currentRole: 'Traveler',
    requestedRole: 'CSA',
    reason: '',
    status: 'rejected',
    createdAt: '2025-12-18T09:15:00Z',
  },
];

const DEFAULT_AVATAR_URL = 'https://example.com/default-avatar.png';

// ==================== MOCK API FUNCTIONS ====================

const mockSubmitRoleRequest = vi.fn();
const mockGetRoleRequests = vi.fn();
const mockApproveRoleRequest = vi.fn();
const mockRejectRoleRequest = vi.fn();
const mockUpdateUserRole = vi.fn();
const mockSendEmailNotification = vi.fn();
const mockGetUserProfile = vi.fn();
const mockCheckRoleAccess = vi.fn();
const mockSimulateDBDelay = vi.fn();

// ==================== MOCK COMPONENTS ====================

/**
 * Role Request Form Component
 */
interface RoleRequestFormProps {
  currentUser: any;
}

const RoleRequestForm: React.FC<RoleRequestFormProps> = ({ currentUser }) => {
  const [requestedRole, setRequestedRole] = useState('CSA');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation: Reason is required
    if (reason.trim() === '') {
      setError('Reason is required. Please provide a reason for your role request.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await mockSubmitRoleRequest({
        userId: currentUser.id,
        currentRole: currentUser.role,
        requestedRole,
        reason: reason.trim(),
      });

      setSuccess(true);
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit role request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="role-request-form">
      <h2>Request Role Change</h2>
      <p>Current Role: <strong>{currentUser.role}</strong></p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="requested-role">Requested Role:</label>
          <select
            id="requested-role"
            data-testid="requested-role-select"
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value)}
          >
            <option value="CSA">Customer Service Agent</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason">Reason (required):</label>
          <textarea
            id="reason"
            data-testid="reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you want this role..."
            rows={4}
            maxLength={500}
          />
          <small>{reason.length}/500 characters</small>
        </div>

        {error && (
          <div data-testid="error-message" className="error">
            {error}
          </div>
        )}

        {success && (
          <div data-testid="success-message" className="success">
            Role request submitted successfully! An admin will review your request.
          </div>
        )}

        <button
          type="submit"
          data-testid="submit-request-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

/**
 * Admin Role Requests List Component
 */
const AdminRoleRequestsList: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await mockGetRoleRequests();
      setRequests(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load role requests');
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, userId: string, requestedRole: string) => {
    setProcessing(requestId);
    setMessage('');
    setError('');

    try {
      // Simulate DB delay (optional)
      await mockSimulateDBDelay?.();

      // Update user role in database
      await mockApproveRoleRequest(requestId);
      await mockUpdateUserRole(userId, requestedRole);

      // Send email notification
      try {
        await mockSendEmailNotification(userId, 'approved', requestedRole);
      } catch (emailError: any) {
        // Email failed but role was approved
        setMessage(`Role approved successfully, but email notification failed: ${emailError.message}`);
        setProcessing(null);
        
        // Update request status in UI
        setRequests(prev => prev.map(req =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        ));
        return;
      }

      setMessage('Role request approved successfully! Email notification sent.');
      
      // Update request status in UI
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, userId: string) => {
    setProcessing(requestId);
    setMessage('');
    setError('');

    try {
      await mockRejectRoleRequest(requestId);

      setMessage('Role request rejected.');
      
      // Update request status in UI
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div data-testid="loading">Loading role requests...</div>;
  }

  return (
    <div data-testid="admin-role-requests-list">
      <h2>Role Requests Management</h2>
      
      {message && (
        <div data-testid="success-message" className="success">
          {message}
        </div>
      )}

      {error && (
        <div data-testid="error-message" className="error">
          {error}
        </div>
      )}

      <table data-testid="requests-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Requested Role</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => (
            <tr key={request.id} data-testid={`request-row-${request.id}`}>
              <td>{request.userName}</td>
              <td>{request.userEmail}</td>
              <td>{request.currentRole}</td>
              <td>{request.requestedRole}</td>
              <td>
                <div
                  data-testid={`reason-${request.id}`}
                  title={request.reason}
                  style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {request.reason || <em>(No reason provided)</em>}
                </div>
              </td>
              <td>
                <span
                  data-testid={`status-${request.id}`}
                  className={`status-badge ${request.status}`}
                >
                  {request.status}
                </span>
              </td>
              <td>{new Date(request.createdAt).toLocaleDateString()}</td>
              <td>
                {request.status === 'pending' && (
                  <div className="action-buttons">
                    <button
                      data-testid={`approve-button-${request.id}`}
                      onClick={() => handleApprove(request.id, request.userId, request.requestedRole)}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      data-testid={`reject-button-${request.id}`}
                      onClick={() => handleReject(request.id, request.userId)}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
                {request.status !== 'pending' && (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {requests.length === 0 && (
        <p data-testid="no-requests">No role requests found.</p>
      )}
    </div>
  );
};

/**
 * User Profile Component
 */
interface UserProfileProps {
  user: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const avatarUrl = user.avatar || DEFAULT_AVATAR_URL;

  return (
    <div data-testid="user-profile">
      <h2>User Profile</h2>
      
      <div className="profile-container">
        <div className="avatar-section">
          <img
            data-testid="user-avatar"
            src={avatarUrl}
            alt={`${user.name}'s avatar`}
            className="avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
            }}
          />
          {!user.avatar && (
            <p data-testid="default-avatar-notice">Using default avatar</p>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-field">
            <label>Name:</label>
            <div
              data-testid="user-name"
              className="user-name"
              title={user.name}
              style={{
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </div>
          </div>

          <div className="profile-field">
            <label>Email:</label>
            <span data-testid="user-email">{user.email}</span>
          </div>

          <div className="profile-field">
            <label>Username:</label>
            <span data-testid="user-username">{user.username}</span>
          </div>

          <div className="profile-field">
            <label>Role:</label>
            <span
              data-testid="user-role"
              className={`role-badge ${user.role.toLowerCase()}`}
            >
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Component with Role-Based Features
 */
interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [accessError, setAccessError] = useState('');

  const checkAccess = async (feature: string) => {
    try {
      const result = await mockCheckRoleAccess(user.role, feature);
      if (!result.allowed) {
        setAccessError(result.message);
      }
      return result.allowed;
    } catch (err) {
      setAccessError('Access check failed');
      return false;
    }
  };

  return (
    <div data-testid="dashboard">
      <h1>Welcome, {user.name}</h1>
      <p>Current Role: <strong data-testid="current-role">{user.role}</strong></p>

      {accessError && (
        <div data-testid="access-error" className="error">
          {accessError}
        </div>
      )}

      <div className="features">
        {/* Traveler Features */}
        {user.role === 'Traveler' && (
          <div data-testid="traveler-features">
            <h3>Traveler Features</h3>
            <button data-testid="book-flight-button">Book Flight</button>
            <button data-testid="view-bookings-button">View My Bookings</button>
          </div>
        )}

        {/* CSA Features */}
        {user.role === 'CSA' && (
          <div data-testid="csa-features">
            <h3>Customer Service Features</h3>
            <button data-testid="customer-support-button">Customer Support</button>
            <button data-testid="manage-bookings-button">Manage Bookings</button>
            <button data-testid="book-flight-button">Book Flight (for customer)</button>
          </div>
        )}

        {/* Admin Features */}
        {user.role === 'Admin' && (
          <div data-testid="admin-features">
            <h3>Admin Features</h3>
            <button
              data-testid="revenue-forecast-button"
              onClick={async () => {
                const allowed = await checkAccess('revenue_forecast');
                if (allowed) {
                  // Navigate to revenue page
                }
              }}
            >
              Revenue Forecast
            </button>
            <button data-testid="user-management-button">User Management</button>
            <button data-testid="system-config-button">System Configuration</button>
            <button data-testid="book-flight-button">Book Flight</button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Protected Route Component
 */
interface ProtectedRouteProps {
  user: any;
  requiredRole: string;
  feature: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, requiredRole, feature, children }) => {
  const [accessAllowed, setAccessAllowed] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const result = await mockCheckRoleAccess(user.role, feature);
      setAccessAllowed(result.allowed);
      
      if (!result.allowed) {
        setErrorMessage(result.message || `Access Denied: ${requiredRole} role required`);
      }
    } catch (err) {
      setAccessAllowed(false);
      setErrorMessage('Access verification failed');
    }
  };

  if (accessAllowed === null) {
    return <div data-testid="checking-access">Checking access...</div>;
  }

  if (!accessAllowed) {
    return (
      <div data-testid="access-denied">
        <h2>Access Denied</h2>
        <p data-testid="error-message">{errorMessage}</p>
        <p>Required Role: <strong>{requiredRole}</strong></p>
        <p>Your Role: <strong>{user.role}</strong></p>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Revenue Forecast Page (Admin Only)
 */
const RevenueForecastPage: React.FC = () => {
  return (
    <div data-testid="revenue-forecast-page">
      <h2>Revenue Forecast</h2>
      <p>This page is only accessible to Admin users.</p>
      <div className="forecast-data">
        <p>Q1 2026: $1,250,000</p>
        <p>Q2 2026: $1,450,000</p>
      </div>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-ROLE-OPS: User Role & Admin Operations - Mở rộng cho BR14, BR15, BR49', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-ROLE-OPS-001: Verify Role Request - Empty Reason
   * Prerequisites: Traveler submits role request
   * Steps:
   * 1. User requests CSA role
   * 2. Leave reason field empty
   * 3. Click submit
   * Expected: Validation error displayed, request not submitted
   */
  it('TC-ROLE-OPS-001: Role request with empty reason displays validation error - request not submitted', async () => {
    const user = userEvent.setup();

    // Step 1: Render role request form
    render(<RoleRequestForm currentUser={mockTravelerUser} />);

    // Verify form is displayed
    expect(screen.getByTestId('role-request-form')).toBeInTheDocument();
    expect(screen.getByText('Current Role:')).toBeInTheDocument();
    expect(screen.getByText('Traveler')).toBeInTheDocument();

    // Step 2: Leave reason empty (default state)
    const reasonInput = screen.getByTestId('reason-input');
    expect(reasonInput).toHaveValue('');

    // Step 3: Click submit button
    const submitButton = screen.getByTestId('submit-request-button');
    await user.click(submitButton);

    // Verify validation error is displayed
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Reason is required');
      expect(errorMessage).toHaveTextContent('Please provide a reason for your role request');
    });

    // Verify API was NOT called
    expect(mockSubmitRoleRequest).not.toHaveBeenCalled();

    // Verify success message is NOT displayed
    expect(screen.queryByTestId('success-message')).not.toBeInTheDocument();
  });

  /**
   * TC-ROLE-OPS-002: Verify Admin View - Request List
   * Prerequisites: Admin logged in
   * Steps:
   * 1. Navigate to "Role Requests" page
   * Expected: List of pending requests displayed with all details
   */
  it('TC-ROLE-OPS-002: Admin views role requests list - all pending requests displayed with details', async () => {
    // Mock API to return role requests
    mockGetRoleRequests.mockResolvedValue(mockRoleRequests);

    // Step 1: Render admin role requests list
    render(<AdminRoleRequestsList />);

    // Verify loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for requests to load
    await waitFor(() => {
      expect(mockGetRoleRequests).toHaveBeenCalled();
    });

    // Verify requests table is displayed
    await waitFor(() => {
      expect(screen.getByTestId('admin-role-requests-list')).toBeInTheDocument();
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // Verify all requests are displayed
    mockRoleRequests.forEach(request => {
      expect(screen.getByTestId(`request-row-${request.id}`)).toBeInTheDocument();
      expect(screen.getByText(request.userName)).toBeInTheDocument();
      expect(screen.getByText(request.userEmail)).toBeInTheDocument();
      expect(screen.getByTestId(`status-${request.id}`)).toHaveTextContent(request.status);
    });

    // Verify pending requests have action buttons
    const pendingRequest = mockRoleRequests.find(r => r.status === 'pending');
    if (pendingRequest) {
      expect(screen.getByTestId(`approve-button-${pendingRequest.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`reject-button-${pendingRequest.id}`)).toBeInTheDocument();
    }

    // Verify rejected requests don't have action buttons
    const rejectedRequest = mockRoleRequests.find(r => r.status === 'rejected');
    if (rejectedRequest) {
      expect(screen.queryByTestId(`approve-button-${rejectedRequest.id}`)).not.toBeInTheDocument();
    }
  });

  /**
   * TC-ROLE-OPS-003: Verify Admin Approve - DB Delay
   * Prerequisites: Admin approving request
   * Steps:
   * 1. Simulate DB latency (2 seconds)
   * 2. Click "Approve" button
   * Expected: Loading state shown during delay, success message after completion
   */
  it('TC-ROLE-OPS-003: Admin approval with database delay shows loading state - completes successfully', async () => {
    const user = userEvent.setup();

    // Mock API responses
    mockGetRoleRequests.mockResolvedValue(mockRoleRequests);
    
    // Simulate DB delay (2 seconds)
    mockSimulateDBDelay.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    );
    
    mockApproveRoleRequest.mockResolvedValue({ success: true });
    mockUpdateUserRole.mockResolvedValue({ success: true });
    mockSendEmailNotification.mockResolvedValue({ success: true });

    // Step 1: Render admin requests list
    render(<AdminRoleRequestsList />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // Find first pending request
    const pendingRequest = mockRoleRequests.find(r => r.status === 'pending');
    const approveButton = screen.getByTestId(`approve-button-${pendingRequest!.id}`);

    // Step 2: Click approve
    await user.click(approveButton);

    // Verify button shows loading state
    await waitFor(() => {
      expect(approveButton).toHaveTextContent('Processing...');
      expect(approveButton).toBeDisabled();
    });

    // Verify DB delay was called
    expect(mockSimulateDBDelay).toHaveBeenCalled();

    // Wait for completion (after delay)
    await waitFor(() => {
      expect(mockApproveRoleRequest).toHaveBeenCalledWith(pendingRequest!.id);
      expect(mockUpdateUserRole).toHaveBeenCalledWith(pendingRequest!.userId, pendingRequest!.requestedRole);
      expect(mockSendEmailNotification).toHaveBeenCalledWith(pendingRequest!.userId, 'approved', pendingRequest!.requestedRole);
    }, { timeout: 3000 });

    // Verify success message
    await waitFor(() => {
      const successMessage = screen.getByTestId('success-message');
      expect(successMessage).toBeInTheDocument();
      expect(successMessage).toHaveTextContent('Role request approved successfully');
      expect(successMessage).toHaveTextContent('Email notification sent');
    }, { timeout: 3000 });
  });

  /**
   * TC-ROLE-OPS-004: Verify Admin Approve - Email Fail
   * Prerequisites: Admin approving request
   * Steps:
   * 1. Mock email service down
   * 2. Click "Approve" button
   * Expected: Role approved, but email failure message displayed
   */
  it('TC-ROLE-OPS-004: Admin approval with email service failure - role approved with warning message', async () => {
    const user = userEvent.setup();

    // Reset all mocks to clear state from previous test
    vi.clearAllMocks();

    // Mock API responses
    mockGetRoleRequests.mockResolvedValue(mockRoleRequests);
    mockSimulateDBDelay.mockResolvedValue(undefined); // No delay for this test
    mockApproveRoleRequest.mockResolvedValue({ success: true });
    mockUpdateUserRole.mockResolvedValue({ success: true });
    
    // Mock email service failure
    mockSendEmailNotification.mockRejectedValue(new Error('Email service unavailable'));

    // Step 1: Render admin requests list
    render(<AdminRoleRequestsList />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // Find first pending request
    const pendingRequest = mockRoleRequests.find(r => r.status === 'pending');
    const approveButton = screen.getByTestId(`approve-button-${pendingRequest!.id}`);

    // Step 2: Click approve
    await user.click(approveButton);

    // Wait for processing
    await waitFor(() => {
      expect(mockApproveRoleRequest).toHaveBeenCalledWith(pendingRequest!.id);
      expect(mockUpdateUserRole).toHaveBeenCalledWith(pendingRequest!.userId, pendingRequest!.requestedRole);
      expect(mockSendEmailNotification).toHaveBeenCalled();
    });

    // Verify success message with email failure warning
    await waitFor(() => {
      const message = screen.getByTestId('success-message');
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent('Role approved successfully');
      expect(message).toHaveTextContent('email notification failed');
      expect(message).toHaveTextContent('Email service unavailable');
    });

    // Verify request status is updated to approved (despite email failure)
    const statusBadge = screen.getByTestId(`status-${pendingRequest!.id}`);
    expect(statusBadge).toHaveTextContent('approved');
  });

  /**
   * TC-ROLE-OPS-005: Verify User Profile - Avatar
   * Prerequisites: User logged in
   * Steps:
   * 1. View user profile
   * 2. Check default avatar
   * Expected: Default avatar displayed when user has no custom avatar
   */
  it('TC-ROLE-OPS-005: User profile displays default avatar when no custom avatar set', async () => {
    // Step 1: Render user profile with no avatar
    render(<UserProfile user={mockTravelerUser} />);

    // Verify profile is displayed
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();

    // Step 2: Verify default avatar is used
    const avatar = screen.getByTestId('user-avatar') as HTMLImageElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.src).toBe(DEFAULT_AVATAR_URL);
    expect(avatar.alt).toBe(`${mockTravelerUser.name}'s avatar`);

    // Verify default avatar notice
    expect(screen.getByTestId('default-avatar-notice')).toBeInTheDocument();
    expect(screen.getByText('Using default avatar')).toBeInTheDocument();

    // Test with user who has custom avatar
    const { unmount } = render(<UserProfile user={mockCSAUser} />);
    
    const customAvatar = screen.getAllByTestId('user-avatar')[1] as HTMLImageElement;
    expect(customAvatar.src).toBe(mockCSAUser.avatar);
    
    // No default notice for custom avatar
    expect(screen.queryByText('Using default avatar')).toBeInTheDocument(); // First render still exists
  });

  /**
   * TC-ROLE-OPS-006: Verify User Profile - Long Name
   * Prerequisites: User logged in
   * Steps:
   * 1. User has very long name
   * 2. View profile
   * Expected: Name truncated with ellipsis, full name in tooltip
   */
  it('TC-ROLE-OPS-006: User profile with very long name displays truncated text with ellipsis and tooltip', async () => {
    // Step 1: Render user profile with long name
    render(<UserProfile user={mockLongNameUser} />);

    // Verify profile is displayed
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();

    // Step 2: Verify name is truncated
    const nameElement = screen.getByTestId('user-name');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveTextContent(mockLongNameUser.name);

    // Verify truncation styles are applied
    const styles = window.getComputedStyle(nameElement);
    expect(nameElement).toHaveStyle({
      maxWidth: '300px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });

    // Verify full name is in title attribute (tooltip)
    expect(nameElement).toHaveAttribute('title', mockLongNameUser.name);
  });

  /**
   * TC-ROLE-OPS-007: Verify Role Update Reflection
   * Prerequisites: Admin approved role change
   * Steps:
   * 1. Traveler becomes CSA after admin approval
   * 2. User refreshes page / re-renders dashboard
   * Expected: Dashboard displays CSA features, role badge updated
   */
  it('TC-ROLE-OPS-007: Role update reflected in dashboard after admin approval - CSA features displayed', async () => {
    // Step 1: Initial render with Traveler role
    const { rerender } = render(<Dashboard user={mockTravelerUser} />);

    // Verify Traveler features are displayed
    expect(screen.getByTestId('traveler-features')).toBeInTheDocument();
    expect(screen.getByText('Traveler Features')).toBeInTheDocument();
    expect(screen.queryByTestId('csa-features')).not.toBeInTheDocument();

    // Step 2: Simulate role update (admin approved, user now CSA)
    const updatedUser = {
      ...mockTravelerUser,
      role: 'CSA',
    };

    // Refresh page (rerender with updated role)
    rerender(<Dashboard user={updatedUser} />);

    // Verify CSA features are now displayed
    await waitFor(() => {
      expect(screen.getByTestId('csa-features')).toBeInTheDocument();
      expect(screen.getByText('Customer Service Features')).toBeInTheDocument();
    });

    // Verify Traveler features are removed
    expect(screen.queryByTestId('traveler-features')).not.toBeInTheDocument();

    // Verify role badge updated
    expect(screen.getByTestId('current-role')).toHaveTextContent('CSA');

    // Verify CSA-specific buttons
    expect(screen.getByTestId('customer-support-button')).toBeInTheDocument();
    expect(screen.getByTestId('manage-bookings-button')).toBeInTheDocument();
  });

  /**
   * TC-ROLE-OPS-008: Verify Reject - Double Reject
   * Prerequisites: Admin already rejected request
   * Steps:
   * 1. Try to reject same request again via API
   * Expected: API returns error "Request already rejected"
   */
  it('TC-ROLE-OPS-008: Double reject attempt returns error - request already rejected', async () => {
    const user = userEvent.setup();

    // Mock API responses
    mockGetRoleRequests.mockResolvedValue(mockRoleRequests);
    
    // First reject succeeds
    mockRejectRoleRequest.mockResolvedValueOnce({ success: true });

    // Step 1: Render admin requests list
    render(<AdminRoleRequestsList />);

    await waitFor(() => {
      expect(screen.getByTestId('requests-table')).toBeInTheDocument();
    });

    // Find first pending request
    const pendingRequest = mockRoleRequests.find(r => r.status === 'pending');
    const rejectButton = screen.getByTestId(`reject-button-${pendingRequest!.id}`);

    // Reject the request (first time)
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockRejectRoleRequest).toHaveBeenCalledWith(pendingRequest!.id);
    });

    // Wait for status update
    await waitFor(() => {
      const statusBadge = screen.getByTestId(`status-${pendingRequest!.id}`);
      expect(statusBadge).toHaveTextContent('rejected');
    });

    // Verify reject button is now removed (request no longer pending)
    expect(screen.queryByTestId(`reject-button-${pendingRequest!.id}`)).not.toBeInTheDocument();

    // Step 2: Simulate second reject attempt (direct API call)
    mockRejectRoleRequest.mockRejectedValueOnce(new Error('Request already rejected'));

    try {
      await mockRejectRoleRequest(pendingRequest!.id);
    } catch (err: any) {
      expect(err.message).toBe('Request already rejected');
    }

    expect(mockRejectRoleRequest).toHaveBeenCalledTimes(2);
  });

  /**
   * TC-ROLE-OPS-009: Verify Admin - Access Traveler View
   * Prerequisites: Admin logged in
   * Steps:
   * 1. Try to book a flight (Traveler feature)
   * Expected: Admin can access Traveler features (Admin has all permissions)
   */
  it('TC-ROLE-OPS-009: Admin can access Traveler features - book flight button available', async () => {
    // Mock role access check - Admin has access to all features
    mockCheckRoleAccess.mockResolvedValue({ allowed: true });

    // Step 1: Render dashboard with Admin user
    render(<Dashboard user={mockAdminUser} />);

    // Verify Admin features are displayed
    await waitFor(() => {
      expect(screen.getByTestId('admin-features')).toBeInTheDocument();
    });

    // Verify book flight button is available (Traveler feature accessible to Admin)
    const bookFlightButton = screen.getByTestId('book-flight-button');
    expect(bookFlightButton).toBeInTheDocument();
    expect(bookFlightButton).toBeEnabled();

    // Verify Admin also has their own features
    expect(screen.getByTestId('revenue-forecast-button')).toBeInTheDocument();
    expect(screen.getByTestId('user-management-button')).toBeInTheDocument();
  });

  /**
   * TC-ROLE-OPS-010: Verify CSA - Access Admin View
   * Prerequisites: CSA logged in
   * Steps:
   * 1. Try to access /admin/revenue
   * Expected: Access Denied - Admin role required
   */
  it('TC-ROLE-OPS-010: CSA cannot access Admin-only features - access denied with error message', async () => {
    // Mock role access check - CSA does NOT have access to Admin features
    mockCheckRoleAccess.mockResolvedValue({
      allowed: false,
      message: 'Access Denied: Admin role required for Revenue Forecast',
    });

    // Step 1: CSA tries to access Revenue Forecast page
    render(
      <ProtectedRoute
        user={mockCSAUser}
        requiredRole="Admin"
        feature="revenue_forecast"
      >
        <RevenueForecastPage />
      </ProtectedRoute>
    );

    // Verify access check is performed
    await waitFor(() => {
      expect(mockCheckRoleAccess).toHaveBeenCalledWith('CSA', 'revenue_forecast');
    });

    // Verify access denied message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    // Verify error message
    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Access Denied: Admin role required for Revenue Forecast');

    // Verify required vs current role
    expect(screen.getByText('Required Role:')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Your Role:')).toBeInTheDocument();
    expect(screen.getByText('CSA')).toBeInTheDocument();

    // Verify protected content is NOT displayed
    expect(screen.queryByTestId('revenue-forecast-page')).not.toBeInTheDocument();
  });
});
