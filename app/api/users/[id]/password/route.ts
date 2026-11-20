import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/api/backend"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const newPassword = body.password || body.new_password

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    // Attempt primary backend endpoint: PATCH /api/v1/users/{id}/password
    let response = await backendFetch(`/api/v1/users/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword, new_password: newPassword })
    })

    // If 404/405, attempt fallback endpoint /api/v1/users/{id}/reset-password
    if (response.status === 404 || response.status === 405) {
      response = await backendFetch(`/api/v1/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword, new_password: newPassword })
      })
    }

    // Fallback: POST /api/v1/admin/users/{id}/password
    if (response.status === 404 || response.status === 405) {
      response = await backendFetch(`/api/v1/admin/users/${id}/password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword, new_password: newPassword })
      })
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.detail || data?.message || `Failed to reset password (${response.status})` },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      data
    })
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error resetting password" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  return POST(req, context)
}
