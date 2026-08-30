import { useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/ui/Reveal'
import { EASE } from '@/lib/motion'

/**
 * Audiences — "Built for a clearer view of skin."
 *
 * Two worlds rather than two cards: choosing a perspective changes the portrait,
 * the lines and the register of the copy. The professional view uses the capture
 * that already carries a clinical mesh and a lab coat; the individual view uses
 * the calm portrait. The switch is a real control, so the visitor picks the
 * reading that applies to them instead of being shown both at once.
 */

const VIEWS = {
  individuals: {
    label: 'For individuals',
    src: '/image-2.webp',
    alt: 'A person considering their own skin',
    lines: [
      'Understand your skin.',
      'Track changes.',
      'Build a clearer picture of your skin journey.',
    ],
  },
  professionals: {
    label: 'For professionals',
    src: '/image-1.webp',
    alt: 'A clinician’s view of a facial image with an analysis mesh mapped across the skin',
    lines: [
      'Support assessments.',
      'Visualize skin characteristics.',
      'Track patient progress.',
    ],
  },
} as const

type ViewKey = keyof typeof VIEWS

export function Audiences() {
  const reduced = useReducedMotion()
  const [key, setKey] = useState<ViewKey>('individuals')
  const view = VIEWS[key]

  return (
    <section id="audiences" aria-labelledby="audiences-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <div className="max-w-[34rem]">
          <Reveal>
            <h2 id="audiences-heading" className="text-statement">
              Built for a clearer view of skin.
            </h2>
          </Reveal>
        </div>

        {/* The control. Two words, one rule — no tabs chrome. */}
        <Reveal delay={0.08}>
          <div role="tablist" aria-label="Choose a perspective" className="mt-10 flex gap-8">
            {(Object.keys(VIEWS) as ViewKey[]).map((k) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={key === k}
                onClick={() => setKey(k)}
                className="relative cursor-pointer pb-3 text-left"
              >
                <span
                  className={
                    'text-[1.0625rem] font-medium tracking-[-0.02em] transition-colors duration-300 ' +
                    (key === k ? 'text-ink' : 'text-ink-muted hover:text-ink-soft')
                  }
                >
                  {VIEWS[k].label}
                </span>
                {key === k && (
                  <m.span
                    layoutId="audience-underline"
                    className="absolute inset-x-0 bottom-0 h-px bg-teal"
                    transition={reduced ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                  />
                )}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-10 border-t border-ink-line pt-10 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-16">
          <m.ul
            key={key + '-lines'}
            className="space-y-6"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {view.lines.map((line, i) => (
              <li key={line} className="flex items-baseline gap-4">
                <span className="text-eyebrow w-6 shrink-0 text-teal-deep">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] leading-[1.35] font-medium tracking-[-0.025em]">
                  {line}
                </span>
              </li>
            ))}
          </m.ul>

          <div className="relative mx-auto w-full max-w-[24rem] overflow-clip rounded-[1.5rem] bg-[#F0F1F3] lg:mx-0">
            <m.img
              key={key + '-img'}
              src={view.src}
              alt={view.alt}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block aspect-[4/5] w-full object-cover object-top"
              initial={reduced ? false : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
