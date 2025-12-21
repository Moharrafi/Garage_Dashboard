"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, ArrowDownRight, ArrowUpRight, Search, LayoutGrid, List, Calendar, Loader2 } from "lucide-react"
import { formatDate, type StockTransaction, type Item } from "@/lib/types"
import { useToast } from "@/components/toast-notification"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"

export default function TransaksiPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"masuk" | "keluar">("masuk")
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("q") ?? ""
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [filterType, setFilterType] = useState<"semua" | "masuk" | "keluar">("semua")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const { showToast } = useToast()
  const [newTransaction, setNewTransaction] = useState({
    itemId: "",
    quantity: 0,
    note: "",
    date: new Date().toISOString().split("T")[0],
  })

  const fetchData = useCallback(async () => {
    try {
      const [transactionsRes, itemsRes] = await Promise.all([
        apiFetch<StockTransaction[]>("/api/transactions"),
        apiFetch<Item[]>("/api/items"),
      ])

      setTransactions(transactionsRes || [])
      setItems(itemsRes || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Gagal memuat data transaksi", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === "semua" || tx.type === filterType
    return matchesSearch && matchesType
  })

  const handleAddTransaction = async () => {
    const selectedItem = items.find((i) => i.id === newTransaction.itemId)
    if (!selectedItem || newTransaction.quantity <= 0) {
      showToast("Pilih barang dan masukkan jumlah yang valid", "error")
      return
    }

    // Check if stock is sufficient for keluar transaction
    if (transactionType === "keluar" && newTransaction.quantity > selectedItem.stock) {
      showToast("Stok tidak mencukupi", "error")
      return
    }

    setSaving(true)
    try {
      // Insert transaction
      const result = await apiFetch<{ transaction: StockTransaction; item: Item }>(`/api/transactions`, {
        method: "POST",
        body: JSON.stringify({
          item_id: newTransaction.itemId,
          type: transactionType,
          quantity: newTransaction.quantity,
          date: newTransaction.date,
          note: newTransaction.note,
        }),
      })

      setTransactions([result.transaction, ...transactions])
      setItems(items.map((item) => (item.id === result.item.id ? result.item : item)))
      setNewTransaction({ itemId: "", quantity: 0, note: "", date: new Date().toISOString().split("T")[0] })
      setIsAddOpen(false)
      showToast(`Transaksi barang ${transactionType} berhasil ditambahkan`, "success")
    } catch (error) {
      console.error("Error adding transaction:", error)
      showToast("Gagal menambahkan transaksi", "error")
    } finally {
      setSaving(false)
    }
  }

  const masukCount = transactions.filter((t) => t.type === "masuk").length
  const keluarCount = transactions.filter((t) => t.type === "keluar").length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 transition-all duration-300">
          <DashboardHeader title="Barang Masuk & Keluar" subtitle="Kelola transaksi stok barang bengkel" />
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <PageTransition>
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 transition-all duration-300">
        <DashboardHeader title="Barang Masuk & Keluar" subtitle="Kelola transaksi stok barang bengkel" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <ArrowDownRight className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Barang Masuk</p>
                  <p className="text-xl font-bold text-card-foreground">{masukCount} Transaksi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Barang Keluar</p>
                  <p className="text-xl font-bold text-card-foreground">{keluarCount} Transaksi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="text-xl font-bold text-card-foreground">{transactions.length} Transaksi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-card-foreground">Riwayat Transaksi</CardTitle>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari transaksi..."
                    className="pl-9 w-full bg-secondary border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs
                  value={filterType}
                  onValueChange={(v) => setFilterType(v as typeof filterType)}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  <TabsList className="bg-secondary w-full grid grid-cols-3 rounded-full p-1 gap-1 overflow-hidden">
                    <TabsTrigger
                      value="semua"
                      className="px-4 py-0.5 text-sm rounded-full transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Semua
                    </TabsTrigger>
                    <TabsTrigger
                      value="masuk"
                      className="px-4 py-0.5 text-sm rounded-full transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Masuk
                    </TabsTrigger>
                    <TabsTrigger
                      value="keluar"
                      className="px-4 py-0.5 text-sm rounded-full transition-all duration-200 ease-out data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Keluar
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex border border-border rounded-lg overflow-hidden flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-none h-9 flex-1 sm:flex-none ${viewMode === "table" ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4 mx-auto" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-none h-9 flex-1 sm:flex-none ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4 mx-auto" />
                  </Button>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Transaksi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-500">
                    <DialogHeader>
                      <DialogTitle className="text-card-foreground">Tambah Transaksi Stok</DialogTitle>
                      <DialogDescription>Catat barang masuk atau keluar dari inventaris.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Tipe Transaksi</Label>
                        <Tabs
                          value={transactionType}
                          onValueChange={(v) => setTransactionType(v as "masuk" | "keluar")}
                        >
                          <TabsList className="w-full bg-secondary">
                            <TabsTrigger value="masuk" className="flex-1">
                              Barang Masuk
                            </TabsTrigger>
                            <TabsTrigger value="keluar" className="flex-1">
                              Barang Keluar
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                      <div className="grid gap-2">
                        <Label>Pilih Barang</Label>
                        <Select
                          value={newTransaction.itemId}
                          onValueChange={(value) => setNewTransaction({ ...newTransaction, itemId: value })}
                        >
                          <SelectTrigger className="bg-secondary border-border">
                            <SelectValue placeholder="Pilih barang..." />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} (Stok: {item.stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Jumlah</Label>
                          <Input
                            type="number"
                            value={newTransaction.quantity}
                            onChange={(e) =>
                              setNewTransaction({ ...newTransaction, quantity: Number.parseInt(e.target.value) || 0 })
                            }
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Tanggal</Label>
                          <Input
                            type="date"
                            value={newTransaction.date}
                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Keterangan</Label>
                        <Textarea
                          value={newTransaction.note}
                          onChange={(e) => setNewTransaction({ ...newTransaction, note: e.target.value })}
                          placeholder="Tambahkan keterangan transaksi..."
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saving}>
                        Batal
                      </Button>
                      <Button
                        onClick={handleAddTransaction}
                        className="bg-primary text-primary-foreground"
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Simpan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <div className="min-w-[780px] rounded-xl border border-border/80 overflow-hidden bg-card">
                  <Table className="w-full table-auto md:table-fixed border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/60 border-b border-border/40 [&>th]:px-4 [&>th]:py-3 [&>th]:text-muted-foreground [&>th]:text-center">
                        <TableHead>Tipe</TableHead>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            {searchTerm || filterType !== "semua"
                              ? "Tidak ada transaksi yang sesuai filter"
                              : "Belum ada data transaksi"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((tx, index) => (
                          <TableRow
                            key={tx.id}
                            className="border-b border-border/50 last:border-b-0 transition-all duration-300 ease-out hover:bg-muted/30 hover:translate-x-0.5 [&>td]:text-center"
                            style={{ transitionDelay: `${index * 25}ms` }}
                          >
                            <TableCell>
                              <Badge
                                className={
                                  tx.type === "masuk"
                                    ? "bg-success/20 text-success border-success/30"
                                    : "bg-destructive/20 text-destructive border-destructive/30"
                                }
                              >
                                {tx.type === "masuk" ? (
                                  <>
                                    <ArrowDownRight className="h-3 w-3 mr-1" /> Masuk
                                  </>
                                ) : (
                                  <>
                                    <ArrowUpRight className="h-3 w-3 mr-1" /> Keluar
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-card-foreground">{tx.item_name}</TableCell>
                            <TableCell
                              className={`font-medium ${tx.type === "masuk" ? "text-success" : "text-destructive"}`}
                            >
                              {tx.type === "masuk" ? "+" : "-"}
                              {tx.quantity}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{formatDate(tx.date)}</TableCell>
                            <TableCell className="text-muted-foreground max-w-xs truncate">{tx.note || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTransactions.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    {searchTerm || filterType !== "semua"
                      ? "Tidak ada transaksi yang sesuai filter"
                      : "Belum ada data transaksi"}
                  </div>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <Card
                      key={tx.id}
                      className={`border-l-4 transition-all duration-300 ease-out hover:-translate-y-1 ${
                        tx.type === "masuk" ? "border-l-success" : "border-l-destructive"
                      }`}
                      style={{ transitionDelay: `${index * 25}ms` }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            className={
                              tx.type === "masuk"
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-destructive/20 text-destructive border-destructive/30"
                            }
                          >
                            {tx.type === "masuk" ? (
                              <>
                                <ArrowDownRight className="h-3 w-3 mr-1" /> Masuk
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-3 w-3 mr-1" /> Keluar
                              </>
                            )}
                          </Badge>
                          <span
                            className={`text-lg font-bold ${tx.type === "masuk" ? "text-success" : "text-destructive"}`}
                          >
                            {tx.type === "masuk" ? "+" : "-"}
                            {tx.quantity}
                          </span>
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-2">{tx.item_name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(tx.date)}
                        </div>
                        {tx.note && (
                          <p className="text-xs text-muted-foreground line-clamp-2 bg-secondary/50 p-2 rounded">
                            {tx.note}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        </main>
      </PageTransition>
    </div>
  )
}
