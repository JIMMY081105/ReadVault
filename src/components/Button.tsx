import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Variant map:
 *  primary  — accent fill (default)
 *  ghost    — transparent, accent border
 *  surface  — surface-2 fill, subtle border
 *  danger   — red tint
 */
const variants = {
  primary: 'bg-accent text-black font-semibold hover:bg-accent/90 active:scale-95 shadow-glow-sm',
  ghost:   'bg-transparent border border-accent/40 text-accent hover:bg-accent/10 active:scale-95',
  surface: 'bg-surface-2 border border-white/[0.07] text-text-primary hover:bg-surface-3 active:scale-95',
  danger:  'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95',
} as const

const sizes = {
  sm:  'px-3 py-1.5 text-sm rounded-xl',
  md:  'px-5 py-2.5 text-sm rounded-2xl',
  lg:  'px-6 py-3.5 text-base rounded-2xl',
  icon: 'p-2.5 rounded-xl',
} as const

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

interface ButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick' | 'type'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 transition-all duration-150 no-select
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
