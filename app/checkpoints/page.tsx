"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  MapPin,
  Filter
} from "lucide-react"
import type { Checkpoint, Spot } from "@/types/team"

export default function CheckpointsPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [spotFilter, setSpotFilter] = useState<string>("all")
  const [mandatoryFilter, setMandatoryFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCheckpoint, setEditingCheckpoint] = useState<Checkpoint | null>(null)

  const [name, setName] = useState("")
  const [spotId, setSpotId] = useState("")
  const [description, setDescription] = useState("")
  const [isMandatory, setIsMandatory] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const [cpRes, spotsRes] = await Promise.all([
        fetch("/api/checkpoints"),
        fetch("/api/spots")
      ])

      if (cpRes.ok) {
        const cpData = await cpRes.json()
        setCheckpoints(Array.isArray(cpData) ? cpData : [])
      }
      if (spotsRes.ok) {
        const spData = await spotsRes.json()
        setSpots(Array.isArray(spData) ? spData : [])
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to checkpoints service" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setEditingCheckpoint(null)
    setName("")
    setSpotId(spots.length > 0 ? spots[0].id : "")
    setDescription("")
    setIsMandatory(true)
    setIsActive(true)
  }

  const openCreateModal = () => {
    resetForm()
    if (spots.length > 0) {
      setSpotId(spots[0].id)
    }
    setModalOpen(true)
  }

  const openEditModal = (cp: Checkpoint) => {
    setEditingCheckpoint(cp)
    setName(cp.name)
    setSpotId(cp.spot_id)
    setDescription(cp.description || "")
    setIsMandatory(cp.is_mandatory)
    setIsActive(cp.is_active)
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!spotId) {
      setFeedback({ type: "error", text: "Please select an associated spot." })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        name,
        spot_id: spotId,
        description: description || undefined,
        is_mandatory: isMandatory,
        is_active: isActive
      }

      const url = editingCheckpoint ? `/api/checkpoints/${editingCheckpoint.id}` : "/api/checkpoints"
      const method = editingCheckpoint ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to save checkpoint")
      }

      setFeedback({
        type: "success",
        text: editingCheckpoint ? "Checkpoint updated successfully" : "Checkpoint created successfully"
      })
      setModalOpen(false)
      resetForm()
      await loadData()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving checkpoint"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (cp: Checkpoint) => {
    if (!confirm(`Are you sure you want to delete checkpoint "${cp.name}"?`)) return

    try {
      const res = await fetch(`/api/checkpoints/${cp.id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete checkpoint")
      }

      setFeedback({ type: "success", text: "Checkpoint deleted successfully" })
      await loadData()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting checkpoint"
      })
    }
  }

  const filteredCheckpoints = checkpoints.filter((cp) => {
    const matchesSpot = spotFilter === "all" || cp.spot_id === spotFilter
    const matchesMandatory =
      mandatoryFilter === "all" ||
      (mandatoryFilter === "mandatory" && cp.is_mandatory) ||
      (mandatoryFilter === "optional" && !cp.is_mandatory)
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      cp.name.toLowerCase().includes(q) ||
      cp.spot_name.toLowerCase().includes(q) ||
      (cp.description && cp.description.toLowerCase().includes(q))

    return matchesSpot && matchesMandatory && matchesSearch
  })

  const totalMandatory = checkpoints.filter((c) => c.is_mandatory).length
  const totalActive = checkpoints.filter((c) => c.is_active).length

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Access Control & Scanners
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Attendance Checkpoints
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure access control points, mandatory entrance barriers, and spot associations across campus.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Reload Checkpoints"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Checkpoint</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 border flex items-center justify-between text-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Checkpoints</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{checkpoints.length}</div>
          <div className="text-xs text-slate-500 mt-1">Configured access posts</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Mandatory Gates</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{totalMandatory}</div>
          <div className="text-xs text-slate-500 mt-1">Festival entry prerequisites</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Active Status</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{totalActive}</div>
          <div className="text-xs text-slate-500 mt-1">Ready for attendee scanners</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search checkpoints or spots..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          <select
            value={spotFilter}
            onChange={(e) => setSpotFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Spots</option>
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          <select
            value={mandatoryFilter}
            onChange={(e) => setMandatoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Rules</option>
            <option value="mandatory">Mandatory Only</option>
            <option value="optional">Optional Only</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            Loading checkpoints...
          </div>
        ) : filteredCheckpoints.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-sm font-semibold text-slate-900">No checkpoints found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || spotFilter !== "all" || mandatoryFilter !== "all"
                ? "No checkpoints match the active filters."
                : "Create verification checkpoints linked to spots to let volunteers scan passes."}
            </p>
            {spots.length === 0 && (
              <p className="text-xs text-amber-700 mt-3 font-medium">
                Notice: You must have at least one Spot configured before creating a checkpoint.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-mono uppercase tracking-wider text-slate-500 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Checkpoint Name</th>
                  <th className="px-5 py-3">Associated Spot</th>
                  <th className="px-5 py-3">Access Policy</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCheckpoints.map((cp) => (
                  <tr key={cp.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-slate-900">{cp.name}</div>
                      {cp.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {cp.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs bg-slate-100 text-slate-800">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{cp.spot_name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {cp.is_mandatory ? (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          Mandatory
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {cp.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cp)}
                          className="p-1 text-slate-400 hover:text-slate-800 transition"
                          title="Edit Checkpoint"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cp)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete Checkpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-950">
                {editingCheckpoint ? "Edit Checkpoint" : "New Checkpoint"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Checkpoint Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Gate Entry 1 Scanner"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Associated Spot / Zone *
                </label>
                {spots.length === 0 ? (
                  <div className="p-2.5 border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                    No spots available. Create a spot first in Spots Management.
                  </div>
                ) : (
                  <select
                    required
                    value={spotId}
                    onChange={(e) => setSpotId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {spots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.building}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational instructions for scanning desk..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-1 space-y-2.5">
                <label className="flex items-start gap-2.5 p-3 border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 text-slate-900 border-slate-300 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Mandatory Checkpoint</div>
                    <div className="text-[11px] text-slate-500">
                      Attendees must scan at this checkpoint to be marked officially admitted to the festival.
                    </div>
                  </div>
                </label>

                {editingCheckpoint && (
                  <label className="flex items-start gap-2.5 p-3 border border-slate-200 bg-slate-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Active Status</div>
                      <div className="text-[11px] text-slate-500">
                        When active, this checkpoint is listed on volunteer attendance scanner desks.
                      </div>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || spots.length === 0}
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingCheckpoint ? "Save Changes" : "Create Checkpoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
