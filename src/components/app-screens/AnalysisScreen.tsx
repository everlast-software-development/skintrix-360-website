import { m } from 'framer-motion'

import { ScreenLabel, ScreenShell } from './ScreenShell'
import { EASE } from '@/lib/motion'

const MARKERS = [
  { label: 'Hydration', value: 78 },
  { label: 'Texture', value: 84 },
  { label: 'Redness', value: 21 },
]

/** Detection points, positioned as a percentage of the capture frame. */
const POINTS = [
  { x: 50, y: 22, delay: 0 },
  { x: 26, y: 47, delay: 0.9 },
  { x: 74, y: 45, delay: 0.45 },
  { x: 50, y: 74, delay: 1.4 },
]

export function AnalysisScreen() {
  return (
    <ScreenShell tab="scan">
      <header className="shrink-0 pt-[0.6em]">
        <ScreenLabel>Tuesday, 6 May</ScreenLabel>
        <h3 className="mt-[0.2em] text-[1.55em] leading-none font-extrabold tracking-[-0.04em]">
          Skin Analysis
        </h3>
      </header>

      {/* Capture frame */}
      <div className="relative shrink-0 overflow-hidden rounded-[1.6em] bg-[linear-gradient(158deg,#DFF4F5_0%,#F1FBFA_58%,#E9F6F7_100%)] pb-[112%] shadow-[inset_0_0_0_1px_rgb(22_184_176_/_0.14)]">
        <div className="absolute inset-0">
          {/* Face */}
          <svg viewBox="0 0 120 140" className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
            <ellipse
              cx="60"
              cy="70"
              rx="34"
              ry="45"
              stroke="var(--color-teal-deep)"
              strokeOpacity=".55"
              strokeWidth="1.1"
            />
            <ellipse cx="60" cy="70" rx="26" ry="36" stroke="var(--color-teal)" strokeOpacity=".22" strokeWidth="0.8" />
            <path d="M46 60h9M65 60h9" stroke="var(--color-teal-deep)" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M60 68v10h-4" stroke="var(--color-teal-deep)" strokeOpacity=".35" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M52 90c4 3.2 12 3.2 16 0" stroke="var(--color-teal-deep)" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          {/* Corner brackets */}
          {[
            'left-[8%] top-[7%] border-t-2 border-l-2 rounded-tl-[0.6em]',
            'right-[8%] top-[7%] border-t-2 border-r-2 rounded-tr-[0.6em]',
            'left-[8%] bottom-[7%] border-b-2 border-l-2 rounded-bl-[0.6em]',
            'right-[8%] bottom-[7%] border-b-2 border-r-2 rounded-br-[0.6em]',
          ].map((position) => (
            <span key={position} className={`absolute h-[1.5em] w-[1.5em] border-teal/70 ${position}`} />
          ))}

          {/* Detection points */}
          {POINTS.map((point) => (
            <span
              key={`${point.x}-${point.y}`}
              className="absolute h-[0.5em] w-[0.5em] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              <span
                className="absolute inset-0 rounded-full bg-teal animate-halo"
                style={{ animationDelay: `${point.delay}s` }}
              />
              <span className="absolute inset-0 rounded-full bg-teal-deep" />
            </span>
          ))}

          {/* Sweep */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-[18%] animate-scan bg-[linear-gradient(180deg,transparent,rgb(22_184_176_/_0.22)_70%,rgb(22_184_176_/_0.9))]"
            style={{ ['--scan-travel' as string]: '455%' }}
          />
        </div>

        <span className="absolute bottom-[0.8em] left-1/2 -translate-x-1/2 rounded-full bg-ink/85 px-[0.9em] py-[0.35em] text-[0.62em] font-bold whitespace-nowrap text-white">
          Analyzing 16 markers…
        </span>
      </div>

      {/* Score */}
      <div className="flex shrink-0 items-center justify-between rounded-[1.2em] bg-white px-[1.1em] py-[0.9em]">
        <div>
          <ScreenLabel>Skin score</ScreenLabel>
          <p className="text-[1.9em] leading-none font-extrabold tracking-[-0.05em]">92</p>
        </div>
        <span className="rounded-full bg-teal/14 px-[0.8em] py-[0.4em] text-[0.68em] font-bold text-teal-deep">
          +4 this week
        </span>
      </div>

      {/* Markers */}
      <ul className="flex shrink-0 flex-col gap-[0.7em]">
        {MARKERS.map((marker, i) => (
          <li key={marker.label} className="flex items-center gap-[0.8em]">
            <span className="w-[5.2em] shrink-0 text-[0.72em] font-bold text-ink-soft">{marker.label}</span>
            <span className="h-[0.42em] flex-1 overflow-hidden rounded-full bg-ink/8">
              <m.span
                className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-azure),var(--color-teal-deep))]"
                initial={{ width: 0 }}
                whileInView={{ width: `${marker.value}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.25 + i * 0.12, ease: EASE }}
              />
            </span>
            <span className="w-[1.8em] shrink-0 text-right text-[0.72em] font-extrabold tabular-nums">
              {marker.value}
            </span>
          </li>
        ))}
      </ul>

      <span className="mt-auto mb-[0.5em] grid h-[2.9em] shrink-0 place-items-center rounded-full bg-[linear-gradient(112deg,var(--color-azure),var(--color-teal))]">
        <span className="text-[0.78em] font-extrabold text-ink">View full report</span>
      </span>
    </ScreenShell>
  )
}
