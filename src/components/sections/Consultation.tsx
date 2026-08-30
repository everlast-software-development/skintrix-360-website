import { useEffect, useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { DETAIL_FILM } from '@/lib/media'
import { EASE } from '@/lib/motion'

/**
 * Consultation — the differentiation banner.
 *
 * Structure is unchanged from the approved version: a wide rounded banner,
 * the message held left, the visual bled in from the right behind it. Two
 * things differ — the still is now the film, and the navy ground is gone.
 *
 * The ground is white and the only colour is the logo icon's own gradient,
 * used as light and as a one-pixel edge. Nothing is laid over the face.
 *
 * The website is not where a consultation happens, so nothing here schedules
 * anything; the single action points at the app.
 */

/** Fades the film into the banner from its left edge — same mask the still used. */
const FILM_MASK = 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, #000 62%)'

export function Consultation() {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion() ?? false
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const show = reduced || inView

  // Autoplay gets refused often enough to be worth retrying on `canplay`, and
  // `muted` has to be set as a property rather than only as an attribute.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (reduced) { el.pause(); return }
    const start = () => { el.muted = true; void el.play().catch(() => {}) }
    start()
    el.addEventListener('canplay', start)
    return () => el.removeEventListener('canplay', start)
  }, [reduced])

  const rise = (delay: number, y = 16) => ({
    initial: reduced ? false : { opacity: 0, y },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.75, delay: reduced ? 0 : delay, ease: EASE },
  })

  return (
    <section
      id="consultation"
      aria-labelledby="consultation-heading"
      className="relative w-full py-[clamp(3rem,5vw,5rem)]"
      style={{ background: 'var(--bg)' }}
    >
      <div ref={ref} className="shell">
        <m.div
          className="relative isolate overflow-hidden rounded-[1.75rem] p-px"
          // A single pixel of the icon gradient as the banner's edge.
          style={{ backgroundImage: 'var(--icon-gradient)' }}
          initial={reduced ? false : { opacity: 0, y: 22 }}
          animate={show ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <div
            className="relative isolate overflow-hidden rounded-[1.7rem]"
            style={{ background: 'var(--bg-cool)' }}
          >
            {/* The film, bled in from the right — same position and mask the
                still occupied. */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[62%] lg:w-[52%]">
              <video
                ref={videoRef}
                src={DETAIL_FILM}
                poster="/image.jpg"
                autoPlay={!reduced}
                loop
                muted
                playsInline
                preload="metadata"
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
                tabIndex={-1}
                className="h-full w-full object-cover object-[58%_30%] opacity-90"
                style={{ maskImage: FILM_MASK, WebkitMaskImage: FILM_MASK }}
              />
              {/* Resolves the film into the light ground rather than leaving
                  it as a panel with an edge. */}
              <span
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, var(--bg-cool) 6%, rgb(250 254 254 / 0.62) 44%, rgb(250 254 254 / 0.08) 100%)',
                }}
              />
              <span
                className="absolute inset-0"
                style={{ background: 'radial-gradient(72% 90% at 76% 42%, rgb(30 185 183 / 0.16), transparent 72%)' }}
              />
            </div>

            {/* The same hairline the approved banner carried, now the icon
                gradient instead of a single teal. */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px opacity-70"
              style={{ backgroundImage: 'var(--icon-gradient)' }}
            />

            {/* ── The message. Unchanged. */}
            <div className="relative max-w-[38rem] px-7 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
              <m.p
                className="text-[0.6875rem] leading-none font-semibold tracking-[0.18em] uppercase"
                style={{
                  backgroundImage: 'var(--icon-gradient)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
                {...rise(0.08)}
              >
                Professional consultation
              </m.p>

              <m.h2
                id="consultation-heading"
                className="mt-5 text-[clamp(1.75rem,2.9vw,2.5rem)] leading-[1.16] font-bold tracking-[-0.03em] text-balance"
                style={{ color: 'var(--ink)' }}
                {...rise(0.16)}
              >
                More than AI.
                <br />
                Professional care when you need it.
              </m.h2>

              <m.p
                className="mt-5 max-w-[30rem] text-[0.9375rem] leading-[1.7]"
                style={{ color: 'var(--body)' }}
                {...rise(0.24)}
              >
                Understand your skin with AI, and access professional consultation when you need
                another perspective.
              </m.p>

              {/* The differentiation, said once, in type. */}
              <m.p className="mt-7 flex flex-wrap items-center gap-x-2.5 gap-y-1" {...rise(0.32)}>
                <span
                  className="text-[0.8125rem] leading-none font-semibold"
                  style={{ color: 'var(--ink)' }}
                >
                  AI-powered skin intelligence
                </span>
                <span aria-hidden className="text-[0.8125rem] leading-none text-[color:var(--teal)]">
                  +
                </span>
                <span
                  className="text-[0.8125rem] leading-none font-semibold"
                  style={{ color: 'var(--ink)' }}
                >
                  professional consultation
                </span>
              </m.p>

              <m.div className="mt-9" {...rise(0.4)}>
                <Button href="#download" variant="secondary" className="explore-wipe">
                  Explore SkinTrix360
                </Button>
              </m.div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  )
}
