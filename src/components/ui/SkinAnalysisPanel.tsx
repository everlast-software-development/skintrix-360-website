import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { EASE } from '@/lib/motion'

/**
 * The analysis viewport and its readouts — the section's whole composition.
 *
 * Deliberately not a second hero. The hero uses the model full-bleed as a
 * backdrop; here the same footage is contained inside a viewport that is one
 * element of an interface, with the reading of the face happening around it.
 * Capture is the viewport, analysis is the markers, understanding is the
 * readouts — expressed as one continuous composition rather than three cards.
 *
 * Geometry comes from the footage. Model_03 is a locked-off 16:9 studio
 * portrait: the camera never moves, so landmark positions hold for the entire
 * clip and can be pinned. Cropped to this 4:5 viewport, `object-cover` scales
 * by height, so vertical positions map 1:1 from the source and only the
 * horizontal is cropped — the visible band is the middle 45% of the frame.
 * MARKERS are the source landmarks pushed through exactly that mapping:
 *   viewportX% = (sourceX% * 8.89 - 244.5) / 4
 */

const VIDEO_SRC = 'https://pub-fb006e1ee68f45ffbddf182152c46122.r2.dev/Model_03.mp4'

type Marker = { id: string; x: number; y: number }

/** Percentages of the viewport, derived from the source landmarks. */
const MARKERS: Marker[] = [
  { id: 'forehead', x: 50, y: 24.2 },
  { id: 'eyeL', x: 40.2, y: 37.3 },
  { id: 'eyeR', x: 60.2, y: 37.3 },
  { id: 'cheekL', x: 35.8, y: 47.6 },
  { id: 'cheekR', x: 64.7, y: 47.6 },
  { id: 'chin', x: 50, y: 62.5 },
]

/**
 * Only the readouts that make the composition work. Six labels around one face
 * would crowd it; three, staggered, keep the eye moving through the panel.
 */
const INSIGHTS = [
  { label: 'Skin texture', value: 'Even', indent: 'lg:ml-0' },
  { label: 'Pigmentation', value: 'Uniform', indent: 'lg:ml-10' },
  { label: 'Pores', value: 'Refined', indent: 'lg:ml-4' },
]

const CORNERS = [
  'top-0 left-0 border-t border-l rounded-tl-lg',
  'top-0 right-0 border-t border-r rounded-tr-lg',
  'bottom-0 left-0 border-b border-l rounded-bl-lg',
  'bottom-0 right-0 border-b border-r rounded-br-lg',
]

export function SkinAnalysisPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const on = reduced || inView

  const step = (delay: number) => ({
    initial: reduced ? false : { opacity: 0 },
    animate: on ? { opacity: 1 } : undefined,
    transition: { duration: 0.6, delay: reduced ? 0 : delay, ease: EASE },
  })

  return (
    <div
      ref={ref}
      className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-8"
    >
      {/* Capture. A contained viewport, not a backdrop. */}
      <m.div
        className="relative order-1 mx-auto w-full max-w-[22rem] overflow-clip rounded-[1.75rem] bg-[#F0F1F3] lg:order-2 lg:col-span-5 lg:col-start-5 lg:mx-0 lg:max-w-none"
        initial={reduced ? false : { opacity: 0, scale: 0.98 }}
        animate={on ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          aria-hidden
          width={1920}
          height={1080}
          className="block aspect-[4/5] w-full object-cover object-center"
        />

        {/* The scanning frame. Four brackets, drawn on entry. */}
        <div aria-hidden className="pointer-events-none absolute inset-4">
          {CORNERS.map((at, i) => (
            <m.span
              key={at}
              className={'absolute h-5 w-5 border-[color:rgb(22_184_176_/_0.85)] ' + at}
              {...step(0.25 + i * 0.06)}
            />
          ))}
        </div>

        {/* Analysis. Markers land in sequence on real landmarks. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {MARKERS.map((mk, i) => (
            <m.span
              key={mk.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: mk.x + '%', top: mk.y + '%' }}
              {...step(0.5 + i * 0.09)}
            >
              <span className="block h-1.5 w-1.5 rounded-full bg-teal ring-[3px] ring-[color:rgb(22_184_176_/_0.2)]" />
            </m.span>
          ))}
        </div>

        {!reduced && (
          <span
            aria-hidden
            // Feathered at the sides. Clipped to a hard-edged box, the band
            // lightened her dark hair and read as a grey rectangle rather than
            // as light crossing the face.
            className="pointer-events-none absolute inset-x-[10%] top-[12%] bottom-[26%] overflow-clip [mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)]"
          >
            <span className="animate-scan-sweep absolute inset-x-0 top-1/2 h-[24%] -translate-y-1/2">
              <span className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgb(255_255_255_/_0.2),transparent)]" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-[color:rgb(22_184_176_/_0.6)]" />
            </span>
          </span>
        )}

        <m.span
          aria-hidden
          className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-[color:rgb(255_255_255_/_0.82)] px-3 py-1.5 backdrop-blur-sm"
          {...step(0.15)}
        >
          <span className="relative flex h-1.5 w-1.5">
            {!reduced && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-70" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
          </span>
          <span className="text-eyebrow text-teal-deep">AI vision</span>
        </m.span>
      </m.div>

      {/* The text sits left of the viewport and stays deliberately quiet — it
          supports the composition rather than heading it. */}
      <div className="order-2 lg:order-1 lg:col-span-4 lg:col-start-1">
        <m.p className="text-eyebrow text-teal-deep" {...step(0.05)}>
          Skin intelligence
        </m.p>
        <m.h2 id="features-heading" className="text-statement mt-4" {...step(0.12)}>
          One capture.
          <br />
          Dozens of visible signals.
        </m.h2>
        <m.p className="mt-5 max-w-[26rem] text-[0.9375rem] leading-[1.75] text-ink-soft" {...step(0.2)}>
          SkinTrix uses computer vision to identify visible skin characteristics
          and turn them into clear, actionable insights.
        </m.p>
      </div>

      {/* Understanding. Staggered indents keep the column from reading as a
          list of cards; each readout reaches back toward the face with a thin
          rule and a node, which is what ties them to the viewport. */}
      <div className="order-3 lg:col-span-3 lg:col-start-10">
        <ul className="space-y-7">
          {INSIGHTS.map((ins, i) => (
            <m.li key={ins.label} className={ins.indent} {...step(1 + i * 0.14)}>
              <span aria-hidden className="mb-2.5 flex items-center gap-2">
                <m.span
                  className="block h-px bg-[color:rgb(9_24_56_/_0.22)]"
                  initial={reduced ? false : { width: 0 }}
                  animate={on ? { width: '2.5rem' } : undefined}
                  transition={{ duration: 0.7, delay: reduced ? 0 : 0.9 + i * 0.14, ease: EASE }}
                />
                <span className="h-1 w-1 rounded-full bg-teal" />
              </span>
              <span className="text-eyebrow block text-teal-deep">{ins.label}</span>
              <span className="mt-1.5 block text-[1.0625rem] leading-none font-medium text-ink">
                {ins.value}
              </span>
            </m.li>
          ))}
        </ul>
      </div>
    </div>
  )
}
