import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'

import { EASE } from '@/lib/motion'

/**
 * Process — "From image to skin intelligence."
 *
 * One stage that transforms rather than four cards: the same capture stays on
 * screen while what is drawn over it changes — nothing, then detection points,
 * then structured readings, then a timeline. The copy changes with it. Because
 * the image never leaves, the four steps read as one continuous process.
 */

const STAGES = [
  {
    n: '01',
    label: 'Capture',
    body: 'Take a high-quality facial image using your camera or compatible clinical equipment.',
  },
  {
    n: '02',
    label: 'Analyze',
    body: 'Our AI processes the image and identifies relevant skin features.',
  },
  {
    n: '03',
    label: 'Understand',
    body: 'SkinTrix organizes the results into clear skin parameters and visual insights.',
  },
  {
    n: '04',
    label: 'Track',
    body: 'Monitor changes over time and use your data to support better skin-care decisions.',
  },
]

const POINTS = [
  { x: 50, y: 30 },
  { x: 38, y: 42 },
  { x: 62, y: 42 },
  { x: 44, y: 55 },
  { x: 58, y: 55 },
  { x: 50, y: 66 },
]

const READINGS = ['Pigmentation', 'Redness', 'Texture']

export function Process() {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [s, setS] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setS(Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length))))
  })


  return (
    <section id="process" aria-labelledby="process-heading" className="relative bg-canvas">
      <div
        ref={trackRef}
        className="relative"
        style={reduced ? undefined : { height: `calc(100vh + ${STAGES.length * 400}px)` }}
      >
        <div className={reduced ? 'py-[clamp(4rem,2.75rem+5vw,7.5rem)]' : 'sticky top-0 flex min-h-screen items-center py-16'}>
          <div className="shell w-full">
            <h2 id="process-heading" className="text-statement max-w-[26rem]">
              From image to skin intelligence
            </h2>

            <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-16">
              {/* The capture — constant. What is drawn over it changes. */}
              <div className="relative mx-auto w-full max-w-[24rem] overflow-clip rounded-[1.5rem] bg-[#F0F1F3] lg:mx-0">
                <img
                  src="/image.jpg"
                  alt="A facial capture moving through capture, analysis, insight and tracking"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block aspect-square w-full object-cover object-[58%_38%]"
                />

                {/* 02 — detection points. */}
                {POINTS.map((p, i) => (
                  <m.span
                    key={`${p.x}-${p.y}`}
                    aria-hidden
                    className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal ring-[3px] ring-[color:rgb(22_184_176_/_0.2)]"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    animate={{ opacity: s >= 1 ? 1 : 0 }}
                    transition={{ duration: 0.45, delay: s >= 1 ? i * 0.05 : 0, ease: EASE }}
                  />
                ))}

                {/* 03 — structured readings. */}
                <m.div
                  aria-hidden
                  className="absolute inset-x-3 bottom-3 space-y-1.5"
                  animate={{ opacity: s >= 2 ? 1 : 0, y: s >= 2 ? 0 : 8 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {READINGS.map((r) => (
                    <span
                      key={r}
                      className="flex items-center justify-between rounded-lg bg-[color:rgb(255_255_255_/_0.86)] px-2.5 py-1.5 backdrop-blur-sm"
                    >
                      <span className="text-eyebrow text-teal-deep">{r}</span>
                      <span className="h-1 w-14 overflow-clip rounded-full bg-ink-line">
                        <span className="block h-full w-2/3 rounded-full bg-teal" />
                      </span>
                    </span>
                  ))}
                </m.div>

                {/* 04 — the timeline. */}
                <m.div
                  aria-hidden
                  className="absolute inset-x-3 top-3 flex items-center gap-1.5"
                  animate={{ opacity: s >= 3 ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {[0, 1, 2, 3].map((k) => (
                    <span
                      key={k}
                      className={
                        'h-1 flex-1 rounded-full ' + (k <= 3 ? 'bg-teal' : 'bg-ink-line')
                      }
                      style={{ opacity: 0.35 + k * 0.22 }}
                    />
                  ))}
                </m.div>
              </div>

              {/* The narration. */}
              <div>
                <ol className="space-y-0.5">
                  {STAGES.map((st, i) => (
                    <li key={st.n}>
                      <m.div
                        className="border-t border-ink-line py-4"
                        animate={{ opacity: i === s ? 1 : 0.3 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="text-eyebrow text-teal-deep">{st.n}</span>
                          <span className="text-[1.25rem] font-medium tracking-[-0.02em]">
                            {st.label}
                          </span>
                        </div>
                        <m.p
                          className="mt-2 max-w-[30rem] overflow-hidden text-[0.9375rem] leading-[1.8] text-ink-soft"
                          animate={{ height: i === s ? 'auto' : 0, opacity: i === s ? 1 : 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {st.body}
                        </m.p>
                      </m.div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
