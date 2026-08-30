import * as React from 'react'
import type { MotionValue } from 'framer-motion'

/**
 * Scroll progress shared by `ContainerScroll` and everything composed inside
 * it.
 *
 * Its own module so the component file stays components-only — mixing a hook
 * export in there costs Fast Refresh, which stops re-rendering that file's
 * components on edit.
 */
export interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>
  reduced: boolean
}

export const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined)

/** Read the enclosing `ContainerScroll`'s progress. */
export function useContainerScroll() {
  const context = React.useContext(ContainerScrollContext)
  if (!context) {
    throw new Error('useContainerScroll must be used within a ContainerScroll component')
  }
  return context
}
