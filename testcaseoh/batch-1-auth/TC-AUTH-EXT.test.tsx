/**
 * Test Suite: Advanced Authentication & Login Field Validation (BR3 Expansion)
 * Sub-Category: Login Field Validation (Chi tiết BR3)
 * 
 * Test Cases:
 * - TC-AUTH-EXT-001: Verify Email - Missing "@" symbol
 * - TC-AUTH-EXT-002: Verify Email - Missing Domain
 * - TC-AUTH-EXT-003: Verify Email - Missing TLD
 * - TC-AUTH-EXT-004: Verify Email - Double "@"
 * - TC-AUTH-EXT-005: Verify Email - Leading Dot
 * - TC-AUTH-EXT-006: Verify Email - Trailing Dot
 * - TC-AUTH-EXT-007: Verify Email - Space in Middle
 * - TC-AUTH-EXT-008: Verify Email - Special Chars
 * - TC-AUTH-EXT-009: Verify Password - 7 Characters (Boundary)
 * - TC-AUTH-EXT-010: Verify Password - 8 Characters (Boundary)
 * - TC-AUTH-EXT-011: Verify Password - Show/Hide Eye Icon
 * - TC-AUTH-EXT-012: Verify Login - Case Sensitivity Email
 * - TC-AUTH-EXT-013: Verify Login - Case Sensitivity Pass
 * - TC-AUTH-EXT-014: Verify Login - Unregistered Email
 * - TC-AUTH-EXT-015: Verify Login - Wrong Password
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

// ==================== MOCK API FUNCTIONS ====================

const mockLogin = vi.fn();
const mockValidateEmail = vi.fn();
const mockValidatePassword = vi.fn();

// ==================== MOCK DATA ====================

const mockRegisteredUser = {
  email: 'User@test.com',
  password: 'Pass1234' // 8 characters
};

// ==================== MOCK COMPONENTS ====================

/**
 * Enhanced Login Page Component with Comprehensive Validation
 */
const EnhancedLoginPage: React.FC<{
  onLogin?: (token: string) => void;
  onError?: (error: string) => void;
}> = ({ onLogin, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmailFormat = (email: string): string | null => {
    // Empty check
    if (!email.trim()) {
      return 'Email is required';
    }

    // Missing @ symbol
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }

    // Double @ symbol
    if (email.split('@').length > 2) {
      return 'Email cannot contain multiple @ symbols';
    }

    // Missing domain (ends with @)
    if (email.endsWith('@')) {
      return 'Email must have a domain after @';
    }

    // Leading dot
    if (email.startsWith('.')) {
      return 'Email cannot start with a dot';
    }

    // Trailing dot before @
    const localPart = email.split('@')[0];
    if (localPart.endsWith('.')) {
      return 'Local part cannot end with a dot';
    }

    // Space in email
    if (email.includes(' ')) {
      return 'Email cannot contain spaces';
    }

    // Special characters validation (only allow standard email chars)
    const invalidSpecialChars = /[#$!%^&*()]/;
    if (invalidSpecialChars.test(email)) {
      return 'Email contains invalid special characters';
    }

    // Missing TLD (.com, .vn, etc.)
    const domainPart = email.split('@')[1];
    if (domainPart && !domainPart.includes('.')) {
      return 'Email must have a valid domain extension';
    }

    // General email format validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }

    return null;
  };

  const validatePasswordFormat = (password: string): string | null => {
    // Empty check
    if (!password.trim()) {
      return 'Password is required';
    }

    // Length validation (minimum 8 characters)
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    return null;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});

    // Validate email
    const emailError = validateEmailFormat(email);
    const passwordError = validatePasswordFormat(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined
      });
      return;
    }

    try {
      // Attempt login
      const result = await mockLogin({ email, password });

      if (result.success) {
        onLogin?.(result.token);
      } else {
        // Handle specific error cases
        if (result.error === 'User not found') {
          setErrors({ email: 'Email not registered' });
          onError?.('Email not registered');
        } else if (result.error === 'Invalid credentials') {
          setErrors({ password: 'Incorrect password' });
          onError?.('Incorrect password');
        } else {
          onError?.(result.error || 'Login failed');
        }
      }
    } catch (error: any) {
      onError?.(error.message);
    }
  };

  return (
    <div data-testid="enhanced-login-page">
      <h1>Login</h1>

      <div data-testid="login-form">
        {/* Email Input */}
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            data-testid="email-input"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div data-testid="email-error" style={{ color: 'red' }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Input with Show/Hide */}
        <div>
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <input
              id="password"
              data-testid="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              data-testid="toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <div data-testid="password-error" style={{ color: 'red' }}>
              {errors.password}
            </div>
          )}
        </div>

        {/* Login Button */}
        <button
          data-testid="login-button"
          onClick={handleSubmit}
        >
          Login
        </button>
      </div>
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-AUTH-EXT: Advanced Authentication & Login Field Validation (BR3 Expansion)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-AUTH-EXT-001: Verify Email - Missing "@" symbol
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-001: Email without @ symbol displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyenvana" in Email (no @), enter valid password, click Login
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'nguyenvana');
    await user.type(passwordInput, 'ValidPass123');
    await user.click(loginButton);

    // Verify error message about missing @
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email must contain @ symbol');
    });

    // Verify login was not attempted
    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-002: Verify Email - Missing Domain
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-002: Email ending with @ (missing domain) displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyenvana@" in Email, enter valid password, click Login
    await user.type(screen.getByTestId('email-input'), 'nguyenvana@');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about missing domain
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email must have a domain after @');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-003: Verify Email - Missing TLD
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-003: Email without TLD (e.g., @gmail without .com) displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyenvana@gmail" (no .com), click Login
    await user.type(screen.getByTestId('email-input'), 'nguyenvana@gmail');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about missing TLD
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email must have a valid domain extension');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-004: Verify Email - Double "@"
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-004: Email with double @ symbols displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyen@@gmail.com", click Login
    await user.type(screen.getByTestId('email-input'), 'nguyen@@gmail.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about multiple @ symbols
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email cannot contain multiple @ symbols');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-005: Verify Email - Leading Dot
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-005: Email starting with dot displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter ".nguyen@gmail.com", click Login
    await user.type(screen.getByTestId('email-input'), '.nguyen@gmail.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about leading dot
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email cannot start with a dot');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-006: Verify Email - Trailing Dot
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-006: Email with trailing dot before @ displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyen.@gmail.com", click Login
    await user.type(screen.getByTestId('email-input'), 'nguyen.@gmail.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about trailing dot
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Local part cannot end with a dot');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-007: Verify Email - Space in Middle
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-007: Email with space displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "nguyen van@gmail.com" (space in middle), click Login
    await user.type(screen.getByTestId('email-input'), 'nguyen van@gmail.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about space
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email cannot contain spaces');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-008: Verify Email - Special Chars
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-008: Email with invalid special characters displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter "user#$!@gmail.com", click Login
    await user.type(screen.getByTestId('email-input'), 'user#$!@gmail.com');
    await user.type(screen.getByTestId('password-input'), 'ValidPass123');
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about invalid special characters
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email contains invalid special characters');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-009: Verify Password - 7 Characters (Boundary)
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-009: Password with 7 characters (below minimum) displays validation error', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Enter 7-character password, click Login
    await user.type(screen.getByTestId('email-input'), 'valid@email.com');
    await user.type(screen.getByTestId('password-input'), 'Pass123'); // 7 chars
    await user.click(screen.getByTestId('login-button'));

    // Verify error message about minimum length
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 8 characters');
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-EXT-010: Verify Password - 8 Characters (Boundary)
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-010: Password with exactly 8 characters passes validation', async () => {
    const user = userEvent.setup();

    // Mock successful login
    mockLogin.mockResolvedValueOnce({ success: true, token: 'valid-token' });

    const handleLogin = vi.fn();
    render(<EnhancedLoginPage onLogin={handleLogin} />);

    // Step 1: Enter 8-character password, click Login
    await user.type(screen.getByTestId('email-input'), 'valid@email.com');
    await user.type(screen.getByTestId('password-input'), 'Pass1234'); // 8 chars
    await user.click(screen.getByTestId('login-button'));

    // Verify no password error
    expect(screen.queryByTestId('password-error')).not.toBeInTheDocument();

    // Verify login was attempted
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'valid@email.com',
        password: 'Pass1234'
      });
    });
  });

  /**
   * TC-AUTH-EXT-011: Verify Password - Show/Hide Eye Icon
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-011: Eye icon toggles password visibility between masked and visible', async () => {
    const user = userEvent.setup();

    render(<EnhancedLoginPage />);

    // Step 1: Type password
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;
    await user.type(passwordInput, 'SecretPass123');

    // Verify password is masked by default
    expect(passwordInput.type).toBe('password');
    expect(passwordInput).toHaveValue('SecretPass123');

    // Click eye icon to show password
    const toggleButton = screen.getByTestId('toggle-password-visibility');
    await user.click(toggleButton);

    // Verify password is now visible
    expect(passwordInput.type).toBe('text');
    expect(passwordInput).toHaveValue('SecretPass123');

    // Click eye icon again to hide password
    await user.click(toggleButton);

    // Verify password is masked again
    expect(passwordInput.type).toBe('password');
  });

  /**
   * TC-AUTH-EXT-012: Verify Login - Case Sensitivity Email
   * Prerequisites: Account exists with "User@test.com"
   */
  it('TC-AUTH-EXT-012: Login with lowercase email when account has uppercase fails (case sensitive)', async () => {
    const user = userEvent.setup();

    // Mock login to check case sensitivity
    mockLogin.mockImplementationOnce(({ email, password }) => {
      // Simulate case-sensitive email check
      if (email === mockRegisteredUser.email && password === mockRegisteredUser.password) {
        return Promise.resolve({ success: true, token: 'valid-token' });
      } else if (email.toLowerCase() === mockRegisteredUser.email.toLowerCase()) {
        // Email matches case-insensitively but not exactly
        return Promise.resolve({ success: false, error: 'Invalid credentials' });
      }
      return Promise.resolve({ success: false, error: 'User not found' });
    });

    render(<EnhancedLoginPage />);

    // Step 1: Login with "user@test.com" (lowercase) when account is "User@test.com"
    await user.type(screen.getByTestId('email-input'), 'user@test.com');
    await user.type(screen.getByTestId('password-input'), mockRegisteredUser.password);
    await user.click(screen.getByTestId('login-button'));

    // Verify login was attempted with lowercase email
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'Pass1234'
      });
    });

    // Verify error message for invalid credentials
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Incorrect password');
    });
  });

  /**
   * TC-AUTH-EXT-013: Verify Login - Case Sensitivity Pass
   * Prerequisites: Account password is "Pass123"
   */
  it('TC-AUTH-EXT-013: Login with lowercase password when account has mixed case fails (case sensitive)', async () => {
    const user = userEvent.setup();

    // Mock login to check password case sensitivity
    mockLogin.mockImplementationOnce(({ email, password }) => {
      if (email === mockRegisteredUser.email && password === mockRegisteredUser.password) {
        return Promise.resolve({ success: true, token: 'valid-token' });
      }
      return Promise.resolve({ success: false, error: 'Invalid credentials' });
    });

    render(<EnhancedLoginPage />);

    // Step 1: Login with "pass1234" (lowercase) when password is "Pass1234"
    await user.type(screen.getByTestId('email-input'), mockRegisteredUser.email);
    await user.type(screen.getByTestId('password-input'), 'pass1234');
    await user.click(screen.getByTestId('login-button'));

    // Verify login was attempted
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'User@test.com',
        password: 'pass1234'
      });
    });

    // Verify error for incorrect password
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toHaveTextContent('Incorrect password');
    });
  });

  /**
   * TC-AUTH-EXT-014: Verify Login - Unregistered Email
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-014: Login with unregistered email displays "Email not registered" error', async () => {
    const user = userEvent.setup();

    // Mock login failure for unregistered email
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'User not found'
    });

    render(<EnhancedLoginPage />);

    // Step 1: Enter random unregistered email, click Login
    await user.type(screen.getByTestId('email-input'), 'random.user@example.com');
    await user.type(screen.getByTestId('password-input'), 'SomePassword123');
    await user.click(screen.getByTestId('login-button'));

    // Verify login was attempted
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'random.user@example.com',
        password: 'SomePassword123'
      });
    });

    // Verify error message for unregistered email
    await waitFor(() => {
      expect(screen.getByTestId('email-error')).toBeInTheDocument();
      expect(screen.getByTestId('email-error')).toHaveTextContent('Email not registered');
    });
  });

  /**
   * TC-AUTH-EXT-015: Verify Login - Wrong Password
   * Prerequisites: Login Page open
   */
  it('TC-AUTH-EXT-015: Login with valid email but wrong password displays "Incorrect password" error', async () => {
    const user = userEvent.setup();

    // Mock login failure for wrong password
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials'
    });

    render(<EnhancedLoginPage />);

    // Step 1: Enter valid email, wrong password
    await user.type(screen.getByTestId('email-input'), 'user@example.com');
    await user.type(screen.getByTestId('password-input'), 'WrongPassword123');
    await user.click(screen.getByTestId('login-button'));

    // Verify login was attempted
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'WrongPassword123'
      });
    });

    // Verify error message for incorrect password
    await waitFor(() => {
      expect(screen.getByTestId('password-error')).toBeInTheDocument();
      expect(screen.getByTestId('password-error')).toHaveTextContent('Incorrect password');
    });
  });
});
