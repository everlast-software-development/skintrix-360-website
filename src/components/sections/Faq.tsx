import { useState } from 'react'
import { useTextReveal } from '@/hooks/useTextReveal'

/**
 * Faq — a centred header over an accordion.
 *
 * Replaces the chat-thread layout: the bubbles, avatars, bot icons and
 * alternating alignment are gone. The heading and its subtitle sit centred at
 * the top of the card, with the list beneath.
 *
 * The open/close animation is a `grid-template-rows` transition from `0fr` to
 * `1fr` rather than a measured `max-height`. Grid interpolates to the panel's
 * real content height, so there is no magic number to keep in sync with the
 * copy, and no jump when an answer happens to be taller than the guess.
 *
 * The toggle is one glyph, not two swapped: a plus rotated 45° IS a cross, so
 * the icon turns into its own open state over 200ms instead of cutting.
 *
 * Colours follow the site's tokens rather than the neutral greys in the brief
 * (#17171A / #8A8A93 / #6B6B72). The site's ink is a navy ramp, and a second
 * near-black would read as a different system on the same page. The divider
 * and the card ground, which are structural rather than type, stay literal.
 */

export type FaqItem = {
  question: string
  answer: string
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: 'What is SkinTrix 360?',
    answer:
      'SkinTrix 360 is an AI-powered skin intelligence platform that analyzes facial images to provide detailed insights into multiple skin parameters.',
  },
  {
    question: 'How does SkinTrix work?',
    answer:
      'A facial image is captured and processed using AI-powered computer vision. The platform analyzes relevant skin features and presents the results as clear visual insights.',
  },
  {
    question: 'What can SkinTrix analyze?',
    answer:
      'SkinTrix analyzes 15+ skin parameters, including acne, pigmentation, redness, wrinkles, pores, texture, hydration, sebum, skin type, and signs of skin aging.',
  },
  {
    question: 'Can I track my skin over time?',
    answer:
      'Yes. SkinTrix is designed to help users and clinics compare skin assessments over time and monitor visible changes.',
  },
  {
    question: 'Is SkinTrix designed for clinics?',
    answer:
      'Yes. SkinTrix 360 is designed for dermatologists, aesthetic clinics, and other professionals who want to incorporate AI-powered skin analysis into their workflow.',
  },
]

export function Faq({ items = DEFAULT_ITEMS }: { items?: FaqItem[] }) {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  /** Index of the one open row, or null. Null on first render. */
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="w-full overflow-x-clip py-[clamp(3rem,6vw,5rem)]"
      style={{ background: '#F5F6FD' }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[769px]:px-6">
        <div className="rounded-[24px] bg-white px-5 py-7 min-[769px]:rounded-[40px] min-[769px]:p-10 min-[1025px]:px-16 min-[1025px]:py-14">
          <div>
            {/* ── the header, centred over the list ────────────────────── */}
            <div className="mb-8 text-center min-[769px]:mb-11">
              <h2 ref={headingRef} id="faq-heading" className="type-h2 measure-header">
                FAQ
              </h2>
              <p
                className="text-lead mx-auto mt-4 max-w-[420px]"
              >
                Everything you need to know about AI-powered skin intelligence.
              </p>
            </div>

            {/* ── the accordion ────────────────────────────────────────────
                Capped and centred rather than run to the card's full inner
                width: at 1200px the rows would be ~1070px across, which is a
                long way for the eye to travel from a question to its toggle. */}
            <ul className="mx-auto w-full max-w-[760px]">
              {items.map((item, i) => {
                const open = openIndex === i
                const buttonId = `faq-q-${i}`
                const panelId = `faq-a-${i}`

                return (
                  <li
                    key={item.question}
                    /* Rule between rows only — never above the first or below
                       the last, so the list reads as separated rather than
                       boxed. */
                    className={i > 0 ? 'border-t' : undefined}
                    style={i > 0 ? { borderColor: '#EAEAEC' } : undefined}
                  >
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={open}
                      aria-controls={panelId}
                      /* Opening a row closes whichever was open; clicking the
                         open row closes it. */
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 rounded-sm border-none bg-transparent py-[18px] text-left focus-visible:outline-2 focus-visible:outline-offset-2 min-[769px]:py-[22px]"
                      style={{ outlineColor: 'var(--text)' }}
                    >
                      <span
                        className="type-h3"
                      >
                        {item.question}
                      </span>

                      {/* One glyph. A plus turned 45° is a cross, so the icon
                          becomes its open state instead of being swapped. */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className={`h-[22px] w-[22px] shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none ${
                          open ? 'rotate-45' : 'rotate-0'
                        }`}
                        style={{ color: 'var(--text)' }}
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      aria-hidden={!open}
                      inert={!open}
                      className="grid transition-[grid-template-rows] duration-[250ms] ease-out motion-reduce:transition-none"
                      style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                    >
                      {/* The clipping row. `grid-template-rows: 0fr` collapses
                          this to zero height; the overflow hides the text
                          while it does. */}
                      <div className="overflow-hidden">
                        <p
                          className="type-body max-w-[620px] pb-6"
                        >
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
