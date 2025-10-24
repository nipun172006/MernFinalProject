import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from '../components/SiteHeader'

export default function Onboarding() {
  const navigate = useNavigate()
  const { fetchUser } = useAuth()
  const [form, setForm] = useState({ universityName: '', domain: '', adminEmail: '', adminPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await axios.post('/api/onboarding/university-register', form)
      await fetchUser()
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create university')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-4 py-10">
          <h2 className="text-3xl font-extrabold text-brand-navy">Create Your University</h2>
          <p className="text-slate-600 mt-2">Set up your university and your first admin account.</p>
          {error && <div className="mt-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          <form onSubmit={submit} className="card p-5 mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">University Name</label>
              <input className="input" name="universityName" value={form.universityName} onChange={update} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">University Domain (e.g., example.edu)</label>
              <input className="input" name="domain" value={form.domain} onChange={update} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Email (must match the domain)</label>
              <input className="input" type="email" name="adminEmail" value={form.adminEmail} onChange={update} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admin Password</label>
              <input className="input" type="password" name="adminPassword" value={form.adminPassword} onChange={update} required />
            </div>
            <button type="submit" disabled={submitting} className="btn w-full">
              {submitting ? 'Creating…' : 'Create University and Continue'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
