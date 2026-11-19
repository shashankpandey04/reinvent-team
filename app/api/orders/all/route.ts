import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get("limit") || "100"
    const response = await backendFetch(`/api/v1/orders/all?limit=${limit}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Failed to load orders" }))
      return NextResponse.json({ message: err.detail }, { status: response.status })
    }
    const data = await backendJson(response)
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Error fetching orders" },
      { status: 500 }
    )
  }
}
