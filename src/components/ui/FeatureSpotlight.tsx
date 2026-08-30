import type { ReactNode } from 'react'
import { forwardRef } from 'react'

import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'

/**
 * Two-column spotlight: eyebrow, heading, description and a CTA against a
 * visual.
 *
 * Ported from a shadcn component. `@/lib/utils` became `@/lib/cn`; shadcn's
 * Button became the site's, which is an anchor, so the original's
 * `buttonProps.onClick` is `buttonHref` here; the `tailwindcss-animate`
 * entrance utilities became `Reveal`, which triggers on entry rather than on
 * mount; and the shadcn theme tokens became the site's surface and ink tokens.
 */

type Props = {
  preheaderIcon?: ReactNode
  preheaderText: string
  heading: ReactNode
  description: string
  buttonText: string
  buttonHref: string
  imageUrl: string
  imageAlt?: string
  className?: string
}

export const FeatureSpotlight = forwardRef<HTMLDivElement, Props>(function FeatureSpotlight(
  {
    className,
    preheaderIcon,
    preheaderText,
    heading,
    description,
    buttonText,
    buttonHref,
    imageUrl,
    imageAlt = 'Feature illustration',
  },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('overflow-clip rounded-[2.5rem] bg-surface px-6 py-10 sm:px-12 sm:py-14', className)}
    >
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="flex flex-col items-start">
          <Reveal>
            <p className="text-eyebrow flex items-center gap-2 text-teal-deep">
              {preheaderIcon}
              <span>{preheaderText}</span>
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h3 className="text-section mt-5">{heading}</h3>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="text-lead mt-6 max-w-[34rem] text-ink-soft">{description}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9">
              <Button href={buttonHref} size="lg">
                {buttonText}
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="flex justify-center md:justify-end">
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
            // Height-based, like every other phone screenshot here: these are
            // squares with transparent side margins, so sizing by width draws
            // them roughly half the intended size.
            className="h-[20rem] w-auto max-w-none sm:h-[24rem] lg:h-[28rem]"
          />
        </Reveal>
      </div>
    </div>
  )
})
