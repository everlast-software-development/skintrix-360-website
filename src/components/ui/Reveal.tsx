import type { ReactNode } from 'react'
import { m } from 'framer-motion'

import { VIEWPORT, fadeUp, type Variants } from '@/lib/motion'

type RevealTag = 'div' | 'section' | 'header' | 'footer' | 'li' | 'p' | 'span'

type RevealProps = {
  children: ReactNode
  as?: RevealTag
  className?: string
  delay?: number
  variants?: Variants
  id?: string
  'aria-labelledby'?: string
}

/**
 * The page's single scroll-reveal primitive. Everything enters the same way,
 * at the same speed, from the same distance — that repetition is what makes a
 * long scroll feel composed rather than busy.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  delay = 0,
  variants = fadeUp,
  ...rest
}: RevealProps) {
  const Component = m[as]

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={variants}
      custom={delay}
      {...rest}
    >
      {children}
    </Component>
  )
}
