import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("reinvent_team_token")?.value

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  if (pathname === "/auth") {
    if (token) {
      const redirectParam = request.nextUrl.searchParams.get("redirect")
      const target =
        redirectParam && redirectParam.startsWith("/") && redirectParam !== "/auth"
          ? redirectParam
          : "/dashboard"
      return NextResponse.redirect(new URL(target, request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL("/auth", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
