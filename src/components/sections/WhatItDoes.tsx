import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import { WHAT } from '@/lib/site'
import { useTextReveal } from '@/hooks/useTextReveal'

/**
 * The split scene after the hero: the subject on the left, the writing on a
 * quiet lavender field to the right, and the three concepts in an editorial
 * row beneath.
 *
 * The rule and the wordmark are driven by a panel-scoped `useScroll` rather
 * than the section's, so they resolve as the panel itself arrives rather than
 * being tied to where the tall section as a whole sits in the viewport.
 */

/**
 * Read-outs placed over the portrait.
 *
 * `x`/`y` are percentages of the RENDERED image box, measured from its top
 * left — not of the source file. The image is `object-cover`, so the crop
 * moves with the container: both the desktop column and the stacked mobile
 * band are taller than they are wide, which means the full height of the
 * photograph is always shown and only the sides are trimmed. That is why one
 * pair of coordinates holds at every breakpoint.
 *
 * Where they land on the face:
 *   Texture   (30%, 34%) — the cheekbone, just below and outside the eye
 *   Hydration (40%, 56%) — the cheek beside the corner of the mouth
 *
 * `y` is the reliable axis; `x` drifts a little as the side crop changes, so
 * keep points away from the edge of the face when moving them.
 */
const READS = [
  { id: 'texture', label: 'Texture', x: 30, y: 34 },
  { id: 'hydration', label: 'Hydration', x: 40, y: 56 },
]

export function WhatItDoes() {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.06, 1])
  const imgY = useTransform(scrollYProgress, [0, 1], ['-2%', '2%'])

  /** One opacity ramp per read-out, staggered across the section's progress. */
  const labelA = useTransform(scrollYProgress, [0.16, 0.28], [0, 1])
  const labelB = useTransform(scrollYProgress, [0.24, 0.36], [0, 1])
  const labelAnim = [labelA, labelB]

  const { scrollYProgress: panelRaw } = useScroll({
    target: panelRef,
    offset: ['start 0.9', 'center 0.55'],
  })
  const panelP = useSpring(panelRaw, { stiffness: 210, damping: 40, mass: 0.35 })
  const ruleScale = useTransform(panelP, [0.1, 0.7], [0, 1])
  const markOpacity = useTransform(panelP, [0.45, 0.9], [0, 1])

  /** Reduced motion holds the composed end state; nothing scrubs. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const still = (v: unknown, fallback: unknown): any => (reduced ? fallback : v)

  return (
    <section
      ref={sectionRef}
      id="what"
      aria-labelledby="what-heading"
      className="section-y relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      <div className="shell">
        <div className="mx-auto max-w-[80rem] overflow-hidden rounded-[2rem]">
          <div className="grid lg:grid-cols-[1fr_1fr]">

            {/* ── Left: the subject, read. */}
            <div className="relative overflow-hidden">
              <m.img
                src="/image.jpg"
                alt="A close-up portrait of a woman's face, skin shown in fine detail"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ scale: still(imgScale, 1), y: still(imgY, '0%') }}
                className="block aspect-[4/5] w-full origin-center object-cover object-[58%_38%] will-change-transform lg:aspect-auto lg:h-full"
              />

              {/* A soft directional wash. The frosted pills carry white text,
                  and this is what keeps them legible where the crop puts them
                  over bright skin rather than shadow. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(105deg, rgb(20 32 38 / 0.30) 0%, rgb(20 32 38 / 0.09) 38%, transparent 68%)',
                }}
              />

              {READS.map((r, i) => (
                <m.span
                  key={r.id}
                  className="absolute flex items-center"
                  style={{
                    left: `${r.x}%`,
                    top: `${r.y}%`,
                    opacity: still(labelAnim[i], 1),
                  }}
                >
                  {/* dot → leader → plate. The leader is what ties the label
                      to the point it names; without it the pill reads as
                      chrome floating over the photograph. */}
                  <span
                    aria-hidden
                    className="block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: 'var(--teal)',
                      boxShadow: '0 0 0 2px rgb(255 255 255 / 0.7)',
                    }}
                  />
                  <span
                    aria-hidden
                    className="block h-px w-8 shrink-0 sm:w-12"
                    style={{ background: 'rgb(255 255 255 / 0.55)' }}
                  />
                  <span
                    className="type-eyebrow ink-invert rounded-full border px-3 py-1.5 whitespace-nowrap backdrop-blur-md"
                    style={{
                      borderColor: 'rgb(255 255 255 / 0.3)',
                      background: 'rgb(255 255 255 / 0.15)',
                    }}
                  >
                    {r.label}
                  </span>
                </m.span>
              ))}
            </div>

            {/* ── Right: the writing, on a quiet tint. */}
            <div
              ref={panelRef}
              className="relative flex flex-col items-center px-8 py-14 text-center sm:px-12 sm:py-16 lg:px-14 lg:py-20"
              // A field, not a whisper: the reference's right half is clearly
              // its own surface. Indigo pulled back toward white so it still
              // belongs to the icon palette.
              style={{ background: '#F1F0FB' }}
            >
              {/* The block fade this used to sit in is gone: the words carry
                  the reveal now, and running both made one motion inside
                  another. */}
              <h2
                ref={headingRef}
                id="what-heading"
                className="text-section measure-header text-balance"
              >
                {WHAT.headline[0]}
                <br />
                {WHAT.headline[1]}
              </h2>

              {/* Plain, fully opaque text. This used `ScrollHighlightText`,
                  which ramps each word from 0.22 to 1 opacity as the section
                  scrolls — at rest that left the tail of the paragraph greyed
                  out and reading as a rendering fault rather than an effect. */}
              <Reveal delay={0.08}>
                <p className="text-lead mt-6 max-w-[32rem]">
                  {WHAT.lead}
                </p>
              </Reveal>

              {/* The rule descending the panel, as in the reference. */}
              <m.span
                aria-hidden
                className="mt-12 block w-px flex-1 origin-top"
                style={{
                  minHeight: '4rem',
                  backgroundImage: 'var(--icon-gradient)',
                  scaleY: still(ruleScale, 1),
                  opacity: 0.5,
                }}
              />

              {/* The wordmark, surfacing quietly at the foot of the panel. */}
              <m.p
                className="mt-12 text-[clamp(2rem,3.8vw,3rem)] leading-none font-bold tracking-[-0.03em]"
                style={{ opacity: still(markOpacity, 1), color: 'var(--ink)' }}
              >
                SkinTrix<span style={{ color: 'var(--teal)' }}>360</span>
              </m.p>
            </div>
          </div>
        </div>

        {/* The three concepts, as an equal row beneath the scene.

            Two things make them match. The gap is now a single `gap` value:
            the columns previously carried `pr-10` on the first and `pl-10` on
            the rest, so the space between 1–2 was double the space between
            2–3. And each card is a flex column stretched to the row's height,
            so the shortest and longest bodies end on the same baseline
            instead of leaving a ragged bottom edge. */}
        <ol className="mt-16 grid items-stretch gap-10 md:mt-20 md:grid-cols-3 md:gap-12">
          {WHAT.points.map((point, i) => (
            <Reveal as="li" key={point.title} delay={i * 0.08} className="h-full">
              {/* A hairline rule rather than a boxed card: the columns are one
                  row of three, and a top border states that without enclosing
                  each one. `h-full` on a stretched grid item still holds them
                  to a common height, so the rules align across the row. */}
              <div className="flex h-full flex-col border-t border-hairline pt-8">
                <p className="text-eyebrow">{`0${i + 1}`}</p>
                <h3 className="type-h3 mt-4">
                  {point.title}
                </h3>
                <p className="type-body mt-3">{point.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
