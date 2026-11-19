import type { Metadata, Viewport } from "next"
import "./globals.css"

import { AuthProvider } from "@/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Shell } from "@/components/layout/shell"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: {
    default: "Re:Invent Fest 2026 | Operations",
    template: "%s | Re:Invent Fest 2026",
  },
  description:
    "Official team operations and event management portal for AWS Re:Invent Fest 2026 at Lovely Professional University.",
  applicationName: "Re:Invent Fest Operations",
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  colorScheme: "light dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <AuthProvider>
          <Navbar />
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  )
}
