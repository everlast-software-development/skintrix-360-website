import { useId, useRef, useState } from 'react'
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

/**
 * The plan, drawn as the app draws it.
 *
 * The large panel is a faithful rebuild of the real My Calendar screen — the
 * month header with its chevrons and Today control, the segmented toggle, the
 * week strip with a tall near-black pill on the selected day and coloured dots
 * beneath each date, the "Agenda" label over a bold date with a count chip, and
 * event rows carrying a tinted icon square, a time chip and tag pills. Every
 * one of those is componentry lifted from the screenshot rather than invented,
 * so the website shows the product a visitor will actually open.
 *
 * It is a rebuild, not an embedded screenshot, because it also has to work:
 *   analysis card → click a finding → the ingredients treating it highlight
 *   plan panel    → click an ingredient → the featured card explains it
 *   summary strip → the scan updates → the recommendations change
 *
 * SkinTrix recommends *active ingredients*, never products or brands, so every
 * row is an ingredient, what it targets, and the finding behind it.
 */

const TONES = {
  amber: 'bg-[#FEF4E4] text-[#D98A1F]',
  teal: 'bg-[color:var(--brand-teal-100)] text-[color:var(--brand-teal-600)]',
  indigo: 'bg-[#E8E9F9] text-[#5A62D6]',
  green: 'bg-[#E8F7ED] text-[#1FA45C]',
} as const

type Tone = keyof typeof TONES

const CONCERNS: { label: string; status: string; dir: 'up' | 'down'; tone: Tone }[] = [
  { label: 'Pigmentation', status: 'Detected', dir: 'up', tone: 'amber' },
  { label: 'Texture', status: 'Improving', dir: 'down', tone: 'green' },
  { label: 'Hydration', status: 'Needs attention', dir: 'up', tone: 'teal' },
]

type Ingredient = {
  name: string
  short: string
  /** Demo schedule, shown in the app's time-chip style. */
  time: string
  tag: string
  target: string
  treats: string[]
  insight: string
  role: string
  Icon: typeof LuSun
  tone: Tone
}

const PLAN: Record<'morning' | 'evening', Ingredient[]> = {
  morning: [
    {
      name: 'Vitamin C', short: 'For pigmentation', time: '7:00 AM', tag: 'Morning',
      target: 'Uneven skin tone', treats: ['Pigmentation'],
      insight: 'Pigmentation detected in your latest scan.',
      role: 'Brightening and antioxidant support through the day.',
      Icon: LuSparkles, tone: 'amber',
    },
    {
      name: 'Niacinamide', short: 'For uneven tone', time: '7:10 AM', tag: 'Morning',
      target: 'Uneven skin tone', treats: ['Pigmentation', 'Hydration'],
      insight: 'Pigmentation detected in your latest scan.',
      role: 'Supports a more even-looking complexion and helps strengthen the skin barrier.',
      Icon: LuAtom, tone: 'teal',
    },
    {
      name: 'SPF', short: 'Daily protection', time: '7:20 AM', tag: 'Morning',
      target: 'Sun exposure', treats: ['Pigmentation'],
      insight: 'Recommended alongside any pigmentation plan.',
      role: 'Daily protection, so the rest of the plan is not working against new exposure.',
      Icon: LuSun, tone: 'amber',
    },
  ],
  evening: [
    {
      name: 'Azelaic Acid', short: 'For pigmentation + redness', time: '9:00 PM', tag: 'Evening',
      target: 'Pigmentation and redness', treats: ['Pigmentation'],
      insight: 'Pigmentation and visible redness detected in your latest scan.',
      role: 'Works on uneven tone and visible redness at the same time.',
      Icon: LuAtom, tone: 'indigo',
    },
    {
      name: 'Hyaluronic Acid', short: 'For hydration', time: '9:10 PM', tag: 'Evening',
      target: 'Hydration', treats: ['Hydration'],
      insight: 'Lower hydration readings across the cheeks.',
      role: 'Helps the skin hold water, so the surface looks plumper and calmer overnight.',
      Icon: LuDroplet, tone: 'teal',
    },
    {
      name: 'Ceramides', short: 'For barrier support', time: '9:20 PM', tag: 'Evening',
      target: 'Skin barrier', treats: ['Hydration', 'Texture'],
      insight: 'Paired with actives to keep the barrier comfortable.',
      role: 'Helps the barrier stay resilient while stronger actives are in use.',
      Icon: LuShieldCheck, tone: 'green',
    },
  ],
}

/** The app's own week: Mon 3 through Sun 9, Tue 4 selected. */
const WEEK = [
  { day: 'Mon', date: 3, dots: ['#E8A33D', '#1FA45C', '#5A62D6'] },
  { day: 'Tue', date: 4, dots: ['#E8A33D', '#1FA45C', '#5A62D6'] },
  { day: 'Wed', date: 5, dots: ['#E8A33D', '#1FA45C', '#5A62D6'] },
  { day: 'Thu', date: 6, dots: ['#E8A33D', '#1FA45C', '#5A62D6'] },
  { day: 'Fri', date: 7, dots: ['#E8A33D', '#5A62D6'] },
  { day: 'Sat', date: 8, dots: ['#E8A33D', '#1FA45C', '#5A62D6'] },
  { day: 'Sun', date: 9, dots: ['#E8A33D', '#1FA45C'] },
]

const CHANGES = [
  { label: 'Pigmentation', note: 'Needs more attention', dir: 'up' as const },
  { label: 'Texture', note: 'Improving', dir: 'down' as const },
]

const WEEKDAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const ALL = [...PLAN.morning, ...PLAN.evening]


export function SkinPlan() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const show = reduced || inView
  const baseId = useId()

  const [mode, setMode] = useState<'morning' | 'evening'>('morning')
  const [day, setDay] = useState(1)
  const [selected, setSelected] = useState('Niacinamide')
  const [focus, setFocus] = useState<string | null>(null)
  const [showChanges, setShowChanges] = useState(false)

  const items = PLAN[mode]
  const featured = ALL.find((i) => i.name === selected) ?? PLAN.morning[1]

  const rise = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 14 },
    animate: show ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.65, delay: reduced ? 0 : delay, ease: EASE },
  })

  const card = 'rounded-[1.5rem] bg-surface p-5 ring-1 ring-[color:rgb(9_24_56_/_0.07)] sm:p-6'

  return (
    <section id="skin-plan" aria-labelledby="skin-plan-heading" className="section-y relative" style={{ background: 'var(--atm-cyan)' }}>
      <div ref={ref} className="shell">
        <div className="max-w-[38rem]">
          <m.p className="text-eyebrow text-teal-deep" {...rise(0)}>
            My Skincare Plan
          </m.p>
          <m.h2 id="skin-plan-heading" className="text-statement mt-4" {...rise(0.06)}>
            A routine built around your skin.
          </m.h2>
          <m.p className="mt-5 text-[0.9375rem] leading-[1.8] text-ink-soft" {...rise(0.12)}>
            SkinTrix turns your latest skin analysis into a personalized plan built around the
            active ingredients your skin needs.
          </m.p>
          <m.p className="text-eyebrow mt-6 flex items-center gap-2 text-ink-muted" {...rise(0.18)}>
            <LuSparkles aria-hidden className="h-3.5 w-3.5 text-teal-deep" />
            Tap an ingredient to see why it&rsquo;s recommended
          </m.p>
        </div>

        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-12">
          {/* The app screen, rebuilt. Light ground, white cards on top. */}
          <m.div
            className="overflow-clip rounded-[1.5rem] bg-[#F0F1F3] p-4 ring-1 ring-[color:rgb(9_24_56_/_0.07)] sm:p-5 lg:col-span-7 lg:row-span-2"
            {...rise(0.24)}
          >
            {/* Month header, as the app has it. */}
            <div className="rounded-[1.25rem] bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#F0F1F3] text-ink-soft">
                    <LuChevronLeft className="h-4 w-4" />
                  </span>
                  <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#F0F1F3] text-ink-soft">
                    <LuChevronRight className="h-4 w-4" />
                  </span>
                  <span className="ml-1 flex items-center gap-2 text-[0.9375rem] leading-none font-bold tracking-[-0.01em]">
                    <LuCalendar aria-hidden className="h-4 w-4 text-ink-soft" />
                    Aug 2026
                  </span>
                </div>
                <span className="rounded-full bg-surface px-3.5 py-2 text-[0.8125rem] leading-none font-semibold text-ink ring-1 ring-[color:rgb(9_24_56_/_0.1)]">
                  Today
                </span>
              </div>

              {/* Segmented control, near-black active — the app's Weekly/Monthly
                  treatment, carrying this section's Morning/Evening states. */}
              <div role="group" aria-label="Choose part of day" className="mt-4 flex gap-2">
                {(['morning', 'evening'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={mode === k}
                    onClick={() => setMode(k)}
                    className={
                      'flex-1 cursor-pointer rounded-full py-3 text-[0.9375rem] leading-none font-bold capitalize transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] ' +
                      (mode === k ? 'bg-ink text-white' : 'bg-[#F0F1F3] text-ink-soft hover:text-ink')
                    }
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Week strip: tall near-black pill on the selected day, dots under. */}
              <div role="group" aria-label="Choose a day" className="mt-4 flex justify-between gap-0.5">
                {WEEK.map((d, i) => (
                  <button
                    key={d.day}
                    type="button"
                    aria-pressed={day === i}
                    onClick={() => setDay(i)}
                    className={
                      'flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-full px-0.5 py-2.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] ' +
                      (day === i ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink')
                    }
                  >
                    <span className="text-[0.6875rem] leading-none font-semibold">{d.day}</span>
                    <span className={'text-[1rem] leading-none font-bold ' + (day === i ? 'text-white' : 'text-ink')}>
                      {d.date}
                    </span>
                    <span aria-hidden className="flex gap-0.5">
                      {d.dots.map((c, k) => (
                        <span
                          key={k}
                          className="h-1 w-1 rounded-full"
                          style={{ background: day === i ? '#FFFFFF' : c }}
                        />
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Agenda header, as the app has it. */}
            <div className="mt-5 flex items-end justify-between gap-3 px-1">
              <div>
                <p className="text-[0.8125rem] leading-none font-semibold text-ink-muted">Agenda</p>
                <p className="mt-2 text-[1.125rem] leading-none font-bold tracking-[-0.02em]">
                  {WEEKDAY[day]}, August {WEEK[day].date}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#DEF5F4] px-3 py-2 text-[0.8125rem] leading-none font-semibold text-[#118483]">
                <LuCalendar aria-hidden className="h-3.5 w-3.5" />
                {items.length} events
              </span>
            </div>

            {/* Event rows: icon square, title, time chip, tag pills. */}
            <div className="mt-4 min-h-[19rem]">
              <AnimatePresence mode="wait" initial={false}>
                <m.ul
                  key={mode}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="space-y-3"
                >
                  {items.map((ing) => {
                    const isSelected = selected === ing.name
                    const dimmed = focus !== null && !ing.treats.includes(focus)
                    return (
                      <li key={ing.name}>
                        <m.button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setSelected(ing.name)}
                          animate={{ opacity: dimmed ? 0.4 : 1 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className={
                            'w-full cursor-pointer rounded-[1.25rem] bg-surface p-4 text-left transition-shadow duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] ' +
                            (isSelected ? 'ring-2 ring-[color:var(--color-primary)]' : 'ring-1 ring-[color:rgb(9_24_56_/_0.05)] hover:ring-[color:rgb(9_24_56_/_0.14)]')
                          }
                        >
                          <span className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${TONES[ing.tone]}`}
                            >
                              <ing.Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[1.0625rem] leading-tight font-bold tracking-[-0.015em]">
                                {ing.name}
                              </span>
                              <span className="mt-1 block text-[0.875rem] leading-tight text-ink-soft">
                                {ing.short}
                              </span>
                            </span>
                            <span
                              className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.8125rem] leading-none font-semibold ${TONES[ing.tone]}`}
                            >
                              <LuClock aria-hidden className="h-3.5 w-3.5" />
                              {ing.time}
                            </span>
                          </span>

                          <span className="mt-3 flex flex-wrap items-center gap-2 pl-14">
                            <span
                              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.75rem] leading-none font-semibold ${TONES[ing.tone]}`}
                            >
                              <LuTag aria-hidden className="h-3 w-3" />
                              {ing.tag}
                            </span>
                            <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[0.75rem] leading-none font-medium text-ink-muted ring-1 ring-[color:rgb(9_24_56_/_0.1)]">
                              <LuRepeat aria-hidden className="h-3 w-3" />
                              Daily
                            </span>
                          </span>
                        </m.button>
                      </li>
                    )
                  })}
                </m.ul>
              </AnimatePresence>
            </div>
          </m.div>

          {/* Featured ingredient — the explanation for whatever is selected. */}
          <m.div className={`${card} lg:col-span-5`} {...rise(0.32)} aria-live="polite">
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${TONES[featured.tone]}`}
              >
                <featured.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-eyebrow text-ink-muted">{featured.tag}</p>
                <h3 className="mt-1 text-[1.375rem] leading-none font-bold tracking-[-0.025em]">
                  {featured.name}
                </h3>
              </div>
            </div>

            <dl className="mt-5 space-y-3.5">
              <div>
                <dt className="text-[0.75rem] leading-none font-semibold text-ink-muted uppercase">Target</dt>
                <dd className="mt-1.5 text-[0.875rem] leading-[1.6] text-ink-soft">{featured.target}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] leading-none font-semibold text-ink-muted uppercase">Why it's recommended</dt>
                <dd className="mt-1.5 text-[0.875rem] leading-[1.6] text-ink-soft">{featured.insight}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] leading-none font-semibold text-ink-muted uppercase">What it does</dt>
                <dd className="mt-1.5 text-[0.875rem] leading-[1.6] text-ink-soft">{featured.role}</dd>
              </div>
            </dl>

            <a
              href="#skin-plan"
              className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] leading-none font-semibold text-teal-deep transition-colors duration-300 hover:text-ink"
            >
              View skin insight
              <LuArrowRight aria-hidden className="h-3.5 w-3.5" />
            </a>
          </m.div>

          {/* Skin analysis — the concerns the plan above is built to treat, which
              is the link between insight and plan. */}
          <m.div className={`${card} lg:col-span-5`} {...rise(0.4)}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[1.0625rem] leading-none font-bold tracking-[-0.02em]">Skin analysis</h3>
            </div>

            <ul className="mt-4 space-y-2.5">
              {CONCERNS.map((c) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onMouseEnter={() => setFocus(c.label)}
                    onMouseLeave={() => setFocus(null)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-left transition-colors duration-300 hover:bg-canvas"
                  >
                    <span
                      aria-hidden
                      className={'grid h-9 w-9 shrink-0 place-items-center rounded-xl ' + TONES[c.tone]}
                    >
                      {c.dir === 'up' ? <LuTrendingUp className="h-4 w-4" /> : <LuTrendingDown className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] leading-tight font-bold tracking-[-0.01em]">{c.label}</span>
                      <span className="mt-1 block text-[0.8125rem] leading-tight text-ink-soft">{c.status}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-ink-line pt-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.9375rem] leading-tight font-bold tracking-[-0.01em]">Your latest scan</p>
                  <p className="mt-2 text-[0.8125rem] leading-none font-medium text-ink-soft">
                    2 skin insights changed
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={showChanges}
                  aria-controls={`${baseId}-changes`}
                  onClick={() => setShowChanges((v) => !v)}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2.5 text-[0.75rem] leading-none font-semibold text-ink transition-colors duration-300 hover:text-teal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
                >
                  {showChanges ? 'Hide changes' : 'View changes'}
                  <LuArrowRight aria-hidden className="h-3 w-3" />
                </button>
              </div>
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
                  <div className="mt-5 border-t border-ink-line pt-5">
                    <p className="text-[1rem] leading-tight font-bold tracking-[-0.015em]">
                      Your plan was updated
                    </p>
                    <p className="mt-1.5 text-[0.875rem] leading-[1.6] text-ink-soft">
                      Your latest scan detected changes in:
                    </p>

                    <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {CHANGES.map((c) => (
                        <li
                          key={c.label}
                          className="flex items-center gap-3.5 rounded-2xl bg-canvas p-3.5 ring-1 ring-[color:rgb(9_24_56_/_0.05)]"
                        >
                          <span
                            aria-hidden
                            className={'grid h-9 w-9 shrink-0 place-items-center rounded-xl ' + (c.dir === 'up' ? TONES.amber : TONES.green)}
                          >
                            {c.dir === 'up' ? <LuTrendingUp className="h-4 w-4" /> : <LuTrendingDown className="h-4 w-4" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[0.9375rem] leading-tight font-bold tracking-[-0.01em]">{c.label}</span>
                            <span className="mt-1 block text-[0.8125rem] leading-tight text-ink-soft">{c.note}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 text-[0.875rem] leading-[1.6] text-ink-soft">
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
