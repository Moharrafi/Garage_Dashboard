"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TrendingUp, DollarSign, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Printer, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/store"
import { useTheme } from "next-themes"
import type { Unit, StockTransaction } from "@/lib/types"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const monthOptions = [
  { value: "0", label: "Januari" },
  { value: "1", label: "Februari" },
  { value: "2", label: "Maret" },
  { value: "3", label: "April" },
  { value: "4", label: "Mei" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "Agustus" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Desember" },
]

const serviceColors: Record<string, string> = {
  "Servis Motor": "#22c55e",
  "Vapor Blasting": "#3b82f6",
  Sandblasting: "#f59e0b",
  Restorasi: "#8b5cf6",
}

const expenseCategories = [
  { category: "Pembelian Stok Barang", percentage: 48 },
  { category: "Gaji Karyawan", percentage: 31 },
  { category: "Listrik & Air", percentage: 6 },
  { category: "Perawatan Alat", percentage: 8 },
  { category: "Operasional Lainnya", percentage: 7 },
]

export default function KeuntunganPage() {
  const [startMonth, setStartMonth] = useState("0")
  const [endMonth, setEndMonth] = useState("11")
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const printRef = useRef<HTMLDivElement>(null)

  const [units, setUnits] = useState<Unit[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [unitsData, transactionsData] = await Promise.all([
          apiFetch<Unit[]>("/api/units"),
          apiFetch<StockTransaction[]>("/api/transactions"),
        ])

        setUnits(unitsData)
        setTransactions(transactionsData)
      } catch (error) {
        console.error("Gagal memuat data keuntungan:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate revenue from completed units
  const completedUnits = units.filter((u) => u.status === "selesai" || u.status === "check-out")
  const totalPendapatan = completedUnits.reduce((sum, u) => sum + (u.final_cost || u.estimated_cost), 0)

  // Calculate expenses from stock transactions (purchases)
  const stockExpenses = transactions.filter((t) => t.type === "masuk").reduce((sum, t) => sum + t.quantity * 10000, 0) // Assuming average cost per unit

  const totalPengeluaran = stockExpenses || totalPendapatan * 0.6 // Fallback to 60% of revenue
  const totalKeuntungan = totalPendapatan - totalPengeluaran
  const profitMargin = totalPendapatan > 0 ? ((totalKeuntungan / totalPendapatan) * 100).toFixed(1) : "0"

  // Calculate service revenue breakdown
  const serviceRevenue = completedUnits.reduce(
    (acc, unit) => {
      const serviceName =
        unit.service_type === "servis"
          ? "Servis Motor"
          : unit.service_type === "vapor"
            ? "Vapor Blasting"
            : unit.service_type === "sandblasting"
              ? "Sandblasting"
              : "Restorasi"
      acc[serviceName] = (acc[serviceName] || 0) + (unit.final_cost || unit.estimated_cost)
      return acc
    },
    {} as Record<string, number>,
  )

  const serviceRevenueData = Object.entries(serviceRevenue).map(([name, value]) => ({
    name,
    value,
    color: serviceColors[name] || "#6b7280",
  }))

  // Calculate expense breakdown based on total expenses
  const expenseBreakdown = expenseCategories.map((cat) => ({
    ...cat,
    amount: Math.round(totalPengeluaran * (cat.percentage / 100)),
  }))

  // Monthly data (simulated based on actual data)
  const monthlyData = monthOptions
    .slice(
      Math.min(Number.parseInt(startMonth), Number.parseInt(endMonth)),
      Math.max(Number.parseInt(startMonth), Number.parseInt(endMonth)) + 1,
    )
    .map((month, idx) => ({
      month: month.label.slice(0, 3),
      pendapatan: Math.round((totalPendapatan / 12) * (0.8 + Math.random() * 0.4)),
      pengeluaran: Math.round((totalPengeluaran / 12) * (0.8 + Math.random() * 0.4)),
      keuntungan: Math.round((totalKeuntungan / 12) * (0.8 + Math.random() * 0.4)),
    }))

  // Recent transactions for display
  const recentFinancialTx = [
    ...completedUnits.slice(0, 3).map((u) => ({
      id: u.id,
      description: `${u.service_type === "servis" ? "Servis" : u.service_type} ${u.brand} - ${u.owner_name}`,
      type: "income" as const,
      amount: u.final_cost || u.estimated_cost,
      date: u.check_out_date || u.check_in_date,
    })),
    ...transactions.slice(0, 2).map((t) => ({
      id: t.id,
      description: `Pembelian ${t.item_name}`,
      type: "expense" as const,
      amount: t.quantity * 10000,
      date: t.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const chartColors = {
    grid: isDark ? "#374151" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
    tooltip: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    tooltipText: isDark ? "#f3f4f6" : "#111827",
  }

  const handlePrint = () => {
    const startLabel = monthOptions[Number.parseInt(startMonth)].label
    const endLabel = monthOptions[Number.parseInt(endMonth)].label
    const periodLabel = startMonth === endMonth ? startLabel : `${startLabel} - ${endLabel}`

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Keuntungan - GTA Garage</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
          .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; min-width: 200px; }
          .stat-label { color: #666; font-size: 14px; }
          .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          .positive { color: #22c55e; }
          .negative { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #f5f5f5; }
          .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Laporan Keuntungan Bengkel</h1>
        <p>Periode: ${periodLabel} 2024</p>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        
        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Total Pendapatan</div>
            <div class="stat-value positive">${formatCurrency(totalPendapatan)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Pengeluaran</div>
            <div class="stat-value negative">${formatCurrency(totalPengeluaran)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Keuntungan Bersih</div>
            <div class="stat-value positive">${formatCurrency(totalKeuntungan)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Margin Keuntungan</div>
            <div class="stat-value">${profitMargin}%</div>
          </div>
        </div>

        <h2>Pendapatan per Layanan</h2>
        <table>
          <thead>
            <tr>
              <th>Layanan</th>
              <th>Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            ${serviceRevenueData
              .map(
                (s) => `
              <tr>
                <td>${s.name}</td>
                <td>${formatCurrency(s.value)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <h2>Rincian Pengeluaran</h2>
        <table>
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Persentase</th>
            </tr>
          </thead>
          <tbody>
            ${expenseBreakdown
              .map(
                (e) => `
              <tr>
                <td>${e.category}</td>
                <td>${formatCurrency(e.amount)}</td>
                <td>${e.percentage}%</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          <p>GTA Garage - Sistem Manajemen Bengkel Motor</p>
          <p>Dicetak pada: ${new Date().toLocaleString("id-ID")}</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-64 p-4 lg:p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <PageTransition>
        <main className="lg:ml-64 p-4 lg:p-6 transition-all duration-300" ref={printRef}>
        <DashboardHeader title="Keuntungan" subtitle="Analisis pendapatan dan keuntungan bengkel" />

        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Dari:</Label>
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">Sampai:</Label>
              <Select value={endMonth} onValueChange={setEndMonth}>
                <SelectTrigger className="w-32 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handlePrint} className="bg-primary text-primary-foreground">
            <Printer className="h-4 w-4 mr-2" />
            Cetak Laporan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard
            title="Total Pendapatan"
            value={formatCurrency(totalPendapatan)}
            icon={DollarSign}
            trend={{ value: 15, positive: true }}
            variant="success"
          />
          <StatCard
            title="Total Pengeluaran"
            value={formatCurrency(totalPengeluaran)}
            icon={Wallet}
            trend={{ value: 8, positive: false }}
            variant="destructive"
          />
          <StatCard
            title="Keuntungan Bersih"
            value={formatCurrency(totalKeuntungan)}
            icon={PiggyBank}
            trend={{ value: 22, positive: true }}
            variant="success"
          />
          <StatCard
            title="Margin Keuntungan"
            value={`${profitMargin}%`}
            icon={TrendingUp}
            subtitle="Dari total pendapatan"
            variant="default"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Profit Trend Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Tren Keuntungan Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorKeuntungan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="month" stroke={chartColors.text} fontSize={11} />
                    <YAxis stroke={chartColors.text} fontSize={11} tickFormatter={(value) => `${value / 1000000}jt`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltip,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: chartColors.tooltipText }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="keuntungan"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorKeuntungan)"
                      name="Keuntungan"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Pendapatan per Layanan</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        serviceRevenueData.length > 0
                          ? serviceRevenueData
                          : [{ name: "Belum ada data", value: 1, color: "#6b7280" }]
                      }
                      cx="50%"
                      cy="42%"
                      innerRadius="30%"
                      outerRadius="60%"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(serviceRevenueData.length > 0
                        ? serviceRevenueData
                        : [{ name: "Belum ada data", value: 1, color: "#6b7280" }]
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltip,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend
                      formatter={(value) => <span className="text-card-foreground text-xs">{value}</span>}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Expense Breakdown */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Rincian Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                {expenseBreakdown.map((expense) => (
                  <div key={expense.category} className="space-y-1.5 lg:space-y-2">
                    <div className="flex justify-between text-xs lg:text-sm">
                      <span className="text-card-foreground">{expense.category}</span>
                      <span className="text-muted-foreground">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="h-1.5 lg:h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Financial Transactions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Transaksi Keuangan Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                {recentFinancialTx.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Belum ada transaksi</p>
                ) : (
                  recentFinancialTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div
                          className={`p-1.5 lg:p-2 rounded-lg ${tx.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}
                        >
                          {tx.type === "income" ? (
                            <ArrowDownRight className="h-3 w-3 lg:h-4 lg:w-4 text-success" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-xs lg:text-sm text-card-foreground">{tx.description}</p>
                          <p className="text-[10px] lg:text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-medium text-xs lg:text-sm ${tx.type === "income" ? "text-success" : "text-destructive"}`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </main>
      </PageTransition>
    </div>
  )
}
