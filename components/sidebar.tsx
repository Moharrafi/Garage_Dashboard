"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Car,
  FileText,
  TrendingUp,
  ChevronLeft,
  Wrench,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const menuSections = [
  {
    title: "Ringkasan",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Inventaris",
    items: [
      { href: "/stok", label: "Stok Barang", icon: Package },
      { href: "/transaksi", label: "Barang Masuk/Keluar", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Operasional",
    items: [{ href: "/unit", label: "Check-in/out Unit", icon: Car }],
  },
  {
    title: "Analitik",
    items: [
      { href: "/laporan", label: "Laporan", icon: FileText },
      { href: "/keuntungan", label: "Keuntungan", icon: TrendingUp },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 left-2 z-50 lg:hidden transition-opacity duration-200 border border-border rounded-xl bg-background/90 shadow-sm",
          mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center h-16 px-4 border-b border-sidebar-border",
              collapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-sidebar-foreground">GTA Garage</h1>
                <p className="text-xs text-muted-foreground">Workshop Management</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
            {menuSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-xs uppercase tracking-wide text-muted-foreground/70">{section.title}</p>
                )}
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out hover:translate-x-1 active:scale-95",
                        isActive ? "bg-sidebar-accent text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center",
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Collapse button */}
          <div className="p-3 border-t border-sidebar-border hidden lg:block">
            <Button
              variant="ghost"
              size="sm"
              className={cn("w-full", collapsed && "px-0")}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
              {!collapsed && <span className="ml-2">Tutup Menu</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
