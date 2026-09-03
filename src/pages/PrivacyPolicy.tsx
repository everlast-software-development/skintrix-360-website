import { useEffect } from 'react'
import type { ReactNode } from 'react'

/**
 * Privacy Policy — /privacy-policy
 *
 * A reading page, not a designed one. Every value here comes from the site's
 * existing system: the `.type-*` roles for size/weight/ink, the four `--text-*`
 * tokens, `.shell` for the page gutter, `--section-rhythm` for vertical space,
 * and the same #F5F6FD ground every other section paints. Nothing new is
 * introduced — no card, no shadow, no illustration, no additional colour.
 *
 * HEADING SIZES vs HEADING LEVELS
 * The document is `h1` → `h2` (the fourteen numbered sections) → `h3` (the
 * lettered sub-sections, 3.1, 4.1 …), which is the correct outline for a legal
 * document and what a screen reader will announce. The SIZE each one takes is a
 * separate decision, exactly as elsewhere on the site: the page title uses the
 * `h2` role (40px — the same as every section title on the landing page),
 * numbered sections use the `h3` role (22px), and sub-sections use the
 * card-title role (17px). Fourteen headings at 40px would read as fourteen
 * separate pages.
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
 */

const EFFECTIVE_DATE = '11 May 2026'
const CONTACT_EMAIL = 'info@alfalinedigital.com'

/* ===========================================================================
   Building blocks

   Local to this file on purpose: they are document furniture, not site
   components, and nothing outside this page needs them.
   =========================================================================== */

/** One of the fourteen numbered sections. */
function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  const id = `section-${n}`
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="type-h3">
        <span className="legal-num">{n}.</span> {title}
      </h2>
      {children}
    </section>
  )
}

/** A lettered sub-section (3.1, 4.2 …). An `h3` under its section's `h2`. */
function Sub({ n, title }: { n: string; title: string }) {
  return (
    <h3 className="type-card-title mt-8">
      {n} {title}
    </h3>
  )
}

function P({ children }: { children: ReactNode }) {
  return <p className="type-body mt-4">{children}</p>
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2.5 pl-5">{children}</ul>
}

function Item({ children }: { children: ReactNode }) {
  return <li className="type-body">{children}</li>
}

/**
 * The `Term — description` pattern the policy uses throughout. The term takes
 * heading ink at weight 500 so a list can be scanned by its first few words,
 * which is the whole point of the pattern.
 */
function Term({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="type-body">
      <strong className="ink-heading font-medium">{label}</strong> — {children}
    </li>
  )
}

function Mail() {
  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="ink-accent underline underline-offset-4"
    >
      {CONTACT_EMAIL}
    </a>
  )
}

/* ===========================================================================
   The page
   =========================================================================== */

export function PrivacyPolicy() {
  /* The site is a single document, so the title does not change on its own
     when the route does. */
  useEffect(() => {
    const previous = document.title
    document.title = 'Privacy Policy — SkinTrix360'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <section
      aria-labelledby="privacy-title"
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
              <h1 id="privacy-title" className="type-h2">
                Privacy Policy
              </h1>
              <p className="legal-meta mt-5">
                <span className="legal-meta-part">SkinTrix360</span>
                <span className="legal-meta-dot" aria-hidden="true">
                  ·
                </span>
                <span className="legal-meta-part">Effective date: {EFFECTIVE_DATE}</span>
              </p>
            </header>

            <P>
              This Privacy Policy describes how Alfa Line Digital (“we”, “us”, “our”) collects, uses,
              discloses, and protects information when you use the SkinTrix360 mobile application
              (“App”) and related services accessed through it (collectively, the “Services”).
            </P>

            <P>
              By using the App, you agree to this Privacy Policy. If you do not agree, do not use the
              App.
            </P>

            <P>
              <strong className="ink-heading font-medium">Summary.</strong> We process account and
              profile data, facial images you submit for AI skin analysis, optional location for
              UV-related features, in-app notifications, care-plan and consultation information, and
              limited device/technical data needed to operate the Services. Facial images are sent to
              OpenAI for AI-powered skin analysis and are retained on our servers as part of your
              analysis history until you delete them or close your account. Authentication may use
              Firebase and sign-in providers (e.g., Google or Apple). You can request deletion of your
              account subject to our processes and applicable law.
            </P>

            {/* ── 1 ────────────────────────────────────────────────────────── */}
            <Section n="1" title="Who this applies to">
              <P>
                The App is intended for users who meet the minimum age stated in our Terms (for
                example, 16 years or older, where indicated in the App). We do not knowingly collect
                personal information from children below the permitted age.
              </P>
            </Section>

            {/* ── 2 ────────────────────────────────────────────────────────── */}
            <Section n="2" title="Data controller & contact">
              <P>The data controller responsible for your personal information is:</P>
              <p className="legal-address type-body mt-4">
                Alfa Line Digital
                <br />
                Building 17, West 0, Al Hosn, First Abu Dhabi Bank PJSC
                <br />
                Abu Dhabi, 00000, United Arab Emirates
              </p>
              <P>
                Privacy inquiries: <Mail />
              </P>
            </Section>

            {/* ── 3 ────────────────────────────────────────────────────────── */}
            <Section n="3" title="Information we collect">
              <P>
                Depending on how you use the App, we may collect or receive the following categories
                of information.
              </P>

              <Sub n="3.1" title="Account & authentication" />
              <Bullets>
                <Term label="Phone number">
                  if you sign in with phone verification (one-time codes).
                </Term>
                <Term label="Email or identifiers from sign-in providers">
                  if you use Google Sign-In, Sign in with Apple, or similar, as supported in the App.
                </Term>
                <Term label="Authentication tokens & session data">
                  stored securely on your device where applicable (e.g., secure storage) to keep you
                  signed in.
                </Term>
              </Bullets>
              <P>
                We use Google Firebase Authentication (and related Google infrastructure) to help
                verify identity and manage sign-in. Google’s use of information is also described in
                Google’s policies when you use those features.
              </P>

              <Sub n="3.2" title="Profile & preferences" />
              <Bullets>
                <Term label="Profile details">
                  such as display name, date of birth, gender, and skin-related information you choose
                  to provide.
                </Term>
                <Term label="Profile photo">optional image from your camera or photo library.</Term>
                <Term label="Notification preferences">
                  settings you configure for in-app or push-related communications, as available.
                </Term>
              </Bullets>

              <Sub n="3.3" title="Skin analysis & facial images" />
              <Bullets>
                <Term label="Facial images you capture or select">
                  when you initiate a skin analysis, you provide a selfie or photo from your library.
                  This image contains your face and is used exclusively for AI-assisted skin analysis
                  (see Section 4 — Face Data & AI Processing for full details on retention,
                  third-party sharing, and your choices).
                </Term>
                <Term label="Analysis results & metadata">
                  scores, reports, skin-type assessments, timestamps, and identifiers associated with
                  each analysis. These are stored in your analysis history.
                </Term>
              </Bullets>

              <Sub n="3.4" title="Location" />
              <P>
                With your permission, we may collect approximate or precise location (depending on OS
                permissions) to provide local UV index and sun-exposure-related information. You can
                revoke location permission in your device settings; some features may not work without
                it.
              </P>

              <Sub n="3.5" title="Consultations & care plan" />
              <Bullets>
                <Term label="Consultation records">
                  information displayed in your care journey, including scheduled events and
                  provider-related content linked to your account.
                </Term>
                <Term label="Voice-related content">
                  where the App allows playback or recording of consultation voice notes (for example
                  from your care team), audio may be accessed or temporarily cached on your device in
                  order to deliver that experience.
                </Term>
              </Bullets>

              <Sub n="3.6" title="Notifications" />
              <P>
                We may deliver in-app notifications about analyses, consultations, reminders, or
                product updates. If push notifications are enabled, your device receives messages
                through the platform vendor’s push services (e.g., Apple Push Notification service on
                iOS); we process related data (such as device tokens where applicable) only as needed
                to send notifications you have agreed to receive.
              </P>

              <Sub n="3.7" title="Device & technical data" />
              <Bullets>
                <Term label="Device and OS information">
                  device type, operating system version, app version, language, and similar
                  diagnostics needed to operate and improve compatibility and security.
                </Term>
                <Term label="Logs & security data">
                  limited server and error logs for reliability, fraud prevention, and support.
                </Term>
                <Term label="Network requests">
                  when you use the Services, interactions with our API at app.skintrix360.com are
                  transmitted over the internet (typically HTTPS).
                </Term>
              </Bullets>

              <Sub n="3.8" title="Cookies & similar technologies" />
              <P>
                The mobile App does not use browser cookies in the same way websites do; we may use
                local storage mechanisms on the device (e.g., app storage) consistent with mobile
                platform norms for session and preference data.
              </P>
            </Section>

            {/* ── 4 ────────────────────────────────────────────────────────── */}
            <Section n="4" title="Face Data & AI Processing">
              {/* The disclosure a reader most often arrives for. Same accent rule as
                  the grace period on the delete page — one emphasis device, used
                  sparingly, rather than a second kind of box. */}
              <p className="legal-callout type-body mt-6">
                Because the App uses facial images for its core skin-analysis feature, this section
                provides detailed disclosures required under applicable law and platform guidelines
                (including Apple App Store Guideline 5.1.1(i)).
              </p>

              <Sub n="4.1" title="What face data we collect" />
              <P>
                When you tap <strong className="ink-heading font-medium">Start Scan</strong> (or
                equivalent), the App captures or receives a still image of your face (a selfie or
                photo you select from your library). This image is processed locally on your device to
                assist with framing guidance, then transmitted over HTTPS to our servers at
                app.skintrix360.com for AI-powered skin analysis.
              </P>

              <Sub n="4.2" title="Do we retain facial images?" />
              <P>
                Yes. After analysis, your facial image is stored on our servers as part of your
                analysis history. We retain the image so you can review past scans, track skin
                progress over time, and access your history from any device. We do not use your facial
                image to train AI models, for advertising, or for any purpose unrelated to your
                personal skin-analysis history.
              </P>

              <Sub n="4.3" title="How long are facial images retained?" />
              <P>
                Facial images are retained only for as long as the associated analysis record exists
                in your account. Specifically:
              </P>
              <Bullets>
                <Term label="Individual deletion">
                  you may delete any analysis (and its associated image) at any time from the history
                  screen inside the App. The image is permanently deleted from our servers upon
                  confirmation.
                </Term>
                <Term label="Account deletion">
                  when you request account deletion, all facial images associated with your account
                  are permanently deleted from our servers as part of the account-closure process.
                </Term>
                <Term label="No indefinite retention">
                  we do not retain facial images after the analysis record has been deleted. There is
                  no indefinite archival of face data.
                </Term>
              </Bullets>

              <Sub n="4.4" title="Which third parties receive your facial image?" />
              <P>
                Your facial image is sent to OpenAI, L.L.C. (“OpenAI”), the provider of the GPT-4
                vision model we use for AI skin analysis. This is the only third party that receives
                your facial image during the analysis flow. No other third party (including
                advertising networks, data brokers, or analytics providers) receives your facial
                image.
              </P>

              <Sub n="4.5" title="Why does OpenAI receive your facial image?" />
              <P>
                OpenAI receives the image solely to perform the AI-powered skin analysis on our behalf
                — specifically, to identify and assess up to 14 skin indicators (such as hydration,
                texture, pigmentation, and similar factors) and return a structured analysis result to
                our servers. OpenAI processes the image as a sub-processor acting under our
                instruction; it does not use the image for its own purposes beyond fulfilling this
                request.
              </P>

              <Sub n="4.6" title="Does OpenAI store your facial image?" />
              <P>
                Pursuant to OpenAI’s API data usage policies, OpenAI does not use API-submitted
                content to train its models and does not retain images submitted through the API
                beyond a short-term window for trust-and-safety monitoring (up to 30 days, after which
                it is deleted). OpenAI is not permitted to use your image for any purpose other than
                returning the analysis result to us.
              </P>
              <P>
                For full details on OpenAI’s data practices, please refer to the OpenAI Privacy Policy
                and the OpenAI Usage Policies.
              </P>

              <Sub n="4.7" title="Your consent & permission" />
              <P>
                Before your first skin analysis, the App presents an in-app disclosure explaining that
                your selfie will be sent to OpenAI for processing. By proceeding with the scan, you
                provide explicit consent to this data-sharing. You may withdraw consent at any time by
                not initiating further scans; you may also delete your existing facial images as
                described in Section 4.3 above.
              </P>
            </Section>

            {/* ── 5 ────────────────────────────────────────────────────────── */}
            <Section n="5" title="How we use your information">
              <P>We use personal information for the following purposes:</P>
              <Bullets>
                <Item>To create and maintain your account and authenticate you.</Item>
                <Item>
                  To provide skin analysis features, personalized insights, scoring, reporting, and
                  history — including sending your facial image to OpenAI’s API for AI-powered
                  analysis as described in Section 4.
                </Item>
                <Item>To show UV-related information when location is enabled.</Item>
                <Item>
                  To display consultations, calendars, reminders, and care-plan content tied to your
                  account.
                </Item>
                <Item>To send notifications consistent with your settings and applicable law.</Item>
                <Item>
                  To maintain safety, integrity, debug issues, comply with legal obligations, and
                  enforce our Terms.
                </Item>
                <Item>
                  To improve the App and develop new features (using aggregated or de-identified data
                  where appropriate).
                </Item>
              </Bullets>
            </Section>

            {/* ── 6 ────────────────────────────────────────────────────────── */}
            <Section n="6" title="Legal bases (EEA/UK/Switzerland)">
              <P>
                If you are in the European Economic Area, the United Kingdom, or Switzerland, we rely
                on one or more of the following legal bases:
              </P>
              <Bullets>
                <Term label="Performance of a contract">providing the Services you request.</Term>
                <Term label="Consent">
                  where required (e.g., sharing facial images with OpenAI for AI analysis, certain
                  optional permissions, or marketing, if applicable).
                </Term>
                <Term label="Legitimate interests">
                  securing the App, preventing abuse, improving the product, and analytics that do not
                  override your rights.
                </Term>
                <Term label="Legal obligation">
                  where we must retain or disclose information by law.
                </Term>
              </Bullets>
            </Section>

            {/* ── 7 ────────────────────────────────────────────────────────── */}
            <Section n="7" title="How we share information">
              <P>We do not sell your personal information. We may share information with:</P>
              <Bullets>
                <Term label="OpenAI (AI skin analysis)">
                  your facial image is transmitted to OpenAI’s API solely to perform AI-powered skin
                  analysis on our behalf. See Section 4 for full details on what is sent, why, and
                  OpenAI’s data practices.
                </Term>
                <Term label="Infrastructure & service providers">
                  cloud hosting, database, customer support, email/SMS delivery, authentication
                  (including Google/Firebase), and security vendors, under contracts that require
                  appropriate data protection. These providers do not receive your facial images
                  except as necessary to host and serve our infrastructure.
                </Term>
                <Term label="Sign-in providers">
                  Apple, Google, or your mobile carrier for verification, according to your chosen
                  sign-in method.
                </Term>
                <Term label="Professional partners">
                  where your care plan or consultations involve healthcare or wellness partners, only
                  as needed to deliver those features and as permitted by law.
                </Term>
                <Term label="Legal & safety">
                  regulators, law enforcement, or others if required by law or to protect rights,
                  safety, or security.
                </Term>
                <Term label="Business transfers">
                  in connection with a merger, acquisition, or asset sale, subject to appropriate
                  safeguards.
                </Term>
              </Bullets>
            </Section>

            {/* ── 8 ────────────────────────────────────────────────────────── */}
            <Section n="8" title="Retention">
              <P>
                We retain personal information only as long as necessary for the purposes above,
                including legal, accounting, and reporting requirements. Specific retention periods:
              </P>
              <Bullets>
                <Term label="Facial images">
                  retained as part of your analysis history until you delete the individual analysis
                  or close your account (see Section 4.3). Not retained indefinitely.
                </Term>
                <Term label="Analysis results & metadata">
                  retained as part of your account history; deleted upon individual deletion or
                  account closure.
                </Term>
                <Term label="Account data">
                  retained while your account is active and for a reasonable period thereafter to
                  comply with legal obligations, resolve disputes, and enforce agreements. When you
                  request account deletion, we delete or anonymize personal data in line with our
                  deletion process (subject to any mandatory retention periods required by law).
                </Term>
                <Term label="OpenAI processing">
                  as noted in Section 4.6, OpenAI retains API inputs for up to 30 days for
                  trust-and-safety purposes and then deletes them.
                </Term>
              </Bullets>
            </Section>

            {/* ── 9 ────────────────────────────────────────────────────────── */}
            <Section n="9" title="Your rights & choices">
              <P>Depending on your location, you may have the right to:</P>
              <Bullets>
                <Item>
                  Access, correct, or update your profile information in the App where available.
                </Item>
                <Item>
                  Delete individual skin analysis records (and the associated facial image) directly
                  from the history screen in the App.
                </Item>
                <Item>
                  Request deletion of your account (the App offers an account deletion or “request
                  deletion” flow subject to verification and grace periods), which removes all facial
                  images and associated data.
                </Item>
                <Item>
                  Object to or restrict certain processing, or request portability of data you
                  provided, where applicable.
                </Item>
                <Item>
                  Withdraw consent where processing is consent-based (without affecting prior lawful
                  processing).
                </Item>
                <Item>Lodge a complaint with a supervisory authority in your country.</Item>
              </Bullets>
              <P>
                To exercise these rights, contact us at <Mail />. We may need to verify your identity
                before fulfilling requests.
              </P>
            </Section>

            {/* ── 10 ───────────────────────────────────────────────────────── */}
            <Section n="10" title="U.S. state privacy rights">
              <P>
                Residents of certain U.S. states may have additional rights under local laws (for
                example, rights to know, delete, or opt out of certain processing). Contact <Mail />{' '}
                with your request. We do not sell personal information for money; if we ever use
                personal information for cross-context behavioral advertising in a way that requires
                an opt-out, we will describe that in this policy and in any required disclosures.
              </P>
            </Section>

            {/* ── 11 ───────────────────────────────────────────────────────── */}
            <Section n="11" title="International transfers">
              <P>
                We may process and store information in countries other than your own, including the
                United States where OpenAI’s infrastructure is located. Where required, we use
                appropriate safeguards (such as standard contractual clauses) for transfers from the
                EEA/UK/Switzerland.
              </P>
            </Section>

            {/* ── 12 ───────────────────────────────────────────────────────── */}
            <Section n="12" title="Security">
              <P>
                We implement technical and organizational measures designed to protect personal
                information, including encryption in transit (HTTPS) for all API communication —
                including transmission of facial images to our servers and onward to OpenAI — and
                secure storage of credentials on the device where applicable. No method of
                transmission or storage is 100% secure; we cannot guarantee absolute security.
              </P>
            </Section>

            {/* ── 13 ───────────────────────────────────────────────────────── */}
            <Section n="13" title="Changes to this policy">
              <P>
                We may update this Privacy Policy from time to time. We will post the updated version
                on this page and update the “Effective date” above. If changes are material, we will
                provide additional notice as required by law (for example, in-app notice or email).
              </P>
            </Section>

            {/* ── 14 ───────────────────────────────────────────────────────── */}
            <Section n="14" title="Contact">
              <P>
                Questions about this Privacy Policy: <Mail />
              </P>
            </Section>

            {/* ── colophon ─────────────────────────────────────────────────── */}
            <footer className="mt-12 border-t pt-8 min-[769px]:mt-14" style={{ borderColor: 'var(--line)' }}>
              <p className="type-small">
                © 2026 Alfa Line Digital. SkinTrix360 and related marks are trademarks of their
                respective owners.
              </p>
              <p className="type-legal mt-4">
                This document is provided as a template aligned with common app-store disclosure
                expectations. It is not legal advice. Have qualified counsel review the final text for
                your jurisdiction, product, and data practices before publication.
              </p>
            </footer>
          </article>
        </div>
      </div>
    </section>
  )
}

export default PrivacyPolicy
