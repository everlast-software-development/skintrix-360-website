import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'quiet'
type Size = 'md' | 'lg'

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  external?: boolean
  /** Off by default; set true to add a trailing arrow. */
  arrow?: boolean
  onClick?: () => void
  'aria-label'?: string
}

/** Height lives on the pill itself; padding lives on `__wrap` so the gloss
 *  layers (clipped to `__wrap`) reach every edge of the pill, not just the
 *  padded content box. */
const sizes: Record<Size, { root: string; wrap: string }> = {
  md: { root: 'h-12 text-[0.9375rem]', wrap: 'px-6' },
  lg: { root: 'h-14 text-base', wrap: 'px-8' },
}

/**
 * The one SkinTrix360 button, everywhere: a glossy teal (or hairline white)
 * pill — adapted from a reference "Pearl Button" into the brand palette —
 * with no trailing arrow (opt in per button via `arrow`). All of the
 * gloss/highlight/hover-lift/press-dip mechanics live in `btn-glossy` in
 * `src/styles/index.css`; this component only ever supplies the size and
 * the primary/secondary color swap.
 */
export function Button({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  external,
  arrow,
  ...rest
}: ButtonProps) {
  const linkProps = {
    href,
    target: external ? '_blank' : undefined,
    rel: external ? 'noreferrer noopener' : undefined,
    ...rest,
  }

  if (variant === 'quiet') {
    return (
      <a
        {...linkProps}
        className={cn(
          'inline-flex items-center gap-2 font-semibold text-ink-soft transition-colors duration-300 hover:text-ink',
          className,
        )}
      >
        {children}
        {arrow === true && <span aria-hidden>↗</span>}
      </a>
    )
  }

  return (
    <a
      {...linkProps}
      className={cn(
        'btn-glossy inline-flex select-none font-semibold whitespace-nowrap',
        variant === 'secondary' && 'btn-glossy--secondary',
        sizes[size].root,
        className,
      )}
    >
      <span className={cn('btn-glossy__wrap', sizes[size].wrap)}>
        {/* `data-label` backs the `explore-wipe` fill's `::after` overlay
            (`content: attr(data-label)`) — inert for every other button. */}
        <span className="btn-glossy__label" data-label={typeof children === 'string' ? children : undefined}>
          {children}
        </span>
        {arrow === true && (
          <span className="btn-glossy__arrow" aria-hidden>
            ↗
          </span>
        )}
      </span>
    </a>
  )
}
