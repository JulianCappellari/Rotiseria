import * as React from "react"

import { cn } from "@/lib/utils"

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm"

type ButtonVariantOptions = {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive:
    "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
  outline:
    "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary:
    "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
}

const sizes: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  icon: "size-9",
  "icon-sm": "size-8",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
}

export function buttonVariants({
  className,
  size = "default",
  variant = "default",
}: ButtonVariantOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    variants[variant],
    sizes[size],
    className
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariantOptions & {
    asChild?: boolean
  }

function Button({
  asChild = false,
  children,
  className,
  size,
  type,
  variant,
  ...props
}: ButtonProps) {
  const classes = buttonVariants({ className, size, variant })

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<
      Record<string, unknown> & { className?: string }
    >

    return React.cloneElement(child, {
      ...(props as Record<string, unknown>),
      className: cn(classes, child.props.className),
    })
  }

  return (
    <button
      data-slot="button"
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
