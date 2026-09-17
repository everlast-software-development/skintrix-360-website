import { LuCalendarCheck, LuLeaf, LuMoon, LuPill, LuSunrise } from 'react-icons/lu'
import type { IconType } from 'react-icons'

/* ===========================================================================
   THE PLAN, KEYED BY WEEKDAY.

   Every string in the section lives in this file.

   THE LOOKUP IS `date.getDay()` — see `eventsForDay` at the bottom. There is
   no ISO date key anywhere in this module, and that is the whole reason the
   calendar can show the visitor's REAL dates: every Monday is the same
   Monday, so the data can never run out, never leave a day empty and never
   drift out of range however long the site is live.
   =========================================================================== */

export type EventType = 'morning' | 'evening' | 'supplement' | 'treatment' | 'lifestyle'

/**
 * The app's own event colours, unchanged.
 *
 * `tint`/`ink` dress the 38px icon tile; `ink` also prints the type label on
 * the white card; `dot` is the 6px marker in the week strip.
 *
 * SUPPLEMENT AND LIFESTYLE ARE BOTH GREEN ON PURPOSE — they are the app's
 * values. What keeps them apart is never the colour: the icon SHAPE (a
 * capsule against a leaf) and the type label, which is real text. Nothing in
 * this section means anything by hue alone.
 */
export const TYPES: Record<
  EventType,
  { label: string; tint: string; ink: string; dot: string; Icon: IconType }
> = {
  morning: { label: 'Morning Routine', tint: '#FDF1DC', ink: '#B4741A', dot: '#E8A33D', Icon: LuSunrise },
  evening: { label: 'Evening Routine', tint: '#E8EAFB', ink: '#4A51BE', dot: '#5D64D3', Icon: LuMoon },
  supplement: { label: 'Supplement', tint: '#E3F6EC', ink: '#1E8A57', dot: '#2FA86B', Icon: LuPill },
  treatment: { label: 'Treatment', tint: '#F1E9FB', ink: '#8A5CC7', dot: '#8A5CC7', Icon: LuCalendarCheck },
  lifestyle: { label: 'Lifestyle', tint: '#E4F5F1', ink: '#17786A', dot: '#26A08C', Icon: LuLeaf },
}

export type PlanEvent = {
  id: string
  name: string
  type: EventType
  /** As printed: "7:00 AM". */
  time: string
  /** THE SORT KEY: minutes from midnight, so 12:30 PM never sorts before
   *  7:30 AM. Derived from `time` rather than typed, so the two cannot
   *  disagree. */
  at: number
  recurrence: 'Daily' | 'Weekly'
}

/** "12:30 PM" → 750. The only place a clock string is parsed. */
function minutes(time: string): number {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time)
  if (!m) throw new Error(`calendar-data: unreadable time "${time}"`)
  const h = (Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0)
  return h * 60 + Number(m[2])
}

const ev = (
  id: string,
  name: string,
  type: EventType,
  time: string,
  recurrence: PlanEvent['recurrence'],
): PlanEvent => ({ id, name, type, time, at: minutes(time), recurrence })

/* ── on every day of the week ─────────────────────────────────────────────── */

const DAILY: PlanEvent[] = [
  ev('am', 'Morning Skincare Routine', 'morning', '7:00 AM', 'Daily'),
  ev('pm', 'Evening Skincare Routine', 'evening', '9:00 PM', 'Daily'),
]

/* ── the supplements, reminders and treatments that rotate by weekday ─────── */

const S = {
  collagen: ev('collagen', 'Hydrolysed Collagen Peptides', 'supplement', '7:30 AM', 'Daily'),
  lutein: ev('lutein', 'Lutein and Zeaxanthin', 'supplement', '12:30 PM', 'Daily'),
  omega: ev('omega', 'Omega-3 Fatty Acids (EPA and DHA)', 'supplement', '7:30 PM', 'Daily'),
} as const

const L = {
  hydration: ev('ls-hydration', 'Hydration: Lifestyle Reminder', 'lifestyle', '7:15 AM', 'Weekly'),
  sun: ev('ls-sun', 'Sun habits: Lifestyle Reminder', 'lifestyle', '11:30 AM', 'Weekly'),
  nutrition: ev('ls-nutrition', 'Nutrition: Lifestyle Reminder', 'lifestyle', '12:30 PM', 'Weekly'),
  eyes: ev('ls-eyes', 'Eye care habits: Lifestyle Reminder', 'lifestyle', '8:30 PM', 'Weekly'),
  sleep: ev('ls-sleep', 'Sleep: Lifestyle Reminder', 'lifestyle', '10:00 PM', 'Weekly'),
} as const

const T = {
  salicylic: ev('tx-salicylic', 'Salicylic Acid 2% Pore Treatment', 'treatment', '8:30 PM', 'Weekly'),
  eyeMask: ev('tx-eye-mask', 'Cooling Hydrogel Eye Mask', 'treatment', '9:00 PM', 'Weekly'),
  pha: ev('tx-pha', 'Polyhydroxy Acid Resurfacing Mask', 'treatment', '8:30 PM', 'Weekly'),
  retinal: ev('tx-retinal', 'Retinaldehyde Serum', 'treatment', '9:15 PM', 'Weekly'),
} as const

/**
 * The allocation, INDEXED 0–6 TO MATCH `getDay()` — index 0 is Sunday.
 *
 * AT MOST ONE OF EACH per day: the two routines, one supplement, one
 * lifestyle reminder and zero or one treatment — 4 or 5 events. One of each
 * type is enough to explain the idea; three supplements on one day was noise.
 * The days differ by WHICH supplement and reminder appear, not by how many.
 */
const ALLOCATION: { supplement: PlanEvent; lifestyle: PlanEvent; treatment?: PlanEvent }[] = [
  { supplement: S.omega, lifestyle: L.sleep, treatment: T.eyeMask }, // Sun
  { supplement: S.collagen, lifestyle: L.hydration }, // Mon
  { supplement: S.lutein, lifestyle: L.nutrition, treatment: T.salicylic }, // Tue
  { supplement: S.collagen, lifestyle: L.sun }, // Wed
  { supplement: S.omega, lifestyle: L.eyes, treatment: T.retinal }, // Thu
  { supplement: S.lutein, lifestyle: L.hydration, treatment: T.pha }, // Fri
  { supplement: S.collagen, lifestyle: L.sleep }, // Sat
]

/* Built once at module load, each day sorted by its minutes-from-midnight
   key. Array#sort is stable in V8, so two events at the same minute keep
   their declared order: the routine before a treatment at 9:00 PM, the
   supplement before the reminder at 12:30 PM. */
const BY_WEEKDAY: PlanEvent[][] = ALLOCATION.map((day) =>
  [...DAILY, day.supplement, day.lifestyle, ...(day.treatment ? [day.treatment] : [])].sort(
    (a, b) => a.at - b.at,
  ),
)

/**
 * THE LOOKUP. Weekday only — `getDay()`, not an ISO date string.
 *
 * This is what makes the real device clock safe here: the function is total
 * over every Date that will ever exist, so no date can be out of range and no
 * day can come back empty.
 */
export function eventsForDay(date: Date): PlanEvent[] {
  return BY_WEEKDAY[date.getDay()]
}

/** How many events each weekday carries — derived, for the aria labels. */
export const COUNT_BY_WEEKDAY = BY_WEEKDAY.map((d) => d.length)

/** Dots in a day cell are capped so a busy day cannot overflow it. */
export const DOT_CAP = 5

export const COPY = {
  identity: 'My Skincare Plan & Calendar',
  heading: 'One scan becomes your whole week.',
  lead: 'SkinTrix reads your skin, writes a plan from it, then places every step on your calendar — routines, supplements, treatments and daily habits.',
  flow: [
    { title: 'You scan your skin', sub: 'One photo' },
    { title: 'We write your plan', sub: 'Routines, supplements, habits' },
    { title: 'It lands on your calendar', sub: 'Every day, at the right time' },
  ],
  today: 'Today',
  curiosity: {
    before: 'Every day is different. Tap any step in the app to see ',
    bold: "what's in it and why it's there",
    after: '.',
  },
  note: 'Example week. Yours is generated from your own scan. Not medical advice.',
  events: (n: number) => `${n} event${n === 1 ? '' : 's'}`,
} as const
