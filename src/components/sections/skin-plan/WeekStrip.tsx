import { useRef } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

import { COPY, DOT_CAP, TYPES, eventsForDay } from './calendar-data'
import {
  WEEKDAYS_SHORT,
  monthLabel,
  sameDay,
  spokenDate,
  weekDays,
  weekdayName,
} from './week'

/**
 * BAND 2 — the week strip.
 *
 * THE SELECTED CELL HAS NO BORDER AND NO RING. It is white, it carries a soft
 * shadow, and its vertical padding is 18px against the others' 12px — so the
 * card physically protrudes above the row. Elevation plus height IS the
 * selection signal, exactly as in the app; a teal outline on top of it would
 * be a second, louder signal saying the same thing.
 *
 * The dots are one per event, capped at DOT_CAP, so an eleven-event Friday
 * cannot spill out of a 40px-wide cell.
 */
export function WeekStrip({
  weekStart,
  selected,
  today,
  onSelect,
  onPrev,
  onNext,
  onToday,
}: {
  weekStart: Date
  selected: Date
  today: Date
  onSelect: (d: Date) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}) {
  const days = weekDays(weekStart)
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const atToday = sameDay(selected, today)

  /* Arrows move focus along the visible week; Home/End jump to its ends.
     Enter and Space are the native button activation, so selection needs no
     handler of its own. */
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const to =
      e.key === 'ArrowLeft'
        ? i - 1
        : e.key === 'ArrowRight'
          ? i + 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? 6
              : null
    if (to === null) return
    e.preventDefault()
    cells.current[Math.max(0, Math.min(6, to))]?.focus()
  }

  return (
    <div className="sp-week">
      <div className="sp-week-top">
        <button
          type="button"
          className="sp-nav sp-nav--prev"
          onClick={onPrev}
          aria-label="Previous week"
        >
          <LuChevronLeft aria-hidden />
        </button>

        <div className="sp-month-wrap">
          <div className="sp-month">{monthLabel(weekStart)}</div>
          {/* The weekday alone. The app does not write `Today` here. */}
          <div className="sp-selected-day">{weekdayName(selected)}</div>
        </div>

        <div className="sp-week-right">
          <button type="button" className="sp-nav" onClick={onNext} aria-label="Next week">
            <LuChevronRight aria-hidden />
          </button>
          {/* Dimmed but never removed when it would do nothing: still in the
              tab order, still announced, so focus cannot fall through a hole. */}
          <button
            type="button"
            className="sp-today"
            onClick={onToday}
            aria-disabled={atToday ? 'true' : undefined}
            aria-label={atToday ? 'Today, already selected' : 'Go to today'}
          >
            {COPY.today}
          </button>
        </div>
      </div>

      <div className="sp-days" role="group" aria-label="Select a day">
        {days.map((d, i) => {
          const events = eventsForDay(d)
          const isSelected = sameDay(d, selected)
          const isToday = sameDay(d, today)
          return (
            <button
              key={d.toDateString()}
              ref={(el) => {
                cells.current[i] = el
              }}
              type="button"
              className="sp-day"
              aria-pressed={isSelected}
              aria-label={`${spokenDate(d)}${isToday ? ', today' : ''}, ${COPY.events(events.length)}`}
              onClick={() => onSelect(d)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="sp-day-wd">{WEEKDAYS_SHORT[d.getDay()]}</span>
              <span className="sp-day-date">{d.getDate()}</span>
              {/* Decorative: the button's own label already says the count. */}
              <span className="sp-dots" aria-hidden>
                {events.slice(0, DOT_CAP).map((e) => (
                  <span key={e.id} className="sp-dot" style={{ background: TYPES[e.type].dot }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
