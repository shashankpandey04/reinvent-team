import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const response = await backendFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Invalid credentials" }))
      return NextResponse.json(
        { message: err.detail || "Authentication failed" },
        { status: response.status }
      )
    }

    const data = await backendJson<{
      access_token: string
      refresh_token?: string
      token_type: string
      user: {
        id: string
        email: string
        first_name: string
        last_name: string
        roles: string[]
        is_active: boolean
      }
    }>(response)

    const cookieStore = await cookies()
    cookieStore.set("reinvent_team_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Authentication error" },
      { status: 500 }
    )
  }
}
