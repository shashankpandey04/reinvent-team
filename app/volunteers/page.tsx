"use client"

import { useEffect, useState } from "react"
import {
  UserPlus,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from "lucide-react"
import type { Volunteer, Spot } from "@/types/team"

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ user_id: string; first_name: string; last_name: string; email: string; roles: string[] }[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [selectedSpotId, setSelectedSpotId] = useState("")

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const [volRes, spotsRes] = await Promise.allSettled([
        fetch("/api/volunteers"),
        fetch("/api/spots")
      ])

      if (volRes.status === "fulfilled" && volRes.value.ok) {
        const data = await volRes.value.json()
        setVolunteers(Array.isArray(data) ? data : [])
      }
      if (spotsRes.status === "fulfilled" && spotsRes.value.ok) {
        const data = await spotsRes.value.json()
        setSpots(Array.isArray(data) ? data : [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleAttendance = async (vol: Volunteer) => {
    const newScanState = !vol.attendance?.scan
    try {
      const res = await fetch(`/api/volunteers/${vol.user_id}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan: newScanState })
      })

      if (res.ok) {
        setVolunteers((prev) =>
          prev.map((v) =>
            v.user_id === vol.user_id
              ? { ...v, attendance: { ...v.attendance, scan: newScanState } }
              : v
          )
        )
        setFeedback({
          type: "success",
          text: `Scan permission ${newScanState ? "granted to" : "revoked from"} ${vol.first_name}.`
        })
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update permission")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating scanner permission"
      })
    }
  }

  const handleRemoveVolunteer = async (vol: Volunteer) => {
    if (!confirm(`Are you sure you want to demote ${vol.first_name} ${vol.last_name} from the volunteer crew?`)) {
      return
    }

    try {
      const res = await fetch(`/api/volunteers/${vol.user_id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setVolunteers((prev) => prev.filter((v) => v.user_id !== vol.user_id))
        setFeedback({
          type: "success",
          text: `${vol.first_name} ${vol.last_name} removed from volunteer team.`
        })
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to remove volunteer")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error removing volunteer"
      })
    }
  }

  const searchUsersForPromotion = async (q: string) => {
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

  const handlePromoteToVolunteer = async (targetUser: { user_id: string; first_name: string; last_name: string; email: string }) => {
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: targetUser.user_id })
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `${targetUser.first_name} ${targetUser.last_name} promoted to volunteer successfully.`
        })
        setAddModalOpen(false)
        setUserSearchQuery("")
        setSearchResults([])
        await loadData()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to promote user to volunteer")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error promoting user"
      })
    }
  }

  const openAssignModal = (vol: Volunteer) => {
    setSelectedVolunteer(vol)
    setSelectedSpotId(vol.allocated_spot?.spot_id || (spots[0]?.id || ""))
    setAssignModalOpen(true)
  }

  const handleAssignSpot = async () => {
    if (!selectedVolunteer || !selectedSpotId) return

    try {
      const res = await fetch(`/api/spots/${selectedSpotId}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selectedVolunteer.user_id })
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Duty spot assigned to ${selectedVolunteer.first_name}.`
        })
        setAssignModalOpen(false)
        await loadData()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to assign spot")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error assigning spot"
      })
    }
  }

  const handleDeallocateSpot = async (vol: Volunteer) => {
    if (!vol.allocated_spot) return
    try {
      const res = await fetch(`/api/spots/${vol.allocated_spot.spot_id}/volunteers/${vol.user_id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Spot deallocated for ${vol.first_name}.`
        })
        await loadData()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to deallocate spot")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deallocating spot"
      })
    }
  }

  const filteredVolunteers = volunteers.filter((v) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      v.first_name.toLowerCase().includes(q) ||
      v.last_name.toLowerCase().includes(q) ||
      v.email.toLowerCase().includes(q) ||
      (v.allocated_spot && v.allocated_spot.name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Workforce & Shift Operations
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Volunteer Crew Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Allocate campus gate duty spots, manage scanning privileges, and oversee festival volunteer staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh Volunteers"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-9 items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 text-xs font-semibold uppercase tracking-wider text-white transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Volunteer</span>
          </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Volunteers</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{volunteers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Confirmed crew members</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Active Scanners</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {volunteers.filter((v) => v.attendance?.scan).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">With scanner gate permissions</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Spots Allocated</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {volunteers.filter((v) => v.allocated_spot).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Assigned to campus gates</div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Volunteer Roster</h2>
            <p className="text-xs text-slate-500 mt-0.5">Showing {filteredVolunteers.length} crew records</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by volunteer name or spot..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-950 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
              <tr>
                <th className="px-5 py-3">Volunteer</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Assigned Duty Spot</th>
                <th className="px-5 py-3">Scanner Access</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading volunteer workforce...
                  </td>
                </tr>
              ) : filteredVolunteers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No volunteers found. Click &quot;Add Volunteer&quot; to promote registered users.
                  </td>
                </tr>
              ) : (
                filteredVolunteers.map((vol) => (
                  <tr key={vol.user_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">
                        {vol.first_name} {vol.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{vol.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-slate-600 font-mono">{vol.phone || "No phone"}</div>
                    </td>
                    <td className="px-5 py-3">
                      {vol.allocated_spot ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-800">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{vol.allocated_spot.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">({vol.allocated_spot.code})</span>
                          <button
                            type="button"
                            onClick={() => handleDeallocateSpot(vol)}
                            className="ml-1 text-slate-400 hover:text-rose-600"
                            title="Unassign spot"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openAssignModal(vol)}
                          className="text-[11px] font-medium text-slate-700 hover:underline"
                        >
                          + Assign Spot
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleAttendance(vol)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition ${
                          vol.attendance?.scan
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                      >
                        {vol.attendance?.scan ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                            <span>Scan Enabled</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-slate-400" />
                            <span>Scan Disabled</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openAssignModal(vol)}
                          className="px-2.5 py-1 border border-slate-300 bg-white text-[11px] text-slate-700 hover:bg-slate-50 transition"
                        >
                          Spot
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveVolunteer(vol)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Demote Volunteer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-700" />
                <span>Promote Registered User to Volunteer</span>
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
                Search Registered Attendees
              </label>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => searchUsersForPromotion(e.target.value)}
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
                      onClick={() => handlePromoteToVolunteer(u)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition"
                    >
                      Promote
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

      {assignModalOpen && selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-700" />
                <span>Assign Duty Spot</span>
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-600">
                Assigning spot for: <span className="font-semibold text-slate-900">{selectedVolunteer.first_name} {selectedVolunteer.last_name}</span>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
                  Select Campus Spot
                </label>
                <select
                  value={selectedSpotId}
                  onChange={(e) => setSelectedSpotId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 text-xs focus:border-slate-900 focus:outline-none"
                >
                  {spots.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} ({sp.code}) - {sp.building}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignSpot}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-white transition"
                >
                  Assign Duty Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
