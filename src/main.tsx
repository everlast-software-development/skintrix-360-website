import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/nunito/wght.css'
import '@/styles/index.css'
import App from '@/App'

/**
 * Start every load at the top of the page.
 *
 * `history.scrollRestoration = 'manual'` is set in index.html's head, early
 * enough to beat the browser's own restore. This is the other half: the flag
 * only tells the browser not to restore, it does not move a page that has
 * already been moved. A reload can leave the document at a non-zero offset
 * before any of this runs — Chrome and Safari both do it — so the position is
 * also reset explicitly.
 *
 * It runs BEFORE `createRoot`, so the reset lands on the real scroller once,
 * before React mounts anything that measures it.
 *
 * `scrollTo(0, 0)` is the two-argument form, which is always instant — and
 * there is no smooth scrolling anywhere on this site to animate it anyway.
 *
 * A URL with a hash is left alone. `/#download` and the in-page anchors are
 * navigation, not restoration, and forcing them to the top would break the
 * navbar's links from the legal pages back to the landing page. The browser
 * handles those natively.
 */
if (!window.location.hash) window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
