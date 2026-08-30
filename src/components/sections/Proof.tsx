import { Reveal } from '@/components/ui/Reveal'

/**
 * Proof — "Why SkinTrix 360?"
 *
 * The figures are set as typography, not boxed into metric cards: the numbers
 * are large enough to be the composition, and the labels hang off them. Nothing
 * here is a container — hierarchy comes from scale, weight and position only.
 */

const PROOF = [
  { value: '15+', label: 'Skin parameters', size: 'text-[clamp(3.5rem,2rem+6vw,7.5rem)]' },
  { value: 'AI-powered', label: 'Computer vision analysis', size: 'text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]' },
  { value: '<30 sec', label: 'Analysis time', size: 'text-[clamp(2.5rem,1.5rem+3.4vw,4.5rem)]' },
  { value: 'Progress', label: 'Compare changes over time', size: 'text-[clamp(2rem,1.2rem+2.6vw,3.5rem)]' },
]

export function Proof() {
  return (
    <section id="why-skintrix" aria-labelledby="why-skintrix-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <div className="max-w-[34rem]">
          <Reveal>
            <p className="text-eyebrow text-teal-deep">Why SkinTrix 360</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="why-skintrix-heading" className="text-statement mt-4">
              See beyond the surface.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-soft">
              Traditional skin assessment can be subjective. SkinTrix adds measurable AI-powered
              insights to help make skin assessment more consistent, visual, and trackable.
            </p>
          </Reveal>
        </div>

        {/* Staggered so the figures read as a composition rather than a row. */}
        <dl className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:gap-y-20">
          {PROOF.map((p, i) => (
            <Reveal key={p.value} delay={0.06 * i}>
              <div
                className={
                  i === 1 ? 'sm:mt-10' : i === 2 ? 'sm:-mt-4' : i === 3 ? 'sm:mt-6' : undefined
                }
              >
                <dt
                  className={
                    p.size + ' leading-[0.95] font-medium tracking-[-0.045em] text-ink'
                  }
                >
                  {p.value}
                </dt>
                <dd className="mt-4 border-t border-ink-line pt-4 text-[0.9375rem] text-ink-soft">
                  {p.label}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
