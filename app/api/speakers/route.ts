import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/speakers/?include_inactive=true")
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load speakers" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching speakers" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await backendFetch("/api/v1/speakers/", {
      method: "POST",
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Failed to create speaker" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error creating speaker" },
      { status: 500 }
    )
  }
}
