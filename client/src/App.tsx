import { type FormEvent, useState } from 'react'
import './App.css'

type QuoteForm = {
  customerName: string
  coverType: string
  applicant1Age: string
  applicant1CoverHistory: string
  applicant2Age: string
  applicant2CoverHistory: string
  hospitalCover: string
  extrasCover: string
  paymentFrequency: string
  annualDiscount: string
  notes: string
}

const emptyForm: QuoteForm = {
  customerName: '',
  coverType: 'Single',
  applicant1Age: '',
  applicant1CoverHistory: '',
  applicant2Age: '',
  applicant2CoverHistory: '',
  hospitalCover: 'None',
  extrasCover: 'None',
  paymentFrequency: 'Monthly',
  annualDiscount: '0',
  notes: '',
}

function App() {
  const [form, setForm] = useState<QuoteForm>(emptyForm)
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [createdQuoteId, setCreatedQuoteId] = useState<number | null>(null)

  const needsApplicant2 = form.coverType === 'Couple' || form.coverType === 'Family'

  function updateField(field: keyof QuoteForm, value: string) {
    setForm((current) => {
      // Clear old Applicant 2 values when switching back to Single.
      if (field === 'coverType' && value === 'Single') {
        return { ...current, coverType: value, applicant2Age: '', applicant2CoverHistory: '' }
      }

      return { ...current, [field]: value }
    })
  }

  function validateForm() {
    const formErrors: string[] = []
    const applicant1Age = Number(form.applicant1Age)
    const applicant2Age = Number(form.applicant2Age)
    const annualDiscount = Number(form.annualDiscount)

    if (!form.customerName.trim()) formErrors.push('Customer name is required.')
    if (!form.applicant1CoverHistory) formErrors.push('Choose Applicant 1 cover history.')
    if (!Number.isInteger(applicant1Age) || applicant1Age < 18 || applicant1Age > 100) {
      formErrors.push('Applicant 1 age must be from 18 to 100.')
    }
    if (needsApplicant2) {
      if (!form.applicant2CoverHistory) formErrors.push('Choose Applicant 2 cover history.')
      if (!Number.isInteger(applicant2Age) || applicant2Age < 18 || applicant2Age > 100) {
        formErrors.push('Applicant 2 age must be from 18 to 100.')
      }
    }
    if (!Number.isFinite(annualDiscount) || annualDiscount < 0 || annualDiscount > 10) {
      formErrors.push('Annual discount must be from 0% to 10%.')
    }

    return formErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatedQuoteId(null)

    const formErrors = validateForm()
    if (formErrors.length > 0) {
      setErrors(formErrors)
      return
    }

    const quote = {
      customerName: form.customerName.trim(),
      coverType: form.coverType,
      applicant1Age: Number(form.applicant1Age),
      applicant1CoverHistory: form.applicant1CoverHistory,
      hospitalCover: form.hospitalCover,
      extrasCover: form.extrasCover,
      paymentFrequency: form.paymentFrequency,
      annualDiscount: Number(form.annualDiscount),
      notes: form.notes.trim(),
      ...(needsApplicant2 && {
        applicant2Age: Number(form.applicant2Age),
        applicant2CoverHistory: form.applicant2CoverHistory,
      }),
    }

    try {
      setIsSaving(true)
      setErrors([])

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
      })
      const data = await response.json()

      if (!response.ok) {
        const apiErrors = Array.isArray(data.details)
          ? data.details.map((item: { message?: string }) => item.message ?? 'Invalid quote details.')
          : [data.error ?? 'Could not save the quote.']
        setErrors(apiErrors)
        return
      }

      setCreatedQuoteId(data.quote.id)
      setForm(emptyForm)
    } catch {
      setErrors(['Could not connect to the server. Make sure it is running.'])
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="page">
      <h1>HealthCoverSim</h1>
      <p className="intro">Create a health cover quote.</p>

      {errors.length > 0 && (
        <div className="message error" role="alert">
          <strong>Please fix these issues:</strong>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      )}

      {createdQuoteId && (
        <div className="message success">
          Quote #{createdQuoteId} was saved. The React detail page comes next, but you can{' '}
          <a href={`/api/quotes/${createdQuoteId}`} target="_blank" rel="noreferrer">view its API detail now</a>.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label>
          Customer name
          <input value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} required />
        </label>

        <label>
          Cover type
          <select value={form.coverType} onChange={(event) => updateField('coverType', event.target.value)}>
            <option>Single</option><option>Couple</option><option>Family</option>
          </select>
        </label>

        <fieldset>
          <legend>Applicant 1</legend>
          <label>
            Age
            <input type="number" min="18" max="100" value={form.applicant1Age} onChange={(event) => updateField('applicant1Age', event.target.value)} required />
          </label>
          <label>
            Hospital cover history
            <select value={form.applicant1CoverHistory} onChange={(event) => updateField('applicant1CoverHistory', event.target.value)} required>
              <option value="">Choose an option</option><option>Yes</option><option>No</option><option>Not sure</option>
            </select>
          </label>
        </fieldset>

        {needsApplicant2 && (
          <fieldset>
            <legend>Applicant 2</legend>
            <label>
              Age
              <input type="number" min="18" max="100" value={form.applicant2Age} onChange={(event) => updateField('applicant2Age', event.target.value)} required />
            </label>
            <label>
              Hospital cover history
              <select value={form.applicant2CoverHistory} onChange={(event) => updateField('applicant2CoverHistory', event.target.value)} required>
                <option value="">Choose an option</option><option>Yes</option><option>No</option><option>Not sure</option>
              </select>
            </label>
          </fieldset>
        )}

        <label>
          Hospital cover
          <select value={form.hospitalCover} onChange={(event) => updateField('hospitalCover', event.target.value)}>
            <option>None</option><option>Basic</option><option>Bronze</option><option>Silver</option><option>Gold</option>
          </select>
        </label>

        <label>
          Extras cover
          <select value={form.extrasCover} onChange={(event) => updateField('extrasCover', event.target.value)}>
            <option>None</option><option>Basic</option><option>Standard</option><option>Premium</option>
          </select>
        </label>

        <label>
          Payment frequency
          <select value={form.paymentFrequency} onChange={(event) => updateField('paymentFrequency', event.target.value)}>
            <option>Monthly</option><option>Yearly</option>
          </select>
        </label>

        <label>
          Annual discount (%)
          <input type="number" min="0" max="10" step="0.1" value={form.annualDiscount} onChange={(event) => updateField('annualDiscount', event.target.value)} />
        </label>

        <label>
          Notes (optional)
          <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows={4} />
        </label>

        <button type="submit" disabled={isSaving}>{isSaving ? 'Saving quote...' : 'Save quote'}</button>
      </form>
    </main>
  )
}

export default App
