export interface Item {
  id: string
  name: string
  category: string
  stock: number
  min_stock: number
  price: number
  unit: string
  created_at?: string
  updated_at?: string
}

export interface StockTransaction {
  id: string
  item_id: string | null
  item_name: string
  type: "masuk" | "keluar"
  quantity: number
  date: string
  note: string | null
  created_at?: string
}

export interface Unit {
  id: string
  vehicle_type: string
  brand: string
  owner_name: string
  phone: string
  service_type: "servis" | "vapor" | "sandblasting" | "restorasi"
  status: "check-in" | "proses" | "selesai" | "check-out"
  check_in_date: string
  check_out_date?: string | null
  estimated_cost: number
  final_cost?: number | null
  notes: string | null
  created_at?: string
  updated_at?: string
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export type UserRole = "admin" | "staff" | "owner"

export interface AdminProfile {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  workshop_name: string
  role: UserRole
  avatar_url: string
  join_date: string | null
  notify_email: boolean
  notify_push: boolean
  notify_stock_alert: boolean
  notify_unit_complete: boolean
  notify_daily_report: boolean
  created_at?: Date | string
  updated_at?: Date | string
}

export interface AdminProfileRecord extends AdminProfile {
  password_hash: string
  password_salt: string
}

export type NotificationType = "info" | "success" | "warning" | "error"

export interface NotificationItem {
  id: string
  profile_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: Date
}

export type SearchCategory = "stok" | "transaksi" | "unit"

export interface GlobalSearchItem {
  id: string
  title: string
  subtitle?: string
  category: SearchCategory
  href: string
  keywords?: string[]
}
