import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"
import type { Item } from "@/lib/types"

export async function GET() {
  const items = await query<Item[]>("SELECT * FROM items ORDER BY created_at DESC")
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const id = crypto.randomUUID()
  const finalCategory = body.category ?? "Sparepart"

  await query(
    `INSERT INTO items (id, name, category, stock, min_stock, price, unit, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [id, body.name, finalCategory, body.stock, body.min_stock, body.price, body.unit],
  )

  const [item] = await query<Item[]>(`SELECT * FROM items WHERE id = ?`, [id])
  return NextResponse.json(item, { status: 201 })
}
