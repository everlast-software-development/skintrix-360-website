import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'

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
 *
 * ≤768px IS THE EXCEPTION. There the photo sits in a 4:3 box (3:2 at ≤480),
 * WIDER than tall, so the crop flips: the full width shows and the top and
 * bottom are trimmed around `object-position: center 30%`. `x`/`y` no longer
 * hold, so `m` carries the same two landmarks re-expressed for those boxes.
 * They are the points the pins already hit on the old 4:5 mobile crop — in
 * source-image fractions, Texture (0.367, 0.366) and Hydration (0.447, 0.586):
 *
 *   x% = sx                                  (no side crop)
 *   y% = sy * a - (a - 1) * 0.30 - 0.8       (a = box width / height)
 *
 * The -0.8 is the image's parallax overscan there: it is 104% of the box tall
 * and lifted 2%, which moves the crop up by 0.8% of the box.
 *
 * `m` values are where the DOT'S CENTRE lands; the calc() below backs the
 * pin's box off by half the dot (5px) and half the pill (12.5px) to get there.
 */
const READS = [
  { id: 'texture', label: 'Texture', x: 30, y: 34, m: { x: 36.7, y43: 38.0, y32: 39.1 } },
  { id: 'hydration', label: 'Hydration', x: 40, y: 56, m: { x: 44.7, y43: 67.3, y32: 72.1 } },
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
          <div className="grid min-[770px]:grid-cols-[1fr_1fr]">

            {/* ── Left: the subject, read.

                ≤768px: SECOND, visually. `order` only — the DOM stays image
                then text at every width, so screen-reader order never changes.
                The flip keeps this photo from landing directly under the
                hero's film. The box is also shortened there to a fixed 4:3
                (3:2 at ≤480), cropped around the face. */}
            <div className="relative overflow-hidden max-[769px]:order-2 max-[769px]:aspect-[4/3] max-[481px]:aspect-[3/2]">
              <m.img
                src="/image.jpg"
                alt="A close-up portrait of a woman's face, skin shown in fine detail"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{ scale: still(imgScale, 1), y: still(imgY, '0%') }}
                /* ≤768px: 104% tall and lifted 2%, so the ±2% scroll parallax
                   never pulls an edge into the box. Without it a grey strip of
                   the wash showed along the photo's top — directly under the
                   text panel once the order flipped. */
                className="block aspect-[4/5] w-full origin-center object-cover object-[58%_38%] will-change-transform min-[770px]:aspect-auto min-[770px]:h-full max-[769px]:relative max-[769px]:-top-[2%] max-[769px]:aspect-auto max-[769px]:h-[104%] max-[769px]:object-[center_30%]"
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
                  className="absolute top-[var(--pin-y)] left-[var(--pin-x)] flex items-center max-[769px]:top-[var(--pin-y-43)] max-[769px]:left-[var(--pin-x-m)] max-[481px]:top-[var(--pin-y-32)]"
                  style={
                    {
                      '--pin-x': `${r.x}%`,
                      '--pin-y': `${r.y}%`,
                      '--pin-x-m': `calc(${r.m.x}% - 5px)`,
                      '--pin-y-43': `calc(${r.m.y43}% - 12.5px)`,
                      '--pin-y-32': `calc(${r.m.y32}% - 12.5px)`,
                      opacity: still(labelAnim[i], 1),
                    } as MotionStyle
                  }
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
              className="relative flex flex-col items-center px-8 py-14 text-center sm:px-12 sm:py-16 lg:px-14 lg:py-20 max-[769px]:order-1"
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
