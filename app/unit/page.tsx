"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Wrench,
  Wind,
  Sparkles,
  Settings,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react"
import { type Unit, formatCurrency, formatDate } from "@/lib/types"
import { useToast } from "@/components/toast-notification"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"

const statusConfig = {
  "check-in": {
    label: "Check-in",
    color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    icon: Clock,
  },
  proses: {
    label: "Proses",
    color:
      "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    icon: Wrench,
  },
  selesai: {
    label: "Selesai",
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: CheckCircle,
  },
  "check-out": {
    label: "Check-out",
    color:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/30",
    icon: LogOut,
  },
}

const darkButtonBorderClass = "dark:border-white/50 dark:hover:border-white/70"

const serviceConfig = {
  servis: {
    label: "Servis Motor",
    color:
      "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    icon: Wrench,
  },
  vapor: {
    label: "Vapor Blasting",
    color:
      "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    icon: Wind,
  },
  sandblasting: {
    label: "Sandblasting",
    color:
      "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
    icon: Sparkles,
  },
  restorasi: {
    label: "Restorasi",
    color:
      "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    icon: Settings,
  },
}

type ServiceType = keyof typeof serviceConfig
type StatusType = keyof typeof statusConfig

export default function UnitPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("q") ?? ""
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [newStatus, setNewStatus] = useState<StatusType>("proses")
  const [finalCost, setFinalCost] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    vehicleCategory: "matic",
    brand: "",
    ownerName: "",
    phone: "",
    serviceType: "servis" as ServiceType,
    problem: "",
    estimatedCost: "",
    checkInDate: new Date().toISOString().split("T")[0],
  })

  const fetchUnits = useCallback(async () => {
    try {
      const data = await apiFetch<Unit[]>("/api/units")
      setUnits(data || [])
    } catch (error) {
      console.error("Error fetching units:", error)
      showToast("Gagal memuat data unit", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  useEffect(() => {
    setSearchTerm(initialSearch)
  }, [initialSearch])

  const resetForm = () => {
    setFormData({
      vehicleCategory: "matic",
      brand: "",
      ownerName: "",
      phone: "",
      serviceType: "servis",
      problem: "",
      estimatedCost: "",
      checkInDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleAddUnit = async () => {
    if (!formData.brand || !formData.ownerName || !formData.phone) {
      showToast("Lengkapi semua field yang diperlukan", "error")
      return
    }

    setSaving(true)
    try {
      const data = await apiFetch<Unit>("/api/units", {
        method: "POST",
        body: JSON.stringify({
          vehicle_type: formData.vehicleCategory,
          brand: formData.brand,
          owner_name: formData.ownerName,
          phone: formData.phone,
          service_type: formData.serviceType,
          check_in_date: formData.checkInDate,
          estimated_cost: Number(formData.estimatedCost) || 0,
          notes: formData.problem,
        }),
      })

      setUnits([data, ...units])
      resetForm()
      setIsAddOpen(false)
      showToast("Unit berhasil ditambahkan", "success")
    } catch (error) {
      console.error("Error adding unit:", error)
      showToast("Gagal menambahkan unit", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleEditUnit = async () => {
    if (!selectedUnit) return

    setSaving(true)
    try {
      const updated = await apiFetch<Unit>(`/api/units/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify({
          vehicle_type: formData.vehicleCategory,
          brand: formData.brand,
          owner_name: formData.ownerName,
          phone: formData.phone,
          service_type: formData.serviceType,
          estimated_cost: Number(formData.estimatedCost) || 0,
          notes: formData.problem,
        }),
      })

      setUnits(units.map((unit) => (unit.id === selectedUnit.id ? updated : unit)))
      setIsEditOpen(false)
      setSelectedUnit(null)
      showToast("Unit berhasil diperbarui", "success")
    } catch (error) {
      console.error("Error updating unit:", error)
      showToast("Gagal memperbarui unit", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return

    setSaving(true)
    try {
      await apiFetch(`/api/units/${selectedUnit.id}`, { method: "DELETE" })

      setUnits(units.filter((unit) => unit.id !== selectedUnit.id))
      setIsDeleteOpen(false)
      setSelectedUnit(null)
      showToast("Unit berhasil dihapus", "success")
    } catch (error) {
      console.error("Error deleting unit:", error)
      showToast("Gagal menghapus unit", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedUnit) return

    setSaving(true)
    try {
      const updates: Record<string, unknown> = { status: newStatus }
      if (newStatus === "selesai" && finalCost) {
        updates.final_cost = Number(finalCost)
      }
      if (newStatus === "check-out") {
        updates.check_out_date = new Date().toISOString().split("T")[0]
      }

      if (newStatus === "check-out") {
        updates.check_out_date = new Date().toISOString().split("T")[0]
      }

      const updated = await apiFetch<Unit>(`/api/units/${selectedUnit.id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      })

      setUnits(units.map((unit) => (unit.id === selectedUnit.id ? updated : unit)))
      setIsUpdateStatusOpen(false)
      setSelectedUnit(null)
      setFinalCost("")
      showToast(`Status unit berhasil diubah ke ${statusConfig[newStatus].label}`, "success")
    } catch (error) {
      console.error("Error updating status:", error)
      showToast("Gagal mengubah status unit", "error")
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setFormData({
      vehicleCategory: unit.vehicle_type,
      brand: unit.brand,
      ownerName: unit.owner_name,
      phone: unit.phone,
      serviceType: unit.service_type,
      problem: unit.notes || "",
      estimatedCost: unit.estimated_cost.toString(),
      checkInDate: unit.check_in_date,
    })
    setIsEditOpen(true)
  }

  const openViewDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsViewOpen(true)
  }

  const openDeleteDialog = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsDeleteOpen(true)
  }

  const openUpdateStatusDialog = (unit: Unit) => {
    if (unit.status === "check-out") {
      showToast("Unit sudah check-out, tidak dapat diupdate lagi", "warning")
      return
    }
    setSelectedUnit(unit)
    setNewStatus(unit.status === "check-in" ? "proses" : unit.status === "proses" ? "selesai" : "check-out")
    setIsUpdateStatusOpen(true)
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const isSearchActive = normalizedSearch.length > 0

  const filteredUnits = units.filter((unit) => {
    const matchesSearch =
      !isSearchActive ||
      unit.brand.toLowerCase().includes(normalizedSearch) ||
      unit.owner_name.toLowerCase().includes(normalizedSearch) ||
      unit.vehicle_type.toLowerCase().includes(normalizedSearch)

    let statusMatches = true
    if (!isSearchActive) {
      if (statusFilter === "active") {
        statusMatches = unit.status === "check-in" || unit.status === "proses"
      } else if (statusFilter === "all") {
        statusMatches = true
      } else {
        statusMatches = unit.status === statusFilter
      }
    }

    return matchesSearch && statusMatches
  })

  const statusCounts = {
    "check-in": units.filter((u) => u.status === "check-in").length,
    proses: units.filter((u) => u.status === "proses").length,
    selesai: units.filter((u) => u.status === "selesai").length,
    "check-out": units.filter((u) => u.status === "check-out").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-[var(--sidebar-width,16rem)] p-4 lg:p-6 transition-all duration-300">
          <DashboardHeader title="Check-in & Check-out Unit" subtitle="Kelola unit kendaraan yang masuk untuk servis" />
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
        <DashboardHeader title="Check-in & Check-out Unit" subtitle="Kelola unit kendaraan yang masuk untuk servis" />

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <Card className="bg-card border-l-4 border-l-blue-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-500/20">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Check-in</p>
                  <p className="text-lg lg:text-2xl font-bold text-card-foreground">{statusCounts["check-in"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-l-4 border-l-amber-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/20">
                  <Wrench className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Dalam Proses</p>
                  <p className="text-lg lg:text-2xl font-bold text-card-foreground">{statusCounts.proses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-l-4 border-l-emerald-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Selesai</p>
                  <p className="text-lg lg:text-2xl font-bold text-card-foreground">{statusCounts.selesai}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-l-4 border-l-slate-500">
            <CardContent className="p-3 lg:p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-500/20">
                  <LogOut className="h-4 w-4 lg:h-5 lg:w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Check-out</p>
                  <p className="text-lg lg:text-2xl font-bold text-card-foreground">{statusCounts["check-out"]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unit List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-card-foreground whitespace-nowrap">Daftar Unit</CardTitle>
              <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-center lg:gap-4 lg:justify-end">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari unit..."
                      className="pl-9 w-full bg-secondary border-border"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-secondary border-border w-full sm:w-48">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Unit Aktif</SelectItem>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="check-in">Check-in</SelectItem>
                      <SelectItem value="proses">Proses</SelectItem>
                      <SelectItem value="selesai">Selesai</SelectItem>
                      <SelectItem value="check-out">Check-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto lg:justify-between lg:items-center">
                  <div className="flex border border-border rounded-full overflow-hidden w-full sm:w-auto justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${darkButtonBorderClass} rounded-none h-9 flex-1 ${viewMode === "table" ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => setViewMode("table")}
                      aria-label="Tampilan tabel"
                    >
                      <List className="h-4 w-4 mx-auto" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`${darkButtonBorderClass} rounded-none h-9 flex-1 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() => setViewMode("grid")}
                      aria-label="Tampilan grid"
                    >
                      <LayoutGrid className="h-4 w-4 mx-auto" />
                    </Button>
                  </div>
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button className={`${darkButtonBorderClass} bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Check-in Unit Baru
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-card-foreground">Check-in Unit Baru</DialogTitle>
                        <DialogDescription>Daftarkan kendaraan baru untuk servis.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Jenis Kendaraan</Label>
                            <Select
                              value={formData.vehicleCategory}
                              onValueChange={(value) => setFormData({ ...formData, vehicleCategory: value })}
                            >
                              <SelectTrigger className="bg-background border-2 border-border/60 focus:border-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="matic">Matic</SelectItem>
                                <SelectItem value="sport">Sport</SelectItem>
                                <SelectItem value="bebek">Bebek</SelectItem>
                                <SelectItem value="trail">Trail</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Merek & Tipe</Label>
                            <Input
                              placeholder="Honda Beat, dll"
                              value={formData.brand}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                              className="bg-background border-2 border-border/60 focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Nama Pemilik</Label>
                            <Input
                              value={formData.ownerName}
                              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                              className="bg-background border-2 border-border/60 focus:border-primary"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">No. Telepon</Label>
                            <Input
                              placeholder="08xxxxxxxxxx"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="bg-background border-2 border-border/60 focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm font-medium">Jenis Layanan</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.keys(serviceConfig) as ServiceType[]).map((type) => {
                              const service = serviceConfig[type]
                              const Icon = service.icon
                              const isSelected = formData.serviceType === type
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, serviceType: type })}
                                  className={`
                                    flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                                    transition-all duration-200 border-2
                                    ${
                                      isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                    }
                                  `}
                                >
                                  <Icon className="h-4 w-4" />
                                  {service.label.split(" ")[0]}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Tanggal Check-in</Label>
                            <Input
                              type="date"
                              value={formData.checkInDate}
                              onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                              className="bg-background border-2 border-border/60 focus:border-primary"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-sm font-medium">Estimasi Biaya</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={formData.estimatedCost}
                              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                              className="bg-background border-2 border-border/60 focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-sm font-medium">Catatan</Label>
                          <Textarea
                            placeholder="Detail pekerjaan yang akan dilakukan..."
                            value={formData.problem}
                            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                            className="bg-background border-2 border-border/60 focus:border-primary min-h-[80px]"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          className={darkButtonBorderClass}
                          onClick={() => {
                            resetForm()
                            setIsAddOpen(false)
                          }}
                          disabled={saving}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleAddUnit}
                          className={`${darkButtonBorderClass} bg-primary text-primary-foreground`}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Check-in
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div className="overflow-x-auto">
                <div className="min-w-[960px] rounded-xl border border-border/80 overflow-hidden bg-card">
                  <Table className="w-full min-w-[1050px] table-auto border-collapse">
                    <TableHeader>
                      <TableRow className="bg-muted/60 border-b border-border/40 [&>th]:px-4 [&>th]:py-3 [&>th]:text-muted-foreground [&>th]:text-left md:[&>th]:text-center">
                        <TableHead>Kendaraan</TableHead>
                        <TableHead>Pemilik</TableHead>
                        <TableHead>Layanan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Biaya</TableHead>
                        <TableHead className="w-[220px]">Catatan</TableHead>
                        <TableHead className="w-[150px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUnits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            {searchTerm || statusFilter !== "active"
                              ? "Tidak ada unit yang sesuai filter"
                              : "Belum ada data unit"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUnits.map((unit) => {
                          const service = serviceConfig[unit.service_type]
                          const status = statusConfig[unit.status]
                          const ServiceIcon = service.icon
                          const StatusIcon = status.icon
                          const normalizedStatus = unit.status.trim().toLowerCase()
                          const canEdit = normalizedStatus === "check-in" || normalizedStatus === "proses"
                          const canUpdateStatus = normalizedStatus !== "check-out"

                          return (
                            <TableRow
                              key={unit.id}
                              className="border-b border-border/50 last:border-b-0 [&>td]:px-4 md:[&>td]:px-5 [&>td]:py-5 [&>td]:text-left md:[&>td]:text-center"
                            >
                              <TableCell className="text-left">
                                <div>
                                  <p className="font-medium text-card-foreground">{unit.brand}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{unit.vehicle_type}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-left">
                                <div>
                                  <p className="font-medium text-card-foreground">{unit.owner_name}</p>
                                  <p className="text-xs text-muted-foreground">{unit.phone}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`${service.color} gap-1`}>
                                  <ServiceIcon className="h-3 w-3" />
                                  {service.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`${status.color} gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{formatDate(unit.check_in_date)}</TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className={
                                    unit.final_cost
                                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                                      : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30"
                                  }
                                >
                                  {formatCurrency(unit.final_cost || unit.estimated_cost)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-card-foreground text-wrap break-words w-[220px]">
                                {unit.notes || "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-start md:justify-center gap-1 items-center">
                                  <Button variant="ghost" size="icon" className={darkButtonBorderClass} onClick={() => openViewDialog(unit)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {canEdit && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={darkButtonBorderClass}
                                        onClick={() => openEditDialog(unit)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`${darkButtonBorderClass} text-destructive hover:text-destructive`}
                                        onClick={() => openDeleteDialog(unit)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {canUpdateStatus && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`${darkButtonBorderClass} ml-2`}
                                      onClick={() => openUpdateStatusDialog(unit)}
                                    >
                                      Update
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUnits.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    {searchTerm || statusFilter !== "active"
                      ? "Tidak ada unit yang sesuai filter"
                      : "Belum ada data unit"}
                  </div>
                ) : (
                  filteredUnits.map((unit) => {
                    const service = serviceConfig[unit.service_type]
                    const status = statusConfig[unit.status]
                    const ServiceIcon = service.icon
                    const StatusIcon = status.icon
                    const normalizedStatus = unit.status.trim().toLowerCase()
                    const canDelete = normalizedStatus === "check-in" || normalizedStatus === "proses"
                    const canUpdateStatus = normalizedStatus !== "check-out"

                    return (
                      <Card key={unit.id} className="bg-secondary/30 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={`${status.color} gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                            <Badge className={`${service.color} gap-1`}>
                              <ServiceIcon className="h-3 w-3" />
                              {service.label.split(" ")[0]}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-card-foreground">{unit.brand}</h3>
                          <p className="text-xs text-muted-foreground capitalize mb-2">{unit.vehicle_type}</p>
                          <div className="text-sm mb-3">
                            <p className="text-card-foreground">{unit.owner_name}</p>
                            <p className="text-xs text-muted-foreground">{unit.phone}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm mb-3">
                            <span className="text-muted-foreground">{formatDate(unit.check_in_date)}</span>
                            <Badge
                              className={
                                unit.final_cost
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400"
                              }
                            >
                              {formatCurrency(unit.final_cost || unit.estimated_cost)}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`${darkButtonBorderClass} flex-1 bg-transparent`}
                              onClick={() => openViewDialog(unit)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Lihat
                            </Button>
                            {canUpdateStatus && (
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${darkButtonBorderClass} bg-transparent`}
                                onClick={() => openUpdateStatusDialog(unit)}
                              >
                                Update
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`${darkButtonBorderClass} text-destructive hover:text-destructive flex items-center justify-center`}
                                onClick={() => openDeleteDialog(unit)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Edit Unit</DialogTitle>
              <DialogDescription>Ubah informasi unit kendaraan.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Jenis Kendaraan</Label>
                  <Select
                    value={formData.vehicleCategory}
                    onValueChange={(value) => setFormData({ ...formData, vehicleCategory: value })}
                  >
                    <SelectTrigger className="bg-background border-2 border-border/60 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matic">Matic</SelectItem>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="bebek">Bebek</SelectItem>
                      <SelectItem value="trail">Trail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Merek & Tipe</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-background border-2 border-border/60 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Nama Pemilik</Label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="bg-background border-2 border-border/60 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">No. Telepon</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-background border-2 border-border/60 focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Jenis Layanan</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(serviceConfig) as ServiceType[]).map((type) => {
                    const service = serviceConfig[type]
                    const Icon = service.icon
                    const isSelected = formData.serviceType === type
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                        className={`
                          flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                          transition-all duration-200 border-2
                          ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        {service.label.split(" ")[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Estimasi Biaya</Label>
                <Input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="bg-background border-2 border-border/60 focus:border-primary"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Catatan</Label>
                <Textarea
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  className="bg-background border-2 border-border/60 focus:border-primary min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className={darkButtonBorderClass} onClick={() => setIsEditOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleEditUnit} className={`${darkButtonBorderClass} bg-primary text-primary-foreground`} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Detail Unit</DialogTitle>
            </DialogHeader>
            {selectedUnit && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Kendaraan</Label>
                    <p className="font-medium text-card-foreground">{selectedUnit.brand}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedUnit.vehicle_type}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Pemilik</Label>
                    <p className="font-medium text-card-foreground">{selectedUnit.owner_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUnit.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Layanan</Label>
                    <Badge className={`${serviceConfig[selectedUnit.service_type].color} gap-1 mt-1`}>
                      {serviceConfig[selectedUnit.service_type].label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge className={`${statusConfig[selectedUnit.status].color} gap-1 mt-1`}>
                      {statusConfig[selectedUnit.status].label}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Tanggal Check-in</Label>
                    <p className="font-medium text-card-foreground">{formatDate(selectedUnit.check_in_date)}</p>
                  </div>
                  {selectedUnit.check_out_date && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Tanggal Check-out</Label>
                      <p className="font-medium text-card-foreground">{formatDate(selectedUnit.check_out_date)}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Estimasi Biaya</Label>
                    <p className="font-medium text-card-foreground">{formatCurrency(selectedUnit.estimated_cost)}</p>
                  </div>
                  {selectedUnit.final_cost && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Biaya Final</Label>
                      <p className="font-medium text-success">{formatCurrency(selectedUnit.final_cost)}</p>
                    </div>
                  )}
                </div>
                {selectedUnit.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Catatan</Label>
                    <p className="text-sm text-card-foreground bg-secondary/50 p-2 rounded mt-1">
                      {selectedUnit.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" className={darkButtonBorderClass} onClick={() => setIsViewOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-card-foreground">Hapus Unit</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus unit <strong>{selectedUnit?.brand}</strong> milik{" "}
                <strong>{selectedUnit?.owner_name}</strong>? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUnit}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Update Status Dialog */}
        <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Update Status Unit</DialogTitle>
              <DialogDescription>Ubah status unit {selectedUnit?.brand}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Status Baru</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as StatusType)}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="check-in">Check-in</SelectItem>
                    <SelectItem value="proses">Proses</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                    <SelectItem value="check-out">Check-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newStatus === "selesai" && (
                <div className="grid gap-2">
                  <Label>Biaya Final (Rp)</Label>
                  <Input
                    type="number"
                    placeholder={selectedUnit?.estimated_cost.toString()}
                    value={finalCost}
                    onChange={(e) => setFinalCost(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" className={darkButtonBorderClass} onClick={() => setIsUpdateStatusOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleUpdateStatus} className={`${darkButtonBorderClass} bg-primary text-primary-foreground`} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </PageTransition>
    </div>
  )
}
