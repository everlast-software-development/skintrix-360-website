import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'

import { EASE } from '@/lib/motion'

/**
 * FaceExplorer — "See your skin from every angle."
 *
 * A pinned stage where exactly one parameter is active at a time: its region on
 * the face highlights, its marker lights, its label appears. Scroll advances
 * the reading. Showing all six at once would be a diagram; showing one at a
 * time is what makes it read as a system looking at a face.
 *
 * The base image already carries a facial mesh, so the mapping does not need
 * to be drawn — the highlight simply moves across a face that is visibly
 * already understood.
 */

/** Regions in percentages of the portrait, measured off `image-1.webp`. */
const PARAMS = [
  { label: 'Acne', at: { x: 36, y: 52 }, r: 13 },
  { label: 'Pigmentation', at: { x: 64, y: 50 }, r: 14 },
  { label: 'Redness', at: { x: 50, y: 60 }, r: 12 },
  { label: 'Wrinkles', at: { x: 50, y: 33 }, r: 15 },
  { label: 'Pores', at: { x: 50, y: 47 }, r: 10 },
  { label: 'Skin texture', at: { x: 33, y: 40 }, r: 12 },
]

export function FaceExplorer() {
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(PARAMS.length - 1, Math.max(0, Math.floor(v * PARAMS.length)))
    setActive(i)
  })

  return (
    <section id="explore" aria-labelledby="explore-heading" className="relative bg-canvas">
      <div
        ref={trackRef}
        className="relative"
        style={reduced ? undefined : { height: `calc(100vh + ${PARAMS.length * 420}px)` }}
      >
        <div className={reduced ? 'py-[clamp(4rem,2.75rem+5vw,7.5rem)]' : 'sticky top-0 flex min-h-screen items-center py-16'}>
          <div className="shell w-full">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
              {/* The face, with the active region highlighted. */}
              <div className="relative mx-auto w-full max-w-[26rem] lg:mx-0 lg:max-w-none">
                <img
                  src="/image-1.webp"
                  alt="A facial image with an AI-generated analysis mesh mapped across the skin"
                  width={1044}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block w-full"
                />

                {PARAMS.map((p, i) => (
                  <m.span
                    key={p.label}
                    aria-hidden
                    className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: `${p.at.x}%`,
                      top: `${p.at.y}%`,
                      width: `${p.r * 2}%`,
                      aspectRatio: '1',
                      background:
                        'radial-gradient(circle, rgb(22 184 176 / 0.26) 0%, rgb(22 184 176 / 0.06) 58%, transparent 72%)',
                    }}
                    animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 0.85 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                ))}

                {PARAMS.map((p, i) => (
                  <m.span
                    key={p.label + '-dot'}
                    aria-hidden
                    className="pointer-events-none absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal"
                    style={{ left: `${p.at.x}%`, top: `${p.at.y}%` }}
                    animate={{ opacity: active === i ? 1 : 0.18 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  />
                ))}
              </div>

              {/* The reading. */}
              <div>
                <p className="text-eyebrow text-teal-deep">Skin parameters</p>
                <h2 id="explore-heading" className="text-section mt-4">
                  See your skin from every angle
                </h2>
                <p className="mt-5 max-w-[28rem] text-[0.9375rem] leading-[1.8] text-ink-soft">
                  Get a detailed AI-powered assessment from a simple facial image. SkinTrix
                  analyzes 15+ skin parameters to help identify visible changes and skin concerns.
                </p>

                <ul className="mt-9 space-y-0.5">
                  {PARAMS.map((p, i) => (
                    <li key={p.label}>
                      <m.span
                        className="flex items-baseline gap-3 border-t border-ink-line py-3"
                        animate={{ opacity: active === i ? 1 : 0.32 }}
                        transition={{ duration: 0.4, ease: EASE }}
                      >
                        <span className="text-eyebrow w-6 shrink-0 text-teal-deep">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[1.0625rem] font-medium tracking-[-0.02em]">
                          {p.label}
                        </span>
                      </m.span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
