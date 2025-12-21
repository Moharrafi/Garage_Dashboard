"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Shield,
  Camera,
  Save,
  Key,
  Bell,
  Eye,
  EyeOff,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageTransition } from "@/components/page-transition"
import { useToast } from "@/components/toast-notification"
import { apiFetch } from "@/lib/api"
import type { AdminProfile } from "@/lib/types"

const defaultProfileForm = {
  full_name: "",
  email: "",
  phone: "",
  address: "",
  workshop_name: "",
  avatar_url: "",
}

const defaultNotificationPrefs = {
  email: true,
  push: true,
  stockAlert: true,
  unitComplete: true,
  dailyReport: false,
}

const defaultPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export default function ProfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profileData, setProfileData] = useState<AdminProfile | null>(null)
  const [profileForm, setProfileForm] = useState(defaultProfileForm)
  const [notificationPrefs, setNotificationPrefs] = useState(defaultNotificationPrefs)
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [cropScale, setCropScale] = useState(1)
  const [baseScale, setBaseScale] = useState(1)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const dragState = useRef({ active: false, startX: 0, startY: 0, lastX: 0, lastY: 0 })
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const { showToast } = useToast()

  const formatJoinDate = (value?: string | null) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const loadProfile = useCallback(async () => {
    try {
      const data = await apiFetch<AdminProfile>("/api/profile")
      setProfileData(data)
      setProfileForm({
        full_name: data.full_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        workshop_name: data.workshop_name ?? "",
        avatar_url: data.avatar_url ?? "",
      })
      setNotificationPrefs({
        email: data.notify_email,
        push: data.notify_push,
        stockAlert: data.notify_stock_alert,
        unitComplete: data.notify_unit_complete,
        dailyReport: data.notify_daily_report,
      })
    } catch (error) {
      console.error("Gagal memuat profil:", error)
      showToast("Gagal memuat data profil", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const updated = await apiFetch<AdminProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: profileForm.full_name,
          email: profileForm.email,
          phone: profileForm.phone,
          address: profileForm.address,
          workshop_name: profileForm.workshop_name,
          avatar_url: profileForm.avatar_url,
        }),
      })
      setProfileData(updated)
      setProfileForm({
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        workshop_name: updated.workshop_name,
        avatar_url: updated.avatar_url,
      })
      showToast("Profil berhasil diperbarui", "success")
      setIsEditing(false)
    } catch (error: unknown) {
      console.error("Gagal memperbarui profil:", error)
      const message = error instanceof Error ? error.message : "Gagal memperbarui profil"
      showToast(message, "error")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    try {
      const updated = await apiFetch<AdminProfile>("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          notify_email: notificationPrefs.email,
          notify_push: notificationPrefs.push,
          notify_stock_alert: notificationPrefs.stockAlert,
          notify_unit_complete: notificationPrefs.unitComplete,
          notify_daily_report: notificationPrefs.dailyReport,
        }),
      })
      setProfileData(updated)
      showToast("Pengaturan notifikasi disimpan", "success")
    } catch (error) {
      console.error("Gagal menyimpan notifikasi:", error)
      showToast("Gagal menyimpan pengaturan notifikasi", "error")
    } finally {
      setSavingNotifications(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Konfirmasi password tidak cocok", "error")
      return
    }

    setSavingPassword(true)
    try {
      await apiFetch("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify(passwordForm),
      })
      showToast("Password berhasil diperbarui", "success")
      setPasswordForm(defaultPasswordForm)
      setShowConfirmPassword(false)
      setShowNewPassword(false)
      setShowCurrentPassword(false)
    } catch (error: unknown) {
      console.error("Gagal memperbarui password:", error)
      const message = error instanceof Error ? error.message : "Gagal memperbarui password"
      showToast(message, "error")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      showToast("Format file tidak didukung", "error")
      input.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const img = new Image()
      img.onload = () => {
        const cropBox = 280
        const coverScale = Math.max(cropBox / img.width, cropBox / img.height)
        setCropScale(coverScale)
        setBaseScale(coverScale)
        setCropPosition({ x: 0, y: 0 })
        setImageDimensions({ width: img.width, height: img.height })
        setCropImageSrc(src)
        setPendingFile(file)
        setCropModalOpen(true)
      }
      img.onerror = () => {
        showToast("Tidak dapat membaca gambar", "error")
        input.value = ""
      }
      img.src = src
    }
    reader.onerror = () => {
      showToast("Gagal memuat gambar", "error")
      input.value = ""
    }
    reader.readAsDataURL(file)
  }

  const clampPosition = useCallback(
    (next: { x: number; y: number }) => {
      const cropBox = 280
      if (!imageDimensions.width || !imageDimensions.height) return { x: 0, y: 0 }
      const scaledWidth = imageDimensions.width * cropScale
      const scaledHeight = imageDimensions.height * cropScale
      const maxX = Math.max(0, (scaledWidth - cropBox) / 2)
      const maxY = Math.max(0, (scaledHeight - cropBox) / 2)
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      }
    },
    [cropScale, imageDimensions.height, imageDimensions.width],
  )

  useEffect(() => {
    setCropPosition((prev) => clampPosition(prev))
  }, [clampPosition, cropScale])

  const closeCropModal = () => {
    setCropModalOpen(false)
    setCropImageSrc(null)
    setPendingFile(null)
    setImageDimensions({ width: 0, height: 0 })
    setCropPosition({ x: 0, y: 0 })
    setCropScale(1)
    setBaseScale(1)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      lastX: cropPosition.x,
      lastY: cropPosition.y,
    }
    ;(event.target as HTMLElement).setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return
    const deltaX = event.clientX - dragState.current.startX
    const deltaY = event.clientY - dragState.current.startY
    const next = clampPosition({ x: dragState.current.lastX + deltaX, y: dragState.current.lastY + deltaY })
    setCropPosition(next)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return
    dragState.current = { ...dragState.current, active: false }
    ;(event.target as HTMLElement).releasePointerCapture?.(event.pointerId)
  }

  const createCroppedBlob = () => {
    return new Promise<Blob>((resolve, reject) => {
      if (!cropImageSrc || !imageDimensions.width || !pendingFile) {
        reject(new Error("Gambar belum siap"))
        return
      }
      const image = new Image()
      image.crossOrigin = "anonymous"
      image.onload = () => {
        const cropBox = 280
        const canvasSize = 512
        const canvas = document.createElement("canvas")
        canvas.width = canvasSize
        canvas.height = canvasSize
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas tidak tersedia"))
          return
        }
        ctx.imageSmoothingQuality = "high"
        const scaledWidth = imageDimensions.width * cropScale
        const scaledHeight = imageDimensions.height * cropScale
        const visibleX = Math.max(0, (scaledWidth - cropBox) / 2 - cropPosition.x)
        const visibleY = Math.max(0, (scaledHeight - cropBox) / 2 - cropPosition.y)
        const sourceX = visibleX / cropScale
        const sourceY = visibleY / cropScale
        const sourceSize = cropBox / cropScale
        ctx.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, canvasSize, canvasSize)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Gagal membuat gambar hasil crop"))
            }
          },
          pendingFile.type || "image/png",
          0.95,
        )
      }
      image.onerror = () => reject(new Error("Tidak dapat merender gambar"))
      image.src = cropImageSrc
    })
  }

  const handleCropAndUpload = async () => {
    if (!pendingFile) return
    setUploadingAvatar(true)
    try {
      const blob = await createCroppedBlob()
      const formData = new FormData()
      const extension = pendingFile.type === "image/png" ? "png" : pendingFile.type === "image/jpeg" ? "jpg" : "png"
      formData.append("avatar", blob, `${pendingFile.name.split(".")[0] || "avatar"}-cropped.${extension}`)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Gagal mengunggah foto profil")
      }

      const data = await response.json()

      setProfileData((prev) => (prev ? { ...prev, avatar_url: data.avatar_url } : prev))
      setProfileForm((prev) => ({ ...prev, avatar_url: data.avatar_url }))
      showToast("Foto profil berhasil diperbarui", "success")
      closeCropModal()
    } catch (error) {
      console.error("Gagal memproses foto profil:", error)
      const message = error instanceof Error ? error.message : "Gagal memproses foto profil"
      showToast(message, "error")
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ""
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const joinDateLabel = formatJoinDate(profileData?.join_date)
  const roleLabel = profileData?.role ?? "Administrator"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <PageTransition>
        <div className="lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <DashboardHeader title="Profil Saya" subtitle="Kelola informasi akun dan pengaturan" />

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-secondary/50 p-1">
                <TabsTrigger value="profile" className="data-[state=active]:bg-background text-xs sm:text-sm">
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Informasi</span> Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-background text-xs sm:text-sm">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  Keamanan
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-background text-xs sm:text-sm">
                  <Bell className="h-4 w-4 mr-1 sm:mr-2" />
                  Notifikasi
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="bg-card border-border lg:col-span-1">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative">
                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                              <AvatarImage src={profileForm.avatar_url || "/diverse-user-avatars.png"} alt="User" />
                              <AvatarFallback className="bg-primary text-primary-foreground text-2xl sm:text-3xl">
                                {getInitials(profileForm.full_name || "Admin GTA Garage")}
                              </AvatarFallback>
                            </Avatar>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                              onClick={(event) => {
                                event.preventDefault()
                                avatarInputRef.current?.click()
                              }}
                              disabled={uploadingAvatar}
                              title="Ubah foto profil"
                            >
                              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </Button>
                            <input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarSelect}
                            />
                          </div>
                        <h3 className="mt-4 text-lg font-semibold text-card-foreground">{profileForm.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{profileForm.email}</p>
                        <Badge className="mt-2 bg-primary/10 text-primary border-0 capitalize">
                          <Shield className="h-3 w-3 mr-1" />
                          {roleLabel}
                        </Badge>

                        <Separator className="my-4 w-full" />

                        <div className="w-full space-y-3 text-left">
                          <div className="flex items-center gap-3 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{profileForm.workshop_name || "GTA Garage"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Bergabung {joinDateLabel}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-card-foreground">Informasi Profil</CardTitle>
                          <CardDescription>Perbarui informasi profil Anda</CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                            Edit Profil
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                              Batal
                            </Button>
                            <Button onClick={handleSaveProfile} size="sm" disabled={savingProfile}>
                              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-1" />}
                              Simpan
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            Nama Lengkap
                          </Label>
                          <Input
                            id="name"
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            disabled={!isEditing}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            disabled={!isEditing}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Nomor Telepon
                          </Label>
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            disabled={!isEditing}
                            className="bg-secondary border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="workshop" className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            Nama Bengkel
                          </Label>
                          <Input
                            id="workshop"
                            value={profileForm.workshop_name}
                            onChange={(e) => setProfileForm({ ...profileForm, workshop_name: e.target.value })}
                            disabled={!isEditing}
                            className="bg-secondary border-border"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Alamat
                        </Label>
                        <Input
                          id="address"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          disabled={!isEditing}
                          className="bg-secondary border-border"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Ubah Password
                    </CardTitle>
                    <CardDescription>Pastikan akun Anda menggunakan password yang kuat dan unik</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Masukkan password saat ini"
                          className="bg-secondary border-border pr-10"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Password Baru</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Masukkan password baru"
                            className="bg-secondary border-border pr-10"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Konfirmasi password baru"
                            className="bg-secondary border-border pr-10"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button className="mt-2" onClick={handlePasswordUpdate} disabled={savingPassword}>
                      {savingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                      Perbarui Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Pengaturan Notifikasi
                    </CardTitle>
                    <CardDescription>Kelola preferensi notifikasi Anda</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Notifikasi Email</Label>
                          <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.email}
                          onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, email: checked })}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Push Notification</Label>
                          <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.push}
                          onCheckedChange={(checked) => setNotificationPrefs({ ...notificationPrefs, push: checked })}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Peringatan Stok</Label>
                          <p className="text-sm text-muted-foreground">Notifikasi saat stok barang menipis</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.stockAlert}
                          onCheckedChange={(checked) =>
                            setNotificationPrefs({ ...notificationPrefs, stockAlert: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Unit Selesai</Label>
                          <p className="text-sm text-muted-foreground">Notifikasi saat unit servis selesai</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.unitComplete}
                          onCheckedChange={(checked) =>
                            setNotificationPrefs({ ...notificationPrefs, unitComplete: checked })
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Laporan Harian</Label>
                          <p className="text-sm text-muted-foreground">Terima ringkasan laporan setiap hari</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.dailyReport}
                          onCheckedChange={(checked) =>
                            setNotificationPrefs({ ...notificationPrefs, dailyReport: checked })
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
                      {savingNotifications ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Simpan Pengaturan
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </PageTransition>
      <Dialog open={cropModalOpen} onOpenChange={(open) => (!open ? closeCropModal() : setCropModalOpen(open))}>
        <DialogContent className="bg-card border-border max-w-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-4 duration-500">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Atur Foto Profil</DialogTitle>
            <DialogDescription>Sesuaikan posisi dan ukuran foto sebelum disimpan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="relative mx-auto h-[280px] w-[280px] overflow-hidden rounded-full border border-border bg-muted/30 cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {cropImageSrc ? (
                <img
                  src={cropImageSrc}
                  alt="Crop preview"
                  className="absolute left-1/2 top-1/2 select-none"
                  style={{
                    width: imageDimensions.width * cropScale,
                    height: imageDimensions.height * cropScale,
                    transform: `translate(-50%, -50%) translate(${cropPosition.x}px, ${cropPosition.y}px)`,
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                  Memuat gambar...
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Minimize2 className="h-4 w-4 text-muted-foreground" />
              <input
                type="range"
                min={baseScale}
                max={baseScale * 3}
                step={0.01}
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                className="flex-1"
              />
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Seret foto untuk mengatur posisi. Ukuran akhir 512x512 piksel.
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={closeCropModal} disabled={uploadingAvatar}>
              Batal
            </Button>
            <Button onClick={handleCropAndUpload} disabled={uploadingAvatar || !cropImageSrc}>
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
              Simpan Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
