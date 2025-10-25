import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'
import BookCard from '../components/BookCard'

export default function AvailableSoon() {
  const [allBooks, setAllBooks] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [all, s] = await Promise.all([
          axios.get('/api/student/books/all'),
          axios.get('/api/university/settings'),
        ])
        setAllBooks(all.data || [])
        setSettings(s.data || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const borrowed = useMemo(() => {
    const arr = (allBooks || []).filter(b => (b?.availableCopies ?? 0) <= 0)
    // Sort by soonest due date ascending if available
    return arr.sort((a, b) => {
      const da = a?.soonestDueDate ? new Date(a.soonestDueDate).getTime() : Infinity
      const db = b?.soonestDueDate ? new Date(b.soonestDueDate).getTime() : Infinity
      return da - db
    })
  }, [allBooks])

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Available Soon</h2>
              <p className="text-sm text-slate-600">Sorted by the soonest expected return.</p>
            </div>
            <span className="text-sm text-slate-600">{borrowed.length} items</span>
          </div>
          {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {borrowed.length === 0 ? (
            <div className="card p-6 text-slate-600">No borrowed books currently. Check back later.</div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {borrowed.map((b) => (
                <BookCard key={b._id} book={b} finePerDay={settings?.finePerDay} settings={settings} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
