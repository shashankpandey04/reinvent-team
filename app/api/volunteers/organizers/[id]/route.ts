import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await backendFetch(`/api/v1/volunteers/organizers/${id}`, {
      method: "POST"
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Failed to add organizer" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error adding organizer" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await backendFetch(`/api/v1/volunteers/organizers/${id}`, {
      method: "DELETE"
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || "Failed to remove organizer" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error removing organizer" },
      { status: 500 }
    )
  }
}
