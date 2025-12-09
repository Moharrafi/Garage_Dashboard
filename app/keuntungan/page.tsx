"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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
import type { Unit, StockTransaction, Item } from "@/lib/types"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
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

const EMPLOYEE_SALARY_PER_PERSON = 2_000_000
const EMPLOYEE_COUNT = 4
const ELECTRICITY_TOP_UP_COST = 100_000
const ELECTRICITY_TOP_UPS = 3 // gunakan estimasi maksimal 3 kali pengisian per bulan
const OTHER_OPERATIONAL_EXPENSE = 1_440_000

export default function KeuntunganPage() {
  const [startMonth, setStartMonth] = useState("0")
  const [endMonth, setEndMonth] = useState("11")
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const printRef = useRef<HTMLDivElement>(null)

  const [units, setUnits] = useState<Unit[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const monthSelection = useMemo(() => {
    const startIndex = Math.min(Number.parseInt(startMonth), Number.parseInt(endMonth))
    const endIndex = Math.max(Number.parseInt(startMonth), Number.parseInt(endMonth))
    const months = monthOptions.slice(startIndex, endIndex + 1)
    const indexes = months.map((month) => Number.parseInt(month.value))
    return {
      months,
      monthSet: new Set(indexes),
      monthsCount: months.length || 1,
      startIndex,
      indexes,
    }
  }, [startMonth, endMonth])
  const { months: selectedMonths, monthSet: selectedMonthSet, monthsCount, startIndex } = monthSelection
  const currentYear = new Date().getFullYear()
  const isWithinMonthSet = (dateString: string | null | undefined, monthSet: Set<number>) => {
    if (!dateString || monthSet.size === 0) return false
    const parsed = new Date(dateString)
    if (Number.isNaN(parsed.getTime())) return false
    return parsed.getFullYear() === currentYear && monthSet.has(parsed.getMonth())
  }
  const isWithinSelectedMonths = (dateString?: string | null) => isWithinMonthSet(dateString, selectedMonthSet)

  const previousMonthIndexes = Array.from({ length: monthsCount }, (_, i) => startIndex - monthsCount + i).filter(
    (index) => index >= 0 && index <= 11,
  )
  const previousMonthSet = new Set(previousMonthIndexes)
  const previousMonthsCount = previousMonthSet.size
  const hasPreviousPeriod = previousMonthsCount > 0

  useEffect(() => {
    async function fetchData() {
      try {
        const [unitsData, transactionsData, itemsData] = await Promise.all([
          apiFetch<Unit[]>("/api/units"),
          apiFetch<StockTransaction[]>("/api/transactions"),
          apiFetch<Item[]>("/api/items"),
        ])

        setUnits(unitsData || [])
        setTransactions(transactionsData || [])
        setItems(itemsData || [])
      } catch (error) {
        console.error("Gagal memuat data keuntungan:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const itemPriceMap = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = item.price
      return acc
    }, {})
  }, [items])

  const checkoutUnits = units.filter(
    (u) =>
      (u.status === "selesai" || u.status === "check-out") &&
      isWithinSelectedMonths(u.check_out_date ?? u.check_in_date),
  )
  const unitsRevenue = checkoutUnits.reduce((sum, u) => sum + (u.final_cost ?? u.estimated_cost ?? 0), 0)

  const stockTransactionsIn = transactions.filter((t) => t.type === "masuk" && isWithinSelectedMonths(t.date))

  // Calculate expenses from stock transactions (purchases) within selected months
  const stockExpenses = stockTransactionsIn.reduce((sum, t) => {
    const price = t.item_id ? itemPriceMap[t.item_id] : undefined
    if (price === undefined) {
      return sum
    }
    return sum + price * t.quantity
  }, 0)

  const previousCheckoutUnits = hasPreviousPeriod
    ? units.filter(
        (u) =>
          (u.status === "selesai" || u.status === "check-out") &&
          isWithinMonthSet(u.check_out_date ?? u.check_in_date, previousMonthSet),
      )
    : []
  const previousUnitsRevenue = previousCheckoutUnits.reduce((sum, u) => sum + (u.final_cost ?? u.estimated_cost ?? 0), 0)

  const previousStockTransactionsIn = hasPreviousPeriod
    ? transactions.filter((t) => t.type === "masuk" && isWithinMonthSet(t.date, previousMonthSet))
    : []
  const previousStockExpenses = previousStockTransactionsIn.reduce((sum, t) => {
    const price = t.item_id ? itemPriceMap[t.item_id] : undefined
    if (price === undefined) {
      return sum
    }
    return sum + price * t.quantity
  }, 0)

  const totalPendapatan = unitsRevenue

  const payrollExpenses = EMPLOYEE_SALARY_PER_PERSON * EMPLOYEE_COUNT * monthsCount
  const electricityExpenses = ELECTRICITY_TOP_UP_COST * ELECTRICITY_TOP_UPS * monthsCount
  const otherOperationalExpenses = OTHER_OPERATIONAL_EXPENSE * monthsCount

  const previousPayrollExpenses = EMPLOYEE_SALARY_PER_PERSON * EMPLOYEE_COUNT * previousMonthsCount
  const previousElectricityExpenses = ELECTRICITY_TOP_UP_COST * ELECTRICITY_TOP_UPS * previousMonthsCount
  const previousOperationalExpenses = OTHER_OPERATIONAL_EXPENSE * previousMonthsCount

  const expenseDetails = [
    { category: "Pembelian Stok Barang", amount: stockExpenses },
    { category: "Gaji Karyawan", amount: payrollExpenses },
    { category: "Listrik & Air", amount: electricityExpenses },
    { category: "Operasional Lainnya", amount: otherOperationalExpenses },
  ]

  const totalPengeluaran = expenseDetails.reduce((sum, exp) => sum + exp.amount, 0)
  const totalKeuntungan = totalPendapatan - totalPengeluaran
  const profitMargin = totalPendapatan > 0 ? ((totalKeuntungan / totalPendapatan) * 100).toFixed(1) : "0"

  const previousTotalPengeluaran =
    previousStockExpenses + previousPayrollExpenses + previousElectricityExpenses + previousOperationalExpenses
  const previousKeuntungan = previousUnitsRevenue - previousTotalPengeluaran

  const calculatePercentageChange = (current: number, previous: number) => {
    if (!hasPreviousPeriod || previous === 0) return null
    return ((current - previous) / Math.abs(previous)) * 100
  }

  const revenueTrendValue = calculatePercentageChange(totalPendapatan, previousUnitsRevenue)
  const expenseTrendValue = calculatePercentageChange(totalPengeluaran, previousTotalPengeluaran)
  const profitTrendValue = calculatePercentageChange(totalKeuntungan, previousKeuntungan)

  const toTrendMetric = (value: number | null) => Number((value ?? 0).toFixed(1))
  const revenueTrendMetric = toTrendMetric(revenueTrendValue)
  const expenseTrendMetric = toTrendMetric(expenseTrendValue)
  const profitTrendMetric = toTrendMetric(profitTrendValue)
  const revenueTrendPositive = (revenueTrendValue ?? 0) >= 0
  const expenseTrendPositive = (expenseTrendValue ?? 0) <= 0
  const profitTrendPositive = (profitTrendValue ?? 0) >= 0

  // Calculate service revenue breakdown
  const serviceRevenue = checkoutUnits.reduce(
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
  const expenseBreakdown =
    totalPengeluaran > 0
      ? expenseDetails.map((expense) => ({
          ...expense,
          percentage: Math.round((expense.amount / totalPengeluaran) * 100),
        }))
      : expenseDetails.map((expense) => ({ ...expense, percentage: 0 }))

  // Monthly data (simulated based on actual data) dengan faktor deterministik agar stabil
  const monthlyData = selectedMonths.map((month) => {
    const monthIndex = Number.parseInt(month.value)
    const monthTransactionsSet = new Set([monthIndex])
    const monthUnits = checkoutUnits.filter((u) =>
      isWithinMonthSet(u.check_out_date ?? u.check_in_date, monthTransactionsSet),
    )
    const monthRevenue = monthUnits.reduce((sum, u) => sum + (u.final_cost ?? u.estimated_cost ?? 0), 0)

    const monthStockTransactions = stockTransactionsIn.filter((t) => isWithinMonthSet(t.date, monthTransactionsSet))
    const monthStockExpenses = monthStockTransactions.reduce((sum, t) => {
      const price = t.item_id ? itemPriceMap[t.item_id] : undefined
      if (price === undefined) {
        return sum
      }
      return sum + price * t.quantity
    }, 0)

    const monthPayroll = EMPLOYEE_SALARY_PER_PERSON * EMPLOYEE_COUNT
    const monthElectricity = ELECTRICITY_TOP_UP_COST * ELECTRICITY_TOP_UPS
    const monthOperational = OTHER_OPERATIONAL_EXPENSE

    const monthExpenses = monthStockExpenses + monthPayroll + monthElectricity + monthOperational
    const monthProfit = monthRevenue - monthExpenses

    return {
      month: month.label.slice(0, 3),
      pendapatan: monthRevenue,
      pengeluaran: monthExpenses,
      keuntungan: monthProfit,
      positiveProfit: monthProfit > 0 ? monthProfit : null,
      negativeProfit: monthProfit < 0 ? monthProfit : null,
    }
  })
  const animatedMonthlyData = isLoading ? [] : monthlyData

  const profitValues = monthlyData.map((data) => data.keuntungan)
  const minProfitValue = Math.min(0, ...profitValues)
  const maxProfitValue = Math.max(0, ...profitValues)
  const profitPadding = Math.max(Math.abs(minProfitValue), Math.abs(maxProfitValue)) * 0.15 || 1
  const profitYAxisDomain: [number, number] = [minProfitValue - profitPadding, maxProfitValue + profitPadding]
  const shouldAnimateChart = !isLoading && monthlyData.length > 0
  const animationConfig = shouldAnimateChart
    ? { isAnimationActive: true, animationBegin: 300, animationDuration: 1200, animationEasing: "ease" as const }
    : { isAnimationActive: false }

  const defaultProfitColor = monthlyData[0]?.keuntungan >= 0 ? "#22c55e" : "#ef4444"
  const profitColorStops =
    monthlyData.length > 1
      ? monthlyData.map((data, idx) => ({
          offset: idx / (monthlyData.length - 1),
          color: data.keuntungan >= 0 ? "#22c55e" : "#ef4444",
        }))
      : [
          {
            offset: 0,
            color: defaultProfitColor,
          },
          {
            offset: 1,
            color: defaultProfitColor,
          },
        ]

  // Recent transactions for display
  const recentFinancialTx = [
    ...checkoutUnits.map((u) => ({
      id: u.id,
      description: `${u.service_type === "servis" ? "Servis" : u.service_type} ${u.brand} - ${u.owner_name}`,
      type: "income" as const,
      amount: u.final_cost ?? u.estimated_cost ?? 0,
      date: u.check_out_date ?? u.check_in_date,
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

  const renderProfitTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: {
      value: number
      dataKey: string
    }[]
    label?: string
  }) => {
    if (!active || !payload || payload.length === 0) {
      return null
    }
    const profitEntry = payload.find((entry) => entry.dataKey === "keuntungan") ?? payload[0]
    const value = profitEntry?.value ?? 0
    const isPositive = value >= 0

    return (
      <div
        style={{
          backgroundColor: chartColors.tooltip,
          border: `1px solid ${chartColors.tooltipBorder}`,
          borderRadius: "8px",
          padding: "8px 12px",
        }}
      >
        <p style={{ color: chartColors.tooltipText, margin: 0 }}>{label}</p>
        <p style={{ color: isPositive ? "#22c55e" : "#ef4444", margin: "4px 0 0" }}>
          Keuntungan {isPositive ? "Positif" : "Negatif"} : {formatCurrency(value)}
        </p>
      </div>
    )
  }

  const renderProfitDot = (props: { cx?: number; cy?: number; value?: number }) => {
    const { cx, cy, value } = props
    if (cx === undefined || cy === undefined || value === undefined) return null
    const color = value >= 0 ? "#22c55e" : "#ef4444"
    return <circle cx={cx} cy={cy} r={3} fill={color} stroke="#ffffff" strokeWidth={2} />
  }

  const handlePrint = () => {
    const startLabel = monthOptions[Number.parseInt(startMonth)].label
    const endLabel = monthOptions[Number.parseInt(endMonth)].label
    const periodLabel = startMonth === endMonth ? startLabel : `${startLabel} - ${endLabel}`
    const netProfitClass = totalKeuntungan >= 0 ? "positive" : "negative"
    const marginClass = Number(profitMargin) >= 0 ? "positive" : "negative"

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
            <div class="stat-value ${netProfitClass}">${formatCurrency(totalKeuntungan)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Margin Keuntungan</div>
            <div class="stat-value ${marginClass}">${profitMargin}%</div>
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
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 transition-all duration-300" ref={printRef}>
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
            trend={{ value: revenueTrendMetric, positive: revenueTrendPositive }}
            variant="success"
            valueClassName={() => (totalPendapatan < 0 ? "text-destructive" : "text-success")}
          />
          <StatCard
            title="Total Pengeluaran"
            value={formatCurrency(totalPengeluaran)}
            icon={Wallet}
            trend={{ value: expenseTrendMetric, positive: expenseTrendPositive }}
            variant="destructive"
            valueClassName={() => (totalPengeluaran < 0 ? "text-destructive" : "text-success")}
          />
          <StatCard
            title="Keuntungan Bersih"
            value={formatCurrency(totalKeuntungan)}
            icon={PiggyBank}
            trend={{ value: profitTrendMetric, positive: profitTrendPositive }}
            subtitle={totalKeuntungan < 0 ? "Rugi bersih" : "Laba bersih"}
            valueClassName={() => (totalKeuntungan < 0 ? "text-destructive" : "text-success")}
          />
          <StatCard
            title="Margin Keuntungan"
            value={`${profitMargin}%`}
            icon={TrendingUp}
            subtitle="Dari total pendapatan"
            valueClassName={() => (Number(profitMargin) < 0 ? "text-destructive" : "text-success")}
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
                  <AreaChart
                    data={animatedMonthlyData}
                    margin={{
                      top: 10,
                      right: 16,
                      left: -10,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorProfitPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProfitNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profitLineGradient" x1="0" y1="0" x2="1" y2="0">
                        {profitColorStops.map((stop, idx) => (
                          <stop key={idx} offset={`${stop.offset * 100}%`} stopColor={stop.color} />
                        ))}
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis dataKey="month" stroke={chartColors.text} fontSize={11} />
                    <YAxis
                      domain={profitYAxisDomain}
                      stroke={chartColors.text}
                      fontSize={11}
                      tickFormatter={(value) => `${Math.round(value / 1000000)}jt`}
                    />
                    <Tooltip content={renderProfitTooltip} cursor={{ stroke: chartColors.text, strokeDasharray: "3 3" }} />
                    <ReferenceLine y={0} stroke={chartColors.text} strokeDasharray="4 4" />
                    <Area
                      type="monotone"
                      dataKey="negativeProfit"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfitNegative)"
                      {...animationConfig}
                      dot={{ stroke: "#ef4444", strokeWidth: 2, r: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positiveProfit"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfitPositive)"
                      {...animationConfig}
                      connectNulls
                      dot={{ stroke: "#22c55e", strokeWidth: 2, r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="keuntungan"
                      stroke="url(#profitLineGradient)"
                      strokeWidth={3}
                      dot={renderProfitDot}
                      activeDot={renderProfitDot}
                      {...animationConfig}
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
