const { json } = require('express')
const knex = require('../database/knex')

class SaleController {
  async show(request, response) {
    const { unit } = request.query
    const { date } = request.query

    const sales = await knex
      .select(
        'produtos.prod_codigo',
        'produtos.prod_descricao',
        'produtos.prod_complemento',
        'produtos.prod_emb',
        'produtos.prod_dpto_codigo',
        'progrprecos.prpr_datainicial',
        'progrprecos.prpr_datafinal',
        'progrprecos.prpr_prvenda',
        'produtos.prod_codpreco',
        'progrprecos.prpr_unid_codigo'
      )
      .table('produtos')
      .innerJoin(
        'progrprecos',
        'progrprecos.prpr_prod_codigo',
        'produtos.prod_codigo'
      )
      .andWhere('progrprecos.prpr_datainicial', '=', `${date}`)
      .andWhere('progrprecos.prpr_unid_codigo', '=', `${unit}`)
      .andWhere('progrprecos.prpr_status', '=', '1')
      .groupBy(
        'produtos.prod_codpreco',
        'produtos.prod_codigo',
        'produtos.prod_descricao',
        'produtos.prod_complemento',
        'produtos.prod_emb',
        'produtos.prod_dpto_codigo',
        'progrprecos.prpr_datainicial',
        'progrprecos.prpr_datafinal',
        'progrprecos.prpr_prvenda',
        'progrprecos.prpr_unid_codigo'
      )

    const listGroups = {
      // Código de preço para Tamanho
      '026': 'Tamanho',
      '998': 'Tamanho',

      // Códigos de preço para Fragrâncias
      '004': 'Fragrâncias',
      '005': 'Fragrâncias',

      // Códigos de preço para Sabores
      '001': 'Sabores',
      '002': 'Sabores',
      '003': 'Sabores',
      '035': 'Sabores',
      '010': 'Sabores',
    }

    const processedSales = []
    const codPrecoSet = new Set() // Usado para rastrear os códigos de preço já vistos

    for (const sale of sales) {
      if (sale.prpr_prvenda) {
        const numericValue = parseFloat(sale.prpr_prvenda.replace(',', '.'))
        const formattedValue = numericValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
        // Define o valor formatado
        sale.prpr_prvenda = formattedValue
      }
      if (sale.prod_codpreco && sale.prod_codpreco !== '0') {
        if (!codPrecoSet.has(sale.prod_codpreco)) {
          if (listGroups[sale.prod_dpto_codigo]) {
            // Atribui o complemento específico baseado no código de preço
            sale.prod_complemento = listGroups[sale.prod_dpto_codigo];
          } else {
            // Para outros códigos não especificados no mapeamento
            sale.prod_complemento = 'Tamanho/Fragrâncias/Sabores';
          }
          
          processedSales.push(sale)
          codPrecoSet.add(sale.prod_codpreco) // Marca o código de preço como visto
        }
      } else {
        // Para produtos sem código de preço, adiciona normalmente sem modificar o complemento
        processedSales.push(sale)
      }
    }
    return response.json(processedSales)
  }
}

module.exports = SaleController
