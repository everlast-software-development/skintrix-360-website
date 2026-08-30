import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { FaqConversation, type FAQItem } from '@/components/ui/faq-chat-conversation'
import { EASE } from '@/lib/motion'

/**
 * Faq — the last informative layer, played as a conversation.
 *
 * Every question and every answer is on screen from the start; the section
 * supplies the heading and rhythm, the thread itself lives in
 * `FaqConversation`.
 */

const QA: FAQItem[] = [
  {
    id: 1,
    question: 'What is SkinTrix 360?',
    answer:
      'SkinTrix 360 is an AI-powered skin intelligence platform that analyzes facial images to provide detailed insights into multiple skin parameters.',
  },
  {
    id: 2,
    question: 'How does SkinTrix work?',
    answer:
      'A facial image is captured and processed using AI-powered computer vision. The platform analyzes relevant skin features and presents the results as clear visual insights.',
  },
  {
    id: 3,
    question: 'What can SkinTrix analyze?',
    answer:
      'SkinTrix analyzes 15+ skin parameters, including acne, pigmentation, redness, wrinkles, pores, texture, hydration, sebum, skin type, and signs of skin aging.',
  },
  {
    id: 4,
    question: 'Can I track my skin over time?',
    answer:
      'Yes. SkinTrix is designed to help users and clinics compare skin assessments over time and monitor visible changes.',
  },
  {
    id: 5,
    question: 'Is SkinTrix designed for clinics?',
    answer:
      'Yes. SkinTrix 360 is designed for dermatologists, aesthetic clinics, and other professionals who want to incorporate AI-powered skin analysis into their workflow.',
  },
]

export function Faq() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.15 })
  const show = reduced || inView

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: EASE },
  })

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      // `overflow-clip`, not `hidden`: a scroll container here would let
      // anchor focus shove the section sideways.
      className="section-y relative overflow-clip" style={{ background: 'var(--atm-indigo)' }}
    >
      {/* Ambient AI light, low and centred — the only glow on the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span
          className="absolute top-[8%] left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: 'var(--ai-glow)' }}
        />
      </div>

      <div ref={ref} className="relative shell">
        <div className="mx-auto max-w-[38rem] text-center">
          <m.p className="text-eyebrow text-[color:var(--teal-deep)]" {...rise(0)}>
            Frequently asked questions
          </m.p>
          <m.h2 id="faq-heading" className="text-statement mt-4" {...rise(0.06)}>
            Ask SkinTrix&nbsp;360.
          </m.h2>
          <m.p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-soft" {...rise(0.12)}>
            Everything you need to know about AI-powered skin intelligence.
          </m.p>
        </div>

        {/* The thread carries the section — wide enough to dominate, tight
            enough that the two sides stay visibly opposed. */}
        <m.div className="mx-auto mt-12 max-w-[72rem] lg:mt-16" {...rise(0.18)}>
          <FaqConversation data={QA} />
        </m.div>
      </div>
    </section>
  )
}
