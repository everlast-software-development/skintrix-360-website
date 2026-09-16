import { useEffect, useRef, useState } from 'react'
import type { ComponentType } from 'react'
import { FaFacebookF, FaInstagram, FaSnapchat, FaTiktok, FaXTwitter } from 'react-icons/fa6'

import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Logo } from '@/components/ui/Logo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { SITE } from '@/lib/site'

/**
 * Footer — one centred column over a flickering wordmark, revealed by the page
 * scrolling over it.
 *
 * THE REVEAL
 * ----------
 * Three nested pieces, none of them optional:
 *
 *   <footer h=--footer-h clip-path>   the real height. This is the scroll
 *                                     distance reserved for the reveal; the
 *                                     fixed child contributes nothing to
 *                                     layout, so without a height here the
 *                                     footer would occupy no space at all and
 *                                     there would be nothing to scroll past.
 *     <div fixed bottom-0 h=--footer-h>  pinned to the viewport, which is why
 *                                        the footer holds still while the page
 *                                        slides over it.
 *       <div sticky top=calc(100vh - --footer-h) overflow-y-auto>
 *
 * The `clip-path` is what confines the fixed child to the footer's own box.
 * `overflow` cannot do it — overflow clipping does not apply to a fixed
 * descendant whose containing block is the viewport — but `clip-path` clips its
 * whole subtree unconditionally, while (unlike `transform` or `filter`) NOT
 * becoming a containing block itself. That asymmetry is the entire trick.
 * Remove the clip-path and the footer paints over the whole page.
 *
 * The two heights must stay identical, which is why `--footer-h` is declared
 * once on the footer element and read by both. A taller reserve than the fixed
 * child leaves a gap at the end of the reveal; a shorter one ends it early.
 *
 * The reserve is measured against the real content height at every breakpoint
 * — the inner `overflow-y-auto` is a safety net for a viewport shorter than
 * the reserve, not the plan. Anything that makes this column taller has to be
 * paid for in `--footer-h`, or the clip-path cuts the bottom of the wordmark.
 *
 * THE REVEAL RUNS AT EVERY WIDTH — and the unit is why it can.
 *
 * It used to be disabled below 769px for two reasons, both real at the time:
 * the reserve did not fit the taller narrow-width content, and `100vh` is the
 * LARGE viewport (toolbars hidden) while the fixed child's `bottom: 0` tracks
 * the small one — so on a phone showing ~553px of a 667px viewport the
 * footer's top, the logo, sat permanently off screen, and the whole thing
 * jumped as the address bar collapsed.
 *
 * `svh` removes that. It is the SMALL viewport height: the height with the
 * toolbars SHOWN, which is the one measurement that does not change when they
 * hide. A fixed child positioned against it therefore cannot be moved by a
 * collapsing address bar, because the number it was placed with never moves.
 *
 * Both halves read the same expression, so the reserve and the fixed child are
 * identical by construction:
 *
 *   --footer-h: min(100svh, <cap>)
 *
 * The `min()` is the fit half of the old problem, solved rather than avoided.
 * The cap is the measured content height plus slack (760 / 820 / 880 across
 * the three tiers, against content of 683 / 753 / 793). `min()` then clamps
 * that to the viewport, which guarantees two things at once: the footer is
 * never taller than the screen, so the reveal always completes with no gap at
 * either end; and `calc(100svh - var(--footer-h))` is never negative, so the
 * sticky child cannot be pushed off its own track.
 *
 * On a viewport SHORTER than the content — a 375x667 or 320x568 phone, a
 * 1440x700 desktop window — no fixed layer can show all of it, so the footer
 * measures that case and drops into normal flow instead (`data-reveal="flow"`,
 * see `fits` in the component). The inner `overflow-y-auto` used to take up
 * the remainder there, which is what cut the wordmark off.
 *
 * `FaSnapchatGhost` does not exist in react-icons/fa6 — Font Awesome renamed
 * it to `FaSnapchat` in v6. Same glyph, already installed.
 */

const C = {
  /* No text ink here any more. The footer's content used to be one flat
     #0D1839 with a #1CBAB5 tagline; both are tokens now. The tagline is
     `--text-accent` (#1EB9B7, 2 points off its old #1CBAB5); everything else
     — social labels, their icons, the copyright and the legal links — is
     `--text-heading` (#1A2A5C), so the footer reads as one ink again rather
     than the body/muted split the scale first put it through.

     The icons carry no colour of their own: they inherit `currentColor` from
     the anchor, which is what keeps a glyph and its label the same value and
     lets one hover turn the whole cell teal.

     #0D1839 survives below for a drawn GLYPH only, never for type. */
  /** The `+` join between social cells — an SVG stroke, not text. */
  ink: '#0D1839',
  /** Focus rings. */
  teal: '#1EB9B7',
  /* The page ground — the footer continues the page surface rather than
     sitting on a card. The canvas overlay below fades to this EXACT value: a
     gradient landing on any other colour draws a visible seam right where the
     dots begin. */
  ground: '#F5F6FD',
  hair: '#E2E5F2',
} as const

type Social = {
  label: string
  href: string
  Icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

const SOCIALS: Social[] = [
  { label: 'Instagram', href: 'https://www.instagram.com/skintrix360.ai/', Icon: FaInstagram },
  { label: 'TikTok', href: 'https://www.tiktok.com/@skintrix360.ai', Icon: FaTiktok },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61590908840476',
    Icon: FaFacebookF,
  },
  { label: 'Snapchat', href: 'https://www.snapchat.com/@skintrix360', Icon: FaSnapchat },
  { label: 'X', href: 'https://x.com/skintrix360', Icon: FaXTwitter },
]

const LEGAL = [
  { label: 'Delete account', href: '/delete-account' },
  { label: 'Privacy Policy', href: SITE.privacyUrl },
]

/* ===========================================================================
   The cell grid, derived rather than hard-coded
   ===========================================================================

   Five platforms plus one deliberately empty box — six cells, which divides
   evenly into both column counts: 3 × 2 rows above 769px, 2 × 3 rows below.
   No partial row, so the grid is always a clean rectangle with no dead track.

   Every per-cell decision below is COMPUTED from (row, col, columnCount).
   Hard-coding indices would silently be wrong at one of the two counts: cell 3
   ends a row at two columns but sits mid-row at three, and the interior
   intersections move with it. */

const CELL_COUNT = 6

function cellFlags(i: number, cols: number) {
  const row = Math.floor(i / cols)
  const col = i % cols
  const lastRow = Math.floor((CELL_COUNT - 1) / cols)

  return {
    /** Checker by POSITION, so it stays a checker when the grid reflows. */
    tint: (row + col) % 2 === 0,
    /** Every cell except the last of its row. */
    borderRight: col < cols - 1,
    /** Every cell except those in the final row. */
    borderBottom: row < lastRow,
    /** A plus only where a cell exists BOTH to the right and below — i.e. a
        genuine crossing of two interior dividers, never an outer edge. */
    plus: col < cols - 1 && i + cols < CELL_COUNT,
  }
}

/**
 * Turns the two column counts into one class string per cell.
 *
 * Only the differences get a `min-[769px]:` variant, so the base classes are
 * the ≤768px (two-column) truth and the variants override just what changes.
 * Every candidate appears here as a literal string, which is what lets
 * Tailwind's scanner find them.
 */
function edgeClasses(i: number) {
  const sm = cellFlags(i, 2)
  const md = cellFlags(i, 3)
  const cls: string[] = []

  if (sm.borderRight) cls.push('border-r')
  if (md.borderRight !== sm.borderRight)
    cls.push(md.borderRight ? 'min-[769px]:border-r' : 'min-[769px]:border-r-0')

  if (sm.borderBottom) cls.push('border-b')
  if (md.borderBottom !== sm.borderBottom)
    cls.push(md.borderBottom ? 'min-[769px]:border-b' : 'min-[769px]:border-b-0')

  if (sm.tint) cls.push('bg-[#EDEFFA]')
  if (md.tint !== sm.tint)
    cls.push(md.tint ? 'min-[769px]:bg-[#EDEFFA]' : 'min-[769px]:bg-transparent')

  return cls.join(' ')
}

/** Which breakpoints show this cell's plus, if any. */
function plusClass(i: number) {
  const sm = cellFlags(i, 2).plus
  const md = cellFlags(i, 3).plus
  if (sm && md) return ''
  if (sm) return 'min-[769px]:hidden'
  if (md) return 'hidden min-[769px]:block'
  return null
}

/**
 * The corner glyph. Inline SVG — this repo has no icon library with a plus,
 * and the reference's lucide/shadcn dependency is not going in for one shape.
 *
 * Offset by half its own size, so its centre lands ON the intersection.
 */
function Plus() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke={C.ink}
      strokeWidth="1"
      className="pointer-events-none absolute right-[-12px] bottom-[-12px] z-10 h-6 w-6"
    >
      <path d="M12 4v16M4 12h16" />
    </svg>
  )
}

/**
 * 28ms per character, not the 55ms the short line used.
 *
 * The tagline is 57 characters — roughly double. At 55ms the wave would need
 * 3.14s to travel from the first letter to the last, inside a 2.6s cycle: the
 * head would restart before the tail ever lit, so the end of the sentence
 * would sit permanently dim. 57 × 28ms = 1.60s, which finishes comfortably
 * inside the cycle and leaves a clear dark beat before it repeats.
 */
const WAVE_STEP_MS = 28

/**
 * A line whose letters brighten in sequence, so a wave of light travels along
 * it and loops. The keyframes (`wave`, beside `drift-left` / `drift-right` in
 * `@theme`) animate opacity and nothing else, so the line can never reflow
 * mid-cycle.
 *
 * Split by WORD first, then by character inside each word. A flat run of
 * per-character spans would let the line break anywhere — mid-word — because
 * every span is its own inline box, and this sentence is long enough to wrap.
 * Wrapping each word in `white-space: nowrap` keeps words intact while leaving
 * the real spaces between them as break opportunities. The delay counter runs
 * continuously across words (and spends a step on each space), so the wave
 * crosses the whole sentence at one even pace rather than restarting per word.
 *
 * The split is presentational: the per-letter spans are hidden from assistive
 * tech and the unbroken string is exposed once, so a screen reader reads a
 * sentence rather than fifty-odd letters.
 *
 * Letters carry no colour of their own — they inherit `currentColor`, so the
 * line is whatever colour its container sets.
 */
function WaveText({ text }: { text: string }) {
  const words = text.split(' ')
  let i = 0

  return (
    <span className="inline-block">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => {
          const chars = word.split('').map((ch) => (
            <span
              key={i}
              className="animate-wave motion-reduce:animate-none motion-reduce:opacity-100"
              style={{ animationDelay: `${i++ * WAVE_STEP_MS}ms` }}
            >
              {ch}
            </span>
          ))
          /* The space is not animated — it has nothing to show — but it still
             advances the counter, so the pace does not stutter at word ends. */
          if (w < words.length - 1) i++

          return (
            <span key={word + w}>
              <span className="whitespace-nowrap">{chars}</span>
              {w < words.length - 1 ? ' ' : null}
            </span>
          )
        })}
      </span>
    </span>
  )
}

function LegalLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="ink-heading ink-hover-accent transition-colors duration-150 hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: C.teal }}
    >
      {label}
    </a>
  )
}

export function Footer() {
  /* The band's type size is a canvas argument, not CSS, so its breakpoints
     have to be read in JS. Four tiers, largest first. */
  const xl = useMediaQuery('(min-width: 1281px)')
  const lg = useMediaQuery('(min-width: 1025px)')
  const md = useMediaQuery('(min-width: 769px)')
  const wordmarkSize = xl ? 190 : lg ? 150 : md ? 100 : 56

  /**
   * Whether the reveal FITS. A fixed layer can never be taller than the
   * viewport it is fixed to — `min(100svh, …)` below guarantees that — so when
   * the content is taller than the screen (735px of it on a 667px or 568px
   * phone, or a short desktop window) the reserve came out shorter than the
   * content and the bottom of the footer was cut. Raising the cap does not
   * help: `100svh` is the side of the `min()` that wins.
   *
   * So on those viewports the footer drops the reveal and sits in normal flow,
   * where its reserve IS its content height and nothing can be cut. Everywhere
   * the content fits, the reveal is untouched.
   *
   * `column.scrollHeight` is the content height in both modes (in the reveal
   * it is at least the reserve, never less than the content), so toggling the
   * mode cannot change the answer and the observer cannot oscillate.
   */
  const columnRef = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState(true)

  useEffect(() => {
    const column = columnRef.current
    if (!column) return
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;height:100svh;width:0;visibility:hidden;pointer-events:none'
    const check = () => {
      document.body.appendChild(probe)
      const svh = probe.getBoundingClientRect().height || window.innerHeight
      probe.remove()
      setFits(column.scrollHeight <= Math.ceil(svh) + 1)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(column)
    window.addEventListener('resize', check)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [])

  return (
    <footer
      /* `--footer-h` is measured, not chosen, and lives here and nowhere else
         — both heights below read it and they must never diverge.

         `data-reveal="flow"` is the no-fit case above: every height goes back
         to auto and the fixed/sticky layers become ordinary blocks. */
      data-reveal={fits ? undefined : 'flow'}
      className="group/footer relative h-[var(--footer-h)] w-full [--footer-h:min(100svh,760px)] [clip-path:polygon(0%_0,100%_0%,100%_100%,0_100%)] min-[769px]:[--footer-h:min(100svh,820px)] min-[1025px]:[--footer-h:min(100svh,880px)] data-[reveal=flow]:h-auto"
      style={{ background: C.ground }}
    >
      <div
        className="fixed bottom-0 h-[var(--footer-h)] w-full group-data-[reveal=flow]/footer:static group-data-[reveal=flow]/footer:h-auto"
        style={{ background: C.ground }}
      >
        <div className="sticky top-[calc(100svh-var(--footer-h))] h-full overflow-y-auto group-data-[reveal=flow]/footer:static group-data-[reveal=flow]/footer:h-auto group-data-[reveal=flow]/footer:overflow-visible">
          {/* `flex-[1_0_auto]` on the column, not `flex-1`: grow into any slack
              the reserve leaves over, but never compress below the content's
              natural height. That slack lands above the band, which keeps the
              band flush with the very bottom edge. With the reveal off,
              `h-full` resolves against an auto-height parent, so it means
              nothing and the column is simply as tall as its content. */}
          <div ref={columnRef} className="flex h-full flex-col">
            <div className="mx-auto flex w-full max-w-[900px] flex-[1_0_auto] flex-col items-center px-6 pt-14 text-center">
              {/* ── logo ─────────────────────────────────────────────────── */}
              <a
                href="/"
                aria-label="SkinTrix 360 home"
                className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: C.teal }}
              >
                {/* `!` beats the component's own `h-9 sm:h-10`. */}
                <Logo className="h-[38px]! min-[769px]:h-[44px]! min-[1025px]:h-[56px]!" />
              </a>

              {/* ── tagline — the wave lives here now ────────────────────
                  The only thing in the footer that is not `--ink`. Its size and
                  position are unchanged; what moved onto it is the per-letter
                  animation that used to sit on a duplicate line below the
                  legal row. */}
              <p
                className="type-h3 ink-accent mt-[22px] max-w-[560px]"
              >
                <WaveText text="AI-powered skin intelligence. No brand affiliation, ever." />
              </p>

            </div>

            {/* ── the social cell grid ─────────────────────────────────
                A FULL-WIDTH band, deliberately a sibling of the centred column
                above rather than a child of it.

                WHY THIS IS NOT `100vw` ANY MORE
                The top and bottom hairlines are full-bleed: they run the whole
                footer while the grid itself is capped at 820px. They used to
                escape the cap with `width: 100vw` + `left: 50%` +
                `translateX(-50%)`, and that was the horizontal scrollbar bug.
                `100vw` is the viewport INCLUDING the vertical scrollbar, so a
                `100vw` child is ~15px wider than the visible page and forces
                the document to scroll sideways — measured at exactly 15px on
                1440/1280/1024 and 8px (half, because it was centred) on
                768/375.

                `left: 0; right: 0` with no width declaration is the same
                visual result and cannot overflow, because it resolves against
                this band's layout box instead of the viewport. The band is
                already the footer's full width, so no `vw` unit is involved
                anywhere in the footer now.

                `calc(100vw - (100vw - 100%))` was the other option offered, but
                it resolves to `100%` OF THE CONTAINING BLOCK — inside the old
                820px grid that is 820px, not full-bleed. It only helps when the
                containing block is already page-wide, which is exactly the
                condition this restructure creates directly. */}
            <div className="relative mt-9 w-full shrink-0">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-[-1px] right-0 left-0"
                style={{ borderTop: `1px solid ${C.hair}` }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-[-1px] right-0 left-0"
                style={{ borderBottom: `1px solid ${C.hair}` }}
              />

              {/* `px-6` sits here, NOT on the band: the hairlines resolve
                  against the band's padding box, so padding there would inset
                  them and they would stop being full-bleed. This keeps the
                  grid's own gutter identical to what the centred column gave
                  it before. */}
              <div className="px-6">
                <div
                  className="mx-auto grid w-full max-w-[820px] grid-cols-2 min-[769px]:grid-cols-3"
                  style={{ borderLeft: `1px solid ${C.hair}`, borderRight: `1px solid ${C.hair}` }}
                >
                {SOCIALS.map((s, i) => {
                  const showPlus = plusClass(i)
                  return (
                    <div
                      key={s.label}
                      className={`relative flex ${edgeClasses(i)}`}
                      style={{ borderColor: C.hair }}
                    >
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`SkinTrix 360 on ${s.label}`}
                        /* Fills the cell, so the whole box is the hit area. */
                        className="ink-heading ink-hover-accent flex w-full items-center justify-center gap-2.5 px-[14px] py-6 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 min-[769px]:px-5 min-[769px]:py-8"
                        style={{ outlineColor: C.teal }}
                      >
                        {/* Neither the icon nor the name carries a colour of
                            its own — both inherit `currentColor` from the
                            anchor, which is what makes ONE hover handler turn
                            the whole cell teal. */}
                        <s.Icon
                          aria-hidden
                          className="h-[22px] w-[22px] shrink-0 min-[769px]:h-[26px] min-[769px]:w-[26px]"
                        />
                        <span className="type-lead ink-heading whitespace-nowrap">
                          {s.label}
                        </span>
                      </a>

                      {showPlus !== null ? (
                        <span className={showPlus}>
                          <Plus />
                        </span>
                      ) : null}
                    </div>
                  )
                })}

                {/* The sixth box. Empty on purpose: it keeps the grid a clean
                    rectangle instead of leaving a ragged notch, and it carries
                    the same borders and checker tint as a real cell so it
                    reads as part of the structure rather than a gap. */}
                <div
                  aria-hidden="true"
                  className={`relative flex ${edgeClasses(5)}`}
                  style={{ borderColor: C.hair }}
                />
                </div>
              </div>
            </div>

            {/* The centred column resumes for the legal row. `flex-[1_0_auto]`
                stays on the FIRST column only, so the reserve's slack still
                lands above the grid and the wordmark band stays flush with the
                footer's bottom edge. */}
            <div className="mx-auto flex w-full max-w-[900px] flex-col items-center px-6 text-center">

              {/* ── legal ────────────────────────────────────────────────── */}
              <div className="type-small mt-10 flex flex-wrap items-center justify-center gap-x-[30px] gap-y-2">
                {/* Literal year, as specified — not `new Date()`. */}
                <span className="ink-heading">© 2026 SkinTrix360. All rights reserved.</span>
                <LegalLink {...LEGAL[0]} />
                <LegalLink {...LEGAL[1]} />
              </div>
            </div>

            {/* ── the flickering wordmark ────────────────────────────────
                Flush with the bottom edge — no padding under it. The overlay
                fades the top of the field into the ground so the dots emerge
                instead of starting on a hard line.

                The gradient's stops are `rgb(245 246 253 / 0)`, not
                `transparent`: `transparent` is transparent BLACK, and
                interpolating from it greys the middle of the ramp into a
                visible smudge. */}
            <div
              aria-hidden="true"
              className="relative mt-[52px] h-[170px] w-full shrink-0 min-[769px]:h-[260px]"
            >
              <FlickeringGrid
                squareSize={2}
                gridGap={md ? 3 : 2}
                flickerChance={0.1}
                color="rgba(13, 24, 57, 1)"
                maxOpacity={0.22}
                glyphBoost={0.62}
                text="SKINTRIX 360"
                fontSize={wordmarkSize}
                fontWeight={700}
                letterSpacingEm={0.04}
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgb(245 246 253 / 0) 0%, rgb(245 246 253 / 0) 40%, ${C.ground} 100%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
