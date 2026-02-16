const knex = require('../database/knex')
const puppeteer = require('puppeteer')
const AppError = require('../utils/AppError')

class PostersPdfController {
  async create(request, response) {
    const { selectedPosterIds, campaignImages, campaignId } = request.body

    console.log('campanha:', campaignId)

    //Função para formatar a data dd/mm/yyyy
    function formatDate(date) {
      if (!date) return ''

      const dateFormat = new Date(date)
      if (isNaN(dateFormat.getTime())) return ''

      const dia = String(dateFormat.getDate()).padStart(2, '0')
      const mes = String(dateFormat.getMonth() + 1).padStart(2, '0')
      const ano = dateFormat.getFullYear()
      return `${dia}/${mes}/${ano}`
    }

    function calculatePriceClass(price) {
      const priceInteger = price // Remover vírgula se houver
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

    function formatDateByCampaign(initialDate, finalDate, campaignId) {
      if (!initialDate && !finalDate) {
        return ''
      }
      // Se for campanha ID 18, mostrar apenas data final como "Validade do Produto"
      if (String(campaignId) === '3') {
        if (!finalDate) {
          return '' // Se não tem data final, retorna vazio
        }
        return `Validade do Produto: ${formatDate(finalDate)}`
      } else {
        if (!initialDate || !finalDate) {
          return '' // Se alguma das datas for null, retorna vazio
        }
        // Para outras campanhas, mostrar período completo como "Validade da Campanha"
        return `Validade: ${formatDate(initialDate)} à ${formatDate(finalDate)}`
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

    //Função que verifica e gera o pdf somente dos cartazes que estão selecionados no front
    async function generatePdf(selectedPosterIds) {
      // const browser = await puppeteer.launch({
      //   headless: true,
      //   args: [
      //     '--no-sandbox',
      //     '--disable-setuid-sandbox',
      //     '--disable-gpu',
      //     '--window-size=1920x1080'
      //   ],
      //   timeout: 60000
      // })

      const browser = await puppeteer.launch({
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Importante para evitar crash por falta de memória em containers
          '--headless=new'
        ]
      })
      const page = await browser.newPage()
      let posterContent = ''

      for (const posterId of selectedPosterIds) {
        try {
          // Buscar dados do poster
          const poster = await knex('posters').where('id', posterId).first()
          console.log('poster', poster)

          if (!poster) {
            console.error(`Poster com ID: ${posterId} não encontrado`)
            continue
          }

          const campaignImage = campaignImages[poster.campaign_id]

          const validityText = formatDateByCampaign(
            poster.initial_date,
            poster.final_date,
            poster.campaign_id
          )

          // Verifica o tipo de campanha
          if (poster.campaign_type_id === 2) {
            // Layout de atacarejo (Tipo 2)
            const wholesaleParts = handlePrince(
              poster.price_wholesale || '0,00'
            )
            const retailParts = handlePrince(poster.price_retail || '0,00')

            posterContent += `
           <!DOCTYPE html>
            <html lang="pt-br">
              <head>
                <meta charset="UTF-8" />
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;900&display=swap" rel="stylesheet">
              <style>
                body {
        font-family: 'Epilogue', sans-serif;
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

        width: 650px;
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
        gap: 6px;
        flex-direction: column;
        align-items: center;
        margin-bottom: 5px;
      }

      .infoLabel {
        font-size: 25px;
        font-weight: bold;
      }

      .min-unidades,
      .retailInfo {
        font-size: 18px;
      }

      .boxPrice {
        color: #e4272a;
        display: flex;
        justify-content: center;
      }

      .boxValue {
        font-size: 30px;
        font-weight: 900;
        color: #e4272a;
        margin: 35px 10px 0 0;
      }

      .boxPriceValue {
        display: flex;
        align-items: flex-start;
        /* line-height: 120px; */
      }

      .priceValue {
        font-size: 220px;
        font-weight: 900;
        line-height: 1;
        margin: 0;
        padding: 0;
        display: inline-block;

        font-kerning: none;
        letter-spacing: 0;

        vertical-align: top;
      }

      .unit {
        font-size: 20px;
        font-weight: normal;
      }

      .priceCents {
        font-size: 110px;
        font-weight: 900;
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
      }

      .priceValueRetail {
        font-size: 140px;
        font-weight: 900;
        line-height: 1;
        display: flex;
        align-items: center;
      }

      .priceCentsRetail {
        font-size: 70px;
        font-weight: 900;
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
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
                          <span class="infoLabel">PREÇO VAREJO</span>
                          <span class="retailInfo">À UNIDADE</span>
                        </div>
                        <div class="boxPrice">
                        <span class="boxValue">R$</span>
                          <div class="boxPriceValue">
                            <span class="priceValueRetail">
                              ${retailParts.priceInteger}
                            </span>
                            <span class="priceCentsRetail">${
                              retailParts.priceDecimal
                            }
                            <span class="unit">${formatUnit(
                              poster.packaging
                            )}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="wholesale">
                      <div class="infoBox">
                        <div class="infoTitle">
                          <span class="infoLabel">PREÇO ATACADO</span>
                          <span class="min-unidades">A PARTIR DE 3 UNIDADES</span>
                        </div>
                        <div class="boxPrice">
                        <span class="boxValue">R$</span>
                        <div class="boxPriceValue">
                          <span class="priceValue">
                            ${wholesaleParts.priceInteger}
                            </span>
                            <span class="priceCents">${
                              wholesaleParts.priceDecimal
                            }
                            <span class="unit">${formatUnit(
                              poster.packaging
                            )}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span class="date">
                      ${validityText}
                    </span>
                  </div>
                </div>
              </body>
            </html>
            `
          } else {
            // Layout padrão (Tipo 1 ou outros)
            const priceClass = calculatePriceClass(poster.price)
            const { priceInteger, priceDecimal } = handlePrince(poster.price)

            posterContent += `
            <!DOCTYPE html>
            <html lang="pt-br">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                  body {
                    font-family: Helvetica, sans-serif;
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

                      .boxValue {
        font-size: 30px;
        font-weight: 900;
        color: #e4272a;
        margin: 35px 10px 0 0;
        display: flex;
        align-items: center;
      }

      .priceWrapperDecimal {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

    .unit {
        font-size: 24px;
        font-weight: bold;
        margin-right: 10px;
      }
    
                  .priceInteger {
                    display: flex;
                    align-items: center;
                  }
    
                  .priceDecimal {
                    margin-top: -65px;
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
                    margin-top: 70px;
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
                    font-size: 26px;
                  }
    
                  @media screen and (max-width: 450px) {
                    .description h2 {
                      font-size: calc(7vw + 10px); /* Tamanho proporcional à largura da janela */
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
                    <span class="boxValue">R$</span>
                    <span class="priceInteger">${priceInteger}</span>
                      <div class="priceWrapperDecimal">
                        <span class="priceDecimal">${priceDecimal}</span>
                        <span class="unit">${formatUnit(
                          poster.packaging
                        )}</span>
                      </div>
                    </div>
                    <span class="date">${validityText}</span>
                  </div>
                </div>
              </body>
            </html>
            `
          }
        } catch (error) {
          console.error(`Erro ao processar o poster com ID: ${posterId}`, error)
        }
      }
      if (!posterContent) {
        throw new Error('Nenhum conteúdo foi gerado para o PDF')
      }

      await page.setContent(posterContent, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '2mm',
          bottom: '2mm',
          left: '2mm',
          right: '2mm'
        }
      })

      await browser.close()
      return pdfBuffer
    }

    try {
      const pdfBuffer = await generatePdf(selectedPosterIds)
      const currentDate = formatDate(new Date())

      response.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=cartaz_${currentDate}.pdf`
      })

      response.end(pdfBuffer)
    } catch (error) {
      console.error(error)
      response.status(500).send('Erro ao gerar o PDF')
    }
  }
}

module.exports = PostersPdfController
