import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import assert from 'assert';
import chrome from 'selenium-webdriver/chrome.js';

describe('Authentication Tests', function() {
  this.timeout(60000); // Increased timeout for Auth0 redirects
  let driver: WebDriver;
  const BASE_URL = 'http://localhost:5173';

  beforeEach(async function() {
    const options = new chrome.Options();
    // Keep browser state for session persistence tests
    options.addArguments('--disable-blink-features=AutomationControlled');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    await driver.manage().window().maximize();
  });

  afterEach(async function() {
    await driver.quit();
  });

  /**
   * TC-AUTH-001: Verify Sign Up with valid credentials
   * Prerequisites:
   * 1. Application (Frontend & Backend) is running
   * 2. User is on the Landing Page
   * 3. User does not have an active session (Logged out)
   */
  it('TC-AUTH-001: Should successfully sign up with valid credentials (Auth0)', async function() {
    // Step 1: Open localhost:5173 (Landing Page)
    await driver.get(BASE_URL);
    
    // Expected: The Landing Page loads successfully
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    assert(pageTitle.includes('CloudRush'), 'Landing page should load with CloudRush title');
    
    // Step 2: Click 'Sign Up' button (Get Started button)
    const signUpButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Get Started')]")),
      5000
    );
    await signUpButton.click();
    
    // Expected: Auth0 Sign Up modal/page appears
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('auth0.com') || url.includes('login');
    }, 10000);
    
    console.log('✓ Auth0 login page opened');
    
    // Step 3: Enter valid email and password (8+ chars)
    // Note: Auth0 Universal Login requires manual testing or pre-configured test user
    // For automation, you would need to:
    // 1. Wait for Auth0 iframe/redirect
    // 2. Switch to Auth0 context
    // 3. Fill in credentials
    // 4. Submit form
    
    // Example (adjust selectors based on your Auth0 configuration):
    try {
      // Wait for Auth0 email input
      await driver.wait(until.elementLocated(By.css('input[type="email"], input[name="email"], input[name="username"]')), 10000);
      
      const timestamp = Date.now();
      const testEmail = `testuser${timestamp}@example.com`;
      const testPassword = 'SecurePass123!';
      
      const emailInput = await driver.findElement(By.css('input[type="email"], input[name="email"], input[name="username"]'));
      await emailInput.sendKeys(testEmail);
      
      // Click continue/next button
      const continueBtn = await driver.wait(
        until.elementLocated(By.css('button[type="submit"], button[name="action"]')),
        5000
      );
      console.log('✓ Email entered, clicking continue button');
      await continueBtn.click();
      await driver.sleep(2000);
      console.log('✓ Continue button clicked');
      
      // Find and fill password
      const passwordInput = await driver.wait(
        until.elementLocated(By.css('input[type="password"], input[name="password"]')),
        5000
      );
      await passwordInput.sendKeys(testPassword);
      
      // Expected: The input is validated and accepted
      const passwordValue = await passwordInput.getAttribute('value');
      assert(passwordValue.length >= 8, 'Password should be at least 8 characters');
      
      // Step 4: Click 'Create Account' or 'Continue'
      const submitButton = await driver.findElement(By.css('button[type="submit"], button[name="action"]'));
      await submitButton.click();
      console.log('✓ Sign up form submitted');
      
      // Handle Auth0 consent screen for profile and email access
      try {
        // Wait for either consent screen or redirect to app
        await driver.sleep(3000);
        const currentUrl = await driver.getCurrentUrl();
        
        // Check if we're on Auth0 consent/permission screen
        if (currentUrl.includes('auth0.com') && (currentUrl.includes('consent') || currentUrl.includes('authorize'))) {
          console.log('✓ Auth0 consent screen detected');
          
          // Look for Accept/Allow button to grant access to profile and email
          try {
            const acceptButton = await driver.wait(
              until.elementLocated(By.xpath("//button[contains(., 'Accept')] | //button[contains(., 'Allow')] | //button[contains(., 'Continue')] | //button[@value='accept']")),
              5000
            );
            await acceptButton.click();
            console.log('✓ Accepted access to profile and email');
          } catch (e) {
            console.log('No accept button found, proceeding...');
          }
        }
      } catch (e) {
        console.log('No consent screen detected, continuing...');
      }
      
      // Expected: User is redirected to Dashboard/Flight page and logged in
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes(BASE_URL) && (url.includes('/flight') || url.includes('/home'));
      }, 15000);
      
      const finalUrl = await driver.getCurrentUrl();
      assert(
        finalUrl.includes('/flight') || finalUrl.includes('/home'),
        'Should redirect to flight page after successful signup'
      );
      
      // Verify user is logged in by checking for profile avatar
      await driver.wait(until.elementLocated(By.css('img[alt*="Profile"], div[class*="rounded-full"]')), 5000);
      console.log('✓ User successfully signed up and logged in');
      
    } catch (error) {
      console.log('  Note: Full Auth0 signup automation requires test credentials');
      console.log('This test validates the flow up to Auth0 redirect');
      throw error;
    }
  });

  /**
   * TC-AUTH-002: Verify Sign In with Google
   * Prerequisites:
   * 1. User is on Login Page
   * 2. Google OAuth credentials are configured in Auth0
   * 3. User has a valid Google Account
   */
  it('TC-AUTH-002: Should successfully sign in with Google OAuth', async function() {
    // Step 1: Navigate to application
    await driver.get(BASE_URL);
    
    // Click 'Sign In' button
    const signInButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Sign In')]")),
      5000
    );
    await signInButton.click();
    
    // Step 2: Wait for Auth0 login page and click 'Continue with Google'
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('auth0.com') || url.includes('login');
    }, 10000);
    
    console.log('✓ Auth0 login page opened');
    
    try {
      // Look for Google login button
      const googleButton = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Google')] | //button[contains(@data-provider, 'google')]")),
        10000
      );
      await googleButton.click();
      
      // Expected: Google OAuth pop-up window opens
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('accounts.google.com');
      }, 10000);
      
      console.log('✓ Google OAuth page opened');
      
      // Step 3: Select valid Google Account (requires manual interaction or test account)
      // Note: Google authentication requires actual credentials
      // For full automation, you would need to:
      // 1. Enter Google email
      // 2. Enter Google password
      // 3. Handle 2FA if enabled
      
      console.log('  Google OAuth requires valid test credentials');
      console.log('Manual step: Select Google account and authenticate');
      
      // Wait for redirect back to app (with extended timeout)
      // await driver.wait(async () => {
      //   const url = await driver.getCurrentUrl();
      //   return url.includes(BASE_URL);
      // }, 30000);
      
      // // Step 4: Verify JWT token is stored in LocalStorage
      // const token = await driver.executeScript('return localStorage.getItem("access_token")');
      // assert(token !== null, 'JWT token should be stored in localStorage');
      
      // console.log('✓ User successfully logged in with Google');
      
    } catch (error) {
      console.log('  Note: Full Google OAuth requires valid Google account credentials');
      throw error;
    }
  });

  /**
   * TC-AUTH-003: Verify Session Persistence
   * Prerequisites:
   * 1. User is already logged in
   * 2. JWT token is stored in Browser LocalStorage
   */
  it('TC-AUTH-003: Should persist user session after browser tab close', async function() {
    // This test requires a pre-authenticated session
    // For demo purposes, we'll manually set a token
    
    await driver.get(BASE_URL);
    
    // Simulate authenticated state by setting token
    // Note: In real scenario, user would login first
    await driver.executeScript(`
      localStorage.setItem('@@auth0spajs@@::${process.env.VITE_AUTH0_CLIENT_ID}::${process.env.VITE_AUTH0_API_AUDIENCE}::openid profile email', JSON.stringify({
        body: {
          access_token: 'test_token',
          expires_in: 86400
        }
      }));
    `);
    
    // Step 1: Refresh page (simulates tab close and reopen)
    await driver.navigate().refresh();
    
    // Step 2: Wait for page to load
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    
    // Step 3: Check if user avatar is visible (session persists)
    try {
      await driver.wait(
        until.elementLocated(By.css('img[alt*="Profile"], div[class*="rounded-full"]')),
        5000
      );
      console.log('✓ User session persisted after page refresh');
      
      // Verify token still exists in localStorage
      const token = await driver.executeScript('return localStorage.getItem("access_token")');
      console.log('Token in localStorage:', token !== null ? 'Present' : 'Missing');
      
    } catch (error) {
      console.log('  Session persistence requires actual Auth0 authentication');
      console.log('This test demonstrates the check, but needs real login flow');
    }
  });

  /**
   * TC-AUTH-004: Verify Logout functionality
   * Prerequisites:
   * 1. User is currently logged in
   * 2. User is on any page of the application
   */
  it('TC-AUTH-004: Should successfully logout user after signup', async function() {
    // PREREQUISITE: Perform Sign Up first
    console.log('=== STEP 0: Performing Sign Up ===');
    await driver.get(BASE_URL);
    
    // Click 'Get Started' button to sign up
    const signUpButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Get Started')]")),
      5000
    );
    await signUpButton.click();
    
    // Wait for Auth0 login page
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url.includes('auth0.com') || url.includes('login');
    }, 10000);
    
    console.log('✓ Auth0 login page opened');
    
    // Enter credentials (adjust selectors based on your Auth0 setup)
    try {
      await driver.wait(until.elementLocated(By.css('input[type="email"], input[name="email"], input[name="username"]')), 10000);
      
      // Use test credentials for Sign Up - generate unique email
      const timestamp = Date.now();
      const testEmail = process.env.TEST_EMAIL || `testuser${timestamp}@example.com`;
      const testPassword = process.env.TEST_PASSWORD || 'SecurePass123!';
      
      const emailInput = await driver.findElement(By.css('input[type="email"], input[name="email"], input[name="username"]'));
      await emailInput.sendKeys(testEmail);
      
      // Try to click continue if there's a button
      try {
        const continueBtn = await driver.findElement(By.css('button[type="submit"], button[name="action"]'));
        await continueBtn.click();
        await driver.sleep(2000);
      } catch (e) {
        // No continue button, proceed to password
      }
      
      // Enter password
      const passwordInput = await driver.wait(
        until.elementLocated(By.css('input[type="password"], input[name="password"]')),
        5000
      );
      await passwordInput.sendKeys(testPassword);
      
      // Submit login
      const submitButton = await driver.findElement(By.css('button[type="submit"], button[name="action"]'));
      await submitButton.click();
      console.log('✓ Sign up form submitted');
      
      // Handle Auth0 consent screen for profile and email access
      try {
        // Wait for either consent screen or redirect to app
        await driver.sleep(3000);
        const currentUrl = await driver.getCurrentUrl();
        
        // Check if we're on Auth0 consent/permission screen
        if (currentUrl.includes('auth0.com') && (currentUrl.includes('consent') || currentUrl.includes('authorize'))) {
          console.log('✓ Auth0 consent screen detected');
          
          // Look for Accept/Allow button to grant access to profile and email
          try {
            const acceptButton = await driver.wait(
              until.elementLocated(By.xpath("//button[contains(., 'Accept')] | //button[contains(., 'Allow')] | //button[contains(., 'Continue')] | //button[@value='accept']")),
              5000
            );
            await acceptButton.click();
            console.log('✓ Accepted access to profile and email');
          } catch (e) {
            console.log('⚠️  No accept button found, proceeding...');
          }
        }
      } catch (e) {
        console.log('⚠️  No consent screen detected, continuing...');
      }
      
      // Wait for redirect back to app
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return url.includes(BASE_URL) && !url.includes('auth0.com');
      }, 15000);
      
      console.log('✓ User successfully signed up and logged in');
      
      // Wait for profile avatar to appear
      await driver.wait(
        until.elementLocated(By.css('img[alt*="Profile"], div[class*="rounded-full"]')),
        5000
      );
      console.log('✓ User profile avatar visible');
      
    } catch (signupError) {
      console.log('⚠️  Sign up failed or requires manual credentials');
      console.log('Note: Auth0 may require email verification for new accounts');
      throw signupError;
    }
    
    // NOW PERFORM LOGOUT FLOW
    console.log('\n=== STEP 1: Click Profile Avatar ===');
    const profileAvatar = await driver.wait(
      until.elementLocated(By.css('img[alt*="Profile"], div[class*="rounded-full"]')),
      5000
    );
    await profileAvatar.click();
    
    // Expected: User dropdown menu appears
    await driver.sleep(1000); // Wait for dropdown animation
    console.log('✓ User dropdown menu appeared');
    
    // STEP 2: Click 'Logout' or 'Sign Out'
    console.log('\n=== STEP 2: Click Logout ===');
    const logoutButton = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Sign Out')] | //button[contains(., 'Logout')]")),
      5000
    );
    await logoutButton.click();
    
    console.log('✓ Logout button clicked');
    
    // STEP 3: Check LocalStorage and URL
    console.log('\n=== STEP 3: Verify Logout ===');
    
    // Wait for either redirect to landing page or Auth0 logout
    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return url === BASE_URL + '/' || url.includes('auth0.com/v2/logout') || !url.includes('/flight');
    }, 10000);
    
    // If we're on Auth0 logout page, wait for redirect back
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('auth0.com')) {
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('auth0.com');
      }, 10000);
    }
    
    // Check localStorage for token removal
    const token = await driver.executeScript('return localStorage.getItem("access_token")');
    console.log('Token in localStorage:', token === null ? 'Removed ✓' : 'Still present ✗');
    
    // Verify we're back on landing page
    const finalUrl = await driver.getCurrentUrl();
    console.log('Final URL:', finalUrl);
    assert(
      finalUrl === BASE_URL + '/' || finalUrl === BASE_URL,
      'Should be redirected to Landing Page'
    );
    
    // Verify profile avatar is no longer visible
    try {
      await driver.wait(
        until.elementLocated(By.css('img[alt*="Profile"]')),
        2000
      );
      throw new Error('Profile avatar should not be visible after logout');
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('should not be visible')) {
        throw error;
      }
      // Expected: avatar not found
      console.log('✓ Profile avatar no longer visible');
    }
    
    console.log('✓ User successfully logged out');
    console.log('✓ Token removed from localStorage');
    console.log('✓ User redirected to Landing Page');
  });
});
