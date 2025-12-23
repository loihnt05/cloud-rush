import { test, expect } from 'vitest'

const BASE = process.env.API_BASE || 'http://localhost:8000'
const TEST_USER = process.env.TEST_USER || 'test@example.com'
const TEST_PASS = process.env.TEST_PASS || 'password'

function ensureFetch() {
  if (typeof fetch === 'undefined') {
    throw new Error('global fetch is not available. Run tests with Node >=18 or install a fetch polyfill (node-fetch/undici).')
  }
}

async function login(password = TEST_PASS) {
  ensureFetch()
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_USER, password }),
  })
  return res
}

async function authGet(path: string, token: string) {
  ensureFetch()
  return fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } })
}

test('TC-API-AUTH-001: POST /login - Valid Credentials', async () => {
  const res = await login()
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body).toBeTypeOf('object')
  expect(body.access_token || body.token).toBeTruthy()
})

test('TC-API-AUTH-002: POST /login - Wrong Password', async () => {
  const res = await login('wrong-password')
  expect([401, 400]).toContain(res.status)
  const body = await res.json().catch(() => ({}))
  const err = body.error || body.message || ''
  expect(err.toString().toLowerCase()).toMatch(/invalid|credential/)
})

test('TC-API-FLT-001: GET /flights - Retrieve List', async () => {
  const loginRes = await login()
  const token = (await loginRes.json()).access_token
  expect(token).toBeTruthy()
  const res = await authGet('/api/flights', token)
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(Array.isArray(body)).toBe(true)
})

test('TC-API-BOOK-001: POST /bookings - Create Booking', async () => {
  const loginRes = await login()
  const token = (await loginRes.json()).access_token
  expect(token).toBeTruthy()

  // try to fetch a flight id first
  const flightsRes = await authGet('/api/flights', token)
  expect(flightsRes.status).toBe(200)
  const flights = await flightsRes.json()
  const flightId = flights && flights[0] && flights[0].id ? flights[0].id : 1

  const res = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ flight_id: flightId, passengers: [{ name: 'Test User', age: 30 }] }),
  })
  expect([201, 200]).toContain(res.status)
  const body = await res.json().catch(() => ({}))
  expect(body.booking_id || body.id).toBeTruthy()
})

test('TC-API-BOOK-002: POST /bookings - SQL Injection in ID', async () => {
  const loginRes = await login()
  const token = (await loginRes.json()).access_token
  expect(token).toBeTruthy()

  const payload: any = { flight_id: "1 OR 1=1", passengers: [{ name: 'Inj', age: 25 }] }
  const res = await fetch(`${BASE}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  // server should not accept this as a normal success; expect client/server validation or handled error
  expect(res.status).not.toBe(200)
  expect(res.status).toBeGreaterThanOrEqual(400)
  const body = await res.text().catch(() => '')
  // ensure no obvious sensitive leakage
  expect(body.toLowerCase()).not.toContain('password')
})

test('TC-API-REV-001: GET /revenue - Unauthorized Access', async () => {
  const loginRes = await login()
  const token = (await loginRes.json()).access_token
  expect(token).toBeTruthy()
  const res = await authGet('/api/admin/revenue', token)
  expect([403, 401]).toContain(res.status)
  const body = await res.json().catch(() => ({}))
  const msg = body.message || body.error || ''
  expect(msg.toString().toLowerCase()).toMatch(/access|deny|forbidden/)
})
