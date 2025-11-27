const knex = require('../database/knex')

class ProductsValidityController {
  async create(request, response) {
    const { products } = request.body
    const user_id = request.user.id

    const productsToInsert = products.map(product => {
      return {
        product_id: product.product_id,
        description: product.description,
        lote: product.lote,
        offer_price: product.offerPrice,
        price: product.price,
        final_date: product.final_date,
        unit: product.unit,
        user_id
      }
    })

    await knex('productsValidity').insert(productsToInsert)

    return response.status(201).json()
  }

  async update(request, response) {
    const { id } = request.params
    const { offer_price } = request.body

    await knex('productsValidity').where({ id }).update({
      offer_price,
      updated_at: knex.fn.now()
    })

    return response.json()
  }

  async index(request, response) {
    const { unit } = request.query;

    let productsQuery = knex('productsValidity');

    if (unit) {
      productsQuery = productsQuery.where({ unit });
    }

    const products = await productsQuery.orderBy('final_date');

    return response.json(products);
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('productsValidity').where({ id }).delete()

    return response.json()
  }
}

module.exports = ProductsValidityController
