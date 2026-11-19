"use client"

import { useEffect, useState } from "react"
import {
  Mic2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  Globe,
  Building2
} from "lucide-react"
import type { Speaker, SpeakerSocials } from "@/types/team"

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.33a1.63 1.63 0 0 0-1.63 1.62 1.63 1.63 0 0 0 1.63 1.63 1.63 1.63 0 0 0 1.63-1.63 1.63 1.63 0 0 0-1.63-1.62Z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const defaultTopicSuggestions = [
  "Generative AI & LLMs",
  "Cloud Architecture",
  "Serverless Computing",
  "Kubernetes & Containers",
  "DevOps & Platform Engineering",
  "Cybersecurity & Zero Trust",
  "FinOps & Cost Optimization",
  "Data Lakes & Analytics",
  "Event-Driven Microservices",
  "Developer Productivity"
]

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)

  const [fullName, setFullName] = useState("")
  const [designation, setDesignation] = useState("")
  const [company, setCompany] = useState("")
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [website, setWebsite] = useState("")
  const [topics, setTopics] = useState<string[]>([])
  const [customTopic, setCustomTopic] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadSpeakers() {
    try {
      setLoading(true)
      const res = await fetch("/api/speakers")
      if (res.ok) {
        const data = await res.json()
        setSpeakers(Array.isArray(data) ? data : [])
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to speakers service" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpeakers()
  }, [])

  const resetForm = () => {
    setEditingSpeaker(null)
    setFullName("")
    setDesignation("")
    setCompany("")
    setBio("")
    setProfilePicture("")
    setLinkedin("")
    setGithub("")
    setWebsite("")
    setTopics([])
    setCustomTopic("")
    setIsActive(true)
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (sp: Speaker) => {
    setEditingSpeaker(sp)
    setFullName(sp.full_name)
    setDesignation(sp.designation)
    setCompany(sp.company || "")
    setBio(sp.bio)
    setProfilePicture(sp.profile_picture || "")
    setLinkedin(sp.socials?.linkedin || "")
    setGithub(sp.socials?.github || "")
    setWebsite(sp.socials?.website || "")
    setTopics(Array.isArray(sp.topics) ? [...sp.topics] : [])
    setCustomTopic("")
    setIsActive(sp.is_active)
    setModalOpen(true)
  }

  const toggleTopic = (item: string) => {
    setTopics((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    )
  }

  const addCustomTopic = () => {
    const trimmed = customTopic.trim()
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed])
      setCustomTopic("")
    }
  }

  const removeTopic = (item: string) => {
    setTopics(topics.filter((t) => t !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)

    try {
      const socials: SpeakerSocials = {}
      if (linkedin.trim()) socials.linkedin = linkedin.trim()
      if (github.trim()) socials.github = github.trim()
      if (website.trim()) socials.website = website.trim()

      if (editingSpeaker) {
        const payload: Record<string, unknown> = {
          full_name: fullName.trim(),
          designation: designation.trim(),
          company: company.trim() || null,
          bio: bio.trim(),
          profile_picture: profilePicture.trim() || null,
          socials,
          topics,
          is_active: isActive
        }

        const res = await fetch(`/api/speakers/${editingSpeaker.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "Failed to update speaker")
        }

        setFeedback({ type: "success", text: `Speaker "${fullName}" updated.` })
      } else {
        const payload = {
          full_name: fullName.trim(),
          designation: designation.trim(),
          company: company.trim() || null,
          bio: bio.trim(),
          profile_picture: profilePicture.trim() || null,
          socials,
          topics
        }

        const res = await fetch("/api/speakers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || "Failed to create speaker")
        }

        setFeedback({ type: "success", text: `Speaker "${fullName}" registered.` })
      }

      setModalOpen(false)
      resetForm()
      await loadSpeakers()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error saving speaker"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (sp: Speaker) => {
    if (!confirm(`Are you sure you want to remove speaker "${sp.full_name}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/speakers/${sp.id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete speaker")
      }
      setFeedback({ type: "success", text: `Speaker "${sp.full_name}" removed.` })
      await loadSpeakers()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting speaker"
      })
    }
  }

  const filteredSpeakers = speakers.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.full_name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      (s.company && s.company.toLowerCase().includes(q)) ||
      (s.topics && s.topics.some((t) => t.toLowerCase().includes(q)))
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Industry Visionaries & Keynotes
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Speaker Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate festival keynote speakers, workshop leaders, panel experts, their biographies and session topics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSpeakers}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Reload Speakers"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Speaker</span>
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
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Speakers</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{speakers.length}</div>
          <div className="text-xs text-slate-500 mt-1">Confirmed presenters</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Active Roster</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {speakers.filter((s) => s.is_active).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Listed on attendee schedule</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Companies Represented</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {new Set(speakers.map((s) => s.company).filter(Boolean)).size}
          </div>
          <div className="text-xs text-slate-500 mt-1">Industry tech leaders</div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by speaker name, role, company, or expertise topics..."
          className="w-full pl-9 pr-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
        />
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-200 bg-white">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          Loading speakers...
        </div>
      ) : filteredSpeakers.length === 0 ? (
        <div className="p-16 text-center border border-slate-200 bg-white">
          <Mic2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No speakers found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? "No speakers match the search query."
              : "Add keynote speakers and industry leaders to assign them to festival sessions."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpeakers.map((sp) => (
            <div
              key={sp.id}
              className="border border-slate-200 bg-white p-5 hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {sp.profile_picture ? (
                      <img
                        src={sp.profile_picture}
                        alt={sp.full_name}
                        className="w-11 h-11 object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm">
                        {sp.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-950">
                        {sp.full_name}
                      </h3>
                      <div className="text-xs text-slate-700 font-medium">
                        {sp.designation}
                      </div>
                      {sp.company && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{sp.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sp)}
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition"
                      title="Edit Speaker"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sp)}
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition"
                      title="Delete Speaker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {sp.bio}
                </p>

                {sp.topics && sp.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sp.topics.map((t, idx) => (
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

              <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {sp.socials?.linkedin && (
                    <a
                      href={sp.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition"
                      title="LinkedIn"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {sp.socials?.github && (
                    <a
                      href={sp.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition"
                      title="GitHub"
                    >
                      <GitHubIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {sp.socials?.website && (
                    <a
                      href={sp.socials.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition"
                      title="Personal Website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {sp.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">Archived</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-300 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-slate-700" />
                {editingSpeaker ? "Edit Speaker" : "Add Keynote Speaker"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Werner Vogels"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. VP & Chief Technology Officer"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Amazon.com"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://images.example.com/speaker.jpg"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Speaker Biography * (minimum 10 characters)
                </label>
                <textarea
                  required
                  minLength={10}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detailed background, accomplishments, cloud leadership, and conference address highlights..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <LinkedInIcon className="w-3 h-3 text-slate-600" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <GitHubIcon className="w-3 h-3 text-slate-600" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-600" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://werner.wiki"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keynote Topics & Fields
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {defaultTopicSuggestions.map((item) => {
                    const selected = topics.includes(item)
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleTopic(item)}
                        className={`px-2 py-0.5 text-[11px] transition ${
                          selected
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
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomTopic()
                      }
                    }}
                    placeholder="Add custom topic and press Enter..."
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

              {editingSpeaker && (
                <label className="flex items-center gap-2 p-2.5 border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-800">Active Speaker</span>
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
                  {submitting ? "Saving..." : editingSpeaker ? "Save Changes" : "Create Speaker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
