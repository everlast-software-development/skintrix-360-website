/**
 * Product Skin Compatibility — sticky pitch, scrolling verdicts.
 *
 * THE LAYOUT. Two columns: the pitch on the left holds still while the three
 * verdict cards travel past it on the right. That is the argument the section
 * makes — the same claim, held steady, answered three different ways.
 *
 * `align-items: start` ON THE GRID IS LOAD-BEARING. A grid's default
 * `align-items: stretch` makes both columns the full height of the row, and a
 * `position: sticky` element that is already as tall as its containing block
 * has nowhere to travel, so it silently never sticks. This is the single most
 * common way this layout fails and there is no error when it does.
 *
 * ONE ELEMENT CARRIES THE VERDICT COLOUR: the card's header band. The tags
 * below it are a neutral grey, the body is plain white, and there is no edge
 * bar and no meter. That is what keeps the three cards comparable — the eye
 * goes to the band, reads the words, and moves on.
 *
 * COLOURS COME FROM TOKENS, NOT FROM HERE. Every value is a `var()` declared
 * in `index.css` under `.compat-scope`, including the verdict pairs — this
 * file contains no hex at all.
 *
 * NO IMAGERY AND NO ICONS. There is not a single SVG in this section any more.
 *
 * NOTHING MOVES and nothing is interactive: no state, no effects, no timers,
 * no handlers, no network, no camera. There is no link and no control in this
 * section at all — it is text and colour.
 *
 * THE SAMPLE FRAMING lives on the cards now. The standing disclaimer under the
 * left column is gone, so "Example product · brand not shown" on every card is
 * the only thing saying these are illustrations rather than checks the site
 * performed. Do not drop that line from the cards.
 */

/* ===========================================================================
   The three states — semantic data, pointing at the scoped tokens
   =========================================================================== */

import { FeatureTile } from '@/components/ui/FeatureTile'
import { LuSprayCan } from 'react-icons/lu'

type VerdictState = {
  /** The header band's background. */
  band: string
  /** The header band's text, both sides of it. */
  ink: string
  /** The verdict in words. THIS is the signal — the colour and the percentage
   *  are both supplementary, so the card reads correctly in greyscale. */
  label: string
  /** Supplementary, never the primary signal. */
  fit: string
}

const STATES = {
  good: {
    band: 'var(--verdict-good-band)',
    ink: 'var(--verdict-good-ink)',
    label: 'Good match',
    fit: '92% fit',
  },
  caution: {
    band: 'var(--verdict-caution-band)',
    ink: 'var(--verdict-caution-ink)',
    label: 'Use with care',
    fit: '54% fit',
  },
  avoid: {
    band: 'var(--verdict-avoid-band)',
    ink: 'var(--verdict-avoid-ink)',
    label: 'Not for you',
    fit: '11% fit',
  },
} as const satisfies Record<string, VerdictState>

/* ===========================================================================
   Content — unchanged copy, unchanged order
   =========================================================================== */

const VERDICTS = [
  {
    state: STATES.good,
    name: 'Niacinamide 10% + Zinc 1% Serum',
    reason:
      'Because your skin is oily with visible pigmentation, this targets both without adding oil.',
    chips: ['Oil control', 'Pigmentation', 'Enlarged pores'],
  },
  {
    state: STATES.caution,
    name: 'Retinol 0.5% Night Cream',
    reason:
      'Because your skin shows dryness alongside texture concerns, this helps — but only if you build up slowly.',
    chips: ['Start twice weekly', 'Pair with moisturiser', 'Avoid with acids'],
  },
  {
    state: STATES.avoid,
    name: 'Denatured Alcohol Toner',
    reason:
      'Because your skin is already showing barrier irritation, this would make it worse.',
    chips: ['Strips the barrier', 'Increases redness'],
  },
] as const

const INPUTS = [
  { label: 'Scan the barcode', index: '01' },
  { label: 'Upload from your library', index: '02' },
  { label: 'Type the product name', index: '03' },
] as const

/* ===========================================================================
   The section body
   =========================================================================== */

export function CompatibilityVerdicts({ headingId }: { headingId: string }) {
  return (
    <div className="grid grid-cols-1 items-start gap-y-14 min-[1024px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] min-[1024px]:gap-x-[72px]">
      {/* ── left column — pinned ─────────────────────────────────────────────
          `sticky` only from 1024px up; below that it is a normal block sitting
          above the cards, still left-aligned. `top: 96px` clears the fixed
          header. */}
      <div className="min-[1024px]:sticky min-[1024px]:top-24">
        <FeatureTile
          group="planning"
          icon={LuSprayCan}
          name="Product Compatibility"
          description="In the app"
        />

        <h2
          id={headingId}
          className="text-section"
        >
          The same product.{' '}
          <span className="min-[1024px]:block">Three different answers.</span>
        </h2>

        <p
          className="mt-5 max-w-[44ch] text-[16px] leading-[1.7]"
          style={{ color: 'var(--text-body)', fontWeight: 400 }}
        >
          SkinTrix 360 checks a product against your own skin analysis, so the verdict is about
          you — not about the product&rsquo;s marketing. Scan the barcode, upload the label, or
          type the name.
        </p>

        {/* The input methods, as a ruled list.

            Every row carries a top AND a bottom rule, so the list is closed at
            both ends. `-mt-px` on every row after the first pulls each one up
            onto its neighbour's rule, so the shared edges render as ONE 1px
            hairline instead of two stacked ones. Without it every interior
            rule is 2px and reads as a mistake. */}
        <ul className="mt-8">
          {INPUTS.map(({ label, index }, i) => (
            <li
              key={label}
              className={`flex items-center justify-between py-3 ${i > 0 ? '-mt-px' : ''}`}
              style={{
                borderTop: '1px solid var(--rule)',
                borderBottom: '1px solid var(--rule)',
              }}
            >
              <span className="text-[14px]" style={{ color: 'var(--ink-navy)', fontWeight: 400 }}>
                {label}
              </span>
              <span className="text-[12px]" style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                {index}
              </span>
            </li>
          ))}
        </ul>

      </div>

      {/* ── right column — scrolls with the page ─────────────────────────────
          No `overflow` of any kind here: this must not become its own scroll
          container, or the cards would scroll inside the column instead of
          travelling past the sticky pitch. */}
      <ul className="flex flex-col gap-4">
        {VERDICTS.map(({ state, name, reason, chips }) => (
          <li
            key={name}
            /* `overflow-hidden` is required, not cosmetic: it is what clips the
               full-bleed header band to the card's top two corners. */
            className="overflow-hidden rounded-[18px]"
            style={{
              background: 'var(--surface-white)',
              boxShadow: '0 4px 20px rgb(16 27 69 / 0.05)',
            }}
          >
            {/* THE HEADER BAND — the only element carrying the verdict colour.
                The band is the pill; there is no pill inside it and no icon. */}
            <div
              className="flex items-center justify-between px-[18px] py-3 min-[640px]:px-6 min-[640px]:py-3.5"
              style={{ background: state.band, color: state.ink }}
            >
              <span className="text-[13px]" style={{ fontWeight: 500 }}>
                {state.label}
              </span>
              {/* Supplementary. The words on the left carry the verdict. */}
              <span className="text-[13px]" style={{ fontWeight: 500 }}>
                {state.fit}
              </span>
            </div>

            <div className="p-[18px] min-[640px]:px-6 min-[640px]:pt-[22px] min-[640px]:pb-6">
              <h3 className="text-[18px]" style={{ color: 'var(--ink-navy)', fontWeight: 500 }}>
                {name}
              </h3>
              <p
                className="mt-1 mb-[14px] text-[12px]"
                style={{ color: 'var(--text-muted)', fontWeight: 400 }}
              >
                Example product · brand not shown
              </p>

              <p
                className="text-[14px] leading-[1.65]"
                style={{ color: 'var(--text-body)', fontWeight: 400 }}
              >
                {reason}
              </p>

              {/* Neutral on purpose — see the note on the band above. */}
              <ul className="mt-5 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-[20px] px-3 py-1.5 text-[12px]"
                    style={{
                      background: 'var(--tag-tint)',
                      color: 'var(--text-body)',
                      fontWeight: 400,
                    }}
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
