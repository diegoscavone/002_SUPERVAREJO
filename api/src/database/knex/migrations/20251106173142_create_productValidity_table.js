exports.up = knex =>
  knex.schema.createTable('productsValidity', table => {
    table.increments('id')
    table.integer('product_id')
    table.text('description').notNullable()
    table.text('complement')
    table.text('packaging')
    table.text('price')
    table.timestamp('initial_date')
    table.timestamp('final_date')
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
    table.boolean('status').defaultTo(true)
    table.integer('unit')
  })

exports.down = knex => knex.schema.dropTable('productsValidity')
