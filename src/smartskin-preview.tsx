import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import SmartSkinAI from '@/pages/SmartSkinAI'
import '@/styles/index.css'

/** Dev-only entry so the standalone page can be previewed at /smartskin.html. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmartSkinAI />
  </StrictMode>,
)
