import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { LuCamera, LuCircleCheckBig, LuLock, LuShield } from 'react-icons/lu'

import { Button } from '@/components/ui/Button'
import { EASE } from '@/lib/motion'
import { SITE } from '@/lib/site'

/**
 * GetStarted — the page's closing call to action.
 *
 * Ported from supplied markup, with three changes that were not stylistic:
 *
 *  - "tailored product recommendations" and "Products & routine" became
 *    active ingredients. SkinTrix analyses skin and recommends actives; it
 *    does not recommend products, and the page must not say it does.
 *  - The primary action was "Upload Photo & Get Analysis". There is no upload
 *    on this site — scanning happens in the app — so a button offering it
 *    would be a control that cannot do what it says. It now opens the app.
 *  - The stock-photo avatar stack and "Joined by 40,000+ users" are omitted;
 *    see the note in the handover. Nothing here asserts a figure.
 */

const STEPS = [
  { n: '1', title: 'Take selfie', note: 'Or upload a photo' },
  { n: '2', title: 'AI analysis', note: 'Computer vision scan' },
  { n: '3', title: 'Get results', note: 'Detailed skin report' },
  { n: '4', title: 'Recommendations', note: 'Active ingredients & routine' },
] as const

const TRUST = [
  { label: 'Private & secure', Icon: LuShield },
  { label: 'Your data stays yours', Icon: LuLock },
] as const

const CHECKS = [
  'Free scan available',
  'Private analysis',
  'Insights from every scan',
  'Active-ingredient guidance',
] as const

/** The three-dot "working" indicator from the source. */
function Working({ reduced }: { reduced: boolean }) {
  return (
    <div
      aria-hidden
      className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#F0F1F3] px-4 py-2.5"
    >
      <span className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-teal-deep"
            animate={reduced ? undefined : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </span>
      <span className="text-[0.8125rem] leading-none font-medium text-ink-soft">
        Ready when you are
      </span>
    </div>
  )
}

export function GetStarted() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const show = reduced || inView

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.7, delay: reduced ? 0 : delay, ease: EASE },
  })

  return (
    <section
      id="download"
      aria-labelledby="get-started-heading"
      className="relative w-full overflow-hidden py-[clamp(4.5rem,8vw,7rem)]" style={{ background: 'var(--bg)' }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-[6%] left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(22_184_176_/_0.16),transparent_68%)] blur-3xl" />
        <span className="absolute right-[6%] bottom-[4%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgb(90_98_214_/_0.10),transparent_70%)] blur-3xl" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-[64rem] px-4 sm:px-6">
        <m.div
          className="relative rounded-[1.75rem] bg-surface/90 p-8 ring-1 ring-[color:rgb(9_24_56_/_0.08)] backdrop-blur-md md:p-12"
          {...rise(0)}
        >
          <div className="text-center">
            <m.p
              className="text-eyebrow mb-5 inline-flex items-center rounded-full border border-[color:rgb(9_24_56_/_0.12)] px-3 py-1.5 text-ink-soft"
              {...rise(0.04)}
            >
              Get started now
            </m.p>

            <m.h2 id="get-started-heading" className="text-statement" {...rise(0.08)}>
              Ready to understand your skin?
            </m.h2>

            <m.p
              className="mx-auto mt-6 max-w-[42rem] text-[1.0625rem] leading-[1.75] text-ink-soft"
              {...rise(0.14)}
            >
              Get a personalized skin analysis and tailored active-ingredient recommendations in
              just minutes. Start your journey to healthier, more radiant skin today.
            </m.p>

            <div className="mx-auto mt-10 grid max-w-[48rem] grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {STEPS.map((s, i) => (
                <m.div
                  key={s.n}
                  className="rounded-2xl bg-[#F0F1F3] p-4 text-center"
                  {...rise(0.2 + i * 0.06)}
                >
                  <span
                    aria-hidden
                    className="mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-full bg-[color:rgb(22_184_176_/_0.12)] text-[0.9375rem] font-bold text-teal-deep"
                  >
                    {s.n}
                  </span>
                  <h3 className="text-[0.875rem] leading-tight font-semibold">{s.title}</h3>
                  <p className="mt-1 text-[0.75rem] leading-tight text-ink-muted">{s.note}</p>
                </m.div>
              ))}
            </div>

            {/* Primary action. Opens the app — see the note at the top. */}
            <m.div className="mt-10 flex flex-col items-center gap-2.5" {...rise(0.46)}>
              <Button href={SITE.appStoreUrl} external size="lg">
                <LuCamera aria-hidden className="h-5 w-5" />
                Start your skin analysis
              </Button>
              <span className="text-[0.75rem] leading-none text-ink-muted">
                No registration required. Your first scan takes seconds.
              </span>
            </m.div>

            <m.div className="mt-10" {...rise(0.52)}>
              <Working reduced={reduced} />
            </m.div>

            <m.div className="mt-10 flex flex-wrap justify-center gap-3" {...rise(0.58)}>
              {TRUST.map((t) => (
                <span
                  key={t.label}
                  className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 ring-1 ring-[color:rgb(9_24_56_/_0.07)]"
                >
                  <t.Icon aria-hidden className="h-4 w-4 text-teal-deep" />
                  <span className="text-[0.875rem] font-medium">{t.label}</span>
                </span>
              ))}
              <a
                href={SITE.privacyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 ring-1 ring-[color:rgb(9_24_56_/_0.07)] transition-colors hover:text-teal-deep"
              >
                <LuLock aria-hidden className="h-4 w-4 text-teal-deep" />
                <span className="text-[0.875rem] font-medium">Privacy policy</span>
              </a>
            </m.div>

            <m.div
              className="mx-auto mt-8 flex max-w-[42rem] flex-wrap justify-center gap-x-5 gap-y-2.5"
              {...rise(0.64)}
            >
              {CHECKS.map((c) => (
                <span key={c} className="flex items-center gap-1.5">
                  <LuCircleCheckBig aria-hidden className="h-4 w-4 shrink-0 text-[#1FA45C]" />
                  <span className="text-[0.875rem] text-ink-soft">{c}</span>
                </span>
              ))}
            </m.div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
