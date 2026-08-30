import { useEffect, useRef } from 'react'

import { Footer } from '@/components/layout/Footer'

/**
 * FixedFooter — the footer, parked at the bottom of the viewport and left
 * there.
 *
 * It never scrolls and never animates. It sits at `z-0` behind the page, which
 * is opaque and stacked above it, so it is simply not visible until the page's
 * last content scrolls off it. That is the whole reveal: the banner moves, the
 * footer does not.
 *
 * Because a fixed element is out of flow, the page owes it that much height at
 * the end or it can never be reached. The measured height is published as
 * `--footer-h` for the spacer that closes the document. Measured rather than
 * hard-coded — the footer's links wrap at narrow widths and it grows.
 */
export function FixedFooter() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const sync = () =>
      document.documentElement.style.setProperty('--footer-h', `${el.offsetHeight}px`)

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      // `z-0`, never negative: a negative index would drop it behind the root
      // stacking context and its links would stop responding once revealed.
      data-footer-layer
      className="fixed inset-x-0 bottom-0 z-0" style={{ background: 'var(--bg)' }}
    >
      <Footer />
    </div>
  )
}

/**
 * Closes the document so the fixed footer has somewhere to be revealed.

 */
export function FooterSpacer() {
  return <div aria-hidden style={{ height: 'var(--footer-h, 0px)' }} />
}
