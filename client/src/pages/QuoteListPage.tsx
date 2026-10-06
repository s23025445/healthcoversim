import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Quote } from '../types'

function QuoteListPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadQuotes() {
      try {
        const response = await fetch('/api/quotes')
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Could not load quotes.')
        setQuotes(data.quotes)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load quotes.')
      } finally {
        setLoading(false)
      }
    }
    loadQuotes()
  }, [])

  if (loading) return <main className="page"><p>Loading quotes...</p></main>
  if (error) return <main className="page"><div className="message error">{error}</div><Link to="/quotes/new">Create a quote</Link></main>

  return (
    <main className="page">
      <div className="page-heading"><div><h1>Quotes</h1><p className="intro">Your saved health cover quotes.</p></div><Link className="button-link" to="/quotes/new">New quote</Link></div>
      {quotes.length === 0 ? (
        <div className="message"><p>No quotes have been saved yet.</p><Link to="/quotes/new">Create your first quote</Link></div>
      ) : (
        <div className="quote-list">
          {quotes.map((quote) => (
            <article className="quote-card" key={quote.id}>
              <h2>{quote.customerName}</h2>
              <p>{quote.coverType} cover · Hospital: {quote.hospitalCover} · Extras: {quote.extrasCover}</p>
              <p>Payment: {quote.paymentFrequency}</p>
              <Link to={`/quotes/${quote.id}`}>View quote</Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default QuoteListPage
