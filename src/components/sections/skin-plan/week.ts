/* ===========================================================================
   DATES.

   Real dates from the device clock, normalised to LOCAL midnight so two dates
   from the same calendar day always compare equal. Everything here is local
   time on purpose: the visitor's Monday is the Monday we must show, not UTC's.

   Weeks run Sunday → Saturday, matching `getDay()`'s own 0–6 and the order the
   plan data is written in.
   =========================================================================== */

/** Today, at local midnight. */
export function todayLocal(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * `n` days from `d`, at local midnight.
 *
 * `setDate` handles month, year and leap-day rollover itself, and re-flooring
 * the time afterwards absorbs the one-hour shift a DST boundary inside the
 * range would otherwise leave behind.
 */
export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  x.setHours(0, 0, 0, 0)
  return x
}

/** The Sunday of `d`'s week. */
export function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay())
}

/** The seven days of the week beginning at `start`. */
export function weekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/** Three letters for the strip's column heads. */
export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Two digits, so 2026 prints as `26` and 2007 as `07`. */
const yy = (d: Date) => String(d.getFullYear() % 100).padStart(2, '0')

/**
 * The month over the strip, in three forms:
 *
 *   one month            `November '26`
 *   two months, one year `September – October '26`
 *   across new year      `December '26 – January '27`
 *
 * En dashes, not hyphens — this is a range.
 */
export function monthLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6)
  const sameYear = weekStart.getFullYear() === end.getFullYear()

  if (sameYear && weekStart.getMonth() === end.getMonth()) {
    return `${MONTHS[weekStart.getMonth()]} '${yy(weekStart)}`
  }
  if (sameYear) {
    return `${MONTHS[weekStart.getMonth()]} – ${MONTHS[end.getMonth()]} '${yy(end)}`
  }
  return `${MONTHS[weekStart.getMonth()]} '${yy(weekStart)} – ${MONTHS[end.getMonth()]} '${yy(end)}`
}

/** `Wednesday` — the line under the month. No `Today` prefix; the app has none. */
export function weekdayName(d: Date): string {
  return WEEKDAYS[d.getDay()]
}

/** `Wednesday, September 9` — the agenda's heading. */
export function agendaHeading(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** `Wednesday, September 9` for a screen reader, with the year for clarity. */
export function spokenDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
