import React, { useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'

export default function AdminAddBook() {
  const [form, setForm] = useState({ title: '', author: '', ISBN: '', coverImageUrl: '', description: '', totalCopies: 1, genres: '', rating: 0 })
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies) }
      if (typeof payload.genres === 'string') payload.genres = payload.genres.split(/[,;|]/g).map((g)=>g.trim()).filter(Boolean)
      payload.rating = Number(payload.rating)
      await axios.post('/api/admin/books', payload)
      setForm({ title: '', author: '', ISBN: '', coverImageUrl: '', description: '', totalCopies: 1, genres: '', rating: 0 })
      alert('Book added')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add')
    } finally {
      setSaving(false)
    }
  }

  const importCsv = async (e) => {
    e.preventDefault()
    if (!csvText.trim()) return
    setImporting(true)
    try {
      const { data } = await axios.post('/api/admin/books/import', { csvText })
      setCsvText('')
      alert(`Imported: ${data.created} created, ${data.updated} updated`)
    } catch (err) {
      alert(err?.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <h2 className="text-2xl font-bold text-slate-900">Add Books</h2>

          <form onSubmit={submit} className="card p-4 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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
              <label className="block text-sm font-medium text-slate-700">Genres (comma/semicolon separated)</label>
              <input className="input" value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} placeholder="physics, comics, anime" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Rating (0–5)</label>
              <input className="input" type="number" min={0} max={5} step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Copies</label>
              <input className="input" type="number" min={0} value={form.totalCopies} onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>

          <section className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800">Bulk Import (CSV)</h3>
            <p className="text-sm text-slate-600 mt-1">Paste CSV with headers: title,author,ISBN,coverImageUrl,description,totalCopies,genres,rating</p>
            <form onSubmit={importCsv} className="card p-4 mt-3 space-y-3">
              <textarea className="textarea" rows={12} placeholder="title,author,ISBN,coverImageUrl,description,totalCopies,genres,rating" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
              <div className="flex gap-2">
                <button className="btn" disabled={importing}>{importing ? 'Importing…' : 'Import CSV'}</button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCsvText(`title,author,ISBN,coverImageUrl,description,totalCopies,genres,rating\nClean Code,Robert C. Martin,9780132350884,https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop,Handbook of agile software craftsmanship,3,software;craft,4.7\nThe Pragmatic Programmer,Andrew Hunt,9780201616224,https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop,Classic programming practices guide,4,software;engineering,4.6\nIntroduction to Algorithms,Thomas H. Cormen,9780262046305,https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=800&auto=format&fit=crop,Algorithms textbook widely used,2,algorithms;cs,4.5\nThe Great Gatsby,F. Scott Fitzgerald,9780743273565,https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop,Classic American novel,5,classics;fiction,4.1\nTo Kill a Mockingbird,Harper Lee,9780060935467,https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop,Novel on justice and moral growth,4,classics;fiction,4.3\nA Brief History of Time,Stephen Hawking,9780553380163,https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=800&auto=format&fit=crop,Popular science cosmology,3,science;nonfiction,4.2\nSapiens,Yuval Noah Harari,9780062316097,https://images.unsplash.com/photo-1495446815901-21f1b6adae1a?q=80&w=800&auto=format&fit=crop,History of humankind overview,5,history;nonfiction,4.4\nThe Hobbit,J.R.R. Tolkien,9780547928227,https://images.unsplash.com/photo-1455885666463-9f9ae3f6fd21?q=80&w=800&auto=format&fit=crop,Fantasy adventure prelude to LOTR,6,fantasy;adventure,4.6\nDune,Frank Herbert,9780441013593,https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop,Epic science fiction saga,4,scifi;classic,4.5\nThe Design of Everyday Things,Don Norman,9780465050659,https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop,Design and usability principles,3,design;ux,4.3`)}
                >
                  Fill Sample
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
