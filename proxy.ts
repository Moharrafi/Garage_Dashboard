import { verifySessionToken } from "@/lib/auth/session"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = [
  "/auth/login",
  "/auth/sign-up",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
  "/favicon.ico",
]

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = publicPaths.some((path) => pathname.startsWith(path))
  const token = request.cookies.get("session-token")?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session && !isPublic && !pathname.startsWith("/_next")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectedFrom", pathname)
    return NextResponse.redirect(url)
  }

  if (session && pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
