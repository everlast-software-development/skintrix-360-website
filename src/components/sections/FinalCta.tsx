import { SiApple, SiGoogleplay } from 'react-icons/si'

import { Reveal } from '@/components/ui/Reveal'
import { StoreButton } from '@/components/ui/StoreButton'
import { FINAL_CTA, SITE } from '@/lib/site'

/**
 * Section 05 — the close.
 *
 * A split rather than the usual centred headline-over-buttons: type and the
 * store links hold the left, a device stands at the right and is allowed to run
 * off the bottom edge, so the page ends mid-gesture instead of on a tidy
 * full stop. That asymmetry is what separates this from the stacked CTA it
 * replaces.
 *
 * Ground is the site canvas, same as every other section — the page runs one
 * uniform background end to end. Separation comes from the ring motif and the
 * device breaking the lower edge rather than from a change of colour.
 */
export function FinalCta() {
  return (
    <section
      id="download"
      aria-labelledby="cta-heading"
      className="section-y-top relative isolate overflow-clip bg-canvas"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -right-[10%] top-[6%] aspect-square h-[120%] rounded-full border border-[color:rgb(28_186_181_/_0.16)]" />
        <span className="absolute -right-[4%] top-[18%] aspect-square h-[86%] rounded-full border border-[color:rgb(28_186_181_/_0.11)]" />
        <span className="absolute right-[6%] top-[24%] aspect-square h-[70%] rounded-full bg-[radial-gradient(circle,rgb(28_186_181_/_0.14),transparent_68%)] blur-3xl" />
      </div>

      <div className="shell">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-8">
          {/* Stands in for this section's bottom padding — the section itself
              carries none, so the device can run off the lower edge. Scaled
              down with `--section-rhythm` so the page's last gap stays in
              proportion with every gap above it. */}
          <div className="pb-[clamp(3rem,2rem+3.5vw,5.5rem)]">
            <Reveal>
              <p className="text-eyebrow text-teal-deep">{FINAL_CTA.eyebrow}</p>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 id="cta-heading" className="text-section mt-5">
                Start understanding
                <br />
                your skin.
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="text-lead mt-6 max-w-[26rem] text-ink-soft">{FINAL_CTA.lead}</p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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

          {/* Stands at the edge and runs off the bottom — the page ends on a
              gesture rather than a centred full stop. */}
          <Reveal delay={0.12} className="flex justify-center lg:justify-end">
            <img
              src="/screen3.webp"
              alt="The SkinTrix360 app showing a skincare calendar with the day's routine and supplements"
              loading="lazy"
              decoding="async"
              draggable={false}
              className="-mb-12 h-[24rem] w-auto max-w-none sm:h-[30rem] lg:-mb-20 lg:h-[38rem]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
