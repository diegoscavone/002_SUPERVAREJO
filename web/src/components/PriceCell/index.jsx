import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { FormatCurrency } from '@/hooks/formatCurrency'

export function PriceCell({ value, onUpdate, index }) {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const numericValue = parseFloat(String(value).replace(',', '.'))
      setLocalValue(isNaN(numericValue) ? '' : FormatCurrency(numericValue))
    }
  }, [value])

  const handleChange = e => {
    const inputValue = e.target.value.replace(/[^\d]/g, '')
    const numericValue = parseFloat(inputValue) / 100
    const formatted = isNaN(numericValue) ? '' : FormatCurrency(numericValue)
    setLocalValue(formatted)
  }

  const handleBlur = () => {
    const cleanValue = localValue
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
    onUpdate(cleanValue)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()

      handleBlur()

      const allInputs = Array.from(
        document.querySelectorAll('.price-cell-input')
      )

      if (index < allInputs.length - 1) {
        setTimeout(() => {
          const nextInput = allInputs[index + 1]
          if (nextInput) {
            nextInput.focus()
            nextInput.select()
          }
        }, 10) 
      } else {
        e.target.blur()
      }
    }
  }

  return (
    <div className="flex justify-center" onClick={e => e.stopPropagation()}>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="R$ 0,00"
        // A classe deve estar no Input para o querySelector achar
        className="price-cell-input w-24 h-8 text-center font-regular bg-green-50 text-green-600 border-green-200 focus:ring-green-600 focus:border-green-600 shadow-none transition-all placeholder:text-green-600 placeholder:font-medium"
      />
    </div>
  )
}
