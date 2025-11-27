exports.up = knex =>
  knex.schema.createTable('campaigns', table => {
    table.increments('id')
    table.text('name').notNullable()
    table.text('image').notNullable()
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
  })

exports.down = knex => knex.schema.dropTable('campaigns')
