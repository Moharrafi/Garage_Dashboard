import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db"
import type { Item } from "@/lib/types"

type RouteContext = {
  params: Promise<{ id: string }> | { id: string }
}

async function resolveParams(context: RouteContext) {
  const possiblePromise = context.params
  if (typeof (possiblePromise as Promise<{ id: string }>).then === "function") {
    return possiblePromise as Promise<{ id: string }>
  }
  return possiblePromise as { id: string }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await resolveParams(context)
  const updates = await request.json()
  await query(
    `UPDATE items
     SET name = ?, category = ?, stock = ?, min_stock = ?, price = ?, unit = ?, updated_at = NOW()
     WHERE id = ?`,
    [updates.name, updates.category, updates.stock, updates.min_stock, updates.price, updates.unit, id],
  )

  const [item] = await query<Item[]>(`SELECT * FROM items WHERE id = ?`, [id])
  const safeItem = item ? JSON.parse(JSON.stringify(item)) : null
  return NextResponse.json(safeItem)
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await resolveParams(context)
  const result = await query<{ affectedRows?: number }>("DELETE FROM items WHERE id = ?", [id])
  const deleted = Array.isArray(result) ? result.length > 0 : Boolean(result?.affectedRows)
  return NextResponse.json({ success: deleted })
}
