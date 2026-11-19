import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/volunteers/organizers")
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load organizers" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching organizers" },
      { status: 500 }
    )
  }
}
