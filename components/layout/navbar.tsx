"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"

const navigation = [
  { label: "Overview", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Attendance", href: "/attendance" },
]

export function Navbar() {
  const pathname = usePathname()
  const { authenticated, isVolunteer } = useAuth()

  const links = authenticated
    ? navigation.filter((item) => {
        if (isVolunteer) {
          return item.href === "/" || item.href === "/attendance"
        }

        return true
      })
    : []

  const destination = isVolunteer ? "/attendance" : "/dashboard"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--surface-border)] bg-[var(--background)]">
      <nav className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="text-[17px] font-black tracking-[-0.09em]">
            AWS<span className="text-fuchsia-600">.</span>
          </span>

          <span className="h-5 w-px bg-[var(--surface-border)]" />

          <div className="leading-none">
            <p className="text-[13px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              Re:Invent Fest
              <span className="ml-1.5 font-normal text-[var(--muted)]">
                2026
              </span>
            </p>
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.19em] text-[var(--muted)]">
              Operations Division
            </p>
          </div>
        </Link>

        <div className="hidden h-full items-center gap-8 md:flex">
          {links.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full items-center text-[12px] font-medium transition-colors ${
                  active
                    ? "text-[var(--foreground)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}

                {active && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-600" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] lg:block">
            November 12–16, 2026
          </span>

          <Link
            href={authenticated ? destination : "/auth"}
            className="border border-fuchsia-600 bg-fuchsia-600 px-4 py-[10px] text-[11px] font-semibold text-[var(--background)] transition-colors hover:border-fuchsia-600 hover:bg-fuchsia-600 hover:text-white"
          >
            {authenticated ? "Open Console" : "Staff Login"}
          </Link>
        </div>
      </nav>

      {authenticated && (
        <div className="flex items-center gap-7 overflow-x-auto border-t border-[var(--surface-border)] px-5 py-3 md:hidden sm:px-8">
          {links.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-fuchsia-700 dark:text-fuchsia-400"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}