import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'
import { EASE } from '@/lib/motion'

/**
 * FaqConversation — the FAQ as a SkinTrix 360 chat thread.
 *
 * Every message is rendered and stays rendered: questions right in the
 * visitor's voice, answers left under the SkinTrix identity. Nothing
 * collapses, nothing hides behind a control — the whole exchange is scannable
 * on arrival. The only motion is a one-time staggered entrance.
 *
 * `motion.*` would throw under this app's `LazyMotion strict`, so every
 * animated node here is `m`.
 */

export interface FAQItem {
  id: number
  question: string
  answer: string
}

export interface FaqConversationProps {
  data: FAQItem[]
  className?: string
}

type Message = { role: 'user' | 'assistant'; text: string; key: string }

/** The soft lift the reference bubbles carry. */
const BUBBLE_SHADOW = ''

/** The official SkinTrix identity. */
const ICON_SRC = '/SkinTrix360.webp'
const ICON_W = 231
const ICON_H = 237

/**
 * The brand mark on a plain white disc.
 *
 * The asset is already a circular teal ring on transparency, so it needs a
 * neutral ground rather than a gradient to sit against — and its own
 * proportions are kept (`object-contain`, not stretched to the circle).
 */
function BrandAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface p-1.5 ring-1 ring-[color:rgb(9_24_56_/_0.06)]',
        className,
      )}
    >
      <img
        src={ICON_SRC}
        alt=""
        width={ICON_W}
        height={ICON_H}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full object-contain"
      />
    </span>
  )
}

/** The visitor, from a portrait already in the project. */
function UserAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block shrink-0 overflow-hidden rounded-full bg-surface ring-[3px] ring-[color:rgb(255_255_255_/_0.92)]',
        className,
      )}
    >
      <img
        src="/image-2.webp"
        alt=""
        width={1536}
        height={2752}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full object-cover object-[50%_16%]"
      />
    </span>
  )
}

/**
 * The two-dot tail trailing toward the speaker's avatar.
 *
 * Both dots anchor to the bubble itself. An intermediate wrapper would be a
 * zero-width box at the end of the text, and the offsets would resolve against
 * that instead of the bubble — putting the tail on the wrong side.
 */
function Tail({ side }: { side: 'left' | 'right' }) {
  const onRight = side === 'right'
  return (
    <>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute bottom-2 block h-4 w-4 rounded-full bg-surface',
          onRight ? '-right-1.5' : '-left-1.5',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -bottom-1 block h-2 w-2 rounded-full bg-surface',
          onRight ? '-right-4' : '-left-4',
        )}
      />
    </>
  )
}

export function FaqConversation({ data, className }: FaqConversationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.08 })
  const show = reduced || inView

  // Question then answer, in order — one flat thread.
  const messages: Message[] = data.flatMap((item) => [
    { role: 'user' as const, text: item.question, key: `q-${item.id}` },
    { role: 'assistant' as const, text: item.answer, key: `a-${item.id}` },
  ])

  return (
    <div
      ref={ref}
      className={cn(
        // The conversation's ground: the wash the reference thread floats on,
        // held in one large rounded surface so the section reads as a single
        // chat area rather than loose bubbles.
        'relative overflow-hidden rounded-[2.5rem] px-4 py-10 sm:rounded-[3rem] sm:px-10 sm:py-14 lg:px-16 lg:py-16',
        // The thread sits on a saturated brand gradient rather than the
        // near-transparent white wash it had before.
        'bg-white ring-1 ring-[color:var(--line)]',
        className,
      )}
    >

      <ol>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user'
          return (
            <m.li
              key={msg.key}
              className={cn(
                'flex items-end gap-2.5 sm:gap-5',
                isUser && 'flex-row-reverse',
                // An answer hugs the question it replies to; the next question
                // opens a new turn, so the thread reads in pairs.
                i === 0 ? '' : isUser ? 'mt-10 sm:mt-14' : 'mt-4 sm:mt-5',
              )}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              // One pass on arrival, then it simply stays put.
              transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.09, ease: EASE }}
            >
              {isUser ? (
                <UserAvatar className="h-11 w-11 sm:h-16 sm:w-16" />
              ) : (
                <BrandAvatar className="h-12 w-12 sm:h-[4.5rem] sm:w-[4.5rem]" />
              )}

              <div
                className={cn(
                  'relative bg-surface px-6 py-5 sm:px-8 sm:py-6',
                  BUBBLE_SHADOW,
                  isUser
                    // Squared off on the corner facing its own avatar.
                    ? 'max-w-[20rem] rounded-[1.75rem] rounded-br-xl sm:max-w-[30rem]'
                    : 'max-w-[24rem] rounded-[1.75rem] rounded-bl-xl border border-[color:var(--brand-teal-100)] bg-[color:var(--brand-teal-50)] sm:max-w-[42rem] sm:py-7',
                )}
              >
                <p
                  className={cn(
                    'text-[1.0625rem] leading-[1.6] sm:text-[1.25rem] sm:leading-[1.65]',
                    isUser
                      ? 'font-semibold tracking-[-0.015em] text-ink'
                      : 'text-[color:var(--brand-navy-400)]',
                  )}
                >
                  {msg.text}
                </p>
                <Tail side={isUser ? 'right' : 'left'} />
              </div>
            </m.li>
          )
        })}
      </ol>
    </div>
  )
}
