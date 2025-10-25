import React from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { BookOpen, Users, Shield, ArrowRight, Building2, LogIn } from 'lucide-react'

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
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link to="/login/student" className="btn w-full md:w-auto px-6 py-3 text-base">
                    I'm a Student <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link to="/login/admin" className="btn-outline w-full md:w-auto px-6 py-3 text-base">
                    I'm an Admin <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-xl p-6">
                  <img src="https://i.pinimg.com/1200x/aa/f8/32/aaf832207e2468ecf13b21405ed66d64.jpg" alt="Library preview" className="h-64 w-full object-cover rounded-lg" />
                  <p className="text-sm text-slate-600 mt-3">
                    Preview your library cards and inventory dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting started: clear onboarding for first-time visitors */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-brand-navy">Getting Started</h2>
            <p className="text-slate-600 mt-2 max-w-3xl">Follow the quick steps below to begin. Choose the path that applies to you—student or administrator.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Student card */}
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">I'm a Student</h3>
                </div>
                <ol className="mt-4 space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  <li>Open Universities and find your campus.</li>
                  <li>Sign in with your campus email.</li>
                  <li>Search, check availability, and borrow books.</li>
                </ol>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/universities" className="btn-outline"><Building2 className="h-4 w-4 mr-2" /> Explore Universities</Link>
                  <Link to="/login/student" className="btn"><LogIn className="h-4 w-4 mr-2" /> Student Login</Link>
                </div>
              </div>

              {/* Admin card */}
              <div className="card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">I'm an Admin</h3>
                </div>
                <ol className="mt-4 space-y-2 text-sm text-slate-700 list-decimal list-inside">
                  <li>Create your university space.</li>
                  <li>Import your current catalog via CSV.</li>
                  <li>Enable borrowing and monitor activity.</li>
                </ol>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to="/onboarding" className="btn">+ Add University</Link>
                  <Link to="/login/admin" className="btn-outline">Admin Login</Link>
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
