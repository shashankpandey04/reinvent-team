"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Users,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp
} from "lucide-react"
import type { AttendanceAnalytics } from "@/types/team"

export default function AttendanceAnalyticsPage() {
  const [stats, setStats] = useState<AttendanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  async function loadAnalytics() {
    try {
      setLoading(true)
      const res = await fetch("/api/attendance/analytics")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const filteredLogs = (stats?.recent_scans || []).filter((s) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      s.attendee_name.toLowerCase().includes(q) ||
      s.attendee_email.toLowerCase().includes(q) ||
      s.checkpoint_name.toLowerCase().includes(q) ||
      s.scanned_by.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Attendance Intelligence & Audit
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Attendance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time checkpoint velocity, conversion rate, unique attendee totals, and verification audit trail.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          disabled={loading}
          className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Unique Admitted</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.unique_attendees ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-mono">
            of {(stats?.total_valid_tickets ?? 0).toLocaleString()} confirmed passes
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Turnout Rate</span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : `${stats?.attendance_rate ?? 0}%`}
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${Math.min(100, stats?.attendance_rate ?? 0)}%` }}
            />
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Total Gate Scans</span>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.total_scans ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Including multi-checkpoint re-entries
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Active Checkpoints</span>
            <MapPin className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.by_checkpoint?.length ?? 0)}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Recording real-time scans
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-bold text-slate-950 mb-4">Checkpoint Throughput Distribution</h2>
        <div className="space-y-4">
          {!stats?.by_checkpoint || stats.by_checkpoint.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No checkpoint scans recorded yet.
            </div>
          ) : (
            stats.by_checkpoint.map((cp) => {
              const maxVal = Math.max(...stats.by_checkpoint.map((c) => c.count), 1)
              const pct = Math.round((cp.count / maxVal) * 100)

              return (
                <div key={cp.checkpoint_id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {cp.name} <span className="text-slate-500">({cp.spot_name})</span>
                    </span>
                    <span className="font-mono text-slate-950 font-semibold">{cp.count} scans</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Verification Audit Trail</h2>
            <p className="text-xs text-slate-500 mt-0.5">Verified check-in history logged with scanner operator identity</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by attendee or checkpoint..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="px-5 py-3">Attendee</th>
                <th className="px-5 py-3">Checkpoint</th>
                <th className="px-5 py-3">Operator</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No verification records matching the search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{log.attendee_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{log.attendee_email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800">{log.checkpoint_name}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-slate-600">{log.scanned_by}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500">
                      {new Date(log.scanned_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ADMITTED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
