"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { ProfilePicture } from "@/components/profile-picture"
import { Home, FileText, Calendar, Settings, LogOut, Menu, X, MessageSquare, Activity, Stethoscope } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface PatientLayoutProps {
  children: React.ReactNode
}

export function PatientLayout({ children }: PatientLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and is a patient
    if (!user) {
      router.push("/connect-wallet")
    } else if (user.role !== "patient") {
      router.push("/connect-wallet")
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/patient" },
    { icon: Activity, label: "Health Metrics", href: "/patient/health" },
    { icon: FileText, label: "Medical Reports", href: "/patient/reports" },
    { icon: Calendar, label: "Appointments", href: "/patient/appointments" },
    { icon: MessageSquare, label: "Messages", href: "/patient/messages" },
    { icon: Stethoscope, label: "Symptom Analyzer", href: "/patient/symptom-analyzer" },
    { icon: Settings, label: "Settings", href: "/patient/settings" },
  ]

  if (!user) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="bg-card shadow-sm py-4 px-4 flex justify-between items-center md:hidden">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xl text-foreground">TeleHealth</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-card border-r">
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-xl text-foreground">TeleHealth</span>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1 px-4 pb-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2 mb-4">
              <ProfilePicture size="md" />
              <div>
                <p className="font-medium">{user.name || "Patient"}</p>
                <p className="text-xs text-gray-500">Patient</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-500 px-3">
                Wallet: {user.walletAddress?.substring(0, 6)}...
                {user.walletAddress?.substring(user.walletAddress?.length - 4)}
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed top-0 left-0 bottom-0 w-64 bg-card">
              <div className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-bold text-xl text-foreground">TeleHealth</span>
                </Link>
                <ThemeToggle />
              </div>

              <nav className="px-4 pb-4">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t">
                <div className="flex items-center gap-3 px-3 py-2 mb-4">
                  <ProfilePicture size="md" />
                  <div>
                    <p className="font-medium">{user.name || "Patient"}</p>
                    <p className="text-xs text-gray-500">Patient</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-500 px-3">
                    Wallet: {user.walletAddress?.substring(0, 6)}...
                    {user.walletAddress?.substring(user.walletAddress?.length - 4)}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
