import { NextResponse } from "next/server"
import { deleteAllNotifications, getNotifications } from "@/lib/notifications"

export async function GET() {
  try {
    const notifications = await getNotifications()
    return NextResponse.json(
      notifications.map((notif) => ({
        ...notif,
        created_at: notif.created_at.toISOString(),
      })),
    )
  } catch (error) {
    console.error("Failed to load notifications:", error)
    return NextResponse.json({ message: "Gagal memuat notifikasi" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await deleteAllNotifications()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete notifications:", error)
    return NextResponse.json({ message: "Gagal menghapus notifikasi" }, { status: 500 })
  }
}
