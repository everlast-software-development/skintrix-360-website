import { useRef, useState } from 'react'
import {
  Activity,
  Aperture,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock,
  CreditCard,
  Droplets,
  Eye,
  FileImage,
  Image as ImageIcon,
  Layers,
  Lock,
  Palette,
  ScanFace,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  Users,
  Wand2,
  X,
} from 'lucide-react'

/**
 * SmartSkin AI — complete marketing landing page in one file.
 *
 * Standalone and unrouted: this is a different product from the site in this
 * repo, so it is not wired into `App.tsx`. Default export, no props.
 *
 * Every figure on the page (40k users, 94% accuracy, 4M+ analyses, the
 * ratings and review counts) comes from the brief and is placeholder copy —
 * swap them before this goes anywhere public.
 *
 * Imagery is grey placeholder blocks with a centred icon; nothing is
 * hotlinked.
 */

/* ---------------------------------------------------------------- helpers */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">{children}</p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{children}</h2>
  )
}

function Subhead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-500">{children}</p>
  )
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
      {children}
    </span>
  )
}

/** Grey block with a centred icon — stands in for every image on the page. */
function Placeholder({ className = '', icon: Icon = ImageIcon }: { className?: string; icon?: typeof ImageIcon }) {
  return (
    <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
      <Icon className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
    </div>
  )
}

function PrimaryButton({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  )
}

function OutlineButton({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-slate-400">{children}</span>
}

/* ------------------------------------------------------------------- data */

const CONCERNS = [
  { label: 'Wrinkles', className: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { label: 'Dry Skin', className: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { label: 'Acne', className: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
  { label: 'Oily', className: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { label: 'Sensitive', className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { label: 'Redness', className: 'bg-red-50 text-red-700 hover:bg-red-100' },
]

const PILLARS = [
  {
    icon: Target,
    title: 'High Accuracy',
    body: 'Our AI model is trained on 4M+ skin analyses',
    tint: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    body: 'Your images are never stored or shared',
    tint: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: BadgeCheck,
    title: 'Expert Validation',
    body: 'Recommendations validated by dermatologists',
    tint: 'bg-sky-50 text-sky-600',
  },
]

const STEPS = [
  {
    icon: Upload,
    step: 'Step 1',
    label: 'Upload a Selfie',
    body: ['Take a clear photo in natural light.', 'JPG or PNG, front-facing.'],
  },
  {
    icon: ScanFace,
    step: 'Step 2',
    label: 'AI Detects Issues',
    body: ['Our model reads texture, tone and pores.', 'Results come back in seconds.'],
  },
  {
    icon: Sparkles,
    step: 'Step 3',
    label: 'Get Tailored Recommendations',
    body: ['A routine matched to your skin.', 'Products and ingredients that fit.'],
  },
]

const DEMOS = [
  { title: 'Face AR Masks', sub: 'Try looks in real time', icon: Aperture },
  { title: 'AI Background Removal', sub: 'Clean cut-outs, instantly', icon: Layers },
  { title: 'Beautification', sub: 'Subtle, natural retouching', icon: Wand2 },
  { title: 'Virtual Makeover', sub: 'Preview a full routine', icon: Palette },
  { title: '360° Analysis', sub: 'Every angle, one scan', icon: ScanFace },
  { title: 'Smart Recommendations', sub: 'Matched to your profile', icon: Sparkles },
]

const PRODUCTS = [
  {
    name: 'Hydrating Serum',
    brand: 'SkinFirst',
    price: '$29.99',
    match: '98%',
    rating: 4.8,
    reviews: 1240,
    tags: ['Dry Skin', 'Anti-Aging'],
  },
  {
    name: 'Vitamin C Moisturizer',
    brand: 'PureDerm',
    price: '$32.50',
    match: '95%',
    rating: 4.7,
    reviews: 986,
    tags: ['Brightening', 'Uneven Tone'],
  },
  {
    name: 'Niacinamide Booster',
    brand: 'SkinClear',
    price: '$24.99',
    match: '92%',
    rating: 4.6,
    reviews: 754,
    tags: ['Acne', 'Pore Size'],
  },
  {
    name: 'Retinol Night Cream',
    brand: 'AgeLess',
    price: '$39.99',
    match: '89%',
    rating: 4.5,
    reviews: 612,
    tags: ['Wrinkles', 'Texture'],
  },
]

const PLANS = [
  {
    name: 'Free',
    price: { monthly: '$0', yearly: '$0' },
    period: 'forever',
    blurb: 'Basic skin analysis for essential needs',
    cta: 'Start Free',
    featured: false,
    features: [
      { label: '3 skin analyses per month', on: true },
      { label: 'Basic skin type detection', on: true },
      { label: 'General recommendations', on: true },
      { label: 'Limited product suggestions', on: true },
      { label: 'Advanced skin concerns tracking', on: false },
      { label: 'Comparison with previous scans', on: false },
      { label: 'Custom product recommendations', on: false },
    ],
  },
  {
    name: 'Premium',
    price: { monthly: '$9.99', yearly: '$7.49' },
    period: 'monthly',
    blurb: 'Advanced analysis for skin enthusiasts',
    cta: 'Get Premium',
    featured: true,
    features: [
      { label: 'Unlimited skin analyses', on: true },
      { label: 'Advanced skin concerns tracking', on: true },
      { label: 'Comparison with previous scans', on: true },
      { label: 'Custom product recommendations', on: true },
      { label: 'Personalised routine builder', on: true },
      { label: 'Priority support', on: true },
    ],
  },
  {
    name: 'Pro',
    price: { monthly: '$19.99', yearly: '$14.99' },
    period: 'monthly',
    blurb: 'Complete package for skincare professionals',
    cta: 'Go Pro',
    featured: false,
    features: [
      { label: 'Everything in Premium', on: true },
      { label: 'Multiple client profiles', on: true },
      { label: 'Exportable skin reports', on: true },
      { label: 'Clinic workflow tools', on: true },
      { label: 'Dedicated account manager', on: true },
    ],
  },
]

const TESTIMONIALS = [
  {
    name: 'Sreyleap',
    role: 'Student, 22',
    quote:
      'I never knew my skin was dehydrated, not oily. The analysis explained it in a way I actually understood, and my routine finally makes sense.',
  },
  {
    name: 'Dara',
    role: 'Office Worker, 28',
    quote:
      'Five seconds and I had a proper breakdown of my skin. I have been tracking changes for three months now and the difference is obvious.',
  },
  {
    name: 'Sophea',
    role: 'Beauty Enthusiast, 25',
    quote:
      'The product matching is the part that sold me. It stopped me wasting money on serums that were never going to suit my skin.',
  },
]

const ADVANCED = [
  {
    icon: Activity,
    title: 'Advanced Metrics',
    body: ['Fifteen-plus skin parameters measured', 'from a single capture, scored', 'and explained in plain language.'],
  },
  {
    icon: Sparkles,
    title: 'Personalized Advice',
    body: ['Guidance written around your own', 'results rather than a generic', 'skin-type bucket.'],
  },
  {
    icon: Target,
    title: 'Product Matching',
    body: ['Every recommendation carries a match', 'score, so you can see why it was', 'chosen for you.'],
  },
  {
    icon: TrendingUp,
    title: 'Skin Health Tracking',
    body: ['Compare scans over weeks and months', 'and watch the changes you would', 'otherwise miss.'],
  },
]

const CTA_STEPS = [
  { n: '1', title: 'Take Selfie', note: 'Or upload a photo' },
  { n: '2', title: 'AI Analysis', note: '5-second scanning' },
  { n: '3', title: 'Get Results', note: 'Detailed skin report' },
  { n: '4', title: 'Recommendations', note: 'Products & routine' },
]

const CTA_TRUST = [
  { label: 'Private & Secure', icon: Shield },
  { label: 'GDPR Compliant', icon: Lock },
  { label: 'Payment Security', icon: CreditCard },
]

const CTA_CHECKS = [
  'No sign up required',
  'Free scan available',
  '100% private analysis',
  'Expert-backed recommendations',
]

/* ------------------------------------------------------------------- page */

export default function SmartSkinAI() {
  const [yearly, setYearly] = useState(false)
  const productsRef = useRef<HTMLDivElement>(null)

  const scrollProducts = (dir: -1 | 1) =>
    productsRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      {/* ═══ 1. Hero ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        {/* Orbs bleed off both edges. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-200 opacity-40 blur-3xl" />
          <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-sky-200 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          {/* Trust pills. */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Dermatologist Approved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              40k+ Happy Users
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              5.0 Rating
            </span>
          </div>

          <div className="mt-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Skin Analysis
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-7xl">
            Get Your Skin Score
            <br />
            in <GradientText>5 Seconds</GradientText>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
            Upload. Analyze. Transform. Join 40k+ users who discovered their perfect skincare
            routine with expert-level AI analysis.
          </p>

          <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Free analysis • No registration required • Instant results
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start">
            <span className="flex flex-col items-center gap-2">
              <PrimaryButton>Discover My Skin Score</PrimaryButton>
              <Caption>Results in 5 seconds</Caption>
            </span>
            <span className="flex flex-col items-center gap-2">
              <OutlineButton>
                <Lock className="h-4 w-4" />
                Get Unlimited Scans
              </OutlineButton>
              <Caption>Premium features</Caption>
            </span>
          </div>

          {/* Activity ticker. */}
          <div className="mt-12 flex flex-col items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 sm:flex-row">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Sarah from Phnom Penh just analyzed her skin
            </span>
            <span className="font-medium text-slate-400">Analyses Completed Today</span>
          </div>

          {/* Trust row. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="h-4 w-4 text-slate-400" />
              AI Accuracy: 94%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileImage className="h-4 w-4 text-slate-400" />
              JPG/PNG Only
            </span>
          </div>

          {/* Quick concern guide. */}
          <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Try Our Quick Skin Concern Guide
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Pick what sounds like your skin and we will start there.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {CONCERNS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${c.className}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Or skip ahead and let the analysis find everything at once.
            </p>
            <div className="mt-4">
              <OutlineButton>Get My Complete Analysis</OutlineButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 2. AI Skin Analysis ═══════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <SectionHeading>
            AI <GradientText>Skin Analy</GradientText>sis
          </SectionHeading>
          <div className="mt-5">
            <Subhead>
              Upload a clear, front-facing selfie in natural light and let the model read your
              skin. Nothing is stored.
            </Subhead>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              Results in 5 seconds
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileImage className="h-4 w-4 text-slate-400" />
              JPG/PNG Files Only
            </span>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title}>
                <span
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${p.tint}`}
                >
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">{p.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row sm:items-start">
            <span className="flex flex-col items-center gap-2">
              <PrimaryButton>
                <Camera className="h-4 w-4" />
                Analyze My Skin
              </PrimaryButton>
              <Caption>Free — no account needed</Caption>
            </span>
            <span className="flex flex-col items-center gap-2">
              <OutlineButton>Get More Credits</OutlineButton>
              <Caption>Top up anytime</Caption>
            </span>
          </div>
        </div>
      </section>

      {/* ═══ 3. How It Works ═══════════════════════════════════════════ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <SectionHeading>How It Works</SectionHeading>
          <div className="mt-5">
            <Subhead>Three steps between a selfie and a routine built around your skin.</Subhead>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-slate-300"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <s.icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-xs font-semibold tracking-widest text-slate-400 uppercase">
                  {s.step}
                </p>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900">{s.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {s.body[0]}
                  <br />
                  {s.body[1]}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <PrimaryButton>
              Try It Now
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      </section>

      {/* ═══ 4. Sample Result / Demo ═══════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <SectionHeading>See It On Real Skin</SectionHeading>
            <div className="mt-5">
              <Subhead>
                A sample report, and the tools that come with it. This is what lands in your
                inbox seconds after you upload.
              </Subhead>
            </div>
          </div>

          <figure className="mx-auto mt-12 max-w-2xl rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 p-8 text-center">
            <blockquote className="text-lg leading-relaxed text-slate-700">
              “I finally understood my skin issues after using this tool. It helped me pick the
              right serum and my skin looks so much better now!”
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium text-slate-500">— Dana, 28</figcaption>
          </figure>

          {/* Scrolls horizontally on every width. */}
          <div className="mt-14 -mx-6 overflow-x-auto px-6 pb-4">
            <div className="flex gap-5">
              {DEMOS.map((d) => (
                <div key={d.title} className="w-56 shrink-0">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300">
                    <Placeholder className="aspect-[9/16] w-full" icon={d.icon} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold tracking-tight text-slate-900">
                    {d.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{d.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 5. Recommended Products ═══════════════════════════════════ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <Eyebrow>AI-Powered Personalization</Eyebrow>
            <div className="mt-4">
              <SectionHeading>Recommended Products For You</SectionHeading>
            </div>
            <div className="mt-5">
              <Subhead>
                Matched against your own results, not a generic skin type. Every card shows how
                closely it fits and why it was chosen.
              </Subhead>
            </div>
          </div>

          <div className="relative mt-14">
            <button
              type="button"
              aria-label="Previous products"
              onClick={() => scrollProducts(-1)}
              className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next products"
              onClick={() => scrollProducts(1)}
              className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div ref={productsRef} className="-mx-6 overflow-x-auto px-6 pb-4">
              <div className="flex gap-5">
                {PRODUCTS.map((p) => (
                  <article
                    key={p.name}
                    className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300"
                  >
                    <div className="relative">
                      <Placeholder className="aspect-square w-full rounded-t-2xl" icon={Droplets} />
                      <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                        {p.match} Match
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-medium text-slate-400">{p.brand}</p>
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold tracking-tight text-slate-900">
                          {p.name}
                        </h3>
                        <span className="shrink-0 text-base font-bold text-slate-900">
                          {p.price}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="flex">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                        <span className="text-xs text-slate-400">
                          {p.rating} ({p.reviews.toLocaleString()})
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 6. Choose Your Plan ═══════════════════════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <Eyebrow>Simple Pricing</Eyebrow>
            <div className="mt-4">
              <SectionHeading>Choose Your Plan</SectionHeading>
            </div>
            <div className="mt-5">
              <Subhead>Start free. Move up when you want history, tracking and matching.</Subhead>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className={yearly ? 'text-sm font-medium text-slate-400' : 'text-sm font-medium text-slate-900'}>
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={yearly}
                aria-label="Bill yearly"
                onClick={() => setYearly((v) => !v)}
                className={
                  'relative inline-flex h-6 w-11 items-center rounded-full transition ' +
                  (yearly ? 'bg-slate-900' : 'bg-slate-200')
                }
              >
                <span
                  className={
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
                    (yearly ? 'translate-x-5' : 'translate-x-0.5')
                  }
                />
              </button>
              <span className={yearly ? 'text-sm font-medium text-slate-900' : 'text-sm font-medium text-slate-400'}>
                Yearly
              </span>
              <span className="text-sm font-semibold text-amber-500">Save up to 25%</span>
            </div>
          </div>

          <div className="mt-14 grid items-start gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={
                  'flex flex-col overflow-hidden rounded-2xl bg-white transition hover:-translate-y-1 ' +
                  (plan.featured
                    ? 'border-2 border-slate-900 md:scale-105'
                    : 'border border-slate-200 hover:border-slate-300')
                }
              >
                {plan.featured && (
                  <p className="bg-slate-900 py-2 text-center text-xs font-semibold tracking-widest text-white uppercase">
                    Most Popular
                  </p>
                )}

                <div className="flex flex-1 flex-col p-8">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-slate-900">
                      {yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{plan.blurb}</p>

                  <div className="mt-6">
                    {plan.featured ? (
                      <PrimaryButton className="w-full">{plan.cta}</PrimaryButton>
                    ) : (
                      <OutlineButton className="w-full">{plan.cta}</OutlineButton>
                    )}
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-start gap-2.5">
                        {f.on ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <span
                          className={
                            'text-sm leading-relaxed ' + (f.on ? 'text-slate-600' : 'text-slate-400')
                          }
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <CircleCheckBig className="h-4 w-4 text-emerald-500" />
              No credit card required for free plan. Cancel premium anytime.
            </p>
            <div className="mt-5">
              <OutlineButton>View Full Pricing Details</OutlineButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 7. What Our Users Say ═════════════════════════════════════ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <SectionHeading>What Our Users Say</SectionHeading>
            <div className="mt-5">
              <Subhead>Real routines, rebuilt around what the analysis actually found.</Subhead>
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <Placeholder className="h-11 w-11 shrink-0 rounded-full" icon={Eye} />
                  <div className="min-w-0">
                    <figcaption className="text-sm font-bold tracking-tight text-slate-900">
                      {t.name}
                    </figcaption>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">
                  {t.quote}
                </blockquote>
              </figure>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-16 gap-y-4 text-sm font-medium text-slate-500">
            <span>1,000+ Cambodian Users</span>
            <span>Dermatologist Approved</span>
            <span>5-Star Average Rating</span>
          </div>
        </div>
      </section>

      {/* ═══ 8. Final CTA ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-12 h-80 w-80 rounded-full bg-indigo-200 opacity-40 blur-3xl" />
          <div className="absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-sky-200 opacity-40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24 md:py-32">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-14">
            <Eyebrow>Get Started Now</Eyebrow>
            <div className="mt-4">
              <SectionHeading>Ready to understand your skin?</SectionHeading>
            </div>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500">
              Get a personalized skin analysis and tailored product recommendations in just
              minutes. Start your journey to healthier, more radiant skin today.
            </p>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
              {CTA_STEPS.map((s) => (
                <div key={s.n} className="text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{s.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-2">
              <PrimaryButton className="px-10 py-4 text-base">
                <Camera className="h-5 w-5" />
                Upload Photo &amp; Get Analysis
                <ArrowRight className="h-5 w-5" />
              </PrimaryButton>
              <Caption>No registration required. Takes only 5 seconds.</Caption>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex h-8 items-center gap-2">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300" />
              </div>
              <p className="text-sm text-slate-500">AI analyzing skin…</p>
            </div>

            <div className="mt-12 flex items-center justify-center">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <Placeholder key={i} className="h-8 w-8 rounded-full ring-2 ring-white" icon={Eye} />
                ))}
              </div>
              <p className="ml-3 text-sm">
                <span className="text-slate-500">Joined by </span>
                <span className="font-semibold text-slate-900">40,000+ users</span>
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {CTA_TRUST.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  <t.icon className="h-4 w-4 text-slate-400" />
                  {t.label}
                </span>
              ))}
            </div>

            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-5 gap-y-2.5">
              {CTA_CHECKS.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                  <CircleCheckBig className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-600">{c}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 9. World's Most Advanced Skin Analysis ════════════════════ */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="text-center">
            <SectionHeading>World&rsquo;s Most Advanced Skin Analysis</SectionHeading>
            <div className="mt-5">
              <Subhead>Everything the model measures, and everything it does with it.</Subhead>
            </div>
          </div>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANCED.map((a) => (
              <div key={a.title} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <a.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-base font-bold tracking-tight text-slate-900">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {a.body[0]}
                  <br />
                  {a.body[1]}
                  <br />
                  {a.body[2]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
