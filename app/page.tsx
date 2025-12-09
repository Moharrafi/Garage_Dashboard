"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { PageTransition } from "@/components/page-transition"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Car, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/store"
import type { Item, Unit, StockTransaction } from "@/lib/types"
import { apiFetch } from "@/lib/api"
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
import { useTheme } from "next-themes"

const getMonthKey = (dateString?: string | null) => {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${date.getMonth()}`
}

const getPastMonths = (count: number) => {
  const now = new Date()
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("id-ID", { month: "short" }),
    }
  })
}

const serviceColors: Record<string, string> = {
  servis: "#22c55e",
  vapor: "#3b82f6",
  sandblasting: "#f59e0b",
  restorasi: "#8b5cf6",
}

export default function DashboardPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [items, setItems] = useState<Item[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
        setTransactions(transactionsData || [])
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const now = new Date()
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${previousMonthDate.getMonth()}`
  const lowStockItems = items.filter((item) => item.stock <= item.min_stock)
  const activeUnits = units.filter((unit) => unit.status !== "check-out")
  const completedUnits = units.filter((unit) => unit.status === "check-out" || unit.status === "selesai")
  const itemPriceMap = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = item.price
    return acc
  }, {})

  const totalRevenue = completedUnits.reduce((sum, unit) => {
    const monthKey = getMonthKey(unit.check_out_date || unit.check_in_date)
    if (monthKey !== currentMonthKey) {
      return sum
    }
    return sum + (unit.final_cost || unit.estimated_cost)
  }, 0)

  const previousRevenue = completedUnits.reduce((sum, unit) => {
    const monthKey = getMonthKey(unit.check_out_date || unit.check_in_date)
    if (monthKey !== previousMonthKey) {
      return sum
    }
    return sum + (unit.final_cost || unit.estimated_cost)
  }, 0)

  // Calculate service distribution from units
  const serviceDistribution = units.reduce(
    (acc, unit) => {
      acc[unit.service_type] = (acc[unit.service_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const totalServices = Object.values(serviceDistribution).reduce((a, b) => a + b, 0) || 1
  const serviceData = Object.entries(serviceDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value / totalServices) * 100),
    fill: serviceColors[name] || "#6b7280",
  }))

  const chartColors = {
    grid: isDark ? "#374151" : "#e5e7eb",
    text: isDark ? "#9ca3af" : "#6b7280",
    tooltip: isDark ? "#1f2937" : "#ffffff",
    tooltipBorder: isDark ? "#374151" : "#e5e7eb",
    tooltipText: isDark ? "#f3f4f6" : "#111827",
  }

  const currentMonthTransactions = transactions.filter(
    (tx) => getMonthKey(tx.date || tx.created_at) === currentMonthKey,
  )
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0)
  const netStockChangeCurrent = currentMonthTransactions.reduce((sum, tx) => {
    const change = tx.type === "masuk" ? tx.quantity : -tx.quantity
    return sum + change
  }, 0)
  const previousTotalStock = totalStock - netStockChangeCurrent

  const transactionChangeByItem = currentMonthTransactions.reduce<Record<string, number>>((acc, tx) => {
    if (!tx.item_id) return acc
    const change = tx.type === "masuk" ? tx.quantity : -tx.quantity
    acc[tx.item_id] = (acc[tx.item_id] || 0) + change
    return acc
  }, {})

  const previousLowStockCount = items.filter((item) => {
    const previousStock = item.stock - (transactionChangeByItem[item.id] || 0)
    return previousStock <= item.min_stock
  }).length

  const calculateTrend = (current: number, previous: number, invert = false) => {
    if (previous === 0) {
      if (current === 0) {
        return { value: 0, positive: true }
      }
      const value = 100
      const positive = invert ? current <= previous : current >= previous
      return { value, positive }
    }
    const percentChange = ((current - previous) / Math.abs(previous)) * 100
    return { value: Number(percentChange.toFixed(1)), positive: invert ? percentChange <= 0 : percentChange >= 0 }
  }

  const stockTrend = calculateTrend(totalStock, previousTotalStock)
  const revenueTrendData = calculateTrend(totalRevenue, previousRevenue)
  const lowStockTrend = calculateTrend(lowStockItems.length, previousLowStockCount, true)

  const getTransactionTime = (tx: StockTransaction) => {
    const dateString = tx.created_at || tx.date
    return dateString ? new Date(dateString).getTime() : 0
  }
  const sortedTransactions = [...transactions].sort((a, b) => getTransactionTime(b) - getTransactionTime(a))
  const recentTransactions = sortedTransactions.slice(0, 5)

  const months = getPastMonths(6)

  const revenueData = months.map(({ key, label }) => {
    const pendapatan = completedUnits.reduce((total, unit) => {
      const monthKey = getMonthKey(unit.check_out_date || unit.check_in_date)
      if (monthKey !== key) return total
      return total + (unit.final_cost || unit.estimated_cost)
    }, 0)

    const pengeluaran = transactions.reduce((total, tx) => {
      if (tx.type !== "masuk") return total
      const monthKey = getMonthKey(tx.date || tx.created_at)
      if (monthKey !== key) return total
      const price = tx.item_id ? itemPriceMap[tx.item_id] ?? 0 : 0
      return total + price * tx.quantity
    }, 0)

    return { month: label, pendapatan, pengeluaran }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <PageTransition>
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 transition-all duration-300">
        <DashboardHeader title="Dashboard" subtitle="Selamat datang kembali! Berikut ringkasan bengkel hari ini." />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
          <StatCard
            title="Total Stok Barang"
            value={totalStock}
            subtitle={`${items.length} jenis barang`}
            icon={Package}
            trend={stockTrend}
            valueClassName="text-success"
          />
          <StatCard
            title="Unit Dalam Proses"
            value={activeUnits.length}
            subtitle="Menunggu selesai"
            icon={Car}
            variant="success"
            valueClassName="text-success"
          />
          <StatCard
            title="Pendapatan Bulan Ini"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            trend={revenueTrendData}
            variant="success"
            valueClassName={() => (totalRevenue >= 0 ? "text-success" : "text-destructive")}
          />
          <StatCard
            title="Stok Menipis"
            value={lowStockItems.length}
            subtitle="Perlu restok segera"
            icon={AlertTriangle}
            variant="warning"
            trend={lowStockTrend}
            valueClassName="text-warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Pendapatan & Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56 lg:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
                      dataKey="pendapatan"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorPendapatan)"
                      name="Pendapatan"
                    />
                    <Area
                      type="monotone"
                      dataKey="pengeluaran"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorPengeluaran)"
                      name="Pengeluaran"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Distribusi Layanan</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64 sm:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={
                        serviceData.length > 0 ? serviceData : [{ name: "Belum ada data", value: 100, fill: "#6b7280" }]
                      }
                      cx="50%"
                      cy="42%"
                      innerRadius="35%"
                      outerRadius="65%"
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelLine={false}
                    >
                      {(serviceData.length > 0
                        ? serviceData
                        : [{ name: "Belum ada data", value: 100, fill: "#6b7280" }]
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltip,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Persentase"]}
                    />
                    <Legend
                      iconSize={10}
                      layout="horizontal"
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                      formatter={(value) => <span className="text-card-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Transactions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Transaksi Stok Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Belum ada transaksi</p>
                ) : (
                  recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div
                          className={`p-1.5 lg:p-2 rounded-lg ${tx.type === "masuk" ? "bg-success/10" : "bg-destructive/10"}`}
                        >
                          {tx.type === "masuk" ? (
                            <ArrowDownRight className="h-3 w-3 lg:h-4 lg:w-4 text-success" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-xs lg:text-sm text-card-foreground">{tx.item_name}</p>
                          <p className="text-[10px] lg:text-xs text-muted-foreground truncate max-w-[120px] lg:max-w-none">
                            {tx.note}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium text-xs lg:text-sm ${tx.type === "masuk" ? "text-success" : "text-destructive"}`}
                        >
                          {tx.type === "masuk" ? "+" : "-"}
                          {tx.quantity}
                        </p>
                        <p className="text-[10px] lg:text-xs text-muted-foreground">
                          {formatDate(tx.created_at || tx.date || new Date().toISOString())}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Units */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 lg:pb-4">
              <CardTitle className="text-card-foreground text-base lg:text-lg">Unit Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 lg:space-y-4">
                {activeUnits.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">Belum ada unit aktif</p>
                ) : (
                  activeUnits.slice(0, 5).map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="p-1.5 lg:p-2 rounded-lg bg-primary/10">
                          <Car className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-xs lg:text-sm text-card-foreground">{unit.brand}</p>
                          <p className="text-[10px] lg:text-xs text-muted-foreground">
                            {unit.vehicle_type} - {unit.owner_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            unit.status === "check-in" ? "secondary" : unit.status === "proses" ? "default" : "outline"
                          }
                          className={`text-[10px] lg:text-xs ${
                            unit.status === "proses"
                              ? "bg-primary text-primary-foreground"
                              : unit.status === "selesai"
                                ? "bg-success/20 text-success border-success/30"
                                : ""
                          }`}
                        >
                          {unit.status === "check-in" ? "Check-in" : unit.status === "proses" ? "Proses" : "Selesai"}
                        </Badge>
                        <p className="text-[10px] lg:text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                          <Clock className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                          {formatDate(unit.check_in_date)}
                        </p>
                      </div>
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
