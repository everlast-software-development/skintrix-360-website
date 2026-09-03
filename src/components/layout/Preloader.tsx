import { useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/ui/Logo'

/**
 * The opening curtain — held until the hero image is actually on screen.
 *
 * WHAT IT WAITS FOR
 * Three things, whichever finishes LAST:
 *
 *   1. `/mockup.png` — the phone frame in the hero. It is decoded here, off
 *      screen, so the hero never paints a half-drawn device.
 *   2. `document.fonts.ready` — Nunito is a variable webfont that lands after
 *      first paint and reflows every heading with it. Lifting the curtain
 *      before the swap means the visitor watches the type jump.
 *   3. A 500ms floor, so a warm cache does not produce a single frame of
 *      flash that reads as a glitch rather than a load.
 *
 * And a 5s CEILING that overrides all of it. A curtain that waits on a
 * network is a curtain that can trap someone behind a dead connection — this
 * one always lifts.
 *
 * WHY IT DOES NOT WRAP THE PAGE
 * It is a `position: fixed` sibling of the app shell, never a parent. Wrapping
 * `main` and `footer` in an animated element would make that element the
 * containing block for the footer's `position: fixed` reveal child and kill
 * the reveal — the constraint documented at length in `App.tsx` and
 * `Footer.tsx`. Fixed positioning on the overlay ITSELF is fine; it is a leaf.
 *
 * SCROLL LOCK
 * `overflow: hidden` on `<html>` while it is up, so a stray wheel event does
 * not leave the page halfway down when the curtain lifts. Neither `overflow`
 * nor the class creates a containing block, so the footer reveal is untouched.
 *
 * REDUCED MOTION
 * The curtain still appears — it is a loading state, not decoration — but it
 * neither pulses nor fades. It is shown, then it is gone.
 */

/** The hero's own image. Kept in sync with `SimpleHero`'s `<img>`. */
const HERO_IMAGE = '/mockup.png'

const MIN_MS = 500
const MAX_MS = 5000

/** Resolves when the image is decoded, or immediately if it cannot be. */
function loadHeroImage(): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    /* `decode()` resolves after the bitmap is ready to paint, where `onload`
       only means the bytes arrived — the difference is one janky first frame
       on a large PNG. Not universally supported, hence the fallback. */
    img.src = HERO_IMAGE
    if (typeof img.decode === 'function') {
      img.decode().then(
        () => resolve(),
        () => resolve(),
      )
      return
    }
    img.onload = () => resolve()
    img.onerror = () => resolve()
  })
}

export function Preloader() {
  const [done, setDone] = useState(false)
  const root = useRef<HTMLDivElement | null>(null)
  const markRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  /* Everything the curtain does, in one effect: lock, animate, wait, lift. */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'

    let disposed = false
    let idleTween: { kill: () => void } | undefined
    let timeout: number | undefined

    const unlock = () => {
      html.style.overflow = previousOverflow
    }

    /* The waiting half — plain promises, no GSAP needed. */
    const ready = Promise.all([
      loadHeroImage(),
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => window.setTimeout(r, MIN_MS)),
    ])

    void (async () => {
      const { gsap } = reduced ? { gsap: null } : await import('@/lib/gsap')
      if (disposed) return

      if (gsap && markRef.current && barRef.current) {
        /* The mark breathes while we wait, and the bar sweeps. Neither is a
           real progress figure — there is nothing honest to measure here, so
           it does not pretend to be a percentage. */
        idleTween = gsap.to(markRef.current, {
          scale: 1.04,
          opacity: 0.75,
          duration: 1.1,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
        gsap.fromTo(
          barRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 2.4, ease: 'power2.out', transformOrigin: 'left center' },
        )
      }

      const lift = () => {
        if (disposed) return
        idleTween?.kill()

        if (!gsap || !root.current) {
          unlock()
          setDone(true)
          return
        }

        gsap.to(root.current, {
          opacity: 0,
          duration: 0.55,
          ease: 'power2.inOut',
          onComplete: () => {
            unlock()
            setDone(true)
          },
        })
        /* The bar completes rather than being cut off mid-sweep. */
        if (barRef.current) gsap.to(barRef.current, { scaleX: 1, duration: 0.3, ease: 'power2.out' })
      }

      timeout = window.setTimeout(lift, MAX_MS)
      void ready.then(() => {
        window.clearTimeout(timeout)
        lift()
      })
    })()

    return () => {
      disposed = true
      idleTween?.kill()
      if (timeout) window.clearTimeout(timeout)
      unlock()
    }
  }, [])

  if (done) return null

  return (
    <div
      ref={root}
      /* Not `aria-hidden`: a screen reader should be told the page is
         loading rather than find an empty document. `role="status"` with
         `aria-live="polite"` announces it once without stealing focus. */
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8"
      style={{ background: '#F5F6FD' }}
    >
      <div ref={markRef} className="flex flex-col items-center gap-5">
        <Logo />
        <span className="sr-only">Loading SkinTrix360</span>
      </div>

      {/* A 2px rule, the same hairline the rest of the site uses, with a teal
          sweep across it. No spinner: the site has no other spinner, and one
          here would be the only piece of UI in its own style. */}
      <div
        className="h-[2px] w-[min(11rem,40vw)] overflow-hidden rounded-full"
        style={{ background: '#E2E5F2' }}
      >
        <div
          ref={barRef}
          className="h-full w-full origin-left rounded-full"
          style={{ background: 'var(--text-accent)', transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
