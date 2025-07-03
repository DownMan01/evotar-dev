import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background/95 text-foreground border-primary/20 border-l-primary",
        destructive:
          "border-destructive/30 text-destructive dark:border-destructive [&>svg]:text-destructive bg-destructive/10 dark:bg-destructive/20",
        success:
          "border-green-500/30 text-green-700 dark:text-green-400 border-l-green-500 bg-green-500/10 dark:bg-green-500/20 [&>svg]:text-green-500",
        warning:
          "border-amber-500/30 text-amber-700 dark:text-amber-400 border-l-amber-500 bg-amber-500/10 dark:bg-amber-500/20 [&>svg]:text-amber-500",
        info: "border-blue-500/30 text-blue-700 dark:text-blue-400 border-l-blue-500 bg-blue-500/10 dark:bg-blue-500/20 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }),
        "animate-in fade-in-50 slide-in-from-bottom-1 duration-300",
        "backdrop-blur-[2px] shadow-md",
        "flex items-center gap-3 border-l-4",
        "transition-all hover:shadow-lg",
        "z-[100]", // Significantly increased z-index
        "relative", // Ensure proper stacking context
        "my-2", // Add margin for better visibility
        "max-w-full", // Ensure full width
        "overflow-visible", // Prevent content from being cut off
        className,
      )}
      style={{
        position: "relative", // Reinforce positioning
        display: "flex", // Ensure flex display
        opacity: 1, // Force visibility
      }}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight text-base", className)} {...props} />
  ),
)
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)} {...props} />
  ),
)
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
