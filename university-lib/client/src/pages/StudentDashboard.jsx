import React, { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from '../components/SiteHeader'
import BookCard from '../components/BookCard'
import { Search, Loader2, X, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function StudentDashboard() {
  const { logout } = useAuth()
  const [available, setAvailable] = useState([])
  const [allBooks, setAllBooks] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loans, setLoans] = useState([])
  const [settings, setSettings] = useState(null)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | available | onloan
  const [genres, setGenres] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [sortBy, setSortBy] = useState('') // '', 'rating', 'popularity'
  const abortRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const load = async () => {
    try {
      const [all, a, p, l, s, g] = await Promise.all([
        axios.get('/api/student/books/all', { params: { genres: selectedGenres.join(','), sort: sortBy } }),
        axios.get('/api/student/books/available'),
        axios.get('/api/student/books/predictions'),
        axios.get('/api/loans/mine'),
        axios.get('/api/university/settings'),
        axios.get('/api/student/genres'),
      ])
      setAllBooks(all.data)
      setAvailable(a.data)
      setPredictions(p.data)
      setLoans(l.data)
      setSettings(s.data)
      setGenres(g.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [selectedGenres.join(','), sortBy])

  const checkout = async (bookItemId, durationDays) => {
    await axios.post('/api/loans/checkout', { bookItemId, durationDays })
    setToast('Book borrowed successfully')
    setTimeout(() => setToast(''), 2500)
    await load()
  }

  const returnLoan = async (loanId) => {
    await axios.post(`/api/loans/return/${loanId}`)
    await load()
  }

  // Live search with debounce + abort
  useEffect(() => {
    setSearchError('')
    if (!query.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      abortRef.current?.abort?.()
      return
    }

    setSearchLoading(true)
    const controller = new AbortController()
    abortRef.current?.abort?.()
    abortRef.current = controller

    const t = setTimeout(async () => {
      try {
  const { data } = await axios.get('/api/student/books/search', { params: { q: query, genres: selectedGenres.join(','), sort: sortBy }, signal: controller.signal })
        setSearchResults(data)
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return
        setSearchError(err?.response?.data?.message || 'Search failed')
      } finally {
        setSearchLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query])

  // Helper: apply availability filter to a list of books
  const filterBooksByStatus = (arr) => {
    if (!Array.isArray(arr)) return []
    if (statusFilter === 'available') return arr.filter((b) => (b?.availableCopies ?? 0) > 0)
    if (statusFilter === 'onloan') return arr.filter((b) => (b?.availableCopies ?? 0) <= 0)
    return arr
  }

  // No sidebar/anchors on this page anymore; dedicated pages handle sections

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <div className="h-9 w-56 skeleton" />
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="h-11 w-full skeleton rounded-full" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-16 skeleton rounded-full" />
              <div className="h-8 w-24 skeleton rounded-full" />
              <div className="h-8 w-24 skeleton rounded-full" />
            </div>
          </div>
          <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-40 w-full skeleton" />
                <div className="mt-3 h-4 w-3/4 skeleton" />
                <div className="mt-2 h-3 w-1/2 skeleton" />
                <div className="mt-5 h-9 w-full skeleton rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-brand-navy">Discover</h2>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Sort</label>
                <select className="input py-2" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
                  <option value="">Default</option>
                  <option value="rating">Rating</option>
                  <option value="popularity">Popularity</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/dashboard/soon" className="btn-outline">Available Soon</Link>
              <Link to="/dashboard/loans" className="btn-outline">My Loans</Link>
            </div>
            {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
            {toast && (
              <div className="fixed right-6 top-20 z-50 card bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 shadow-sm">{toast}</div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-9 pr-10 rounded-full"
                  placeholder="Search by title, author or ISBN"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-slate-600">Filter:</span>
                <button
                  type="button"
                  aria-pressed={statusFilter==='all'}
                  onClick={() => setStatusFilter('all')}
                  className={`${statusFilter==='all' ? 'btn' : 'btn-outline'} px-3 py-1.5 rounded-full text-sm`}
                >All</button>
                <button
                  type="button"
                  aria-pressed={statusFilter==='available'}
                  onClick={() => setStatusFilter('available')}
                  className={`${statusFilter==='available' ? 'btn' : 'btn-outline'} px-3 py-1.5 rounded-full text-sm`}
                >Available</button>
                <button
                  type="button"
                  aria-pressed={statusFilter==='onloan'}
                  onClick={() => setStatusFilter('onloan')}
                  className={`${statusFilter==='onloan' ? 'btn' : 'btn-outline'} px-3 py-1.5 rounded-full text-sm`}
                >On loan</button>
              </div>
              {searchLoading && <Loader2 className="animate-spin h-5 w-5 text-brand-accent" />}
            </div>

            {genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {genres.map((g) => {
                  const active = selectedGenres.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      className={`chip ${active ? 'bg-brand-accent text-white border-brand-accent' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
                      onClick={() => setSelectedGenres((prev) => active ? prev.filter(x=>x!==g) : [...prev, g])}
                    >
                      {g}
                    </button>
                  )
                })}
                {selectedGenres.length > 0 && (
                  <button type="button" className="btn-ghost" onClick={()=>setSelectedGenres([])}>Clear</button>
                )}
              </div>
            )}

            {searchError && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{searchError}</div>}

            {query && !searchLoading && !searchResults.length && (
              <div className="mt-4 text-slate-500">No matches found.</div>
            )}

            {!!searchResults.length && (
              <section className="mt-6">
                <h3 className="text-xl font-semibold text-slate-800">Search Results</h3>
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filterBooksByStatus(searchResults).map((b) => (
                    <BookCard key={b._id} book={b} onBorrow={checkout} finePerDay={settings?.finePerDay} settings={settings} />
                  ))}
                </div>
              </section>
            )}
            <section className="mt-10">
              <h3 className="text-xl font-semibold text-slate-800">All Books</h3>
              {allBooks.length === 0 ? (
                <div className="text-slate-500">No books yet. Ask your admin to add books.</div>
              ) : (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-2">
                  {filterBooksByStatus(allBooks).map((b) => (
                    <BookCard key={b._id} book={b} onBorrow={checkout} finePerDay={settings?.finePerDay} settings={settings} />
                  ))}
                </div>
              )}
            </section>
        </div>
      </main>
    </div>
  )
}
