import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Chrome shared by every in-device screen: status bar, safe-area padding and
 * the tab bar. All sizing is in `em`, which the phone shell scales, so one
 * layout is correct at every device width.
 */
export function ScreenShell({
  children,
  tab,
  className,
}: {
  children: ReactNode
  tab: 'scan' | 'progress' | 'routine'
  className?: string
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col bg-[linear-gradient(180deg,#FFFFFF_0%,#F1F8F9_100%)] text-ink',
        className,
      )}
    >
      <StatusBar />
      <div className="flex min-h-0 flex-1 flex-col gap-[0.9em] overflow-hidden px-[1.3em]">{children}</div>
      <TabBar active={tab} />
    </div>
  )
}

function StatusBar() {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-between px-[1.9em] pt-[1.1em] text-[0.72em] font-extrabold tracking-tight"
    >
      <span>9:41</span>
      <span className="flex items-center gap-[0.4em]">
        <svg viewBox="0 0 18 12" className="h-[0.8em] w-[1.2em]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity=".35" />
        </svg>
        <svg viewBox="0 0 16 12" className="h-[0.8em] w-[1.05em]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M1 4.2a10 10 0 0 1 14 0" />
          <path d="M3.6 7a6.4 6.4 0 0 1 8.8 0" />
          <path d="M6.3 9.7a2.6 2.6 0 0 1 3.4 0" />
        </svg>
        <svg viewBox="0 0 26 12" className="h-[0.8em] w-[1.7em]">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.2" />
          <rect x="2.4" y="2.4" width="15" height="7.2" rx="2" fill="currentColor" />
          <path d="M23.4 4.2v3.6a2.2 2.2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity=".4" />
        </svg>
      </span>
    </div>
  )
}

const TABS = [
  {
    id: 'scan',
    label: 'Scan',
    path: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4.6a3.9 3.9 0 1 1 0 7.8 3.9 3.9 0 0 1 0-7.8Z',
  },
  { id: 'progress', label: 'Progress', path: 'M4 15.5 9.2 9.8l3.5 3.1L20 5.5' },
  { id: 'routine', label: 'Routine', path: 'M5 12.4 9.6 17 19 7' },
] as const

function TabBar({ active }: { active: string }) {
  return (
    <div aria-hidden className="shrink-0 pt-[0.7em]">
      <div className="flex items-end justify-around border-t border-ink/6 px-[1.4em] pt-[0.75em] pb-[0.35em]">
        {TABS.map((tab) => {
          const on = tab.id === active
          return (
            <span
              key={tab.id}
              className={cn(
                'flex flex-col items-center gap-[0.3em] text-[0.6em] font-bold tracking-tight',
                on ? 'text-teal-deep' : 'text-ink/30',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[1.9em] w-[1.9em]"
                fill={tab.id === 'scan' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={tab.id === 'scan' ? 0 : 2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.path} />
              </svg>
              {tab.label}
            </span>
          )
        })}
      </div>
      <span className="mx-auto mt-[0.5em] mb-[0.55em] block h-[0.3em] w-[7.5em] rounded-full bg-ink/22" />
    </div>
  )
}

/** Small caps label used above every card in the device UI. */
export function ScreenLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[0.62em] font-bold tracking-[0.12em] text-ink-muted uppercase">{children}</span>
  )
}
