import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const response = await backendFetch(`/api/v1/ticket/categories/${id}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Category not found" }))
      return NextResponse.json({ message: err.detail || err.message }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching category" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const response = await backendFetch(`/api/v1/ticket/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || data?.message || "Failed to update category" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error updating category" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const response = await backendFetch(`/api/v1/ticket/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || data?.message || "Failed to update category" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error updating category" },
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
    const response = await backendFetch(`/api/v1/ticket/categories/${id}`, {
      method: "DELETE"
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || data?.message || "Failed to delete category" },
        { status: response.status }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error deleting category" },
      { status: 500 }
    )
  }
}
