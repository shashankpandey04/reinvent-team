import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const response = await backendFetch(`/api/v1/volunteers/users/search?query=${encodeURIComponent(q)}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to search users" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error searching users" },
      { status: 500 }
    )
  }
}
