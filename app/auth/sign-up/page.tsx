"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-primary rounded-xl">
            <Wrench className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground">GTA Garage</h1>
            <p className="text-xs text-muted-foreground">Workshop Management</p>
          </div>
        </div>

        <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-card-foreground">Pendaftaran Dinonaktifkan</CardTitle>
            <CardDescription>
              Untuk menjaga keamanan, pembuatan akun baru dilakukan oleh admin melalui konfigurasi server.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Silakan hubungi admin bengkel jika Anda membutuhkan akses.
            </p>
            <Button asChild className="w-full bg-primary text-primary-foreground">
              <Link href="/auth/login">Kembali ke Login</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">&copy; 2025 GTA Garage. All rights reserved.</p>
      </div>
    </div>
  )
}
