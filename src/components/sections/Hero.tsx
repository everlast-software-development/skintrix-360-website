import type { CSSProperties } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { HERO_FILM } from '@/lib/media'
import { HERO, HERO_CLOSE } from '@/lib/site'

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
const FLOATY_KEYFRAMES =
  '@keyframes heroFloaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }'

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
  { type: 'bars'; tint: string } | { type: 'wave'; shape: keyof typeof WAVE_CLIP; tint: string }

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
 * The hero used to be a `sticky` child inside a section 120svh taller than
 * itself, so the ENTIRE narrative — five states — shared 120% of one
 * viewport: about 216px per stage at a 900px window. A flick covered that
 * in a single frame, which is why the data never appeared. Pinning it and
 * buying real distance fixed that.
 *
 * IT THEN OVERSHOT. 90svh a stage measured 7 to 11 wheel notches per stage
 * at 1440 — a 4049px pin for five states. Halving that (45/38/30) then
 * UNDERSHOT on phones: 30svh is ~280px a stage at 430, one short swipe, so
 * the sequence read as already over. These are the correction — a stage is
 * half a viewport or more at every width.
 *
 * READ BY BOTH VARIANTS. `ScrollHero` only ever renders at ≥1025px so it
 * only ever uses the first of these, and `SimpleHero` — everything below —
 * picks between the other two. They used to be typed out again as bare
 * literals inside SimpleHero, which is how the two drifted apart.
 */
/** ≥1025px. */
const STAGE_BUDGET_VH = 0.55
/** 769–1024px. */
const STAGE_BUDGET_VH_TAB = 0.5
/** ≤768px. */
const STAGE_BUDGET_VH_NARROW = 0.45

/**
 * One card set at a time — stage 0 is the clean intro, STAGE_COUNT-1 the close.
 *
 * Even bands of 1/N, so no stage can be shorter than any other. The stage
 * switches at the START of its band and then HOLDS for the rest of it, which
 * is what makes a fast flick land on something readable.
 *
 * THE TRANSITION/HOLD SPLIT IS NOT A NUMBER ANYWHERE. The crossfade is a
 * fixed 0.4s CSS transition — wall-clock time — while the band is a
 * distance. What fraction of a band the crossfade occupies is therefore
 * `0.4s ÷ (band px ÷ scroll speed)`, and it moves with how fast the visitor
 * is scrolling. Halving the band halves the time spent crossing it at any
 * given speed, so the same 0.4s now covers twice the share it used to: the
 * old ~25%/75% split became ~50%/50% for free, with no CSS touched.
 *
 * And when the visitor STOPS, the hold is unbounded and the crossfade always
 * finishes in 0.4s — so "readable at rest" holds at any band length.
 *
 * The transition is deliberately NOT scrubbed to scroll position. Scrubbed
 * opacity means stopping mid-band leaves a card half-faded — and stopping
 * mid-stage to read it is the entire point of the budget.
 */
function stageFromProgress(p: number) {
  // A trigger that has not measured yet reports NaN; that is the headline, not the close.
  if (!Number.isFinite(p) || p <= 0) return 0
  const band = Math.floor(p * STAGE_COUNT)
  return Math.min(STAGE_COUNT - 1, Math.max(0, band))
}

/**
 * The pin for both hero variants.
 *
 * THE STAGE IS READ FROM THE TRIGGER, NEVER FROM A TWEEN. This used to be
 * `gsap.to({ p: 0 }, { p: 1, scrollTrigger: { scrub } })` with the stage
 * derived from `p`. That tween is a timed animation the trigger is merely
 * supposed to be holding — if the trigger ever fails to take it over, GSAP
 * plays it over its default 0.5s and the hero lands on the closing stage with
 * no scroll at all. `ScrollTrigger.create` has no timeline to run, so the only
 * input left is the real scroll position.
 *
 * `onRefresh` covers the two ways the page can already be past the start
 * when the trigger is built: a load that lands mid-page (a hash, a browser
 * restore that beat the reset in main.tsx) and a remount across the 1025
 * breakpoint. Both used to show stage 0 until the next scroll event.
 */
function createHeroPin(
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
  el: HTMLElement,
  perStage: number,
  setStage: (next: number) => void,
) {
  const sync = (self: { progress: number }) => setStage(stageFromProgress(self.progress))
  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    /* A function so every refresh re-reads the small viewport. */
    end: () => '+=' + Math.round(STAGE_COUNT * perStage * readSvh()),
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: sync,
    onRefresh: sync,
  })
  sync(st)
  return st
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
  /* `clientWidth`, not `window.innerWidth`: innerWidth INCLUDES the vertical
     scrollbar, so seeding from it scales the canvas ~1% too large for one
     paint and the composition lands slightly off to the right until the
     ResizeObserver below corrects it. clientWidth is the width the canvas
     actually gets. */
  const [scale, setScale] = useState(() => document.documentElement.clientWidth / canvasWidth)

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
  // fifth size. Below the cut the stacked composition is used instead, which
  // is designed for that width rather than shrunk into it.
  //
  // 1025, not 1024: every tier in the hero — the pin budget, the card count,
  // the CTA sizes — splits at 1025, and ScrollHero's own matchMedia already
  // did. At exactly 1024 the canvas scaled to 0.556 and rendered 29px-tall
  // buttons, which is the width the stacked layout is for.
  const isDesktop = useMediaQuery('(min-width: 1025px)')

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
   * NO TWEEN, NO SCRUB
   * The stages are React state, read straight off the trigger's progress in
   * `createHeroPin`. There used to be a proxy tween with `scrub: 0.5` here;
   * see that function for why it was removed. Stages are held bands with
   * their own CSS crossfade, so scrub smoothing added lag and nothing else.
   *
   * SCROLLING
   * The page scrolls NATIVELY. ScrollTrigger listens to the native `scroll`
   * event itself, so there is no proxy, no ticker bridge and nothing here to
   * keep in step with a smoothed position. This used to run through Lenis,
   * and removing it changed nothing at this call site: Lenis ran in its
   * default window mode, writing real `scrollTop` rather than transforming a
   * wrapper, so ScrollTrigger's reading of window scroll was already the true
   * position either way. No `scrollerProxy` is needed and adding one would
   * break it; `pinType` stays at its default `fixed` for the same reason.
   *
   * `anticipatePin: 1` is for the flick specifically: at high velocity the pin
   * can otherwise engage a frame late and show a jump.
   */
  /* `useLayoutEffect`, not `useEffect`. GSAP's pin MOVES this section into a
     `.pin-spacer` wrapper it creates. A passive effect's cleanup can run after
     React has already tried to detach the section from its original parent —
     which threw `Failed to execute 'removeChild' on 'Node'` when the 1024
     breakpoint swapped the variant, corrupted the tree, and left the hero gone
     for the rest of the session even on resizing back up. A layout effect's
     cleanup is synchronous and runs first, so `mm.revert()` unwraps the spacer
     while the node is still where React expects it. */
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return

    let disposed = false
    let mm: ReturnType<typeof import('gsap').gsap.matchMedia> | undefined

    void import('@/lib/gsap').then(({ gsap, ScrollTrigger }) => {
      if (disposed) return
      mm = gsap.matchMedia()

      /* Three conditions covering every case, because `matchMedia` with a
         conditions OBJECT only runs the callback when at least one of them
         matches — a gap here means the hero silently never animates. */
      mm.add(
        {
          wide: '(min-width: 1025px) and (prefers-reduced-motion: no-preference)',
          tab: '(min-width: 769px) and (max-width: 1024px) and (prefers-reduced-motion: no-preference)',
          narrow: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { tab, narrow, reduce } = ctx.conditions as Record<string, boolean>

          /* No pin at all, and the opening headline rather than the close:
             stage 0 is the state that carries the h1, the lead and both
             calls to action, so it is the one that still reads as a hero
             when nothing moves. */
          if (reduce) {
            setStage(0)
            return
          }

          /* The three-tier budget: 55svh per stage at desktop, 50 at tablet,
             45 on a phone. `ScrollHero` only mounts at ≥1025px, so in practice
             this always resolves to the desktop tier — the other two branches
             are what `SimpleHero` uses. */
          const perStage = narrow ? STAGE_BUDGET_VH_NARROW : tab ? STAGE_BUDGET_VH_TAB : STAGE_BUDGET_VH
          const st = createHeroPin(ScrollTrigger, el, perStage, setStage)

          return () => st.kill()
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

  /**
   * The second half of the resize fix, and the deterministic half.
   *
   * `useScrollRefresh` refreshes on a debounced `resize` event. This one keys off
   * `scale` and `viewportH` themselves, so it cannot run before React has
   * committed the new size — the effect IS the commit. `stageHeight` below is
   * `PIN_H * scale` and is the pinned element's inline height, so a changed
   * `scale` means every measurement ScrollTrigger holds is out of date.
   *
   * Both are needed. The resize listener catches a viewport change that does
   * not alter `scale` (height-only, which moves `restingShift`); this catches a
   * `scale` change that arrives from the `ResizeObserver` without a `resize`
   * event at all — a devtools width drag does exactly that.
   */
  useEffect(() => {
    let timer: number | undefined
    let cancelled = false
    void import('@/lib/gsap').then(({ ScrollTrigger }) => {
      if (cancelled) return
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 160)
    })
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [scale, viewportH])

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
      /* NO `height` here. GSAP's pin writes `style.height` onto this very
         element, and React writing it too means both own one property — GSAP
         wrote last, so at 1024 the section stayed frozen at the 1440 height
         (measured: inline 999px where 716px was correct) and never recovered
         without a reload. The inner div below already carries the same height,
         so the section still sizes to exactly the same box; it is just no
         longer contested, and a refresh can re-read it. */
      style={{ background: 'var(--color-canvas)' }}
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
        style={{
          height: stageHeight + HEADER_CLEARANCE,
          paddingTop: HEADER_CLEARANCE,
        }}
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
            style={{
              transform: `translate(-480px, ${394 + shift}px)`,
              transition: `transform 0.5s ${EASE_TRANSFORM}`,
            }}
          >
            <div className="absolute" style={{ right: -40, top: -30, width: 960, height: 960 }}>
              <HeroFilm className="absolute inset-0" />
            </div>

            <PhoneFrame
              style={{ left: 1235, top: 96, width: 330, height: 672 }}
              askPill={{ left: 27, right: 26, top: 596 }}
            />
          </div>

          {/* Intro: headline, lead, the two entry points. */}
          <div
            className="absolute inset-x-0 top-[68px] z-[9] flex flex-col items-center text-center"
            style={{
              opacity: opIntro,
              pointerEvents: stage === 0 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease',
            }}
          >
            <HeroHeading />
            <p
              className="mb-0 text-[19px] leading-[1.6]"
              style={{
                color: 'var(--color-ink-soft)',
                maxWidth: 560,
                marginBottom: 4,
              }}
            >
              {HERO.lead}
            </p>
            <div className="hero-ctas flex flex-wrap items-center justify-center gap-3">
              <Button href="#download" size="lg" className="hero-cta">
                {HERO.primary}
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg" className="hero-cta explore-wipe">
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
                <GlassCard
                  key={card.title}
                  card={card}
                  floatDuration={FLOAT_DURATIONS[slot]}
                  style={{ position: 'absolute', ...SLOTS[slot] }}
                />
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
            <h2
              className="text-[76px] leading-[1.04] tracking-[-1.4px]"
              style={{ fontWeight: 600, margin: '0 0 16px 0' }}
            >
              {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
            </h2>
            <p
              className="text-[19px] leading-[1.6]"
              style={{
                color: 'var(--color-ink-soft)',
                maxWidth: 540,
                margin: '0 0 26px 0',
              }}
            >
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
    <h1
      className="text-[76px] leading-[1.04] tracking-[-1.4px]"
      style={{ fontWeight: 600, margin: '0 0 4px 0' }}
    >
      {HERO.headline[0]}
      <br />
      {HERO.headline[1]}
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
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })
  const p = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 48,
    mass: 0.3,
  })

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
        style={{
          height: stageHeight + TABLET_HEADER_CLEARANCE,
          paddingTop: TABLET_HEADER_CLEARANCE,
        }}
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
            style={{
              opacity: opIntro,
              pointerEvents: stage === 0 ? 'auto' : 'none',
              transition: 'opacity 0.4s ease',
            }}
          >
            <h1
              className="text-[44px] leading-[1.08] tracking-[-1px]"
              style={{ fontWeight: 600, margin: '0 0 16px 0' }}
            >
              {HERO.headline[0]}
              <br />
              {HERO.headline[1]}
            </h1>
            <p
              className="mb-0 text-[16px] leading-[1.6]"
              style={{
                color: 'var(--color-ink-soft)',
                maxWidth: 460,
                marginBottom: 22,
              }}
            >
              {HERO.lead}
            </p>
            <div className="flex items-center gap-3">
              <Button href="#download" size="md">
                {HERO.primary}
              </Button>
              <Button href="#how-it-works" variant="secondary" size="md" className="explore-wipe">
                {HERO.secondary}
              </Button>
            </div>
          </div>

          {/* Video + phone, moving as one unit as the content below it changes. */}
          <div
            className="absolute inset-x-0 z-[2]"
            style={{
              top: TABLET_VIS_TOP,
              transform: `translateY(${shift}px)`,
              transition: `transform 0.5s ${EASE_TRANSFORM}`,
            }}
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
            style={{
              top: TABLET_LABEL_TOP,
              transform: `translateY(${shift}px)`,
              transition: `transform 0.5s ${EASE_TRANSFORM}`,
            }}
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
            <h2
              className="text-[44px] leading-[1.08] tracking-[-1px]"
              style={{ fontWeight: 600, margin: '0 0 14px 0' }}
            >
              {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
            </h2>
            <p
              className="text-[16px] leading-[1.6]"
              style={{
                color: 'var(--color-ink-soft)',
                maxWidth: 480,
                margin: '0 0 22px 0',
              }}
            >
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
  /** Defaults to the desktop canvas's own 26px. The small-width hero passes a
      fluid size instead, because 26px on a 240px-wide device overruns the
      screen. Optional so the desktop call sites are untouched. */
  fontSize = 26,
}: {
  label: string
  opacity: number
  duration: number
  easing: 'ease' | 'linear'
  fontSize?: number | string
}) {
  return (
    <span
      className="absolute whitespace-nowrap text-white"
      style={{
        fontSize,
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
        <line
          key={`${x1}-${y1}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={1}
        />
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
        style={{
          objectFit: 'fill',
          opacity: 0.92,
          filter: 'drop-shadow(0 26px 60px rgba(11,31,51,0.13))',
        }}
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
        <span
          style={{
            fontSize: 12.5,
            letterSpacing: 0.2,
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          Ask SkinTrix anything…
        </span>
        <span className="flex items-center gap-[2px]" style={{ height: 16 }}>
          {[5, 10, 16, 8, 12, 5].map((h, i) => (
            <span
              key={i}
              className="rounded-[2px]"
              style={{
                width: 2,
                height: h,
                background: `rgba(255,255,255,${[0.8, 0.85, 0.95, 0.85, 0.9, 0.8][i]})`,
              }}
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
      className="hero-card overflow-hidden rounded-[22px] border border-white/75 bg-white/55 px-5 pt-5 backdrop-blur-[26px] backdrop-saturate-[1.4] motion-reduce:animate-none"
      style={{
        animation: `heroFloaty ${floatDuration}s ease-in-out infinite`,
        ...style,
      }}
    >
      <p
        className="hero-card__title text-[22px] leading-none font-normal tracking-[-0.3px]"
        style={{ color: 'var(--color-ink)', marginBottom: 13 }}
      >
        {card.title}
      </p>
      <div className="hero-card__meta mb-3.5 flex items-center" style={{ gap: 9 }}>
        <span
          className="hero-card__glyph grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px]"
          style={{ background: card.iconBg, color: card.iconColor }}
        >
          {card.icon}
        </span>
        <span className="hero-card__metatext text-[12.5px]" style={{ color: 'var(--color-ink-soft)' }}>
          {card.meta}
        </span>
      </div>

      {card.visual.type === 'bars' ? (
        <div className="hero-card__chart hero-card__chart--bars mb-5 flex h-9 items-end gap-1.5">
          {BAR_HEIGHTS.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-[3px]"
              style={{
                height: `${height}%`,
                background: `rgba(${card.visual.tint}, ${BAR_OPACITIES[i]})`,
              }}
            />
          ))}
        </div>
      ) : (
        <div
          className="hero-card__chart hero-card__chart--wave -mx-5 h-14"
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
 * `100svh` in pixels. There is no `window.innerSmallHeight`, so it is measured
 * from a throwaway element. `svh` and not `vh` because the address bar
 * collapsing changes `vh` mid-pin, which re-evaluates `end` and jumps.
 */
function readSvh() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const h = probe.getBoundingClientRect().height || window.innerHeight
  probe.remove()
  return h
}

/**
 * The two calls to action.
 *
 * The row HUGS ITS CONTENT — `w-auto` with `justify-center`, not a grid whose
 * columns stretch. It was a `grid w-full max-w-[19rem] grid-flow-col`, which is
 * why around 800px the pair spanned almost the whole container and the two
 * buttons came out different widths: grid tracks sized to their content
 * independently, so "Download the App" was simply wider than "Scan your skin".
 *
 * Both buttons take the SAME `min-width` per tier and let padding absorb the
 * difference, so the pair is balanced by construction rather than by eye. The
 * sizing lives in the stylesheet below rather than in classes because it has to
 * beat `Button`'s own `h-14`, and because the inner `.btn-glossy__wrap` (which
 * carries the horizontal padding) is not reachable from a `className` here.
 */
function HeroCtas() {
  return (
    <div className="hero-ctas mx-auto mt-7 flex flex-wrap items-center justify-center gap-3">
      <Button href="#download" size="lg" className="hero-cta">
        {HERO.primary}
      </Button>
      <Button href="#how-it-works" variant="secondary" size="lg" className="hero-cta explore-wipe">
        {HERO.secondary}
      </Button>
    </div>
  )
}

/**
 * The hero below 1025px — and it now carries the stage sequence, which is the
 * point of this component rather than a nicety.
 *
 * WHAT CHANGED AND WHY
 * This used to be a static, tall flow layout: headline, then device, then the
 * closing block, all stacked, ~1400-1800px tall, with no pin and no stage
 * label. So the feature — the label inside the screen cycling SkinTrix360 →
 * Skin Analysis → My Skincare Plan → Consultation → SkinTrix360 as you scroll
 * — simply did not exist under 1025px. It does now, at every width down to
 * 375, driven by the same `stageFromProgress` the desktop canvas uses.
 *
 * It is a SEPARATE component from `ScrollHero` on purpose: the desktop variant
 * is a fixed 1840px canvas with ~30 absolute positions and must stay
 * pixel-identical, while this one is a fluid layout. What they now share is the
 * behaviour — the same stage function, the same svh budget rule, the same
 * `createHeroPin` — rather than the same markup.
 *
 * THE STAGE STATES ARE OVERLAID, NOT STACKED
 * Intro and closing occupy the same box and cross-fade; only the device is
 * always present. That is what keeps the section exactly `100svh` at every
 * stage, so the pin has a stable height and the page length does not jump
 * mid-sequence.
 */
/** "My Skincare Plan", the longest label, is ~7.5em; at 0.1 x --dw it fits the
    screen's ~0.87 x --dw with room either side. */
const HERO_LABEL_SIZE = 'clamp(12px, calc(var(--dw) * 0.1), 22px)'

/** A flanking card is 0.9 x --dw, floored at 10.5rem. Its 20px padding is the
    same as every sibling's; what failed at 1024x768 was the WIDTH — --dw came
    out at 164px there, leaving a 105px content box for the 121px word
    "Consultation", which ran through the right padding to 4px off the edge.
    10.5rem gives the widest title word its full padding at every tier. */
const HERO_CARD_W = 'max(calc(var(--dw) * 0.9), 10.5rem)'

function SimpleHero() {
  const trackRef = useRef<HTMLElement>(null)
  const [stage, setStage] = useState(0)

  /**
   * THE CLIMB, AS A SHARE OF THE RISER'S OWN HEIGHT — the desktop motion.
   *
   * The 1440 canvas moves its film-and-phone group from y=394 to y=233 at
   * stage 1 and holds there: 161 canvas px, which is 0.24 x the device's
   * height. This reproduces that exact ratio at every width below 1025.
   *
   * A percentage translateY resolves against the element's OWN height, and the
   * riser is the device plus the film's overhang above it:
   *   0.382 x --dw  +  2.032 x --dw  =  2.414 x --dw
   * The move from stage 0 to stage 1 is the 4% nudge plus this, so for the
   * desktop's 0.24 x device height:
   *   0.24 x 2.032 x --dw = 0.488 x --dw
   *   0.488 / 2.414 = 20.2% total, less the 4% nudge = 16.2%
   * One constant, the same travel-to-device ratio at every size, nothing to
   * measure and nothing to keep in sync on resize. Verified at 0.240 against
   * the 1440 canvas at all eleven widths below 1025.
   *
   * KEEP THIS IN STEP WITH THE OVERHANG MARGIN. The percentage is a share of
   * the riser, so changing that margin changes the travel: at 0.15 overhang
   * this same 16.2% delivers 0.217, not 0.240.
   */
  const STAGE_LIFT_PCT = 16.2

  /**
   * The pin, at every width this component covers — including 375.
   *
   * Same construction as the desktop canvas: `gsap.matchMedia` with no gap
   * between conditions, an `end` FUNCTION so `invalidateOnRefresh` re-reads the
   * viewport instead of freezing the first measurement, and the stage read
   * from live progress so the sequence reverses on the way back up.
   *
   * `useLayoutEffect`, not `useEffect`: GSAP's pin moves this section into a
   * `.pin-spacer` it creates, and a passive cleanup can run after React has
   * already tried to detach the node — which threw `removeChild` and killed the
   * hero for the rest of the session when the 1025px breakpoint swapped
   * variants. A layout cleanup is synchronous and unwraps the spacer first.
   *
   * Budget is measured in `svh`, never `vh`: on a phone the address bar
   * collapsing changes `vh` mid-pin and the whole thing jumps.
   */
  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return

    let disposed = false
    let mm: ReturnType<typeof import('gsap').gsap.matchMedia> | undefined

    void import('@/lib/gsap').then(({ gsap, ScrollTrigger }) => {
      if (disposed) return
      mm = gsap.matchMedia()

      mm.add(
        {
          tab: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
          phone: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const c = ctx.conditions as Record<string, boolean>

          /* Reduced motion: no pin, and stage 0 held — the state carrying the
             h1, the lead and both calls to action. */
          if (c.reduce) {
            setStage(0)
            return
          }

          /* THE SAME CONSTANTS, not a second copy of the numbers. These were
             bare `0.55 : 0.7` literals, so changing the budget at the top of
             the file silently left every width below 1025px untouched. */
          const perStage = c.phone ? STAGE_BUDGET_VH_NARROW : STAGE_BUDGET_VH_TAB
          const st = createHeroPin(ScrollTrigger, el, perStage, setStage)

          return () => st.kill()
        },
      )
    })

    return () => {
      disposed = true
      mm?.revert()
    }
  }, [])

  /* Same derivation as the desktop canvas, so the two cannot disagree about
     which stage shows what. */
  const op = [1, 2, 3].map((n) => (stage === n ? 1 : 0))
  const opIntro = stage === 0 ? 1 : 0
  const opFinal = stage === 4 ? 1 : 0
  const opBrand = stage === 0 || stage === 4 ? 1 : 0
  const fade = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)'

  return (
    <section
      id="top"
      ref={trackRef}
      /* NO height here. GSAP's pin writes `style.height` onto this element, so
         React must not also own it — the inner box below carries `100svh` and
         the section sizes to that. */
      className="relative isolate overflow-hidden"
      data-hero-stage={stage}
      style={{ background: 'var(--color-canvas)', color: 'var(--color-ink)' }}
    >
      <style>{FLOATY_KEYFRAMES}</style>
      {/* ONE SOURCE OF SIZE.

          `--dw-desktop` is what the 1440 canvas renders for the device: 330
          canvas px at 1440/1840 scale. Every tier below is a percentage of
          THAT, and everything else in the composition — the film's size and
          offset, the flanking cards' widths and offsets, the in-screen
          label's size — is `calc()`/`%`/`em` off `--dw`. No element carries
          its own px size, so the composition is identical at every width and
          only its scale changes.

          The old rule was `clamp(15rem, 62vw, 21rem)` below 601 and
          `clamp(11rem, 26vw, 21rem)` above it, which was NOT monotonic: at
          600 it resolved to 336px — a device wider than the 258px one at
          1440, with a 977px film on a 585px viewport, 1px of clearance to
          the CTA row and the film across the buttons. That was the bug.

          1025-1280 is the desktop canvas, not this layout, so its 88% tier
          is declared but unreachable today; see the report. */}
      <style>{`
        #top .hero-dev { --dw-desktop: 258px; }

        /* Each tier is ALSO capped by the container, so the device can never
           grow wider than the space it has: min(tier, 78% of the container).

           The cap is written in vw rather than %. A raw percentage inside
           --dw would re-resolve against a different containing block in each
           place --dw is used: the film box is absolutely positioned inside
           .hero-dev, so calc(var(--dw) * 2.909) would come out as 227% of
           the DEVICE instead of the container and the film ratio would
           collapse. vw keeps --dw a single absolute length everywhere.

           At the current tiers this cap never binds - see the report - but it
           is the rail that stops a future tier bump from overflowing. */
        /* 1025-1280: 88% */
        @media (max-width: 1280px) { #top .hero-dev { --dw: min(calc(var(--dw-desktop) * 0.88), 78vw); } }
        /* 769-1024: 74% */
        @media (max-width: 1024px) { #top .hero-dev { --dw: min(calc(var(--dw-desktop) * 0.74), 78vw); } }
        /* 601-768: 62% */
        @media (max-width: 768px)  { #top .hero-dev { --dw: min(calc(var(--dw-desktop) * 0.62), 78vw); } }
        /* <=600 is no longer a share of the desktop device — see the phone
           block at the end of this sheet, which sets it outright. */

        /* HEIGHT-AWARE SIZING, where container units exist. The tiers above
           stay as the fallback and are what Safari < 16 gets.

           The device slot is a size container, so 1cqh is 1% of the height
           left under the buttons. The composition from the film's top edge to
           the device's bottom is 2.414 x --dw, plus the stage-0 nudge of 4%
           of that, so 39cqh is the largest device that fits the slot whole.
           That is what puts the phone inside the first viewport.

           Each tier is ALSO held to a width share (46vw with no cards, 32vw
           beside two cards, which is what keeps card + device + card inside
           the viewport: the pair spans 2.92 x --dw) and floored, so a short
           viewport gets a phone cut at the bottom rather than a thumbnail. */
        @supports (height: 1cqh) {
          @media (max-width: 1024px) { #top .hero-dev { --dw: max(min(16vw, 164px), min(32vw, 39cqh, 300px)); } }
          @media (max-width: 768px)  { #top .hero-dev { --dw: max(min(22vw, 150px), min(32vw, 39cqh, 260px)); } }
        }

        /* =====================================================================
           PHONE (<=600px)
           =====================================================================

           THE DEVICE IS SIZED OUTRIGHT, not as a share of anything.

           Every tier above is a percentage of the desktop device, capped by a
           viewport share and then re-capped by '39cqh' — the height left under
           the copy. On a phone that height is small, so the caps always won and
           the composition came out at 170px on a 390 viewport: a thumbnail with
           dead space around it. The caps exist to keep the device INSIDE its
           slot, and on a phone that is the wrong goal — the composition is
           meant to fill the screen and run off the edges, exactly as the
           desktop canvas does.

           So the phone tiers are absolute, and the overflow they create is
           handled rather than prevented:

             - the film is 2.909 x --dw, so at 268 it is 780px on a 390
               viewport and runs well past both edges. The SECTION's
               'overflow-hidden' clips it. Nothing between the section and the
               film may clip, or the reveal and the pin break.
             - '.hero-dev''s own 'margin-top' is removed. It reserved the film's
               38.2% overhang so the film's top edge landed on the slot
               boundary; that was 65px of empty band above the phone at 390 and
               it is the single largest part of the gap this fixes. With the
               slot no longer clipping, the overhang needs no reservation.
             - the slot's stage-0 clip goes with it, for the same reason. The
               copy slot is 'z-20' and the device slot has no z-index, so the
               film passes BEHIND the buttons rather than over them.

           8px is the whole CTA-to-device gap now. */
        /* 601-1024 keeps the two-card pair; the right column stays out. */
        #top .hero-flank--2, #top .hero-flank--3 { display: none; }

        @media (max-width: 600px) {
          /* ONE CONTINUOUS SCALE, no tiers. Every number below is a share of
             the viewport, so 320 is the low end of the same ramp that runs to
             600 rather than a special case with its own rules.

                 device   50cqw     160 at 320, 195 at 390, 215 at 430, 300 at 600
                 card     0.62 x device, so the pair always shrinks together
                 outer gap 12px     constant, so the outer edge always shows

             '66cqh' is the second half of the same ramp, and it is not a
             tier either. The copy block is 391px tall at every phone width —
             the two calls to action stack below 481px, by existing design —
             so on a 568px-tall screen it takes 69% of the viewport and the
             slot left under it is only 169px. Width alone would put a 160px
             device there and drop the lower pair of cards below the fold.
             The composition runs 1.5 x the device width from the device's top
             to the bottom card's bottom, so holding the device to 66% of the
             slot height is what keeps all four cards on screen. On a tall
             phone the width side of the min() always wins and nothing
             changes.

             'cqw' and not 'vw': the slot is a size container and 'vw' counts
             the scrollbar, so a narrow DESKTOP window would place the outer
             card edge under the scrollbar and clip it. 'cqw' is the real
             content width in both cases. */
          /* SIZED FROM HEIGHT, capped by width. The group's full height is the
             FILM's height, and the film is 2.909 x --dw — so 'group = 80% of
             the viewport' solves to --dw = 0.277 x 100svh. 60cqw is the rail
             that stops a tall narrow phone asking for a device wider than the
             screen can hold beside the cards. */
          #top .hero-dev { --dw: clamp(120px, min(calc(100svh * 0.277), 60cqw), 300px); margin-top: 0 !important; }
          #top .hero-slot { margin-top: 8px !important; overflow: visible !important; }
        }

        /* =====================================================================
           THE RISE — the desktop motion, at phone scale
           =====================================================================

           MEASURED, NOT INVENTED. At 1440 the composition translates from 394
           to 226 canvas px as stage 0 clears: 131 screen px against a 526px
           device, a ratio of 0.249. It then HOLDS that lift through stages 1,
           2, 3 AND 4 — the closing stage included.

           The phone did neither. Its lift was a flat -16.2% of the device
           height (ratio 0.202, close but not equal), and at stage 4 it went
           back to translateY(0), so the travel from stage 0 to the close came
           out at 0.039 — effectively nothing. That return is why the closing
           headline landed on the face: the film dropped back into it.

           Two faults, both fixed here:

             - the RATIO is now 0.249, desktop's own measured figure;
             - the RESTING PLACE is now derived the way restingShift() derives
               it on desktop — centre the composition in the space below the
               header — rather than being a share of the device height with no
               viewport term at all. That is what removes the empty band: the
               phone was lifting by a real amount, but from a starting point
               46% of the viewport down.

           WHY THIS SITS ON .hero-dev AND NOT ON .hero-lift. The resting
           expression needs '--dw' and the slot's container units, and '--dw'
           is declared on .hero-dev — custom properties inherit downward, so
           the wrapper above cannot read it. The wrapper's inline transform is
           neutralised rather than fought with; the easing and duration carry
           over unchanged, so it is the same gesture. */
        @media (max-width: 600px) {
          #top .hero-lift { transform: none !important; }

          #top .hero-dev {
            /* 1416/697 — the frame's own aspect, so this is the device's
               rendered height with nothing measured at runtime. */
            --dev-h: calc(var(--dw) * 2.0316);
            /* 100cqh is the slot's height and 100svh the viewport, so
               '100svh - 100cqh' is exactly how far down the slot starts —
               the copy block's height, whatever it comes out at. */
            /* The film's own width, repeated from the film rule below so the
               face's position can be derived here. */
            --film-h: calc(var(--dw) * 2.909);
            /* WHERE THE FACE ENDS. The mask's linear pass fades the film out
               between 52% and 86% of its height, so the last row carrying any
               face is about 78% down the film box, and the film box itself
               starts 1.0725 x --dw below the device top less half its height.
               Measured against the render: at 1440 this lands at y=759 and the
               closing headline's top edge is y=760. Desktop puts the text
               exactly where the face stops, and this is that rule. */
            --face-end: calc(var(--dw) * 1.0725 + var(--film-h) * 0.28);
            /* 214px is the measured closing block, 8px the gap under the face. */
            --clear: calc(100cqh - var(--face-end) - 222px);
            /* THE FILL POSITION. The group's top edge is the film's top, which
               sits 0.382 x --dw above the device — so putting the group 6% down
               the viewport means putting the device there plus that overhang. */
            --top-aligned: calc(6svh + var(--dw) * 0.382 - (100svh - 100cqh));
            /* The clearance rule can ask for more lift than the screen has —
               on a 320x568 it wanted the group 8px above the top edge. This
               floors it at 'group top = 0', so the film is never cut at the
               crown. */
            --no-clip: calc(var(--dw) * 0.382 - (100svh - 100cqh));
            --rest: max(var(--no-clip), min(var(--top-aligned), var(--clear)));
            /* Stage 0 keeps the headline beat: the device at 42.5% of the
               viewport, under the copy. */
            --stage0: calc(42.5svh - (100svh - 100cqh));
            transform: translateY(var(--rest));
            transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
          }

          /* Stage 0 is the only one that differs. The travel is whatever the
             distance between the headline position and the fill position comes
             to — that distance IS the rise that carries the group up. */
          #top[data-hero-stage='0'] .hero-dev {
            transform: translateY(var(--stage0));
          }
        }

        /* The four-card overlay. Guarded on container units: without them the
           calcs below are invalid and every card would fall back to no
           position at all, so the pre-existing 'hidden' behaviour is the
           right fallback. */
        @supports (width: 1cqw) {
          @media (max-width: 600px) {
            #top .hero-dev {
              --gap: 12px;
              /* Derived from the device, not from the viewport, so the two
                 cannot shrink at different rates when the height cap binds. */
              --cw: calc(var(--dw) * 0.62);
            }

            /* THE FILM, capped. Desktop stays 2.909 x the device and is not
               touched; here the same expression is held to the viewport, so
               it can never be the thing that overflows. At a 50cqw device the
               cap always binds and the ratio lands at exactly 2.0x — wider
               than the phone, the way desktop reads, with no overflow. */
            #top .hero-dev > div[aria-hidden] {
              /* NO VIEWPORT CAP — 2.909 x --dw at every width, desktop's own
                 ratio. The overflow is the SECTION's to clip, which is exactly
                 what desktop does with a 751px film on a 900px viewport. */
              --film: calc(var(--dw) * 2.909);
              width: var(--film) !important;
              height: var(--film) !important;
              /* Centred on the device, and holding the film's centre at the
                 same 1.0725 x --dw below the device top that the uncapped
                 box puts it, so the crop through her face does not move. */
              left: calc((var(--dw) - var(--film)) / 2) !important;
              top: calc(var(--dw) * 1.0725 - var(--film) / 2) !important;
            }

            /* Cards OVERLAY the device edges. The outer edge of each column
               is pinned 12px inside the viewport — that is what guarantees
               all four are fully on screen at every width, 320 included —
               and the overlap onto the device is whatever is left over. */
            #top .hero-flank { width: var(--cw) !important; }
            #top .hero-flank--0, #top .hero-flank--1 {
              left: calc(var(--gap) - (100cqw - var(--dw)) / 2) !important;
            }
            #top .hero-flank--2, #top .hero-flank--3 {
              display: block;
              left: auto;
              right: calc(var(--gap) - (100cqw - var(--dw)) / 2);
            }
            /* The right column sits a touch higher than the left, which is
               the desktop relationship (slot 2 is 30 canvas px above slot 0). */
            /* The stacked pair's spacing is the desktop's own, as a share of
               the device rather than a measured card height: slot 1 sits 270
               canvas px below slot 0 against a 670 canvas-px device, which is
               40.3%. No card height needs to be known, so nothing has to be
               measured at runtime and the two never drift apart. */
            #top .hero-flank--0 { top: 15% !important; }
            #top .hero-flank--1 { top: 55.3% !important; }
            #top .hero-flank--2 { top: 10.5%; }
            #top .hero-flank--3 { top: 50.8%; }

            /* ── THE CARD, SCALED ─────────────────────────────────────────
               Only size changes. The background, the backdrop-filter, the
               border, the radius and every colour are inherited untouched
               from the component's own classes.

               THE SCALE IS WRITTEN AS 'var(--cw) * N / 188', never as a
               separate ratio variable. 'calc(var(--cw) / 188)' looks like the
               obvious way to name the ratio, but dividing a length by a number
               yields a LENGTH — so '22px * that' is px squared, which is
               invalid, and every rule here silently dropped to the inherited
               16px. Multiplying the width by the desktop value and dividing by
               the desktop width keeps one length and one plain ratio. */
            #top .hero-card {
              padding: calc(var(--cw) * 20 / 188) calc(var(--cw) * 20 / 188) 0;
            }
            #top .hero-card__title {
              font-size: calc(var(--cw) * 22 / 188);
              margin-bottom: calc(var(--cw) * 13 / 188) !important;
              letter-spacing: calc(var(--cw) * -0.3 / 188);
            }
            #top .hero-card__meta {
              gap: calc(var(--cw) * 9 / 188) !important;
              margin-bottom: calc(var(--cw) * 14 / 188);
            }
            #top .hero-card__glyph {
              width: calc(var(--cw) * 20 / 188);
              height: calc(var(--cw) * 20 / 188);
              font-size: calc(var(--cw) * 9 / 188);
            }
            #top .hero-card__metatext { font-size: calc(var(--cw) * 12.5 / 188); }
            #top .hero-card__chart--bars {
              height: calc(var(--cw) * 36 / 188);
              margin-bottom: calc(var(--cw) * 20 / 188);
              gap: calc(var(--cw) * 6 / 188);
            }
            #top .hero-card__chart--wave {
              height: calc(var(--cw) * 56 / 188);
              margin-left: calc(var(--cw) * -20 / 188);
              margin-right: calc(var(--cw) * -20 / 188);
            }
          }
        }

      `}</style>

      {/* NORMAL FLOW, in stacking order: copy slot, then device slot. The two
          used to be siblings both absolutely positioned — the copy pinned to
          `top: 76px`, the device to `bottom: 0` — so their vertical
          relationship was whatever the viewport height happened to make it.
          At 600 that came out as 1px. Now the copy takes the height it needs
          and the device gets what is left, so the gap cannot close. */}
      {/* `min-h-[520px]`, not 600: at 320x568 the 600 floor made the pinned
          section 32px taller than the viewport it is pinned in. */}
      <div className="relative flex h-[100svh] min-h-[520px] w-full flex-col">
        {/* ── the copy slot. Its height comes from the intro, which is always
             in flow; the close is overlaid on top of it, so the slot — and
             with it the section — is exactly as tall at stage 4 as at stage 0
             and the pin never re-measures. ──────────────────────────────── */}
        <div className="relative z-20 shrink-0 pt-[76px]">
          {/* ── stage 0: the intro ─────────────────────────────────────────── */}
          <div
            className="relative px-6 text-center"
            style={{
              opacity: opIntro,
              transform: `translateY(${opIntro ? 0 : -14}px)`,
              transition: fade,
              pointerEvents: opIntro ? 'auto' : 'none',
            }}
          >
            <h1
              className="mx-auto max-w-[18ch] text-[clamp(1.85rem,1.15rem+2.1vw,3.1rem)] leading-[1.06] tracking-[-0.03em]"
              style={{ fontWeight: 600 }}
            >
              {HERO.headline[0]}
              <br />
              {HERO.headline[1]}
            </h1>
            <p
              className="mx-auto mt-4 max-w-[26rem] text-[clamp(0.9rem,0.85rem+0.3vw,1.0625rem)] leading-[1.55]"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              {HERO.lead}
            </p>
            <HeroCtas />
          </div>

          {/* ── stage 4: the close. Overlaid on the intro's box, so neither
             changes the section's height. ──────────────────────────────── */}
          <div
            className="absolute inset-x-0 top-[76px] z-20 hidden px-6 text-center min-[601px]:block"
            style={{
              opacity: opFinal,
              transform: `translateY(${opFinal ? 0 : 14}px)`,
              transition: fade,
              pointerEvents: opFinal ? 'auto' : 'none',
            }}
          >
            <h2
              className="mx-auto max-w-[16ch] text-[clamp(1.7rem,1.1rem+1.8vw,2.6rem)] leading-[1.1] tracking-[-0.03em]"
              style={{ fontWeight: 600 }}
            >
              {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
            </h2>
            <p
              className="mx-auto mt-4 max-w-[26rem] text-[clamp(0.9rem,0.85rem+0.3vw,1.0625rem)] leading-[1.55]"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              {HERO_CLOSE.lead}
            </p>
          </div>
        </div>

        {/* ── the device slot: what is left after the copy, with 16px of hard
             clearance above it. It is a SIZE CONTAINER so `--dw` can be sized
             from the height it has (see the `cqh` tiers above). Nothing inside
             is `position: fixed`, so the containment has nothing to capture.

             `overflow-hidden` here is what keeps the film off the buttons.
             The film deliberately extends 38.2% of `--dw` ABOVE the device
             and that overhang is part of the composition, so it is bounded
             rather than removed: in this slot it shows in full, and on a
             viewport too short to hold it, it is cut at the slot edge rather
             than riding up into the CTA row. The SECTION still owns the
             horizontal clip. ────────────────────────────────────────────── */}
        {/* The clip is stage-dependent. At stage 0 it is what keeps the film
            off the buttons. From stage 1 the composition lifts ABOVE this
            box's top edge, so a clip here would cut the phone's crown — and
            the buttons it was protecting are invisible by then anyway. The
            SECTION still owns the horizontal clip at every stage. */}
        <div
          className="hero-slot relative mt-4 min-h-0 flex-1 [container-type:size]"
          style={{ overflow: stage === 0 ? 'hidden' : 'visible' }}
        >
          {/* ── the device: present at every stage, and the thing the label
             lives inside. Lifted once the intro clears, so stage 0 reads as
             "text above, phone entering" and the card stages read as "phone
             centred".

             TOP-anchored, not bottom-anchored, and that is load-bearing. The
             wrapper carries `margin-top: 0.382 * --dw`, which is exactly the
             film's overhang above the device, so the film's top edge lands
             ON the slot boundary: the slot clip has nothing to cut, and the
             mask's own fade is what you see.

             Bottom-anchoring was the bug behind all three reports. The
             composition is 2.413 * --dw tall from the film's top to the
             device's bottom (388px + 73px at the 74% tier), so on a viewport
             too short to hold it the overflow went UPWARD into the slot clip
             and took the phone's top corners, the island and the in-screen
             label with it. What survived read as two vertical slivers with a
             hard horizontal cut across the film. Anchored to the top, the
             overflow goes DOWNWARD off the bottom of the viewport instead,
             which is the composition the desktop canvas has always had. */}
          <div
            className="hero-lift absolute inset-x-0 top-0 flex justify-center"
            style={{
              /* Stage 0: the 4% nudge, so the phone reads as entering under the
                 copy — the same beat the canvas has. Stages 1-3: up by the
                 desktop's own travel ratio, and held across all three card
                 sets, so the climb happens once and then the sequence is still.
                 Stage 4: back down to base.

                 The canvas holds its lift at stage 4, and this deliberately
                 does not, because the two lay the closing state out
                 differently: on the canvas the closing copy sits BELOW the
                 phone and fills the space the lift opens up, while here it is
                 overlaid at the top of the screen. Holding the lift here left
                 the phone high with nothing under it — 142px of empty band at
                 912x1368, at exactly the point the next section comes into
                 view. */
              transform: `translateY(${stage === 0 ? 4 : stage === 4 ? 0 : -STAGE_LIFT_PCT}%)`,
              transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              className="hero-dev relative shrink-0"
              style={
                {
                  width: 'var(--dw)',
                  aspectRatio: '697 / 1416',
                  /* 0.382 — the film's FULL overhang above the device, so the
                     film's top edge lands exactly ON the slot boundary and the
                     slot's clip has nothing to cut.

                     This was briefly 0.15 to save 111px of space above the
                     phone. That was wrong: the mask's top 9% is a GRADIENT
                     from transparent to opaque, not a transparent band, so a
                     cut 0.232 x --dw down lands where the mask is already ~89%
                     opaque — a hard horizontal edge straight across her hair.
                     The empty band above the phone is dealt with by the stage
                     lift below, which is the right tool for it: it only moves
                     the composition once the copy has faded out. */
                  marginTop: 'calc(var(--dw) * 0.382)',
                } as CSSProperties
              }
            >
              {/* The film, full-bleed BEHIND the frame, at the desktop canvas's
                own ratios: a 960 film box against a 330 device is 290.9%,
                offset -95.5% and -38.2% of the device's width. The overflow is
                clipped by the SECTION, never by the screen. */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  width: 'calc(var(--dw) * 2.909)',
                  height: 'calc(var(--dw) * 2.909)',
                  left: 'calc(var(--dw) * -0.955)',
                  top: 'calc(var(--dw) * -0.382)',
                }}
              >
                <HeroFilm className="absolute inset-0" />
              </div>

              <img
                src="/mockup.png"
                alt="SkinTrix360 app frame"
                width={697}
                height={1416}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                /* 0.92, matching the desktop variant: thin translucent glass over
                 the film rather than an opaque bezel. */
                style={{ objectFit: 'fill', opacity: 0.92 }}
              />

              {/* ── THE STAGE LABEL, inside the screen ──────────────────────
                This is the feature. All five states are stacked in one
                positioned box and cross-faded, so the label never reflows and
                the sequence reverses cleanly on scroll up.

                Sized off `--dw` rather than the viewport: a vw size ran the
                longest label past the screen edge whenever the device tier
                was narrower than the viewport share assumed. */}
              <div
                className="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
                style={{ top: '13%' }}
              >
                <BrandLabel
                  opacity={opBrand}
                  label="SkinTrix360"
                  duration={0.4}
                  easing="ease"
                  fontSize={HERO_LABEL_SIZE}
                />
                {GROUP_LABELS.map((label, i) => (
                  <BrandLabel
                    key={label}
                    opacity={op[i]}
                    label={label}
                    duration={0.2}
                    easing="linear"
                    fontSize={HERO_LABEL_SIZE}
                  />
                ))}
              </div>

              {/* Two cards FLANKING the device — the desktop relationship, as
                percentages of `--dw` so they track it. Two rather than four
                because four would overlap the device or leave the viewport at
                these widths, and the rule is to cut the count, not the size.

                HIDDEN BELOW 601px, which is arithmetic: a legible card needs
                ~150px (its title is 22px), so two cards plus a gap either side
                of a device `D` needs `V >= 316 + D`. At 375 that allows
                `D <= 59px`, which is not a phone. No connector lines here at
                any width, as agreed.

                One pair PER STAGE, the first two cards of that stage's group,
                so the cards agree with the label above them. This used to
                render group 1 at every stage, which put "Skin Type" beside
                "My Skincare Plan". */}
              {CARD_GROUPS.map((group, g) => (
                <div
                  key={g}
                  className="hero-flanks pointer-events-none absolute inset-0"
                  style={{
                    opacity: op[g],
                    transition: 'opacity 0.35s ease',
                  }}
                >
                  {[0, 1].map((i) => (
                    <div
                      key={group[i].title}
                      className={cn('hero-flank', `hero-flank--${i}`, 'absolute', op[g] ? 'pointer-events-auto' : 'pointer-events-none')}
                      style={{
                        width: HERO_CARD_W,
                        /* The left card's right edge stays 0.06 x --dw off the
                           device whatever width the floor gives it. */
                        left: i === 0 ? `calc(-1 * ${HERO_CARD_W} - var(--dw) * 0.06)` : 'calc(var(--dw) * 1.06)',
                        top: '24%',
                        transform: `translateY(${op[g] ? 0 : 12}px)`,
                        transition: fade,
                      }}
                    >
                      <GlassCard card={group[i]} floatDuration={FLOAT_DURATIONS[i]} />
                    </div>
                  ))}

                  {/* Cards 2 and 3 — the RIGHT column, phone only.
                      601-1024 keeps the two-card pair above and these stay
                      display:none, so the tablet range is untouched. Same
                      component, same group, same `op[g]` fade. */}
                  {[2, 3].map((i) => (
                    <div
                      key={group[i].title}
                      className={cn('hero-flank', `hero-flank--${i}`, 'absolute', op[g] ? 'pointer-events-auto' : 'pointer-events-none')}
                      style={{
                        transform: `translateY(${op[g] ? 0 : 12}px)`,
                        transition: fade,
                      }}
                    >
                      <GlassCard card={group[i]} floatDuration={FLOAT_DURATIONS[i]} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── stage 4, the close — PHONE ONLY, and below the device ──────────
            Above 600px this is the overlaid block up in the copy slot, which
            is unchanged. Below it, the close belongs under the phone, which is
            the order the desktop canvas has always had: device, headline,
            sub-line, call to action. It used to render ABOVE the device here
            purely because it shared the intro's box.

            Anchored to the BOTTOM of the layout box rather than placed in
            flow. The device is 268px wide on a 390 viewport and its frame runs
            past the bottom edge by design, so a block in normal flow after it
            would start off screen. Bottom-anchoring puts the close where it
            can always be read, and the stage-4 transform below lifts the
            device clear of it.

            Reads HERO_CLOSE, the same constant the desktop close reads. */}
        <div
          className="hero-close-phone absolute inset-x-0 bottom-0 z-20 px-6 pb-7 text-center min-[601px]:hidden"
          style={{
            opacity: opFinal,
            transform: `translateY(${opFinal ? 0 : 14}px)`,
            transition: fade,
            pointerEvents: opFinal ? 'auto' : 'none',
          }}
        >
          <h2
            className="mx-auto max-w-[16ch] text-[clamp(1.7rem,1.1rem+1.8vw,2.6rem)] leading-[1.1] tracking-[-0.03em]"
            style={{ fontWeight: 600 }}
          >
            {HERO_CLOSE.headline[0]} {HERO_CLOSE.headline[1]}
          </h2>
          <p
            className="mx-auto mt-3 max-w-[26rem] text-[clamp(0.9rem,0.85rem+0.3vw,1.0625rem)] leading-[1.55]"
            style={{ color: 'var(--color-ink-soft)' }}
          >
            {HERO_CLOSE.lead}
          </p>
          <div className="mt-5 flex justify-center">
            <Button href="#download" size="lg" className="hero-cta">
              {HERO_CLOSE.primary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
