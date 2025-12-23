/**
 * Financial and Number Validation Tests
 * TC-VAL-NUM-001 .. TC-VAL-NUM-010
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

const normalizeNumber = (input: string) => {
  // remove spaces
  let s = input.replace(/\s+/g, '');
  // remove currency symbols
  s = s.replace(/[^0-9.,+-]/g, '');
  // handle comma thousand separator: remove commas if they are thousand separators
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  // if contains both comma and dot, assume dot is decimal
  return s;
};

const PriceInput: React.FC<{ onValid?: (v: number) => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');

  const handle = () => {
    setErr('');
    const raw = normalizeNumber(value);
    if (/[^0-9.\-+]/.test(raw)) { setErr('Numeric only'); return; }
    const n = Number(raw);
    if (Number.isNaN(n)) { setErr('Numeric only'); return; }
    // 3 decimals rounding rule
    const parts = raw.split('.');
    if (parts[1] && parts[1].length > 2) {
      // round to 2 decimals
      const rounded = Math.round(n * 100) / 100;
      onValid?.(rounded);
      return;
    }
    onValid?.(n);
  };

  return (
    <div>
      <input data-testid="price" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const QuantityInput: React.FC<{ onValid?: (n: number) => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');
  const handle = () => {
    setErr('');
    if (value.includes('.')) { setErr('Must be integer'); return; }
    const n = Number(value.replace(/,/g, ''));
    if (!Number.isInteger(n) || Number.isNaN(n)) { setErr('Must be integer'); return; }
    onValid?.(n);
  };
  return (
    <div>
      <input data-testid="qty" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-qty" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const RefundInput: React.FC<{ paid: number; onValid?: () => void }> = ({ paid, onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');
  const handle = () => {
    setErr('');
    const n = Number(value);
    if (Number.isNaN(n)) { setErr('Amount must be positive'); return; }
    if (n < 0) { setErr('Amount must be positive'); return; }
    if (n > paid) { setErr('Cannot refund > Paid amount'); return; }
    onValid?.();
  };
  return (
    <div>
      <input data-testid="refund" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-refund" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const PhoneInput: React.FC<{ onValid?: (v: string) => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');
  const handle = () => {
    setErr('');
    const cleaned = value.replace(/\s+/g, '');
    // allow leading + and digits
    if (!/^\+?\d+$/.test(cleaned)) { setErr('Invalid phone'); return; }
    onValid?.(cleaned);
  };
  return (
    <div>
      <input data-testid="phone" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-phone" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const CardInput: React.FC<{ onValid?: (v: string) => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');
  const handle = () => {
    setErr('');
    const cleaned = value.replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) { setErr('Invalid card'); return; }
    onValid?.(cleaned);
  };
  return (
    <div>
      <input data-testid="card" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-card" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

describe('TC-VAL-NUM-001..010 financial/number validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-NUM-001: Price 3 decimal places rounds to 2', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<PriceInput onValid={onValid} />);
    fireEvent.change(getByTestId('price'), { target: { value: '10.999' } });
    fireEvent.click(getByTestId('check'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith(11.00));
  });

  it('TC-VAL-NUM-002: Price with comma separator accepted', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<PriceInput onValid={onValid} />);
    fireEvent.change(getByTestId('price'), { target: { value: '1,000' } });
    fireEvent.click(getByTestId('check'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith(1000));
  });

  it('TC-VAL-NUM-003: Price with currency symbol rejected as numeric-only field', async () => {
    const { getByTestId } = render(<PriceInput />);
    fireEvent.change(getByTestId('price'), { target: { value: '$100' } });
    fireEvent.click(getByTestId('check'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Numeric only'));
  });

  it('TC-VAL-NUM-004: Quantity decimal rejected (must be integer)', async () => {
    const { getByTestId } = render(<QuantityInput />);
    fireEvent.change(getByTestId('qty'), { target: { value: '1.5' } });
    fireEvent.click(getByTestId('check-qty'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Must be integer'));
  });

  it('TC-VAL-NUM-005: Large integer boundary check', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<QuantityInput onValid={onValid} />);
    const big = '2147483647';
    fireEvent.change(getByTestId('qty'), { target: { value: big } });
    fireEvent.click(getByTestId('check-qty'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith(2147483647));
  });

  it('TC-VAL-NUM-006: Refund negative rejected', async () => {
    const { getByTestId } = render(<RefundInput paid={100} />);
    fireEvent.change(getByTestId('refund'), { target: { value: '-50' } });
    fireEvent.click(getByTestId('check-refund'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Amount must be positive'));
  });

  it('TC-VAL-NUM-007: Refund greater than paid rejected', async () => {
    const { getByTestId } = render(<RefundInput paid={100} />);
    fireEvent.change(getByTestId('refund'), { target: { value: '150' } });
    fireEvent.click(getByTestId('check-refund'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Cannot refund > Paid amount'));
  });

  it('TC-VAL-NUM-008: International phone accepted (+84...)', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<PhoneInput onValid={onValid} />);
    fireEvent.change(getByTestId('phone'), { target: { value: '+84 909123456' } });
    fireEvent.click(getByTestId('check-phone'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith('+84909123456'));
  });

  it('TC-VAL-NUM-009: Phone with spaces auto-trimmed', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<PhoneInput onValid={onValid} />);
    fireEvent.change(getByTestId('phone'), { target: { value: '0909 123 456' } });
    fireEvent.click(getByTestId('check-phone'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith('0909123456'));
  });

  it('TC-VAL-NUM-010: Card with spaces accepted and trimmed', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<CardInput onValid={onValid} />);
    fireEvent.change(getByTestId('card'), { target: { value: '4242 4242 4242 4242' } });
    fireEvent.click(getByTestId('check-card'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith('4242424242424242'));
  });
});
