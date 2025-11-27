const knex = require('../database/knex')
const puppeteer = require('puppeteer')
const AppError = require('../utils/AppError')

class PostersPdfController {
  async create(request, response) {
    const { selectedPosterIds, campaignImages } = request.body

    //Função para formatar a data dd/mm/yyyy
    function formatDate(date) {
      const dateFormat = new Date(date)
      const dia = String(dateFormat.getDate()).padStart(2, '0')
      const mes = String(dateFormat.getMonth() + 1).padStart(2, '0')
      const ano = dateFormat.getFullYear()
      return `${dia}/${mes}/${ano}`
    }

    function calculatePriceClass(price) {
      const priceInteger = price
      if (priceInteger.length <= 4) {
        return 'small-price'
      } else if (priceInteger.length === 5) {
        return 'medium-price'
      } else if (priceInteger.length === 6) {
        return 'large-price'
      } else {
        return 'x-large-price'
      }
    }

    function handlePrince(price) {
      const [priceInteger, priceDecimal = ''] = price.split(',')
      return {
        priceInteger,
        priceDecimal: priceDecimal ? `,${priceDecimal}` : ''
      }
    }

    //Função que verifica e gera o pdf somente dos cartazes que estão selecionados no front
    async function generatePdf(selectedPosterIds) {
      // Lançar o navegador com configurações otimizadas para uso de memória
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Importante para sistemas com pouca memória
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080'
        ],
        timeout: 120000 // Aumentar timeout para 2 minutos
      })

      try {
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(60000)

        // Processar em lotes menores
        const BATCH_SIZE = 1 // Reduzir para 1 cartaz por vez
        let allContent = ''

        for (let i = 0; i < selectedPosterIds.length; i += BATCH_SIZE) {
          const batchIds = selectedPosterIds.slice(i, i + BATCH_SIZE)
          let batchContent = ''

          for (const posterId of batchIds) {
            try {
              // Buscar dados do poster
              const poster = await knex('posters').where('id', posterId).first()
              console.log('poster', poster)

              if (!poster) {
                console.error(`Poster com ID: ${posterId} não encontrado`)
                continue
              }

              if (!poster.campaign_id || !campaignImages[poster.campaign_id]) {
                console.error(
                  `Imagem não encontrada para a campanha ID: ${poster.campaign_id}`
                )
                continue
              }

              const campaignImage = campaignImages[poster.campaign_id]

              // Verifica o tipo de campanha
              if (poster.campaign_type_id === 2) {
                // Layout de atacarejo (Tipo 2)
                const wholesaleParts = handlePrince(
                  poster.price_wholesale || '0,00'
                )
                const retailParts = handlePrince(poster.price_retail || '0,00')

                batchContent += `
                <!DOCTYPE html>
                <html lang="pt-br">
                  <head>
                    <meta charset=UTF-8" />
		            <link rel="preconnect" href="https://fonts.googleapis.com">
              	    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		            <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;900&display=swap" rel="stylesheet">

                    <style>
                      body {
                        font-family: "Epilogue", sans-serif;
                        text-align: center;
                      }

                      .view {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: relative;
                      }
                      .view img {
                        width: 100%;
                        height: auto;
                      }

                      .dataView {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        gap: 10px;

                        position: absolute;
                        z-index: 1;

                        width: 620px;
                        height: 750px;

                        margin-top: 170px;
                      }

                      .description {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        width: 100%;
                        height: 200px;
                      }
                      
                      .description h2 {
                        width: 100%;
                        font-size: 55px;
                        color: black;
                        text-align: center;
                        text-transform: uppercase;
                        margin: 35px 0 0;
                        line-height: 1.1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      }
                      
                      .description span {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 27px;
                        font-weight: bold;
                        color: black;
                        text-transform: uppercase;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      }
                      
                      .wholesale {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                        margin-top: 10px;
                      }
                      
                      .infoBox {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 100%;
                      }
                      
                      .infoTitle {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-bottom: 5px;
                      }
                      
                      .infoLabel {
                        font-size: 25px;
                        font-weight: bold;
                      }
                      
                      .min-unidades, .retailInfo {
                        font-size: 18px;
                      }
                      
                      .boxPrice {
                        color: #E4272A;
                        display: flex;
                        justify-content: center;
                      }
                      
                      .priceValue {
                        font-size: 170px;
                        font-weight: 900;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                      }
                      
                      .priceCents {
                        font-size: 70px;
                        vertical-align: super;
                        margin-left: -5px;
                      }
                      
                      .priceValueRetail {
                        font-size: 100px;
                        font-weight: 900;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                      }
                      
                      .priceCentsRetail {
                        font-size: 45px;
                        vertical-align: super;
                        margin-left: -1px;
                      }
                      
                      .date {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        gap: 5px;
                        margin-top: 20px;
                        font-size: 22px;
                        font-weight: bold;
                        text-transform: uppercase;
                        color: black;
                        justify-content: flex-start;
                        padding-left: 40px;
                      }
                      
                      @media screen and (max-width: 450px) {
                        .description h2 {
                          font-size: calc(7vw + 10px);
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="view">
                      <img src="${campaignImage}" />
                      <div class="dataView">
                        <div class="description">
                          <h2>${poster.description}</h2>
                          <span>${
                            poster.complement === null ? '' : poster.complement
                          }</span>
                        </div>
                        
                        <div class="wholesale">
                          <div class="infoBox">
                            <div class="infoTitle">
                              <span class="infoLabel">PREÇO ATACADO</span>
                              <span class="min-unidades">ACIMA DE ${
                                poster.fator_atacado
                              } UNIDADES</span>
                            </div>
                            <div class="boxPrice">
                              <span class="priceValue">
                                ${
                                  wholesaleParts.priceInteger
                                }<span class="priceCents">${
                  wholesaleParts.priceDecimal
                }</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="wholesale">
                          <div class="infoBox">
                            <div class="infoTitle">
                              <span class="infoLabel">PREÇO VAREJO</span>
                              <span class="retailInfo">ATÉ 2 UNIDADES</span>
                            </div>
                            <div class="boxPrice">
                              <span class="priceValueRetail">
                                ${
                                  retailParts.priceInteger
                                }<span class="priceCentsRetail">${
                  retailParts.priceDecimal
                }</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <span class="date">
                          ${formatDate(poster.initial_date)} À ${formatDate(
                  poster.final_date
                )}
                        </span>
                      </div>
                    </div>
                  </body>
                </html>
                `
              } else {
                // Layout padrão (Tipo 1 ou outros)
                const priceClass = calculatePriceClass(poster.price)
                const { priceInteger, priceDecimal } = handlePrince(
                  poster.price
                )

                batchContent += `
                <!DOCTYPE html>
                <html lang="pt-br">
                  <head>
                    <meta charset=UTF-8" />
                    <link rel="preconnect" href="https://fonts.googleapis.com">
              	    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                     <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;900&display=swap" rel="stylesheet">

                    <style>
                      body {
                        font-family: "Epilogue", sans-serif;
                        text-align: center;
                      }

                      .view {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                      }
                      .view img {
                        width: 100%;
                        height: auto;
                      }

                      .dataView {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        flex-wrap: wrap;
                        gap: 8px;

                        position: absolute;
                        z-index: 1;

                        width: 620px;
                        height: 720px;

                        margin-top: 200px;
                      }

                      .description {
                        display: flex;
                        flex-direction: column;
                        gap: 5px;
                        width: 100%;
                        height: 280px;
                      }
                      .description h2 {
                        width: 100%;
                        height: 230px;
                        font-size: 59px;
                        color: black;
                        text-align: center;
                        text-transform: uppercase;
                        margin: 35px 0 0;

                        overflow: hidden;
                        text-overflow: ellipsis;
                      }
                      .description span {
                        width: 100%;
                        height: 45px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 27px;
                        font-weight: bold;
                        color: black;
                        text-transform: uppercase;
   
                        overflow: hidden;
                        text-overflow: ellipsis;
                      }

                      .price {
                        width: 100%;
                        height: 280px;
                        font-weight: 900;
                        display: flex;
                        justify-content: center;
                        color: #E4272A;
                        padding-bottom: 30px;
                      }

                      .priceInteger {
                        display: flex;
                        align-items: center;
                      }

                      .priceDecimal {
                        margin-top: 25px;
                      }
  
                       .small-price .priceInteger {
                        font-size: 390px;
                      }
  
                      .small-price .priceDecimal {
                        font-size: 210px;
                      }
  
                      .medium-price .priceInteger {
                        font-size: 390px;
                      }
  
                      .medium-price .priceDecimal {
                        font-size: 100px;
                        margin-top: 20px;
                      }
  
                      .large-price .priceInteger {
                        font-size: 160px;
                      }
  
                      .large-price .priceDecimal {
                        font-size: 70px;
                      }
  
                      .x-large-price .priceInteger {
                        font-size: 190px;
                      }
  
                      .x-large-price .priceDecimal {
                        font-size: 60px;
                        margin-top: 100px;
                      }

                      .date {
                        display: flex;
                        gap: 5px;
                        text-transform: uppercase;
                        color: black;
                        font-weight: bold;
                      }

                      @media screen and (max-width: 450px) {
                        .description h2 {
                          font-size: calc(7vw + 10px);
                        }
                      }

                    </style>
                  </head>
                  <body>
                    <div class="view">
                      <img src="${campaignImage}" />
                      <div class="dataView">
                        <div class="description">
                          <h2>${poster.description}</h2>
                          <span>${
                            poster.complement === null ? '' : poster.complement
                          }</span>
                        </div>
                        <div class="price ${priceClass}">
                          <span class="priceInteger">${priceInteger}</span>
                          <span class="priceDecimal">${priceDecimal}</span>
                        </div>
                        <span class="date"> Validade: ${formatDate(
                          poster.initial_date
                        )} à ${formatDate(poster.final_date)} </span>
                      </div>
                    </div>
                  </body>
                </html>
                `
              }
            } catch (error) {
              console.error(
                `Erro ao processar o poster com ID: ${posterId}`,
                error
              )
            }
          }

          // Adiciona o conteúdo do lote atual ao conteúdo completo
          allContent += batchContent

          // Liberar memória entre lotes
          if (global.gc) {
            global.gc()
          }
        }

        if (!allContent) {
          throw new Error('Nenhum conteúdo foi gerado para o PDF')
        }

        // Definir o conteúdo da página com timeout maior
        await page.setContent(allContent, {
          waitUntil: 'networkidle0',
          timeout: 60000,
          encoding: 'utf-8'
        })

        const pdfBuffer = await page.pdf({
          format: 'A4',
          margin: {
            top: '2mm',
            bottom: '2mm',
            left: '2mm',
            right: '2mm'
          }
        })

        return pdfBuffer
      } finally {
        await browser.close()
      }
    }

    try {
      console.log(
        'Iniciando geração do PDF para',
        selectedPosterIds.length,
        'cartazes'
      )
      const pdfBuffer = await generatePdf(selectedPosterIds)
      console.log('PDF gerado com sucesso, tamanho:', pdfBuffer.length)

      const currentDate = formatDate(new Date())

      response.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=cartaz_${currentDate}.pdf`
      })

      response.end(pdfBuffer)
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error.message, error.stack)
      response.status(500).send('Erro ao gerar o PDF')
    }
  }
}

module.exports = PostersPdfController
