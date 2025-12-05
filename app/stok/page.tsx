"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, AlertTriangle, LayoutGrid, List, Package, Loader2 } from "lucide-react"
import { formatCurrency, type Item } from "@/lib/types"
import { useToast } from "@/components/toast-notification"
import { apiFetch } from "@/lib/api"
import { PageTransition } from "@/components/page-transition"

const categories = ["Semua", "Oli", "Sparepart", "Ban", "Aki", "Cairan", "Bubuk", "Lainnya"]

export default function StokPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Semua")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editItem, setEditItem] = useState<Item | null>(null)
  const [deleteItem, setDeleteItem] = useState<Item | null>(null)
  const [customCategory, setCustomCategory] = useState("")
  const [editCustomCategory, setEditCustomCategory] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Sparepart",
    stock: 0,
    min_stock: 5,
    price: 0,
    unit: "Pcs",
  })

  const normalizeNumericString = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "")
    const withoutLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "")
    return withoutLeadingZeros === "" ? "0" : withoutLeadingZeros
  }

  const fetchItems = useCallback(async () => {
    try {
      const data = await apiFetch<Item[]>("/api/items")
      setItems(data || [])
    } catch (error) {
      console.error("Error fetching items:", error)
      showToast("Gagal memuat data barang", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Semua" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category || (newItem.category === "Lainnya" && !customCategory)) {
      showToast("Lengkapi semua field yang diperlukan", "error")
      return
    }

    setSaving(true)
    try {
      const finalCategory = newItem.category === "Lainnya" ? customCategory : newItem.category
      const data = await apiFetch<Item>("/api/items", {
        method: "POST",
        body: JSON.stringify({
          name: newItem.name,
          category: finalCategory,
          stock: newItem.stock,
          min_stock: newItem.min_stock,
          price: newItem.price,
          unit: newItem.unit,
        }),
      })

      setItems([data, ...items])
      setNewItem({ name: "", category: "Sparepart", stock: 0, min_stock: 5, price: 0, unit: "Pcs" })
      setCustomCategory("")
      setIsAddOpen(false)
      showToast("Barang berhasil ditambahkan", "success")
    } catch (error) {
      console.error("Error adding item:", error)
      showToast("Gagal menambahkan barang", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateItem = async () => {
    if (!editItem) return

    setSaving(true)
    try {
      const finalCategory = editItem.category === "Lainnya" ? editCustomCategory : editItem.category
      const updated = await apiFetch<Item>(`/api/items/${editItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editItem.name,
          category: finalCategory,
          stock: editItem.stock,
          min_stock: editItem.min_stock,
          price: editItem.price,
          unit: editItem.unit,
        }),
      })

      setItems(items.map((item) => (item.id === editItem.id ? updated : item)))
      setEditItem(null)
      setEditCustomCategory("")
      setIsEditOpen(false)
      showToast("Barang berhasil diperbarui", "success")
    } catch (error) {
      console.error("Error updating item:", error)
      showToast("Gagal memperbarui barang", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteItem) return

    setSaving(true)
    try {
      await apiFetch(`/api/items/${deleteItem.id}`, { method: "DELETE" })

      setItems(items.filter((item) => item.id !== deleteItem.id))
      setDeleteItem(null)
      setIsDeleteOpen(false)
      showToast("Barang berhasil dihapus", "success")
    } catch (error) {
      console.error("Error deleting item:", error)
      showToast("Gagal menghapus barang", "error")
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (item: Item) => {
    const isCustomCategory = !categories.slice(1).includes(item.category)
    if (isCustomCategory) {
      setEditItem({ ...item, category: "Lainnya" })
      setEditCustomCategory(item.category)
    } else {
      setEditItem({ ...item })
      setEditCustomCategory("")
    }
    setIsEditOpen(true)
  }

  const openDeleteConfirm = (item: Item) => {
    setDeleteItem(item)
    setIsDeleteOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:ml-64 p-4 lg:p-6 transition-all duration-300">
          <DashboardHeader title="Manajemen Stok Barang" subtitle="Kelola inventaris barang bengkel Anda" />
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
        <main className="lg:ml-64 p-4 lg:p-6 transition-all duration-300">
        <DashboardHeader title="Manajemen Stok Barang" subtitle="Kelola inventaris barang bengkel Anda" />

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-card-foreground">Daftar Barang</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari barang..."
                    className="pl-9 w-full sm:w-64 bg-secondary border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "Lainnya")
                      .map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-none h-9 w-9 ${viewMode === "table" ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-none h-9 w-9 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Barang
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-card-foreground">Tambah Barang Baru</DialogTitle>
                      <DialogDescription>
                        Masukkan detail barang baru untuk ditambahkan ke inventaris.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nama Barang</Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">Kategori</Label>
                          <Select
                            value={newItem.category}
                            onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          >
                            <SelectTrigger className="bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories
                                .filter((c) => c !== "Semua")
                                .map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="unit">Satuan</Label>
                          <Input
                            id="unit"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>
                      {newItem.category === "Lainnya" && (
                        <div className="grid gap-2">
                          <Label htmlFor="customCategory">Nama Kategori Baru</Label>
                          <Input
                            id="customCategory"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Masukkan nama kategori..."
                            className="bg-secondary border-border"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="stock">Stok Awal</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newItem.stock}
                            onChange={(e) => {
                              const normalized = normalizeNumericString(e.target.value)
                              e.target.value = normalized
                              setNewItem({ ...newItem, stock: Number(normalized) })
                            }}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="min_stock">Min. Stok</Label>
                          <Input
                            id="min_stock"
                            type="number"
                            value={newItem.min_stock}
                            onChange={(e) => {
                              const normalized = normalizeNumericString(e.target.value)
                              e.target.value = normalized
                              setNewItem({ ...newItem, min_stock: Number(normalized) })
                            }}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="price">Harga (Rp)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newItem.price}
                            onChange={(e) => {
                              const normalized = normalizeNumericString(e.target.value)
                              e.target.value = normalized
                              setNewItem({ ...newItem, price: Number(normalized) })
                            }}
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saving}>
                        Batal
                      </Button>
                      <Button onClick={handleAddItem} className="bg-primary text-primary-foreground" disabled={saving}>
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
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Nama Barang</TableHead>
                      <TableHead className="text-muted-foreground">Kategori</TableHead>
                      <TableHead className="text-muted-foreground text-right">Stok</TableHead>
                      <TableHead className="text-muted-foreground text-right">Min. Stok</TableHead>
                      <TableHead className="text-muted-foreground text-right">Harga</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {searchTerm || selectedCategory !== "Semua"
                            ? "Tidak ada barang yang sesuai filter"
                            : "Belum ada data barang"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id} className="border-border">
                          <TableCell className="font-medium text-card-foreground">{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-card-foreground">
                            {item.stock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{item.min_stock}</TableCell>
                          <TableCell className="text-right text-card-foreground">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell>
                            {item.stock <= item.min_stock ? (
                              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Stok Menipis
                              </Badge>
                            ) : (
                              <Badge className="bg-success/20 text-success border-success/30">Tersedia</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openDeleteConfirm(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    {searchTerm || selectedCategory !== "Semua"
                      ? "Tidak ada barang yang sesuai filter"
                      : "Belum ada data barang"}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <Card key={item.id} className="bg-secondary/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          {item.stock <= item.min_stock ? (
                            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Menipis
                            </Badge>
                          ) : (
                            <Badge className="bg-success/20 text-success border-success/30 text-xs">Tersedia</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-card-foreground mb-1">{item.name}</h3>
                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs mb-3">
                          {item.category}
                        </Badge>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground text-xs">Stok</p>
                            <p className="font-medium text-card-foreground">
                              {item.stock} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Harga</p>
                            <p className="font-medium text-card-foreground">{formatCurrency(item.price)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => openEditModal(item)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive bg-transparent"
                            onClick={() => openDeleteConfirm(item)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Edit Barang</DialogTitle>
              <DialogDescription>Ubah informasi barang.</DialogDescription>
            </DialogHeader>
            {editItem && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nama Barang</Label>
                  <Input
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Kategori</Label>
                    <Select
                      value={editItem.category}
                      onValueChange={(value) => setEditItem({ ...editItem, category: value })}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c !== "Semua")
                          .map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Satuan</Label>
                    <Input
                      value={editItem.unit}
                      onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                {editItem.category === "Lainnya" && (
                  <div className="grid gap-2">
                    <Label>Nama Kategori</Label>
                    <Input
                      value={editCustomCategory}
                      onChange={(e) => setEditCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori..."
                      className="bg-secondary border-border"
                    />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Stok</Label>
                    <Input
                      type="number"
                      value={editItem.stock}
                      onChange={(e) => {
                        const normalized = normalizeNumericString(e.target.value)
                        e.target.value = normalized
                        setEditItem({ ...editItem, stock: Number(normalized) })
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Min. Stok</Label>
                    <Input
                      type="number"
                      value={editItem.min_stock}
                      onChange={(e) => {
                        const normalized = normalizeNumericString(e.target.value)
                        e.target.value = normalized
                        setEditItem({ ...editItem, min_stock: Number(normalized) })
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Harga (Rp)</Label>
                    <Input
                      type="number"
                      value={editItem.price}
                      onChange={(e) => {
                        const normalized = normalizeNumericString(e.target.value)
                        e.target.value = normalized
                        setEditItem({ ...editItem, price: Number(normalized) })
                      }}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button onClick={handleUpdateItem} className="bg-primary text-primary-foreground" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-card-foreground">Hapus Barang</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus <strong>{deleteItem?.name}</strong>? Tindakan ini tidak dapat
                dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteItem}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </main>
      </PageTransition>
    </div>
  )
}
