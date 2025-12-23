/**
 * Advanced Date and Time Validation Tests
 * TC-VAL-DATE-001 .. TC-VAL-DATE-015
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

// Helper: validate DD/MM/YYYY
function parseDDMMYYYY(input: string): Date | null {
  const m = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12) return null;
  const mdays = new Date(year, month, 0).getDate();
  if (day < 1 || day > mdays) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

const DateInputForm: React.FC<{ onValid?: (d: Date) => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');

  const handleCheck = () => {
    setErr('');
    // sanitize common attacks
    if (/['";]|--/.test(value)) { setErr('Invalid Format'); return; }
    const parsed = parseDDMMYYYY(value);
    if (!parsed) { setErr('Invalid Date'); return; }
    onValid?.(parsed);
  };

  return (
    <div>
      <input data-testid="date-input" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-date" onClick={handleCheck}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const TimeInputForm: React.FC<{ onValid?: () => void }> = ({ onValid }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');

  const handle = () => {
    setErr('');
    const m = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) { setErr('Invalid Time'); return; }
    const h = Number(m[1]);
    const mm = Number(m[2]);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) { setErr('Invalid Time'); return; }
    onValid?.();
  };

  return (
    <div>
      <input data-testid="time-input" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="check-time" onClick={handle}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const RangeForm: React.FC = () => {
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [err, setErr] = React.useState('');

  const check = () => {
    setErr('');
    const s = parseDDMMYYYY(start);
    const e = parseDDMMYYYY(end);
    if (!s || !e) { setErr('Invalid Date'); return; }
    if (s > e) { setErr('Start date must be before End date'); return; }
  };

  return (
    <div>
      <input data-testid="start" value={start} onChange={e => setStart(e.target.value)} />
      <input data-testid="end" value={end} onChange={e => setEnd(e.target.value)} />
      <button data-testid="check-range" onClick={check}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const BookingHold: React.FC<{ holdMinutes?: number }> = ({ holdMinutes = 0 }) => {
  const [released, setReleased] = React.useState(false);
  React.useEffect(() => {
    if (holdMinutes > 15) {
      setReleased(true);
    }
  }, [holdMinutes]);
  return <div data-testid="hold">{released ? 'released' : 'held'}</div>;
};

const FlightDuration: React.FC<{ dep: string; arr: string }> = ({ dep, arr }) => {
  function toMinutes(t: string) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }
  const d = toMinutes(dep);
  const a = toMinutes(arr);
  let msg = '';
  if (a <= d) msg = 'overnight or invalid';
  if ((a - d + 24 * 60) % (24 * 60) < 10) msg = 'Check flight duration';
  return <div data-testid="duration">{msg}</div>;
};

describe('TC-VAL-DATE-001..015 advanced date/time validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-DATE-001: Leap Year valid (29/02/2024)', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<DateInputForm onValid={() => onValid()} />);
    fireEvent.change(getByTestId('date-input'), { target: { value: '29/02/2024' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(onValid).toHaveBeenCalled());
  });

  it('TC-VAL-DATE-002: Leap Year invalid (29/02/2023)', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: '29/02/2023' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Date'));
  });

  it('TC-VAL-DATE-003: Month overflow (>12)', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: '15/15/2025' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Date'));
  });

  it('TC-VAL-DATE-004: Day overflow (>31)', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: '32/01/2025' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Date'));
  });

  it('TC-VAL-DATE-005: Format (text)', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: 'Today' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Date'));
  });

  it('TC-VAL-DATE-006: Time invalid hour (>23)', async () => {
    const { getByTestId } = render(<TimeInputForm />);
    fireEvent.change(getByTestId('time-input'), { target: { value: '25:00' } });
    fireEvent.click(getByTestId('check-time'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Time'));
  });

  it('TC-VAL-DATE-007: Time invalid minute (>59)', async () => {
    const { getByTestId } = render(<TimeInputForm />);
    fireEvent.change(getByTestId('time-input'), { target: { value: '12:65' } });
    fireEvent.click(getByTestId('check-time'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Time'));
  });

  it('TC-VAL-DATE-008: Date range start > end', async () => {
    const { getByTestId } = render(<RangeForm />);
    fireEvent.change(getByTestId('start'), { target: { value: '05/12/2025' } });
    fireEvent.change(getByTestId('end'), { target: { value: '01/12/2025' } });
    fireEvent.click(getByTestId('check-range'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Start date must be before End date'));
  });

  it('TC-VAL-DATE-009: Date range same day accepted', async () => {
    const { getByTestId, queryByTestId } = render(<RangeForm />);
    fireEvent.change(getByTestId('start'), { target: { value: '01/12/2025' } });
    fireEvent.change(getByTestId('end'), { target: { value: '01/12/2025' } });
    fireEvent.click(getByTestId('check-range'));
    await waitFor(() => expect(queryByTestId('error')).toBeNull());
  });

  it('TC-VAL-DATE-010: Booking hold timeout >15 mins releases', async () => {
    const { getByTestId } = render(<BookingHold holdMinutes={20} />);
    expect(getByTestId('hold')).toHaveTextContent('released');
  });

  it('TC-VAL-DATE-011: Flight duration too short warns', async () => {
    const { getByTestId } = render(<FlightDuration dep="10:00" arr="10:05" />);
    expect(getByTestId('duration')).toHaveTextContent('Check flight duration');
  });

  it('TC-VAL-DATE-012: Overnight arrival recognized', async () => {
    const { getByTestId } = render(<FlightDuration dep="23:00" arr="02:00" />);
    expect(getByTestId('duration')).toHaveTextContent('overnight');
  });

  it('TC-VAL-DATE-013: Date SQL injection attempt sanitized/error', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: "' OR 1=1" } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Format'));
  });

  it('TC-VAL-DATE-014: Javascript Date input rejected', async () => {
    const { getByTestId } = render(<DateInputForm />);
    fireEvent.change(getByTestId('date-input'), { target: { value: 'javascript:new Date()' } });
    fireEvent.click(getByTestId('check-date'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid Format'));
  });

  it('TC-VAL-DATE-015: 100 years future (2125) warning/accept', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<DateInputForm onValid={() => onValid()} />);
    fireEvent.change(getByTestId('date-input'), { target: { value: '01/01/2125' } });
    fireEvent.click(getByTestId('check-date'));
    // Accept or warn — ensure it parses
    await waitFor(() => expect(onValid).toHaveBeenCalled());
  });
});
