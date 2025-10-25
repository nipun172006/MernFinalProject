import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

// Simple modal for editing a book. Overlay is click-to-close via onClose.
export default function EditBookModal({ book, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    author: '',
    ISBN: '',
    coverImageUrl: '',
    description: '',
    totalCopies: 0,
    genres: '', // comma-separated
    rating: ''
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!book) return
    setForm({
      title: book.title || '',
      author: book.author || '',
      ISBN: book.ISBN || '',
      coverImageUrl: book.coverImageUrl || '',
      description: book.description || '',
      totalCopies: book.totalCopies ?? 0,
      genres: Array.isArray(book.genres) ? book.genres.join(', ') : '',
      rating: book.rating ?? ''
    })
  }, [book])

  const disabled = useMemo(() => saving, [saving])

  const updateField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e?.preventDefault?.()
    setError('')
    if (!book?._id) return
    try {
      setSaving(true)
      // Build payload with only editable fields; server accepts partials
      const payload = {
        title: form.title,
        author: form.author,
        coverImageUrl: form.coverImageUrl,
        description: form.description,
        totalCopies: Number(form.totalCopies),
        genres: String(form.genres || '')
          .split(/[;,]/g)
          .map((g) => g.trim())
          .filter(Boolean),
        rating: form.rating === '' ? undefined : Number(form.rating)
      }

      // Clamp/validate client-side lightly
      if (Number.isFinite(payload.rating)) {
        if (payload.rating < 0 || payload.rating > 5) {
          return setError('Rating must be between 0 and 5')
        }
      }
      if (!Number.isFinite(payload.totalCopies) || payload.totalCopies < 0) {
        return setError('Total copies must be >= 0')
      }

      const { data } = await axios.put(`/api/admin/books/${book._id}`, payload)
      onSaved?.(data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 card bg-white border border-slate-200 rounded-xl shadow-lg">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Edit Book</h3>
          <button className="btn-ghost px-2 py-1 rounded-md" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.title} onChange={updateField('title')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Author</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.author} onChange={updateField('author')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ISBN</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.ISBN} onChange={updateField('ISBN')} disabled />
              <p className="text-xs text-slate-500 mt-1">ISBN is not editable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Copies</label>
              <input type="number" min="0" className="mt-1 w-full border rounded-md px-3 py-2" value={form.totalCopies} onChange={updateField('totalCopies')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Cover Image URL</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.coverImageUrl} onChange={updateField('coverImageUrl')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea rows={3} className="mt-1 w-full border rounded-md px-3 py-2" value={form.description} onChange={updateField('description')} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Genres</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" value={form.genres} onChange={updateField('genres')} placeholder="e.g. Fiction, Mystery, Classics" />
              <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Rating (0–5)</label>
              <input type="number" step="0.1" min="0" max="5" className="mt-1 w-full border rounded-md px-3 py-2" value={form.rating} onChange={updateField('rating')} />
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={disabled} className="btn">{saving ? 'Saving…' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
