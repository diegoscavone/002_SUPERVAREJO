function FormatCurrency(value) {
  const priceFormat = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
  return priceFormat.format(value)
}

export { FormatCurrency }
