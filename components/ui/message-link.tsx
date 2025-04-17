"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

interface MessageLinkProps {
  href: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function MessageLink({ href, className, variant = "outline", size = "sm" }: MessageLinkProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsNavigating(true)
    
    // Use setTimeout to delay navigation slightly
    setTimeout(() => {
      router.push(href)
    }, 10)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className || ""}`}
      onClick={handleClick}
      disabled={isNavigating}
    >
      <MessageSquare className="h-4 w-4" />
      Send Message
    </Button>
  )
}
