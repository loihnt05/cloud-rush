/**
 * Test Suite: TC-AIR-VAL (Master Airplane - Field Validation)
 * Category: Master Data Management - Airplane Form Validation
 * Description: Comprehensive unit tests for airplane creation form field validation
 * 
 * Test Cases:
 * - TC-AIR-VAL-001: Create Plane - Empty Code
 * - TC-AIR-VAL-002: Create Plane - Duplicate Code
 * - TC-AIR-VAL-003: Create Plane - Code Special Char
 * - TC-AIR-VAL-004: Create Plane - Code Max Length
 * - TC-AIR-VAL-005: Create Plane - Empty Model
 * - TC-AIR-VAL-006: Create Plane - Empty Capacity
 * - TC-AIR-VAL-007: Create Plane - Negative Capacity
 * - TC-AIR-VAL-008: Create Plane - Zero Capacity
 * - TC-AIR-VAL-009: Create Plane - Decimal Capacity
 * - TC-AIR-VAL-010: Create Plane - Text in Capacity
 * - TC-AIR-VAL-011: Create Plane - Huge Capacity
 * - TC-AIR-VAL-012: Create Plane - Over Max Capacity
 * - TC-AIR-VAL-013: Create Plane - Airline Empty
 * - TC-AIR-VAL-014: Create Plane - Airline Selection
 * - TC-AIR-VAL-015: Create Plane - Status Default
 * 
 * Prerequisites:
 * 1. User is logged in as Admin or CSA
 * 2. User is on Airplane Create form
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock airplane APIs
const mockCheckCodeExists = vi.fn();
const mockCreateAirplane = vi.fn();

// Mock existing airplane codes
const existingCodes = ['VN-A320', 'VN-A321', 'VN-B777'];

// Mock airline options
const airlineOptions = [
  { id: '1', name: 'Vietnam Airlines' },
  { id: '2', name: 'VietJet Air' },
  { id: '3', name: 'Bamboo Airways' }
];

// Mock CreateAirplaneForm component
const CreateAirplaneForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const [formData, setFormData] = React.useState({
    code: '',
    model: '',
    capacity: '',
    airline: '',
    status: 'Active' // Default status
  });
  const [errors, setErrors] = React.useState<any>({});
  const [warning, setWarning] = React.useState('');
  const [touched, setTouched] = React.useState<any>({});

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      return 'MSG 1: Field Mandatory';
    }

    if (code.length > 10) {
      return 'Max length exceeded';
    }

    // Alphanumeric and hyphen only
    const alphanumericRegex = /^[A-Za-z0-9-]+$/;
    if (!alphanumericRegex.test(code)) {
      return 'Alphanumeric only';
    }

    // Check for duplicate
    const exists = await mockCheckCodeExists(code);
    if (exists) {
      return 'Airplane Code already exists';
    }

    return '';
  };

  const validateModel = (model: string) => {
    if (!model.trim()) {
      return 'MSG 1: Field Mandatory';
    }
    return '';
  };

  const validateCapacity = (capacity: string) => {
    if (!capacity.trim()) {
      return 'MSG 1: Field Mandatory';
    }

    // Check if numeric
    if (isNaN(Number(capacity))) {
      return 'Numeric only';
    }

    const numValue = Number(capacity);

    // Check for decimal
    if (!Number.isInteger(numValue)) {
      return 'Must be integer';
    }

    // Check for zero
    if (numValue === 0) {
      return 'Capacity must be > 0';
    }

    // Check for negative
    if (numValue < 0) {
      return 'Capacity must be positive';
    }

    // Warning for unrealistic capacity
    if (numValue > 1000) {
      setWarning('Verify capacity');
    } else {
      setWarning('');
    }

    return '';
  };

  const validateAirline = (airline: string) => {
    if (!airline.trim()) {
      return 'MSG 1: Field Mandatory';
    }
    return '';
  };

  const handleBlur = async (field: string) => {
    setTouched({ ...touched, [field]: true });

    let error = '';
    if (field === 'code') {
      error = await validateCode(formData.code);
    } else if (field === 'model') {
      error = validateModel(formData.model);
    } else if (field === 'capacity') {
      error = validateCapacity(formData.capacity);
    } else if (field === 'airline') {
      error = validateAirline(formData.airline);
    }

    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (touched[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const codeError = await validateCode(formData.code);
    const modelError = validateModel(formData.model);
    const capacityError = validateCapacity(formData.capacity);
    const airlineError = validateAirline(formData.airline);

    const newErrors = {
      code: codeError,
      model: modelError,
      capacity: capacityError,
      airline: airlineError
    };

    setErrors(newErrors);

    // Check if any errors
    if (Object.values(newErrors).some(err => err !== '')) {
      return;
    }

    // Submit form
    const result = await mockCreateAirplane({
      code: formData.code,
      model: formData.model,
      capacity: Number(formData.capacity),
      airline: formData.airline,
      status: formData.status
    });

    if (onSubmit) {
      onSubmit(result);
    }
  };

  return (
    <div data-testid="create-airplane-form">
      <h2>Create Airplane</h2>

      <form onSubmit={handleSubmit}>
        {/* Code Field */}
        <div data-testid="field-code">
          <label htmlFor="code">Code:</label>
          <input
            id="code"
            data-testid="input-code"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            onBlur={() => handleBlur('code')}
            maxLength={15} // Allow typing beyond limit to test validation
          />
          {errors.code && (
            <div data-testid="error-code" style={{ color: 'red' }}>
              {errors.code}
            </div>
          )}
        </div>

        {/* Model Field */}
        <div data-testid="field-model">
          <label htmlFor="model">Model:</label>
          <input
            id="model"
            data-testid="input-model"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            onBlur={() => handleBlur('model')}
          />
          {errors.model && (
            <div data-testid="error-model" style={{ color: 'red' }}>
              {errors.model}
            </div>
          )}
        </div>

        {/* Capacity Field */}
        <div data-testid="field-capacity">
          <label htmlFor="capacity">Capacity:</label>
          <input
            id="capacity"
            data-testid="input-capacity"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', e.target.value)}
            onBlur={() => handleBlur('capacity')}
          />
          {errors.capacity && (
            <div data-testid="error-capacity" style={{ color: 'red' }}>
              {errors.capacity}
            </div>
          )}
          {warning && (
            <div data-testid="warning-capacity" style={{ color: 'orange' }}>
              {warning}
            </div>
          )}
        </div>

        {/* Airline Field */}
        <div data-testid="field-airline">
          <label htmlFor="airline">Airline:</label>
          <select
            id="airline"
            data-testid="select-airline"
            value={formData.airline}
            onChange={(e) => handleChange('airline', e.target.value)}
            onBlur={() => handleBlur('airline')}
          >
            <option value="">-- Select Airline --</option>
            {airlineOptions.map(opt => (
              <option key={opt.id} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
          {errors.airline && (
            <div data-testid="error-airline" style={{ color: 'red' }}>
              {errors.airline}
            </div>
          )}
        </div>

        {/* Status Field (Read-only default) */}
        <div data-testid="field-status">
          <label htmlFor="status">Status:</label>
          <input
            id="status"
            data-testid="input-status"
            value={formData.status}
            readOnly
            disabled
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" data-testid="submit-btn">
          Create Airplane
        </button>
      </form>
    </div>
  );
};

describe('TC-AIR-VAL: Master Airplane - Field Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckCodeExists.mockImplementation((code: string) => {
      return Promise.resolve(existingCodes.includes(code));
    });
    mockCreateAirplane.mockResolvedValue({
      id: 'airplane_new',
      success: true
    });
  });

  /**
   * TC-AIR-VAL-001: Create Plane - Empty Code
   * Business Requirement: BR34
   * 
   * Steps:
   * Leave Code empty.
   * 
   * Test Data: Code: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-AIR-VAL-001: should show mandatory error when code is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Leave Code empty and blur
    const codeInput = screen.getByTestId('input-code');
    await user.click(codeInput);
    await user.tab(); // Blur by tabbing to next field

    // Assert - Test Case Expected Result: Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-code')).toHaveTextContent('MSG 1: Field Mandatory');
  });

  /**
   * TC-AIR-VAL-002: Create Plane - Duplicate Code
   * Business Requirement: Unique
   * 
   * Steps:
   * Enter existing Code.
   * 
   * Test Data: Code: "VN-A320"
   * 
   * Expected Result:
   * Error "Airplane Code already exists".
   */
  it('TC-AIR-VAL-002: should show error when code already exists', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter existing Code
    const codeInput = screen.getByTestId('input-code');
    await user.type(codeInput, 'VN-A320');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Airplane Code already exists"
    await waitFor(() => {
      expect(mockCheckCodeExists).toHaveBeenCalledWith('VN-A320');
    });

    expect(await screen.findByTestId('error-code')).toHaveTextContent('Airplane Code already exists');
  });

  /**
   * TC-AIR-VAL-003: Create Plane - Code Special Char
   * Business Requirement: Val
   * 
   * Steps:
   * Enter special chars.
   * 
   * Test Data: Code: "VN@#$"
   * 
   * Expected Result:
   * Error "Alphanumeric only".
   */
  it('TC-AIR-VAL-003: should show error when code contains special characters', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter special chars
    const codeInput = screen.getByTestId('input-code');
    await user.type(codeInput, 'VN@#$');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Alphanumeric only"
    expect(await screen.findByTestId('error-code')).toHaveTextContent('Alphanumeric only');
  });

  /**
   * TC-AIR-VAL-004: Create Plane - Code Max Length
   * Business Requirement: Bound
   * 
   * Steps:
   * Enter > 10 chars.
   * 
   * Test Data: Code: "VN-12345678"
   * 
   * Expected Result:
   * Error "Max length exceeded".
   */
  it('TC-AIR-VAL-004: should show error when code exceeds max length', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter > 10 chars
    const codeInput = screen.getByTestId('input-code');
    await user.type(codeInput, 'VN-12345678'); // 12 characters
    await user.tab();

    // Assert - Test Case Expected Result: Error "Max length exceeded"
    expect(await screen.findByTestId('error-code')).toHaveTextContent('Max length exceeded');
  });

  /**
   * TC-AIR-VAL-005: Create Plane - Empty Model
   * Business Requirement: BR34
   * 
   * Steps:
   * Leave Model empty.
   * 
   * Test Data: Model: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-AIR-VAL-005: should show mandatory error when model is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Leave Model empty and blur
    const modelInput = screen.getByTestId('input-model');
    await user.click(modelInput);
    await user.tab();

    // Assert - Test Case Expected Result: Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-model')).toHaveTextContent('MSG 1: Field Mandatory');
  });

  /**
   * TC-AIR-VAL-006: Create Plane - Empty Capacity
   * Business Requirement: BR34
   * 
   * Steps:
   * Leave Capacity empty.
   * 
   * Test Data: Cap: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-AIR-VAL-006: should show mandatory error when capacity is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Leave Capacity empty and blur
    const capacityInput = screen.getByTestId('input-capacity');
    await user.click(capacityInput);
    await user.tab();

    // Assert - Test Case Expected Result: Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-capacity')).toHaveTextContent('MSG 1: Field Mandatory');
  });

  /**
   * TC-AIR-VAL-007: Create Plane - Negative Capacity
   * Business Requirement: Val
   * 
   * Steps:
   * Enter negative number.
   * 
   * Test Data: Cap: -100
   * 
   * Expected Result:
   * Error "Capacity must be positive".
   */
  it('TC-AIR-VAL-007: should show error when capacity is negative', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter negative number
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, '-100');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Capacity must be positive"
    expect(await screen.findByTestId('error-capacity')).toHaveTextContent('Capacity must be positive');
  });

  /**
   * TC-AIR-VAL-008: Create Plane - Zero Capacity
   * Business Requirement: Val
   * 
   * Steps:
   * Enter 0.
   * 
   * Test Data: Cap: 0
   * 
   * Expected Result:
   * Error "Capacity must be > 0".
   */
  it('TC-AIR-VAL-008: should show error when capacity is zero', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter 0
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, '0');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Capacity must be > 0"
    expect(await screen.findByTestId('error-capacity')).toHaveTextContent('Capacity must be > 0');
  });

  /**
   * TC-AIR-VAL-009: Create Plane - Decimal Capacity
   * Business Requirement: Val
   * 
   * Steps:
   * Enter decimal.
   * 
   * Test Data: Cap: 150.5
   * 
   * Expected Result:
   * Error "Must be integer".
   */
  it('TC-AIR-VAL-009: should show error when capacity is decimal', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter decimal
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, '150.5');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Must be integer"
    expect(await screen.findByTestId('error-capacity')).toHaveTextContent('Must be integer');
  });

  /**
   * TC-AIR-VAL-010: Create Plane - Text in Capacity
   * Business Requirement: Val
   * 
   * Steps:
   * Enter text.
   * 
   * Test Data: Cap: "Two hundred"
   * 
   * Expected Result:
   * Error "Numeric only".
   */
  it('TC-AIR-VAL-010: should show error when capacity contains text', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter text
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, 'Two hundred');
    await user.tab();

    // Assert - Test Case Expected Result: Error "Numeric only"
    expect(await screen.findByTestId('error-capacity')).toHaveTextContent('Numeric only');
  });

  /**
   * TC-AIR-VAL-011: Create Plane - Huge Capacity
   * Business Requirement: Bound
   * 
   * Steps:
   * Enter realistic max.
   * 
   * Test Data: Cap: 850 (A380)
   * 
   * Expected Result:
   * Accepted.
   */
  it('TC-AIR-VAL-011: should accept realistic huge capacity like A380', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter realistic max (A380 capacity ~850)
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, '850');
    await user.tab();

    // Assert - Test Case Expected Result: Accepted (no error)
    expect(screen.queryByTestId('error-capacity')).not.toBeInTheDocument();
    
    // Verify no warning either (850 is under 1000 threshold)
    expect(screen.queryByTestId('warning-capacity')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-VAL-012: Create Plane - Over Max Capacity
   * Business Requirement: Edge
   * 
   * Steps:
   * Enter unrealistic.
   * 
   * Test Data: Cap: 10000
   * 
   * Expected Result:
   * Warning "Verify capacity".
   */
  it('TC-AIR-VAL-012: should show warning when capacity is unrealistically high', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Enter unrealistic capacity
    const capacityInput = screen.getByTestId('input-capacity');
    await user.type(capacityInput, '10000');
    await user.tab();

    // Assert - Test Case Expected Result: Warning "Verify capacity"
    expect(await screen.findByTestId('warning-capacity')).toHaveTextContent('Verify capacity');
    
    // Should not have an error (it's valid, just a warning)
    expect(screen.queryByTestId('error-capacity')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-VAL-013: Create Plane - Airline Empty
   * Business Requirement: BR34
   * 
   * Steps:
   * Leave Airline empty.
   * 
   * Test Data: Airline: ""
   * 
   * Expected Result:
   * Error "MSG 1: Field Mandatory".
   */
  it('TC-AIR-VAL-013: should show mandatory error when airline is empty', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Leave Airline empty and blur
    const airlineSelect = screen.getByTestId('select-airline');
    await user.click(airlineSelect);
    await user.tab();

    // Assert - Test Case Expected Result: Error "MSG 1: Field Mandatory"
    expect(await screen.findByTestId('error-airline')).toHaveTextContent('MSG 1: Field Mandatory');
  });

  /**
   * TC-AIR-VAL-014: Create Plane - Airline Selection
   * Business Requirement: UI
   * 
   * Steps:
   * Select from Dropdown.
   * 
   * Test Data: Airline: "Vietnam Airlines"
   * 
   * Expected Result:
   * Accepted.
   */
  it('TC-AIR-VAL-014: should accept airline selection from dropdown', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CreateAirplaneForm />);

    // Act - Select from Dropdown
    const airlineSelect = screen.getByTestId('select-airline');
    await user.selectOptions(airlineSelect, 'Vietnam Airlines');

    // Assert - Test Case Expected Result: Accepted
    expect(airlineSelect).toHaveValue('Vietnam Airlines');
    
    // Blur to trigger validation
    await user.tab();
    
    // Should not have error
    expect(screen.queryByTestId('error-airline')).not.toBeInTheDocument();
  });

  /**
   * TC-AIR-VAL-015: Create Plane - Status Default
   * Business Requirement: Biz
   * 
   * Steps:
   * Check Status on create.
   * 
   * Test Data: Default
   * 
   * Expected Result:
   * Status should be "Active".
   */
  it('TC-AIR-VAL-015: should have default status as Active', () => {
    // Arrange & Act
    render(<CreateAirplaneForm />);

    // Assert - Test Case Expected Result: Status should be "Active"
    const statusInput = screen.getByTestId('input-status');
    expect(statusInput).toHaveValue('Active');
    
    // Verify it's read-only/disabled
    expect(statusInput).toBeDisabled();
  });
});
