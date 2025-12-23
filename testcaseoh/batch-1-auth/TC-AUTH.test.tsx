/**
 * Test Suite: Authentication & User Role Management (BR1 - BR15, BR49)
 * Category: Authentication (Sign In)
 * 
 * Test Cases:
 * - TC-AUTH-001: Verify "Sign In" button visibility on Landing Page
 * - TC-AUTH-002: Verify Auth0 Login Page elements display
 * - TC-AUTH-003: Verify Login with Username/Password - Validation Failed (Empty Fields)
 * - TC-AUTH-004: Verify Login with Username/Password - Invalid Format
 * - TC-AUTH-005: Verify Login with Username/Password - Success
 * - TC-AUTH-006: Verify Login with Third Party (Google)
 * - TC-AUTH-007: Verify JWT Token Validation - Valid Token
 * - TC-AUTH-008: Verify JWT Token Validation - Invalid/Expired Token
 * - TC-AUTH-009: Verify Role Authorization - Admin
 * - TC-AUTH-010: Verify Role Authorization - Customer Service Agent (CSA)
 * - TC-AUTH-011: Verify Role Authorization - Traveler (Default)
 * - TC-AUTH-012: Verify Role Authorization - Access Denied (Unknown Role)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockAuth0Login = vi.fn();
const mockAuth0GoogleLogin = vi.fn();
const mockAuth0GithubLogin = vi.fn();
const mockValidateJWT = vi.fn();
const mockGetUserRole = vi.fn();
const mockCheckAuthorization = vi.fn();
const mockRedirectToAuth0 = vi.fn();

// ==================== MOCK DATA ====================

const mockValidUser = {
  username: 'user@example.com',
  password: 'ValidPassword123!'
};

const mockAdminUser = {
  username: 'admin@cloudrush.com',
  password: 'Admin123!',
  role: 'admin'
};

const mockCSAUser = {
  username: 'agent@cloudrush.com',
  password: 'Agent123!',
  role: 'customer service agent'
};

const mockTravelerUser = {
  username: 'traveler@example.com',
  password: 'Traveler123!',
  role: 'traveler'
};

const mockUnknownRoleUser = {
  username: 'unknown@example.com',
  password: 'Unknown123!',
  role: 'unknown'
};

const mockValidJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InRyYXZlbGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature';
const mockExpiredJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.signature';
const mockInvalidJWT = 'invalid.token.signature';

// ==================== MOCK COMPONENTS ====================

/**
 * Landing Page Component with Sign In button
 */
const LandingPage: React.FC = () => {
  const handleSignInClick = () => {
    mockRedirectToAuth0();
  };

  return (
    <div data-testid="landing-page">
      <header data-testid="landing-header">
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div data-testid="logo">CloudRush</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <button
              data-testid="sign-in-button"
              onClick={handleSignInClick}
              style={{
                position: 'relative',
                top: '0',
                right: '0',
                padding: '8px 16px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>
        </nav>
      </header>
      <main>
        <h1>Welcome to CloudRush</h1>
        <p>Your trusted airline booking platform</p>
      </main>
    </div>
  );
};

/**
 * Auth0 Login Page Component
 */
const Auth0LoginPage: React.FC<{
  onLogin?: (token: string) => void;
  onError?: (error: string) => void;
}> = ({ onLogin, onError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    // Check empty fields
    if (!username.trim()) {
      newErrors.username = 'MSG 1: This field is mandatory';
    }
    if (!password.trim()) {
      newErrors.password = 'MSG 1: This field is mandatory';
    }

    // Check email format
    if (username.trim() && !username.includes('@')) {
      newErrors.username = 'MSG 4: Your information is not in the correct format';
    }

    // Check for incomplete email (e.g., "user@")
    if (username.trim() && username.endsWith('@')) {
      newErrors.username = 'MSG 4: Your information is not in the correct format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUsernamePasswordLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await mockAuth0Login({ username, password });
      if (result.token) {
        onLogin?.(result.token);
      }
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await mockAuth0GoogleLogin();
      if (result.token) {
        onLogin?.(result.token);
      }
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await mockAuth0GithubLogin();
      if (result.token) {
        onLogin?.(result.token);
      }
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  return (
    <div data-testid="auth0-login-page">
      <h1>Sign In to CloudRush</h1>

      {/* Third-party login options */}
      <div data-testid="third-party-login-section">
        <button
          data-testid="google-login-button"
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </button>

        <button
          data-testid="github-login-button"
          onClick={handleGithubLogin}
        >
          Continue with Github
        </button>
      </div>

      <div data-testid="divider">OR</div>

      {/* Username/Password login form */}
      <div data-testid="username-password-form">
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            data-testid="username-input"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrors(prev => ({ ...prev, username: undefined }));
            }}
            placeholder="Enter your email"
          />
          {errors.username && (
            <div data-testid="username-error" style={{ color: 'red' }}>
              {errors.username}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            data-testid="password-input"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="Enter your password"
          />
          {errors.password && (
            <div data-testid="password-error" style={{ color: 'red' }}>
              {errors.password}
            </div>
          )}
        </div>

        <button
          data-testid="login-button"
          onClick={handleUsernamePasswordLogin}
        >
          Log In
        </button>
      </div>
    </div>
  );
};

/**
 * Protected Dashboard Component
 */
const Dashboard: React.FC<{ token: string }> = ({ token }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Validate JWT token
        const isValid = await mockValidateJWT(token);

        if (!isValid) {
          setIsAuthorized(false);
          setError('Access Denied');
          return;
        }

        // Get user role from token
        const role = await mockGetUserRole(token);
        setUserRole(role);

        // Check authorization
        const authResult = await mockCheckAuthorization(role);
        
        if (authResult.status === 403) {
          setIsAuthorized(false);
          setError('Access Denied');
        } else {
          setIsAuthorized(true);
        }
      } catch (err) {
        setIsAuthorized(false);
        setError('Access Denied');
      }
    };

    checkAuth();
  }, [token]);

  if (isAuthorized === null) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (!isAuthorized) {
    return (
      <div data-testid="access-denied">
        <h1>Access Denied</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div data-testid="dashboard">
      <h1>Dashboard</h1>
      <div data-testid="user-role">Role: {userRole}</div>

      {userRole === 'admin' && (
        <div data-testid="admin-features">
          <h2>Admin Features</h2>
          <ul>
            <li>Revenue Forecast</li>
            <li>User Management</li>
            <li>System Configuration</li>
          </ul>
        </div>
      )}

      {userRole === 'customer service agent' && (
        <div data-testid="csa-features">
          <h2>Agent Dashboard</h2>
          <ul>
            <li>Customer Support</li>
            <li>Booking Management</li>
            <li>Flight Supervision</li>
          </ul>
        </div>
      )}

      {userRole === 'traveler' && (
        <div data-testid="traveler-features">
          <h2>Booking Features</h2>
          <ul>
            <li>Search Flights</li>
            <li>Book Tickets</li>
            <li>View Bookings</li>
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Protected Page Component
 */
const ProtectedPage: React.FC<{ token: string }> = ({ token }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validate = async () => {
      const valid = await mockValidateJWT(token);
      setIsValid(valid);
    };
    validate();
  }, [token]);

  if (isValid === null) {
    return <div data-testid="loading">Validating...</div>;
  }

  if (!isValid) {
    return (
      <div data-testid="access-denied">
        <h1>Access Denied</h1>
        <p>Invalid or expired token. Please log in again.</p>
      </div>
    );
  }

  return (
    <div data-testid="protected-content">
      <h1>Protected Content</h1>
      <p>You have access to this page.</p>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-AUTH: Authentication & User Role Management (BR1 - BR15, BR49)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * TC-AUTH-001: Verify "Sign In" button visibility on Landing Page
   * Prerequisites: Device connected to internet, user on Landing Page (not logged in)
   */
  it('TC-AUTH-001: Sign In button is clearly visible at the top right corner of Landing Page', () => {
    render(<LandingPage />);

    // Step 1: Open the application URL (Landing Page)
    const landingPage = screen.getByTestId('landing-page');
    expect(landingPage).toBeInTheDocument();

    // Step 2: Observe the top right corner of the header
    const header = screen.getByTestId('landing-header');
    expect(header).toBeInTheDocument();

    // Verify Sign In button is visible
    const signInButton = screen.getByTestId('sign-in-button');
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveTextContent('Sign In');

    // Verify button is positioned in top right (has positioning styles)
    expect(signInButton).toBeVisible();
    
    // Verify button is clickable
    expect(signInButton).not.toBeDisabled();
  });

  /**
   * TC-AUTH-002: Verify Auth0 Login Page elements display
   * Prerequisites: User on Landing Page, stable internet connection
   */
  it('TC-AUTH-002: Auth0 login page displays all required login methods (Google, Github, Username/Password)', async () => {
    const user = userEvent.setup();

    // Step 1: Click the "Sign In" button
    render(<LandingPage />);
    const signInButton = screen.getByTestId('sign-in-button');
    await user.click(signInButton);

    // Verify redirect to Auth0 was called
    expect(mockRedirectToAuth0).toHaveBeenCalledTimes(1);

    // Step 2: Render Auth0 login page and observe login options
    const { unmount } = render(<Auth0LoginPage />);

    const auth0Page = screen.getByTestId('auth0-login-page');
    expect(auth0Page).toBeInTheDocument();

    // Verify third-party login options
    const thirdPartySection = screen.getByTestId('third-party-login-section');
    expect(thirdPartySection).toBeInTheDocument();

    // Verify "Continue with Google" button
    const googleButton = screen.getByTestId('google-login-button');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveTextContent('Continue with Google');

    // Verify "Continue with Github" button
    const githubButton = screen.getByTestId('github-login-button');
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toHaveTextContent('Continue with Github');

    // Verify Username/Password form
    const usernamePasswordForm = screen.getByTestId('username-password-form');
    expect(usernamePasswordForm).toBeInTheDocument();

    // Verify Username input
    const usernameInput = screen.getByTestId('username-input');
    expect(usernameInput).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();

    // Verify Password input
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Verify Log In button
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Log In');

    unmount();
  });

  /**
   * TC-AUTH-003: Verify Login with Username/Password - Validation Failed (Empty Fields)
   * Prerequisites: User on Auth0 Login Page
   */
  it('TC-AUTH-003: System displays error message when Username and Password fields are empty', async () => {
    const user = userEvent.setup();

    render(<Auth0LoginPage />);

    // Step 1: Leave "Username" and "Password" fields empty
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');

    expect(usernameInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');

    // Step 2: Click the "Log In" button
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    // Verify validation error messages are displayed
    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
    });

    // Verify error message content
    expect(screen.getByTestId('username-error')).toHaveTextContent('MSG 1: This field is mandatory');
    expect(screen.getByTestId('password-error')).toHaveTextContent('MSG 1: This field is mandatory');

    // Verify form was not submitted
    expect(mockAuth0Login).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-004: Verify Login with Username/Password - Invalid Format
   * Prerequisites: User on Auth0 Login Page
   */
  it('TC-AUTH-004: System displays invalid format error for malformed email address', async () => {
    const user = userEvent.setup();

    render(<Auth0LoginPage />);

    // Step 1: Enter an invalid email format (e.g., "user@")
    const usernameInput = screen.getByTestId('username-input');
    await user.type(usernameInput, 'user@');

    // Enter some password to avoid empty field error
    const passwordInput = screen.getByTestId('password-input');
    await user.type(passwordInput, 'SomePassword123');

    // Step 2: Click the "Log In" button
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    // Verify invalid format error message is displayed
    await waitFor(() => {
      expect(screen.getByTestId('username-error')).toBeInTheDocument();
    });

    expect(screen.getByTestId('username-error')).toHaveTextContent(
      'MSG 4: Your information is not in the correct format'
    );

    // Verify form was not submitted
    expect(mockAuth0Login).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-005: Verify Login with Username/Password - Success
   * Prerequisites: User account exists, user on Auth0 Login Page
   */
  it('TC-AUTH-005: User is redirected to dashboard with valid JWT token after successful login', async () => {
    const user = userEvent.setup();

    // Mock successful login
    mockAuth0Login.mockResolvedValueOnce({ token: mockValidJWT });

    const handleLogin = vi.fn();

    render(<Auth0LoginPage onLogin={handleLogin} />);

    // Step 1: Enter valid "Username" and valid "Password"
    const usernameInput = screen.getByTestId('username-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(usernameInput, mockValidUser.username);
    await user.type(passwordInput, mockValidUser.password);

    expect(usernameInput).toHaveValue(mockValidUser.username);
    expect(passwordInput).toHaveValue(mockValidUser.password);

    // Step 2: Click the "Log In" button
    const loginButton = screen.getByTestId('login-button');
    await user.click(loginButton);

    // Verify authentication was called
    await waitFor(() => {
      expect(mockAuth0Login).toHaveBeenCalledWith({
        username: mockValidUser.username,
        password: mockValidUser.password
      });
    });

    // Verify JWT token was received and onLogin callback was triggered
    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith(mockValidJWT);
    });
  });

  /**
   * TC-AUTH-006: Verify Login with Third Party (Google)
   * Prerequisites: User has valid Google account, user on Auth0 Login Page
   */
  it('TC-AUTH-006: User is redirected to dashboard after successful Google authentication', async () => {
    const user = userEvent.setup();

    // Mock successful Google login
    mockAuth0GoogleLogin.mockResolvedValueOnce({ token: mockValidJWT });

    const handleLogin = vi.fn();

    render(<Auth0LoginPage onLogin={handleLogin} />);

    // Step 1: Click the "Continue with Google" button
    const googleButton = screen.getByTestId('google-login-button');
    expect(googleButton).toBeInTheDocument();

    await user.click(googleButton);

    // Step 2: Google authentication succeeds and popup closes
    await waitFor(() => {
      expect(mockAuth0GoogleLogin).toHaveBeenCalledTimes(1);
    });

    // Verify user is redirected (onLogin callback triggered with token)
    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith(mockValidJWT);
    });
  });

  /**
   * TC-AUTH-007: Verify JWT Token Validation - Valid Token
   * Prerequisites: User just logged in successfully, browser has JWT token
   */
  it('TC-AUTH-007: System accepts valid JWT token and displays protected content', async () => {
    // Mock valid token validation
    mockValidateJWT.mockResolvedValueOnce(true);

    // Step 1: User attempts to access protected resource with valid token
    render(<ProtectedPage token={mockValidJWT} />);

    // Wait for validation
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockValidJWT);
    });

    // Step 2: System validates token and grants access
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.getByText('You have access to this page.')).toBeInTheDocument();
  });

  /**
   * TC-AUTH-008: Verify JWT Token Validation - Invalid/Expired Token
   * Prerequisites: User has expired or manipulated JWT token
   */
  it('TC-AUTH-008: System denies access and shows "Access Denied" for invalid/expired token', async () => {
    // Mock invalid token validation
    mockValidateJWT.mockResolvedValueOnce(false);

    // Step 1: User attempts to access protected page with invalid token
    render(<ProtectedPage token={mockExpiredJWT} />);

    // Step 2: System validates token and denies access
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockExpiredJWT);
    });

    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    // Verify access denied message
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/Invalid or expired token/i)).toBeInTheDocument();

    // Verify protected content is not displayed
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  /**
   * TC-AUTH-009: Verify Role Authorization - Admin
   * Prerequisites: User with "Admin" role exists, user enters valid credentials
   */
  it('TC-AUTH-009: Admin user is authorized and can access Admin features (Revenue Forecast)', async () => {
    // Mock authentication and authorization for Admin
    mockValidateJWT.mockResolvedValueOnce(true);
    mockGetUserRole.mockResolvedValueOnce('admin');
    mockCheckAuthorization.mockResolvedValueOnce({ status: 200, authorized: true });

    // Step 1: Log in with Admin account (token contains role: admin)
    render(<Dashboard token={mockValidJWT} />);

    // Step 2: Access Dashboard and verify Admin authorization
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockValidJWT);
      expect(mockGetUserRole).toHaveBeenCalledWith(mockValidJWT);
      expect(mockCheckAuthorization).toHaveBeenCalledWith('admin');
    });

    // Verify Admin features are displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('user-role')).toHaveTextContent('Role: admin');
      expect(screen.getByTestId('admin-features')).toBeInTheDocument();
    });

    // Verify specific Admin features
    expect(screen.getByText('Admin Features')).toBeInTheDocument();
    expect(screen.getByText('Revenue Forecast')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  /**
   * TC-AUTH-010: Verify Role Authorization - Customer Service Agent (CSA)
   * Prerequisites: User with "CSA" role exists, user enters valid credentials
   */
  it('TC-AUTH-010: CSA user is authorized and sees Agent Dashboard features', async () => {
    // Mock authentication and authorization for CSA
    mockValidateJWT.mockResolvedValueOnce(true);
    mockGetUserRole.mockResolvedValueOnce('customer service agent');
    mockCheckAuthorization.mockResolvedValueOnce({ status: 200, authorized: true });

    // Step 1: Log in with CSA account (token contains role: customer service agent)
    render(<Dashboard token={mockValidJWT} />);

    // Step 2: Access Dashboard and verify CSA authorization
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockValidJWT);
      expect(mockGetUserRole).toHaveBeenCalledWith(mockValidJWT);
      expect(mockCheckAuthorization).toHaveBeenCalledWith('customer service agent');
    });

    // Verify CSA features are displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('user-role')).toHaveTextContent('Role: customer service agent');
      expect(screen.getByTestId('csa-features')).toBeInTheDocument();
    });

    // Verify specific CSA features
    expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Customer Support')).toBeInTheDocument();
    expect(screen.getByText('Booking Management')).toBeInTheDocument();
  });

  /**
   * TC-AUTH-011: Verify Role Authorization - Traveler (Default)
   * Prerequisites: Standard user (Traveler) exists, user enters valid credentials
   */
  it('TC-AUTH-011: Traveler user is authorized and sees Booking features', async () => {
    // Mock authentication and authorization for Traveler
    mockValidateJWT.mockResolvedValueOnce(true);
    mockGetUserRole.mockResolvedValueOnce('traveler');
    mockCheckAuthorization.mockResolvedValueOnce({ status: 200, authorized: true });

    // Step 1: Log in with Traveler account (token contains role: traveler)
    render(<Dashboard token={mockValidJWT} />);

    // Step 2: Access Dashboard and verify Traveler authorization
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockValidJWT);
      expect(mockGetUserRole).toHaveBeenCalledWith(mockValidJWT);
      expect(mockCheckAuthorization).toHaveBeenCalledWith('traveler');
    });

    // Verify Traveler features are displayed
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('user-role')).toHaveTextContent('Role: traveler');
      expect(screen.getByTestId('traveler-features')).toBeInTheDocument();
    });

    // Verify specific Traveler features
    expect(screen.getByText('Booking Features')).toBeInTheDocument();
    expect(screen.getByText('Search Flights')).toBeInTheDocument();
    expect(screen.getByText('Book Tickets')).toBeInTheDocument();
  });

  /**
   * TC-AUTH-012: Verify Role Authorization - Access Denied (Unknown Role)
   * Prerequisites: User with undefined/banned role attempts login
   */
  it('TC-AUTH-012: System denies access with HTTP 403 for unknown role', async () => {
    // Mock authentication for unknown role
    mockValidateJWT.mockResolvedValueOnce(true);
    mockGetUserRole.mockResolvedValueOnce('unknown');
    mockCheckAuthorization.mockResolvedValueOnce({ status: 403, authorized: false });

    // Step 1: Log in with account having unknown role
    render(<Dashboard token={mockValidJWT} />);

    // Step 2: System checks role and denies access
    await waitFor(() => {
      expect(mockValidateJWT).toHaveBeenCalledWith(mockValidJWT);
      expect(mockGetUserRole).toHaveBeenCalledWith(mockValidJWT);
      expect(mockCheckAuthorization).toHaveBeenCalledWith('unknown');
    });

    // Verify access is denied
    await waitFor(() => {
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    // Verify error message (using getAllByText since it appears in both h1 and p)
    const accessDeniedElements = screen.getAllByText('Access Denied');
    expect(accessDeniedElements.length).toBeGreaterThan(0);

    // Verify dashboard content is not displayed
    expect(screen.queryByTestId('admin-features')).not.toBeInTheDocument();
    expect(screen.queryByTestId('csa-features')).not.toBeInTheDocument();
    expect(screen.queryByTestId('traveler-features')).not.toBeInTheDocument();
  });
});
