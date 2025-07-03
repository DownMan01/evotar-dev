import { forwardRef } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import type { LinkProps } from "next/link"

interface ButtonLinkProps extends ButtonProps {
  href: string
  external?: boolean
  linkProps?: Omit<LinkProps, "href">
}

const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant = "default", size = "default", href, external, children, linkProps, ...props }, ref) => {
    const linkClassName = cn(buttonVariants({ variant, size, className }))

    if (external) {
      return (
        <a href={href} className={linkClassName} ref={ref} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    }

    return (
      <Link href={href} className={cn(linkClassName, "text-foreground")} ref={ref} {...linkProps} {...props}>
        {children}
      </Link>
    )
  },
)
ButtonLink.displayName = "ButtonLink"

export { ButtonLink }
