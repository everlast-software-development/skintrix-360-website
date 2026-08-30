import { LazyMotion, domAnimation } from 'framer-motion'

import { Navbar } from '@/components/layout/Navbar'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
// Existing sections — unchanged, in their original order.
import { Hero } from '@/components/sections/Hero'
import { WhatItDoes } from '@/components/sections/WhatItDoes'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { DetailsVideo } from '@/components/sections/DetailsVideo'
import { SkinPlan } from '@/components/sections/SkinPlan'
import { Consultation } from '@/components/sections/Consultation'
import { Pricing } from '@/components/sections/Pricing'
import { Faq } from '@/components/sections/Faq'
import { GetStarted } from '@/components/sections/GetStarted'
import { Footer } from '@/components/layout/Footer'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

/**
 * The page.
 *
 * `LazyMotion` wraps the whole tree: this codebase uses framer-motion's `m`
 * components, which render and accept `animate` without a feature provider but
 * silently drop viewport gestures — without it every `whileInView` reveal on
 * the page stays at opacity 0.
 */
export default function App() {
  useSmoothScroll()

  return (
    <LazyMotion features={domAnimation} strict>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-5 focus:py-3"
      >
        Skip to content
      </a>

      <Navbar />
      <ScrollProgress />

      <main id="main">
        <Hero />
        <WhatItDoes />
        <HowItWorks />
        <GetStarted />
        <SkinPlan />
        <Consultation />
        <Pricing />
        <Faq />
        <DetailsVideo />
      </main>

      <Footer />

    </LazyMotion>
  )
}
