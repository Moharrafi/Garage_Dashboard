import { NextResponse } from "next/server"
import { updateAdminProfileFields } from "@/lib/profile"

const MAX_FILE_SIZE = 3 * 1024 * 1024 // ~3MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const avatar = formData.get("avatar")

    if (!(avatar instanceof File)) {
      return NextResponse.json({ message: "File avatar tidak ditemukan" }, { status: 400 })
    }

    if (avatar.size === 0) {
      return NextResponse.json({ message: "File avatar kosong" }, { status: 400 })
    }

    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Ukuran file terlalu besar (maksimal 3MB)" }, { status: 413 })
    }

    const arrayBuffer = await avatar.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = avatar.type || "image/png"
    const base64Image = `data:${mimeType};base64,${buffer.toString("base64")}`

    const updatedProfile = await updateAdminProfileFields({ avatar_url: base64Image })

    return NextResponse.json({ avatar_url: updatedProfile.avatar_url ?? base64Image })
  } catch (error) {
    console.error("Gagal mengunggah avatar:", error)
    return NextResponse.json({ message: "Gagal mengunggah avatar" }, { status: 500 })
  }
}
