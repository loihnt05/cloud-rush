import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

export let errors = new Rate('errors')

export let options = {
  scenarios: {
    // Simulate 100 concurrent users trying to book the same seat
    booking_concurrent: {
      executor: 'constant-vus',
      vus: 100,
      duration: '15s',
      exec: 'booking',
    },
    // Flight search: ramp requests to validate latency under load
    flight_search: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      stages: [
        { target: 20, duration: '30s' },
        { target: 50, duration: '30s' },
      ],
      exec: 'search',
    },
    // Revenue report generation: single admin job measurement
    revenue_report: {
      executor: 'per-vu-iterations',
      vus: 5,
      iterations: 1,
      maxDuration: '60s',
      exec: 'revenue',
    },
  },
  thresholds: {
    'http_req_duration{scenario:revenue_report}': ['p(95)<5000'],
    'http_req_duration{scenario:search}': ['p(95)<2000'],
    'errors': ['rate<0.05'],
  },
}

const BASE = __ENV.API_BASE || 'http://localhost:8000'
const TEST_USER = __ENV.TEST_USER || 'test@example.com'
const TEST_PASS = __ENV.TEST_PASS || 'password'
const SHARED_FLIGHT = __ENV.SHARED_FLIGHT || '1'
const SHARED_SEAT = __ENV.SHARED_SEAT || '1'

function login() {
  const res = http.post(`${BASE}/api/auth/login`, JSON.stringify({ email: TEST_USER, password: TEST_PASS }), { headers: { 'Content-Type': 'application/json' } })
  if (res.status !== 200) {
    errors.add(1)
    return null
  }
  try { return res.json().access_token } catch (e) { return null }
}

export function booking() {
  const token = login()
  if (!token) {
    errors.add(1)
    return
  }
  const url = `${BASE}/api/bookings`
  const payload = JSON.stringify({ flight_id: SHARED_FLIGHT, seat: SHARED_SEAT, passengers: [{ name: 'LoadUser' }] })
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  const res = http.post(url, payload, { headers })
  const ok = check(res, { 'booking accepted 2xx or handled': (r) => r.status === 201 || r.status === 409 || r.status === 422 })
  if (!ok) errors.add(1)
  sleep(0.1)
}

export function search() {
  // simple search query
  const res = http.get(`${BASE}/api/flights?from=ANY&to=ANY`)
  const ok = check(res, { 'search 200': (r) => r.status === 200 })
  if (!ok) errors.add(1)
  sleep(0.2)
}

export function revenue() {
  // attempt admin revenue endpoint - use TEST_USER as admin if available via env
  const token = login()
  if (!token) { errors.add(1); return }
  const res = http.get(`${BASE}/api/admin/revenue`, { headers: { Authorization: `Bearer ${token}` } })
  // Accept 200 or 403 depending on credentials; measure duration via thresholds
  if (res.status !== 200) errors.add(1)
}
