import { NextResponse, type NextRequest } from "next/server"
import { getConnection, query } from "@/lib/db"
import type { Item, StockTransaction } from "@/lib/types"

export async function GET() {
  const transactions = await query<StockTransaction[]>(
    "SELECT * FROM stock_transactions ORDER BY created_at DESC",
  )
  return NextResponse.json(transactions)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const connection = await getConnection()

  try {
    await connection.beginTransaction()
    const [items] = await connection.query<Item[]>("SELECT * FROM items WHERE id = ?", [body.item_id])

    if (!Array.isArray(items) || items.length === 0) {
      await connection.rollback()
      return NextResponse.json({ message: "Barang tidak ditemukan" }, { status: 404 })
    }

    const item = items[0]
    const quantity = Number(body.quantity)
    const type = body.type as "masuk" | "keluar"
    const newStock = type === "masuk" ? item.stock + quantity : item.stock - quantity

    if (newStock < 0) {
      await connection.rollback()
      return NextResponse.json({ message: "Stok tidak mencukupi" }, { status: 400 })
    }

    const txId = crypto.randomUUID()

    await connection.query(
      `INSERT INTO stock_transactions (
        id, item_id, item_name, type, quantity, date, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [txId, body.item_id, item.name, type, quantity, body.date, body.note],
    )

    await connection.query("UPDATE items SET stock = ?, updated_at = NOW() WHERE id = ?", [newStock, item.id])

    await connection.commit()

    const [transactionRow] = await query<StockTransaction[]>("SELECT * FROM stock_transactions WHERE id = ?", [txId])

    return NextResponse.json({
      transaction: transactionRow ?? {
        id: txId,
        item_id: item.id,
        item_name: item.name,
        type,
        quantity,
        date: body.date,
        note: body.note ?? null,
        created_at: new Date().toISOString(),
      },
      item: { ...item, stock: newStock },
    })
  } catch (error) {
    await connection.rollback()
    console.error(error)
    return NextResponse.json({ message: "Gagal menambahkan transaksi" }, { status: 500 })
  } finally {
    connection.release()
  }
}
