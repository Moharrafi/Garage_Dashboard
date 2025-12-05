import { NextResponse, type NextRequest } from "next/server"
import { createSessionToken } from "@/lib/auth/session"
import { getOrCreateAdminProfile } from "@/lib/profile"
import { verifyPassword } from "@/lib/auth/password"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 })
  }

  const profile = await getOrCreateAdminProfile()
  const emailMatches = email === profile.email
  const passwordMatches = await verifyPassword(password, profile.password_hash, profile.password_salt)

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ message: "Email atau password salah" }, { status: 401 })
  }

  const token = await createSessionToken(email)
  const response = NextResponse.json({ success: true })
  response.cookies.set("session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
