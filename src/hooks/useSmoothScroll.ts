import { useEffect } from 'react'

/**
 * Drives the page with Lenis and hands the same clock to GSAP, so scroll-linked
 * parallax stays locked to the smoothed position instead of the native one.
 *
 * Both libraries are imported dynamically: they are an enhancement, not a
 * dependency of first paint. Visitors who ask for reduced motion never download
 * them at all — they get plain, instant native scrolling.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let teardown: (() => void) | undefined

    void (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('@/lib/gsap'),
      ])
      if (disposed) return

      const lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      })

      lenis.on('scroll', ScrollTrigger.update)

      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // In-page anchors ride the same easing rather than jumping.
      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]')
        if (!(anchor instanceof HTMLAnchorElement)) return

        const id = anchor.getAttribute('href')
        if (!id || id === '#') return

        const target = document.querySelector(id)
        if (!target) return

        event.preventDefault()
        lenis.scrollTo(target as HTMLElement, { offset: -72, duration: 1.3 })
      }

      document.addEventListener('click', onClick)

      // The variable webfont lands after first paint and shifts every measurement with it.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      teardown = () => {
        document.removeEventListener('click', onClick)
        gsap.ticker.remove(tick)
        lenis.destroy()
      }
    })()

    return () => {
      disposed = true
      teardown?.()
    }
  }, [])
}
