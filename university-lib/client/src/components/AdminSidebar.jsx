import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Item = ({ to, label }) => {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-2 rounded-lg ${active ? 'bg-white/10 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
      <span className="text-sm">{label}</span>
    </Link>
  )
}

export default function AdminSidebar() {
  return (
    <aside className="bg-brand-navy text-white w-60 min-h-screen p-4 hidden md:block">
      <div className="text-2xl font-extrabold mb-6">UniLib</div>
      <nav className="space-y-2">
        <Item to="/admin/dashboard" label="Dashboard" />
        <Item to="/admin/dashboard#add" label="Add Book" />
        <Item to="/admin/dashboard#loans" label="Manage Loans" />
      </nav>
    </aside>
  )
}
