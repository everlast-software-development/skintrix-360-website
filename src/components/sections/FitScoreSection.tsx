import { useEffect, useRef, useState } from 'react'
import { FaApple, FaGooglePlay } from 'react-icons/fa'

import { FIT_FILM_MP4, FIT_FILM_WEBM, FIT_POSTER } from '@/lib/media'
import { SITE } from '@/lib/site'
import { useTextReveal } from '@/hooks/useTextReveal'

/**
 * Fit Score — the closing section before the footer.
 *
 * The film has the device rendered into its pixels — frame, bezel, island —
 * so the `<video>` is rendered RAW: no wrapper, no radius, no border, no
 * shadow, no background. Any box drawn around it shows immediately as a
 * second phone, which is the bug this section previously had.
 *
 * The WebM carries a real alpha channel, so the cards drift visibly behind
 * the phone. The MP4 fallback does NOT — it has a solid background — which is
 * the reason the no-shadow rule is absolute rather than stylistic: a
 * drop-shadow would trace a rectangle around the fallback.
 *
 * Behind it, two rows of skin-concern cards drift in opposite directions,
 * reusing the page's existing `drift-left` / `drift-right` keyframes (see
 * `@theme` in `src/styles/index.css`), which animate `translate3d(0)` →
 * `translate3d(-50%)`. Each row's list is rendered twice, so at -50% the
 * second copy lands exactly where the first began and the loop is seamless.
 *
 * Breakpoints use explicit `min-[769px]` / `min-[1025px]` rather than
 * Tailwind's `md:` / `lg:`. Those are MIN-width 768/1024, so the spec's "≤768"
 * and "≤1024" tiers would be off by a pixel at exactly those widths — and
 * mixing `md:` with an arbitrary `min-[…]` variant sorts them unpredictably.
 */

export type FitItem = {
  label: string
  /** Drives both the blurred dot and the label. */
  color: string
}

export type FitScoreSectionProps = {
  webmSrc?: string
  mp4Src?: string
  posterSrc?: string
  headline?: string
  items?: FitItem[]
  appStoreUrl?: string
  playStoreUrl?: string
}

const DEFAULT_ITEMS: FitItem[] = [
  { label: 'Wrinkles', color: '#5B8DEF' },
  { label: 'Pores', color: '#8B7CF6' },
  { label: 'Skin texture', color: '#F5A524' },
  { label: 'Acne', color: '#F16063' },
  { label: 'Pigmentation', color: '#EC7FB8' },
  { label: 'Redness', color: '#F2765C' },
  { label: 'UV-related damage', color: '#F7C14B' },
  { label: 'Skin aging', color: '#2FBF87' },
  { label: 'Elasticity', color: '#3BC97A' },
  { label: 'Hydration', color: '#45B6D9' },
]

/* ===========================================================================
   Concern card
   =========================================================================== */

function ConcernCard({ item }: { item: FitItem }) {
  return (
    <div
      className="flex flex-none flex-col items-center gap-3 rounded-[22px] border bg-white px-[18px] py-[14px] whitespace-nowrap min-[769px]:px-6 min-[769px]:py-[18px] min-[1025px]:px-[30px] min-[1025px]:py-[22px]"
      style={{ borderColor: '#F6F6F8' }}
    >
      <span
        aria-hidden="true"
        className="block h-5 w-5 rounded-full min-[769px]:h-[26px] min-[769px]:w-[26px]"
        style={{ background: item.color, filter: 'blur(7px)', opacity: 0.85 }}
      />
      <span
        className="type-card-title"
        style={{ color: item.color }}
      >
        {item.label}
      </span>
    </div>
  )
}

/* ===========================================================================
   Marquee row
   =========================================================================== */

function MarqueeRow({ items, direction }: { items: FitItem[]; direction: 'left' | 'right' }) {
  const animation =
    direction === 'left'
      ? 'animate-[drift-left_30s_linear_infinite] min-[769px]:animate-[drift-left_42s_linear_infinite]'
      : 'animate-[drift-right_30s_linear_infinite] min-[769px]:animate-[drift-right_42s_linear_infinite]'

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]"
    >
      <div className={`flex w-max ${animation} motion-reduce:animate-none`}>
        {/* Twice — the second copy is what the -50% shift lands on. */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex flex-none gap-5 pr-5 min-[1025px]:gap-[26px] min-[1025px]:pr-[26px]"
          >
            {items.map((item) => (
              <ConcernCard key={`${copy}-${item.label}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===========================================================================
   Store badge
   =========================================================================== */

/**
 * The official badge image, with a drawn pill as the fallback. Neither SVG is
 * in the repo yet, so today every visitor sees the fallback — which is why it
 * is a real design rather than a placeholder box.
 */
export function StoreBadge({
  href,
  src,
  ariaLabel,
  kicker,
  name,
  Icon,
  /* Height utilities, applied to BOTH the image and the drawn fallback so the
     two stay the same size. Defaults to this section's own 44/52; the footer
     passes its own. */
  heightClass = 'h-11 min-[769px]:h-[52px]',
}: {
  href: string
  src: string
  ariaLabel: string
  kicker: string
  name: string
  Icon: typeof FaApple
  heightClass?: string
}) {
  const [missing, setMissing] = useState(false)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="inline-flex rounded-btn focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ outlineColor: '#000' }}
    >
      {missing ? (
        <span
          className={`inline-flex items-center gap-2.5 rounded-btn px-[18px] text-white ${heightClass}`}
          style={{ background: '#000' }}
        >
          <Icon aria-hidden className="h-6 w-6 shrink-0" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] whitespace-nowrap">{kicker}</span>
            <span className="block text-[17px] font-bold whitespace-nowrap">{name}</span>
          </span>
        </span>
      ) : (
        <img
          src={src}
          alt={ariaLabel}
          loading="lazy"
          decoding="async"
          onError={() => setMissing(true)}
          className={`w-auto ${heightClass}`}
        />
      )}
    </a>
  )
}

/* ===========================================================================
   Section
   =========================================================================== */

export function FitScoreSection({
  webmSrc = FIT_FILM_WEBM,
  mp4Src = FIT_FILM_MP4,
  posterSrc = FIT_POSTER,
  headline = "Check cosmetics' fit with no brand affiliation",
  items = DEFAULT_ITEMS,
  appStoreUrl = SITE.appStoreUrl,
  playStoreUrl = SITE.playStoreUrl,
}: FitScoreSectionProps) {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  /* Plays only while on screen, and never under prefers-reduced-motion —
     where preload="metadata" leaves the first frame standing in for it. */
  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.15 },
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      /* `download`, not `fit-score`: this is the one section that shows BOTH
         store badges, so it is where every "Download the App" and "Get
         Started" lands. Nothing styles or queries the old id. */
      id="download"
      aria-labelledby="fit-score-heading"
      className="w-full overflow-x-clip py-[clamp(2rem,4vw,3.5rem)]"
      style={{ background: '#F5F6FD' }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 min-[769px]:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-white px-4 pt-7 pb-8 min-[769px]:px-6 min-[769px]:pt-10 min-[769px]:pb-11 min-[1025px]:rounded-[40px]">
          {/* --- behind: the two drifting rows ------------------------------ */}
          <div className="pointer-events-none absolute inset-x-0 top-[8%] z-0 flex flex-col gap-5 opacity-50 min-[769px]:top-[6%] min-[1025px]:gap-[26px]">
            <MarqueeRow items={items} direction="left" />
            <MarqueeRow items={items} direction="right" />
          </div>

          {/* --- in front: the film, headline and store badges -------------- */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Raw. The device is in the pixels — see the note at the top.
                `aspect-ratio` reserves the height before the film loads, so
                nothing shifts. */}
            <video
              ref={videoRef}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
              className="pointer-events-none relative z-10 mx-auto block h-auto w-[260px] bg-transparent min-[769px]:w-[340px] min-[1025px]:w-[420px]"
              style={{ aspectRatio: '760 / 1180' }}
            >
              {/* WebM first: it is the encode with the alpha channel, so a
                  browser that can decode VP9-with-alpha picks it and the
                  cards show through. The MP4 is the white-background
                  fallback. */}
              <source src={webmSrc} type="video/webm" />
              <source src={mp4Src} type="video/mp4" />
            </video>

            <h2
              ref={headingRef}
              id="fit-score-heading"
              className="type-h2 measure-header mt-4 text-center min-[769px]:mt-5"
            >
              {headline}
            </h2>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-[14px]">
              <StoreBadge
                href={appStoreUrl}
                src="/badges/app-store.svg"
                ariaLabel="Download Skintrix on the App Store"
                kicker="Download on the"
                name="App Store"
                Icon={FaApple}
              />
              <StoreBadge
                href={playStoreUrl}
                src="/badges/google-play.svg"
                ariaLabel="Download Skintrix on Google Play"
                kicker="GET IT ON"
                name="Google Play"
                Icon={FaGooglePlay}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
