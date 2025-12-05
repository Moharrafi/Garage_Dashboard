import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"
import type { Unit } from "@/lib/types"

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveParams(context: RouteContext) {
  const possiblePromise = context.params
  if (typeof (possiblePromise as Promise<{ id: string }>).then === "function") {
    return (possiblePromise as Promise<{ id: string }>).then((value) => value)
  }
  return possiblePromise as { id: string }
}

const allowedFields = new Set([
  "vehicle_type",
  "brand",
  "owner_name",
  "phone",
  "service_type",
  "status",
  "check_in_date",
  "check_out_date",
  "estimated_cost",
  "final_cost",
  "notes",
])

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await resolveParams(context)
  const updates = await request.json()
  const fields: string[] = []
  const values: unknown[] = []

  for (const [key, value] of Object.entries(updates)) {
    if (!allowedFields.has(key)) continue
    fields.push(`${key} = ?`)
    values.push(value)
  }

  if (fields.length === 0) {
    return NextResponse.json({ message: "Tidak ada data untuk diperbarui" }, { status: 400 })
  }

  fields.push("updated_at = NOW()")
  await query(`UPDATE units SET ${fields.join(", ")} WHERE id = ?`, [...values, id])
  const [unit] = await query<Unit[]>("SELECT * FROM units WHERE id = ?", [id])
  const safeUnit = unit ? JSON.parse(JSON.stringify(unit)) : null
  return NextResponse.json(safeUnit)
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await resolveParams(context)
  const result = await query<{ affectedRows?: number }>("DELETE FROM units WHERE id = ?", [id])
  const deleted = Array.isArray(result) ? result.length > 0 : Boolean(result?.affectedRows)
  return NextResponse.json({ success: deleted })
}
