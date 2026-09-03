import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/cn'
import { HERO_FILM } from '@/lib/media'
import { HERO, HERO_CLOSE } from '@/lib/site'
import { VIEWPORT, fadeUp, stagger } from '@/lib/motion'

/**
 * A port of the Claude Design file "Hero Section.dc.html" — the layout,
 * positioning, spacing, sizes, scroll behavior, floating cards and
 * connector lines below are all a deliberate 1:1 copy of that source and are
 * not to be redesigned. Typography and color are the one exception: both now
 * read from the site's shared design tokens (`src/styles/index.css`) instead
 * of the design file's own literal hex, so the Hero matches the rest of the
 * site's SkinTrix360 app palette and Nunito type instead of carrying its own
 * one-off serif/navy identity.
 *
 * The fixed 1840×1430 canvas, scaled uniformly to the section's width, is
 * the design's own technique (not a reinterpretation) — it's what lets ~30
 * absolute-pixel positions stay correct together at any width with a single
 * `scale()`, and is why this only runs at `md` and up: shrunk past that,
 * card copy heads into single-digit pixels. Below `md`, or with
 * `prefers-reduced-motion`, `SimpleHero` holds the same content and colors
 * still in a normal responsive flow — the one deliberate adaptation, since
 * the source has no mobile treatment of its own to copy.
 *
 * Its two CTAs use the site's shared `Button` — the source's own
 * `<header>` (logo + nav + two more buttons) is deliberately not
 * reproduced: it duplicates the site's existing fixed `Navbar`, and
 * stacking both produced a real, confirmed defect, not just a stylistic
 * difference — at page load the two headers' text overlapped into an
 * illegible mess, and the design header's own buttons were unclickable
 * underneath the real Navbar's higher z-index.
 */

const CANVAS_W = 1840
const CANVAS_H = 1430
/** Nothing in any stage — cards (deepest at ~957) or the closing block
 *  (deepest at ~1213) — ever reaches below this. The canvas itself stays
 *  1430 tall so every existing absolute position is untouched; only the
 *  pinned viewport's own height is sized to this instead, so the ~200px of
 *  permanently empty canvas below it isn't part of the scroll distance. */
const PIN_H = 1250

/**
 * Clear space under the fixed header, in unscaled viewport pixels.
 *
 * Deliberately small: at the top of the page the header paints no background
 * at all (the glass only appears once you scroll), so there is no edge for
 * this to clear — only a floating logo and button. The gap that reads as
 * right here is therefore much tighter than it would be under a solid bar.
 *
 * Applied as padding on the pinned stage, never as an offset inside the canvas.
 * The canvas's internal coordinates stay exactly as tuned and the whole
 * composition simply sits lower; pushing the intro's own `top` down instead
 * would have driven the headline into the film, which begins only 57 canvas
 * pixels below it. The pinned viewport grows by the same amount so nothing is
 * clipped, and the track grows with it so the scroll distance is unchanged.
 */
const HEADER_CLEARANCE = 20

const EASE_TRANSFORM = 'cubic-bezier(0.4,0,0.2,1)'

/** floaty — literal from the design's own <style> block. */
const FLOATY_KEYFRAMES = '@keyframes heroFloaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }'

const HERO_FILM_MASK = [
  'radial-gradient(64% 60% at 52% 40%, #000 46%, rgba(0,0,0,0) 100%)',
  'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 9%, #000 52%, rgba(0,0,0,0) 86%)',
].join(', ')

/** Same four positions in every card group — only the content changes. */
const SLOTS: { left: number; top: number; width: number }[] = [
  { left: 400, top: 514, width: 240 },
  { left: 370, top: 784, width: 250 },
  { left: 1200, top: 484, width: 240 },
  { left: 1230, top: 784, width: 250 },
]

/** floaty 7s/9s/8s/10s ease-in-out, one duration per slot, no delay — literal. */
const FLOAT_DURATIONS = [7, 9, 8, 10]

const BAR_HEIGHTS = [38, 70, 52, 92, 34, 62]
const BAR_OPACITIES = [0.22, 0.34, 0.46, 0.22, 0.34, 0.46]

const WAVE_CLIP = {
  a: 'polygon(0 72%, 12% 58%, 26% 66%, 40% 40%, 55% 52%, 70% 26%, 84% 44%, 100% 30%, 100% 100%, 0 100%)',
  b: 'polygon(0 78%, 14% 62%, 30% 70%, 46% 44%, 62% 56%, 78% 30%, 100% 46%, 100% 100%, 0 100%)',
} as const

type CardVisual =
  | { type: 'bars'; tint: string }
  | { type: 'wave'; shape: keyof typeof WAVE_CLIP; tint: string }

type CardDef = {
  title: string
  icon: string
  iconBg: string
  iconColor: string
  meta: string
  visual: CardVisual
}

/** The label that floats above the visual, one word per card group. */
const GROUP_LABELS = ['Skin Analysis', 'My Skincare Plan', 'Consultation']

const CARD_GROUPS: CardDef[][] = [
  [
    {
      title: 'Skin Type',
      icon: '◆',
      iconBg: 'rgba(107,182,216,0.16)',
      iconColor: '#4aa3d1',
      meta: 'Oily',
      visual: { type: 'bars', tint: '107,182,216' },
    },
    {
      title: 'Skin Concerns',
      icon: '◎',
      iconBg: 'rgba(227,96,154,0.14)',
      iconColor: '#e3609a',
      meta: 'Pigmentation',
      visual: { type: 'wave', shape: 'a', tint: '240,168,196' },
    },
    {
      title: 'Skin Condition',
      icon: '✓',
      iconBg: 'rgba(63,176,138,0.14)',
      iconColor: '#3fb08a',
      meta: 'Healthy',
      visual: { type: 'wave', shape: 'b', tint: '140,214,188' },
    },
    {
      title: 'Skin Analysis',
      icon: '✦',
      iconBg: 'rgba(107,182,216,0.16)',
      iconColor: '#4aa3d1',
      meta: 'AI-powered insights',
      visual: { type: 'bars', tint: '107,182,216' },
    },
  ],
  [
    {
      title: 'Morning Routine',
      icon: '☀',
      iconBg: 'rgba(233,180,120,0.18)',
      iconColor: '#c98b3f',
      meta: 'Cleanser · Moisturizer · SPF',
      visual: { type: 'wave', shape: 'b', tint: '236,196,152' },
    },
    {
      title: 'Evening Routine',
      icon: '☾',
      iconBg: 'rgba(107,120,216,0.14)',
      iconColor: '#6b78d8',
      meta: 'Treatment · Moisturizer',
      visual: { type: 'wave', shape: 'a', tint: '164,172,232' },
    },
    {
      title: 'Recommended',
      icon: '◈',
      iconBg: 'rgba(227,96,154,0.14)',
      iconColor: '#e3609a',
      meta: 'Personalized products',
      visual: { type: 'wave', shape: 'a', tint: '240,168,196' },
    },
    {
      title: 'Your Progress',
      icon: '↗',
      iconBg: 'rgba(63,176,138,0.14)',
      iconColor: '#3fb08a',
      meta: 'Skin improvement tracking',
      visual: { type: 'bars', tint: '140,214,188' },
    },
  ],
  [
    {
      title: 'AI Skin Insights',
      icon: '✦',
      iconBg: 'rgba(107,182,216,0.16)',
      iconColor: '#4aa3d1',
      meta: 'Review your results',
      visual: { type: 'bars', tint: '107,182,216' },
    },
    {
      title: 'Doctor Consultation',
      icon: '✚',
      iconBg: 'rgba(63,176,138,0.14)',
      iconColor: '#3fb08a',
      meta: 'Connect with a specialist',
      visual: { type: 'wave', shape: 'b', tint: '140,214,188' },
    },
    {
      title: 'Your Skin Report',
      icon: '▤',
      iconBg: 'rgba(107,120,216,0.14)',
      iconColor: '#6b78d8',
      meta: 'Share your analysis',
      visual: { type: 'wave', shape: 'a', tint: '164,172,232' },
    },
    {
      title: 'Treatment Guidance',
      icon: '◆',
      iconBg: 'rgba(233,180,120,0.18)',
      iconColor: '#c98b3f',
      meta: 'Professional advice',
      visual: { type: 'wave', shape: 'b', tint: '236,196,152' },
    },
  ],
]

/**
 * How many states the narrative has. Derived, not typed: the three card
 * groups, plus the opening headline and the closing statement.
 */
const STAGE_COUNT = CARD_GROUPS.length + 2

/**
 * Scroll budget per stage, as a fraction of viewport height.
 *
 * This is the fix. The hero used to be a `sticky` child inside a section
 * 120svh taller than itself, so the ENTIRE narrative — five states — shared
 * 120% of one viewport: about 216px per stage at a 900px window. A flick
 * covers that in a single frame, which is why the data never appeared.
 */
const STAGE_BUDGET_VH = 0.9
/** Shorter on a phone, where 90vh a stage is a very long freeze. */
const STAGE_BUDGET_VH_NARROW = 0.65

/**
 * One card set at a time — stage 0 is the clean intro, STAGE_COUNT-1 the close.
 *
 * Even bands of 1/N, so no stage can be shorter than any other. The stage
 * switches at the START of its band and then HOLDS for the rest of it, which
 * is what makes a fast flick land on something readable: the opacity/transform
 * transition on the cards is a fixed 0.4s CSS transition, so it completes
 * inside roughly the first quarter of a band (about 200px of scroll at
 * desktop) and the remaining three quarters are a hold at full opacity.
 *
 * The transition is deliberately NOT scrubbed to scroll position. Scrubbed
 * opacity means stopping mid-band leaves a card half-faded — and stopping
 * mid-stage to read it is the entire point of the budget.
 */
function stageFromProgress(p: number) {
  const band = Math.floor(p * STAGE_COUNT)
  return Math.min(STAGE_COUNT - 1, Math.max(0, band))
}

/**
 * The composition that has to stay on screen once the intro clears, in canvas
 * Y: the top edge of the film down to the bottom of the phone.
 */
const BAND_TOP = 364
const BAND_BOTTOM = 1162
/** The fixed header's own height, in viewport pixels. */
const HEADER_H = 72

/**
 * Where the visual comes to rest after the intro, in canvas units.
 *
 * Derived per viewport rather than fixed, because the canvas scales to viewport
 * *width* — so the band's height in pixels changes with width while the space
 * it has to sit in changes with height. One hardcoded value cannot serve both:
 * -230 left the phone cut off by 116px on a wide screen, and -370 fixed that
 * but pulled the portrait 29px up under the header with 163px left empty
 * underneath. This centres the band in the space below the header instead, so
 * the margins above and below come out equal at any size.
 *
 * Clamped to stay negative: the gesture is the visual moving *up* to make room
 * for the cards, and on a very tall viewport the centring maths would otherwise
 * ask it to move down.
 */
function restingShift(scale: number, viewportH: number) {
  const band = (BAND_BOTTOM - BAND_TOP) * scale
  const margin = Math.max(0, (viewportH - HEADER_H - band) / 2)
  const centred = (HEADER_H - HEADER_CLEARANCE + margin) / scale - BAND_TOP
  return Math.round(Math.min(-160, Math.max(-430, centred)))
}

function useViewportHeight() {
  const [vh, setVh] = useState(() => window.innerHeight)
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return vh
}

/** Width-driven only — the canvas never shrinks to fit the viewport's height. */
function useCanvasScale(ref: RefObject<HTMLElement | null>, canvasWidth: number) {
  const [scale, setScale] = useState(() => window.innerWidth / canvasWidth)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      if (el.clientWidth) setScale(el.clientWidth / canvasWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, canvasWidth])

  return scale
}

export function Hero() {
  const reduced = useReducedMotion()

  // The desktop canvas is authored at 1840px and scales uniformly, so at
  // phone widths it lands near 0.2x — the whole composition rendered at a
  // fifth size. Below `lg` the stacked composition is used instead, which is
  // designed for that width rather than shrunk into it.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (reduced) return <SimpleHero />
  if (isDesktop) return <ScrollHero />
  return <SimpleHero />
}

function ScrollHero() {
  const trackRef = useRef<HTMLElement>(null)
  const scale = useCanvasScale(trackRef, CANVAS_W)
  const viewportH = useViewportHeight()
  const [stage, setStage] = useState(0)

  /**
   * The pin, and the scroll budget that makes the stages unskippable.
   *
   * WHY GSAP AND NOT THE STICKY IT REPLACES
   * A `sticky` child holds still for exactly (parent height − child height) of
   * scroll, so the budget was a height calculation tangled up with the canvas
   * scale. ScrollTrigger's `end: '+=' + n` states the budget directly, in
   * viewport units, and recomputes it on resize.
   *
   * WHY A PROXY OBJECT
   * The stages are React state, so there is nothing for GSAP to tween. It
   * tweens `progress.p` from 0 to 1 instead and the component reads it — which
   * is what lets `scrub: 0.5` apply its smoothing to the value the stage is
   * derived FROM. A bare `ScrollTrigger.create` has no `scrub` to give.
   *
   * LENIS
   * Already wired, in `useSmoothScroll`: `lenis.on('scroll',
   * ScrollTrigger.update)` plus `gsap.ticker.add` driving `lenis.raf` with
   * `lagSmoothing(0)`. No `scrollerProxy` is needed here and adding one would
   * break it — Lenis is in its default window mode, where it writes real
   * `scrollTop` rather than transforming a wrapper, so ScrollTrigger's own
   * reading of window scroll is already the true position. `pinType` stays at
   * its default `fixed` for the same reason.
   *
   * `anticipatePin: 1` is for the flick specifically: at high velocity the pin
   * can otherwise engage a frame late and show a jump.
   */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    let disposed = false
    let mm: ReturnType<typeof import('gsap').gsap.matchMedia> | undefined

    void import('@/lib/gsap').then(({ gsap }) => {
      if (disposed) return
      mm = gsap.matchMedia()

      /* Three conditions covering every case, because `matchMedia` with a
         conditions OBJECT only runs the callback when at least one of them
         matches — a gap here means the hero silently never animates. */
      mm.add(
        {
          wide: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          narrow: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { narrow, reduce } = ctx.conditions as Record<string, boolean>

          /* No pin at all, and the opening headline rather than the close:
             stage 0 is the state that carries the h1, the lead and both
             calls to action, so it is the one that still reads as a hero
             when nothing moves. */
          if (reduce) {
            setStage(0)
            return
          }

          const perStage = narrow ? STAGE_BUDGET_VH_NARROW : STAGE_BUDGET_VH
          const progress = { p: 0 }

          const tween = gsap.to(progress, {
            p: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top top',
              /* A function so `invalidateOnRefresh` can re-read the viewport
                 on resize instead of freezing the first measurement. */
              end: () => '+=' + Math.round(STAGE_COUNT * perStage * window.innerHeight),
              pin: true,
              pinSpacing: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const next = stageFromProgress(progress.p)
              setStage((prev) => (prev === next ? prev : next))
            },
          })

          return () => {
            tween.scrollTrigger?.kill()
            tween.kill()
          }
        },
      )
    })

    return () => {
      disposed = true
      /* Reverts the pin wrapper GSAP inserted, so a route change or a
         breakpoint flip cannot leave an orphaned pin-spacer behind. */
      mm?.revert()
    }
  }, [])

  const stageHeight = PIN_H * scale
  const shift = stage === 0 ? 0 : restingShift(scale, viewportH)
  // One flag per card group (stages 1-3) — stage 4's closing state has its own opFinal below.
  const op = [1, 2, 3].map((n) => (stage === n ? 1 : 0))
  const opFinal = stage === 4 ? 1 : 0
  const opBrand = stage === 0 || stage === 4 ? 1 : 0
  const opIntro = stage === 0 ? 1 : 0
  const opLines = Math.max(...op)
  const cardY = (groupStage: number) => (stage === groupStage ? 0 : 26) + shift

  return (
    <section
      id="top"
      ref={trackRef}
      className="relative"
      /* The current stage, published so the pin can be verified from outside
         — the stages are otherwise only observable as opacities on a dozen
         separate nodes. Reflects state; nothing reads it back. */
      data-hero-stage={stage}
      /* Its own height only. The scroll budget is no longer baked into this
         box — ScrollTrigger's pin-spacer supplies it, which is what
         `pinSpacing: true` means: the pinned distance becomes real page
         height, so nothing below can overlap the hero. */
      style={{
        height: stageHeight + HEADER_CLEARANCE,
        background: 'var(--color-canvas)',
      }}
    >
      <style>{FLOATY_KEYFRAMES}</style>
      <div
        // Centred: the canvas is wider than the viewport, and scaling it
        // about its own midpoint only lands flush when that midpoint sits on
        // the container midpoint. Laid out flush-left it drifted right by
        // (CANVAS_W/2)(1-scale) — 200px at desktop, right off-screen on a phone.
        /* `sticky` is gone: GSAP pins the section above, and two pinning
           mechanisms on the same subtree fight each other. */
        className="flex justify-center overflow-hidden"
        style={{ height: stageHeight + HEADER_CLEARANCE, paddingTop: HEADER_CLEARANCE }}
      >
        <section
          className="relative shrink-0"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: '50% 0',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-ink)',
          }}
        >
          {/* Video + phone. One group so they move together as cards make room. */}
          <div
            className="absolute inset-0 z-[2]"
            style={{ transform: `translate(-480px, ${394 + shift}px)`, transition: `transform 0.5s ${EASE_TRANSFORM}` }}
          >
            <div className="absolute" style={{ right: -40, top: -30, width: 960, height: 960 }}>
              <HeroFilm className="absolute inset-0" />
            </div>

            <PhoneFrame style={{ left: 1235, top: 96, width: 330, height: 672 }} askPill={{ left: 27, right: 26, top: 596 }} />
          </div>

          {/* Intro: headline, lead, the two entry points. */}
          <div
            className="absolute inset-x-0 top-[68px] z-[9] flex flex-col items-center text-center"
            style={{ opacity: opIntro, pointerEvents: stage === 0 ? 'auto' : 'none', transition: 'opacity 0.4s ease' }}
          >
            <HeroHeading />
            <p className="mb-0 text-[19px] leading-[1.6]" style={{ color: 'var(--color-ink-soft)', maxWidth: 560, marginBottom: 4 }}>
              {HERO.lead}
            </p>
            <div className="flex items-center gap-[14px]">
              <Button href="#download" size="lg">
                {HERO.primary}
              </Button>
              <Button href="#explore" variant="secondary" size="lg" className="explore-wipe">
                {HERO.secondary}
              </Button>
            </div>
          </div>

          {/* The word above the visual, one per card group. */}
          <div
            className="absolute z-[8] flex justify-center pointer-events-none"
            style={{
              left: 755,
              top: 564,
              width: 330,
              transform: `translateY(${shift}px)`,
              transition: `transform 0.5s ${EASE_TRANSFORM}`,
            }}
          >
            <BrandLabel opacity={opBrand} label="SkinTrix360" duration={0.4} easing="ease" />
            {GROUP_LABELS.map((label, i) => (
              <BrandLabel key={label} opacity={op[i]} label={label} duration={0.2} easing="linear" />
            ))}
          </div>

          <ConnectorLines opacity={opLines} shift={shift} />

          {CARD_GROUPS.map((group, i) => (
            <div
              key={i}
              className="absolute inset-0 z-[7] pointer-events-none"
              style={{
                opacity: op[i],
                transform: `translateY(${cardY(i + 1)}px)`,
                // Opacity switches immediately — no fade-in — so the incoming
                // set is at full color the instant it's current; only the
                // vertical settle still eases.
                transition: 'transform 0.4s ease',
              }}
            >
              {group.map((card, slot) => (
                <GlassCard key={card.title} card={card} floatDuration={FLOAT_DURATIONS[slot]} style={{ position: 'absolute', ...SLOTS[slot] }} />
              ))}
            </div>
          ))}

          {/* Bottom-of-canvas vignette — always on, purely atmospheric. Its
              warm taupe tint (163,140,124) is a different hue from the
              canvas, not just a different shade, so wherever its radial
              gradient peaked it read as a visible warm-gray band against
              the flat canvas — removed rather than retinted, since a
              canvas-colored version of this gradient is a no-op. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 z-[4] h-[260px]"
            style={{
              top: 1130,
              background:
                'linear-gradient(180deg, color-mix(in oklab, var(--color-canvas) 0%, transparent) 0%, color-mix(in oklab, var(--color-canvas) 28%, transparent) 45%, color-mix(in oklab, var(--color-canvas) 72%, transparent) 78%, color-mix(in oklab, var(--color-canvas) 94%, transparent) 100%)',
            }}
          />

          {/* Close: the frame settles here once every set has cycled past. */}
          <div
            className="absolute inset-x-0 top-[945px] z-[9] flex flex-col items-center text-center"
            style={{
              opacity: opFinal,
              transform: `translateY(${stage === 4 ? 0 : 30}px)`,
              pointerEvents: stage === 4 ? 'auto' : 'none',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            <h2 className="text-[76px] leading-[1.04] tracking-[-1.4px]" style={{ fontWeight: 600, margin: '0 0 16px 0' }}>
              {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
            </h2>
            <p className="text-[19px] leading-[1.6]" style={{ color: 'var(--color-ink-soft)', maxWidth: 540, margin: '0 0 26px 0' }}>
              {HERO_CLOSE.lead}
            </p>
            <div className="flex items-center gap-[14px]">
              <Button href="#download" size="lg">
                {HERO_CLOSE.primary}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

function HeroHeading() {
  return (
    <h1 className="text-[76px] leading-[1.04] tracking-[-1.4px]" style={{ fontWeight: 600, margin: '0 0 4px 0' }}>
      {HERO.headline[0]}<br />{HERO.headline[1]}
    </h1>
  )
}

/**
 * Tablet's own canvas — not the desktop canvas scaled down. Desktop's cards
 * float over/beside a wide-set video; at 768–1279px there isn't room for that
 * without shrinking everything past legibility, so this stacks instead: intro,
 * then the video + phone as one unit, then a caption, then the four cards for
 * the current stage as a plain 2×2 grid below — all still driven by the same
 * `stage` (0–4) and the same `shift`-on-transition idea as desktop, just with
 * tablet's own base positions. No connector lines: they were tuned to
 * desktop's flanking geometry and don't have an equivalent here, and nothing
 * in what was asked for calls for reproducing that specific ornament.
 */
/** Tablet's own clearance. Its intro starts higher in canvas units (44 vs 96)
 *  and its canvas scales up past 1:1 across the range, so it needs more than
 *  desktop's to clear the header by a comparable margin. */
const TABLET_HEADER_CLEARANCE = 56

const TABLET_CANVAS_W = 900
const TABLET_CANVAS_H = 1280
const TABLET_PIN_H = 1120

const TABLET_VIS_TOP = 400
const TABLET_LABEL_TOP = 875
const TABLET_CARD_ROW_TOP = [920, 1134]
const TABLET_CLOSING_TOP = 660
const TABLET_SHIFT = -260

const TABLET_SLOTS: { left: number; width: number }[] = [
  { left: 40, width: 390 },
  { left: 470, width: 390 },
]

export function TabletHero() {
  const trackRef = useRef<HTMLElement>(null)
  const scale = useCanvasScale(trackRef, TABLET_CANVAS_W)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 300, damping: 48, mass: 0.3 })

  const [stage, setStage] = useState(0)
  useMotionValueEvent(p, 'change', (v) => {
    const next = stageFromProgress(v)
    setStage((prev) => (prev === next ? prev : next))
  })

  const stageHeight = TABLET_PIN_H * scale
  const shift = stage === 0 ? 0 : TABLET_SHIFT
  const op = [1, 2, 3].map((n) => (stage === n ? 1 : 0))
  const opFinal = stage === 4 ? 1 : 0
  const opBrand = stage === 0 || stage === 4 ? 1 : 0
  const opIntro = stage === 0 ? 1 : 0
  const cardY = (groupStage: number) => (stage === groupStage ? 0 : 26) + shift

  return (
    <section
      id="top"
      ref={trackRef}
      className="relative"
      style={{
        height: `calc(90svh + ${stageHeight + TABLET_HEADER_CLEARANCE}px)`,
        background: 'var(--color-canvas)',
      }}
    >
      <style>{FLOATY_KEYFRAMES}</style>
      <div
        // Centred: the canvas is wider than the viewport, and scaling it
        // about its own midpoint only lands flush when that midpoint sits on
        // the container midpoint. Laid out flush-left it drifted right by
        // (CANVAS_W/2)(1-scale) — 200px at desktop, right off-screen on a phone.
        className="sticky top-0 flex justify-center overflow-hidden"
        style={{ height: stageHeight + TABLET_HEADER_CLEARANCE, paddingTop: TABLET_HEADER_CLEARANCE }}
      >
        <section
          className="relative shrink-0"
          style={{
            width: TABLET_CANVAS_W,
            height: TABLET_CANVAS_H,
            transform: `scale(${scale})`,
            transformOrigin: '50% 0',
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-ink)',
          }}
        >
          {/* Intro: headline, lead, the two entry points. */}
          <div
            className="absolute inset-x-0 top-11 z-[9] flex flex-col items-center px-8 text-center"
            style={{ opacity: opIntro, pointerEvents: stage === 0 ? 'auto' : 'none', transition: 'opacity 0.4s ease' }}
          >
            <h1 className="text-[44px] leading-[1.08] tracking-[-1px]" style={{ fontWeight: 600, margin: '0 0 16px 0' }}>
              {HERO.headline[0]}<br />{HERO.headline[1]}
            </h1>
            <p className="mb-0 text-[16px] leading-[1.6]" style={{ color: 'var(--color-ink-soft)', maxWidth: 460, marginBottom: 22 }}>
              {HERO.lead}
            </p>
            <div className="flex items-center gap-3">
              <Button href="#download" size="md">
                {HERO.primary}
              </Button>
              <Button href="#explore" variant="secondary" size="md" className="explore-wipe">
                {HERO.secondary}
              </Button>
            </div>
          </div>

          {/* Video + phone, moving as one unit as the content below it changes. */}
          <div
            className="absolute inset-x-0 z-[2]"
            style={{ top: TABLET_VIS_TOP, transform: `translateY(${shift}px)`, transition: `transform 0.5s ${EASE_TRANSFORM}` }}
          >
            <div className="absolute" style={{ left: 190, top: -20, width: 460, height: 460 }}>
              <HeroFilm className="absolute inset-0" />
            </div>
            <PhoneFrame
              style={{ left: 540, top: 130, width: 200, height: 408 }}
              askPill={{ left: 16, right: 16, top: 362 }}
            />
          </div>

          {/* The word above the card zone, one per card group. */}
          <div
            className="absolute inset-x-0 z-[8] flex justify-center pointer-events-none"
            style={{ top: TABLET_LABEL_TOP, transform: `translateY(${shift}px)`, transition: `transform 0.5s ${EASE_TRANSFORM}` }}
          >
            <BrandLabel opacity={opBrand} label="SkinTrix360" duration={0.4} easing="ease" />
            {GROUP_LABELS.map((label, i) => (
              <BrandLabel key={label} opacity={op[i]} label={label} duration={0.2} easing="linear" />
            ))}
          </div>

          {CARD_GROUPS.map((group, i) => (
            <div key={i} className="absolute inset-x-0 z-[7] pointer-events-none" style={{ top: 0 }}>
              {group.map((card, slot) => (
                <GlassCard
                  key={card.title}
                  card={card}
                  floatDuration={FLOAT_DURATIONS[slot]}
                  style={{
                    position: 'absolute',
                    left: TABLET_SLOTS[slot % 2].left,
                    width: TABLET_SLOTS[slot % 2].width,
                    top: TABLET_CARD_ROW_TOP[Math.floor(slot / 2)],
                    opacity: op[i],
                    transform: `translateY(${cardY(i + 1)}px)`,
                    transition: 'transform 0.4s ease, opacity 0.2s linear',
                  }}
                />
              ))}
            </div>
          ))}

          {/* Close: the frame settles here once every set has cycled past. */}
          <div
            className="absolute inset-x-0 z-[9] flex flex-col items-center px-8 text-center"
            style={{
              top: TABLET_CLOSING_TOP,
              opacity: opFinal,
              transform: `translateY(${stage === 4 ? 0 : 20}px)`,
              pointerEvents: stage === 4 ? 'auto' : 'none',
              transition: 'opacity 0.45s ease, transform 0.45s ease',
            }}
          >
            <h2 className="text-[44px] leading-[1.08] tracking-[-1px]" style={{ fontWeight: 600, margin: '0 0 14px 0' }}>
              {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
            </h2>
            <p className="text-[16px] leading-[1.6]" style={{ color: 'var(--color-ink-soft)', maxWidth: 480, margin: '0 0 22px 0' }}>
              {HERO_CLOSE.lead}
            </p>
            <Button href="#download" size="md">
              {HERO_CLOSE.primary}
            </Button>
          </div>
        </section>
      </div>
    </section>
  )
}

function BrandLabel({
  label,
  opacity,
  duration,
  easing,
}: {
  label: string
  opacity: number
  duration: number
  easing: 'ease' | 'linear'
}) {
  return (
    <span
      className="absolute whitespace-nowrap text-white"
      style={{
        fontSize: 26,
        letterSpacing: 0.3,
        textShadow: '0 2px 18px rgba(11,31,51,0.55)',
        opacity,
        transition: `opacity ${duration}s ${easing}`,
      }}
    >
      {label}
    </span>
  )
}

function ConnectorLines({ opacity, shift }: { opacity: number; shift: number }) {
  const points: [number, number, number, number][] = [
    [646, 594, 842, 660],
    [626, 866, 852, 830],
    [1194, 564, 1000, 770],
    [1224, 866, 930, 930],
  ]

  return (
    <svg
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-[5]"
      style={{
        opacity,
        transform: `translateY(${shift}px)`,
        transition: `opacity 0.25s ease, transform 0.5s ${EASE_TRANSFORM}`,
      }}
    >
      {points.map(([x1, y1, x2, y2]) => (
        <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.75)" strokeWidth={1} />
      ))}
      {points.map(([, , x2, y2]) => (
        <circle
          key={`${x2}-${y2}`}
          cx={x2}
          cy={y2}
          r={4.5}
          fill="rgba(255,255,255,0.25)"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth={1.2}
        />
      ))}
    </svg>
  )
}

/**
 * The uploaded phone frame is the site's own `/mockup.png` — byte-identical,
 * confirmed by hash — just with a different placeholder chat line baked into
 * its lower band. The design's own overlay pill sits exactly over that band,
 * so using the raw asset (as the source does) rather than a redrawn chrome
 * renders correctly with no foreign brand text visible.
 *
 * `style`/`askPill` are positional only — every other visual detail (asset,
 * opacity, pill styling) is the one canonical version shared by every canvas
 * that places this frame.
 */
function PhoneFrame({
  style,
  askPill,
}: {
  style: CSSProperties
  askPill: { left: number; right: number; top: number }
}) {
  return (
    <div className="absolute" style={style}>
      <img
        src="/mockup.png"
        alt="SkinTrix360 app frame"
        width={697}
        height={1416}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ objectFit: 'fill', opacity: 0.92, filter: 'drop-shadow(0 26px 60px rgba(11,31,51,0.13))' }}
      />
      <div
        className="absolute flex items-center justify-between rounded-full"
        style={{
          left: askPill.left,
          right: askPill.right,
          top: askPill.top,
          height: 40,
          padding: '0 20px',
          background: 'rgba(214,178,152,0.30)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <span style={{ fontSize: 12.5, letterSpacing: 0.2, color: 'rgba(255,255,255,0.88)' }}>Ask SkinTrix anything…</span>
        <span className="flex items-center gap-[2px]" style={{ height: 16 }}>
          {[5, 10, 16, 8, 12, 5].map((h, i) => (
            <span
              key={i}
              className="rounded-[2px]"
              style={{ width: 2, height: h, background: `rgba(255,255,255,${[0.8, 0.85, 0.95, 0.85, 0.9, 0.8][i]})` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

function GlassCard({
  card,
  style,
  floatDuration = 7,
}: {
  card: CardDef
  style?: CSSProperties
  floatDuration?: number
}) {
  return (
    <div
      className="overflow-hidden rounded-[22px] border border-white/75 bg-white/55 px-5 pt-5 backdrop-blur-[26px] backdrop-saturate-[1.4] motion-reduce:animate-none"
      style={{ animation: `heroFloaty ${floatDuration}s ease-in-out infinite`, ...style }}
    >
      <p className="text-[22px] leading-none font-normal tracking-[-0.3px]" style={{ color: 'var(--color-ink)', marginBottom: 13 }}>
        {card.title}
      </p>
      <div className="mb-3.5 flex items-center" style={{ gap: 9 }}>
        <span
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px]"
          style={{ background: card.iconBg, color: card.iconColor }}
        >
          {card.icon}
        </span>
        <span className="text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>
          {card.meta}
        </span>
      </div>

      {card.visual.type === 'bars' ? (
        <div className="mb-5 flex h-9 items-end gap-1.5">
          {BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px]"
              style={{ height: `${height}%`, background: `rgba(${card.visual.tint}, ${BAR_OPACITIES[i]})` }}
            />
          ))}
        </div>
      ) : (
        <div
          className="-mx-5 h-14"
          style={{
            background: `linear-gradient(180deg, rgba(${card.visual.tint}, 0.45), rgba(${card.visual.tint}, 0.04))`,
            clipPath: WAVE_CLIP[card.visual.shape],
          }}
        />
      )}
    </div>
  )
}

/**
 * The blob-masked video. Reduced motion holds the first frame; the
 * mask/autoplay-retry logic mirrors the previous hero's `Film`, which already
 * worked around React reflecting `muted` as a property rather than an
 * attribute.
 */
function HeroFilm({ className }: { className?: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = video.current
    if (!el) return

    if (reduced) {
      el.pause()
      return
    }

    const start = () => {
      el.muted = true
      void el.play().catch(() => {})
    }

    start()
    el.addEventListener('canplay', start)
    return () => el.removeEventListener('canplay', start)
  }, [reduced])

  return (
    <div className={cn('overflow-hidden', className)}>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: '51% 22%',
          maskImage: HERO_FILM_MASK,
          WebkitMaskImage: HERO_FILM_MASK,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
        src={HERO_FILM}
        autoPlay={!reduced}
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden
        tabIndex={-1}
      />
      {/* Matches the mask's own ellipse (64% 60% at 52% 40%) so the fade to
          canvas happens on every side, not just the bottom — the footage's
          own background is close to, but not exactly, the site's canvas
          color, so wherever the mask alone was doing the fading, that
          mismatch showed through as a faint seam. This starts past the
          mask's fully-opaque radius (46%) so it never dims the video
          itself, and reaches solid canvas well before the mask's own 100%
          cutoff, so the two fades overlap rather than leaving a gap. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(64% 60% at 52% 40%, transparent 0%, transparent 48%, var(--color-canvas) 80%, var(--color-canvas) 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 100%, color-mix(in oklab, var(--color-canvas) 85%, transparent) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

/**
 * Reduced motion, and anything under `md`: the same story told all at once,
 * holding still, rather than scrubbed by the scrollbar — the fixed-canvas
 * composition above shrinks card copy into single-digit pixels well before
 * phone width. Same colors, type and content as the desktop version; no
 * header (the source has none for this width, and the site's own Navbar
 * already has a working mobile menu).
 */
function SimpleHero() {
  const firstGroup = useMemo(() => CARD_GROUPS[0], [])

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-24 pb-0 md:pt-28"
      /* `--color-canvas`, not `--surface`. `--surface` is #FFFFFF, so this —
         the hero that renders at ≤768px — was the one section on the site
         still painting pure white, while its desktop and tablet counterparts
         both used the canvas token. It is the page ground, not a card. */
      style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}
    >
      <style>{FLOATY_KEYFRAMES}</style>

      <div className="shell text-center">
        <Reveal>
          <h1
            className="mx-auto max-w-[18ch] text-[clamp(2.15rem,1.3rem+2.4vw,3.5rem)] leading-[1.06] tracking-[-0.03em]"
            style={{ fontWeight: 600 }}
          >
            {HERO.headline[0]}
            <br />
            {HERO.headline[1]}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <p
            className="mx-auto mt-5 max-w-[26rem] text-[1.0625rem] leading-[1.6]"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            {HERO.lead}
          </p>
        </Reveal>

        {/* Inline and auto-width. Two full-bleed slabs stacked on a phone read
            as a form, not a call to action. */}
        <Reveal delay={0.16}>
          {/* Equal cells: below sm these stack, and two different widths
              read as unconsidered rather than as a pair. */}
          <div className="mx-auto mt-7 grid w-full max-w-[19rem] grid-cols-1 gap-3 sm:max-w-none sm:grid-flow-col sm:justify-center">
            <Button href="#download" size="lg" className="w-full sm:w-auto">
              {HERO.primary}
            </Button>
            <Button href="#download" variant="secondary" size="lg" className="explore-wipe w-full sm:w-auto">
              {HERO.secondary}
            </Button>
          </div>
        </Reveal>
      </div>

      {/* One device carrying the film, standing on the section's lower edge.
          These were two separate elements before — a circular crop of the film,
          then an empty phone frame beneath it — which is why the mobile hero
          read as a floating face above an unrelated mockup. */}
      <Reveal delay={0.2} className="mt-12 flex justify-center">
        <div
          className="relative -mb-10 sm:-mb-14"
          style={{ width: 'clamp(15rem, 62vw, 21rem)', aspectRatio: '697 / 1416' }}
        >
          {/* `mockup.png` is a frame with a transparent display, so the film
              sits underneath it at the screen's inset. */}
          <div className="absolute overflow-hidden" style={{ inset: '3.6%', borderRadius: '11%' }}>
            <HeroFilm className="h-full w-full" />
          </div>
          <img
            src="/mockup.png"
            alt="SkinTrix360 app frame"
            width={697}
            height={1416}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            style={{ objectFit: 'fill' }}
          />
        </div>
      </Reveal>

      {/* Below `sm`, a 2-col grid gives each of these four cards ~160px of
          width — too narrow for their 22px title plus a chart. A scroll-snap
          row lets every card keep its full size; swiping reveals the rest
          instead of shrinking to fit. */}
      <m.ul
        className="shell mt-20 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:pb-0"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        variants={stagger(0.08)}
      >
        {firstGroup.map((card, i) => (
          <m.li
            key={card.title}
            variants={fadeUp}
            className="relative h-[10rem] w-[clamp(13rem,72vw,15rem)] shrink-0 snap-start sm:w-auto"
          >
            <GlassCard card={card} floatDuration={FLOAT_DURATIONS[i]} style={{ height: '100%', width: '100%' }} />
          </m.li>
        ))}
      </m.ul>

      <Reveal className="shell mt-20 pb-20 text-center">
        <h2
          className="mx-auto max-w-[16ch] text-[clamp(1.85rem,1.2rem+1.9vw,2.75rem)] leading-[1.1] tracking-[-0.03em]"
          style={{ fontWeight: 600 }}
        >
          {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
        </h2>
        <p
          className="mx-auto mt-4 max-w-[26rem] text-[1.0625rem] leading-[1.6]"
          style={{ color: 'var(--color-ink-soft)' }}
        >
          {HERO_CLOSE.lead}
        </p>
        <div className="mt-6 flex justify-center">
          <Button href="#download" size="lg">
            {HERO_CLOSE.primary}
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
