exports.up = function(knex) {
  return knex.schema.table('productsValidity', table => {
    table.string('barcode').nullable()
    table.decimal('cost_price', 10, 2).defaultTo(0)
  })
}

exports.down = function(knex) {
  return knex.schema.table('productsValidity', table => {
    table.dropColumn('barcode')
    table.dropColumn('cost_price')
  })
}