/**
 * Test Suite: Third-Party Login (Google/Github)
 * Category: Auth OAuth
 * Sub-Category: Third-Party Login (Google/Github)
 * Mở rộng cho BR2: Các tình huống khi dùng Auth0
 * 
 * Coverage:
 * - TC-AUTH-TP-001: Google Login - Cancel
 * - TC-AUTH-TP-002: Github Login - Cancel
 * - TC-AUTH-TP-003: Google Login - No Internet
 * - TC-AUTH-TP-004: OAuth Account Creation (First time)
 * - TC-AUTH-TP-005: OAuth Existing Email
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';

// ==================== MOCK DATA ====================

const mockGoogleUser = {
  email: 'newuser@gmail.com',
  name: 'New User',
  picture: 'https://lh3.googleusercontent.com/a/default-user',
  sub: 'google-oauth2|123456789',
};

const mockGithubUser = {
  email: 'developer@github.com',
  name: 'GitHub Developer',
  avatar_url: 'https://avatars.githubusercontent.com/u/123456',
  sub: 'github|987654321',
};

const mockExistingUser = {
  email: 'existing@example.com',
  username: 'existinguser',
  role: 'Traveler',
  authProvider: 'email',
};

// ==================== MOCK API FUNCTIONS ====================

const mockInitiateGoogleOAuth = vi.fn();
const mockInitiateGithubOAuth = vi.fn();
const mockHandleOAuthCallback = vi.fn();
const mockCreateOAuthAccount = vi.fn();
const mockLinkOAuthAccount = vi.fn();
const mockCheckEmailExists = vi.fn();
const mockCheckNetworkConnection = vi.fn();

// ==================== MOCK COMPONENTS ====================

/**
 * Auth0 Login Page with OAuth Providers
 */
const Auth0LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check network connection first
      const isOnline = await mockCheckNetworkConnection();
      if (!isOnline) {
        setError('No internet connection. Please check your network and try again.');
        setIsLoading(false);
        return;
      }

      // Initiate Google OAuth
      await mockInitiateGoogleOAuth();
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Google');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Initiate Github OAuth
      await mockInitiateGithubOAuth();
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Github');
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="auth0-login-page">
      <h1>Sign In to Cloud Rush</h1>
      
      <div className="oauth-providers">
        <button
          data-testid="google-login-button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <button
          data-testid="github-login-button"
          onClick={handleGithubLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Continue with Github'}
        </button>
      </div>

      {error && (
        <div data-testid="error-message" className="error">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Google OAuth Popup Component
 */
interface GoogleOAuthPopupProps {
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

const GoogleOAuthPopup: React.FC<GoogleOAuthPopupProps> = ({ onSuccess, onCancel }) => {
  return (
    <div data-testid="google-oauth-popup" className="oauth-popup">
      <div className="popup-header">
        <h2>Sign in with Google</h2>
        <button
          data-testid="popup-close-button"
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="popup-content">
        <p>Choose an account to continue to Cloud Rush</p>
        
        <button
          data-testid="select-google-account"
          onClick={() => onSuccess(mockGoogleUser)}
        >
          {mockGoogleUser.email}
        </button>

        <button
          data-testid="cancel-google-login"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * Github OAuth Popup Component
 */
interface GithubOAuthPopupProps {
  onSuccess: (user: any) => void;
  onCancel: () => void;
}

const GithubOAuthPopup: React.FC<GithubOAuthPopupProps> = ({ onSuccess, onCancel }) => {
  return (
    <div data-testid="github-oauth-popup" className="oauth-popup">
      <div className="popup-header">
        <h2>Sign in to GitHub</h2>
        <button
          data-testid="popup-close-button"
          onClick={onCancel}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="popup-content">
        <p>Authorize Cloud Rush to access your GitHub account</p>
        
        <button
          data-testid="authorize-github"
          onClick={() => onSuccess(mockGithubUser)}
        >
          Authorize
        </button>

        <button
          data-testid="cancel-github-login"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/**
 * OAuth Callback Handler Component
 */
interface OAuthCallbackProps {
  provider: 'google' | 'github';
  user: any;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider, user }) => {
  const [status, setStatus] = useState<'processing' | 'creating' | 'linking' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('');
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Step 1: Process OAuth callback
      await mockHandleOAuthCallback(provider, user);

      // Step 2: Check if email exists in database
      const emailExists = await mockCheckEmailExists(user.email);

      if (emailExists) {
        // Step 3a: Link OAuth account to existing account
        setStatus('linking');
        setMessage('Linking your account...');
        
        await mockLinkOAuthAccount(user.email, provider, user.sub);
        
        setStatus('success');
        setMessage(`Successfully linked your ${provider} account!`);
      } else {
        // Step 3b: Create new account
        setStatus('creating');
        setMessage('Creating your account...');
        
        await mockCreateOAuthAccount({
          email: user.email,
          name: user.name,
          authProvider: provider,
          providerId: user.sub,
          role: 'Traveler', // Default role for new OAuth users
        });
        
        setAccountCreated(true);
        setStatus('success');
        setMessage('Account created successfully! Welcome to Cloud Rush!');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to process authentication');
    }
  };

  return (
    <div data-testid="oauth-callback">
      <h2>Authentication in Progress</h2>
      
      {status === 'processing' && (
        <div data-testid="processing-status">
          <p>Processing your {provider} authentication...</p>
        </div>
      )}

      {status === 'creating' && (
        <div data-testid="creating-status">
          <p>{message}</p>
        </div>
      )}

      {status === 'linking' && (
        <div data-testid="linking-status">
          <p>{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div data-testid="success-status">
          <p>{message}</p>
          {accountCreated && (
            <div data-testid="new-account-notice">
              <p>Your account has been created with role: Traveler</p>
              <p>Welcome email sent to: {user.email}</p>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div data-testid="error-status">
          <p className="error">{message}</p>
        </div>
      )}
    </div>
  );
};

// ==================== TEST SUITE ====================

describe('TC-AUTH-TP: Third-Party Login (Google/Github) - Mở rộng cho BR2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * TC-AUTH-TP-001: Verify Google Login - Cancel
   * Prerequisites: Click Google button
   * Steps:
   * 1. Click "Continue with Google" button
   * 2. Google OAuth popup appears
   * 3. User clicks "Cancel" or "Close" button
   * Expected: Popup closes, user returns to login page, no authentication occurs
   */
  it('TC-AUTH-TP-001: User cancels Google login popup - returns to login page without authentication', async () => {
    const user = userEvent.setup();
    
    // Mock network connection as online
    mockCheckNetworkConnection.mockResolvedValue(true);
    
    // Mock Google OAuth initiation to open popup
    mockInitiateGoogleOAuth.mockResolvedValue({ popup: true });

    // Step 1: Render login page
    render(<Auth0LoginPage />);

    // Verify Google login button is visible
    const googleButton = screen.getByTestId('google-login-button');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveTextContent('Continue with Google');

    // Step 2: Click Google login button
    await user.click(googleButton);

    // Verify OAuth initiation was called
    await waitFor(() => {
      expect(mockInitiateGoogleOAuth).toHaveBeenCalled();
    });

    // Step 3: Render Google popup
    const mockOnCancel = vi.fn();
    const { unmount } = render(
      <GoogleOAuthPopup 
        onSuccess={vi.fn()} 
        onCancel={mockOnCancel}
      />
    );

    // Verify popup is displayed
    expect(screen.getByTestId('google-oauth-popup')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();

    // Step 4: User clicks "Cancel" button
    const cancelButton = screen.getByTestId('cancel-google-login');
    await user.click(cancelButton);

    // Verify cancel callback was triggered
    expect(mockOnCancel).toHaveBeenCalled();

    // Step 5: Simulate popup close
    unmount();

    // Verify no OAuth callback was processed
    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
    expect(mockCreateOAuthAccount).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-TP-002: Verify Github Login - Cancel
   * Prerequisites: Click Github button
   * Steps:
   * 1. Click "Continue with Github" button
   * 2. Github OAuth popup appears
   * 3. User clicks "Cancel" button in popup
   * Expected: Popup closes, user returns to login page, no authentication occurs
   */
  it('TC-AUTH-TP-002: User cancels Github login popup - returns to login page without authentication', async () => {
    const user = userEvent.setup();

    // Mock network connection as online
    mockCheckNetworkConnection.mockResolvedValue(true);
    
    // Mock Github OAuth initiation
    mockInitiateGithubOAuth.mockResolvedValue({ popup: true });

    // Step 1: Render login page
    render(<Auth0LoginPage />);

    // Verify Github login button is visible
    const githubButton = screen.getByTestId('github-login-button');
    expect(githubButton).toBeInTheDocument();

    // Step 2: Click Github login button
    await user.click(githubButton);

    // Verify OAuth initiation was called
    await waitFor(() => {
      expect(mockInitiateGithubOAuth).toHaveBeenCalled();
    });

    // Step 3: Render Github popup
    const mockOnCancel = vi.fn();
    const { unmount } = render(
      <GithubOAuthPopup 
        onSuccess={vi.fn()} 
        onCancel={mockOnCancel}
      />
    );

    // Verify popup is displayed
    expect(screen.getByTestId('github-oauth-popup')).toBeInTheDocument();
    expect(screen.getByText('Sign in to GitHub')).toBeInTheDocument();

    // Step 4: User clicks close button (×)
    const closeButton = screen.getByTestId('popup-close-button');
    await user.click(closeButton);

    // Verify cancel callback was triggered
    expect(mockOnCancel).toHaveBeenCalled();

    // Step 5: Simulate popup close
    unmount();

    // Verify no OAuth callback was processed
    expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
    expect(mockCreateOAuthAccount).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-TP-003: Verify Google Login - No Internet
   * Prerequisites: Internet connection is off
   * Steps:
   * 1. Disable internet connection
   * 2. Click "Continue with Google" button
   * Expected: Error message displays "No internet connection" without opening popup
   */
  it('TC-AUTH-TP-003: Google login fails when no internet connection - displays network error', async () => {
    const user = userEvent.setup();

    // Mock network check to return false (offline)
    mockCheckNetworkConnection.mockResolvedValue(false);

    // Step 1: Render login page (user is offline)
    render(<Auth0LoginPage />);

    // Step 2: Click "Continue with Google"
    const googleButton = screen.getByTestId('google-login-button');
    await user.click(googleButton);

    // Verify network check was performed
    await waitFor(() => {
      expect(mockCheckNetworkConnection).toHaveBeenCalled();
    });

    // Verify error message is displayed
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('No internet connection');
      expect(errorMessage).toHaveTextContent('Please check your network and try again');
    });

    // Verify OAuth popup was NOT initiated
    expect(mockInitiateGoogleOAuth).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-TP-004: Verify OAuth Account Creation
   * Prerequisites: First-time user (email not in database)
   * Steps:
   * 1. User clicks "Continue with Google"
   * 2. User selects Google account in popup
   * 3. System checks if email exists in database (NOT FOUND)
   * 4. System creates new account with Google OAuth
   * Expected: New account created with role "Traveler", welcome message displayed
   */
  it('TC-AUTH-TP-004: First-time Google login creates new account - default role Traveler assigned', async () => {
    const user = userEvent.setup();

    // Mock network connection as online
    mockCheckNetworkConnection.mockResolvedValue(true);
    
    // Mock OAuth flow
    mockInitiateGoogleOAuth.mockResolvedValue({ popup: true });
    mockHandleOAuthCallback.mockResolvedValue({ success: true });
    
    // Mock email does NOT exist in database (first-time user)
    mockCheckEmailExists.mockResolvedValue(false);
    
    // Mock account creation
    mockCreateOAuthAccount.mockResolvedValue({
      id: 'user_123',
      email: mockGoogleUser.email,
      name: mockGoogleUser.name,
      role: 'Traveler',
      authProvider: 'google',
      created: true,
    });

    // Step 1 & 2: Simulate successful Google OAuth (combined)
    // (In real app, this would be separate steps with popup)
    
    // Step 3: Render OAuth callback with new user
    render(<OAuthCallback provider="google" user={mockGoogleUser} />);

    // Verify processing status is shown
    expect(screen.getByTestId('processing-status')).toBeInTheDocument();

    // Wait for OAuth callback to complete
    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalledWith('google', mockGoogleUser);
    });

    // Verify email existence check was performed
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith(mockGoogleUser.email);
    });

    // Step 4: Verify account creation
    await waitFor(() => {
      expect(mockCreateOAuthAccount).toHaveBeenCalledWith({
        email: mockGoogleUser.email,
        name: mockGoogleUser.name,
        authProvider: 'google',
        providerId: mockGoogleUser.sub,
        role: 'Traveler',
      });
    });

    // Verify success status is displayed
    await waitFor(() => {
      expect(screen.getByTestId('success-status')).toBeInTheDocument();
      expect(screen.getByText('Account created successfully! Welcome to Cloud Rush!')).toBeInTheDocument();
    });

    // Verify new account notice with default role
    const newAccountNotice = screen.getByTestId('new-account-notice');
    expect(newAccountNotice).toBeInTheDocument();
    expect(newAccountNotice).toHaveTextContent('Your account has been created with role: Traveler');
    expect(newAccountNotice).toHaveTextContent(`Welcome email sent to: ${mockGoogleUser.email}`);

    // Verify linking was NOT called (only creation)
    expect(mockLinkOAuthAccount).not.toHaveBeenCalled();
  });

  /**
   * TC-AUTH-TP-005: Verify OAuth Existing Email
   * Prerequisites: Email already exists in database
   * Steps:
   * 1. User clicks "Continue with Google"
   * 2. User selects Google account with email that matches existing DB record
   * 3. System checks if email exists in database (FOUND)
   * 4. System links OAuth account to existing account
   * Expected: OAuth account linked, user logged in with existing account, no new account created
   */
  it('TC-AUTH-TP-005: Google login with existing email links OAuth account - no duplicate account created', async () => {
    const user = userEvent.setup();

    // Mock network connection as online
    mockCheckNetworkConnection.mockResolvedValue(true);
    
    // Mock OAuth flow
    mockInitiateGoogleOAuth.mockResolvedValue({ popup: true });
    mockHandleOAuthCallback.mockResolvedValue({ success: true });
    
    // Mock email DOES exist in database (existing user)
    mockCheckEmailExists.mockResolvedValue(true);
    
    // Mock OAuth account linking
    mockLinkOAuthAccount.mockResolvedValue({
      success: true,
      email: mockExistingUser.email,
      linkedProvider: 'google',
    });

    // Create Google user with existing email
    const existingGoogleUser = {
      ...mockGoogleUser,
      email: mockExistingUser.email, // Use existing email
    };

    // Step 1 & 2: Simulate successful Google OAuth with existing email
    
    // Step 3: Render OAuth callback with existing user
    render(<OAuthCallback provider="google" user={existingGoogleUser} />);

    // Wait for OAuth callback to complete
    await waitFor(() => {
      expect(mockHandleOAuthCallback).toHaveBeenCalledWith('google', existingGoogleUser);
    });

    // Verify email existence check was performed
    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledWith(existingGoogleUser.email);
    });

    // Step 4: Verify OAuth account linking (NOT creation)
    await waitFor(() => {
      expect(mockLinkOAuthAccount).toHaveBeenCalledWith(
        existingGoogleUser.email,
        'google',
        existingGoogleUser.sub
      );
    });

    // Verify success status shows linking message
    await waitFor(() => {
      expect(screen.getByTestId('success-status')).toBeInTheDocument();
      expect(screen.getByText('Successfully linked your google account!')).toBeInTheDocument();
    });

    // Verify new account was NOT created
    expect(mockCreateOAuthAccount).not.toHaveBeenCalled();
    
    // Verify new account notice is NOT displayed
    expect(screen.queryByTestId('new-account-notice')).not.toBeInTheDocument();
  });
});
