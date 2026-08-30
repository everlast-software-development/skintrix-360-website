import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import { ScrollHighlightText } from '@/components/ui/ScrollHighlightText'
import { WHAT } from '@/lib/site'

/**
 * The split scene after the hero: the subject on the left, the writing on a
 * quiet lavender field to the right, and the three concepts in an editorial
 * row beneath.
 *
 * The rule and the wordmark are driven by a panel-scoped `useScroll` rather
 * than the section's, so they resolve as the panel itself arrives rather than
 * being tied to where the tall section as a whole sits in the viewport.
 */

/** Read-outs placed over the portrait, at fixed percentages of the image. */
const READS = [
  { id: 'texture', label: 'Texture', x: 30, y: 34 },
  { id: 'hydration', label: 'Hydration', x: 22, y: 62 },
]

export function WhatItDoes() {
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

              {READS.map((r, i) => (
                <m.span
                  key={r.id}
                  className="absolute flex items-center gap-2"
                  style={{
                    left: `${r.x}%`,
                    top: `${r.y}%`,
                    opacity: still(labelAnim[i], 1),
                  }}
                >
                  <span
                    aria-hidden
                    className="block h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--teal)', boxShadow: '0 0 0 4px rgb(30 185 183 / 0.22)' }}
                  />
                  <span
                    className="text-[0.6875rem] leading-none font-semibold tracking-[0.14em] whitespace-nowrap text-white uppercase"
                    style={{ textShadow: '0 1px 6px rgb(0 0 0 / 0.35)' }}
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
              <Reveal>
                <h2 id="what-heading" className="text-section text-balance">
                  {WHAT.headline[0]}
                  <br />
                  {WHAT.headline[1]}
                </h2>
              </Reveal>

              <ScrollHighlightText
                text={WHAT.lead}
                className="mt-6 max-w-[30rem] text-[1.0625rem] leading-[1.85] text-ink-soft"
              />

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

        {/* The three concepts keep their editorial row beneath the scene. */}
        <ol className="mt-16 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-0">
          {WHAT.points.map((point, i) => (
            <Reveal as="li" key={point.title} delay={i * 0.08} className={i > 0 ? 'md:pl-10' : 'md:pr-10'}>
              <p className="text-eyebrow text-teal-deep">{`0${i + 1}`}</p>
              <h3 className="mt-4 text-[1.625rem] font-semibold tracking-[-0.02em]">{point.title}</h3>
              <p className="mt-3 text-[1rem] leading-[1.8] text-ink-soft">{point.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
