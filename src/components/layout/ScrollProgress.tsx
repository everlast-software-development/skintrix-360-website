import { useEffect, useState } from 'react'
import { m, useReducedMotion, useScroll, useSpring } from 'framer-motion'

/**
 * A quiet sense of place in the scroll.
 *
 * Desktop gets a short column of numerals on the right; the active one is the
 * only thing with weight, so the rest reads as texture. Mobile gets a hairline
 * at the top of the viewport instead — a vertical rail on a phone is exactly
 * the bulky navigation this is meant not to be.
 *
 * Sections are discovered from the DOM rather than hard-coded, so this stays
 * correct as sections are added or reordered.
 */

const HIDE_BEFORE = 0.06 // stay out of the way while the hero is on screen

export function ScrollProgress() {
  const reduced = useReducedMotion() ?? false
  const [ids, setIds] = useState<string[]>([])
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(false)

  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.3 })

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('main > section[id]')]
      .filter((s) => s.id !== 'top')
    setIds(sections.map((s) => s.id))

    const io = new IntersectionObserver(
      (entries) => {
        // The section occupying the most of the viewport wins, so the marker
        // does not flicker between two partly-visible neighbours.
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!best) return
        const i = sections.indexOf(best.target as HTMLElement)
        if (i >= 0) setActive(i)
      },
      { threshold: [0.15, 0.35, 0.6], rootMargin: '-20% 0px -20% 0px' },
    )
    sections.forEach((s) => io.observe(s))

    const onScroll = () => {
      const d = document.documentElement
      setVisible(d.scrollTop / (d.scrollHeight - d.clientHeight || 1) > HIDE_BEFORE)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      {/* Mobile: a hairline of the icon gradient across the top. */}
      <m.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-40 h-[2px] origin-left lg:hidden"
        style={{ scaleX: reduced ? 1 : bar, backgroundImage: 'var(--icon-gradient)' }}
      />

      {/* Desktop: numerals, right edge, almost invisible until needed. */}
      <nav
        aria-label="Section progress"
        className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 lg:block"
      >
        <ul className="flex flex-col items-end gap-3">
          {ids.map((id, i) => {
            const on = i === active
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="pointer-events-auto flex items-center gap-2 text-[0.625rem] leading-none font-semibold tracking-[0.14em] tabular-nums transition-all duration-500"
                  // A solid accent, not gradient-clipped text: the anchor is a
                  // flex row with a child span, and  on a
                  // flex container paints nothing — the active numeral vanished.
                  style={{
                    opacity: visible ? (on ? 1 : 0.3) : 0,
                    color: on ? 'var(--teal)' : 'var(--muted)',
                  }}
                >
                  <span
                    aria-hidden
                    className="block h-px transition-all duration-500"
                    style={{
                      width: on ? 18 : 8,
                      backgroundImage: on ? 'var(--icon-gradient)' : undefined,
                      background: on ? undefined : 'var(--muted)',
                      opacity: on ? 1 : 0.5,
                    }}
                  />
                  {String(i + 1).padStart(2, '0')}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
