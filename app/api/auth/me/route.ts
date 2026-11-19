import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/users/me")
    if (!response.ok) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = await backendJson<any>(response)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
}
