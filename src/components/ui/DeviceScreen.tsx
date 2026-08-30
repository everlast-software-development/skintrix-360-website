import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

import { cn } from '@/lib/cn'

type DeviceScreenProps = {
  /** Capture of the real product UI. Falls back to `screen` when empty. */
  video?: string
  poster?: string
  /** Live DOM screen — used when there is no capture, or motion is reduced. */
  screen?: ReactNode
  className?: string
}

/**
 * What plays on the glass.
 *
 * The file is only fetched once the device is near the viewport, and never
 * when the visitor has asked for reduced motion — those get the DOM screen,
 * which carries the same information without looping footage.
 */
export function DeviceScreen({ video, poster, screen, className }: DeviceScreenProps) {
  const ref = useRef<HTMLDivElement>(null)
  const near = useInView(ref, { once: true, margin: '700px 0px 700px 0px' })
  const reduced = useReducedMotion()

  const showVideo = Boolean(video) && near && !reduced

  return (
    <div ref={ref} className={cn('absolute inset-0 overflow-hidden', className)}>
      {showVideo ? (
        <video
          className="h-full w-full object-cover"
          src={video}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden
          tabIndex={-1}
        />
      ) : (
        (screen ?? <div className="h-full w-full bg-[radial-gradient(120%_80%_at_50%_0%,#14454F,#0B1F45)]" />)
      )}
    </div>
  )
}
