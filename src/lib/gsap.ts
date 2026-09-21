import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A RETRACTING ADDRESS BAR MUST NOT RE-MEASURE ANYTHING.
 *
 * Every refresh this codebase asks for goes through `requestScrollRefresh`,
 * which holds it until the scroll is quiet — but ScrollTrigger also refreshes
 * itself, on its own `resize` listener, and that path is inside the library.
 * On a phone or tablet the browser's address bar retracts on the first scroll
 * of the session; that fires `resize`; ScrollTrigger re-measures every trigger
 * and rebuilds the hero's pin-spacer, in the middle of the gesture that caused
 * it. Verified here by dispatching bare `resize` events with the width and the
 * small viewport both unchanged: the pin-spacer's inline style was rewritten
 * anyway.
 *
 * `ignoreMobileResize` is GSAP's own switch for it. It tells ScrollTrigger to
 * disregard vertical-only resizes on touch devices below a quarter of the
 * viewport's height — which is what a toolbar sliding away is, and is not what
 * a rotation or a split-screen change is, so those still re-measure.
 *
 * Registered here rather than at a call site because it is a property of the
 * library instance, and this module is the only place the library is created.
 */
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }
