import type { MouseEventHandler, ReactNode } from 'react'

/**
 * Base card component. Use `variant` for different surface levels.
 *  surface  — #0d0d0d with subtle border (default)
 *  elevated — slightly lighter with stronger shadow
 *  glass    — blur glass effect
 */
const variants = {
  surface:  'bg-surface border border-white/[0.06] shadow-card',
  elevated: 'bg-surface-2 border border-white/[0.08] shadow-elevated',
  glass:    'glass',
} as const

type CardVariant = keyof typeof variants

interface CardProps {
  children: ReactNode
  variant?: CardVariant
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  padding?: boolean
}

export default function Card({
  children,
  variant = 'surface',
  className = '',
  onClick,
  padding = true,
}: CardProps) {
  const isInteractive = Boolean(onClick)

  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl overflow-hidden
        ${variants[variant]}
        ${padding ? 'p-4' : ''}
        ${isInteractive ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
