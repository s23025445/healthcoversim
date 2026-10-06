import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Calculation, Quote } from '../types'

function money(value: number) { return `$${value.toFixed(2)}` }

function QuoteDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadQuote() {
      try {
        const response = await fetch(`/api/quotes/${id}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Could not load this quote.')
        setQuote(data.quote)
        setCalculation(data.calculation)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this quote.')
      } finally {
        setLoading(false)
      }
    }
    loadQuote()
  }, [id])

  async function deleteQuote() {
    if (!quote || !window.confirm(`Delete quote #${quote.id}?`)) return
    try {
      setDeleting(true)
      const response = await fetch(`/api/quotes/${quote.id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Could not delete the quote.')
      }
      navigate('/quotes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the quote.')
      setDeleting(false)
    }
  }

  if (loading) return <main className="page"><p>Loading quote...</p></main>
  if (error || !quote || !calculation) return <main className="page"><div className="message error">{error || 'Quote not found.'}</div><Link to="/quotes">Back to quotes</Link></main>

  return (
    <main className="page">
      <div className="page-heading"><div><h1>{quote.customerName}</h1><p className="intro">Quote #{quote.id}</p></div><Link to="/quotes">Back to quotes</Link></div>
      <div className="actions"><Link className="button-link" to={`/quotes/${quote.id}/edit`}>Edit quote</Link><button type="button" onClick={deleteQuote} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete quote'}</button></div>
      <section className="section"><h2>Quote details</h2><dl className="details"><dt>Cover type</dt><dd>{quote.coverType}</dd><dt>Hospital cover</dt><dd>{quote.hospitalCover}</dd><dt>Extras cover</dt><dd>{quote.extrasCover}</dd><dt>Payment</dt><dd>{quote.paymentFrequency}</dd><dt>Annual discount</dt><dd>{quote.annualDiscount}%</dd><dt>Applicant 1</dt><dd>Age {quote.applicant1Age}, history: {quote.applicant1CoverHistory}</dd>{quote.applicant2Age && <><dt>Applicant 2</dt><dd>Age {quote.applicant2Age}, history: {quote.applicant2CoverHistory}</dd></>}{quote.notes && <><dt>Notes</dt><dd>{quote.notes}</dd></>}</dl></section>
      <section className="section"><h2>Premium estimate</h2><p className="big-price">{money(calculation.monthlyPremium)} per month</p><dl className="details"><dt>Hospital total</dt><dd>{money(calculation.hospitalPremiumTotal)}</dd><dt>Extras total</dt><dd>{money(calculation.extrasPremiumTotal)}</dd>{calculation.familyFee && <><dt>Family fee</dt><dd>{money(calculation.familyFee)}</dd></>}<dt>Yearly before discount</dt><dd>{money(calculation.yearlyPremiumBeforeDiscount)}</dd>{calculation.yearlyPremiumAfterDiscount !== undefined && <><dt>Yearly discount</dt><dd>{calculation.yearlyDiscountPercentage}% ({money(calculation.yearlyDiscountAmount ?? 0)})</dd><dt>Yearly after discount</dt><dd>{money(calculation.yearlyPremiumAfterDiscount)}</dd></>}</dl><h3>LHC loading</h3><ul>{calculation.applicants.map((applicant) => <li key={applicant.applicant}>{applicant.applicant}: {applicant.lhcLoadingPercentage}% loading; hospital cost {money(applicant.hospitalPremium)}</li>)}</ul>{calculation.warnings.length > 0 && <div className="message warning"><strong>Warning:</strong><ul>{calculation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>}<p>{calculation.lhcStatement}</p><p>{calculation.explanation}</p></section>
    </main>
  )
}

export default QuoteDetailPage
