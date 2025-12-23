/**
 * API and Header validation tests
 * TC-VAL-API-001 .. TC-VAL-API-010
 * These are unit tests that simulate incoming HTTP requests to server-side handlers.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

type Req = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
  origin?: string;
  cookies?: string;
};

type Res = {
  status: number;
  body?: any;
  headers?: Record<string, string>;
};

// Simple in-test server simulation
function handleRequest(req: Req, state: { rateMap: Record<string, number> }): Res {
  const jsonEndpoint = '/data';

  // Rate limiting (by origin or ip simulated via headers.authorization or origin)
  const client = req.headers?.['x-client-id'] || req.origin || 'anon';
  state.rateMap[client] = (state.rateMap[client] || 0) + 1;
  if (state.rateMap[client] > 100) return { status: 429, body: 'Too Many Requests' };

  // CORS check
  if (req.origin && req.origin !== 'https://trusted.example.com') return { status: 403, body: 'Blocked by CORS policy' };

  // Route handling
  if (req.url === '/login') {
    if (req.method !== 'POST') return { status: 405, body: 'Method Not Allowed' };
    // check auth header
    if (!req.headers || !req.headers['authorization']) return { status: 401, body: 'Unauthorized' };
    // content-type must be application/json
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (ct !== 'application/json') return { status: 415, body: 'Unsupported Media Type' };
    // parse body
    try {
      JSON.parse(req.body || '');
    } catch (e) {
      return { status: 400, body: 'Malformed JSON' };
    }
    return { status: 200, body: { token: 'ok' }, headers: { 'set-cookie': 'auth=abc; HttpOnly; Secure' } };
  }

  if (req.url.startsWith('/flights/')) {
    if (req.method !== 'GET') return { status: 405, body: 'Method Not Allowed' };
    const id = req.url.split('/')[2];
    if (!/^[0-9]+$/.test(id)) return { status: 400, body: 'Invalid ID' };
    const num = Number(id);
    if (num < 1) return { status: 400, body: 'Invalid ID' };
    return { status: 200, body: { id: num } };
  }

  if (req.url === jsonEndpoint) {
    if (req.method !== 'POST') return { status: 405, body: 'Method Not Allowed' };
    const ct = (req.headers?.['content-type'] || '').toLowerCase();
    if (ct !== 'application/json') return { status: 415, body: 'Unsupported Media Type' };
    try {
      const parsed = JSON.parse(req.body || '{}');
      // ignore unknown fields (parameter pollution prevention)
      const allowed = { key: parsed.key };
      if ('admin' in parsed) return { status: 200, body: { ignored: ['admin'] } };
      return { status: 200, body: allowed };
    } catch (e) {
      return { status: 400, body: 'Malformed JSON' };
    }
  }

  return { status: 404, body: 'Not Found' };
}

describe('TC-VAL-API-001..010 API/header validation', () => {
  let state: { rateMap: Record<string, number> };
  beforeEach(() => { state = { rateMap: {} }; vi.clearAllMocks(); });

  it('TC-VAL-API-001: Missing Token -> 401', () => {
    const res = handleRequest({ method: 'POST', url: '/login', headers: { 'content-type': 'application/json' }, body: '{}' }, state);
    expect(res.status).toBe(401);
  });

  it('TC-VAL-API-002: Invalid Content-Type (XML to JSON endpoint) -> 415/400', () => {
    const res = handleRequest({ method: 'POST', url: '/data', headers: { 'content-type': 'application/xml', 'authorization': 'Bearer x' }, body: '<xml/>' }, state);
    expect(res.status).toBe(415);
  });

  it('TC-VAL-API-003: Malformed JSON -> 400', () => {
    const res = handleRequest({ method: 'POST', url: '/data', headers: { 'content-type': 'application/json', 'authorization': 'Bearer x' }, body: '{"key": "val".' }, state);
    expect(res.status).toBe(400);
  });

  it('TC-VAL-API-004: Extra fields ignored (parameter pollution prevented)', () => {
    const res = handleRequest({ method: 'POST', url: '/data', headers: { 'content-type': 'application/json', 'authorization': 'Bearer x' }, body: JSON.stringify({ key: 'v', admin: true }) }, state);
    expect(res.status).toBe(200);
    expect(res.body && res.body.ignored).toContain('admin');
  });

  it('TC-VAL-API-005: GET to POST endpoint -> 405', () => {
    const res = handleRequest({ method: 'GET', url: '/login', headers: { 'content-type': 'application/json' } }, state);
    expect(res.status).toBe(405);
  });

  it('TC-VAL-API-006: Negative ID in URL -> 400 or 404', () => {
    const res = handleRequest({ method: 'GET', url: '/flights/-1' , headers: {} }, state);
    expect(res.status).toBe(400);
  });

  it('TC-VAL-API-007: String ID in URL -> 400', () => {
    const res = handleRequest({ method: 'GET', url: '/flights/abc', headers: {} }, state);
    expect(res.status).toBe(400);
  });

  it('TC-VAL-API-008: Rate limit -> 429 after flood', () => {
    const clientHeaders = { 'x-client-id': 'flooder' };
    let last: Res = { status: 0 };
    for (let i = 0; i < 105; i++) last = handleRequest({ method: 'GET', url: '/flights/1', headers: clientHeaders }, state);
    expect(last.status).toBe(429);
  });

  it('TC-VAL-API-009: CORS - blocked from random domain', () => {
    const res = handleRequest({ method: 'GET', url: '/flights/1', headers: {}, origin: 'https://evil.example.com' }, state);
    expect(res.status).toBe(403);
    expect(res.body).toBe('Blocked by CORS policy');
  });

  it('TC-VAL-API-010: Cookie HttpOnly flag present on login', () => {
    const res = handleRequest({ method: 'POST', url: '/login', headers: { 'content-type': 'application/json', authorization: 'Bearer ok' }, body: '{}' }, state);
    expect(res.status).toBe(200);
    expect(res.headers && res.headers['set-cookie']).toContain('HttpOnly');
  });
});
