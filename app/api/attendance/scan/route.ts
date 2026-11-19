import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await backendFetch("/api/v1/attendance/scan", {
      method: "POST",
      body: JSON.stringify(body)
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Attendance scan failed" },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Internal scan error" },
      { status: 500 }
    )
  }
}
