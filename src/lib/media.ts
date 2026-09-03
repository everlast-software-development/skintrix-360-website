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

/**
 * The Fit Score film, just above the footer. The device — frame, bezel,
 * island — is rendered into the pixels, so the section shows it raw with no
 * CSS phone around it.
 *
 * Two encodes, offered in this order: the WebM carries a real alpha channel,
 * so the drifting cards show through around the phone. The MP4 is the fallback
 * for browsers without VP9-with-alpha and has a white background — which is
 * why nothing in the component may draw a shadow or a border around the
 * video: on the fallback that would outline a white rectangle.
 */
export const FIT_FILM_WEBM = '/skintrix-phone-v3.webm'
export const FIT_POSTER = '/skintrix-phone-v3-poster.png'
/* Still on R2: the fallback is the one v3 asset not copied into `public/`. */
export const FIT_FILM_MP4 =
  'https://pub-fb006e1ee68f45ffbddf182152c46122.r2.dev/skintrix-phone-v3.mp4'

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
