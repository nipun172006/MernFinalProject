import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'
import { Search, Building2, Copy, Check, LogIn } from 'lucide-react'

export default function Universities() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [copied, setCopied] = useState('')

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let arr = !q
      ? list
      : list.filter(u => (u.name || '').toLowerCase().includes(q) || (u.domain || '').toLowerCase().includes(q))
    if (sort === 'az') arr = [...arr].sort((a,b) => (a.name||'').localeCompare(b.name||''))
    if (sort === 'newest') arr = [...arr].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    return arr
  }, [list, query, sort])

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      setTimeout(() => setCopied(''), 1500)
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-navy">Is your university here?</h2>
              <p className="text-slate-600">Search by name or domain and start your session.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600" htmlFor="sort">Sort</label>
              <select id="sort" className="input py-2" value={sort} onChange={(e)=>setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="az">A–Z</option>
              </select>
            </div>
          </header>

          {/* Search */}
          <div className="mt-4">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                aria-label="Search universities by name or domain"
                className="input pl-9 pr-3"
                placeholder="Search by domain, e.g., example.edu"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_,i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="mt-2 h-3 w-2/3 bg-slate-200 rounded" />
                  <div className="mt-6 h-9 w-full bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {error && <div className="mt-6 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg" role="alert">{error}</div>}

          {!loading && !error && (
            <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((u) => {
                const initial = (u.name || u.domain || '?').charAt(0).toUpperCase()
                const joined = new Date(u.createdAt).toLocaleDateString()
                const isCopied = copied === u.domain
                return (
                  <article key={u._id} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all" aria-label={`${u.name} ${u.domain}`}>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center" aria-hidden>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{u.name}</div>
                        <div className="mt-1 inline-flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">{u.domain}</span>
                          <span className="text-xs text-slate-500">Joined {joined}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button onClick={() => copy(u.domain)} className="btn-outline flex-1" aria-label={`Copy ${u.domain} to clipboard`}>
                        {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />} {isCopied ? 'Copied' : 'Copy domain'}
                      </button>
                      <a href="/login" className="btn flex-1" aria-label="Go to login">
                        <LogIn className="h-4 w-4 mr-2" /> Start session
                      </a>
                    </div>
                  </article>
                )
              })}
              {filtered.length === 0 && (
                <div className="text-slate-500">No matches. Try a different search.</div>
              )}
            </div>
          )}

          {!loading && !error && list.length === 0 && (
            <div className="mt-6 card p-6">
              <div className="text-slate-700">No universities yet. If you're an admin, create one to get started.</div>
              <a href="/onboarding" className="btn mt-3 w-fit">+ Add University</a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
