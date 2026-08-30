import { LuScanFace } from 'react-icons/lu'

import { FeatureSpotlight } from '@/components/ui/FeatureSpotlight'
import { PRODUCT } from '@/lib/site'

/**
 * The spotlight that follows the analysis panel.
 *
 * Content is `PRODUCT` from `site.ts` — copy written for the site and not
 * rendered anywhere else, so this section describes the real product rather
 * than inventing a claim to fill a layout.
 */
export function Details() {
  // Highlight the closing word, derived from the copy rather than restated.
  const words = PRODUCT.headline.split(' ')
  const lastWord = words.pop()
  const leadWords = words.join(' ')

  return (
    <section id="details" aria-labelledby="details-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <FeatureSpotlight
          preheaderIcon={<LuScanFace aria-hidden className="h-4 w-4" />}
          preheaderText={PRODUCT.eyebrow}
          heading={
            <span id="details-heading">
              {leadWords} <span className="text-teal-deep">{lastWord}</span>
            </span>
          }
          description={PRODUCT.lead}
          buttonText="Download the App"
          buttonHref="#download"
          imageUrl="/screen-2.webp"
          imageAlt="The SkinTrix360 app showing an AI-generated skincare plan with a morning routine"
        />
      </div>
    </section>
  )
}
