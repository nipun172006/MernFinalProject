import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'

export default function Universities() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/universities')
        setList(data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-3xl font-extrabold text-brand-navy">Registered Universities</h2>
          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {!loading && !error && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((u) => (
                <div key={u._id} className="card p-4">
                  <div className="text-lg font-semibold text-slate-900">{u.name}</div>
                  <div className="text-sm text-slate-600">{u.domain}</div>
                  <div className="text-xs text-slate-500 mt-1">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {list.length === 0 && <div className="text-slate-500">No universities yet.</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
