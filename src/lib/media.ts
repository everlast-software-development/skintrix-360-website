/**
 * Media sources.
 *
 * `HERO_FILM` is the cinematic layer behind the hero — decorative only, held at
 * very low opacity so it reads as depth rather than content.
 *
 * `APP_FILM` holds the in-device captures of the real product. Leave an entry
 * empty and the matching phone renders its live DOM screen instead, so the page
 * is never waiting on a file that does not exist yet. Drop a URL in and the
 * device switches to video with no other change.
 */

export const HERO_FILM = 'https://pub-fb006e1ee68f45ffbddf182152c46122.r2.dev/Model_02.mp4'

/** The scroll-scrubbed film in the "Built into every scan" section. */
export const DETAIL_FILM = 'https://pub-fb006e1ee68f45ffbddf182152c46122.r2.dev/Model_03.mp4'

export const APP_FILM = {
  /** Hero device — the app's analysis flow. */
  hero: '',
  /** Feature 01 — AI Skin Analysis. */
  analysis: '',
  /** Feature 02 — Track Progress. */
  progress: '',
  /** Feature 03 — Personalized Routine. */
  routine: '',
  /** Download section device. */
  download: '',
} as const satisfies Record<string, string>
