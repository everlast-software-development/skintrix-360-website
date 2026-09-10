import { useEffect, useRef, useState } from 'react'
import { LuMapPin, LuShieldCheck, LuSun } from 'react-icons/lu'

import { useTextReveal } from '@/hooks/useTextReveal'
import { FeatureTile } from '@/components/ui/FeatureTile'

/**
 * UV Index — the app's UV card, beside what it actually tells you to wear.
 *
 * NO GEOLOCATION. NO NETWORK REQUEST. NO CLOCK.
 * `navigator.geolocation` is never referenced, nothing is fetched, and
 * `new Date()` is never called. Every value is a field of the `UV` constant,
 * and the line under the card says the reading is a sample.
 *
 * WHY A BAR AND NOT A CHART
 * An earlier version drew a UV curve across the day. It was deleted on
 * purpose: a curve asks the visitor to interpret a graph before they learn
 * anything, while position along one hot-to-cool bar answers "am I at risk
 * right now?" at a glance, with no chart literacy.
 *
 * WHY THERE IS A LADDER ON THE RIGHT
 * The card alone shows one reading, which reads as a generic recommendation
 * that happens to have a number on it. The ladder is the argument: five
 * conditions, five different instructions, with the current one highlighted.
 * It is CONTENT, not decoration — hence a real `<ul>` with `aria-current` on
 * the active row, and no `aria-hidden` anywhere near it.
 *
 * WHAT IS AUTHORED vs DERIVED
 * Authored: the city, `value`, `max`, the card's advice sentence.
 * Derived from `value`: the severity word, the severity colour (which paints
 * the number, the severity word, the marker's border and the shield), the
 * marker's position, and which ladder row is active.
 *
 * ACCESSIBILITY
 * The bar, the marker and the tick labels are one `aria-hidden` group — a
 * picture of a number that is already text. Severity is carried by the WORD,
 * in the card and in every ladder row, never by colour alone.
 */

/* ===========================================================================
   Severity — one source of truth for the card AND the ladder
   =========================================================================== */

/**
 * `from` is inclusive. The five colours are data encoding, not brand palette:
 * the UV scale's own convention, as weather services use it.
 *
 * `range` and `wear` live here rather than in a second list beside the ladder,
 * so a band's colour, word, span and instruction can never drift apart.
 */
const BANDS = [
  { from: 0, word: 'Low', color: '#2FBF87', range: '0–2', wear: 'No SPF needed' },
  { from: 3, word: 'Moderate', color: '#E8C33D', range: '3–5', wear: 'SPF 30+, reapply midday' },
  { from: 6, word: 'High', color: '#EE8B3C', range: '6–7', wear: 'SPF 50, hat, shade 11–3' },
  { from: 8, word: 'Very high', color: '#E2564B', range: '8–10', wear: 'SPF 50+, avoid midday sun' },
  { from: 11, word: 'Extreme', color: '#8B5CF6', range: '11+', wear: 'Stay indoors 11–4' },
] as const

/** Index rather than the object, because the ladder needs to know which ROW. */
function bandIndexFor(value: number) {
  for (let i = BANDS.length - 1; i >= 0; i--) if (value >= BANDS[i].from) return i
  return 0
}

/** The bar's gradient. Stops are chosen to look continuous — deliberately not
 *  the same numbers as the bands' thresholds. */
const BAR_GRADIENT =
  'linear-gradient(90deg, #2FBF87 0%, #E8C33D 28%, #EE8B3C 52%, #E2564B 76%, #8B5CF6 100%)'

/** The sun tile. The only non-severity local colours in this file. */
const TILE = { bg: '#FFF4DC', icon: '#E8A33D' } as const

/**
 * The outer panel, matched to the site rather than authored here.
 *
 * The brief proposed radius 32px, padding 40px and a single-layer shadow
 * `0 16px 48px -30px rgba(26,42,92,0.14)`. No section on this site uses any of
 * those, and the brief said to match a neighbour instead — so these are
 * SkinPlan's panel values, which is the true peer (an outer panel holding a
 * grid, rather than a small card):
 *
 *   SkinPlan  radius 24px  padding 24px  0 1px 2px rgba(13,24,57,.04),
 *                                        0 10px 34px -18px rgba(13,24,57,.14)
 *   Consultation cards  radius 22px  padding 24→28px  same two-layer pattern
 *
 * The distinctive signal is the TWO-LAYER shadow — a 1px contact line plus a
 * wide, very soft ambient one. A single-layer 48px blur reads as a drop shadow
 * next to those and would make this the one section lit differently.
 *
 * Padding is the one place this goes past SkinPlan's 24px, to 28px at desktop:
 * this panel holds two columns rather than three stacked ones, and 28px is
 * already in the site's range (Consultation's cards use it at ≥1025px).
 */
const PANEL_SHADOW = '0 1px 2px rgba(13,24,57,.04), 0 10px 34px -18px rgba(13,24,57,.14)'

/** The top of the scale. 11 is the last label; the bar reads "11+". */
const SCALE_MAX = 11

/** Half the marker, so its full circle stays on the bar at either end. */
const MARKER_RADIUS = 13

/* ===========================================================================
   The sample
   =========================================================================== */

export type UvData = {
  city: string
  value: number
  max: number
  advice: string
}

const UV: UvData = {
  city: 'Cairo',
  value: 4.4,
  max: 9.5,
  advice: 'SPF 30+ recommended. Seek shade during midday.',
}

/** Ticks, each at its OWN position on the bar rather than spaced evenly — 8
 *  sits at 73%, not at the fourth of five equal slots. The middle two drop at
 *  ≤768px, where five labels collide at 375. */
const TICKS = [
  { value: 0, label: '0', always: true },
  { value: 3, label: '3', always: false },
  { value: 6, label: '6', always: true },
  { value: 8, label: '8', always: false },
  { value: 11, label: '11+', always: true },
] as const

const percentOf = (value: number) => Math.min(100, Math.max(0, (value / SCALE_MAX) * 100))

/**
 * Fires once, the first time the card is a third visible. Disconnects on the
 * first hit, so the marker cannot slide again on the way back up. Under
 * `prefers-reduced-motion` it starts true and no observer is created.
 */
function useSeenOnce<T extends HTMLElement>(reduced: boolean) {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return [ref, seen] as const
}

/* ===========================================================================
   Section
   =========================================================================== */

export function UvIndex({ data = UV }: { data?: UvData }) {
  const headingRef = useTextReveal<HTMLHeadingElement>()

  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const [cardRef, seen] = useSeenOnce<HTMLDivElement>(reduced)

  const activeIndex = bandIndexFor(data.value)
  const band = BANDS[activeIndex]
  const percent = percentOf(data.value)

  /**
   * The marker's centre: a CSS `clamp` in mixed units, which is the clipping
   * fix. The percentage is what the reading means; the two pixel bounds keep
   * the full 26px circle on the bar at value 0 and at 11+. Doing this in JS
   * would need the bar's measured width — the browser already knows it.
   */
  const restingLeft = `clamp(${MARKER_RADIUS}px, ${percent}%, calc(100% - ${MARKER_RADIUS}px))`

  return (
    <section
      id="uv-index"
      aria-labelledby="uv-heading"
      /* `section-y` — the site's `--section-rhythm` token, which is what
         WhatItDoes, HowItWorks, SkinPlan and Pricing all use. The local
         clamp this replaces was a fifth, slightly different rhythm. */
      className="section-y w-full overflow-x-clip"
      style={{ background: '#F5F6FD' }}
    >
      {/* `shell` — max-width 76rem with a 1.5rem→2.5rem gutter. The same
          utility the Navbar uses, which is what puts this panel's left edge on
          the header logo's left edge (152px at 1440) instead of 18px inside
          it. Replaces a local `max-w-[1100px] px-6`. */}
      <div className="shell">
        {/* ── header ──────────────────────────────────────────────────────── */}
        <header className="section-head">
          <FeatureTile
            group="tracking"
            icon={LuSun}
            name="UV Index"
            description="In the app"
          />
          <h2 ref={headingRef} id="uv-heading" className="type-h2 mt-3">
            Your skin does not live in a lab. Neither should your advice.
          </h2>
          <p className="type-lead mt-[18px]">
            The app reads the UV where you are and turns it into one clear instruction — what
            SPF to wear today, and when to stay out of the sun.
          </p>
        </header>

        {/* ── the containing panel ────────────────────────────────────────── */}
        <div
          className="mt-12 rounded-[24px] bg-white p-[22px] min-[769px]:p-6 min-[1025px]:p-7"
          style={{ boxShadow: PANEL_SHADOW }}
        >
          {/* `items-start`, not `items-center`: centring left the ladder
              heading floating below the card's top edge with 102px of dead
              space above and below it. Top-aligned, the heading sits level
              with the card's "UV Index" row. */}
          <div className="grid grid-cols-1 items-start gap-8 min-[769px]:grid-cols-2 min-[769px]:gap-7 min-[1025px]:gap-10 min-[1281px]:gap-14">
            {/* ── left: the UV card ───────────────────────────────────────── */}
            <div>
              {/* Tinted now, not white — it sits INSIDE a white panel, so the
                  nesting has to reverse or the card disappears into its own
                  container. No shadow for the same reason: the tint is the
                  separation. */}
              <div
                ref={cardRef}
                className="w-full rounded-[20px] p-[22px] min-[769px]:p-6 min-[1025px]:p-7"
                style={{ background: '#F5F6FD' }}
              >
                {/* a) header row — one line, as the app has it */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <span
                      aria-hidden
                      className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[16px]"
                      style={{ background: TILE.bg, color: TILE.icon }}
                    >
                      <LuSun className="h-[26px] w-[26px]" strokeWidth={1.9} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="type-card-title">UV Index</span>
                      <span className="type-small">Sun exposure risk</span>
                    </span>
                  </div>

                  <span className="flex shrink-0 items-center gap-1.5">
                    <LuMapPin aria-hidden className="h-4 w-4 ink-muted" />
                    <span className="type-body">{data.city}</span>
                  </span>
                </div>

                {/* b) the reading */}
                <div className="mt-[26px]">
                  <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                    <span
                      className="text-[52px] leading-none tabular-nums min-[769px]:text-[60px] min-[1025px]:text-[68px]"
                      style={{
                        fontWeight: 700,
                        color: band.color,
                        opacity: reduced || seen ? 1 : 0,
                        ...(reduced ? {} : { transition: 'opacity 700ms var(--ease-out-expo)' }),
                      }}
                    >
                      {data.value.toFixed(1)}
                    </span>
                    <span
                      className="text-[22px] leading-none min-[769px]:text-[26px]"
                      style={{ fontWeight: 600, color: band.color }}
                    >
                      {band.word}
                    </span>
                  </div>
                  <p className="type-body ink-muted mt-2.5">Max today: {data.max.toFixed(1)}</p>
                </div>

                {/* c) the scale */}
                <div className="mt-6" aria-hidden="true">
                  <div className="relative h-[14px]">
                    <div
                      className="h-full w-full rounded-full"
                      style={{ background: BAR_GRADIENT }}
                    />
                    <span
                      className="absolute top-1/2 block h-[26px] w-[26px] rounded-full bg-white"
                      style={{
                        left: reduced || seen ? restingLeft : `${MARKER_RADIUS}px`,
                        transform: 'translate(-50%, -50%)',
                        border: `4px solid ${band.color}`,
                        boxShadow: '0 2px 8px rgba(26,42,92,0.22)',
                        ...(reduced ? {} : { transition: 'left 700ms var(--ease-out-expo)' }),
                      }}
                    />
                  </div>

                  <div className="relative mt-3 h-5">
                    {TICKS.map((t) => (
                      <span
                        key={t.label}
                        className={
                          t.always
                            ? 'type-small ink-muted absolute -translate-x-1/2'
                            : 'type-small ink-muted absolute hidden -translate-x-1/2 min-[769px]:block'
                        }
                        style={{ left: `clamp(10px, ${percentOf(t.value)}%, calc(100% - 14px))` }}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* d) the advice — white now, so it still separates from the
                       tinted card it sits on */}
                <div className="mt-6 flex items-center gap-3 rounded-[14px] bg-white px-[18px] py-4">
                  <LuShieldCheck
                    aria-hidden
                    className="h-5 w-5 shrink-0"
                    strokeWidth={1.9}
                    style={{ color: band.color }}
                  />
                  <p className="type-body">{data.advice}</p>
                </div>
              </div>

              {/* Under the LEFT column and aligned with the card — centred
                  under the whole grid it read as a stranded caption. */}
              <p className="type-small ink-muted mt-4">
                Live UV data in the app. {data.city} shown as an example.
              </p>
            </div>

            {/* ── right: the SPF ladder ───────────────────────────────────── */}
            {/* The top padding matches the UV card's own padding, which is what
                makes this heading level with the card's "UV Index" row rather
                than 28px above it. `items-start` aligns the COLUMNS; the card
                then insets its first row by its padding, and without the same
                inset here the two tops do not read as aligned. Dropped at
                ≤768px, where the columns stack and there is nothing to align
                to. */}
            <div className="min-[769px]:pt-6 min-[1025px]:pt-7">
              <p className="type-card-title">What the app tells you to wear</p>

              <ul className="mt-5 flex flex-col gap-3.5">
                {BANDS.map((b, i) => {
                  const active = i === activeIndex
                  return (
                    <li
                      key={b.range}
                      /* Content, not decoration — so the active row is
                         announced rather than merely tinted. */
                      aria-current={active ? 'true' : undefined}
                      className={
                        active
                          ? 'flex flex-col gap-x-4 gap-y-1 rounded-[12px] px-3 py-2.5 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between'
                          : 'flex flex-col gap-x-4 gap-y-1 px-3 min-[769px]:flex-row min-[769px]:items-center min-[769px]:justify-between'
                      }
                      style={active ? { background: '#F5F6FD' } : undefined}
                    >
                      {/* The dot and the range stay on one line at every width;
                          only the instruction wraps beneath. */}
                      <span className="flex shrink-0 items-center gap-2.5">
                        <span
                          aria-hidden
                          className="block shrink-0 rounded-full"
                          style={{
                            width: active ? 12 : 10,
                            height: active ? 12 : 10,
                            background: b.color,
                          }}
                        />
                        <span className="type-body ink-heading" style={{ fontWeight: 500 }}>
                          {b.range}
                        </span>
                        <span className="type-small ink-muted">{b.word}</span>
                      </span>

                      <span
                        className={
                          active
                            ? 'type-body min-[769px]:text-right'
                            : 'type-body ink-muted min-[769px]:text-right'
                        }
                      >
                        {b.wear}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
