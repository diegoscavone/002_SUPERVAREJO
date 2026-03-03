import { Container, DataView, DataViewWholesale, Wholesale } from './styles.js'
export function PosterView({
  product,
  imageCampaign,
  priceClass,
  campaignType,
  campaignSelected
}) {
  const hasPrice = price => {
    return price && price.trim() !== ''
  }

  const formatDateRange = (initialDate, finalDate, campaignSelected) => {
    // Se ambas as datas são undefined ou vazias, não mostra nada
    if (!initialDate && !finalDate) {
      return null
    }

    if (campaignSelected === '18') {
      // Para campanha tipo 3, mostra apenas a data final se existir
      return finalDate ? `Validade do Produto: ${finalDate}` : null
    } else {
      // Para outros tipos de campanha
      const initial = initialDate || ''
      const final = finalDate || ''

      if (!initial && !final) {
        return null
      } else {
        return `Validade: ${initial} à ${final}`
      }
    }
  }

  const formatUnit = packaging => {
    if (!packaging) return ''

    const packagingLower = packaging.toLowerCase()

    if (
      packagingLower === 'un' ||
      packagingLower === 'unid' ||
      packagingLower === 'unidade'
    ) {
      return 'à unidade'
    } else if (packagingLower === 'kg' || packagingLower === 'kilo') {
      return 'kg'
    } else {
      // Para outros tipos, retorna o valor original
      return packaging.toLowerCase()
    }
  }

  if (campaignType === '1') {
    const dateText = formatDateRange(
      product.initial_date,
      product.final_date,
      campaignSelected
    )
    return (
      <div className="relative w-full max-w-[500px] rounded-lg overflow-hidden border border-gray-200 aspect-[1/1.4] bg-white">
        {/* Imagem de Fundo */}
        <img
          src={imageCampaign}
          alt={`Imagem da Campanha ${imageCampaign}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Container de Conteúdo Sobreposto */}
        <DataView className="absolute inset-0 flex flex-col items-center justify-center p-4 select-none w-full">
          {/* Descrição e Complemento*/}
          <div className="w-full px-2 break-words text-center">
            <h2 className="text-5xl  font-bold uppercase leading-none tracking-tighter drop-shadow-sm text-black mb-1">
              {product.description}
            </h2>
            <span className="text-2xl font-bold italic text-black leading-tight block">
              {product.complement}
            </span>
          </div>

          {/* Bloco de Preço*/}
          {hasPrice(product.price) && (
            <div
              className={`${priceClass} flex items-center justify-center w-full max-w-full overflow-hidden scale-90 sm:scale-100 font-['Arimo']`}
            >
              <span className="text-2xl font-bold text-red-600 mb-5 mr-1">
                R$
              </span>

              <div className="flex items-start">
                {/* Preço Inteiro*/}
                <span className="priceInteger font-black text-red-600 leading-[0.8] tracking-[-(0.05em)]">
                  {product.priceInteger}
                </span>

                {/* Decimal e Unidade */}
                <div className="priceWrapperDecimal flex flex-col items-end ml-1 mt-2">
                  <span className="priceDecimal font-bold text-red-600 leading-none">
                    {product.priceDecimal}
                  </span>
                  <span className="text-xl font-bold text-red-600 uppercase mr-2">
                    {formatUnit(product.packaging)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Data de Validade */}
          {dateText && (
            <div className="absolute bottom-3 w-full">
              <span className="ml-6 font-bold text-black uppercase tracking-wider text-left">
                {dateText}
              </span>
            </div>
          )}
        </DataView>
      </div>
    )
  }
  const dateText = formatDateRange(
    product.initial_date,
    product.final_date,
    campaignSelected
  )
  return (
    <Container>
      <img src={imageCampaign} alt={`Imagem da Campanha ${imageCampaign}`} />

      {/* Passamos a priceClass para o DataView para controlar o tamanho dos preços internamente */}
      <DataViewWholesale className={priceClass}>
        <div className="w-full px-2 break-words text-center">
          <h2 className="text-5xl  font-bold uppercase leading-none tracking-tighter drop-shadow-sm text-black mb-1">
            {product.description}
          </h2>
          <span className="text-2xl font-bold italic text-black leading-tight block">
            {product.complement}
          </span>
        </div>

        {product.description && (
          <div className={`${priceClass} flex flex-col items-center justify-center w-full max-w-full overflow-hidden scale-90 sm:scale-100 font-['Arimo']`}>
            {/* BLOCO VAREJO */}
            <Wholesale>
              <div className="flex flex-col items-center">
                <div className="text-lg text-black">
                  <span className="font-bold">PREÇO VAREJO </span>
                  <span className="uppercase">
                    {formatUnit(product.packaging)}
                  </span>
                </div>
                <div className="boxPrice">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-600 mr-1">R$</span>
                    <span className="priceValueRetail">
                      {product.price_retail?.split(',')[0] || '0'}
                    </span>
                    <span className="priceCentsRetail">
                      ,{product.price_retail?.split(',')[1] || '00'}
                    </span>
                  </div>
                </div>
              </div>
            </Wholesale>

            {/* BLOCO ATACADO */}
            <Wholesale>
              <div className="flex flex-col items-center">
                <div className="text-lg flex flex-col text-center text-black gap-0">
                  <span>PREÇO ATACADO</span>
                  <span>A PARTIR DE 3 UNIDADES</span>
                </div>
                <div className="boxPrice">
                  <div className="flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-600 mr-1">R$</span>
                    <span className="priceValue">
                      {product.price_wholesale?.split(',')[0] || '0'}
                    </span>
                    <span className="priceCents flex flex-col items-end">
                      ,{product.price_wholesale?.split(',')[1] || '00'}
                      <span className="unit">
                        {formatUnit(product.packaging)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Wholesale>
          </div>
        )}

        {dateText && <span className="text-lg font-bold mt-10 text-black">{dateText}</span>}
      </DataViewWholesale>
    </Container>
  )
}
