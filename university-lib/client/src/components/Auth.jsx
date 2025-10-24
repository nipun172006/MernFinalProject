import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import SiteHeader from './SiteHeader'

export default function AuthForm({ mode = 'login', variant = 'student' }) {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        const res = await register(email, password)
        // default student
        navigate('/dashboard')
      } else {
        const res = await login(email, password)
        if (res.role === 'Admin') navigate('/admin/dashboard')
        else navigate('/dashboard')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Error')
    }
  }

  const isAdmin = variant === 'admin'

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-sm mx-auto px-4 py-10">
          <h2 className="text-2xl font-extrabold text-brand-navy mb-4">
            {mode === 'register' ? 'Student Registration' : isAdmin ? 'Admin Login' : 'Student Login'}
          </h2>
          {error && <div className="mb-3 text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}
          <form onSubmit={onSubmit} className="card p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  className="input pr-10"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn w-full">
              {mode === 'register' ? 'Create Account' : isAdmin ? 'Login as Admin' : 'Login as Student'}
            </button>
          </form>
          {!isAdmin && (
            <div className="mt-3 text-sm">
              {mode === 'register' ? (
                <a href="/login/student" className="text-brand-navy underline">Already have an account? Login</a>
              ) : (
                <a href="/register" className="text-brand-navy underline">Need an account? Register</a>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
