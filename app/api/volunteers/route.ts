import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/volunteers/")
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load volunteers" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching volunteers" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }
    const response = await backendFetch(`/api/v1/volunteers/${userId}`, {
      method: "POST"
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Failed to add volunteer" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error adding volunteer" },
      { status: 500 }
    )
  }
}
