"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"

const modules = [
  {
    number: "01",
    title: "Operations Console",
    description:
      "Centralized event administration, operational overview, and management controls.",
    href: "/dashboard",
    access: "Management",
  },
  {
    number: "02",
    title: "Attendance Management",
    description:
      "Pass verification, QR scanning, entry validation, and attendance records.",
    href: "/attendance",
    access: "Volunteers & Management",
  },
  {
    number: "03",
    title: "Team Operations",
    description:
      "Personnel coordination, role assignments, access permissions, and crew management.",
    href: "/dashboard",
    access: "Management",
  },
  {
    number: "04",
    title: "Staff Authentication",
    description:
      "Secure access to the internal infrastructure for authorized event personnel.",
    href: "/auth",
    access: "Authorized Personnel",
  },
]

export default function TeamLandingPage() {
  const { authenticated, isVolunteer } = useAuth()

  const availableModules = authenticated
    ? modules.filter((module) => {
        if (isVolunteer) {
          return module.number === "02"
        }

        return module.number !== "04"
      })
    : modules.filter((module) => module.number === "04")

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">

        <section className="grid gap-12 border-b border-[var(--surface-border)] py-16 sm:py-20 lg:grid-cols-[1.5fr_0.5fr] lg:items-end lg:py-28">

          <div>
            <div className="mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-fuchsia-600" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                Internal Infrastructure / 2026
              </span>
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.065em] sm:text-6xl lg:text-[88px]">
              Behind the
              <br />
              operations<span className="text-fuchsia-600">.</span>
            </h1>

            <p className="mt-8 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              The central operations environment for Re:Invent Fest 2026.
              Built for the people coordinating event infrastructure,
              managing access, and executing operations on the ground.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {authenticated ? (
                <Link
                  href={isVolunteer ? "/attendance" : "/dashboard"}
                  className="inline-flex items-center gap-8 px-5 py-3.5 text-xs font-semibold text-[var(--background)] transition-colors bg-fuchsia-600 hover:text-white"
                >
                  {isVolunteer ? "Open Attendance Desk" : "Enter Operations Console"}
                  <span>↗</span>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-8 bg-[var(--foreground)] px-5 py-3.5 text-xs font-semibold text-[var(--background)] transition-colors hover:bg-fuchsia-600 hover:text-white"
                >
                  Access Staff Portal
                  <span>↗</span>
                </Link>
              )}
            </div>
          </div>

          <div className="border-l border-[var(--surface-border)] pl-7 lg:mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Event Information
            </p>

            <div className="mt-7 space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Location
                </p>
                <p className="mt-2 text-sm font-medium">
                  Lovely Professional University
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Phagwara, Punjab, India
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Event Dates
                </p>
                <p className="mt-2 text-sm font-medium">
                  November 12 — 16, 2026
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  Access Classification
                </p>
                <p className="mt-2 text-sm font-medium">
                  Restricted · Internal
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-600">
                System Directory
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                Operational modules
              </h2>
            </div>

            <p className="text-xs text-[var(--muted)]">
              {availableModules.length.toString().padStart(2, "0")} available modules
            </p>
          </div>

          <div className="border-t border-[var(--surface-border)]">
            {availableModules.map((module) => (
              <Link
                key={module.number}
                href={module.href}
                className="group grid gap-4 border-b border-[var(--surface-border)] py-7 transition-colors hover:bg-[var(--surface)] sm:grid-cols-[70px_1fr_190px_30px] sm:items-center sm:px-4"
              >
                <span className="font-mono text-xs text-[var(--muted)]">
                  {module.number}
                </span>

                <div>
                  <h3 className="text-base font-semibold tracking-tight transition-colors group-hover:text-fuchsia-600">
                    {module.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--muted)]">
                    {module.description}
                  </p>
                </div>

                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {module.access}
                </span>

                <span className="text-lg text-[var(--muted)] transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fuchsia-600">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12 flex flex-col justify-between gap-5 border-t border-[var(--surface-border)] py-7 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium">
              AWS Student Builder Group
            </p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Lovely Professional University
            </p>
          </div>

          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
            Re:Invent Fest 2026 · Internal Operations
          </p>
        </section>
      </div>
    </main>
  )
}