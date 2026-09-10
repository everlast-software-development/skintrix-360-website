import { Fragment } from 'react'
import { LuArrowRight, LuCalendarCheck, LuCamera, LuSparkles } from 'react-icons/lu'
import type { IconType } from 'react-icons'

import { COPY } from './calendar-data'

/**
 * BAND 1 — scan → plan → calendar.
 *
 * This band is the reason the calendar below it reads as the OUTPUT of a plan
 * rather than as a standalone schedule anyone could have typed in. Without
 * it the section is a diary; with it, it is what the scan produced.
 *
 * The five children are laid on `1fr auto 1fr auto 1fr`, so the steps take
 * equal thirds and the arrows only the width they need. At ≤1000px it becomes
 * one column and the arrows rotate to point down, so the sequence still reads
 * as a sequence rather than as three unrelated tiles.
 */
const STEPS: { tint: string; ink: string; Icon: IconType }[] = [
  { tint: '#E4F5F4', ink: '#0E6A72', Icon: LuCamera },
  { tint: '#EDEFFA', ink: '#3B4194', Icon: LuSparkles },
  { tint: '#E8EAFB', ink: '#4A51BE', Icon: LuCalendarCheck },
]

export function PlanFlow() {
  return (
    <div className="sp-flow">
      {STEPS.map((s, i) => (
        <Fragment key={COPY.flow[i].title}>
          <div className="sp-step">
            <span className="sp-step-icon" aria-hidden style={{ background: s.tint, color: s.ink }}>
              <s.Icon />
            </span>
            <span className="sp-step-text">
              <span className="sp-step-title">{COPY.flow[i].title}</span>
              <span className="sp-step-sub">{COPY.flow[i].sub}</span>
            </span>
          </div>

          {/* Between the steps only, and decorative — the reading order of the
              three titles already carries the sequence. */}
          {i < STEPS.length - 1 ? (
            <span className="sp-arrow" aria-hidden>
              <LuArrowRight />
            </span>
          ) : null}
        </Fragment>
      ))}
    </div>
  )
}
