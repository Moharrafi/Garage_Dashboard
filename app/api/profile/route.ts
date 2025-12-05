import { NextResponse, type NextRequest } from "next/server"
import { getOrCreateAdminProfile, toPublicProfile, updateAdminProfileFields } from "@/lib/profile"

export async function GET() {
  try {
    const profile = await getOrCreateAdminProfile()
    return NextResponse.json(toPublicProfile(profile))
  } catch (error) {
    console.error("Failed to load profile:", error)
    return NextResponse.json({ message: "Gagal memuat profil" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json()
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Data tidak valid" }, { status: 400 })
    }
    const updated = await updateAdminProfileFields(payload)
    return NextResponse.json(toPublicProfile(updated))
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json({ message: "Gagal memperbarui profil" }, { status: 500 })
  }
}
