"use client"

import Link from "next/link"
import { Menu, QrCode, Globe } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span className="text-xs font-semibold tracking-wider text-slate-800 uppercase font-mono">
            Operations Live
          </span>
          <span className="hidden sm:inline text-xs text-slate-300">/</span>
          <span className="hidden sm:inline text-xs text-slate-500">
            LPU Campus • Nov 12–16, 2026
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Globe className="h-3.5 w-3.5 text-slate-500" />
          <span>Team Portal</span>
        </Link>

        <Link
          href="/attendance"
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>Scanner Desk</span>
        </Link>
      </div>
    </header>
  )
}
