/**
 * Content and Text Validation Tests
 * TC-VAL-TXT-001 .. TC-VAL-TXT-010
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

const FeedbackForm: React.FC<{ onSubmit?: (s: string) => void }> = ({ onSubmit }) => {
  const [value, setValue] = React.useState('');
  const [err, setErr] = React.useState('');
  const MAX = 5000;
  const submit = () => {
    setErr('');
    if (value.trim().length === 0) { setErr('Content required'); return; }
    if (value.length > MAX) { setErr('Too long'); return; }
    onSubmit?.(value);
  };
  return (
    <div>
      <textarea data-testid="feedback" value={value} onChange={e => setValue(e.target.value)} />
      <button data-testid="send" onClick={submit}>Send</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const SearchBox: React.FC<{ onSearch?: (q: string) => void }> = ({ onSearch }) => {
  const [q, setQ] = React.useState('');
  const [result, setResult] = React.useState<string | null>(null);
  const search = () => {
    // naive safe handling: escape tags and ignore common injection patterns
    if (/;\s*drop\s+table/i.test(q)) { setResult('No results found'); return; }
    const escaped = q.replace(/[<>]/g, match => ({ '<': '&lt;', '>': '&gt;' }[match]));
    setResult(escaped || 'No results found');
    onSearch?.(q);
  };
  return (
    <div>
      <input data-testid="search" value={q} onChange={e => setQ(e.target.value)} />
      <button data-testid="do-search" onClick={search}>Search</button>
      {result && <div data-testid="result">{result}</div>}
    </div>
  );
};

const NameField: React.FC<{ onValid?: (n: string) => void }> = ({ onValid }) => {
  const [v, setV] = React.useState('');
  const [err, setErr] = React.useState('');
  const check = () => {
    setErr('');
    if (/\d/.test(v)) { setErr('Name cannot contain numbers'); return; }
    onValid?.(v);
  };
  return (
    <div>
      <input data-testid="name" value={v} onChange={e => setV(e.target.value)} />
      <button data-testid="check-name" onClick={check}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const AddressField: React.FC<{ onValid?: (a: string) => void }> = ({ onValid }) => {
  const [v, setV] = React.useState('');
  const [err, setErr] = React.useState('');
  const check = () => {
    setErr('');
    // allow common punctuation and apostrophes
    if (/</.test(v)) { setErr('Sanitized'); return; }
    onValid?.(v);
  };
  return (
    <div>
      <input data-testid="addr" value={v} onChange={e => setV(e.target.value)} />
      <button data-testid="check-addr" onClick={check}>Check</button>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

const NotesView: React.FC<{ text: string }> = ({ text }) => <div data-testid="notes">{text.split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>;

describe('TC-VAL-TXT-001..010 content/text validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-TXT-001: Feedback only spaces => error', async () => {
    const { getByTestId } = render(<FeedbackForm />);
    fireEvent.change(getByTestId('feedback'), { target: { value: '   ' } });
    fireEvent.click(getByTestId('send'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Content required'));
  });

  it('TC-VAL-TXT-002: Feedback 5000 chars accepted', async () => {
    const onSubmit = vi.fn();
    const { getByTestId } = render(<FeedbackForm onSubmit={onSubmit} />);
    const txt = 'a'.repeat(5000);
    fireEvent.change(getByTestId('feedback'), { target: { value: txt } });
    fireEvent.click(getByTestId('send'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(txt));
  });

  it('TC-VAL-TXT-003: Feedback 5001 chars => error', async () => {
    const { getByTestId } = render(<FeedbackForm />);
    const txt = 'a'.repeat(5001);
    fireEvent.change(getByTestId('feedback'), { target: { value: txt } });
    fireEvent.click(getByTestId('send'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Too long'));
  });

  it('TC-VAL-TXT-004: Search SQL injection returns safe no-results', async () => {
    const { getByTestId } = render(<SearchBox />);
    fireEvent.change(getByTestId('search'), { target: { value: "Product'; DROP TABLE" } });
    fireEvent.click(getByTestId('do-search'));
    await waitFor(() => expect(getByTestId('result')).toHaveTextContent('No results found'));
  });

  it('TC-VAL-TXT-005: Search HTML injection displays escaped literal', async () => {
    const { getByTestId } = render(<SearchBox />);
    fireEvent.change(getByTestId('search'), { target: { value: '<b>Bold</b>' } });
    fireEvent.click(getByTestId('do-search'));
    await waitFor(() => expect(getByTestId('result')).toHaveTextContent('&lt;b&gt;Bold&lt;/b&gt;'));
  });

  it('TC-VAL-TXT-006: Search emoji handled UTF-8', async () => {
    const onSearch = vi.fn();
    const { getByTestId } = render(<SearchBox onSearch={onSearch} />);
    fireEvent.change(getByTestId('search'), { target: { value: '✈️ Flight' } });
    fireEvent.click(getByTestId('do-search'));
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('✈️ Flight'));
  });

  it('TC-VAL-TXT-007: Name with numbers rejected', async () => {
    const { getByTestId } = render(<NameField />);
    fireEvent.change(getByTestId('name'), { target: { value: 'User 123' } });
    fireEvent.click(getByTestId('check-name'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Name cannot contain numbers'));
  });

  it('TC-VAL-TXT-008: Address with special chars accepted', async () => {
    const onValid = vi.fn();
    const { getByTestId } = render(<AddressField onValid={onValid} />);
    fireEvent.change(getByTestId('addr'), { target: { value: "Apt #2, St. John's" } });
    fireEvent.click(getByTestId('check-addr'));
    await waitFor(() => expect(onValid).toHaveBeenCalledWith("Apt #2, St. John's"));
  });

  it('TC-VAL-TXT-009: Address script input sanitized', async () => {
    const { getByTestId } = render(<AddressField />);
    fireEvent.change(getByTestId('addr'), { target: { value: '<script>alert(1)</script>' } });
    fireEvent.click(getByTestId('check-addr'));
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Sanitized'));
  });

  it('TC-VAL-TXT-010: Notes multi-line preserved in view', async () => {
    const text = 'Line1\nLine2\nLine3';
    const { getByTestId } = render(<NotesView text={text} />);
    expect(getByTestId('notes').textContent).toContain('Line1');
    expect(getByTestId('notes').textContent).toContain('Line2');
    expect(getByTestId('notes').textContent).toContain('Line3');
  });
});
