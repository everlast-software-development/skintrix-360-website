import { CompatibilityVerdicts } from '@/components/ui/compatibility-verdicts'

/**
 * Product Skin Compatibility — the section shell.
 *
 * The sticky two-column body lives in `@/components/ui/compatibility-verdicts`,
 * following this repo's split: `ui/` holds the reusable piece, `sections/`
 * holds the page-level wrapper that gives it an id, a landmark, the ground and
 * the container. `App.tsx` mounts this one, between Consultation and Pricing.
 *
 * THE GROUND IS #F5F6FD — the site's own. Consultation above paints no ground
 * of its own, so it sits on the page canvas at this value; Pricing below is
 * `--atm-blue`, the same value again. The three run continuous rather than
 * alternating, which is the page's dominant pattern.
 *
 * The cards therefore take `--surface-white`. A card must never be the same
 * value as the surface under it — that is what flattens a section — so the two
 * always move together: lavender ground, white cards.
 *
 * One flat colour, no gradient. The two blurred brand glows that used to sit
 * behind the content are gone, because that wash is what made the section look
 * like a different template.
 *
 * `compat-scope` carries the section's design tokens, declared in index.css.
 * They are scoped rather than global because two of the names — `--text-body`
 * and `--text-muted` — already exist at `:root` and are read by every other
 * section's type classes.
 *
 * `overflow-CLIP`, NOT `overflow-hidden`. `overflow: hidden` makes this element
 * a scroll container, and a `position: sticky` descendant then resolves against
 * THAT scrollport instead of the viewport — one of the two classic ways this
 * layout silently stops sticking (the other is `align-items: stretch`, see the
 * grid). `clip` clips the same pixels without creating a scroll container, and
 * the sticky column is measured pinning at 96px with it in place.
 *
 * It must never move to an ancestor either: there it would become the
 * containing block for the footer's `position: fixed` reveal child and kill
 * the reveal. See the note in App.tsx.
 *
 * `scroll-mt-24` (96px) matches the sticky offset, so landing on
 * `/#compatibility` parks the section under the fixed header, not behind it.
 */
export function Compatibility() {
  return (
    <section
      id="compatibility"
      aria-labelledby="compatibility-heading"
      className="compat-scope section-y relative w-full scroll-mt-24 overflow-clip"
      style={{ background: 'var(--page-lavender)' }}
    >
      {/* 1240px rather than the site's `shell` (1216px), per the brief. Same
          gutters as `shell` so the section never touches the viewport edge. */}
      <div className="shell">
        <CompatibilityVerdicts headingId="compatibility-heading" />
      </div>
    </section>
  )
}
