import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import QuoteDetailPage from './pages/QuoteDetailPage'
import QuoteFormPage from './pages/QuoteFormPage'
import QuoteListPage from './pages/QuoteListPage'

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <Link to="/quotes" className="site-title">HealthCoverSim</Link>
        <nav><Link to="/quotes">Quotes</Link> <Link to="/quotes/new">New quote</Link></nav>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/quotes" replace />} />
        <Route path="/quotes" element={<QuoteListPage />} />
        <Route path="/quotes/new" element={<QuoteFormPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/quotes/:id/edit" element={<QuoteFormPage />} />
        <Route path="*" element={<main className="page"><h1>Page not found</h1><Link to="/quotes">Go to quotes</Link></main>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
