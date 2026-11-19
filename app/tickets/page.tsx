"use client"

import { useEffect, useState } from "react"
import { Ticket, Search, Check, Copy, RefreshCw } from "lucide-react"
import type { IssuedTicket } from "@/types/team"

export default function IssuedTicketsPage() {
  const [tickets, setTickets] = useState<IssuedTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function loadTickets() {
    try {
      setLoading(true)
      const res = await fetch("/api/tickets/all?limit=150")
      if (res.ok) {
        const data = await res.json()
        setTickets(Array.isArray(data) ? data : [])
      }
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      t.user_name.toLowerCase().includes(q) ||
      t.user_email.toLowerCase().includes(q) ||
      t.ticket_code.toLowerCase().includes(q) ||
      t.category_name.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Pass Master Registry
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Confirmed Attendee Passes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issued attendee passes with verification codes for manual admission lookup or pass assistance.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          disabled={loading}
          className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Passes</span>
        </button>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Verified Pass Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredTickets.length} confirmed passes</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ticket code..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="px-5 py-3">Attendee</th>
                <th className="px-5 py-3">Pass Category</th>
                <th className="px-5 py-3">Ticket Verification Code</th>
                <th className="px-5 py-3">Issued Date</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading verified passes...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No attendee passes found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{t.user_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{t.user_email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-800">
                        {t.category_name}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-900 font-medium">{t.ticket_code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(t.ticket_code, t.id)}
                          className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Copy Code"
                        >
                          {copiedId === t.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">
                      {t.issued_at
                        ? new Date(t.issued_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {t.status === "valid" ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          VALID
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                          {t.status.toUpperCase()}
                        </span>
                      )}
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
