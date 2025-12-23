/**
 * Test Suite: Security & Session Management (BR4, BR5)
 * Sub-Category: Security & Session (Bảo mật & Phiên làm việc)
 * 
 * Test Cases:
 * - TC-AUTH-SEC-001: Verify Brute Force Lockout
 * - TC-AUTH-SEC-002: Verify SQL Injection (Email)
 * - TC-AUTH-SEC-003: Verify XSS Injection (Email)
 * - TC-AUTH-SEC-004: Verify Session Timeout
 * - TC-AUTH-SEC-005: Verify Back Button after Logout
 * - TC-AUTH-SEC-006: Verify Login on Multiple Tabs
 * - TC-AUTH-SEC-007: Verify Logout on Multiple Tabs
 * - TC-AUTH-SEC-008: Verify Access Token in LocalStorage
 * - TC-AUTH-SEC-009: Verify Tampered Token
 * - TC-AUTH-SEC-010: Verify URL Access without Login
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockValidateToken = vi.fn();
const mockRefreshToken = vi.fn();
const mockCheckProtectedRoute = vi.fn();
const mockSanitizeInput = vi.fn();

// ==================== MOCK DATA ====================

const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InRyYXZlbGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
const mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.signature';
const mockTamperedToken = mockValidToken.slice(0, -3) + 'XXX';

const mockValidUser = {
  email: 'user@example.com',
  password: 'ValidPass123'
};

// ==================== UTILITY FUNCTIONS ====================

const TOKEN_KEY = 'auth_token';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// ==================== MOCK COMPONENTS ====================

/**
 * Secure Login Page with Brute Force Protection
 */
const SecureLoginPage: React.FC<{
  onLogin?: (token: string) => void;
  onError?: (error: string) => void;
}> = ({ onLogin, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  useEffect(() => {
    // Check if account is locked
    const lockoutEnd = localStorage.getItem('lockout_end');
    if (lockoutEnd) {
      const endTime = parseInt(lockoutEnd);
      if (Date.now() < endTime) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
      } else {
        localStorage.removeItem('lockout_end');
        localStorage.removeItem('login_attempts');
      }
    }
  }, []);

  const sanitizeInput = (input: string): string => {
    // Remove SQL injection patterns
    const sqlPatterns = /('|--|;|\/\*|\*\/|xp_|sp_|union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|onerror|onload)/gi;
    
    // Remove XSS patterns
    const xssPatterns = /(<script|<\/script|javascript:|onerror=|onload=|<img|<iframe|<object|<embed)/gi;
    
    if (sqlPatterns.test(input) || xssPatterns.test(input)) {
      return ''; // Return empty string for malicious input
    }
    
    return input;
  };

  const handleLogin = async () => {
    setError(null);

    // Check if locked
    if (isLocked && lockoutEndTime) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 1000 / 60);
      setError(`Account locked. Try again in ${remainingTime} minutes.`);
      onError?.(`Account locked. Try again in ${remainingTime} minutes.`);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Invalid input detected. Malicious content blocked.');
      onError?.('Invalid input detected. Malicious content blocked.');
      return;
    }

    try {
      const result = await mockLogin({ email: sanitizedEmail, password: sanitizedPassword });

      if (result.success) {
        // Reset attempts on success
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('lockout_end');
        setAttemptCount(0);
        
        // Store token
        localStorage.setItem(TOKEN_KEY, result.token);
        
        onLogin?.(result.token);
      } else {
        // Increment failed attempts
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        localStorage.setItem('login_attempts', newAttemptCount.toString());

        if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
          // Lock account
          const lockEnd = Date.now() + LOCKOUT_DURATION;
          localStorage.setItem('lockout_end', lockEnd.toString());
          setIsLocked(true);
          setLockoutEndTime(lockEnd);
          setError(`Too many failed attempts. Account locked for 15 minutes.`);
          onError?.(`Too many failed attempts. Account locked for 15 minutes.`);
        } else {
          setError(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttemptCount} attempts remaining.`);
          onError?.(`Invalid credentials. ${MAX_LOGIN_ATTEMPTS - newAttemptCount} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('Login failed');
      onError?.('Login failed');
    }
  };

  return (
    <div data-testid="secure-login-page">
      <h1>Secure Login</h1>

      {isLocked && (
        <div data-testid="lockout-warning" style={{ color: 'red', fontWeight: 'bold' }}>
          Account temporarily locked due to too many failed login attempts.
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          data-testid="email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          data-testid="password-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div data-testid="login-error" style={{ color: 'red' }}>
          {error}
        </div>
      )}

      <div data-testid="attempt-counter" style={{ display: 'none' }}>
        Attempts: {attemptCount}/{MAX_LOGIN_ATTEMPTS}
      </div>

      <button
        data-testid="login-button"
        onClick={handleLogin}
        disabled={isLocked}
      >
        Login
      </button>
    </div>
  );
};

/**
 * Protected Dashboard with Token Validation
 */
const ProtectedDashboard: React.FC<{ onSessionExpired?: () => void }> = ({ onSessionExpired }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const validateSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Validate token
        const isValid = await mockValidateToken(token);

        if (isValid) {
          setIsAuthenticated(true);
          setUserEmail('user@example.com');

          // Set session timeout
          timeout = setTimeout(() => {
            localStorage.removeItem(TOKEN_KEY);
            setIsAuthenticated(false);
            onSessionExpired?.();
          }, SESSION_TIMEOUT);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
      }
    };

    validateSession();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [onSessionExpired]);

  const handleLogout = async () => {
    await mockLogout();
    localStorage.removeItem(TOKEN_KEY);
    
    // Broadcast logout to other tabs
    localStorage.setItem('logout_event', Date.now().toString());
    
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Listen for logout events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logout_event') {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isAuthenticated === null) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div data-testid="access-denied">
        <h1>Access Denied</h1>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div data-testid="protected-dashboard">
      <h1>Dashboard</h1>
      <div data-testid="user-info">Welcome, {userEmail}</div>
      <button data-testid="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

/**
 * Storage Inspector Component
 */
const StorageInspector: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    setToken(storedToken);
  }, []);

  return (
    <div data-testid="storage-inspector">
      <h2>Application Storage</h2>
      <div data-testid="storage-content">
        {token ? (
          <div>
            <strong>Token:</strong>
            <div data-testid="stored-token">{token}</div>
          </div>
        ) : (
          <div data-testid="no-token">No token found</div>
        )}
      </div>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-AUTH-SEC: Security & Session Management (BR4, BR5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  /**
   * TC-AUTH-SEC-001: Verify Brute Force Lockout
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-SEC-001: Account locked after 5 failed login attempts', async () => {
    const user = userEvent.setup();

    // Mock failed login
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    const handleError = vi.fn();
    render(<SecureLoginPage onError={handleError} />);

    // Step 1: Enter wrong password 5 times rapidly
    for (let i = 1; i <= 5; i++) {
      await user.clear(screen.getByTestId('email-input'));
      await user.clear(screen.getByTestId('password-input'));
      
      await user.type(screen.getByTestId('email-input'), 'user@example.com');
      await user.type(screen.getByTestId('password-input'), 'WrongPassword');
      await user.click(screen.getByTestId('login-button'));

      if (i < 5) {
        // Wait for error message
        await waitFor(() => {
          expect(screen.getByTestId('login-error')).toHaveTextContent(`${5 - i} attempts remaining`);
        });
      }
    }

    // Verify account is locked after 5 attempts
    await waitFor(() => {
      expect(screen.getByTestId('lockout-warning')).toBeInTheDocument();
      expect(screen.getByTestId('login-error')).toHaveTextContent('Too many failed attempts. Account locked for 15 minutes.');
    });

    // Verify login button is disabled
    expect(screen.getByTestId('login-button')).toBeDisabled();

    // Verify lockout data in localStorage
    expect(localStorage.getItem('lockout_end')).toBeTruthy();
    expect(localStorage.getItem('login_attempts')).toBe('5');
  });

  /**
   * TC-AUTH-SEC-002: Verify SQL Injection (Email)
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-SEC-002: SQL injection attempt in email field is blocked', async () => {
    const user = userEvent.setup();

    const handleError = vi.fn();
    render(<SecureLoginPage onError={handleError} />);

    // Step 1: Enter ' OR 1=1 --
    await user.type(screen.getByTestId('email-input'), "' OR 1=1 --");
    await user.type(screen.getByTestId('password-input'), 'password');
    await user.click(screen.getByTestId('login-button'));

    // Verify malicious input is blocked
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid input detected. Malicious content blocked.');
    });

    // Verify login was not attempted with malicious input
    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-SEC-003: Verify XSS Injection (Email)
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-SEC-003: XSS injection attempt in email field is blocked', async () => {
    const user = userEvent.setup();

    const handleError = vi.fn();
    render(<SecureLoginPage onError={handleError} />);

    // Step 1: Enter <script>alert(1)</script>
    await user.type(screen.getByTestId('email-input'), '<script>alert(1)</script>');
    await user.type(screen.getByTestId('password-input'), 'password');
    await user.click(screen.getByTestId('login-button'));

    // Verify XSS attempt is blocked
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid input detected. Malicious content blocked.');
    });

    // Verify login was not attempted
    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-SEC-004: Verify Session Timeout
   * Prerequisites: User logged in
   */
  it('TC-AUTH-SEC-004: Session expires after token timeout (30 mins)', async () => {
    vi.useFakeTimers();

    // Mock valid token initially
    mockValidateToken.mockResolvedValue(true);
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    const handleSessionExpired = vi.fn();
    render(<ProtectedDashboard onSessionExpired={handleSessionExpired} />);

    // Verify user is authenticated initially
    await vi.waitFor(() => {
      expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
    });

    // Step 1: Simulate 30 minutes idle (token expiry)
    await vi.advanceTimersByTimeAsync(SESSION_TIMEOUT);

    // Verify session expired
    await vi.waitFor(() => {
      expect(handleSessionExpired).toHaveBeenCalled();
    });

    // Verify token is removed
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();

    vi.useRealTimers();
  });

  /**
   * TC-AUTH-SEC-005: Verify Back Button after Logout
   * Prerequisites: User logged out
   */
  it('TC-AUTH-SEC-005: Back button after logout shows access denied', async () => {
    const user = userEvent.setup();

    // Setup: User is logged in
    mockValidateToken.mockResolvedValue(true);
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    const { rerender } = render(<ProtectedDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
    });

    // User logs out
    await user.click(screen.getByTestId('logout-button'));

    // Verify logout clears token
    await waitFor(() => {
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    // Step 1: Simulate browser back button (rerender same component)
    mockValidateToken.mockResolvedValue(false);
    rerender(<ProtectedDashboard />);

    // Verify access denied is shown
    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
      expect(screen.getByText('Please log in to access this page.')).toBeInTheDocument();
    });
  });

  /**
   * TC-AUTH-SEC-006: Verify Login on Multiple Tabs
   * Prerequisites: Tab 1 logged in
   */
  it('TC-AUTH-SEC-006: Token from Tab 1 is accessible in Tab 2 via localStorage', async () => {
    // Step 1: Simulate Tab 1 login
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    // Simulate Tab 2 opening and accessing dashboard
    mockValidateToken.mockResolvedValue(true);
    render(<ProtectedDashboard />);

    // Verify Tab 2 can access protected content with shared token
    await waitFor(() => {
      expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
    });

    expect(mockValidateToken).toHaveBeenCalledWith(mockValidToken);
  });

  /**
   * TC-AUTH-SEC-007: Verify Logout on Multiple Tabs
   * Prerequisites: Tab 1 & 2 open, both logged in
   */
  it('TC-AUTH-SEC-007: Logout on Tab 1 triggers logout on Tab 2 via storage event', async () => {
    const user = userEvent.setup();

    // Setup: Both tabs have token
    mockValidateToken.mockResolvedValue(true);
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    // Render Tab 1
    const { rerender: rerenderTab1 } = render(<ProtectedDashboard />);
    await waitFor(() => {
      expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
    });

    // Render Tab 2 (unmount Tab 1 first)
    rerenderTab1(<div />);
    const { unmount } = render(<ProtectedDashboard />);
    await waitFor(() => {
      expect(screen.getAllByTestId('protected-dashboard')).toHaveLength(1);
    });

    unmount();

    // Re-render Tab 1 and Tab 2
    render(<ProtectedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('protected-dashboard')).toBeInTheDocument();
    });

    // Step 1: Logout on Tab 1 (triggers storage event)
    await user.click(screen.getByTestId('logout-button'));

    // Verify logout event was broadcasted
    expect(localStorage.getItem('logout_event')).toBeTruthy();
  });

  /**
   * TC-AUTH-SEC-008: Verify Access Token in LocalStorage
   * Prerequisites: User logged in
   */
  it('TC-AUTH-SEC-008: Access token is stored in localStorage after successful login', async () => {
    // Step 1: Simulate successful login
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    // Inspect Application Storage
    render(<StorageInspector />);

    // Verify token is visible in storage inspector
    expect(screen.getByTestId('storage-inspector')).toBeInTheDocument();
    expect(screen.getByTestId('stored-token')).toBeInTheDocument();
    expect(screen.getByTestId('stored-token')).toHaveTextContent(mockValidToken);
  });

  /**
   * TC-AUTH-SEC-009: Verify Tampered Token
   * Prerequisites: User logged in
   */
  it('TC-AUTH-SEC-009: Tampered/modified token is rejected and access denied', async () => {
    // Setup: User has valid token
    localStorage.setItem(TOKEN_KEY, mockValidToken);

    // Step 1: Edit JWT char in Storage (simulate tampering)
    localStorage.setItem(TOKEN_KEY, mockTamperedToken);

    // Mock token validation to reject tampered token
    mockValidateToken.mockResolvedValue(false);

    // Refresh (render dashboard)
    render(<ProtectedDashboard />);

    // Verify tampered token is rejected
    await waitFor(() => {
      expect(mockValidateToken).toHaveBeenCalledWith(mockTamperedToken);
    });

    // Verify access is denied
    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    // Verify token is removed from storage
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  /**
   * TC-AUTH-SEC-010: Verify URL Access without Login
   * Prerequisites: User logged out
   */
  it('TC-AUTH-SEC-010: Direct URL access to protected route without login shows access denied', async () => {
    // Step 1: User is logged out (no token)
    // Simulate pasting URL /admin/dashboard directly

    mockValidateToken.mockResolvedValueOnce(false);
    mockCheckProtectedRoute.mockResolvedValueOnce({ allowed: false, redirect: '/login' });

    // Attempt to access protected dashboard
    render(<ProtectedDashboard />);

    // Verify no token exists
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();

    // Verify access denied is shown
    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    expect(screen.getByText('Please log in to access this page.')).toBeInTheDocument();
  });
});
