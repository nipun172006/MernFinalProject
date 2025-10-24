import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'

export default function AdminActivity() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/admin/notifications', { params: { limit: 50 } })
        setNotifications(data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {notifications.length === 0 ? (
            <div className="mt-3 text-slate-500">No recent activity.</div>
          ) : (
            <ul className="mt-4 space-y-2">
              {notifications.map((n) => (
                <li key={n._id} className={`card p-3 border ${n.type === 'borrow' ? 'border-emerald-200 bg-emerald-50/50' : 'border-indigo-200 bg-indigo-50/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-800">
                      <span className="font-medium">{n.userEmail || n.userName || 'Student'}</span>
                      {n.type === 'borrow' ? ' borrowed ' : ' returned '}
                      <span className="font-medium">{n.bookTitle || 'a book'}</span>
                      {n.bookISBN ? <span className="text-slate-500"> ({n.bookISBN})</span> : null}
                    </div>
                    <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
