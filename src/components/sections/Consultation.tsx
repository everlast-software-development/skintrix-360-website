import type { ComponentType, ReactNode } from 'react'
import {
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BentoGridShowcase } from '@/components/ui/bento-grid'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useTextReveal } from '@/hooks/useTextReveal'
import { FeatureTile } from '@/components/ui/FeatureTile'
import { LuStethoscope } from 'react-icons/lu'

/**
 * Consultation — the app's one differentiator, as a bento grid.
 *
 * The point: other skin apps stop at an AI score; this one also puts a
 * qualified professional inside the app. The tall centre cell carries that
 * message over a full-bleed photograph, and the cells around it hold the
 * supporting facts.
 *
 * THE SECTION BACKGROUND IS THE SITE'S — #F5F6FD, declared nowhere here.
 * `html` paints it (`--page`), so this section inherits it and blends with
 * every other section. Colour belongs to the CARDS, never to the section.
 *
 * COLOUR
 * ------
 * Card colours are light tints, each paired with a darkened version of the
 * same hue for its text. The darkening is not decorative: #2BB8C4 on a pale
 * ground is about 2.3:1, nowhere near legible, so every tone carries an `ink`
 * that actually passes.
 *
 * Four of the five tones are the logo's own hues. `sand` is the exception —
 * a warm cream matched to a supplied reference rather than drawn from the
 * mark. It is the only colour in this section that does not trace back to the
 * logo.
 */

/* Straight from the logo. `ink` is the same hue pushed dark enough to read as
   text on that hue's tint; `tint` is the card ground. No `edge` — the cards
   are borderless, so nothing needs an outline colour. */
const TONES = {
  cyan: { base: '#2BB8C4', ink: '#0E6A72', tint: 'rgb(43 184 196 / 0.14)' },
  blue: { base: '#3B7DE0', ink: '#274C93', tint: 'rgb(59 125 224 / 0.13)' },
  violet: { base: '#7B4FE0', ink: '#4E2FA3', tint: 'rgb(123 79 224 / 0.13)' },
  navy: { base: '#1A2A5C', ink: '#1A2A5C', tint: 'rgb(26 42 92 / 0.10)' },
  /* Warm sand — the one tone NOT from the logo, matched to a reference.
   *
   * Its ground is a solid hex rather than an alpha tint like the others. The
   * rest are a hue laid over the cool #F5F6FD page, which works while the hue
   * is cool; a warm cream diluted the same way comes out grey-green rather
   * than warm, because the ground it is mixing into is bluish. */
  sand: { base: '#8A7439', ink: '#4A3F26', tint: '#F5EFE0' },
} as const

type Tone = keyof typeof TONES

/* The local ink palette that used to live here — navy #1A2A5C, body #5A6B7B,
   muted #94A0AC — is gone. Those three values became the site-wide
   `--text-heading` / `--text-body` / `--text-muted` tokens in
   `src/styles/index.css`, which is where every section now reads them from,
   so keeping a private copy here would just be a second source of truth. */



/* Deliberately unlabelled — no names, no titles, no credentials. They
   illustrate "you are talking to a person" and nothing more; attaching
   invented specialist identities to stock photographs would be a fabricated
   claim rather than decoration. */
const FACES = [
  { id: 'photo-1494790108377-be9c29b29330', initials: 'SK' },
  { id: 'photo-1500648767791-00dcc994a43e', initials: 'AM' },
  { id: 'photo-1534528741775-53994a69daeb', initials: 'LR' },
] as const

const unsplashFace = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&facepad=2&w=96&h=96&q=70`

/** The same list the Fit Score section reads out, shortened to chip length. */
const PARAMETERS = [
  'Acne',
  'Pigmentation',
  'Redness',
  'Wrinkles',
  'Pores',
  'Texture',
  'Hydration',
  'Sebum',
] as const

/* ===========================================================================
   Card shells
   =========================================================================== */

/**
 * One card shell for all six slots. Borderless — rounded corners and a soft
 * shadow are what lift it off the ground.
 *
 * The ground comes through `style`, not a class. `Card`'s base carries
 * `bg-white`, and this project's `cn` is a plain join with no `tailwind-merge`
 * — two competing `bg-*` classes would both survive and the winner would be
 * whichever Tailwind ordered later, not the caller's. An inline style beats
 * both, so the tint is deterministic.
 */
function Cell({
  children,
  tone,
  className,
  padded = true,
}: {
  children: ReactNode
  /** Omit for a white card. */
  tone?: Tone
  className?: string
  /** Off for cards whose content is a full-bleed image. */
  padded?: boolean
}) {
  const t = tone ? TONES[tone] : null
  return (
    <Card
      className={`h-full rounded-[22px] ${padded ? 'p-6 min-[1025px]:p-7' : ''} ${className ?? ''}`}
      style={{ background: t ? t.tint : '#FFFFFF' }}
    >
      {children}
    </Card>
  )
}

/** The tinted icon circle every supporting card wears. */
function IconDisc({
  Icon,
  tone,
  onTint,
}: {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>
  tone: Tone
  /** True when the card itself is already tinted — the disc goes solid-white
      then, so it does not disappear into the ground behind it. */
  onTint?: boolean
}) {
  const t = TONES[tone]
  return (
    <span
      aria-hidden="true"
      /* `data-disc` is the only reliable handle on these: the avatar cluster
         is also `span[aria-hidden] .rounded-full`, so a structural selector
         cannot tell a disc from a face. */
      data-disc={tone}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ background: onTint ? 'rgba(255,255,255,0.75)' : t.tint, color: t.ink }}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </span>
  )
}

/** A supporting point: disc, title, one line. */
function PointCell({
  Icon,
  title,
  body,
  tone,
  tinted,
}: {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  body: string
  tone: Tone
  /** Tint the whole card, not just the disc. */
  tinted?: boolean
}) {
  return (
    <Cell tone={tinted ? tone : undefined}>
      <div className="flex h-full flex-col">
        <IconDisc Icon={Icon} tone={tone} onTint={tinted} />
        {/* Flattened to the system ink. These titles and bodies used to take
            the CARD's own tone (`t.ink`) — teal, violet, blue, sand — which is
            what made one bento read as four small designs. The tone survives
            where it is not type: the card tint and the icon disc. */}
        <CardTitle className="type-card-title mt-4">
          {title}
        </CardTitle>
        <CardDescription className="type-small mt-2">
          {body}
        </CardDescription>
      </div>
    </Cell>
  )
}

/* ===========================================================================
   Section
   =========================================================================== */

export function Consultation() {
  /* Word-by-word GSAP reveal on the section heading. */
  const headingRef = useTextReveal<HTMLHeadingElement>()

  return (
    <section
      id="consultation"
      aria-labelledby="consultation-heading"
      className="section-y w-full overflow-x-clip"
    >
      <div className="shell">
        {/* ── header ─────────────────────────────────────────────────────── */}
        <div className="section-head">
          <FeatureTile
            group="planning"
            icon={LuStethoscope}
            name="Professional consultation"
          />

          <h2 ref={headingRef} id="consultation-heading" className="type-h2">
            The AI reads your skin. A professional helps you act on it.
          </h2>

          <p
            className="text-lead mt-[18px]"
          >
            Most skin apps hand you a score and stop there. SkinTrix 360 also connects you with
            qualified professionals — so what the analysis finds turns into something you can do.
          </p>
        </div>

        {/* ── the grid ───────────────────────────────────────────────────── */}
        <BentoGridShowcase
          className="mt-12 min-[1025px]:mt-14"
          /* ── row 1, left: white, cyan disc ── */
          integrations={
            <PointCell
              Icon={MessageSquareText}
              tone="cyan"
              title="Consultation inside the app"
              body="Ask a qualified professional about your results without leaving SkinTrix 360."
            />
          }
          /* ── the tall centre cell: the photograph, with the message on it ── */
          mainFeature={
            /* 500px on a phone, not 340. Below 769px this is a single-column
               row sized by its content, and the frosted panel alone is ~280px
               — at 340 it covered 77% of the card and the photograph was
               barely there. At 500 the panel is a little over half and a real
               band of image reads above it. Above 769px the card spans three
               grid rows and is far taller than either floor, so the min-height
               never binds. */
            <Cell padded={false} className="relative min-h-[500px] overflow-hidden min-[769px]:min-h-[340px]">
              <img
                src="/skin.webp"
                /* Decorative — the overlaid headline carries the meaning. */
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                /* Absolute, so the 2048×2868 source contributes no intrinsic
                   height. In flow it would size the card to the photograph and
                   stretch every other card in the row with it. */
                className="absolute inset-0 h-full w-full object-cover object-center"
              />

              {/* NO overlay across the image. Contrast is bought only where
                  text actually sits — the frosted pill and the frosted panel
                  below — so the photograph itself stays sharp and unshaded. */}
              {/* THE ONE PERMITTED DEVICE: a tall, smooth ramp at the very
                  bottom. It runs across 62% of the card's height through six
                  stops, so there is no edge anywhere to read as a rectangle —
                  at its top it is fully transparent and it only reaches any
                  real weight in the last fifth, below the face.

                  It is not decoration, and its weight is measured rather than
                  chosen. On the bare photograph white text scored 1.0:1 at its
                  worst — the lit side of the face is near-white, so the copy
                  simply vanished. A genuinely feather-light ramp (peaking at
                  0.66, fading by 27%) still left the headline at 1.0:1, the
                  description at 1.44:1 and the label at 1.23:1.
                  These stops are what reach AA across the full width of every
                  line. Nine of them over 68% of the height means no edge is
                  visible anywhere, and it is still fully transparent across
                  the top third — the eyes, brow and upper cheek are untouched.

                  Stops are `rgb(… / 0)` rather than `transparent`, which is
                  transparent BLACK and would grey the middle of the ramp. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%]"
                style={{
                  background:
                    'linear-gradient(to top, rgb(18 16 28 / 0.80) 0%, rgb(18 16 28 / 0.76) 8%, rgb(18 16 28 / 0.70) 17%, rgb(18 16 28 / 0.62) 27%, rgb(18 16 28 / 0.52) 38%, rgb(18 16 28 / 0.40) 50%, rgb(18 16 28 / 0.27) 63%, rgb(18 16 28 / 0.15) 76%, rgb(18 16 28 / 0.06) 88%, rgb(18 16 28 / 0) 100%)',
                }}
              />

              {/* Content sits directly on the photograph — no box, no panel,
                  no blur, no shadow. Bottom-anchored, so it stays clear of the
                  eyes and cheek. */}
              <div className="relative flex h-full flex-col justify-end p-6 min-[1025px]:p-8">
                <p className="type-eyebrow ink-invert">
                  Professional consultation
                </p>

                <CardTitle className="type-h3 ink-invert mt-5">
                  More than AI. Professional care when you need it.
                </CardTitle>

                <CardDescription className="type-small ink-invert-soft mt-4 max-w-[34ch]">
                  Understand your skin with AI, and access professional consultation when you need
                  another perspective.
                </CardDescription>

                {/* Unlabelled on purpose — see the note beside `FACES`. */}
                <div className="mt-7 flex items-center gap-3">
                  <div className="flex -space-x-2.5">
                    {FACES.map((f) => (
                      <Avatar key={f.id} className="h-8 w-8 ring-2 ring-white/45" aria-hidden="true">
                        <AvatarImage src={unsplashFace(f.id)} alt="" />
                        <AvatarFallback>{f.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <p className="type-legal ink-invert-soft">
                    Qualified professionals, reachable in-app
                  </p>
                </div>
              </div>
            </Cell>
          }
          /* ── row 1, right: violet tint, the badges ── */
          featureTags={
            <Cell tone="violet">
              <div className="flex h-full flex-col">
                <IconDisc Icon={Sparkles} tone="violet" onTint />
                <CardTitle className="type-card-title mt-4">
                  What you get
                </CardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  {/* Inline colours, not utility overrides: `cn` cannot resolve
                      two competing `bg-*` classes without `tailwind-merge`. */}
                  <Badge className="type-legal ink-heading" style={{ background: 'rgba(255,255,255,0.8)' }}>
                    AI-powered
                  </Badge>
                  <Badge className="type-legal ink-heading" style={{ background: 'rgba(255,255,255,0.8)' }}>
                    Professional consultation
                  </Badge>
                  <Badge className="type-legal ink-heading" style={{ background: 'rgba(255,255,255,0.8)' }}>
                    Unbiased reading
                  </Badge>
                </div>
              </div>
            </Cell>
          }
          /* ── row 2, left: a plain tinted card, same shape as its siblings ──
              No image, no panel, no gradient. It uses `PointCell` — the exact
              component the other supporting cards use — so its padding, icon
              disc, type sizes and height all come from the same place rather
              than being matched by hand.

              The min-height it used to carry is gone with the photograph: it
              existed only to stop the frosted panel swallowing the image on a
              phone. Without it the card takes the grid row's height, which is
              what gives the left column its even rhythm. */
          secondaryFeature={
            <PointCell
              Icon={TrendingUp}
              tone="sand"
              tinted
              title="Small changes, big impact on your skin."
              body="Every parameter comes with what it means — not a number to interpret alone."
            />
          }
          /* ── right column, rows 2–3: cyan tint, the statistic ── */
          statistic={
            /* Two rows tall, so it needs real content rather than one number
               floating in the middle. The parameter chips are what fill it —
               prose alone left this card 39% occupied and reading as a gap. */
            <Cell tone="cyan" className="flex flex-col justify-between gap-6">
              {/* Two groups rather than one column with a spacer. This cell is
                  two grid rows tall — roughly 460px — and the content is
                  nowhere near that, so the slack has to go SOMEWHERE. Split
                  top and bottom it reads as deliberate spacing; pooled into a
                  single mid-card void (which `justify-center` and a trailing
                  `mt-auto` rule both produced) it reads as a hole. */}
              <div>
                <IconDisc Icon={FileText} tone="cyan" onTint />
                <p
                  className="ink-heading mt-5 text-[52px] leading-none font-semibold tracking-[-0.02em] min-[1025px]:text-[60px]"
                >
                  35<span className="align-super text-[0.5em]">+</span>
                </p>
                <p
                  className="type-card-title mt-3"
                >
                  skin parameters in a single scan
                </p>
              </div>

              <div>
                <p
                  className="type-small"
                >
                  Each one reviewable with a professional.
                </p>

                <ul className="mt-3.5 flex flex-wrap gap-1.5">
                  {PARAMETERS.map((p) => (
                    <li
                      key={p}
                      className="type-legal ink-heading rounded-full px-2.5 py-[5px]"
                      style={{ background: 'rgba(255,255,255,0.72)' }}
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Cell>
          }
          /* ── row 3, left: blue tint ── */
          journey={
            <PointCell
              Icon={ShieldCheck}
              tone="blue"
              tinted
              title="Explained in plain language"
              body="Every parameter comes with what it means for you — not a score with no context."
            />
          }
        />

        {/* ── closing line ───────────────────────────────────────────────── */}
        <p
          className="type-small ink-muted mt-10 flex items-center justify-center gap-2 text-center"
        >
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          Available to SkinTrix 360 users.
        </p>
      </div>
    </section>
  )
}
