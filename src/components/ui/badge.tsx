import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

/**
 * Badge — the shadcn/ui API with `cva`, restyled for this project.
 *
 * The stock variants point at `bg-primary` / `bg-secondary` / `bg-destructive`
 * and their `-foreground` pairs, none of which exist in this theme, so the
 * variants are re-expressed in the brand palette. `destructive` is gone: there
 * is nothing in this site for it to mean.
 *
 * `soft` is the one this section uses — a tinted pill with no hard border,
 * which is what "calm" looks like at this size.
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1EB9B7]',
  {
    variants: {
      variant: {
        /** Teal wash — the accent. */
        default: 'border-transparent bg-[#1EB9B7]/12 text-[#0F7A6D]',
        /** Soft indigo wash — the quieter second voice. */
        secondary: 'border-transparent bg-[#4C71CE]/10 text-[#3E5CAF]',
        /** Hairline only, for a badge that should recede. */
        outline: 'border-[#E2E5F2] bg-white/60 text-[#5A6B7B]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
