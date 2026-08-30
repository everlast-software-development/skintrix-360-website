import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import { VIEWPORT, fadeUp, stagger } from '@/lib/motion'

/**
 * Section 04 — the plan, as an asymmetric editorial spread.
 *
 * The screen deliberately runs off the right edge of the page rather than
 * sitting centred in a container. That overflow is the composition: it is the
 * only place on the page where a visual breaks its bounds, which is what stops
 * this reading as another framed product shot.
 *
 * Content is My Skincare Plan, with the remaining everyday capabilities —
 * calendar, compatibility, consultations — carried underneath as a plain run
 * of text rather than a card grid.
 *
 * Clipped with `overflow-clip`, not `overflow-hidden`. Both hide the bleed, but
 * `hidden` also makes the section a scroll container, so anything that scrolls
 * an element into view — tabbing to a link, an anchor jump — scrolled the
 * section sideways to reveal the overflowing image and dragged the whole text
 * column ~107px off the shell's left edge with it. `clip` cannot scroll.
 */

const ALSO = [
  { k: 'My Calendar', d: 'The routine laid out day by day.' },
  { k: 'Product Skin Compatibility', d: 'Check a product against your own profile.' },
  { k: 'My Consultations', d: 'A professional in the loop when you want one.' },
]

export function WhySkinTrix() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [70, -70])

  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="section-y relative overflow-clip bg-canvas"
    >
      <div className="shell">
        <div ref={ref} className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-10">
          <div>
            <Reveal>
              <p className="text-eyebrow text-teal-deep">My Skincare Plan</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 id="why-heading" className="text-section mt-5">
                A routine built
                <br />
                around your skin.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-lead mt-6 max-w-[30rem] text-ink-soft">
                Your analysis becomes an AI-generated routine — regenerated whenever a new scan
                says something has changed.
              </p>
            </Reveal>

            <m.dl
              className="mt-12 space-y-6"
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              variants={stagger(0.08)}
            >
              {ALSO.map((a) => (
                <m.div
                  key={a.k}
                  variants={fadeUp}
                  className="grid gap-1 border-t border-[color:rgb(16_42_67_/_0.14)] pt-4 sm:grid-cols-[15rem_1fr] sm:gap-6"
                >
                  <dt className="text-[1rem] font-semibold tracking-[-0.02em]">{a.k}</dt>
                  <dd className="text-[0.9375rem] leading-[1.7] text-ink-soft">{a.d}</dd>
                </m.div>
              ))}
            </m.dl>
          </div>

          {/* Runs off the right edge on purpose — the negative margin is what
              makes the spread asymmetric instead of a tidy two-column box. */}
          <m.div
            style={reduced ? undefined : { y }}
            className="relative flex justify-center lg:-mr-[18vw] lg:justify-end"
          >
            <img
              src="/screen-2.webp"
              alt="The SkinTrix360 app showing an AI-generated skincare plan with a morning routine of cleanser, serum and supplements"
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-[26rem] w-auto max-w-none sm:h-[34rem] lg:h-[42rem]"
            />
          </m.div>
        </div>
      </div>
    </section>
  )
}
