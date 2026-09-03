export const SITE = {
  name: 'SkinTrix360',
  url: 'https://skintrix360.com',
  /** Verified live at time of writing. */
  appStoreUrl: 'https://apps.apple.com/tr/app/skintrix-360/id6761331748',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.skintrix',
  /* Root-relative, not absolute. This is a real route on this site now
     (`src/pages/PrivacyPolicy.tsx`), so an absolute URL would send visitors out
     to the network and back for a page already loaded — and would break the
     link entirely on any preview or staging host. */
  privacyUrl: '/privacy-policy',
  contactUrl: 'https://skintrix360.com/contact',
} as const

export const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Download App', href: '#download' },
] as const

export const HERO = {
  headline: ['AI-powered skin intelligence,', 'Built around your skin'],
  lead: 'See your skin in more detail, understand what is changing, and turn every scan into meaningful insights.',
  primary: 'Download the App',
  secondary: 'Scan your skin',
} as const

/** The hero's own closing state, reached at the end of its scroll narrative —
 *  distinct from the page's actual `FINAL_CTA` section further down. */
export const HERO_CLOSE = {
  headline: ['Your Skin.', 'Your Progress.'],
  lead: 'Track changes over time and understand how your skin evolves with personalized insights.',
  primary: 'Download the App',
} as const

export const WHAT = {
  headline: ['Your skin tells', 'a story.'],
  lead: 'SkinTrix helps you read it. A single photograph reveals patterns the eye cannot track — and turns them into a clear picture of your skin health.',
  points: [
    {
      title: 'Analyze',
      body: 'Understand your skin with AI-powered analysis and get a clearer picture of your skin health.',
    },
    {
      title: 'Track',
      body: 'Monitor how your skin changes over time, and keep your progress in clear, meaningful view.',
    },
    {
      title: 'Understand',
      body: 'Turn your skin data into clear insights that inform better, more confident skincare decisions.',
    },
  ],
} as const

export const STEPS = [
  { n: '01', title: 'Scan', body: 'Capture your skin using your phone.' },
  { n: '02', title: 'Analyze', body: 'SkinTrix360 analyzes visible skin characteristics using AI.' },
  { n: '03', title: 'Track', body: 'See your progress and understand changes over time.' },
] as const

/**
 * The app's real capabilities, in the order a user meets them. `label` and
 * `caption` are the app's own wording for each destination — kept verbatim so
 * the site describes the product that actually ships, not an idealised one.
 * `id` maps to an icon and a visual in the sections that render these.
 */
export const JOURNEY = {
  eyebrow: 'The experience',
  headline: 'One scan. A whole skincare practice.',
  lead: 'Everything below is a screen you will actually use — from your first selfie to the progress you can look back on.',
  steps: [
    {
      id: 'analysis',
      label: 'New Skin Analysis',
      caption: 'Take a selfie or upload a photo',
      body: 'Every session starts here. Capture your skin in a moment, or bring a photo you already have.',
    },
    {
      id: 'plan',
      label: 'My Skincare Plan',
      caption: 'AI-generated personalised routine',
      body: 'Your analysis becomes a routine built around your skin, not a generic regimen.',
    },
    {
      id: 'compatibility',
      label: 'Product Skin Compatibility',
      caption: 'Check if a product suits your skin',
      body: 'Before you buy, check a product against your own skin profile.',
    },
    {
      id: 'calendar',
      label: 'My Calendar',
      caption: 'Track your daily skincare schedule',
      body: 'Your routine laid out day by day, so following it is the easy part.',
    },
    {
      id: 'progress',
      label: 'Progress',
      caption: 'Track skin health over time',
      body: 'Watch your skin health move, with the changes made visible rather than remembered.',
    },
    {
      id: 'history',
      label: 'Scan History',
      caption: 'Every scan, kept in order',
      body: 'Your past analyses stay together, so today always has something to be measured against.',
    },
    {
      id: 'consultations',
      label: 'My Consultations',
      caption: 'Continue your care when needed',
      body: 'When you want a professional in the loop, your consultations live alongside everything else.',
    },
  ],
} as const

export const PRODUCT = {
  eyebrow: 'Built into every scan',
  headline: 'The details that make it yours.',
  lead: 'Small things the app handles for you, so the routine holds up on ordinary days.',
  /** Supporting capabilities that sit around the main journey. */
  details: [
    { title: 'UV Index', body: 'Today’s UV, so sun exposure is part of the plan rather than an afterthought.' },
    { title: 'Scan tokens', body: 'Your remaining scans are always visible, so nothing runs out unexpectedly.' },
    { title: 'Your history, kept', body: 'Scans and consultations stay organised in one place as they accumulate.' },
  ],
} as const

export const REASONS = [
  {
    title: 'AI-Powered',
    body: 'Intelligent skin analysis designed to make your skin data easier to understand.',
  },
  { title: 'Personal', body: 'Your skin journey is unique. Track your changes over time.' },
  { title: 'Simple', body: 'No complicated routines. Just clear insights when you need them.' },
  { title: 'Private', body: 'Your skin data should remain yours.' },
] as const

export const FINAL_CTA = {
  eyebrow: 'Get the app',
  headline: 'Start understanding your skin.',
  lead: 'Your skin journey starts with a scan.',
  primary: 'Download SkinTrix360',
} as const
