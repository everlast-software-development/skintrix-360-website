import { cn } from '@/lib/cn'

/**
 * The brand lockup, used as-is. Intrinsic dimensions are declared so the
 * navbar never reflows when it decodes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/SkinTrix360-logo.webp"
      alt="SkinTrix360"
      width={800}
      height={237}
      draggable={false}
      className={cn('h-9 w-auto select-none sm:h-10', className)}
    />
  )
}
