"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

function AuthForm() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const res = await login(email.trim(), password, redirectParam)
    if (!res.success) {
      setError(res.error || "Authentication failed. Check your email and password.")
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Team Portal</span>
        </Link>
      </div>

      <div className="border border-slate-200 bg-white p-8">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-slate-900 flex items-center justify-center font-bold text-white text-[10px]">
              AWS
            </div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Re:Invent Fest 2026
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
            Sign In to Operations
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Enter your official account credentials to access gate scanners or administrative systems.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Account Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@awslpu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-full border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex h-9 w-full items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-50 transition"
          >
            <span>{submitting ? "Authenticating..." : "Sign In to Operations"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-start gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-700 shrink-0 mt-0.5" />
            <span>
              Volunteers are directed to the Gate Scanner Desk. Organizers and Admins are directed to the Command Console.
            </span>
          </div>
          <p className="text-slate-400 pt-1">
            For account credentials or shift re-assignment, contact Room 32-104.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense
        fallback={
          <div className="text-xs text-slate-500">Loading form...</div>
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  )
}
