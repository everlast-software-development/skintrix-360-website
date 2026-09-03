import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/**
 * A hairline of the icon gradient across the top of the viewport, tracking
 * how far down the page you are.
 *
 * This used to also render a column of section numerals ("01".."08") pinned
 * to the right edge on desktop. That has been removed, and with it the
 * IntersectionObserver, the section-id discovery and the active/visible state
 * that existed only to drive it — the bar reads straight off scroll position
 * and needs none of it.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.3 })

  return (
    <m.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-40 h-[2px] origin-left"
      style={{ scaleX: reduced ? 1 : bar, backgroundImage: 'var(--icon-gradient)' }}
    />
  )
}
