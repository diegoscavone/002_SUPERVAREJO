import React, { forwardRef } from 'react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const colorVariants = {
  green:
    'bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500 active:bg-green-800',
  orange:
    'bg-orange-500 hover:bg-orange-600 text-white focus-visible:ring-orange-500 active:bg-orange-600',
  red:
    'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500 active:bg-red-800',
  emerald:
    'bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500',
  // Variante para cancelar / ações secundárias com fundo claro
  cancel:
    'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus-visible:ring-slate-400 active:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700'
}

export const Button = forwardRef(function Button(
  {
    label,
    children,
    icon: Icon,
    color = 'green',
    size = 'default',
    variant,
    className,
    disabled,
    isLoading = false,
    ...rest
  },
  ref
) {
  // Se 'variant' for passada explicitamente, prioriza a variante do Shadcn (ex: outline, ghost)
  const customColorClass = variant ? '' : (colorVariants[color] || '')

  return (
    <ShadcnButton
      ref={ref}
      variant={variant || (customColorClass ? undefined : 'default')}
      size={size}
      disabled={disabled || isLoading}
      className={cn(
        'text-base font-medium transition-all rounded-xl h-10 select-none flex items-center justify-center gap-2 shadow-none',
        customColorClass,
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          {label || children}
        </span>
      ) : (
        <>
          {Icon && <Icon className="h-5 w-5 shrink-0" />}
          {label || children}
        </>
      )}
    </ShadcnButton>
  )
})