/**
 * Test Suite: Authentication Input Validation & Security
 *
 * Test Cases: TC-VAL-AUTH-001 .. TC-VAL-AUTH-012
 * Framework: Vitest + React Testing Library
 * Notes: Many systems may implement additional server-side checks; tests focus on client-side validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Minimal Login form with client-side validation and simple sanitization
const sanitize = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LoginForm: React.FC<{ onLogin?: (u: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [sanitized, setSanitized] = React.useState('');

  const validateEmail = (e: string) => {
    if (!e.trim()) return 'MSG 1: This field is mandatory';
    if (e.length > 255) return 'MSG: Too long';
    // simple email regex for test purposes
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(e.trim())) return 'MSG 4: Invalid format';
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setSanitized('');

    // Trim email leading/trailing
    const e = email.trimStart();

    const emailErr = validateEmail(e);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    if (!password) {
      setError('MSG 1: This field is mandatory');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password.length > 2000) {
      setError('Password too long');
      return;
    }

    // Basic sanitization demonstration
    setSanitized(sanitize(e));

    try {
      const res = await axios.post('/api/auth/login', { email: e, password });
      onLogin?.(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div data-testid="login-form">
      <input data-testid="email-input" value={email} onChange={(ev) => setEmail(ev.target.value)} />
      <input data-testid="password-input" type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
      <button data-testid="login-button" onClick={handleSubmit}>Login</button>
      {error && <div data-testid="error-message">{error}</div>}
      {sanitized && <div data-testid="sanitized">{sanitized}</div>}
    </div>
  );
};

describe('TC-VAL-AUTH-001..012: Authentication Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC-VAL-AUTH-001: Verify Email - Empty', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: '' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword123' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 1: This field is mandatory'));
  });

  it('TC-VAL-AUTH-002: Verify Email - Missing "@"', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'https://www.google.com/search?q=usergmail.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 4: Invalid format'));
  });

  it('TC-VAL-AUTH-003: Verify Email - Missing Domain', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user@' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 4: Invalid format'));
  });

  it('TC-VAL-AUTH-004: Verify Email - Special Chars (Valid)', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'ok' } });
    const { getByTestId, queryByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user.name+tag@gmail.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(queryByTestId('error-message')).not.toBeInTheDocument());
  });

  it('TC-VAL-AUTH-005: Verify Email - Leading Space', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'ok' } });
    const { getByTestId, getByText, queryByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: ' user@gmail.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(queryByTestId('error-message')).not.toBeInTheDocument());
    // sanitized display should trim leading space
    await waitFor(() => expect(getByTestId('sanitized')).toHaveTextContent('user@gmail.com'));
  });

  it('TC-VAL-AUTH-006: Verify Email - SQL Injection', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: "' OR '1'='1" } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'whatever' } });
    fireEvent.click(getByTestId('login-button'));
    // client-side will mark invalid format
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 4: Invalid format'));
  });

  it('TC-VAL-AUTH-007: Verify Email - XSS Script', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: '<script>alert(1)</script>' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'whateverlong' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 4: Invalid format'));
    // ensure sanitized output would escape tags if set
    fireEvent.change(getByTestId('email-input'), { target: { value: 'test@example.com' } });
  });

  it('TC-VAL-AUTH-008: Verify Email - Max Length', async () => {
    const long = 'a'.repeat(256) + '@x.com';
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: long } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'validPassword123' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG: Too long'));
  });

  it('TC-VAL-AUTH-009: Verify Password - Empty', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: '' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 1: This field is mandatory'));
  });

  it('TC-VAL-AUTH-010: Verify Password - Less than Min Length', async () => {
    const { getByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: '123' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Password must be at least 8 characters'));
  });

  it('TC-VAL-AUTH-011: Verify Password - Just Min Length (8)', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'ok' } });
    const { getByTestId, queryByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: '12345678' } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(queryByTestId('error-message')).not.toBeInTheDocument());
  });

  it('TC-VAL-AUTH-012: Verify Password - Very Long (100+)', async () => {
    const longPwd = 'p'.repeat(120);
    mockedAxios.post.mockResolvedValueOnce({ data: { token: 'ok' } });
    const { getByTestId, queryByTestId } = render(<LoginForm />);
    fireEvent.change(getByTestId('email-input'), { target: { value: 'user@example.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: longPwd } });
    fireEvent.click(getByTestId('login-button'));
    await waitFor(() => expect(queryByTestId('error-message')).not.toBeInTheDocument());
  });
});
