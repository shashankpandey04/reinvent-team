"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  QrCode,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building2,
  AlertCircle,
  Layers,
  RefreshCw,
  Ticket
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import type { AttendanceAnalytics, RegistrationAnalytics } from "@/types/team"

export default function DashboardOverviewPage() {
  const { user, isAdmin, isOrganizer, isVolunteer } = useAuth()
  const [attStats, setAttStats] = useState<AttendanceAnalytics | null>(null)
  const [regStats, setRegStats] = useState<RegistrationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      setLoading(true)
      const [attRes, regRes] = await Promise.allSettled([
        fetch("/api/attendance/analytics"),
        fetch("/api/orders/analytics")
      ])

      if (attRes.status === "fulfilled" && attRes.value.ok) {
        const data = await attRes.value.json()
        setAttStats(data)
      }
      if (regRes.status === "fulfilled" && regRes.value.ok) {
        const data = await regRes.value.json()
        setRegStats(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const fullName = user ? `${user.first_name} ${user.last_name}` : "Team Member"
  const primaryRole = isAdmin ? "Administrator" : isOrganizer ? "Organizer" : "Volunteer Staff"

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            <span>Operations Console</span>
            <span>/</span>
            <span className="text-slate-900">{primaryRole}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Welcome, {fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time gate attendance, venue throughput, and ticket registration telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/attendance"
            className="flex h-9 items-center gap-2 bg-slate-900 px-3.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Open Scanner Desk</span>
          </Link>
        </div>
      </div>

      {isVolunteer && !isAdmin && !isOrganizer && (
        <div className="border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Volunteer Duty:</span> You are signed in with Gate Volunteer permissions.
            Please access the <strong>Scanner Desk</strong> to verify attendee passes at your designated campus post.
          </div>
          <Link
            href="/attendance"
            className="bg-amber-700 px-3 py-1 font-semibold text-white hover:bg-amber-800 transition text-[11px]"
          >
            Go to Scanner Desk
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Unique Admitted</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 font-mono">
              {loading ? "..." : (attStats?.unique_attendees ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {(attStats?.total_valid_tickets ?? 0).toLocaleString()} passes
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Turnout Rate</span>
            <span className="font-semibold text-slate-900 font-mono">
              {attStats?.attendance_rate ?? 0}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${Math.min(100, attStats?.attendance_rate ?? 0)}%` }}
            />
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Gate Scans</span>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 font-mono">
              {loading ? "..." : (attStats?.total_scans ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">scans recorded</span>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span>Across all checkpoints</span>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Gross Ticket Sales</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 font-mono">
              {loading
                ? "..."
                : `₹${(regStats?.total_revenue_in_inr ?? 0).toLocaleString("en-IN")}`}
            </span>
            <span className="text-xs text-slate-500 font-mono">INR</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Paid Orders:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {regStats?.paid_orders ?? 0}
            </span>
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Orders</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-950 font-mono">
              {loading ? "..." : (regStats?.total_orders ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">transactions</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Pending/Processing:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {regStats?.pending_orders ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Checkpoint Traffic Volume</h2>
              <p className="text-xs text-slate-500">Attendance distribution across physical scan posts</p>
            </div>
            <Link
              href="/attendance-analytics"
              className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1 transition"
            >
              <span>View Audit Logs</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {!attStats?.by_checkpoint || attStats.by_checkpoint.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No checkpoint attendance activity recorded yet.
              </div>
            ) : (
              attStats.by_checkpoint.map((cp) => {
                const maxCount = Math.max(...attStats.by_checkpoint.map((c) => c.count), 1)
                const percentage = Math.round((cp.count / maxCount) * 100)

                return (
                  <div key={cp.checkpoint_id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {cp.name} <span className="text-slate-500">({cp.spot_name})</span>
                      </span>
                      <span className="font-semibold text-slate-950 font-mono">
                        {cp.count.toLocaleString()} scans
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-slate-900 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Recent Check-In Stream</h2>
                <p className="text-xs text-slate-500">Latest gate validations</p>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </div>

            <div className="mt-4 space-y-2 max-h-[320px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {!attStats?.recent_scans || attStats.recent_scans.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Clock className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                  No live scans recorded yet.
                </div>
              ) : (
                attStats.recent_scans.slice(0, 6).map((scan, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between pt-2.5 pb-1 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-900 truncate">{scan.attendee_name}</div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">{scan.checkpoint_name}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        VALID
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {new Date(scan.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/attendance"
              className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 py-2 text-xs font-semibold uppercase tracking-wider text-slate-800 transition"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-600" />
              <span>Launch Attendance Scanner</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Ticket Categories & Inventory Quotas</h2>
            <p className="text-xs text-slate-500">Capacity claimed vs. available by pass tier</p>
          </div>
          <Link
            href="/ticket-categories"
            className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1 transition"
          >
            <span>Manage All Tiers</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!regStats?.categories || regStats.categories.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No ticket tiers configured.
            </div>
          ) : (
            regStats.categories.map((c) => {
              const claimed = (c.quantity_sold || 0) + (c.quantity_reserved || 0)
              const percent = c.quantity > 0 ? Math.min(100, Math.round((claimed / c.quantity) * 100)) : 0

              return (
                <div key={c.id} className="p-4 border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-xs text-slate-950">{c.name}</div>
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {c.price_in_paise === 0 ? "FREE" : `₹${(c.price_in_paise / 100).toLocaleString("en-IN")}`}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Claimed / Total</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {claimed} / {c.quantity} ({percent}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-slate-900 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Sold: {c.quantity_sold || 0}</span>
                    <span className="font-medium text-slate-800">{c.available} available</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Quick Operations Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/attendance"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <QrCode className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Scan Desk</div>
          </Link>
          <Link
            href="/volunteers"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <Users className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Volunteer Crew</div>
          </Link>
          <Link
            href="/spots"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <MapPin className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Campus Spots</div>
          </Link>
          <Link
            href="/venues"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <Building2 className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Halls & Stages</div>
          </Link>
          <Link
            href="/sessions"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <Calendar className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Agenda</div>
          </Link>
          <Link
            href="/tickets"
            className="p-3.5 border border-slate-200 bg-white hover:border-slate-400 text-center transition"
          >
            <Ticket className="h-4 w-4 mx-auto text-slate-700" />
            <div className="text-xs font-medium text-slate-900 mt-2">Issued Passes</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
