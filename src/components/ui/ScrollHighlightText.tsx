import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Text that reads itself as you scroll.
 *
 * Each word carries its own slice of the scroll range, so the paragraph
 * resolves from muted to full left-to-right rather than fading in as a block.
 * The whole string is present in the DOM from the start — this is colour, not
 * content, so nothing is hidden from a screen reader or from search.
 *
 * Word count is fixed for a given string, so the transforms are built once in
 * a child component per word: hooks stay unconditional and in stable order.
 */

function Word({
  children,
  progress,
  start,
  end,
  reduced,
}: {
  children: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  start: number
  end: number
  reduced: boolean
}) {
  const opacity = useTransform(progress, [start, end], [0.22, 1])
  return (
    <m.span style={reduced ? undefined : { opacity }} className="inline-block">
      {children}
    </m.span>
  )
}

export function ScrollHighlightText({
  text,
  className = '',
  /** Portion of the element's travel spent resolving the words. */
  from = 0.15,
  to = 0.7,
}: {
  text: string
  className?: string
  from?: number
  to?: number
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.4'],
  })

  const words = text.split(' ')
  const span = (to - from) / words.length

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <Word
            progress={scrollYProgress}
            start={from + i * span}
            end={from + i * span + span * 2.2}
            reduced={reduced}
          >
            {w}
          </Word>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </p>
  )
}
