import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { FormatCurrency } from '@/hooks/formatCurrency'
import { cn } from '@/lib/utils'

export function PriceCell({ value, onUpdate, index, className }) {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numericValue =
        typeof value === 'string'
          ? parseFloat(value.replace(',', '.'))
          : value

      setLocalValue(
        isNaN(numericValue) || numericValue === 0
          ? ''
          : FormatCurrency(numericValue)
      )
    }
  }, [value])

  const handleChange = e => {
    // 1. Extrai dígitos e formata no padrão BRL visualmente
    const inputValue = e.target.value.replace(/[^\d]/g, '')
    const numericValue = parseFloat(inputValue) / 100
    const formatted = isNaN(numericValue) ? '' : FormatCurrency(numericValue)

    setLocalValue(formatted)

    // 2. Notifica o componente pai em tempo real para cálculo de margem
    const cleanValue = isNaN(numericValue) ? '0' : String(numericValue)
    onUpdate?.(cleanValue)
  }

  const handleBlur = () => {
    if (localValue === '') {
      onUpdate?.('0')
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()

      // Localiza todos os inputs de preço na tabela e move o foco para o próximo
      const allInputs = Array.from(
        document.querySelectorAll('.price-cell-input')
      )

      if (index !== undefined && index < allInputs.length - 1) {
        const nextInput = allInputs[index + 1]
        if (nextInput) {
          nextInput.focus()
          nextInput.select()
        }
      } else {
        e.currentTarget.blur()
      }
    }
  }

  return (
    <div
      className="flex items-center justify-center w-full"
      onClick={e => e.stopPropagation()}
    >
      <Input
        type="text"
        inputMode="numeric"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={e => e.target.select()}
        placeholder="R$ 0,00"
        className={cn(
          'price-cell-input h-8 w-24 sm:w-28 text-center text-xs sm:text-sm font-semibold tracking-tight',
          'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/25',
          'placeholder:text-green-600 dark:placeholder:text-green-400',
          'focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:border-green-600',
          'shadow-none transition-colors select-all rounded-lg',
          className
        )}
      />
    </div>
  )
}