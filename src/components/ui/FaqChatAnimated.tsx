import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * FaqChatAnimated — the FAQ as a conversation that plays itself.
 *
 * Self-contained: no animation library, no storage, no external assets. The
 * keyframes live in a scoped <style> tag rather than the global sheet so the
 * component can be dropped anywhere without a stylesheet edit.
 *
 * Sequencing is a single timeout chain driven from `step`, which indexes a
 * flat list of beats. That keeps "question → pause → typing → answer" honest
 * to read and trivial to replay: reset the index and the chain restarts.
 */

type Turn = { q: string; a: string }

const TURNS: Turn[] = [
  {
    q: 'What is SkinTrix 360?',
    a: 'SkinTrix 360 is an AI-powered skin intelligence platform that analyzes facial images to provide detailed insights into multiple skin parameters.',
  },
  {
    q: 'How does SkinTrix work?',
    a: 'A facial image is captured and processed using AI-powered computer vision. The platform analyzes relevant skin features and presents the results as clear visual insights.',
  },
  {
    q: 'What can SkinTrix analyze?',
    a: 'SkinTrix analyzes 15+ skin parameters, including acne, pigmentation, redness, wrinkles, pores, texture, hydration, sebum, skin type, and signs of skin aging.',
  },
  {
    q: 'Can I track my skin over time?',
    a: 'Yes. SkinTrix is designed to help users and clinics compare skin assessments over time and monitor visible changes.',
  },
  {
    q: 'Is SkinTrix designed for clinics?',
    a: 'Yes. SkinTrix 360 is designed for dermatologists, aesthetic clinics, and other professionals who want to incorporate AI-powered skin analysis into their workflow.',
  },
]

/** One flat list of beats: ask, think, answer, ask, think, answer … */
type Beat = { kind: 'q' | 'typing' | 'a'; turn: number }
const BEATS: Beat[] = TURNS.flatMap((_, i) => [
  { kind: 'q' as const, turn: i },
  { kind: 'typing' as const, turn: i },
  { kind: 'a' as const, turn: i },
])

/** How long to hold before moving to the next beat. */
const HOLD: Record<Beat['kind'], number> = {
  q: 600,      // beat after a question lands
  typing: 900, // the assistant "thinking"
  a: 1100,     // longer breath before the next question
}

const SPRING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Stamps for each turn — fixed, so the thread reads identically every time. */
const CLOCK = ['09:41', '09:42', '09:43', '09:45', '09:46']

/** WhatsApp's double check. Grey until the message is read, then blue. */
function Ticks({ read }: { read: boolean }) {
  return (
    <svg
      viewBox="0 0 18 12"
      aria-hidden
      className="h-3 w-4 shrink-0 transition-colors duration-300"
      style={{ color: read ? '#34B7F1' : 'rgba(255,255,255,0.55)' }}
    >
      <path
        d="M1 6.5 4 9.5 10 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 6.5 10 9.5 16 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The line under a bubble: time, plus ticks on the visitor's own messages. */
function Meta({ time, side, read }: { time: string; side: 'left' | 'right'; read?: boolean }) {
  return (
    <span
      className={
        'mt-1 flex items-center gap-1 px-1 text-[0.6875rem] leading-none text-white/70 ' +
        (side === 'right' ? 'justify-end' : 'justify-start')
      }
    >
      {time}
      {side === 'right' && <Ticks read={!!read} />}
    </span>
  )
}

const KEYFRAMES = `
@keyframes stxDrift {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes stxRise {
  0%   { opacity: 0; transform: translateY(16px) scale(0.96); }
  70%  { opacity: 1; transform: translateY(-2px) scale(1.006); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes stxDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30%           { transform: translateY(-5px); opacity: 1; }
}
@keyframes stxGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
  50%      { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
}
@media (prefers-reduced-motion: reduce) {
  .stx-rise, .stx-drift, .stx-dot, .stx-glow { animation: none !important; }
}
`

/** The assistant's mark: an abstract sphere of dots. */
function LogoAvatar({ glowing }: { glowing: boolean }) {
  return (
    <span
      className={
        'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white sm:h-11 sm:w-11 ' +
        (glowing ? 'stx-glow' : '')
      }
      style={glowing ? { animation: 'stxGlow 1.4s ease-in-out infinite' } : undefined}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="h-6 w-6 sm:h-7 sm:w-7">
        <circle cx="20" cy="20" r="15" fill="none" stroke="#1BB5A5" strokeWidth="1.4" />
        {[
          [20, 7], [27, 10], [31, 16], [31, 24], [27, 30], [20, 33],
          [13, 30], [9, 24], [9, 16], [13, 10],
          [20, 13], [25, 17], [23, 24], [17, 24], [15, 17],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i < 10 ? 1.5 : 2.1} fill={i < 10 ? '#5B6FE0' : '#1BB5A5'} />
        ))}
      </svg>
    </span>
  )
}

/** The visitor: a neutral disc with an initial, so nothing is hotlinked. */
function UserAvatar() {
  return (
    <span
      aria-hidden
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-slate-500 sm:h-11 sm:w-11"
    >
      S
    </span>
  )
}

/** Shared bubble chrome, with the notch pointing at its own avatar. */
function Bubble({
  side,
  children,
  animate,
  className = '',
}: {
  side: 'left' | 'right'
  children: React.ReactNode
  animate: boolean
  className?: string
}) {
  const left = side === 'left'
  return (
    <div
      className={
        'stx-rise relative bg-white text-slate-700 ' +
        (left ? 'rounded-2xl px-5 py-4' : 'rounded-full px-5 py-3') + ' ' + className
      }
      style={{
        boxShadow: '0 10px 24px -12px rgba(15,23,42,0.28)',
        animation: animate ? `stxRise 520ms ${SPRING} both` : undefined,
      }}
    >
      {children}
      {/* The tail: a small square rotated into a notch, tucked under the
          bubble so only its corner shows. */}
      <span
        aria-hidden
        className={
          'absolute bottom-3 h-3 w-3 rotate-45 bg-white ' + (left ? '-left-1' : '-right-1')
        }
      />
    </div>
  )
}

/** Three dots with a staggered bounce. */
function Typing() {
  return (
    <span className="flex items-center gap-1.5 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="stx-dot block h-2 w-2 rounded-full bg-slate-400"
          style={{ animation: `stxDot 1s ${SPRING} ${i * 0.16}s infinite` }}
        />
      ))}
    </span>
  )
}

export function FaqChatAnimated() {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)

  const [started, setStarted] = useState(false)
  // How many beats have played. `-1` is "nothing yet".
  const [step, setStep] = useState(-1)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Play only once the section is actually on screen.
  useEffect(() => {
    const el = rootRef.current
    if (!el || started) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  // The chain. Reduced motion skips straight to the end state.
  useEffect(() => {
    if (!started) return
    if (reduced) {
      setStep(BEATS.length - 1)
      return
    }
    if (step >= BEATS.length - 1) return

    const next = step + 1
    const delay = step === -1 ? 250 : HOLD[BEATS[step].kind]
    timer.current = window.setTimeout(() => setStep(next), delay)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [started, step, reduced])

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = scrollRef.current
    if (!el || step < 0) return
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [step, reduced])

  const replay = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current)
    setStep(-1)
    const el = scrollRef.current
    if (el) el.scrollTo({ top: 0, behavior: 'auto' })
    // A tick later so the reset renders before the chain restarts.
    window.setTimeout(() => setStarted(true), 20)
    setStarted(false)
  }, [])

  const visible = BEATS.slice(0, step + 1)
  const typingNow = step >= 0 && BEATS[step]?.kind === 'typing'

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden p-5 sm:p-8"
      style={{
        borderRadius: 28,
        backgroundImage: 'linear-gradient(135deg, #1BB5A5 0%, #3E92C6 52%, #5B6FE0 100%)',
        backgroundSize: '180% 180%',
        animation: reduced ? undefined : 'stxDrift 18s ease-in-out infinite',
      }}
    >
      <style>{KEYFRAMES}</style>

      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold tracking-wide text-white/90">Ask SkinTrix 360</p>
        <button
          type="button"
          onClick={replay}
          className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Replay
        </button>
      </div>

      <div
        ref={scrollRef}
        className="max-h-[26rem] space-y-4 overflow-y-auto pr-1 sm:max-h-[30rem]"
      >
        {visible.map((beat, i) => {
          const turn = TURNS[beat.turn]
          const fresh = i === visible.length - 1 && !reduced

          if (beat.kind === 'q') {
            // Read once the next beat has begun — "a beat after they send".
            const read = step > i
            return (
              <div key={`q${beat.turn}`} className="flex flex-col items-end">
                <div className="flex max-w-full items-end justify-end gap-2.5">
                  <Bubble side="right" animate={fresh} className="max-w-[78%] sm:max-w-md">
                    <p className="text-sm font-medium sm:text-base">{turn.q}</p>
                  </Bubble>
                  <UserAvatar />
                </div>
                <Meta time={CLOCK[beat.turn]} side="right" read={read} />
              </div>
            )
          }

          if (beat.kind === 'typing') {
            // Only while it is the live beat; the reply takes its place.
            if (i !== visible.length - 1) return null
            return (
              <div key={`t${beat.turn}`} className="flex items-end gap-2.5">
                <LogoAvatar glowing />
                <Bubble side="left" animate={fresh} className="px-4 py-3">
                  <Typing />
                </Bubble>
              </div>
            )
          }

          return (
            <div key={`a${beat.turn}`} className="flex flex-col items-start">
              <div className="flex max-w-full items-end gap-2.5">
                <LogoAvatar glowing={false} />
                <Bubble side="left" animate={fresh} className="max-w-[86%] sm:max-w-lg">
                  <p className="text-sm leading-relaxed sm:text-base">{turn.a}</p>
                </Bubble>
              </div>
              <span className="ml-[3.25rem] sm:ml-[3.5rem]">
                <Meta time={CLOCK[beat.turn]} side="left" />
              </span>
            </div>
          )
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {typingNow ? 'SkinTrix is typing' : ''}
      </p>
    </div>
  )
}

export default FaqChatAnimated
