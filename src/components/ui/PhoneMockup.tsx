import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type PhoneMockupProps = {
  /** Accessible description of what is on the device. */
  label: string
  /** Any CSS length. The rim, both radii and the screen's type scale derive from it. */
  width?: string
  /** Fills the screen — a `DeviceScreen`, or several stacked for a crossfade. */
  children: ReactNode
  className?: string
}

/**
 * The one device shell on the page.
 *
 * Sizing is driven by a single custom property, `--pw`: the titanium rim, the
 * corner radii and the screen's own root font-size are all `calc()`d from it,
 * so the device is pixel-correct at any width without a second set of
 * breakpoints — and so the UI inside scales with the hardware around it.
 */
export function PhoneMockup({
  label,
  width = 'clamp(10rem, min(46vw, 34svh), 19rem)',
  children,
  className,
}: PhoneMockupProps) {
  const style = {
    '--pw': width,
    '--pr': 'calc(var(--pw) * 0.138)',
    '--rim': 'calc(var(--pw) * 0.0295)',
    width: 'var(--pw)',
    height: 'calc(var(--pw) * 2.16)',
    borderRadius: 'var(--pr)',
  } as CSSProperties

  return (
    <div
      role="img"
      aria-label={label}
      style={style}
      className={cn(
        'relative shrink-0 p-[var(--rim)]',
        // Brushed titanium edge: banded gradient, not a flat grey.
        'bg-[linear-gradient(145deg,#EDF2F3_0%,#B4C3C7_16%,#F4F8F9_31%,#98A9AE_49%,#E9F0F1_68%,#A8B9BE_84%,#DFE8EA_100%)]',
        'shadow-float',
        className,
      )}
    >
      {/* Inner bezel */}
      <div
        className="relative h-full w-full overflow-hidden bg-[#091838] p-[calc(var(--pw)*0.008)]"
        style={{ borderRadius: 'calc(var(--pr) - var(--rim) * 0.55)' }}
      >
        {/* Screen */}
        <div
          className="relative h-full w-full overflow-hidden bg-[#0B1F45]"
          style={{
            borderRadius: 'calc(var(--pr) - var(--rim))',
            fontSize: 'calc(var(--pw) * 0.0437)',
          }}
        >
          {children}

          {/* Dynamic island */}
          <div
            aria-hidden
            className="absolute left-1/2 z-20 -translate-x-1/2 rounded-full bg-black"
            style={{
              top: 'calc(var(--pw) * 0.035)',
              width: 'calc(var(--pw) * 0.28)',
              height: 'calc(var(--pw) * 0.082)',
            }}
          />

          {/* Glass: one diagonal reflection plus a cooled top edge. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(118deg,transparent_34%,rgb(255_255_255_/_0.16)_43%,rgb(255_255_255_/_0.05)_50%,transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-30 shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.08),inset_0_1px_0_0_rgb(255_255_255_/_0.14)]"
            style={{ borderRadius: 'calc(var(--pr) - var(--rim))' }}
          />
        </div>
      </div>

      {/* Side hardware */}
      <span
        aria-hidden
        className="absolute -left-[calc(var(--pw)*0.008)] rounded-l-sm bg-[linear-gradient(180deg,#C3D0D3,#8E9FA4)]"
        style={{ top: 'calc(var(--pw) * 0.42)', width: 'calc(var(--pw) * 0.009)', height: 'calc(var(--pw) * 0.11)' }}
      />
      <span
        aria-hidden
        className="absolute -left-[calc(var(--pw)*0.008)] rounded-l-sm bg-[linear-gradient(180deg,#C3D0D3,#8E9FA4)]"
        style={{ top: 'calc(var(--pw) * 0.58)', width: 'calc(var(--pw) * 0.009)', height: 'calc(var(--pw) * 0.11)' }}
      />
      <span
        aria-hidden
        className="absolute -right-[calc(var(--pw)*0.008)] rounded-r-sm bg-[linear-gradient(180deg,#C3D0D3,#8E9FA4)]"
        style={{ top: 'calc(var(--pw) * 0.5)', width: 'calc(var(--pw) * 0.009)', height: 'calc(var(--pw) * 0.16)' }}
      />
    </div>
  )
}
