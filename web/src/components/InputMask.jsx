import React, { forwardRef, useId, useState, useMemo } from 'react'
import { IMaskInput } from 'react-imask'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CalendarDays } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export const InputMask = forwardRef(function InputMask(
  {
    id,
    label,
    value = '',
    onChange,
    name,
    className,
    containerClassName,
    labelClassName,
    inputClassName,
    error,
    onEnter,
    icon: Icon = CalendarDays,
    mask = '00/00/0000',
    type = 'text',
    showCalendar = true,
    ...rest
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [open, setOpen] = useState(false)

  // Converte string "DD/MM/AAAA" para objeto Date válido
  const parsedDate = useMemo(() => {
    if (!value || typeof value !== 'string' || value.length < 10)
      return undefined
    const parsed = parse(value, 'dd/MM/yyyy', new Date())
    return isValid(parsed) ? parsed : undefined
  }, [value])

  function handleSelectDate(selectedDate) {
    if (!selectedDate) return

    const formattedDate = format(selectedDate, 'dd/MM/yyyy')
    setOpen(false)

    if (onChange) {
      onChange({
        target: {
          name: name || inputId,
          value: formattedDate
        }
      })
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && onEnter) {
      onEnter(event)
    }

    if (rest.onKeyDown) {
      rest.onKeyDown(event)
    }
  }

  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-1.5',
        containerClassName
      )}
    >
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

      <Popover open={open} onOpenChange={setOpen}>
        {/* Container do Input com foco unificado */}
        <div
          className={cn(
            'relative flex h-10 w-full items-center overflow-hidden rounded-xl border border-input bg-background transition-all',
            'focus-within:border-ring focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0',
            error &&
              'border-destructive focus-within:border-destructive focus-within:ring-destructive',
            className
          )}
        >
          {/* Digitação ágil via teclado numérico */}
          <IMaskInput
            id={inputId}
            name={name}
            inputRef={ref}
            type={type}
            mask={mask}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className={cn(
              'h-full w-full bg-transparent py-2 pl-3.5 pr-10 text-base font-normal text-zinc-800 dark:text-zinc-100 placeholder:text-muted-foreground',
              'border-0 shadow-none outline-none ring-0 ring-offset-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
              inputClassName
            )}
            {...rest}
          />

          {showCalendar ? (
            <PopoverTrigger asChild>
              <button
                type="button"
                className="absolute right-0 pr-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                title="Abrir calendário"
              >
                <Icon className="h-4 w-4" />
              </button>
            </PopoverTrigger>
          ) : (
            <span className="pointer-events-none absolute right-3 flex items-center justify-center text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>

        {/* 
          Configurações de ancoragem:
          - side="bottom": garante abertura para baixo
          - align="start": ancora o início do card na borda esquerda do input
          - sideOffset={6}: respiro vertical de 6px entre o input e o calendário
        */}
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={6}
          avoidCollisions={true}
          className="w-auto p-0 border border-border shadow-2xl rounded-2xl bg-popover z-50"
        >
          <Calendar
            mode="single"
            locale={ptBR}
            selected={parsedDate}
            onSelect={handleSelectDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && (
        <span className="text-xs font-normal text-destructive">{error}</span>
      )}
    </div>
  )
})
