import { Container, DataView, Wholesale } from './styles.js'
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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 select-none w-full">
          {/* Descrição e Complemento*/}
          <div className="mt-12 mb-4 w-full px-2 break-words">
            <h2 className="text-5xl font-bold uppercase leading-none tracking-tighter drop-shadow-sm text-black mb-1">
              {product.description}
            </h2>
            <span className="text-2xl font-bold italic text-black leading-tight block">
              {product.complement}
            </span>
          </div>

          {/* Bloco de Preço*/}
          {hasPrice(product.price) && (
            <div className="flex items-end justify-center w-full max-w-full overflow-hidden scale-90 sm:scale-100">
              <span className="text-2xl font-bold text-red-600 mb-5 mr-1">
                R$
              </span>

              <div className={`${priceClass} flex items-start`}>
                {/* Preço Inteiro*/}
                <span className="text-[240px] font-black text-red-600 leading-[0.8] tracking-[-(0.05em)]">
                  {product.priceInteger}
                </span>

                {/* Decimal e Unidade */}
                <div className="flex flex-col items-end ml-1 mt-2">
                  <span className="text-[60px] font-bold text-red-600 leading-none">
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
              <span className="bg-white/80 px-4 py-1 rounded-full font-bold text-black uppercase tracking-wider">
                {dateText}
              </span>
            </div>
          )}
        </div>
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
      <DataView>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-lg">{product.description}</h2>
          <span>{product.complement}</span>
        </div>

        {product.description && (
          <>
            <Wholesale>
              <div className="infoBox">
                <div className="infoTitle">
                  <span className="infoLabel">PREÇO VAREJO</span>
                  {/* <span className="retailInfo">{`ATÉ ${product.fator_atacado} UNIDADES`}</span> */}
                  <span className="retailInfo">
                    {formatUnit(product.packaging)}
                  </span>
                </div>
                <div className="boxPrice">
                  <div className="boxPriceValue">
                    <span className="boxValue">R$</span>
                    <span className="priceValueRetail">
                      {product.price_retail?.split(',')[0] || '0'}
                    </span>
                    <span className="priceCentsRetail">
                      ,{product.price_retail?.split(',')[1] || '00'}
                      {/* <span className="unit">à unid.</span> */}
                    </span>
                  </div>
                </div>
              </div>
            </Wholesale>
            <Wholesale>
              <div className="infoBox">
                <div className="infoTitle">
                  <span className="infoLabel">PREÇO ATACADO</span>
                  {/* <span className="min-unidades">
                    ACIMA DE {product.fator_atacado} UNIDADES
                  </span> */}
                  <span className="min-unidades">A PARTIR DE 3 UNIDADES</span>
                </div>
                <div className="boxPrice">
                  <div className="boxPriceValue">
                    <span className="boxValue">R$</span>
                    <span className="priceValue">
                      {product.price_wholesale?.split(',')[0] || '0'}
                    </span>
                    <span className="priceCents">
                      ,{product.price_wholesale?.split(',')[1] || '00'}
                      <span className="unit">
                        {formatUnit(product.packaging)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Wholesale>
          </>
        )}
        {dateText && <span className="date">{dateText}</span>}
      </DataView>
    </Container>
  )
}
