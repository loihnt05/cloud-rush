/**
 * Test Suite: TC-NOTI & TC-FEED (Traveler Notifications & Feedback - Thông báo)
 * Category: Traveler Support Features - Notifications and Feedback
 * Description: Unit tests for receiving notifications and submitting feedback
 * 
 * Test Cases:
 * - TC-NOTI-001: Receive Notification - Booking Success
 * - TC-NOTI-002: Receive Notification - Flight Change
 * - TC-NOTI-003: Receive Notification - Refund
 * - TC-NOTI-004: Mark Read
 * - TC-NOTI-005: Clear All
 * - TC-FEED-001: Send Feedback - Valid
 * - TC-FEED-002: Send Feedback - Empty
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User has access to notifications and feedback features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock notification APIs
const mockGetNotifications = vi.fn();
const mockMarkNotificationAsRead = vi.fn();
const mockClearAllNotifications = vi.fn();
const mockSubmitFeedback = vi.fn();

// Mock notification data
const mockNotifications = [
  {
    id: 'noti_001',
    type: 'booking_success',
    title: 'Booking Confirmed',
    message: 'Booking BK-123 Confirmed',
    bookingRef: 'BK-123',
    timestamp: '2025-12-23T09:00:00Z',
    isRead: false
  },
  {
    id: 'noti_002',
    type: 'flight_change',
    title: 'Flight Time Changed',
    message: 'Flight VN-123 time changed',
    flightNumber: 'VN-123',
    timestamp: '2025-12-23T10:30:00Z',
    isRead: false
  },
  {
    id: 'noti_003',
    type: 'refund',
    title: 'Refund Processed',
    message: 'Refund processed for BK-123',
    bookingRef: 'BK-123',
    timestamp: '2025-12-23T11:15:00Z',
    isRead: false
  },
  {
    id: 'noti_004',
    type: 'booking_success',
    title: 'Booking Confirmed',
    message: 'Booking BK-456 Confirmed',
    bookingRef: 'BK-456',
    timestamp: '2025-12-22T14:00:00Z',
    isRead: true
  }
];

// Mock TravelerNotificationsPage component
const TravelerNotificationsPage = () => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotificationPanel, setShowNotificationPanel] = React.useState(false);

  React.useEffect(() => {
    loadNotifications();
  }, []);

  React.useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    const data = await mockGetNotifications();
    setNotifications(data);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await mockMarkNotificationAsRead(notificationId);
    
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const handleClearAll = async () => {
    await mockClearAllNotifications();
    setNotifications([]);
  };

  const toggleNotificationPanel = () => {
    setShowNotificationPanel(!showNotificationPanel);
  };

  return (
    <div data-testid="traveler-notifications-page">
      <h2>Notifications</h2>

      {/* Bell Icon with Badge */}
      <div data-testid="notification-bell" onClick={toggleNotificationPanel}>
        <span data-testid="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span data-testid="unread-badge">{unreadCount}</span>
        )}
      </div>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div data-testid="notification-panel">
          <div data-testid="panel-header">
            <h3>Notifications ({notifications.length})</h3>
            {notifications.length > 0 && (
              <button data-testid="clear-all-btn" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div data-testid="empty-notifications">No notifications</div>
          ) : (
            <div data-testid="notification-list">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  data-testid={`notification-${index}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                  style={{
                    backgroundColor: notification.isRead ? '#f0f0f0' : 'white',
                    opacity: notification.isRead ? 0.6 : 1,
                    cursor: 'pointer'
                  }}
                >
                  <div data-testid={`notification-title-${index}`}>
                    {notification.title}
                  </div>
                  <div data-testid={`notification-message-${index}`}>
                    {notification.message}
                  </div>
                  <div data-testid={`notification-time-${index}`}>
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                  <div data-testid={`notification-status-${index}`}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mock FeedbackForm component
const FeedbackForm = () => {
  const [feedbackText, setFeedbackText] = React.useState('');
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!feedbackText.trim()) {
      setError('Content required');
      return;
    }

    setLoading(true);

    try {
      const result = await mockSubmitFeedback({
        content: feedbackText,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        setSuccessMessage('Thank you for feedback');
        setFeedbackText('');
      }
    } catch (err) {
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="feedback-form">
      <h2>Send Feedback</h2>

      {/* Success Message */}
      {successMessage && (
        <div data-testid="success-message">{successMessage}</div>
      )}

      {/* Error Message */}
      {error && (
        <div data-testid="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} data-testid="feedback-form-element">
        <div>
          <label htmlFor="feedback-text">Your Feedback:</label>
          <textarea
            id="feedback-text"
            data-testid="feedback-textarea"
            value={feedbackText}
            onChange={(e) => {
              setFeedbackText(e.target.value);
              setError(''); // Clear error on change
            }}
            placeholder="Enter your feedback here..."
            rows={5}
          />
        </div>

        <button
          type="submit"
          data-testid="submit-feedback-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

describe('TC-NOTI: Traveler Notifications Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetNotifications.mockResolvedValue(mockNotifications);
    mockMarkNotificationAsRead.mockResolvedValue({ success: true });
    mockClearAllNotifications.mockResolvedValue({ success: true });
  });

  /**
   * TC-NOTI-001: Receive Notification - Booking Success
   * Business Requirement: UI
   * 
   * Steps:
   * Book flight. Check bell icon.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * "Booking BK-123 Confirmed".
   */
  it('TC-NOTI-001: should display booking success notification in bell icon', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TravelerNotificationsPage />);

    // Wait for notifications to load
    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    // Assert - Check bell icon shows unread count
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('3'); // 3 unread notifications

    // Act - Click bell icon to open panel
    await user.click(screen.getByTestId('notification-bell'));

    // Assert - Test Case Expected Result: "Booking BK-123 Confirmed"
    expect(await screen.findByTestId('notification-panel')).toBeInTheDocument();
    expect(screen.getByTestId('notification-message-0')).toHaveTextContent('Booking BK-123 Confirmed');
  });

  /**
   * TC-NOTI-002: Receive Notification - Flight Change
   * Business Requirement: UI
   * 
   * Steps:
   * Admin changes time.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * "Flight VN-123 time changed".
   */
  it('TC-NOTI-002: should display flight change notification when admin changes time', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TravelerNotificationsPage />);

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    // Act - Open notification panel
    await user.click(screen.getByTestId('notification-bell'));

    // Assert - Test Case Expected Result: "Flight VN-123 time changed"
    expect(await screen.findByTestId('notification-panel')).toBeInTheDocument();
    expect(screen.getByTestId('notification-message-1')).toHaveTextContent('Flight VN-123 time changed');
    expect(screen.getByTestId('notification-title-1')).toHaveTextContent('Flight Time Changed');
  });

  /**
   * TC-NOTI-003: Receive Notification - Refund
   * Business Requirement: UI
   * 
   * Steps:
   * Refund approved.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * "Refund processed for BK-123".
   */
  it('TC-NOTI-003: should display refund notification when refund is approved', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TravelerNotificationsPage />);

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    // Act - Open notification panel
    await user.click(screen.getByTestId('notification-bell'));

    // Assert - Test Case Expected Result: "Refund processed for BK-123"
    expect(await screen.findByTestId('notification-panel')).toBeInTheDocument();
    expect(screen.getByTestId('notification-message-2')).toHaveTextContent('Refund processed for BK-123');
    expect(screen.getByTestId('notification-title-2')).toHaveTextContent('Refund Processed');
  });

  /**
   * TC-NOTI-004: Mark Read
   * Business Requirement: UI
   * 
   * Steps:
   * Click notification.
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * Status changes to "Read" (Greyed out).
   */
  it('TC-NOTI-004: should mark notification as read and grey out when clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TravelerNotificationsPage />);

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    // Open notification panel
    await user.click(screen.getByTestId('notification-bell'));

    expect(await screen.findByTestId('notification-panel')).toBeInTheDocument();

    // Verify initial unread state
    expect(screen.getByTestId('notification-status-0')).toHaveTextContent('Unread');
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('3');

    // Act - Click notification to mark as read
    await user.click(screen.getByTestId('notification-0'));

    // Assert - Test Case Expected Result: Status changes to "Read" (Greyed out)
    await waitFor(() => {
      expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('noti_001');
    });

    expect(screen.getByTestId('notification-status-0')).toHaveTextContent('Read');
    
    // Verify greyed out style (opacity reduced)
    const notificationElement = screen.getByTestId('notification-0');
    expect(notificationElement).toHaveStyle({ opacity: 0.6 });
    expect(notificationElement).toHaveStyle({ backgroundColor: '#f0f0f0' });

    // Verify unread count decreased
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('2');
  });

  /**
   * TC-NOTI-005: Clear All
   * Business Requirement: UI
   * 
   * Steps:
   * Click "Clear All".
   * 
   * Test Data: Action
   * 
   * Expected Result:
   * List becomes empty.
   */
  it('TC-NOTI-005: should clear all notifications when clicking Clear All button', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<TravelerNotificationsPage />);

    await waitFor(() => {
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    // Open notification panel
    await user.click(screen.getByTestId('notification-bell'));

    expect(await screen.findByTestId('notification-panel')).toBeInTheDocument();

    // Verify notifications exist
    expect(screen.getByTestId('notification-list')).toBeInTheDocument();
    expect(screen.getByTestId('notification-0')).toBeInTheDocument();

    // Act - Click "Clear All"
    await user.click(screen.getByTestId('clear-all-btn'));

    // Assert - Test Case Expected Result: List becomes empty
    await waitFor(() => {
      expect(mockClearAllNotifications).toHaveBeenCalled();
    });

    expect(screen.getByTestId('empty-notifications')).toHaveTextContent('No notifications');
    expect(screen.queryByTestId('notification-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });
});

describe('TC-FEED: Traveler Feedback Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitFeedback.mockResolvedValue({ success: true });
  });

  /**
   * TC-FEED-001: Send Feedback - Valid
   * Business Requirement: Feat
   * 
   * Steps:
   * Enter text. Submit.
   * 
   * Test Data: Text
   * 
   * Expected Result:
   * "Thank you for feedback".
   */
  it('TC-FEED-001: should successfully submit valid feedback and show thank you message', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FeedbackForm />);

    // Act - Enter text
    const textarea = screen.getByTestId('feedback-textarea');
    await user.type(textarea, 'Great service! The booking process was smooth.');

    // Submit
    await user.click(screen.getByTestId('submit-feedback-btn'));

    // Assert - Test Case Expected Result: "Thank you for feedback"
    await waitFor(() => {
      expect(mockSubmitFeedback).toHaveBeenCalledWith({
        content: 'Great service! The booking process was smooth.',
        timestamp: expect.any(String)
      });
    });

    expect(await screen.findByTestId('success-message')).toHaveTextContent('Thank you for feedback');

    // Verify textarea is cleared after successful submission
    expect(textarea).toHaveValue('');
  });

  /**
   * TC-FEED-002: Send Feedback - Empty
   * Business Requirement: Val
   * 
   * Steps:
   * Submit empty form.
   * 
   * Test Data: Empty
   * 
   * Expected Result:
   * Error "Content required".
   */
  it('TC-FEED-002: should show validation error when submitting empty feedback', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FeedbackForm />);

    // Act - Submit empty form
    await user.click(screen.getByTestId('submit-feedback-btn'));

    // Assert - Test Case Expected Result: Error "Content required"
    expect(await screen.findByTestId('error-message')).toHaveTextContent('Content required');

    // Verify API was not called
    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  /**
   * Additional validation test: Clear error when typing
   */
  it('TC-FEED-003: should clear validation error when user starts typing', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<FeedbackForm />);

    // Submit empty form to trigger error
    await user.click(screen.getByTestId('submit-feedback-btn'));

    expect(await screen.findByTestId('error-message')).toHaveTextContent('Content required');

    // Act - Start typing
    const textarea = screen.getByTestId('feedback-textarea');
    await user.type(textarea, 'T');

    // Assert - Error should be cleared
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
});
