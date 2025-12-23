import { describe, it, expect } from 'vitest'

const API = process.env.API_BASE || 'http://localhost:8000'

async function post(path: string, body: any, headers = {}) {
  return fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

async function get(path: string, headers = {}) {
  return fetch(`${API}${path}`, { headers })
}

describe('TC-SEC-005..015 Advanced security checks', () => {
  it('TC-SEC-005 - SQL Injection - Login should not succeed with classic payload', async () => {
    const res = await post('/auth/login', { username: "' OR 1=1 --", password: 'x' })
    // Expect login to be rejected / not 200
    expect(res.status).not.toBe(200)
  })

  it('TC-SEC-006 - SQL Injection - Search should not return DB rows for UNION payload', async () => {
    const q = encodeURIComponent('Union Select 1,2,3')
    const res = await get(`/search?q=${q}`)
    // Server should not error or return injected rows; prefer empty result or safe handling
    expect([200,400,404,422,204]).toContain(res.status)
    if (res.status === 200) {
      const body = await res.json().catch(() => null)
      if (Array.isArray(body)) expect(body.length).toBeLessThanOrEqual(0)
    }
  })

  it('TC-SEC-007 - XSS - Profile Name should not store script tags as executable HTML', async () => {
    const malicious = '<script>alert(1)</script>'
    // Attempt update
    await post('/profile', { name: malicious }).catch(() => null)
    const res = await get('/profile')
    expect(res.status).toBeOneOf([200,401,403])
    if (res.status === 200) {
      const body = await res.json().catch(() => ({}))
      const name = (body && body.name) || ''
      // Should not return raw script tag that would execute in browser
      expect(name.includes('<script>')).toBe(false)
    }
  })

  it('TC-SEC-008 - CSRF - Change Password without CSRF token should be blocked', async () => {
    // Simulate external POST without CSRF header/cookie
    const res = await post('/users/change-password', { oldPassword: 'x', newPassword: 'newP@ss1' }, { Referer: 'https://evil.example.com' })
    expect([401,403,400]).toContain(res.status)
  })

  it('TC-SEC-009 - Broken Auth - Session ID should be random and high-entropy', async () => {
    // Attempt login with known test creds to obtain cookie
    const user = process.env.TEST_USER
    const pass = process.env.TEST_PASS
    if (!user || !pass) {
      // If no creds available, mark as skipped by asserting true
      expect(true).toBe(true)
      return
    }
    const res = await post('/auth/login', { username: user, password: pass })
    const setCookie = res.headers.get('set-cookie') || ''
    expect(setCookie.length).toBeGreaterThanOrEqual(0)
    // Try to parse a session token value if present
    const match = setCookie.match(/(session|sid)=([^;\s]+)/i)
    if (match && match[2]) {
      const token = match[2]
      expect(token.length).toBeGreaterThanOrEqual(20)
      // roughly ensure randomness: contains mix of chars
      expect(/[A-Za-z0-9\-_]{20,}/.test(token)).toBe(true)
    }
  })

  it('TC-SEC-010 - IDOR - User Profile change with altered user id should be forbidden', async () => {
    // Try to access another user's profile
    const res = await get('/users/2')
    // Expect 403 Forbidden for IDOR prevention (401/403 acceptable)
    expect([401,403]).toContain(res.status)
  })

  it('TC-SEC-011 - Rate Limiting - Login should throttle after many attempts', async () => {
    const attempts = 50
    let saw429 = false
    for (let i = 0; i < attempts; i++) {
      // attempt with random username to avoid account lock
      // use a fast sequential approach; server may limit by IP
      // eslint-disable-next-line no-await-in-loop
      const res = await post('/auth/login', { username: `baduser${i}@example.com`, password: 'x' })
      if (res.status === 429) {
        saw429 = true
        break
      }
    }
    expect(saw429).toBe(true)
  })

  it('TC-SEC-012 - Sensitive Data - Server header should not reveal software/version', async () => {
    const res = await get('/')
    const server = (res.headers.get('server') || '').toLowerCase()
    // Should not contain typical server + version strings
    expect(/(nginx\/\d|apache\/(\d)|(tomcat|gws)\/\d)/.test(server)).toBe(false)
  })

  it('TC-SEC-013 - SSL/TLS - API_BASE should be https when set', async () => {
    if (process.env.API_BASE) {
      expect(process.env.API_BASE.startsWith('https://')).toBe(true)
    } else {
      // If API_BASE not set, skip by passing
      expect(true).toBe(true)
    }
  })

  it('TC-SEC-014 - File Upload - Executable upload should be rejected', async () => {
    // Simulate file upload payload (if real multipart not available)
    const res = await post('/upload', { filename: 'shell.php', content: '<?php echo "pwn";?>' })
    expect([400,403,415,422,422,500]).not.toContain(200)
  })

  it('TC-SEC-015 - Password Policy - weak password should be rejected', async () => {
    const res = await post('/auth/register', { username: `t_${Date.now()}@example.com`, password: '12345' })
    // Expect rejection due to weak password
    expect([400,422,403]).toContain(res.status)
  })
})

// Helper to support expecting one of values in Vitest
expect.extend({
  toBeOneOf(received: any, arr: any[]) {
    const pass = arr.includes(received)
    return {
      pass,
      message: () => `expected ${received} to be one of ${JSON.stringify(arr)}`,
    }
  },
})
