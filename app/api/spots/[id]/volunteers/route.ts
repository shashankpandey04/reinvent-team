import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await backendFetch(`/api/v1/spots/${id}/volunteers`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load spot volunteers" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error loading volunteers" },
      { status: 500 }
    )
  }
}
