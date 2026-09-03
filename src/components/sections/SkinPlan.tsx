import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion'
import {
  LuArrowRight,
  LuAtom,
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuDroplet,
  LuRepeat,
  LuShieldCheck,
  LuSparkles,
  LuSun,
  LuTag,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu'

import { EASE } from '@/lib/motion'
import { useTextReveal } from '@/hooks/useTextReveal'

/**
 * The plan, drawn as the app draws it — and the calendar actually works.
 *
 * The week strip is a real date picker: click a day and the agenda heading, the
 * event count, the dots and the list all follow it; the chevrons step the week;
 * Today jumps back. Arrow keys move between the day cells, Home/End jump to the
 * ends of the visible week, and the agenda is an `aria-live="polite"` region so
 * the change is announced without interrupting.
 *
 * It is a marketing mock with no backend, so the schedule is a local dataset
 * (`SCHEDULE`) covering three weeks around the displayed one. Every item is one
 * of the six ingredients already on screen, so nothing looks invented.
 *
 * SkinTrix recommends *active ingredients*, never products or brands, so every
 * row is an ingredient, what it targets, and the finding behind it.
 *
 * WHY THE PANELS ARE TINTED AND THE CARDS ARE WHITE
 * White cards on a white panel separated by a hairline read as one flat
 * surface — the hairline simply is not visible at that contrast. So the panel
 * takes the page ground and recedes, the cards stay white and come forward, and
 * elevation does the separating instead of a line.
 */

/* ===========================================================================
   Palette
   =========================================================================== */

/**
 * The only colours in this file.
 *
 * The four INKS are no longer set here — they are `var(--text-*)`, the
 * site-wide tokens. The values did not change: the navy, body and muted greys
 * this section was specified with turned out to be exactly the values the whole
 * site standardised on, which is why this section was the reference for it.
 * The old note here said this navy was deliberately NOT the site ink; that is
 * no longer true, and it is the same token everywhere now.
 *
 * What remains local is everything that is not type — grounds, tints,
 * hairlines, and the two non-brand accents the ingredient tiles rotate
 * through. Text ink never comes from this object; it comes from a `type-*` or
 * `ink-*` class.
 */
const P = {
  /* The four inks now come from the tokens. Same values this section was
     specified with — #1EB9B7 / #1A2A5C / #5A6B7B / #94A0AC — so nothing here
     moves; they simply stop being a private second copy. What still reads
     them are non-text elements (icon glyphs, tinted pills, hairlines), which
     is why they stay in this object rather than becoming classes. */
  teal: 'var(--text-accent)',
  cyan: '#29A6D3',
  blue: '#4C71CE',
  navy: 'var(--text-heading)',
  body: 'var(--text-body)',
  muted: 'var(--text-muted)',
  ground: '#F5F6FD',
  hairline: '#E2E5F2',
  tint: '#EDEFFA',
  tealTint: '#E6F7F6',
  cyanTint: '#E6F2FA',
  blueTint: '#ECEFFB',
  white: '#FFFFFF',
} as const

/**
 * The three OUTER containers. Borderless by request.
 *
 * Only these lose the hairline — the cards inside keep theirs, which is what
 * now draws every edge you see. With no outline of its own a white panel on
 * the #F5F6FD ground is separated by tone alone, so the shadow picks up the
 * work the border was doing: a 1px contact line to seat the edge, and a wider
 * ambient one underneath.
 */
const PANEL = {
  background: P.white,
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 1px 2px rgba(13,24,57,.04), 0 10px 34px -18px rgba(13,24,57,.14)',
} as const

/** The rows and blocks inside a panel. Flat: the hairline does the work. */
const CARD = {
  background: P.white,
  border: `1px solid ${P.hairline}`,
  borderRadius: '16px',
  padding: '16px',
} as const

const CARD_SELECTED = {
  ...CARD,
  border: `1.5px solid ${P.teal}`,
  boxShadow: '0 8px 24px -14px rgba(30,185,183,.35)',
} as const

/** teal → cyan → blue, by position. Never by status — see the handover. */
const ROTATION = [
  { bg: P.tealTint, fg: P.teal },
  { bg: P.cyanTint, fg: P.cyan },
  { bg: P.blueTint, fg: P.blue },
] as const
const tile = (i: number) => ROTATION[i % ROTATION.length]

/* ===========================================================================
   Ingredients and the schedule
   =========================================================================== */

type Slot = 'morning' | 'evening'

/** What the detail panel explains. Keyed by name so the schedule can be flat. */
const INGREDIENTS: Record<
  string,
  { target: string; treats: string[]; insight: string; role: string; Icon: typeof LuSun }
> = {
  'Vitamin C': {
    target: 'Uneven skin tone',
    treats: ['Pigmentation'],
    insight: 'Pigmentation detected in your latest scan.',
    role: 'Brightening and antioxidant support through the day.',
    Icon: LuSparkles,
  },
  Niacinamide: {
    target: 'Uneven skin tone',
    treats: ['Pigmentation', 'Hydration'],
    insight: 'Pigmentation detected in your latest scan.',
    role: 'Supports a more even-looking complexion and helps strengthen the skin barrier.',
    Icon: LuAtom,
  },
  SPF: {
    target: 'Sun exposure',
    treats: ['Pigmentation'],
    insight: 'Recommended alongside any pigmentation plan.',
    role: 'Daily protection, so the rest of the plan is not working against new exposure.',
    Icon: LuSun,
  },
  'Azelaic Acid': {
    target: 'Pigmentation and redness',
    treats: ['Pigmentation'],
    insight: 'Pigmentation and visible redness detected in your latest scan.',
    role: 'Works on uneven tone and visible redness at the same time.',
    Icon: LuAtom,
  },
  'Hyaluronic Acid': {
    target: 'Hydration',
    treats: ['Hydration'],
    insight: 'Lower hydration readings across the cheeks.',
    role: 'Helps the skin hold water, so the surface looks plumper and calmer overnight.',
    Icon: LuDroplet,
  },
  Ceramides: {
    target: 'Skin barrier',
    treats: ['Hydration', 'Texture'],
    insight: 'Paired with actives to keep the barrier comfortable.',
    role: 'Helps the barrier stay resilient while stronger actives are in use.',
    Icon: LuShieldCheck,
  },
}

type Entry = { name: string; subtitle: string; time: string; slot: Slot }

/* The six routine shapes the generated weeks draw from. */
const AM_FULL: Entry[] = [
  { name: 'Vitamin C', subtitle: 'For pigmentation', time: '7:00 AM', slot: 'morning' },
  { name: 'Niacinamide', subtitle: 'For uneven tone', time: '7:10 AM', slot: 'morning' },
  { name: 'SPF', subtitle: 'Daily protection', time: '7:20 AM', slot: 'morning' },
]
const AM_LIGHT: Entry[] = [
  { name: 'Niacinamide', subtitle: 'For uneven tone', time: '7:10 AM', slot: 'morning' },
  { name: 'SPF', subtitle: 'Daily protection', time: '7:20 AM', slot: 'morning' },
]
const PM_FULL: Entry[] = [
  { name: 'Azelaic Acid', subtitle: 'For pigmentation + redness', time: '9:00 PM', slot: 'evening' },
  { name: 'Hyaluronic Acid', subtitle: 'For hydration', time: '9:10 PM', slot: 'evening' },
  { name: 'Ceramides', subtitle: 'For barrier support', time: '9:20 PM', slot: 'evening' },
]
const PM_LIGHT: Entry[] = [
  { name: 'Hyaluronic Acid', subtitle: 'For hydration', time: '9:10 PM', slot: 'evening' },
  { name: 'Ceramides', subtitle: 'For barrier support', time: '9:20 PM', slot: 'evening' },
]

/* ---- dates, as plain ISO strings. No date library, no new dependency. ---- */

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const addDays = (s: string, n: number) => {
  const d = fromIso(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

/** The Monday of whatever week `s` falls in. */
const mondayOf = (s: string) => {
  const d = fromIso(s)
  const shift = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - shift)
  return iso(d)
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * The mock's "today". Fixed rather than `new Date()` so the screenshot, the
 * copy and the Today button always agree — a real clock would make this
 * section show an empty week the moment the dataset's range passed.
 */
const TODAY = '2026-08-04'

/**
 * Three weeks around the displayed one, keyed by ISO date.
 *
 * Built from the routine shapes rather than typed out day by day: a rest day
 * every Sunday (nothing in the evening), a lighter morning midweek. The point
 * is that some days are full, some are partial and some are empty, so the
 * empty state and the dot counts are reachable by clicking rather than
 * theoretical.
 */
const SCHEDULE: Record<string, Entry[]> = (() => {
  const out: Record<string, Entry[]> = {}
  const start = addDays(mondayOf(TODAY), -7)
  for (let i = 0; i < 21; i++) {
    const day = addDays(start, i)
    const dow = fromIso(day).getDay() // 0 = Sunday
    if (dow === 0) {
      /* Sunday: morning only — the deliberate empty-evening case. */
      out[day] = [...AM_LIGHT]
    } else if (dow === 3) {
      out[day] = [...AM_LIGHT, ...PM_LIGHT]
    } else if (dow === 6) {
      /* Saturday: evening only — the empty-morning case. */
      out[day] = [...PM_FULL]
    } else {
      out[day] = [...AM_FULL, ...PM_FULL]
    }
  }
  return out
})()

const itemsOn = (day: string, slot: Slot) => (SCHEDULE[day] ?? []).filter((e) => e.slot === slot)
const countOn = (day: string) => (SCHEDULE[day] ?? []).length

const CONCERNS: { label: string; status: string; dir: 'up' | 'down' }[] = [
  { label: 'Pigmentation', status: 'Detected', dir: 'up' },
  { label: 'Texture', status: 'Improving', dir: 'down' },
  { label: 'Hydration', status: 'Needs attention', dir: 'up' },
]

const CHANGES = [
  { label: 'Pigmentation', note: 'Needs more attention', dir: 'up' as const },
  { label: 'Texture', note: 'Improving', dir: 'down' as const },
]

/* ===========================================================================
   Section
   =========================================================================== */

export function SkinPlan() {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const show = reduced || inView
  const baseId = useId()

  const [slot, setSlot] = useState<Slot>('morning')
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [weekStart, setWeekStart] = useState(() => mondayOf(TODAY))
  const [selectedName, setSelectedName] = useState<string | null>('Niacinamide')
  const [focusConcern, setFocusConcern] = useState<string | null>(null)
  const [showChanges, setShowChanges] = useState(false)

  /** The seven cells of the visible week. */
  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const items = useMemo(() => itemsOn(selectedDate, slot), [selectedDate, slot])

  /* The detail panel follows the clicked row, but falls back to the first item
     of whatever is on screen — otherwise picking a day that does not include
     the previously selected ingredient would leave the panel describing
     something no longer in the list. */
  const featuredName =
    selectedName && items.some((i) => i.name === selectedName)
      ? selectedName
      : (items[0]?.name ?? null)
  const featured = featuredName ? INGREDIENTS[featuredName] : null
  const featuredIndex = Math.max(
    0,
    items.findIndex((i) => i.name === featuredName),
  )

  /** The month shown by the header: the visible week's midpoint, so a week
      straddling two months takes the one holding most of it. */
  const midWeek = fromIso(addDays(weekStart, 3))
  const monthLabel = `${MONTHS_SHORT[midWeek.getMonth()]} ${midWeek.getFullYear()}`

  const selDate = fromIso(selectedDate)
  const agendaHeading = `${WEEKDAYS[(selDate.getDay() + 6) % 7]}, ${MONTHS[selDate.getMonth()]} ${selDate.getDate()}`

  /* ---- week stepping. Selection follows into the new week. ---- */
  const stepWeek = (dir: -1 | 1) => {
    const next = addDays(weekStart, dir * 7)
    setWeekStart(next)
    const stillVisible = Array.from({ length: 7 }, (_, i) => addDays(next, i)).includes(
      selectedDate,
    )
    if (!stillVisible) setSelectedDate(next)
  }

  const goToday = () => {
    setWeekStart(mondayOf(TODAY))
    setSelectedDate(TODAY)
  }

  /* ---- keyboard on the date strip ---- */
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onStripKey = useCallback((e: React.KeyboardEvent, i: number) => {
    const move = (to: number) => {
      e.preventDefault()
      const clamped = Math.max(0, Math.min(6, to))
      dayRefs.current[clamped]?.focus()
    }
    if (e.key === 'ArrowRight') move(i + 1)
    else if (e.key === 'ArrowLeft') move(i - 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(6)
    /* Enter and Space are already a button's own activation — nothing to add. */
  }, [])

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: EASE },
  })

  const focusRing = {
    outlineColor: P.teal,
  }

  return (
    <section
      id="skin-plan"
      aria-labelledby="skin-plan-heading"
      /* `ink-body` as well as the background: without a container ink the
         section inherits the page's body grey, which is a bluer tone than the
         brand body colour. It used to be an inline `color: P.body`. */
      className="section-y ink-body relative"
      style={{ background: P.ground }}
    >
      <div ref={ref} className="shell">
        <div className="measure-header" style={{ marginInline: '0 auto' }}>
          <m.p className="text-eyebrow" {...rise(0)}>
            My Skincare Plan
          </m.p>
          <h2 ref={headingRef} id="skin-plan-heading" className="text-statement mt-4">
            A routine built around your skin.
          </h2>
          <m.p
            className="text-lead measure-body mt-5"
            {...rise(0.12)}
          >
            SkinTrix turns your latest skin analysis into a personalized plan built around the
            active ingredients your skin needs.
          </m.p>
          <m.p
            className="text-eyebrow ink-muted mt-6 flex items-center gap-2"
            {...rise(0.18)}
          >
            <LuSparkles aria-hidden className="h-3.5 w-3.5" style={{ color: P.teal }} />
            Tap a date or an ingredient to explore the plan
          </m.p>
        </div>

        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-12">
          {/* ── the calendar panel ─────────────────────────────────────── */}
          <m.div
            className="overflow-clip lg:col-span-7 lg:row-span-2"
            style={PANEL}
            {...rise(0.24)}
          >
            {/* Month header + toggle + week strip: one white card. */}
            <div data-card style={CARD}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous week"
                    onClick={() => stepWeek(-1)}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                    style={{ background: P.tint, color: P.body, ...focusRing }}
                  >
                    <LuChevronLeft aria-hidden className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next week"
                    onClick={() => stepWeek(1)}
                    className="grid h-8 w-8 cursor-pointer place-items-center rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                    style={{ background: P.tint, color: P.body, ...focusRing }}
                  >
                    <LuChevronRight aria-hidden className="h-4 w-4" />
                  </button>
                  <span
                    className="type-body ink-heading ml-1 flex items-center gap-2"
                  >
                    <LuCalendar aria-hidden className="h-4 w-4" style={{ color: P.body }} />
                    {monthLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={goToday}
                  className="type-legal ink-heading cursor-pointer rounded-btn px-3.5 py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                  style={{
                    background: P.white,
                    border: `1px solid ${P.hairline}`,
                    ...focusRing,
                  }}
                >
                  Today
                </button>
              </div>

              {/* The track carries the tint; the active segment is teal. */}
              <div
                role="group"
                aria-label="Choose part of day"
                className="mt-4 flex gap-2 rounded-full p-1"
                style={{ background: P.tint }}
              >
                {(['morning', 'evening'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={slot === k}
                    onClick={() => setSlot(k)}
                    className={`type-body ${slot === k ? 'ink-invert' : 'ink-body'} flex-1 cursor-pointer rounded-full py-2.5 capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2`}
                    style={{
                      background: slot === k ? P.teal : 'transparent',
                      ...focusRing,
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* The date strip — seven real buttons. */}
              <div
                role="group"
                aria-label="Select a date"
                className="mt-4 flex justify-between gap-0.5"
              >
                {week.map((day, i) => {
                  const d = fromIso(day)
                  const isSel = day === selectedDate
                  const dots = Math.min(3, countOn(day))
                  return (
                    <button
                      key={day}
                      ref={(el) => {
                        dayRefs.current[i] = el
                      }}
                      type="button"
                      aria-pressed={isSel}
                      /* The visible text is only "Mon 3", so the full date has
                         to be spoken. */
                      aria-label={`${WEEKDAYS[(d.getDay() + 6) % 7]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`}
                      onClick={() => setSelectedDate(day)}
                      onKeyDown={(e) => onStripKey(e, i)}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-0.5 py-2.5 transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                      style={{
                        background: isSel ? P.teal : 'transparent',
                        borderRadius: '16px',
                        ...focusRing,
                      }}
                    >
                      <span
                        className={`type-legal ${isSel ? 'ink-invert' : 'ink-muted'}`}
                      >
                        {SHORT[i]}
                      </span>
                      <span
                        className={`type-body ${isSel ? 'ink-invert' : 'ink-heading'}`}
                      >
                        {d.getDate()}
                      </span>
                      {/* One dot per item, capped at three. A day with nothing
                          scheduled shows none — the row is not padded out. */}
                      <span aria-hidden className="flex h-1 gap-0.5">
                        {Array.from({ length: dots }, (_, k) => (
                          <span
                            key={k}
                            className="h-1 w-1 rounded-full"
                            style={{
                              background: isSel ? P.white : P.teal,
                              opacity: isSel ? 0.7 : 0.45,
                            }}
                          />
                        ))}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Agenda header. */}
            <div className="mt-5 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="type-legal ink-muted">
                  Agenda
                </p>
                <p
                  className="type-card-title ink-heading mt-2"
                >
                  {agendaHeading}
                </p>
              </div>
              <span
                className="type-legal ink-accent flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2"
                style={{ background: P.tealTint }}
              >
                <LuCalendar aria-hidden className="h-3.5 w-3.5" />
                {countOn(selectedDate)} events
              </span>
            </div>

            {/* The reserve is sized to the FULLEST day, not to a round number.
                At 19rem it sat below the natural height of a three-row day, so
                picking an empty day shrank the region by 64px and dragged the
                rest of the page up with it — measured, not guessed. Narrow
                screens need more because the rows wrap. */}
            <div
              id={`${baseId}-agenda`}
              aria-live="polite"
              className="mt-4 min-h-[29.75rem] sm:min-h-[25.5rem]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.ul
                  key={`${selectedDate}-${slot}`}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="space-y-3"
                >
                  {items.length === 0 ? (
                    <li>
                      <p className="type-body ink-muted">
                        No items scheduled for this {slot === 'morning' ? 'morning' : 'evening'}.
                      </p>
                    </li>
                  ) : (
                    items.map((entry, idx) => {
                      const ing = INGREDIENTS[entry.name]
                      const isSel = featuredName === entry.name
                      const dimmed =
                        focusConcern !== null && !ing.treats.includes(focusConcern)
                      return (
                        <li key={entry.name + entry.time}>
                          <m.button
                            type="button"
                            aria-pressed={isSel}
                            onClick={() => setSelectedName(entry.name)}
                            animate={{ opacity: dimmed ? 0.4 : 1 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            data-card
                            className="w-full cursor-pointer text-left transition-shadow duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                            style={{
                              ...(isSel ? CARD_SELECTED : CARD),
                              /* Unselected rows carried no shadow before, and
                                 they carry none now — the hairline separates
                                 them. Stated explicitly so the spread above
                                 cannot leak a shadow in from CARD_SELECTED. */
                              boxShadow: isSel ? CARD_SELECTED.boxShadow : 'none',
                              ...focusRing,
                            }}
                          >
                            <span className="flex items-start gap-3">
                              <span
                                aria-hidden
                                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                                style={{ background: tile(idx).bg, color: tile(idx).fg }}
                              >
                                <ing.Icon className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className="type-card-title ink-heading block"
                                >
                                  {entry.name}
                                </span>
                                <span
                                  className="type-small mt-1 block"
                                >
                                  {entry.subtitle}
                                </span>
                              </span>
                              <span
                                className="type-legal ink-heading flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5"
                                style={{ background: P.tint }}
                              >
                                <LuClock aria-hidden className="h-3.5 w-3.5" style={{ color: P.body }} />
                                {entry.time}
                              </span>
                            </span>

                            <span className="mt-3 flex flex-wrap items-center gap-2 pl-14">
                              <span
                                className="type-legal ink-body flex items-center gap-1.5 rounded-full px-2.5 py-1.5 capitalize"
                                style={{
                                  background: 'transparent',
                                  border: `1px solid ${P.hairline}`,
                                }}
                              >
                                <LuTag aria-hidden className="h-3 w-3" style={{ color: P.muted }} />
                                {entry.slot}
                              </span>
                              <span
                                className="type-legal ink-body flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
                                style={{
                                  background: 'transparent',
                                  border: `1px solid ${P.hairline}`,
                                }}
                              >
                                <LuRepeat aria-hidden className="h-3 w-3" style={{ color: P.muted }} />
                                Daily
                              </span>
                            </span>
                          </m.button>
                        </li>
                      )
                    })
                  )}
                </m.ul>
              </AnimatePresence>
            </div>
          </m.div>

          {/* ── the detail panel ───────────────────────────────────────── */}
          {/* The reserve here is measured, not chosen. Across every day, slot
              and row this panel runs 333–349px at 1440, 349–371px at 1024 and
              371–394px at 375 — and drops to 203px (93px on a phone) when the
              slot is empty and it falls back to one line. Without a floor,
              picking an empty evening moved everything below it by up to
              307px. 25rem covers the worst case; the lg floor is 23.5rem
              because 1024 wraps harder than 1440 does. */}
          <m.div
            className="min-h-[25rem] lg:col-span-5 lg:min-h-[23.5rem]"
            style={PANEL}
            {...rise(0.32)}
            aria-live="polite"
          >
            {featured && featuredName ? (
              <>
                <div className="flex items-start gap-3.5">
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                    style={{ background: tile(featuredIndex).bg, color: tile(featuredIndex).fg }}
                  >
                    <featured.Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-eyebrow">
                      {slot}
                    </p>
                    <h3
                      className="type-card-title ink-heading mt-1"
                    >
                      {featuredName}
                    </h3>
                  </div>
                </div>

                <dl className="mt-5 space-y-3.5">
                  {(
                    [
                      ['Target', featured.target],
                      ["Why it's recommended", featured.insight],
                      ['What it does', featured.role],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt
                        className="type-eyebrow ink-muted"
                      >
                        {label}
                      </dt>
                      <dd className="type-small mt-1.5">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Decoration, not a link. It used to be <a href="#skin-plan">,
                    pointing at the section it already sits in, so it went
                    nowhere — and there is no insight view to send anyone to. */}
                <span
                  aria-hidden="true"
                  className="type-legal ink-accent mt-5 inline-flex items-center gap-1.5"
                >
                  View skin insight
                  <LuArrowRight className="h-3.5 w-3.5" />
                </span>
              </>
            ) : (
              <p className="type-body ink-muted">
                Select an ingredient to see why it&rsquo;s recommended.
              </p>
            )}
          </m.div>

          {/* ── the analysis panel ─────────────────────────────────────── */}
          <m.div className="lg:col-span-5" style={PANEL} {...rise(0.4)}>
            <h3
              className="type-card-title ink-heading"
            >
              Skin analysis
            </h3>

            <ul className="mt-4 space-y-2.5">
              {CONCERNS.map((c, ci) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocusConcern(c.label)}
                    onMouseLeave={() => setFocusConcern(null)}
                    onFocus={() => setFocusConcern(c.label)}
                    onBlur={() => setFocusConcern(null)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                    style={{ background: 'transparent', ...focusRing }}
                  >
                    {/* The arrow direction carries the meaning; the tile follows
                        the same rotation as the plan rows. No red or green. */}
                    <span
                      aria-hidden
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                      style={{ background: tile(ci).bg, color: tile(ci).fg }}
                    >
                      {c.dir === 'up' ? (
                        <LuTrendingUp className="h-4 w-4" />
                      ) : (
                        <LuTrendingDown className="h-4 w-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="type-body ink-heading block"
                      >
                        {c.label}
                      </span>
                      <span
                        className="type-legal ink-body mt-1 block"
                      >
                        {c.status}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div
              className="mt-5 flex items-center justify-between gap-3 pt-4"
              style={{ borderTop: `1px solid ${P.hairline}` }}
            >
              <div>
                <p
                  className="type-body ink-heading"
                >
                  Your latest scan
                </p>
                <p className="type-legal ink-body mt-2">
                  2 skin insights changed
                </p>
              </div>
              <button
                type="button"
                aria-expanded={showChanges}
                aria-controls={`${baseId}-changes`}
                onClick={() => setShowChanges((v) => !v)}
                className="type-legal ink-heading inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-btn transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2"
                style={{
                  background: P.tint,
                  padding: '10px 18px',
                  ...focusRing,
                }}
                /* Hover clears the inline colour rather than writing the rest
                   ink back, so `ink-heading` stays the single source of it. */
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = P.tealTint
                  e.currentTarget.style.color = P.teal
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = P.tint
                  e.currentTarget.style.color = ''
                }}
              >
                {showChanges ? 'Hide changes' : 'View changes'}
                <LuArrowRight aria-hidden className="h-3 w-3" />
              </button>
            </div>

            <AnimatePresence initial={false}>
              {showChanges && (
                <m.div
                  id={`${baseId}-changes`}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div data-card className="mt-4" style={CARD}>
                    <p
                      className="type-card-title ink-heading"
                    >
                      Your plan was updated
                    </p>
                    <p className="type-small mt-1.5">
                      Your latest scan detected changes in:
                    </p>

                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {CHANGES.map((c, xi) => (
                        <li
                          key={c.label}
                          className="flex items-center gap-3.5"
                          style={CARD}
                        >
                          <span
                            aria-hidden
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                            style={{ background: tile(xi).bg, color: tile(xi).fg }}
                          >
                            {c.dir === 'up' ? (
                              <LuTrendingUp className="h-4 w-4" />
                            ) : (
                              <LuTrendingDown className="h-4 w-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className="type-body ink-heading block"
                            >
                              {c.label}
                            </span>
                            <span
                              className="type-legal ink-body mt-1 block"
                            >
                              {c.note}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="type-small mt-4">
                      Your active-ingredient recommendations were adjusted accordingly.
                    </p>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </div>
      </div>
    </section>
  )
}
