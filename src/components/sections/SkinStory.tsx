import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

/**
 * 01 — Your skin tells a story.
 *
 * A pinned scene rather than a section: one stage held for three viewports
 * while scroll position drives the whole composition. Nothing here fades in
 * once and stops — every value is a function of progress, so scrolling back
 * up plays it in reverse.
 *
 * The beats:
 *   0.00–0.22  the line arrives, the subject settles from a slight over-scale
 *   0.22–0.45  the line lifts away and the subject takes the frame
 *   0.45–0.78  the read begins — points land on real features, then label
 *   0.78–1.00  the scene resolves and hands off to the next
 *
 * Geometry comes from the asset. `image-3.webp` is a locked front-facing
 * cut-out, so these are its own landmarks as percentages of the image box —
 * the points sit on the features, not near them.
 */

const READS = [
  { id: 'texture', label: 'Texture', x: 35.5, y: 47.5, side: 'left' as const },
  { id: 'tone', label: 'Tone', x: 64.5, y: 44.0, side: 'right' as const },
  { id: 'hydration', label: 'Hydration', x: 50.0, y: 26.0, side: 'right' as const },
  { id: 'concerns', label: 'Visible concerns', x: 43.0, y: 62.0, side: 'left' as const },
]

export function SkinStory() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // Smoothed so the scrub reads as motion rather than as scroll steps.
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.35 })

  // — the opening line
  const lineOpacity = useTransform(p, [0, 0.06, 0.3, 0.42], [0, 1, 1, 0])
  const lineY = useTransform(p, [0, 0.42], ['0%', '-28%'])
  const lineScale = useTransform(p, [0, 0.42], [1, 0.92])

  // — the subject
  const subjectScale = useTransform(p, [0, 0.45, 1], [1.08, 1, 1.02])
  const subjectOpacity = useTransform(p, [0, 0.12, 0.9, 1], [0, 1, 1, 0.85])
  const subjectBlur = useTransform(p, [0, 0.2], [10, 0])
  const subjectFilter = useTransform(subjectBlur, (v) => `blur(${v}px)`)

  // — the read
  const ringScale = useTransform(p, [0.4, 0.75], [0.86, 1])
  const ringOpacity = useTransform(p, [0.4, 0.58, 0.95, 1], [0, 1, 1, 0.6])

  // Each read's own timing. Declared here rather than inside the map below:
  // hooks must run unconditionally and in a stable order, and a callback is
  // neither. Four reads, four fixed pairs.
  const o0 = useTransform(p, [0.46, 0.54], [0, 1])
  const s0 = useTransform(p, [0.46, 0.56], [0.7, 1])
  const o1 = useTransform(p, [0.53, 0.61], [0, 1])
  const s1 = useTransform(p, [0.53, 0.63], [0.7, 1])
  const o2 = useTransform(p, [0.60, 0.68], [0, 1])
  const s2 = useTransform(p, [0.60, 0.70], [0.7, 1])
  const o3 = useTransform(p, [0.67, 0.75], [0, 1])
  const s3 = useTransform(p, [0.67, 0.77], [0.7, 1])
  const readAnim = [
    { o: o0, s: s0 },
    { o: o1, s: s1 },
    { o: o2, s: s2 },
    { o: o3, s: s3 },
  ]

  // — the closing line
  const closeOpacity = useTransform(p, [0.76, 0.88, 1], [0, 1, 1])
  const closeY = useTransform(p, [0.76, 0.92], ['24px', '0px'])

  // — atmosphere drift
  const glowX = useTransform(p, [0, 1], ['-6%', '6%'])
  const glowOpacity = useTransform(p, [0, 0.4, 1], [0.5, 1, 0.7])

  /** Reduced motion collapses every scrubbed value to its resting state. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const still = (v: unknown, fallback: unknown): any => (reduced ? fallback : v)

  return (
    <section
      id="what"
      aria-labelledby="skin-story-heading"
      ref={ref}
      // Three viewports of runway; the stage inside is pinned for all of it.
      className="relative w-full"
      style={{ height: reduced ? 'auto' : '300svh', background: 'var(--bg)' }}
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden">
        {/* Atmosphere — icon-gradient light, drifting with the scrub. */}
        <m.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ x: still(glowX, '0%'), opacity: still(glowOpacity, 1) }}
        >
          <span
            className="absolute top-[8%] left-1/2 h-[54rem] w-[54rem] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: 'var(--icon-glow)' }}
          />
          <span
            className="absolute bottom-[2%] right-[10%] h-[28rem] w-[28rem] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgb(93 100 211 / 0.10), transparent 70%)' }}
          />
        </m.div>

        {/* ── The subject, and the read that lands on it. */}
        <div className="relative mx-auto h-full w-full max-w-[64rem]">
          <m.div
            className="absolute bottom-0 left-1/2 h-[86%] -translate-x-1/2 sm:h-[92%]"
            style={{
              scale: still(subjectScale, 1),
              opacity: still(subjectOpacity, 1),
              filter: still(subjectFilter, 'none'),
              transformOrigin: 'bottom center',
            }}
          >
            <div className="relative h-full" style={{ aspectRatio: '3373 / 2249' }}>
              <img
                src="/image-3.webp"
                alt=""
                width={3373}
                height={2249}
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-full w-full object-contain object-bottom"
              />

              {/* Two hairline rings, opening as the read begins. */}
              <m.span
                aria-hidden
                className="absolute top-[44%] left-1/2 aspect-square h-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  scale: still(ringScale, 1),
                  opacity: still(ringOpacity, 1),
                  background:
                    'radial-gradient(circle, transparent 62%, rgb(30 185 183 / 0.10) 70%, transparent 78%)',
                }}
              />

              {/* The points. Placed on the asset's own landmarks. */}
              {READS.map((r, i) => {
                const { o, s } = readAnim[i]
                return (
                  <m.span
                    key={r.id}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      transform: 'translate(-50%, -50%)',
                      flexDirection: r.side === 'left' ? 'row-reverse' : 'row',
                      opacity: still(o, 1),
                      scale: still(s, 1),
                    }}
                  >
                    <span
                      aria-hidden
                      className="block h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background: 'var(--teal)',
                        boxShadow: '0 0 0 4px rgb(30 185 183 / 0.16)',
                      }}
                    />
                    <span
                      className="text-[0.6875rem] leading-none font-medium whitespace-nowrap"
                      style={{ color: 'var(--body)' }}
                    >
                      {r.label}
                    </span>
                  </m.span>
                )
              })}
            </div>
          </m.div>

          {/* ── The opening line, over the subject, lifting away as it settles. */}
          <m.div
            className="pointer-events-none absolute inset-x-0 top-[16%] px-6 text-center"
            style={{
              opacity: still(lineOpacity, 1),
              y: still(lineY, '0%'),
              scale: still(lineScale, 1),
            }}
          >
            <h2
              id="skin-story-heading"
              className="mx-auto max-w-[14ch] text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-bold tracking-[-0.04em]"
              style={{ color: 'var(--ink)' }}
            >
              Your skin tells a story.
            </h2>
          </m.div>

          {/* ── The closing line, arriving once the read has landed. */}
          <m.p
            className="pointer-events-none absolute inset-x-0 bottom-[7%] mx-auto max-w-[34rem] px-6 text-center text-[0.9375rem] leading-[1.75]"
            style={{ opacity: still(closeOpacity, 1), y: still(closeY, '0px'), color: 'var(--body)' }}
          >
            SkinTrix reads what the eye skims past — texture, tone, hydration and visible
            concerns — and turns it into something you can act on.
          </m.p>
        </div>
      </div>
    </section>
  )
}
