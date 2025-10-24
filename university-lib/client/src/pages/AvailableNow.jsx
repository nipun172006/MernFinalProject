import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'
import BookCard from '../components/BookCard'

export default function AvailableNow() {
  const [available, setAvailable] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [a, s] = await Promise.all([
          axios.get('/api/student/books/available'),
          axios.get('/api/university/settings'),
        ])
        setAvailable(a.data || [])
        setSettings(s.data || null)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const checkout = async (bookItemId, durationDays) => {
    await axios.post('/api/loans/checkout', { bookItemId, durationDays })
    // auto-refresh list after borrow
    const { data } = await axios.get('/api/student/books/available')
    setAvailable(data || [])
  }

  if (loading) return <div className="p-4">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Available Now</h2>
            <span className="text-sm text-slate-600">{available.length} items</span>
          </div>
          {error && <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {available.length === 0 ? (
            <div className="text-slate-500">No books currently available.</div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {available.map((b) => (
                <BookCard key={b._id} book={b} onBorrow={checkout} finePerDay={settings?.finePerDay} settings={settings} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
