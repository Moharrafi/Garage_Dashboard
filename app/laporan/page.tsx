"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Printer, Calendar, Package, Car, ArrowLeftRight, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/store"
import type { Item, Unit, StockTransaction } from "@/lib/types"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"

export default function LaporanPage() {
  const [reportType, setReportType] = useState("stok")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [items, setItems] = useState<Item[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [itemsData, unitsData, transactionsData] = await Promise.all([
          apiFetch<Item[]>("/api/items"),
          apiFetch<Unit[]>("/api/units"),
          apiFetch<StockTransaction[]>("/api/transactions"),
        ])

        setItems(itemsData)
        setUnits(unitsData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Gagal memuat data laporan:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePrint = () => {
    const printContent = printRef.current
    if (printContent) {
      const printWindow = window.open("", "", "height=600,width=800")
      if (printWindow) {
        printWindow.document.write("<html><head><title>Laporan GTA Garage</title>")
        printWindow.document.write("<style>")
        printWindow.document.write(`
          body { font-family: system-ui, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
          .header { margin-bottom: 30px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
        `)
        printWindow.document.write("</style></head><body>")
        printWindow.document.write('<div class="header">')
        printWindow.document.write(
          "<h1>GTA Garage - Laporan " +
            (reportType === "stok" ? "Stok Barang" : reportType === "transaksi" ? "Transaksi Stok" : "Unit Servis") +
            "</h1>",
        )
        printWindow.document.write("<h2>Tanggal Cetak: " + new Date().toLocaleDateString("id-ID") + "</h2>")
        printWindow.document.write("</div>")
        printWindow.document.write(printContent.innerHTML)
        printWindow.document.write("</body></html>")
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const filteredUnits = units.filter((unit) => {
    if (!dateFrom && !dateTo) return true
    const checkInDate = new Date(unit.check_in_date)
    const from = dateFrom ? new Date(dateFrom) : new Date("1970-01-01")
    const to = dateTo ? new Date(dateTo) : new Date("2099-12-31")
    return checkInDate >= from && checkInDate <= to
  })

  const filteredTransactions = transactions.filter((tx) => {
    if (!dateFrom && !dateTo) return true
    const txDate = new Date(tx.created_at)
    const from = dateFrom ? new Date(dateFrom) : new Date("1970-01-01")
    const to = dateTo ? new Date(dateTo) : new Date("2099-12-31")
    return txDate >= from && txDate <= to
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-64 p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <PageTransition>
        <main className="lg:ml-64 p-6 transition-all duration-300">
        <DashboardHeader title="Laporan" subtitle="Cetak dan unduh laporan bengkel" />

        {/* Report Type Selection */}
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground">Pilih Jenis Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <Tabs value={reportType} onValueChange={setReportType} className="flex-1">
                <TabsList className="w-full bg-secondary grid grid-cols-3">
                  <TabsTrigger value="stok" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Stok Barang</span>
                  </TabsTrigger>
                  <TabsTrigger value="transaksi" className="flex items-center gap-2">
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="hidden sm:inline">Transaksi</span>
                  </TabsTrigger>
                  <TabsTrigger value="unit" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span className="hidden sm:inline">Unit Servis</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-secondary border-border w-full sm:w-auto"
                    placeholder="Dari"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-secondary border-border w-full sm:w-auto"
                  />
                </div>
                <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Laporan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Preview Laporan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={printRef}>
              {/* Stock Report */}
              {reportType === "stok" && (
                <div className="overflow-x-auto">
                <Table className="min-w-[820px] table-auto md:table-fixed border-separate border-spacing-0">
                  <TableHeader>
                    <TableRow className="bg-muted/60 border border-border rounded-lg overflow-hidden shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.45)] [&>th]:px-4 [&>th]:py-3 [&>th]:text-muted-foreground [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                      <TableHead>No</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                      <TableHead className="text-right">Min. Stok</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                      <TableBody className="divide-y divide-border/40">
                      {items.map((item, index) => (
                        <TableRow key={item.id} className="border-b border-border/60 last:border-b-0">
                          <TableCell className="text-muted-foreground py-4">{index + 1}</TableCell>
                          <TableCell className="font-medium text-card-foreground py-4">{item.name}</TableCell>
                          <TableCell className="text-muted-foreground py-4">{item.category}</TableCell>
                          <TableCell className="text-right text-card-foreground py-4">
                            {item.stock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground py-4">{item.min_stock}</TableCell>
                          <TableCell className="text-right text-card-foreground py-4">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="py-4">
                            {item.stock <= item.min_stock ? (
                              <Badge className="bg-destructive/15 text-destructive border border-destructive/30">Menipis</Badge>
                            ) : (
                              <Badge className="bg-success/15 text-success border border-success/30">Tersedia</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 p-4 bg-secondary rounded-lg">
                    <p className="text-card-foreground font-medium">
                      Total Jenis Barang: {items.length} | Total Stok:{" "}
                      {items.reduce((sum, item) => sum + item.stock, 0)} | Nilai Inventaris:{" "}
                      {formatCurrency(items.reduce((sum, item) => sum + item.stock * item.price, 0))}
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Report */}
              {reportType === "transaksi" && (
                <div className="overflow-x-auto">
                <Table className="min-w-[820px] table-auto md:table-fixed border-separate border-spacing-0">
                  <TableHeader>
                    <TableRow className="bg-muted/60 border border-border rounded-lg overflow-hidden shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.45)] [&>th]:px-4 [&>th]:py-3 [&>th]:text-muted-foreground [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                      <TableHead>No</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                <TableBody className="divide-y divide-border/40">
                      {filteredTransactions.map((tx, index) => (
                        <TableRow key={tx.id} className="border-b border-border/60 last:border-b-0">
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(tx.created_at)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tx.type === "masuk"
                                  ? "bg-success/20 text-success"
                                  : "bg-destructive/20 text-destructive"
                              }
                            >
                              {tx.type === "masuk" ? "Masuk" : "Keluar"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-card-foreground">{tx.item_name}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${tx.type === "masuk" ? "text-success" : "text-destructive"}`}
                          >
                            {tx.type === "masuk" ? "+" : "-"}
                            {tx.quantity}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{tx.note}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 p-4 bg-secondary rounded-lg">
                    <p className="text-card-foreground font-medium">
                      Total Transaksi: {filteredTransactions.length} | Barang Masuk:{" "}
                      {filteredTransactions.filter((t) => t.type === "masuk").reduce((sum, t) => sum + t.quantity, 0)} |
                      Barang Keluar:{" "}
                      {filteredTransactions.filter((t) => t.type === "keluar").reduce((sum, t) => sum + t.quantity, 0)}
                    </p>
                  </div>
                </div>
              )}

              {/* Unit Report */}
              {reportType === "unit" && (
                <div className="overflow-x-auto">
                <Table className="min-w-[820px] table-auto md:table-fixed border-separate border-spacing-0">
                  <TableHeader>
                    <TableRow className="bg-muted/60 border border-border rounded-lg overflow-hidden shadow-sm dark:shadow-[0_1px_4px_rgba(0,0,0,0.45)] [&>th]:px-4 [&>th]:py-3 [&>th]:text-muted-foreground [&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                      <TableHead>No</TableHead>
                      <TableHead>Kendaraan</TableHead>
                      <TableHead>Pemilik</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead className="text-right">Biaya</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {filteredUnits.map((unit, index) => (
                        <TableRow key={unit.id} className="border-b border-border/60 last:border-b-0">
                          <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="text-card-foreground">
                            {unit.brand} ({unit.vehicle_type})
                          </TableCell>
                          <TableCell className="text-card-foreground">{unit.owner_name}</TableCell>
                          <TableCell className="text-muted-foreground capitalize">{unit.service_type}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(unit.check_in_date)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {unit.check_out_date ? formatDate(unit.check_out_date) : "-"}
                          </TableCell>
                          <TableCell className="text-right text-card-foreground">
                            {formatCurrency(unit.final_cost || unit.estimated_cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 p-4 bg-secondary rounded-lg">
                    <p className="text-card-foreground font-medium">
                      Total Unit: {filteredUnits.length} | Selesai:{" "}
                      {filteredUnits.filter((u) => u.status === "check-out" || u.status === "selesai").length} | Total
                      Pendapatan:{" "}
                      {formatCurrency(
                        filteredUnits.filter((u) => u.final_cost).reduce((sum, u) => sum + (u.final_cost || 0), 0),
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </main>
      </PageTransition>
    </div>
  )
}
