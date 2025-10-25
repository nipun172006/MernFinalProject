import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'
import { Clock, CheckCircle2 } from 'lucide-react'

export default function MyLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const { data } = await axios.get('/api/loans/mine')
      setLoans(data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const returnLoan = async (loanId) => {
    await axios.post(`/api/loans/return/${loanId}`)
    await load()
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Loans</h2>
              <p className="text-sm text-slate-600">Return on time to avoid fines.</p>
            </div>
            <span className="text-sm text-slate-600">{loans.length} items</span>
          </div>
          {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {loans.length === 0 ? (
            <div className="card p-6 text-slate-600">No loans yet. Borrow a book to see it here.</div>
          ) : (
            <ul className="space-y-3">
              {loans.map((l) => (
                <li key={l._id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-12 bg-slate-100 flex items-center justify-center overflow-hidden rounded">
                      {l.bookItemRef?.coverImageUrl ? (
                        <img src={l.bookItemRef.coverImageUrl} alt={l.bookItemRef.title} className="object-cover max-h-full" />
                      ) : (
                        <span className="text-slate-400 text-xs">No Image</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{l.bookItemRef?.title || 'Untitled'}</div>
                      {l.bookItemRef?.author && <div className="text-sm text-slate-600">{l.bookItemRef.author}</div>}
                      <div className="mt-1 flex items-center gap-2">
                        {!l.returnDate ? (
                          <span className="badge badge-warn"><Clock className="h-3.5 w-3.5" /> Due: {new Date(l.dueDate).toLocaleString()}</span>
                        ) : (
                          <span className="badge badge-success"><CheckCircle2 className="h-3.5 w-3.5" /> Returned</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!l.returnDate ? (
                    <button className="btn" onClick={() => returnLoan(l._id)}>Return</button>
                  ) : (
                    <span className="text-sm text-slate-500">Returned</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
