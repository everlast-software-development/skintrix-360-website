import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'

import { EASE } from '@/lib/motion'

/**
 * Parameters — "Know your skin better."
 *
 * An editorial explorer rather than a grid: an oversized numeral and one
 * parameter hold the stage, and scrolling advances to the next. The visual
 * treatment changes with each parameter — a different crop and a different
 * emphasis — so each gets its own moment instead of six identical tiles.
 */

const ITEMS = [
  { n: '01', label: 'Skin type', body: 'Understand your skin profile.', src: '/image-1.webp', pos: '50% 30%' },
  { n: '02', label: 'Pigmentation', body: 'Map visible pigmentation and uneven tone.', src: '/image.jpg', pos: '62% 40%' },
  { n: '03', label: 'Acne', body: 'Identify acne patterns and severity.', src: '/image-1.webp', pos: '38% 52%' },
  { n: '04', label: 'Wrinkles & aging', body: 'Track visible signs of skin aging.', src: '/image-2.webp', pos: '50% 24%' },
  { n: '05', label: 'Redness', body: 'Visualize areas of redness and vascular changes.', src: '/image.jpg', pos: '44% 52%' },
  { n: '06', label: 'Pores & texture', body: 'Measure visible pores and skin texture.', src: '/image-2.webp', pos: '52% 32%' },
]

export function Parameters() {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [i, setI] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setI(Math.min(ITEMS.length - 1, Math.max(0, Math.floor(v * ITEMS.length))))
  })

  const item = ITEMS[i]

  return (
    <section id="parameters" aria-labelledby="parameters-heading" className="relative bg-canvas">
      <div
        ref={trackRef}
        className="relative"
        style={reduced ? undefined : { height: `calc(100vh + ${ITEMS.length * 380}px)` }}
      >
        <div className={reduced ? 'py-[clamp(4rem,2.75rem+5vw,7.5rem)]' : 'sticky top-0 flex min-h-screen items-center py-16'}>
          <div className="shell w-full">
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="parameters-heading" className="text-statement">
                Know your skin better
              </h2>
              <span aria-hidden className="text-eyebrow shrink-0 text-ink-muted">
                {item.n} / {ITEMS[ITEMS.length - 1].n}
              </span>
            </div>

            <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,7rem)_minmax(0,22rem)_1fr] lg:gap-12">
              {/* The numeral, oversized — the editorial anchor. */}
              <m.p
                key={item.n}
                aria-hidden
                className="text-[clamp(4rem,2rem+7vw,8rem)] leading-none font-medium tracking-[-0.05em] text-ink-line"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {item.n}
              </m.p>

              {/* The visual — a different crop per parameter. */}
              <div className="relative aspect-[4/5] w-full overflow-clip rounded-[1.25rem] bg-[#F0F1F3]">
                <m.img
                  key={item.src + item.pos}
                  src={item.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: item.pos }}
                  initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>

              <div>
                <m.div
                  key={item.label}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <p className="text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                    {item.label}
                  </p>
                  <p className="mt-4 max-w-[26rem] text-[0.9375rem] leading-[1.8] text-ink-soft">
                    {item.body}
                  </p>
                </m.div>

                {/* Progress through the set, as rules rather than dots. */}
                <div aria-hidden className="mt-9 flex gap-1.5">
                  {ITEMS.map((it, k) => (
                    <m.span
                      key={it.n}
                      className="h-px flex-1 bg-ink-line"
                      animate={{ backgroundColor: k <= i ? 'rgb(28,186,181)' : 'rgb(231,233,236)' }}
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
