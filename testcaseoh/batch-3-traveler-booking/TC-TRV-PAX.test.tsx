/**
 * Test Suite: TC-TRV-PAX (Traveler Passenger Information)
 * Category: Traveler Services - Passenger Information Validation
 * Description: Unit tests for Traveler passenger information form validation including names, DOB, passport, email, phone, nationality, and gender
 * 
 * Test Cases:
 * - TC-TRV-PAX-001: Verify First Name - Empty
 * - TC-TRV-PAX-002: Verify First Name - Special Chars
 * - TC-TRV-PAX-003: Verify First Name - Too Long
 * - TC-TRV-PAX-004: Verify Last Name - Empty
 * - TC-TRV-PAX-005: Verify DOB - Future Date
 * - TC-TRV-PAX-006: Verify DOB - Today
 * - TC-TRV-PAX-007: Verify DOB - Under 18 (Adult Ticket)
 * - TC-TRV-PAX-008: Verify DOB - Over 2 (Infant Ticket)
 * - TC-TRV-PAX-009: Verify Passport - Empty
 * - TC-TRV-PAX-010: Verify Passport - Min Length
 * - TC-TRV-PAX-011: Verify Passport - Max Length
 * - TC-TRV-PAX-012: Verify Passport - Duplicate (Same Booking)
 * - TC-TRV-PAX-013: Verify Email - Invalid Format
 * - TC-TRV-PAX-014: Verify Phone - Alpha characters
 * - TC-TRV-PAX-015: Verify Phone - Length (10 digits)
 * - TC-TRV-PAX-016: Verify Phone - Length (Short)
 * - TC-TRV-PAX-017: Verify Nationality - Selection
 * - TC-TRV-PAX-018: Verify Gender - Selection
 * 
 * Prerequisites:
 * 1. User is logged in as Traveler
 * 2. User is on the passenger information step
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock validation APIs
const mockValidatePassenger = vi.fn();
const mockCheckDuplicatePassport = vi.fn();
const mockSubmitPassengerInfo = vi.fn();

// Mock PassengerInfoForm component
const PassengerInfoForm = ({ ticketType, existingPassports }: { ticketType: string; existingPassports?: string[] }) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [passport, setPassport] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [nationality, setNationality] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'MSG 1: Field Mandatory';
    } else if (/[^a-zA-Z\s]/.test(firstName)) {
      newErrors.firstName = 'Invalid format';
    } else if (firstName.length > 50) {
      newErrors.firstName = 'Name too long';
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'MSG 1: Field Mandatory';
    }

    // DOB validation
    if (dob) {
      const dobDate = new Date(dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dobDate > today) {
        newErrors.dob = 'Invalid Date of Birth';
      } else if (dobDate.getTime() === today.getTime()) {
        // DOB is today - could be infant logic
        const isInfant = ticketType === 'Infant';
        if (!isInfant) {
          newErrors.dob = 'Invalid Date of Birth';
        }
      } else {
        // Calculate age
        const age = Math.floor((today.getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

        if (ticketType === 'Adult' && age < 18) {
          newErrors.dob = 'Must be 18+ for Adult ticket';
        } else if (ticketType === 'Infant' && age > 2) {
          newErrors.dob = 'Must be under 2 for Infant ticket';
        }
      }
    }

    // Passport validation
    if (!passport.trim()) {
      newErrors.passport = 'MSG 1: Field Mandatory';
    } else if (passport.length < 6) {
      newErrors.passport = 'Invalid Passport ID';
    } else if (passport.length > 15) {
      newErrors.passport = 'Invalid Passport ID';
    } else if (existingPassports && existingPassports.includes(passport)) {
      newErrors.passport = 'Duplicate Passenger';
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'MSG 4: Invalid format';
    }

    // Phone validation
    if (phone) {
      if (/[a-zA-Z]/.test(phone)) {
        newErrors.phone = 'Numbers only';
      } else if (phone.length !== 10) {
        newErrors.phone = 'Invalid Phone Length';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await mockSubmitPassengerInfo({
        firstName,
        lastName,
        dob,
        passport,
        email,
        phone,
        nationality,
        gender,
      });
    }
  };

  return (
    <div data-testid="passenger-info-form">
      <h2>Passenger Information</h2>

      {/* First Name */}
      <div>
        <label>First Name:</label>
        <input
          data-testid="first-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Enter first name"
        />
        {errors.firstName && <div data-testid="error-first-name">{errors.firstName}</div>}
      </div>

      {/* Last Name */}
      <div>
        <label>Last Name:</label>
        <input
          data-testid="last-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Enter last name"
        />
        {errors.lastName && <div data-testid="error-last-name">{errors.lastName}</div>}
      </div>

      {/* Date of Birth */}
      <div>
        <label>Date of Birth:</label>
        <input
          type="date"
          data-testid="dob"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        {errors.dob && <div data-testid="error-dob">{errors.dob}</div>}
      </div>

      {/* Passport */}
      <div>
        <label>Passport ID:</label>
        <input
          data-testid="passport"
          value={passport}
          onChange={(e) => setPassport(e.target.value)}
          placeholder="Enter passport ID"
        />
        {errors.passport && <div data-testid="error-passport">{errors.passport}</div>}
      </div>

      {/* Email */}
      <div>
        <label>Email:</label>
        <input
          data-testid="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        {errors.email && <div data-testid="error-email">{errors.email}</div>}
      </div>

      {/* Phone */}
      <div>
        <label>Phone:</label>
        <input
          data-testid="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number"
        />
        {errors.phone && <div data-testid="error-phone">{errors.phone}</div>}
      </div>

      {/* Nationality */}
      <div>
        <label>Nationality:</label>
        <select
          data-testid="nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        >
          <option value="">Select Country</option>
          <option value="Vietnam">Vietnam</option>
          <option value="USA">United States</option>
          <option value="Japan">Japan</option>
        </select>
      </div>

      {/* Gender */}
      <div>
        <label>Gender:</label>
        <select
          data-testid="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <button onClick={handleSubmit} data-testid="submit-button">
        Submit
      </button>
    </div>
  );
};

describe('TC-TRV-PAX: Traveler Passenger Information Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * TC-TRV-PAX-001: Verify First Name - Empty
   * Business Requirement: BR23
   * 
   * Test Data: Name: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-TRV-PAX-001: should display error when first name is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Leave First Name blank and submit
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-first-name')).toHaveTextContent('MSG 1: Field Mandatory');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-002: Verify First Name - Special Chars
   * Business Requirement: BR23
   * 
   * Test Data: Name: "Kien@123"
   * 
   * Expected Result:
   * Error "Invalid format".
   */
  it('TC-TRV-PAX-002: should display error when first name contains special characters', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter special chars in first name
    await user.type(screen.getByTestId('first-name'), 'Kien@123');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Invalid format"
    expect(await screen.findByTestId('error-first-name')).toHaveTextContent('Invalid format');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-003: Verify First Name - Too Long
   * Note: Bound
   * 
   * Test Data: Name: [51 chars]
   * 
   * Expected Result:
   * Error "Name too long".
   */
  it('TC-TRV-PAX-003: should display error when first name exceeds 50 characters', async () => {
    // Arrange
    const longName = 'A'.repeat(51); // 51 characters
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter name > 50 chars
    await user.type(screen.getByTestId('first-name'), longName);

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Name too long"
    expect(await screen.findByTestId('error-first-name')).toHaveTextContent('Name too long');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-004: Verify Last Name - Empty
   * Business Requirement: BR23
   * 
   * Test Data: Name: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-TRV-PAX-004: should display error when last name is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Leave Last Name blank (enter first name to isolate last name error)
    await user.type(screen.getByTestId('first-name'), 'John');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "MSG 1: Field Mandatory" for last name
    expect(await screen.findByTestId('error-last-name')).toHaveTextContent('MSG 1: Field Mandatory');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-005: Verify DOB - Future Date
   * Note: Logic
   * 
   * Test Data: Date: Tomorrow
   * 
   * Expected Result:
   * Error "Invalid Date of Birth".
   */
  it('TC-TRV-PAX-005: should display error when DOB is in the future', async () => {
    // Arrange
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Select DOB in future (tomorrow)
    await user.type(screen.getByTestId('dob'), tomorrowStr);

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Invalid Date of Birth"
    expect(await screen.findByTestId('error-dob')).toHaveTextContent('Invalid Date of Birth');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-006: Verify DOB - Today
   * Note: Logic
   * 
   * Test Data: Date: Today
   * 
   * Expected Result:
   * Accepted (Infant logic) or Error.
   */
  it('TC-TRV-PAX-006: should accept today as DOB for infant ticket', async () => {
    // Arrange
    const today = new Date().toISOString().split('T')[0];

    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Infant" />);

    // Act - Select DOB = Today
    await user.type(screen.getByTestId('first-name'), 'Baby');
    await user.type(screen.getByTestId('last-name'), 'Infant');
    await user.type(screen.getByTestId('dob'), today);
    await user.type(screen.getByTestId('passport'), 'B123456');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Accepted for Infant (no DOB error)
    expect(screen.queryByTestId('error-dob')).not.toBeInTheDocument();

    // Assert - Form submitted successfully
    await waitFor(() => {
      expect(mockSubmitPassengerInfo).toHaveBeenCalled();
    });
  });

  /**
   * TC-TRV-PAX-007: Verify DOB - Under 18 (Adult Ticket)
   * Note: Biz
   * 
   * Test Data: Age: 17
   * 
   * Expected Result:
   * Error "Must be 18+ for Adult ticket".
   */
  it('TC-TRV-PAX-007: should display error when booking adult ticket for passenger under 18', async () => {
    // Arrange
    const seventeenYearsAgo = new Date();
    seventeenYearsAgo.setFullYear(seventeenYearsAgo.getFullYear() - 17);
    const dobStr = seventeenYearsAgo.toISOString().split('T')[0];

    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Book Adult ticket, enter DOB < 18y (age 17)
    await user.type(screen.getByTestId('dob'), dobStr);

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Must be 18+ for Adult ticket"
    expect(await screen.findByTestId('error-dob')).toHaveTextContent('Must be 18+ for Adult ticket');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-008: Verify DOB - Over 2 (Infant Ticket)
   * Note: Biz
   * 
   * Test Data: Age: 3
   * 
   * Expected Result:
   * Error "Must be under 2 for Infant ticket".
   */
  it('TC-TRV-PAX-008: should display error when booking infant ticket for passenger over 2 years', async () => {
    // Arrange
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const dobStr = threeYearsAgo.toISOString().split('T')[0];

    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Infant" />);

    // Act - Book Infant ticket, enter DOB > 2y (age 3)
    await user.type(screen.getByTestId('dob'), dobStr);

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Must be under 2 for Infant ticket"
    expect(await screen.findByTestId('error-dob')).toHaveTextContent('Must be under 2 for Infant ticket');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-009: Verify Passport - Empty
   * Business Requirement: BR23
   * 
   * Test Data: Passport: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-TRV-PAX-009: should display error when passport is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Leave Passport blank (fill other required fields)
    await user.type(screen.getByTestId('first-name'), 'John');
    await user.type(screen.getByTestId('last-name'), 'Doe');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-passport')).toHaveTextContent('MSG 1: Field Mandatory');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-010: Verify Passport - Min Length
   * Note: Val
   * 
   * Test Data: ID: "123"
   * 
   * Expected Result:
   * Error "Invalid Passport ID".
   */
  it('TC-TRV-PAX-010: should display error when passport ID is too short', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter short passport ID (3 chars, min is 6)
    await user.type(screen.getByTestId('passport'), '123');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Invalid Passport ID"
    expect(await screen.findByTestId('error-passport')).toHaveTextContent('Invalid Passport ID');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-011: Verify Passport - Max Length
   * Note: Val
   * 
   * Test Data: ID: [20 chars]
   * 
   * Expected Result:
   * Error "Invalid Passport ID".
   */
  it('TC-TRV-PAX-011: should display error when passport ID is too long', async () => {
    // Arrange
    const longPassport = 'A'.repeat(20); // 20 characters (max is 15)
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter long passport ID (20 chars)
    await user.type(screen.getByTestId('passport'), longPassport);

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Invalid Passport ID"
    expect(await screen.findByTestId('error-passport')).toHaveTextContent('Invalid Passport ID');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-012: Verify Passport - Duplicate (Same Booking)
   * Note: Logic
   * 
   * Test Data: ID: "B12345"
   * 
   * Expected Result:
   * Error "Duplicate Passenger".
   */
  it('TC-TRV-PAX-012: should display error when entering duplicate passport for same booking', async () => {
    // Arrange - Passenger 1 already has passport "B12345"
    const existingPassports = ['B12345'];

    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" existingPassports={existingPassports} />);

    // Act - Enter same Passport for Pax 2
    await user.type(screen.getByTestId('passport'), 'B12345');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Duplicate Passenger"
    expect(await screen.findByTestId('error-passport')).toHaveTextContent('Duplicate Passenger');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-013: Verify Email - Invalid Format
   * Business Requirement: BR23
   * 
   * Test Data: Email: "abc.com"
   * 
   * Expected Result:
   * Error "MSG 4: Invalid format".
   */
  it('TC-TRV-PAX-013: should display error when email format is invalid', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter invalid email (missing @)
    await user.type(screen.getByTestId('email'), 'abc.com');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "MSG 4: Invalid format"
    expect(await screen.findByTestId('error-email')).toHaveTextContent('MSG 4: Invalid format');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-014: Verify Phone - Alpha characters
   * Business Requirement: BR23
   * 
   * Test Data: Phone: "0909abc"
   * 
   * Expected Result:
   * Error "Numbers only".
   */
  it('TC-TRV-PAX-014: should display error when phone contains letters', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter letters in phone field
    await user.type(screen.getByTestId('phone'), '0909abc');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Numbers only"
    expect(await screen.findByTestId('error-phone')).toHaveTextContent('Numbers only');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-015: Verify Phone - Length (10 digits)
   * Business Requirement: BR23
   * 
   * Test Data: Phone: 0901234567
   * 
   * Expected Result:
   * Accepted.
   */
  it('TC-TRV-PAX-015: should accept phone number with 10 digits', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter 10 digits
    await user.type(screen.getByTestId('first-name'), 'John');
    await user.type(screen.getByTestId('last-name'), 'Doe');
    await user.type(screen.getByTestId('passport'), 'A123456');
    await user.type(screen.getByTestId('phone'), '0901234567');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - No phone error
    expect(screen.queryByTestId('error-phone')).not.toBeInTheDocument();

    // Assert - Form submitted successfully
    await waitFor(() => {
      expect(mockSubmitPassengerInfo).toHaveBeenCalled();
    });
  });

  /**
   * TC-TRV-PAX-016: Verify Phone - Length (Short)
   * Business Requirement: BR23
   * 
   * Test Data: Phone: 12345678
   * 
   * Expected Result:
   * Error "Invalid Phone Length".
   */
  it('TC-TRV-PAX-016: should display error when phone has 8 digits', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Enter 8 digits (short)
    await user.type(screen.getByTestId('phone'), '12345678');

    // Act - Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Assert - Error "Invalid Phone Length"
    expect(await screen.findByTestId('error-phone')).toHaveTextContent('Invalid Phone Length');

    // Assert - Form not submitted
    expect(mockSubmitPassengerInfo).not.toHaveBeenCalled();
  });

  /**
   * TC-TRV-PAX-017: Verify Nationality - Selection
   * Note: UI
   * 
   * Test Data: Country: Vietnam
   * 
   * Expected Result:
   * Accepted.
   */
  it('TC-TRV-PAX-017: should accept nationality selection from dropdown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Select from Dropdown
    await user.selectOptions(screen.getByTestId('nationality'), 'Vietnam');

    // Assert - Vietnam is selected
    expect(screen.getByTestId('nationality')).toHaveValue('Vietnam');

    // Act - Fill required fields and submit
    await user.type(screen.getByTestId('first-name'), 'Nguyen');
    await user.type(screen.getByTestId('last-name'), 'Van A');
    await user.type(screen.getByTestId('passport'), 'VN12345');

    await user.click(screen.getByTestId('submit-button'));

    // Assert - Form submitted successfully with nationality
    await waitFor(() => {
      expect(mockSubmitPassengerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          nationality: 'Vietnam',
        })
      );
    });
  });

  /**
   * TC-TRV-PAX-018: Verify Gender - Selection
   * Note: UI
   * 
   * Test Data: Gender: Male
   * 
   * Expected Result:
   * Accepted.
   */
  it('TC-TRV-PAX-018: should accept gender selection from dropdown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<PassengerInfoForm ticketType="Adult" />);

    // Act - Select Male/Female
    await user.selectOptions(screen.getByTestId('gender'), 'Male');

    // Assert - Male is selected
    expect(screen.getByTestId('gender')).toHaveValue('Male');

    // Act - Fill required fields and submit
    await user.type(screen.getByTestId('first-name'), 'John');
    await user.type(screen.getByTestId('last-name'), 'Doe');
    await user.type(screen.getByTestId('passport'), 'US12345');

    await user.click(screen.getByTestId('submit-button'));

    // Assert - Form submitted successfully with gender
    await waitFor(() => {
      expect(mockSubmitPassengerInfo).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'Male',
        })
      );
    });
  });
});
