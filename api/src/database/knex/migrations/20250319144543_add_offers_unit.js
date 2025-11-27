exports.up = function (knex) {
    return knex.schema.table('offers', table => {
      table.integer('unit')
    })
  }
  
  exports.down = function (knex) {
    return knex.schema.table('offers', table => {
      table.text('unit')
    })
  }
  