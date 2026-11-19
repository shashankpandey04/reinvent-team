import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("reinvent_team_token")
  return NextResponse.json({ success: true, message: "Logged out" })
}

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.delete("reinvent_team_token")
  return NextResponse.json({ success: true, message: "Logged out" })
}
