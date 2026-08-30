import { useCallback, useEffect, useRef, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

/**
 * Pulls an element a little way toward the cursor and springs it home on exit.
 * Pointer-precision only: touch gets nothing, which is correct — there is no
 * hover to anticipate.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.32) {
  const ref = useRef<T | null>(null)
  const [enabled, setEnabled] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.5 })
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.5 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => setEnabled(fine.matches && !reduced.matches)
    sync()

    fine.addEventListener('change', sync)
    reduced.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      reduced.removeEventListener('change', sync)
    }
  }, [])

  const onPointerMove = useCallback(
    (event: React.PointerEvent<T>) => {
      if (!enabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
      y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
    },
    [enabled, strength, x, y],
  )

  const onPointerLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return { ref, x: springX, y: springY, onPointerMove, onPointerLeave }
}
