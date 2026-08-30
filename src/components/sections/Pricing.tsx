import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { LuCheck, LuStar } from 'react-icons/lu'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { EASE } from '@/lib/motion'
import { SITE } from '@/lib/site'

/**
 * Pricing — the four plans the app actually sells.
 *
 * Content is transcribed from the in-app "Choose Your Plan" screens: names,
 * blurbs, prices, token allowances, badges, CTA labels and order. Nothing is
 * invented, and where a figure wasn't on those screens it isn't shown.
 *
 * Two things worth knowing about the data:
 *  - Pro's annual figure matches Plus's exactly (EGP 8,999.99). Against Pro's
 *    monthly rate that is a ~75% discount, not the ~17% the switch advertises,
 *    so it looks like an error in the app. It is reproduced as-is here.
 *  - Unlimited had no annual price on those screens, so it stays monthly in
 *    both views and says so.
 *
 * The layout is ported from a shadcn pricing block — centred heading, switch,
 * a fanned row of cards with the popular one lifted forward,
 * corner star badge, price over "billed …", checked feature list, rule, full
 * width CTA, blurb beneath. Adapted rather than copied; see the notes on the
 * component below.
 */

type Price = { amount: string; period: string }

type Plan = {
  id: string
  name: string
  blurb: string
  monthly: Price
  /** Null when the app screens showed no annual rate for this plan. */
  annual: Price | null
  tokens: string
  cta: string
  badge?: string
  featured?: boolean
  /** Free is not billed on a cycle, so it skips the "billed …" line. */
  unbilled?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'Perfect for exploring AI skincare',
    monthly: { amount: '$0', period: 'forever' },
    annual: { amount: '$0', period: 'forever' },
    tokens: '5 AI tokens per month',
    cta: 'Continue for Free',
    unbilled: true,
  },
  {
    id: 'plus',
    name: 'Plus',
    blurb: 'Enhanced tools for skincare enthusiasts',
    monthly: { amount: 'EGP 899.99', period: '/ month' },
    annual: { amount: 'EGP 8,999.99', period: '/ year' },
    tokens: '15 AI tokens per month',
    cta: 'Get Plus plan',
    badge: 'Popular',
    featured: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'Advanced AI for serious skincare routines',
    monthly: { amount: 'EGP 2,949.99', period: '/ month' },
    annual: { amount: 'EGP 8,999.99', period: '/ year' },
    tokens: '50 AI tokens per month',
    cta: 'Get Pro plan',
    badge: 'Best Value',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    blurb: 'Maximum power, zero restrictions',
    monthly: { amount: 'EGP 11,999.99', period: '/ month' },
    annual: null,
    tokens: 'Unlimited AI tokens per month',
    cta: 'Get Unlimited plan',
  },
]

export function Pricing() {
  const [isMonthly, setIsMonthly] = useState(true)
  // 1024px, not 768: the fan assumes a single row of four, which is only
  // true from `lg`. At tablet the grid is 2-up and the rotation made the
  // cards lean into each other.
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const reduced = useReducedMotion()

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="section-y relative" style={{ background: 'var(--atm-blue)' }}>
      <div className="shell">
        <div className="mx-auto max-w-[46rem] space-y-4 text-center">
          <p className="text-eyebrow text-teal-deep">Pricing</p>
          <h2 id="pricing-heading" className="text-statement">
            Choose the plan that fits your skin journey.
          </h2>
          <p className="text-[1.0625rem] leading-[1.75] text-ink-soft">
            Start understanding your skin with AI-powered insights and personalized skin
            intelligence.
          </p>
          <p className="text-[0.875rem] leading-none text-ink-muted">
            Upgrade anytime · Cancel anytime
          </p>
        </div>

        {/* Switch. Built here rather than pulled from Radix — the primitive
            would be a new dependency for one control that is a button with
            `role="switch"`. */}
        <div className="mt-10 mb-12 flex items-center justify-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={!isMonthly}
            aria-label="Bill annually"
            onClick={() => setIsMonthly((v) => !v)}
            className={cn(
              'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors duration-300',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]',
              !isMonthly ? 'bg-[color:var(--color-primary)]' : 'bg-[#DDDFE3]',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'block h-5 w-5 rounded-full bg-surface transition-transform duration-300',
                !isMonthly ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
          <span className="text-[0.9375rem] leading-none font-semibold">
            Annual billing <span className="text-teal-deep">(Save ~17%)</span>
          </span>
        </div>

        {/* Perspective lives on the row so the outer cards' Y-rotation reads
            as depth rather than a flat squash. */}
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: '1200px' }}
        >
          {PLANS.map((plan, index) => {
            const price = !isMonthly ? (plan.annual ?? plan.monthly) : plan.monthly
            const noAnnual = !isMonthly && !plan.annual
            // The source fans a row of three; with four plans the outermost
            // pair swings back and the popular one comes forward.
            const isLeftEdge = index === 0
            const isRightEdge = index === PLANS.length - 1
            const isEdge = isLeftEdge || isRightEdge

            return (
              <m.div
                key={plan.id}
                initial={reduced ? false : { y: 50, opacity: 0 }}
                whileInView={
                  isDesktop && !reduced
                    ? {
                        y: plan.featured ? -20 : 0,
                        opacity: 1,
                        x: isRightEdge ? -30 : isLeftEdge ? 30 : 0,
                        scale: isEdge ? 0.94 : 1,
                        rotateY: isLeftEdge ? 10 : isRightEdge ? -10 : 0,
                      }
                    : { y: 0, opacity: 1 }
                }
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: reduced ? 0 : index * 0.08, ease: EASE }}
                className={cn(
                  'relative flex flex-col rounded-2xl bg-surface p-6 text-center',
                  plan.featured
                    ? 'border-2 border-[color:var(--brand-teal)] bg-[color:var(--brand-teal-50)]'
                    : 'mt-5 border border-[color:rgb(9_24_56_/_0.1)]',
                  isLeftEdge && 'origin-right',
                  isRightEdge && 'origin-left',
                )}
              >
                {plan.badge && (
                  <div
                    className={cn(
                      'absolute top-0 right-0 flex items-center gap-1 rounded-tr-xl rounded-bl-xl px-2 py-0.5',
                      plan.featured
                        ? 'bg-[color:var(--brand-teal)]'
                        : 'bg-[color:var(--brand-navy-50)]',
                    )}
                  >
                    <LuStar
                      aria-hidden
                      className={cn(
                        'h-4 w-4',
                        plan.featured
                          ? 'fill-[color:var(--brand-navy)] text-[color:var(--brand-navy)]'
                          : 'fill-ink-muted text-ink-muted',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[0.8125rem] leading-none font-semibold',
                        plan.featured ? 'text-[color:var(--brand-navy)]' : 'text-ink-soft',
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex flex-1 flex-col">
                  <p className="text-[1rem] leading-none font-semibold text-ink-muted">
                    {plan.name}
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline justify-center gap-x-2">
                    {/* The source animates the digits with NumberFlow. These
                        prices carry mixed currencies and a non-numeric
                        "forever", so the whole figure crossfades instead —
                        same read, no extra dependency. */}
                    <AnimatePresence mode="wait" initial={false}>
                      <m.span
                        key={`${plan.id}-${isMonthly ? 'm' : 'a'}`}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduced ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="text-[2rem] leading-none font-medium tracking-tight tabular-nums"
                      >
                        {price.amount}
                      </m.span>
                    </AnimatePresence>
                    <span className="text-[0.875rem] leading-6 font-semibold tracking-wide text-ink-muted">
                      {price.period}
                    </span>
                  </div>

                  <p className="mt-1 min-h-[1.25rem] text-[0.75rem] leading-5 text-ink-muted">
                    {plan.unbilled ? '' : noAnnual ? 'billed monthly' : isMonthly ? 'billed monthly' : 'billed annually'}
                  </p>

                  <ul className="mt-5 flex flex-col gap-2">
                    <li className="flex items-start gap-2">
                      <LuCheck
                        aria-hidden
                        className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-primary)]"
                      />
                      <span className="text-left text-[0.9375rem] leading-[1.5] text-ink-soft">
                        {plan.tokens}
                      </span>
                    </li>
                  </ul>

                  <hr className="my-4 w-full border-ink-line" />

                  {/* This section keeps its own CTA rather than the shared
                      button: full-width, its own padding, and a ring-offset
                      hover the shared component does not have. */}
                  <a
                    href={SITE.appStoreUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={cn(
                      'group relative mt-auto w-full overflow-hidden rounded-xl border px-4 py-2.5 text-center text-[1.0625rem] leading-7 font-semibold tracking-tight',
                      'transform-gpu transition-all duration-300 ease-out hover:bg-[color:var(--brand-teal)] hover:text-white hover:ring-2 hover:ring-[color:var(--brand-teal)] hover:ring-offset-1',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]',
                      plan.featured
                        ? 'border-[color:var(--brand-teal)] bg-[color:var(--brand-teal)] text-white'
                        : 'border-[color:var(--color-hairline)] bg-surface text-ink',
                    )}
                  >
                    {plan.cta}
                  </a>

                  <p className="mt-6 text-[0.75rem] leading-5 text-ink-muted">{plan.blurb}</p>
                </div>
              </m.div>
            )
          })}
        </div>

        <p className="mt-10 text-center text-[0.8125rem] leading-[1.6] text-ink-muted">
          Subscriptions are managed through the app store.
          <a href={SITE.privacyUrl} className="ml-1 underline underline-offset-4 hover:text-ink-soft">
            Privacy Policy
          </a>
        </p>
      </div>
    </section>
  )
}
