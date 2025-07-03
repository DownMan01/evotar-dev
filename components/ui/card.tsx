import * as React from "react"

import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

// Update the cardVariants to have more refined styling
const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm backdrop-blur-[2px] dark:shadow-slate-900/20",
  {
    variants: {
      variant: {
        default: "border-border/40",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

// Add a new prop to the CardProps interface to identify when the card is used for elections
interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  isHoverable?: boolean
  isUserCreateCard?: boolean
  isAdminProfileCard?: boolean
  isElectionCard?: boolean // Add this new prop
  userRole?: string // Add this prop to pass the user role
  href?: string // Add href prop to make the card clickable
}

// Update the Card component to handle the election card case
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      isHoverable = false,
      isUserCreateCard = false,
      isAdminProfileCard = false,
      isElectionCard = false, // Add this new prop
      userRole = "voter", // Default to voter
      href, // href prop
      ...props
    },
    ref,
  ) => {
    const hoverableClasses = isHoverable
      ? "hover:shadow-lg hover:border-primary/30 hover:translate-y-[-2px] transition-all duration-300"
      : ""

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), hoverableClasses, "pb-4 overflow-hidden", className)}
        {...props}
      />
    )
  },
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-5 sm:p-6 border-b border-border/10",
        "bg-gradient-to-r from-background/80 to-background",
        "font-krona",
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-4xl font-bold leading-tight tracking-tight", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-xs text-muted-foreground/90", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-4 mt-2 sm:p-6 sm:pt-4 sm:mt-2", className)} {...props} />
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
