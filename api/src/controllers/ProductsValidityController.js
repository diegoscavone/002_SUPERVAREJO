const knex = require('../database/knex')
const { sendPushToUnit } = require('../services/notificationService');

class ProductsValidityController {
  async create(request, response) {
    const { products } = request.body
    const user_id = request.user.id

    const productsToInsert = products.map(product => {
      return {
        product_id: product.product_id,
        description: product.description,
        lote: product.lote,
        quantity:
          parseFloat(String(product.quantity || 0).replace(',', '.')) || 0,
        offer_price: product.offerPrice || product.offer_price,
        price: product.price,
        final_date: product.final_date,
        unit: product.unit,
        user_id
      }
    })

    await knex('productsValidity').insert(productsToInsert)

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const expiringItems = products.filter(p => {
      const expDate = new Date(p.final_date);
      const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 20;
    });

    if (expiringItems.length > 0 && products[0]?.unit) {
      const firstItem = expiringItems[0];
      sendPushToUnit(products[0].unit, {
        title: 'Alerta de Validade Próxima',
        body: `${firstItem.description} vence em breve! Confira o estoque.`,
        url: '/productsValidity'
      });
    }

    return response.status(201).json()
  }

  async update(request, response) {
    const { id } = request.params
    const { offer_price, quantity } = request.body

    const dataToUpdate = {
      updated_at: knex.fn.now()
    }

    if (offer_price !== undefined) {
      dataToUpdate.offer_price = offer_price
    }

    if (quantity !== undefined) {
      dataToUpdate.quantity =
        parseFloat(String(quantity).replace(',', '.')) || 0
    }

    await knex('productsValidity').where({ id }).update(dataToUpdate)

    return response.json()
  }

  async index(request, response) {
    const { unit } = request.query

    let productsQuery = knex('productsValidity')

    if (unit) {
      productsQuery = productsQuery.where({ unit })
    }

    const products = await productsQuery.orderBy('final_date')

    return response.json(products)
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('productsValidity').where({ id }).delete()

    return response.json()
  }
}

module.exports = ProductsValidityController
