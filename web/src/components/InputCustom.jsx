import React, { forwardRef, useId } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export const InputCustom = forwardRef(function InputCustom(
  {
    id,
    label,
    className,
    containerClassName,
    labelClassName,
    inputClassName,
    error,
    type = 'text',
    onEnter,
    icon: Icon,
    ...rest
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      // 1. Evita que o <form> capture o Enter e faça o submit automático
      event.preventDefault()

      if (onEnter) {
        onEnter(event)
      }
    }

    if (type === 'number') {
      // 2. Evita alteração involuntária de valores em balança/PDV pelas setas
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
      }
    }

    // 3. Mantém compatibilidade com qualquer onKeyDown passado via props
    if (rest.onKeyDown) {
      rest.onKeyDown(event)
    }
  }

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-zinc-600 dark:text-zinc-300',
            error && 'text-destructive font-medium',
            labelClassName
          )}
        >
          {label}
        </Label>
      )}

      {/* Container com a borda e ring perfeitamente sobrepostos (idêntico ao SelectCustom) */}
      <div
        className={cn(
          'relative flex h-10 w-full items-center overflow-hidden rounded-xl border border-input bg-background transition-all',
          'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0',
          error &&
            'border-destructive focus-within:border-destructive focus-within:ring-destructive',
          className
        )}
      >
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-muted-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}

        {/* Input puro: sem borda, sem sombra e sem anel interno para não duplicar */}
        <input
          id={inputId}
          ref={ref}
          type={type}
          onKeyDown={handleKeyDown}
          className={cn(
            'h-full w-full bg-transparent py-2 text-md font-normal text-zinc-800 dark:text-zinc-100 placeholder:text-muted-foreground',
            'border-0 shadow-none outline-none ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
            '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            Icon ? 'pl-10 pr-3' : 'px-3',
            inputClassName
          )}
          {...rest}
        />
      </div>

      {error && (
        <span className="text-xs font-normal text-destructive">{error}</span>
      )}
    </div>
  )
})
