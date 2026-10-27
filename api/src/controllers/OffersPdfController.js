// No seu controlador de ofertas (ou criar um novo controlador)
const puppeteer = require('puppeteer')
const { getBrowserExecutablePath } = require('../utils/getBrowserPath')
const path = require('path')
const fs = require('fs')
const os = require('os')

class OffersPdfController {
  constructor() {
    // Vincular os métodos ao contexto da classe
    this.generateOfferPDF = this.generateOfferPDF.bind(this)
    this.generateOfferTableHTML = this.generateOfferTableHTML.bind(this)
  }
  async generateOfferPDF(request, response) {
    let browser

    try {
      const { produtos, name, initialDate, finalDate } = request.body

      if (!produtos || produtos.length === 0) {
        return response.status(400).json({
          error: 'É necessário fornecer pelo menos um produto'
        })
      }

      // Criação do template HTML
      const html = this.generateOfferTableHTML(
        produtos,
        name,
        initialDate,
        finalDate
      )

      // Resolução dinâmica do executável (Windows, Linux, macOS ou Docker)
      const executablePath = getBrowserExecutablePath()

      browser = await puppeteer.launch({
        executablePath,
        headless: 'new', // compatível com versões recentes do Puppeteer
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions',
          '--font-render-hinting=none'
        ]
      })

      const page = await browser.newPage()

      // Renderiza o HTML no navegador
      await page.setContent(html, { waitUntil: 'networkidle0' })

      // Gera o PDF diretamente como Buffer na memória (sem depender do disco rígido)
      const pdfBuffer = await page.pdf({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      })

      // Headers para visualização inline no navegador
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader(
        'Content-Disposition',
        'inline; filename=tabela-ofertas.pdf'
      )
      response.setHeader('Content-Length', pdfBuffer.length)

      return response.end(pdfBuffer)
    } catch (error) {
      console.error('Erro ao gerar PDF de ofertas:', error)
      return response.status(500).json({
        error: 'Erro ao gerar o PDF',
        details: error.message
      })
    } finally {
      // Garante que o processo do Chromium seja encerrado mesmo se houver erro
      if (browser) {
        await browser.close()
      }
    }
  }

  generateOfferTableHTML(produtos, offerName, initalDateStr, finalDateStr) {
    const title = offerName ? `${offerName.toUpperCase()}` : 'TABELA DE OFERTAS'

    const formatDate = dateStr => {
      if (!dateStr) return ''
      try {
        if (dateStr.includes('/')) return dateStr
        const parts = dateStr.split('-')
        if (parts.length === 3) {
          return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`
        }
        return dateStr
      } catch (error) {
        console.error('Erro ao formatar data:', error)
        return dateStr
      }
    }

    const formattedInitialDate = formatDate(initalDateStr)
    const formattedFinalDate = formatDate(finalDateStr)

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #16A021;
            color: white;
            font-weight: bold;
            text-align: center;
            padding: 6px;
            font-size: 12px;
          }
          td {
            padding: 6px;
            border: 1px solid #ddd;
            vertical-align: middle;
          }
          tr:nth-child(even) {
            background-color: white;
          }
          tr:nth-child(odd) {
            background-color: #f0fff0;
          }
          .price-offer {
            color: red;
            font-weight: bold;
            text-align: right;
            font-size: 13px;
          }
          .price {
            text-align: right;
          }
          .margin {
            text-align: right;
          }
          .margin.negative {
            color: red;
          }
          .margin.warning {
            color: orange;
          }
          .margin.positive {
            color: green;
          }
          .validity {
            color: red;
            font-weight: bold;
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
          }
          .description {
            max-width: 320px;
            word-wrap: break-word;
          }
          .id {
            text-align: center;
            width: 50px;
            font-size: 12px;
          }
          .col-price {
            width: 70px;
          }
          .col-margin {
            width: 50px;
          }
          h1 {
            text-align: center;
            font-size: 18px;
            margin: 15px 0;
            color: #16A021;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              <th class="id">RP</th>
              <th>Descrição</th>
              <th class="col-price">Custo</th>
              <th class="col-price">Oferta (R$)</th>
              <th class="col-margin">Margem</th>
            </tr>
          </thead>
          <tbody>
            ${produtos
              .map(product => {
                const custo = parseFloat(product.custo) || 0
                const preco = parseFloat(product.preco_oferta) || 0
                const margem =
                  preco > 0
                    ? (((preco - custo) / preco) * 100).toFixed(2)
                    : '0.00'

                let margemClass = 'positive'
                if (parseFloat(margem) < 15) margemClass = 'negative'
                else if (parseFloat(margem) < 30) margemClass = 'warning'

                return `
                <tr>
                  <td class="id">${product.produto_id || 'N/A'}</td>
                  <td class="description">${product.descricao || 'Sem descrição'}</td>
                  <td class="price">${custo.toFixed(2)}</td>
                  <td class="price-offer">${preco.toFixed(2)}</td>
                  <td class="margin ${margemClass}">${margem}%</td>
                </tr>
                `
              })
              .join('')}
          </tbody>
        </table>
        
        <div class="validity">
          VALIDADE de ${formattedInitialDate} a ${formattedFinalDate}
        </div>
      </body>
      </html>
    `
  }
}

module.exports = OffersPdfController
