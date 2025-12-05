import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"
import type { Unit } from "@/lib/types"

export async function GET() {
  const units = await query<Unit[]>("SELECT * FROM units ORDER BY created_at DESC")
  return NextResponse.json(units)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const id = crypto.randomUUID()

  await query(
    `INSERT INTO units (
      id, vehicle_type, brand, owner_name, phone, service_type, status,
      check_in_date, check_out_date, estimated_cost, final_cost, notes,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, 'check-in', ?, NULL, ?, NULL, ?, NOW(), NOW()
    )`,
    [
      id,
      body.vehicle_type,
      body.brand,
      body.owner_name,
      body.phone,
      body.service_type,
      body.check_in_date,
      body.estimated_cost,
      body.notes,
    ],
  )

  const [unit] = await query<Unit[]>("SELECT * FROM units WHERE id = ?", [id])
  return NextResponse.json(unit, { status: 201 })
}
