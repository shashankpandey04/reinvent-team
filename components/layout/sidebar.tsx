"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  QrCode,
  BarChart3,
  TrendingUp,
  Ticket,
  Users,
  Shield,
  MapPin,
  ShieldCheck,
  Building2,
  CalendarDays,
  Mic2,
  Tags,
  LogOut,
  ChevronRight,
  Globe
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Operations",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Scanner Desk", href: "/attendance", icon: QrCode },
      { label: "Team Portal Home", href: "/", icon: Globe }
    ]
  },
  {
    title: "Analytics & Telemetry",
    items: [
      { label: "Attendance Analytics", href: "/attendance-analytics", icon: BarChart3, roles: ["organizer", "admin"] },
      { label: "Sales & Registrations", href: "/registration-analytics", icon: TrendingUp, roles: ["organizer", "admin"] },
      { label: "Issued Passes", href: "/tickets", icon: Ticket, roles: ["organizer", "admin"] }
    ]
  },
  {
    title: "People & Staff",
    items: [
      { label: "Volunteer Crew", href: "/volunteers", icon: Users, roles: ["organizer", "admin"] },
      { label: "Organizers & Leads", href: "/organizers", icon: Shield, roles: ["admin"] }
    ]
  },
  {
    title: "Campus & Logistics",
    items: [
      { label: "Campus Spots & Gates", href: "/spots", icon: MapPin, roles: ["organizer", "admin"] },
      { label: "Checkpoints", href: "/checkpoints", icon: ShieldCheck, roles: ["organizer", "admin"] },
      { label: "Venues & Stages", href: "/venues", icon: Building2, roles: ["organizer", "admin"] }
    ]
  },
  {
    title: "Event Programming",
    items: [
      { label: "Sessions & Agenda", href: "/sessions", icon: CalendarDays, roles: ["organizer", "admin"] },
      { label: "Keynote Speakers", href: "/speakers", icon: Mic2, roles: ["organizer", "admin"] },
      { label: "Ticket Categories", href: "/ticket-categories", icon: Tags, roles: ["admin", "organizer"] }
    ]
  }
]

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user, logout, isOrganizer, isAdmin, isVolunteer } = useAuth()

  const userRoles = user?.roles || []

  function canAccess(roles?: string[]) {
    if (!roles || roles.length === 0) return true
    return roles.some((r) => userRoles.includes(r))
  }

  const primaryRole = isAdmin
    ? "Admin"
    : isOrganizer
    ? "Organizer"
    : isVolunteer
    ? "Volunteer"
    : "Staff"

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white font-bold text-xs tracking-tight">
              AWS
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-950 leading-none">
                Re:Invent '26
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Operations Console
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, idx) => {
            const accessibleItems = section.items.filter((item) => canAccess(item.roles))
            if (accessibleItems.length === 0) return null

            return (
              <div key={idx} className="space-y-0.5">
                <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </div>

                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                          isActive
                            ? "bg-slate-100 text-slate-950 font-semibold border-l-2 border-slate-900"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 ${
                              isActive ? "text-slate-950" : "text-slate-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-200 p-3 bg-slate-50/70">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-900">
                {user ? `${user.first_name} ${user.last_name}` : "Staff Member"}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase bg-slate-200 text-slate-700">
                  {primaryRole}
                </span>
                <span className="truncate text-[11px] text-slate-500">
                  {user?.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
