exports.up = knex =>
  knex.schema.createTable('products_offers', table => {
    table.increments('id')
    table.integer('product_id')
    table.text('description')
    // table.text('complement').useNullAsDefault()
    table.text('cost')
    table.text('price')
    table.text('offer')
    table.text('profit')
    table.text('unit')
    table.integer('user_id').references('id').inTable('users')
    table.integer('offer_id').references('id').inTable('offers')
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
  })

exports.down = knex => knex.schema.dropTable('products_offers')
