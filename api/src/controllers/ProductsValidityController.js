const knex = require('../database/knex')
const { sendPushToUnit } = require('../services/notificationService')
const AppError = require('../utils/AppError')

class ProductsValidityController {
  async create(request, response) {
    const { products } = request.body
    const user_id = request.user.id

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new AppError('Nenhum produto foi enviado para cadastro.')
    }

    const productsToInsert = products.map(product => ({
      product_id: String(product.product_id),
      barcode: product.barcode && product.barcode !== 'N/A' ? String(product.barcode).trim() : null,
      description: String(product.description || '').trim(),
      complement: product.complement || '',
      packaging: product.packaging || 'UN',
      cost_price: Number(product.cost_price) || 0,
      price: Number(product.price) || 0,
      offer_price: product.offer_price ? Number(String(product.offer_price).replace(',', '.')) : null,
      final_date: product.final_date,
      lote: product.lote || null,
      quantity: parseFloat(String(product.quantity || 0).replace(',', '.')) || 0,
      unit: String(product.unit || request.user.unit),
      user_id
    }))

    await knex('productsValidity').insert(productsToInsert)

    try {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const expiringItems = products.filter(p => {
        if (!p.final_date) return false
        const expDate = new Date(p.final_date)
        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 20
      })

      const targetUnit = products[0]?.unit || request.user.unit

      if (expiringItems.length > 0 && targetUnit && typeof sendPushToUnit === 'function') {
        const firstItem = expiringItems[0]
        sendPushToUnit(targetUnit, {
          title: 'Alerta de Validade Próxima',
          body: `${firstItem.description} vence em breve! Confira o estoque.`,
          url: '/productsValidity'
        })
      }
    } catch (pushError) {
      console.warn('Alerta: Erro ao disparar push notification:', pushError.message)
    }

    return response.status(201).json({ message: 'Produtos cadastrados com sucesso.' })
  }

  async update(request, response) {
    const { id } = request.params
    const { offer_price, quantity } = request.body

    const dataToUpdate = {
      updated_at: knex.fn.now()
    }

    if (offer_price !== undefined) {
      dataToUpdate.offer_price = offer_price ? parseFloat(String(offer_price).replace(',', '.')) : null
    }

    if (quantity !== undefined) {
      dataToUpdate.quantity = parseFloat(String(quantity).replace(',', '.')) || 0
    }

    const updated = await knex('productsValidity')
      .where({ id })
      .update(dataToUpdate)

    if (!updated) {
      throw new AppError('Registro de validade não encontrado para atualização.', 404)
    }

    return response.json({ message: 'Registro atualizado com sucesso.' })
  }

  async index(request, response) {
    const { unit } = request.query
    const userUnit = unit || request.user?.unit

    let productsQuery = knex('productsValidity')
      .select(
        'id',
        'product_id',
        'barcode',
        'description',
        'complement',
        'packaging',
        'cost_price',
        'price',
        'offer_price',
        'final_date',
        'lote',
        'quantity',
        'unit',
        'created_at',
        'updated_at'
      )

    if (userUnit) {
      productsQuery = productsQuery.where({ unit: String(userUnit) })
    }

    const products = await productsQuery.orderBy('final_date', 'asc')

    return response.json(products)
  }

  async delete(request, response) {
    const { id } = request.params

    const deleted = await knex('productsValidity')
      .where({ id })
      .delete()

    if (!deleted) {
      throw new AppError('Produto não encontrado para remoção.', 404)
    }

    return response.json({ message: 'Registro removido com sucesso.' })
  }
}

module.exports = ProductsValidityController