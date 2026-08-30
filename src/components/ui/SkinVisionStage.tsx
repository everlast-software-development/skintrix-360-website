import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'
import { EASE } from '@/lib/motion'

/**
 * SkinVisionStage — what SkinTrix sees, as an interface rather than a layout.
 *
 * The hero says what the product is; this shows what it reads. So the stage is
 * dark and the subject stands inside a scanning viewport, with the analysis
 * happening around her: brackets, tracking points on real landmarks, a slow
 * sweep, and three insights each drawn back to the point on the face it came
 * from. No cards in a row.
 *
 * Geometry. `image-3.webp` is a 3373×2249 front-facing cut-out on
 * transparency, so landmark positions are fixed and can be pinned. The stage
 * is given a fixed aspect at `lg` and the portrait is sized by height, which
 * makes every position expressible in one percentage space:
 *
 *   portrait height = 80% of stage height, anchored to the floor
 *   portrait width  = 80% × (3373/2249) × (10/16) = 75% of stage width
 *   stageX = 12.5 + imageX × 0.75      stageY = 20 + imageY × 0.80
 *
 * LANDMARKS below are the image's own points pushed through exactly that.
 * The visible figure occupies roughly x 31–69%, which is what leaves the
 * flanks clear for the insight modules.
 */

/** Facial points, in stage percentages. */
const LANDMARKS = {
  forehead: { x: 50, y: 39.8 },
  eyeL: { x: 46.3, y: 52.7 },
  eyeR: { x: 53.8, y: 52.7 },
  cheekL: { x: 44.8, y: 59.6 },
  cheekR: { x: 56.0, y: 59.6 },
  chin: { x: 50, y: 71.0 },
} as const

type Insight = {
  id: string
  label: string
  value: string
  /** The point on the face this reading comes from. */
  from: { x: number; y: number }
  /** Elbow, then where the module's edge meets the line. */
  elbow: { x: number; y: number }
  to: { x: number; y: number }
  /** Absolute placement at `lg`; the module flows normally below that. */
  place: string
}

const INSIGHTS: Insight[] = [
  {
    id: 'texture',
    label: 'Skin texture',
    value: 'Even',
    from: LANDMARKS.cheekL,
    elbow: { x: 34, y: 52 },
    to: { x: 28, y: 52 },
    place: 'lg:absolute lg:right-[72%] lg:top-[52%] lg:-translate-y-1/2',
  },
  {
    id: 'pigmentation',
    label: 'Pigmentation',
    value: 'Uniform',
    from: LANDMARKS.forehead,
    elbow: { x: 64, y: 34 },
    to: { x: 72, y: 34 },
    place: 'lg:absolute lg:left-[72%] lg:top-[34%] lg:-translate-y-1/2',
  },
  {
    id: 'pores',
    label: 'Pores',
    value: 'Refined',
    from: LANDMARKS.cheekR,
    elbow: { x: 66, y: 66 },
    to: { x: 72, y: 66 },
    place: 'lg:absolute lg:left-[72%] lg:top-[66%] lg:-translate-y-1/2',
  },
]

/** Callout accents, cycling teal → sky → violet. */
const ACCENTS = [
  { text: 'text-[color:var(--brand-teal-600)]', rule: 'bg-[color:var(--brand-teal)]' },
  { text: 'text-[color:var(--brand-sky)]', rule: 'bg-[color:var(--brand-sky)]' },
  { text: 'text-[color:var(--brand-violet)]', rule: 'bg-[color:var(--brand-violet)]' },
] as const

const CORNERS = [
  'top-0 left-0 border-t border-l rounded-tl-xl',
  'top-0 right-0 border-t border-r rounded-tr-xl',
  'bottom-0 left-0 border-b border-l rounded-bl-xl',
  'bottom-0 right-0 border-b border-r rounded-br-xl',
]

export function SkinVisionStage() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const on = reduced || inView

  const step = (delay: number, y = 0) => ({
    initial: reduced ? false : { opacity: 0, y },
    animate: on ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.7, delay: reduced ? 0 : delay, ease: EASE },
  })

  return (
    <div ref={ref} className="relative">
      {/* ── Copy. Upper-left, reaching across the stage's empty quarter. */}
      <div className="relative z-30 max-w-[30rem] lg:absolute lg:top-[6%] lg:left-0 lg:max-w-[26rem]">
        <m.p className="text-eyebrow text-[color:var(--brand-teal-600)]" {...step(0.05)}>
          Skin intelligence
        </m.p>
        <m.h2
          id="features-heading"
          className="mt-4 text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.06] font-bold tracking-[-0.04em] text-ink"
          {...step(0.12, 14)}
        >
          One capture.
          <br />
          <span className="text-[color:var(--brand-teal-600)]">
            Dozens of visible signals.
          </span>
        </m.h2>
        <m.p
          className="mt-5 max-w-[26rem] text-[0.9375rem] leading-[1.75] text-ink-soft"
          {...step(0.2, 14)}
        >
          SkinTrix uses computer vision to identify visible skin characteristics and turn them
          into clear, actionable insights.
        </m.p>
      </div>

      {/* ── The stage. Fixed aspect at `lg` so every position below resolves
             in one percentage space; a plain tall box on smaller screens. */}
      <div className="relative mt-10 aspect-[4/5] w-full sm:aspect-[1/1] lg:mt-0 lg:aspect-[16/10]">
        {/* Viewport: a glass plate the subject stands inside. */}
        <div className="absolute inset-x-[14%] top-[14%] bottom-0 rounded-t-[2rem] bg-white/70 ring-1 ring-[color:var(--brand-teal-100)] backdrop-blur-[2px] lg:inset-x-[24%] lg:top-[16%]">
          {/* Fine data grid, barely there. */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-t-[2rem] opacity-[0.5]"
            style={{
              backgroundImage:
                'linear-gradient(rgb(9 24 56 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(9 24 56 / 0.045) 1px, transparent 1px)',
              backgroundSize: '38px 38px',
            }}
          />
          {/* Brackets. */}
          <div aria-hidden className="pointer-events-none absolute inset-4">
            {CORNERS.map((at, i) => (
              <m.span
                key={at}
                className={cn('absolute h-6 w-6 border-[color:var(--brand-teal)]', at)}
                {...step(0.35 + i * 0.06)}
              />
            ))}
          </div>
        </div>

        {/* Glow behind the head, so she is lit from the stage rather than
            pasted onto it. */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[18%] left-1/2 h-[52%] w-[52%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(22_184_176_/_0.18),transparent_68%)] blur-3xl"
        />

        {/* The subject. Sized by height and floor-anchored — this is what the
            percentage mapping at the top of the file assumes. */}
        <m.img
          src="/image-3.webp"
          alt=""
          width={3373}
          height={2249}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute bottom-0 left-1/2 h-[86%] w-auto max-w-none -translate-x-1/2 object-contain lg:h-[80%]"
          initial={reduced ? false : { opacity: 0, scale: 0.985 }}
          animate={on ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.9, ease: EASE }}
        />

        {/* Tracking points, landing in sequence on real landmarks. Desktop
            only: the percentage mapping at the top of this file assumes the
            `lg` stage aspect, and at any other ratio the dots drift off the
            features they are supposed to be marking. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {Object.entries(LANDMARKS).map(([id, pt], i) => (
            <m.span
              key={id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              {...step(0.6 + i * 0.08)}
            >
              <span className="block h-1.5 w-1.5 rounded-full bg-[color:var(--brand-teal)] ring-[3px] ring-[color:rgb(22_184_176_/_0.20)]" />
            </m.span>
          ))}
        </div>

        {/* The sweep. Feathered at the edges so it reads as light crossing the
            face rather than a grey band laid over it. */}
        {!reduced && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-[30%] top-[30%] bottom-[22%] hidden overflow-hidden lg:block [mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_20%,#000_80%,transparent)]"
          >
            <m.span
              className="absolute inset-x-0 h-[22%]"
              initial={{ top: '-22%' }}
              animate={{ top: ['-22%', '100%'] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }}
            >
              <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgb(22_184_176_/_0.16),transparent)]" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-[color:rgb(22_184_176_/_0.7)]" />
            </m.span>
          </span>
        )}

        {/* Connectors: face point → elbow → module edge. One SVG in the same
            percentage space as everything else, so the ends actually meet.
            `non-scaling-stroke` keeps them hairlines despite the stretch. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
        >
          {INSIGHTS.map((ins, i) => (
            <g key={ins.id}>
              <m.polyline
                points={`${ins.from.x},${ins.from.y} ${ins.elbow.x},${ins.elbow.y} ${ins.to.x},${ins.to.y}`}
                fill="none"
                stroke="var(--brand-navy-200)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                initial={reduced ? false : { pathLength: 0, opacity: 0 }}
                animate={on ? { pathLength: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.9, delay: reduced ? 0 : 1 + i * 0.14, ease: EASE }}
              />
              <m.circle
                cx={ins.to.x}
                cy={ins.to.y}
                r={0.5}
                fill="var(--brand-teal)"
                vectorEffect="non-scaling-stroke"
                {...step(1.5 + i * 0.14)}
              />
            </g>
          ))}
        </svg>

        {/* "AI vision" indicator, on the viewport itself. */}
        <m.span
          aria-hidden
          className="absolute top-[17%] left-[16%] flex items-center gap-2 rounded-full bg-[color:var(--brand-teal-100)] px-3 py-1.5 ring-1 ring-[color:var(--brand-teal-100)] backdrop-blur-md lg:top-auto lg:bottom-5 lg:left-[26%]"
          {...step(0.25)}
        >
          <span className="relative flex h-1.5 w-1.5">
            {!reduced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--brand-teal)] opacity-70" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--brand-teal)]" />
          </span>
          <span className="text-eyebrow text-[color:var(--brand-teal-600)]">AI vision analysis</span>
        </m.span>

        {/* Insight modules. Absolute around the subject at `lg`; below that
            they leave the stage entirely — see the list underneath. */}
        {INSIGHTS.map((ins, i) => (
          <m.div
            key={ins.id}
            className={cn('hidden w-[11.5rem] lg:block', ins.place)}
            {...step(1.15 + i * 0.14, 10)}
          >
            <span className={cn('text-eyebrow block', ACCENTS[i % 3].text)}>{ins.label}</span>
            <span className="mt-2 block text-[1.375rem] leading-none font-semibold tracking-[-0.02em] text-ink">
              {ins.value}
            </span>
          </m.div>
        ))}
      </div>

      {/* Below `lg` the readings sit under the stage as a clean row — the
          connectors and absolute placement have nowhere to go at that width. */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:hidden">
        {INSIGHTS.map((ins, i) => (
          <m.div
            key={ins.id}
            // A row on a phone, a card from `sm` — three tight columns made
            // "Skin texture" wrap and threw the values out of line.
            className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 ring-1 ring-[color:var(--color-hairline)] sm:block"
            {...step(0.9 + i * 0.12, 10)}
          >
            <span className="flex items-center gap-2.5 sm:block">
              <span aria-hidden className="block h-px w-5 bg-[color:rgb(22_184_176_/_0.7)] sm:mb-3 sm:w-6" />
              <span className={cn('text-eyebrow block', ACCENTS[i % 3].text)}>{ins.label}</span>
            </span>
            <span className="block text-[1.0625rem] leading-none font-semibold text-ink sm:mt-1.5">
              {ins.value}
            </span>
          </m.div>
        ))}
      </div>
    </div>
  )
}
