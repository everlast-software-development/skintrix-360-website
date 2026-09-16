import { useEffect, useState } from 'react'
import { m } from 'framer-motion'

import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Logo on one side, the single CTA on the other. Nothing else.
 *
 * Transparent while it sits over the top of the hero, then a glass panel once
 * the page moves under it — blurred and desaturated canvas, and nothing more.
 * No rule, no shadow, no border: the separation comes from the blur itself, so
 * the bar never draws a hard line across the composition.
 */
export function Navbar() {
  const [condensed, setCondensed] = useState(false)

  /* Both links in this bar are fragments of the LANDING page. On a standalone
     page (/delete-account) there is no #top and no #download to scroll to, so
     they have to become document navigations back to '/'. On '/' itself they
     stay bare fragments: the browser resolves a fragment in place, where a
     '/#download' href is a document navigation and reloads the page. */
  const path = window.location.pathname
  const home = path === '/' || path === '/index.html' ? '' : '/'

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <m.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
    >
      <div
        className={cn(
          'transition-[background-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          condensed
            ? 'bg-canvas/65 backdrop-blur-2xl backdrop-saturate-150'
            : 'bg-transparent backdrop-blur-none',
        )}
      >
        <div className="shell flex h-18 items-center justify-between">
          {/* `#`, not `#top`. The hero carries `id="top"` and is PINNED: once
              scrolled past, it sits at the end of its pin spacer, so `#top`
              landed ~2400px down the page. An empty fragment is always the top
              of the document. From a legal page it is a plain `/`. */}
          <a href={home || '#'} aria-label="SkinTrix360 home">
            <Logo />
          </a>

          <Button href={home + '#download'} className="h-11 text-sm">
            Get Started
          </Button>
        </div>
      </div>
    </m.header>
  )
}
