import React, { forwardRef, useId } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export const TextareaCustom = forwardRef(function TextareaCustom(
  {
    id,
    label,
    className,
    containerClassName,
    labelClassName,
    error,
    maxLength,
    value,
    ...rest
  },
  ref
) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label
            htmlFor={textareaId}
            className={cn(
              'text-sm font-normal text-zinc-600 dark:text-zinc-300',
              error && 'text-destructive font-medium',
              labelClassName
            )}
          >
            {label}
          </Label>

          {maxLength && (
            <span className="text-xs text-muted-foreground">
              {maxLength - String(value || '').length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <Textarea
        id={textareaId}
        ref={ref}
        value={value}
        maxLength={maxLength}
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-background px-3 py-2 text-base font-normal text-zinc-800 dark:text-zinc-100 placeholder:text-muted-foreground transition-all',
          // Elimina borda preta nativa e outlines do user-agent
          'outline-none focus:outline-none focus-visible:outline-none shadow-none focus:shadow-none',
          // Foco idêntico ao InputCustom e SelectCustom (anel de 2px verde)
          'focus:border-ring focus:ring-2 focus:ring-ring focus:ring-offset-0',
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          error &&
            'border-destructive focus:border-destructive focus:ring-destructive focus-visible:ring-destructive',
          className
        )}
        {...rest}
      />

      {error && (
        <span className="text-xs font-normal text-destructive">{error}</span>
      )}
    </div>
  )
})
