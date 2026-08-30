import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'

/**
 * Story — "Your skin tells a story."
 *
 * A deliberate change of register after the analysis panel: no viewport, no
 * markers, no interface. Type is the whole composition and the only visual is a
 * tall crop of a portrait bleeding off the right edge, drifting slowly against
 * the scroll. Calm after technical.
 */
export function Story() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <section id="story" aria-labelledby="story-heading" className="section-y relative overflow-clip bg-canvas">
      <div ref={ref} className="shell relative">
        <div className="relative z-10 max-w-[46rem]">
          <Reveal>
            <h2
              id="story-heading"
              className="text-[clamp(2.5rem,1.4rem+4.4vw,5rem)] leading-[1.02] font-medium tracking-[-0.04em]"
            >
              Your skin tells
              <br />
              a story.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-3 text-[clamp(2.5rem,1.4rem+4.4vw,5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-ink-muted">
              SkinTrix helps
              <br />
              you read it.
            </p>
          </Reveal>
        </div>

        {/* Supporting copy sits low and left, well under the statement, so the
            type block stays the subject rather than becoming a paragraph. */}
        <Reveal delay={0.2}>
          <div className="relative z-10 mt-14 max-w-[30rem] lg:mt-24">
            <p className="text-[0.9375rem] leading-[1.8] text-ink-soft">
              A simple facial image can reveal patterns that are difficult to track by eye.
              SkinTrix 360 uses AI-powered computer vision to analyze your skin, identify key
              characteristics, and create a clear picture of your skin health.
            </p>
          </div>
        </Reveal>

        {/* Runs off the right edge and is masked into the canvas — the calm
            counterpart to the analysis viewport's hard frame. */}
        <m.img
          src="/image-2.webp"
          alt=""
          aria-hidden
          width={1536}
          height={2752}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={reduced ? undefined : { y }}
          className="pointer-events-none absolute -right-[18%] -top-[6%] hidden h-[124%] w-auto max-w-none opacity-90 [mask-image:radial-gradient(68%_62%_at_44%_42%,#000_46%,rgba(0,0,0,0)_100%)] [-webkit-mask-image:radial-gradient(68%_62%_at_44%_42%,#000_46%,rgba(0,0,0,0)_100%)] lg:block"
        />
      </div>
    </section>
  )
}
