import { COPY, TYPES, eventsForDay } from './calendar-data'
import { agendaHeading } from './week'

/**
 * BAND 3 — the selected day, hour by hour.
 *
 * `aria-live="polite"` on the region, because selecting a day in the strip
 * replaces this list without moving focus: without it a screen-reader user
 * presses a day and hears nothing change.
 *
 * The list carries a reserved min-height at ≥1001px (see `--sp-agenda-min` in
 * index.css) so moving between an eight-event Tuesday and an eleven-event
 * Friday does not shunt the two bands below it up and down the page.
 */
export function Agenda({ selected }: { selected: Date }) {
  const events = eventsForDay(selected)

  return (
    <div className="sp-agenda" aria-live="polite">
      <div className="sp-agenda-top">
        <h3 className="sp-agenda-h">{agendaHeading(selected)}</h3>
        <span className="sp-count">{COPY.events(events.length)}</span>
      </div>

      <ul className="sp-list">
        {events.map((e) => {
          const t = TYPES[e.type]
          return (
            <li key={e.id} className="sp-event">
              {/* Decorative: the type is spelled out directly beneath it. */}
              <span className="sp-event-icon" aria-hidden style={{ background: t.tint, color: t.ink }}>
                <t.Icon />
              </span>

              <span className="sp-event-main">
                <span className="sp-event-name">{e.name}</span>
                {/* The type is TEXT. Nothing here is carried by colour alone —
                    Supplement and Lifestyle share a green family. */}
                <span className="sp-event-type" style={{ color: t.ink }}>
                  {t.label}
                </span>
              </span>

              <span className="sp-event-meta">
                <span className="sp-event-time">{e.time}</span>
                <span className="sp-event-rec">{e.recurrence}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
