import React, { useState } from 'react'
import { BookOpen, Clock, Bookmark, Library, ChevronDown, ChevronRight } from 'lucide-react'

export default function StudentSidebar({ counts, active = 'available', onNav, loansPreview = [], availablePreview = [], predictionsPreview = [] }) {
  const [open, setOpen] = useState({ loans: true, available: true, soon: false })
  const item = (key, Icon, label, count) => (
    <button
      onClick={() => onNav?.(key)}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left ${
        active === key ? 'bg-brand-navy text-white' : 'hover:bg-slate-100 text-slate-700'
      }`}
    >
      <span className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${active === key ? 'text-white' : 'text-slate-500'}`} />
        <span className="font-medium">{label}</span>
      </span>
      <span className={`inline-flex items-center justify-center text-xs font-semibold rounded-full px-2 py-0.5 ${
        active === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
      }`}>
        {count}
      </span>
    </button>
  )

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
      <div className="sticky top-0 p-4 space-y-3">
        <div className="text-xs uppercase tracking-wide text-slate-500">Browse</div>
        <nav className="space-y-1">
          {item('available', BookOpen, 'Available Now', counts?.available ?? 0)}
          {item('soon', Clock, 'Available Soon', counts?.soon ?? 0)}
          {item('loans', Bookmark, 'My Loans', counts?.loans ?? 0)}
          {item('all', Library, 'All Books', counts?.all ?? 0)}
        </nav>
        <div className="pt-2">
          <button onClick={() => setOpen(o => ({ ...o, loans: !o.loans }))} className="w-full flex items-center justify-between text-sm text-slate-700 hover:text-slate-900">
            <span className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-slate-500" /> My Loans</span>
            {open.loans ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {open.loans && (
            <ul className="mt-2 space-y-2">
              {loansPreview.length === 0 && <li className="text-xs text-slate-500">No loans yet.</li>}
              {loansPreview.slice(0, 5).map((l) => (
                <li key={l._id} className="text-sm text-slate-700 truncate">• {l.bookItemRef?.title || 'Untitled'}</li>
              ))}
              {loansPreview.length > 0 && (
                <li>
                  <button className="text-xs text-brand-accent hover:underline" onClick={() => onNav?.('loans')}>View all</button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div>
          <button onClick={() => setOpen(o => ({ ...o, available: !o.available }))} className="w-full flex items-center justify-between text-sm text-slate-700 hover:text-slate-900">
            <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-500" /> Available Now</span>
            {open.available ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {open.available && (
            <ul className="mt-2 space-y-2">
              {availablePreview.slice(0, 5).map((b) => (
                <li key={b._id} className="text-sm text-slate-700 truncate">• {b.title}</li>
              ))}
              {availablePreview.length > 0 && (
                <li>
                  <button className="text-xs text-brand-accent hover:underline" onClick={() => onNav?.('available')}>Browse all</button>
                </li>
              )}
            </ul>
          )}
        </div>

        <div>
          <button onClick={() => setOpen(o => ({ ...o, soon: !o.soon }))} className="w-full flex items-center justify-between text-sm text-slate-700 hover:text-slate-900">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-500" /> Available Soon</span>
            {open.soon ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {open.soon && (
            <ul className="mt-2 space-y-2">
              {predictionsPreview.slice(0, 5).map((p) => (
                <li key={p._id} className="text-sm text-slate-700 truncate">• {p.title}</li>
              ))}
              {predictionsPreview.length > 0 && (
                <li>
                  <button className="text-xs text-brand-accent hover:underline" onClick={() => onNav?.('soon')}>See predictions</button>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </aside>
  )
}
