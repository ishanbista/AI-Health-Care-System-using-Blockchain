"use client"

import React from "react"
import { Circle, Check, CheckCheck } from "lucide-react"

interface MessageStatusProps {
  status: "pending" | "sent" | "delivered" | "read"
  className?: string
}

export function MessageStatus({ status, className = "" }: MessageStatusProps) {
  switch (status) {
    case "pending":
      return <Circle className={`h-3 w-3 ${className}`} />
    case "sent":
      return <Check className={`h-3 w-3 ${className}`} />
    case "delivered":
      return <CheckCheck className={`h-3 w-3 ${className}`} />
    case "read":
      return <CheckCheck className={`h-3 w-3 text-blue-500 ${className}`} />
    default:
      return <Circle className={`h-3 w-3 ${className}`} />
  }
}
