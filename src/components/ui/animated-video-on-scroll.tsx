import * as React from 'react'
import {
  type HTMLMotionProps,
  type Variants,
  m,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'

import { cn } from '@/lib/cn'
import { ContainerScrollContext, useContainerScroll } from '@/components/ui/container-scroll-context'

/**
 * Scroll-driven video primitives.
 *
 * Ported from a shadcn block written against `motion/react`. Four things
 * changed, none of them cosmetic:
 *
 *  - `motion.*` throws under this app's `LazyMotion strict`; `m` is the
 *    strict-safe equivalent, and it is what the rest of the codebase uses.
 *  - `motion/react` is the newer name for the same library. This project has
 *    `framer-motion` v13, which exports every hook this needs, so nothing was
 *    installed.
 *  - `cn` comes from `@/lib/cn`, not shadcn's `@/lib/utils`.
 *  - Reduced motion is honoured: the original scrubs regardless, which is a
 *    full-screen scaling video for someone who asked for less movement. Every
 *    transform below collapses to its resting value instead.
 */

const SPRING_TRANSITION_CONFIG = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
}

const variants: Variants = {
  hidden: { filter: 'blur(10px)', opacity: 0 },
  visible: { filter: 'blur(0px)', opacity: 1 },
}

export const ContainerScroll: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start center', 'end end'],
  })

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress, reduced }}>
      <div ref={scrollRef} className={cn('relative min-h-svh w-full', className)} {...props}>
        {children}
      </div>
    </ContainerScrollContext.Provider>
  )
}
ContainerScroll.displayName = 'ContainerScroll'

interface ContainerAnimatedProps extends HTMLMotionProps<'div'> {
  inputRange?: number[]
  outputRange?: number[]
}

export const ContainerAnimated = React.forwardRef<HTMLDivElement, ContainerAnimatedProps>(
  (
    { className, transition, style, inputRange = [0.2, 0.8], outputRange = [80, 0], ...props },
    ref,
  ) => {
    const { scrollYProgress, reduced } = useContainerScroll()
    const y = useTransform(scrollYProgress, inputRange, reduced ? [0, 0] : outputRange)

    return (
      <m.div
        ref={ref}
        className={cn('', className)}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ y, ...style }}
        transition={{ ...SPRING_TRANSITION_CONFIG, ...transition }}
        {...props}
      />
    )
  },
)
ContainerAnimated.displayName = 'ContainerAnimated'

export const ContainerSticky = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('sticky top-0 left-0 min-h-svh w-full', className)} {...props} />
  ),
)
ContainerSticky.displayName = 'ContainerSticky'

export const HeroVideo = React.forwardRef<HTMLVideoElement, HTMLMotionProps<'video'>>(
  // `transition` is pulled out and dropped, as in the source: these two
  // components drive themselves off scroll and a caller-supplied transition
  // would fight the scrub.
  ({ style, className, transition: _transition, ...props }, ref) => {
    const { scrollYProgress, reduced } = useContainerScroll()
    const scale = useTransform(scrollYProgress, [0, 0.8], reduced ? [1, 1] : [0.7, 1])

    return (
      <m.video
        ref={ref}
        className={cn('relative z-10 size-auto max-h-full max-w-full', className)}
        autoPlay
        muted
        loop
        playsInline
        style={{ scale, ...style }}
        {...props}
      />
    )
  },
)
HeroVideo.displayName = 'HeroVideo'

interface ContainerInsetProps extends HTMLMotionProps<'div'> {
  insetYRange?: [number, number]
  insetXRange?: [number, number]
  roundednessRange?: [number, number]
}

export const ContainerInset = React.forwardRef<HTMLDivElement, ContainerInsetProps>(
  (
    {
      className,
      style,
      insetYRange = [45, 0],
      insetXRange = [45, 0],
      roundednessRange = [1000, 16],
      transition: _transition,
      ...props
    },
    ref,
  ) => {
    const { scrollYProgress, reduced } = useContainerScroll()

    const insetY = useTransform(scrollYProgress, [0, 0.8], reduced ? [0, 0] : insetYRange)
    const insetX = useTransform(scrollYProgress, [0, 0.8], reduced ? [0, 0] : insetXRange)
    const roundedness = useTransform(
      scrollYProgress,
      [0, 1],
      reduced ? [roundednessRange[1], roundednessRange[1]] : roundednessRange,
    )

    const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`

    return (
      <m.div
        ref={ref}
        // The original had a typo here — `relateive`, which is not a class and
        // silently did nothing.
        className={cn('relative overflow-hidden', className)}
        style={{ clipPath, ...style }}
        {...props}
      />
    )
  },
)
ContainerInset.displayName = 'ContainerInset'
