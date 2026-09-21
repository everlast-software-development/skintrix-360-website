import { useEffect } from 'react'

import { readSvh, requestScrollRefresh } from '@/lib/scrollRefresh'

/**
 * Keeps ScrollTrigger's measurements honest. It does NOT drive the scroll.
 *
 * THE PAGE SCROLLS NATIVELY. This hook used to create a Lenis instance, hand
 * its clock to GSAP and interpolate every wheel event — that is gone, along
 * with the dependency. Nothing on this site now sits between the visitor's
 * wheel and the viewport: no rAF scroll loop, no easing, no inertia, no
 * interpolation, no `scroll-behavior: smooth`.
 *
 * What remains is the part that was never about smoothing: ScrollTrigger
 * caches the geometry of every pin and scrub at refresh time, and there are
 * two moments when that cache silently goes stale. Both are handled below.
 *
 * ScrollTrigger listens to native `scroll` on its own once nothing is
 * proxying the scroller, so the old `lenis.on('scroll', ScrollTrigger.update)`
 * bridge and the `gsap.ticker` driver are not replaced by anything — they are
 * simply unnecessary.
 *
 * In-page anchors are native too. `html { scroll-padding-top: 6rem }` in
 * index.css is what keeps the fixed navbar off a targeted section, and the
 * browser applies it to fragment navigation for free — so there is no click
 * handler here any more either.
 */
export function useScrollRefresh() {
  useEffect(() => {
    /* Reduced motion has no pins and no scrubs — the hero renders as a static
       block — so there is no cached geometry to keep honest, and importing
       GSAP for it would be the only reason those visitors download it at all.
       `useTextReveal` returns before its own import for the same reason. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let teardown: (() => void) | undefined

    void import('@/lib/gsap').then(() => {
      if (disposed) return

      /* The variable webfont lands after first paint and shifts every
         measurement with it. Through the scheduler, because on a slow
         connection it lands AFTER the visitor has started scrolling — and a
         re-measure mid-scroll is the jump this is all about. */
      void document.fonts?.ready.then(() => {
        if (!disposed) requestScrollRefresh()
      })

      /**
       * Re-measure everything after a resize — the fix for "the hero is broken
       * until I refresh".
       *
       * ScrollTrigger already auto-refreshes on `resize`, but that fires
       * SYNCHRONOUSLY on the event, and the hero's pinned height is React
       * state: a `ResizeObserver` sets `scale`, and the section's height is
       * `PIN_H * scale` applied inline. So ScrollTrigger's own refresh runs a
       * commit too early and re-measures the OLD height, leaving the pin-spacer
       * stale for the rest of the session.
       *
       * Hence the ~150ms debounce: it also gives React time to commit the new
       * scale, so every `end: () => …` function re-evaluates against the size
       * the section actually has.
       */
      let resizeTimer: number | undefined
      let lastWidth = document.documentElement.clientWidth
      let lastSvh = readSvh()

      const remeasure = () => {
        window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(requestScrollRefresh, 150)
      }

      /**
       * A COLLAPSING ADDRESS BAR IS NOT A RESIZE, and this is the gate that
       * says so.
       *
       * On a phone or tablet the bar retracts on the first scroll. That fires
       * `resize` and moves `window.innerHeight` by 60-120px, and this handler
       * used to treat it as a viewport change and re-measure every trigger
       * 150ms later — in the middle of the gesture that caused it. It is the
       * single most reliable way to make the first scroll of a session snap,
       * and it happens on every touch device, every time.
       *
       * Nothing the hero measures actually changed. Its pin budget is a
       * function of `100svh`, and the small viewport is DEFINED as the one
       * with the bar shown, so it reads the same before and after. Width is
       * unchanged too. So the test is width-or-svh, not `resize` — a rotation
       * moves both and still refreshes, a desktop window dragged shorter moves
       * svh and still refreshes, and the bar moves neither.
       */
      const onResize = () => {
        const width = document.documentElement.clientWidth
        const svh = readSvh()
        if (width === lastWidth && svh === lastSvh) return
        lastWidth = width
        lastSvh = svh
        remeasure()
      }
      window.addEventListener('resize', onResize)

      /**
       * The case `resize` does NOT cover: a scrollbar appearing or vanishing
       * changes `clientWidth` by its own width and fires no event at all.
       *
       * That is the whole "the hero is laid out wider than the viewport on a
       * fresh load" bug. The preloader holds `html { overflow: hidden }` while
       * the curtain is up, so the first pin refresh measures a viewport with
       * NO scrollbar, and GSAP writes that width onto `.pin-spacer` and the
       * pinned section as an inline pixel value. The curtain lifts, the
       * scrollbar takes its 15px off `clientWidth`, and nothing re-measures —
       * so the hero stays laid out for a viewport 15px wider than the one it
       * is in, clipped on the right. At 1440 that is 1% and easy to miss; at
       * 465 it is 3% and the headline and CTA visibly hang off the edge.
       * `body { overflow-x: clip }` is why it never showed up as a scrollbar.
       *
       * Resizing the window was masking it: any resize ran the handler above
       * and re-measured correctly, which is why the bug only ever appeared on
       * a first load and "fixed itself" the moment the window was touched.
       *
       * WIDTH ONLY. The document height churns constantly while pins are
       * built and while `svh` settles, and refreshing on that would loop.
       */
      const observer = new ResizeObserver(() => {
        const width = document.documentElement.clientWidth
        if (width === lastWidth) return
        lastWidth = width
        remeasure()
      })
      observer.observe(document.documentElement)

      teardown = () => {
        window.clearTimeout(resizeTimer)
        observer.disconnect()
        window.removeEventListener('resize', onResize)
      }
    })

    return () => {
      disposed = true
      teardown?.()
    }
  }, [])
}
