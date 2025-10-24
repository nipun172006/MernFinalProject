import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from '../components/SiteHeader'
// AdminSidebar removed per redesign; using full-width pages now

export default function AdminDashboard() {
  const { logout } = useAuth()
  const [books, setBooks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', ISBN: '', coverImageUrl: '', description: '', totalCopies: 1 })
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [booksRes, notesRes] = await Promise.all([
        axios.get('/api/admin/books'),
        axios.get('/api/admin/notifications', { params: { limit: 20 } }),
      ])
      setBooks(booksRes.data)
      setNotifications(notesRes.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    await axios.post('/api/admin/books', { ...form, totalCopies: Number(form.totalCopies) })
    setShowForm(false)
    setForm({ title: '', author: '', ISBN: '', coverImageUrl: '', description: '', totalCopies: 1 })
    await load()
  }

  const importCsv = async (e) => {
    e.preventDefault()
    if (!csvText.trim()) return
    setImporting(true)
    try {
      const { data } = await axios.post('/api/admin/books/import', { csvText })
      setCsvText('')
      await load()
      alert(`Imported: ${data.created} created, ${data.updated} updated`)
    } catch (err) {
      alert(err?.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 bg-slate-50">
        <main>
          <div className="w-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-brand-navy">Admin Dashboard (Legacy)</h2>
            </div>
            {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}

            {/* Notifications */}
            <section className="mt-4">
              <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
              {notifications.length === 0 ? (
                <div className="text-slate-500">No recent activity.</div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {notifications.map((n) => (
                    <li key={n._id} className="card p-3">
                      <div className="text-sm text-slate-700">{n.message}</div>
                      <div className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Add Book moved to /admin/add; keeping form here hidden by default */}
            {showForm && (
              <form onSubmit={submit} className="card p-4 mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Author</label>
                  <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">ISBN</label>
                  <input className="input" value={form.ISBN} onChange={(e) => setForm({ ...form, ISBN: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cover Image URL</label>
                  <input className="input" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea className="textarea" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Total Copies</label>
                  <input className="input" type="number" min={0} value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="btn">Save</button>
                </div>
              </form>
            )}

            <section className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800">Bulk Import (CSV)</h3>
              <p className="text-sm text-slate-600 mt-1">Paste CSV with headers: title,author,ISBN,coverImageUrl,description,totalCopies</p>
              <form onSubmit={importCsv} className="card p-4 mt-3 space-y-3">
                <textarea className="textarea" rows={6} placeholder="title,author,ISBN,coverImageUrl,description,totalCopies\nThe Pragmatic Programmer,Andrew Hunt,978-0201616224,https://...,Classic book,3" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn" disabled={importing}>{importing ? 'Importing…' : 'Import CSV'}</button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setCsvText(`title,author,ISBN,coverImageUrl,description,totalCopies\n
Clean Code,Robert C. Martin,9780132350884,https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop,Handbook of agile software craftsmanship,3\n
The Pragmatic Programmer,Andrew Hunt; David Thomas,9780201616224,https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop,Classic software engineering wisdom,4\n
Design Patterns,Erich Gamma et al.,9780201633610,https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop,Reusable object-oriented software patterns,2\n
Introduction to Algorithms,Thomas H. Cormen et al.,9780262033848,https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop,Comprehensive algorithms textbook,5\n
Artificial Intelligence: A Modern Approach,Stuart Russell; Peter Norvig,9780136042594,https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=800&auto=format&fit=crop,Foundations of AI,3\n
Operating System Concepts,Abraham Silberschatz et al.,9780470128725,https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop,The dinosaur book on OS,2\n
Computer Networks,Andrew S. Tanenbaum,9780132126953,https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop,Networking fundamentals,4\n
Database System Concepts,Abraham Silberschatz; Henry Korth,9780073523323,https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop,Intro to DB systems,3\n
Deep Learning,Ian Goodfellow; Yoshua Bengio; Aaron Courville,9780262035613,https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=800&auto=format&fit=crop,The deep learning book,2\n
Structure and Interpretation of Computer Programs,Harold Abelson; Gerald Jay Sussman,9780262510875,https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop,Classic on programming,2`)}
                  >
                    Fill Sample (10)
                  </button>
                </div>
              </form>
            </section>

            <section className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800">Inventory</h3>
              {books.length === 0 ? (
                <div className="text-slate-500">No books yet. Use “Add Book” to seed your university library.</div>
              ) : (
                <div className="overflow-x-auto card mt-3">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Book Title</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Author</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ISBN</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Copies</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Available Copies</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Popularity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {books.map((b) => (
                        <tr key={b._id}>
                          <td className="px-4 py-3 font-medium text-slate-800">{b.title}</td>
                          <td className="px-4 py-3 text-slate-600">{b.author || '-'}</td>
                          <td className="px-4 py-3 text-slate-600">{b.ISBN}</td>
                          <td className="px-4 py-3 text-slate-600">{b.totalCopies}</td>
                          <td className="px-4 py-3 text-slate-600">{b.availableCopies}</td>
                          <td className="px-4 py-3 text-slate-600">{b.borrowCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
