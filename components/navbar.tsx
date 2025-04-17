"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Brain, LogOut, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { ProfilePicture } from "@/components/profile-picture"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TELEHEALTH</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/#benefits" className="text-muted-foreground hover:text-primary transition-colors">
              Benefits
            </Link>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ProfilePicture size="sm" />
                  <div className="text-sm text-muted-foreground">
                    {user.name ||
                      user.walletAddress?.substring(0, 6) +
                        "..." +
                        user.walletAddress?.substring(user.walletAddress.length - 4)}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
                <Link href={user.role === "patient" ? "/patient" : "/doctor"}>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/connect-wallet">
                  <Button className="bg-primary hover:bg-primary/90 text-white">Connect Wallet</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-muted-foreground hover:text-foreground focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors">
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/#benefits"
                className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
              >
                Benefits
              </Link>

              {user ? (
                <>
                  <Link
                    href={user.role === "patient" ? "/patient" : "/doctor"}
                    className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/connect-wallet"
                  className="block px-3 py-2 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  Connect Wallet
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
