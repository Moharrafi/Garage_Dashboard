import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  variant?: "default" | "success" | "warning" | "destructive"
  valueClassName?: string | ((value: string | number) => string | undefined)
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  valueClassName,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-3 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 lg:space-y-1 min-w-0 flex-1">
            <p className="text-xs lg:text-sm text-muted-foreground truncate">{title}</p>
            <p
              className={cn(
                "text-lg lg:text-2xl font-bold text-card-foreground truncate",
                typeof valueClassName === "function" ? valueClassName(value) : valueClassName,
              )}
            >
              {value}
            </p>
            {subtitle && <p className="text-[10px] lg:text-xs text-muted-foreground truncate">{subtitle}</p>}
            {trend && (
              <p
                className={cn(
                  "text-[10px] lg:text-xs font-medium",
                  trend.positive ? "text-success" : "text-destructive",
                )}
              >
                {trend.positive ? "+" : ""}
                {trend.value}% dari bulan lalu
              </p>
            )}
          </div>
          <div className={cn("p-2 lg:p-3 rounded-lg shrink-0", variantStyles[variant])}>
            <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
