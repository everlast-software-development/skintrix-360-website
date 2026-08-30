import { SkinAnalysisPanel } from '@/components/ui/SkinAnalysisPanel'

/**
 * "From one capture to skin intelligence" — what the AI actually does.
 *
 * The hero introduces the product with the model full-bleed; this section is
 * the analysis itself, so the same footage appears contained inside a viewport
 * that is one part of an interface. No full-bleed video, no large centred
 * headline, no feature cards — the composition is the content.
 *
 * The section supplies only rhythm and ground; the whole composition, including
 * its heading, lives in `SkinAnalysisPanel`.
 */
export function Features() {
  return (
    <section id="features" aria-labelledby="features-heading" className="section-y relative bg-canvas">
      <div className="shell">
        <SkinAnalysisPanel />
      </div>
    </section>
  )
}
