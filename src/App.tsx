import { useEffect } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'

import { Navbar } from '@/components/layout/Navbar'
import { Preloader } from '@/components/layout/Preloader'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
// Existing sections — unchanged, in their original order.
import { Hero } from '@/components/sections/Hero'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { HowItWorks } from '@/components/sections/HowItWorks'
/* GetStarted is retired, not deleted — the file is untouched on disk and its
   trust chips now live under the Pricing plan cards. Uncomment this line and
   the one in `Landing` below to bring the whole section back. */
// import { GetStarted } from '@/components/sections/GetStarted'
import { UvIndex } from '@/components/sections/UvIndex'
import { Footer } from '@/components/layout/Footer'
import { lazySection } from '@/lib/lazySection'
import { useIdleOffscreenAnimation } from '@/hooks/useIdleOffscreenAnimation'
import { useScrollRefresh } from '@/hooks/useScrollRefresh'

/* Everything below the first screen and a half, plus both legal pages. See
   `lazySection` for why these are bundle splits rather than defer-until-seen,
   and for the ScrollTrigger re-measure each one performs on mount. */
const SkinPlan = lazySection(() => import('@/components/sections/skin-plan'), 'SkinPlan')
const Consultation = lazySection(
  () => import('@/components/sections/Consultation'),
  'Consultation',
)
const Compatibility = lazySection(
  () => import('@/components/sections/Compatibility'),
  'Compatibility',
)
const Pricing = lazySection(() => import('@/components/sections/Pricing'), 'Pricing')
const Faq = lazySection(() => import('@/components/sections/Faq'), 'Faq')
const FitScoreSection = lazySection(
  () => import('@/components/sections/FitScoreSection'),
  'FitScoreSection',
)
const PrivacyPolicy = lazySection(() => import('@/pages/PrivacyPolicy'), 'PrivacyPolicy')
const DeleteAccount = lazySection(() => import('@/pages/DeleteAccount'), 'DeleteAccount')

/**
 * The page.
 *
 * `LazyMotion` wraps the whole tree: this codebase uses framer-motion's `m`
 * components, which render and accept `animate` without a feature provider but
 * silently drop viewport gestures — without it every `whileInView` reveal on
 * the page stays at opacity 0.
 */
/** The landing page — every section, in its original order. */
function Landing() {
  return (
    <>
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      {/* <GetStarted /> */}
      <UvIndex />
      <SkinPlan />
      <Consultation />
      <Compatibility />
      <Pricing />
      <Faq />
      {/* Last on the page, and a normal static section again — the reveal
          now lives entirely inside the footer, so this is the block that
          slides up over it. */}
      <FitScoreSection />
    </>
  )
}

/**
 * Which page `<main>` holds.
 *
 * Read once, at module scope, because there is no client-side navigation to
 * react to: every link on the site is a real document navigation, so a new
 * route means a new page load and a fresh read. That is deliberate — two
 * static documents do not justify a history-API router, and without one there
 * is no scroll restoration, no focus management and no popstate handling to
 * get wrong.
 *
 * A trailing slash is normalised away, so `/delete-account/` and
 * `/delete-account` are the same route. Anything unrecognised falls through
 * to the landing page, which is what a static host's SPA fallback serves for
 * unknown paths anyway.
 *
 * Serving these paths in production needs the host to rewrite unknown paths to
 * `index.html` — Vite's dev server already does.
 */
const ROUTES = {
  '/privacy-policy': PrivacyPolicy,
  '/delete-account': DeleteAccount,
} as const

const raw = window.location.pathname
const path = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw
const Page = ROUTES[path as keyof typeof ROUTES] ?? Landing

export default function App() {
  useScrollRefresh()

  /* Pauses keyframe animation in sections that are off screen. The hero pins
     for five viewport-heights, so without this a phone spends that whole
     stretch recalculating style for a footer three screens below it — see the
     hook for the trace that found it. */
  useIdleOffscreenAnimation()

  /**
   * Land a hashed URL on its section.
   *
   * The browser resolves a fragment once, while the document is loading — and
   * at that moment this page is an empty `<div id="root">`, so `#download`
   * does not exist yet and the scroll silently does nothing. React mounts the
   * section a tick later and the visitor is left at the top. That is why
   * `/#download` from the legal pages' navbar appeared to do nothing.
   *
   * NOT ONE PASS. A single `scrollIntoView` on mount measured the page
   * before it was finished: `#download` is a lazy section that does not exist
   * yet, and the hero's pin spacer and the other lazy chunks then insert
   * thousands of pixels ABOVE any target that did exist, so `/#how-it-works`
   * came to rest inside the hero. Instead the page is re-aligned every time
   * the document's height changes, until the visitor takes over (any wheel,
   * touch, key or pointer) or the page has had a few seconds to settle.
   * `scroll-padding-top: 6rem` on `html` keeps the fixed navbar off the target.
   *
   * `scrollIntoView()` with no argument means `behavior: auto`, which reads
   * the computed `scroll-behavior` — declared `auto` on `html` in index.css
   * — so this is an instant jump, never an animated one.
   *
   * Only for a hash present at LOAD. An in-page click is the browser's own
   * fragment navigation, and this must never fight it.
   */
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return

    const align = () => document.getElementById(id)?.scrollIntoView()
    const ro = new ResizeObserver(align)
    const stopEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    let timer: number | undefined
    const stop = () => {
      ro.disconnect()
      window.clearTimeout(timer)
      stopEvents.forEach((type) => window.removeEventListener(type, stop))
    }

    align()
    ro.observe(document.body)
    stopEvents.forEach((type) => window.addEventListener(type, stop, { passive: true }))
    timer = window.setTimeout(stop, 6000)
    return stop
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-5 focus:py-3"
      >
        Skip to content
      </a>

      {/* A leaf, never a wrapper — see the note in Preloader.tsx. */}
      <Preloader />

      <Navbar />
      <ScrollProgress />

      {/* The page shell. `LazyMotion` is a context provider and renders no
          element of its own, so the flex column needs a real wrapper here.
          `min-h-100svh` + `flex-[1_0_auto]` on main keeps the footer at the
          bottom of the viewport when the content is shorter than the screen.

          Nothing on this chain may carry `overflow: hidden`, `overflow-x:
          clip`, a `transform`, `filter`, `perspective`, `backdrop-filter`,
          `will-change` or `contain`. The footer reveal depends on a
          `position: fixed` child resolving against the VIEWPORT, and every one
          of those properties would make an ancestor its containing block
          instead, pinning it to the page and killing the effect. The footer is
          also a SIBLING of main, not inside it, so its reserved height is the
          last thing on the page.

          The footer needs no `shrink-0`: its own `--footer-h` is its height,
          and a column flex container that only has a MIN height never has to
          take space back off its items. */}
      <div className="flex min-h-[100svh] flex-col">
        {/* The shell — skip link, navbar, scroll progress, footer — is shared
            by every route, so only the contents of <main> swap. That is what
            keeps a legal page part of the site rather than a page that merely
            resembles it, and it is also what keeps the footer reveal working:
            the reveal depends on the exact ancestor chain described above,
            which no route may change. */}
        <main id="main" className="flex-[1_0_auto]">
          <Page />
        </main>

        <Footer />
      </div>
    </LazyMotion>
  )
}
