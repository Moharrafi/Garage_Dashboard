"use client"

// Mock data store for workshop management
export interface Item {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  unit: string
}

export interface StockTransaction {
  id: string
  itemId: string
  itemName: string
  type: "masuk" | "keluar"
  quantity: number
  date: string
  note: string
}

export interface Unit {
  id: string
  vehicleType: string
  brand: string
  ownerName: string
  phone: string
  serviceType: "servis" | "vapor" | "sandblasting" | "restorasi"
  status: "check-in" | "proses" | "selesai" | "check-out"
  checkInDate: string
  checkOutDate?: string
  estimatedCost: number
  finalCost?: number
  notes: string
}

// Initial mock data
export const initialItems: Item[] = [
  { id: "1", name: "Oli Mesin 10W-40", category: "Oli", stock: 50, minStock: 10, price: 45000, unit: "Liter" },
  { id: "2", name: "Kampas Rem Depan", category: "Sparepart", stock: 25, minStock: 5, price: 35000, unit: "Set" },
  { id: "3", name: "Busi NGK", category: "Sparepart", stock: 100, minStock: 20, price: 25000, unit: "Pcs" },
  { id: "4", name: "Ban Tubeless 70/90", category: "Ban", stock: 15, minStock: 5, price: 185000, unit: "Pcs" },
  { id: "5", name: "Rantai Motor", category: "Sparepart", stock: 20, minStock: 5, price: 120000, unit: "Set" },
  { id: "6", name: "Aki Motor 5Ah", category: "Aki", stock: 10, minStock: 3, price: 250000, unit: "Pcs" },
  { id: "7", name: "Air Radiator", category: "Cairan", stock: 30, minStock: 10, price: 15000, unit: "Liter" },
  { id: "8", name: "Minyak Rem DOT 3", category: "Cairan", stock: 20, minStock: 5, price: 25000, unit: "Botol" },
]

export const initialTransactions: StockTransaction[] = [
  {
    id: "1",
    itemId: "1",
    itemName: "Oli Mesin 10W-40",
    type: "masuk",
    quantity: 20,
    date: "2024-12-01",
    note: "Restok dari supplier",
  },
  {
    id: "2",
    itemId: "3",
    itemName: "Busi NGK",
    type: "keluar",
    quantity: 5,
    date: "2024-12-02",
    note: "Servis motor Honda Beat",
  },
  {
    id: "3",
    itemId: "2",
    itemName: "Kampas Rem Depan",
    type: "keluar",
    quantity: 2,
    date: "2024-12-02",
    note: "Ganti kampas rem Vario",
  },
  {
    id: "4",
    itemId: "4",
    itemName: "Ban Tubeless 70/90",
    type: "masuk",
    quantity: 10,
    date: "2024-12-03",
    note: "Restok ban",
  },
  {
    id: "5",
    itemId: "1",
    itemName: "Oli Mesin 10W-40",
    type: "keluar",
    quantity: 3,
    date: "2024-12-03",
    note: "Ganti oli 3 motor",
  },
]

export const initialUnits: Unit[] = [
  {
    id: "1",
    vehicleType: "Matic",
    brand: "Honda Beat",
    ownerName: "Ahmad Wijaya",
    phone: "081234567890",
    serviceType: "servis",
    status: "proses",
    checkInDate: "2024-12-03",
    estimatedCost: 150000,
    notes: "Ganti oli dan tune up",
  },
  {
    id: "2",
    vehicleType: "Sport",
    brand: "Yamaha R15",
    ownerName: "Budi Santoso",
    phone: "082345678901",
    serviceType: "vapor",
    status: "check-in",
    checkInDate: "2024-12-04",
    estimatedCost: 350000,
    notes: "Vapor blasting velg",
  },
  {
    id: "3",
    vehicleType: "Bebek",
    brand: "Honda Supra",
    ownerName: "Citra Dewi",
    phone: "083456789012",
    serviceType: "sandblasting",
    status: "selesai",
    checkInDate: "2024-12-02",
    estimatedCost: 500000,
    finalCost: 480000,
    notes: "Sandblasting rangka",
  },
  {
    id: "4",
    vehicleType: "Matic",
    brand: "Yamaha NMAX",
    ownerName: "Dedi Kurniawan",
    phone: "084567890123",
    serviceType: "servis",
    status: "check-out",
    checkInDate: "2024-12-01",
    checkOutDate: "2024-12-02",
    estimatedCost: 200000,
    finalCost: 185000,
    notes: "Service berkala",
  },
  {
    id: "5",
    vehicleType: "Trail",
    brand: "Honda CRF",
    ownerName: "Eko Prasetyo",
    phone: "085678901234",
    serviceType: "restorasi",
    status: "proses",
    checkInDate: "2024-12-03",
    estimatedCost: 2500000,
    notes: "Restorasi full body",
  },
]

// Helper functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

import { useState, useCallback } from "react"

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>(initialUnits)

  const addUnit = useCallback((unit: Omit<Unit, "id" | "notes"> & { problem: string }) => {
    const newUnit: Unit = {
      ...unit,
      id: Date.now().toString(),
      notes: unit.problem,
    }
    setUnits((prev) => [newUnit, ...prev])
  }, [])

  const updateUnit = useCallback((id: string, updates: Partial<Unit>) => {
    setUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, ...updates } : unit)))
  }, [])

  const deleteUnit = useCallback((id: string) => {
    setUnits((prev) => prev.filter((unit) => unit.id !== id))
  }, [])

  return { units, addUnit, updateUnit, deleteUnit }
}
