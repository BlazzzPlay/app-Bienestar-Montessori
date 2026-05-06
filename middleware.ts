import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const cookies = request.cookies
  const hasAuthCookie = Array.from(cookies.getAll()).some((cookie) =>
    /^sb-.*-auth-token$/.test(cookie.name),
  )

  if (!hasAuthCookie) {
    const returnUrl = encodeURIComponent(request.nextUrl.pathname)
    const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/perfil/:path*",
    "/directorio/:path*",
    "/sugerencias/:path*",
    "/eventos/:id/:path*",
    "/beneficios/:id/:path*",
    "/admin/:path*",
  ],
}
