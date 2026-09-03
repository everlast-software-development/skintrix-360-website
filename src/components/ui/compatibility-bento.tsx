import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import {
  BadgeCheck,
  Camera,
  History,
  ImageUp,
  Keyboard,
  ScanBarcode,
  Type as TypeIcon,
} from 'lucide-react'

/**
 * Compatibility bento — the animated grid for the product-check section.
 *
 * TWO ADAPTATIONS FROM THE REFERENCE, BOTH LOAD-BEARING
 *
 * 1. `m.*`, never `motion.*`. The app is wrapped in `<LazyMotion
 *    features={domAnimation} strict>`; under `strict`, a `motion.*` component
 *    THROWS and blanks the page. Every animated element here is `m.*`.
 *
 * 2. No `layout` prop. Layout animations ship in `domMax`, not
 *    `domAnimation` — the reference's `LayoutAnimation` cell would silently do
 *    nothing here. The equivalent cell animates opacity and offset explicitly
 *    instead, which needs no extra feature bundle.
 *
 * RE-THEMED TO LIGHT. The reference is zinc-950 with white ink; this is the
 * site's own ground, white cells, navy ink and one teal accent. The only
 * saturated colour is in the five gradient icon tiles, which mirror the app's
 * colour coding.
 *
 * REDUCED MOTION. `useReducedMotion` gates everything: no reveals, no loops,
 * and the looping cells never start their timers, so a visitor who asks for
 * less motion gets a static grid rather than a paused one.
 *
 * A DESIGNED SAMPLE. No network request, no camera access. Every animation is
 * decorative and `aria-hidden`; every fact is real text.
 */

/* ===========================================================================
   Tokens local to this component
   =========================================================================== */

/** The site's ease, and the reference's — the same curve. */
const EASE = [0.16, 1, 0.3, 1] as const

/** Cell chrome. White, 24px, hairline, soft shadow; hover lifts and tints the
 *  border teal. The lift is CSS rather than `whileHover` so it costs no JS and
 *  `motion-reduce` can switch it off declaratively. */
const CELL =
  'group relative overflow-hidden rounded-[24px] border border-[#EAECF5] bg-white ' +
  'shadow-[0_1px_2px_rgba(13,24,57,0.04),0_10px_34px_-18px_rgba(13,24,57,0.14)] ' +
  'transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'hover:-translate-y-1 hover:border-[color:rgb(30_185_183_/_0.45)] ' +
  'hover:shadow-[0_1px_2px_rgba(13,24,57,0.05),0_22px_50px_-22px_rgba(13,24,57,0.22)] ' +
  'motion-reduce:transform-none motion-reduce:transition-none'

const TAG = {
  positive: { bg: '#E6F7F6', ink: '#0E6A72' },
  caution: { bg: '#FDF0EF', ink: '#A8443E' },
} as const

/** The verdict's ink. NOT the brand teal: #1EB9B7 is 2.42:1 on white and this
 *  is the most important line in the section. Same deeper teal the positive
 *  tags use — 6.3:1 — so it stays on palette. */
const VERDICT_INK = TAG.positive.ink

const GRADIENT = {
  camera: 'linear-gradient(135deg, #FF7A9A, #E11D48)',
  upload: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  name: 'linear-gradient(135deg, #60A5FA, #2563EB)',
  barcode: 'linear-gradient(135deg, #FBBF24, #D97706)',
  manual: 'linear-gradient(135deg, #FDBA74, #EA580C)',
} as const

/* ===========================================================================
   Shared pieces
   =========================================================================== */

/** The reveal every cell shares. `once` so it never replays on the way back. */
const rise = (delay: number, reduced: boolean | null) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 } as const,
        transition: { duration: 0.75, delay, ease: EASE },
      }

function IconTile({
  Icon,
  gradient,
}: {
  Icon: typeof Camera
  gradient: string
}) {
  return (
    <span
      aria-hidden
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_6px_16px_-8px_rgb(13_24_57_/_0.45)] transition-transform duration-500 group-hover:scale-[1.06] motion-reduce:transform-none"
      style={{ backgroundImage: gradient }}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
    </span>
  )
}

/** Title + body, the same in every method cell. */
function CellCopy({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4">
      <h3 className="type-card-title">{title}</h3>
      <p className="type-small mt-1">{body}</p>
    </div>
  )
}

/* ===========================================================================
   The micro-animations — one per cell, all decorative
   =========================================================================== */

/** Cell 1 background: concentric rings breathing outward, the logo's motif. */
function ScanRings({ reduced }: { reduced: boolean | null }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <m.span
          key={i}
          className="absolute rounded-full border"
          style={{ width: 160, height: 160, borderColor: 'rgb(30 185 183 / 0.30)' }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={reduced ? { scale: 1.6, opacity: 0.12 } : { scale: [0.6, 2.6], opacity: [0.5, 0] }}
          transition={
            reduced ? { duration: 0 } : { duration: 4.2, repeat: Infinity, delay: i * 1.4, ease: 'easeOut' }
          }
        />
      ))}
    </div>
  )
}

/** Cell 1: the verdict check, drawn rather than faded in. */
function DrawnCheck({ reduced }: { reduced: boolean | null }) {
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ background: TAG.positive.bg }}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <m.path
          d="M4 12.5 L9.5 18 L20 6.5"
          stroke="var(--text-accent)"
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          initial={{ strokeDashoffset: reduced ? 0 : 1 }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, delay: 0.45, ease: EASE }}
        />
      </svg>
    </span>
  )
}

/** Cell 2: a viewfinder that pulses, then snaps. */
function Viewfinder({ reduced }: { reduced: boolean | null }) {
  const [snap, setSnap] = useState(false)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setSnap(true)
      window.setTimeout(() => setSnap(false), 220)
    }, 3200)
    return () => window.clearInterval(id)
  }, [reduced])

  const corner = 'absolute h-4 w-4 border-[color:var(--text-accent)]'
  return (
    <div aria-hidden className="relative grid h-full min-h-[92px] place-items-center">
      <m.div
        className="relative h-[68px] w-[92px]"
        animate={reduced ? {} : { scale: snap ? 0.94 : [1, 1.04, 1] }}
        transition={reduced ? {} : snap ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className={`${corner} top-0 left-0 rounded-tl-[6px] border-t-2 border-l-2`} />
        <span className={`${corner} top-0 right-0 rounded-tr-[6px] border-t-2 border-r-2`} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-[6px] border-b-2 border-l-2`} />
        <span className={`${corner} bottom-0 right-0 rounded-br-[6px] border-b-2 border-r-2`} />
        {/* the shutter flash */}
        <m.span
          className="absolute inset-0 rounded-[8px] bg-white"
          animate={{ opacity: snap ? 0.85 : 0 }}
          transition={{ duration: 0.18 }}
        />
      </m.div>
    </div>
  )
}

/** Cell 3: two thumbnails trading places. The reference did this with
 *  `layout`; that needs `domMax`, so this animates opacity and offset. */
function Thumbnails({ reduced }: { reduced: boolean | null }) {
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setFlip((f) => !f), 2400)
    return () => window.clearInterval(id)
  }, [reduced])

  const sheets = [
    { g: 'linear-gradient(135deg,#F5D0E0,#E8A6C4)', z: 1 },
    { g: 'linear-gradient(135deg,#D8CCF7,#B49BF0)', z: 2 },
  ]
  return (
    <div aria-hidden className="relative grid h-full min-h-[92px] place-items-center">
      <div className="relative h-[64px] w-[104px]">
        {sheets.map((s, i) => {
          const front = reduced ? i === 1 : flip ? i === 0 : i === 1
          return (
            <m.span
              key={i}
              className="absolute top-0 h-[64px] w-[68px] rounded-[10px] border border-white/70"
              style={{ backgroundImage: s.g }}
              animate={{
                left: front ? 34 : 0,
                zIndex: front ? 2 : 1,
                scale: front ? 1 : 0.92,
                opacity: front ? 1 : 0.75,
              }}
              transition={reduced ? { duration: 0 } : { duration: 0.7, ease: EASE }}
            />
          )
        })}
      </div>
    </div>
  )
}

/** Cell 4: a caret typing a product name. */
const TYPED = 'Niacinamide 10%'

function TypeLine({ reduced }: { reduced: boolean | null }) {
  const [n, setN] = useState(reduced ? TYPED.length : 0)

  useEffect(() => {
    if (reduced) return
    let i = 0
    let hold = 0
    const id = window.setInterval(() => {
      if (hold > 0) {
        hold -= 1
        return
      }
      i = i >= TYPED.length ? 0 : i + 1
      setN(i)
      if (i === TYPED.length) hold = 10
    }, 130)
    return () => window.clearInterval(id)
  }, [reduced])

  return (
    <div aria-hidden className="grid h-full min-h-[92px] place-items-center">
      <span
        className="type-body rounded-[10px] px-3 py-2 font-medium"
        style={{ background: '#F5F6FD', minWidth: 168 }}
      >
        {TYPED.slice(0, n)}
        <m.span
          className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.16em] align-middle"
          style={{ background: 'var(--text-accent)' }}
          animate={reduced ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
          transition={reduced ? {} : { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </span>
    </div>
  )
}

/** Cell 5: a teal line sweeping a barcode. */
const BARS = [3, 2, 5, 2, 3, 6, 2, 4, 3, 2, 5, 3, 2, 6, 3, 4, 2, 3]

function BarcodeSweep({ reduced }: { reduced: boolean | null }) {
  return (
    <div aria-hidden className="grid h-full min-h-[92px] place-items-center">
      <div className="relative flex h-[62px] items-end gap-[3px] overflow-hidden rounded-[8px] px-3">
        {BARS.map((w, i) => (
          <span
            key={i}
            className="block h-full rounded-[1px]"
            style={{ width: w, background: '#1A2A5C', opacity: 0.78 }}
          />
        ))}
        <m.span
          className="absolute inset-y-0 w-[2px]"
          style={{
            background: 'var(--text-accent)',
            boxShadow: '0 0 12px 3px rgb(30 185 183 / 0.55)',
          }}
          initial={{ left: '4%' }}
          animate={reduced ? { left: '50%' } : { left: ['2%', '98%', '2%'] }}
          transition={reduced ? { duration: 0 } : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

/** Cell 6: keypad digits lighting in sequence. */
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

function Keypad({ reduced }: { reduced: boolean | null }) {
  const [lit, setLit] = useState(-1)

  useEffect(() => {
    if (reduced) return
    const order = [0, 4, 8, 5, 2, 7, 3]
    let step = 0
    const id = window.setInterval(() => {
      setLit(order[step % order.length])
      step += 1
    }, 520)
    return () => window.clearInterval(id)
  }, [reduced])

  return (
    <div aria-hidden className="grid h-full min-h-[92px] place-items-center">
      <div className="grid grid-cols-3 gap-1.5">
        {KEYS.map((k, i) => {
          const on = i === lit
          return (
            <m.span
              key={k}
              className="type-legal grid h-7 w-9 place-items-center rounded-[7px] font-medium"
              animate={{
                backgroundColor: on ? 'rgb(30 185 183 / 0.16)' : '#F5F6FD',
                color: on ? VERDICT_INK : 'var(--text-muted)',
                scale: on && !reduced ? 1.08 : 1,
              }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {k}
            </m.span>
          )
        })}
      </div>
    </div>
  )
}

/* ===========================================================================
   The hero cell
   =========================================================================== */

const RESULT = {
  product: 'Niacinamide 10% + Zinc 1% Serum',
  brand: 'Example product · brand not shown',
  verdict: 'Good match for your skin',
  basis: 'Based on your last analysis — oily, pigmentation, enlarged pores.',
  groups: [
    {
      label: 'Works for you',
      tone: TAG.positive,
      tags: ['Oil control', 'Pigmentation', 'Enlarged pores'],
    },
    {
      label: 'Be aware',
      tone: TAG.caution,
      tags: ['May irritate very dry skin', 'Introduce slowly'],
    },
  ],
  history: '12 checks in your history',
} as const

function ResultCell({ reduced }: { reduced: boolean | null }) {
  return (
    <m.article
      className={`${CELL} flex flex-col p-6 min-[769px]:col-span-2 min-[769px]:row-span-2 min-[1025px]:p-8`}
      {...rise(0, reduced)}
    >
      <ScanRings reduced={reduced} />

      <div className="relative">
        <p
          className="type-legal ink-muted flex items-center gap-2 uppercase"
          style={{ letterSpacing: '0.1em' }}
        >
          <BadgeCheck
            aria-hidden
            className="h-[18px] w-[18px] shrink-0"
            strokeWidth={2}
            style={{ color: 'var(--text-accent)' }}
          />
          Compatibility check
        </p>

        <h3 className="type-h3 mt-4">{RESULT.product}</h3>
        <p className="type-small ink-muted mt-1">{RESULT.brand}</p>

        <div className="mt-5 flex items-start gap-4">
          <DrawnCheck reduced={reduced} />
          <div className="min-w-0">
            {/* The words carry the verdict; the teal is agreement, never the
                only signal. */}
            <p className="type-h3" style={{ color: VERDICT_INK }}>
              {RESULT.verdict}
            </p>
            <p className="type-small mt-1">{RESULT.basis}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {RESULT.groups.map(({ label, tone, tags }, g) => (
            <div key={label}>
              <p className="type-legal ink-muted uppercase" style={{ letterSpacing: '0.1em' }}>
                {label}
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <m.li
                    key={tag}
                    className="type-legal rounded-full px-3 py-1.5"
                    style={{ background: tone.bg, color: tone.ink }}
                    {...(reduced
                      ? {}
                      : {
                          initial: { opacity: 0, scale: 0.86 },
                          whileInView: { opacity: 1, scale: 1 },
                          viewport: { once: true, amount: 0.4 } as const,
                          transition: { duration: 0.5, delay: 0.5 + g * 0.18 + i * 0.08, ease: EASE },
                        })}
                  >
                    {tag}
                  </m.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="relative mt-6 min-[1025px]:mt-auto min-[1025px]:pt-6">
        <span
          className="type-small ink-muted inline-flex items-center gap-2 rounded-full px-3.5 py-2"
          style={{ background: '#F5F6FD' }}
        >
          <History aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
          {RESULT.history}
        </span>
      </p>
    </m.article>
  )
}

/* ===========================================================================
   The grid
   =========================================================================== */

export function CompatibilityBento({ headingId }: { headingId: string }) {
  const reduced = useReducedMotion()

  return (
    <>
      <header className="mx-auto max-w-[660px] text-center">
        <m.p className="type-eyebrow" {...rise(0, reduced)}>
          In the app
        </m.p>
        <m.h2 id={headingId} className="type-h2 mt-3" {...rise(0.06, reduced)}>
          Scan a product. Know if your skin will agree.
        </m.h2>
        <m.p className="type-lead mt-[18px]" {...rise(0.12, reduced)}>
          Point the camera at a label, upload a photo, or just type the name — SkinTrix 360
          checks it against your own skin analysis.
        </m.p>
      </header>

      {/* 4 columns at ≥769px, and the spans close the grid with no holes:
          hero 2×2, camera 2 wide beside it, upload + name filling row 2, then
          barcode and manual 2 wide each across row 3. One column below that,
          hero first. */}
      <div className="mt-12 grid grid-cols-1 gap-4 min-[769px]:grid-cols-4 min-[1025px]:gap-5">
        <ResultCell reduced={reduced} />

        <m.article
          className={`${CELL} flex flex-col p-6 min-[769px]:col-span-2`}
          {...rise(0.1, reduced)}
        >
          <IconTile Icon={Camera} gradient={GRADIENT.camera} />
          <div className="mt-4 flex-1">
            <Viewfinder reduced={reduced} />
          </div>
          <CellCopy title="Capture with Camera" body="Take a photo of the product" />
        </m.article>

        <m.article className={`${CELL} flex flex-col p-6`} {...rise(0.18, reduced)}>
          <IconTile Icon={ImageUp} gradient={GRADIENT.upload} />
          <div className="mt-4 flex-1">
            <Thumbnails reduced={reduced} />
          </div>
          <CellCopy title="Upload Image" body="Choose from your photo library" />
        </m.article>

        <m.article className={`${CELL} flex flex-col p-6`} {...rise(0.26, reduced)}>
          <IconTile Icon={TypeIcon} gradient={GRADIENT.name} />
          <div className="mt-4 flex-1">
            <TypeLine reduced={reduced} />
          </div>
          <CellCopy title="Enter Product Name" body="Type the name + optional details" />
        </m.article>

        <m.article
          className={`${CELL} flex flex-col p-6 min-[769px]:col-span-2`}
          {...rise(0.34, reduced)}
        >
          <IconTile Icon={ScanBarcode} gradient={GRADIENT.barcode} />
          <div className="mt-4 flex-1">
            <BarcodeSweep reduced={reduced} />
          </div>
          <CellCopy title="Scan Barcode" body="Instant detection with the camera" />
        </m.article>

        <m.article
          className={`${CELL} flex flex-col p-6 min-[769px]:col-span-2`}
          {...rise(0.42, reduced)}
        >
          <IconTile Icon={Keyboard} gradient={GRADIENT.manual} />
          <div className="mt-4 flex-1">
            <Keypad reduced={reduced} />
          </div>
          <CellCopy title="Enter Barcode Manually" body="Paste or type the number" />
        </m.article>
      </div>

      {/* Without this the card reads as a check the website performed. */}
      <m.p className="type-small ink-muted mt-7 text-center" {...rise(0.5, reduced)}>
        Example result. Your check is based on your own skin analysis.
      </m.p>
    </>
  )
}
