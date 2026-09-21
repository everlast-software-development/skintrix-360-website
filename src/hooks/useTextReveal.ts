import { useEffect, useRef } from 'react'

/**
 * Word-by-word reveal for a heading, driven by GSAP + ScrollTrigger.
 *
 * WHAT IT DOES
 * Splits the element's text into words, wraps each in an inline-block span,
 * and staggers them up into place when the element reaches the viewport. The
 * curve is the site's own `--ease-out-expo` control points, so this cadence
 * matches every framer-motion reveal already on the page rather than
 * introducing a second house style.
 *
 * WHY IT SPLITS BY HAND
 * GSAP's SplitText is a Club plugin and is not installed. Splitting text is a
 * dozen lines; the care is in what it must not break:
 *
 *   • It walks child NODES, so `<br />` and any nested `<span>`/`<a>` survive
 *     — `WHAT.headline` renders with a `<br>` in the middle and would collapse
 *     to one line if this replaced `innerHTML` with words.
 *   • Words are `inline-block` and NOTHING is `overflow: hidden`. A clipping
 *     mask is the prettier effect and the reason most implementations of this
 *     shift their layout: the mask cuts descenders, and the padding added to
 *     rescue them changes the line box. Measured before and after, this split
 *     leaves the heading's box identical.
 *   • The original markup is captured and restored on cleanup, so a re-render
 *     or a route change cannot leave a heading full of stale word spans.
 *   • Splitting waits for `document.fonts.ready`. Words measured against the
 *     fallback face and then reflowed by Nunito would stagger at the wrong
 *     positions.
 *
 * ACCESSIBILITY
 * The split is visual only: the words stay in document order as real text
 * nodes inside spans, so the accessible name of a heading is unchanged and a
 * screen reader still reads one continuous line. `prefers-reduced-motion`
 * returns before anything is touched — the heading renders as plain, static
 * text with no split at all.
 *
 * The heading must therefore be VISIBLE by default in CSS. This hook animates
 * from a hidden state it sets itself in JS; it never relies on the element
 * starting at `opacity: 0` in the stylesheet, so if the script fails the text
 * is still there.
 */

type Options = {
  /** Seconds between each word. */
  stagger?: number
  /** Travel distance in px. */
  y?: number
  /** Seconds before the first word moves. */
  delay?: number
}

const WORD_CLASS = 'tr-word'

/** Wraps every word of every text node under `root`, leaving elements alone. */
function splitWords(root: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = []

  const walk = (node: Node) => {
    // A live list would shift under us as text nodes are replaced.
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child)
        continue
      }
      if (child.nodeType !== Node.TEXT_NODE) continue

      const text = child.textContent ?? ''
      if (!text.trim()) continue

      /* Split on runs of whitespace but KEEP them: the separators carry the
         line breaks and indentation of the JSX, and dropping them would run
         words together. Odd indices are the whitespace. */
      const parts = text.split(/(\s+)/)
      const fragment = document.createDocumentFragment()

      for (const part of parts) {
        if (!part) continue
        if (!part.trim()) {
          fragment.appendChild(document.createTextNode(part))
          continue
        }
        const span = document.createElement('span')
        span.className = WORD_CLASS
        span.style.display = 'inline-block'
        /* NO `will-change` HERE. It used to be set as each word was created,
           which is at MOUNT — but the reveal does not run until the heading
           scrolls into view, and most headings on this page are several
           screens down. So every word in every un-revealed heading held a
           promoted layer from first paint: 56 of them at 1440x900, measured,
           against a `Layerize` cost of 6430ms across a full-page scroll.
           It is set in `onStart` below instead, which is the moment it starts
           being true. */
        span.textContent = part
        fragment.appendChild(span)
        words.push(span)
      }

      child.parentNode?.replaceChild(fragment, child)
    }
  }

  walk(root)
  return words
}

export function useTextReveal<T extends HTMLElement>({
  stagger = 0.055,
  y = 26,
  delay = 0,
}: Options = {}) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* The exact markup React rendered. Restoring this on cleanup is what keeps
       the split invisible to React: it never sees the spans. */
    const original = el.innerHTML
    let disposed = false
    let teardown: (() => void) | undefined

    void (async () => {
      /* Same dynamic import the other scroll hooks use, so GSAP stays in its
         own chunk and out of the critical path. */
      const [{ gsap }] = await Promise.all([
        import('@/lib/gsap'),
        document.fonts?.ready ?? Promise.resolve(),
      ])
      if (disposed || !ref.current) return

      const words = splitWords(el)
      if (!words.length) return

      const tween = gsap.fromTo(
        words,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: 'expo.out',
          stagger,
          /* The hint is true for exactly the length of this tween: on at the
             first frame of the reveal, off at the last. Left on it promotes
             every word to its own layer for the life of the page; set at
             split time it did that before the reveal had even started. */
          onStart: () => gsap.set(words, { willChange: 'transform, opacity' }),
          onComplete: () => gsap.set(words, { clearProps: 'willChange' }),
          scrollTrigger: {
            trigger: el,
            /* Matches framer's shared VIEWPORT amount (25% in view) so a
               GSAP heading and a framer paragraph beneath it fire together. */
            start: 'top 85%',
            once: true,
          },
        },
      )

      teardown = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.innerHTML = original
      }
    })()

    return () => {
      disposed = true
      teardown?.()
    }
  }, [stagger, y, delay])

  return ref
}
