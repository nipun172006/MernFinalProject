import React from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { BookOpen, Users, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero: Minimal gradient + glass card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-accent/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-navy/10 blur-3xl" />

          <div className="relative w-full px-6 py-24 md:py-28 lg:py-32">
            <div className="mx-auto max-w-7xl grid md:grid-cols-2 items-center gap-12">
              <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-xl rounded-2xl p-8 md:p-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-slate-900">
                  Your University Library, <span className="text-brand-accent">Unified</span>.
                </h1>
                <p className="mt-5 text-lg text-slate-600 max-w-prose">
                  Borrow smarter, manage faster, and keep access limited to your campus with domain-based accounts.
                </p>
                <div className="mt-8">
                  <Link to="/login" className="btn bg-brand-accent text-white w-full md:w-auto px-6 py-3 text-base">
                    Login / Start Session
                  </Link>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-xl p-6">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXBBPZzW30rg3w8fvEUKGpCayryJswGqQkVIZijCpQn1V3aZVlfRZiJfEIRsIgajy9rwE&usqp=CAU" alt="Library preview" className="h-64 w-full object-cover rounded-lg" />
                  <p className="text-sm text-slate-600 mt-3">
                    Preview your library cards and inventory dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards: depth + micro-interactions */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-6">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="text-lg font-semibold text-slate-900">Borrow with Ease</div>
              <p className="text-sm text-slate-600 mt-2">Find and borrow books in clicks. Availability indicators help you plan ahead.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-6">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-lg font-semibold text-slate-900">Admin-Friendly</div>
              <p className="text-sm text-slate-600 mt-2">Bulk import CSVs and manage your library inventory in one place.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-6">
              <div className="h-12 w-12 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-lg font-semibold text-slate-900">Campus-Only Access</div>
              <p className="text-sm text-slate-600 mt-2">Students sign in with campus domains—keeping your library truly your own.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
