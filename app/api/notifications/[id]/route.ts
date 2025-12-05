import { NextResponse, type NextRequest } from "next/server"
import { deleteNotification, markNotificationRead } from "@/lib/notifications"

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { read } = await request.json()
    if (typeof read !== "boolean") {
      return NextResponse.json({ message: "Status notifikasi tidak valid" }, { status: 400 })
    }
    await markNotificationRead(params.id, read)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update notification:", error)
    return NextResponse.json({ message: "Gagal memperbarui notifikasi" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: RouteParams) {
  try {
    await deleteNotification(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete notification:", error)
    return NextResponse.json({ message: "Gagal menghapus notifikasi" }, { status: 500 })
  }
}
