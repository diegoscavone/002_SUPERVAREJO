const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class ProductsOffersController {
  // Adicionar produtos a uma oferta existente
  async create(request, response) {
    const { offer_id, products } = request.body
    const user_id = request.user.id

    // Validações
    if (!offer_id) {
      throw new AppError("ID da oferta é obrigatório")
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new AppError("É necessário adicionar pelo menos um produto")
    }

    // Verificar se a oferta existe
    const offerExists = await knex('offers').where({ id: offer_id }).first()
    if (!offerExists) {
      throw new AppError("Oferta não encontrada", 404)
    }

    try {
      // Preparar os produtos para inserção
      const productsToInsert = products.map(product => {
        return {
          product_id: product.product_id,
          description: product.description,
          cost: product.cost,
          price: product.price,
          offer: product.offer_price,
          profit: product.profit,
          unit: product.unit || null,
          user_id,
          offer_id,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        }
      })

      // Inserir os produtos da oferta
      await knex('products_offers').insert(productsToInsert)

      return response.status(201).json({ 
        message: "Produtos adicionados à oferta com sucesso"
      })
    } catch (error) {
      throw new AppError("Erro ao adicionar produtos à oferta: " + error.message)
    }
  }

  // Listar produtos de uma oferta específica
  async index(request, response) {
    const { offer_id } = request.query

    // Validação do offer_id
    if (!offer_id) {
      throw new AppError("ID da oferta é obrigatório para listar seus produtos")
    }

    const products = await knex('products_offers')
      .where({ offer_id })
      .select('*')
      .orderBy('created_at', 'desc')

    return response.json(products)
  }

  // Buscar um produto específico de uma oferta
  async show(request, response) {
    const { id } = request.params

    const product = await knex('products_offers').where({ id }).first()

    if (!product) {
      throw new AppError("Produto da oferta não encontrado", 404)
    }

    return response.json(product)
  }

  // Atualizar um produto de uma oferta
  async update(request, response) {
    const { id } = request.params
    const { description, cost, price, offer, profit, unit } = request.body

    // Verificar se o produto da oferta existe
    const productExists = await knex('products_offers').where({ id }).first()

    if (!productExists) {
      throw new AppError("Produto da oferta não encontrado", 404)
    }

    // Atualizar o produto da oferta
    await knex('products_offers')
      .where({ id })
      .update({
        description,
        cost,
        price,
        offer,
        profit,
        unit,
        updated_at: knex.fn.now()
      })

    return response.json({ message: "Produto da oferta atualizado com sucesso" })
  }

  // Excluir um produto de uma oferta
  async delete(request, response) {
    const { id } = request.params

    // Verificar se o produto da oferta existe
    const productExists = await knex('products_offers').where({ id }).first()

    if (!productExists) {
      throw new AppError("Produto da oferta não encontrado", 404)
    }

    // Excluir o produto da oferta
    await knex('products_offers').where({ id }).delete()

    return response.json({ message: "Produto removido da oferta com sucesso" })
  }

  // Calcular estatísticas das ofertas (como média de descontos, etc.)
  async getStatistics(request, response) {
    const { offer_id } = request.query

    let query = knex('products_offers')
      .select(
        knex.raw('AVG(CAST(price AS FLOAT) - CAST(offer AS FLOAT)) as avg_discount'),
        knex.raw('AVG(CAST(profit AS FLOAT)) as avg_profit'),
        knex.raw('COUNT(*) as total_products')
      )

    if (offer_id) {
      query = query.where({ offer_id })
    }

    const statistics = await query.first()

    return response.json({
      avg_discount: parseFloat(statistics.avg_discount) || 0,
      avg_profit: parseFloat(statistics.avg_profit) || 0,
      total_products: parseInt(statistics.total_products) || 0
    })
  }
}

module.exports = ProductsOffersController