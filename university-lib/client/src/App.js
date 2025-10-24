import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthForm from './components/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'

function RootRoutes() {
  const { fetchUser } = useAuth()
  useEffect(() => { fetchUser() }, [])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/register" element={<AuthForm mode="register" />} />

      <Route element={<ProtectedRoute allowed={['Student', 'Admin']} />}> 
        <Route path="/dashboard" element={<StudentDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowed={['Admin']} />}> 
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <RootRoutes />
    </AuthProvider>
  )
}
