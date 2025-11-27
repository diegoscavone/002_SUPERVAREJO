exports.up = knex =>
    knex.schema.createTable('offers', table => {
      table.increments('id').primary()
      table.text('name')
      table.timestamp('created_at').default(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  
  exports.down = knex => knex.schema.dropTable('offers')
  