import { useState } from 'react'
import { Container } from './styles'

export function InputCurrency({ name, value, onChange, ...res }) {
  const [formattedValue, setFormattedValue] = useState(formatCurrency(value))

  function formatCurrency(value) {
    const priceFormat = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    })
    console.log(priceFormat.format(value || 0))
    return priceFormat.format(value || 0)
  }

  function handleChange(event) {
    const rawValue = event.target.value.replace(/\D/g, '')
    const formatted = formatCurrency(rawValue / 100)
    setFormattedValue(formatted)
    onChange({ target: { name, value: rawValue } })
  }
  return (
    <Container>
      <input
        type="text"
        value={formattedValue}
        onChange={handleChange}
        {...res}
      />
    </Container>
  )
}
