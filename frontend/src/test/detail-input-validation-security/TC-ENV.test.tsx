import React from 'react'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Minimal helpers and components to express the environment test cases

// Simulated server validator used for JS-disabled scenario
function serverValidate(form: { name?: string; phone?: string }) {
  const errors: Record<string, string> = {}
  if (!form.name || form.name.trim() === '') errors.name = 'Name required'
  if (!form.phone || !/^\d{7,15}$/.test(form.phone.replace(/\D/g, ''))) errors.phone = 'Phone invalid'
  return { ok: Object.keys(errors).length === 0, errors }
}

function NameForm({ onSubmit }: { onSubmit?: (v: any) => void }) {
  const [name, setName] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  function validate(v: string) {
    if (!v.trim()) return 'Name required'
    if (v.length > 100) return 'Name too long'
    return null
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const err = validate(name)
        setError(err)
        onSubmit && onSubmit({ name, clientError: err })
      }}
    >
      <label htmlFor="name">Name</label>
      <input
        id="name"
        data-testid="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData?.getData('text') || ''
          const err = validate(pasted)
          setError(err)
        }}
      />
      {error && <div role="alert">{error}</div>}
      <button type="submit">Submit</button>
    </form>
  )
}

function PhoneForm() {
  return (
    <div>
      <label htmlFor="phone">Phone</label>
      <input id="phone" data-testid="phone" name="phone" type="tel" inputMode="numeric" />
    </div>
  )
}

describe('TC-ENV browser environment checks', () => {
  it('TC-ENV-001: backend validation still catches errors when JS is disabled', () => {
    // Simulate JS disabled by not running client validation and directly calling serverValidate
    const payload = { name: '', phone: 'abc' }
    const result = serverValidate(payload)
    expect(result.ok).toBe(false)
    expect(result.errors).toHaveProperty('name')
    expect(result.errors).toHaveProperty('phone')
  })

  it('TC-ENV-002: validation triggers on paste into Name field', () => {
    render(<NameForm />)
    const input = screen.getByTestId('name') as HTMLInputElement
    // simulate paste of '123' into the name field
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '123',
      },
    } as unknown as DataTransfer)
    // after paste small numeric name should still be validated; our validate treats it as present
    expect(screen.queryByRole('alert')).toBeNull()
    // paste empty string to trigger validation error
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '',
      },
    } as unknown as DataTransfer)
    expect(screen.getByRole('alert').textContent).toMatch(/Name required/)
  })

  it('TC-ENV-003: browser autofill populates fields correctly', () => {
    render(
      <form>
        <input name="address" data-testid="address" />
        <input name="city" data-testid="city" />
      </form>
    )
    const addr = screen.getByTestId('address') as HTMLInputElement
    const city = screen.getByTestId('city') as HTMLInputElement

    // Simulate browser autofill by setting values and dispatching input events
    fireEvent.input(addr, { target: { value: '123 Main St' } })
    fireEvent.input(city, { target: { value: 'Metropolis' } })

    expect(addr.value).toBe('123 Main St')
    expect(city.value).toBe('Metropolis')
  })

  it('TC-ENV-004: back button resubmission should be handled gracefully', async () => {
    // Simple simulation: component registers popstate and exposes a flag when resubmission is needed
    function ResubmitForm() {
      const [submitted, setSubmitted] = React.useState(false)
      const [resubmitPrompt, setResubmitPrompt] = React.useState(false)
      React.useEffect(() => {
        function onPop() {
          if (submitted) setResubmitPrompt(true)
        }
        // listen to both popstate and a test-specific event for deterministic testing
        window.addEventListener('popstate', onPop)
        window.addEventListener('test-pop', onPop as EventListener)
        return () => {
          window.removeEventListener('popstate', onPop)
          window.removeEventListener('test-pop', onPop as EventListener)
        }
      }, [submitted])

      return (
        <div>
          <button onClick={() => setSubmitted(true)}>Submit</button>
          {submitted && <div data-testid="submitted" style={{ display: 'none' }} />}
          {resubmitPrompt && <div role="alert">Confirm Form Resubmission</div>}
        </div>
      )
    }

    render(<ResubmitForm />)
    const submit = screen.getByText('Submit')
    fireEvent.click(submit)
    // wait until the component acknowledges submission, then trigger popstate
    await waitFor(() => expect(screen.getByTestId('submitted')).toBeTruthy())
    window.history.pushState({}, '')
    // dispatch a deterministic test event to avoid timing races with effect registration
    window.dispatchEvent(new Event('test-pop'))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/Confirm Form Resubmission/))
  })

  it('TC-ENV-005: phone field should present numeric keypad on mobile (inputMode/type)', () => {
    render(<PhoneForm />)
    const phone = screen.getByTestId('phone') as HTMLInputElement
    // Expect attributes that trigger numeric keypad on mobile browsers
    expect(phone.getAttribute('inputmode') || phone.inputMode).toMatch(/numeric|tel/i)
    expect(phone.getAttribute('type')).toBe('tel')
  })
})
