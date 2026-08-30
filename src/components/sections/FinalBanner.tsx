import { m } from 'framer-motion'
import { SiApple, SiGoogleplay } from 'react-icons/si'

import { Reveal } from '@/components/ui/Reveal'
import { useMagnetic } from '@/hooks/useMagnetic'
import { SITE } from '@/lib/site'

/**
 * FinalBanner — the last thing on the page, and the layer that reveals the
 * footer.
 *
 * Nothing here is sticky or scroll-driven. The footer is fixed behind the whole
 * document (see `FixedFooter`); this banner is ordinary opaque content sitting
 * above it, so scrolling past simply uncovers what was always there. That is
 * why the reveal is perfectly smooth — there is no animation to be smooth.
 *
 * Dark on a light page by design: the close reads as a product banner rather
 * than another section, which is also what keeps the reveal legible.
 *
 * `id="download"` lives here — every `#download` link on the site resolves to
 * this banner.
 */

/** The fine grid behind the panel, as in the reference. */
const GRID =
  'linear-gradient(rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px)'

function StoreLink({
  href,
  icon,
  kicker,
  name,
}: {
  href: string
  icon: React.ReactNode
  kicker: string
  name: string
}) {
  const magnetic = useMagnetic<HTMLAnchorElement>(0.14)

  return (
    <m.a
      ref={magnetic.ref}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${kicker} ${name}`}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileTap={{ scale: 0.98 }}
      className="flex h-[4.25rem] w-full items-center gap-3.5 rounded-xl bg-[#0F2145] px-6 text-white ring-1 ring-white/12 transition-colors duration-300 hover:bg-[#16305E] hover:ring-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)]"
    >
      <span aria-hidden className="text-[1.625rem] leading-none">
        {icon}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[0.625rem] font-semibold tracking-[0.12em] text-white/55 uppercase">
          {kicker}
        </span>
        <span className="block text-[1.0625rem] font-semibold tracking-tight">{name}</span>
      </span>
    </m.a>
  )
}

/**
 * The fanned devices. Each render already contains its own phone frame, so
 * none is added here.
 *
 * Sized by *height*, not width: these sources are 1:2 (and one is 1:1), so a
 * width percentage against a 4:3 box made them twice as tall as the box and
 * the middle phone lost both ends. Height anchors them to the floor of the
 * box instead, and width follows the aspect ratio.
 */
const PHONES = [
  {
    src: '/screen-2.webp',
    w: 1986,
    h: 4000,
    alt: '',
    className: 'absolute bottom-[9%] left-[1%] h-[78%] w-auto -rotate-[7deg] opacity-70 lg:left-[3%]',
  },
  {
    src: '/screen-1.webp',
    w: 4000,
    h: 4000,
    alt: '',
    className: 'absolute -right-[9%] bottom-[3%] h-[86%] w-auto rotate-[7deg] opacity-70 lg:-right-[6%]',
  },
  {
    src: '/screen3.webp',
    w: 1986,
    h: 4000,
    alt: 'The SkinTrix360 app showing a skincare calendar with the day’s routine',
    className:
      'absolute bottom-0 left-1/2 h-full w-auto -translate-x-1/2',
  },
]

export function FinalBanner() {
  return (
    <section
      id="download"
      aria-labelledby="banner-heading"
      className="relative bg-canvas px-4 pt-8 pb-16 sm:px-6 sm:pb-20"
    >
      <div className="relative mx-auto w-full max-w-[82rem] overflow-hidden rounded-[2rem] bg-[#091838] ring-1 ring-white/8">
        {/* Grid, glow and edge light — the panel's whole background treatment. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span
            className="absolute inset-0 opacity-70"
            style={{ backgroundImage: GRID, backgroundSize: '54px 54px' }}
          />
          <span className="absolute -top-[30%] left-[18%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(circle,rgb(22_184_176_/_0.22),transparent_70%)] blur-3xl" />
          <span className="absolute -bottom-[35%] right-[6%] h-[80%] w-[55%] rounded-full bg-[radial-gradient(circle,rgb(90_98_214_/_0.18),transparent_70%)] blur-3xl" />
          <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(22_184_176_/_0.5),transparent)]" />
        </div>

        <div className="relative grid items-center gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-8 lg:px-14 lg:py-20">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center rounded-lg bg-[color:rgb(22_184_176_/_0.14)] px-4 py-2 text-[0.6875rem] leading-none font-bold tracking-[0.14em] text-[#4FE3DC] uppercase ring-1 ring-[color:rgb(22_184_176_/_0.3)]">
                Download app
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h2
                id="banner-heading"
                className="mt-7 text-[2.25rem] leading-[1.08] font-bold tracking-[-0.03em] text-white sm:text-[3rem] lg:text-[3.25rem]"
              >
                Ready to understand
                <br />
                {/* The reference's gradient second line, in SkinTrix teal. */}
                <span className="bg-[linear-gradient(92deg,#57CCC6_0%,#3FA8F5_55%,#5A62D6_100%)] bg-clip-text text-transparent">
                  your skin?
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mx-auto mt-6 max-w-[30rem] text-[1rem] leading-[1.75] text-white/55 lg:mx-0">
                Download SkinTrix 360 and start your skin journey.
              </p>
            </Reveal>

            {/* Equal cells, so both buttons match width exactly. */}
            <Reveal delay={0.18}>
              <div className="mx-auto mt-10 grid w-full max-w-[30rem] grid-cols-1 gap-3.5 sm:grid-cols-2 lg:mx-0">
                <StoreLink
                  href={SITE.appStoreUrl}
                  icon={<SiApple />}
                  kicker="Download on the"
                  name="App Store"
                />
                <StoreLink
                  href={SITE.playStoreUrl}
                  icon={<SiGoogleplay />}
                  kicker="Get it on"
                  name="Google Play"
                />
              </div>
            </Reveal>
          </div>

          {/* The devices. Given an explicit aspect box so they can be placed
              against it without the row's height depending on the images. */}
          <Reveal delay={0.12} className="relative">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[34rem] lg:max-w-none">
              {PHONES.map((phone) => (
                <img
                  key={phone.src}
                  src={phone.src}
                  alt={phone.alt}
                  width={phone.w}
                  height={phone.h}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={phone.className}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
