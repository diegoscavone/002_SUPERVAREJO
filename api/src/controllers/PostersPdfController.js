const knex = require('../database/knex')
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const AppError = require('../utils/AppError')

class PostersPdfController {
  async create(request, response) {
    const { selectedPosterIds, campaignImages, campaignId } = request.body

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

    function formatDateByCampaign(initialDate, finalDate, isVencimento) {
      if (!initialDate && !finalDate) {
        return ''
      }
      // Se for campanha ID 18, mostrar apenas data final como "Validade do Produto"
      if (isVencimento) {
        return finalDate ? `Validade do Produto: ${formatDate(finalDate)}` : ''
      } else {
        if (initialDate && finalDate) {
          return `Validade: ${formatDate(initialDate)} à ${formatDate(finalDate)}`
        }
        return finalDate ? `Validade: ${formatDate(finalDate)}` : ''
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
    //     async function generatePdf(selectedPosterIds) {
    //       const isDocker = process.env.PUPPETEER_EXECUTABLE_PATH !== undefined
    //       const exePath = isDocker
    //         ? process.env.PUPPETEER_EXECUTABLE_PATH
    //         : process.env.CHROME_PATH

    //       console.log('Iniciando browser no caminho:', exePath)
    //       const browser = await puppeteer.launch({
    //         executablePath: exePath,
    //         headless: 'new',
    //         pipe: true,
    //         args: [
    //           '--no-sandbox',
    //           '--disable-setuid-sandbox',
    //           '--disable-dev-shm-usage',
    //           '--disable-gpu',
    //           '--no-zygote',
    //           '--single-process'
    //         ],
    //         // timeout: 60000
    //       })
    //       const page = await browser.newPage()
    //       let posterContent = ''

    //       for (const posterId of selectedPosterIds) {
    //         try {
    //           // Buscar dados do poster
    //           const poster = await knex('posters as p')
    //             .select('p.*', 'c.is_vencimento', 'c.name as campaign_name')
    //             .join('campaigns as c', 'p.campaign_id', 'c.id')
    //             .whereIn('p.id', selectedPosterIds)
    //           console.log('poster', poster)

    //           if (!poster) {
    //             console.error(`Poster com ID: ${posterId} não encontrado`)
    //             continue
    //           }

    //           const campaignImage = campaignImages[poster.campaign_id]

    //           const validityText = formatDateByCampaign(
    //             poster.initial_date,
    //             poster.final_date,
    //             !!poster.is_vencimento
    //           )

    //           // Verifica o tipo de campanha
    //           if (poster.campaign_type_id === 2) {
    //             // Layout de atacarejo (Tipo 2)
    //             const wholesaleParts = handlePrince(
    //               poster.price_wholesale || '0,00'
    //             )
    //             const retailParts = handlePrince(poster.price_retail || '0,00')

    //             posterContent += `
    //            <!DOCTYPE html>
    //             <html lang="pt-br">
    //               <head>
    //                 <meta charset="UTF-8" />
    //               <link rel="preconnect" href="https://fonts.googleapis.com">
    //               <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    //               <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    //                 <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@700;900&display=swap" rel="stylesheet">
    //               <style>
    //                 body {
    //         font-family: 'Epilogue', sans-serif;
    //         text-align: center;
    //       }

    //       .view {
    //         display: flex;
    //         justify-content: center;
    //         align-items: center;
    //         position: relative;
    //       }
    //       .view img {
    //         width: 100%;
    //         height: auto;
    //       }

    //       .dataView {
    //         display: flex;
    //         flex-direction: column;
    //         justify-content: space-between;
    //         align-items: center;
    //         gap: 10px;

    //         position: absolute;
    //         z-index: 1;

    //         width: 650px;
    //         height: 750px;

    //         margin-top: 170px;
    //       }

    //       .description {
    //         display: flex;
    //         flex-direction: column;
    //         gap: 5px;
    //         width: 100%;
    //         height: 200px;
    //       }

    //       .description h2 {
    //         width: 100%;
    //         font-size: 55px;
    //         color: black;
    //         text-align: center;
    //         text-transform: uppercase;
    //         margin: 35px 0 0;
    //         line-height: 1.1;
    //         overflow: hidden;
    //         text-overflow: ellipsis;
    //       }

    //       .description span {
    //         width: 100%;
    //         display: flex;
    //         align-items: center;
    //         justify-content: center;
    //         font-size: 27px;
    //         font-weight: bold;
    //         color: black;
    //         text-transform: uppercase;
    //         overflow: hidden;
    //         text-overflow: ellipsis;
    //       }

    //       .wholesale {
    //         display: flex;
    //         flex-direction: column;
    //         align-items: center;
    //         width: 100%;
    //         margin-top: 10px;
    //       }

    //       .infoBox {
    //         display: flex;
    //         flex-direction: column;
    //         align-items: center;
    //         width: 100%;
    //       }

    //       .infoTitle {
    //         display: flex;
    //         gap: 6px;
    //         flex-direction: column;
    //         align-items: center;
    //         margin-bottom: 5px;
    //       }

    //       .infoLabel {
    //         font-size: 25px;
    //         font-weight: bold;
    //       }

    //       .min-unidades,
    //       .retailInfo {
    //         font-size: 18px;
    //       }

    //       .boxPrice {
    //         color: #e4272a;
    //         display: flex;
    //         justify-content: center;
    //       }

    //       .boxValue {
    //         font-size: 30px;
    //         font-weight: 900;
    //         color: #e4272a;
    //         margin: 35px 10px 0 0;
    //       }

    //       .boxPriceValue {
    //         display: flex;
    //         align-items: flex-start;
    //         /* line-height: 120px; */
    //       }

    //       .priceValue {
    //         font-size: 220px;
    //         font-weight: 900;
    //         line-height: 1;
    //         margin: 0;
    //         padding: 0;
    //         display: inline-block;

    //         font-kerning: none;
    //         letter-spacing: 0;

    //         vertical-align: top;
    //       }

    //       .unit {
    //         font-size: 20px;
    //         font-weight: normal;
    //       }

    //       .priceCents {
    //         font-size: 110px;
    //         font-weight: 900;
    //         display: flex;
    //         flex-direction: column;
    //         gap: 4px;
    //         align-items: flex-end;
    //       }

    //       .priceValueRetail {
    //         font-size: 140px;
    //         font-weight: 900;
    //         line-height: 1;
    //         display: flex;
    //         align-items: center;
    //       }

    //       .priceCentsRetail {
    //         font-size: 70px;
    //         font-weight: 900;
    //         display: flex;
    //         flex-direction: column;
    //         gap: 4px;
    //         align-items: flex-end;
    //       }

    //       .date {
    //         display: flex;
    //         align-items: center;
    //         width: 100%;
    //         gap: 5px;
    //         margin-top: 20px;
    //         font-size: 22px;
    //         font-weight: bold;
    //         text-transform: uppercase;
    //         color: black;
    //         justify-content: flex-start;
    //         padding-left: 40px;
    //       }

    //       @media screen and (max-width: 450px) {
    //         .description h2 {
    //           font-size: calc(7vw + 10px);
    //         }
    //       }
    //         @media print {
    //   body { margin: 0; }
    //   .view {
    //     page-break-after: always;
    //     height: 100vh; /* Garante que o cartaz ocupe a página toda */
    //   }
    // }
    //                 </style>
    //               </head>
    //               <body>
    //                 <div class="view">
    //                   <img src="${campaignImage}" />
    //                   <div class="dataView">
    //                     <div class="description">
    //                       <h2>${poster.description}</h2>
    //                       <span>${
    //                         poster.complement === null ? '' : poster.complement
    //                       }</span>
    //                     </div>

    //                     <div class="wholesale">
    //                       <div class="infoBox">
    //                         <div class="infoTitle">
    //                           <span class="infoLabel">PREÇO VAREJO</span>
    //                           <span class="retailInfo">À UNIDADE</span>
    //                         </div>
    //                         <div class="boxPrice">
    //                         <span class="boxValue">R$</span>
    //                           <div class="boxPriceValue">
    //                             <span class="priceValueRetail">
    //                               ${retailParts.priceInteger}
    //                             </span>
    //                             <span class="priceCentsRetail">${
    //                               retailParts.priceDecimal
    //                             }
    //                             <span class="unit">${formatUnit(
    //                               poster.packaging
    //                             )}</span>
    //                             </span>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>

    //                     <div class="wholesale">
    //                       <div class="infoBox">
    //                         <div class="infoTitle">
    //                           <span class="infoLabel">PREÇO ATACADO</span>
    //                           <span class="min-unidades">A PARTIR DE 3 UNIDADES</span>
    //                         </div>
    //                         <div class="boxPrice">
    //                         <span class="boxValue">R$</span>
    //                         <div class="boxPriceValue">
    //                           <span class="priceValue">
    //                             ${wholesaleParts.priceInteger}
    //                             </span>
    //                             <span class="priceCents">${
    //                               wholesaleParts.priceDecimal
    //                             }
    //                             <span class="unit">${formatUnit(
    //                               poster.packaging
    //                             )}</span>
    //                             </span>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </div>

    //                     <span class="date">
    //                       ${validityText}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </body>
    //             </html>
    //             `
    //           } else {
    //             // Layout padrão (Tipo 1 ou outros)
    //             const priceClass = calculatePriceClass(poster.price)
    //             const { priceInteger, priceDecimal } = handlePrince(poster.price)

    //             posterContent += `
    //             <!DOCTYPE html>
    //             <html lang="pt-br">
    //               <head>
    //                 <meta charset="UTF-8" />
    //                 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    //                 <style>
    //                   body {
    //                     font-family: Helvetica, sans-serif;
    //                     text-align: center;
    //                   }

    //                   .view {
    //                     display: flex;
    //                     justify-content: center;
    //                     align-items: center;
    //                   }
    //                   .view img {
    //                     width: 100%;
    //                     height: auto;
    //                   }

    //                   .dataView {
    //                     display: flex;
    //                     flex-direction: column;
    //                     justify-content: space-between;
    //                     flex-wrap: wrap;
    //                     gap: 8px;

    //                     position: absolute;
    //                     z-index: 1;

    //                     width: 620px;
    //                     height: 720px;

    //                     margin-top: 200px;
    //                   }

    //                   .description {
    //                     display: flex;
    //                     flex-direction: column;
    //                     gap: 5px;
    //                     width: 100%;
    //                     height: 280px;
    //                   }
    //                   .description h2 {
    //                     width: 100%;
    //                     height: 230px;
    //                     font-size: 59px;
    //                     color: black;
    //                     text-align: center;
    //                     text-transform: uppercase;
    //                     margin: 35px 0 0;

    //                     overflow: hidden;
    //                     text-overflow: ellipsis;
    //                   }
    //                   .description span {
    //                     width: 100%;
    //                     height: 45px;
    //                     display: flex;
    //                     align-items: center;
    //                     justify-content: center;
    //                     font-size: 27px;
    //                     font-weight: bold;
    //                     color: black;
    //                     text-transform: uppercase;

    //                     overflow: hidden;
    //                     text-overflow: ellipsis;
    //                   }

    //                   .price {
    //                     width: 100%;
    //                     height: 280px;
    //                     font-weight: 900;
    //                     display: flex;
    //                     justify-content: center;
    //                     color: #E4272A;
    //                     padding-bottom: 30px;
    //                   }

    //                       .boxValue {
    //         font-size: 30px;
    //         font-weight: 900;
    //         color: #e4272a;
    //         margin: 35px 10px 0 0;
    //         display: flex;
    //         align-items: center;
    //       }

    //       .priceWrapperDecimal {
    //   display: flex;
    //   flex-direction: column;
    //   align-items: flex-end;
    // }

    //     .unit {
    //         font-size: 24px;
    //         font-weight: bold;
    //         margin-right: 10px;
    //       }

    //                   .priceInteger {
    //                     display: flex;
    //                     align-items: center;
    //                   }

    //                   .priceDecimal {
    //                     margin-top: -65px;
    //                   }

    //                    .small-price .priceInteger {
    //                     font-size: 390px;
    //                   }

    //                   .small-price .priceDecimal {
    //                     font-size: 210px;
    //                   }

    //                   .medium-price .priceInteger {
    //                     font-size: 390px;
    //                   }

    //                   .medium-price .priceDecimal {
    //                     font-size: 100px;
    //                     margin-top: 20px;
    //                   }

    //                   .large-price .priceInteger {
    //                     font-size: 160px;
    //                   }

    //                   .large-price .priceDecimal {
    //                     font-size: 70px;
    //                     margin-top: 70px;
    //                   }

    //                   .x-large-price .priceInteger {
    //                     font-size: 190px;
    //                   }

    //                   .x-large-price .priceDecimal {
    //                     font-size: 60px;
    //                     margin-top: 100px;
    //                   }

    //                   .date {
    //                     display: flex;
    //                     gap: 5px;
    //                     text-transform: uppercase;
    //                     color: black;
    //                     font-weight: bold;
    //                     font-size: 26px;
    //                   }

    //                   @media screen and (max-width: 450px) {
    //                     .description h2 {
    //                       font-size: calc(7vw + 10px); /* Tamanho proporcional à largura da janela */
    //                     }
    //                   }
    //                     @media print {
    //   body { margin: 0; }
    //   .view {
    //     page-break-after: always;
    //     height: 100vh; /* Garante que o cartaz ocupe a página toda */
    //   }
    // }

    //                 </style>
    //               </head>
    //               <body>
    //                 <div class="view">
    //                   <img src="${campaignImage}" />
    //                   <div class="dataView">
    //                     <div class="description">
    //                       <h2>${poster.description}</h2>
    //                       <span>${
    //                         poster.complement === null ? '' : poster.complement
    //                       }</span>
    //                     </div>
    //                     <div class="price ${priceClass}">
    //                     <span class="boxValue">R$</span>
    //                     <span class="priceInteger">${priceInteger}</span>
    //                       <div class="priceWrapperDecimal">
    //                         <span class="priceDecimal">${priceDecimal}</span>
    //                         <span class="unit">${formatUnit(
    //                           poster.packaging
    //                         )}</span>
    //                       </div>
    //                     </div>
    //                     <span class="date">${validityText}</span>
    //                   </div>
    //                 </div>
    //               </body>
    //             </html>
    //             `
    //           }
    //         } catch (error) {
    //           console.error(`Erro ao processar o poster com ID: ${posterId}`, error)
    //         }
    //       }
    //       if (!posterContent) {
    //         throw new Error('Nenhum conteúdo foi gerado para o PDF')
    //       }

    //       await page.setContent(posterContent, {
    //         waitUntil: 'networkidle0',
    //         timeout: 60000
    //       })

    //       const pdfBuffer = await page.pdf({
    //         format: 'A4',
    //         margin: {
    //           top: '2mm',
    //           bottom: '2mm',
    //           left: '2mm',
    //           right: '2mm'
    //         }
    //       })

    //       await browser.close()
    //       return pdfBuffer
    //     }

    async function generatePdf(selectedPosterIds) {
      const isDocker = process.env.PUPPETEER_EXECUTABLE_PATH !== undefined
      const exePath = isDocker
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : process.env.CHROME_PATH

      const browser = await puppeteer.launch({
        executablePath: exePath,
        headless: 'new',
        pipe: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-zygote',
          '--single-process'
        ]
      })

      try {
        const page = await browser.newPage()
        let posterContent = ''

        // BUSCA TUDO DE UMA VEZ
        const allPostersData = await knex('posters as p')
          .select('p.*', 'c.is_vencimento', 'c.name as campaign_name')
          .join('campaigns as c', 'p.campaign_id', 'c.id')
          .whereIn('p.id', selectedPosterIds)

        console.log(`Gerando ${allPostersData.length} cartazes.`)

        const localCampaignCache = {}
        for (const poster of allPostersData) {
          let campaignId = poster.campaign_id

          if (!localCampaignCache[campaignId]) {
            const campaign = await knex('campaigns')
              .where({ id: campaignId })
              .first()
            const fileName = campaign ? campaign.image : null

            if (fileName) {
              // Caminho absoluto onde as imagens ficam no Docker
              const filePath = path.resolve(
                '/app',
                'src',
                'tmp',
                'uploads',
                fileName
              )

              console.log('Lendo imagem no Docker em:', filePath)
              try {
                if (fs.existsSync(filePath)) {
                  const fileBuffer = fs.readFileSync(filePath)
                  const base64Image = fileBuffer.toString('base64')
                  const extension = path
                    .extname(fileName)
                    .replace('.', '')
                    .toLowerCase()

                  localCampaignCache[campaignId] =
                    `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${base64Image}`
                } else {
                  // Se falhar o primeiro, tenta o caminho relativo à raiz do processo
                  const fallbackPath = path.resolve(
                    process.cwd(),
                    'src',
                    'tmp',
                    'uploads',
                    fileName
                  )
                  console.error(
                    `Arquivo não achado em ${filePath}, tentando fallback: ${fallbackPath}`
                  )

                  if (fs.existsSync(fallbackPath)) {
                    const fileBuffer = fs.readFileSync(fallbackPath)
                    localCampaignCache[campaignId] =
                      `data:image/jpeg;base64,${fileBuffer.toString('base64')}`
                  } else {
                    localCampaignCache[campaignId] = null
                  }
                }
              } catch (err) {
                console.error(`Erro ao ler arquivo físico: ${filePath}`, err)
                localCampaignCache[campaignId] = null
              }
            } else {
              localCampaignCache[campaignId] = null
            }
          }
          const campaignImage = localCampaignCache[campaignId]

          if (!campaignImage) {
            console.error(`Imagem não encontrada para a campanha ${campaignId}`)
            continue
          }

          const validityText = formatDateByCampaign(
            poster.initial_date,
            poster.final_date,
            !!poster.is_vencimento
          )

          // Verificamos o layout (Tipo 2 = Atacarejo, Outros = Padrão)
          if (poster.campaign_type_id === 2) {
            const wholesaleParts = handlePrince(
              poster.price_wholesale || '0,00'
            )
            const retailParts = handlePrince(poster.price_retail || '0,00')
            const quantityFrom = 3

            // Montando o bloco de Atacarejo
            posterContent += `
        <div class="view">
            <img src="${campaignImage}" />
            <div class="dataView">
                <div class="description">
                    <h2>${poster.description}</h2>
                    <span>${poster.complement || ''}</span>
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
                                <span class="priceValueRetail">${retailParts.priceInteger}</span>
                                <span class="priceCentsRetail">
                                    ${retailParts.priceDecimal}
                                    <span class="unit">${formatUnit(poster.packaging)}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="wholesale">
                    <div class="infoBox">
                        <div class="infoTitle">
                            <span class="infoLabel">PREÇO ATACADO</span>
                            <span class="min-unidades">A PARTIR DE ${quantityFrom} UNIDADES</span>
                        </div>
                        <div class="boxPrice">
                            <span class="boxValue">R$</span>
                            <div class="boxPriceValue">
                                <span class="priceValue">${wholesaleParts.priceInteger}</span>
                                <span class="priceCents">
                                    ${wholesaleParts.priceDecimal}
                                    <span class="unit">${formatUnit(poster.packaging)}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="dateWholesale">${validityText}</span>
            </div>
        </div>
        `
          } else {
            const priceClass = calculatePriceClass(poster.price)
            const { priceInteger, priceDecimal } = handlePrince(poster.price)

            // Montando o bloco Padrão
            posterContent += `
        <div class="view">
            <img src="${campaignImage}" />
            <div class="dataView">
                <div class="description">
                    <h2>${poster.description}</h2>
                    <span>${poster.complement || ''}</span>
                </div>
                <div class="price ${priceClass}">
                    <span class="boxValue">R$</span>
                    <span class="priceInteger">${priceInteger}</span>
                    <div class="priceWrapperDecimal">
                        <span class="priceDecimal">${priceDecimal}</span>
                        <span class="unit">${formatUnit(poster.packaging)}</span>
                    </div>
                </div>
                <span class="date">${validityText}</span>
            </div>
        </div>
        `
          }
        }

        if (!posterContent) throw new Error('Nenhum conteúdo gerado')

        const finalHtml = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8" />
    <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arimo', sans-serif; text-align: center; background: white; font-weight: 700;}

        /* Estrutura de folha A4 */
        .view { 
            position: relative; 
            width: 100vw; 
            height: 100vh; 
            overflow: hidden; 
            display: flex;
            justify-content: center;
            page-break-after: always; /* Crucial para o PDF */
        }

        .view img { width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0; z-index: 1; }

        .dataView { 
            position: absolute; 
            z-index: 2; 
            width: 650px; 
            height: 740px; 
            margin-top: 290px; 
            display: flex; 
            flex-direction: column; 
            justify-content: space-between; 
            align-items: center;
        }

        /* Descrição */
        .description { display: flex; flex-direction: column; gap: 5px; width: 100%; height: 190px;}
        .description h2 { font-size: 55px; color: black; text-transform: uppercase; line-height: 1.1; overflow: hidden; }
        .description span { font-size: 27px; font-weight: bold; color: black; text-transform: uppercase; }

        /* Preços Atacarejo */
        .wholesale { display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: 10px;}
        .infoBox {width: 100%;}
        .infoTitle { display: flex; gap: 6px; flex-direction: column; align-items: center; margin-bottom: 5px; }
        .infoLabel { font-size: 25px; font-weight: bold; }
        .min-unidades, .retailInfo { font-size: 18px; }
         .priceValue { font-size: 220px;  line-height: 1; margin: 0; }
        .priceCents { font-size: 110px;  display: flex; flex-direction: column; align-items: flex-end; }
        .priceValueRetail { font-size: 140px; line-height: 1; display: flex; align-items: center; }
        .priceCentsRetail { font-size: 70px;  display: flex; flex-direction: column; align-items: flex-end; }
        
        .boxPriceValue {display: flex;}
        .boxPrice { color: #e4272a; display: flex;align-items: center; justify-content: center; width: 100%;}
        .boxValue { font-size: 30px; color: #e4272a; margin: 0 10px 0 0; display: flex; align-items: center;}
       
        /* Preços Padrão */
        .price { width: 100%; height: 340px; font-weight: 700; display: flex; justify-content: center; color: #E4272A;}
        .priceWrapperDecimal { display: flex; flex-direction: column; align-items: flex-end;justify-content: center;}
        
        /* Classes Dinâmicas de Tamanho */
        /*Ex: 9,99*/
        .small-price .priceInteger { font-size: 390px;}
        .small-price .priceDecimal { font-size: 210px; }
        /*Ex: 25,99*/
        .medium-price .priceInteger { font-size: 300px;}
        .medium-price .priceDecimal { font-size: 150px; margin-top: 20px; }
        /*Ex: 109,99*/
        .large-price .priceInteger { font-size: 240px;} 
        .large-price .priceDecimal { font-size: 120px; margin-top: 10px;}
        /*Ex: 1.135,99*/
        .priceInteger { display: flex; align-items: center; font-size: 190px; }
        .priceDecimal{font-size: 100px;}

        .unit { font-size: 28px; font-weight: bold; color: #e4272a; }
        .date { font-size: 22px; text-transform: uppercase; color: black; width: 100%; text-align: left;}
        .dateWholesale { font-size: 22px; text-transform: uppercase; color: black; margin-top: 70px; width: 100%; text-align: left;}


        @media print {
            body { -webkit-print-color-adjust: exact; }
            .view { height: 100vh; width: 100vw; }
        }
    </style>
</head>
<body>
    ${posterContent}
</body>
</html>
`

        await page.setContent(finalHtml, {
          waitUntil: 'networkidle0',
          timeout: 90000
        })
        return await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', bottom: '0', left: '0', right: '0' }
        })
      } finally {
        await browser.close()
      }
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
