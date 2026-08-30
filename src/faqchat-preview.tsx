import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { FaqChatAnimated } from '@/components/ui/FaqChatAnimated'
import '@/styles/index.css'

/** Dev-only entry so the section can be previewed at /faqchat.html. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 16px' }}>
      <div style={{ height: '40vh' }} />
      <FaqChatAnimated />
      <div style={{ height: '40vh' }} />
    </div>
  </StrictMode>,
)
