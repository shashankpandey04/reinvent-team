import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/sessions/?include_inactive=true")
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load sessions" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching sessions" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await backendFetch("/api/v1/sessions/", {
      method: "POST",
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Failed to create session" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error creating session" },
      { status: 500 }
    )
  }
}
