import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'
import BookCard from '../components/BookCard'
import EditBookModal from '../components/EditBookModal'

export default function AdminInventory() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/admin/books')
        setBooks(data || [])
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
          <h2 className="text-2xl font-bold text-slate-900">Inventory</h2>
          {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {toast && <div className="fixed right-6 top-20 z-50 card bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 shadow-sm">{toast}</div>}
          {books.length === 0 ? (
            <div className="mt-3 text-slate-500">No books yet.</div>
          ) : (
            <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((b) => (
                <BookCard
                  key={b._id}
                  book={b}
                  onEdit={(bk) => setEditing(bk)}
                  onDelete={async (id) => {
                    if (!confirm('Delete this book?')) return
                    try {
                      await axios.delete(`/api/admin/books/${id}`)
                      setBooks((prev) => prev.filter((x) => x._id !== id))
                      setToast('Book deleted')
                      setTimeout(() => setToast(''), 2000)
                    } catch (err) {
                      alert(err?.response?.data?.message || 'Delete failed')
                    }
                  }}
                />
              ))}
            </div>
          )}
          {editing && (
            <EditBookModal
              book={editing}
              onClose={() => setEditing(null)}
              onSaved={(updated) => {
                setBooks((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))
                setEditing(null)
                setToast('Book updated')
                setTimeout(() => setToast(''), 2000)
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
