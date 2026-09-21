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

/**
 * How wide the canvas's INK actually is, measured rather than assumed.
 *
 * The canvas is authored 1840 wide, but nothing is drawn near its edges. The
 * four cards are the widest thing on it and they span x=370 to x=1480 — 1110
 * canvas pixels, centred within 5px of the canvas's own midpoint. Everything
 * else is narrower: the h1 runs 435–1405, the closing h2 508–1332, the phone
 * 755–1085. So 365px of each side of the canvas is permanently empty.
 *
 * THAT MARGIN IS WHY THE CANVAS USED TO BE UNUSABLE BELOW 1025px. Dividing
 * the viewport by 1840 pays full price for 730px of nothing: at 800 it gives
 * a scale of 0.435, which renders a 9.6px card title and a 24px button and is
 * the reason this component was cut off at 1025 and a stacked layout used
 * below it. Dividing by the ink instead gives 0.688 at the same width — the
 * composition arranged exactly as designed, at a size you can read — and the
 * empty margin simply overflows the viewport, where the stage's own
 * `overflow-hidden` clips it. Clipping nothing is free.
 *
 * ONLY BELOW 1025px. Above it the viewport is wide enough that the full
 * canvas fits at a comfortable scale, and dividing by the ink there would
 * blow the composition up past the frame it was designed in. Desktop keeps
 * dividing by `CANVAS_W`, unchanged.
 */
const CONTENT_W = 1110

/** Real pixels of guaranteed margin either side of `CONTENT_W`, so the outer
 *  edge of a corner card is never flush against the screen. 18 is ~24 canvas
 *  px at portrait-tablet scale, which reads as the same inset the cards have
 *  from each other. */
const CONTENT_GUTTER = 18

/**
 * The width whose desktop rendering is the reference look, and the scale it
 * produces — 1280 / 1840 = 0.696.
 *
 * FITTING THE INK ALONE OVERSHOOTS, and this is the correction. Dividing the
 * viewport by `CONTENT_W` makes the composition fill the width, which is right
 * at 800 where the alternative is illegible, and wrong by 1000 where it makes
 * the composition proportionally MUCH bigger than desktop ever renders it.
 * Measured at 1000px against the 1280 reference:
 *
 *                            1280 desktop     1000, ink-fit     1000, capped
 *   closing h2 width           45% of vw        72% of vw         57% of vw
 *   its side margins           28% each         14% each          21% each
 *   phone width                18% of vw        29% of vw         23% of vw
 *
 * The middle column is the reported fault: a heading running to the edges and
 * a phone taking too much room. The cap is what the right-hand column is.
 *
 * WHY A FLOOR RATHER THAN A CEILING, read the other way round: the tablet uses
 * the DESKTOP formula, `viewport / CANVAS_W`, held to a minimum of whatever
 * that formula gives at 1280. Above 1280 the two are the same expression, so
 * a portrait viewport wider than that is rendered exactly as desktop renders
 * it and the paths converge rather than meeting at a step.
 */
const REFERENCE_W = 1280
const REFERENCE_SCALE = REFERENCE_W / CANVAS_W

/**
 * One scale for both paths, so there is no width at which they disagree.
 *
 * THE BUG THIS REPLACES WAS A CLIFF AT THE BREAKPOINT. The tablet path fitted
 * the ink and the desktop path fitted the canvas, and nothing tied them
 * together: 1024px rendered at 0.890 and 1025px at 0.557, a 37% collapse
 * across one pixel. A portrait tablet reporting a width just over the line
 * fell into the desktop branch, where the pinned box is `PIN_H` tall and
 * nothing centres it — 716px of hero in a 1600px viewport, with the next
 * section showing underneath for the whole pin. That is the untreated gap.
 *
 * Now every case is one expression, `min(room, max(desktop, reference))`:
 *
 *   - `desktop` is the plain desktop formula and wins outright above 1280.
 *   - `reference` floors it, so 769-1280 renders at the 1280 proportions
 *     instead of shrinking with the viewport into unreadable type.
 *   - `room` is the hard ceiling — the widest the four corner cards fit in —
 *     and only binds below ~1150px, where it takes over from the floor
 *     continuously rather than stepping.
 */
function fitScale(clientWidth: number, fullCanvas: boolean) {
  const desktop = clientWidth / CANVAS_W
  if (fullCanvas) return desktop
  const room = (clientWidth - 2 * CONTENT_GUTTER) / CONTENT_W
  return Math.min(room, Math.max(desktop, REFERENCE_SCALE))
}

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
/** ≤768px. Was 0.45, which made every stage on a phone 18% shorter than the
    same stage on desktop — the sequence arrived faster and read as abrupt.
    Matched to the desktop figure so the pacing is identical at every width. */
const STAGE_BUDGET_VH_NARROW = 0.55

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

/** Width-driven only — the canvas never shrinks to fit the viewport's height.
 *  `fitScale` above is the whole of the sizing rule; this only measures. */
function useCanvasScale(ref: RefObject<HTMLElement | null>, fullCanvas: boolean) {
  /* `clientWidth`, not `window.innerWidth`: innerWidth INCLUDES the vertical
     scrollbar, so seeding from it scales the canvas ~1% too large for one
     paint and the composition lands slightly off to the right until the
     ResizeObserver below corrects it. clientWidth is the width the canvas
     actually gets. */
  const [scale, setScale] = useState(() =>
    fitScale(document.documentElement.clientWidth, fullCanvas),
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      if (el.clientWidth) setScale(fitScale(el.clientWidth, fullCanvas))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, fullCanvas])

  return scale
}

export function Hero() {
  const reduced = useReducedMotion()

  /* THE CUT IS NOW 769, NOT 1025.
     `ScrollHero` is the four-corner canvas: cards at the four corners of the
     face, connector lines from each to a point on it. It used to stop at 1025
     because scaling its 1840px canvas by viewport WIDTH made it illegible
     below that — at 1024 it came out at 0.556 and rendered 29px-tall buttons.

     That was a consequence of dividing by 1840 when only 1110 of it carries
     any ink; see `CONTENT_W`. Fitting the ink instead, a 800px portrait
     tablet renders the same composition at 0.688 — a 15px card title and a
     52px headline — so the arrangement no longer has to be given up to stay
     readable, and tablets get the desktop hero rather than an approximation
     of it.

     769 because that is where this file's phone tier ends. At 768 and below
     the four-corner arrangement genuinely does not fit — two cards either
     side of a legible phone needs ~316px plus the device — and `SimpleHero`'s
     2x2-under-the-phone layout stays exactly as it is. */
  const isCanvas = useMediaQuery('(min-width: 769px)')

  /* ── WHICH SIZING RULE, AND WHY ORIENTATION IS PART OF IT ──────────────
     `fullCanvas` is the untouched desktop behaviour: fit the whole 1840
     canvas, box the pin at `PIN_H`, let `restingShift` centre what shows.
     That rule assumes the pinned box is TALLER than the viewport, which is
     true of every landscape screen and false of every portrait one.

     It used to be selected on width alone, and a portrait tablet 1025px wide
     therefore got it: a 716px hero in a 1600px viewport, the next section
     visible underneath for the whole pin, and a 37% size cliff against the
     1024px next to it. A width test cannot tell a 1200px-wide tablet held
     upright from a 1200px-wide browser window, and those two want opposite
     things.

     `(orientation: landscape)` is the part that can. Every real desktop is
     landscape, so desktop keeps the desktop rule at every width; a portrait
     viewport takes the tablet rule however wide it is, which is what routes
     the Redmi Pad 2 correctly whether it reports 800, 1000, 1024 or 1200.
     Above 1280 the two rules produce the same scale anyway (see `fitScale`),
     so the choice stops mattering exactly where it stops being meaningful. */
  const isDesktopLandscape = useMediaQuery('(min-width: 1025px) and (orientation: landscape)')

  if (reduced) return <SimpleHero />
  if (isCanvas) return <ScrollHero fullCanvas={isDesktopLandscape} />
  return <SimpleHero />
}

/**
 * `fullCanvas` — fit the whole 1840px canvas (desktop, >=1025px) or just the
 * 1110px of it that carries ink (portrait and landscape tablet, 769-1024px).
 *
 * It is the ONLY difference between the two, and it changes one number: the
 * scale. Every absolute position, the card slots, the connector lines, the
 * stage sequence and the pin are one shared set of code rendering one shared
 * canvas, which is what makes the tablet identical to desktop rather than a
 * second implementation that resembles it.
 */
function ScrollHero({ fullCanvas }: { fullCanvas: boolean }) {
  const trackRef = useRef<HTMLElement>(null)
  const scale = useCanvasScale(trackRef, fullCanvas)
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
        /* ── HOW TALL THE PINNED BOX IS, AND WHERE THE CANVAS SITS IN IT ──
           On desktop the canvas window (`PIN_H` scaled) is always TALLER than
           the viewport — 998px against 900 at 1440 — so the box is exactly
           the window, the canvas is flush to the top under the header
           clearance, and `restingShift` is what centres the composition in
           the part of it you can see. Both expressions below collapse to
           precisely that when the window is the taller of the two, which is
           every desktop size, so desktop is untouched.

           A PORTRAIT TABLET INVERTS IT. At 800x1340 the window is 880px in a
           1340px viewport, and a pinned section shorter than the viewport
           leaves the next section showing underneath it for the whole pin —
           460px of "What it does" sitting under the hero. So the box takes
           the viewport's full height, and the canvas is centred in it rather
           than parked at the top with all the slack below.

           `100svh` and not `viewportH`, even though `viewportH` is right
           here: it is read from `window.innerHeight`, which CHANGES when a
           tablet's address bar collapses. That would resize the pinned
           element mid-pin and make ScrollTrigger's cached geometry wrong.
           `svh` is the small viewport and does not move. */
        style={{
          height: fullCanvas
            ? stageHeight + HEADER_CLEARANCE
            : `max(${stageHeight + HEADER_CLEARANCE}px, 100svh)`,
          paddingTop: fullCanvas
            ? HEADER_CLEARANCE
            : `calc(${HEADER_CLEARANCE}px + max(0px, (100svh - ${stageHeight + HEADER_CLEARANCE}px) / 2))`,
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
  /* Its own canvas width, not the hero's — `useCanvasScale` now carries the
     shared canvas's sizing rule, which has nothing to do with this one.
     NOTHING IMPORTS THIS COMPONENT; it is kept only because the file has kept
     it, and the tablet range it was written for is now served by `ScrollHero`.
     If it is still unreferenced next time this file is opened, delete it. */
  const [scale, setScale] = useState(
    () => document.documentElement.clientWidth / TABLET_CANVAS_W,
  )
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => {
      if (el.clientWidth) setScale(el.clientWidth / TABLET_CANVAS_W)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
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
          /* THE DEVICE, at a readable size.

             The film is a square box 2.909 x --dw, so the film's HEIGHT is
             always 1.432 x the device's height — desktop's own proportion,
             and it holds automatically at any --dw. What went wrong was not
             that ratio but the absolute size: sizing --dw off viewport HEIGHT
             (0.277 x 100svh) put a 680px film on a 390px screen, 1.74x the
             viewport, so the face filled everything.

             Sizing off WIDTH instead lands the film at about 1.16x the
             viewport — past the edges, clipped by the section, the way
             desktop's 751px film sits inside a 1440px frame without
             dominating it.

             THE SECOND RAIL USED TO BE '20svh' AND IT WAS THE WRONG ONE. A
             flat share of the viewport knows nothing about what else is in
             the stack, so on a short screen the phone stayed big and the
             composition simply ran out the top. The whole expression now
             lives on '#top' — see the block below — because the closing
             block needs the same number and cannot see inside this slot.

             'inherit', not a second copy of it. A custom property set on the
             element beats one inherited from an ancestor, so without this
             declaration '.hero-dev' would keep the 769-1024 tier it is given
             further up the sheet and ignore '#top' entirely. */
          #top .hero-dev { --dw: inherit; margin-top: 0 !important; }
          #top .hero-slot { margin-top: 8px !important; overflow: visible !important; }
        }

        /* =====================================================================
           WHAT HAS TO FIT, AND IN WHAT
           =====================================================================

           Declared on '#top' rather than on '.hero-dev' because BOTH halves
           of the phone layout need these: the device slot reads them to size
           and place the phone, and the closing block — a sibling of the slot,
           so it cannot see anything set inside it — reads them to place
           itself at stage 4. One set of numbers, two consumers.

           NOTHING HERE DEPENDS ON '--dw', which is what makes it safe for
           '--dw' to depend on it. The grid's footprint comes from the
           viewport's WIDTH alone, so the chain runs
           'grid-w -> grid-h -> dev-cap -> dw' with no cycle.

           'vw' and not 'cqw': '#top' is not inside the slot's container, so
           container units here would resolve against the viewport anyway.
           On a phone there is no persistent scrollbar so the two agree, and
           at the one width where a scrollbar could make them differ — a
           600px desktop window — both '--grid-w' and '--dw' are already
           held by their own caps, so the difference is absorbed. */
        @media (max-width: 600px) {
          #top {
            --card-gap: 10px;
            --grid-top: 14px;

            /* The band the composition lives in: the viewport less the
               fixed header and the home indicator. */
            --header: calc(72px + env(safe-area-inset-top, 0px));
            --safe-b: env(safe-area-inset-bottom, 0px);
            --band: calc(100svh - var(--header) - var(--safe-b));
            /* Breathing room that is never eaten: 16px above the hair and
               16px below the bottom row of cards. */
            --air: 32px;

            /* ── STEP 1: WHAT THE GRID WANTS ──────────────────────────────
               From the viewport's WIDTH alone, so nothing here depends on
               the device and the chain below cannot become circular. Capped
               at 296px — it was 340 — so the 2x2 is a compact block under
               the phone rather than the widest thing on the screen; 16px of
               gutter either side on anything narrower than that.

               296 also means the card is the SAME SIZE at 360, 390 and 430:
               '100vw - 32px' is 328, 358 and 398 there, so the cap wins at
               all three and a column is 143px at every one of them.

               A grid of width W is always 0.895 x W + 5.05px tall. That
               constant is not a guess and not a shape preference — it is the
               card's own content, added up, and '--card-ratio' below is
               where the addition is written out. A column is (W - 10) / 2
               and there are two rows, so
               2 x (0.895 x (W - 10) / 2 + 2) + 10 folds to the expression here,
               the 2 being the card border '--card-h' accounts for.

               KEEP THE TWO IN STEP. This is the one place the ratio is
               restated as a literal, because '--card-h' cannot be used: it
               depends on '--cw', which depends on '--grid-w', which depends
               on this. Breaking that cycle is the whole reason step 1 exists
               and the reason the number appears twice. */
            --grid-w-want: min(calc(100vw - 32px), 296px);
            --grid-h-want: calc(var(--grid-w-want) * 0.895 + 5.05px);

            /* ── STEP 2: THE DEVICE GETS WHAT IS LEFT ─────────────────────
               What has to fit between the header and the bottom of the
               screen is the FILM's top edge down to the grid's bottom:

                 0.382 x --dw   the film's overhang above the device
               + 2.0316 x --dw  the device itself (1416/697, its own aspect)
               + --grid-top
               + --grid-h
               = --band - --air

               2.4136 is the sum of the two --dw terms, so solving for --dw
               gives the largest device whose WHOLE group still fits.

               At 360x800, 390x844 and 430x932 the width rail is the tighter
               of the two and the device is the size it has always been. The
               height cap only binds on a short viewport — and there it
               shrinks the phone, which is what used to be pushed up under
               the header instead.

               DECLARED HERE AND NOWHERE ELSE. The closing block is a sibling
               of the device slot and cannot read anything set inside it, so
               both halves of the phone layout take '--dw' from this one
               declaration and inherit it down; '.hero-dev' says
               '--dw: inherit' purely to stop its own 768px tier winning by
               being set on the element. '40vw' rather than '40cqw' because
               '#top' has no query container above it, so container units
               here would resolve against the viewport anyway — and above a
               500px viewport both forms are held at the 200px cap, while
               below it a phone has no persistent scrollbar. */
            --dev-cap: calc((var(--band) - var(--air) - var(--grid-top) - var(--grid-h-want)) / 2.4136);
            --dw: clamp(112px, min(40vw, var(--dev-cap)), 200px);

            /* ── STEP 3: AND THE GRID TAKES WHAT IS LEFT OF THAT ──────────
               The device has a FLOOR — below about 112px the frame stops
               reading as a phone — so on a short screen step 2 hands back a
               device bigger than the leftover height. Something has to give,
               and it is the grid: this is step 2 read backwards, solved for
               the grid's width instead.

               Without it, 375x667 overflowed the bottom of the screen by
               11px, 360x640 by 19 and 320x568 by 35 — the cards ran off the
               fold. On a phone tall enough for the floor not to bind, which
               is every one of the three target widths, this cap is slack and
               '--grid-w' is exactly '--grid-w-want'. */
            --grid-cap: calc((var(--band) - var(--air) - var(--grid-top)
                        - 2.4136 * var(--dw) - 5.05px) / 0.895);
            --grid-w: min(var(--grid-w-want), var(--grid-cap));
            --cw: calc((var(--grid-w) - var(--card-gap)) / 2);

            /* ── THE CARD, ADDED UP RATHER THAN DIALLED IN ────────────────
               Every card is the same size because its height is not measured
               from its own content — it is the SUM of six reserves, and all
               six are shares of the column width, so the total is the same
               number for all twelve cards in all three stages. Change a font
               size here and the card grows to suit it; nothing has to be
               re-tuned by eye afterwards.

               WHY RESERVES AND NOT CONTENT. The boxes were already a uniform
               165x161.7 — 'grid-auto-rows' saw to that — but the cards still
               did not LOOK the same, which is what was actually being
               reported. "Skin Type" has a one-line title and "Doctor
               Consultation" a two-line one, so the meta line and the chart
               under them sat at different heights from card to card, and in
               the worst case ("Doctor Consultation", two-line title AND
               two-line meta) the content came to 161.85px inside a 161.7px
               box and the bottom of the chart was clipped.

               So the title and the meta each get TWO LINES whether they use
               them or not, and are clamped to two so a longer string can
               never take a third. Every card now has its title on the same
               baseline, its meta on the same baseline and its chart on the
               same baseline, and the tallest possible card exactly fills the
               box instead of overflowing it.

               THE RATIOS ARE SHARES OF 188 — the desktop column width — so
               they read as "what this is on desktop", the same convention
               the type scale below uses. They are NOT desktop's values: the
               title is 20.5/188 where desktop is 22/188 and the card is
               0.895 x its column where it used to be 0.98, which together
               take the card from 165x161.7 to 143x128 at 390px, a third less
               area. The meta text barely moves (12.5 -> 14 of a smaller
               column is 11.0px -> 10.6px) because it is the smallest type on
               the card and was already at the floor of comfortable. */
            --card-pad: calc(var(--cw) * 18 / 188);
            --card-title-fs: calc(var(--cw) * 20.5 / 188);
            --card-title-h: calc(var(--card-title-fs) * 1.06 * 2);
            --card-title-mb: calc(var(--cw) * 11 / 188);
            --card-meta-fs: calc(var(--cw) * 14 / 188);
            --card-meta-h: calc(var(--card-meta-fs) * 1.35 * 2);
            --card-meta-mb: calc(var(--cw) * 12 / 188);
            /* ONE footprint for both chart kinds. The wave bleeds to the
               card's bottom edge and the bars sit above a margin, so they
               are given the same total so the two never disagree about how
               tall a card is. */
            --card-chart-h: calc(var(--cw) * 46 / 188);

            /* 18 + 2x1.06x20.5 + 11 + 2x1.35x14 + 12 + 46 = 168.26 of 188,
               which is the 0.895 that '--grid-h-want' above is built on, and
               the flat 2px is the card's own 1px border top and bottom.

               THE 2px IS NOT A FUDGE. Everything on this page is
               'box-sizing: border-box', so a 128px card holds 126px of
               content — and the six reserves above describe CONTENT. Without
               this the sum came out 2px over the box, the chart was the only
               item that could give (it is the one with nothing below it), and
               flex-shrink quietly took those 2px off it: the wave rendered
               33px instead of 35 and stopped an invisible pixel short of the
               bottom edge. Measured, not theorised. */
            --card-h: calc(2px + var(--card-pad) + var(--card-title-h) + var(--card-title-mb)
                      + var(--card-meta-h) + var(--card-meta-mb) + var(--card-chart-h));
            --grid-h: calc(2 * var(--card-h) + var(--card-gap));
          }
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
        /* ── STAGE 4: THE PHONE AND THE CLOSING TEXT ARE ONE GROUP ────────
           The closing block is 'position: absolute; bottom: 0' and the phone
           was centred in the band above it, so the centring's LOWER margin
           — 116px at 360, 125px at 390, 152px at 430 — sat between them as
           dead space. Neither the section nor the block carries any padding
           or margin: measured 0 on all four sides, so there was nothing to
           trim. The gap was the phone's own resting rule.

           Both halves now come off one number. The pair is treated as a
           single group with a fixed 24px between them, and whatever is left
           over is split evenly above the phone and below the text — the same
           treatment stages 1-3 already give the phone and its card grid.

           DECLARED ON '#top', not on '.hero-dev': the closing block is a
           SIBLING of the slot, so it cannot read a variable set inside it.
           It reads the same '--dw' and '--band' the block above declares, so
           the phone cannot be one size for stages 1-3 and another for the
           close.

           AND IT COUNTS THE FILM'S OVERHANG. '--m-group-h' used to start at
           the DEVICE's top edge, but the film — and the hair in it — starts
           0.382 x --dw higher, so the centring was working from a top edge
           60px below the one you can actually see. Stage 4 had the same
           fault stages 1-3 did, just with more room to hide it. */
        @media (max-width: 600px) {
          #top {
            --m-dev-h: calc(var(--dw) * 2.0316);
            --m-film-over: calc(var(--dw) * 0.382);
            --m-close-h: 214px;
            --m-close-gap: 24px;
            --m-group-h: calc(var(--m-film-over) + var(--m-dev-h)
                        + var(--m-close-gap) + var(--m-close-h));
            /* Floored, so a very short viewport tightens the margins rather
               than pulling the phone up off the top of the screen. */
            --m-slack: max(16px, calc((var(--band) - var(--m-group-h)) / 2));
          }

          #top[data-hero-stage='4'] .hero-close-phone { bottom: var(--m-slack); }
        }

        @media (max-width: 600px) {
          #top .hero-lift { transform: none !important; }

          #top .hero-dev {
            /* 1416/697 — the frame's own aspect, so this is the device's
               rendered height with nothing measured at runtime. */
            --dev-h: calc(var(--dw) * 2.0316);
            /* ── WHERE THE GROUP SITS ─────────────────────────────────────
               Three positions, one per beat, all derived rather than dialled
               in. Every one is expressed against '--natural' — how far down
               the slot starts, which is the copy block's height read live as
               '100svh - 100cqh' rather than guessed at.

               '--film-over' is the film's overhang above the device. It is
               the term that was missing from the old stage-0 value, and it is
               why the buttons sat on the face: the DEVICE cleared them but
               the film's top edge, 0.382 x --dw higher, did not. */
            --film-over: calc(var(--dw) * 0.382);
            --natural: calc(100svh - 100cqh);

            /* ── THE GROUP IS WHAT YOU CAN SEE ────────────────────────────
               '--group-h' used to be 'device + grid', and that is the whole
               of the clipping fault. The composition's visible top edge is
               not the device's — it is the FILM's, 0.382 x --dw higher,
               and the crown of her head is in that overhang. Centring the
               DEVICE therefore placed the hair 60px above wherever the
               centring thought the top was, which at 390x844 put it at
               y=66 with a 72px header over it: the top of the head was
               behind the navbar's blur, which is what read as a clean
               horizontal cut across it.

               Both ends are now honest. The top is the film's edge, the
               bottom is the grid's, and because every row of the grid is
               held to '--card-h' the bottom is the same on all three card
               stages — so the leftover really is split evenly instead of
               being parked under the cards on the short ones. */
            --group-h: calc(var(--film-over) + var(--dev-h) + var(--grid-top) + var(--grid-h));
            --slack: calc((var(--band) - var(--group-h)) / 2);
            /* Place the FILM's top edge one '--slack' below the header, then
               step down by the overhang to get the DEVICE's top, which is
               what this transform actually moves. */
            --rest: calc(var(--header) + var(--slack) + var(--film-over) - var(--natural));

            /* Stage 0: the FILM's top edge lands 16px under the buttons, so
               nothing the visitor can read is ever touched by the image. */
            --stage0: calc(var(--film-over) + 8px);

            /* Stage 4: the grid is gone, and the phone sits one '--m-close-gap'
               above the closing text rather than being centred in the whole
               band — that centring was the gap. '--m-slack' is inherited from
               the section rule above, so the phone and the text move together
               and the 24px between them cannot drift. The '+ --film-over' is
               the same correction '--rest' carries: '--m-slack' positions the
               film's top edge, and this steps down to the device's. */
            --stage4: calc(var(--header) + var(--m-slack) + var(--film-over) - var(--natural));

            transform: translateY(var(--rest));
            transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
            /* The only thing that moves between stages, and it moves four
               times over the pin. Promoting it once keeps each of those
               600ms transitions off the main thread instead of re-layerizing
               the phone, the film and the grid at every beat. */
            will-change: transform;
          }

          /* Stages 1-3 take '--rest' from the rule above; these two differ. */
          #top[data-hero-stage='0'] .hero-dev { transform: translateY(var(--stage0)); }
          #top[data-hero-stage='4'] .hero-dev { transform: translateY(var(--stage4)); }

          /* Safe areas. The notch eats into the copy block's top padding and
             the home indicator into the closing block's bottom, so both are
             widened by the inset rather than the 100svh box being shrunk —
             shrinking it would reintroduce the gap this is meant to remove. */
          #top .hero-copy { padding-top: calc(76px + env(safe-area-inset-top, 0px)); }
          #top .hero-close-phone { padding-bottom: calc(28px + env(safe-area-inset-bottom, 0px)); }
        }

        /* The per-stage cross-fade, at every width this component covers. It
           used to be an inline style on the wrapper, which made it
           unextendable — see the phone block at the foot of this sheet, which
           adds a delayed 'visibility' leg to it. */
        #top .hero-flanks { transition: opacity 0.35s ease; }

        /* The four-card overlay. Guarded on container units: without them the
           calcs below are invalid and every card would fall back to no
           position at all, so the pre-existing 'hidden' behaviour is the
           right fallback. */
        @supports (width: 1cqw) {
          @media (max-width: 600px) {
            /* THE GRID'S METRICS ARE NOT DECLARED HERE ANY MORE. '--grid-w',
               '--cw', '--card-h', '--grid-h', '--card-gap' and '--grid-top'
               all live on '#top' now, because '--dw' is sized from what the
               grid leaves over and the closing block needs the same numbers.
               They are inherited into this subtree unchanged; only the rules
               that USE them are below. */

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

            /* ── THE 2x2, BELOW THE PHONE ─────────────────────────────────
               The cards used to flank the device, which on a phone meant
               overlaying it: each column was pinned 12px inside the viewport
               and whatever was left over landed on the face — 105 to 126px
               of every card, measured. There is no width on a phone for a
               card either side of a legible device, so they move under it.

               Still ONE component and ONE data source. '.hero-flanks' is the
               same per-stage wrapper carrying the same 'op[g]' fade, and each
               '.hero-flank' still renders the same GlassCard from the same
               CARD_GROUPS entry. Only the positioning changes: the wrapper
               stops being 'inset-0' over the device and becomes a grid under
               it, and the cards stop being absolutely placed.

               It is anchored to the device's bottom ('top: 100%'), so the
               grid travels with the phone as one group through every stage
               and the two can never drift apart. */
            #top .hero-flanks {
              top: calc(100% + var(--grid-top));
              right: auto;
              bottom: auto;
              left: 50%;
              width: var(--grid-w);
              transform: translateX(-50%);
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              /* ── EVERY ROW IS '--card-h', AND THAT IS THE FIX FOR THE
                 TRAILING GAP ──────────────────────────────────────────────
                 The rows used to size to their content, so the grid came out
                 268px on "Skin Type", 338px on "My Skincare Plan" and 322px
                 on "Consultation" — three different heights from one reserve
                 that had to cover the tallest. The centring above spent that
                 reserve whatever the stage, so the two short stages paid for
                 space they never used and it collected as a band of nothing
                 under the bottom row: 119px at stage 1, measured at 390x844.

                 Fixing the row height makes the reserve exact. The grid is
                 now '--grid-h' on all three card stages, the centring's
                 arithmetic is true, and the cards come out a matched pair
                 per row rather than ragged. */
              grid-auto-rows: var(--card-h);
              gap: var(--card-gap);
            }

            /* The grid places them, so every absolute coordinate the flanking
               layout set has to go — including the inline width React writes
               for cards 0 and 1. */
            #top .hero-flank {
              position: static !important;
              width: auto !important;
              left: auto !important;
              right: auto !important;
              top: auto !important;
            }

            /* The row sets the height; the card fills it. Without this the
               card would still be content-height inside a fixed-height track
               and the bottom row would float above its own baseline. The
               chart is pushed to the foot of the card so the slack a short
               stage has lands INSIDE the card, under the meta line, where it
               reads as the card's own breathing room. */
            #top .hero-flank > div { height: 100%; }
            #top .hero-card { display: flex; flex-direction: column; }
            #top .hero-card__chart { margin-top: auto; }
            #top .hero-flank--2, #top .hero-flank--3 { display: block; }

            /* READ ORDER. The DOM is 0,1,2,3 — cards 0 and 1 are the desktop
               LEFT column, 2 and 3 the right. Filling a 2-column grid in DOM
               order would put the left column's pair across the top row and
               transpose the whole arrangement. 'order' restores the desktop
               reading:

                   Skin Type      | Skin Condition
                   Skin Concerns  | Skin Analysis     */
            #top .hero-flank--0 { order: 1; }
            #top .hero-flank--2 { order: 2; }
            #top .hero-flank--1 { order: 3; }
            #top .hero-flank--3 { order: 4; }

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
               the desktop width keeps one length and one plain ratio.

               EVERY SIZE BELOW IS ONE OF THE RESERVES '--card-h' IS ADDED UP
               FROM, and none of them is restated here as a fresh ratio. That
               is the point: the box cannot drift out of step with what is in
               it, because the box IS what is in it. */
            #top .hero-card {
              padding: var(--card-pad) var(--card-pad) 0;
            }

            /* TWO LINES, ALWAYS, AND NEVER THREE. The reserve is what makes
               every card the same shape; the clamp is what stops a longer
               title than today's longest from breaking that promise. Both
               halves are needed — 'min-height' alone lets a third line push
               the chart out of the card, 'line-clamp' alone leaves a
               one-line title sitting in a shorter box. */
            #top .hero-card__title {
              font-size: var(--card-title-fs);
              line-height: 1.06;
              min-height: var(--card-title-h);
              margin-bottom: var(--card-title-mb) !important;
              letter-spacing: calc(var(--cw) * -0.3 / 188);
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            #top .hero-card__meta {
              gap: calc(var(--cw) * 8 / 188) !important;
              min-height: var(--card-meta-h);
              margin-bottom: var(--card-meta-mb) !important;
              /* Top, not centre. With a two-line reserve under a one-line
                 string, centring floated the glyph and its label into the
                 middle of the gap and the cards stopped agreeing about where
                 the meta row starts — which is the fault this whole block
                 exists to remove. */
              align-items: flex-start;
            }
            #top .hero-card__glyph {
              width: calc(var(--cw) * 17 / 188);
              height: calc(var(--cw) * 17 / 188);
              font-size: calc(var(--cw) * 8 / 188);
              /* Optically on the first line of the label beside it. */
              margin-top: calc(var(--card-meta-fs) * 0.2);
            }
            #top .hero-card__metatext {
              font-size: var(--card-meta-fs);
              line-height: 1.35;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            /* The two chart kinds share '--card-chart-h' as their FOOTPRINT,
               not as their height: the wave spends all of it on itself and
               bleeds to the card's bottom edge, the bars spend two thirds on
               the chart and one third on the margin under it. Same total
               either way, which is what lets one '--card-h' cover both. */
            /* 'flex-shrink: 0' is the guard rail. The chart is the last item
               in a fixed-height flex column, so it is the one thing that can
               absorb an arithmetic error above it — silently, by rendering
               shorter than asked. Refusing to shrink turns any future
               mistake into a visible overflow instead of a quiet one. */
            #top .hero-card__chart { flex-shrink: 0; }
            #top .hero-card__chart--bars {
              height: calc(var(--card-chart-h) * 0.66);
              margin-bottom: calc(var(--card-chart-h) * 0.34);
              gap: calc(var(--cw) * 5 / 188);
            }
            #top .hero-card__chart--wave {
              height: var(--card-chart-h);
              margin-left: calc(-1 * var(--card-pad));
              margin-right: calc(-1 * var(--card-pad));
            }

            /* The radius comes down with everything else — 22px on a 143px
               card reads as a pill rather than a rounded rectangle. */
            #top .hero-card { border-radius: calc(var(--cw) * 18 / 188); }
          }
        }

        /* =====================================================================
           WHAT THE CARDS COST PER FRAME
           =====================================================================

           Both rules below are PHONE ONLY and were measured, at 4x CPU
           throttling on a 390x844 viewport, against the real pin scroll.

           'backdrop-filter' is the expensive one. Twelve cards each asking
           for a 26px blur plus a saturate of whatever is behind them means
           twelve backdrop reads per frame, and the thing behind them is a
           playing video — so every video frame invalidates all twelve. On
           desktop that is affordable and the glass is part of the design.
           At phone size the cards sit on flat canvas over a film that is
           already faded to near-canvas underneath them, so the blur has
           almost nothing to blur: swapping it for the colour it resolves to
           is visually a wash and takes the per-frame backdrop work to zero.

           'heroFloaty' is the other. It is a transform keyframe, which ought
           to be composited, but the cards sit inside a wrapper whose opacity
           is being cross-faded, so Chrome keeps them on the main thread and
           charges a style recalc per card per frame — 972 of them across one
           pass of the pin, measured. It also earns less here than it does on
           desktop: four cards locked into a 2x2 grid bobbing 8px out of
           phase with each other reads as wobble, not float. */
        @media (max-width: 600px) {
          #top .hero-card {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            /* What the blur resolves to over this section's canvas. */
            background: rgba(255, 255, 255, 0.88);
            /* '!important' is not decoration here. 'GlassCard' writes the
               float as an INLINE 'animation' shorthand — it has to, because
               each card gets its own duration — and an inline declaration
               beats any rule in this sheet without it. The two properties
               above need no such help: they come from Tailwind classes, which
               sit in '@layer utilities', and an unlayered rule beats a
               layered one whatever its specificity. */
            animation: none !important;
          }

          /* Only the stage on screen is painted. All three groups stay
             mounted — that is what keeps the cross-fade and the reverse
             scroll working — but the two that are at opacity 0 were still
             being composited, so the phone was paying for twelve cards to
             show four. 'visibility' is held until the fade has finished, so
             the transition itself is untouched. */
          #top .hero-flanks {
            visibility: hidden;
            transition: opacity 0.35s ease, visibility 0s linear 0.35s;
          }
          #top .hero-flanks[data-active='1'] {
            visibility: visible;
            transition: opacity 0.35s ease, visibility 0s;
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
        <div className="hero-copy relative z-20 shrink-0 pt-[76px]">
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
                  /* The fade's `transition` lives in the stylesheet, not here.
                     An inline one beats any rule, and the phone block pairs
                     `visibility` with the opacity so the two inactive groups
                     stop being painted once they have finished fading —
                     which it can only do by extending this same transition
                     with a delayed `visibility` leg. */
                  data-active={op[g] ? '1' : '0'}
                  style={{ opacity: op[g] }}
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
