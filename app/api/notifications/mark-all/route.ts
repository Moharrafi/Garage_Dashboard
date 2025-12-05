import { NextResponse } from "next/server"
import { markAllNotificationsRead } from "@/lib/notifications"

export async function POST() {
  try {
    await markAllNotificationsRead()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark notifications as read:", error)
    return NextResponse.json({ message: "Gagal memperbarui notifikasi" }, { status: 500 })
  }
}
