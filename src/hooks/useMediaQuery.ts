import { useEffect, useState } from 'react'

/**
 * ANSWERS CORRECTLY ON THE FIRST RENDER, which used to be its whole problem.
 *
 * It started `false` and only learned the truth in an effect, on the grounds
 * that there is no hydration to match. But "no hydration to match" is the
 * reason it can read the real value immediately, not a reason to guess: with
 * no server render there is no mismatch to avoid, and `matchMedia` is
 * available the moment the component runs.
 *
 * Guessing cost a whole extra mount of the hero. `Hero` picks its variant
 * from two of these, so the first paint of every session got `false, false` —
 * the phone layout — at every width, and the effect then swapped in the canvas
 * one a tick later. That is not a flicker; it is React unmounting a component
 * that has built a GSAP pin. The pin is killed, its `.pin-spacer` unwrapped,
 * the document's height changes, and a second pin is built from scratch — and
 * if any of that lands after the preloader has lifted, or while somebody has
 * already started scrolling, it reads as the hero lurching.
 *
 * Reading synchronously means the right variant mounts once and its pin is
 * built once.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    /* Still synced here: the query can start matching later (a rotation, a
       window drag), and between this component rendering and the effect
       running the answer may already have changed. */
    const sync = () => setMatches(mq.matches)
    sync()

    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}
