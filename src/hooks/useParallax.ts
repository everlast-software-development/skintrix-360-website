import { useEffect, useRef } from 'react'

type Mode = 'center' | 'leading'

/**
 * Scrubs an element against its parent's travel through the viewport.
 *
 * `center` splits the drift either side of centre — right for anything the
 * visitor scrolls *into*. `leading` starts at rest and only drifts on the way
 * out, which is what an above-the-fold element needs: no offset on first paint.
 *
 * GSAP arrives via dynamic import, in the same chunk the smooth-scroll hook
 * pulls, so nothing scroll-related blocks the initial render.
 */
export function useParallax<T extends HTMLElement>(distance = 64, mode: Mode = 'center') {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let disposed = false
    let teardown: (() => void) | undefined

    void import('@/lib/gsap').then(({ gsap }) => {
      if (disposed) return

      const trigger = el.parentElement ?? el
      const leading = mode === 'leading'

      const tween = gsap.fromTo(
        el,
        { y: leading ? 0 : distance / 2 },
        {
          y: leading ? -distance : -distance / 2,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: leading ? 'top top' : 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      )

      teardown = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        gsap.set(el, { clearProps: 'transform' })
      }
    })

    return () => {
      disposed = true
      teardown?.()
    }
  }, [distance, mode])

  return ref
}
