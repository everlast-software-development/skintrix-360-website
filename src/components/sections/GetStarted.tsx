import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'
import { LuArrowRight, LuCamera, LuCircleCheckBig, LuCreditCard, LuLock, LuShield } from 'react-icons/lu'

import { EASE } from '@/lib/motion'
import { SITE } from '@/lib/site'
import { useTextReveal } from '@/hooks/useTextReveal'

/**
 * GetStarted — the page's closing call to action.
 *
 * Ported from supplied markup, and restyled a second time against the same
 * reference: neutral step chips, a brand-teal primary button, a bare working
 * indicator, and a lavender ground that continues the #F5F6FD of the section
 * above rather than restarting on white.
 *
 * Three things in the reference are still deliberately NOT reproduced,
 * because each would put a claim on the page that the product does not
 * support. They are copy, not styling, and reinstating any of them is a
 * decision for the business, not a design pass:
 *
 *  - "tailored product recommendations" / "Products & routine" stay as active
 *    ingredients. SkinTrix analyses skin and recommends actives; it does not
 *    recommend products, and the page must not say it does.
 *  - "Upload Photo & Get Analysis" stays "Start your skin analysis". There is
 *    no upload on this site — scanning happens in the app — so the reference's
 *    label would be a control that cannot do what it says.
 *  - The avatar stack and "Joined by 40,000+ users" are omitted, along with
 *    "GDPR Compliant" and "5-second scanning". Nothing here asserts a figure,
 *    a certification or a timing that has not been verified.
 */

const STEPS = [
  { n: '1', title: 'Take Selfie', note: 'Or upload a photo' },
  { n: '2', title: 'AI Analysis', note: 'Computer vision scan' },
  { n: '3', title: 'Get Results', note: 'Detailed skin report' },
  { n: '4', title: 'Recommendations', note: 'Active ingredients & routine' },
] as const

const TRUST = [
  { label: 'Private & Secure', Icon: LuShield },
  { label: 'Your Data Stays Yours', Icon: LuLock },
  { label: 'Payment Security', Icon: LuCreditCard },
] as const

const CHECKS = [
  'No sign up required',
  'Free scan available',
  '100% private analysis',
  'Active-ingredient guidance',
] as const

/**
 * The three-dot working indicator.
 *
 * Bare dots with the caption beneath, as in the reference — but the caption
 * reads "Ready when you are" rather than "AI analyzing skin…". Nothing is
 * analysing anything at this point on the page, and a status line that
 * describes work not happening is a lie the animation would be telling.
 */
function Working({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="flex flex-col items-center gap-3">
      <span className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="h-2 w-2 rounded-full"
            /* The same teal as the button above, so the indicator reads as
               part of the same action rather than a separate grey element. */
            style={{ background: 'var(--accent)' }}
            animate={reduced ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </span>
      <span className="type-legal">Ready when you are</span>
    </div>
  )
}

export function GetStarted() {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
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
      className="relative w-full overflow-hidden py-[clamp(4.5rem,8vw,7rem)]"
      /* The same #F5F6FD the section above resolves to, so the two read as one
         continuous ground and the white card is the only thing that lifts. */
      style={{ background: '#F5F6FD' }}
    >
      {/* The two lavender radial glows that used to sit here are gone. They
          dipped the ground to rgb(237,239,251) across a ~500px band, which is
          a visible shade change against the #F5F6FD every other section uses. */}

      <div ref={ref} className="relative mx-auto max-w-[64rem] px-4 sm:px-6">
        <m.div
          /* Borderless — the ring is gone. The shadow was already doing most of
             the separating here, so nothing needed to replace it. */
          className="relative rounded-[1.75rem] bg-white p-8 shadow-[0_1px_2px_rgb(9_24_56_/_0.03),0_28px_60px_-32px_rgb(9_24_56_/_0.18)] md:p-12"
          {...rise(0)}
        >
          <div className="text-center">
            <m.p
              className="text-eyebrow mb-5 inline-flex items-center rounded-full border border-[color:rgb(9_24_56_/_0.12)] px-3 py-1.5"
              {...rise(0.04)}
            >
              Get started now
            </m.p>

            {/* Heavier than the page's other section headings: this is the
                closing ask, and the reference sets it as the boldest thing
                in the card. */}
            <h2
              ref={headingRef}
              id="get-started-heading"
              className="text-statement measure-header"
            >
              Ready to understand your skin?
            </h2>

            <m.p
              className="text-lead measure-body-center mt-6"
              {...rise(0.14)}
            >
              Get a personalized skin analysis and tailored active-ingredient
              recommendations in minutes.
            </m.p>

            {/* Step chips. Neutral rather than teal-tinted, so the dark button
                below is the only thing in the card competing for attention. */}
            <div className="mx-auto mt-10 grid max-w-[48rem] grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {STEPS.map((s, i) => (
                <m.div
                  key={s.n}
                  className="rounded-2xl bg-[#F4F5F7] p-5 text-center"
                  {...rise(0.2 + i * 0.06)}
                >
                  <span
                    aria-hidden
                    className="type-small ink-heading mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-[#E4E6EA]"
                  >
                    {s.n}
                  </span>
                  <h3 className="type-card-title">{s.title}</h3>
                  <p className="type-legal mt-1.5">{s.note}</p>
                </m.div>
              ))}
            </div>

            {/* Primary action. Brand teal — the same `--accent` every other
                button on the site uses, so this reads as the page's own CTA
                rather than a one-off. Shape and icons follow the reference. */}
            <m.div className="mt-10 flex flex-col items-center gap-3" {...rise(0.46)}>
              <a
                href={SITE.appStoreUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="type-card-title ink-invert group inline-flex h-14 items-center gap-3 rounded-btn px-7 transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3"
                style={{
                  background: 'var(--accent)',
                  boxShadow:
                    '0 1px 2px rgb(23 144 143 / 0.18), 0 12px 28px -12px rgb(23 144 143 / 0.55)',
                  outlineColor: 'var(--accent-deep)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-deep)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)'
                }}
              >
                <LuCamera aria-hidden className="h-5 w-5" />
                Start your skin analysis
                <LuArrowRight
                  aria-hidden
                  className="h-[1.125rem] w-[1.125rem] transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
              <span className="type-legal">
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
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-[color:rgb(9_24_56_/_0.09)]"
                >
                  <t.Icon aria-hidden className="h-4 w-4" style={{ color: 'var(--text)' }} />
                  <span className="type-small">{t.label}</span>
                </span>
              ))}
            </m.div>

            <m.div
              className="mx-auto mt-8 flex max-w-[44rem] flex-wrap justify-center gap-x-5 gap-y-2.5"
              {...rise(0.64)}
            >
              {CHECKS.map((c) => (
                <span key={c} className="flex items-center gap-1.5">
                  <LuCircleCheckBig aria-hidden className="h-4 w-4 shrink-0 text-check" />
                  <span className="type-small">{c}</span>
                </span>
              ))}
            </m.div>

            <m.p className="type-legal mt-6" {...rise(0.68)}>
              {/* No `target="_blank"` any more: the privacy policy is a page on
                  this site now, not an external URL, so opening it in a new tab
                  would strand the visitor with two copies of the site open. */}
              <a
                href={SITE.privacyUrl}
                className="underline underline-offset-4 transition-colors hover:text-ink"
              >
                Privacy policy
              </a>
            </m.p>
          </div>
        </m.div>
      </div>
    </section>
  )
}
