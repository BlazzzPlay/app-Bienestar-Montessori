import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pbAuth = request.cookies.get("pb_auth")

  if (!pbAuth?.value) {
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
    "/eventos/:path*",
    "/beneficios/:path*",
    "/admin/:path*",
  ],
}
