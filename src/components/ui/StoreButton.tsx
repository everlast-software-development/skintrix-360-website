import type { ReactNode } from 'react'
import { m } from 'framer-motion'

import { useMagnetic } from '@/hooks/useMagnetic'

type StoreButtonProps = {
  href: string
  icon: ReactNode
  kicker: string
  name: string
}

export function StoreButton({ href, icon, kicker, name }: StoreButtonProps) {
  const magnetic = useMagnetic<HTMLAnchorElement>(0.14)

  return (
    <m.a
      ref={magnetic.ref}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${kicker} ${name}`}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileTap={{ scale: 0.98 }}
      className="group flex h-14 min-w-[11.5rem] items-center gap-3 rounded-full bg-surface px-6 text-ink hairline"
    >
      <span aria-hidden className="text-xl text-ink">
        {icon}
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[0.625rem] font-semibold tracking-[0.1em] text-ink-muted uppercase">
          {kicker}
        </span>
        <span className="block text-[0.9375rem] font-semibold tracking-tight">{name}</span>
      </span>
    </m.a>
  )
}
