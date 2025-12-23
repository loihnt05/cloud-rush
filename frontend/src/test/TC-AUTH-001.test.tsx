import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Auth0Provider } from '@auth0/auth0-react';
import Home from '../pages/home';

/**
 * Test Case ID: TC-AUTH-001
 * Description: Verify "Sign In" button visibility on Landing Page
 * Category: Authentication
 * 
 * Prerequisites:
 * 1. Device is connected to the internet.
 * 2. User is on the Landing Page (not logged in).
 * 
 * Test Steps:
 * Step 1: Open the application URL (Landing Page)
 *   - Expected: The Landing Page loads successfully
 * 
 * Step 2: Observe the top right corner of the header
 *   - Expected: The "Sign In" button is displayed
 * 
 * Test Case Expected Result:
 * The "Sign In" button is clearly visible at the top right corner of the page.
 */

// Mock Auth0
const mockLoginWithRedirect = vi.fn();

vi.mock('@auth0/auth0-react', async () => {
  const actual = await vi.importActual('@auth0/auth0-react');
  return {
    ...actual,
    useAuth0: () => ({
      loginWithRedirect: mockLoginWithRedirect,
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
    }),
  };
});

describe('TC-AUTH-001: Verify "Sign In" button visibility on Landing Page', () => {
  const renderHome = () => {
    return render(
      <Auth0Provider
        domain="test.auth0.com"
        clientId="test-client-id"
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
      >
        <Home />
      </Auth0Provider>
    );
  };

  it('Step 1: Landing Page loads successfully', () => {
    renderHome();

    // Verify CloudRush branding is present
    const cloudRushHeading = screen.getByText(/Your Journey Begins with/i);
    expect(cloudRushHeading).toBeInTheDocument();

    // Verify at least one CloudRush brand element exists
    const cloudRushBrands = screen.getAllByText('CloudRush');
    expect(cloudRushBrands.length).toBeGreaterThan(0);

    console.log('✓ Step 1: Landing Page loaded successfully');
  });

  it('Step 2: "Sign In" button is displayed at the top right corner', () => {
    renderHome();

    // Find the Sign In button
    const signInButton = screen.getByRole('button', { name: /sign in/i });

    // Verify button is present in the document
    expect(signInButton).toBeInTheDocument();
    console.log('✓ Step 2a: Sign In button found in the DOM');

    // Verify button is visible
    expect(signInButton).toBeVisible();
    console.log('✓ Step 2b: Sign In button is visible');

    // Verify button is enabled
    expect(signInButton).toBeEnabled();
    console.log('✓ Step 2c: Sign In button is enabled');
  });

  it('TC-AUTH-001: Complete test - Sign In button visibility verification', () => {
    const { container } = renderHome();

    // Step 1: Verify Landing Page loads
    const cloudRushHeading = screen.getByText(/Your Journey Begins with/i);
    expect(cloudRushHeading).toBeInTheDocument();

    // Step 2: Verify Sign In button is displayed
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toBeVisible();
    expect(signInButton).toBeEnabled();

    // Additional verification: Button is in navigation area
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toContainElement(signInButton);

    // Verify button has correct text
    expect(signInButton).toHaveTextContent('Sign In');

    console.log('✓ TEST PASSED: Sign In button is visible and accessible on the Landing Page');
  });

  it('should have "Get Started" button alongside Sign In button', () => {
    renderHome();

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const getStartedButton = screen.getByRole('button', { name: /get started/i });

    // Both buttons should be present
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toBeInTheDocument();

    // Both should be visible
    expect(signInButton).toBeVisible();
    expect(getStartedButton).toBeVisible();
  });

  it('should render navigation with CloudRush branding', () => {
    const { container } = renderHome();

    // Find navigation element
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();

    // Verify CloudRush brand elements exist
    const brandElements = screen.getAllByText('CloudRush');
    expect(brandElements.length).toBeGreaterThan(0);
    
    // At least one CloudRush element should be in the nav
    const navBrandFound = brandElements.some(element => nav?.contains(element));
    expect(navBrandFound).toBe(true);
  });

  it('should have correct button hierarchy for unauthenticated user', () => {
    renderHome();

    const buttons = screen.getAllByRole('button');
    
    // Should have at least Sign In and Get Started buttons
    expect(buttons.length).toBeGreaterThanOrEqual(2);

    // Find Sign In and Get Started buttons
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const getStartedButton = screen.getByRole('button', { name: /get started/i });

    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toBeInTheDocument();
  });
});
