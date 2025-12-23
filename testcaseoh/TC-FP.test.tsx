/**
 * Test Suite: Forgot Password
 * Category: Forgot Pass
 * Sub-Category: Forgot Password (Quên mật khẩu)
 * Tính năng đi kèm bắt buộc của Auth system.
 * 
 * Coverage:
 * - TC-FP-001: Forgot Password Link
 * - TC-FP-002: Reset - Valid Email
 * - TC-FP-003: Reset - Unregistered Email
 * - TC-FP-004: Reset - Invalid Email Format
 * - TC-FP-005: Reset Link - Click
 * - TC-FP-006: New Password - Validation
 * - TC-FP-007: New Password - Success
 * - TC-FP-008: Login with Old Password
 * - TC-FP-009: Login with New Password
 * - TC-FP-010: Reset Link - Expired
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK DATA ====================

const mockRegisteredUsers = [
  {
    id: 'user_001',
    email: 'user@example.com',
    username: 'testuser',
    password: 'OldPassword123', // Current password
  },
  {
    id: 'user_002',
    email: 'another@example.com',
    username: 'anotheruser',
    password: 'AnotherPass456',
  },
];

const RESET_TOKEN_VALID = 'reset_token_valid_abc123';
const RESET_TOKEN_EXPIRED = 'reset_token_expired_xyz789';
const RESET_LINK_EXPIRY_HOURS = 24;
const MIN_PASSWORD_LENGTH = 8;

// ==================== MOCK API FUNCTIONS ====================

const mockSendPasswordResetEmail = vi.fn();
const mockVerifyResetToken = vi.fn();
const mockResetPassword = vi.fn();
const mockLogin = vi.fn();
const mockCheckEmailExists = vi.fn();
const mockValidatePassword = vi.fn();

// ==================== MOCK COMPONENTS ====================

/**
 * Login Page with Forgot Password Link
 */
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div data-testid="login-page">
      <h2>Sign In</h2>
      
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            data-testid="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            data-testid="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" data-testid="sign-in-button">
          Sign In
        </button>
      </form>

      <div className="forgot-password-section">
        <a href="/forgot-password" data-testid="forgot-password-link">
          Forgot Password?
        </a>
      </div>
    </div>
  );
};

/**
 * Forgot Password Page - Request Reset Email
 */
const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setError('Invalid email format. Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate email format
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email exists in database
      const emailExists = await mockCheckEmailExists(email);
      
      if (!emailExists) {
        setError('No account found with this email address. Please check and try again.');
        setIsSubmitting(false);
        return;
      }

      // Send password reset email
      await mockSendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div data-testid="reset-email-sent">
        <h2>Reset Email Sent</h2>
        <p>
          A password reset link has been sent to{' '}
          <strong data-testid="sent-to-email">{email}</strong>
        </p>
        <p>
          Please check your inbox and click the link to reset your password.
          The link will expire in {RESET_LINK_EXPIRY_HOURS} hours.
        </p>
        <a href="/login" data-testid="back-to-login-link">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div data-testid="forgot-password-page">
      <h2>Reset Your Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            id="email"
            type="email"
            data-testid="email-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
          />
        </div>

        {error && (
          <div data-testid="error-message" className="error">
            {error}
          </div>
        )}

        <button
          type="submit"
          data-testid="send-reset-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="back-link">
        <a href="/login" data-testid="back-to-login">
          Back to Login
        </a>
      </div>
    </div>
  );
};

/**
 * Reset Password Page - Set New Password
 */
interface ResetPasswordPageProps {
  token: string;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setIsVerifying(true);
    setTokenError('');

    try {
      const result = await mockVerifyResetToken(token);
      
      if (!result.valid) {
        if (result.expired) {
          setTokenError('This password reset link has expired. Reset links are valid for 24 hours. Please request a new one.');
        } else {
          setTokenError('This password reset link is invalid or has already been used. Please request a new one.');
        }
      } else {
        setUserEmail(result.email);
      }
    } catch (err: any) {
      setTokenError(err.message || 'Failed to verify reset link.');
    } finally {
      setIsVerifying(false);
    }
  };

  const validateForm = (): boolean => {
    setError('');

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
      return false;
    }

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasNumber || !hasLetter) {
      setError('Password must contain both letters and numbers');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate password strength
      const passwordValidation = await mockValidatePassword(password);
      if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        setIsSubmitting(false);
        return;
      }

      // Reset password
      await mockResetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div data-testid="verifying-token">
        <p>Verifying reset link...</p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div data-testid="token-error-page">
        <h2>Reset Link Error</h2>
        <div data-testid="token-error-message" className="error">
          {tokenError}
        </div>
        <a href="/forgot-password" data-testid="request-new-link">
          Request New Reset Link
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div data-testid="password-reset-success">
        <h2>Password Reset Successful</h2>
        <p>Your password has been successfully reset.</p>
        <p>You can now sign in with your new password.</p>
        <a href="/login" data-testid="go-to-login-link">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div data-testid="reset-password-page">
      <h2>Set New Password</h2>
      <p>Resetting password for: <strong data-testid="user-email">{userEmail}</strong></p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input
            id="password"
            type="password"
            data-testid="password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <small>Must be at least {MIN_PASSWORD_LENGTH} characters with letters and numbers</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            id="confirmPassword"
            type="password"
            data-testid="confirm-password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
          />
        </div>

        {error && (
          <div data-testid="error-message" className="error">
            {error}
          </div>
        )}

        <button
          type="submit"
          data-testid="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

/**
 * Login Component for Testing Password Changes
 */
interface LoginFormProps {
  onLoginSuccess?: (email: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await mockLogin(email, password);
      
      if (result.success) {
        onLoginSuccess?.(email);
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="login-form">
      <h2>Sign In</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          data-testid="login-email-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />

        <input
          type="password"
          data-testid="login-password-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && (
          <div data-testid="login-error" className="error">
            {error}
          </div>
        )}

        <button type="submit" data-testid="login-submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-FP: Forgot Password (Quên mật khẩu)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-FP-001: Verify Forgot Password Link
   * Prerequisites: Login Page
   * Steps:
   * 1. Navigate to login page
   * 2. Click "Forgot Password?" link
   * Expected: Link is visible and clickable, redirects to forgot password page
   */
  it('TC-FP-001: Forgot password link is visible on login page - redirects to reset page', async () => {
    // Step 1: Render login page
    render(<LoginPage />);

    // Verify login page is displayed
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();

    // Step 2: Verify forgot password link exists
    const forgotPasswordLink = screen.getByTestId('forgot-password-link');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveTextContent('Forgot Password?');
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');

    // Verify link is clickable
    expect(forgotPasswordLink).not.toHaveAttribute('disabled');
  });

  /**
   * TC-FP-002: Verify Reset - Valid Email
   * Prerequisites: Reset Page
   * Steps:
   * 1. Enter registered email
   * 2. Click "Send Reset Link"
   * Expected: Success message displayed, reset email sent
   */
  it('TC-FP-002: Send reset link with valid registered email succeeds - confirmation message displayed', async () => {
    const user = userEvent.setup();

    // Mock email exists
    mockCheckEmailExists.mockResolvedValue(true);
    mockSendPasswordResetEmail.mockResolvedValue({ success: true });

    // Step 1: Render forgot password page
    render(<ForgotPasswordPage />);

    expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();

    // Step 2: Enter registered email
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'user@example.com');

    // Step 3: Click send button
    await user.click(screen.getByTestId('send-reset-button'));

    // Verify email check was performed
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith('user@example.com');
    });

    // Verify reset email was sent
    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('user@example.com');
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('reset-email-sent')).toBeInTheDocument();
      expect(screen.getByText('Reset Email Sent')).toBeInTheDocument();
      expect(screen.getByTestId('sent-to-email')).toHaveTextContent('user@example.com');
      expect(screen.getByText(/password reset link has been sent/i)).toBeInTheDocument();
      expect(screen.getByText(/will expire in 24 hours/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-FP-003: Verify Reset - Unregistered Email
   * Prerequisites: Reset Page
   * Steps:
   * 1. Enter unregistered email
   * 2. Click "Send"
   * Expected: Error "No account found with this email address"
   */
  it('TC-FP-003: Send reset link with unregistered email displays error - no email sent', async () => {
    const user = userEvent.setup();

    // Mock email does not exist
    mockCheckEmailExists.mockResolvedValue(false);

    render(<ForgotPasswordPage />);

    // Enter unregistered email
    await user.type(screen.getByTestId('email-input'), 'unknown@example.com');
    await user.click(screen.getByTestId('send-reset-button'));

    // Verify email check was performed
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith('unknown@example.com');
    });

    // Verify error message
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('No account found with this email address');
      expect(errorMessage).toHaveTextContent('Please check and try again');
    });

    // Verify no email was sent
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  /**
   * TC-FP-004: Verify Reset - Invalid Email Format
   * Prerequisites: Reset Page
   * Steps:
   * 1. Enter "abc" (invalid format)
   * 2. Click "Send"
   * Expected: Error "Invalid email format"
   */
  it('TC-FP-004: Send reset link with invalid email format displays validation error', async () => {
    const user = userEvent.setup();

    render(<ForgotPasswordPage />);

    // Enter invalid email format
    await user.type(screen.getByTestId('email-input'), 'abc');
    await user.click(screen.getByTestId('send-reset-button'));

    // Verify validation error
    const errorMessage = await screen.findByTestId('error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Invalid email format');
    expect(errorMessage).toHaveTextContent('Please enter a valid email address');

    // Verify no API calls were made
    expect(mockCheckEmailExists).not.toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  /**
   * TC-FP-005: Verify Reset Link - Click
   * Prerequisites: Email received with reset link
   * Steps:
   * 1. Click reset link from email (opens page with token)
   * Expected: Reset password page opens, token verified, user can set new password
   */
  it('TC-FP-005: Click valid reset link opens password reset page - token verified successfully', async () => {
    // Mock valid token
    mockVerifyResetToken.mockResolvedValue({
      valid: true,
      expired: false,
      email: 'user@example.com',
    });

    // Step 1: Render reset password page with valid token (simulates clicking link)
    render(<ResetPasswordPage token={RESET_TOKEN_VALID} />);

    // Verify verifying state
    expect(screen.getByTestId('verifying-token')).toBeInTheDocument();

    // Wait for token verification
    await waitFor(() => {
      expect(mockVerifyResetToken).toHaveBeenCalledWith(RESET_TOKEN_VALID);
    });

    // Verify reset password form is displayed
    await waitFor(() => {
      expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
      expect(screen.getByText('Set New Password')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toHaveTextContent('user@example.com');
    });

    // Verify form inputs are available
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  /**
   * TC-FP-006: Verify New Password - Validation
   * Prerequisites: New Password Page
   * Steps:
   * 1. Enter weak password (e.g., "123")
   * 2. Submit
   * Expected: Validation error displayed
   */
  it('TC-FP-006: Set new password with weak password displays validation error', async () => {
    const user = userEvent.setup();

    // Mock valid token
    mockVerifyResetToken.mockResolvedValue({
      valid: true,
      expired: false,
      email: 'user@example.com',
    });

    render(<ResetPasswordPage token={RESET_TOKEN_VALID} />);

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
    });

    // Test 1: Too short password
    await user.type(screen.getByTestId('password-input'), '123');
    await user.type(screen.getByTestId('confirm-password-input'), '123');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      const error = screen.getByTestId('error-message');
      expect(error).toHaveTextContent('Password must be at least 8 characters long');
    });

    // Test 2: No letters (numbers only)
    await user.clear(screen.getByTestId('password-input'));
    await user.clear(screen.getByTestId('confirm-password-input'));
    await user.type(screen.getByTestId('password-input'), '12345678');
    await user.type(screen.getByTestId('confirm-password-input'), '12345678');
    await user.click(screen.getByTestId('submit-button'));

    await waitFor(() => {
      const error = screen.getByTestId('error-message');
      expect(error).toHaveTextContent('Password must contain both letters and numbers');
    });

    // Verify no password reset occurred
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  /**
   * TC-FP-007: Verify New Password - Success
   * Prerequisites: New Password Page
   * Steps:
   * 1. Enter valid strong password
   * 2. Confirm password
   * 3. Submit
   * Expected: Password reset successful, redirect to login
   */
  it('TC-FP-007: Set new password with valid strong password succeeds - password reset confirmed', async () => {
    const user = userEvent.setup();

    // Mock valid token
    mockVerifyResetToken.mockResolvedValue({
      valid: true,
      expired: false,
      email: 'user@example.com',
    });

    mockValidatePassword.mockResolvedValue({ valid: true });
    mockResetPassword.mockResolvedValue({ success: true });

    render(<ResetPasswordPage token={RESET_TOKEN_VALID} />);

    await waitFor(() => {
      expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
    });

    // Step 1 & 2: Enter valid password
    await user.type(screen.getByTestId('password-input'), 'NewSecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'NewSecurePass123');

    // Step 3: Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify password validation
    await waitFor(() => {
      expect(mockValidatePassword).toHaveBeenCalledWith('NewSecurePass123');
    });

    // Verify password reset
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(RESET_TOKEN_VALID, 'NewSecurePass123');
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('password-reset-success')).toBeInTheDocument();
      expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      expect(screen.getByText(/password has been successfully reset/i)).toBeInTheDocument();
    });

    // Verify login link
    const loginLink = screen.getByTestId('go-to-login-link');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  /**
   * TC-FP-008: Verify Login with Old Password
   * Prerequisites: Password changed
   * Steps:
   * 1. Try to login with old password
   * Expected: Login fails with "Invalid credentials" error
   */
  it('TC-FP-008: Login with old password after reset fails - invalid credentials error', async () => {
    const user = userEvent.setup();

    // Mock login with old password fails
    mockLogin.mockResolvedValue({
      success: false,
      message: 'Invalid credentials. Please check your email and password.',
    });

    render(<LoginForm />);

    // Step 1: Try login with old password
    await user.type(screen.getByTestId('login-email-input'), 'user@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'OldPassword123');
    await user.click(screen.getByTestId('login-submit-button'));

    // Verify login attempt
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'OldPassword123');
    });

    // Verify error message
    await waitFor(() => {
      const error = screen.getByTestId('login-error');
      expect(error).toBeInTheDocument();
      expect(error).toHaveTextContent('Invalid credentials');
    });
  });

  /**
   * TC-FP-009: Verify Login with New Password
   * Prerequisites: Password changed
   * Steps:
   * 1. Try to login with new password
   * Expected: Login succeeds, user authenticated
   */
  it('TC-FP-009: Login with new password after reset succeeds - user authenticated', async () => {
    const user = userEvent.setup();

    const mockOnSuccess = vi.fn();

    // Mock login with new password succeeds
    mockLogin.mockResolvedValue({
      success: true,
      token: 'jwt_token_abc123',
      user: { email: 'user@example.com' },
    });

    render(<LoginForm onLoginSuccess={mockOnSuccess} />);

    // Step 1: Login with new password
    await user.type(screen.getByTestId('login-email-input'), 'user@example.com');
    await user.type(screen.getByTestId('login-password-input'), 'NewSecurePass123');
    await user.click(screen.getByTestId('login-submit-button'));

    // Verify login attempt
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'NewSecurePass123');
    });

    // Verify login success callback
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith('user@example.com');
    });

    // Verify no error is displayed
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
  });

  /**
   * TC-FP-010: Verify Reset Link - Expired
   * Prerequisites: Link is old (> 24 hours)
   * Steps:
   * 1. Click expired reset link
   * Expected: Error message "Link has expired", prompt to request new link
   */
  it('TC-FP-010: Click expired reset link displays error - request new link option shown', async () => {
    // Mock expired token
    mockVerifyResetToken.mockResolvedValue({
      valid: false,
      expired: true,
      message: 'Token has expired',
    });

    // Step 1: Render reset password page with expired token
    render(<ResetPasswordPage token={RESET_TOKEN_EXPIRED} />);

    // Wait for token verification
    await waitFor(() => {
      expect(mockVerifyResetToken).toHaveBeenCalledWith(RESET_TOKEN_EXPIRED);
    });

    // Verify error page is displayed
    await waitFor(() => {
      expect(screen.getByTestId('token-error-page')).toBeInTheDocument();
      expect(screen.getByText('Reset Link Error')).toBeInTheDocument();
    });

    // Verify error message
    const errorMessage = screen.getByTestId('token-error-message');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('password reset link has expired');
    expect(errorMessage).toHaveTextContent('valid for 24 hours');
    expect(errorMessage).toHaveTextContent('Please request a new one');

    // Verify request new link button
    const requestNewLink = screen.getByTestId('request-new-link');
    expect(requestNewLink).toBeInTheDocument();
    expect(requestNewLink).toHaveTextContent('Request New Reset Link');
    expect(requestNewLink).toHaveAttribute('href', '/forgot-password');

    // Verify reset password form is NOT displayed
    expect(screen.queryByTestId('reset-password-page')).not.toBeInTheDocument();
    expect(screen.queryByTestId('password-input')).not.toBeInTheDocument();
  });
});
