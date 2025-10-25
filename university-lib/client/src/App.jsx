import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthForm from './components/Auth'
import ProtectedRoute from './components/ProtectedRoute'
import StudentDashboard from './pages/StudentDashboard'
import AvailableSoon from './pages/AvailableSoon'
import MyLoans from './pages/MyLoans'
import AdminDashboard from './pages/AdminDashboard'
import AdminActivity from './pages/AdminActivity'
import AdminInventory from './pages/AdminInventory'
import AdminAddBook from './pages/AdminAddBook'
import AdminSettings from './pages/AdminSettings'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Universities from './pages/Universities'

function RootRoutes() {
  const { fetchUser } = useAuth()
  useEffect(() => { fetchUser() }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/login/student" />} />
      <Route path="/login/student" element={<AuthForm mode="login" variant="student" />} />
      <Route path="/login/admin" element={<AuthForm mode="login" variant="admin" />} />
      <Route path="/register" element={<AuthForm mode="register" variant="student" />} />
  <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/universities" element={<Universities />} />

      <Route element={<ProtectedRoute allowed={["Student", "Admin"]} />}> 
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/dashboard/soon" element={<AvailableSoon />} />
        <Route path="/dashboard/loans" element={<MyLoans />} />
      </Route>

      <Route element={<ProtectedRoute allowed={["Admin"]} />}> 
            <Route path="/admin/dashboard" element={<AdminInventory />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/add" element={<AdminAddBook />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
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
