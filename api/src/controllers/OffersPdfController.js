// No seu controlador de ofertas (ou criar um novo controlador)
const puppeteer = require('puppeteer')
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
    try {
      const { produtos, name, initialDate, finalDate } = request.body

      if (!produtos || produtos.length === 0) {
        return response.status(400).json({
          error: 'É necessário fornecer pelo menos um produto'
        })
      }

      // Criar HTML para a tabela de ofertas
      const html = this.generateOfferTableHTML(
        produtos,
        name,
        initialDate,
        finalDate
      )

      // Gerar nome de arquivo temporário
      const tmpDir = os.tmpdir()
      const pdfPath = path.join(tmpDir, `ofertas-${Date.now()}.pdf`)

      // Configurar e iniciar o Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })

      const page = await browser.newPage()

      // Definir o conteúdo da página
      await page.setContent(html, { waitUntil: 'networkidle0' })

      // Gerar o PDF - Mantido em formato vertical
      await page.pdf({
        path: pdfPath,
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

      await browser.close()

      // Enviar o arquivo para o cliente com header para visualização em vez de download
      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader(
        'Content-Disposition',
        'inline; filename=tabela-ofertas.pdf'
      )

      const fileStream = fs.createReadStream(pdfPath)
      fileStream.pipe(response)

      // Remover o arquivo temporário após o envio
      fileStream.on('end', () => {
        fs.unlinkSync(pdfPath)
      })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      return response.status(500).json({
        error: 'Erro ao gerar o PDF',
        details: error.message
      })
    }
  }

  generateOfferTableHTML(produtos, offerName, initalDateStr, finalDateStr) {
    // Título dinâmico com o nome da oferta
    const title = offerName ? `${offerName.toUpperCase()}` : 'TABELA DE OFERTAS'
    // Formatar as datas para o formato brasileiro DD/MM/YYYY
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      
      try {
        // Verificar se já está no formato DD/MM/YYYY
        if (dateStr.includes('/')) {
          return dateStr;
        }
        
        // Converter de YYYY-MM-DD para DD/MM/YYYY
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        
        // Se não conseguir formatar, retorna a string original
        return dateStr;
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateStr;
      }
    };

    const formattedInitialDate = formatDate(initalDateStr);
    const formattedFinalDate = formatDate(finalDateStr);

    // Criar o HTML com a tabela - Layout otimizado e simplificado
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
            font-size: 12px; /* Fonte aumentada */
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
            font-size: 12px; /* Fonte aumentada */
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
            font-size: 13px; /* Preço de oferta ligeiramente maior */
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
            font-size: 14px; /* Fonte aumentada */
          }
          .description {
            max-width: 320px; /* Mais espaço para descrição */
            word-wrap: break-word;
          }
          .id {
            text-align: center;
            width: 50px;
            font-size: 12px;
          }
          /* Definir larguras das colunas para formato vertical */
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
                // Calcular a margem de lucro
                const custo = parseFloat(product.custo) || 0
                const preco = parseFloat(product.preco_oferta) || 0
                const margem =
                  preco > 0
                    ? (((preco - custo) / preco) * 100).toFixed(2)
                    : '0.00'

                // Determinar a classe para a margem
                let margemClass = 'positive'
                if (parseFloat(margem) < 15) margemClass = 'negative'
                else if (parseFloat(margem) < 30) margemClass = 'warning'

                return `
                <tr>
                  <td class="id">${product.produto_id || 'N/A'}</td>
                  <td class="description">${
                    product.descricao || 'Sem descrição'
                  }</td>
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
