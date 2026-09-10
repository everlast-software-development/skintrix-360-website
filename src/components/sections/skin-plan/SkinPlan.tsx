import { useMemo, useState } from 'react'
import { LuCalendarDays, LuSparkles } from 'react-icons/lu'

import { useTextReveal } from '@/hooks/useTextReveal'

import { Agenda } from './Agenda'
import { PlanFlow } from './PlanFlow'
import { WeekStrip } from './WeekStrip'
import { COPY } from './calendar-data'
import { addDays, sameDay, startOfWeek, todayLocal, weekDays } from './week'

/**
 * MY SKINCARE PLAN & CALENDAR.
 *
 * A calendar-led preview of the app for a visitor who has never signed in.
 * The previous version of this section was a signed-in dashboard — four tabs,
 * `now → expected` projections, `18 concerns tracked`, a Scientific Basis
 * block — and none of that belongs on a marketing page. The projections in
 * particular are gone deliberately: a percentage improvement figure printed
 * near a download button is a promise about someone's results.
 *
 * WHAT IT SHOWS INSTEAD: the visitor's real current week, and what a day in
 * the plan actually contains. It never opens a step. That withholding is
 * band 4's whole job.
 *
 * REAL DATES ARE SAFE HERE because the events are keyed to the WEEKDAY —
 * `eventsForDay` is `getDay()`, never an ISO string — so the data is total
 * over every date that will ever exist. See calendar-data.ts.
 *
 * The layout is the site's own: `.shell` (max-width 76rem, 24px gutters
 * rising to 40px at 768px) and `.section-y` (padding-block
 * clamp(4rem, 2.75rem + 5vw, 7.5rem)), both identical to the neighbouring
 * sections. Everything below the header sits in ONE panel whose four bands
 * are separated by hairlines rather than gaps, which is what keeps it reading
 * as a single object.
 *
 * State is two local dates and nothing else. No network, no new dependency.
 */
export function SkinPlan() {
  const headingRef = useTextReveal<HTMLHeadingElement>()

  /* Read once, so every render agrees on which day is `today`. */
  const today = useMemo(() => todayLocal(), [])

  const [selected, setSelected] = useState<Date>(() => today)
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(today))

  /* Moving the week keeps the selection if it is still on screen, and
     otherwise takes the first day shown — so the agenda is never describing a
     day the strip cannot highlight. */
  const shiftWeek = (weeks: number) => {
    const next = addDays(weekStart, weeks * 7)
    setWeekStart(next)
    if (!weekDays(next).some((d) => sameDay(d, selected))) setSelected(next)
  }

  /* One press, from any week in either direction: the real current week AND
     today selected. `todayLocal()` is re-read here so a tab left open across
     midnight still lands on the right day. */
  const goToToday = () => {
    const now = todayLocal()
    setWeekStart(startOfWeek(now))
    setSelected(now)
  }

  return (
    <section
      id="skin-plan"
      aria-labelledby="skin-plan-heading"
      className="section-y relative scroll-mt-24"
      style={{ background: '#F5F6FD' }}
    >
      <div className="shell">
        <div className="section-head">
          {/* Built to this section's own spec rather than from `FeatureTile`:
              the icon ink is #5D64D3 and the name 16px, where the shared
              component uses #3B4194 at 17px. */}
          <div className="sp-identity">
            <span className="sp-identity-icon" aria-hidden>
              <LuCalendarDays />
            </span>
            <span className="sp-identity-name">{COPY.identity}</span>
          </div>

          <h2 ref={headingRef} id="skin-plan-heading" className="text-statement">
            {COPY.heading}
          </h2>
          <p className="text-lead">{COPY.lead}</p>
        </div>

        {/* ONE panel, four bands. `overflow: hidden` is what clips the first
            band's fill and the hairlines to the 26px radius. */}
        <div className="sp-panel">
          <PlanFlow />

          <WeekStrip
            weekStart={weekStart}
            selected={selected}
            today={today}
            onSelect={setSelected}
            onPrev={() => shiftWeek(-1)}
            onNext={() => shiftWeek(1)}
            onToday={goToToday}
          />

          <Agenda selected={selected} />

          {/* BAND 4. The section says WHEN every step happens and never what
              is in one. This line says so out loud. */}
          <div className="sp-curiosity">
            <LuSparkles aria-hidden />
            <p>
              {COPY.curiosity.before}
              <strong>{COPY.curiosity.bold}</strong>
              {COPY.curiosity.after}
            </p>
          </div>
        </div>

        <p className="sp-note type-small ink-muted">{COPY.note}</p>
      </div>
    </section>
  )
}
