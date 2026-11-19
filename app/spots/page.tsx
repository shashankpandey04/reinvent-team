"use client"

import { useEffect, useState } from "react"
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Building2
} from "lucide-react"
import type { Spot, SpotType, Volunteer } from "@/types/team"

const spotTypes: { id: SpotType; label: string }[] = [
  { id: "gate", label: "Gate" },
  { id: "desk", label: "Registration Desk" },
  { id: "stage", label: "Stage" },
  { id: "hall", label: "Hall" },
  { id: "pavilion", label: "Pavilion" },
  { id: "lounge", label: "Lounge" },
  { id: "other", label: "Other" }
]

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSpot, setEditingSpot] = useState<Spot | null>(null)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [type, setType] = useState<SpotType>("desk")
  const [description, setDescription] = useState("")
  const [building, setBuilding] = useState("")
  const [floor, setFloor] = useState("")
  const [room, setRoom] = useState("")
  const [capacity, setCapacity] = useState<number | "">("")
  const [submitting, setSubmitting] = useState(false)

  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false)
  const [activeSpotForVolunteers, setActiveSpotForVolunteers] = useState<Spot | null>(null)
  const [spotVolunteers, setSpotVolunteers] = useState<Volunteer[]>([])
  const [loadingVolunteers, setLoadingVolunteers] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadSpots() {
    try {
      setLoading(true)
      const res = await fetch("/api/spots")
      if (res.ok) {
        const data = await res.json()
        setSpots(Array.isArray(data) ? data : [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpots()
  }, [])

  const resetForm = () => {
    setEditingSpot(null)
    setName("")
    setCode("")
    setType("desk")
    setDescription("")
    setBuilding("")
    setFloor("")
    setRoom("")
    setCapacity("")
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (sp: Spot) => {
    setEditingSpot(sp)
    setName(sp.name)
    setCode(sp.code)
    setType(sp.type)
    setDescription(sp.description || "")
    setBuilding(sp.building)
    setFloor(sp.floor || "")
    setRoom(sp.room || "")
    setCapacity(sp.capacity ?? "")
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        name,
        code,
        type,
        description: description || undefined,
        building,
        floor: floor || undefined,
        room: room || undefined,
        capacity: capacity === "" ? undefined : Number(capacity)
      }

      const url = editingSpot ? `/api/spots/${editingSpot.id}` : "/api/spots"
      const method = editingSpot ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to save spot")
      }

      setFeedback({
        type: "success",
        text: editingSpot ? "Spot updated successfully" : "Spot created successfully"
      })
      setModalOpen(false)
      resetForm()
      await loadSpots()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving spot"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSpot = async (sp: Spot) => {
    if (!confirm(`Are you sure you want to delete spot "${sp.name}"?`)) return

    try {
      const res = await fetch(`/api/spots/${sp.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete spot")
      }

      setFeedback({ type: "success", text: "Spot deleted successfully" })
      await loadSpots()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting spot"
      })
    }
  }

  const openVolunteersDrawer = async (sp: Spot) => {
    setActiveSpotForVolunteers(sp)
    setVolunteersModalOpen(true)
    setLoadingVolunteers(true)

    try {
      const res = await fetch(`/api/spots/${sp.id}/volunteers`)
      if (res.ok) {
        const data = await res.json()
        setSpotVolunteers(Array.isArray(data) ? data : [])
      }
    } catch {
      setSpotVolunteers([])
    } finally {
      setLoadingVolunteers(false)
    }
  }

  const filteredSpots = spots.filter((sp) => {
    const matchesType = typeFilter === "all" || sp.type === typeFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      sp.name.toLowerCase().includes(q) ||
      sp.code.toLowerCase().includes(q) ||
      sp.building.toLowerCase().includes(q)

    return matchesType && matchesSearch
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Campus Geometry & Deployment
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Campus Spots & Physical Gates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define gates, registration desks, auditoriums, and stage zones for checkpoint association and staff deployment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadSpots}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex h-9 items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 text-xs font-semibold uppercase tracking-wider text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Spot</span>
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
          <button type="button" onClick={() => setFeedback(null)}>
            <X className="h-4 w-4 text-slate-400 hover:text-slate-800" />
          </button>
        </div>
      )}

      <div className="border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 text-xs uppercase tracking-wider transition ${
                typeFilter === "all"
                  ? "bg-slate-900 text-white font-semibold"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Types
            </button>
            {spotTypes.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setTypeFilter(st.id)}
                className={`px-2.5 py-1 text-xs uppercase tracking-wider transition ${
                  typeFilter === st.id
                    ? "bg-slate-900 text-white font-semibold"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by spot name, code, building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto text-slate-400" />
              <p className="mt-2 font-mono uppercase tracking-wider">Loading campus spots...</p>
            </div>
          ) : filteredSpots.length > 0 ? (
            filteredSpots.map((sp) => (
              <div
                key={sp.id}
                className="flex flex-col justify-between border border-slate-200 bg-white p-5 hover:border-slate-400 transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {sp.code}
                    </span>
                    <span className="px-1.5 py-0.2 text-[10px] uppercase tracking-wider font-semibold bg-slate-100 text-slate-700">
                      {sp.type}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-950">
                    {sp.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {sp.description || "No description provided."}
                  </p>

                  <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <span>{sp.building} {sp.floor ? `· ${sp.floor}` : ""} {sp.room ? `· ${sp.room}` : ""}</span>
                    </div>

                    {sp.capacity ? (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Gate Capacity: <strong className="text-slate-900">{sp.capacity}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <button
                    type="button"
                    onClick={() => openVolunteersDrawer(sp)}
                    className="flex items-center gap-1 text-slate-700 hover:text-slate-950 font-medium"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Crew Roster</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(sp)}
                      className="p-1 text-slate-400 hover:text-slate-800"
                      title="Edit spot"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSpot(sp)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Delete spot"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              No spots matching filter criteria.
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-950">
                {editingSpot ? "Edit Campus Spot" : "Create Campus Spot"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Spot Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gate 1 Turnstiles"
                    className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Identifier Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GATE-01"
                    className="w-full border border-slate-300 bg-white px-3 py-1.5 font-mono text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Spot Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SpotType)}
                  className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                >
                  {spotTypes.map((st) => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational details, turnstile counts, access criteria..."
                  className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Building *</label>
                  <input
                    type="text"
                    required
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="e.g. Block 32"
                    className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Floor</label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. Ground"
                    className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Room / Post</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Main Lobby"
                    className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Capacity (Max flow/seating)</label>
                <input
                  type="number"
                  min="0"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 500"
                  className="w-full border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-slate-300 px-3.5 py-1.5 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 px-4 py-1.5 font-medium text-white transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingSpot ? "Save Changes" : "Create Spot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {volunteersModalOpen && activeSpotForVolunteers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-950">
                  Crew Deployed at {activeSpotForVolunteers.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Spot Code: {activeSpotForVolunteers.code}</p>
              </div>
              <button
                type="button"
                onClick={() => setVolunteersModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {loadingVolunteers ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto text-slate-400" />
                  Loading assigned volunteers...
                </div>
              ) : spotVolunteers.length > 0 ? (
                spotVolunteers.map((v) => (
                  <div
                    key={v.user_id}
                    className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{v.first_name} {v.last_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{v.email}</div>
                    </div>
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-slate-200 text-slate-700">
                      On Duty
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No volunteers currently assigned to this spot.
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setVolunteersModalOpen(false)}
                className="border border-slate-300 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
