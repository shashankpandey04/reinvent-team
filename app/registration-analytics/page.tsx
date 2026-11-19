"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Layers,
  IndianRupee,
  AlertCircle
} from "lucide-react"
import type { RegistrationAnalytics } from "@/types/team"

export default function RegistrationAnalyticsPage() {
  const [stats, setStats] = useState<RegistrationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  async function loadData() {
    try {
      setLoading(true)
      const res = await fetch("/api/orders/analytics")
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
    loadData()
  }, [])

  const filteredOrders = (stats?.recent_orders || []).filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      o.user_name.toLowerCase().includes(q) ||
      o.user_email.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)

    return matchesStatus && matchesQuery
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Financial Telemetry & Registrations
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Registration & Sales Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time revenue collections, payment transaction breakdown, and tier capacity tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Gross Revenue (INR)</span>
            <IndianRupee className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : `₹${(stats?.total_revenue_in_inr ?? 0).toLocaleString("en-IN")}`}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Net collected from confirmed orders
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Paid Orders</span>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.paid_orders ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Successfully captured payments
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Pending Orders</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.pending_orders ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Awaiting checkout completion
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono uppercase">
            <span>Total Orders Initiated</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-950 font-mono">
            {loading ? "..." : (stats?.total_orders ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            All order attempts logged
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-bold text-slate-950 mb-4">Tier Inventory & Sales Quotas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!stats?.categories || stats.categories.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              No ticket tiers configured.
            </div>
          ) : (
            stats.categories.map((c) => {
              const claimed = (c.quantity_sold || 0) + (c.quantity_reserved || 0)
              const percent = c.quantity > 0 ? Math.min(100, Math.round((claimed / c.quantity) * 100)) : 0

              return (
                <div key={c.id} className="p-4 border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-xs text-slate-950">{c.name}</div>
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {c.price_in_paise === 0 ? "FREE" : `₹${(c.price_in_paise / 100).toLocaleString("en-IN")}`}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>Claimed / Total</span>
                      <span className="font-semibold text-slate-900">
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
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Sold: {c.quantity_sold || 0}</span>
                    <span className="font-medium text-slate-800">{c.available} available</span>
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
            <h2 className="text-sm font-bold text-slate-950">Recent Order Transactions</h2>
            <p className="text-xs text-slate-500 mt-0.5">Attendee pass purchase registrations</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:border-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-slate-900 transition"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Attendee</th>
                <th className="px-5 py-3">Transaction Ref</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No order records found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">
                      {o.id.slice(0, 10)}...
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{o.user_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{o.user_email}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-700">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-900">
                      ₹{((o.total_amount || 0) / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">
                      {new Date(o.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {o.status === "paid" ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          PAID
                        </span>
                      ) : o.status === "pending" ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                          {o.status.toUpperCase()}
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
