import { CompatibilityBento } from '@/components/ui/compatibility-bento'

/**
 * Product Skin Compatibility — the section shell.
 *
 * The grid itself lives in `@/components/ui/compatibility-bento`, following
 * this repo's split: `ui/` holds the reusable piece, `sections/` holds the
 * page-level wrapper that gives it an id, a landmark, the ground and the
 * container. `App.tsx` mounts this one, between Consultation and Pricing.
 *
 * `section-y` + `shell` are the site's rhythm token and container utility, the
 * same two every neighbouring section uses, so this section keeps the page's
 * cadence and gutters exactly.
 *
 * `overflow-hidden` is on THIS element only, to hold the glow inside the band.
 * It must never move to an ancestor: there it would become the containing
 * block for the footer's `position: fixed` reveal child and kill the reveal.
 * See the note in App.tsx.
 */
export function Compatibility() {
  return (
    <section
      id="compatibility"
      aria-labelledby="compatibility-heading"
      className="section-y relative w-full overflow-hidden"
      style={{ background: '#F5F6FD' }}
    >
      {/* One faint teal radial, purely atmospheric. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 0%, rgb(30 185 183 / 0.10) 0%, rgb(30 185 183 / 0) 70%)',
        }}
      />

      <div className="shell">
        <CompatibilityBento headingId="compatibility-heading" />
      </div>
    </section>
  )
}
