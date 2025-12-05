import crypto from "crypto"
import type { NotificationItem } from "@/lib/types"

/**
 * Notifications are now kept entirely in memory so they only live for the
 * lifetime of the running app. This keeps the UI responsive without needing
 * any database tables.
 */
const DEFAULT_PROFILE_ID = "local-profile"

let notifications: NotificationItem[] = [
  {
    id: crypto.randomUUID(),
    profile_id: DEFAULT_PROFILE_ID,
    title: "Selamat datang kembali",
    message: "Gunakan panel ini untuk mengelola stok dan progres unit bengkel.",
    type: "info",
    is_read: false,
    created_at: new Date(),
  },
  {
    id: crypto.randomUUID(),
    profile_id: DEFAULT_PROFILE_ID,
    title: "Servis mendekati batas",
    message: "Unit CB150R milik Andi hampir selesai, cek statusnya untuk update terbaru.",
    type: "warning",
    is_read: false,
    created_at: new Date(),
  },
]

function clone(list: NotificationItem[]) {
  return list.map((notif) => ({ ...notif }))
}

export async function createNotification(fields: Omit<NotificationItem, "id" | "created_at">) {
  const notif: NotificationItem = {
    id: crypto.randomUUID(),
    created_at: new Date(),
    ...fields,
  }
  notifications = [notif, ...notifications].slice(0, 100)
  return { ...notif }
}

export async function getNotifications() {
  const ordered = [...notifications].sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  return clone(ordered)
}

export async function markNotificationRead(id: string, read: boolean) {
  notifications = notifications.map((notif) => (notif.id === id ? { ...notif, is_read: read } : notif))
}

export async function deleteNotification(id: string) {
  notifications = notifications.filter((notif) => notif.id !== id)
}

export async function deleteAllNotifications() {
  notifications = []
}

export async function markAllNotificationsRead() {
  notifications = notifications.map((notif) => ({ ...notif, is_read: true }))
}
