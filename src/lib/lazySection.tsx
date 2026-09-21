import { Suspense, lazy, useEffect } from 'react'
import type { ComponentType, ReactNode } from 'react'

import { requestScrollRefresh } from '@/lib/scrollRefresh'

/**
 * Code-splitting for the landing page's lower half.
 *
 * WHAT THIS IS AND IS NOT
 * It is a *bundle* split, not a defer-until-scrolled. Each section below the
 * fold becomes its own chunk that the browser fetches in parallel with the
 * first paint instead of blocking it. It deliberately does NOT wait for the
 * section to be scrolled into view, because two things on this page measure
 * the document height — GSAP's ScrollTrigger and the footer's reveal reserve
 * — and a section that materialises under the visitor mid-scroll moves
 * everything below it.
 *
 * Chunks are requested as soon as the app renders, so in practice they land
 * while the preloader is still up and the page assembles behind the curtain.
 *
 * WHY THE FALLBACK IS `null`
 * A skeleton would be a second visual language for content that is off screen
 * and typically resolves within a frame or two of the first paint. What
 * matters is not the gap, it is the RE-MEASURE afterwards: every lazy section
 * calls `ScrollTrigger.refresh()` once it mounts, or the triggers registered
 * before it existed keep their stale start/end offsets and every scrubbed
 * animation below fires at the wrong scroll position.
 */

/**
 * Refresh once per mount, on the frame after layout.
 *
 * Through `requestScrollRefresh`, never `ScrollTrigger.refresh()` directly.
 * Seven sections mount here and each one asks; they collapse into a single
 * re-measure, and — the part that matters — it is held back if the visitor has
 * already started scrolling, because a refresh rebuilds the hero's pin-spacer
 * and changes the page's height while it does. See `scrollRefresh.ts`.
 */
function useScrollTriggerRefresh() {
  useEffect(() => {
    let cancelled = false
    const frame = requestAnimationFrame(() => {
      if (!cancelled) requestScrollRefresh()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [])
}

function Measured({ children }: { children: ReactNode }) {
  useScrollTriggerRefresh()
  return <>{children}</>
}

/**
 * Wraps a dynamic import into a section component.
 *
 * `pick` exists because every section in this codebase is a NAMED export and
 * `React.lazy` requires a module whose `default` is the component.
 */
export function lazySection<P extends object>(
  load: () => Promise<Record<string, unknown>>,
  name: string,
): ComponentType<P> {
  const Loaded = lazy(async () => {
    const mod = await load()
    return { default: mod[name] as ComponentType<P> }
  })

  return function LazySection(props: P) {
    return (
      <Suspense fallback={null}>
        <Measured>
          <Loaded {...props} />
        </Measured>
      </Suspense>
    )
  }
}
