import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { EASE } from '@/lib/motion'

/**
 * ImageToData — "Turn a photo into meaningful data."
 *
 * Reads left to right: the capture, a thin processing spine, then the insights.
 * The insight rows are not laid out as cards — they arrive one after another,
 * each preceded by a rule that draws out of the spine, so the information
 * appears to be produced by the image rather than placed beside it.
 */

const INSIGHTS = [
  { label: 'Skin type', body: 'Understand your skin profile.' },
  { label: 'Pigmentation', body: 'Map visible pigmentation and uneven tone.' },
  { label: 'Acne', body: 'Identify acne patterns and severity.' },
  { label: 'Wrinkles & aging', body: 'Track visible signs of skin aging.' },
  { label: 'Redness', body: 'Visualize areas of redness and vascular changes.' },
  { label: 'Pores & texture', body: 'Measure visible pores and skin texture.' },
]

export function ImageToData() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.25 })
  const on = reduced || inView

  return (
    <section id="data" aria-labelledby="data-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <div className="max-w-[36rem]">
          <p className="text-eyebrow text-teal-deep">Image to data</p>
          <h2 id="data-heading" className="text-statement mt-4">
            Turn a photo into meaningful data.
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-soft">
            Instead of relying only on visual assessment, SkinTrix transforms facial images into
            measurable skin insights.
          </p>
        </div>

        <div ref={ref} className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,17rem)_auto_1fr] lg:gap-0">
          {/* The capture. */}
          <m.div
            className="relative mx-auto w-full max-w-[17rem] overflow-clip rounded-[1.25rem] bg-[#F0F1F3] lg:mx-0"
            initial={reduced ? false : { opacity: 0 }}
            animate={on ? { opacity: 1 } : undefined}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <img
              src="/image.jpg"
              alt="A facial capture being processed into skin insights"
              width={1024}
              height={1024}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block aspect-square w-full object-cover object-[58%_38%]"
            />
            <span className="text-eyebrow absolute bottom-3 left-3 rounded-full bg-[color:rgb(255_255_255_/_0.85)] px-2.5 py-1.5 text-teal-deep backdrop-blur-sm">
              Capture
            </span>
          </m.div>

          {/* The processing spine — one vertical rule the rows grow out of. */}
          <div aria-hidden className="relative hidden w-16 lg:block">
            <m.span
              className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-[color:rgb(9_24_56_/_0.16)]"
              initial={reduced ? false : { height: 0 }}
              animate={on ? { height: '100%' } : undefined}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            />
          </div>

          {/* The insights, generated in sequence. */}
          <ul className="lg:pl-2">
            {INSIGHTS.map((ins, i) => (
              <m.li
                key={ins.label}
                className="flex items-baseline gap-4 border-t border-ink-line py-4 first:border-t-0 first:pt-0 lg:gap-6"
                initial={reduced ? false : { opacity: 0, x: -10 }}
                animate={on ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.35 + i * 0.11, ease: EASE }}
              >
                <span className="text-eyebrow w-6 shrink-0 text-teal-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.0625rem] font-medium tracking-[-0.02em]">
                    {ins.label}
                  </span>
                  <span className="mt-1 block text-[0.875rem] leading-[1.7] text-ink-soft">
                    {ins.body}
                  </span>
                </span>
              </m.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
