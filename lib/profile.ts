import crypto from "crypto"
import { query } from "@/lib/db"
import { hashPassword } from "@/lib/auth/password"
import type { AdminProfile, AdminProfileRecord } from "@/lib/types"

const PROFILE_TABLE = "admin_profiles"

type ProfileRow = {
  id: string
  email: string
  password_hash: string
  password_salt: string
  full_name: string
  phone: string | null
  address: string | null
  workshop_name: string | null
  role: "admin" | "staff" | "owner"
  avatar_url: string | null
  join_date: Date | string | null
  notify_email: 0 | 1
  notify_push: 0 | 1
  notify_stock_alert: 0 | 1
  notify_unit_complete: 0 | 1
  notify_daily_report: 0 | 1
  created_at: Date | string
  updated_at: Date | string
}

type ProfileUpdatePayload = Partial<{
  full_name: string
  email: string
  phone: string
  address: string
  workshop_name: string
  avatar_url: string
  notify_email: boolean
  notify_push: boolean
  notify_stock_alert: boolean
  notify_unit_complete: boolean
  notify_daily_report: boolean
}>

export type { ProfileUpdatePayload }

async function ensureProfileTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${PROFILE_TABLE} (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(191) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      password_salt VARCHAR(255) NOT NULL,
      full_name VARCHAR(191) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      workshop_name VARCHAR(191),
      role ENUM('admin','staff','owner') NOT NULL DEFAULT 'staff',
      avatar_url LONGTEXT,
      join_date DATE DEFAULT (CURRENT_DATE),
      notify_email TINYINT(1) DEFAULT 1,
      notify_push TINYINT(1) DEFAULT 1,
      notify_stock_alert TINYINT(1) DEFAULT 1,
      notify_unit_complete TINYINT(1) DEFAULT 1,
      notify_daily_report TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
  await ensureLargeAvatarColumn()
}

async function ensureLargeAvatarColumn() {
  const columnInfo = await query<{ data_type: string | null }[]>(
    `
      SELECT DATA_TYPE as data_type
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = 'avatar_url'
    `,
    [PROFILE_TABLE],
  )

  if (columnInfo.length === 0) {
    return
  }

  const dataType = columnInfo[0].data_type?.toLowerCase()
  if (dataType !== "longtext") {
    await query(`ALTER TABLE ${PROFILE_TABLE} MODIFY COLUMN avatar_url LONGTEXT NULL`)
  }
}

function mapProfile(row: ProfileRow): AdminProfileRecord {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone ?? "",
    address: row.address ?? "",
    workshop_name: row.workshop_name ?? "",
    role: row.role,
    avatar_url: row.avatar_url ?? "",
    join_date: row.join_date ? new Date(row.join_date).toISOString() : null,
    notify_email: Boolean(row.notify_email),
    notify_push: Boolean(row.notify_push),
    notify_stock_alert: Boolean(row.notify_stock_alert),
    notify_unit_complete: Boolean(row.notify_unit_complete),
    notify_daily_report: Boolean(row.notify_daily_report),
    created_at: row.created_at,
    updated_at: row.updated_at,
    password_hash: row.password_hash,
    password_salt: row.password_salt,
  }
}

async function seedAdminProfile() {
  const email = process.env.APP_ADMIN_EMAIL ?? "admin@gtagarage.com"
  const password = process.env.APP_ADMIN_PASSWORD ?? "admin123"
  const { hash, salt } = await hashPassword(password)
  const id = crypto.randomUUID()
  const defaultName = "Admin GTA Garage"
  const workshopName = "GTA Garage"

  await query(
    `INSERT INTO ${PROFILE_TABLE} (
      id, email, password_hash, password_salt, full_name, workshop_name, role,
      notify_email, notify_push, notify_stock_alert, notify_unit_complete, notify_daily_report
    ) VALUES (?, ?, ?, ?, ?, ?, 'admin', 1, 1, 1, 1, 0)`,
    [id, email, hash, salt, defaultName, workshopName],
  )
}

export async function getOrCreateAdminProfile(): Promise<AdminProfileRecord> {
  await ensureProfileTable()
  const rows = await query<ProfileRow[]>(`SELECT * FROM ${PROFILE_TABLE} ORDER BY created_at ASC LIMIT 1`)
  if (rows.length > 0) {
    return mapProfile(rows[0])
  }
  await seedAdminProfile()
  const seeded = await query<ProfileRow[]>(`SELECT * FROM ${PROFILE_TABLE} ORDER BY created_at ASC LIMIT 1`)
  return mapProfile(seeded[0])
}

export function toPublicProfile(profile: AdminProfileRecord): AdminProfile {
  const { password_hash: _hash, password_salt: _salt, ...rest } = profile
  return rest
}

export async function updateAdminProfileFields(payload: ProfileUpdatePayload) {
  const profile = await getOrCreateAdminProfile()

  const fieldMap: Record<keyof ProfileUpdatePayload, string> = {
    full_name: "full_name",
    email: "email",
    phone: "phone",
    address: "address",
    workshop_name: "workshop_name",
    avatar_url: "avatar_url",
    notify_email: "notify_email",
    notify_push: "notify_push",
    notify_stock_alert: "notify_stock_alert",
    notify_unit_complete: "notify_unit_complete",
    notify_daily_report: "notify_daily_report",
  }

  const updates: string[] = []
  const values: unknown[] = []

  Object.entries(payload).forEach(([key, value]) => {
    const column = fieldMap[key as keyof ProfileUpdatePayload]
    if (!column || typeof value === "undefined" || value === null) return
    if (typeof value === "boolean") {
      updates.push(`${column} = ?`)
      values.push(value ? 1 : 0)
    } else {
      updates.push(`${column} = ?`)
      values.push(value)
    }
  })

  if (updates.length === 0) {
    return profile
  }

  updates.push("updated_at = NOW()")

  await query(`UPDATE ${PROFILE_TABLE} SET ${updates.join(", ")} WHERE id = ?`, [...values, profile.id])
  return getOrCreateAdminProfile()
}

export async function saveAdminPassword(hash: string, salt: string) {
  const profile = await getOrCreateAdminProfile()
  await query(`UPDATE ${PROFILE_TABLE} SET password_hash = ?, password_salt = ?, updated_at = NOW() WHERE id = ?`, [
    hash,
    salt,
    profile.id,
  ])
  return profile.id
}
