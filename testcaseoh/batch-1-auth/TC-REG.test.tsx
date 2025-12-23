/**
 * Test Suite: Sign Up / Registration
 * Category: Sign Up
 * Sub-Category: Sign Up / Registration (Đăng ký tài khoản mới)
 * BATCH 1 EXPANSION (PART 2): SIGN UP, FORGOT PASS & USER MGMT
 * 
 * Coverage:
 * - TC-REG-001: Sign Up - Success
 * - TC-REG-002: Sign Up - Existing Email
 * - TC-REG-003: Sign Up - Password Mismatch
 * - TC-REG-004: Sign Up - Empty Fields
 * - TC-REG-005: Sign Up - Weak Password
 * - TC-REG-006: Sign Up - Terms & Conditions
 * - TC-REG-007: Sign Up - SQLi in Name
 * - TC-REG-008: Sign Up - Long Email
 * - TC-REG-009: Sign Up - Email Verify Link
 * - TC-REG-010: Sign Up - Resend Email
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';

// ==================== MOCK DATA ====================

const mockExistingUsers = [
  { email: 'existing@example.com', username: 'existinguser', verified: true },
  { email: 'unverified@example.com', username: 'unverifieduser', verified: false },
];

const VERIFICATION_TOKEN = 'verify_token_abc123';
const MAX_EMAIL_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 8;

const SQL_INJECTION_PATTERNS = [
  /'/gi,
  /--/gi,
  /;/gi,
  /union/gi,
  /select/gi,
  /insert/gi,
  /update/gi,
  /delete/gi,
  /drop/gi,
  /exec/gi,
];

// ==================== MOCK API FUNCTIONS ====================

const mockRegisterUser = vi.fn();
const mockCheckEmailExists = vi.fn();
const mockSendVerificationEmail = vi.fn();
const mockVerifyEmail = vi.fn();
const mockResendVerificationEmail = vi.fn();
const mockSanitizeInput = vi.fn();
const mockValidatePassword = vi.fn();

// ==================== MOCK COMPONENTS ====================

/**
 * Sign Up Form Component
 */
const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check empty fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    // Email format validation
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    // Email length validation
    if (formData.email.length > MAX_EMAIL_LENGTH) {
      newErrors.email = `Email must not exceed ${MAX_EMAIL_LENGTH} characters`;
    }

    // Password mismatch
    if (formData.password && formData.confirmPassword && 
        formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Weak password validation
    if (formData.password && formData.password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    }

    // Password strength validation (weak password detection)
    if (formData.password && formData.password.length >= MIN_PASSWORD_LENGTH) {
      const hasNumber = /\d/.test(formData.password);
      const hasLetter = /[a-zA-Z]/.test(formData.password);
      
      if (!hasNumber || !hasLetter) {
        newErrors.password = 'Password must contain both letters and numbers';
      }
    }

    // Terms & Conditions
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
    }

    // SQL Injection detection in name
    const hasSQLInjection = SQL_INJECTION_PATTERNS.some(pattern => 
      pattern.test(formData.name)
    );
    if (hasSQLInjection) {
      newErrors.name = 'Invalid characters detected in name. Special SQL characters are not allowed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedName = await mockSanitizeInput(formData.name);
      
      // Check if email already exists
      const emailExists = await mockCheckEmailExists(formData.email);
      if (emailExists) {
        setErrors({ email: 'Email already registered. Please use a different email or sign in.' });
        setIsSubmitting(false);
        return;
      }

      // Validate password strength
      const passwordValidation = await mockValidatePassword(formData.password);
      if (!passwordValidation.valid) {
        setErrors({ password: passwordValidation.message });
        setIsSubmitting(false);
        return;
      }

      // Register user
      const result = await mockRegisterUser({
        name: sanitizedName,
        email: formData.email,
        password: formData.password,
      });

      // Send verification email
      await mockSendVerificationEmail(formData.email, result.verificationToken);

      setSuccess(true);
      setRegisteredEmail(formData.email);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
      });
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <div data-testid="registration-success">
        <h2>Registration Successful!</h2>
        <p>
          A verification email has been sent to{' '}
          <strong data-testid="registered-email">{registeredEmail}</strong>
        </p>
        <p>Please check your inbox and click the verification link to activate your account.</p>
        <a href="/verify" data-testid="go-to-verify-page">
          Go to Verification Page
        </a>
      </div>
    );
  }

  return (
    <div data-testid="sign-up-form">
      <h2>Create Your Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            data-testid="name-input"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
            maxLength={100}
          />
          {errors.name && (
            <div data-testid="name-error" className="error">
              {errors.name}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            data-testid="email-input"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
            maxLength={150}
          />
          {errors.email && (
            <div data-testid="email-error" className="error">
              {errors.email}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            data-testid="password-input"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Create a password"
          />
          <small>Must be at least {MIN_PASSWORD_LENGTH} characters with letters and numbers</small>
          {errors.password && (
            <div data-testid="password-error" className="error">
              {errors.password}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            data-testid="confirm-password-input"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && (
            <div data-testid="confirm-password-error" className="error">
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              data-testid="terms-checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            />
            I agree to the{' '}
            <a href="/terms" target="_blank">
              Terms & Conditions
            </a>
          </label>
          {errors.agreeToTerms && (
            <div data-testid="terms-error" className="error">
              {errors.agreeToTerms}
            </div>
          )}
        </div>

        {errors.general && (
          <div data-testid="general-error" className="error">
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          data-testid="submit-button"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="sign-in-link">
        Already have an account?{' '}
        <a href="/sign-in" data-testid="sign-in-link">
          Sign In
        </a>
      </div>
    </div>
  );
};

/**
 * Email Verification Page Component
 */
interface EmailVerificationPageProps {
  token?: string;
}

const EmailVerificationPage: React.FC<EmailVerificationPageProps> = ({ token }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleVerify = async (verificationToken: string) => {
    setStatus('verifying');
    setMessage('');

    try {
      const result = await mockVerifyEmail(verificationToken);
      setStatus('success');
      setMessage('Your email has been verified successfully! You can now sign in.');
      setEmail(result.email);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setResending(true);
    setMessage('');

    try {
      await mockResendVerificationEmail(email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Auto-verify if token is provided
  React.useEffect(() => {
    if (token && status === 'idle') {
      handleVerify(token);
    }
  }, [token]);

  return (
    <div data-testid="email-verification-page">
      <h2>Email Verification</h2>

      {status === 'verifying' && (
        <div data-testid="verifying-status">
          <p>Verifying your email...</p>
        </div>
      )}

      {status === 'success' && (
        <div data-testid="success-status" className="success">
          <p>{message}</p>
          <a href="/sign-in" data-testid="sign-in-link">
            Go to Sign In
          </a>
        </div>
      )}

      {status === 'error' && (
        <div data-testid="error-status" className="error">
          <p>{message}</p>
        </div>
      )}

      {(status === 'idle' || status === 'error') && (
        <div data-testid="resend-section">
          <h3>Didn't receive the email?</h3>
          <div className="form-group">
            <label htmlFor="email">Enter your email address:</label>
            <input
              id="email"
              type="email"
              data-testid="email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <button
            data-testid="resend-button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend Verification Email'}
          </button>
          {message && status !== 'error' && (
            <div data-testid="resend-message" className="success">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-REG: Sign Up / Registration (Đăng ký tài khoản mới)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-REG-001: Verify Sign Up - Success
   * Prerequisites: Login Page
   * Steps:
   * 1. Click "Sign Up"
   * 2. Enter valid email, password, confirm password, name
   * 3. Check "Agree to Terms"
   * 4. Submit form
   * Expected: Account created, verification email sent, success message displayed
   */
  it('TC-REG-001: Sign up with valid credentials succeeds - verification email sent', async () => {
    const user = userEvent.setup();

    // Mock successful registration
    mockSanitizeInput.mockResolvedValue('John Doe');
    mockCheckEmailExists.mockResolvedValue(false);
    mockValidatePassword.mockResolvedValue({ valid: true });
    mockRegisterUser.mockResolvedValue({
      id: 'user_123',
      email: 'newuser@example.com',
      verificationToken: VERIFICATION_TOKEN,
    });
    mockSendVerificationEmail.mockResolvedValue({ success: true });

    // Step 1: Render sign up form
    render(<SignUpForm />);

    // Verify form is displayed
    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();

    // Step 2: Fill in valid data
    await user.type(screen.getByTestId('name-input'), 'John Doe');
    await user.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await user.type(screen.getByTestId('password-input'), 'SecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');

    // Step 3: Agree to terms
    await user.click(screen.getByTestId('terms-checkbox'));

    // Step 4: Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Verify sanitization was called
    await waitFor(() => {
      expect(mockSanitizeInput).toHaveBeenCalledWith('John Doe');
    });

    // Verify email existence check
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith('newuser@example.com');
    });

    // Verify registration
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'newuser@example.com',
        password: 'SecurePass123',
      });
    });

    // Verify verification email sent
    await waitFor(() => {
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        VERIFICATION_TOKEN
      );
    });

    // Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('registration-success')).toBeInTheDocument();
      expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
      expect(screen.getByTestId('registered-email')).toHaveTextContent('newuser@example.com');
      expect(screen.getByText(/verification email has been sent/i)).toBeInTheDocument();
    });
  });

  /**
   * TC-REG-002: Verify Sign Up - Existing Email
   * Prerequisites: Database has user A
   * Steps:
   * 1. Sign up with User A's email
   * Expected: Error message "Email already registered"
   */
  it('TC-REG-002: Sign up with existing email displays error - registration blocked', async () => {
    const user = userEvent.setup();

    // Mock email already exists
    mockSanitizeInput.mockResolvedValue('Jane Doe');
    mockCheckEmailExists.mockResolvedValue(true);
    mockValidatePassword.mockResolvedValue({ valid: true });

    render(<SignUpForm />);

    // Fill in form with existing email
    await user.type(screen.getByTestId('name-input'), 'Jane Doe');
    await user.type(screen.getByTestId('email-input'), 'existing@example.com');
    await user.type(screen.getByTestId('password-input'), 'SecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');
    await user.click(screen.getByTestId('terms-checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify email check was performed
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith('existing@example.com');
    });

    // Verify error message displayed
    await waitFor(() => {
      const emailError = screen.getByTestId('email-error');
      expect(emailError).toBeInTheDocument();
      expect(emailError).toHaveTextContent('Email already registered');
      expect(emailError).toHaveTextContent('Please use a different email or sign in');
    });

    // Verify registration was NOT called
    expect(mockRegisterUser).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-003: Verify Sign Up - Password Mismatch
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Enter password "123"
   * 2. Confirm password "456"
   * Expected: Error "Passwords do not match"
   */
  it('TC-REG-003: Sign up with mismatched passwords displays error - validation fails', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Fill in form with mismatched passwords
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'Password123');
    await user.type(screen.getByTestId('confirm-password-input'), 'DifferentPass456');
    await user.click(screen.getByTestId('terms-checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify error message
    const confirmError = screen.getByTestId('confirm-password-error');
    expect(confirmError).toBeInTheDocument();
    expect(confirmError).toHaveTextContent('Passwords do not match');

    // Verify no API calls were made
    expect(mockCheckEmailExists).not.toHaveBeenCalled();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-004: Verify Sign Up - Empty Fields
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Leave all fields blank
   * 2. Submit
   * Expected: Multiple validation errors displayed for all required fields
   */
  it('TC-REG-004: Sign up with empty fields displays validation errors - all required fields', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Submit without filling any fields
    await user.click(screen.getByTestId('submit-button'));

    // Verify all field errors are displayed
    expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    expect(screen.getByTestId('confirm-password-error')).toHaveTextContent('Please confirm your password');
    expect(screen.getByTestId('terms-error')).toHaveTextContent('You must agree to the Terms & Conditions');

    // Verify no API calls were made
    expect(mockCheckEmailExists).not.toHaveBeenCalled();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-005: Verify Sign Up - Weak Password
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Enter weak password "123"
   * 2. Submit
   * Expected: Error "Password must be at least 8 characters" and "must contain letters and numbers"
   */
  it('TC-REG-005: Sign up with weak password displays validation error - minimum requirements not met', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Fill form with weak password
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), '123');
    await user.type(screen.getByTestId('confirm-password-input'), '123');
    await user.click(screen.getByTestId('terms-checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify password error (too short)
    const passwordError = screen.getByTestId('password-error');
    expect(passwordError).toBeInTheDocument();
    expect(passwordError).toHaveTextContent('Password must be at least 8 characters long');

    // Test with 8-char numeric only password
    await user.clear(screen.getByTestId('password-input'));
    await user.clear(screen.getByTestId('confirm-password-input'));
    await user.type(screen.getByTestId('password-input'), '12345678');
    await user.type(screen.getByTestId('confirm-password-input'), '12345678');
    await user.click(screen.getByTestId('submit-button'));

    // Verify password strength error (no letters)
    await waitFor(() => {
      const strengthError = screen.getByTestId('password-error');
      expect(strengthError).toHaveTextContent('Password must contain both letters and numbers');
    });

    // Verify no registration occurred
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-006: Verify Sign Up - Terms & Conditions
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Fill all info correctly
   * 2. Uncheck "Agreed to Terms"
   * 3. Submit
   * Expected: Error "You must agree to the Terms & Conditions"
   */
  it('TC-REG-006: Sign up without agreeing to terms displays error - registration blocked', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Fill form without checking terms
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'SecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');
    // DON'T check terms checkbox

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify terms error
    const termsError = screen.getByTestId('terms-error');
    expect(termsError).toBeInTheDocument();
    expect(termsError).toHaveTextContent('You must agree to the Terms & Conditions');

    // Verify no registration occurred
    expect(mockCheckEmailExists).not.toHaveBeenCalled();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-007: Verify Sign Up - SQLi in Name
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Enter name: "Admin' --"
   * 2. Submit
   * Expected: Error "Invalid characters detected" - SQL injection blocked
   */
  it('TC-REG-007: Sign up with SQL injection in name displays error - malicious input blocked', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Fill form with SQL injection in name
    await user.type(screen.getByTestId('name-input'), "Admin' --");
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'SecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');
    await user.click(screen.getByTestId('terms-checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify SQL injection error
    const nameError = screen.getByTestId('name-error');
    expect(nameError).toBeInTheDocument();
    expect(nameError).toHaveTextContent('Invalid characters detected in name');
    expect(nameError).toHaveTextContent('Special SQL characters are not allowed');

    // Test other SQL patterns
    const sqlPatterns = [
      'admin; DROP TABLE users--',
      "user'; DELETE FROM accounts--",
      'name UNION SELECT * FROM users',
    ];

    for (const pattern of sqlPatterns) {
      await user.clear(screen.getByTestId('name-input'));
      await user.type(screen.getByTestId('name-input'), pattern);
      await user.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        const error = screen.getByTestId('name-error');
        expect(error).toHaveTextContent('Invalid characters detected');
      });
    }

    // Verify no registration occurred
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-008: Verify Sign Up - Long Email
   * Prerequisites: Sign Up Form
   * Steps:
   * 1. Enter email > 100 characters
   * 2. Submit
   * Expected: Error "Email must not exceed 100 characters"
   */
  it('TC-REG-008: Sign up with email exceeding max length displays error - validation fails', async () => {
    const user = userEvent.setup();

    render(<SignUpForm />);

    // Create email longer than 100 characters
    const longEmail = 'verylongemailaddressthatexceedsthemaximumlengthallowedbythevalidationrulesthisisaverylongemail@exampledomain.com';
    expect(longEmail.length).toBeGreaterThan(MAX_EMAIL_LENGTH);

    // Fill form with long email
    await user.type(screen.getByTestId('name-input'), 'Test User');
    await user.type(screen.getByTestId('email-input'), longEmail);
    await user.type(screen.getByTestId('password-input'), 'SecurePass123');
    await user.type(screen.getByTestId('confirm-password-input'), 'SecurePass123');
    await user.click(screen.getByTestId('terms-checkbox'));

    // Submit
    await user.click(screen.getByTestId('submit-button'));

    // Verify email length error
    const emailError = screen.getByTestId('email-error');
    expect(emailError).toBeInTheDocument();
    expect(emailError).toHaveTextContent(`Email must not exceed ${MAX_EMAIL_LENGTH} characters`);

    // Verify no registration occurred
    expect(mockCheckEmailExists).not.toHaveBeenCalled();
    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  /**
   * TC-REG-009: Verify Sign Up - Email Verify Link
   * Prerequisites: Sign up done
   * Steps:
   * 1. User receives email with verification link
   * 2. Click verification link
   * Expected: Email verified successfully, redirect to sign in
   */
  it('TC-REG-009: Click email verification link verifies account - success message displayed', async () => {
    // Mock successful verification
    mockVerifyEmail.mockResolvedValue({
      success: true,
      email: 'newuser@example.com',
      verified: true,
    });

    // Step 1: Render verification page with token (simulates clicking link)
    render(<EmailVerificationPage token={VERIFICATION_TOKEN} />);

    // Verify "verifying" status is shown initially
    expect(screen.getByTestId('verifying-status')).toBeInTheDocument();
    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();

    // Verify API call was made
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith(VERIFICATION_TOKEN);
    });

    // Step 2: Verify success message
    await waitFor(() => {
      expect(screen.getByTestId('success-status')).toBeInTheDocument();
      expect(screen.getByText(/email has been verified successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/you can now sign in/i)).toBeInTheDocument();
    });

    // Verify sign in link is available
    const signInLink = screen.getByTestId('sign-in-link');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/sign-in');
  });

  /**
   * TC-REG-010: Verify Sign Up - Resend Email
   * Prerequisites: Verification page
   * Steps:
   * 1. Enter email address
   * 2. Click "Resend Verification Email"
   * Expected: New verification email sent, confirmation message displayed
   */
  it('TC-REG-010: Resend verification email sends new link - confirmation message displayed', async () => {
    const user = userEvent.setup();

    // Mock successful resend
    mockResendVerificationEmail.mockResolvedValue({
      success: true,
      message: 'Verification email sent',
    });

    // Step 1: Render verification page without token
    render(<EmailVerificationPage />);

    // Verify resend section is displayed
    expect(screen.getByTestId('resend-section')).toBeInTheDocument();
    expect(screen.getByText("Didn't receive the email?")).toBeInTheDocument();

    // Step 2: Enter email and click resend
    const emailInput = screen.getByTestId('email-input');
    await user.type(emailInput, 'unverified@example.com');

    const resendButton = screen.getByTestId('resend-button');
    await user.click(resendButton);

    // Verify API call was made
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith('unverified@example.com');
    });

    // Verify success message
    await waitFor(() => {
      const message = screen.getByTestId('resend-message');
      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent('Verification email sent');
      expect(message).toHaveTextContent('Please check your inbox');
    });
  });
});
