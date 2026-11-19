"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  MapPin,
  Users,
  Mic2,
  Filter
} from "lucide-react"
import type { Session, SessionType, Venue, Speaker } from "@/types/team"

const sessionTypes: { id: SessionType; label: string; badgeClass: string }[] = [
  { id: "keynote", label: "Keynote", badgeClass: "bg-blue-50 border-blue-200 text-blue-800" },
  { id: "talk", label: "Tech Talk", badgeClass: "bg-slate-100 border-slate-300 text-slate-800" },
  { id: "workshop", label: "Workshop", badgeClass: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { id: "panel", label: "Panel Discussion", badgeClass: "bg-purple-50 border-purple-200 text-purple-800" },
  { id: "fireside_chat", label: "Fireside Chat", badgeClass: "bg-amber-50 border-amber-200 text-amber-800" },
  { id: "lightning_talk", label: "Lightning Talk", badgeClass: "bg-cyan-50 border-cyan-200 text-cyan-800" },
  { id: "community", label: "Community", badgeClass: "bg-rose-50 border-rose-200 text-rose-800" },
  { id: "other", label: "Other", badgeClass: "bg-slate-100 border-slate-200 text-slate-700" }
]

function formatDateTimeForInput(dateStr?: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  const year = d.getFullYear()
  const month = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatSessionTime(start: string, end: string) {
  try {
    const s = new Date(start)
    const e = new Date(end)
    const dateFormatted = s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short"
    })
    const startTime = s.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    const endTime = e.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    return { dateFormatted, timeFormatted: `${startTime} - ${endTime}` }
  } catch {
    return { dateFormatted: "TBD", timeFormatted: "TBD" }
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [venueFilter, setVenueFilter] = useState<string>("all")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sessionType, setSessionType] = useState<SessionType>("talk")
  const [venueId, setVenueId] = useState("")
  const [speakerIds, setSpeakerIds] = useState<string[]>([])
  const [startAt, setStartAt] = useState("")
  const [endAt, setEndAt] = useState("")
  const [capacity, setCapacity] = useState<number | "">("")
  const [topics, setTopics] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const [sessRes, venRes, spkRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/venues"),
        fetch("/api/speakers")
      ])

      if (sessRes.ok) {
        const sData = await sessRes.json()
        setSessions(Array.isArray(sData) ? sData : [])
      }
      if (venRes.ok) {
        const vData = await venRes.json()
        setVenues(Array.isArray(vData) ? vData : [])
      }
      if (spkRes.ok) {
        const spData = await spkRes.json()
        setSpeakers(Array.isArray(spData) ? spData : [])
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to sessions catalog" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resetForm = () => {
    setEditingSession(null)
    setTitle("")
    setDescription("")
    setSessionType("talk")
    setVenueId(venues.length > 0 ? venues[0].id : "")
    setSpeakerIds([])
    setStartAt("")
    setEndAt("")
    setCapacity("")
    setTopics([])
    setCustomTopic("")
    setIsActive(true)
  }

  const openCreateModal = () => {
    resetForm()
    if (venues.length > 0) {
      setVenueId(venues[0].id)
    }
    const defaultStart = new Date("2026-11-12T10:00:00")
    const defaultEnd = new Date("2026-11-12T11:00:00")
    setStartAt(formatDateTimeForInput(defaultStart.toISOString()))
    setEndAt(formatDateTimeForInput(defaultEnd.toISOString()))
    setModalOpen(true)
  }

  const openEditModal = (s: Session) => {
    setEditingSession(s)
    setTitle(s.title)
    setDescription(s.description)
    setSessionType(s.session_type as SessionType)
    setVenueId(s.venue_id)
    setSpeakerIds(Array.isArray(s.speaker_ids) ? [...s.speaker_ids] : [])
    setStartAt(formatDateTimeForInput(s.start_at))
    setEndAt(formatDateTimeForInput(s.end_at))
    setCapacity(s.capacity ?? "")
    setTopics(Array.isArray(s.topics) ? [...s.topics] : [])
    setCustomTopic("")
    setIsActive(s.is_active)
    setModalOpen(true)
  }

  const toggleSpeaker = (spId: string) => {
    setSpeakerIds((prev) =>
      prev.includes(spId) ? prev.filter((id) => id !== spId) : [...prev, spId]
    )
  }

  const addCustomTopic = () => {
    const trimmed = customTopic.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed])
      setCustomTopic("")
    }
  }

  const removeTopic = (t: string) => {
    setTopics(topics.filter((item) => item !== t))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!venueId) {
      setFeedback({ type: "error", text: "Please select an auditorium/venue" })
      return
    }

    if (!startAt || !endAt) {
      setFeedback({ type: "error", text: "Please enter start and end times" })
      return
    }

    const startDate = new Date(startAt)
    const endDate = new Date(endAt)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setFeedback({ type: "error", text: "Invalid date format entered" })
      return
    }

    if (endDate <= startDate) {
      setFeedback({ type: "error", text: "End time must be after start time" })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const parsedCapacity = capacity !== "" ? Number(capacity) : null

      if (editingSession) {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          description: description.trim(),
          session_type: sessionType,
          venue_id: venueId,
          speaker_ids: speakerIds,
          start_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          capacity: parsedCapacity,
          topics,
          is_active: isActive
        }

        const res = await fetch(`/api/sessions/${editingSession.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "Failed to update session")
        }

        setFeedback({ type: "success", text: `Session "${title}" updated.` })
      } else {
        const payload: Record<string, unknown> = {
          title: title.trim(),
          description: description.trim(),
          session_type: sessionType,
          venue_id: venueId,
          speaker_ids: speakerIds,
          start_at: startDate.toISOString(),
          end_at: endDate.toISOString(),
          capacity: parsedCapacity,
          topics
        }

        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "Failed to create session")
        }

        setFeedback({ type: "success", text: `Session "${title}" scheduled.` })
      }

      setModalOpen(false)
      resetForm()
      await loadData()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving session"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (s: Session) => {
    if (!confirm(`Are you sure you want to remove session "${s.title}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/sessions/${s.id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete session")
      }
      setFeedback({ type: "success", text: `Session "${s.title}" deleted.` })
      await loadData()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting session"
      })
    }
  }

  const venueMap = new Map(venues.map((v) => [v.id, v]))
  const speakerMap = new Map(speakers.map((sp) => [sp.id, sp]))

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.topics && s.topics.some((t) => t.toLowerCase().includes(q))) ||
      (venueMap.get(s.venue_id)?.name.toLowerCase().includes(q) ?? false) ||
      (s.speaker_ids &&
        s.speaker_ids.some((spId) => speakerMap.get(spId)?.full_name.toLowerCase().includes(q)))

    const matchesType = typeFilter === "all" || s.session_type === typeFilter
    const matchesVenue = venueFilter === "all" || s.venue_id === venueFilter

    return matchesSearch && matchesType && matchesVenue
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            5-Day Festival Agenda & Timetable
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Session Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Program conference keynotes, technical tracks, workshops, speaker allocations, and stage timings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Reload Sessions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Session</span>
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
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Programmed</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{sessions.length}</div>
          <div className="text-xs text-slate-500 mt-1">Sessions on official timetable</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Keynotes & Workshops</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {sessions.filter((s) => s.session_type === "keynote" || s.session_type === "workshop").length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Flagship learning sessions</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Published Agenda</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {sessions.filter((s) => s.is_active).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Visible to festival attendees</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by session title, speaker, venue, or topics..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs focus:border-slate-900 focus:outline-none"
          >
            <option value="all">All Formats</option>
            {sessionTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {venues.length > 0 && (
            <select
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 text-xs focus:border-slate-900 focus:outline-none"
            >
              <option value="all">All Stages</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-200 bg-white">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          Loading festival schedule...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-16 text-center border border-slate-200 bg-white">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No sessions scheduled</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || typeFilter !== "all" || venueFilter !== "all"
              ? "No sessions match your search or filter criteria."
              : "Create keynote presentations, tech talks, and masterclasses across festival stages."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((s) => {
            const currentVenue = venueMap.get(s.venue_id)
            const sessionSpeakers = (s.speaker_ids || [])
              .map((id) => speakerMap.get(id))
              .filter(Boolean) as Speaker[]
            const { dateFormatted, timeFormatted } = formatSessionTime(s.start_at, s.end_at)
            const typeConfig = sessionTypes.find((t) => t.id === s.session_type) || sessionTypes[7]

            return (
              <div
                key={s.id}
                className="border border-slate-200 bg-white p-5 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border ${typeConfig.badgeClass}`}
                    >
                      {typeConfig.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateFormatted} • {timeFormatted}</span>
                    </span>
                    {currentVenue && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentVenue.name} ({currentVenue.building})</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-950">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  {sessionSpeakers.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <Mic2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {sessionSpeakers.map((sp) => (
                          <div
                            key={sp.id}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-slate-200 bg-slate-50 text-xs"
                          >
                            {sp.profile_picture ? (
                              <img
                                src={sp.profile_picture}
                                alt={sp.full_name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-700">
                                {sp.full_name[0]}
                              </span>
                            )}
                            <span className="font-medium text-slate-900">{sp.full_name}</span>
                            {sp.company && (
                              <span className="text-[11px] text-slate-500">({sp.company})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.topics && s.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    {s.capacity && (
                      <div className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cap: {s.capacity}</span>
                      </div>
                    )}
                    <div className="mt-1">
                      {s.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">Draft</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition"
                      title="Edit Session"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-300 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                {editingSession ? "Edit Session" : "Schedule New Session"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Keynote: Building Tomorrow's Cloud with Generative AI"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Session Format *
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as SessionType)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  >
                    {sessionTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Venue / Stage *
                  </label>
                  {venues.length === 0 ? (
                    <div className="p-2 border border-amber-200 bg-amber-50 text-amber-900 text-xs">
                      No venues found. Please create a venue first.
                    </div>
                  ) : (
                    <select
                      required
                      value={venueId}
                      onChange={(e) => setVenueId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                    >
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.building}) - Cap: {v.capacity}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Session Description * (minimum 10 characters)
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed session agenda, takeaways, architecture deep dive notes..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Speakers ({speakerIds.length} selected)
                </label>
                {speakers.length === 0 ? (
                  <div className="p-2 border border-slate-200 bg-slate-50 text-slate-600 text-xs">
                    No speakers registered yet. You can schedule sessions now and assign speakers later.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto p-2 border border-slate-200 bg-slate-50 space-y-1">
                    {speakers.map((sp) => {
                      const selected = speakerIds.includes(sp.id)
                      return (
                        <div
                          key={sp.id}
                          onClick={() => toggleSpeaker(sp.id)}
                          className={`flex items-center justify-between p-2 cursor-pointer transition text-xs ${
                            selected
                              ? "bg-white border border-slate-900 text-slate-950 font-medium"
                              : "hover:bg-white text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900"
                            />
                            <span>{sp.full_name}</span>
                            <span className="text-[11px] text-slate-500 font-normal">
                              • {sp.designation} {sp.company ? `(${sp.company})` : ""}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Attendee Capacity Limit (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Defaults to venue seating limit if left blank"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Track Topics & Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomTopic()
                      }
                    }}
                    placeholder="Type topic tag and press Enter..."
                    className="flex-1 px-3 py-1 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomTopic}
                    className="px-3 py-1 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Add
                  </button>
                </div>

                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 p-2 border border-slate-200 bg-slate-50">
                    {topics.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white border border-slate-200 text-slate-700"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeTopic(item)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {editingSession && (
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Published on Live Agenda</span>
                </label>
              )}

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
                  {submitting ? "Saving..." : editingSession ? "Save Changes" : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
