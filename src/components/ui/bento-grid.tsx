import * as React from 'react'
import { m, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'

/**
 * BentoGridShowcase — the supplied bento grid, adapted to this codebase.
 *
 * Four changes, each of which the component would not run without:
 *
 * 1. `m.*`, NOT `motion.*`. The app is wrapped in
 *    `<LazyMotion features={domAnimation} strict>` (see `App.tsx`), and under
 *    `strict` framer-motion THROWS on any `motion.*` component — the whole
 *    page would blank. `m` is the same component with the features supplied by
 *    the provider.
 *
 * 2. No `"use client"`. This is Vite, not Next.js; the directive is inert and
 *    only misleads the next reader.
 *
 * 3. `@/lib/utils` → `@/lib/cn`, which is where this project's helper lives.
 *
 * 4. `whileInView` instead of `animate`. The original animates on MOUNT, and
 *    this grid sits most of a page down — the stagger would finish long before
 *    anyone scrolled to it, so the effect was paid for and never seen. `once`
 *    keeps it from replaying.
 *
 * Breakpoint: `min-[769px]` rather than `md:`. Tailwind's `md:` is min-width
 * 768, so at exactly 768px — a real tablet width — the three columns would
 * engage and crush the cards; the rest of this codebase uses the explicit
 * boundary for the same reason.
 *
 * The layout, once it engages:
 *
 *     ┌─────────────┬─────────────┬─────────────┐
 *     │ integrations│             │ featureTags │
 *     ├─────────────┤ mainFeature ├─────────────┤
 *     │ secondary   │  (3 rows)   │             │
 *     ├─────────────┤             │  statistic  │
 *     │ journey     │             │  (2 rows)   │
 *     └─────────────┴─────────────┴─────────────┘
 *
 * which falls to one column, in DOM order, below the breakpoint.
 */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
} as const

interface BentoGridShowcaseProps {
  integrations: React.ReactNode
  featureTags: React.ReactNode
  mainFeature: React.ReactNode
  secondaryFeature: React.ReactNode
  statistic: React.ReactNode
  journey: React.ReactNode
  className?: string
}

export const BentoGridShowcase = ({
  integrations,
  featureTags,
  mainFeature,
  secondaryFeature,
  statistic,
  journey,
  className,
}: BentoGridShowcaseProps) => {
  const reduced = useReducedMotion() ?? false

  /* Under reduced motion the grid renders in its final state and never
     animates — `initial={false}` skips the hidden frame entirely, so there is
     no flash of empty cards. */
  const motionProps = reduced
    ? { initial: false as const }
    : {
        variants: containerVariants,
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, amount: 0.15 },
      }

  const item = reduced ? {} : { variants: itemVariants }

  return (
    <m.div
      {...motionProps}
      className={cn(
        'grid w-full grid-cols-1 gap-6',
        'min-[769px]:grid-cols-3 min-[769px]:grid-rows-3',
        'auto-rows-[minmax(200px,auto)]',
        className,
      )}
    >
      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-1">
        {integrations}
      </m.div>

      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-3">
        {mainFeature}
      </m.div>

      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-1">
        {featureTags}
      </m.div>

      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-1">
        {secondaryFeature}
      </m.div>

      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-2">
        {statistic}
      </m.div>

      <m.div {...item} className="min-[769px]:col-span-1 min-[769px]:row-span-1">
        {journey}
      </m.div>
    </m.div>
  )
}
