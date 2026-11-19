"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import type { User } from "@/types/team"

interface AuthContextType {
  user: User | null
  loading: boolean
  authenticated: boolean
  isVolunteer: boolean
  isOrganizer: boolean
  isAdmin: boolean
  login: (email: string, password: string, targetRedirect?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const roles = user?.roles || []
  const isVolunteer = roles.includes("volunteer")
  const isOrganizer = roles.includes("organizer")
  const isAdmin = roles.includes("admin")
  const authenticated = Boolean(user)

  async function refreshUser() {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        setUser(null)
        if (res.status === 401) {
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
        }
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  useEffect(() => {
    if (!loading) {
      const isPublic = pathname === "/" || pathname === "/auth"
      if (!authenticated && !isPublic) {
        window.location.href = `/auth?redirect=${encodeURIComponent(pathname)}`
      }
    }
  }, [loading, authenticated, pathname])

  const login = async (email: string, password: string, targetRedirect?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.message || "Invalid credentials" }
      }

      setUser(data.user)

      const userRoles = data.user?.roles || []
      const isVolOnly = userRoles.includes("volunteer") && !userRoles.includes("organizer") && !userRoles.includes("admin")
      const defaultDest = isVolOnly ? "/attendance" : "/dashboard"
      const destination =
        targetRedirect && targetRedirect.startsWith("/") && targetRedirect !== "/auth"
          ? targetRedirect
          : defaultDest

      window.location.href = destination
      return { success: true }
    } catch {
      return { success: false, error: "Network or server error during sign in" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      setUser(null)
      window.location.href = "/auth"
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      authenticated,
      isVolunteer,
      isOrganizer,
      isAdmin,
      login,
      logout,
      refreshUser
    }),
    [user, loading, authenticated, isVolunteer, isOrganizer, isAdmin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
