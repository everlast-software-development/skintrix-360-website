import { SiApple, SiGoogleplay } from 'react-icons/si'

import { Reveal } from '@/components/ui/Reveal'
import { StoreButton } from '@/components/ui/StoreButton'
import { SITE } from '@/lib/site'

/**
 * Closing — the quiet end.
 *
 * Not a second hero: no full-bleed visual, no oversized headline, no video. A
 * short statement, the two store links, and one narrow detail crop of the model
 * bleeding off the lower edge — enough of the visual language to feel like the
 * same product, far too little to compete with the opening.
 */
export function Closing() {
  return (
    <section
      id="get-started"
      aria-labelledby="closing-heading"
      className="section-y-top relative isolate overflow-clip bg-canvas"
    >
      <div className="shell">
        <div className="max-w-[34rem] pb-[clamp(3rem,2rem+3.5vw,5.5rem)]">
          <Reveal>
            <h2 id="closing-heading" className="text-statement">
              Your skin is always changing.
              <br />
              Keep a clearer record of it.
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <StoreButton
                href={SITE.appStoreUrl}
                icon={<SiApple />}
                kicker="Download on the"
                name="App Store"
              />
              <StoreButton
                href={SITE.playStoreUrl}
                icon={<SiGoogleplay />}
                kicker="Get it on"
                name="Google Play"
              />
            </div>
          </Reveal>
        </div>
      </div>

      {/* A detail, not a portrait: cropped tight and faded out, so the page
          closes on a texture rather than restating the opening image. */}
      <img
        src="/image-3.webp"
        alt=""
        aria-hidden
        width={3373}
        height={2249}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute -right-[22%] -bottom-[34%] hidden h-[150%] w-auto max-w-none opacity-70 [mask-image:radial-gradient(52%_52%_at_46%_38%,#000_38%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:radial-gradient(52%_52%_at_46%_38%,#000_38%,rgba(0,0,0,0)_100%)] lg:block"
      />
    </section>
  )
}
