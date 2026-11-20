"use client"

import { useEffect, useState } from "react"
import {
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Pencil,
  Trash2,
  Power
} from "lucide-react"
import type { TicketCategory } from "@/types/team"
import { useAuth } from "@/providers/auth-provider"

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

function formatDateDisplay(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  } catch {
    return iso
  }
}

export default function TicketCategoriesPage() {
  const { isAdmin, isOrganizer } = useAuth()
  const [categories, setCategories] = useState<TicketCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Create Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priceInr, setPriceInr] = useState<number | "">("")
  const [quantity, setQuantity] = useState<number | "">(500)
  const [salesStart, setSalesStart] = useState("")
  const [salesEnd, setSalesEnd] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriceInr, setEditPriceInr] = useState<number | "">("")
  const [editQuantity, setEditQuantity] = useState<number | "">("")
  const [editSalesStart, setEditSalesStart] = useState("")
  const [editSalesEnd, setEditSalesEnd] = useState("")
  const [editIsActive, setEditIsActive] = useState(true)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function loadCategories() {
    try {
      setLoading(true)
      const res = await fetch("/api/ticket-categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to ticket categories service" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const resetCreateForm = () => {
    setName("")
    setDescription("")
    setPriceInr("")
    setQuantity(500)
    const now = new Date()
    const festEnd = new Date("2026-11-16T23:59:59")
    setSalesStart(formatDateTimeForInput(now.toISOString()))
    setSalesEnd(formatDateTimeForInput(festEnd.toISOString()))
  }

  const openCreateModal = () => {
    resetCreateForm()
    setCreateModalOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) {
      setFeedback({ type: "error", text: "Please provide a name and description" })
      return
    }

    const price = priceInr === "" ? 0 : Number(priceInr)
    const qty = Number(quantity)

    if (isNaN(price) || price < 0) {
      setFeedback({ type: "error", text: "Price must be 0 (Free) or a positive amount" })
      return
    }

    if (isNaN(qty) || qty <= 0) {
      setFeedback({ type: "error", text: "Ticket quantity must be greater than zero" })
      return
    }

    const startDate = new Date(salesStart)
    const endDate = new Date(salesEnd)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setFeedback({ type: "error", text: "Invalid sales start or end date" })
      return
    }

    if (endDate <= startDate) {
      setFeedback({ type: "error", text: "Sales end date must be after sales start date" })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price_in_paise: Math.round(price * 100),
        quantity: qty,
        sales_start: startDate.toISOString(),
        sales_end: endDate.toISOString(),
        is_active: true
      }

      const res = await fetch("/api/ticket-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to create ticket tier")
      }

      setFeedback({ type: "success", text: `Ticket tier "${name}" created successfully.` })
      setCreateModalOpen(false)
      resetCreateForm()
      await loadCategories()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error creating category"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditModal = (cat: TicketCategory) => {
    setEditingCategory(cat)
    setEditName(cat.name)
    setEditDescription(cat.description || "")
    setEditPriceInr(cat.price_in_paise / 100)
    setEditQuantity(cat.quantity)
    setEditSalesStart(formatDateTimeForInput(cat.sales_start))
    setEditSalesEnd(formatDateTimeForInput(cat.sales_end))
    setEditIsActive(cat.is_active)
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    if (!editName.trim() || !editDescription.trim()) {
      setFeedback({ type: "error", text: "Please provide a name and description" })
      return
    }

    const price = editPriceInr === "" ? 0 : Number(editPriceInr)
    const qty = Number(editQuantity)

    if (isNaN(price) || price < 0) {
      setFeedback({ type: "error", text: "Price must be 0 (Free) or a positive amount" })
      return
    }

    if (isNaN(qty) || qty <= 0) {
      setFeedback({ type: "error", text: "Ticket quantity must be greater than zero" })
      return
    }

    const alreadyClaimed = (editingCategory.quantity_sold || 0) + (editingCategory.quantity_reserved || 0)
    if (qty < alreadyClaimed) {
      setFeedback({
        type: "error",
        text: `Cannot reduce total quota to ${qty}. ${alreadyClaimed} tickets already sold or reserved.`
      })
      return
    }

    const startDate = new Date(editSalesStart)
    const endDate = new Date(editSalesEnd)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setFeedback({ type: "error", text: "Invalid sales start or end date" })
      return
    }

    if (endDate <= startDate) {
      setFeedback({ type: "error", text: "Sales end date must be after sales start date" })
      return
    }

    setEditSubmitting(true)
    setFeedback(null)

    try {
      const payload = {
        name: editName.trim(),
        description: editDescription.trim(),
        price_in_paise: Math.round(price * 100),
        quantity: qty,
        sales_start: startDate.toISOString(),
        sales_end: endDate.toISOString(),
        is_active: editIsActive
      }

      const res = await fetch(`/api/ticket-categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to update ticket tier")
      }

      setFeedback({ type: "success", text: `Ticket tier "${editName}" updated successfully.` })
      setEditModalOpen(false)
      setEditingCategory(null)
      await loadCategories()
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating category"
      })
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleToggleActive = async (cat: TicketCategory) => {
    try {
      const newStatus = !cat.is_active
      const res = await fetch(`/api/ticket-categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus })
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Tier "${cat.name}" is now ${newStatus ? "active and open for sales" : "closed"}.`
        })
        await loadCategories()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to toggle status")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error updating category status"
      })
    }
  }

  const handleDeleteCategory = async (cat: TicketCategory) => {
    if (!confirm(`Are you sure you want to delete category "${cat.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/ticket-categories/${cat.id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Ticket category "${cat.name}" removed.`
        })
        await loadCategories()
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || "Failed to delete category")
      }
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Error deleting category"
      })
    }
  }

  const totalCapacity = categories.reduce((sum, c) => sum + c.quantity, 0)
  const totalSold = categories.reduce((sum, c) => sum + (c.quantity_sold || 0), 0)
  const totalReserved = categories.reduce((sum, c) => sum + (c.quantity_reserved || 0), 0)
  const overallUtilization = totalCapacity > 0 ? Math.round(((totalSold + totalReserved) / totalCapacity) * 100) : 0

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Pricing & Inventory Quotas
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Ticket Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure attendee pass tiers, sales windows, pricing in INR, and inventory allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCategories}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            title="Reload Categories"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider px-3.5 py-2 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Ticket Tier</span>
            </button>
          )}
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Tiers</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{categories.length}</div>
          <div className="text-xs text-slate-500 mt-1">Configured classifications</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Total Capacity</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{totalCapacity.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">Available across all tiers</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Claimed Passes</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">{(totalSold + totalReserved).toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{overallUtilization}% overall festival capacity</div>
        </div>
        <div className="border border-slate-200 bg-white p-5">
          <div className="text-[11px] font-mono font-semibold uppercase text-slate-500">Active Windows</div>
          <div className="text-2xl font-extrabold text-slate-950 font-mono mt-1">
            {categories.filter((c) => c.is_active).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Open for public purchasing</div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ticket categories by tier name or benefits..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 bg-white text-slate-950 placeholder-slate-400 text-xs focus:border-slate-900 focus:outline-none transition"
        />
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 border border-slate-200 bg-white">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
          Loading ticket tiers...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-16 text-center border border-slate-200 bg-white">
          <h3 className="text-sm font-semibold text-slate-900">No ticket tiers found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? "No categories match the search query."
              : "Define ticket pricing categories to open attendee registrations and sales."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((c) => {
            const soldCount = c.quantity_sold || 0
            const reservedCount = c.quantity_reserved || 0
            const taken = soldCount + reservedCount
            const percent = c.quantity > 0 ? Math.min(100, Math.round((taken / c.quantity) * 100)) : 0
            const isSoldOut = taken >= c.quantity

            return (
              <div
                key={c.id}
                className="p-6 border border-slate-200 bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                        Pass Tier
                      </span>
                      <h3 className="text-lg font-bold text-slate-950 mt-0.5">
                        {c.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-slate-950 font-mono">
                        {c.price_in_paise === 0 ? (
                          <span className="text-emerald-700">FREE</span>
                        ) : (
                          <span>₹{(c.price_in_paise / 100).toLocaleString("en-IN")}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">per delegate</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Inventory Claimed</span>
                      <span className="font-semibold text-slate-900">
                        {taken} / {c.quantity} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isSoldOut
                            ? "bg-rose-600"
                            : percent > 75
                            ? "bg-amber-500"
                            : "bg-slate-900"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Confirmed: {soldCount}</span>
                      <span>Reserved: {reservedCount}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sales Window:</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 pl-5">
                      {formatDateDisplay(c.sales_start)} → {formatDateDisplay(c.sales_end)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-2">
                    {isSoldOut ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                        Sold Out
                      </span>
                    ) : c.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Active Sales
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Closed</span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {c.quantity - taken} available
                  </span>
                </div>

                {/* Admin and Organizer Action Buttons */}
                {(isAdmin || isOrganizer) && (
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border transition ${
                        c.is_active
                          ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      title={c.is_active ? "Close Sales" : "Activate Sales"}
                    >
                      <Power className="w-3 h-3" />
                      <span>{c.is_active ? "Close" : "Open"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-white hover:bg-slate-800 transition"
                      title="Edit Category Details"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit Tier</span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-950">
                Configure New Ticket Tier
              </h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tier Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Student General Pass / VIP All-Access"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description / Pass Inclusions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Access to keynote stage, tech workshop kits, meals, conference swag..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={priceInr}
                    onChange={(e) => setPriceInr(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 499 (0 for Free)"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Total Inventory Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sales Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={salesStart}
                    onChange={(e) => setSalesStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sales End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={salesEnd}
                    onChange={(e) => setSalesEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {submitting ? "Publishing..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-slate-700" />
                <span>Edit Ticket Category</span>
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tier Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Student General Pass / VIP All-Access"
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description / Pass Inclusions *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Access to keynote stage, tech workshop kits, meals, conference swag..."
                  className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editPriceInr}
                    onChange={(e) => setEditPriceInr(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 499 (0 for Free)"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Total Inventory Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Already claimed: {(editingCategory.quantity_sold || 0) + (editingCategory.quantity_reserved || 0)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sales Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editSalesStart}
                    onChange={(e) => setEditSalesStart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Sales End Date *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editSalesEnd}
                    onChange={(e) => setEditSalesEnd(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 bg-white text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
                />
                <label htmlFor="editIsActive" className="font-medium text-slate-700 cursor-pointer select-none">
                  Open for public registration / sales (Active)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-1.5 bg-slate-900 text-white font-medium hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
