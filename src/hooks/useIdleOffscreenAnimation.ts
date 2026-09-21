import { useEffect } from 'react'

/**
 * Stops the page paying for decoration nobody can see.
 *
 * THE PROBLEM THIS SOLVES, MEASURED.
 * The hero pins for five viewport-heights, so a visitor spends the first
 * several seconds of every session scrolling inside one fixed box. While they
 * do, the rest of the page is mounted and every CSS animation on it is still
 * running: the footer's tagline is fifty-one `<span>`s cross-fading on a 2.6s
 * loop, "How it works" has a scan sweep and a ring of scan points, and two
 * marquee rows drift across it. A browser does not pause an animation because
 * its element is off screen — it keeps recalculating style for it on every
 * frame, forever.
 *
 * Traced at 390x844 with the CPU throttled 4x, one pass through the hero's pin
 * spent 1285ms of 4779ms of main-thread time in style recalculation, and the
 * invalidation log attributed it almost entirely to those off-screen
 * keyframes — 4131 recalcs for the footer's spans alone, against 160 frames.
 * That is what made the pin stutter: the scroll handler and the stage
 * transitions were competing for a budget that decoration three screens away
 * had already spent. Pausing it takes style recalculation to 442ms and drops
 * the number of frames over 32ms from 100 to 31.
 *
 * WHAT IT DOES. One `IntersectionObserver` marks each top-level section, and
 * the footer, with `data-offscreen` while it is out of view; one rule in
 * index.css pauses animations under that attribute. `animation-play-state`
 * resumes exactly where it left off, and the `rootMargin` un-pauses a section
 * a screen before it arrives, so nothing is ever seen starting up.
 *
 * EVERY WIDTH. The rule in index.css used to be capped at `max-width: 1024px`
 * on the theory that a desktop could afford to animate what it cannot see. It
 * cannot: traced at 1440x900 across a full-page scroll, style recalculation
 * was the largest cost in the profile at 7760ms, and 51714 of those recalcs
 * belonged to the footer's cross-fading letters while they were three screens
 * below the viewport. The cap is gone.
 *
 * `prefers-reduced-motion` visitors have no running animations to pause, so
 * the observer is not built at all.
 */
export function useIdleOffscreenAnimation() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting)
        }
      },
      /* A full viewport of lead-in on both sides. A section is live well
         before its first pixel arrives, so the resume is never visible. */
      { rootMargin: '100% 0px' },
    )

    /* Top-level blocks only. Observing deeper would mean one entry per
       animated element — thousands, in the footer's case — for no gain: the
       attribute inherits, so marking the block pauses everything inside it.

       The footer is a SIBLING of `main`, and its `clip-path` confines its
       `position: fixed` child to the footer's own box — so the footer element
       not intersecting really does mean none of it is on screen, reveal
       included. */
    const targets = [...document.querySelectorAll('main > *'), document.querySelector('footer')]
    for (const el of targets) if (el) io.observe(el)

    /* Sections mount late — most of this page is a lazy chunk — so new
       children of `main` have to be picked up as they arrive. */
    const main = document.querySelector('main')
    const mo = main
      ? new MutationObserver(() => {
          for (const el of main.children) io.observe(el)
        })
      : undefined
    if (main && mo) mo.observe(main, { childList: true })

    return () => {
      mo?.disconnect()
      io.disconnect()
      document
        .querySelectorAll('[data-offscreen]')
        .forEach((el) => el.removeAttribute('data-offscreen'))
    }
  }, [])
}
