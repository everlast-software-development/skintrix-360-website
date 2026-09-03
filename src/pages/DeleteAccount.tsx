import { useEffect } from 'react'
import type { ReactNode } from 'react'

/**
 * Delete your SkinTrix360 account — /delete-account
 *
 * The sibling of `PrivacyPolicy.tsx`, and deliberately built to the same
 * pattern: the shared shell (navbar, footer, skip link) belongs to `App.tsx`,
 * so this file is only what goes inside `<main>`. Every value comes from the
 * site's existing system — the `.type-*` roles for size/weight/ink, the four
 * `--text-*` tokens, `.shell` for the gutter, `--section-rhythm` for vertical
 * space, and the same #F5F6FD ground every other section paints. Nothing new:
 * no card, no shadow, no illustration, no additional colour.
 *
 * HEADING SIZES vs HEADING LEVELS
 * Same split the policy page makes. The outline is `h1` → `h2`, which is what
 * a screen reader announces; the sizes are the `h2` role for the page title
 * (40px, matching every section title on the landing page) and the `h3` role
 * for the five sections (22px). Both at 40px would leave the document with no
 * hierarchy at all.
 *
 * MEASURE AND ALIGNMENT
 * `.legal-doc` — the shared legal-page scope defined in `src/styles/index.css`.
 * It carries this page's whole difference from a landing section: the bigger
 * body size, the looser leading, the darker ink, and a 760px measure that is
 * left-aligned rather than centred.
 *
 * The alignment is the point of the LEFT edge, not the width. The article sits
 * inside `.shell`, the same wrapper the header uses, and `.legal-doc` sets a
 * max-width WITHOUT `margin-inline: auto` — so the text starts exactly where
 * the header logo starts (152px at 1440, 40px at 1024, 24px on a phone) and
 * the page reads as part of the site rather than a document centred in the
 * viewport. Both legal pages wear the same class, so they cannot drift apart.
 *
 * The wording is supplied copy and is reproduced verbatim. Do not tighten it.
 */

const CONTACT_EMAIL = 'info@alfalinedigital.com'
const PRIVACY_HREF = '/privacy-policy'

/* ===========================================================================
   Building blocks

   Local to this file, like the policy page's: document furniture, not site
   components, and nothing outside this page needs them.
   =========================================================================== */

/** One of the five sections. `h2` in the outline, `h3` in size. */
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="type-h3">
        {title}
      </h2>
      {children}
    </section>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p className="type-body mt-4">{children}</p>
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2.5 pl-5">{children}</ul>
}

/** The numbered flow. `list-decimal` against the policy page's `list-disc` —
 *  same construction, and the only difference is that these steps are ordered
 *  and have to be followed in sequence. */
function Steps({ children }: { children: ReactNode }) {
  return <ol className="mt-4 list-decimal space-y-2.5 pl-5">{children}</ol>
}

function Item({ children }: { children: ReactNode }) {
  return <li className="type-body">{children}</li>
}

/** A bold run inside body copy — the policy page's exact treatment. 500 is the
 *  site's heading weight; a bare `<strong>` would render 700, which appears
 *  nowhere else. */
function B({ children }: { children: ReactNode }) {
  return <strong className="ink-heading font-medium">{children}</strong>
}

function EmailLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="ink-accent underline underline-offset-4">
      {CONTACT_EMAIL}
    </a>
  )
}

export function DeleteAccount() {
  /* The site is a single document, so the title does not change on its own
     when the route does. */
  useEffect(() => {
    const previous = document.title
    document.title = 'Delete your SkinTrix360 account — SkinTrix360'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <section
      aria-labelledby="delete-account-title"
      /* The navbar is fixed and 4.5rem tall, so the top gap is the section
         rhythm PLUS the bar — otherwise the title starts underneath it. */
      className="w-full overflow-x-clip pb-[var(--section-rhythm)] pt-[calc(var(--section-rhythm)+4.5rem)]"
      style={{ background: '#F5F6FD' }}
    >
      <div className="shell">
        <div className="legal-surface">
          <article className="legal-doc">
            {/* ── masthead ─────────────────────────────────────────────────── */}
            <header className="legal-masthead">
              <h1 id="delete-account-title" className="type-h2">
                Delete your SkinTrix360 account
              </h1>
              <p className="legal-meta mt-5">
                <span className="legal-meta-part">SkinTrix360</span>
                <span className="legal-meta-dot" aria-hidden="true">
                  ·
                </span>
                <span className="legal-meta-part">Last updated: 28 April 2026</span>
              </p>
            </header>

            <P>
              This page explains how to permanently delete your SkinTrix360 account and related
              personal data, in line with how the app works today.
            </P>

            {/* The grace period is the one thing a reader must not miss, so it is
                set apart — with a rule, not a card. A 2px teal edge and an
                indent: no new surface, no shadow, and no radius the rest of the
                page does not already use. */}
            <p
              className="legal-callout type-body mt-8"
            >
              <B>Grace period.</B> Account deletion is scheduled with a <B>15-day grace period</B>.
              During that time you can cancel from the confirmation email or by signing in to the app
              again. After the grace period ends, deletion proceeds as described below.
            </p>

            <Section id="delete-in-app" title="Delete from the SkinTrix360 app (recommended)">
              <Steps>
                <Item>
                  Open <B>SkinTrix360</B> on your phone and sign in if prompted.
                </Item>
                <Item>
                  Go to <B>Profile</B> (often from the hub or navigation where your account settings
                  appear).
                </Item>
                <Item>
                  Open <B>Delete account</B> — it is described as starting a 15-day grace period;
                  you’ll receive a confirmation email.
                </Item>
                <Item>
                  Review the confirmation screen, enter your <B>display name or email</B> exactly as
                  registered when asked, then confirm to <B>schedule deletion</B>.
                </Item>
                <Item>
                  Check your email for confirmation. You can cancel deletion from the email link or by
                  signing in before the grace period ends.
                </Item>
              </Steps>

              <P>
                If your account is already scheduled for deletion, you’ll see status in Profile; you
                may be able to <B>keep your account</B> from there, or cancel using the email link.
              </P>
            </Section>

            <Section id="delete-support" title="Can’t use the app or need help?">
              <P>
                If you cannot access the App (for example, you lost access to your phone or forgot how
                to sign in), contact:
              </P>

              <P>
                <EmailLink />
              </P>

              <P>
                Email from the address linked to your account where possible, and include the phone
                number or email you used to register. <B>Alfa Line Digital</B> will verify your
                identity before processing a deletion request initiated by support.
              </P>
            </Section>

            <Section id="delete-after" title="What happens after deletion">
              <Bullets>
                <Item>
                  After the grace period completes, your SkinTrix360 account and associated personal
                  profile data handled through our services are permanently deleted or anonymized,
                  subject to legal retention requirements.
                </Item>
                <Item>
                  Some records may need to be retained where required by law (for example limited
                  accounting or regulatory obligations); those are minimized and not used for
                  marketing.
                </Item>
                <Item>
                  Deleting the App from your device does not by itself delete your account—you must
                  complete the deletion flow above or contact support.
                </Item>
              </Bullets>
            </Section>

            <Section id="delete-privacy" title="Privacy">
              <P>
                For how we process personal data generally, see our{' '}
                <a href={PRIVACY_HREF} className="ink-accent underline underline-offset-4">
                  Privacy Policy
                </a>
                .
              </P>
            </Section>

            <Section id="delete-questions" title="Questions">
              <P>
                <B>Alfa Line Digital</B>
              </P>

              <P>
                <EmailLink />
              </P>
            </Section>

            <p className="type-legal mt-12 italic">
              This page is informational, not legal advice. Have counsel review alongside your Privacy
              Policy.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
