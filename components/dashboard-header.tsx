"use client"

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react"
import { Bell, Search, User, Settings, LogOut, X, Check, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { apiFetch } from "@/lib/api"
import type { AdminProfile, NotificationType, GlobalSearchItem, SearchCategory } from "@/lib/types"
import { useIsMobile } from "@/hooks/use-mobile"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  searchSuggestions?: GlobalSearchItem[]
  onSelectSuggestion?: (suggestion: GlobalSearchItem) => void
}

interface NotificationState {
  id: string
  title: string
  message: string
  created_at: Date
  is_read: boolean
  type: NotificationType
}

const typeColors: Record<NotificationType, string> = {
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  info: "bg-blue-500",
  error: "bg-red-500",
}

const searchCategoryLabels: Record<SearchCategory, string> = {
  stok: "Stok",
  transaksi: "Transaksi",
  unit: "Unit",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function formatRelativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 1) return "baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

export function DashboardHeader({
  title,
  subtitle,
  searchValue: externalSearchValue,
  searchPlaceholder = "Cari...",
  onSearchChange,
  searchSuggestions,
  onSelectSuggestion,
}: DashboardHeaderProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [notifications, setNotifications] = useState<NotificationState[]>([])
  const [notificationsLoaded, setNotificationsLoaded] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [internalSearch, setInternalSearch] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [globalSearchData, setGlobalSearchData] = useState<GlobalSearchItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [profile, setProfile] = useState<Pick<AdminProfile, "full_name" | "email" | "avatar_url">>({
    full_name: "Admin GTA Garage",
    email: "admin@gtagarage.com",
    avatar_url: "",
  })
  const searchInputValue = externalSearchValue ?? internalSearch
  const notificationDropdownStyle: CSSProperties | undefined = isMobile
    ? { width: "calc(100vw - 40px)", maxWidth: "calc(100vw - 40px)" }
    : undefined

  const filteredSuggestions = useMemo(() => {
    const pool = searchSuggestions?.length ? searchSuggestions : globalSearchData
    if (!pool || pool.length === 0) return []
    const query = searchInputValue.trim().toLowerCase()
    const source = query
      ? pool.filter((item) => {
          const candidateStrings = [
            item.title,
            item.subtitle ?? "",
            item.category ?? "",
            ...(item.keywords ?? []),
          ]
          return candidateStrings.some((text) => text.toLowerCase().includes(query))
        })
      : pool
    return source.slice(0, 8)
  }, [searchSuggestions, globalSearchData, searchInputValue])

  useEffect(() => {
    if (searchSuggestions && searchSuggestions.length > 0) return

    let active = true
    async function loadSearchData() {
      try {
        setSearchLoading(true)
        const data = await apiFetch<GlobalSearchItem[]>("/api/search")
        if (active) {
          setGlobalSearchData(data ?? [])
        }
      } catch (error) {
        console.error("Gagal memuat data pencarian global:", error)
      } finally {
        if (active) {
          setSearchLoading(false)
        }
      }
    }
    loadSearchData()

    return () => {
      active = false
    }
  }, [searchSuggestions])

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch<AdminProfile>("/api/profile")
      setProfile({
        full_name: data.full_name,
        email: data.email,
        avatar_url: data.avatar_url,
      })
    } catch (error) {
      console.error("Gagal memuat profil:", error)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiFetch<Array<Omit<NotificationState, "created_at"> & { created_at: string }>>(
        "/api/notifications",
      )
      setNotifications(
        data.map((notif) => ({
          ...notif,
          created_at: new Date(notif.created_at),
        })),
      )
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error)
    } finally {
      setNotificationsLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchNotifications()
  }, [fetchProfile, fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleSuggestionSelect = (suggestion: GlobalSearchItem) => {
    if (onSearchChange) {
      onSearchChange(suggestion.title)
    } else {
      setInternalSearch(suggestion.title)
    }
    onSelectSuggestion?.(suggestion)
    setShowSuggestions(false)
    if (suggestion.href) {
      router.push(suggestion.href)
    }
  }

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    try {
      await apiFetch(`/api/notifications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      })
    } catch (error) {
      console.error("Gagal menandai notifikasi:", error)
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    try {
      await apiFetch("/api/notifications/mark-all", { method: "POST" })
    } catch (error) {
      console.error("Gagal menandai semua notifikasi:", error)
      fetchNotifications()
    }
  }

  const removeNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await apiFetch(`/api/notifications/${id}`, { method: "DELETE" })
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error)
      fetchNotifications()
    }
  }

  const deleteAllNotifications = async () => {
    setNotifications([])
    try {
      await apiFetch("/api/notifications", { method: "DELETE" })
    } catch (error) {
      console.error("Gagal menghapus notifikasi:", error)
      fetchNotifications()
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Gagal logout:", error)
    } finally {
      setShowLogoutDialog(false)
      window.location.href = "/auth/login"
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 mb-6 lg:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-[220px] pl-12 lg:pl-0">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-xs lg:text-sm">{subtitle}</p>}
          </div>

          <div className="flex items-center justify-end flex-wrap gap-2 sm:gap-3 lg:gap-4 w-auto md:flex-1">
            <div className="relative hidden md:flex md:flex-1 lg:flex-initial md:min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchInputValue}
                onFocus={() => setShowSuggestions(searchInputValue.trim().length > 0)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 100)
                }}
                onChange={(e) => {
                  const value = e.target.value
                  if (onSearchChange) {
                    onSearchChange(value)
                  } else {
                    setInternalSearch(value)
                  }
                  setShowSuggestions(value.trim().length > 0)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredSuggestions[0]) {
                    e.preventDefault()
                    handleSuggestionSelect(filteredSuggestions[0])
                  }
                }}
                className="pl-9 w-full lg:w-64 bg-secondary border-border"
              />
              {showSuggestions && searchInputValue.trim().length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-card shadow-lg z-10">
                  <p className="text-[11px] px-3 py-1 text-muted-foreground uppercase tracking-wide border-b border-border/60">
                    Rekomendasi
                  </p>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {searchLoading ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">Memuat data...</div>
                    ) : filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSuggestionSelect(suggestion)
                          }}
                          className="w-full flex items-start justify-between gap-3 px-3 py-2 hover:bg-muted transition-colors"
                        >
                          <div className="text-left">
                            <p className="text-sm font-medium text-card-foreground">{suggestion.title}</p>
                            {suggestion.subtitle && (
                              <p className="text-xs text-muted-foreground mt-0.5">{suggestion.subtitle}</p>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/80">
                            {searchCategoryLabels[suggestion.category] ?? suggestion.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-sm text-muted-foreground text-center">data tidak ditemukan</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[340px] p-0 rounded-xl shadow-2xl border-border/50"
                align={isMobile ? "center" : "end"}
                sideOffset={isMobile ? 14 : 8}
                style={notificationDropdownStyle}
                collisionPadding={isMobile ? 16 : 8}
              >
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} belum dibaca</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs h-8 px-2.5 rounded-lg hover:bg-primary/10 text-primary"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Tandai Dibaca
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {!notificationsLoaded ? (
                    <div className="text-center py-12 px-4 text-sm text-muted-foreground">Memuat notifikasi...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    <div className="py-1">
                      {notifications.map((notif, index) => (
                        <div
                          key={notif.id}
                          className={`
                            group relative px-4 py-3 cursor-pointer transition-all duration-200
                            hover:bg-muted/50
                            ${!notif.is_read ? "bg-primary/5" : ""}
                            ${index !== notifications.length - 1 ? "border-b border-border/30" : ""}
                          `}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${typeColors[notif.type]}`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-medium leading-tight ${!notif.is_read ? "text-foreground" : "text-muted-foreground"}`}
                                >
                                  {notif.title}
                                </p>
                                {!notif.is_read && (
                                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                                {formatRelativeTime(notif.created_at)}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notif.id)
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notificationsLoaded && notifications.length > 0 && (
                  <div className="p-3 border-t border-border/50 bg-muted/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deleteAllNotifications}
                      className="w-full text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Hapus Semua Notifikasi
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={profile.avatar_url || "/diverse-user-avatars.png"} alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url || "/diverse-user-avatars.png"} alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    setShowLogoutDialog(true)
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari akun ini? Anda perlu login kembali untuk mengakses dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
