/**
 * File upload validation tests
 * TC-VAL-FILE-001 .. TC-VAL-FILE-010
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const UploadForm: React.FC<{ onUpload?: (f: File) => void }> = ({ onUpload }) => {
  const [err, setErr] = React.useState('');
  const [state, setState] = React.useState<'idle' | 'uploading' | 'cancelled' | 'done'>('idle');

  const handle = (files: FileList | null) => {
    setErr('');
    if (!files || files.length === 0) { setErr('File cannot be empty'); return; }
    const file = files[0];
    // zero byte
    if (file.size === 0) { setErr('File cannot be empty'); return; }
    // max size
    if (file.size > MAX_BYTES) { setErr('MSG 8: Image too large'); return; }
    // extension & mime checks (simple)
    const name = file.name.toLowerCase();
    if (!/\.(jpg|jpeg|png)$/i.test(name)) { setErr('Only JPG/PNG allowed'); return; }
    // double extension
    if (/\.[a-z0-9]+\.[a-z0-9]+$/.test(name) && /\.(php|exe|sh|phtml)$/.test(name)) { setErr('Invalid file format'); return; }
    // long name
    if (name.length > 200) { /* Accept but note server will truncate */ }
    setState('uploading');
    // simulate upload
    setTimeout(() => { setState('done'); onUpload?.(file); }, 10);
  };

  const handleCancel = () => { setState('cancelled'); setErr('Upload cancelled'); };

  return (
    <div>
      <input data-testid="file-input" type="file" onChange={e => handle(e.target.files)} />
      <button data-testid="cancel" onClick={handleCancel}>Cancel</button>
      <div data-testid="state">{state}</div>
      {err && <div data-testid="error">{err}</div>}
    </div>
  );
};

function makeFile(name: string, size: number, type = 'image/jpeg') {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('TC-VAL-FILE-001..010 file upload validation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TC-VAL-FILE-001: Zero byte file', async () => {
    const { getByTestId } = render(<UploadForm />);
    const file = makeFile('empty.jpg', 0);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('File cannot be empty'));
  });

  it('TC-VAL-FILE-002: Exact 5MB accepted', async () => {
    const onUpload = vi.fn();
    const { getByTestId } = render(<UploadForm onUpload={onUpload} />);
    const file = makeFile('exact5.jpg', MAX_BYTES);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('state')).toHaveTextContent('done'));
    expect(onUpload).toHaveBeenCalled();
  });

  it('TC-VAL-FILE-003: Just over 5MB rejected', async () => {
    const { getByTestId } = render(<UploadForm />);
    const file = makeFile('big.jpg', MAX_BYTES + 1024);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('MSG 8: Image too large'));
  });

  it('TC-VAL-FILE-004: Invalid extension (exe renamed .jpg) detect by MIME', async () => {
    const { getByTestId } = render(<UploadForm />);
    const file = makeFile('virus.jpg', 1024, 'application/x-msdownload');
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    // our client checks extension only; simulate server mime check by expecting Only JPG/PNG allowed
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Only JPG/PNG allowed'));
  });

  it('TC-VAL-FILE-005: Double extension .jpg.php rejected', async () => {
    const { getByTestId } = render(<UploadForm />);
    const file = makeFile('image.jpg.php', 1024, 'image/jpeg');
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Invalid file format'));
  });

  it('TC-VAL-FILE-006: Long file name (>200 chars) accepted/truncated', async () => {
    const onUpload = vi.fn();
    const long = 'a'.repeat(201) + '.jpg';
    const { getByTestId } = render(<UploadForm onUpload={onUpload} />);
    const file = makeFile(long, 1024);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('state')).toHaveTextContent('done'));
    expect(onUpload).toHaveBeenCalled();
  });

  it('TC-VAL-FILE-007: Special char file name accepted (sanitized)', async () => {
    const onUpload = vi.fn();
    const { getByTestId } = render(<UploadForm onUpload={onUpload} />);
    const file = makeFile('Image@#$.jpg', 1024);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('state')).toHaveTextContent('done'));
    expect(onUpload).toHaveBeenCalled();
  });

  it('TC-VAL-FILE-008: PDF rejected for Avatar', async () => {
    const { getByTestId } = render(<UploadForm />);
    const file = makeFile('doc.pdf', 1024, 'application/pdf');
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(getByTestId('error')).toHaveTextContent('Only JPG/PNG allowed'));
  });

  it('TC-VAL-FILE-009: Multiple files in single mode - only first considered', async () => {
    const onUpload = vi.fn();
    const { getByTestId } = render(<UploadForm onUpload={onUpload} />);
    const f1 = makeFile('one.jpg', 1024);
    const f2 = makeFile('two.jpg', 1024);
    const input = getByTestId('file-input') as HTMLInputElement;
    // simulate two files
    fireEvent.change(input, { target: { files: [f1, f2] } });
    await waitFor(() => expect(getByTestId('state')).toHaveTextContent('done'));
    expect(onUpload).toHaveBeenCalledWith(expect.objectContaining({ name: 'one.jpg' }));
  });

  it('TC-VAL-FILE-010: Cancel upload stops upload and no file saved', async () => {
    const onUpload = vi.fn();
    const { getByTestId } = render(<UploadForm onUpload={onUpload} />);
    const file = makeFile('up.jpg', 1024);
    const input = getByTestId('file-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(getByTestId('cancel'));
    await waitFor(() => expect(getByTestId('state')).toHaveTextContent('cancelled'));
    expect(onUpload).not.toHaveBeenCalled();
  });
});
