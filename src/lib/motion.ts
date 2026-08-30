import type { MotionProps, Transition } from 'framer-motion'

export type Variants = NonNullable<MotionProps['variants']>

/** The one easing curve the whole page uses. Consistency is the luxury. */
export const EASE = [0.16, 1, 0.3, 1] as const

export const transition = (duration = 0.9, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
})

/** Viewport trigger shared by every scroll reveal, so cadence never varies. */
export const VIEWPORT = { once: true, amount: 0.25, margin: '0px 0px -12% 0px' } as const

/**
 * Variants read their delay from `custom`, which Framer also hands down to
 * children — so a stagger parent and a one-off reveal use the same objects.
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: transition(0.9, delay) }),
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  show: (delay = 0) => ({ opacity: 1, scale: 1, y: 0, transition: transition(1.1, delay) }),
}

export const stagger = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})
