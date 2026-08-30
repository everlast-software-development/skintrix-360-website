import { SiApple, SiGoogleplay } from 'react-icons/si'
import { LuArrowRight } from 'react-icons/lu'

import { Logo } from '@/components/ui/Logo'
import { SITE } from '@/lib/site'

/**
 * Three panels: the brand, the way around, and the way in.
 *
 * Separation comes from the panels' own grounds rather than outlines, so this
 * stays borderless like the rest of the page. The accent panel is teal deep
 * enough to carry white body text — the brand's mid teal only reaches 2.3:1
 * on white, which is fine for a fill and not for reading against.
 */

/** Where the middle panel points. */
const LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'My Skincare Plan', href: '#skin-plan' },
  { label: 'Consultation', href: '#consultation' },
  { label: 'Plans', href: '#pricing' },
]

/** The legal row, which the reference keeps out of the panels. */
const LEGAL = [
  { label: 'Privacy Policy', href: SITE.privacyUrl },
  { label: 'Contact', href: SITE.contactUrl },
]

function StoreBadge({
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${kicker} ${name}`}
      className="flex items-center gap-2.5 rounded-lg bg-[rgb(12,16,20)] px-3.5 py-2 text-white transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
    >
      <span aria-hidden className="text-[1.125rem] leading-none">
        {icon}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[0.5rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
          {kicker}
        </span>
        <span className="block text-[0.8125rem] font-semibold tracking-tight">{name}</span>
      </span>
    </a>
  )
}

export function Footer() {
  return (
    <footer className="shell pt-10 pb-10">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr_1.2fr]">
        {/* ── Brand */}
        <div
          className="flex flex-col items-center justify-center rounded-[1.25rem] px-8 py-12 text-center"
          style={{ background: 'var(--bg)' }}
        >
          <a href="#top" aria-label={`${SITE.name} home`}>
            <Logo className="h-9" />
          </a>
          <p className="mt-5 text-[0.9375rem] leading-[1.7]" style={{ color: 'var(--body)' }}>
            AI-powered skin intelligence, made personal.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <StoreBadge
              href={SITE.playStoreUrl}
              icon={<SiGoogleplay />}
              kicker="Get it on"
              name="Google Play"
            />
            <StoreBadge
              href={SITE.appStoreUrl}
              icon={<SiApple />}
              kicker="Download on the"
              name="App Store"
            />
          </div>
        </div>

        {/* ── Links */}
        <nav
          aria-label="Footer"
          className="flex flex-col items-center justify-between rounded-[1.25rem] px-6 py-12 text-center"
          style={{ background: 'var(--bg-tint)' }}
        >
          <ul className="flex flex-col gap-3.5">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-[0.9375rem] leading-none transition-colors duration-300 hover:text-[color:var(--teal-deep)]"
                  style={{ color: 'var(--body)' }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#download"
            className="mt-10 inline-flex items-center gap-2 rounded-lg bg-[rgb(12,16,20)] px-5 py-2.5 text-[0.875rem] leading-none font-semibold text-white transition-opacity duration-300 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--teal)]"
          >
            Scan Now
          </a>
        </nav>

        {/* ── The way in. Accent panel, deep enough to read white on. */}
        <div
          className="flex flex-col justify-between rounded-[1.25rem] px-8 py-12"
          style={{ background: 'linear-gradient(150deg, #0F6E6D 0%, #12817F 55%, #14739B 100%)' }}
        >
          <div>
            <h2 className="text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] text-white">
              Start your skin journey
            </h2>
            <p className="mt-3 max-w-[24rem] text-[0.875rem] leading-[1.7] text-white/75">
              Scan your skin, see what changes, and get active-ingredient guidance built around
              your own results.
            </p>

            {/* The reference puts an email capture here. There is no list or
                backend behind this site, so this points at the app instead of
                collecting an address it could not do anything with. */}
            <a
              href="#download"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[0.875rem] leading-none font-semibold transition-opacity duration-300 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ color: '#0F6E6D' }}
            >
              Get the app
              <LuArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <p className="text-[0.8125rem] leading-[1.6] text-white/70">
              Questions?
              <br />
              <a
                href={SITE.contactUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-white underline underline-offset-4 hover:opacity-85"
              >
                Get in touch
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Legal, outside the panels. */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <p className="text-[0.8125rem]" style={{ color: 'var(--muted)' }}>
          © {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[0.8125rem] transition-colors duration-300 hover:text-[color:var(--teal-deep)]"
                style={{ color: 'var(--muted)' }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
