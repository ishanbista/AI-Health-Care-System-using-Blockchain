"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const featureCardVariants = cva(
  "relative overflow-hidden rounded-xl p-7 md:p-8 shadow-md transition-all duration-300 hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        primary: "bg-primary/15 border border-primary/30 text-foreground",
        secondary: "bg-secondary/15 border border-secondary/30 text-foreground",
        accent: "bg-accent text-accent-foreground",
        outline: "bg-transparent border border-border hover:bg-muted/50",
        ghost: "bg-transparent hover:bg-muted/50",
      },
      size: {
        default: "min-h-[200px]",
        sm: "min-h-[150px]",
        lg: "min-h-[250px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FeatureCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof featureCardVariants> {
  title: string
  description: string
  icon?: React.ReactNode
  hoverEffect?: boolean
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  function FeatureCard({ className, variant, size, title, description, icon, hoverEffect = true, ...props }, ref) {
    const hoverClass = hoverEffect ? "transform transition-transform duration-300 hover:-translate-y-1" : ""

    return (
      <div
        ref={ref}
        className={cn(featureCardVariants({ variant, size, className }), hoverClass)}
        {...props}
      >
        {icon && (
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm border border-primary/20 text-primary">
            {icon}
          </div>
        )}
        <h3 className="mb-3 font-heading text-xl md:text-2xl font-semibold text-foreground">{title}</h3>
        <p className="text-foreground/80 text-base md:text-lg">{description}</p>
      </div>
    )
  }
)

FeatureCard.displayName = "FeatureCard"

export { FeatureCard, featureCardVariants }
