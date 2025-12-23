/**
 * Test Suite: Passenger Information Validation
 * TC-VAL-PAX-001 .. TC-VAL-PAX-012
 * Vitest + React Testing Library
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';

interface Pax {
  name: string;
  phone: string;
  age: number;
  passport: string;
}

const PassengerForm: React.FC<{ existingPassports?: string[]; onNext?: (p: Pax) => void }> = ({ existingPassports = [], onNext }) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [age, setAge] = React.useState('');
  const [passport, setPassport] = React.useState('');
  const [error, setError] = React.useState('');

  const validate = (): boolean => {
    setError('');
    if (!name.trim()) { setError('MSG 1: This field is mandatory'); return false; }
    if (/\d/.test(name)) { setError('Name should not contain numbers'); return false; }
    if (/[^a-zA-Z\s\-']/.test(name)) { setError('Name contains invalid characters'); return false; }

    if (!phone.trim()) { setError('MSG 1: This field is mandatory'); return false; }
    if (/[^0-9]/.test(phone)) { setError('Phone must contain only numbers'); return false; }
    if (phone.length < 9 || phone.length > 12) { setError('Phone number invalid length'); return false; }

    if (age === '') { setError('MSG 1: This field is mandatory'); return false; }
    const ageNum = Number(age);
    if (isNaN(ageNum)) { setError('Age must be a number'); return false; }
    if (ageNum < 0) { setError('Age must be positive'); return false; }
    if (ageNum === 0) { /* allow infant logic; accept for now */ }
    if (ageNum > 120) { setError('Please check age'); return false; }

    if (!passport.trim()) { setError('MSG 1: This field is mandatory'); return false; }
    if (existingPassports.includes(passport.trim())) { setError('Duplicate Passport ID in booking'); return false; }

    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext?.({ name: name.trim(), phone: phone.trim(), age: Number(age), passport: passport.trim() });
    }
  };

  return (
    <div data-testid="pax-form">
      <input data-testid="name-input" value={name} onChange={e => setName(e.target.value)} />
      <input data-testid="phone-input" value={phone} onChange={e => setPhone(e.target.value)} />
      <input data-testid="age-input" value={age} onChange={e => setAge(e.target.value)} />
      <input data-testid="passport-input" value={passport} onChange={e => setPassport(e.target.value)} />
      <button data-testid="next-button" onClick={handleNext}>Next</button>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

describe('TC-VAL-PAX-001..012: Passenger validation tests', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-PAX-001: Verify Name - Empty', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 1: This field is mandatory'));
  });

  it('TC-VAL-PAX-002: Verify Name - Numbers in Name', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John 123 Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '30' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P123' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Name should not contain numbers'));
  });

  it('TC-VAL-PAX-003: Verify Name - Special Characters', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John@Doe!' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '30' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P124' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Name contains invalid characters'));
  });

  it('TC-VAL-PAX-004: Verify Phone - Empty', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '25' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P125' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 1: This field is mandatory'));
  });

  it('TC-VAL-PAX-005: Verify Phone - Letters', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0909abc' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '25' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P126' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Phone must contain only numbers'));
  });

  it('TC-VAL-PAX-006: Verify Phone - Short (<9 digits)', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '12345' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '25' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P127' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Phone number invalid length'));
  });

  it('TC-VAL-PAX-007: Verify Phone - Long (>12 digits)', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '12345678901234' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '25' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P128' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Phone number invalid length'));
  });

  it('TC-VAL-PAX-008: Verify Age - Negative', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '-5' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P129' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Age must be positive'));
  });

  it('TC-VAL-PAX-009: Verify Age - Zero', async () => {
    const onNext = vi.fn();
    const { getByTestId } = render(<PassengerForm onNext={onNext} />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Baby Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '0' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P130' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(onNext).toHaveBeenCalled());
  });

  it('TC-VAL-PAX-010: Verify Age - Too High (150)', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Old One' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '150' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'P131' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Please check age'));
  });

  it('TC-VAL-PAX-011: Verify Passport - Empty', async () => {
    const { getByTestId } = render(<PassengerForm />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '30' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('MSG 1: This field is mandatory'));
  });

  it('TC-VAL-PAX-012: Verify Passport - Duplicate (In Flight)', async () => {
    const existing = ['X123456'];
    const { getByTestId } = render(<PassengerForm existingPassports={existing} />);
    fireEvent.change(getByTestId('name-input'), { target: { value: 'Jane Doe' } });
    fireEvent.change(getByTestId('phone-input'), { target: { value: '0912345678' } });
    fireEvent.change(getByTestId('age-input'), { target: { value: '28' } });
    fireEvent.change(getByTestId('passport-input'), { target: { value: 'X123456' } });
    fireEvent.click(getByTestId('next-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Duplicate Passport ID in booking'));
  });
});
