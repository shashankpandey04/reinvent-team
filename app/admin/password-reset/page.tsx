"use client"

import { useState } from "react"
import {
  KeyRound,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  UserCheck
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface SearchUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  roles: string[]
}

function generateSecurePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*"
  let pwd = ""
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

export default function AdminPasswordResetPage() {
  const { isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)

  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim() || q.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const res = await fetch(`/api/volunteers/search?q=${encodeURIComponent(q.trim())}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setSearchResults(Array.isArray(data) ? data : [])
      }
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSelectUser = (u: SearchUser) => {
    setSelectedUser(u)
    setNewPassword("")
    setFeedback(null)
  }

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword()
    setNewPassword(generated)
    setShowPassword(true)
  }

  const handleCopyPassword = () => {
    if (!newPassword) return
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      setFeedback({ type: "error", text: "Please select a user to reset password." })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: "error", text: "Password must be at least 6 characters long." })
      return
    }

    if (!confirm(`Are you sure you want to reset the password for ${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.email})?`)) {
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/users/${selectedUser.user_id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password")
      }

      setFeedback({
        type: "success",
        text: `Password successfully updated for ${selectedUser.first_name} ${selectedUser.last_name}. Make sure to share the new password securely.`
      })
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error resetting password"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-12 text-center border border-slate-200 bg-white">
        <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          User password reset is restricted to lead administrators. Please log in with an administrator account to access this tool.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="border-b border-slate-200 pb-5">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          Security & Identity Administration
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-slate-900" />
          <span>Admin Password Reset</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Reset access credentials for any registered festival attendee, volunteer staff member, or organizer.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 border text-xs flex items-start gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.text}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Search & Select User */}
        <div className="border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Step 1</div>
            <h2 className="text-sm font-bold text-slate-950 mt-0.5">Search User Account</h2>
            <p className="text-xs text-slate-500 mt-0.5">Find user by name or email address</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type user email or full name..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 bg-white text-slate-950 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {searching ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-slate-400" />
                Searching user registry...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => {
                const isSelected = selectedUser?.user_id === u.user_id
                return (
                  <div
                    key={u.user_id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 border cursor-pointer transition text-xs flex items-center justify-between ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 text-slate-800"
                    }`}
                  >
                    <div>
                      <div className={`font-semibold ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {u.first_name} {u.last_name}
                      </div>
                      <div className={`font-mono text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        {u.email}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                      {isSelected && <UserCheck className="w-4 h-4 text-emerald-400 ml-1" />}
                    </div>
                  </div>
                )
              })
            ) : searchQuery.length >= 2 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No users found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Type at least 2 characters to search for users.
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Set New Password */}
        <div className="border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Step 2</div>
            <h2 className="text-sm font-bold text-slate-950 mt-0.5">Configure New Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter a strong password or generate one automatically</p>
          </div>

          {selectedUser ? (
            <div className="p-3.5 border border-slate-200 bg-slate-50 space-y-1 text-xs">
              <div className="text-[10px] font-mono uppercase text-slate-400">Target User</div>
              <div className="font-bold text-slate-900 text-sm">
                {selectedUser.first_name} {selectedUser.last_name}
              </div>
              <div className="text-slate-600 font-mono">{selectedUser.email}</div>
              {selectedUser.phone && (
                <div className="text-slate-500 font-mono text-[11px]">Phone: {selectedUser.phone}</div>
              )}
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedUser.roles.map((r) => (
                  <span
                    key={r}
                    className="px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase bg-slate-200 text-slate-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-300 text-slate-400 text-xs">
              Select a user from the list on the left to reset their password.
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-700">New Password *</label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-900 font-semibold hover:underline"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Generate Password</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={!selectedUser}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new secure password (min 6 chars)..."
                  className="w-full pl-3 pr-20 py-2 border border-slate-300 bg-white text-slate-950 font-mono text-xs focus:border-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {newPassword && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 text-slate-400 hover:text-slate-800 transition"
                      title="Copy password"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-800 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedUser || submitting || !newPassword}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold uppercase tracking-wider text-xs transition disabled:opacity-50"
              >
                {submitting ? "Resetting Password..." : "Update User Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
