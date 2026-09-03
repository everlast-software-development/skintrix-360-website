import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/cn'

/**
 * A grid of small squares whose opacities are randomly re-rolled every frame,
 * with a wordmark read out of the noise.
 *
 * The flicker is NOT a transition. Each square holds a base opacity, and on
 * every frame it has `flickerChance × deltaTime` probability of being given a
 * brand-new random value. That re-roll is the entire effect — a CSS transition
 * would smooth it into a pulse and lose the static-noise character.
 *
 * The wordmark comes from an OFFSCREEN mask canvas: the text is drawn once to
 * a second canvas, its alpha channel read back, and each grid square asks the
 * mask whether its centre lands on a glyph. Squares that do are boosted to
 * `min(1, opacity × 3 + glyphBoost)`, so the letters are always brighter than
 * the field but still flicker with it, rather than sitting on top as solid
 * type.
 *
 * The type is fitted, not assumed: `fontSize` is a starting point, and if the
 * measured line is wider than `fitRatio` of the canvas it is stepped down
 * until it fits. The size actually used is published as `data-font-size` on
 * the wrapper, so it can be read back rather than guessed at.
 *
 * Drawing happens in DEVICE pixels — `canvas.width` is multiplied by
 * `devicePixelRatio` and every coordinate with it — rather than via
 * `ctx.scale()`. A 2px square scaled up by the context lands on fractional
 * device pixels and renders as a blurred smudge; multiplying the coordinates
 * keeps each square crisp.
 *
 * `fillStyle` strings are cached per quantised alpha step. A 1440×260 band at
 * this density is ~15,000 squares, and building 15,000 `rgba(...)` strings
 * every frame is pure garbage-collector churn for a difference no eye can see.
 *
 * The loop runs only while the canvas is on screen (IntersectionObserver), and
 * under `prefers-reduced-motion: reduce` there is no loop at all — one static
 * frame is drawn and that is the end of it.
 */

export type FlickeringGridProps = {
  /** Side of each square, in CSS px. */
  squareSize?: number
  /** Space between squares, in CSS px. */
  gridGap?: number
  /** Probability per second that a given square is re-randomised. */
  flickerChance?: number
  /** Any `rgb()`/`rgba()` string — the three channels are used, alpha is per square. */
  color?: string
  /** Ceiling for a square's base opacity. */
  maxOpacity?: number
  /** Added to a glyph square's tripled opacity. Higher = the wordmark reads harder. */
  glyphBoost?: number
  /** The wordmark. Omit for a plain field of noise. */
  text?: string
  /** Starting size. Reduced automatically if the line will not fit. */
  fontSize?: number
  fontWeight?: number | string
  /** Tracking, in em. Applied via `ctx.letterSpacing`, or by hand where absent. */
  letterSpacingEm?: number
  /** Fraction of the canvas width the line may occupy before it is shrunk. */
  fitRatio?: number
  className?: string
}

/** Alpha is rounded to 1/64 so the `fillStyle` cache stays small. */
const ALPHA_STEPS = 64

export function FlickeringGrid({
  squareSize = 2,
  gridGap = 3,
  flickerChance = 0.1,
  color = 'rgba(10, 37, 64, 1)',
  maxOpacity = 0.22,
  glyphBoost = 0.62,
  text,
  fontSize = 190,
  fontWeight = 700,
  letterSpacingEm = 0.04,
  fitRatio = 0.92,
  className,
}: FlickeringGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [inView, setInView] = useState(false)

  /* The three channels, pulled off the string once. Not a parser — the alpha
     is supplied per square, so only `r, g, b` is ever needed. */
  const channels = useMemo(() => {
    const n = color.match(/[\d.]+/g)
    return n && n.length >= 3 ? `${n[0]}, ${n[1]}, ${n[2]}` : '0, 0, 0'
  }, [color])

  /** `rgba()` strings, one per quantised alpha step. */
  const palette = useMemo(
    () =>
      Array.from(
        { length: ALPHA_STEPS + 1 },
        (_, i) => `rgba(${channels}, ${(i / ALPHA_STEPS).toFixed(3)})`,
      ),
    [channels],
  )

  /* ---------------------------------------------------------------------
     Grid + glyph mask. Rebuilt whenever the box, the text or the type
     changes.
     --------------------------------------------------------------------- */
  const grid = useMemo(() => {
    const { width, height } = size
    const step = squareSize + gridGap
    const cols = Math.floor(width / step)
    const rows = Math.floor(height / step)
    if (cols <= 0 || rows <= 0) return null

    const squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity

    /* Which squares land on a glyph. Sampled once here rather than per frame:
       the mask cannot change between frames, only the opacities can. */
    const onGlyph = new Uint8Array(cols * rows)
    let usedFontSize = 0

    if (text && typeof document !== 'undefined') {
      const mask = document.createElement('canvas')
      mask.width = Math.max(1, Math.floor(width))
      mask.height = Math.max(1, Math.floor(height))
      const mctx = mask.getContext('2d')

      if (mctx) {
        const family =
          containerRef.current && typeof window !== 'undefined'
            ? window.getComputedStyle(containerRef.current).fontFamily
            : 'sans-serif'
        const chars = text.split('')

        /* Chrome and Safari have `ctx.letterSpacing`; older engines do not,
           and there it has to be walked out glyph by glyph. Set it AFTER the
           font, which resets it. */
        const applyFont = (fs: number) => {
          mctx.font = `${fontWeight} ${fs}px ${family}`
          try {
            mctx.letterSpacing = `${letterSpacingEm}em`
          } catch {
            /* not supported — the manual path below handles it */
          }
        }
        applyFont(fontSize)
        const nativeSpacing = mctx.letterSpacing === `${letterSpacingEm}em`

        /* Ink width, WITHOUT the trailing gap the native path measures in. */
        const measure = (fs: number) => {
          applyFont(fs)
          const gap = fs * letterSpacingEm
          if (nativeSpacing) return Math.max(0, mctx.measureText(text).width - gap)
          return (
            chars.reduce((w, ch) => w + mctx.measureText(ch).width, 0) + gap * (chars.length - 1)
          )
        }

        /* Fit. One correction usually lands it; the loop is there for the
           pathological case where a smaller size re-rounds wider. */
        const limit = width * fitRatio
        let fs = fontSize
        let inkWidth = measure(fs)
        for (let guard = 0; guard < 12 && inkWidth > limit && fs > 8; guard++) {
          fs = Math.max(8, Math.floor(fs * (limit / inkWidth)))
          inkWidth = measure(fs)
        }
        usedFontSize = fs

        /* Drawn from the left at a computed origin rather than with
           `textAlign: center`: the native letter-spacing path counts a
           trailing gap into its own centring and lands the line half a gap
           off-centre. */
        applyFont(fs)
        mctx.textAlign = 'left'
        mctx.textBaseline = 'middle'
        mctx.fillStyle = '#fff'
        const originX = (mask.width - inkWidth) / 2
        const originY = mask.height / 2

        if (nativeSpacing) {
          mctx.fillText(text, originX, originY)
        } else {
          const gap = fs * letterSpacingEm
          let x = originX
          for (const ch of chars) {
            mctx.fillText(ch, x, originY)
            x += mctx.measureText(ch).width + gap
          }
        }

        const alpha = mctx.getImageData(0, 0, mask.width, mask.height).data
        const half = squareSize / 2
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const x = Math.min(mask.width - 1, Math.floor(c * step + half))
            const y = Math.min(mask.height - 1, Math.floor(r * step + half))
            /* The 4th byte of the pixel is its alpha — anything above a
               whisker counts as ink, so antialiased edges still register. */
            if (alpha[(y * mask.width + x) * 4 + 3] > 24) onGlyph[c * rows + r] = 1
          }
        }
      }
    }

    return { cols, rows, squares, onGlyph, step, usedFontSize }
  }, [
    size,
    squareSize,
    gridGap,
    maxOpacity,
    text,
    fontSize,
    fontWeight,
    letterSpacingEm,
    fitRatio,
  ])

  /* ---------------------------------------------------------------------
     Measure. `ResizeObserver` rather than a resize listener, so a band that
     changes height from its own CSS (the ≤768px tier) is picked up too.
     --------------------------------------------------------------------- */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) =>
        Math.round(prev.width) === Math.round(width) &&
        Math.round(prev.height) === Math.round(height)
          ? prev
          : { width, height },
      )
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* On screen or not. The band lives at the very bottom of a tall page, so
     without this the loop would burn a core for the entire visit. */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, dpr: number) => {
      if (!grid) return
      const { cols, rows, squares, onGlyph, step } = grid

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      const side = squareSize * dpr

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const i = c * rows + r
          const base = squares[i]
          const a = onGlyph[i] ? Math.min(1, base * 3 + glyphBoost) : base
          if (a <= 0) continue
          ctx.fillStyle = palette[Math.round(a * ALPHA_STEPS)]
          ctx.fillRect(c * step * dpr, r * step * dpr, side, side)
        }
      }
    },
    [grid, palette, squareSize, glyphBoost],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !grid || size.width === 0 || size.height === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(size.width * dpr)
    canvas.height = Math.floor(size.height * dpr)
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`

    /* One frame, then stop. No loop is ever started. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(ctx, dpr)
      return
    }

    if (!inView) {
      /* Leave the last frame standing rather than clearing to nothing. */
      draw(ctx, dpr)
      return
    }

    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const delta = Math.min(0.1, (now - last) / 1000)
      last = now

      /* The re-roll. Every square, every frame, `flickerChance × delta`
         chance of a brand-new opacity. */
      const { squares } = grid
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * delta) squares[i] = Math.random() * maxOpacity
      }

      draw(ctx, dpr)
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [grid, size, inView, draw, flickerChance, maxOpacity])

  return (
    <div
      ref={containerRef}
      /* Published so the fitted size can be read back instead of inferred. */
      data-font-size={grid?.usedFontSize || undefined}
      className={cn('h-full w-full', className)}
    >
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </div>
  )
}
