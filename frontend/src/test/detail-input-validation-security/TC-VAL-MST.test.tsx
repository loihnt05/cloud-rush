/**
 * Master Data Validation tests
 * TC-VAL-MST-001 .. TC-VAL-MST-012
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

type FlightData = {
  price: string;
  date: string;
  depTime: string;
  arrTime: string;
  number: string;
};

const FlightForm: React.FC<{ existingNumbers?: string[]; onCreate?: (f: FlightData) => void }> = ({ existingNumbers = [], onCreate }) => {
  const [price, setPrice] = React.useState('');
  const [date, setDate] = React.useState('');
  const [depTime, setDepTime] = React.useState('');
  const [arrTime, setArrTime] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [error, setError] = React.useState('');

  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(s => Number(s));
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
  };

  const validate = () => {
    setError('');
    // price
    if (price.trim() === '') { setError('Numeric value required'); return false; }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum)) { setError('Numeric value required'); return false; }
    if (priceNum < 0) { setError('Price must be greater than 0'); return false; }
    if (priceNum === 0) { setError('Price cannot be zero'); return false; }

    // date
    const parsed = Date.parse(date);
    if (Number.isNaN(parsed)) { setError('Invalid Date'); return false; }
    const day = new Date(parsed);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (day < today) { setError('Flight date cannot be in the past'); return false; }

    // times
    const d = parseTime(depTime);
    const a = parseTime(arrTime);
    if (Number.isNaN(d) || Number.isNaN(a)) { setError('Invalid time'); return false; }
    if (a <= d) { setError('Arrival must be after Departure'); return false; }

    // number uniqueness
    if (existingNumbers.includes(number.trim())) { setError('Flight Number already exists'); return false; }

    return true;
  };

  const handleCreate = () => {
    if (validate()) onCreate?.({ price, date, depTime, arrTime, number });
  };

  return (
    <div>
      <input data-testid="price-input" value={price} onChange={e => setPrice(e.target.value)} />
      <input data-testid="date-input" value={date} onChange={e => setDate(e.target.value)} />
      <input data-testid="dep-input" value={depTime} onChange={e => setDepTime(e.target.value)} />
      <input data-testid="arr-input" value={arrTime} onChange={e => setArrTime(e.target.value)} />
      <input data-testid="num-input" value={number} onChange={e => setNumber(e.target.value)} />
      <button data-testid="create-button" onClick={handleCreate}>Create</button>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

const AirplaneForm: React.FC<{ onCreate?: (c: { capacity: string; code: string }) => void }> = ({ onCreate }) => {
  const [capacity, setCapacity] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');

  const validate = () => {
    setError('');
    if (capacity.trim() === '') { setError('Airplane must have seats'); return false; }
    const cap = Number(capacity);
    if (Number.isNaN(cap)) { setError('Numeric value required'); return false; }
    if (cap < 0) { setError('Capacity must be positive'); return false; }
    if (cap === 0) { setError('Airplane must have seats'); return false; }
    if (cap > 5000) { setError('Verify capacity'); return false; }

    if (/[^a-zA-Z0-9]/.test(code)) { setError('Code alphanumeric only'); return false; }

    return true;
  };

  const handleCreate = () => {
    if (validate()) onCreate?.({ capacity, code });
  };

  return (
    <div>
      <input data-testid="cap-input" value={capacity} onChange={e => setCapacity(e.target.value)} />
      <input data-testid="code-input" value={code} onChange={e => setCode(e.target.value)} />
      <button data-testid="create-plane" onClick={handleCreate}>Create Plane</button>
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  );
};

describe('TC-VAL-MST-001..012 Master data validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-MST-001: Verify Flight Price - Negative', async () => {
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '-100' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Price must be greater than 0'));
  });

  it('TC-VAL-MST-002: Verify Flight Price - Zero', async () => {
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '0' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Price cannot be zero'));
  });

  it('TC-VAL-MST-003: Verify Flight Price - Decimal accepted', async () => {
    const onCreate = vi.fn();
    const { getByTestId } = render(<FlightForm onCreate={onCreate} />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '100.50' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.change(getByTestId('num-input'), { target: { value: 'VN123' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
  });

  it('TC-VAL-MST-004: Verify Flight Price - Letters', async () => {
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: 'One Hundred' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Numeric value required'));
  });

  it('TC-VAL-MST-005: Verify Capacity - Negative', async () => {
    const { getByTestId } = render(<AirplaneForm />);
    fireEvent.change(getByTestId('cap-input'), { target: { value: '-10' } });
    fireEvent.change(getByTestId('code-input'), { target: { value: 'VN123' } });
    fireEvent.click(getByTestId('create-plane'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Capacity must be positive'));
  });

  it('TC-VAL-MST-006: Verify Capacity - Zero', async () => {
    const { getByTestId } = render(<AirplaneForm />);
    fireEvent.change(getByTestId('cap-input'), { target: { value: '0' } });
    fireEvent.change(getByTestId('code-input'), { target: { value: 'VN124' } });
    fireEvent.click(getByTestId('create-plane'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Airplane must have seats'));
  });

  it('TC-VAL-MST-007: Verify Capacity - Exceed Limit', async () => {
    const { getByTestId } = render(<AirplaneForm />);
    fireEvent.change(getByTestId('cap-input'), { target: { value: '10000' } });
    fireEvent.change(getByTestId('code-input'), { target: { value: 'VN125' } });
    fireEvent.click(getByTestId('create-plane'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Verify capacity'));
  });

  it('TC-VAL-MST-008: Verify Date - Past Date', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '100' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: yesterday } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Flight date cannot be in the past'));
  });

  it('TC-VAL-MST-009: Verify Date - Invalid Format', async () => {
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '100' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '30/02/2025' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Invalid Date'));
  });

  it('TC-VAL-MST-010: Verify Date - Arrival before Departure', async () => {
    const { getByTestId } = render(<FlightForm />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '100' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '12:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '10:00' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Arrival must be after Departure'));
  });

  it('TC-VAL-MST-011: Verify Airline Code - Special Char', async () => {
    const { getByTestId } = render(<AirplaneForm />);
    fireEvent.change(getByTestId('cap-input'), { target: { value: '100' } });
    fireEvent.change(getByTestId('code-input'), { target: { value: 'VN@123' } });
    fireEvent.click(getByTestId('create-plane'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Code alphanumeric only'));
  });

  it('TC-VAL-MST-012: Verify Duplicate Flight Number', async () => {
    const existing = ['VN001'];
    const { getByTestId } = render(<FlightForm existingNumbers={existing} />);
    fireEvent.change(getByTestId('price-input'), { target: { value: '100' } });
    fireEvent.change(getByTestId('date-input'), { target: { value: '2099-12-01' } });
    fireEvent.change(getByTestId('dep-input'), { target: { value: '10:00' } });
    fireEvent.change(getByTestId('arr-input'), { target: { value: '11:00' } });
    fireEvent.change(getByTestId('num-input'), { target: { value: 'VN001' } });
    fireEvent.click(getByTestId('create-button'));
    await waitFor(() => expect(getByTestId('error-message')).toHaveTextContent('Flight Number already exists'));
  });
});
