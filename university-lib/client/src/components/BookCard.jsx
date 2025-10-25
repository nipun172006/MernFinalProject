import React, { useState } from 'react'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'

export default function BookCard({ book, onBorrow, onReturn, isLoaned, finePerDay, settings, onDelete }) {
  const available = (book?.availableCopies ?? 0) > 0
  const defaultDays = Math.max(1, Number(settings?.loanDaysDefault || 7))
  const [durationDays, setDurationDays] = useState(defaultDays)

  const durations = [7, 14, 21, 28]
  const labelFor = (d) => (d === 7 ? '1w' : d === 14 ? '2w' : d === 21 ? '3w' : '4w')

  return (
    <div className="card overflow-hidden border border-slate-200/70 rounded-xl shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-white group">
      <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
        {book?.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-slate-400">No Image</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[1.06rem] font-semibold text-slate-900 leading-tight tracking-tight">{book.title}</h3>
            <p className="text-slate-600 text-sm mt-0.5">{book.author || 'Unknown author'}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${available ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
              {available ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> : <Clock className="h-3.5 w-3.5" aria-hidden />}
              {available ? 'Available' : 'On loan'}
            </span>
            {onDelete && (
              <button
                type="button"
                className="btn-ghost p-1.5 rounded-md hover:bg-red-50 text-red-600"
                aria-label="Delete book"
                onClick={() => onDelete(book._id)}
                title="Delete book"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {book.ISBN && <p className="text-xs text-slate-500 mt-2">ISBN: {book.ISBN}</p>}
        <div className="mt-3 text-xs text-slate-600 flex items-center gap-4">
          <span>Available: {book.availableCopies ?? 0}{book.totalCopies != null ? ` / ${book.totalCopies}` : ''}</span>
          {book.borrowCount != null && <span>Popularity: {book.borrowCount}</span>}
        </div>
        {!available && (book.nextAvailableInDays != null) && (
          <div className="mt-2 text-xs text-slate-600">
            Soonest copy in <span className="font-medium">{book.nextAvailableInDays} day{book.nextAvailableInDays === 1 ? '' : 's'}</span>
          </div>
        )}
        {finePerDay != null && (
          <div className="mt-2 text-xs text-slate-600">Late return fine: <span className="font-medium">{finePerDay}</span> per day</div>
        )}

        {onBorrow && available && (
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">Loan duration</div>
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100/80 border border-slate-200">
                {durations.map((d) => {
                  const selected = durationDays === d
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={selected}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${selected ? 'bg-[#d4af37] text-white shadow' : 'text-slate-700 hover:bg-white'}`}
                      onClick={() => setDurationDays(d)}
                    >
                      {labelFor(d)}
                    </button>
                  )
                })}
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center rounded-lg bg-[#d4af37] text-white px-4 py-2 font-medium shadow hover:opacity-95 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]" onClick={() => onBorrow(book._id, durationDays)}>Borrow</button>
          </div>
        )}

        {onReturn && isLoaned && (
          <button className="btn w-full mt-3" onClick={() => onReturn(isLoaned._id)}>Return</button>
        )}
      </div>
    </div>
  )
}
