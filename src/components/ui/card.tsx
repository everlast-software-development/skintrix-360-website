import * as React from 'react'

import { cn } from '@/lib/cn'

/**
 * Card — the shadcn/ui API, restyled for this project.
 *
 * Two deliberate departures from the stock file, both forced by this codebase:
 *
 * 1. NO SHADCN COLOUR TOKENS. The stock base is
 *    `rounded-lg border bg-card text-card-foreground shadow-sm`, and
 *    `bg-card` / `text-card-foreground` / `--border` do not exist in this
 *    theme — the card would render transparent with a `currentColor` border.
 *    Defining that token layer globally would reach every other section, so
 *    the base uses the project's own palette instead.
 *
 * 2. NO CONFLICTING DEFAULTS. This project's `cn` is a plain join (see
 *    `src/lib/cn.ts`) — there is no `tailwind-merge`, so `cn('rounded-lg',
 *    'rounded-[22px]')` emits BOTH and the winner is whichever Tailwind
 *    happens to order later, not the caller's. The base therefore sets only
 *    what every card wants and leaves radius and padding to the caller.
 *
 * The look: white, a hairline that is barely there, and a shadow soft enough
 * to read as lift rather than as a drop shadow.
 */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        /* Borderless by design. With the outline gone, separation from the
           #F5F6FD ground has to come from the shadow alone, so it is a touch
           deeper than it was when a hairline shared the work. */
        'bg-white shadow-[0_1px_2px_rgba(10,37,64,0.04),0_14px_34px_-20px_rgba(10,37,64,0.16)]',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('leading-tight font-medium', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => <p ref={ref} className={cn(className)} {...props} />)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />,
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
