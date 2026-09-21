/**
 * One way to ask for a ScrollTrigger re-measure, and it never happens while
 * the visitor is scrolling.
 *
 * WHAT THIS FIXES, MEASURED.
 * Four places used to call `ScrollTrigger.refresh()` directly: every lazy
 * section as it mounts (seven of them), `document.fonts.ready`, the resize
 * handler, and the hero's own scale effect. All four land within about a
 * second of the page becoming interactive — which is exactly when somebody
 * scrolls for the first time.
 *
 * A refresh is not a passive measurement. For a pinned element it unpins,
 * re-measures, rebuilds the pin-spacer and re-pins, and the document's height
 * changes while it does. Traced at 4x CPU throttling, scrolling as soon as the
 * hero existed: the page went from 8035px to 15082px at 1440x900 (+7047) about
 * 540ms in, with the visitor at scrollY 20, and from 11614px to 19428px
 * (+7814) on a 1000x1600 tablet at scrollY 41. That is the shake and the jump
 * — the page changing length under a finger that is still moving, and the pin
 * letting go and re-taking hold in the middle of it.
 *
 * The measurement is not wrong, only its timing. So this defers it: a refresh
 * asked for during a scroll waits until the scroll has been quiet for
 * `QUIET_MS`, and any number of requests in that window collapse into one.
 * Nothing is dropped — a visitor who never stops scrolling gets the refresh
 * the moment they do.
 *
 * SAFE TO DEFER, for this page specifically. The hero's pin is built in a
 * layout effect and its `end` is a function of `100svh` alone, so it is
 * correct from the first frame and a late refresh cannot change it. What the
 * refresh is really for is the triggers BELOW the hero, whose offsets move as
 * the lazy chunks arrive — and those are thousands of pixels away from a
 * visitor who has just started scrolling.
 */

/** How long the scroll must be quiet before a deferred refresh runs. Long
 *  enough to sit out a touch fling's tail, short enough that the sections
 *  below are correct well before anyone reaches them. */
const QUIET_MS = 220

let lastScrollAt = 0
let armed = false
let listening = false

function noteScroll() {
  lastScrollAt = performance.now()
}

/** Anything that moves the page counts, including a fling still decelerating
 *  after the finger has lifted — `scroll` fires throughout that. */
function listen() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', noteScroll, { passive: true })
  window.addEventListener('touchmove', noteScroll, { passive: true })
  window.addEventListener('wheel', noteScroll, { passive: true })
}

/**
 * Re-measure when it is safe to. Call it as often as you like.
 *
 * `lastScrollAt` starts at 0, so before the first scroll the page is "quiet"
 * by definition and the very first request runs on the next timer tick — the
 * load-time refreshes are not delayed by this, only ones that collide with a
 * real scroll.
 */
export function requestScrollRefresh() {
  listen()
  if (armed) return
  armed = true

  const attempt = () => {
    const quietFor = performance.now() - lastScrollAt
    if (quietFor < QUIET_MS) {
      window.setTimeout(attempt, QUIET_MS - quietFor)
      return
    }
    armed = false
    void import('@/lib/gsap').then(({ ScrollTrigger }) => ScrollTrigger.refresh())
  }

  window.setTimeout(attempt, 0)
}

/**
 * `100svh` in pixels, measured from a throwaway element.
 *
 * THE POINT OF IT IS THAT IT DOES NOT MOVE. On a phone or tablet the browser's
 * address bar collapses on the first scroll: `window.innerHeight` jumps by
 * 60-120px and fires `resize` in the middle of the gesture. The small viewport
 * is defined as the viewport with that bar SHOWN, so it is the same number
 * before and after — which makes it the only height a pin can be measured
 * against without the bar's own animation becoming a layout change.
 *
 * Exported so the hero's pin budget, the hero's resting position and the
 * resize gate below all read the same number.
 */
export function readSvh() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
  document.body.appendChild(probe)
  const h = probe.getBoundingClientRect().height || window.innerHeight
  probe.remove()
  return h
}
