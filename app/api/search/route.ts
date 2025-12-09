import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Item, StockTransaction, Unit, GlobalSearchItem } from "@/lib/types"

const SEARCH_LIMIT = 60

export async function GET() {
  try {
    const [items, transactions, units] = await Promise.all([
      query<Item[]>(`SELECT id, name, category, stock, min_stock, price, unit FROM items ORDER BY updated_at DESC LIMIT ${SEARCH_LIMIT}`),
      query<StockTransaction[]>(
        `SELECT id, item_name, type, quantity, note, date, created_at FROM stock_transactions ORDER BY created_at DESC LIMIT ${SEARCH_LIMIT}`,
      ),
      query<Unit[]>(
        `SELECT id, brand, owner_name, vehicle_type, service_type, status, check_in_date FROM units ORDER BY created_at DESC LIMIT ${SEARCH_LIMIT}`,
      ),
    ])

    const results: GlobalSearchItem[] = [
      ...items.map((item) => ({
        id: `item-${item.id}`,
        title: item.name,
        subtitle: `${item.category} • ${item.stock} ${item.unit}`,
        category: "stok" as const,
        href: `/stok?q=${encodeURIComponent(item.name)}`,
        keywords: [item.category, item.unit, String(item.stock), String(item.price)],
      })),
      ...transactions.map((tx) => ({
        id: `tx-${tx.id}`,
        title: `${tx.type === "masuk" ? "Barang Masuk" : "Barang Keluar"} • ${tx.item_name}`,
        subtitle: `${new Date(tx.created_at ?? tx.date).toLocaleDateString("id-ID")} • ${tx.quantity} unit`,
        category: "transaksi" as const,
        href: `/transaksi?q=${encodeURIComponent(tx.item_name)}`,
        keywords: [tx.item_name, tx.type, tx.note ?? ""],
      })),
      ...units.map((unit) => ({
        id: `unit-${unit.id}`,
        title: `${unit.brand} (${unit.vehicle_type})`,
        subtitle: `${unit.owner_name} • ${unit.service_type} • ${unit.status}`,
        category: "unit" as const,
        href: `/unit?q=${encodeURIComponent(unit.brand)}`,
        keywords: [unit.owner_name, unit.service_type, unit.status],
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error("Gagal memuat data pencarian global:", error)
    return NextResponse.json({ message: "Gagal memuat data pencarian" }, { status: 500 })
  }
}
