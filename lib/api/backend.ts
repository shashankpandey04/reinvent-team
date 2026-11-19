import "server-only"
import { cookies } from "next/headers"

const BACKEND_API_URL = process.env.BACKEND_API_URL || "https://reinvent-backend.x6xkh0.easypanel.host"
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || process.env.X_API_KEY || "sk_live_S7hrJlMFDNrM6xC7vN5v5ZSik8Lbm2DF"

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("reinvent_team_token")?.value || null
}

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (BACKEND_API_KEY && !headers.has("X-API-KEY")) {
    headers.set("X-API-KEY", BACKEND_API_KEY)
  }

  if (!headers.has("Authorization")) {
    const token = await getAuthToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  const url = `${BACKEND_API_URL.replace(/\/$/, "")}${path}`

  return fetch(url, {
    ...options,
    headers,
    cache: "no-store"
  })
}

export async function backendJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Backend request failed (${response.status})`

    throw new Error(message)
  }

  return data as T
}
