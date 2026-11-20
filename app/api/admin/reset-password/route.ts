import { NextResponse } from "next/server"
import { backendFetch } from "@/lib/api/backend"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const userId = body.user_id || body.userId
    const newPassword = body.password || body.new_password

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { message: "Valid user_id is required." },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    // Try primary backend route: PATCH /api/v1/users/{id}/password
    let response = await backendFetch(`/api/v1/users/${userId}/password`, {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword, new_password: newPassword })
    })

    // Fallbacks
    if (response.status === 404 || response.status === 405) {
      response = await backendFetch(`/api/v1/users/${userId}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ password: newPassword, new_password: newPassword })
      })
    }

    if (response.status === 404 || response.status === 405) {
      response = await backendFetch(`/api/v1/admin/users/${userId}/password`, {
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
