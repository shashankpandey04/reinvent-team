"use client"

import { useEffect, useState, useRef } from "react"
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Clock,
  RefreshCw
} from "lucide-react"
import type { Checkpoint } from "@/types/team"

export default function AttendanceScanPage() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>("")
  const [ticketInput, setTicketInput] = useState("")
  const [loadingCheckpoints, setLoadingCheckpoints] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{
    status: "success" | "warning" | "error"
    title: string
    attendeeName?: string
    checkpointName?: string
    timestamp?: string
    message?: string
  } | null>(null)

  const [recentScans, setRecentScans] = useState<{
    id: string
    attendeeName: string
    checkpointName: string
    time: string
    status: "success" | "warning"
  }[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadCheckpoints() {
      try {
        setLoadingCheckpoints(true)
        const res = await fetch("/api/attendance/checkpoints")
        if (res.ok) {
          const data = await res.json()
          const items: Checkpoint[] = Array.isArray(data) ? data : []
          setCheckpoints(items)
          if (items.length > 0) {
            setSelectedCheckpoint(items[0].id)
          }
        }
      } catch {
        setCheckpoints([])
      } finally {
        setLoadingCheckpoints(false)
      }
    }
    loadCheckpoints()
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = ticketInput.trim()
    if (!cleanId || !selectedCheckpoint) return

    setScanning(true)
    setResult(null)

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: cleanId,
          checkpoint_id: selectedCheckpoint
        })
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          status: "success",
          title: "Attendance Verified",
          attendeeName: data.attendee_name,
          checkpointName: data.checkpoint_name,
          timestamp: new Date(data.scanned_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          }),
          message: data.message
        })

        setRecentScans((prev) => [
          {
            id: String(Date.now()),
            attendeeName: data.attendee_name,
            checkpointName: data.checkpoint_name,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            status: "success"
          },
          ...prev.slice(0, 9)
        ])
        setTicketInput("")
      } else if (res.status === 409) {
        setResult({
          status: "warning",
          title: "Already Scanned",
          message: data.message || "This attendee has already been verified at this checkpoint."
        })
      } else {
        setResult({
          status: "error",
          title: "Verification Failed",
          message: data.message || "Invalid or inactive ticket code."
        })
      }
    } catch {
      setResult({
        status: "error",
        title: "Communication Error",
        message: "Failed to connect to the attendance service."
      })
    } finally {
      setScanning(false)
      inputRef.current?.focus()
    }
  }

  const activeCheckpointObj = checkpoints.find((c) => c.id === selectedCheckpoint)

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Gate Attendance & Access Control
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 mt-1">
            Attendance Scanner Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan attendee QR codes, barcodes, or paste verification codes for admission.
          </p>
        </div>

        {activeCheckpointObj && (
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-white text-xs font-medium text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            <span>Active Post: <strong>{activeCheckpointObj.name}</strong></span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-slate-200 bg-white p-6">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-3">
              1. Select Verification Post
            </label>

            {loadingCheckpoints ? (
              <div className="h-10 w-full animate-pulse bg-slate-100" />
            ) : checkpoints.length === 0 ? (
              <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>No checkpoints active. Contact an administrator to assign checkpoints.</span>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {checkpoints.map((cp) => {
                  const isSelected = selectedCheckpoint === cp.id
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => {
                        setSelectedCheckpoint(cp.id)
                        inputRef.current?.focus()
                      }}
                      className={`flex flex-col justify-between p-3.5 border text-left transition ${
                        isSelected
                          ? "border-slate-950 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{cp.name}</span>
                        {cp.is_mandatory && (
                          <span className={`px-1.5 py-0.2 text-[10px] font-mono font-semibold uppercase ${
                            isSelected ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
                          }`}>
                            Required
                          </span>
                        )}
                      </div>
                      <span className={`mt-1.5 text-[11px] flex items-center gap-1 ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}>
                        <MapPin className="h-3 w-3" />
                        <span>Zone: {cp.spot_name}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border border-slate-200 bg-white p-6">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                2. Scan Ticket Code
              </span>
              <p className="mt-0.5 text-xs text-slate-500">
                Barcode guns automatically trigger on scan. You can also paste or manually enter the code.
              </p>
            </div>

            <form onSubmit={handleScan} className="space-y-3">
              <div>
                <input
                  ref={inputRef}
                  type="text"
                  required
                  placeholder="Scan QR or enter ticket verification code..."
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  disabled={!selectedCheckpoint || scanning}
                  className="h-11 w-full border border-slate-300 bg-white px-3 font-mono text-sm text-slate-950 placeholder:text-slate-400 focus:border-slate-950 focus:outline-none transition disabled:bg-slate-50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!selectedCheckpoint || scanning || !ticketInput.trim()}
                  className="flex-1 flex h-10 items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-40 transition"
                >
                  {scanning ? (
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Verifying Pass...</span>
                    </div>
                  ) : (
                    <span>Verify & Admit</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTicketInput("")
                    setResult(null)
                    inputRef.current?.focus()
                  }}
                  className="px-4 border border-slate-300 bg-white text-xs font-semibold uppercase tracking-wider text-slate-700 hover:bg-slate-50 transition"
                >
                  Clear
                </button>
              </div>
            </form>

            {result && (
              <div
                className={`mt-5 border p-4 transition-all ${
                  result.status === "success"
                    ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                    : result.status === "warning"
                    ? "border-amber-300 bg-amber-50/70 text-amber-950"
                    : "border-rose-300 bg-rose-50/70 text-rose-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.status === "success" && (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {result.status === "warning" && (
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  {result.status === "error" && (
                    <XCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
                      {result.title}
                    </h3>

                    {result.attendeeName && (
                      <p className="text-base font-bold text-slate-950">
                        {result.attendeeName}
                      </p>
                    )}

                    {result.checkpointName && (
                      <p className="text-xs text-slate-600 font-mono">
                        Gate: {result.checkpointName} • {result.timestamp}
                      </p>
                    )}

                    {result.message && (
                      <p className="text-xs pt-0.5">
                        {result.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-950">Desk Scan History</h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-100 text-slate-700">
                {recentScans.length} logged
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-[440px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {recentScans.length > 0 ? (
                recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between pt-2.5 pb-1 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <span className="font-semibold text-slate-900">{scan.attendeeName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block font-mono">{scan.checkpointName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{scan.time}</span>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-xs text-slate-400">
                  <Clock className="mx-auto h-6 w-6 text-slate-300 mb-2" />
                  Passes scanned during this shift will stream here.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Shift Status: Active</span>
            <span className="font-semibold text-emerald-700">Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
