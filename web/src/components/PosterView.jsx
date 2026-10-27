import React from 'react'
import { cn } from '@/lib/utils'

export function PosterView({
  product,
  imageCampaign,
  priceClass = '',
  campaignType,
  campaignSelected
}) {
  const hasPrice = price => {
    return Boolean(price && String(price).trim() !== '')
  }

  const formatDateRange = (initialDate, finalDate, campaignSelectedId) => {
    if (!initialDate && !finalDate) {
      return null
    }

    if (String(campaignSelectedId) === '18') {
      return finalDate ? `Validade do Produto: ${finalDate}` : null
    }

    const initial = initialDate || ''
    const final = finalDate || ''

    if (!initial && !final) {
      return null
    }

    return `Validade: ${initial} à ${final}`
  }

  const formatUnit = packaging => {
    if (!packaging) return ''

    const packagingLower = packaging.toLowerCase().trim()

    if (
      packagingLower === 'un' ||
      packagingLower === 'unid' ||
      packagingLower === 'unidade'
    ) {
      return 'à unidade'
    } else if (packagingLower === 'kg' || packagingLower === 'kilo') {
      return 'kg'
    }
    return packagingLower
  }

  const dateText = formatDateRange(
    product.initial_date,
    product.final_date,
    campaignSelected
  )

  // ==========================================
  // LAYOUT 1: CARTAZ VAREJO / OFERTA NORMAL
  // ==========================================
  if (String(campaignType) === '1') {
    return (
      <div className="relative w-full max-w-[500px] aspect-[1/1.4] overflow-hidden rounded-2xl border border-border bg-white">
        {/* Imagem de Fundo do Cartaz */}
        {imageCampaign && (
          <img
            src={imageCampaign}
            alt="Arte da Campanha"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Camada Sobreposta de Dados */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 select-none w-full">
          {/* Descrição e Complemento do Produto */}
          <div className="w-full px-2 text-center break-words">
            <h2 className="text-4xl sm:text-5xl font-bold uppercase leading-tight tracking-tighter text-zinc-950 mb-1 mt-40">
              {product.description}
            </h2>
            {product.complement && (
              <span className="text-xl sm:text-2xl font-bold italic text-zinc-900 leading-tight block">
                {product.complement}
              </span>
            )}
          </div>

          {/* Bloco de Preço Grande */}
          {hasPrice(product.price) && (
            <div
              className={cn(
                'flex items-center justify-center w-full max-w-full overflow-hidden scale-90 sm:scale-100 my-auto',
                priceClass
              )}
            >
              <span className="text-2xl sm:text-3xl font-bold text-red-600 mb-8 sm:mb-10 mr-1.5 self-center">
                R$
              </span>

              <div className="flex items-start">
                {/* Preço Inteiro */}
                <span className="text-7xl sm:text-8xl md:text-9xl font-bold text-red-600 leading-[0.8] tracking-[-0.06em]">
                  {product.priceInteger || product.price?.split(',')[0] || '0'}
                </span>

                {/* Centavos e Unidade */}
                <div className="flex flex-col items-start ml-1 mt-1 sm:mt-2">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 leading-none">
                    {product.priceDecimal ||
                      (product.price?.split(',')[1]
                        ? `,${product.price?.split(',')[1]}`
                        : ',00')}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-red-600 uppercase mt-1">
                    {formatUnit(product.packaging)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé com Validade */}
          {dateText && (
            <div className="absolute bottom-16 w-full px-6 text-left">
              <span className="text-xs sm:text-sm font-bold text-zinc-950 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded backdrop-blur-xs">
                {dateText}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==========================================
  // LAYOUT 2: CARTAZ ATACAREJO (DUPLO PREÇO)
  // ==========================================
  const retailInteger = product.price_retail?.split(',')[0] || '0'
  const retailCents = product.price_retail?.split(',')[1] || '00'
  const wholesaleInteger = product.price_wholesale?.split(',')[0] || '0'
  const wholesaleCents = product.price_wholesale?.split(',')[1] || '00'
  const wholesaleFactor = product.fator_atacado || '3'

  return (
    <div className="relative w-full max-w-[500px] aspect-[1/1.4] overflow-hidden rounded-2xl border border-border bg-white">
      {/* Imagem de Fundo do Cartaz */}
      {imageCampaign && (
        <img
          src={imageCampaign}
          alt="Arte da Campanha"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Camada Sobreposta de Dados do Atacarejo */}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 select-none w-full">
        {/* Topo: Descrição e Complemento */}
        <div className="w-full px-2 text-center break-words pt-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight tracking-tighter text-zinc-950 drop-shadow-sm mb-0.5">
            {product.description}
          </h2>
          {product.complement && (
            <span className="text-lg sm:text-xl font-bold italic text-zinc-800 leading-tight block">
              {product.complement}
            </span>
          )}
        </div>

        {/* Centro: Seção Dupla de Preços */}
        {product.description && (
          <div
            className={cn(
              'flex flex-col items-center justify-center w-full gap-2 sm:gap-3 my-auto border border-red-100',
              priceClass
            )}
          >
            {/* BLOCO 1: PREÇO VAREJO */}
            <div className="flex flex-col items-center w-full bg-zinc-900/5 dark:bg-black/10 rounded-xl p-2 border border-zinc-900/10 backdrop-blur-[1px]">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-900">
                <span className="font-extrabold uppercase">Preço Varejo</span>
                <span className="font-semibold uppercase text-zinc-700">
                  {formatUnit(product.packaging)}
                </span>
              </div>

              <div className="flex items-center justify-center mt-0.5">
                <span className="text-lg sm:text-xl font-black text-red-600 mr-1 self-start pt-1">
                  R$
                </span>
                <span className="text-4xl sm:text-5xl font-black text-red-600 leading-none tracking-tight">
                  {retailInteger}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 leading-none self-start pt-0.5">
                  ,{retailCents}
                </span>
              </div>
            </div>

            {/* BLOCO 2: PREÇO ATACADO (DESTAQUE MAIOR) */}
            <div className="flex flex-col items-center w-full bg-red-600/10 rounded-xl p-2.5 border border-red-600/20 backdrop-blur-[1px]">
              <div className="flex flex-col items-center text-center leading-none text-zinc-950">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-red-700">
                  Preço Atacado
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-700 uppercase mt-0.5">
                  A partir de {wholesaleFactor} unidades
                </span>
              </div>

              <div className="flex items-center justify-center mt-1">
                <span className="text-xl sm:text-2xl font-black text-red-600 mr-1 self-start pt-1">
                  R$
                </span>
                <span className="text-5xl sm:text-6xl md:text-7xl font-black text-red-600 leading-none tracking-tight">
                  {wholesaleInteger}
                </span>

                <div className="flex flex-col items-start ml-0.5 self-start pt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-red-600 leading-none">
                    ,{wholesaleCents}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase mt-0.5">
                    {formatUnit(product.packaging)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé: Validade */}
        {dateText && (
          <div className="w-full text-center pb-2">
            <span className="text-xs sm:text-sm font-bold text-zinc-950 uppercase tracking-wider bg-white/70 px-2 py-0.5 rounded backdrop-blur-xs">
              {dateText}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
