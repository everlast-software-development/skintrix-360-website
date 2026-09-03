import { m, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import type { Variants } from '@/lib/motion'
import { EASE, VIEWPORT, fadeUp, stagger, transition } from '@/lib/motion'
import { useTextReveal } from '@/hooks/useTextReveal'

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

/**
 * The palette all three cards share. Read off the concern chips rather than
 * restated, so Scan's markers, Analyze's chips and Follow's readings are the
 * same values by construction.
 */
const ACCENTS = CONCERNS.flat().map((c) => c.dot)

/** Minus the neutral: a grey detection point or data point reads as inactive. */
const ACCENT_VIVID = ACCENTS.filter((c) => c !== '#9CA3AF')

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
                    className="type-legal"
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

/* ===========================================================================
   Step 03 — the progress chart
   =========================================================================== */

/**
 * Seven monthly skin scores. Illustrative sample data: a gentle rise that
 * levels off, which is what real monitoring looks like — not a straight climb.
 *
 * The GEOMETRY IS DERIVED from these numbers rather than hand-written as a
 * path, so changing a value moves its point, its marker and the fill together.
 * The visual this replaces had a literal `d` attribute sitting beside a
 * separate array of vertex coordinates, and the two could disagree silently.
 */
const PROGRESS_SCORES = [
  { date: '5 Apr', value: 92 },
  { date: '6 Apr', value: 88 },
  { date: '8 Apr', value: 78 },
  { date: '8 Apr', value: 75 },
  { date: '22 Apr', value: 88 },
  { date: '22 Apr', value: 62 },
  { date: '22 Jul', value: 86 },
  { date: '6 Aug', value: 92 },
] as const

/**
 * The drawing box. `meet` scaling keeps circles circular and the stroke even,
 * so these are real units rather than a stretched grid.
 *
 * `left` leaves room for the y labels, and the domain is the app's own fixed
 * 0–100 rather than one fitted to the data. A fitted domain would rescale the
 * chart every time a score changed, so the same dip would look different from
 * one scan to the next — on a score out of 100 the axis has to BE 100 for two
 * readings to be comparable at a glance.
 */
const CH = {
  w: 340,
  h: 190,
  left: 42,
  right: 322,
  top: 14,
  base: 148,
  min: 0,
  max: 100,
} as const

/** The gridline values, and the only y labels the app prints. */
const GRID_VALUES = [0, 25, 50, 75, 100]

const px = (i: number) => CH.left + (i * (CH.right - CH.left)) / (PROGRESS_SCORES.length - 1)
const py = (v: number) => CH.base - ((v - CH.min) / (CH.max - CH.min)) * (CH.base - CH.top)

const PTS = PROGRESS_SCORES.map((s, i) => ({ ...s, x: px(i), y: py(s.value) }))

/** The five gridlines, positioned from the domain values they label. */
const GRID = GRID_VALUES.map((v) => ({ v, y: py(v) }))

/**
 * Catmull-Rom through the points, emitted as cubic béziers, CLAMPED so the
 * curve can never leave its own data.
 *
 * A real spline rather than `Q`/`T` shorthand: the shorthand mirrors the
 * previous control point, so a single reversal makes every segment after it
 * overshoot. 6 is the standard Catmull-Rom-to-bézier divisor.
 *
 * The clamp is what this series actually needs. Plain Catmull-Rom overshoots at
 * a sharp reversal, and this data reverses hard — 88 down to 62 and back up to
 * 86. Unclamped, the curve dips visibly below 62 and bulges past 92, drawing
 * scores that were never recorded. Holding each control point inside the two
 * readings it sits between keeps the line smooth AND truthful.
 */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  const clamp = (v: number, a: number, b: number) =>
    Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b))

  let d = `M${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    d +=
      ` C${p1.x + (p2.x - p0.x) / 6} ${clamp(p1.y + (p2.y - p0.y) / 6, p1.y, p2.y)}` +
      ` ${p2.x - (p3.x - p1.x) / 6} ${clamp(p2.y - (p3.y - p1.y) / 6, p1.y, p2.y)}` +
      ` ${p2.x} ${p2.y}`
  }
  return d
}

const LINE_D = smoothPath(PTS)

/** The same curve, closed to the baseline — one shape, so the fill can never
    drift out from under the stroke. */
const AREA_D = `${LINE_D} L${CH.right} ${CH.base} L${CH.left} ${CH.base} Z`

/**
 * Step 03 — the score trend, drawn on scroll.
 *
 * Mirrors the app's Progress chart: fixed 0–100 axis with its five labelled
 * gridlines, one marker per recorded scan, and the scan date under each. It
 * sits in the same fixed `h-[13rem]` band as `ScanCapture` and `ConcernChips`,
 * so all three cards keep exactly the same height, and nothing below it in the
 * card changes.
 *
 * THE ANIMATION
 * One pass on entry, in this order: the area grows up from its baseline, the
 * stroke draws left to right, then the markers pop in one after another —
 * about 1.2s end to end, on the page's shared `EASE`.
 *
 * `pathLength` is framer-motion's own normalisation: it sets `pathLength="1"`
 * on the element and animates `stroke-dasharray` against that, so the draw is
 * correct without measuring the real path. That is also why this does not
 * reuse the `--animate-trend-draw` keyframes the old visual used — those loop
 * forever on a 7s cycle, and this has to fire once, on entry.
 *
 * Under `prefers-reduced-motion` every element renders in its finished state
 * and no animation is scheduled at all.
 */
function ProgressMiniChart() {
  const reduced = useReducedMotion() ?? false

  /* The markers wait for the stroke to reach them, so the draw and the pops
     read as one gesture rather than two that overlap. */
  const markerGroup: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: reduced ? 0 : 0.42 } },
  }
  const markerIn: Variants = {
    hidden: { opacity: 0, scale: 0.4 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.34, ease: EASE } },
  }

  return (
    /* `group` drives the hover state, which costs no JS: every property it
       touches is a real CSS property on an SVG element. */
    <div className="group flex h-full items-center justify-center px-4">
      <svg
        viewBox={`0 0 ${CH.w} ${CH.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="progress-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* The grid, and the scale it stands for. Static on purpose: this is
            the paper the chart is drawn on, and animating it would pull the eye
            to the frame instead of the data. The 0 line is a shade stronger —
            it is the axis the fill sits on, not just another division. */}
        <g strokeWidth={1}>
          {GRID.map(({ v, y }) => (
            <line
              key={v}
              x1={CH.left}
              y1={y}
              x2={CH.right}
              y2={y}
              stroke={v === 0 ? 'var(--line)' : 'var(--line-soft)'}
            />
          ))}
        </g>

        {/* Y labels — 0 / 25 / 50 / 75 / 100, as the app prints them. End
            anchored so one, two and three-figure numbers all stack flush
            against the plot edge. */}
        <g fontSize={11} fill="var(--text-muted)" textAnchor="end">
          {GRID.map(({ v, y }) => (
            <text key={v} x={CH.left - 10} y={y + 3.8}>
              {v}
            </text>
          ))}
        </g>

        {/* The fill, growing up from the baseline. `transformOrigin` is in user
            units because an SVG child has no CSS box for a percentage to
            resolve against. */}
        <m.path
          d={AREA_D}
          fill="url(#progress-area-fill)"
          className="transition-opacity duration-500 group-hover:opacity-80"
          style={{ transformOrigin: `${CH.left}px ${CH.base}px` }}
          initial={reduced ? false : { opacity: 0, scaleY: 0.55 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.9, ease: EASE }}
        />

        {/* The stroke, drawing left to right. */}
        <m.path
          d={LINE_D}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke-width] duration-300 group-hover:[stroke-width:3.25]"
          initial={reduced ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.15, ease: EASE }}
        />

        {/* Hollow markers — white centre, teal ring, as in the app. Keyed by
            index: two scan dates repeat, so the date is not a unique key. */}
        <m.g
          variants={markerGroup}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={VIEWPORT}
        >
          {PTS.map((p, i) => (
            <m.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="var(--color-surface)"
              stroke="var(--accent)"
              strokeWidth={2}
              variants={reduced ? undefined : markerIn}
              className="transition-[stroke-width] duration-300 group-hover:[stroke-width:2.75]"
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
            />
          ))}
        </m.g>

        {/* Scan dates. 11 user units rather than the `type-legal` role: axis
            ticks are the one thing here that cannot take a prose size — eight
            dated labels at 13px need ~320 units and the plot is 280 wide, so
            they collided. The site scale governs copy, not chart furniture. */}
        <g fontSize={11} fill="var(--text-muted)" textAnchor="middle">
          {PTS.map((p, i) => (
            <text key={i} x={p.x} y={CH.base + 24}>
              {p.date}
            </text>
          ))}
        </g>
      </svg>
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
    visual: <ProgressMiniChart />,
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
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  const reduced = useReducedMotion()

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="section-y relative"
      style={{ background: '#F5F6FD' }}
    >
      {/* The white-to-ground fade that used to sit here is gone.

          It existed to blend this section down from a WHITE section above it.
          Every section now resolves to #F5F6FD, so the fade had nothing to
          blend FROM — it was laying white over the ground and then dissolving
          it, which made the fade itself the seam: a 325px band starting at
          pure white, measured down the page's left gutter. */}

      <div className="shell relative">
        <div className="measure-header text-center">
          <h2 ref={headingRef} id="how-heading" className="text-section">
            How it works
          </h2>
          <Reveal delay={0.08}>
            <p className="text-lead mt-5">
              From a quick skin scan to personalized insights, get a clearer understanding of
              your skin and what it needs.
            </p>
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
                <span className="text-eyebrow">{step.n}</span>
                <h3 className="type-card-title mt-3">{step.title}</h3>
                <p className="type-body mt-2">{step.body}</p>
              </div>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  )
}
