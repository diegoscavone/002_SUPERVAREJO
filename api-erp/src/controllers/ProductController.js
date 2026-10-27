const knex = require('../database/knex')

class ProductController {
  async index(request, response) {
    const { id } = request.params
    const { campaignType, unit } = request.query // Adicionar unit também

    // Determinar a unidade do usuário (semelhante ao método show)
    let userUnit = unit

    if (!userUnit && request.user && request.user.unit) {
      userUnit = request.user.unit
    }

    // Se não tiver unidade, retornar erro
    if (!userUnit) {
      return response.status(400).json({
        error:
          'Unidade não identificada. Forneça o parâmetro unit ou use um usuário associado a uma unidade.'
      })
    }

    // const formattedUnit = userUnit.toString().padStart(3, '0')

    // Definir campos base a serem selecionados - SEMPRE use a qualificação de tabela
    let selectFields = [
      'prod.prod_codigo',
      'prod.prod_descricao',
      'prod.prod_complemento',
      'prod.prod_emb',
      'produ.prun_prvenda AS prvenda' // Sempre incluir o preço normal
    ]

    // Adicionar campos de atacarejo se necessário
    if (campaignType === '2') {
      selectFields.push('produ.prun_fatorpr3 AS fator_atacado')
      selectFields.push('produ.prun_prvenda3 AS preco_atacado')
    }

    try {
      const product = await knex
        .select(selectFields)
        .from('produtos AS prod')
        .join('produn AS produ', function () {
          this.on('prod.prod_codigo', '=', 'produ.prun_prod_codigo').andOn(
            'produ.prun_unid_codigo',
            '=',
            knex.raw('?', [userUnit])
          )
        })
        .where(function () {
          this.where({ 'prod.prod_codigo': id }).orWhere({
            'prod.prod_codbarras': id
          })
        })
        .where('produ.prun_ativo', 'S') // Garantir que o produto está ativo
        .where('produ.prun_unid_codigo', userUnit) // Reforçar o filtro por unidade
        .first()

      if (!product) {
        return response.status(404).json('Produto não encontrado')
      }

      return response.json(product)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return response.status(500).json({
        error: 'Erro ao buscar produto',
        details: error.message
      })
    }
  }

  async show(request, response) {
    const { search, unit } = request.query

    try {
      let userUnit = unit

      if (!userUnit && request.user && request.user.unit) {
        userUnit = request.user.unit
      }

      if (!userUnit) {
        return response.status(400).json({
          error:
            'Unidade não identificada. Forneça o parâmetro unit ou use um usuário associado a uma unidade.'
        })
      }

      // Consulta unificada sem N+1 queries
      const query = knex('produtos AS prod')
        .join('produn AS produ', function () {
          this.on('prod.prod_codigo', '=', 'produ.prun_prod_codigo').andOn(
            'produ.prun_unid_codigo',
            '=',
            knex.raw('?', [userUnit])
          )
        })
        .select(
          'prod.prod_codigo AS codigo',
          'prod.prod_descricao AS descricao',
          'prod.prod_complemento AS complemento',
          'prod.prod_codbarras AS codigobarras',
          'prod.prod_emb AS embalagem',
          'produ.prun_ctempresa AS custoempresa',
          'produ.prun_prvenda AS prvenda',
          'produ.prun_unid_codigo AS unidade',
          'produ.prun_dtultcomp AS data_ultima_compra'
        )
        .where('produ.prun_ativo', 'S')
        .where('produ.prun_unid_codigo', userUnit)

      // Filtro condicional por código, EAN ou descrição
      if (search && search.trim() !== '') {
        const term = search.trim()

        query.where(function () {
          // 1. Se for numérico, bate exato no código ou código de barras
          if (!isNaN(term)) {
            this.where('prod.prod_codigo', term).orWhere(
              'prod.prod_codbarras',
              term
            )
          }

          // 2. Busca por múltiplas palavras (ex: "arroz camil" acha mesmo que não estejam coladas)
          const words = term.split(/\s+/).filter(Boolean)

          this.orWhere(function () {
            words.forEach(word => {
              this.where(function () {
                this.whereRaw('LOWER(prod.prod_descricao) LIKE ?', [
                  `%${word.toLowerCase()}%`
                ]).orWhereRaw('LOWER(prod.prod_complemento) LIKE ?', [
                  `%${word.toLowerCase()}%`
                ])
              })
            })
          })
        })
      }

      const products = await query.orderBy('prod.prod_descricao', 'asc')

      // ✅ Retorna 200 sempre: se não achar, devolve array vazio sem estourar 404
      return response.json(products)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return response.status(500).json({
        error: 'Erro ao buscar o produto.',
        details: error.message
      })
    }
  }

  async listAll(request, response) {
    const {
      page = 1,
      limit = 20,
      sort = 'descricao',
      order = 'asc',
      unit,
      campaignType
    } = request.query

    try {
      // Obtendo a unidade do usuário
      // Prioridade: parâmetro unit da query, depois request.user.unit se disponível
      let userUnit = unit

      // Se não tiver na query e tiver no objeto user, usa o do user
      if (!userUnit && request.user && request.user.unit) {
        userUnit = request.user.unit
      }

      if (!userUnit) {
        return response.status(400).json({
          error:
            'Unidade não identificada. Forneça o parâmetro unit ou use um usuário associado a uma unidade.'
        })
      }

      // Validação de entrada
      const pageNumber = Math.max(1, parseInt(page))
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit)))
      const offset = (pageNumber - 1) * limitNumber

      // Validação de ordenação
      const allowedSortFields = ['codigo', 'descricao', 'custoempresa']
      const sortField = allowedSortFields.includes(sort) ? sort : 'descricao'
      const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc'

      // Definir os campos a serem selecionados com base no tipo de campanha
      let selectFields = [
        'prod.prod_codigo AS codigo',
        'prod.prod_descricao AS descricao',
        'prod.prod_complemento AS complemento',
        'prod.prod_codbarras AS codigobarras',
        'prod.prod_emb AS embalagem',
        'produ.prun_ctempresa AS custoempresa',
        'produ.prun_prvenda AS prvenda',
        'produ.prun_unid_codigo AS unidade',
        'produ.prun_dtultcomp AS data_ultima_compra'
      ]

      // Adicionar campos específicos para atacarejo se o tipo de campanha for 2
      if (campaignType === '2') {
        selectFields.push('produ.prun_fatorpr3 AS fator_atacado')
        selectFields.push('produ.prun_prvenda3 AS preco_atacado')
      }

      // Construção da consulta principal com filtro explícito por unidade
      const productsQuery = knex('produtos AS prod')
        .join('produn AS produ', function () {
          this.on('prod.prod_codigo', '=', 'produ.prun_prod_codigo').andOn(
            'produ.prun_unid_codigo',
            '=',
            knex.raw('?', [userUnit])
          )
        })
        .select(selectFields)
        .where('produ.prun_ativo', 'S')
        .where('produ.prun_ctempresa', '>', 0)
        .where('produ.prun_unid_codigo', userUnit) // Reforçar o filtro aqui também

      // Consulta para contagem total
      const countQuery = knex('produtos AS prod')
        .join('produn AS produ', function () {
          this.on('prod.prod_codigo', '=', 'produ.prun_prod_codigo').andOn(
            'produ.prun_unid_codigo',
            '=',
            knex.raw('?', [userUnit])
          ) // Mesmo filtro no JOIN para contagem
        })
        .where('produ.prun_ativo', 'S')
        .where('produ.prun_ctempresa', '>', 0)
        .where('produ.prun_unid_codigo', userUnit)
        .count('prod.prod_codigo as total')

      // Executando ambas as consultas em paralelo
      const [products, countResult] = await Promise.all([
        productsQuery
          .orderBy(
            sortField === 'codigo'
              ? 'prod.prod_codigo'
              : sortField === 'custoempresa'
                ? 'produ.prun_ctempresa'
                : 'prod.prod_descricao',
            sortOrder
          )
          .limit(limitNumber)
          .offset(offset),
        countQuery
      ])

      // Adicionar verificação de debug para confirmar que estamos obtendo apenas a unidade desejada
      const uniqueUnits = [...new Set(products.map(p => p.unidade))]

      if (
        uniqueUnits.length > 1 ||
        (uniqueUnits.length === 1 && uniqueUnits[0] !== userUnit)
      ) {
        console.warn(
          'ALERTA: Produtos de outras unidades encontrados:',
          uniqueUnits
        )
      }

      const totalCount = countResult[0].total
      const totalPages = Math.ceil(totalCount / limitNumber)

      // Definição da política de cache
      const cacheKey = `products_${userUnit}_${pageNumber}_${limitNumber}_${sortField}_${sortOrder}_${
        campaignType || 'default'
      }`
      response.setHeader('Cache-Control', 'private, max-age=60')
      response.setHeader('X-Cache-Key', cacheKey)

      return response.json({
        products,
        pagination: {
          total: totalCount,
          page: pageNumber,
          limit: limitNumber,
          totalPages
        },
        debug: {
          unidadeSolicitada: userUnit,
          unidadesEncontradas: uniqueUnits,
          tipoCampanha: campaignType || 'não especificado',
          query: productsQuery.toString() // Adicionar a consulta SQL para debug
        }
      })
    } catch (error) {
      console.error('Erro ao listar produtos:', error)
      return response.status(500).json({
        error: 'Erro ao listar os produtos.',
        details: error.message
      })
    }
  }
}

module.exports = ProductController
