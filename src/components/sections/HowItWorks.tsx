import { m, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import type { Variants } from '@/lib/motion'
import { VIEWPORT, fadeUp, stagger, transition } from '@/lib/motion'

/**
 * A standard section intro, one white showcase panel holding a fan of three
 * phones, then the three steps as their own cards.
 *
 * The title is "How it works", centred and set on the page's shared
 * `text-section` scale so it carries the same weight as every other section
 * heading. Centring is this section's own choice; the scale is the page's.
 *
 * The fan is the whole composition: the centre phone stands upright and
 * forward, the outer two sit lower, tilt away and tuck behind it. That overlap
 * is what makes the three read as a single object rather than three pictures.
 *
 * Sizing is by HEIGHT: `screen-1` is a square whose transparent margin is
 * horizontal, so matching on width would draw it at roughly half the size of
 * the other two.
 */

/**
 * What the analysis reads. This card is the one deliberate exception to the
 * site's teal-only palette: each concern carries its own hue. A dozen teal
 * chips read as one undifferentiated block, whereas a colour per concern lets
 * the eye pick out individual findings as they drift past.
 *
 * `dot` is the blurred blob, `text` a darker step of the same hue so the label
 * stays readable on white. `cluster` renders as scattered specks.
 */
const CONCERNS = [
  [
    { label: 'Acne', dot: '#F87171', text: '#EF4444' },
    { label: 'Pigmentation', dot: '#F472B6', text: '#EC4899', cluster: true },
    { label: 'Redness', dot: '#FB7185', text: '#F43F5E' },
    { label: 'Wrinkles', dot: '#60A5FA', text: '#3B82F6' },
    { label: 'Pores', dot: '#A78BFA', text: '#8B5CF6' },
    { label: 'Skin texture', dot: '#FBBF24', text: '#D97706' },
  ],
  [
    { label: 'Hydration', dot: '#22D3EE', text: '#0891B2' },
    { label: 'Skin type', dot: '#9CA3AF', text: '#6B7280' },
    { label: 'Sebum', dot: '#FB923C', text: '#F97316' },
    { label: 'UV-related damage', dot: '#FACC15', text: '#CA8A04' },
    { label: 'Skin aging', dot: '#34D399', text: '#10B981' },
    { label: 'Elasticity', dot: '#4ADE80', text: '#22C55E' },
  ],
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const TICKS_PER_MONTH = 10

/**
 * The palette all three cards share. Read off the concern chips rather than
 * restated, so Scan's markers, Analyze's chips and Follow's readings are the
 * same values by construction.
 */
const ACCENTS = CONCERNS.flat().map((c) => c.dot)

/** Minus the neutral: a grey detection point or data point reads as inactive. */
const ACCENT_VIVID = ACCENTS.filter((c) => c !== '#9CA3AF')

/** Evenly spread across the palette, so a short series still spans its range. */
const spread = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    ACCENT_VIVID[Math.round((i * (ACCENT_VIVID.length - 1)) / (count - 1))],
  )

/**
 * Facial landmarks as percentages of the scan frame, measured off
 * `image-3.webp` and pushed through the transform that places her inside the
 * detection oval, so each marker sits on the feature it names.
 */
const SCAN_POINTS = [
  { x: 50.2, y: 22.1, at: 0.63 },
  { x: 26.9, y: 28.3, at: 0.81 },
  { x: 73.4, y: 28.3, at: 0.81 },
  { x: 37.8, y: 37.4, at: 1.09 },
  { x: 63.7, y: 37.4, at: 1.09 },
  { x: 32.9, y: 44.8, at: 1.31 },
  { x: 68.0, y: 44.8, at: 1.31 },
  { x: 50.2, y: 46.4, at: 1.36 },
  { x: 50.2, y: 62.9, at: 1.86 },
]

/**
 * The app's face-detection oval. `app scan.jpeg` is 738x1600; its red ellipse
 * was measured off the decoded pixels at centre (369, 800) with radii 277x404
 * and colour #ea4647, so the ring here is the app's own, drawn rather than
 * screenshotted.
 */
const SCAN_OVAL = 'ellipse(36.7% 39.3% at 50.2% 49.5%)'
const SCAN_RING = '#ea4647'

/**
 * Step 01 — the detection oval and the person in it, on nothing. No screenshot
 * layer and no backdrop: the card's own surface shows through, so this is
 * effectively a transparent cut-out of the ring plus the subject.
 */
function ScanCapture() {
  return (
    <div className="grid h-full place-items-center">
      <div className="relative h-[11.5rem] w-[8.375rem]">
        {/* The clip lives on this frame-sized wrapper, not on the image:
            `clip-path` percentages resolve against the element's own box, and
            the image is 216% of the frame wide. */}
        <span className="absolute inset-0" style={{ clipPath: SCAN_OVAL }}>
          <img
            src="/image-3.webp"
            alt=""
            width={3373}
            height={2249}
            loading="eager"
            decoding="async"
            draggable={false}
            className="absolute max-w-none"
            style={{ width: '215.7%', left: '-59.3%', top: '-5.4%' }}
          />
        </span>

        {/* Capture sweep, confined to the oval. The band stays neutral white —
            it falls across her face, and a hue here would tint the skin. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-reduce:hidden"
          style={{ clipPath: SCAN_OVAL }}
        >
          <span className="animate-scan-sweep absolute inset-x-0 top-1/2 h-[34%] -translate-y-1/2 motion-reduce:animate-none">
            <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgb(255_255_255_/_0.34),transparent)]" />
            <span
              className="absolute inset-x-0 bottom-0 h-px"
              style={{ backgroundImage: `linear-gradient(90deg, ${ACCENT_VIVID.join(', ')})` }}
            />
          </span>
        </span>

        {/* The detection ring, sized to the measured outer radii. */}
        <span
          aria-hidden
          className="pointer-events-none absolute rounded-[50%]"
          style={{
            left: '12.5%',
            top: '9.5%',
            width: '75.4%',
            height: '80%',
            border: `1.3px solid ${SCAN_RING}`,
          }}
        />

        {/* Tracking markers, landing as the sweep reaches each landmark. */}
        {SCAN_POINTS.map((pt, i) => (
          <span
            key={`${pt.x}-${pt.y}`}
            aria-hidden
            style={{
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              animationDelay: `${pt.at}s`,
              background: ACCENT_VIVID[i % ACCENT_VIVID.length],
              boxShadow: `0 0 0 2px ${ACCENT_VIVID[i % ACCENT_VIVID.length]}3D`,
            }}
            className="animate-scan-point absolute h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Step 02 — the concerns the analysis reads, drifting continuously. Two rows
 * travelling in opposite directions, forever. The loop is seamless because each
 * row renders its chips twice and travels exactly -50% of its own width; the
 * timing is linear because any easing makes the wrap visibly pulse.
 */
function ConcernChips() {
  return (
    <div className="relative flex h-full flex-col justify-center gap-2.5">
      {CONCERNS.map((row, r) => (
        <div key={r} className="flex overflow-hidden">
          <div
            className={`flex w-max shrink-0 gap-2.5 pr-2.5 ${
              r === 0 ? 'animate-drift-left' : 'animate-drift-right'
            } motion-reduce:animate-none`}
          >
            {[0, 1].map((copy) =>
              row.map((c) => (
                <span
                  key={`${copy}-${c.label}`}
                  className="flex shrink-0 flex-col items-center gap-2 rounded-[0.875rem] bg-surface px-4 py-3 ring-1 ring-[color:rgb(16_42_67_/_0.07)]"
                >
                  {c.cluster ? (
                    <span className="grid h-5 w-5 grid-cols-3 place-items-center gap-x-1 gap-y-1.5 py-1">
                      {[0.9, 0.55, 0.85, 0.6, 0.95, 0.5].map((o, k) => (
                        <span
                          key={k}
                          className="h-1 w-1 rounded-full blur-[0.5px]"
                          style={{ background: c.dot, opacity: o }}
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full blur-[4px]" style={{ background: c.dot }} />
                  )}
                  <span
                    className="text-[0.8125rem] leading-none font-semibold"
                    style={{ color: c.text }}
                  >
                    {c.label}
                  </span>
                </span>
              )),
            )}
          </div>
        </div>
      ))}

      {/* Both edges fade into the card so chips arrive and leave rather than
          being sliced off at a hard border. */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-[linear-gradient(to_right,var(--color-surface),transparent)]" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-[linear-gradient(to_left,var(--color-surface),transparent)]" />
    </div>
  )
}

/**
 * Step 03 — the trend, drawing itself. The line is set to `pathLength={1}` so
 * the dash offset animates from 1 to 0 regardless of the path's real geometry.
 * The curve improves overall but dips once in the middle: a line that only ever
 * rises reads as a sales chart, not as skin being monitored.
 */
const TREND_PATH =
  'M10 62 C30 61 48 55 68 54 C90 53 108 45 126 44 C146 43 166 46 184 46 C206 46 224 33 242 30 C262 27 274 21 290 18'

/** One palette colour per reading, spread so six points span the full range. */
const TREND_COLOURS = spread(6)

/** Vertices of `TREND_PATH`, with when each lands during the 7s draw. */
const TREND_POINTS = [
  { x: 10, y: 62, at: 0.2 },
  { x: 68, y: 54, at: 0.95 },
  { x: 126, y: 44, at: 1.7 },
  { x: 184, y: 46, at: 2.45 },
  { x: 242, y: 30, at: 3.2 },
  { x: 290, y: 18, at: 3.85 },
]

function HistoryRuler() {
  return (
    <div className="flex h-full items-center">
      <div className="w-[30rem] -translate-x-12 shrink-0">
        <div className="relative h-[4rem]">
          <svg
            viewBox="0 0 300 80"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          >
            <defs>
              {/* The line runs the palette left to right — the same accents the
                  other two cards use, read as a series over time. */}
              <linearGradient id="trend-stroke" x1="0" y1="0" x2="1" y2="0">
                {ACCENT_VIVID.map((c, i) => (
                  <stop key={c} offset={`${(i / (ACCENT_VIVID.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
              <linearGradient id="trend-fill" x1="0" y1="0" x2="1" y2="1">
                {ACCENT_VIVID.map((c, i) => (
                  <stop
                    key={c}
                    offset={`${(i / (ACCENT_VIVID.length - 1)) * 100}%`}
                    stopColor={c}
                    stopOpacity="0.16"
                  />
                ))}
              </linearGradient>
              {/* The fill is clipped by the line's own shape, so it can share
                  the draw animation without a second animated path. */}
              <clipPath id="trend-clip">
                <path d={`${TREND_PATH} L290 80 L10 80 Z`} />
              </clipPath>
            </defs>

            <rect x="0" y="0" width="300" height="80" fill="url(#trend-fill)" clipPath="url(#trend-clip)" />

            <path
              d={TREND_PATH}
              fill="none"
              stroke="url(#trend-stroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              className="animate-trend-draw [--trend-len:1] motion-reduce:animate-none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Readings sit outside the SVG so they scale uniformly — the chart
              uses `preserveAspectRatio="none"`, which would stretch circles. */}
          {TREND_POINTS.map((pt, i) => (
            <span
              key={pt.x}
              aria-hidden
              style={{
                left: `${(pt.x / 300) * 100}%`,
                top: `${(pt.y / 80) * 100}%`,
                animationDelay: `${pt.at}s`,
                background: TREND_COLOURS[i],
              }}
              className="animate-trend-point absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[color:var(--color-surface)] motion-reduce:animate-none"
            />
          ))}
        </div>

        {/* The ruler. Exactly `TICKS_PER_MONTH` ticks per month across the full
            width, so a taller tick lands on each month and the labels below sit
            under their own division. */}
        <div aria-hidden className="flex w-full items-end justify-between">
          {Array.from({ length: MONTHS.length * TICKS_PER_MONTH }, (_, i) => (
            <span
              key={i}
              className={`w-px ${i % TICKS_PER_MONTH === 0 ? 'h-2.5 bg-[color:rgb(16_42_67_/_0.28)]' : 'h-1.5 bg-[color:rgb(16_42_67_/_0.13)]'}`}
            />
          ))}
        </div>

        <div aria-hidden className="mt-2 flex w-full">
          {MONTHS.map((mo) => (
            <span key={mo} className="flex-1 text-[0.6875rem] leading-none font-medium text-ink-muted">
              {mo}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    n: '01',
    title: 'Scan',
    body: 'Start with a simple skin scan and capture a clear snapshot of your skin.',
    src: '/screen-1.webp',
    alt: 'The SkinTrix360 app ready to run an AI face scan',
    visual: <ScanCapture />,
  },
  {
    n: '02',
    title: 'Analyze',
    body: 'Explore your skin insights and discover what your skin is telling you.',
    src: '/screen-2.webp',
    alt: 'The SkinTrix360 app showing an AI-generated skincare plan',
    visual: <ConcernChips />,
  },
  {
    n: '03',
    title: 'Follow Your Progress',
    body: 'Keep track of your skin over time and see how your skin changes through personalized insights.',
    src: '/screen3.webp',
    alt: 'The SkinTrix360 app showing a skincare calendar',
    visual: <HistoryRuler />,
  },
]

/**
 * Left, centre, right — the fan, in render order so the centre paints last.
 *
 * `fanIn` is where the phone starts on entry, nudged back toward the centre so
 * the three open outward from a stack; `delay` lets the centre land first. The
 * fan-out is the only motion here — once it lands, the phones hold still.
 */
const FAN = [
  { i: 1, x: '-1', rotate: -4, drop: '2.5rem', h: 'h-[82%]', z: 'z-10', fanIn: 56, delay: 0.14 },
  { i: 2, x: '1', rotate: 4, drop: '2.5rem', h: 'h-[82%]', z: 'z-10', fanIn: -56, delay: 0.22 },
  { i: 0, x: '0', rotate: 0, drop: '0rem', h: 'h-full', z: 'z-20', fanIn: 0, delay: 0 },
]

type Slot = (typeof FAN)[number]

/**
 * The entry. The resting angle lives on the positioned parent, so animating
 * this inner element from `-rotate` to `0` nets out to "upright, then tilting
 * into the fan" without it needing to know where the parent put it.
 */
const phoneIn: Variants = {
  hidden: (s: Slot) => ({ opacity: 0, y: 36, scale: 0.92, rotate: -s.rotate, x: s.fanIn }),
  show: (s: Slot) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    x: 0,
    transition: transition(1.1, s.delay),
  }),
}

export function HowItWorks() {
  const reduced = useReducedMotion()

  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="section-y relative" style={{ background: 'var(--bg-cool)' }}>
      <div className="shell">
        <div className="mx-auto max-w-[38rem] text-center">
          <Reveal>
            <h2 id="how-heading" className="text-section">
              How it works
            </h2>
          </Reveal>
        </div>

        {/* The panel. Bottom padding runs deeper than top because the outer two
            phones are translated 2.5rem below the stage box. */}
        <Reveal delay={0.14}>
          <div className="mt-16 overflow-clip rounded-[2.5rem] bg-surface px-5 pt-14 pb-24 md:mt-24 sm:px-10 sm:pt-20 sm:pb-[7.5rem]">
            {/* `--dx` is the outer phones' horizontal offset from centre, tuned
                per breakpoint so the fan widens with the panel and never pushes
                an outer phone into the clipped edge. */}
            <div className="relative mx-auto h-[18rem] w-full max-w-[52rem] [--dx:3.75rem] sm:h-[26rem] sm:[--dx:9.5rem] lg:h-[34rem] lg:[--dx:14rem]">
              {FAN.map((slot) => {
                const step = STEPS[slot.i]
                return (
                  <div
                    key={step.src}
                    className={`absolute inset-y-0 left-1/2 flex items-end ${slot.z}`}
                    style={{
                      transform: `translateX(calc(-50% + var(--dx) * ${slot.x})) translateY(${slot.drop}) rotate(${slot.rotate}deg)`,
                    }}
                  >
                    {/* Carries the entry transform. `h-full items-end` keeps the
                        image's percentage height resolving against the stage. */}
                    <m.div
                      custom={slot}
                      variants={reduced ? undefined : phoneIn}
                      initial={reduced ? false : 'hidden'}
                      whileInView={reduced ? undefined : 'show'}
                      viewport={VIEWPORT}
                      className="flex h-full items-end"
                    >
                      <img
                        src={step.src}
                        alt={step.alt}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={`${slot.h} w-auto max-w-none`}
                      />
                    </m.div>
                  </div>
                )
              })}
            </div>
          </div>
        </Reveal>

        {/* The steps, each on its own card: visual above, caption centred. */}
        <m.ol
          className="mt-6 grid gap-6 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={stagger(0.1)}
        >
          {STEPS.map((step) => (
            <m.li
              key={step.n}
              variants={fadeUp}
              // `min-w-0` is load-bearing: the visuals inside are deliberately
              // wider than the card, and `overflow-clip` hides them without
              // making the card a scroll container — so its min-content
              // contribution is NOT zeroed the way `overflow-hidden` would be,
              // and the grid track would otherwise stretch to the widest visual
              // and push the whole page into horizontal scroll.
              className="min-w-0 overflow-clip rounded-[2rem] bg-surface pb-9"
            >
              <div aria-hidden className="h-[13rem]">
                {step.visual}
              </div>
              <div className="px-7 text-center">
                <span className="text-eyebrow text-teal-deep">{step.n}</span>
                <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-[1.7] text-ink-soft">{step.body}</p>
              </div>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  )
}
