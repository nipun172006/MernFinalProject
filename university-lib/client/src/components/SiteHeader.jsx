import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth()
  const { pathname } = useLocation()
  const tabActive = 'btn !bg-white !text-brand-navy'
  const tabInactive = '!btn btn-outline !text-white !border-white'
  return (
    <header className="bg-brand-navy text-white">
      <div className="w-full px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold">UniLib</span>
        </Link>
        <nav className="flex items-center gap-3">
          {isAuthenticated && user?.role === 'Admin' && (
            <>
              <Link to="/admin/activity" className={pathname.startsWith('/admin/activity') ? tabActive : tabInactive}>Activity</Link>
              <Link to="/admin/inventory" className={(pathname.startsWith('/admin/inventory') || pathname === '/admin/dashboard') ? tabActive : tabInactive}>Inventory</Link>
              <Link to="/admin/add" className={pathname.startsWith('/admin/add') ? tabActive : tabInactive}>Add Books</Link>
              <Link to="/admin/settings" className={pathname.startsWith('/admin/settings') ? tabActive : tabInactive}>Settings</Link>
            </>
          )}
          {isAuthenticated && user?.role === 'Student' && (
            <>
              <Link to="/dashboard" className={pathname === '/dashboard' ? tabActive : tabInactive}>Search</Link>
              <Link to="/dashboard/soon" className={pathname.startsWith('/dashboard/soon') ? tabActive : tabInactive}>Available Soon</Link>
              <Link to="/dashboard/loans" className={pathname.startsWith('/dashboard/loans') ? tabActive : tabInactive}>My Loans</Link>
            </>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/universities" className="btn bg-brand-accent">Universities</Link>
              <Link to="/onboarding" className="btn bg-brand-accent">+ Add University</Link>
              <Link to="/login/student" className="btn bg-brand-accent">Student Login</Link>
              <Link to="/login/admin" className="btn bg-brand-accent">Admin Login</Link>
            </>
          ) : (
            <button onClick={logout} className="btn bg-red-500 hover:opacity-90">Logout</button>
          )}
        </nav>
      </div>
    </header>
  )
}
