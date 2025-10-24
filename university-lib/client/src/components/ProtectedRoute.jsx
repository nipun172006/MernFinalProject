import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ allowed = [] }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  if (allowed.length && !allowed.includes(user?.role)) return <Navigate to="/login" />

  return <Outlet />
}
