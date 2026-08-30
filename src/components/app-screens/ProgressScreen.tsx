import { m } from 'framer-motion'

import { ScreenLabel, ScreenShell } from './ScreenShell'
import { EASE } from '@/lib/motion'
import { cn } from '@/lib/cn'

const LINE =
  'M0 34 C 7 32.4 9 30.6 14 30 S 24 33 28 31.2 S 38 25.4 42 24 S 52 21.2 56 20 S 66 15.4 70 14 S 80 12.4 84 12 S 96 8 100 7'

const RANGES = ['Week', 'Month', 'Year']

const DELTAS = [
  { label: 'Hydration', value: '+12%', up: true },
  { label: 'Redness', value: '−31%', up: false },
]

export function ProgressScreen() {
  return (
    <ScreenShell tab="progress">
      <header className="shrink-0 pt-[0.6em]">
        <ScreenLabel>Last 84 days</ScreenLabel>
        <h3 className="mt-[0.2em] text-[1.55em] leading-none font-extrabold tracking-[-0.04em]">Progress</h3>
      </header>

      {/* Range switch */}
      <div className="flex shrink-0 gap-[0.25em] rounded-full bg-ink/6 p-[0.28em]">
        {RANGES.map((range) => (
          <span
            key={range}
            className={cn(
              'grid h-[2em] flex-1 place-items-center rounded-full',
              range === 'Month' && 'bg-white',
            )}
          >
            <span
              className={cn(
                'text-[0.7em] font-bold',
                range === 'Month' ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {range}
            </span>
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="relative shrink-0 rounded-[1.3em] bg-white p-[1.05em]">
        <div className="flex items-end justify-between">
          <div>
            <ScreenLabel>Skin score</ScreenLabel>
            <p className="text-[1.85em] leading-none font-extrabold tracking-[-0.05em]">92</p>
          </div>
          <span className="rounded-full bg-teal/14 px-[0.75em] py-[0.35em] text-[0.66em] font-bold text-teal-deep">
            ▲ 18%
          </span>
        </div>

        <div className="relative mt-[0.9em] h-[7.4em]">
          <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="sx-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-teal)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="sx-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-azure)" />
                <stop offset="100%" stopColor="var(--color-teal-deep)" />
              </linearGradient>
            </defs>

            {[8, 20, 32].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--color-ink)" strokeOpacity="0.06" strokeWidth="0.5" />
            ))}

            <m.path
              d={`${LINE} L100 44 L0 44 Z`}
              fill="url(#sx-area)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6, ease: EASE }}
            />
            <m.path
              d={LINE}
              fill="none"
              stroke="url(#sx-line)"
              strokeWidth="2.2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, delay: 0.2, ease: EASE }}
            />
          </svg>

          <span className="absolute top-[8%] right-0 h-[0.55em] w-[0.55em] -translate-y-1/2 translate-x-1/2">
            <span className="absolute inset-0 rounded-full bg-teal animate-halo" />
            <span className="absolute inset-0 rounded-full bg-teal-deep" />
          </span>
        </div>

        <div className="mt-[0.55em] flex justify-between text-[0.58em] font-bold text-ink-muted">
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
        </div>
      </div>

      {/* Deltas */}
      <div className="grid shrink-0 grid-cols-2 gap-[0.7em]">
        {DELTAS.map((delta) => (
          <div key={delta.label} className="rounded-[1.1em] bg-white p-[0.85em]">
            <ScreenLabel>{delta.label}</ScreenLabel>
            <p
              className={cn(
                'mt-[0.15em] text-[1.15em] leading-none font-extrabold tracking-[-0.04em]',
                delta.up ? 'text-teal-deep' : 'text-ink',
              )}
            >
              {delta.value}
            </p>
          </div>
        ))}
      </div>

      {/* Before / after */}
      <div className="mt-auto mb-[0.5em] flex shrink-0 gap-[0.7em]">
        {[
          { caption: 'Day 1', score: 74, tone: 'from-[#F2E7E4] to-[#FBF6F5]' },
          { caption: 'Day 84', score: 92, tone: 'from-[#DFF4F5] to-[#F1FBFA]' },
        ].map((shot) => (
          <div key={shot.caption} className="flex-1">
            <div className={cn('relative overflow-hidden rounded-[1em] bg-gradient-to-br pb-[74%]', shot.tone)}>
              <svg viewBox="0 0 60 44" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
                <ellipse cx="30" cy="24" rx="13" ry="17" stroke="var(--color-ink)" strokeOpacity=".22" strokeWidth="1" />
                <path d="M24 20h4M32 20h4" stroke="var(--color-ink)" strokeOpacity=".28" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M26 31c2.4 1.8 5.6 1.8 8 0" stroke="var(--color-ink)" strokeOpacity=".25" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="absolute right-[0.4em] bottom-[0.4em] rounded-full bg-white/85 px-[0.5em] py-[0.15em] text-[0.58em] font-extrabold">
                {shot.score}
              </span>
            </div>
            <p className="mt-[0.4em] text-center text-[0.6em] font-bold text-ink-muted">{shot.caption}</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
