import { useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import { EASE } from '@/lib/motion'

/**
 * Tracking — "Your skin changes. Now you can track it."
 *
 * Snapshot, comparison, progress — expressed with one handle. Dragging moves
 * between two scans and the four readings move with it.
 *
 * A note on honesty: the project holds one capture of this subject, so both
 * sides of the comparison are that same photograph. The demonstration is in the
 * readings, which is why the photo carries no simulated "improvement" — inventing
 * a visibly different after-image would be claiming a result the product has not
 * produced. Swapping in a real second capture needs only a second `src`.
 *
 * The handle is a range input rather than a bespoke drag surface, so it works
 * with touch, mouse and keyboard without reimplementing any of them.
 */

const READINGS = [
  { label: 'Pigmentation', from: 62, to: 41 },
  { label: 'Redness', from: 48, to: 29 },
  { label: 'Texture', from: 55, to: 38 },
  { label: 'Acne', from: 34, to: 18 },
]

export function Tracking() {
  const reduced = useReducedMotion()
  const [pos, setPos] = useState(50)
  const t = pos / 100

  return (
    <section id="tracking" aria-labelledby="tracking-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <div className="max-w-[34rem]">
          <Reveal>
            <p className="text-eyebrow text-teal-deep">Progress</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 id="tracking-heading" className="text-statement mt-4">
              Your skin changes.
              <br />
              Now you can track it.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-soft">
              One scan gives you a snapshot. Regular scans help you see the bigger picture. Compare
              your skin over time and visualize changes with clear, measurable data.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,30rem)_1fr] lg:items-center lg:gap-16">
            {/* The comparison. */}
            <div className="relative mx-auto w-full max-w-[30rem] lg:mx-0">
              <div className="relative overflow-clip rounded-[1.5rem] bg-[#F0F1F3]">
                <img
                  src="/image.jpg"
                  alt="A facial capture used to compare skin readings between two scans"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block aspect-square w-full object-cover object-[58%_38%]"
                />

                {/* The later scan's analysis, revealed by the handle. */}
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
                >
                  <span className="absolute inset-0 bg-[radial-gradient(60%_54%_at_52%_44%,rgb(22_184_176_/_0.16),transparent_70%)]" />
                  {[
                    { x: 38, y: 42 },
                    { x: 62, y: 42 },
                    { x: 50, y: 55 },
                    { x: 44, y: 66 },
                  ].map((p) => (
                    <span
                      key={`${p.x}-${p.y}`}
                      className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal ring-[3px] ring-[color:rgb(22_184_176_/_0.22)]"
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    />
                  ))}
                </div>

                {/* The divider. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 w-px bg-[color:rgb(255_255_255_/_0.9)]"
                  style={{ left: `${pos}%` }}
                />

                <span className="text-eyebrow absolute top-3 left-3 rounded-full bg-[color:rgb(255_255_255_/_0.85)] px-2.5 py-1.5 text-ink-soft backdrop-blur-sm">
                  Scan 01 · Jun 12
                </span>
                <span className="text-eyebrow absolute top-3 right-3 rounded-full bg-[color:rgb(255_255_255_/_0.85)] px-2.5 py-1.5 text-teal-deep backdrop-blur-sm">
                  Scan 04 · Aug 19
                </span>
              </div>

              <label className="mt-4 block">
                <span className="sr-only">Compare scan 01 with scan 04</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={pos}
                  onChange={(e) => setPos(Number(e.target.value))}
                  className="h-1 w-full cursor-ew-resize appearance-none rounded-full bg-ink-line accent-[color:var(--color-primary)]"
                />
              </label>
            </div>

            {/* The readings, moving with the handle. */}
            <ul className="space-y-5">
              {READINGS.map((r) => {
                const v = Math.round(r.from + (r.to - r.from) * t)
                return (
                  <li key={r.label} className="border-t border-ink-line pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[1rem] font-medium tracking-[-0.02em]">{r.label}</span>
                      <span className="text-eyebrow text-teal-deep">{v}</span>
                    </div>
                    <div aria-hidden className="mt-3 h-1 w-full overflow-clip rounded-full bg-ink-line">
                      <m.span
                        className="block h-full rounded-full bg-teal"
                        animate={{ width: `${v}%` }}
                        transition={reduced ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
