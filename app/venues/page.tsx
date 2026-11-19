"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Users,
  MapPin
} from "lucide-react"
import type { Venue } from "@/types/team"

const defaultAmenities = [
  "4K Laser Projector",
  "Dolby Audio System",
  "Wireless Mics",
  "Stage Lighting",
  "Livestream Rig",
  "Gigabit Wi-Fi",
  "AC Climate Control",
  "Wheelchair Access",
  "Recording Studio",
  "Presenter Podium"
]

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [buildingFilter, setBuildingFilter] = useState("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [building, setBuilding] = useState("")
  const [floor, setFloor] = useState("")
  const [room, setRoom] = useState("")
  const [capacity, setCapacity] = useState<number | "">(200)
  const [description, setDescription] = useState("")
  const [amenities, setAmenities] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadVenues() {
    try {
      setLoading(true)
      const res = await fetch("/api/venues")
      if (res.ok) {
        const data = await res.json()
        setVenues(Array.isArray(data) ? data : [])
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to venues service" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVenues()
  }, [])

  const resetForm = () => {
    setEditingVenue(null)
    setName("")
    setCode("")
    setBuilding("")
    setFloor("")
    setRoom("")
    setCapacity(200)
    setDescription("")
    setAmenities([])
    setCustomAmenity("")
    setIsActive(true)
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (v: Venue) => {
    setEditingVenue(v)
    setName(v.name)
    setCode(v.code)
    setBuilding(v.building)
    setFloor(v.floor || "")
    setRoom(v.room || "")
    setCapacity(v.capacity)
    setDescription(v.description || "")
    setAmenities(v.amenities || [])
    setIsActive(v.is_active)
    setModalOpen(true)
  }

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    )
  }

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (!trimmed) return
    if (!amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed])
    }
    setCustomAmenity("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim() || !building.trim()) {
      setFeedback({ type: "error", text: "Please provide a venue name, code, and building." })
      return
    }

    const capNum = Number(capacity)
    if (isNaN(capNum) || capNum <= 0) {
      setFeedback({ type: "error", text: "Capacity must be a positive number." })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        building: building.trim(),
        floor: floor.trim() || undefined,
        room: room.trim() || undefined,
        capacity: capNum,
        description: description.trim() || undefined,
        amenities,
        is_active: isActive
      }

      const url = editingVenue ? `/api/venues/${editingVenue.id}` : "/api/venues"
      const method = editingVenue ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to save venue")
      }

      setFeedback({
        type: "success",
        text: `Venue "${name}" ${editingVenue ? "updated" : "created"} successfully.`
      })
      setModalOpen(false)
      resetForm()
      await loadVenues()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving venue"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (v: Venue) => {
    if (!confirm(`Are you sure you want to deactivate venue "${v.name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/venues/${v.id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete venue")
      }
      setFeedback({ type: "success", text: `Venue "${v.name}" removed.` })
      await loadVenues()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting venue"
      })
    }
  }

  const uniqueBuildings = Array.from(new Set(venues.map((v) => v.building).filter(Boolean)))

  const filteredVenues = venues.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.room && v.room.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesBuilding = buildingFilter === "all" || v.building === buildingFilter

    return matchesSearch && matchesBuilding
  })

  const totalCapacity = venues.reduce((sum, v) => sum + (v.is_active ? v.capacity : 0), 0)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Campus Venues & Facilities
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Venue Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure campus halls, auditoriums, presentation rooms, capacities, and technical amenities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadVenues}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Reload Venues"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Venue</span>
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
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Venues</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{venues.length}</div>
          <div className="text-xs text-slate-500 mt-1">Configured stages & halls</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Audience Capacity</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{totalCapacity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Simultaneous festival seating</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Campus Buildings</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{uniqueBuildings.length}</div>
          <div className="text-xs text-slate-500 mt-1">Spanning active zones</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue by name, code, building, or room..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
          />
        </div>
        {uniqueBuildings.length > 0 && (
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Buildings</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-200 bg-white">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          Loading venues...
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="p-16 text-center border border-slate-200 bg-white">
          <h3 className="text-sm font-semibold text-slate-900">No venues found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || buildingFilter !== "all"
              ? "No venues match the selected filters."
              : "Register auditoriums, seminar halls, and keynote stages to link with sessions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((v) => (
            <div
              key={v.id}
              className="p-5 border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-semibold bg-slate-100 text-slate-800">
                      {v.code}
                    </div>
                    <h3 className="text-base font-bold text-slate-950 mt-1">
                      {v.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-1 text-slate-400 hover:text-slate-800 transition"
                      title="Edit Venue"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete Venue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {v.building}
                    {v.floor ? `, Floor ${v.floor}` : ""}
                    {v.room ? `, Room ${v.room}` : ""}
                  </span>
                </div>

                {v.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-1">
                  {v.amenities && v.amenities.length > 0 ? (
                    v.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-100 text-slate-700"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No amenities specified</span>
                  )}
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 font-mono">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Capacity: {v.capacity.toLocaleString()}</span>
                </div>
                {v.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Inactive</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-950">
                {editingVenue ? "Edit Venue" : "Register New Venue"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shanti Devi Mittal Auditorium"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Venue Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MAIN-AUD"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 font-mono uppercase focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    placeholder="e.g. Block 32"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Floor
                  </label>
                  <input
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. 1st Floor"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Room No.
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. 104"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Seating / Hall Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Stage dimensions, entrance gates, audience access..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Select Technical Amenities
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {defaultAmenities.map((item) => {
                    const isSelected = amenities.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className={`px-2 py-0.5 text-[11px] transition ${
                          isSelected
                            ? "bg-slate-900 text-white font-medium"
                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3 py-1 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-3 py-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Add
                  </button>
                </div>
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
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingVenue ? "Save Changes" : "Create Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
