"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const gradientTextVariants = cva("bg-clip-text text-transparent bg-gradient-to-r", {
  variants: {
    variant: {
      default: "from-primary to-secondary",
      blue: "from-blue-600 to-cyan-500",
      purple: "from-purple-600 to-pink-500",
      green: "from-green-500 to-emerald-500",
      orange: "from-orange-500 to-amber-500",
      medical: "from-medical-blue to-medical-green",
    },
    size: {
      default: "text-lg",
      sm: "text-sm",
      md: "text-lg",
      lg: "text-xl md:text-2xl",
      xl: "text-2xl md:text-3xl",
      "2xl": "text-3xl md:text-4xl",
      "3xl": "text-4xl md:text-5xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
    font: {
      sans: "font-sans",
      heading: "font-heading",
      serif: "font-serif",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    weight: "bold",
    font: "heading",
  },
})

export interface GradientTextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof gradientTextVariants> {}

const GradientText = React.forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ className, variant, size, weight, font, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(gradientTextVariants({ variant, size, weight, font, className }))}
        {...props}
      >
        {children}
      </span>
    )
  }
)
GradientText.displayName = "GradientText"

export { GradientText, gradientTextVariants }
