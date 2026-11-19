"use client"

import { useEffect, useState } from "react"
import {
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Crown
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import type { Organizer } from "@/types/team"

export default function OrganizersPage() {
  const { isAdmin } = useAuth()
  const [organizers, setOrganizers] = useState<Organizer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ user_id: string; first_name: string; last_name: string; email: string; roles: string[] }[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadOrganizers() {
    try {
      setLoading(true)
      const res = await fetch("/api/volunteers/organizers")
      if (res.ok) {
        const data = await res.json()
        setOrganizers(Array.isArray(data) ? data : [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizers()
  }, [])

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q)
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearchingUsers(true)
      const res = await fetch(`/api/volunteers/search?q=${encodeURIComponent(q.trim())}&limit=8`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      }
    } catch {
      setSearchResults([])
    } finally {
      setSearchingUsers(false)
    }
  }

  const handlePromoteToOrganizer = async (u: { user_id: string; first_name: string; last_name: string; email: string }) => {
    try {
      const res = await fetch("/api/volunteers/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: u.user_id, role: "organizer" })
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `${u.first_name} ${u.last_name} promoted to festival organizer.`
        })
        setAddModalOpen(false)
        setUserSearchQuery("")
        setSearchResults([])
        await loadOrganizers()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to promote user to organizer")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error promoting organizer"
      })
    }
  }

  const handleRemoveOrganizer = async (org: Organizer) => {
    if (!confirm(`Revoke organizer privileges from ${org.first_name} ${org.last_name}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/volunteers/organizers/${org.user_id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Organizer role revoked from ${org.first_name}.`
        })
        await loadOrganizers()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to remove organizer privileges")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating role"
      })
    }
  }

  const filteredOrganizers = organizers.filter((o) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      o.first_name.toLowerCase().includes(q) ||
      o.last_name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Governance & Executive Access
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Organizers & Lead Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Festival leads and administrators with system privileges to manage spots, sessions, and ticket pricing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadOrganizers}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh Organizers"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="flex h-9 items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 text-xs font-semibold uppercase tracking-wider text-white transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Promote Organizer</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between border p-3.5 text-xs ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="border border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Authorized Leads Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredOrganizers.length} administrative members</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-950 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="px-5 py-3">Lead Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Contact Phone</th>
                <th className="px-5 py-3">Permissions & Roles</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading organizer roster...
                  </td>
                </tr>
              ) : filteredOrganizers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No organizers found.
                  </td>
                </tr>
              ) : (
                filteredOrganizers.map((org) => {
                  const isUserAdmin = org.roles.includes("admin")
                  return (
                    <tr key={org.user_id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {isUserAdmin && <Crown className="h-3.5 w-3.5 text-amber-600" />}
                          <span>{org.first_name} {org.last_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">
                        {org.email}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-600">
                        {org.phone || "No phone"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {org.roles.map((r) => (
                            <span
                              key={r}
                              className={`px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase ${
                                r === "admin"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : r === "organizer"
                                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {r.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isAdmin && !isUserAdmin && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOrganizer(org)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Demote from organizer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950">
                Promote to Festival Organizer
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                Search Registered Users
              </label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {searchingUsers ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-1 text-slate-400" />
                  Searching user database...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50/50"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePromoteToOrganizer(u)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
                    >
                      Promote to Organizer
                    </button>
                  </div>
                ))
              ) : userSearchQuery.length >= 2 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No users found matching query.
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Type at least 2 characters to search users.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
