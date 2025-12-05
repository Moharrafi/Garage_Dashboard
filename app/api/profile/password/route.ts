import { NextResponse, type NextRequest } from "next/server"
import { getOrCreateAdminProfile, saveAdminPassword } from "@/lib/profile"
import { hashPassword, verifyPassword } from "@/lib/auth/password"

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "Lengkapi semua field password" }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: "Konfirmasi password tidak cocok" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter" }, { status: 400 })
    }

    const profile = await getOrCreateAdminProfile()
    const validCurrent = await verifyPassword(currentPassword, profile.password_hash, profile.password_salt)
    if (!validCurrent) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 })
    }

    const { hash, salt } = await hashPassword(newPassword)
    await saveAdminPassword(hash, salt)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update password:", error)
    return NextResponse.json({ message: "Gagal memperbarui password" }, { status: 500 })
  }
}
