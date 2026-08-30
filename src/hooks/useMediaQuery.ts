import { useEffect, useState } from 'react'

/** Starts `false` — correct for this CSR-only app, no hydration to match. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()

    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}
