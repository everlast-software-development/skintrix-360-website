import type { IconType } from 'react-icons'

import { cn } from '@/lib/cn'

/**
 * The feature identity header — the rounded icon tile, the feature name, and a
 * one-line description — that opens every feature section.
 *
 * It exists as ONE component rather than a pattern repeated per section
 * because consistency is the whole point of it: the tile is 44px at desktop
 * and 40px below, radius 14, icon 22px, and the gap above the h2 is the same
 * everywhere. Nine hand-written copies would drift the first time one section
 * was touched.
 *
 * THE COLOUR GROUPS. The app uses six families for these tiles — amber,
 * green, purple, pink, blue, teal — and copying all six onto a cool
 * teal/navy/lilac page would read as a rainbow. So the app's GROUPING logic is
 * kept (related features share a tint) and mapped onto three cool tints drawn
 * from the logo:
 *
 *   analysis   scanning and reading skin        teal    5.62:1
 *   tracking   progress over time               sky     6.17:1
 *   planning   plans, products, consultation    indigo  7.73:1
 *
 * Each ratio is its ink on its own tint, all clear of the 4.5:1 body floor.
 */
export type FeatureGroup = 'analysis' | 'tracking' | 'planning'

const GROUPS: Record<FeatureGroup, { tint: string; ink: string }> = {
  analysis: { tint: '#E4F5F4', ink: '#0E6A72' },
  tracking: { tint: '#E6F2FA', ink: '#1B5E86' },
  planning: { tint: '#EDEFFA', ink: '#3B4194' },
}

export function FeatureTile({
  group,
  icon: Icon,
  name,
  description,
  align = 'left',
  className,
}: {
  group: FeatureGroup
  icon: IconType
  /** The feature's name, as the app labels it. Real text, not decoration. */
  name: string
  /** The line beneath it — usually the section's existing eyebrow copy. */
  description?: string
  align?: 'left' | 'center'
  className?: string
}) {
  const { tint, ink } = GROUPS[group]

  return (
    <div
      className={cn(
        'feature-tile flex items-center gap-3',
        align === 'center' ? 'justify-center text-left' : 'justify-start text-left',
        className,
      )}
    >
      {/* Decorative: the name beside it already says what this is. */}
      <span
        aria-hidden
        className="feature-tile__icon grid shrink-0 place-items-center"
        style={{ background: tint, color: ink }}
      >
        <Icon />
      </span>

      <span className="flex flex-col">
        <span className="feature-tile__name">{name}</span>
        {description ? <span className="feature-tile__desc">{description}</span> : null}
      </span>
    </div>
  )
}
