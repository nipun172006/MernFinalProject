import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SiteHeader from '../components/SiteHeader'

export default function AdminSettings() {
  const [form, setForm] = useState({ loanDaysDefault: '', finePerDay: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/university/settings')
        setForm({
          loanDaysDefault: data?.loanDaysDefault ?? 7,
          finePerDay: data?.finePerDay ?? 0,
        })
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        loanDaysDefault: Number(form.loanDaysDefault),
        finePerDay: Number(form.finePerDay),
      }
      const { data } = await axios.patch('/api/admin/university/settings', payload)
      setForm({
        loanDaysDefault: data?.loanDaysDefault ?? form.loanDaysDefault,
        finePerDay: data?.finePerDay ?? form.finePerDay,
      })
      setToast('Settings updated')
      setTimeout(() => setToast(''), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-slate-50">
        <div className="w-full px-4 py-6">
          <h2 className="text-2xl font-bold text-slate-900">University Settings</h2>
          {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          {toast && <div className="fixed right-6 top-20 z-50 card bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 shadow-sm">{toast}</div>}

          <form onSubmit={onSubmit} className="card p-5 mt-4 grid gap-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-slate-700">Default Loan Days</label>
              <input
                className="input"
                type="number"
                min={1}
                name="loanDaysDefault"
                value={form.loanDaysDefault}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Fine Per Day</label>
              <input
                className="input"
                type="number"
                step="0.01"
                min={0}
                name="finePerDay"
                value={form.finePerDay}
                onChange={onChange}
                required
              />
            </div>
            <div>
              <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
