import { test, expect } from 'vitest'

const BASE = process.env.API_BASE || 'http://localhost:8000'
const TEST_USER_A = process.env.TEST_USER_A || 'usera@example.com'
const TEST_PASS_A = process.env.TEST_PASS_A || 'passwordA'
const TEST_USER_B = process.env.TEST_USER_B || 'userb@example.com'
const TEST_PASS_B = process.env.TEST_PASS_B || 'passwordB'

function ensureFetch() {
  if (typeof fetch === 'undefined') {
    throw new Error('global fetch is not available. Run tests with Node >=18 or install a fetch polyfill.')
  }
}

async function login(user = TEST_USER_A, pass = TEST_PASS_A) {
  ensureFetch()
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user, password: pass }),
  })
  return res
}

async function getWithToken(path: string, token: string) {
  ensureFetch()
  return fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
}

test('TC-SEC-IDOR-001: Verify IDOR - View other user booking (should be denied)', async () => {
  // login as User A
  const rA = await login(TEST_USER_A, TEST_PASS_A)
  const bodyA = await rA.json().catch(() => ({}))
  const tokenA = bodyA.access_token || bodyA.token
  expect(tokenA).toBeTruthy()

  // attempt to view booking id 200 (belongs to User B in precondition)
  const res = await getWithToken('/api/bookings/200', tokenA)
  // server should not return other's booking - 403 or 404 expected
  expect([403, 404]).toContain(res.status)
})

test('TC-SEC-PRIV-001: Verify Privilege Escalation - role change ignored by server', async () => {
  const r = await login()
  const token = (await r.json()).access_token
  expect(token).toBeTruthy()

  // attempt to escalate via profile update (client-sent role)
  const patch = await fetch(`${BASE}/api/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role: 'admin' }),
  })
  // server should either ignore or reject the change
  expect(patch.status).toBeGreaterThanOrEqual(200)
  // fetch profile to confirm role unchanged
  const profileRes = await getWithToken('/api/users/me', token)
  const profile = await profileRes.json().catch(() => ({}))
  const role = profile.role || 'traveler'
  expect(role).not.toBe('admin')
})

test('TC-SEC-SESS-001: Verify Session Fixation - new token created on re-login', async () => {
  const r1 = await login()
  const t1 = (await r1.json()).access_token
  expect(t1).toBeTruthy()

  // logout if endpoint exists (best-effort)
  try { await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${t1}` } }) } catch (e) {}

  const r2 = await login()
  const t2 = (await r2.json()).access_token
  expect(t2).toBeTruthy()
  // tokens should differ (if server rotates tokens)
  expect(t2).not.toBe(t1)
})

test('TC-SEC-DATA-001: Verify Sensitive Data Exposure - profile should not contain password/hash', async () => {
  const r = await login()
  const token = (await r.json()).access_token
  expect(token).toBeTruthy()
  const res = await getWithToken('/api/profile', token)
  // allow 200 or 403 depending on implementation
  if (res.status === 200) {
    const body = await res.json().catch(() => ({}))
    const keys = Object.keys(body || {})
    // must not expose password or hash
    expect(keys.some(k => /password|hash|pwd/i.test(k))).toBe(false)
  } else {
    expect([403, 401]).toContain(res.status)
  }
})
