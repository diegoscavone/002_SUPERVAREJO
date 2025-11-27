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
      <Container>
        <img src={imageCampaign} alt={`Imagem da Campanha ${imageCampaign}`} />
        <DataView>
          <div className="description">
            <h2>{product.description}</h2>
            <span>{product.complement}</span>
          </div>
          {hasPrice(product.price) && (
            <div className="priceWrapper">
              <span className="boxValue">R$</span>
              <div className={`price ${priceClass}`}>
                <span className="priceInteger">{product.priceInteger}</span>
                <div className="priceWrapperDecimal">
                  <span className="priceDecimal">{product.priceDecimal}</span>
                  <span className="retailInfo">{formatUnit(product.packaging)}</span>
                </div>
              </div>
            </div>
          )}
          {dateText && <span className="date">{dateText}</span>}
        </DataView>
      </Container>
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
        <div className="description">
          <h2>{product.description}</h2>
          <span>{product.complement}</span>
        </div>

        {product.description && (
          <>
            <Wholesale>
              <div className="infoBox">
                <div className="infoTitle">
                  <span className="infoLabel">PREÇO VAREJO</span>
                  {/* <span className="retailInfo">{`ATÉ ${product.fator_atacado} UNIDADES`}</span> */}
                  <span className="retailInfo">{formatUnit(product.packaging)}</span>
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
                      <span className="unit">{formatUnit(product.packaging)}</span>
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
