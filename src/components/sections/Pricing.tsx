import { useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import type { IconType } from 'react-icons'
import {
  LuCamera,
  LuCheck,
  LuCoins,
  LuGift,
  LuRefreshCw,
  LuShieldCheck,
  LuSparkles,
  LuSprayCan,
  LuStethoscope,
} from 'react-icons/lu'

import { EASE } from '@/lib/motion'
import { SITE } from '@/lib/site'
import { useTextReveal } from '@/hooks/useTextReveal'
import { FeatureTile } from '@/components/ui/FeatureTile'

/**
 * The four token-cost cells, in the app screen's order, each with the glyph
 * the app uses. `LuSprayCan` stands in for the app's product bottle — the
 * closest thing to a skincare container in the installed set; `LuFlaskConical`
 * reads as a lab and `LuMilk` as a carton.
 */
const CELL_ICONS: Record<string, IconType> = {
  'AI Skin Analysis': LuCamera,
  'Skincare Plan': LuSparkles,
  'Compatibility Check': LuSprayCan,
  'Expert Consultation': LuStethoscope,
}

/**
 * The trust row beneath the cards — four plain rows on the ground, no cards
 * and no borders, as the app screen has them.
 *
 * ALL FOUR GLYPHS ARE ONE COLOUR, `--pr-accent`. `Earn free tokens` used to
 * take the indigo `--token-icon` on the argument that it was about currency;
 * one odd glyph in a row of four reads as a mistake rather than as a
 * category, and the row has to read as a single group. There is no
 * per-item colour flag any more, so it cannot drift back.
 */
const TRUST: { Icon: IconType; title: string; body: string }[] = [
  {
    Icon: LuShieldCheck,
    title: 'Secure payment',
    body: 'Powered by Stripe. We never see your card details.',
  },
  {
    Icon: LuRefreshCw,
    title: 'Cancel anytime',
    body: 'Manage or cancel your plan in one tap from the Billing page.',
  },
  {
    Icon: LuSparkles,
    title: 'Instant access',
    body: 'Your new plan and tokens unlock immediately after checkout.',
  },
  {
    Icon: LuGift,
    title: 'Earn free tokens',
    body: 'Refer friends or enter a promo code for permanent bonus tokens.',
  },
]
/**
 * Pricing — the four plans the app actually sells.
 *
 * Names, blurbs, prices, token allowances, badges and CTA labels are the real
 * plan data, in USD. Nothing here is computed: the yearly per-month figures
 * are the exact values the app displays, NOT `annual / 12`, because that is
 * what a customer sees on the plan screen and a rounding difference between
 * the two would be a pricing error.
 *
 * PRICES ARE A COMMERCIAL FACT. Every figure on this section comes from
 * `PRICING` below and nowhere else, so there is one place to correct them.
 *
 * The layout is ported from a shadcn pricing block — centred heading, switch,
 * a fanned row of cards with the popular one lifted forward, corner star
 * badge, price over the billed line, checked feature list, rule, full width
 * CTA, blurb beneath.
 */

/**
 * THE SINGLE SOURCE OF PRICES.
 *
 * `monthly` / `yearlyPerMonth` are both per-month figures — the switch
 * changes which one is shown, not how it is calculated. `billedYearly` is the
 * annual charge as the app words it, and is null for Free, which is not
 * billed at all.
 */
const PRICING = {
  free: { monthly: '$0', yearlyPerMonth: '$0', billedYearly: null, tokens: '5 tokens / month' },
  plus: { monthly: '$15.00', yearlyPerMonth: '$12.42', billedYearly: '$149.00 billed yearly', tokens: '20 tokens / month' },
  pro: { monthly: '$49.00', yearlyPerMonth: '$41.58', billedYearly: '$499.00 billed yearly', tokens: '65 tokens / month' },
  unlimited: { monthly: '$199.00', yearlyPerMonth: '$166.58', billedYearly: '$1,999.00 billed yearly', tokens: 'Unlimited tokens' },
} as const

/** What each action costs, as shown in the app. */
const TOKEN_COSTS = [
  { action: 'AI Skin Analysis', cost: '2 tokens' },
  { action: 'Skincare Plan', cost: '4 tokens' },
  { action: 'Compatibility Check', cost: '4 tokens' },
  { action: 'Expert Consultation', cost: '3 tokens' },
] as const

/**
 * Every plan unlocks every feature — the allowance is the only difference.
 *
 * ONE array, rendered by all four cards. Deliberately not per-plan: a list
 * that differed between cards, or greyed an item out on the cheaper ones,
 * would misrepresent what is being sold.
 */
const FEATURES = [
  'AI skin analysis with scored concerns',
  'Personalized skincare plan generator',
  'Product ingredient compatibility checker',
  'Expert consultation booking',
  'PDF report export + shareable link',
  'Progress tracking across scans',
  'Calendar reminders for your routine',
] as const

type Plan = {
  id: keyof typeof PRICING
  name: string
  blurb: string
  cta: string
  badge?: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    blurb: 'A monthly skin check-in to get started.',
    cta: 'Get started free',
  },
  {
    id: 'plus',
    name: 'Plus',
    blurb: 'Regular tracking for skincare enthusiasts.',
    cta: 'Get Plus',
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'Deep daily insights for serious routines.',
    cta: 'Get Pro',
    badge: 'Most popular',
    featured: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    blurb: 'No limits — for power users and clinics.',
    cta: 'Get Unlimited',
  },
]

export function Pricing() {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  const [isMonthly, setIsMonthly] = useState(true)
  const reduced = useReducedMotion()

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="section-y relative"
      style={{ background: 'var(--atm-blue)' }}
    >
      <div className="shell">
        {/* ── 1. header ────────────────────────────────────────────────── */}
        <div className="section-head">
          <FeatureTile
            group="planning"
            icon={LuCoins}
            name="Subscriptions"
          />

          <h2 ref={headingRef} id="pricing-heading" className="text-statement">
            AI-Powered Skin Intelligence Platform.
          </h2>

          <p className="text-lead mt-4">
            Every plan unlocks all features. The only difference is how many tokens you get
            per month.
          </p>
        </div>

        {/* ── 2. the billing toggle. One pill holding both labels, the
             switch and the savings badge. The control itself is still a
             plain button with `role="switch"`. ─────────────────────────── */}
        <div className="mt-9 flex justify-center">
          <div className="pr-toggle">
            <span className="pr-toggle-label" data-active={isMonthly}>
              Monthly
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={!isMonthly}
              aria-label="Bill yearly"
              onClick={() => setIsMonthly((v) => !v)}
              className="pr-switch"
            >
              <span aria-hidden className="pr-knob" />
            </button>

            <span className="pr-toggle-label" data-active={!isMonthly}>
              Yearly
            </span>

            <span className="pr-save">Save up to 17%</span>
          </div>
        </div>

        {/* ── 3. what each action costs ───────────────────────────────── */}
        {/* No max-width of its own: the cell row spans exactly the same
             width as the card row beneath it, as the reference has it. */}
        <div className="mt-12">
          <ul className="pr-cells">
            {TOKEN_COSTS.map((item) => {
              const Icon = CELL_ICONS[item.action]
              return (
                <li key={item.action} className="pr-cell">
                  <span aria-hidden className="pr-cell-icon">
                    <Icon />
                  </span>
                  <span className="pr-cell-name">{item.action}</span>
                  <span className="pr-cell-pill">
                    <LuCoins aria-hidden />
                    {item.cost}
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="pr-included">All included in every plan</p>
          <p className="pr-bonus">
            Bonus tokens from referrals and promo codes are permanent — they never expire or
            reset.
          </p>
        </div>

        {/* ── 4 + 5. the plan cards ───────────────────────────────────── */}
        <div className="pr-cards mt-12">
          {PLANS.map((plan, index) => {
            const money = PRICING[plan.id]
            /* Both branches are per-month figures held verbatim in PRICING —
               the switch picks one, it never divides the annual price. */
            const amount = isMonthly ? money.monthly : money.yearlyPerMonth
            /* A null `billedYearly` marks the plan that is not billed on a
               cycle at all, so Free shows no "/ mo" and no annual line. */
            const isFree = money.billedYearly === null
            const billedLine = isMonthly ? '' : (money.billedYearly ?? '')

            return (
              <m.div
                key={plan.id}
                className="pr-card"
                data-featured={plan.featured ? 'true' : 'false'}
                initial={reduced ? false : { y: 22, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: reduced ? 0 : index * 0.08, ease: EASE }}
              >
                {plan.badge && <span className="pr-popular">{plan.badge}</span>}

                <h3 className="pr-name">{plan.name}</h3>
                <p className="pr-desc">{plan.blurb}</p>

                <div className="pr-price-row">
                  {/* The whole figure crossfades rather than the digits
                      rolling: "Free" is not a number, so a digit animation
                      would have nothing to roll on one of the four cards. */}
                  <AnimatePresence mode="wait" initial={false}>
                    <m.span
                      key={`${plan.id}-${isMonthly ? 'm' : 'y'}`}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduced ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="pr-price"
                    >
                      {amount}
                    </m.span>
                  </AnimatePresence>
                  {!isFree && <span className="pr-per">/ mo</span>}
                </div>

                <p className="pr-billed">{billedLine}</p>

                <p className="pr-allowance">
                  <LuCoins aria-hidden />
                  {money.tokens}
                </p>

                {/* One shared list, identical on all four cards and nothing
                    greyed out: every plan really does unlock every feature. */}
                <ul className="pr-features">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="pr-feature">
                      <LuCheck aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pr-cta-wrap">
                  <a
                    href={SITE.appStoreUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="pr-cta"
                    /* A three-step ladder: the highlighted plan fills with
                       teal, the two mid tiers take a neutral fill, and Free —
                       the quietest thing on the row by design — stays an
                       outline. Three identical hollow buttons left the cards
                       looking unfinished and made Free look disabled. */
                    data-variant={
                      plan.featured ? 'filled' : plan.id === 'free' ? 'ghost' : 'secondary'
                    }
                  >
                    {plan.cta}
                  </a>
                </div>
              </m.div>
            )
          })}
        </div>

        {/* ── 6. the trust row ────────────────────────────────────────── */}
        <ul className="pr-trust">
          {TRUST.map((item) => (
            <li key={item.title} className="pr-trust-item">
              <item.Icon aria-hidden />
              <span>
                <span className="pr-trust-title block">{item.title}</span>
                <span className="pr-trust-body block">{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
