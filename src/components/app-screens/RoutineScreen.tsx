import { m } from 'framer-motion'

import { ScreenLabel, ScreenShell } from './ScreenShell'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/cn'

const STEPS = [
  { n: '1', name: 'Gentle cleanser', meta: 'Amino acid · 60s', done: true },
  { n: '2', name: 'Niacinamide 5%', meta: 'Barrier support', done: true },
  { n: '3', name: 'Retinol 0.3%', meta: 'Every third night', done: false },
  { n: '4', name: 'Ceramide cream', meta: 'Seal · 2 pumps', done: false },
]

export function RoutineScreen() {
  return (
    <ScreenShell tab="routine">
      <header className="flex shrink-0 items-end justify-between pt-[0.6em]">
        <div>
          <ScreenLabel>Tonight</ScreenLabel>
          <h3 className="mt-[0.2em] text-[1.55em] leading-none font-extrabold tracking-[-0.04em]">Your routine</h3>
        </div>
        <span className="rounded-full bg-ink/6 px-[0.75em] py-[0.35em] text-[0.66em] font-bold text-ink-soft">
          4 min
        </span>
      </header>

      {/* AM / PM */}
      <div className="flex shrink-0 gap-[0.25em] rounded-full bg-ink/6 p-[0.28em]">
        {['Morning', 'Evening'].map((slot) => (
          <span
            key={slot}
            className={cn(
              'grid h-[2em] flex-1 place-items-center rounded-full',
              slot === 'Evening' && 'bg-white',
            )}
          >
            <span className={cn('text-[0.7em] font-bold', slot === 'Evening' ? 'text-ink' : 'text-ink-muted')}>
              {slot}
            </span>
          </span>
        ))}
      </div>

      {/* Completion */}
      <div className="shrink-0">
        <div className="flex items-center justify-between text-[0.64em] font-bold">
          <span className="text-ink-soft">2 of 4 complete</span>
          <span className="text-teal-deep">50%</span>
        </div>
        <span className="mt-[0.5em] block h-[0.4em] overflow-hidden rounded-full bg-ink/8">
          <m.span
            className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-azure),var(--color-teal-deep))]"
            initial={{ width: 0 }}
            whileInView={{ width: '50%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
          />
        </span>
      </div>

      {/* Steps */}
      <ul className="flex shrink-0 flex-col gap-[0.6em]">
        {STEPS.map((step, i) => (
          <m.li
            key={step.n}
            className={cn(
              'flex items-center gap-[0.75em] rounded-[1.05em] p-[0.75em]',
              step.done
                ? 'bg-white'
                : 'bg-white/55 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.05)]',
            )}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: EASE }}
          >
            <span
              className={cn(
                'grid h-[2.1em] w-[2.1em] shrink-0 place-items-center rounded-full',
                step.done ? 'bg-[linear-gradient(135deg,var(--color-azure),var(--color-teal))]' : 'bg-ink/7',
              )}
            >
              {step.done ? (
                <svg viewBox="0 0 24 24" className="h-[1.1em] w-[1.1em]" fill="none" stroke="#0B2A31" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12.5 10 17.5 19 7" />
                </svg>
              ) : (
                <span className="text-[0.72em] font-extrabold text-ink-muted">{step.n}</span>
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className={cn('block truncate text-[0.78em] font-extrabold tracking-tight', !step.done && 'text-ink-soft')}>
                {step.name}
              </span>
              <span className="block truncate text-[0.64em] font-semibold text-ink-muted">{step.meta}</span>
            </span>
          </m.li>
        ))}
      </ul>

      {/* AI note */}
      <div className="mt-auto mb-[0.5em] flex shrink-0 items-start gap-[0.65em] rounded-[1.1em] bg-[linear-gradient(135deg,rgb(22_184_176_/_0.13),rgb(82_229_234_/_0.06))] p-[0.85em]">
        <span className="grid h-[1.6em] w-[1.6em] shrink-0 place-items-center rounded-full bg-white/85">
          <svg viewBox="0 0 24 24" className="h-[0.95em] w-[0.95em]" fill="var(--color-teal-deep)" aria-hidden>
            <path d="M12 2.5 14.1 8.4 20 10.5l-5.9 2.1L12 18.5l-2.1-5.9L4 10.5l5.9-2.1z" />
          </svg>
        </span>
        <p className="text-[0.66em] leading-[1.45] font-semibold text-ink-soft">
          Retinol moved to every third night — your barrier is still recovering.
        </p>
      </div>
    </ScreenShell>
  )
}
