import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/orders/analytics")
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load order analytics" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching registration analytics" },
      { status: 500 }
    )
  }
}
