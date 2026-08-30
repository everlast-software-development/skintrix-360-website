import { useRef } from 'react'
import type { MotionValue } from 'framer-motion'
import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { LuDroplet, LuPalette, LuScanFace, LuWaves } from 'react-icons/lu'

import { cn } from '@/lib/cn'
import { DETAIL_FILM } from '@/lib/media'
import { EASE } from '@/lib/motion'
import { PRODUCT } from '@/lib/site'

/**
 * "Built into every scan" — the product showcase.
 *
 * An editorial split: the copy and the download hierarchy hold the left, and
 * the right is the app's own analysis surface with the film inside it — a
 * glass panel with chrome, a detection frame over the subject, and four
 * readouts placed around its edges. The face is never written over and the
 * badges never sit on the visual; they belong to the text column.
 *
 * Content is `PRODUCT` from `site.ts`, unchanged.
 *
 * The readouts show a parameter and a level, never a number. SkinTrix does
 * produce scores, but inventing specific ones for a marketing page would put
 * figures on screen that no scan produced.
 */

const READOUTS = [
  {
    id: 'hydration',
    label: 'Skin Hydration',
    level: 'Balanced',
    fill: '72%',
    Icon: LuDroplet,
    tone: 'text-[#118483] bg-[#DEF5F4]',
    // Placed around the panel from `lg` up; a 2×2 grid beneath it below that.
    place: 'lg:absolute lg:-left-12 lg:top-[7%]',
  },
  {
    id: 'texture',
    label: 'Skin Texture',
    level: 'Improving',
    fill: '64%',
    Icon: LuWaves,
    tone: 'text-[#5A62D6] bg-[#E8E9F9]',
    place: 'lg:absolute lg:-right-12 lg:top-[21%]',
  },
  {
    id: 'lines',
    label: 'Fine Lines',
    level: 'Low',
    fill: '38%',
    Icon: LuScanFace,
    tone: 'text-[#D98A1F] bg-[#FEF4E4]',
    place: 'lg:absolute lg:-left-12 lg:bottom-[24%]',
  },
  {
    id: 'tone',
    label: 'Skin Tone',
    level: 'Even',
    fill: '81%',
    Icon: LuPalette,
    tone: 'text-[#1FA45C] bg-[#E8F7ED]',
    place: 'lg:absolute lg:-right-12 lg:bottom-[7%]',
  },
] as const

/**
 * One readout. Its window is a 0.12-wide slice of the pin's progress, offset
 * per index, so the four appear in sequence as the scene is scrubbed and hold
 * once they are all present. The inward slide direction follows the side the
 * chip is placed on, so each one moves toward the face rather than all four
 * drifting the same way.
 */
function Readout({
  item,
  progress,
  index,
  reduced,
}: {
  item: (typeof READOUTS)[number]
  progress: MotionValue<number>
  index: number
  reduced: boolean
}) {
  const start = 0.12 + index * 0.12
  const end = start + 0.12
  const fromRight = item.place.includes('right')

  const opacity = useTransform(progress, [start, end], [0, 1])
  const x = useTransform(progress, [start, end], [fromRight ? 16 : -16, 0])
  const width = useTransform(progress, [start, end + 0.08], ['0%', item.fill])

  return (
    <m.div
      className={cn(
        'rounded-2xl bg-white/78 p-3.5 ring-1 ring-white/80 backdrop-blur-xl lg:w-[12.5rem] lg:p-4',
        item.place,
      )}
      style={reduced ? undefined : { opacity, x }}
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-xl', item.tone)}>
          <item.Icon className="h-4 w-4" />
        </span>
        <p className="min-w-0 text-[0.8125rem] leading-tight font-semibold tracking-[-0.01em]">
          {item.label}
        </p>
      </div>
      <p className="mt-3 text-[0.75rem] leading-none font-medium text-ink-muted">{item.level}</p>
      {/* A level, not a figure — see the note at the top of the file. */}
      <div aria-hidden className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E3E9EC]">
        <m.span
          className="block h-full rounded-full bg-[linear-gradient(90deg,#16B8B0,#1AA0D2)]"
          style={reduced ? { width: item.fill } : { width }}
        />
      </div>
    </m.div>
  )
}

function AnalysisPanel({
  progress,
  reduced,
}: {
  progress: MotionValue<number>
  reduced: boolean
}) {
  return (
    <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-[38rem]">
      {/* Ambient light behind the panel — the only glow in the section. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[50%] bg-[radial-gradient(ellipse,rgb(22_184_176_/_0.20),transparent_68%)] blur-3xl"
      />

      <m.div
        className="relative overflow-hidden rounded-[2rem] bg-white/60 p-3 ring-1 ring-white/80 backdrop-blur-xl sm:p-4"
        initial={reduced ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {/* Panel chrome. */}
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <p className="flex items-center gap-2 text-[0.75rem] leading-none font-semibold tracking-[0.06em] text-ink-soft uppercase">
            <LuScanFace aria-hidden className="h-3.5 w-3.5 text-teal-deep" />
            Skin analysis
          </p>
          <span className="flex items-center gap-1.5 rounded-full bg-[#DEF5F4] px-2.5 py-1.5 text-[0.6875rem] leading-none font-semibold text-[#118483]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#118483]" />
            Analyzing
          </span>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#F1FBFA]">
          <video
            src={DETAIL_FILM}
            poster="/image.jpg"
            preload="metadata"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
            className="h-full w-full object-cover object-[50%_26%]"
          />

          {/* The read: a detection frame and a sweep. Nothing is drawn on the
              face itself — these sit clear of it. */}
          <span aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute inset-[8%] rounded-[999px_999px_46%_46%/60%_60%_40%_40%] border border-[color:rgb(22_184_176_/_0.45)]" />
            {(
              [
                'left-4 top-4 border-t-2 border-l-2 rounded-tl-lg',
                'right-4 top-4 border-t-2 border-r-2 rounded-tr-lg',
                'left-4 bottom-4 border-b-2 border-l-2 rounded-bl-lg',
                'right-4 bottom-4 border-b-2 border-r-2 rounded-br-lg',
              ] as const
            ).map((corner) => (
              <span
                key={corner}
                className={cn('absolute h-7 w-7 border-[color:rgb(22_184_176_/_0.8)]', corner)}
              />
            ))}
            {!reduced && (
              <m.span
                className="absolute inset-x-0 h-px bg-[linear-gradient(90deg,transparent,rgb(22_184_176_/_0.9),transparent)]"
                initial={{ top: '10%' }}
                animate={{ top: ['10%', '88%', '10%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </span>
        </div>
      </m.div>

      {/* Below `lg` the readouts sit under the panel as a pair of columns;
          from `lg` each takes its own place around it. */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:block lg:gap-0">
        {READOUTS.map((item, i) => (
          <Readout key={item.id} item={item} index={i} progress={progress} reduced={reduced} />
        ))}
      </div>
    </div>
  )
}

/**
 * "The details that make it yours." — a pinned scene.
 *
 * The panel sticks centred for the length of a 180vh runway while the four
 * readouts arrive one at a time against scroll progress, then hold. Scrubbed,
 * so scrolling back up removes them in reverse rather than replaying.
 *
 * The App Store / Google Play badges used to live here; they now sit in the
 * footer, which is where a download prompt belongs on this page.
 *
 * Reduced motion drops the pin entirely and renders the composed end state as
 * an ordinary section.
 */
export function DetailsVideo() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion() ?? false

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.001 })

  // Highlight the closing word, derived from the copy rather than restated.
  const words = PRODUCT.headline.split(' ')
  const lastWord = words.pop()
  const leadWords = words.join(' ')

  const Copy = (
    <div className="max-w-[34rem]">
      <p className="text-eyebrow" style={{ color: 'var(--muted)' }}>
        {PRODUCT.eyebrow}
      </p>
      <h2 id="details-heading" className="text-section stack-h2" style={{ color: 'var(--ink)' }}>
        {leadWords}{' '}
        <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-text-gradient)' }}>
          {lastWord}
        </span>
      </h2>
      <p className="text-body measure stack-sub" style={{ color: 'var(--body)' }}>
        {PRODUCT.lead}
      </p>
    </div>
  )

  if (reduced) {
    return (
      <section id="details" aria-labelledby="details-heading" className="section-y relative w-full overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'var(--brand-orbs-flipped), var(--color-canvas)' }} />
        </div>
        <div className="container relative">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-20">
            {Copy}
            <AnalysisPanel progress={progress} reduced />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="details"
      ref={ref}
      aria-labelledby="details-heading"
      className="relative w-full overflow-x-clip"
      style={{ height: '180vh' }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ background: 'var(--brand-orbs-flipped), var(--color-canvas)' }} />
      </div>

      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="container relative w-full">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-20">
            {Copy}
            <AnalysisPanel progress={progress} reduced={reduced} />
          </div>
        </div>
      </div>
    </section>
  )
}
