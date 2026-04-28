import type { ReactNode } from 'react'

/**
 * Consistent page wrapper — handles top padding, horizontal gutter, max-width.
 * Pass `flush` to remove horizontal padding (for full-bleed sections).
 */
interface PageContainerProps {
  children: ReactNode
  className?: string
  flush?: boolean
}

export default function PageContainer({ children, className = '', flush = false }: PageContainerProps) {
  return (
    <div className={`w-full max-w-lg mx-auto ${flush ? '' : 'px-4'} pt-14 ${className}`}>
      {children}
    </div>
  )
}
